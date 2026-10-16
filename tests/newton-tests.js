(function () {
  'use strict';
  const N = globalThis.Newton, G = globalThis.Grafica, results = [];
  function assert(ok, message = 'Comprobación fallida') {if (!ok) throw new Error(message);}
  function near(a, b, tol = 1e-9) {assert(Math.abs(a-b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);}
  function rejects(fn, text) {let e; try {fn();} catch (err) {e = err;}
    assert(e && (!text || e.message.includes(text)), `Se esperaba rechazo: ${text || ''}`);}
  function test(name, fn) {try {fn(); results.push({name, ok:true});} catch(e) {results.push({name, ok:false, error:e.message});}}
  const X = [1,2,4,7], Y = [45,65,110,220], r = N.resolver(X,Y,5);
  test('S9: primera columna y estructura triangular completa', () => {
    assert(r.tabla.length === 4); r.tabla.forEach((row,i) => {assert(row.length===4); near(row[0],Y[i]);
      row.forEach((v,j) => assert(j < 4-i ? Number.isFinite(v) : v === null));});
  });
  [[0,1,20],[1,1,22.5],[2,1,110/3],[0,2,5/6],[1,2,17/6],[0,3,1/3]].forEach(([i,j,v]) => test(`S9: diferencia fila ${i}, orden ${j}`, () => near(r.tabla[i][j],v)));
  test('S9: coeficientes [45,20,5/6,1/3]', () => r.a.forEach((a,k) => near(a,[45,20,5/6,1/3][k])));
  test('S9: P₃(5) = 139 ms', () => near(r.value,139));
  test('S9: los cuatro nodos coinciden', () => r.comprobacion.forEach(c => {near(c.valor,c.y);assert(c.ok);}));
  test('S9: forma estándar [24,133/6,-3/2,1/3]', () => r.estandar.coeficientes.forEach((c,k) => near(c,[24,133/6,-3/2,1/3][k])));
  test('S9: expresiones de Newton y estándar calculadas', () => {
    assert(N.expresionNewton(r.X,r.a)==='45 + 20(x − 1) + 5/6(x − 1)(x − 2) + 1/3(x − 1)(x − 2)(x − 4)');
    assert(N.expresionEstandar(r.estandar.coeficientes)==='1/3·x³ − 3/2·x² + 133/6·x + 24');
  });
  test('S9: aportes [45,80,10,4]', () => r.aportes.forEach((v,k) => near(v.valor,[45,80,10,4][k])));
  test('GT: tres puntos, x_eval decimal (P₂(0.7)=2.6548)', () => near(N.resolver([0,.5,1],[1,2.12,3.55],.7).value,2.6548));
  test('GT: cuatro nodos de una cuadrática (P(3)=10)', () => {const a=N.resolver([1,2,4,5],[2,5,17,26],3);near(a.value,10);near(a.a[3],0);});
  test('Cinco puntos: cuártica conocida y coeficientes estándar', () => {
    const x=[-2,-.5,0,1,3], p=t=>2*t**4-3*t**2+5*t-7, a=N.resolver(x,x.map(p),.25);
    near(a.value,p(.25));a.estandar.coeficientes.forEach((v,k)=>near(v,[-7,5,-3,0,2][k]));assert(a.tabla[0].length===5);
  });
  test('Dos puntos: recta con valores negativos y decimal', () => near(N.resolver([-3,2],[-7,8],-.5).value,.5));
  test('Ocho puntos: grado 7 conocido, orden adicional y evaluación', () => {
    const x=[-3,-2,-1,0,1,2,3,4], p=t=>t**7-2*t+3, a=N.resolver(x,x.map(p),.5);
    near(a.value,p(.5));near(a.a[7],1);assert(a.tabla.length===8);assert(a.comprobacion.every(c=>c.ok));
  });
  test('Orden invertido preserva el interpolante', () => near(N.resolver([...X].reverse(),[...Y].reverse(),5).value,139));
  test('Orden arbitrario preserva el interpolante', () => near(N.resolver([4,1,7,2],[110,45,220,65],5).value,139));
  test('Función constante y ceros de orden superior', () => {const a=N.resolver([-1,0,2,4],[6,6,6,6],1);near(a.value,6);assert(a.a.slice(1).every(v=>v===0));});
  test('Rechaza x repetidos con el mensaje solicitado', () => rejects(()=>N.diferencias_divididas([1,1],[3,4]),'No es posible calcular diferencias divididas porque existen valores x repetidos y se produciría una división entre cero.'));
  test('Rechaza vectores de distinta longitud', () => rejects(()=>N.diferencias_divididas([1,2],[3]),'misma cantidad'));
  test('Rechaza menos de 2 o más de 8 puntos', () => {rejects(()=>N.diferencias_divididas([1],[2]),'entre 2 y 8');rejects(()=>N.diferencias_divididas(Array(9).fill(0),Array(9).fill(0)),'entre 2 y 8');});
  test('Rechaza vacíos, texto, NaN e Infinity en X e Y', () => {
    for(const v of ['', ' ', 'texto','NaN','Infinity',NaN,Infinity,null,undefined,true,{}]) {
      rejects(()=>N.diferencias_divididas([v,2],[3,4])); rejects(()=>N.diferencias_divididas([1,2],[v,4]));
    }
  });
  test('Rechaza x_eval inválido', () => {for(const v of ['', 'texto', NaN, Infinity,null]) rejects(()=>N.resolver(X,Y,v));});
  test('Rechaza desbordamiento aritmético', () => rejects(()=>N.diferencias_divididas([-1e308,1e308],[0,1]),'rango numérico'));
  test('No modifica los vectores ni la tabla de entrada', () => {const x=Object.freeze([...X]), y=Object.freeze([...Y]); N.resolver(x,y,5);const t=N.diferencias_divididas(x,y), before=JSON.stringify(t);N.coeficientes(t);assert(JSON.stringify(t)===before);});
  test('La expansión reproduce la evaluación anidada en varios x', () => {
    for(const x of [-2,.25,1,5,8]) near(r.estandar.coeficientes.reduce((s,c,k)=>s+c*x**k,0),N.evaluar(r.X,r.a,x));
  });
  test('Formato: fracciones simples, enteros y sin -0', () => {
    assert(N.formato(5/6)==='5/6'); assert(N.formato(110/3)==='110/3');assert(N.formato(-1.5)==='-3/2');
    assert(N.formato(-0)==='0');assert(N.formato(3.999999999999999)==='4');assert(N.decimal(45)==='45');
  });
  test('Gráfica Newton: nodos, 401 muestras y (5,139)', () => {
    const g=G.prepararNewton(r), svg={innerHTML:''};G.dibujar(svg,g,{metodo:'Newton',ejeX:'Carga concurrente (100 req/s)'});
    assert(g.curva.length===401);near(g.a,1);near(g.b,7);near(g.evaluado.y,139);
    assert((svg.innerHTML.match(/class="node"/g)||[]).length===4);assert(svg.innerHTML.includes('Punto evaluado (5, 139)'));
    assert(svg.innerHTML.includes('Carga concurrente (100 req/s)'));assert(!/NaN|Infinity/.test(svg.innerHTML));
  });
  test('Gráfica con 3, 5 y 8 puntos adapta nodos y rangos', () => {
    for(const m of [3,5,8]) {const x=Array.from({length:m},(_,i)=>i-3), a=N.resolver(x,x.map(t=>t*t),.5),g=G.prepararNewton(a);
      assert(g.points.length===m);near(g.a,Math.min(...x,.5));near(g.b,Math.max(...x,.5));}
  });
  test('Extrapolación se identifica y amplía el intervalo', () => {const g=G.prepararNewton(N.resolver(X,Y,10));assert(g.extrapolacion);near(g.b,10);});
  if(typeof document!=='undefined') {
    document.getElementById('newton-summary').textContent=`${results.filter(r=>r.ok).length}/${results.length} pruebas aprobadas`;
    document.getElementById('newton-report').innerHTML=results.map(r=>`<p class="${r.ok?'check-ok':'error'}">${r.ok?'✓':'✗'} ${r.name}${r.error?`: ${r.error}`:''}</p>`).join('');
  }
  if(typeof module!=='undefined') {module.exports=results; if(results.some(r=>!r.ok)) process.exitCode=1;}
  if(typeof document==='undefined') console.log(`Newton: ${results.filter(r=>r.ok).length}/${results.length} pruebas aprobadas`,results.filter(r=>!r.ok));
})();
