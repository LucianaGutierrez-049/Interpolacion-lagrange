(function (root) {
  'use strict';
  function preparar(points, x) {
    const r = Lagrange.evaluar(points, x);
    const min = Math.min(...r.points.map(p => p.x)), max = Math.max(...r.points.map(p => p.x));
    const a = Math.min(min, r.x), b = Math.max(max, r.x);
    const curva = Array.from({length: 401}, (_, i) => {
      const t = a + (b - a) * i / 400;
      return {x: t, y: Lagrange.evaluar(r.points, t).value};
    });
    return {points: r.points, curva, evaluado: {x: r.x, y: r.value}, a, b, extrapolacion: r.x < min || r.x > max};
  }
  function dibujar(svg, data) {
    const f = Lagrange.formato;
    let lo = Math.min(...data.curva.map(p => p.y), ...data.points.map(p => p.y), data.evaluado.y);
    let hi = Math.max(...data.curva.map(p => p.y), ...data.points.map(p => p.y), data.evaluado.y);
    const pad = (hi - lo || Math.max(1, Math.abs(hi) * .1)) * .15;
    lo -= pad; hi += pad;
    if (![lo, hi, data.b-data.a, hi-lo].every(Number.isFinite) || hi === lo) throw new Error('El rango de estos datos es demasiado grande o pequeño para graficarlo.');
    const X = x => 85 + (x - data.a) / (data.b - data.a) * 665;
    const Y = y => 345 - (y - lo) / (hi - lo) * 310;
    let out = '<title>Gráfica de interpolación de Lagrange</title><desc>Cuatro nodos experimentales, curva polinómica y punto evaluado destacado.</desc>';
    for (let i=0; i<=5; i++) {
      const x=data.a+(data.b-data.a)*i/5, y=lo+(hi-lo)*i/5;
      const tick = n => f(Number(n.toPrecision(4)));
      out += `<path class="grid" d="M ${X(x)} 35 V345 M85 ${Y(y)} H750"/><text x="${X(x)}" y="369" text-anchor="middle">${tick(x)}</text><text x="75" y="${Y(y)+4}" text-anchor="end">${tick(y)}</text>`;
    }
    out += '<path class="axis" d="M85 35 V345 H750"/><text x="415" y="405" text-anchor="middle">Memoria asignada (GB)</text><text transform="translate(20 190) rotate(-90)" text-anchor="middle">Latencia media (ms)</text>';
    out += `<path class="curve" d="${data.curva.map((p,i)=>`${i?'L':'M'} ${X(p.x)} ${Y(p.y)}`).join(' ')}"/>`;
    data.points.forEach(p => {out += `<circle class="node" cx="${X(p.x)}" cy="${Y(p.y)}" r="6"><title>Dato (${f(p.x)}, ${f(p.y)})</title></circle>`;});
    const p=data.evaluado;
    out += `<path class="guide" d="M${X(p.x)} 345 V${Y(p.y)} H85"/><circle class="evaluated" cx="${X(p.x)}" cy="${Y(p.y)}" r="8"><title>Punto evaluado (${f(p.x)}, ${f(p.y)})</title></circle>`;
    svg.innerHTML=out;
  }
  root.Grafica={preparar,dibujar};
  if(typeof module!=='undefined') module.exports=root.Grafica;
})(globalThis);
