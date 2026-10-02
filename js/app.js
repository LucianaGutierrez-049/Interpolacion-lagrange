'use strict';
UI.el('inputs').innerHTML=Array.from({length:4},(_,i)=>`<tr><td>${i}</td><td><input id="x${i}" aria-label="x${i} en GB" type="text" inputmode="decimal" autocomplete="off"></td><td><input id="y${i}" aria-label="y${i} en ms" type="text" inputmode="decimal" autocomplete="off"></td></tr>`).join('');
function calcular(){
  UI.ocultar();
  try{const d=UI.leer();const r=Lagrange.evaluar(d.points,d.x);const g=Grafica.preparar(d.points,d.x);UI.mostrar(r,g);}
  catch(e){UI.ocultar();UI.el('error').textContent=e.message;UI.el('error').hidden=false;}
}
function ejemplo(){[[2,150],[4,85],[8,50],[12,70]].forEach((p,i)=>{UI.el(`x${i}`).value=p[0];UI.el(`y${i}`).value=p[1];});UI.el('eval').value=6;calcular();}
UI.el('form').addEventListener('submit',e=>{e.preventDefault();calcular();});
UI.el('form').addEventListener('input',()=>UI.ocultar());
UI.el('example').addEventListener('click',ejemplo);
UI.el('clear').addEventListener('click',()=>{UI.el('form').reset();UI.ocultar();UI.el('x0').focus();});
ejemplo();
let practicando = false;
UI.el('practice-toggle').addEventListener('click',()=>{
  practicando = !practicando;
  document.body.classList.toggle('practice-mode',practicando);
  UI.el('practice-toggle').textContent=practicando?'Mostrar solución':'Ocultar solución y practicar';
  UI.el('practice-toggle').setAttribute('aria-pressed',String(practicando));
});
UI.el('practice-form').addEventListener('submit',e=>{
  e.preventDefault();
  try {
    const d=UI.leer();const r=Lagrange.evaluar(d.points,d.x);
    const answer=Lagrange.numero(UI.el('practice-answer').value,'Tu estimación');
    const ok=Math.abs(answer-r.value)<=1e-6*Math.max(1,Math.abs(r.value));
    UI.el('practice-feedback').textContent=ok?'¡Correcto! Ahora revisa que hayas escrito las cuatro bases, los aportes y las unidades.':'Todavía no coincide. Revisa el orden de las restas y los signos; calcula cada aporte sin redondear antes de sumar.';
  }catch(e){UI.el('practice-feedback').textContent=e.message;}
});
function cambiarVista(estudio) {
  UI.el('calculator-panel').hidden=estudio;
  UI.el('study-panel').hidden=!estudio;
  UI.el('view-calc').setAttribute('aria-selected',String(!estudio));
  UI.el('view-study').setAttribute('aria-selected',String(estudio));
}
UI.el('view-calc').addEventListener('click',()=>cambiarVista(false));
UI.el('view-study').addEventListener('click',()=>cambiarVista(true));
UI.el('nav-lab').addEventListener('click',()=>cambiarVista(false));
UI.el('nav-study').addEventListener('click',()=>cambiarVista(true));
