# Miner · Calculadora de rentabilidad Bitcoin

Calculadora estática en español, HTML/CSS/JS sin dependencias. Publicable en cualquier hosting estático. No consulta APIs ni envía los datos ingresados.

## Abrir y probar

Con Node.js 18 o posterior:

```sh
npm start
# Abrir http://127.0.0.1:4173
npm test
```

Servir los archivos por HTTP: los módulos JavaScript no funcionan abriendo index.html por file://. No se requiere npm install.

## Escenarios

- **Básico:** operación continua, BTC/día y período, valor USD/Bs, electricidad, utilidad y tarifa de equilibrio.
- **Completo:** downtime, comisión pool, auxiliares y gastos fijos; BTC producido separado de BTC recibido; utilidad neta y proyección anual.

Un período equivale a los días seleccionados (30 por defecto). Los campos de gastos fijos corresponden a ese período, sin prorrateo automático. El anual usa `neto × 365 / días`. Durante downtime, ASIC y auxiliares están apagados, pero los gastos fijos continúan. Si la ventilación funciona permanentemente, incorporar su consumo durante las horas apagadas a otros gastos.

## Fórmula y unidades

`BTC/día = (TH/s × 10^12 × 86400 / (dificultad_billones × 10^12 × 2^32)) × (subsidio + comisiones_BTC_por_bloque)`.

La dificultad se introduce en billones de escala española, es decir 10^12. No es la dificultad de shares del pool. La producción es una esperanza estadística, no una promesa de pago. Las comisiones de transacciones por bloque son un promedio opcional y se distinguen de la comisión del pool. El modelo supone que el pool remunera proporcionalmente el subsidio y las comisiones introducidas.

`kWh = (W ASIC + W auxiliares) / 1000 × 24 × días × disponibilidad`.

`BTC recibido = BTC producido × (1 − pool/100)`.

`utilidad Bs = BTC recibido × precio USD/BTC × Bs/USD − kWh × tarifa − gastos fijos`.

`equilibrio Bs/kWh = (ingreso Bs − gastos fijos) / kWh`.

Sin consumo, equilibrio no aplica. Un equilibrio negativo indica que los gastos fijos superan el ingreso aun con electricidad gratis.

## Referencias y límites

245 TH/s, 3675 W y 12 Bs/USD son referencias editables solicitadas por el usuario para el Antminer S21 Pro+. El manual adjunto en la conversación original no estuvo disponible; no se afirma una verificación contra ese documento. Electricidad inicial: 1156.05 / 1135 ≈ 1.0185 Bs/kWh, basada en las facturas compartidas. Dificultad 150 × 10^12 y precio 85000 USD son ejemplos, no datos actuales; actualizar antes de decidir. Subsidio inicial 3.125 BTC es editable.

Fuentes de metodología: [dificultad Bitcoin](https://en.bitcoin.it/wiki/Difficulty), [Bitcoin Core, GetBlockSubsidy](https://github.com/bitcoin/bitcoin/blob/master/src/validation.cpp).

No incluye inversión inicial, depreciación, impuestos, progresividad tarifaria ni variaciones futuras de precio, dificultad, subsidio o comisiones. Cambiar el tipo de cambio no cambia la producción BTC.
