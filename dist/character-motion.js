/* Bounded whole-figure choreography for the existing transparent artwork. */
(function(root,factory){
 'use strict';
 const motion=factory();
 if(typeof module==='object'&&module.exports)module.exports=motion;
 else root.CharacterMotion=motion;
})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 const ids=Object.freeze(['ironman','spiderman','strange','panther','thor','captain','po','tigress','shifu','oogway']);
 const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 function pose(id,input={}){
  const t=finite(input.time)%10000,energy=clamp(finite(input.power),0,1),attention=clamp(finite(input.attention),0,1);
  const phase=clamp(finite(input.age)/1.15,0,1),pulse=Math.sin(phase*Math.PI),follow=Math.sin(phase*Math.PI*2)*energy;
  const px=clamp(finite(input.pointerX),-1,1),py=clamp(finite(input.pointerY),-1,1),gain=1+attention*.65;
  let x=px*(8+attention*9),y=-py*(5+attention*5),rotation=px*(1+attention*1.4),scale=1;
  switch(id){
   case 'ironman':
    x+=Math.sin(t*.7)*4*gain;y+=Math.sin(t*1.45)*13*gain-pulse*43*energy;
    rotation+=Math.sin(t*.7)*.65+follow*3;scale+=energy*.025;break;
   case 'spiderman':
    x+=Math.sin(t*1.12)*23*gain+follow*52;y+=Math.cos(t*2.24)*5*gain-pulse*20*energy;
    rotation+=Math.sin(t*1.12)*3.7*gain+follow*11;break;
   case 'strange':
    y+=Math.sin(t*.88)*11*gain-pulse*18*energy;rotation+=Math.sin(t*.6)*1.2+follow*5;
    scale+=Math.sin(t*.88)*.005+energy*.035;break;
   case 'panther':
    x+=Math.sin(t*.8)*2*gain+follow*39;y+=1-Math.cos(t*1.6)+pulse*7*energy;
    rotation+=follow*5;scale+=Math.sin(t*1.6)*.004+pulse*.025*energy;break;
   case 'thor':
    x+=Math.sin(t*.65)*2;y+=Math.sin(t*1.3)*1.5-pulse*23*energy;
    rotation+=Math.sin(t*.65)*.4-follow*4;scale+=Math.sin(t*1.3)*.003;break;
   case 'captain':
    x+=Math.sin(t*.75)*4*gain+follow*24;y+=Math.cos(t*1.5)*1.5;
    rotation+=Math.sin(t*.75)*.8+follow*9;scale+=pulse*.02*energy;break;
   case 'po':
    x+=Math.sin(t*.95)*6*gain;y+=Math.sin(t*1.9)*8*gain-pulse*48*energy;
    rotation+=Math.sin(t*.95)*1.7+follow*10;scale+=Math.cos(t*1.9)*.006+pulse*.04*energy;break;
   case 'tigress':
    x+=Math.sin(t*1.15)*5*gain+follow*65;y+=Math.cos(t*2.3)*2+energy*pulse*5;
    rotation+=Math.sin(t*1.15)*.6-follow*10;scale+=Math.sin(t*2.3)*.004;break;
   case 'shifu':
    x+=Math.sin(t*.85)*3;y+=Math.cos(t*1.7)*2-pulse*24*energy;
    rotation+=Math.sin(t*.85)*2*gain+follow*17;break;
   case 'oogway':
    y+=Math.sin(t*.7)*6*gain-pulse*22*energy;rotation+=Math.sin(t*.7)*.8;
    scale+=Math.sin(t*.7)*.005+pulse*.025*energy;break;
  }
  return {x:clamp(x,-95,95),y:clamp(y,-85,40),rotation:clamp(rotation,-24,24),scale:clamp(scale,.96,1.07)};
 }
 return Object.freeze({ids,pose});
});
