/* Deterministic, browser-independent rules for three short arcade games. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PortfolioArcade=factory();})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const durations={reactor:30,web:20,reflex:25};
 class Engine{
  constructor(random=Math.random){this.random=random;this.reset('reactor');}
  rng(){const n=Number(this.random());return Number.isFinite(n)?Math.max(0,Math.min(.999999,n)):.5;}
  reset(id){
   if(!Object.prototype.hasOwnProperty.call(durations,id))throw new Error('Unknown game');
   this.id=id;this.running=false;this.paused=false;this.ended=false;this.time=0;this.duration=durations[id];this.score=0;this.hits=0;this.misses=0;this.round=0;this.combo=0;this.lives=3;this.angle=0;this.target=.12+this.rng()*.76;this.cell=-1;this.cellAge=0;this.cellLimit=.95;this.queue=[];this.spawn=.2;this.cooldown=0;this.serial=0;this.feedback='Ready when you are.';this.feedbackKind='neutral';this.feedbackAt=0;return this;
  }
  start(id=this.id){this.reset(id);this.running=true;this.message('Let’s go.','neutral');if(id==='web')this.nextCell();return this;}
  message(text,kind){this.feedback=text;this.feedbackKind=kind;this.feedbackAt=this.time;this.serial++;}
  finish(){if(this.ended)return;this.running=false;this.ended=true;this.message('Round complete.','finish');}
  pause(on=true){if(this.running)this.paused=!!on;}
  nextCell(){const previous=this.cell;let next=Math.floor(this.rng()*9);if(next===previous)next=(next+1+Math.floor(this.rng()*8))%9;this.cell=next;this.cellAge=0;this.cellLimit=Math.max(.58,.95-this.hits*.012);}
  tick(delta){
   if(!this.running||this.paused||!Number.isFinite(delta)||delta<=0)return;
   const dt=Math.min(delta,.25);this.time=Math.min(this.duration,this.time+dt);this.cooldown=Math.max(0,this.cooldown-dt);
   if(this.id==='reactor')this.angle=(this.angle+dt*(.4+this.round*.045))%1;
   else if(this.id==='web'){
    this.cellAge+=dt;if(this.cellAge>=this.cellLimit){this.misses++;this.combo=0;this.message('Target escaped.','miss');this.nextCell();}
   }else{
    for(const cue of this.queue)cue.progress+=dt/(1.7-Math.min(.35,this.time*.014));
    const escaped=this.queue.filter(c=>c.progress>1.12).length;
    this.queue=this.queue.filter(c=>c.progress<=1.12);
    if(escaped){this.lives=Math.max(0,this.lives-escaped);this.misses+=escaped;this.message('Missed the beat.','miss');}
    this.spawn-=dt;
    if(this.spawn<=0){this.queue.push({lane:Math.floor(this.rng()*3),progress:0});this.spawn=.9-Math.min(.18,this.time*.007);}
    if(this.lives===0)this.finish();
   }
   if(this.time>=this.duration)this.finish();
  }
  input(value){
   if(!this.running||this.paused||this.cooldown>0)return false;
   if(this.id==='reactor'){
    const d=Math.abs(this.angle-this.target),distance=Math.min(d,1-d);
    const points=distance<=.025?100:distance<=.065?60:distance<=.105?25:0;
    this.score+=points;if(points)this.hits++;else this.misses++;
    this.round++;this.message(points===100?'Perfect lock.':points?'Energy captured.':'Outside the zone.',points?'hit':'miss');
    this.angle=0;this.target=.12+this.rng()*.76;this.cooldown=.32;if(this.round>=8)this.finish();
   }else if(this.id==='web'){
    if(!Number.isInteger(value)||value<0||value>8)return false;
    if(value===this.cell){this.hits++;this.combo++;const bonus=this.combo%5===0?25:0;this.score+=50+bonus;this.message(bonus?'Five in a row. +75':'Caught. +50','hit');this.nextCell();}
    else{this.misses++;this.combo=0;this.score=Math.max(0,this.score-10);this.message('Wrong target. −10','miss');}
    this.cooldown=.08;
   }else{
    if(!Number.isInteger(value)||value<0||value>2)return false;
    const available=this.queue.filter(c=>c.lane===value&&c.progress>=.8&&c.progress<=1.12).sort((a,b)=>Math.abs(a.progress-1)-Math.abs(b.progress-1));
    const cue=available[0];
    if(cue){const perfect=Math.abs(cue.progress-1)<=.055;this.score+=perfect?100:60;this.hits++;this.queue.splice(this.queue.indexOf(cue),1);this.message(perfect?'Perfect timing. +100':'On the beat. +60','hit');}
    else{this.misses++;this.lives=Math.max(0,this.lives-1);this.message('Too early or wrong lane.','miss');if(!this.lives)this.finish();}
    this.cooldown=.16;
   }
   return true;
  }
 }
 return {Engine,durations};
});
