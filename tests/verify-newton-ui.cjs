// Coordinación de ambas interfaces en un DOM mínimo; la revisión visual es aparte.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const assert = require('node:assert/strict');
const elements = new Map();
function el(id) {
  if(!elements.has(id)) elements.set(id, {value:'',hidden:true,textContent:'',innerHTML:'',open:false,handlers:{},attributes:{},
    setAttribute(k,v){this.attributes[k]=v;}, addEventListener(t,fn){(this.handlers[t]??=[]).push(fn);}, focus(){}, scrollIntoView(){},
    reset(){for(const [k,e] of elements) if(/^([xy]\d|eval)$/.test(k)) e.value='';}});
  return elements.get(id);
}
function fire(id,t='click') {for(const fn of el(id).handlers[t]||[]) fn({preventDefault(){}});}
el('method-select').value='lagrange';
const classes=new Set();
const ctx=vm.createContext({document:{getElementById:el,body:{classList:{toggle(k,on){on?classes.add(k):classes.delete(k);}}}}, console});
for(const name of ['lagrange.js','newton.js','grafica.js','ui.js','app.js','newton-ui.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name),'utf8'),ctx);
assert.equal(el('result-title').textContent,'P₃(6) = 55.25 ms');
assert.equal(el('newton-result-title').textContent,'P₃(5) = 139 ms');
assert.equal(el('newton-overview-title').textContent,el('newton-result-title').textContent);
assert.equal(el('newton-overview-interpretation').textContent,el('newton-interpretation').textContent);
assert.equal(el('newton-overview').hidden,false);
assert.equal(el('lagrange-workspace').hidden,false);assert.equal(el('newton-workspace').hidden,true);
el('method-select').value='newton';fire('method-select','change');assert.equal(el('lagrange-workspace').hidden,true);assert.equal(el('newton-workspace').hidden,false);
assert.equal((el('newton-table').innerHTML.match(/coefficient-cell/g)||[]).length,4);
assert.equal((el('newton-steps').innerHTML.match(/class="step"/g)||[]).length,6);
assert.ok(el('newton-polynomial').textContent.includes('5/6(x − 1)(x − 2)'));
assert.ok(el('newton-standard').textContent.includes('133/6·x + 24'));
assert.ok(el('newton-interpretation').textContent.includes('500 req/s'));
assert.ok(el('newton-chart').innerHTML.includes('Punto evaluado (5, 139)'));
assert.equal((el('newton-checks').innerHTML.match(/✓ Coincide/g)||[]).length,4);
fire('newton-manual');assert.equal(el('newton-steps-details').open,true);assert.equal(el('newton-horner-details').open,true);
fire('newton-practice-toggle');assert.equal(el('newton-results').hidden,true);
el('newton-answer').value='139';fire('newton-practice-form','submit');assert.ok(el('newton-feedback').textContent.includes('¡Correcto!'));assert.equal(el('newton-results').hidden,true);
el('newton-answer').value='10';fire('newton-practice-form','submit');assert.ok(el('newton-feedback').textContent.includes('Todavía'));
el('newton-answer').value='';fire('newton-practice-form','submit');assert.ok(el('newton-feedback').textContent.includes('vacío'));
fire('newton-practice-toggle');assert.equal(el('newton-results').hidden,false);
el('nx1').value='1';fire('newton-form','input');assert.equal(el('newton-results').hidden,true);
fire('newton-form','submit');assert.equal(el('newton-error').hidden,false);assert.ok(el('newton-error').textContent.includes('valores x repetidos'));
fire('newton-example');assert.equal(el('newton-result-title').textContent,'P₃(5) = 139 ms');
// Construir tabla no exige x_eval y no presenta resultados antiguos.
el('newton-eval').value='';fire('newton-form','input');fire('newton-build');assert.equal(el('newton-error').hidden,true);assert.equal(el('newton-results').hidden,false);assert.equal(el('newton-evaluation').hidden,true);assert.equal(el('newton-graph').hidden,true);
assert.equal(el('newton-overview').hidden,true); // No conserva la respuesta de un cálculo anterior al mostrar solo la tabla.
fire('newton-form','submit');assert.equal(el('newton-error').hidden,false);
for(const m of [2,3,4,5,8]) {
  el('newton-count').value=String(m);fire('newton-count','change');
  assert.equal((el('newton-inputs').innerHTML.match(/<input /g)||[]).length,2*m);
  for(let i=0;i<m;i++){el(`nx${i}`).value=String(i-2);el(`ny${i}`).value=String((i-2)**2+1);}
  el('newton-eval').value='.5';fire('newton-form','submit');
  assert.equal(el('newton-error').hidden,true);assert.equal(el('newton-results').hidden,false);
  assert.equal(el('newton-overview-title').textContent,el('newton-result-title').textContent);
  assert.equal(el('newton-overview').hidden,false);
  assert.equal(el('newton-result-title').textContent, m===2?'P₁(0.5) = -2.5 ms':`P${'₀₁₂₃₄₅₆₇'[m-1]}(0.5) = 1.25 ms`);
  assert.equal((el('newton-steps').innerHTML.match(/class="step"/g)||[]).length,m*(m-1)/2);
  assert.equal((el('newton-chart').innerHTML.match(/class="node"/g)||[]).length,m);
  assert.equal((el('newton-checks').innerHTML.match(/✓ Coincide/g)||[]).length,m);
}
fire('newton-clear');assert.equal(el('newton-eval').value,'');assert.equal(el('newton-results').hidden,true);
fire('newton-example');el('newton-eval').value='9';fire('newton-form','submit');assert.equal(el('newton-warning').hidden,false);
fire('newton-example');el('newton-practice-toggle').handlers.click[0]();fire('newton-manual');assert.equal(el('newton-results').hidden,false);assert.equal(el('newton-practice-toggle').attributes['aria-pressed'],'false');
// Cambiar de método no pierde los datos ni la solución de Lagrange.
el('method-select').value='lagrange';fire('method-select','change');assert.equal(el('newton-workspace').hidden,true);assert.equal(el('lagrange-workspace').hidden,false);
assert.equal(el('result-title').textContent,'P₃(6) = 55.25 ms');
fire('view-study');assert.equal(el('study-panel').hidden,false);el('practice-answer').value='55.25';fire('practice-form','submit');assert.ok(el('practice-feedback').textContent.includes('¡Correcto!'));
fire('view-calc');fire('example');assert.equal(el('results').hidden,false);
console.log('Interfaz integrada aprobada: selector, tabla, desarrollo, práctica, 2/3/4/5/8 puntos, validaciones, gráfica y conservación de Lagrange.');
