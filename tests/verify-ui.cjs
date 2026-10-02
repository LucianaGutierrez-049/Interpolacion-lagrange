// Verificación de coordinación y SVG en Node; no sustituye revisión visual en navegador.
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{value:'',hidden:true,textContent:'',innerHTML:'',handlers:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(type,fn){this.handlers[type]=fn;},reset(){for(const [key,e] of elements)if(/^([xy]\d|eval)$/.test(key))e.value='';},focus(){}});return elements.get(id);}
const classes=new Set();
const ctx=vm.createContext({document:{getElementById:el,body:{classList:{toggle(name,on){on?classes.add(name):classes.delete(name);}}}},console});
for(const file of ['lagrange.js','grafica.js','ui.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),ctx);
assert.equal(el('result-title').textContent,'P₃(6) = 55.25 ms');
assert.equal(el('results').hidden,false);
assert.equal((el('inputs').innerHTML.match(/<tr>/g)||[]).length,4);
assert.equal((el('inputs').innerHTML.match(/<input /g)||[]).length,8);
assert.equal((el('steps').innerHTML.match(/class="step"/g)||[]).length,4);
assert.equal(el('interpretation').textContent,'Para 6 GB de RAM, la latencia interpolada es aproximadamente 55.25 ms.');
assert.equal(el('sum').textContent,'P₃(6) = (-30) + (63.75) + (25) + (-3.5) = 55.25 ms');
assert.ok(el('chart').innerHTML.includes('Punto evaluado (6, 55.25)'));
assert.equal((el('chart').innerHTML.match(/class="node"/g)||[]).length,4);
assert.equal((el('chart').innerHTML.match(/class="evaluated"/g)||[]).length,1);
assert.ok(el('chart').innerHTML.includes('class="curve"'));
assert.ok(el('chart').innerHTML.includes('Memoria asignada (GB)'));
assert.ok(el('chart').innerHTML.includes('Latencia media (ms)'));
assert.ok(!/NaN|Infinity/.test(el('chart').innerHTML));
assert.equal((el('checks').innerHTML.match(/<td>0<\/td>/g)||[]).length,4);
el('x1').value='2';vm.runInContext('calcular()',ctx);assert.equal(el('error').hidden,false);assert.ok(el('error').textContent.includes('repetidos'));assert.equal(el('results').hidden,true);
vm.runInContext('ejemplo()',ctx);el('eval').value='15';vm.runInContext('calcular()',ctx);assert.equal(el('warning').hidden,false);assert.ok(el('interpretation').textContent.includes('extrapolada'));
el('clear').handlers.click();assert.equal(el('eval').value,'');assert.equal(el('results').hidden,true);
vm.runInContext('calcular()',ctx);assert.ok(el('error').textContent.includes('vacío'));
vm.runInContext('ejemplo()',ctx);assert.equal(el('result-title').textContent,'P₃(6) = 55.25 ms');
for(const bad of ['','texto','NaN','Infinity']){
  el('eval').value=bad;el('form').handlers.submit({preventDefault(){}});
  assert.equal(el('error').hidden,false);assert.equal(el('results').hidden,true);
}
vm.runInContext('ejemplo()',ctx);el('form').handlers.input();assert.equal(el('results').hidden,true);assert.equal(el('development').hidden,true);
el('example').handlers.click();assert.equal(el('result-title').textContent,'P₃(6) = 55.25 ms');
assert.equal(el('algebra').hidden,false);assert.ok(el('polynomial').textContent.includes('261'));
assert.equal((el('base-polynomials').innerHTML.match(/class="step"/g)||[]).length,4);
el('practice-toggle').handlers.click();assert.ok(classes.has('practice-mode'));assert.equal(el('practice-toggle').attributes['aria-pressed'],'true');
el('practice-answer').value='55.25';el('practice-form').handlers.submit({preventDefault(){}});assert.ok(el('practice-feedback').textContent.includes('¡Correcto!'));
el('practice-answer').value='150';el('practice-form').handlers.submit({preventDefault(){}});assert.ok(el('practice-feedback').textContent.includes('Todavía no coincide'));
el('practice-answer').value='';el('practice-form').handlers.submit({preventDefault(){}});assert.ok(el('practice-feedback').textContent.includes('vacío'));
el('practice-toggle').handlers.click();assert.ok(!classes.has('practice-mode'));
el('view-study').handlers.click();assert.equal(el('calculator-panel').hidden,true);assert.equal(el('study-panel').hidden,false);
assert.equal(el('view-study').attributes['aria-selected'],'true');
assert.ok(el('practice-data').textContent.includes('Estima P₃(6)'));
el('view-calc').handlers.click();assert.equal(el('calculator-panel').hidden,false);assert.equal(el('study-panel').hidden,true);
console.log('Verificación de interfaz y SVG aprobada: ejemplo, cuatro nodos, curva, marcador, unidades, validación, extrapolación y limpieza.');
