/* Native non-modal experience disclosure keeps controls out of the reading surface. */
(() => {
 'use strict';
 const panel=document.getElementById('experience-panel');if(!panel)return;
 const summary=panel.querySelector('summary'),state=document.getElementById('experience-state'),sound=document.getElementById('sound-toggle');
 panel.addEventListener('click',event=>{if(event.target.closest?.('[data-hero-link]'))panel.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.open){panel.open=false;if(panel.contains(document.activeElement))summary.focus();}});
 document.addEventListener('pointerdown',event=>{if(panel.open&&!panel.contains(event.target))panel.open=false;});
 function sync(){
  const b=document.body,reading=b.classList.contains('reading-mode'),paused=b.classList.contains('motion-paused');
  const text=reading?'Reading mode':paused?'Motion paused':(sound?.getAttribute('aria-pressed')==='true'?'Sound on':'Sound off')+' · Motion on';if(state.textContent!==text)state.textContent=text;
  if(b.classList.contains('modal-open'))panel.open=false;
 }
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});if(sound)new MutationObserver(sync).observe(sound,{attributes:true,attributeFilter:['aria-pressed']});sync();
})();
