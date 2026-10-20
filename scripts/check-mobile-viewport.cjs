const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../dist/mobile-viewport.js'),'utf8');
function fixture(vv=true){
 const values=new Map(),writes=[],events={},frames=new Map();let serial=0;
 const visual={height:760,offsetTop:0,scale:1,addEventListener(k,f){events['visual-'+k]=f;}};
 const document={hidden:false,documentElement:{style:{setProperty(k,v){values.set(k,v);writes.push([k,v]);},removeProperty(k){values.delete(k);}}},addEventListener(k,f){events[k]=f;}};
 const env={document,innerWidth:390,innerHeight:844,window:{visualViewport:vv?visual:undefined,addEventListener(k,f){events[k]=f;}},requestAnimationFrame(f){const id=++serial;frames.set(id,f);return id;},cancelAnimationFrame(id){frames.delete(id);},Number,Math};
 vm.runInNewContext(code,env);return{env,visual,events,values,writes,frames,flush(){const f=[...frames.values()];frames.clear();f.forEach(fn=>fn());}};
}
const x=fixture();assert.equal(x.values.get('--phone-visible-height'),'760px');assert.equal(x.values.get('--phone-visible-top'),'0px');
for(let i=0;i<20;i++)x.events['visual-resize']();assert.equal(x.frames.size,1);const before=x.writes.length;x.flush();assert.equal(x.writes.length,before,'No unchanged CSS writes');assert.equal(x.frames.size,0,'No continuous frame loop');
x.visual.height=420.3;x.visual.offsetTop=96.4;x.events['visual-resize']();x.events['visual-scroll']();x.flush();assert.equal(x.values.get('--phone-visible-height'),'420px');assert.equal(x.values.get('--phone-visible-top'),'96px');
x.visual.scale=1.5;x.events['visual-resize']();x.flush();assert.equal(x.values.size,0,'Do not fight pinch zoom');x.visual.scale=1;x.events['visual-resize']();x.flush();assert.equal(x.values.size,2);
x.events.resize();x.env.document.hidden=true;x.events.visibilitychange();assert.equal(x.frames.size,0);x.events['visual-resize']();assert.equal(x.frames.size,0);x.env.document.hidden=false;x.events.visibilitychange();x.flush();
x.env.innerWidth=1440;x.events.resize();x.flush();assert.equal(x.values.size,0,'Desktop restores native sizing');x.env.innerWidth=844;x.env.innerHeight=390;x.visual.height=390;x.visual.offsetTop=0;x.events.resize();x.flush();assert.equal(x.values.get('--phone-visible-height'),'390px','Short landscape');
x.visual.height=NaN;x.events['visual-resize']();x.flush();assert.equal(x.values.size,0,'Invalid viewport cannot inject invalid CSS');
x.visual.height=780;x.env.innerWidth=390;x.env.innerHeight=844;x.events.pageshow();x.flush();assert.equal(x.values.get('--phone-visible-height'),'780px','Back-cache return refreshes visible height');
const fallback=fixture(false);assert.equal(fallback.values.get('--phone-visible-height'),'844px');assert.equal(fallback.values.get('--phone-visible-top'),'0px');
console.log('PASS: visible-height/offset sizing, keyboard-style resize, portrait/landscape, coalesced events, no unchanged writes, pinch zoom, desktop restore, hidden tabs, invalid values and unsupported-API fallback. VisualViewport and browser APIs are mocked; native keyboard/layout unverified.');
