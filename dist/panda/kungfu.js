/* Character-led portfolio interactions. Artwork is animated in the page, never baked into a video. */
(() => {
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const guides={
 po:{name:'Po',file:'po-original-optimized.webp',filter:'all',section:'work',action:'Chi burst ✦',message:'Po introduces the complete project collection.'},
 tigress:{name:'Tigress',file:'tigress-original-optimized.webp',filter:'engineering',section:'work',action:'Tiger strike ✦',message:'Tigress guides the engineering projects.'},
 shifu:{name:'Shifu',file:'shifu-original-optimized.webp',filter:'ai',section:'work',action:'Find focus ✦',message:'Shifu guides the AI systems.'},
 oogway:{name:'Oogway',file:'oogway-original-optimized.webp',filter:null,section:'writing',action:'Take a breath ✦',message:'Oogway introduces the writing collection.'}
};
const sprite=$('#hero-character'),stage=$('#dragon-control'),explore=$('#guide-explore'),action=$('#character-action'),message=$('#guide-message');
const chapterGuides=['po','tigress','shifu','oogway'];
let currentChapter=Number($$('.hero-copy').find(b=>b.classList.contains('active'))?.dataset.beat)||0;
let selected='po',pendingChapter=false,clock=0,last=0,raf=0,energy=0,dragging=false,startX=0,drag=0,targetDrag=0,pointerX=0,pointerY=0,sx=0,sy=0,quiet=false,paused=false,visible=true,heroVisible=true,libraryTime=0,hover=false,focused=false,attention=0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rig=window.FigureRig?.create(sprite,()=>selected);let rigTime=-1,rigActive=false;
const chi=window.PandaChiEffects?.create($('#panda-chi-effects'));let chiTime=-1;
function choose(id,filter=true){
 const g=guides[id];if(!g)return;pendingChapter=false;selected=id;energy=quiet||paused ? 0 : filter ? .3 : Math.max(energy,.3);
 sprite.src='/assets/kungfu/'+g.file;sprite.className='character-sprite sprite-'+id;sprite.alt=g.name+' from Kung Fu Panda';
 rig?.quiet();rig?.resize();rigTime=-1;
 chi?.clear();chiTime=-1;
 stage.dataset.character=id;stage.setAttribute('aria-label','Interact with '+g.name+'. Drag to sway, click to '+g.action.replace(' ✦','').toLowerCase()+', or use arrow keys.');
 $('#guide-name').textContent=g.name.toUpperCase();explore.textContent='Explore with '+g.name+' ↗';action.textContent=g.action;message.textContent=g.message;
 $$('[data-guide]').forEach(b=>{const on=b.dataset.guide===id;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
 if(filter){const b=g.filter?$('[data-filter="'+g.filter+'"]'):$('[data-writing="all"]');b?.click();}
 schedule();
}
function act(){
 if(quiet||paused||!visible||!heroVisible)return;energy=1;stage.classList.add('acting');
 message.textContent={po:'Golden chi released.',tigress:'Tiger strike released.',shifu:'Focus rings released.',oogway:'Petal wave released.'}[selected];
 // The same action also wakes the continuous golden dragon renderer.
 $('#dragon-wake').click();schedule();
}
$$('[data-guide]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.guide,true)));
explore.addEventListener('click',()=>{const g=guides[selected];choose(selected);document.getElementById(g.section).scrollIntoView({behavior:quiet||paused?'auto':'smooth'});});
action.addEventListener('click',act);
stage.addEventListener('click',e=>{if(suppressClick&&e.detail!==0){suppressClick=false;return;}suppressClick=false;act();});
stage.addEventListener('pointerdown',e=>{if(quiet||paused||!visible||e.button>0)return;suppressClick=false;dragging=true;startX=e.clientX;targetDrag=e.clientX;stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(dragging)targetDrag=e.clientX;schedule();});
let suppressClick=false;
const release=()=>{if(dragging)suppressClick=Math.abs(targetDrag-startX)>5;dragging=false;targetDrag=startX;if(pendingChapter)choose(chapterGuides[currentChapter],false);};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);window.addEventListener('blur',()=>{hover=false;focused=false;release();});
stage.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&!quiet&&!paused&&visible){hover=true;schedule();}});
stage.addEventListener('pointerleave',()=>{hover=false;});stage.addEventListener('focus',()=>{if(!quiet&&!paused&&visible){focused=true;schedule();}});stage.addEventListener('blur',()=>{focused=false;});
stage.addEventListener('keydown',e=>{if(quiet||paused||!visible)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetDrag=startX+(e.key==='ArrowRight'?45:-45);schedule();}if(e.key==='Home'){targetDrag=startX;schedule();}});
window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointerX=clamp(e.clientX/innerWidth-.5,-.5,.5);pointerY=clamp(e.clientY/innerHeight-.5,-.5,.5);schedule();},{passive:true});
const library=$('.library-guide');library.addEventListener('click',()=>{if(quiet||paused){message.textContent='A quiet moment. A story to follow.';return;}libraryTime=2.4;library.classList.add('breathing');schedule();});
const credits=$('#credits-dialog');$('#art-credits').addEventListener('click',()=>{credits.showModal();document.body.classList.add('modal-open');});credits.addEventListener('close',()=>{if(!$('#detail-dialog').open&&!$('#menu-dialog').open)document.body.classList.remove('modal-open');});
function modes(){
 if(document.body.classList.contains('activity-hidden')!==document.hidden)document.body.classList.toggle('activity-hidden',document.hidden);
 quiet=document.body.classList.contains('reading-mode')||document.body.classList.contains('reduced-motion');paused=document.body.classList.contains('motion-paused');visible=!document.hidden&&!document.body.classList.contains('modal-open');
 action.disabled=quiet||paused||!visible;stage.disabled=quiet||paused||!visible;
 if(quiet||paused||!visible){hover=false;focused=false;attention=0;release();last=0;}
 if(quiet){sprite.style.transform='';library.classList.remove('breathing');energy=0;rig?.quiet();}
 if(quiet)chi?.clear();
 if(!visible){chi?.release();chiTime=-1;}
 else if(heroVisible&&!quiet&&!paused){chi?.resize();chiTime=-1;}
 if(raf&&(!visible||quiet||paused)){cancelAnimationFrame(raf);raf=0;}
 if(visible&&!quiet&&!paused)schedule();
}
function frame(now){
 raf=0;if(!visible||quiet||paused)return;const dt=Math.min(.05,(now-(last||now-16))/1000);last=now;
 if(!paused){clock+=dt;sx+=(pointerX-sx)*(1-Math.exp(-dt*6));sy+=(pointerY-sy)*(1-Math.exp(-dt*6));drag+=(clamp((targetDrag-startX)/innerWidth,-.25,.25)-drag)*(1-Math.exp(-dt*8));attention+=((hover||focused?1:0)-attention)*(1-Math.exp(-dt*7));energy=Math.max(0,energy-dt*.7);libraryTime=Math.max(0,libraryTime-dt);}
 const pose=window.CharacterMotion.pose(selected,{time:clock,power:energy,age:(1-energy)*1.15,attention,pointerX:sx*2,pointerY:sy*2});
 const amplitude=innerWidth<760?.68:1;
 const x=pose.x*amplitude+drag*140,y=pose.y*amplitude,rotation=pose.rotation*amplitude+drag*19,scale=1+(pose.scale-1)*amplitude;
 if(heroVisible)sprite.style.transform='translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0) rotate('+rotation.toFixed(2)+'deg) scale('+scale.toFixed(3)+')';
 if(heroVisible&&clock-rigTime>=(innerWidth<760?.05:.032)){rig?.draw({time:clock,power:energy,age:(1-energy)*1.15,attention,yaw:drag*8,pointerX:sx*2,pointerY:sy*2});rigTime=clock;rigActive=true;}
 rig?.sync();
 const compactChi=innerWidth<=760||(innerWidth<=1024&&innerHeight<=500);
 if(heroVisible&&clock-chiTime>=1/30){chi?.draw({character:selected,time:clock,power:energy,attention});chiTime=clock;}
 if(energy===0)stage.classList.remove('acting');if(libraryTime===0)library.classList.remove('breathing');
 if(!paused&&(heroVisible||libraryTime>0)&&window.PortfolioActivity?.active()!==false)schedule();
}
document.addEventListener('portfolio-activity',()=>{if(heroVisible||libraryTime>0)schedule();});
function schedule(){if(!raf&&!quiet&&!paused&&visible)raf=requestAnimationFrame(frame);}
function scroll(){const wasVisible=heroVisible;heroVisible=$('#home').getBoundingClientRect().bottom>0;if(!heroVisible&&rigActive){rig?.release();rigTime=-1;rigActive=false;}if(!heroVisible&&wasVisible){chi?.release();chiTime=-1;}else if(heroVisible&&!wasVisible&&!quiet&&!paused&&visible){chi?.resize();chiTime=-1;}const fraction=clamp(scrollY/Math.max(1,$('#home').offsetHeight-innerHeight),0,1);$('.temple-backdrop').style.transform=quiet||paused?'scale(1.1)':'translateY('+(-fraction*22).toFixed(2)+'px) scale('+(1.1+fraction*.08).toFixed(3)+')';schedule();}
window.addEventListener('resize',()=>{rig?.resize();if(heroVisible&&visible&&!quiet&&!paused)chi?.resize();},{passive:true});
window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;modes();});
new MutationObserver(modes).observe(document.body,{attributes:true,attributeFilter:['class']});
window.PandaExperience={chapter(index){
 if(!Number.isInteger(index)||index<0||index>=chapterGuides.length||index===currentChapter)return;
 currentChapter=index;
 // Manual selection lasts for this chapter. A drag defers the next guide until release.
 if(dragging)pendingChapter=true;else choose(chapterGuides[index],false);
}};
choose(chapterGuides[currentChapter]||'po',false);modes();scroll();
})();
