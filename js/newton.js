(function (root) {
  'use strict';
  // Matemática independiente del DOM. Los índices de la tabla son [fila][orden].
  function numero(value, label = 'Valor') {
    if (value === null || value === undefined || typeof value === 'boolean' ||
        !['number', 'string'].includes(typeof value) || String(value).trim() === '') {
      throw new Error(`${label}: el campo está vacío o no es numérico.`);
    }
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error(`${label}: ingresa un número finito válido (sin NaN ni Infinity).`);
    return n;
  }
  function validar(X, Y) {
    if (!Array.isArray(X) || !Array.isArray(Y) || X.length !== Y.length) {
      throw new Error('Los vectores X e Y deben tener la misma cantidad de elementos.');
    }
    if (X.length < 2 || X.length > 8) throw new Error('Ingresa entre 2 y 8 puntos.');
    const x = X.map((v, i) => numero(v, `x${i}`));
    const y = Y.map((v, i) => numero(v, `y${i}`));
    if (new Set(x).size !== x.length) {
      throw new Error('No es posible calcular diferencias divididas porque existen valores x repetidos y se produciría una división entre cero.');
    }
    return {X: x, Y: y};
  }
  function finito(n) {
    if (!Number.isFinite(n)) throw new Error('Los datos exceden el rango numérico disponible. Reduce su magnitud o separación extrema.');
    return n;
  }
  // Recurrencia de la GT, páginas 8-10. Tiempo O(m²), memoria O(m²).
  function diferencias_divididas(X, Y) {
    const d = validar(X, Y), m = d.X.length;
    const tabla = d.Y.map(y => [y, ...Array(m - 1).fill(null)]);
    for (let j = 1; j < m; j++) {
      for (let i = 0; i < m - j; i++) {
        const denominador = finito(d.X[i + j] - d.X[i]);
        tabla[i][j] = finito(finito(tabla[i + 1][j - 1] - tabla[i][j - 1]) / denominador);
      }
    }
    return tabla;
  }
  function coeficientes(tabla) {
    if (!Array.isArray(tabla) || !Array.isArray(tabla[0]) || tabla[0].length !== tabla.length) {
      throw new Error('La tabla de diferencias divididas no es válida.');
    }
    return tabla[0].map((v, i) => numero(v, `a${i}`));
  }
  function validarEvaluacion(X, a, x) {
    const d = validar(X, a);
    return {X: d.X, a: d.Y, x: numero(x, 'Punto a evaluar')};
  }
  // Multiplicación anidada de Newton (Horner generalizado), O(m).
  // No reconstruye la tabla ni expande el polinomio al evaluar.
  function evaluar(X, a, x) {
    const d = validarEvaluacion(X, a, x);
    let p = d.a[d.a.length - 1];
    for (let k = d.a.length - 2; k >= 0; k--) {
      p = finito(d.a[k] + finito(d.x - d.X[k]) * p);
    }
    return p;
  }
  // Producto manual de los factores y suma de coeficientes, sin biblioteca simbólica.
  // Los coeficientes estándar se almacenan en orden [c0,c1,...].
  function expandir(X, a) {
    const d = validarEvaluacion(X, a, X?.[0]);
    let base = [1];
    const c = Array(d.a.length).fill(0), pasos = [];
    for (let k = 0; k < d.a.length; k++) {
      const aporte = base.map(v => finito(v * d.a[k]));
      aporte.forEach((v, j) => {c[j] = finito(c[j] + v);});
      pasos.push({k, base: base.slice(), aporte, acumulado: c.slice()});
      if (k < d.a.length - 1) {
        const siguiente = Array(base.length + 1).fill(0);
        base.forEach((v, j) => {
          siguiente[j] = finito(siguiente[j] - finito(v * d.X[k]));
          siguiente[j + 1] = finito(siguiente[j + 1] + v);
        });
        base = siguiente;
      }
    }
    return {coeficientes: c, pasos};
  }
  function resolver(X, Y, x) {
    const d = validar(X, Y);
    const xe = numero(x, 'Punto a evaluar');
    const tabla = diferencias_divididas(d.X, d.Y), a = coeficientes(tabla);
    const value = evaluar(d.X, a, xe), estandar = expandir(d.X, a);
    let producto = 1;
    const aportes = a.map((v, k) => {
      if (k > 0) producto = finito(producto * finito(xe - d.X[k - 1]));
      return {k, producto, valor: finito(v * producto)};
    });
    const comprobacion = d.X.map((xi, i) => {
      const valor = evaluar(d.X, a, xi), diferencia = finito(valor - d.Y[i]);
      const tolerancia = 1e-9 * Math.max(1, Math.abs(d.Y[i]));
      return {x: xi, y: d.Y[i], valor, diferencia, tolerancia, ok: Math.abs(diferencia) <= tolerancia};
    });
    let b = a[a.length - 1];
    const anidada = [{k: a.length - 1, valor: b, inicio: true}];
    for (let k = a.length - 2; k >= 0; k--) {
      const anterior = b;
      b = finito(a[k] + (xe - d.X[k]) * b);
      anidada.push({k, anterior, valor: b, inicio: false});
    }
    return {...d, x: xe, tabla, a, value, estandar, aportes, comprobacion, anidada,
      extrapolacion: xe < Math.min(...d.X) || xe > Math.max(...d.X)};
  }
  function decimal(n) {
    if (!Number.isFinite(n)) return String(n);
    if (n === 0 || Object.is(n, -0)) return '0';
    if (Math.abs(n) < 1e-9 || Math.abs(n) >= 1e10) return n.toExponential(9).replace(/\.?0+(?=e)/, '');
    return String(Number(n.toFixed(10)));
  }
  // Aproximación racional SOLO para presentación. Nunca vuelve al cálculo.
  function fraccion(n) {
    if (Number.isInteger(Number(n.toFixed(10))) || Math.abs(n) < 1e-12 || Math.abs(n) > 1e8) return null;
    for (let q = 2; q <= 1000; q++) {
      const p = Math.round(n * q);
      if (p !== 0 && Math.abs(p / q - n) <= 1e-12 * Math.max(1, Math.abs(n))) return `${p}/${q}`;
    }
    return null;
  }
  function formato(n) {return fraccion(n) || decimal(n);}
  const sub = n => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
  const superindice = n => String(n).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  const factor = xi => xi < 0 ? `(x + ${formato(-xi)})` : `(x − ${formato(xi)})`;
  function expresionNewton(X, a) {
    return a.map((v, k) => `${v < 0 ? '− ' : k ? '+ ' : ''}${formato(Math.abs(v))}${X.slice(0, k).map(factor).join('')}`).join(' ');
  }
  function expresionEstandar(c, usarFracciones = true) {
    const f = usarFracciones ? formato : decimal, terminos = [];
    for (let k = c.length - 1; k >= 0; k--) {
      if (c[k] === 0) continue;
      const valor = Math.abs(c[k]);
      const coef = k && valor === 1 ? '' : `${f(valor)}${k ? '·' : ''}`;
      terminos.push(`${c[k] < 0 ? '− ' : terminos.length ? '+ ' : ''}${coef}${k ? `x${k === 1 ? '' : superindice(k)}` : ''}`);
    }
    return terminos.join(' ') || '0';
  }
  root.Newton = {numero, validar, diferencias_divididas, coeficientes, evaluar, expandir, resolver,
    decimal, fraccion, formato, sub, superindice, expresionNewton, expresionEstandar};
  if (typeof module !== 'undefined') module.exports = root.Newton;
})(globalThis);
