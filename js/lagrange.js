(function (root) {
  'use strict';
  function numero(value, label) {
    if (value === null || value === undefined || String(value).trim() === '') throw new Error(`${label}: el campo está vacío.`);
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error(`${label}: ingresa un número finito válido (sin NaN ni Infinity).`);
    return n;
  }
  function validar(points, x) {
    if (!Array.isArray(points) || points.length !== 4) throw new Error('Se requieren exactamente 4 puntos.');
    const nodos = points.map((p, i) => ({x: numero(p.x, `x${i}`), y: numero(p.y, `y${i}`)}));
    if (new Set(nodos.map(p => p.x)).size !== 4) throw new Error('No es posible aplicar Lagrange porque existen nodos x repetidos; el denominador x_k - x_i sería cero.');
    return {points: nodos, x: numero(x, 'Punto a evaluar')};
  }
  // Evaluación manual: un bucle por base y otro por factor. O(n²).
  function evaluar(points, x) {
    const data = validar(points, x);
    const bases = []; let value = 0;
    for (let k = 0; k < data.points.length; k++) {
      let base = 1; const factores = [];
      for (let i = 0; i < data.points.length; i++) {
        if (i !== k) {
          const numerador = data.x - data.points[i].x;
          const denominador = data.points[k].x - data.points[i].x;
          base *= numerador / denominador;
          factores.push({xi: data.points[i].x, xk: data.points[k].x, numerador, denominador});
        }
      }
      const aporte = data.points[k].y * base;
      if (!Number.isFinite(base) || !Number.isFinite(aporte)) throw new Error('Los datos exceden la precisión numérica disponible. Reduce su magnitud o separación extrema.');
      bases.push({base, aporte, factores}); value += aporte;
    }
    if (!Number.isFinite(value)) throw new Error('El resultado excede el rango numérico disponible.');
    return {...data, value, bases};
  }
  function formato(n) {
    if (Object.is(n, -0) || n === 0) return '0';
    if (Math.abs(n) < 1e-8 || Math.abs(n) >= 1e10) return n.toExponential(7).replace(/\.?(0+)(?=e)/, '');
    return Number(n.toFixed(8)).toString();
  }
  // Expansión de los productos de Lagrange para estudiar su forma algebraica.
  // Es auxiliar: la evaluación principal conserva sus dos bucles O(n²).
  function polinomios(points) {
    const data = validar(points, points[0]?.x);
    const bases = [], coeficientes = [0, 0, 0, 0];
    for (let k = 0; k < 4; k++) {
      let c = [1];
      for (let i = 0; i < 4; i++) {
        if (i === k) continue;
        const siguiente = Array(c.length + 1).fill(0);
        const d = data.points[k].x - data.points[i].x;
        for (let j = 0; j < c.length; j++) {
          siguiente[j] += -data.points[i].x * c[j] / d;
          siguiente[j + 1] += c[j] / d;
        }
        c = siguiente;
      }
      bases.push(c);
      c.forEach((v, j) => {coeficientes[j] += data.points[k].y * v;});
    }
    if (![...coeficientes, ...bases.flat()].every(Number.isFinite)) return null;
    return {bases, coeficientes};
  }
  function expresion(c) {
    const terminos = [];
    for (let j = c.length - 1; j >= 0; j--) {
      if (c[j] === 0) continue;
      const valor = formato(Math.abs(c[j]));
      const variable = j === 0 ? '' : j === 1 ? 'x' : `x${['','','²','³'][j]}`;
      terminos.push(`${c[j] < 0 ? '−' : terminos.length ? '+' : ''} ${valor}${variable}`.trim());
    }
    return terminos.join(' ') || '0';
  }
  root.Lagrange = {numero, validar, evaluar, formato, polinomios, expresion};
  if (typeof module !== 'undefined') module.exports = root.Lagrange;
})(globalThis);
