import {calculate,defaults} from './calculator.js';
const fields=[['rate','Electricidad','Bs/kWh','place'],['hash','Hashrate por máquina','TH/s','machine'],['watts','Consumo ASIC por máquina','W','machine'],['difficulty','Dificultad de red','× 10¹²','network'],['price','Precio de Bitcoin','USD/BTC','network'],['reward','Subsidio por bloque','BTC','network'],['fees','Comisiones de red por bloque','BTC','network'],['count','Cantidad de máquinas','ASIC','planning'],['exchange','Tipo de cambio','Bs/USD','planning'],['days','Días del período','días','planning'],['pool','Comisión del pool','%','operation'],['downtime','Tiempo apagado','%','operation'],['aux','Ventilación por máquina','W','operation'],['sharedAux','Ventilación compartida','W total','operation'],['maintenance','Mantenimiento por máquina / período','Bs','operation'],['internet','Internet total / período','Bs','operation'],['other','Otros gastos compartidos / período','Bs','operation']];
fields.push(['unitCost','Precio de compra por Antminer','USD','investment']);
const sources={
 rate:['DELAPAZ','https://www.delapaz.bo/','Consulta tu categoría y factura; la tarifa final puede incluir bloques y cargos. El valor inicial proviene de tus facturas, no de una tarifa oficial única.'],
 hash:['Manual del ASIC','https://support.bitmain.com/hc/en-us','Busca el modelo y variante exactos; ingresa el hashrate de una máquina.'],
 watts:['Manual del ASIC','https://support.bitmain.com/hc/en-us','Consulta consumo nominal y contrástalo con un medidor en la instalación.'],
 difficulty:['Dificultad en mempool','https://mempool.space/mining','Usa la dificultad actual, no el porcentaje del próximo ajuste. Si figura en T, copia ese número en este campo de 10¹².'],
 price:['Precio BTC en mempool','https://mempool.space/','Consulta el precio en USD; el ejemplo inicial no se actualiza automáticamente.'],
 reward:['Bloques en mempool','https://mempool.space/','Abre un bloque y distingue subsidio de recompensa total: esta última también incluye comisiones.'],
 fees:['Comisiones de bloques','https://mempool.space/','Consulta las comisiones totales de varios bloques y estima su promedio en BTC por bloque. No uses sat/vB ni la comisión recomendada para enviar una transacción.'],
 pool:['Condiciones del pool','https://braiins.com/pool','Ejemplo de pool: comprueba las condiciones del que elijas, modalidad y descuentos.'],
 exchange:['Cómo elegir el cambio','#reference-exchange','Usa el cambio efectivo al convertir tus ingresos; 12 Bs/USD es tu referencia editable.'],
 count:['Cómo contar máquinas','#reference-count','Número de ASIC idénticos que planeas operar; no es un dato de la red.'],
 days:['Cómo elegir el período','#reference-days','30 días es una comparación mensual estándar; ajusta gastos fijos al mismo período.'],
 downtime:['Cómo medir tiempo apagado','#reference-downtime','Horas sin operar divididas entre horas del período, por 100. Incluye cortes y mantenimiento.'],
 aux:['Cómo medir ventilación individual','#reference-aux','Suma los W de auxiliares externos dedicados a cada ASIC; evita duplicar ventiladores ya incluidos en el consumo del ASIC.'],
 sharedAux:['Cómo medir ventilación compartida','#reference-sharedAux','Suma los W de equipos comunes a toda la instalación. Este valor no se multiplica por la cantidad.'],
 maintenance:['Cómo estimar mantenimiento','#reference-maintenance','Presupuesto de reparaciones y limpieza por ASIC para el período elegido.'],
 internet:['Cómo estimar Internet','#reference-internet','Usa el costo total del plan contratado para el período, una sola vez.'],
 other:['Cómo estimar otros gastos','#reference-other','Suma alquiler, seguridad y otros gastos compartidos del período sin repetir partidas.'],
 unitCost:['Consultar proveedor','https://shop.bitmain.com/','US$2.700 es la referencia proporcionada por ti, no una cotización verificada. Ajusta al precio ofrecido para tu modelo.']
};
for(const [key,label,unit,group] of fields){
  const container=document.getElementById(`${group}-fields`);
  const [source,url,note]=sources[key];
  container.insertAdjacentHTML('beforeend',`<div class="field"><label for="${key}">${label}<div class="input-wrap"><input form="inputs" id="${key}" name="${key}" type="number" min="${['difficulty','exchange'].includes(key)?'0.000001':['days','count'].includes(key)?'1':'0'}" ${['pool','downtime'].includes(key)?'max="100"':key==='days'?'max="366"':''} step="${key==='count'?'1':'any'}" value="${defaults[key]}" required><span>${unit}</span></div></label><a class="source-link" href="${url}" ${url.startsWith('https:')?'target="_blank" rel="noopener"':''}>${source} ↗</a><details class="field-help"><summary>Detalle</summary><p class="field-note">${note}</p></details></div>`);
}
for(const group of new Set(fields.map(f=>f[3]))){
 const section=document.getElementById(`${group}-fields`).closest('section');
 section.querySelector('.section-title').insertAdjacentHTML('beforeend',`<button class="section-reset" type="button" data-reset="${group}">Restablecer</button>`);
}
document.getElementById('field-references').innerHTML=fields.filter(([key])=>sources[key][1].startsWith('#')).map(([key,label])=>`<details id="reference-${key}"><summary>${label}</summary><p>${sources[key][2]}</p></details>`).join('');
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
    document.getElementById('investment-result').innerHTML=`<dl><div><dt>Cantidad de Antminer</dt><dd>${num(p.count,0)}</dd></div><div><dt>Costo unitario</dt><dd>US$ ${num(p.unitCost)}</dd></div><div><dt>Inversión total en maquinaria</dt><dd><strong>US$ ${num(r.machineryUsd)}</strong></dd></div><div><dt>Equivalente al cambio elegido</dt><dd>${money(r.machineryBs)}</dd></div></dl>`;
    document.getElementById('fleet').textContent=`${num(p.count,0)} ${p.count===1?'máquina':'máquinas'} · ${num(p.hash*p.count,0)} TH/s totales · ${num(p.watts*p.count,0)} W ASIC · ${num(p.aux*p.count+p.sharedAux,0)} W auxiliares`;
    results.innerHTML=card(r.basic,'Básico','01 / SOLO ELECTRICIDAD',r.btcDay,false)+card(r.full,'Completo','02 / OPERACIÓN REAL',r.btcDay*(1-p.downtime/100),true)+`<article class="result-card comparison"><h2>¿Qué cambia con una máquina más?</h2><p>Con ${num(p.count+1,0)} máquinas, manteniendo estos costos compartidos:</p><dl><div><dt>Utilidad neta total / período</dt><dd>${money(next.full.net)}</dd></div><div><dt>Cambio en utilidad / período</dt><dd>${money(next.full.net-r.full.net)}</dd></div><div><dt>Electricidad adicional / período</dt><dd>${num(next.full.kwh-r.full.kwh)} kWh</dd></div><div><dt>Mantenimiento adicional / período</dt><dd>${money(p.maintenance)}</dd></div></dl><p class="hint">Compara el margen operativo. La compra del ASIC no está incluida; revisa si necesitas ampliar Internet, ventilación o instalación eléctrica.</p></article>`;
  }catch(e){error.textContent=e.message;error.hidden=false;results.innerHTML='';document.getElementById('fleet').textContent='';document.getElementById('investment-result').textContent='Revisa los campos para calcular la inversión.';}
}
document.querySelector('main').addEventListener('input',render);
document.querySelector('main').addEventListener('click',e=>{
 const button=e.target.closest('[data-reset]');if(!button)return;
 for(const [key,,,group] of fields)if(group===button.dataset.reset)document.getElementById(key).value=defaults[key];render();
});
document.getElementById('inputs').addEventListener('reset',e=>{e.preventDefault();for(const [key] of fields)document.getElementById(key).value=defaults[key];render();});render();
