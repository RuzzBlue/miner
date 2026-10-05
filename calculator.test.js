import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,defaults} from './calculator.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('referencia: energía, producción y equilibrio eléctrico',()=>{
 const r=calculate(defaults);near(r.basic.kwh,2646);near(r.basic.electric,2694.951);
 near(r.btcDay,0.0001026783138513565);near(r.basic.btc,r.btcDay*30);
 near(r.basic.bs,r.basic.btc*85000*12);
 near(calculate({...defaults,rate:r.basic.breakEven}).basic.net,0);
});
test('precio y cambio no alteran BTC producido',()=>{
 const a=calculate(defaults),b=calculate({...defaults,price:170000,exchange:6});
 near(a.basic.btc,b.basic.btc);near(a.basic.bs,b.basic.bs);near(b.basic.usd,a.basic.usd*2);
});
test('downtime, pool, auxiliares y gastos fijos',()=>{
 const r=calculate({...defaults,downtime:25,pool:10,aux:325,internet:100,maintenance:50,other:25});
 near(r.full.btc,r.basic.btc*.75);near(r.full.received,r.full.btc*.9);
 near(r.full.kwh,2160);near(r.full.fixed,175);
 near(r.full.net,r.full.bs-2160*defaults.rate-175);
 near(r.full.annual,r.full.net*365/30);
 near(calculate({...defaults,downtime:25,pool:10,aux:325,internet:100,maintenance:50,other:25,rate:r.full.breakEven}).full.net,0);
});
test('sin extras, completo coincide con básico',()=>{
 const r=calculate({...defaults,pool:0,aux:0,internet:0,maintenance:0,downtime:0,other:0});assert.deepEqual(r.basic,r.full);
});
test('100% apagado: sin BTC ni energía y con gastos fijos',()=>{
 const r=calculate({...defaults,downtime:100});near(r.full.btc,0);near(r.full.kwh,0);near(r.full.net,-250);assert.equal(r.full.breakEven,null);
});
test('rechaza vacíos, infinitos, negativos y rangos inválidos',()=>{
 for(const p of [{rate:NaN},{hash:Infinity},{watts:-1},{difficulty:0},{exchange:0},{days:0},{days:367},{pool:101},{downtime:101}])assert.throws(()=>calculate({...defaults,...p}));
});
test('subsidio y comisiones, cero hashrate, pérdidas',()=>{
 near(calculate({...defaults,reward:0,fees:3.125}).btcDay,calculate(defaults).btcDay);
 near(calculate({...defaults,hash:0}).basic.btc,0);
 assert.ok(calculate({...defaults,price:0}).full.breakEven<0);
});
test('varias máquinas: escala ASIC, auxiliares individuales y mantenimiento; conserva compartidos',()=>{
 const p={...defaults,sharedAux:500,other:80};
 const one=calculate(p),three=calculate({...p,count:3});
 near(three.basic.btc,one.basic.btc*3);near(three.basic.kwh,one.basic.kwh*3);
 near(three.full.kwh,(3675*3+200*3+500)/1000*24*30*.95);
 near(three.full.fixed,150+100*3+80);
 near(three.full.received,one.full.received*3);
 near(three.full.net-one.full.net,2*(one.full.bs-(3675+200)/1000*24*30*.95*p.rate-100));
});
test('cantidad inválida',()=>{
 for(const count of [0,-1,1.5,NaN,Infinity])assert.throws(()=>calculate({...defaults,count}));
});
test('inversión: cantidad por precio unitario; no modifica utilidad operativa',()=>{
 const p={...defaults,count:3},r=calculate(p),changed=calculate({...p,unitCost:5000});
 near(r.machineryUsd,8100);near(r.machineryBs,97200);
 assert.deepEqual(r.basic,changed.basic);assert.deepEqual(r.full,changed.full);
 near(calculate({...p,unitCost:0}).machineryUsd,0);
 assert.throws(()=>calculate({...p,unitCost:-1}));
});
