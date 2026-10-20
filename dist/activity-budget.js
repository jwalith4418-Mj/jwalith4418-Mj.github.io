/* Ambient motion rests after interaction; every existing power/drag remains available. */
(() => {
 'use strict';
 let until=performance.now()+2600, lastWake=0, timer=0;
 const active=()=>!document.hidden&&performance.now()<until;
 function rest(){
  const remaining=until-performance.now();
  if(remaining>0){timer=setTimeout(rest,remaining+20);return;}
  document.body?.classList.add('motion-resting');
 }
 function wake(){
  until=performance.now()+2600;
  if(document.body?.classList.contains('motion-resting'))document.body.classList.remove('motion-resting');
  clearTimeout(timer);timer=setTimeout(rest,2620);
  if(until-lastWake<200)return;
  lastWake=until;document.dispatchEvent(new Event('portfolio-activity'));
 }
 for(const name of ['pointermove','pointerdown','keydown','scroll','focusin'])
  window.addEventListener(name,wake,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});
 window.PortfolioActivity=Object.freeze({active,wake});
 timer=setTimeout(rest,2620);
})();
