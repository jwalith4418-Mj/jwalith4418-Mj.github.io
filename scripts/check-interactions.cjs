const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const effectDraws=new Map();
let thunderStrikeDraws=0;
const decode=s=>String(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
let orientationGalleryStep=856;
class Element{
 constructor(tag,attrs={}){this.tagName=tag;this.attrs={...attrs};this.children=[];this.parentElement=null;this.listeners={};this.style={};this.value='';this.open=false;this.disabled='disabled'in attrs;this.hidden='hidden'in attrs;this.inert='inert'in attrs;this._scrollLeft=0;this._text='';this.classList={contains:c=>this.classes().includes(c),add:c=>this.setClasses([...this.classes(),c]),remove:c=>this.setClasses(this.classes().filter(x=>x!==c)),toggle:(c,v)=>{const on=v??!this.classes().includes(c);on?this.classList.add(c):this.classList.remove(c);return on;}};}
 classes(){return(this.attrs.class||'').split(/\s+/).filter(Boolean);}
 setClasses(c){this.attrs.class=[...new Set(c)].join(' ');}
 get dataset(){return Object.fromEntries(Object.entries(this.attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}
 get id(){return this.attrs.id||'';}
 get alt(){return this.attrs.alt||'';}
 focus(){doc.activeElement=this;}
 setPointerCapture(){}
 hasPointerCapture(){return false;}
 setAttribute(k,v){this.attrs[k]=String(v);}
 getAttribute(k){return this.attrs[k]??null;}
 removeAttribute(k){delete this.attrs[k];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 set textContent(s){this._text=String(s);this.children=[];}
 get innerHTML(){return this._html||this.textContent;}
 set innerHTML(s){this._html=s;this._text='';this.children=parse(s);this.children.forEach(x=>x.parentElement=this);}
 matches(selector){
  if(!selector.startsWith('[')&&selector.includes(' ')){const i=selector.lastIndexOf(' ');return this.matches(selector.slice(i+1))&&!!this.parentElement?.closest(selector.slice(0,i));}
  if(selector[0]==='#')return this.id===selector.slice(1);
  if(selector[0]==='.')return this.classes().includes(selector.slice(1));
  if(selector[0]==='['){const m=selector.match(/^\[([^=\]]+)(?:=["']?([^"'=\]]+)["']?)?\]$/);return !!m&&m[1]in this.attrs&&(m[2]===undefined||this.attrs[m[1]]===m[2]);}
  return this.tagName===selector;
 }
 closest(s){let x=this;while(x){if(x.matches(s))return x;x=x.parentElement;}return null;}
 querySelectorAll(s){const out=[];function walk(n){for(const c of n.children){if(c.matches(s))out.push(c);walk(c);}}walk(this);return out;}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 addEventListener(t,fn,opts){(this.listeners[t]??=[]).push({fn,capture:opts===true||opts?.capture});}
 dispatchEvent(e){if(e.type.startsWith('pointer')){e.clientX??=200;e.clientY??=300;}e.target??=this;e.preventDefault??=()=>e.defaultPrevented=true;e.stopPropagation??=()=>e.stopped=true;const chain=[];let n=this;while(n){chain.unshift(n);n=n.parentElement;}for(const c of chain)for(const l of c.listeners[e.type]||[])if(l.capture&&!e.stopped)l.fn(e);for(const c of chain.reverse())for(const l of c.listeners[e.type]||[])if(!l.capture&&!e.stopped)l.fn(e);return!e.defaultPrevented;}
 click(){if(!this.disabled)this.dispatchEvent({type:'click',target:this,clientX:100,clientY:100});}
 showModal(){this.open=true;}
 close(){this.open=false;this.dispatchEvent({type:'close',target:this});}
 get offsetHeight(){return this.classes().includes('hero-art')?370:800;}
 get offsetWidth(){return this.classes().includes('project-card')?830:1440;}
 get offsetLeft(){return this.parentElement?this.parentElement.children.indexOf(this)*orientationGalleryStep:0;}
 get offsetTop(){const sec=this.closest('[data-chapter]');return ({home:0,work:1000,writing:2200,about:3400,'global-exposure':4800,contact:6500}[(sec||this).id]||0)+(this.classes().includes('hero-art')?120:0);}
 get scrollLeft(){return this._scrollLeft;}
 set scrollLeft(v){this._scrollLeft=v;this.dispatchEvent({type:'scroll'});}
 scrollTo(o){this.scrollLeft=o.left??0;}
 scrollIntoView(){win.scrollY=this.offsetTop;}
 getBoundingClientRect(){return{top:this.offsetTop-win.scrollY,bottom:this.offsetTop-win.scrollY+this.offsetHeight,left:0,right:win.innerWidth,width:win.innerWidth,height:this.offsetHeight};}
 getContext(){const id=this.dataset.environment?'environment-'+this.dataset.environment:this.closest('[data-hero]')?.dataset.hero||'city';return{setTransform(){},clearRect(){},beginPath(){},arc(x,y,r){assert([x,y,r].every(Number.isFinite));},fill(){effectDraws.set(id,(effectDraws.get(id)||0)+1);},moveTo(x,y){assert([x,y].every(Number.isFinite));},lineTo(x,y){assert([x,y].every(Number.isFinite));},stroke(){effectDraws.set(id,(effectDraws.get(id)||0)+1);if(id==='environment-thor'&&this.strokeStyle==='#fff6d0')thunderStrikeDraws++;}};}
}
function parse(s){
 const fragment=new Element('fragment'),stack=[fragment],tokens=/<\/?([a-zA-Z][\w-]*)([^>]*)>/g;let m,last=0;
 while((m=tokens.exec(s))){
  const text=s.slice(last,m.index);if(text.trim()){const t=new Element('text');t._text=decode(text);t.parentElement=stack.at(-1);stack.at(-1).children.push(t);}
  last=tokens.lastIndex;
  const tag=m[1].toLowerCase();
  if(m[0].startsWith('</')){let i=stack.length-1;while(i>0&&stack[i].tagName!==tag)i--;if(i>0)stack.length=i;continue;}
  const attrs={},rx=/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;let a;
  while((a=rx.exec(m[2])))attrs[a[1]]=decode(a[2]??a[3]??a[4]??'');
  const node=new Element(tag,attrs);node.parentElement=stack.at(-1);stack.at(-1).children.push(node);
  if(!['meta','link','input','img','br','hr','source'].includes(tag)&&!m[0].endsWith('/>'))stack.push(node);
 }
 return fragment.children;
}
const doc=new Element('document');doc.children=parse(fs.readFileSync(path.join(root,'index.html'),'utf8'));doc.children.forEach(c=>c.parentElement=doc);
doc.body=doc.querySelector('body');doc.getElementById=id=>doc.querySelector('#'+id);doc.hidden=false;
const callbacks=new Map(),windowListeners={};let rid=0,t=0,clipboard='';
const location={hash:'',pathname:'/'},media={matches:false,listeners:[],addEventListener(type,f){this.listeners.push(f);},callback(e){this.listeners.forEach(f=>f(e));}};
const win={document:doc,scrollY:0,innerWidth:1440,innerHeight:800,devicePixelRatio:1,location,
 addEventListener(type,fn){(windowListeners[type]??=[]).push(fn);},scrollTo(o){this.scrollY=o.top??0;(windowListeners.scroll||[]).forEach(f=>f({}));},scrollBy(o){this.scrollTo({top:this.scrollY+o.top});},
 matchMedia:()=>media,history:{replaceState(a,b,url){location.hash=url.startsWith('#')?url:'';}},
 navigator:{clipboard:{async writeText(s){clipboard=s;}}},performance:{now:()=>t},
 requestAnimationFrame:f=>{const id=++rid;callbacks.set(id,f);return id;},cancelAnimationFrame:id=>callbacks.delete(id),
 console,Math,Error,decodeURIComponent};
win.window=win;const context=vm.createContext(win);
vm.runInContext(fs.readFileSync(path.join(root,'content.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'project-evidence.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'project-stories.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const q=s=>doc.querySelector(s),qa=s=>doc.querySelectorAll(s);
function flush(n=1){for(let i=0;i<n;i++){t+=16;const c=[...callbacks.values()];callbacks.clear();for(const f of c)f(t);}}
function close(){q('#detail-dialog').close();}
const sceneY=i=>(q('#home').offsetHeight-win.innerHeight)*.94*i/(qa('.hero-copy').length-1);
(async()=>{
 assert.equal(qa('.project-card').length,win.PORTFOLIO.projects.length);assert.equal(qa('.essay-row').length,10);
 assert.equal(q('[data-project="cropdoctor"]').dataset.cardHero,'ironman');
 assert.equal(q('[data-project="nexus"]').dataset.cardHero,'captain');
 assert.equal(q('[data-project="cdis"]').dataset.cardHero,'spiderman');
 const projectThemes=new Map(qa('.project-card').map(card=>[card.dataset.project,card.dataset.cardHero]));
 assert.equal(new Set([...projectThemes].filter(([id])=>id!=='blackbox').map(([,hero])=>hero)).size,14,'Original projects retain their distinct characters');
 const extraThemes={'climaverse':'hulk','agtech-intelligence-concept':'antman','attendance-tracker-pro':'loki','aquagen-systems':'scarletwitch','cognitiveos-aios':'vision','aquacore-hydraulic-desalination':'hawkeye','openmythos-extension':'blackwidow','timeless-animation-language':'wolverine'};
 for(const [project,hero] of Object.entries(extraThemes))assert.equal(projectThemes.get(project),hero);
 for(const card of qa('.project-card'))assert(card.querySelector('.project-character').querySelector('img').getAttribute('src').startsWith('/assets/marvel/'));
 assert.equal(q('#previous-project').disabled,true);
 q('#next-project').click();assert.equal(q('#project-count').textContent,'02 / '+String(win.PORTFOLIO.projects.length).padStart(2,'0'));
 q('[data-filter="concept"]').click();assert.equal(qa('.project-card').length,3);assert.equal(q('#project-count').textContent,'01 / 03');
 for(const card of qa('.project-card'))assert.equal(card.dataset.cardHero,projectThemes.get(card.dataset.project),'Project keeps its hero when filtering');
 q('[data-filter="all"]').click();
 const data=win.PORTFOLIO;
 for(const p of data.projects){q('[data-open-project="'+p.id+'"]').click();assert(q('#detail-dialog').open);assert.equal(q('#detail-title').textContent,p.name);assert(q('#detail-content').textContent.includes(p.scope));assert(q('.case-question'));assert(q('.case-evidence').textContent.includes(win.ProjectStories.stories[p.id].evidence));assert.equal(q('.case-validation').querySelectorAll('li').length,2);if(['cropdoctor','nexus','veritas'].includes(p.id)){assert(q('.project-evidence'));assert(q('.evidence-lab'));assert(q('.evidence-limit'));}assert.equal(q('.project-reader').dataset.cardHero,projectThemes.get(p.id));assert.equal(qa('.detail-highlights')[0].querySelectorAll('li').length,p.highlights.length);if(p.id==='openmythos-extension')assert(q('#detail-content').textContent.includes('Kye Gomez'));close();}
 q('#view-toggle').click();assert(q('#project-track').hidden);assert(!q('#work-index').hidden);assert.equal(qa('.index-card').length,win.PORTFOLIO.projects.length);
 assert.equal(new Set(qa('.index-card').filter(card=>card.dataset.openProject!=='blackbox').map(card=>card.dataset.cardHero)).size,14,'Original index characters retain their identities');
 q('#project-search').value='PyTorch';q('#project-search').dispatchEvent({type:'input'});assert.equal(qa('.index-card').length,2);
 for(const card of qa('.index-card'))assert.equal(card.dataset.cardHero,projectThemes.get(card.dataset.openProject),'Project keeps its hero in search results');
 q('#project-search').value='no-match-xyz';q('#project-search').dispatchEvent({type:'input'});assert(!q('#search-empty').hidden);
 q('#project-search').value='';q('#project-search').dispatchEvent({type:'input'});
 q('#view-toggle').click();assert(!q('#project-track').hidden);
 for(const w of data.writing){q('[data-open-essay="'+w.id+'"]').click();assert.equal(q('#detail-title').textContent,w.title);assert.equal(q('.reader-body').querySelectorAll('p').length,w.paragraphs.length);for(const p of w.paragraphs)assert(q('.reader-body').textContent.includes(p));close();}
 q('[data-writing="technology"]').click();assert.equal(qa('.essay-row').length,1);
 q('[data-writing="campus"]').click();assert.equal(qa('.essay-row').length,9);
 q('[data-writing="all"]').click();
 q('[data-open-essay="'+data.writing[0].id+'"]').click();assert(q('[data-reader="previous"]').disabled);q('[data-reader="next"]').click();assert.equal(q('#detail-title').textContent,data.writing[1].title);q('[data-reader="previous"]').click();assert.equal(q('#detail-title').textContent,data.writing[0].title);close();
 q('#menu-toggle').click();assert(q('#menu-dialog').open);q('#menu-dialog').querySelectorAll('a')[0].click();assert(!q('#menu-dialog').open);assert(!doc.body.classList.contains('modal-open'));
 q('#motion-toggle').click();flush();assert(doc.body.classList.contains('motion-paused'));assert.equal(q('#motion-toggle').textContent,'Resume motion');q('#motion-toggle').click();
 q('#reading-toggle').click();flush();assert(doc.body.classList.contains('reading-mode'));assert(q('#project-track').hidden);assert.equal(qa('.hero-copy')[0].inert,false);q('#reading-toggle').click();assert(!doc.body.classList.contains('reading-mode'));
 media.matches=true;media.callback({matches:true});flush();assert(doc.body.classList.contains('reduced-motion'));assert(qa('.hero-copy')[0].classList.contains('active'));assert.equal(qa('.hero-copy')[0].inert,false);
 q('#copy-email').click();await new Promise(resolve=>setImmediate(resolve));assert.equal(clipboard,'jwalith4418@gmail.com');assert.equal(q('#copy-status').textContent,'EMAIL COPIED');
 location.hash='#project/nexus';(windowListeners.hashchange||[]).forEach(f=>f());assert(q('#detail-dialog').open);assert.equal(q('#detail-title').textContent,'NEXUS');close();

 media.matches=false;media.callback({matches:false});
 const observers=[];
 win.MutationObserver=class{constructor(f){observers.push(f);}observe(){}};
 const observe=()=>observers.forEach(f=>f());
 vm.runInContext(fs.readFileSync(path.join(root,'learning.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(root,'hero-effects.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'figure-rig.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'character-motion.js'),'utf8'),context);
 const motionCalls=new Map(),characterMotion=win.CharacterMotion;
 win.CharacterMotion={pose(id,input){motionCalls.set(id,{...input});return characterMotion.pose(id,input);}};
 vm.runInContext(fs.readFileSync(path.join(root,'hero-audio.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(root,'chapter-environments.js'),'utf8'),context);
 assert.equal(win.HeroAudio.enabled,false);
 vm.runInContext(fs.readFileSync(path.join(root,'marvel.js'),'utf8'),context);
 const ids=['ironman','spiderman','strange','panther','thor','captain'];
 assert.equal(qa('[data-hero]').length,6);assert.equal(qa('[data-chapter]').length,6);
 for(const index of [0,1,2,3,4,5,4,3,2,1,0]){
   const id=ids[index],hero=q('[data-hero="'+id+'"]');
   win.scrollTo({top:hero.closest('[data-chapter]').offsetTop});flush(100);
   assert.equal(win.MarvelExperience.activeHero,id);
   assert.equal(doc.body.getAttribute('data-active-hero'),id);
   assert.equal(q('[data-hero-link="'+id+'"]').getAttribute('aria-current'),'location');
   assert.equal(hero.querySelector('img').style.opacity,'1');
   hero.click();flush(3);assert(hero.closest('.hero-art').classList.contains('powered'));
   assert(q('#hero-status').textContent.includes(hero.querySelector('img').alt.toUpperCase()));
   const before=hero.querySelector('img').style.transform;
   hero.dispatchEvent({type:'keydown',key:'ArrowRight'});flush(30);
   assert.notEqual(hero.querySelector('img').style.transform,before);
   hero.dispatchEvent({type:'keydown',key:'Home'});flush(80);
   hero.dispatchEvent({type:'pointerdown',pointerId:11,clientX:200,button:0});
   hero.dispatchEvent({type:'pointermove',pointerId:11,clientX:260});
   hero.dispatchEvent({type:'pointerup',pointerId:11});flush(30);
   assert(!hero.classList.contains('dragging'));
   assert(!hero.closest('.hero-art').classList.contains('powered'));
   hero.dispatchEvent({type:'click',detail:1});flush(3);
   assert(!hero.closest('.hero-art').classList.contains('powered')); // Drag release must not fire a power.
   hero.dispatchEvent({type:'click',detail:0});flush(3); // Keyboard activation stays available.
   assert(hero.closest('.hero-art').classList.contains('powered'));
 }
 for(const id of ids){assert(effectDraws.get(id)>0,'Local power canvas draws for '+id);assert(effectDraws.get('environment-'+id)>0,'Full chapter environment draws for '+id);}
 win.scrollTo({top:4800});flush(200);
 const ambientThunder=thunderStrikeDraws;flush(50);assert.equal(thunderStrikeDraws,ambientThunder,'No automatic lightning in the ambient state');
 q('[data-hero="thor"]').click();flush(12);assert.equal(thunderStrikeDraws,ambientThunder,'Hammer charges before the strike');
 flush(30);assert(thunderStrikeDraws>ambientThunder,'Lightning occurs during the strike phase');
 flush(90);const afterStrike=thunderStrikeDraws;flush(40);assert.equal(thunderStrikeDraws,afterStrike,'Lightning finishes after one bounded strike');
 win.scrollTo({top:1000});flush(5);
 assert.equal(qa('[data-environment]').length,6);
 const field=q('[data-environment="spiderman"]');assert.equal(field.width,1440);assert.equal(field.height,800);
 win.innerWidth=375;win.devicePixelRatio=3;(windowListeners.resize||[]).forEach(f=>f());flush(4);assert.equal(field.width,469);assert.equal(field.height,1000);
 win.innerWidth=1440;win.devicePixelRatio=1;(windowListeners.resize||[]).forEach(f=>f());flush(4);
 const beforeWeb=effectDraws.get('environment-spiderman');q('#web-pulse').click();flush(10);assert(effectDraws.get('environment-spiderman')>beforeWeb);
 q('.project-card').dispatchEvent({type:'pointermove',clientX:400,clientY:400});flush(10);
 q('#motion-toggle').click();observe();flush(3);assert(q('#web-pulse').disabled);
 const frozenWeb=effectDraws.get('environment-spiderman');flush(20);assert.equal(effectDraws.get('environment-spiderman'),frozenWeb);
 q('#motion-toggle').click();observe();flush(10);assert(!q('#web-pulse').disabled);assert(effectDraws.get('environment-spiderman')>frozenWeb);
 win.scrollTo({top:0});flush(3);assert.equal(field.width,1,'Offscreen environment buffer released');
 const first=q('[data-hero="ironman"]'), image=first.querySelector('img');
 first.dispatchEvent({type:'pointerenter',pointerType:'mouse'});flush(30);assert(motionCalls.get('ironman').attention>.9,'Hover intensifies a visible character');
 first.dispatchEvent({type:'pointerleave'});flush(45);assert(motionCalls.get('ironman').attention<.02,'Hover settles after leaving');
 first.dispatchEvent({type:'pointerenter',pointerType:'touch'});flush(15);assert(motionCalls.get('ironman').attention<.02,'Touch does not leave a sticky hover');
 first.dispatchEvent({type:'focus'});flush(30);assert(motionCalls.get('ironman').attention>.9,'Keyboard focus also intensifies the character');first.dispatchEvent({type:'blur'});flush(45);
 (windowListeners.pointermove||[]).forEach(f=>f({clientX:1200,clientY:700,pointerType:'mouse'}));flush(40);assert(motionCalls.get('ironman').pointerY>.5,'Vertical pointer movement reaches the choreography');
 const stableTransform=image.style.transform;first.dispatchEvent({type:'pointerdown',pointerId:90,clientX:200,button:0});first.dispatchEvent({type:'pointermove',pointerId:90,clientX:340});flush(10);assert.notEqual(image.style.transform,stableTransform);first.dispatchEvent({type:'pointerup',pointerId:90});flush(80);assert(!first.classList.contains('dragging'));assert.equal(first.querySelector('.hero-effects').style.transform,image.style.transform,'Power layers stay attached during movement');
 q('#motion-toggle').click();observe();flush(2);const frozen=image.style.transform;
 flush(20);assert.equal(image.style.transform,frozen);
 first.click();assert.equal(first.getAttribute('aria-disabled'),'true');
 q('#motion-toggle').click();observe();flush(4);assert.equal(first.getAttribute('aria-disabled'),'false');
 doc.hidden=true;doc.dispatchEvent({type:'visibilitychange'});const hidden=image.style.transform;
 flush(20);assert.equal(image.style.transform,hidden);
 doc.hidden=false;doc.dispatchEvent({type:'visibilitychange'});flush(4);
 q('#reading-toggle').click();observe();flush(4);assert.equal(first.getAttribute('aria-disabled'),'true');
 assert.equal(image.style.opacity,'1');const reading=image.style.transform;flush(20);assert.equal(image.style.transform,reading);
 q('#reading-toggle').click();observe();flush(4);
 media.matches=true;media.callback({matches:true});observe();flush(4);
 assert.equal(first.getAttribute('aria-disabled'),'true');assert.equal(image.style.opacity,'1');
 media.matches=false;media.callback({matches:false});observe();flush(4);
 q('#art-credits').click();observe();flush(3);assert(q('#credits-dialog').open);
 const modal=image.style.transform;flush(20);assert.equal(image.style.transform,modal);
 q('#credits-dialog').close();observe();flush(3);assert(!doc.body.classList.contains('modal-open'));
 win.scrollTo({top:6500});flush(10);q('#replay-reveals').click();assert.equal(win.scrollY,0);flush(100);assert.equal(win.MarvelExperience.activeHero,'ironman');
 q('#continue-journey').click();assert.equal(win.scrollY,1000);flush(100);assert.equal(win.MarvelExperience.activeHero,'spiderman');
 // Leaving and returning replays that chapter's entry rather than permanently hiding it.
 const spider=q('[data-hero="spiderman"]');
 win.scrollTo({top:3400});flush(5);win.scrollTo({top:1000});flush(1);
 assert(Number(spider.querySelector('img').style.opacity)<1);flush(100);assert.equal(spider.querySelector('img').style.opacity,'1');
 // Boundary jitter must not repeatedly switch the active character.
 win.scrollTo({top:0});flush(100);
 win.scrollTo({top:650});flush(1);assert.equal(win.MarvelExperience.activeHero,'spiderman');
 for(const y of [612,628,610,645,620]){
   win.scrollTo({top:y});flush(1);assert.equal(win.MarvelExperience.activeHero,'spiderman');
 }
 win.scrollTo({top:575});flush(1);assert.equal(win.MarvelExperience.activeHero,'ironman');
 win.scrollTo({top:1000});flush(100);
 const silkImage=spider.querySelector('img');let lastOpacity=1;
 for(const y of [1350,1360,1370,1380,1390,1400,1410,1420,1430,1440,1450,1460,1470,1480,1490,1500]){
   win.scrollTo({top:y});flush(2);
   const opacity=Number(silkImage.style.opacity);
   assert(opacity<=lastOpacity,'Exit fades monotonically');
   assert(Math.abs(opacity-lastOpacity)<.12,'Small scrolling steps cannot abruptly hide a hero');
   assert.equal(spider.querySelector('.hero-effects').style.opacity,silkImage.style.opacity);
   lastOpacity=opacity;
 }
 win.scrollTo({top:1000});flush(1);
 assert.equal(silkImage.style.opacity,'1','Short edge crossings retain the completed reveal');
 q('[data-hero-link="spiderman"]').dispatchEvent({type:'focus'});
 assert.equal(silkImage.loading,'eager','Keyboard shortcut focus prepares destination artwork');
 const currentScroll=win.scrollY;
 q('[data-hero-link="thor"]').dispatchEvent({type:'pointerenter'});
 assert.equal(q('[data-hero="thor"]').querySelector('img').loading,'eager');
 assert.equal(win.scrollY,currentScroll,'Preparing an image does not move the page');
 assert.equal(qa('[data-learning-record]').length,8);
 for(const [kind,total] of [['program',2],['certification',4],['experience',2]]){
   q('[data-learning-filter="'+kind+'"]').click();
   assert.equal(q('[data-learning-filter="'+kind+'"]').getAttribute('aria-pressed'),'true');
   for(const group of qa('[data-learning-group]'))assert.equal(group.hidden,group.dataset.learningGroup!==kind);
   assert(q('#learning-count').textContent.startsWith(String(total)+' '));
 }
 q('[data-learning-filter="all"]').click();assert(qa('[data-learning-group]').every(g=>!g.hidden));
 assert.equal(q('#learning-count').textContent,'8 learning & experience records');
 q('#city-world').getContext=()=>null;
 for(const canvas of qa('.hero-effects'))canvas.getContext=()=>null;
 for(const canvas of qa('[data-environment]'))canvas.getContext=()=>null;
 vm.runInContext(fs.readFileSync(path.join(root,'chapter-environments.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(root,'marvel.js'),'utf8'),context);flush(4);
 assert(q('#city-world').hidden);assert(qa('.hero-effects').every(c=>c.hidden));assert(qa('[data-environment]').every(c=>c.hidden));assert.equal(qa('[data-hero]').length,6);
 // Resizing the viewport or rotating while in the index keeps the selected card.
 if(q('#project-track').hidden)q('#view-toggle').click();q('[data-filter="all"]').click();
 for(let i=0;i<4;i++)q('#next-project').click();assert(q('#project-count').textContent.startsWith('05 /'));
 orientationGalleryStep=356;win.innerWidth=390;(windowListeners.resize||[]).forEach(f=>f());flush(2);assert.equal(q('#project-track').scrollLeft,4*356);assert(q('#project-count').textContent.startsWith('05 /'));
 q('#view-toggle').click();orientationGalleryStep=730;win.innerWidth=844;(windowListeners.resize||[]).forEach(f=>f());flush(2);q('#view-toggle').click();assert.equal(q('#project-track').scrollLeft,4*730);assert(q('#project-count').textContent.startsWith('05 /'),'Index return preserves project after orientation change');
 console.log('PASS: 17 project readers; 10 complete articles; gallery/filter/search controls; menu; clipboard; deep links; eight global exposure records and category filters.');
 console.log('PASS: six heroes in forward/reverse section order; repeated powers; keyboard and pointer drag; drag-click suppression; viewport re-entry; replay; pause/resume; visibility suspension; modal suspension; reading/reduced motion; canvas-unavailable fallback.');
 console.log('PASS: stronger mouse hover and keyboard focus, touch hover suppression, vertical pointer tracking, drag release and matching figure/effect transforms.');
 console.log('PASS: six section-wide environments, finite mesh coordinates, full viewport buffers, web pulse and project hover, pause/resume, offscreen buffer release and canvas failure fallback.');
 console.log('PASS: Thor has no automatic lightning, charges before strike, then finishes the bounded lightning phase.');
 console.log('PASS: chapter-boundary jitter, monotonic viewport fade, aligned effect opacity, edge re-entry without reveal reset, keyboard/pointer artwork preparation without navigation.');
 console.log('DOM harness mocks browser geometry, animation frames and canvas. It does not verify pixels, live layout, touch, sound or device FPS.');
})().catch(e=>{console.error(e);process.exitCode=1;});
