export const defaults = {count:1,rate:1.0185,hash:245,watts:3675,difficulty:150,reward:3.125,fees:0,price:85000,exchange:12,days:30,pool:2,aux:200,sharedAux:0,internet:150,maintenance:100,downtime:5,other:0};
export function calculate(p) {
  for (const key of Object.keys(defaults)) {
    if (!Number.isFinite(p[key]) || p[key]<0) throw new Error('Revisa los campos: deben ser números válidos y no negativos.');
  }
  if (!p.difficulty || !p.exchange || !p.days || p.days>366 || p.pool>100 || p.downtime>100) throw new Error('Dificultad y cambio deben ser mayores que cero; días entre 1 y 366; porcentajes entre 0 y 100.');
  if (!Number.isInteger(p.count) || p.count<1) throw new Error('La cantidad de máquinas debe ser un entero mayor o igual a 1.');
  const btcDay=p.hash*p.count*1e12*86400/(p.difficulty*1e12*2**32)*(p.reward+p.fees);
  const scenario=(uptime,pool,aux,fixed)=>{
    const btc=btcDay*p.days*uptime, received=btc*(1-pool/100);
    const usd=received*p.price, bs=usd*p.exchange;
    const kwh=(p.watts*p.count+aux)/1000*24*p.days*uptime;
    const electric=kwh*p.rate, net=bs-electric-fixed;
    return {btc,received,usd,bs,kwh,electric,fixed,net,netUsd:net/p.exchange,annual:net*365/p.days,breakEven:kwh ? (bs-fixed)/kwh:null,poolBtc:btc-received};
  };
  return {btcDay,basic:scenario(1,0,0,0),full:scenario(1-p.downtime/100,p.pool,p.aux*p.count+p.sharedAux,p.internet+p.maintenance*p.count+p.other)};
}
