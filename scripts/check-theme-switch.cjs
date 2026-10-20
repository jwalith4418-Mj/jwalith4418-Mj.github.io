// Mocked lifecycle checks; these do not claim live browser rendering coverage.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/theme-switch.js'),'utf8');
const themeKey='jwalith.portfolio.theme',stateKey='jwalith.portfolio.switch';
function run(theme='marvel',options={}){
 const local=options.local||new Map(),session=options.session||new Map(),events={},docEvents={},timers=[],frames=[],navigation=[],scrolls=[],fetches=[],prefetches=[];
 const classes=new Set(options.classes||[]),body={classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)}};
 const url=new URL(options.url||('https://portfolio.test'+(theme==='panda'?'/panda/index.html':'/')+'?theme='+theme+(options.hash||'')));
 const location={href:url.href,hash:url.hash,replace:u=>navigation.push({method:'replace',url:new URL(u)}),assign:u=>navigation.push({method:'assign',url:new URL(u)})};
 const storage=map=>({getItem:k=>{if(options.blocked)throw Error('blocked');return map.get(k)||null;},setItem:(k,v)=>{if(options.blocked)throw Error('blocked');map.set(k,v);},removeItem:k=>{if(options.blocked)throw Error('blocked');map.delete(k);}});
 const link={dataset:{themeLink:theme==='marvel'?'panda':'marvel'},href:'https://portfolio.test'+(theme==='marvel'?'/panda/index.html?theme=panda':'/?theme=marvel'),attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}};
 const positions={home:[0,options.selectedWork?1500:2400],...(options.selectedWork?{'selected-work':[1500,900]}:{}),work:[2400,1800],writing:[4200,1700],about:[5900,1500],'global-exposure':[7400,2400],contact:[9800,1400]};
 let context,clock=Date.now(),fontReady;const elements=Object.fromEntries(Object.entries(positions).map(([id,[top,height]])=>[id,{id,attrs:{},getBoundingClientRect:()=>({top:top-context.scrollY,height}),setAttribute(k,v){this.attrs[k]=v;},focus(){this.focused=true;}}]));
 const control=className=>({getAttribute:()=>String(classes.has(className)),click:()=>{classes.has(className)?classes.delete(className):classes.add(className);}});
 elements['portfolio-theme-switch']=link;elements['reading-toggle']=control('reading-mode');elements['motion-toggle']=control('motion-paused');
 elements['sound-toggle']={getAttribute:()=>options.sound?'true':'false',click(){this.muted=true;}};
 const asset=href=>({getAttribute(k){return k==='href'?href:null;}});
 const document={documentElement:{dataset:{portfolioTheme:theme}},body,hidden:!!options.hidden,readyState:'complete',head:{appendChild(node){prefetches.push(node);}},createElement(){return{attrs:{},setAttribute(k,v){this.attrs[k]=v;}};},getElementById:id=>elements[id],addEventListener:(k,f)=>docEvents[k]=f,querySelectorAll:selector=>selector==='[data-theme-link]'?[link]:options.warm?[asset('/content.js?v=shared1')]:[]};
 if(options.fonts)document.fonts={ready:{then(f){fontReady=f;return {catch(){}};}}};
 const window={localStorage:storage(local),sessionStorage:storage(session),matchMedia:()=>({matches:!!options.reduced}),addEventListener:(k,f)=>events[k]=f,setTimeout:f=>timers.push(f),scrollTo:o=>{scrolls.push(o);context.scrollY=o.top;}};
 if(options.warm){window.navigator={connection:options.connection};window.fetch=async(url,config)=>{fetches.push({url,config});if(options.fetchError)throw Error('Offline');return{ok:!options.httpError,text:async()=>'<html></html>'};};window.DOMParser=class{parseFromString(){return{querySelectorAll:()=>['/content.js?v=shared1','/panda/style.css?v=fourguides4','/panda/app.js?v=scroll-phone1','/assets/kungfu/po-original.webp','/assets/kungfu/po-original.webp','https://external.test/file.js'].map(asset)};}};}
 context=vm.createContext({document,window,location,URL,Date:class extends Date{static now(){return clock;}},JSON,Number,innerHeight:900,scrollY:options.scrollY||0,requestAnimationFrame:f=>frames.push(f)});
 vm.runInContext(source,context);
 function click(overrides={}){const e={target:{closest:()=>link},button:0,preventDefault(){this.prevented=true;},...overrides};docEvents.click?.(e);return e;}
 function flush(){while(frames.length)frames.shift()();while(timers.length)timers.shift()();}
 return {local,session,events,classes,elements,link,navigation,scrolls,context,location,document,click,flush,fetches,prefetches,intent:type=>docEvents[type]?.({target:{closest:()=>link}}),advanceClock:ms=>clock+=ms,resolveFonts:()=>fontReady?.()};
}
for(const from of ['marvel','panda']){
 const a=run(from,{scrollY:2600,sound:true});assert(a.click().prevented);assert.equal(a.navigation.length,1,'Navigation starts immediately without waiting for a fade');assert(a.elements['sound-toggle'].muted);a.click();a.flush();assert.equal(a.navigation.length,1);
 const target=from==='marvel'?'panda':'marvel',destination=a.navigation[0].url;
 assert.equal(destination.origin,'https://portfolio.test');assert.equal(destination.hash,'#work');assert.equal(destination.searchParams.get('theme'),target);assert.equal(a.local.get(themeKey),target);
 const state=JSON.parse(a.session.get(stateKey));assert.equal(state.section,'work');assert.equal(state.progress,200/1800);
 const b=run(target,{local:a.local,session:a.session,url:destination.href});b.flush();assert.equal(b.scrolls.at(-1).top,2600);assert(b.elements.work.focused);assert(!b.session.has(stateKey));
}
for(const from of ['marvel','panda']){const a=run(from,{selectedWork:true,scrollY:1800});a.click();a.flush();assert.equal(a.navigation[0].url.hash,'#selected-work');const state=JSON.parse(a.session.get(stateKey));assert.equal(state.section,'selected-work');assert.equal(state.progress,1/3);const target=from==='marvel'?'panda':'marvel';const b=run(target,{selectedWork:true,local:a.local,session:a.session,url:a.navigation[0].url.href});b.flush();assert.equal(b.scrolls.at(-1).top,1800);assert(b.elements['selected-work'].focused);}
let a=run('marvel',{local:new Map([[themeKey,'panda']]),url:'https://portfolio.test/#contact'});assert.equal(a.navigation[0].method,'replace');assert.equal(a.navigation[0].url.pathname,'/panda/index.html');assert.equal(a.navigation[0].url.hash,'#contact');
a=run('marvel',{local:new Map([[themeKey,'panda']])});assert.equal(a.navigation.length,0);assert.equal(a.local.get(themeKey),'marvel');
a=run('marvel',{url:'https://portfolio.test/?theme=panda#essay/test'});assert.equal(a.navigation[0].url.hash,'#essay/test');
for(const options of [{blocked:true},{reduced:true},{classes:['reading-mode','motion-paused']}]){a=run('marvel',options);a.click();a.flush();assert.equal(a.navigation.length,1);if(options.reduced||options.classes)assert(!a.classes.has('theme-leaving'));if(options.classes){const b=run('panda',{local:a.local,session:a.session,url:a.navigation[0].url.href});b.flush();assert(b.classes.has('reading-mode'));assert(b.classes.has('motion-paused'));}}
for(const key of ['metaKey','ctrlKey','shiftKey','altKey']){a=run();assert(!a.click({[key]:true}).prevented);assert.equal(a.navigation.length,0);}
a=run();assert(!a.click({button:1}).prevented);assert(!a.click({defaultPrevented:true}).prevented);
a=run('marvel',{hash:'#project/nexus',scrollY:2600});a.click();a.flush();assert.equal(a.navigation[0].url.hash,'#project/nexus');let b=run('panda',{local:a.local,session:a.session,hash:'#project/nexus'});b.flush();assert.equal(b.scrolls.length,0);
a=run('marvel',{scrollY:2600});a.click();a.flush();
const restoreState=a.session.get(stateKey);
for(const event of ['wheel','touchstart','pointerdown','keydown']){
 b=run('panda',{session:new Map([[stateKey,restoreState]]),hash:'#work',fonts:true});b.events[event]();b.flush();b.resolveFonts();assert.equal(b.scrolls.length,0);assert(!b.elements.work.focused,'Input must also cancel focus restoration');
}
b=run('panda',{session:new Map([[stateKey,restoreState]]),hash:'#work',fonts:true});b.flush();let count=b.scrolls.length;b.advanceClock(1500);b.context.scrollY=4000;b.resolveFonts();assert.equal(b.scrolls.length,count);assert.equal(b.context.scrollY,4000,'Late fonts must not jump back');
b=run('panda',{session:new Map([[stateKey,restoreState]]),hash:'#work',fonts:true});b.location.hash='#contact';b.flush();b.resolveFonts();assert.equal(b.scrolls.length,0);assert(!b.elements.work.focused,'New navigation must cancel old restoration');
b=run('panda',{session:new Map([[stateKey,restoreState]]),hash:'#work',fonts:true});b.flush();count=b.scrolls.length;b.advanceClock(500);b.resolveFonts();assert.equal(b.scrolls.length,count+1,'Early font layout correction is retained');
for(const state of ['{broken',JSON.stringify({to:'panda',section:'contact',progress:NaN,stamp:Date.now(),hash:'#contact'}),JSON.stringify({to:'panda',section:'contact',progress:.3,stamp:Date.now()-60000,hash:'#contact'})]){b=run('panda',{hash:'#contact',session:new Map([[stateKey,state]])});b.flush();assert.equal(b.scrolls.length,0);}
a=run('marvel');a.click();assert(!a.classes.has('theme-leaving'),'Outgoing page must not become blank');a.events.pageshow({persisted:true});assert(!a.classes.has('theme-leaving'));assert(!a.link.attrs['aria-busy']);assert.equal(a.local.get(themeKey),'marvel');
console.log('PASS: two-way switching, preference and explicit override, same-origin routing, section/progress restoration, deep links, rapid clicks, modifier clicks, blocked storage, reduced motion, reading/pause transfer, input/focus cancellation, bounded late-font correction, new-navigation cancellation, invalid/stale state and back-cache recovery. Browser APIs mocked.');
(async()=>{
 const settle=()=>new Promise(resolve=>setImmediate(resolve));
 a=run('marvel',{warm:true});a.intent('pointerover');a.intent('focusin');a.flush();await settle();
 assert.equal(a.fetches.length,1,'Intent and idle warmups are deduplicated');assert.equal(a.fetches[0].config.credentials,'same-origin');assert.equal(a.fetches[0].config.cache,'force-cache');
 assert.equal(a.prefetches.length,3,'Shared, duplicate and external assets are not prefetched');assert(a.prefetches.every(x=>x.rel==='prefetch'&&x.attrs.fetchpriority==='low'));
 assert(a.prefetches.some(x=>x.href.endsWith('/assets/kungfu/po-original.webp')));assert(!a.classes.has('motion-paused'));assert.equal(a.navigation.length,0,'Warming must not change state or navigate');
 a=run('marvel',{warm:true});a.flush();await settle();assert.equal(a.fetches.length,0,'Idle visitors do not download the alternate theme');
 for(const connection of [{saveData:true},{effectiveType:'2g'},{effectiveType:'slow-2g'}]){a=run('marvel',{warm:true,connection});a.intent('pointerover');a.flush();await settle();assert.equal(a.fetches.length,0);a.click();assert.equal(a.navigation.length,1,'Constrained connections still switch immediately');}
 a=run('marvel',{warm:true,hidden:true});a.flush();a.intent('focusin');await settle();assert.equal(a.fetches.length,0);
 for(const failure of ['fetchError','httpError']){a=run('marvel',{warm:true,[failure]:true});a.intent('pointerover');await settle();a.intent('focusin');await settle();assert.equal(a.fetches.length,2,'Failed warmup can retry');assert.equal(a.prefetches.length,0);a.click();assert.equal(a.navigation.length,1,'Warmup failures never block switching');}
 console.log('PASS: immediate navigation, visible outgoing page, intent-only asset warmup, low-priority same-origin deduplication, data-saver/slow-network/hidden gates and warmup failure fallback. Network and browser APIs mocked; real switching time is unmeasured.');
})().catch(error=>{console.error(error);process.exitCode=1;});
