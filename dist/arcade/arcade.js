(() => {
 'use strict';
 const $=id=>document.getElementById(id), engine=new PortfolioArcade.Engine();
 const names={marvel:{reactor:'Arc Reactor',web:'Web Sling',reflex:'Hero Reflex'},panda:{reactor:'Chi Balance',web:'Jade Targets',reflex:'Dragon Warrior'}};
 const instructions={reactor:'Press Space or Lock energy when the needle enters the bright arc. Perfect: 100 points. Close: 60. Near: 25. Eight locks, up to 30 seconds.',web:'Tap the bright target or press its number (1–9). Each catch earns 50 points. Every fifth consecutive catch adds 25. Wrong targets cost 10. You have 20 seconds.',reflex:'Press ←, ↑, → or tap a lane when its cue reaches the bright strike line. Perfect: 100 points. Close: 60. Three misses end the round. Up to 25 seconds.'};
 const categories={reactor:'01 / TIMING',web:'02 / AIM',reflex:'03 / REFLEX'};
 const canvas=$('game-canvas'),cells=[...document.querySelectorAll('[data-cell]')],lanes=[...document.querySelectorAll('[data-lane]')];
 let ctx=null;try{ctx=canvas.getContext('2d');}catch{}
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 let theme=document.documentElement.dataset.theme==='panda'?'panda':'marvel',frameId=0,lastTime=0,seenSerial=-1,recordSaved=false,palette={},sound=false,audio=null,width=960,height=350;
 const sessionBests={};let persistentScores=true;
 const ui=new Map();
 // Leave unchanged labels and attributes alone while the canvas animates.
 function present(el,property,value){
  let last=ui.get(el);if(!last){last={};ui.set(el,last);}
  if(last[property]===value)return;last[property]=value;
  if(property.startsWith('class:'))el.classList.toggle(property.slice(6),value);
  else if(property.startsWith('attr:'))el.setAttribute(property.slice(5),value);
  else if(property.startsWith('data:'))el.dataset[property.slice(5)]=value;
  else el[property]=value;
 }
 const readBest=id=>{let saved=0;try{const n=Number(localStorage.getItem('jwalith.arcade.best.'+id));if(Number.isFinite(n)&&n>=0&&n<=10000000)saved=n;}catch{persistentScores=false;}return Math.max(saved,sessionBests[id]||0);};
 const saveBest=(id,score)=>{sessionBests[id]=score;try{localStorage.setItem('jwalith.arcade.best.'+id,String(score));}catch{persistentScores=false;}};
 function beep(hit=true){
  if(!sound||!audio||audio.state!=='running'||document.hidden)return;
  try{const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;oscillator.type='sine';oscillator.frequency.setValueAtTime(hit?640:170,now);oscillator.frequency.exponentialRampToValueAtTime(hit?920:110,now+.09);gain.gain.setValueAtTime(.035,now);gain.gain.exponentialRampToValueAtTime(.001,now+.1);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+.11);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};}catch{}
 }
 function setTheme(next){
  theme=next;document.documentElement.dataset.theme=theme;
  try{localStorage.setItem('jwalith.portfolio.theme',theme);}catch{}
  const url=new URL(location.href);url.searchParams.set('theme',theme);history.replaceState(null,'',url.href);
  const base=theme==='panda'?'/panda/index.html?theme=panda':'/?theme=marvel';
  $('portfolio-back').href=base+'#work';$('footer-back').href=base+'#work';$('arcade-brand').href=base;
  $('arcade-theme-toggle').setAttribute('aria-label','Switch arcade to '+(theme==='marvel'?'Panda':'Marvel')+' theme');
  document.querySelector('meta[name="theme-color"]').content=theme==='panda'?'#f3ecdf':'#09121c';
  document.querySelectorAll('[data-title]').forEach(el=>el.textContent=names[theme][el.dataset.title]);
  const css=getComputedStyle(document.documentElement);for(const key of ['text','muted','line','power','accent','bg','good'])palette[key]=css.getPropertyValue('--'+key).trim();
  updateIdentity();updateBest();update();draw();
 }
 function resize(){
  const rect=canvas.getBoundingClientRect();width=Math.max(240,rect.width||$('game-stage').clientWidth||960);height=innerWidth<=760?300:350;
  const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx?.setTransform(ratio,0,0,ratio,0,0);draw();
 }
 function circle(x,y,r,color,line=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=line;ctx.stroke();}
 function draw(){
  if(!ctx||engine.id==='web')return;ctx.clearRect(0,0,width,height);ctx.save();ctx.lineCap='round';
  if(engine.id==='reactor'){
   const x=width/2,y=height/2-10,r=Math.min(116,width*.34),tau=Math.PI*2;
   circle(x,y,r,palette.line,14);circle(x,y,r+24,palette.line);circle(x,y,r-28,palette.line);
   for(let n=0;n<32;n++){const angle=n/32*tau-Math.PI/2;ctx.beginPath();ctx.moveTo(x+Math.cos(angle)*(r+20),y+Math.sin(angle)*(r+20));ctx.lineTo(x+Math.cos(angle)*(r+25),y+Math.sin(angle)*(r+25));ctx.strokeStyle=palette.line;ctx.lineWidth=1;ctx.stroke();}
   ctx.beginPath();ctx.arc(x,y,r,(engine.target-.065)*tau-Math.PI/2,(engine.target+.065)*tau-Math.PI/2);ctx.strokeStyle=palette.power;ctx.lineWidth=14;ctx.stroke();
   ctx.beginPath();ctx.arc(x,y,r,(engine.target-.025)*tau-Math.PI/2,(engine.target+.025)*tau-Math.PI/2);ctx.strokeStyle=palette.good;ctx.lineWidth=14;ctx.stroke();
   const angle=engine.angle*tau-Math.PI/2;ctx.beginPath();ctx.moveTo(x+Math.cos(angle)*(r-16),y+Math.sin(angle)*(r-16));ctx.lineTo(x+Math.cos(angle)*(r+15),y+Math.sin(angle)*(r+15));ctx.strokeStyle=palette.text;ctx.lineWidth=4;ctx.stroke();
   ctx.fillStyle=palette.text;ctx.font='500 27px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(String(engine.score),x,y+4);ctx.fillStyle=palette.muted;ctx.font='10px ui-monospace,monospace';ctx.fillText(theme==='panda'?'CHI CAPTURED':'ENERGY CAPTURED',x,y+28);
  }else{
   const top=26,line=height*.79;
   for(let n=0;n<3;n++){
    const x=(n+.5)*width/3;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,height-30);ctx.strokeStyle=palette.line;ctx.lineWidth=1;ctx.stroke();
    circle(x,line,22,palette.power,2);ctx.fillStyle=palette.muted;ctx.textAlign='center';ctx.font='12px ui-monospace,monospace';ctx.fillText(['←','↑','→'][n],x,line+4);
   }
   ctx.beginPath();ctx.moveTo(20,line);ctx.lineTo(width-20,line);ctx.strokeStyle=palette.power;ctx.lineWidth=1;ctx.stroke();
   for(const cue of engine.queue){
    if(media.matches&&cue.progress<.8)continue;
    const x=(cue.lane+.5)*width/3,y=media.matches?line:top+(line-top)*cue.progress,ready=cue.progress>=.8&&cue.progress<=1.12;
    ctx.fillStyle=ready?palette.good:palette.accent;ctx.beginPath();ctx.moveTo(x,y-13);ctx.lineTo(x+13,y);ctx.lineTo(x,y+13);ctx.lineTo(x-13,y);ctx.closePath();ctx.fill();
   }
  }
  ctx.restore();
 }
 function updateIdentity(){
  $('game-title').textContent=names[theme][engine.id];$('game-category').textContent=categories[engine.id];$('game-instructions').textContent=instructions[engine.id];
  $('game-stat-label').textContent=engine.id==='reactor'?'LOCKS':engine.id==='web'?'STREAK':'LIVES';
  $('timing-controls').hidden=engine.id!=='reactor';$('lane-controls').hidden=engine.id!=='reflex';$('target-grid').hidden=engine.id!=='web';canvas.hidden=engine.id==='web';
  canvas.setAttribute('aria-label',engine.id==='reflex'?'Three reflex lanes. Press the matching arrow when its cue reaches the strike line.':'Timing ring. Lock energy when the moving needle reaches the highlighted arc.');
 }
 function update(){
  const active=engine.running&&!engine.paused;
  present($('game-score'),'textContent',String(engine.score));present($('game-time'),'textContent',Math.max(0,Math.ceil(engine.duration-engine.time))+'s');
  present($('game-stat'),'textContent',engine.id==='reactor'?engine.round+' / 8':engine.id==='web'?String(engine.combo):'●'.repeat(engine.lives)+'○'.repeat(3-engine.lives));
  present($('pause-game'),'disabled',!engine.running);present($('pause-game'),'textContent',engine.paused?'Resume':'Pause');
  present($('start-game').firstChild,'textContent',engine.ended?'Play again ':engine.running?'Restart round ':'Start round ');
  present($('lock-energy'),'disabled',!active);cells.forEach((cell,index)=>{present(cell,'disabled',!active);present(cell,'class:is-target',active&&index===engine.cell);present(cell,'attr:aria-label','Target position '+(index+1)+(active&&index===engine.cell?', active target':''));});
  lanes.forEach((lane,index)=>{present(lane,'disabled',!active);present(lane,'class:ready-lane',active&&engine.queue.some(c=>c.lane===index&&c.progress>=.8&&c.progress<=1.12));});
  $('motion-note').hidden=!(media.matches&&engine.id==='reflex');
  const overlay=$('stage-overlay');present(overlay,'hidden',active);
  if(!active){
   present($('overlay-title'),'textContent',engine.ended?'Score: '+engine.score:engine.paused?'Round paused.':'Ready to play?');
   present($('overlay-copy'),'textContent',engine.ended?engine.hits+' hits · '+engine.misses+' misses. Try another round?':engine.paused?'Your score and timer are safe. Press Resume to continue.':'Press Start round when you’re ready.');
  }
  present($('game-feedback'),'textContent',engine.feedback);present($('game-feedback'),'data:kind',engine.feedbackKind);
  if(engine.ended&&!recordSaved){
   recordSaved=true;const isBest=engine.score>readBest(engine.id);if(isBest)saveBest(engine.id,engine.score);
   $('game-status').textContent='Round complete. '+engine.score+' points.'+(isBest?' New personal best.':'');updateBest();
  }
  if(engine.serial!==seenSerial){seenSerial=engine.serial;if(engine.feedbackKind==='hit'||engine.feedbackKind==='miss')beep(engine.feedbackKind==='hit');}
 }
 function updateBest(){document.querySelectorAll('[data-best]').forEach(el=>{el.textContent='BEST '+(readBest(el.dataset.best)||'—');});$('game-best').textContent=readBest(engine.id)||'—';if(!persistentScores){$('score-storage-note').textContent='Best scores last until you close this page';$('score-save-note').textContent='This browser can only keep your best scores while this page is open.';}}
 function frame(now){frameId=0;if(engine.running&&!engine.paused&&!document.hidden){engine.tick(lastTime?Math.min(.1,(now-lastTime)/1000):0);lastTime=now;}update();draw();schedule();}
 function schedule(){if(!frameId&&engine.running&&!engine.paused&&!document.hidden)frameId=requestAnimationFrame(frame);}
 function choose(id){
  if(!Object.hasOwn(PortfolioArcade.durations,id))return;
  if(frameId)cancelAnimationFrame(frameId);frameId=0;lastTime=0;engine.reset(id);recordSaved=false;seenSerial=engine.serial;
  document.querySelectorAll('[data-game]').forEach(el=>{const selected=el.dataset.game===id;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
  const url=new URL(location.href);url.hash=id;history.replaceState(null,'',url.href);$('game-status').textContent=names[theme][id]+'. '+instructions[id];
  updateIdentity();updateBest();update();resize();
  $('start-game').disabled=!ctx&&id!=='web';if(!ctx&&id!=='web')$('game-status').textContent='Canvas is unavailable here. Web Sling / Jade Targets still works.';
 }
 function action(value){if(engine.input(value)){update();draw();}}
 function pause(){
  if(!engine.running)return;engine.pause(true);if(frameId)cancelAnimationFrame(frameId);frameId=0;lastTime=0;update();$('game-status').textContent='Round paused. Press Resume when you’re ready.';
  audio?.suspend().catch(()=>{});
 }
 $('start-game').addEventListener('click',()=>{
  if(!ctx&&engine.id!=='web')return;engine.start();recordSaved=false;lastTime=0;$('game-status').textContent='Round started. '+instructions[engine.id];$('play-area').focus({preventScroll:true});update();draw();schedule();if(sound)audio?.resume().catch(()=>{});
 });
 $('pause-game').addEventListener('click',()=>{if(engine.paused){engine.pause(false);lastTime=0;update();schedule();$('game-status').textContent='Round resumed.';if(sound)audio?.resume().catch(()=>{});}else pause();});
 $('lock-energy').addEventListener('click',()=>action());cells.forEach(el=>el.addEventListener('click',()=>action(Number(el.dataset.cell))));lanes.forEach(el=>el.addEventListener('click',()=>action(Number(el.dataset.lane))));
 document.querySelectorAll('[data-game]').forEach(el=>el.addEventListener('click',()=>choose(el.dataset.game)));
 document.addEventListener('keydown',event=>{
  if(event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||!engine.running||engine.paused)return;
  if(!($('play-area').contains(document.activeElement)||document.activeElement===document.body))return;
  if(event.key==='Escape'){event.preventDefault();pause();return;}
  if(engine.id==='reactor'&&(event.key===' '||event.code==='Space')){
   if(event.target.closest?.('button,a,input')&&event.target.id!=='lock-energy')return;event.preventDefault();action();
  }else if(engine.id==='web'&&/^[1-9]$/.test(event.key)){event.preventDefault();action(Number(event.key)-1);}
  else if(engine.id==='reflex'&&['ArrowLeft','ArrowUp','ArrowRight'].includes(event.key)){event.preventDefault();action(['ArrowLeft','ArrowUp','ArrowRight'].indexOf(event.key));}
 });
 $('arcade-theme-toggle').addEventListener('click',()=>setTheme(theme==='marvel'?'panda':'marvel'));
 $('arcade-sound').addEventListener('click',async()=>{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC){$('arcade-sound').textContent='Sound unavailable';return;}
  try{if(!audio)audio=new AC();sound=!sound;if(sound)await audio.resume();else await audio.suspend();$('arcade-sound').setAttribute('aria-pressed',String(sound));$('arcade-sound').textContent=sound?'Sound on':'Sound off';}catch{sound=false;$('arcade-sound').setAttribute('aria-pressed','false');$('arcade-sound').textContent='Sound unavailable';}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();audio?.suspend().catch(()=>{});}});window.addEventListener('blur',pause);
 window.addEventListener('pagehide',()=>{pause();if(frameId)cancelAnimationFrame(frameId);frameId=0;audio?.suspend().catch(()=>{});});
 window.addEventListener('pageshow',event=>{if(event.persisted){lastTime=0;updateBest();update();resize();}});
 window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(Object.hasOwn(PortfolioArcade.durations,id)&&id!==engine.id)choose(id);});
 window.addEventListener('storage',event=>{if(event.key===null||event.key?.startsWith('jwalith.arcade.best.'))updateBest();});
 window.addEventListener('resize',resize,{passive:true});media.addEventListener('change',()=>{update();draw();});
 setTheme(theme);const initial=location.hash.slice(1);choose(Object.hasOwn(PortfolioArcade.durations,initial)?initial:'reactor');updateBest();resize();
})();
