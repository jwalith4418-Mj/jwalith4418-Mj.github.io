(() => {
'use strict';
const $ = (s, root=document) => root.querySelector(s), $$ = (s,root=document) => [...root.querySelectorAll(s)];
const content = window.PORTFOLIO;
if (!content) return;
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
const pad = n => String(n).padStart(2,'0');
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
const body=document.body, track=$('#project-track'), grid=$('#project-grid'), detail=$('#detail-dialog'), menu=$('#menu-dialog');
let filter='all', indexView=false, savedIndexView=false, shown=[], currentIndex=0, readerIndex=0, returnHash='#work', reading=false, paused=false, reduced=reducedQuery.matches;
let uid=0;
function art(p) {
  const id='art-'+(++uid), color=p.group==='concept'?'#bf7740':'#ddb04f';
  let shape='';
  if (/cropdoctor|agtech/.test(p.id)) {
    shape='<path d="M310 315C195 253 212 110 365 83C403 218 381 280 310 315Z" fill="'+color+'" fill-opacity=".1" stroke="'+color+'" stroke-width="1.5"/><path d="M308 335Q300 218 363 85M313 274L260 227M324 235L375 191M335 192L296 145" fill="none" stroke="'+color+'" stroke-opacity=".65"/>';
  } else if (/aquagen|aquacore/.test(p.id)) {
    shape='<path d="M324 80C307 123 226 211 227 253C227 370 426 370 426 253C426 212 343 123 324 80Z" fill="'+color+'" fill-opacity=".06" stroke="'+color+'" stroke-width="1.5"/><path d="M258 273Q325 236 397 273M255 289Q325 253 396 290" fill="none" stroke="'+color+'" stroke-opacity=".7"/><circle cx="325" cy="230" r="143" fill="none" stroke="'+color+'" stroke-opacity=".1"/>';
  } else if (/climaverse/.test(p.id)) {
    shape='<g fill="none" stroke="'+color+'"><circle cx="325" cy="220" r="118" stroke-opacity=".6"/><ellipse cx="325" cy="220" rx="48" ry="118" stroke-opacity=".4"/><ellipse cx="325" cy="220" rx="91" ry="118" stroke-opacity=".24"/><ellipse cx="325" cy="220" rx="118" ry="38" stroke-opacity=".35"/><ellipse cx="325" cy="220" rx="118" ry="80" stroke-opacity=".25"/><path d="M207 220H443M325 102V338" stroke-opacity=".25"/><ellipse cx="325" cy="220" rx="173" ry="36" transform="rotate(-30 325 220)" stroke="#e8a15a" stroke-opacity=".45"/></g>';
  } else if (/attendance/.test(p.id)) {
    shape='<rect x="254" y="100" width="146" height="236" rx="20" fill="'+color+'" fill-opacity=".06" stroke="'+color+'" stroke-opacity=".6"/><path d="M294 117H360M310 317H344" stroke="'+color+'" stroke-opacity=".6"/><g fill="none" stroke="'+color+'" stroke-opacity=".6"><rect x="275" y="159" width="102" height="33" rx="5"/><rect x="275" y="207" width="102" height="33" rx="5"/><path d="M294 272L310 285L352 255"/></g>';
  } else if (/veritas/.test(p.id)) {
    shape='<g stroke="'+color+'" fill="'+color+'" fill-opacity=".03"><path d="M325 89L194 291L457 291ZM325 89L326 355L194 291M326 355L457 291M194 291L390 198L325 89M390 198L457 291M390 198L326 355" stroke-opacity=".7"/><circle cx="325" cy="220" r="160" fill="none" stroke-opacity=".14"/></g>';
  } else if (/timeless/.test(p.id)) {
    shape='<g fill="none" stroke="#e8a15a"><path d="M225 337V169Q325 17 425 169V337" stroke-opacity=".65"/><path d="M247 337V175Q325 66 403 175V337" stroke-opacity=".35"/><path d="M270 337V180Q325 108 380 180V337" stroke-opacity=".25"/><ellipse cx="325" cy="240" rx="45" ry="100" stroke="#5fd0b4" stroke-opacity=".8"/><circle cx="325" cy="237" r="108" stroke="#5fd0b4" stroke-dasharray="2 12" stroke-opacity=".4"/></g>';
  } else {
    const points=[[325,220],[243,116],[415,137],[458,256],[350,331],[224,302],[170,201]];
    shape='<g stroke="'+color+'" fill="none">';
    points.forEach((v,i)=>{if(i)shape+='<path d="M325 220L'+v.join(' ')+'" stroke-opacity=".4"/>'; if(i>1)shape+='<path d="M'+points[i-1].join(' ')+'L'+v.join(' ')+'" stroke-opacity=".2"/>';});
    shape+='</g>';
    points.forEach((v,i)=>{shape+='<circle cx="'+v[0]+'" cy="'+v[1]+'" r="'+(i?6:24)+'" fill="'+color+'" fill-opacity="'+(i?.35:.12)+'" stroke="'+color+'" stroke-opacity=".8"/>';});
    shape+='<circle cx="325" cy="220" r="135" fill="none" stroke="'+color+'" stroke-opacity=".16" stroke-dasharray="1 8"/>';
    if(/openmythos|cognitiveos/.test(p.id))shape+='<ellipse cx="325" cy="220" rx="178" ry="72" fill="none" stroke="#e8a15a" stroke-opacity=".28" transform="rotate(35 325 220)"/>';
  }
  let dots='';
  for(let i=0;i<30;i++){const x=90+((i*131+p.number*17)%460),y=45+((i*97)%340);dots+='<circle cx="'+x+'" cy="'+y+'" r="'+(i%4===0?1.5:.7)+'" fill="'+color+'" opacity="'+(.12+(i%5)*.05)+'"/>';}
  return '<svg viewBox="0 0 600 430" aria-hidden="true" focusable="false"><defs><radialGradient id="'+id+'"><stop stop-color="'+color+'" stop-opacity=".14"/><stop offset="1" stop-color="'+color+'" stop-opacity="0"/></radialGradient></defs><circle cx="325" cy="220" r="200" fill="url(#'+id+')"/><g fill="none" stroke="'+color+'" stroke-opacity=".08"><circle cx="325" cy="220" r="185"/><path d="M110 220H540M325 22V410"/><path d="M110 85H130V65M518 85H538V65M110 357H130V377M518 357H538V377"/></g>'+dots+shape+'</svg>';
}
function badge(p){return '<span class="stage-badge '+(p.group==='concept'?'concept':'')+'">'+esc(p.stage)+'</span>';}
function projectCard(p){
 const tools=p.stack.slice(0,3).map(t=>'<span>'+esc(t)+'</span>').join('');
 return '<article class="project-card" data-project="'+esc(p.id)+'" data-discipline="'+esc(p.group)+'"><div class="project-art">'+art(p)+'</div><div class="card-shade"></div><div class="card-content"><div class="card-top"><span class="mono">PROJECT / '+p.number+'</span>'+badge(p)+'</div><p class="card-category">'+esc(p.category.toUpperCase())+'</p><h3>'+esc(p.displayName)+'</h3><p class="card-description">'+esc(p.summary)+'</p><div class="card-tools" aria-label="Selected technologies">'+tools+'</div>'+(window.ProjectResources?.summary(p)||'')+'<div class="card-bottom"><span class="card-detail-hint">'+p.highlights.length+' areas to explore</span><button class="open-project" data-open-project="'+esc(p.id)+'" aria-label="Explore '+esc(p.displayName)+'">Explore project <span aria-hidden="true">↗</span></button></div></div><span class="card-decoration">CONCEPTUAL VISUAL STUDY</span></article>';
}
function indexCard(p){return '<button class="index-card" data-open-project="'+esc(p.id)+'"><span class="mono">'+p.number+' / '+esc(p.category)+'</span><h3>'+esc(p.displayName)+'</h3><p>'+esc(p.summary)+(window.ProjectResources?.summary(p)||'')+'</p>'+badge(p)+'<span class="card-arrow" aria-hidden="true">↗</span></button>';}
function renderProjects(){
 shown=content.projects.filter(p=>filter==='all'||p.group===filter);
 track.innerHTML=shown.map(projectCard).join('');
 track.scrollLeft=0;currentIndex=0;
 renderIndex();updateGallery();
}
function renderIndex(){
 const q=$('#project-search').value.trim().toLowerCase();
 const result=shown.filter(p=>(p.name+' '+p.category+' '+p.summary+' '+p.stack.join(' ')+' '+p.highlights.join(' ')).toLowerCase().includes(q));
 grid.innerHTML=result.map(indexCard).join('');
 $('#search-empty').hidden=result.length>0;
 if(indexView)$('#project-count').textContent=result.length+' / '+shown.length+' PROJECTS';
}
let galleryViewport=innerWidth;
function stepSize(){const cards=$$('.project-card',track);return cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:(cards[0]?.offsetWidth||1);}
function updateGallery(){
 if(innerWidth!==galleryViewport)return;
 if(!indexView){currentIndex=clamp(Math.round(track.scrollLeft/stepSize()),0,Math.max(0,shown.length-1));$('#project-count').textContent=shown.length?pad(currentIndex+1)+' / '+pad(shown.length):'00 / 00';}
 $('#previous-project').disabled=currentIndex<=0;
 $('#next-project').disabled=currentIndex>=shown.length-1;
 $('#gallery-progress-fill').style.width=(shown.length?(currentIndex+1)/shown.length*100:0)+'%';
 window.DragonExperience?.focusProject(currentIndex,shown.length);
}
function goProject(i){
 if(!shown.length)return;
 const next=clamp(i,0,shown.length-1);
 track.scrollTo({left:next*stepSize(),behavior:reduced||paused||reading?'auto':'smooth'});
}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
 filter=b.dataset.filter;
 $$('[data-filter]').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on));});
 renderProjects();
}));
$('#project-search').addEventListener('input',renderIndex);
function setIndex(on){
 indexView=on;track.hidden=on;$('.gallery-instruction').hidden=on;$('.gallery-progress').hidden=on;$('.gallery-arrows').hidden=on;$('#work-index').hidden=!on;
 $('#view-toggle').setAttribute('aria-pressed',String(on));
 $('#view-toggle').innerHTML='<span aria-hidden="true">'+(on?'↔':'⊞')+'</span> '+(on?'Gallery view':'Index view');
 if(on)renderIndex();else{track.scrollTo({left:currentIndex*stepSize(),behavior:'instant'});updateGallery();}
}
$('#view-toggle').addEventListener('click',()=>setIndex(!indexView));
$('#previous-project').addEventListener('click',()=>goProject(currentIndex-1));
$('#next-project').addEventListener('click',()=>goProject(currentIndex+1));
track.addEventListener('scroll',updateGallery,{passive:true});
track.addEventListener('keydown',e=>{
 if(e.target!==track)return;
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goProject(currentIndex+(e.key==='ArrowRight'?1:-1));}
 if(e.key==='Home'||e.key==='End'){e.preventDefault();goProject(e.key==='Home'?0:shown.length-1);}
});
let dragging=false,startX=0,startScroll=0,dragDistance=0;
track.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='mouse'||e.button!==0)return;
 dragging=true;startX=e.clientX;startScroll=track.scrollLeft;dragDistance=0;
});
window.addEventListener('pointermove',e=>{
 if(!dragging)return;
 dragDistance=e.clientX-startX;
 if(Math.abs(dragDistance)>6){track.classList.add('dragging');track.scrollLeft=startScroll-dragDistance;}
},{passive:true});
window.addEventListener('pointerup',()=>{
 if(!dragging)return;
 dragging=false;track.classList.remove('dragging');
 if(Math.abs(dragDistance)>6)goProject(Math.round(track.scrollLeft/stepSize()));
});
track.addEventListener('click',e=>{if(Math.abs(dragDistance)>6){e.preventDefault();e.stopPropagation();dragDistance=0;}},true);
window.addEventListener('blur',()=>{dragging=false;track.classList.remove('dragging');});
track.addEventListener('pointermove',e=>{
 if(reduced||paused||reading||dragging)return;
 const card=e.target.closest('.project-card');if(!card)return;
 const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
 card.style.transform='rotateY('+(x*3).toFixed(2)+'deg) rotateX('+(-y*2).toFixed(2)+'deg)';
},{passive:true});
track.addEventListener('pointerleave',()=>$$('.project-card',track).forEach(c=>c.style.transform=''));
function openDialog(d){if(!d.open)d.showModal();body.classList.add('modal-open');d.querySelector('#detail-title')?.focus({preventScroll:true});}
function safeLink(url){return url&&/^https:\/\//.test(url)?esc(url):null;}
function projectNavigation(id){
 const list=shown.length?shown:content.projects,i=list.findIndex(p=>p.id===id);
 if(i<0)return '';
 return '<nav class="reader-navigation" aria-label="Project navigation"><button data-project-reader="'+esc(list[i-1]?.id||'')+'" '+(i===0?'disabled':'')+'>← Previous project</button><span class="mono">'+pad(i+1)+' / '+pad(list.length)+'</span><button data-project-reader="'+esc(list[i+1]?.id||'')+'" '+(i===list.length-1?'disabled':'')+'>Next project →</button></nav>';
}
function openProject(id){
 const p=content.projects.find(x=>x.id===id);if(!p)return;
 returnHash='#work';
 const links=[safeLink(p.demo_url)?'<a class="text-link" href="'+safeLink(p.demo_url)+'" target="_blank" rel="noopener">View demo ↗</a>':'',safeLink(p.repository_url)?'<a class="text-link" href="'+safeLink(p.repository_url)+'" target="_blank" rel="noopener">Source code ↗</a>':'',p.attribution&&safeLink(p.attribution.url)?'<a class="text-link" href="'+safeLink(p.attribution.url)+'" target="_blank" rel="noopener">'+esc(p.attribution.label)+' ↗</a>':''].join('');
 $('#detail-content').innerHTML='<div class="detail-visual">'+art(p)+'</div><div class="detail-kicker"><p class="eyebrow">EXPLORATION '+p.number+' / '+esc(p.category.toUpperCase())+'</p>'+badge(p)+'</div><h2 id="detail-title" tabindex="-1" class="detail-title">'+esc(p.name)+'</h2><p class="detail-summary">'+esc(p.summary)+'</p>'+(window.ProjectResources?.render(p)||'')+(window.ProjectResources?.caseStudy(p)||'')+(window.ProjectStories?.render(p,esc)||'')+'<div class="detail-section"><h3>BUILDING BLOCKS</h3><ul class="detail-highlights">'+p.highlights.map(h=>'<li>'+esc(h)+'</li>').join('')+'</ul></div>'+(p.stack.length?'<div class="detail-section"><h3>TOOLS & TECHNOLOGIES</h3><div class="tech-tags">'+p.stack.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div></div>':'')+'<p class="detail-scope">'+esc(p.scope)+'</p><div class="detail-links">'+links+'</div>'+projectNavigation(p.id)+'<p class="detail-footer">Illustration is a conceptual visual study, not a product screenshot.</p>';
 openDialog(detail);detail.scrollTop=0;
 history.replaceState(null,'','#project/'+p.id);
}
function minutes(w){return Math.max(1,Math.ceil((w.approximate_word_count||w.paragraphs.join(' ').split(/\s+/).length)/220));}
let writingFilter='all';
function technology(w){return /space|technology|computing|AI Data/i.test(w.category+' '+w.title);}
function renderWriting(){
 const list=content.writing.filter(w=>writingFilter==='all'||(writingFilter==='technology'?technology(w):!technology(w)));
 $('#essay-list').innerHTML=list.map(w=>{const n=content.writing.indexOf(w)+1;return '<button class="essay-row" data-open-essay="'+esc(w.id)+'"><span class="essay-number">'+pad(n)+'</span><span><h3>'+esc(w.title)+'</h3><span class="essay-meta">'+esc(w.category.toUpperCase())+' · '+minutes(w)+' MIN READ · DRAFT</span><span class="essay-preview">'+esc((w.paragraphs[0]||'').slice(0,155).replace(/\s+\S*$/,'')+((w.paragraphs[0]||'').length>155?'…':''))+'</span></span><span class="essay-arrow" aria-hidden="true">↗</span></button>';}).join('');
}
$$('[data-writing]').forEach(b=>b.addEventListener('click',()=>{
 writingFilter=b.dataset.writing;$$('[data-writing]').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on));});renderWriting();
}));
function openEssay(id){
 const w=content.writing.find(x=>x.id===id);if(!w)return;
 readerIndex=content.writing.indexOf(w);returnHash='#writing';
 $('#detail-content').innerHTML='<article class="reader"><p class="eyebrow">WORDS / '+pad(readerIndex+1)+' — '+esc(w.category.toUpperCase())+'</p><h2 id="detail-title" tabindex="-1" class="detail-title">'+esc(w.title)+'</h2><p class="reader-meta">JWALITH MADHYAHNAPU · '+minutes(w)+' MIN READ · ARTICLE DRAFT</p><div class="reader-body">'+w.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div><div class="reader-navigation"><button data-reader="previous" '+(readerIndex===0?'disabled':'')+'>← Previous essay</button><span class="mono">'+pad(readerIndex+1)+' / '+pad(content.writing.length)+'</span><button data-reader="next" '+(readerIndex===content.writing.length-1?'disabled':'')+'>Next essay →</button></div></article>';
 openDialog(detail);detail.scrollTop=0;history.replaceState(null,'','#essay/'+w.id);
}
document.addEventListener('click',e=>{
 const project=e.target.closest('[data-open-project]');if(project){openProject(project.dataset.openProject);return;}
 const projectReader=e.target.closest('[data-project-reader]');if(projectReader){if(projectReader.dataset.projectReader){openProject(projectReader.dataset.projectReader);requestAnimationFrame(()=>$('#detail-title').focus({preventScroll:true}));}return;}
 const essay=e.target.closest('[data-open-essay]');if(essay){openEssay(essay.dataset.openEssay);return;}
 const reader=e.target.closest('[data-reader]');if(reader){const i=readerIndex+(reader.dataset.reader==='next'?1:-1);if(content.writing[i])openEssay(content.writing[i].id);return;}
 const close=e.target.closest('[data-close]');if(close)document.getElementById(close.dataset.close).close();
});
[detail,menu].forEach(d=>{
 d.addEventListener('close',()=>{if(!detail.open&&!menu.open)body.classList.remove('modal-open');if(d===detail&&/^#(project|essay)\//.test(location.hash))history.replaceState(null,'',returnHash);scheduleFrame();});
 d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
});
$('#menu-toggle').addEventListener('click',()=>openDialog(menu));
$$('a',menu).forEach(a=>a.addEventListener('click',()=>menu.close()));
$('#copy-email').addEventListener('click',async()=>{
 try{if(!navigator.clipboard)throw Error('Clipboard unavailable');await navigator.clipboard.writeText('jwalith4418@gmail.com');$('#copy-status').textContent='EMAIL COPIED';}
 catch{$('#copy-status').textContent='SELECT THE EMAIL ADDRESS ABOVE TO COPY IT.';}
});
const opening=$('#home'), beats=$$('.hero-copy'), sceneButtons=$$('[data-scene]'), labels=['01 — THE DRAGON WARRIOR','02 — THE PRECISION','03 — THE PRACTICE','04 — THE OPEN MIND'];
const lastBeat=beats.length-1;
const pointer={x:.5,y:.5,sx:.5,sy:.5};let currentBeat=0,pos=0,raf=0,lastTime=0;
function sceneRange(){return Math.max(1,opening.offsetHeight-innerHeight);}
function sceneTo(i){if(reduced||reading){document.getElementById('work').scrollIntoView({behavior:'auto'});return;}window.scrollTo({top:opening.offsetTop+sceneRange()*.94*(i/lastBeat),behavior:paused?'auto':'smooth'});}
sceneButtons.forEach(b=>b.addEventListener('click',()=>sceneTo(Number(b.dataset.scene))));
$('#continue-journey').addEventListener('click',()=>{if(currentBeat>=lastBeat)$('#work').scrollIntoView({behavior:paused||reduced?'auto':'smooth'});else sceneTo(currentBeat+1);});
window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer.x=e.clientX/innerWidth;pointer.y=e.clientY/innerHeight;scheduleFrame();},{passive:true});
function setBeat(i){
 beats.forEach((b,k)=>{b.classList.toggle('active',k===i);b.inert=k!==i;});
 sceneButtons.forEach((b,k)=>{b.classList.toggle('active',k===i);b.setAttribute('aria-pressed',String(k===i));});
 $('#scene-label').textContent=labels[i];currentBeat=i;window.PandaExperience?.chapter(i);
}
function updateScene(now,dt){
 const disabled=reduced||reading;
 const target=disabled?0:clamp((window.scrollY-opening.offsetTop)/(sceneRange()*.94),0,1)*lastBeat;
 pos=disabled?target:paused?pos:pos+(target-pos)*(1-Math.exp(-dt*8));
 pointer.sx+=(pointer.x-pointer.sx)*(1-Math.exp(-dt*5));pointer.sy+=(pointer.y-pointer.sy)*(1-Math.exp(-dt*5));
 const chosen=clamp(Math.round(pos),0,lastBeat);if(chosen!==currentBeat||disabled)setBeat(disabled?0:chosen);
 
}
const sectionIds=['home','work','writing','about','global-exposure','contact'];
function updateNavigation(){
 $('.site-header').classList.toggle('scrolled',window.scrollY>80);
 $('.chapter-rail').classList.toggle('visible',window.scrollY>innerHeight*.8);
 let active='home';for(const id of sectionIds)if(document.getElementById(id).getBoundingClientRect().top<innerHeight*.4)active=id;
 $$('.chapter-rail a').forEach(a=>{if(a.getAttribute('href')==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 return active;
}
function resize(){if(innerWidth!==galleryViewport){galleryViewport=innerWidth;if(!indexView)track.scrollTo({left:currentIndex*stepSize(),behavior:'instant'});}updateGallery();scheduleFrame();}
function frame(now){
 raf=0;const dt=clamp((now-(lastTime||now-16))/1000,.001,.05);lastTime=now;
 updateScene(now,dt);updateNavigation();
 const target=clamp((window.scrollY-opening.offsetTop)/(sceneRange()*.94),0,1)*lastBeat;
 if(!document.hidden&&!paused&&!reading&&!reduced&&!detail.open&&!menu.open&&Math.abs(target-pos)>.001)raf=requestAnimationFrame(frame);
}
function scheduleFrame(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
window.addEventListener('scroll',scheduleFrame,{passive:true});window.addEventListener('resize',resize,{passive:true});
function applyMode(){
 body.classList.toggle('reading-mode',reading);body.classList.toggle('motion-paused',paused);body.classList.toggle('reduced-motion',reduced);
 $('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#motion-toggle').textContent=paused?'Resume motion':'Pause motion';
 $('#reading-toggle').setAttribute('aria-pressed',String(reading));$('#reading-toggle').textContent=reading?'Cinematic mode':'Reading mode';
 if(reading||reduced){setBeat(0);setIndex(true);}$$('.project-card',track).forEach(c=>c.style.transform='');scheduleFrame();
}
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;applyMode();});
$('#reading-toggle').addEventListener('click',()=>{
 const active=updateNavigation(),anchor=document.getElementById(active),top=anchor.getBoundingClientRect().top;
 if(!reading)savedIndexView=indexView;
 reading=!reading;applyMode();
 if(!reading)setIndex(savedIndexView||reduced);
 if(active!=='home')window.scrollBy({top:anchor.getBoundingClientRect().top-top,behavior:'instant'});
});
reducedQuery.addEventListener('change',e=>{reduced=e.matches;applyMode();});
let audio=null,master=null,sound=false;
$('#sound-toggle').addEventListener('click',async()=>{
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC){$('#sound-label').textContent='Sound unavailable';return;}
 try{
  if(!audio){audio=new AC();master=audio.createGain();master.gain.value=0;master.connect(audio.destination);[110,164.81,220,329.63].forEach((f,i)=>{const osc=audio.createOscillator(),g=audio.createGain();osc.type='sine';osc.frequency.value=f;g.gain.value=[.28,.16,.12,.06][i];osc.connect(g);g.connect(master);osc.start();});}
  await audio.resume();sound=!sound;master.gain.cancelScheduledValues(audio.currentTime);master.gain.setTargetAtTime(sound ? .065 : 0,audio.currentTime,.8);
  $('#sound-toggle').setAttribute('aria-pressed',String(sound));$('#sound-label').textContent=sound?'Sound on':'Sound off';body.classList.toggle('sound-on',sound);
 }catch{$('#sound-label').textContent='Sound unavailable';}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;if(audio)audio.suspend().catch(()=>{});}else{lastTime=0;scheduleFrame();if(audio&&sound)audio.resume().catch(()=>{});}});
function route(){
 const m=location.hash.match(/^#(project|essay)\/(.+)$/);if(!m)return;
 let id;try{id=decodeURIComponent(m[2]);}catch{return;}
 const section=m[1]==='project'?'work':'writing';document.getElementById(section).scrollIntoView({behavior:'instant'});
 if(m[1]==='project')openProject(id);else openEssay(id);
}
window.addEventListener('hashchange',route);
renderProjects();renderWriting();applyMode();resize();route();
})();
