(function () {
  'use strict';
  const el = id => document.getElementById(id), N = Newton;
  const f = N.formato, dec = N.decimal;
  let cantidad = 4, practicando = false;
  const pnombre = m => `P${N.sub(m - 1)}`;
  const etiqueta = (i, j) => `f[${Array.from({length: j + 1}, (_, k) => `x${N.sub(i + k)}`).join(',')}]`;
  const valor = n => N.fraccion(n) ? `${f(n)} <small>≈ ${dec(n)}</small>` : dec(n);
  function filas(n, conservar = true) {
    const anterior = conservar ? Array.from({length: cantidad}, (_, i) => [el(`nx${i}`).value, el(`ny${i}`).value]) : [];
    cantidad = n;
    el('newton-inputs').innerHTML = Array.from({length: n}, (_, i) => `<tr><th scope="row">${i}</th><td><input id="nx${i}" aria-label="Newton x${i}" type="text" inputmode="decimal" autocomplete="off"></td><td><input id="ny${i}" aria-label="Newton y${i}" type="text" inputmode="decimal" autocomplete="off"></td></tr>`).join('');
    anterior.slice(0, n).forEach((p, i) => {el(`nx${i}`).value = p[0]; el(`ny${i}`).value = p[1];});
    el('newton-degree').textContent = `${n} puntos · grado máximo ${n - 1}`;
    invalidar();
  }
  function leer() {
    return {X: Array.from({length: cantidad}, (_, i) => el(`nx${i}`).value),
      Y: Array.from({length: cantidad}, (_, i) => el(`ny${i}`).value), x: el('newton-eval').value};
  }
  function invalidar() {
    el('newton-results').hidden = true;
    el('newton-error').hidden = true;
    el('newton-status').textContent = 'Datos editables. Construye la tabla o resuelve para actualizar.';
    el('newton-feedback').textContent = '';
    el('newton-answer').value = '';
  }
  function error(e) {
    el('newton-results').hidden = true;
    el('newton-error').textContent = e.message;
    el('newton-error').hidden = false;
    el('newton-status').textContent = 'Revisa los datos señalados antes de continuar.';
  }
  function tabla(X, t) {
    return `<table class="divided-table"><caption>Tabla triangular completa. La primera fila contiene los coeficientes aₖ.</caption><thead><tr><th scope="col">xᵢ</th><th scope="col">f[xᵢ]</th>${X.slice(1).map((_, j) => `<th scope="col">${j + 1}.ª diferencia</th>`).join('')}</tr></thead><tbody>${t.map((fila, i) => `<tr><th scope="row">${dec(X[i])}</th>${fila.map((v, j) => v === null ? '<td class="empty-cell" aria-label="No corresponde">—</td>' : `<td${i === 0 ? ' class="coefficient-cell"' : ''}>${valor(v)}${i === 0 ? `<span class="coefficient-label">a${N.sub(j)}</span>` : ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function mostrarTabla(d, t) {
    el('newton-overview').hidden = true;
    const X = N.validar(d.X, d.Y).X;
    el('newton-data').textContent = `X = [${X.map(dec).join(', ')}] · Y = [${t.map(fila => dec(fila[0])).join(', ')}]`;
    el('newton-first-column').textContent = t.map((fila, i) => `${etiqueta(i, 0)} = ${f(fila[0])}`).join(' · ');
    el('newton-table').innerHTML = tabla(X, t);
    let out = '';
    for (let j = 1; j < X.length; j++) {
      out += `<h3>Diferencias de orden ${j}</h3><div class="steps">`;
      for (let i = 0; i < X.length - j; i++) {
        out += `<article class="step"><strong>${etiqueta(i, j)}</strong><p>(${etiqueta(i + 1, j - 1)} − ${etiqueta(i, j - 1)}) / (x${N.sub(i + j)} − x${N.sub(i)})</p><p>= [(${f(t[i + 1][j - 1])}) − (${f(t[i][j - 1])})] / [(${f(X[i + j])}) − (${f(X[i])})]</p><p>= <strong>${f(t[i][j])}</strong>${N.fraccion(t[i][j]) ? ` ≈ ${dec(t[i][j])}` : ''}</p></article>`;
      }
      out += '</div>';
    }
    el('newton-steps').innerHTML = out;
    el('newton-coefficients').innerHTML = N.coeficientes(t).map((a, k) => `<div class="coefficient-tile"><span>a${N.sub(k)} = ${etiqueta(0, k)}</span><strong>${f(a)}</strong>${N.fraccion(a) ? `<small>≈ ${dec(a)}</small>` : ''}</div>`).join('');
    el('newton-results').hidden = practicando;
    el('newton-error').hidden = true;
    ['newton-polynomials', 'newton-standard-section', 'newton-evaluation', 'newton-validation', 'newton-graph'].forEach(id => {el(id).hidden = true;});
  }
  function mostrarSolucion(r, g) {
    const P = pnombre(r.X.length);
    el('newton-polynomial').textContent = `${P}(x) ≈ ${N.expresionNewton(r.X, r.a)}`;
    el('newton-standard').textContent = `${P}(x) ≈ ${N.expresionEstandar(r.estandar.coeficientes)}`;
    el('newton-standard-decimal').textContent = `En decimal: ${N.expresionEstandar(r.estandar.coeficientes, false)}`;
    el('newton-expansion').innerHTML = r.estandar.pasos.map(p => `<article class="step"><strong>Término ${p.k}: a${N.sub(p.k)} · ${p.k ? r.X.slice(0, p.k).map(xi => `(x − (${f(xi)}))`).join('') : '1'}</strong><p>Producto expandido: ${N.expresionEstandar(p.base)}</p><p>Multiplicar por ${f(r.a[p.k])}: ${N.expresionEstandar(p.aporte)}</p><p>Acumulado: ${N.expresionEstandar(p.acumulado)}</p></article>`).join('');
    el('newton-substitution').textContent = `${P}(${dec(r.x)}) ≈ ${r.a.map((a, k) => `(${f(a)})${r.X.slice(0, k).map(xi => `·(${f(r.x)} − (${f(xi)}))`).join('')}`).join(' + ')}`;
    el('newton-contributions').textContent = `Aportes: ${r.aportes.map(t => `(${f(t.valor)})`).join(' + ')} ≈ ${dec(r.value)}`;
    el('newton-result-title').textContent = `${P}(${dec(r.x)}) = ${dec(r.value)} ms`;
    const carga = r.x * 100;
    el('newton-interpretation').textContent = `Para una carga de ${Number.isFinite(carga) ? `${dec(carga)} req/s ` : ''}(x = ${dec(r.x)}), la latencia ${r.extrapolacion ? 'extrapolada' : 'interpolada'} es aproximadamente ${dec(r.value)} ms.`;
    el('newton-overview-title').textContent = el('newton-result-title').textContent;
    el('newton-overview-interpretation').textContent = el('newton-interpretation').textContent;
    el('newton-overview').hidden = false;
    const horner = r.anidada.map(p => p.inicio ? `Inicio: b = a${N.sub(p.k)} = ${f(p.valor)}` :
      `b = ${f(r.a[p.k])} + (${f(r.x)} − (${f(r.X[p.k])})) · (${f(p.anterior)}) ≈ ${dec(p.valor)}`);
    el('newton-horner').innerHTML = horner.map(s => `<p>${s}</p>`).join('');
    el('newton-checks').innerHTML = r.comprobacion.map(c => `<tr><td>${dec(c.x)}</td><td>${dec(c.y)}</td><td>${dec(c.valor)}</td><td>${dec(c.diferencia)}</td><td class="${c.ok ? 'check-ok' : 'check-fail'}">${c.ok ? '✓ Coincide' : 'Revisar precisión'}</td></tr>`).join('');
    el('newton-check-summary').textContent = r.comprobacion.every(c => c.ok) ? 'Todos los nodos coinciden dentro de la tolerancia 10⁻⁹ × max(1, |yᵢ|).' : 'Algún residuo supera la tolerancia. Los nodos cercanos o magnitudes extremas pueden causar pérdida de precisión.';
    el('newton-warning').hidden = !r.extrapolacion;
    el('newton-warning').textContent = 'Extrapolación: x_eval está fuera de los nodos. La estimación puede ser menos fiable.';
    Grafica.dibujar(el('newton-chart'), g, {metodo: 'Newton por diferencias divididas', ejeX: 'Carga concurrente (100 req/s)'});
    el('newton-range').textContent = `Intervalo: [${dec(g.a)}, ${dec(g.b)}]. Punto destacado: (${dec(r.x)}, ${dec(r.value)}).`;
    ['newton-polynomials', 'newton-standard-section', 'newton-evaluation', 'newton-validation', 'newton-graph'].forEach(id => {el(id).hidden = false;});
    el('newton-status').textContent = practicando ? 'Solución calculada y oculta. Resuelve en papel y comprueba tu respuesta.' : `${P}(${dec(r.x)}) = ${dec(r.value)} ms · Tabla y comprobación actualizadas.`;
  }
  function resolver(manual = false) {
    invalidar();
    try {
      const d = leer(), r = N.resolver(d.X, d.Y, d.x), g = Grafica.prepararNewton(r);
      if (manual) {practicando = false; actualizarPractica();}
      mostrarTabla(d, r.tabla); mostrarSolucion(r, g);
      if (manual) {
        ['newton-steps-details', 'newton-expansion-details', 'newton-horner-details'].forEach(id => {el(id).open = true;});
        el('newton-results').hidden = false;
        el('newton-data-section').scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    } catch (e) {error(e);}
  }
  function construir() {
    invalidar();
    try {const d = leer(); mostrarTabla(d, N.diferencias_divididas(d.X, d.Y));
      el('newton-status').textContent = practicando ? 'Tabla construida y oculta por el modo práctica.' : 'Tabla construida. Pulsa Resolver con Newton para evaluar y graficar.';
    } catch (e) {error(e);}
  }
  function ejemplo() {
    el('newton-count').value = '4'; filas(4, false);
    [[1,45],[2,65],[4,110],[7,220]].forEach((p, i) => {el(`nx${i}`).value = p[0]; el(`ny${i}`).value = p[1];});
    el('newton-eval').value = 5; resolver();
  }
  function actualizarPractica() {
    el('newton-practice-toggle').textContent = practicando ? 'Mostrar solución de Newton' : 'Ocultar solución y practicar Newton';
    el('newton-practice-toggle').setAttribute('aria-pressed', String(practicando));
  }
  el('newton-count').addEventListener('change', () => filas(Number(el('newton-count').value)));
  el('newton-form').addEventListener('input', invalidar);
  el('newton-form').addEventListener('submit', e => {e.preventDefault(); resolver();});
  el('newton-build').addEventListener('click', construir);
  el('newton-example').addEventListener('click', ejemplo);
  el('newton-manual').addEventListener('click', () => resolver(true));
  el('newton-clear').addEventListener('click', () => {
    Array.from({length: cantidad}, (_, i) => i).forEach(i => {el(`nx${i}`).value = ''; el(`ny${i}`).value = '';});
    el('newton-eval').value = ''; invalidar(); el('nx0').focus();
  });
  el('newton-practice-toggle').addEventListener('click', () => {
    practicando = !practicando; actualizarPractica();
    if (practicando) {el('newton-results').hidden = true; el('newton-status').textContent = 'Modo práctica: solución oculta. Trabaja con los datos del formulario.';}
    else resolver();
  });
  el('newton-practice-form').addEventListener('submit', e => {
    e.preventDefault();
    try {
      const d = leer(), r = N.resolver(d.X, d.Y, d.x), respuesta = N.numero(el('newton-answer').value, 'Tu respuesta');
      const ok = Math.abs(respuesta - r.value) <= 1e-6 * Math.max(1, Math.abs(r.value));
      el('newton-feedback').textContent = ok ? '¡Correcto! Comprueba también tu tabla, los coeficientes y las unidades.' : 'Todavía no coincide. Revisa las restas de cada orden, los nodos de los denominadores y el redondeo.';
    } catch (e) {el('newton-feedback').textContent = e.message;}
  });
  function metodo() {
    const newton = el('method-select').value === 'newton';
    el('lagrange-workspace').hidden = newton; el('newton-workspace').hidden = !newton;
    el('method-description').textContent = newton ? 'Sesión 09 · Nodos distintos, incluso sin separación uniforme · 2 a 8 puntos' : 'Sesión 08 · Bases de Lagrange · 4 nodos editables';
  }
  el('method-select').addEventListener('change', metodo);
  el('nav-lab').addEventListener('click', () => {
    if (el('method-select').value === 'newton') el('newton-form').scrollIntoView({behavior:'smooth'});
  });
  el('nav-study').addEventListener('click', () => {
    if (el('method-select').value === 'newton') el('newton-study').scrollIntoView({behavior:'smooth'});
  });
  filas(4, false); ejemplo(); metodo();
})();
