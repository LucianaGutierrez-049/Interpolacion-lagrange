'use strict';
const UI = {
  el: id => document.getElementById(id),
  leer() {return {points:Array.from({length:4},(_,i)=>({x:this.el(`x${i}`).value,y:this.el(`y${i}`).value})),x:this.el('eval').value};},
  ocultar() {['results','development','algebra','error'].forEach(id=>this.el(id).hidden=true);this.el('practice-feedback').textContent='';},
  mostrar(r,g) {
    const f=Lagrange.formato;
    this.el('result-title').textContent=`P₃(${f(r.x)}) = ${f(r.value)} ms`;
    this.el('interpretation').textContent=`Para ${f(r.x)} GB de RAM, la latencia ${g.extrapolacion?'extrapolada':'interpolada'} es aproximadamente ${f(r.value)} ms.`;
    this.el('warning').hidden=!g.extrapolacion;
    this.el('warning').textContent='Extrapolación: el punto evaluado está fuera del intervalo de los nodos. La estimación puede ser menos fiable.';
    this.el('points').textContent=r.points.map((p,i)=>`Punto ${i}: (${f(p.x)} GB, ${f(p.y)} ms)`).join(' · ');
    this.el('practice-data').textContent=`Ejercicio actual: ${r.points.map(p=>`(${f(p.x)}, ${f(p.y)})`).join(' · ')}. Estima P₃(${f(r.x)}).`;
    this.el('steps').innerHTML=r.bases.map((b,k)=>`<article class="step"><strong>L${k}(${f(r.x)})</strong><p>${b.factores.map(t=>`[(${f(r.x)} − (${f(t.xi)})) / (${f(t.xk)} − (${f(t.xi)}))]`).join(' × ')}</p><p>= ${b.factores.map(t=>`(${f(t.numerador)} / ${f(t.denominador)})`).join(' × ')} = <strong>${f(b.base)}</strong></p><p>y${k} · L${k} = ${f(r.points[k].y)} × (${f(b.base)}) = <strong>${f(b.aporte)} ms</strong></p></article>`).join('');
    this.el('sum').textContent=`P₃(${f(r.x)}) = ${r.bases.map(b=>`(${f(b.aporte)})`).join(' + ')} = ${f(r.value)} ms`;
    this.el('checks').innerHTML=r.points.map(p=>{const v=Lagrange.evaluar(r.points,p.x).value;return `<tr><td>${f(p.x)}</td><td>${f(p.y)}</td><td>${f(v)}</td><td>${f(v-p.y)}</td></tr>`;}).join('');
    Grafica.dibujar(this.el('chart'),g);
    this.el('range').textContent=`Intervalo gráfico: [${f(g.a)}, ${f(g.b)}] GB. El punto naranja es (${f(r.x)}, ${f(r.value)}).`;
    this.el('results').hidden=false;this.el('development').hidden=false;
    const algebra = Lagrange.polinomios(r.points);
    this.el('algebra').hidden = !algebra;
    if (algebra) {
      this.el('base-polynomials').innerHTML=algebra.bases.map((c,k)=>`<article class="step"><strong>L${k}(x)</strong><p>${Lagrange.expresion(c)}</p></article>`).join('');
      this.el('polynomial').textContent=`P₃(x) ≈ ${Lagrange.expresion(algebra.coeficientes)}`;
    }
  }
};
