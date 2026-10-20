/* Use the visible phone viewport for overlays; never alter pinch-zoom sizing. */
(() => {
 'use strict';
 const root=document.documentElement,viewport=window.visualViewport;
 const compact=()=>innerWidth<=760||(innerWidth<=1024&&innerHeight<=500);
 let queued=0,lastHeight='',lastTop='';
 function clear(){if(lastHeight||lastTop){root.style.removeProperty('--phone-visible-height');root.style.removeProperty('--phone-visible-top');lastHeight=lastTop='';}}
 function sync(){
  queued=0;if(document.hidden)return;
  if(!compact()||(viewport&&Math.abs(viewport.scale-1)>.01)){clear();return;}
  const rawHeight=viewport?.height??innerHeight,rawTop=viewport?.offsetTop??0;
  if(!Number.isFinite(rawHeight)||rawHeight<=0||!Number.isFinite(rawTop)){clear();return;}
  const height=Math.round(rawHeight)+'px',top=Math.max(0,Math.round(rawTop))+'px';
  if(height!==lastHeight){root.style.setProperty('--phone-visible-height',height);lastHeight=height;}
  if(top!==lastTop){root.style.setProperty('--phone-visible-top',top);lastTop=top;}
 }
 function schedule(){if(!queued&&!document.hidden)queued=requestAnimationFrame(sync);}
 window.addEventListener('resize',schedule,{passive:true});window.addEventListener('pageshow',schedule);
 viewport?.addEventListener('resize',schedule,{passive:true});viewport?.addEventListener('scroll',schedule,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&queued){cancelAnimationFrame(queued);queued=0;}else schedule();});
 sync();
})();
