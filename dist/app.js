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
const projectIntroductions={
 'cropdoctor':'Crop-health inference and voice workflows, with physics-informed irrigation reasoning.',
 'nexus':'Future scenarios, decision graphs and tamper-evident prediction records.',
 'cdis':'Career planning with skill scorecards, approved resume versions and replayable decisions.',
 'aletheia':'Offline learning with grounded retrieval, selective answers and adaptive learner models.',
 'veritas':'Engineering requirement checks with deterministic constraints and independently checkable certificates.',
 'adaptive-learning':'Learning tools that diagnose prerequisite gaps and choose teaching actions while controlling learner memory.',
 'climaverse':'A climate digital twin with spatiotemporal prediction and traceable what-if scenarios.',
 'agtech-intelligence-concept':'A cotton-farming concept focused on earlier disease warnings and actionable recommendations.',
 'attendance-tracker-pro':'An Android attendance app with teacher workflows, student dashboards and Firebase-backed records.',
 'aquagen-systems':'A coastal water-generation concept with modular hardware and a proposed monitoring platform.',
 'cognitiveos-aios':'Agent infrastructure for memory, orchestration, governance and streaming task interfaces.',
 'aquacore-hydraulic-desalination':'A desalination concept using hydraulic pressure amplification and reverse osmosis.',
 'openmythos-extension':'A research extension of the included OpenMythos codebase, covering training, evaluation and serving.',
 'timeless-animation-language':'A twelve-scene web journey with scroll-driven transitions, pointer lighting and parallax.'
};
function introduction(p){return projectIntroductions[p.id]||p.summary;}
// Explicit, unique project identities survive filtering and search reordering.
const cardHeroes=[
 {id:'ironman',name:'Iron Man',file:'ironman-cutout-optimized.webp',width:746,height:874},
 {id:'captain',name:'Captain America',file:'captain-cutout-optimized.webp',width:469,height:1165},
 {id:'spiderman',name:'Spider-Man',file:'spiderman-cutout-optimized.webp',width:751,height:558},
 {id:'strange',name:'Doctor Strange',file:'strange-optimized.webp',width:747,height:1104},
 {id:'panther',name:'Black Panther',file:'panther-optimized.webp',width:667,height:1000},
 {id:'thor',name:'Thor',file:'thor-cutout-optimized.webp',width:894,height:1174},
 {id:'hulk',name:'Hulk',file:'hulk-card-optimized.webp',width:1242,height:1643},
 {id:'antman',name:'Ant-Man',file:'antman-card-optimized.webp',width:713,height:899},
 {id:'loki',name:'Loki',file:'loki-card-optimized.webp',width:851,height:1201},
 {id:'scarletwitch',name:'Scarlet Witch',file:'scarletwitch-card-optimized.webp',width:1586,height:2113},
 {id:'vision',name:'Vision',file:'vision-card-optimized.webp',width:801,height:956},
 {id:'hawkeye',name:'Hawkeye',file:'hawkeye-card-optimized.webp',width:1600,height:4001},
 {id:'blackwidow',name:'Black Widow',file:'blackwidow-card-optimized.webp',width:1818,height:3001},
 {id:'wolverine',name:'Wolverine',file:'wolverine-card-optimized.webp',width:602,height:669}
];
const projectCharacters={
 'cropdoctor':'ironman','nexus':'captain','cdis':'spiderman','aletheia':'strange',
 'veritas':'panther','adaptive-learning':'thor','climaverse':'hulk',
 'agtech-intelligence-concept':'antman','attendance-tracker-pro':'loki',
 'aquagen-systems':'scarletwitch','cognitiveos-aios':'vision',
 'aquacore-hydraulic-desalination':'hawkeye','openmythos-extension':'blackwidow',
 'timeless-animation-language':'wolverine'
};
function cardHero(p){return cardHeroes.find(hero=>hero.id===(p.character||projectCharacters[p.id]))||cardHeroes[0];}
function heroImage(hero){return '<img src="/assets/marvel/'+hero.file+'" width="'+hero.width+'" height="'+hero.height+'" alt="" loading="lazy" decoding="async" draggable="false">';}
function characterFigure(hero){return '<figure class="project-character"><span class="project-signature" aria-hidden="true"></span>'+heroImage(hero)+'<figcaption>'+hero.name+'</figcaption></figure>';}
function badge(p){return '<span class="project-stage">'+esc(p.stage)+'</span>';}
function projectCard(p){
 const hero=cardHero(p);
 const tools=p.stack.slice(0,4).map(esc).join(' · ');
 const focus=p.highlights.slice(0,3).map(h=>'<li>'+esc(h)+'</li>').join('');
 return '<article class="project-card" data-card-hero="'+hero.id+'" data-project="'+esc(p.id)+'" data-discipline="'+esc(p.group)+'">'
  +'<div class="card-content"><div class="card-top"><span class="project-number mono">'+p.number+' / '+esc(p.category)+'</span>'+badge(p)+'</div>'
  +'<div class="project-heading"><h3>'+esc(p.displayName)+'</h3>'+characterFigure(hero)+'</div>'
  +'<div class="project-overview"><p class="card-description">'+esc(introduction(p))+'</p><ul class="project-focus" aria-label="Project features">'+focus+'</ul></div>'
  +(window.ProjectResources?.summary(p)||'')+'<div class="card-bottom">'+(tools?'<p class="card-stack"><span class="sr-only">Selected technologies: </span>'+tools+'</p>':'')
  +'<button class="open-project" data-open-project="'+esc(p.id)+'" aria-label="Read '+esc(p.displayName)+' project">Read project <span aria-hidden="true">↗</span></button></div></div></article>';
}
function indexCard(p){
 const hero=cardHero(p);
 return '<button class="index-card" data-card-hero="'+hero.id+'" data-open-project="'+esc(p.id)+'"><div class="index-visual">'+heroImage(hero)+'<span class="index-number mono">'+p.number+'</span></div>'
  +'<div class="index-heading"><span class="index-category">'+esc(p.category)+' · '+hero.name+'</span><h3>'+esc(p.displayName)+'</h3>'+badge(p)+'</div>'
  +'<p>'+esc(introduction(p))+(window.ProjectResources?.summary(p)||'')+'</p><span class="card-arrow" aria-hidden="true">↗</span></button>';
}
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
function openDialog(d){if(!d.open)d.showModal();body.classList.add('modal-open');d.querySelector('#detail-title')?.focus({preventScroll:true});}
function safeLink(url){return url&&/^https:\/\//.test(url)?esc(url):null;}
function projectNavigation(id){
 const list=shown.length?shown:content.projects,i=list.findIndex(p=>p.id===id);
 if(i<0)return '';
 return '<nav class="reader-navigation" aria-label="Project navigation"><button data-project-reader="'+esc(list[i-1]?.id||'')+'" '+(i===0?'disabled':'')+'>← Previous project</button><span class="mono">'+pad(i+1)+' / '+pad(list.length)+'</span><button data-project-reader="'+esc(list[i+1]?.id||'')+'" '+(i===list.length-1?'disabled':'')+'>Next project →</button></nav>';
}
function openProject(id){
 const p=content.projects.find(x=>x.id===id);if(!p)return;
 const hero=cardHero(p);
 const header='<header class="project-reader-header"><div><div class="detail-kicker"><p class="eyebrow">PROJECT '+p.number+' / '+esc(p.category.toUpperCase())+'</p>'+badge(p)+'</div><h2 id="detail-title" tabindex="-1" class="detail-title">'+esc(p.name)+'</h2><p class="project-hero-name">Character theme: '+hero.name+'</p></div>'+heroImage(hero)+'</header>';
 returnHash='#work';
 const links=[safeLink(p.demo_url)?'<a class="text-link" href="'+safeLink(p.demo_url)+'" target="_blank" rel="noopener">View demo ↗</a>':'',safeLink(p.repository_url)?'<a class="text-link" href="'+safeLink(p.repository_url)+'" target="_blank" rel="noopener">Source code ↗</a>':'',p.attribution&&safeLink(p.attribution.url)?'<a class="text-link" href="'+safeLink(p.attribution.url)+'" target="_blank" rel="noopener">'+esc(p.attribution.label)+' ↗</a>':''].join('');
 $('#detail-content').innerHTML='<article class="project-reader" data-card-hero="'+hero.id+'">'+header+'<p class="detail-summary">'+esc(p.summary)+'</p>'+(window.ProjectResources?.render(p)||'')+(window.ProjectResources?.caseStudy(p)||'')+(window.ProjectStories?.render(p,esc)||'')+'<div class="detail-section"><h3>BUILDING BLOCKS</h3><ul class="detail-highlights">'+p.highlights.map(h=>'<li>'+esc(h)+'</li>').join('')+'</ul></div>'+(p.stack.length?'<div class="detail-section"><h3>TOOLS & TECHNOLOGIES</h3><div class="tech-tags">'+p.stack.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div></div>':'')+'<p class="detail-scope">'+esc(p.scope)+'</p><div class="detail-links">'+links+'</div>'+projectNavigation(p.id)+'</article>';
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
const opening=$('#home'), beats=$$('.hero-copy'), sceneButtons=$$('[data-scene]'), labels=['IRON MAN / THE BUILDER'];
const lastBeat=beats.length-1;
const pointer={x:.5,y:.5,sx:.5,sy:.5};let currentBeat=0,pos=0,raf=0,lastTime=0;
function sceneRange(){return Math.max(1,opening.offsetHeight-innerHeight);}
function sceneTo(i){if(lastBeat===0||reduced||reading){document.getElementById('work').scrollIntoView({behavior:'auto'});return;}window.scrollTo({top:opening.offsetTop+sceneRange()*.94*(i/lastBeat),behavior:paused?'auto':'smooth'});}
sceneButtons.forEach(b=>b.addEventListener('click',()=>sceneTo(Number(b.dataset.scene))));
$('#continue-journey').addEventListener('click',()=>{if(currentBeat>=lastBeat)$('#work').scrollIntoView({behavior:paused||reduced?'auto':'smooth'});else sceneTo(currentBeat+1);});
window.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer.x=e.clientX/innerWidth;pointer.y=e.clientY/innerHeight;scheduleFrame();},{passive:true});
function setBeat(i){
 beats.forEach((b,k)=>{b.classList.toggle('active',k===i);b.inert=k!==i;});
 sceneButtons.forEach((b,k)=>{b.classList.toggle('active',k===i);b.setAttribute('aria-pressed',String(k===i));});
 $('#scene-label').textContent=labels[i];currentBeat=i;
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
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else{lastTime=0;scheduleFrame();}});
function route(){
 const m=location.hash.match(/^#(project|essay)\/(.+)$/);if(!m)return;
 let id;try{id=decodeURIComponent(m[2]);}catch{return;}
 const section=m[1]==='project'?'work':'writing';document.getElementById(section).scrollIntoView({behavior:'instant'});
 if(m[1]==='project')openProject(id);else openEssay(id);
}
window.addEventListener('hashchange',route);
renderProjects();renderWriting();applyMode();resize();route();
})();
