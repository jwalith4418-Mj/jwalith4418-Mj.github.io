/* A scroll-driven phone bar; one queued update, no continuous animation loop. */
(() => {
 'use strict';
 const nav=document.querySelector('.phone-navigation');if(!nav)return;
 const links=[...nav.querySelectorAll('[data-phone-section]')];
 const panel=document.getElementById('experience-panel');
 const sections=['selected-work','work','writing','about','global-exposure','contact'].map(id=>document.getElementById(id)).filter(Boolean);
 const compact=()=>innerWidth<=760||(innerWidth<=1024&&innerHeight<=500);
 let queued=0,current='';
 function sync(){
  queued=0;if(document.hidden||!compact())return;
  let active='work';
  for(const section of sections)if(section.getBoundingClientRect().top<=innerHeight*.34){active=section.id==='selected-work'?'work':section.id==='global-exposure'?'about':section.id;}
  if(active===current)return;current=active;
  for(const link of links){if(link.dataset.phoneSection===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
 }
 function schedule(){if(!queued&&!document.hidden&&compact())queued=requestAnimationFrame(sync);}
 nav.addEventListener('click',event=>{if(event.target.closest?.('[data-phone-section]')&&panel)panel.open=false;});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&queued){cancelAnimationFrame(queued);queued=0;}else schedule();});
 sync();
})();
