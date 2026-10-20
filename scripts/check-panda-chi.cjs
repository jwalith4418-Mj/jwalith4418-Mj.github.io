const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/panda/chi-effects.js'),'utf8');
const env={window:{},innerWidth:432,innerHeight:692,devicePixelRatio:3};vm.runInNewContext(source,env);
let count=0,clears=0,scale,paths=[],current=[];
const ctx={setTransform(...args){scale=args;},clearRect(){clears++;},beginPath(){current=[];},arc(...a){assert(a.every(Number.isFinite));assert(a[2]>=0);current.push(['arc',...a]);},moveTo(...a){assert(a.every(Number.isFinite));current.push(['move',...a]);},lineTo(...a){assert(a.every(Number.isFinite));current.push(['line',...a]);},stroke(){count++;paths.push({color:this.strokeStyle,path:current});},fill(){count++;}};
const canvas={width:0,height:0,hidden:false,parentElement:{getBoundingClientRect(){return {width:340,height:240};}},getContext(){return ctx;}};
const effects=env.window.PandaChiEffects.create(canvas);
assert.equal(canvas.width,510);assert.equal(canvas.height,360);assert.equal(scale[0],1.5);
const fingerprints=new Set();
for(const character of ['po','tigress','shifu','oogway']){
 paths=[];count=0;effects.draw({character,time:1.5,power:.85,attention:1});
 assert(count>30&&count<200,'Compact draw work is bounded');
 fingerprints.add(JSON.stringify(paths));assert.equal(ctx.globalAlpha,1);
}
assert.equal(fingerprints.size,4,'Each character produces distinct power artwork');
for(const time of [0,10,10000,NaN,Infinity])effects.draw({time,power:NaN,attention:Infinity});
effects.release();assert(canvas.hidden);assert.equal(canvas.width,1);assert.equal(canvas.height,1);
const released=count;effects.draw({power:1});assert.equal(count,released,'Released buffers do not draw');
env.innerWidth=1440;effects.resize();assert.equal(canvas.width,680);assert.equal(canvas.height,480);assert(!canvas.hidden);
env.innerWidth=844;env.innerHeight=390;effects.resize();assert.equal(canvas.width,510,'Short landscape uses compact resolution');
const missing={hidden:false,getContext(){return null;}};const fallback=env.window.PandaChiEffects.create(missing);assert(missing.hidden);for(const method of ['draw','resize','clear','release'])fallback[method]();
const throwing={hidden:false,getContext(){throw Error('Canvas unavailable');}};env.window.PandaChiEffects.create(throwing).draw();assert(throwing.hidden);
env.window.PandaChiEffects.create(null).draw();assert(clears>0);
console.log('PASS: four distinct chi powers, finite drawing geometry, bounded draw work, compact DPR including landscape, buffer release/restore, and missing/throwing canvas fallback. Canvas is mocked; appearance and device performance are unverified.');
