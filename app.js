import {calculate,defaults} from './calculator.js';
const fields=[['rate','Electricidad','Bs/kWh'],['hash','Hashrate','TH/s'],['watts','Consumo ASIC','W'],['difficulty','Dificultad de red','× 10¹²'],['price','Precio de Bitcoin','USD/BTC'],['exchange','Tipo de cambio','Bs/USD'],['days','Días del período','días'],['reward','Subsidio por bloque','BTC'],['fees','Comisiones de red por bloque','BTC'],['pool','Comisión del pool','%'],['aux','Ventilación / auxiliares','W'],['internet','Internet por período','Bs'],['maintenance','Mantenimiento por período','Bs'],['downtime','Tiempo apagado','%'],['other','Otros gastos por período','Bs']];
for(const [i,[key,label,unit]] of fields.entries()){
  const container=document.getElementById(i<9?'basic-fields':'extra-fields');
  container.insertAdjacentHTML('beforeend',`<label for="${key}">${label}<div class="input-wrap"><input id="${key}" name="${key}" type="number" min="${['difficulty','exchange'].includes(key)?'0.000001':key==='days'?'1':'0'}" ${['pool','downtime'].includes(key)?'max="100"':key==='days'?'max="366"':''} step="any" value="${defaults[key]}" required><span>${unit}</span></div></label>`);
}
const num=(v,d=2)=>new Intl.NumberFormat('es-BO',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
const money=v=>`Bs ${num(v)}`;
function card(s,title,subtitle,day,complete){
  const rows=[['BTC producido / día',`${num(day,8)} BTC`],['BTC producido / período',`${num(s.btc,8)} BTC`],...(complete?[['BTC recibido tras pool',`${num(s.received,8)} BTC`],['Comisión pool en BTC',`${num(s.poolBtc,8)} BTC`]]:[]),[complete?'Ingreso después del pool':'Ingreso bruto',`US$ ${num(s.usd)} / ${money(s.bs)}`],['Consumo eléctrico',`${num(s.kwh)} kWh`],['Costo eléctrico',money(s.electric)],...(complete?[['Gastos fijos',money(s.fixed)],['Utilidad neta anual',money(s.annual)]]:[]),['Equilibrio eléctrico',s.breakEven===null?'No aplica (sin consumo)':`${num(s.breakEven,4)} Bs/kWh`]];
  return `<article class="result-card"><span class="eyebrow">${subtitle}</span><h2>${title}</h2><div class="profit ${s.net<0?'negative':'positive'}"><span>${complete?'Utilidad neta':'Utilidad básica'} / ${num(Number(document.getElementById('days').value),0)} días</span><strong>${money(s.net)}</strong><small>US$ ${num(s.netUsd)}</small></div><dl>${rows.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></article>`;
}
function render(){
  const error=document.getElementById('error'),results=document.getElementById('results');
  try{
    const p=Object.fromEntries(fields.map(([key])=>[key,document.getElementById(key).value.trim()===''?NaN:Number(document.getElementById(key).value)]));
    const r=calculate(p); error.hidden=true; results.innerHTML=card(r.basic,'Básico','01 / SOLO ELECTRICIDAD',r.btcDay,false)+card(r.full,'Completo','02 / OPERACIÓN REAL',r.btcDay*(1-p.downtime/100),true);
  }catch(e){error.textContent=e.message;error.hidden=false;results.innerHTML='';}
}
document.getElementById('inputs').addEventListener('input',render);
document.getElementById('inputs').addEventListener('reset',()=>setTimeout(render,0));render();
