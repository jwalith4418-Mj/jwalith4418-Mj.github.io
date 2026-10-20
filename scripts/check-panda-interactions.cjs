const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'../dist/panda');
const decode=s=>String(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
let orientationGalleryStep=856;
class Element{
 constructor(tag,attrs={}){this.tagName=tag;this.attrs={...attrs};this.children=[];this.parentElement=null;this.listeners={};this.style={};this.value='';this.open=false;this.disabled='disabled'in attrs;this.hidden='hidden'in attrs;this.inert='inert'in attrs;this._scrollLeft=0;this._text='';this.classList={contains:c=>this.classes().includes(c),add:c=>this.setClasses([...this.classes(),c]),remove:c=>this.setClasses(this.classes().filter(x=>x!==c)),toggle:(c,v)=>{const on=v??!this.classes().includes(c);on?this.classList.add(c):this.classList.remove(c);return on;}};}
 classes(){return(this.attrs.class||'').split(/\s+/).filter(Boolean);}
 setClasses(c){this.attrs.class=[...new Set(c)].join(' ');}
 get dataset(){return Object.fromEntries(Object.entries(this.attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}
 focus(){doc.activeElement=this;}
 get id(){return this.attrs.id||'';}
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
 dispatchEvent(e){e.target??=this;e.preventDefault??=()=>e.defaultPrevented=true;e.stopPropagation??=()=>e.stopped=true;const chain=[];let n=this;while(n){chain.unshift(n);n=n.parentElement;}for(const c of chain)for(const l of c.listeners[e.type]||[])if(l.capture&&!e.stopped)l.fn(e);for(const c of chain.reverse())for(const l of c.listeners[e.type]||[])if(!l.capture&&!e.stopped)l.fn(e);return!e.defaultPrevented;}
 click(){if(!this.disabled)this.dispatchEvent({type:'click',target:this,clientX:100,clientY:100});}
 showModal(){this.open=true;}
 close(){this.open=false;this.dispatchEvent({type:'close',target:this});}
 get offsetHeight(){if(this.id==='home')return doc.body.classList.contains('reading-mode')||doc.body.classList.contains('reduced-motion')?800:2400;return 800;}
 get offsetWidth(){return this.classes().includes('project-card')?830:1440;}
 get offsetLeft(){return this.parentElement?this.parentElement.children.indexOf(this)*orientationGalleryStep:0;}
 get offsetTop(){return this.id==='home'?0:({work:2400,writing:4500,about:6400,'global-exposure':7600,contact:9000}[this.id]||0);}
 get scrollLeft(){return this._scrollLeft;}
 set scrollLeft(v){this._scrollLeft=v;this.dispatchEvent({type:'scroll'});}
 scrollTo(o){this.scrollLeft=o.left??0;}
 scrollIntoView(){win.scrollY=this.offsetTop;}
 getBoundingClientRect(){return{top:this.offsetTop-win.scrollY,bottom:this.offsetTop-win.scrollY+this.offsetHeight,left:0,right:1440,width:1440,height:this.offsetHeight};}
 getContext(){return{setTransform(){},clearRect(){},beginPath(){},arc(){},fill(){}};}
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
const location={hash:'',pathname:'/'},media={matches:false,addEventListener(type,f){this.callback=f;}};
const win={document:doc,scrollY:0,innerWidth:1440,innerHeight:800,devicePixelRatio:1,location,
 addEventListener(type,fn){(windowListeners[type]??=[]).push(fn);},scrollTo(o){this.scrollY=o.top??0;(windowListeners.scroll||[]).forEach(f=>f({}));},scrollBy(o){this.scrollTo({top:this.scrollY+o.top});},
 matchMedia:()=>media,history:{replaceState(a,b,url){location.hash=url.startsWith('#')?url:'';}},
 navigator:{clipboard:{async writeText(s){clipboard=s;}}},performance:{now:()=>t},
 requestAnimationFrame:f=>{const id=++rid;callbacks.set(id,f);return id;},cancelAnimationFrame:id=>callbacks.delete(id),
 console,Math,Error,decodeURIComponent};
win.window=win;const context=vm.createContext(win);
vm.runInContext(fs.readFileSync(path.join(root,'../content.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'../project-evidence.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'../project-stories.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const q=s=>doc.querySelector(s),qa=s=>doc.querySelectorAll(s);
function flush(n=1){for(let i=0;i<n;i++){t+=16;const c=[...callbacks.values()];callbacks.clear();for(const f of c)f(t);}}
function close(){q('#detail-dialog').close();}
const sceneY=i=>(q('#home').offsetHeight-win.innerHeight)*.94*i/(qa('.hero-copy').length-1);
(async()=>{
 assert.equal(qa('.project-card').length,win.PORTFOLIO.projects.length);assert.equal(qa('.essay-row').length,10);
 assert.equal(q('#previous-project').disabled,true);
 q('#next-project').click();assert.equal(q('#project-count').textContent,'02 / '+String(win.PORTFOLIO.projects.length).padStart(2,'0'));
 q('[data-filter="concept"]').click();assert.equal(qa('.project-card').length,3);assert.equal(q('#project-count').textContent,'01 / 03');
 q('[data-filter="all"]').click();
 const data=win.PORTFOLIO;
 for(const p of data.projects){q('[data-open-project="'+p.id+'"]').click();assert(q('#detail-dialog').open);assert.equal(q('#detail-title').textContent,p.name);assert(q('#detail-content').textContent.includes(p.scope));assert(q('.case-question'));assert(q('.case-evidence').textContent.includes(win.ProjectStories.stories[p.id].evidence));assert.equal(q('.case-validation').querySelectorAll('li').length,2);if(['cropdoctor','nexus','veritas'].includes(p.id)){assert(q('.project-evidence'));assert(q('.evidence-lab'));assert(q('.evidence-limit'));}assert.equal(qa('.detail-highlights')[0].querySelectorAll('li').length,p.highlights.length);if(p.id==='openmythos-extension')assert(q('#detail-content').textContent.includes('Kye Gomez'));close();}
 q('#view-toggle').click();assert(q('#project-track').hidden);assert(!q('#work-index').hidden);assert.equal(qa('.index-card').length,win.PORTFOLIO.projects.length);
 q('#project-search').value='PyTorch';q('#project-search').dispatchEvent({type:'input'});assert.equal(qa('.index-card').length,2);
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
 win.scrollTo({top:sceneY(1)});flush(80);assert(qa('.hero-copy')[1].classList.contains('active'));assert.equal(qa('.hero-copy')[1].inert,false);assert(qa('.hero-copy')[0].inert);
 q('[data-scene="2"]').click();flush(80);assert(qa('.hero-copy')[2].classList.contains('active'));
 media.matches=true;media.callback({matches:true});flush();assert(doc.body.classList.contains('reduced-motion'));assert(qa('.hero-copy')[0].classList.contains('active'));assert.equal(qa('.hero-copy')[0].inert,false);
 q('#copy-email').click();await new Promise(resolve=>setImmediate(resolve));assert.equal(clipboard,'jwalith4418@gmail.com');assert.equal(q('#copy-status').textContent,'EMAIL COPIED');
 location.hash='#project/nexus';(windowListeners.hashchange||[]).forEach(f=>f());assert(q('#detail-dialog').open);assert.equal(q('#detail-title').textContent,'NEXUS');close();
 // Exercise the real dragon runtime with mocked GL calls; this harness does not compile actual GLSL.
 media.matches=false;media.callback({matches:false});win.scrollTo({top:0});
 doc.documentElement=doc.querySelector('html');doc.documentElement.scrollHeight=9000;
 const nativeGeometry=require('../dist/panda/dragon-geometry.js');let pose,buildCount=0;
 win.DragonGeometry={build(o){pose={...o};buildCount++;return nativeGeometry.build(o);}};
 const draws=[],uniforms={};let programs=0,observer;
 const gl={COMPILE_STATUS:1,LINK_STATUS:2,ARRAY_BUFFER:3,STATIC_DRAW:4,DYNAMIC_DRAW:5,TRIANGLES:6,POINTS:7,FLOAT:8,DEPTH_TEST:9,BLEND:10,DEPTH_BUFFER_BIT:11,
 createProgram:()=>++programs,createShader:()=>({}),shaderSource(){},compileShader(){},getShaderParameter:()=>true,attachShader(){},deleteShader(){},linkProgram(){},getProgramParameter:()=>true,
 getUniformLocation:(p,n)=>p+':'+n,getAttribLocation:(p,n)=>({aPosition:0,aNormal:1,aColor:p===1?2:1,aGlow:3,aSize:2}[n]),createBuffer:()=>({}),bindBuffer(){},bufferData(t,data){assert([...data].every(Number.isFinite));},viewport(){},disable(){},enable(){},useProgram(){},disableVertexAttribArray(){},enableVertexAttribArray(){},vertexAttribPointer(){},uniform2f(n,x,y){uniforms[n]=[x,y];},uniform1f(n,x){uniforms[n]=x;},uniformMatrix4fv(n,t,m){assert([...m].every(Number.isFinite));},drawArrays(mode,start,count){draws.push({mode,count});},clear(){},blendFunc(){},depthMask(){}};
 q('#dragon-world').getContext=()=>gl;q('#dragon-control').setPointerCapture=()=>{};
 win.MutationObserver=class{constructor(f){observer=f;}observe(){}};win.setTimeout=()=>0;
 vm.runInContext(fs.readFileSync(path.join(root,'dragon.js'),'utf8'),context);
 flush(280);assert(buildCount>10);assert.equal(pose.progress,0);assert.equal(pose.entry,1);assert(draws.some(x=>x.mode===gl.TRIANGLES&&x.count>10000));assert(draws.some(x=>x.mode===gl.POINTS&&x.count===540));
 const initialYaw=pose.yaw;win.scrollTo({top:5000});flush(30);assert(pose.progress>.3);
 q('#dragon-control').dispatchEvent({type:'pointerdown',clientX:900,pointerId:1,button:0});q('#dragon-control').dispatchEvent({type:'pointermove',clientX:1100});q('#dragon-control').dispatchEvent({type:'pointerup'});flush(30);assert(pose.yaw>initialYaw+.2);
 q('#dragon-wake').click();flush(3);assert(pose.pulse>.9);assert(q('#dragon-wake').classList.contains('ignited'));
 const beforeOrbit=pose.yaw;win.DragonExperience.focusProject(4);flush(35);assert(pose.yaw>beforeOrbit+.5);
 q('#motion-toggle').click();observer();flush(2);const stopped=buildCount;flush(8);assert.equal(buildCount,stopped);assert(q('#dragon-wake').disabled);
 q('#motion-toggle').click();observer();flush(3);assert(buildCount>stopped);
 doc.hidden=true;doc.dispatchEvent({type:'visibilitychange'});const hiddenCount=buildCount;flush(8);assert.equal(buildCount,hiddenCount);doc.hidden=false;doc.dispatchEvent({type:'visibilitychange'});flush(3);assert(buildCount>hiddenCount);
 q('#reading-toggle').click();observer();const readCount=buildCount;flush(8);assert.equal(buildCount,readCount);assert(q('#dragon-wake').disabled);q('#reading-toggle').click();observer();flush(3);
 q('#dragon-world').dispatchEvent({type:'webglcontextlost'});assert(!q('#dragon-fallback').hidden);assert(q('#dragon-wake').disabled);const lostCount=buildCount;flush(8);assert.equal(buildCount,lostCount);
 q('#dragon-world').getContext=()=>null;vm.runInContext(fs.readFileSync(path.join(root,'dragon.js'),'utf8'),context);assert(q('#dragon-world').hidden);assert(!q('#dragon-fallback').hidden);assert(doc.body.classList.contains('dragon-unavailable'));
 // Character guides use the existing content controls and have independent animation lifecycle.
vm.runInContext(fs.readFileSync(path.join(root,'../figure-rig.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'../character-motion.js'),'utf8'),context);
 const chiCalls={draw:0,release:0,character:'',power:0};
 q('#panda-chi-effects').getContext=()=>({setTransform(){},clearRect(){},beginPath(){},arc(){},fill(){},stroke(){},lineTo(){},moveTo(){}});
 vm.runInContext(fs.readFileSync(path.join(root,'chi-effects.js'),'utf8'),context);
 const chiEffects=win.PandaChiEffects;win.PandaChiEffects={create(canvas){const real=chiEffects.create(canvas);return{...real,draw(input){chiCalls.draw++;chiCalls.character=input.character;chiCalls.power=input.power;real.draw(input);},release(){chiCalls.release++;real.release();}};}};
 let lastMotion;const characterMotion=win.CharacterMotion;win.CharacterMotion={pose(id,input){lastMotion={id,...input};return characterMotion.pose(id,input);}};
 vm.runInContext(fs.readFileSync(path.join(root,'kungfu.js'),'utf8'),context);
 const initialChapter=Number(qa('.hero-copy').find(b=>b.classList.contains('active')).dataset.beat);
 assert.equal(q('#guide-name').textContent,['PO','TIGRESS','SHIFU','OOGWAY'][initialChapter]);
 // All four guides must appear in order, even after a manual selection.
 assert.equal(qa('.hero-copy').length,4);assert.equal(qa('[data-scene]').length,4);
 win.scrollTo({top:0});flush(100);
 // Mobile scroll follows the same four chapters as desktop, in both directions.
 for(const [width,height] of [[432,692],[320,568],[844,390]]){
  win.innerWidth=width;win.innerHeight=height;(windowListeners.resize||[]).forEach(f=>f());win.scrollTo({top:0});flush(100);
  q('[data-guide="po"]').click();const count=qa('.project-card').length;
  for(const i of [1,2,3,2,1,0]){
   win.scrollTo({top:sceneY(i)});flush(100);
   assert.equal(q('#guide-name').textContent,['PO','TIGRESS','SHIFU','OOGWAY'][i],`Scroll chapter ${i} at ${width} × ${height}`);
   assert.equal(chiCalls.character,['po','tigress','shifu','oogway'][i]);
   assert(qa('.hero-copy')[i].classList.contains('active'));assert.equal(qa('.project-card').length,count);
  }
  q('[data-scene="1"]').click();assert(win.scrollY>0);flush(100);assert.equal(q('#guide-name').textContent,'TIGRESS');
  q('#continue-journey').click();flush(100);assert.equal(q('#guide-name').textContent,'SHIFU');
  q('#continue-journey').click();flush(100);assert.equal(q('#guide-name').textContent,'OOGWAY');
  q('#continue-journey').click();assert.equal(win.scrollY,2400);
  win.scrollTo({top:0});flush(100);
 }
 win.innerWidth=1440;win.innerHeight=800;(windowListeners.resize||[]).forEach(f=>f());win.scrollTo({top:0});flush(100);
 q('[data-guide="oogway"]').click();assert.equal(q('#guide-name').textContent,'OOGWAY');
 const chapterNames=['PO','TIGRESS','SHIFU','OOGWAY'];
 for(const i of [1,2,3,2,1,0]){
  win.scrollTo({top:sceneY(i)});flush(100);
  assert.equal(q('#guide-name').textContent,chapterNames[i]);
  assert(q('#hero-character').src.endsWith('/'+chapterNames[i].toLowerCase()+'-original-optimized.webp'));
  assert.equal(q('[data-guide="'+chapterNames[i].toLowerCase()+'"]').getAttribute('aria-pressed'),'true');
  assert(qa('.hero-copy')[i].classList.contains('active'));
 }
 q('[data-guide="tigress"]').click();flush(20);assert.equal(q('#guide-name').textContent,'TIGRESS');
 for(const i of [3,2,1,0]){q('[data-scene="'+i+'"]').click();flush(100);assert.equal(q('#guide-name').textContent,chapterNames[i]);}
 for(const i of [1,2,3]){q('#continue-journey').click();flush(100);assert.equal(q('#guide-name').textContent,chapterNames[i]);}
 q('#continue-journey').click();assert.equal(win.scrollY,2400);
 q('[data-scene="2"]').click();flush(100);
 q('[data-guide="tigress"]').click();win.PandaExperience.chapter(2);assert.equal(q('#guide-name').textContent,'TIGRESS');
 q('#dragon-control').dispatchEvent({type:'pointerdown',clientX:900,pointerId:9,button:0});
 win.PandaExperience.chapter(3);assert.equal(q('#guide-name').textContent,'TIGRESS');
 q('#dragon-control').dispatchEvent({type:'pointerup'});assert.equal(q('#guide-name').textContent,'OOGWAY');
 assert.equal(qa('.project-card').length,3); // Scene changes preserve the selected project filter.
 q('[data-guide="tigress"]').click();assert.equal(qa('.project-card').length,3);assert(q('#hero-character').src.endsWith('/tigress-original-optimized.webp'));assert.equal(q('#guide-name').textContent,'TIGRESS');assert.equal(q('[data-guide="tigress"]').getAttribute('aria-pressed'),'true');
 q('#guide-explore').click();assert.equal(win.scrollY,2400);flush(3);assert.equal(q('#guide-name').textContent,'TIGRESS');
 q('[data-guide="shifu"]').click();assert.equal(qa('.project-card').length,win.PORTFOLIO.projects.filter(p=>p.group==='ai').length);assert.equal(q('#guide-explore').textContent,'Explore with Shifu ↗');
 q('[data-guide="po"]').click();assert.equal(qa('.project-card').length,win.PORTFOLIO.projects.length);assert(q('#hero-character').src.endsWith('/po-original-optimized.webp'));
 q('[data-guide="oogway"]').click();assert.equal(qa('.essay-row').length,10);q('#guide-explore').click();assert.equal(win.scrollY,4500);assert.equal(q('#guide-name').textContent,'OOGWAY');
 win.scrollTo({top:0});q('#character-action').click();flush(3);assert(q('#dragon-control').classList.contains('acting'));assert(q('#hero-character').style.transform.includes('translate3d'));assert(chiCalls.power>.9,'Character action also drives the chi burst: '+chiCalls.power);
 const stage=q('#dragon-control');stage.dispatchEvent({type:'pointerenter',pointerType:'mouse'});flush(35);assert(lastMotion.attention>.9);stage.dispatchEvent({type:'pointerleave'});flush(45);assert(lastMotion.attention<.02);stage.dispatchEvent({type:'pointerenter',pointerType:'touch'});flush(10);assert(lastMotion.attention<.02);stage.dispatchEvent({type:'focus'});flush(35);assert(lastMotion.attention>.9);stage.dispatchEvent({type:'blur'});flush(45);
 stage.dispatchEvent({type:'pointerdown',pointerId:10,clientX:700,button:0});stage.dispatchEvent({type:'pointermove',pointerId:10,clientX:800});stage.dispatchEvent({type:'pointerup'});stage.dispatchEvent({type:'click',detail:1});flush(3);assert(!stage.classList.contains('acting'),'A drag release must not activate a power');stage.dispatchEvent({type:'click',detail:0});flush(3);assert(stage.classList.contains('acting'),'Keyboard activation still works');
 q('.library-guide').click();assert(q('.library-guide').classList.contains('breathing'));flush(160);assert(!q('.library-guide').classList.contains('breathing'));
 q('#motion-toggle').click();observer();flush(2);const frozenSprite=q('#hero-character').style.transform,frozenChi=chiCalls.draw;flush(12);assert.equal(q('#hero-character').style.transform,frozenSprite);assert.equal(chiCalls.draw,frozenChi);assert(q('#character-action').disabled);q('#motion-toggle').click();observer();flush(3);
 q('#reading-toggle').click();observer();flush(3);assert(q('#character-action').disabled);q('#reading-toggle').click();observer();
 doc.hidden=true;doc.dispatchEvent({type:'visibilitychange'});const hiddenSprite=q('#hero-character').style.transform,hiddenChi=chiCalls.draw;flush(20);assert.equal(q('#hero-character').style.transform,hiddenSprite);assert.equal(chiCalls.draw,hiddenChi);assert(q('#panda-chi-effects').hidden);assert(doc.body.classList.contains('activity-hidden'));doc.hidden=false;doc.dispatchEvent({type:'visibilitychange'});flush(3);assert(!doc.body.classList.contains('activity-hidden'));assert(!q('#panda-chi-effects').hidden);
 q('#art-credits').click();observer();assert(q('#credits-dialog').open);assert(doc.body.classList.contains('modal-open'));const modalChi=chiCalls.draw;flush(10);assert.equal(chiCalls.draw,modalChi);assert(q('#panda-chi-effects').hidden);q('#credits-dialog').close();observer();flush(3);assert(!doc.body.classList.contains('modal-open'));assert(!q('#panda-chi-effects').hidden);
 win.scrollTo({top:5000});flush(5);const offscreenChi=chiCalls.draw;flush(10);assert.equal(chiCalls.draw,offscreenChi);assert(q('#panda-chi-effects').hidden);win.scrollTo({top:0});flush(5);assert(!q('#panda-chi-effects').hidden);assert(chiCalls.draw>offscreenChi);
 // Global exposure controls preserve records while changing visible groups.
 vm.runInContext(fs.readFileSync(path.join(root,'learning.js'),'utf8'),context);
 assert.equal(qa('[data-learning-record]').length,8);
 if(q('#project-track').hidden)q('#view-toggle').click();
 assert.equal(q('.gallery-progress').hidden,false);
 assert.equal(q('#gallery-progress-fill').style.width,(1/win.PORTFOLIO.projects.length*100)+'%');
 q('#next-project').click();assert.equal(q('#gallery-progress-fill').style.width,(2/win.PORTFOLIO.projects.length*100)+'%');
 for(const [kind,total] of [['program',2],['certification',4],['experience',2]]){
  q('[data-learning-filter="'+kind+'"]').click();
  assert.equal(q('[data-learning-filter="'+kind+'"]').getAttribute('aria-pressed'),'true');
  for(const group of qa('[data-learning-group]'))assert.equal(group.hidden,group.dataset.learningGroup!==kind);
  assert(q('#learning-count').textContent.startsWith(String(total)+' '));
 }
 q('[data-learning-filter="all"]').click();assert(qa('[data-learning-group]').every(g=>!g.hidden));
 assert.equal(q('#learning-count').textContent,'8 learning & experience records');
 for(const p of data.projects){const card=q('[data-project="'+p.id+'"]');assert.equal(card.querySelectorAll('.card-tools')[0].querySelectorAll('span').length,Math.min(3,p.stack.length));}
 win.scrollTo({top:7600});flush(3);assert.equal(q('[aria-label="Global exposure"]').getAttribute('aria-current'),'location');
 console.log('PASS: eight exposure records, program/certification/experience filters, visible status counts, exposure navigation, project technology chips and gallery progress.');
 console.log('PASS: four character guides, correct project filters, writing navigation, four-chapter forward/reverse scroll, scene buttons, continue cue, synchronization after manual selection, character actions, Oogway breathing, pause, reading mode and artwork sources.');
 // A mobile resize keeps vertical scrolling as the source of chapter selection.
 win.innerWidth=380;(windowListeners.resize||[]).forEach(f=>f());win.scrollTo({top:sceneY(2)});flush(100);assert.equal(q('#guide-name').textContent,'SHIFU');
 win.innerWidth=844;win.innerHeight=390;(windowListeners.resize||[]).forEach(f=>f());win.scrollTo({top:sceneY(1)});flush(100);assert.equal(q('#guide-name').textContent,'TIGRESS');
 win.innerWidth=1440;win.innerHeight=800;(windowListeners.resize||[]).forEach(f=>f());win.scrollTo({top:sceneY(1)});flush(100);assert(qa('.hero-copy')[1].classList.contains('active'),'Desktop scroll scenes remain active after resize');
 // Resizing the viewport or rotating while in the index keeps the selected card.
 if(q('#project-track').hidden)q('#view-toggle').click();q('[data-filter="all"]').click();
 for(let i=0;i<4;i++)q('#next-project').click();assert(q('#project-count').textContent.startsWith('05 /'));
 orientationGalleryStep=356;win.innerWidth=390;(windowListeners.resize||[]).forEach(f=>f());flush(2);assert.equal(q('#project-track').scrollLeft,4*356);assert(q('#project-count').textContent.startsWith('05 /'));
 q('#view-toggle').click();orientationGalleryStep=730;win.innerWidth=844;(windowListeners.resize||[]).forEach(f=>f());flush(2);q('#view-toggle').click();assert.equal(q('#project-track').scrollLeft,4*730);assert(q('#project-count').textContent.startsWith('05 /'),'Index return preserves project after orientation change');
 console.log('PASS: Panda hover/focus attention, touch hover suppression, drag-click suppression, keyboard activation and hidden-tab sprite suspension.');
 console.log('PASS: dragon mesh submission, dust particles, scroll travel, pointer orbit, energy wake, gallery coupling, pause/resume, hidden-tab suspension, reading mode, context-loss fallback, and WebGL-unavailable fallback.');
 console.log('PASS: 17 project details; 10 full-text essays; category filters; gallery arrows; searchable index; article navigation; menu; pause; reading mode; scroll scenes; reduced motion; clipboard; deep links.');
 console.log('Verification uses a lightweight DOM harness with mocked geometry, animation frames, canvas, and browser APIs. It does not verify pixels, native layout, or live browser behavior.');
})().catch(e=>{console.error(e);process.exitCode=1;});
