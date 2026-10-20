const assert=require('node:assert/strict'),{ids,pose}=require('../dist/character-motion.js');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.rotation-b.rotation)*3,(a.scale-b.scale)*300);
const signatures=new Set();
for(const id of ids){
 const signature=[];let movement=0;
 for(let tick=0;tick<=600;tick++){
  const time=tick/30,p=pose(id,{time});
  for(const [key,value] of Object.entries(p))assert(Number.isFinite(value),id+' '+key);
  assert(Math.abs(p.x)<=95&&p.y>=-85&&p.y<=40&&Math.abs(p.rotation)<=24&&p.scale>=.96&&p.scale<=1.07);
  if(tick%60===0)signature.push(p);
  movement=Math.max(movement,distance(p,pose(id,{time:0})));
  for(const power of [0,.25,.75,1]){
   const active=pose(id,{time,power,age:time%1.15,attention:1,pointerX:1,pointerY:-1});
   assert(Object.values(active).every(Number.isFinite));
   assert(Math.abs(active.x)<=95&&active.y>=-85&&active.y<=40&&Math.abs(active.rotation)<=24&&active.scale>=.96&&active.scale<=1.07);
  }
 }
 assert(movement>2,id+' has visible idle movement');signatures.add(JSON.stringify(signature));
 assert(distance(pose(id,{time:2}),pose(id,{time:2,attention:1,pointerX:1,pointerY:1}))>10,id+' reacts to attention and pointer');
 assert(distance(pose(id,{time:2}),pose(id,{time:2,power:.7,age:.4}))>10,id+' has a distinct click action');
 assert.deepEqual(pose(id,{time:2,power:0,age:5}),pose(id,{time:2}),id+' action settles completely');
 assert(Object.values(pose(id,{time:NaN,power:Infinity,age:-Infinity,pointerX:NaN})).every(Number.isFinite));
}
assert.equal(signatures.size,10,'Ten different movement profiles');
for(const id of ['panther','thor','captain','tigress'])for(let time=0;time<20;time+=.1)assert(Math.abs(pose(id,{time}).y)<=5,id+' remains grounded at rest');
console.log('PASS: ten distinct idle profiles, grounded stances, bounded full-figure movement, attention/pointer reactions, distinct actions, full settling and invalid-input handling. This does not verify rendered pixels or joint animation.');
