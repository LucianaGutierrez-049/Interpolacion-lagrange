(function(){
  'use strict';
  const points=[{x:2,y:150},{x:4,y:85},{x:8,y:50},{x:12,y:70}];
  const results=[];
  function assert(ok,message){if(!ok)throw new Error(message||'Comprobación fallida');}
  function near(a,b){assert(Math.abs(a-b)<1e-9,`${a} ≠ ${b}`);}
  function rejects(fn){let failed=false;try{fn();}catch(e){failed=true;}assert(failed,'Debía rechazar los datos');}
  function test(name,fn){try{fn();results.push({name,ok:true});}catch(e){results.push({name,ok:false,error:e.message});}}
  test('Caso Sesión 8: P₃(6) = 55.25',()=>near(Lagrange.evaluar(points,6).value,55.25));
  test('El polinomio pasa por los cuatro nodos',()=>points.forEach(p=>near(Lagrange.evaluar(points,p.x).value,p.y)));
  test('Las cuatro bases suman 1',()=>near(Lagrange.evaluar(points,6).bases.reduce((s,b)=>s+b.base,0),1));
  test('Bases esperadas: −0.2, 0.75, 0.5, −0.05',()=>Lagrange.evaluar(points,6).bases.forEach((b,i)=>near(b.base,[-.2,.75,.5,-.05][i])));
  test('Rechaza nodos repetidos',()=>rejects(()=>Lagrange.evaluar([...points.slice(0,3),{x:2,y:70}],6)));
  test('Recta con cuatro nodos negativos y decimales',()=>{const p=[-2,-.5,1,3].map(x=>({x,y:2*x+3}));near(Lagrange.evaluar(p,.25).value,3.5);});
  test('Polinomio cúbico conocido',()=>{const p=[-1,0,2,4].map(x=>({x,y:x*x*x-2*x+1}));near(Lagrange.evaluar(p,1.5).value,1.375);});
  test('Rechaza campos vacíos, texto, NaN e Infinity',()=>['','abc',NaN,Infinity,-Infinity].forEach(x=>{rejects(()=>Lagrange.evaluar(points,x));rejects(()=>Lagrange.evaluar([{x,y:1},...points.slice(1)],6));rejects(()=>Lagrange.evaluar([{x:2,y:x},...points.slice(1)],6));}));
  test('Exige exactamente cuatro nodos',()=>{rejects(()=>Lagrange.evaluar(points.slice(1),6));rejects(()=>Lagrange.evaluar([...points,{x:20,y:2}],6));});
  test('Gráfica: rango [2,12], 401 muestras, resultado intacto',()=>{const original=JSON.stringify(points);const g=Grafica.preparar(points,6);assert(g.a===2&&g.b===12&&g.curva.length===401&&!g.extrapolacion);near(g.evaluado.y,55.25);assert(g.curva.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));assert(JSON.stringify(points)===original);});
  test('Extrapolación: amplía el rango hasta el punto',()=>{const g=Grafica.preparar(points,15);assert(g.extrapolacion&&g.a===2&&g.b===15);});
  test('Formato: elimina −0 y conserva magnitudes pequeñas',()=>{assert(Lagrange.formato(-0)==='0');assert(Lagrange.formato(2)==='2');assert(Number(Lagrange.formato(1e-12))===1e-12);});
  test('Nodos desordenados conservan el resultado y rango',()=>{const p=[points[3],points[1],points[0],points[2]];near(Lagrange.evaluar(p,6).value,55.25);const g=Grafica.preparar(p,6);assert(g.a===2&&g.b===12);});
  test('Evaluación sobre un nodo: una base vale 1 y las demás 0',()=>Lagrange.evaluar(points,8).bases.forEach((b,i)=>near(b.base,i===2?1:0)));
  test('Función constante: resultado y SVG finitos',()=>{const p=points.map(p=>({x:p.x,y:5}));near(Lagrange.evaluar(p,6).value,5);const svg={innerHTML:''};Grafica.dibujar(svg,Grafica.preparar(p,6));assert(!/NaN|Infinity/.test(svg.innerHTML));});
  test('Extrapolación inferior y extremos del intervalo',()=>{const g=Grafica.preparar(points,-1);assert(g.extrapolacion&&g.a===-1&&g.b===12);assert(!Grafica.preparar(points,2).extrapolacion&&!Grafica.preparar(points,12).extrapolacion);});
  test('Coeficientes calculados del ejemplo',()=>Lagrange.polinomios(points).coeficientes.forEach((v,i)=>near(v,[261,-1651/24,227/32,-43/192][i])));
  test('Bases expandidas reproducen sus valores en cada nodo',()=>Lagrange.polinomios(points).bases.forEach((c,k)=>points.forEach((p,i)=>near(c.reduceRight((s,v)=>s*p.x+v,0),i===k?1:0))));
  test('Expansión general de una cúbica conocida',()=>{const p=[-1,0,2,4].map(x=>({x,y:x*x*x-2*x+1}));Lagrange.polinomios(p).coeficientes.forEach((v,i)=>near(v,[1,-2,0,1][i]));});
  if(typeof document!=='undefined'){
    document.getElementById('report').innerHTML=results.map(r=>`<p style="color:${r.ok?'#16734b':'#b22929'}">${r.ok?'✓':'✗'} ${r.name}${r.error?': '+r.error:''}</p>`).join('');
    document.getElementById('summary').textContent=`${results.filter(r=>r.ok).length}/${results.length} pruebas aprobadas`;
  }
  if(typeof module!=='undefined'){console.log(results);if(results.some(r=>!r.ok))process.exitCode=1;}
})();
