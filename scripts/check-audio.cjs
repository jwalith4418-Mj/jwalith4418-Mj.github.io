const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../dist/hero-audio.js'),'utf8');
function setup(supported=true){
 const nodes={},listeners={},classes=new Set(),observers=[];let contexts=0,current;
 for(const id of ['sound-toggle','sound-label','sound-volume','volume-label'])nodes[id]={value:'25',textContent:'',attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this.listeners[k]=f;}};
 const doc={hidden:false,getElementById:id=>nodes[id],body:{classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c)}},addEventListener(k,f){listeners[k]=f;}};
 class Param{
  constructor(){this.value=0;this.events=[];}
  record(method,v,t){assert(Number.isFinite(v));assert(Number.isFinite(t));this.events.push({method,v,t});this.value=v;}
  setValueAtTime(v,t){this.record('set',v,t);}
  setTargetAtTime(v,t,c){assert(c>0);this.record('target',v,t);}
  exponentialRampToValueAtTime(v,t){assert(v>0);this.record('ramp',v,t);}
  cancelScheduledValues(){}
 }
 class Audio{
  constructor(){contexts++;current=this;this.state='suspended';this.sampleRate=48000;this.currentTime=0;this.destination={};this.sources=[];this.filters=[];this.gains=[];}
  createGain(){const x={gain:new Param(),connect(){},disconnect(){}};this.gains.push(x);return x;}
  createDynamicsCompressor(){return{threshold:{},knee:{},ratio:{},attack:{},release:{},connect(){}};}
  createBuffer(ch,n,rate){assert.equal(ch,1);assert.equal(rate,48000);return{getChannelData:()=>new Float32Array(n)};}
  source(kind){const x={kind,frequency:new Param(),stops:[],connect(){},disconnect(){},start(t){assert(t>=0);this.started=t;},stop(t){this.stops.push(t);}};this.sources.push(x);return x;}
  createOscillator(){return this.source('tone');}
  createBufferSource(){return this.source('noise');}
  createBiquadFilter(){const x={type:'',Q:{value:0},frequency:new Param(),connect(){},disconnect(){}};this.filters.push(x);return x;}
  async resume(){this.state='running';}
  async suspend(){this.state='suspended';}
  complete(){for(const s of this.sources)if(s.onended){const f=s.onended;s.onended=null;f();}}
 }
 const win={document:doc,Math,Error,Float32Array,MutationObserver:class{constructor(f){observers.push(f);}observe(){}},MarvelExperience:{activeHero:'ironman'}};
 if(supported)win.AudioContext=Audio;win.window=win;
 vm.runInNewContext(code,win);
 return{win,nodes,doc,classes,get audio(){return current;},get contexts(){return contexts;},sync(){observers.forEach(f=>f());},visibility(){listeners.visibilitychange();}};
}
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 const s=setup();assert.equal(s.contexts,0);assert.equal(s.win.HeroAudio.enabled,false);
 for(const id of ['ironman','spiderman','strange','panther','thor','captain'])s.win.HeroAudio.play(id);
 assert.equal(s.contexts,0,'No audio graph is created before opt-in');
 await s.nodes['sound-toggle'].listeners.click();await tick();
 assert.equal(s.contexts,1);assert.equal(s.win.HeroAudio.enabled,true);assert.equal(s.nodes['sound-toggle'].attrs['aria-pressed'],'true');assert(s.audio.sources.length>0);
 s.audio.complete();
 const entry=s.audio.sources.length;s.win.HeroAudio.play('ironman',true);assert.equal(s.audio.sources.length,entry,'Repeated entrance cues are debounced');
 const expected={ironman:3,spiderman:2,strange:5,panther:3,thor:4,captain:4};
 for(const [id,count] of Object.entries(expected)){
  const before=s.audio.sources.length;s.win.HeroAudio.play(id);
  const sources=s.audio.sources.slice(before);assert.equal(sources.length,count,id+' sound recipe');
  for(const x of sources){assert(x.stops[0]>x.started);assert(x.stops[0]-x.started<1.6);}
  if(id==='thor'){
   assert.equal(sources[0].started,s.audio.currentTime,'Thor charge starts immediately');
   assert.equal(sources[1].started,s.audio.currentTime+.25,'Crack follows the visual charge');
   assert.equal(sources[2].started,s.audio.currentTime+.3,'Rumble follows the strike');
   assert(sources.every(x=>x.stops[0]-s.audio.currentTime<1.6),'Whole sequence stays bounded');
  }
  s.audio.complete();
 }
 assert(s.audio.filters.some(f=>f.type==='highpass'));assert(s.audio.filters.some(f=>f.type==='lowpass'));assert(s.audio.filters.some(f=>f.type==='bandpass'));
 s.nodes['sound-volume'].value='50';s.nodes['sound-volume'].listeners.input();assert.equal(s.nodes['volume-label'].textContent,'50%');assert.equal(s.audio.gains[0].gain.value,.24);
 s.nodes['sound-volume'].value='0';s.nodes['sound-volume'].listeners.input();const zero=s.audio.sources.length;s.win.HeroAudio.play('thor');assert.equal(s.audio.sources.length,zero);
 s.nodes['sound-volume'].value='25';s.nodes['sound-volume'].listeners.input();
 for(const mode of ['motion-paused','modal-open','reading-mode']){
  s.win.HeroAudio.play('thor');const recent=s.audio.sources.at(-1);s.classes.add(mode);s.sync();await tick();
  assert.equal(s.audio.state,'suspended');assert.equal(s.audio.gains[0].gain.value,0);assert(recent.stops.includes(undefined));
  const before=s.audio.sources.length;s.win.HeroAudio.play('ironman');assert.equal(s.audio.sources.length,before);
  s.classes.delete(mode);s.sync();await tick();assert.equal(s.audio.state,'running');
 }
 s.doc.hidden=true;s.visibility();await tick();assert.equal(s.audio.state,'suspended');s.doc.hidden=false;s.visibility();await tick();assert.equal(s.audio.state,'running');
 s.win.HeroAudio.play('thor');const recent=s.audio.sources.at(-1);
 await s.nodes['sound-toggle'].listeners.click();assert.equal(s.win.HeroAudio.enabled,false);assert.equal(s.audio.state,'suspended');assert(recent.stops.includes(undefined));assert.equal(s.nodes['sound-label'].textContent,'Sound off');
 const off=s.audio.sources.length;s.win.HeroAudio.play('captain');assert.equal(s.audio.sources.length,off);
 const fallback=setup(false);await fallback.nodes['sound-toggle'].listeners.click();assert.equal(fallback.win.HeroAudio.enabled,false);assert.equal(fallback.nodes['sound-label'].textContent,'Sound unavailable');assert.equal(fallback.nodes['sound-toggle'].disabled,false);
 console.log('PASS: audio stays off until opt-in; six distinct bounded sound recipes; adjustable volume and zero-volume silence; mute cancels active voices; hidden-tab, modal, pause and reading-mode suspension/resume; unavailable audio fallback.');
 console.log('AudioContext is mocked. Actual speaker output, listening quality and native browser autoplay behavior remain unverified.');
})().catch(e=>{console.error(e);process.exitCode=1;});
