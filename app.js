import {calculate,defaults} from './calculator.js';
const fields=[['rate','Electricidad','Bs/kWh','place'],['hash','Hashrate por máquina','TH/s','machine'],['watts','Consumo ASIC por máquina','W','machine'],['difficulty','Dificultad de red','× 10¹²','network'],['price','Precio de Bitcoin','USD/BTC','network'],['reward','Subsidio por bloque','BTC','network'],['fees','Comisiones de red por bloque','BTC','network'],['count','Cantidad de máquinas','ASIC','planning'],['exchange','Tipo de cambio','Bs/USD','planning'],['days','Días del período','días','planning'],['pool','Comisión del pool','%','operation'],['downtime','Tiempo apagado','%','operation'],['aux','Ventilación por máquina','W','operation'],['sharedAux','Ventilación compartida','W total','operation'],['maintenance','Mantenimiento por máquina / período','Bs','operation'],['internet','Internet total / período','Bs','operation'],['other','Otros gastos compartidos / período','Bs','operation']];
for(const [key,label,unit,group] of fields){
  const container=document.getElementById(`${group}-fields`);
  container.insertAdjacentHTML('beforeend',`<label for="${key}">${label}<div class="input-wrap"><input id="${key}" name="${key}" type="number" min="${['difficulty','exchange'].includes(key)?'0.000001':['days','count'].includes(key)?'1':'0'}" ${['pool','downtime'].includes(key)?'max="100"':key==='days'?'max="366"':''} step="${key==='count'?'1':'any'}" value="${defaults[key]}" required><span>${unit}</span></div></label>`);
}
const num=(v,d=2)=>new Intl.NumberFormat('es-BO',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
const money=v=>`Bs ${num(v)}`;
function card(s,title,subtitle,day,complete){
  const rows=[['BTC producido / día',`${num(day,8)} BTC`],['BTC producido / período',`${num(s.btc,8)} BTC`],...(complete?[['BTC recibido tras pool',`${num(s.received,8)} BTC`],['Comisión pool en BTC',`${num(s.poolBtc,8)} BTC`]]:[]),[complete?'Ingreso después del pool':'Ingreso bruto',`US$ ${num(s.usd)} / ${money(s.bs)}`],['Consumo eléctrico',`${num(s.kwh)} kWh`],['Costo eléctrico',money(s.electric)],...(complete?[['Mantenimiento + gastos compartidos',money(s.fixed)],['Utilidad neta anual',money(s.annual)]]:[]),['Equilibrio eléctrico',s.breakEven===null?'No aplica (sin consumo)':`${num(s.breakEven,4)} Bs/kWh`]];
  return `<article class="result-card"><span class="eyebrow">${subtitle}</span><h2>${title}</h2><div class="profit ${s.net<0?'negative':'positive'}"><span>${complete?'Utilidad neta':'Utilidad básica'} / ${num(Number(document.getElementById('days').value),0)} días</span><strong>${money(s.net)}</strong><small>US$ ${num(s.netUsd)}</small></div><dl>${rows.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></article>`;
}
function render(){
  const error=document.getElementById('error'),results=document.getElementById('results');
  try{
    const p=Object.fromEntries(fields.map(([key])=>[key,document.getElementById(key).value.trim()===''?NaN:Number(document.getElementById(key).value)]));
    const r=calculate(p),next=calculate({...p,count:p.count+1}); error.hidden=true;
    document.getElementById('fleet').textContent=`${num(p.count,0)} ${p.count===1?'máquina':'máquinas'} · ${num(p.hash*p.count,0)} TH/s totales · ${num(p.watts*p.count,0)} W ASIC · ${num(p.aux*p.count+p.sharedAux,0)} W auxiliares`;
    results.innerHTML=card(r.basic,'Básico','01 / SOLO ELECTRICIDAD',r.btcDay,false)+card(r.full,'Completo','02 / OPERACIÓN REAL',r.btcDay*(1-p.downtime/100),true)+`<article class="result-card comparison"><h2>¿Qué cambia con una máquina más?</h2><p>Con ${num(p.count+1,0)} máquinas, manteniendo estos costos compartidos:</p><dl><div><dt>Utilidad neta total / período</dt><dd>${money(next.full.net)}</dd></div><div><dt>Cambio en utilidad / período</dt><dd>${money(next.full.net-r.full.net)}</dd></div><div><dt>Electricidad adicional / período</dt><dd>${num(next.full.kwh-r.full.kwh)} kWh</dd></div><div><dt>Mantenimiento adicional / período</dt><dd>${money(p.maintenance)}</dd></div></dl><p class="hint">Compara el margen operativo. La compra del ASIC no está incluida; revisa si necesitas ampliar Internet, ventilación o instalación eléctrica.</p></article>`;
  }catch(e){error.textContent=e.message;error.hidden=false;results.innerHTML='';document.getElementById('fleet').textContent='';}
}
document.getElementById('inputs').addEventListener('input',render);
document.getElementById('inputs').addEventListener('reset',()=>setTimeout(render,0));render();
