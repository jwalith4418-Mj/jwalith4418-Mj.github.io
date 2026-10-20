/* Local chi rings and bounded particle effects, driven by the character's frame loop. */
(() => {
 'use strict';
 const tau=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const colors={po:'#ffd77f',tigress:'#ffb66b',shifu:'#f3dfb2',oogway:'#c5dfb0'};
 function create(canvas){
  const noop={resize(){},draw(){},clear(){},release(){}};
  if(!canvas)return noop;
  let ctx;try{ctx=canvas.getContext('2d');}catch{}
  if(!ctx){canvas.hidden=true;return noop;}
  let width=0,height=0,dpr=1,active=false,compact=true;
  function resize(){
   const rect=canvas.parentElement.getBoundingClientRect();
   width=Math.max(1,Math.min(1600,rect.width));height=Math.max(1,Math.min(1200,rect.height));
   compact=innerWidth<=760||(innerWidth<=1024&&innerHeight<=500);
   dpr=Math.min(devicePixelRatio||1,compact?1.5:2);
   const w=Math.round(width*dpr),h=Math.round(height*dpr);
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   ctx.setTransform(dpr,0,0,dpr,0,0);active=true;canvas.hidden=false;
  }
  function clear(){if(active)ctx.clearRect(0,0,width,height);}
  function release(){clear();canvas.width=canvas.height=1;canvas.hidden=true;active=false;}
  function draw({character='po',time=0,power=0,attention=0}={}){
   if(!active)return;
   time=Number.isFinite(time)?time:0;power=clamp(Number.isFinite(power)?power:0,0,1);attention=clamp(Number.isFinite(attention)?attention:0,0,1);
   clear();const x=width*.5,y=height*.49,r=Math.max(1,Math.min(width*.42,height*.43));
   ctx.strokeStyle=ctx.fillStyle=colors[character]||colors.po;ctx.lineCap='round';ctx.lineWidth=1.2;
   const arc=(radius,start,end,alpha)=>{ctx.globalAlpha=clamp(alpha,0,1);ctx.beginPath();ctx.arc(x,y,Math.max(1,radius),start,end);ctx.stroke();};
   const line=(points,alpha)=>{ctx.globalAlpha=clamp(alpha,0,1);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();};
   const point=(angle,radius)=>[x+Math.cos(angle)*radius,y+Math.sin(angle)*radius];
   const glow=(px,py,size,alpha)=>{ctx.globalAlpha=clamp(alpha,0,1);ctx.beginPath();ctx.arc(px,py,size,0,tau);ctx.fill();};
   const spin=time*(character==='oogway'?.09:.16),brightness=.22+attention*.14+power*.38;
   arc(r,spin,spin+tau*.79,brightness);arc(r*.85,-spin*.8,-spin*.8+tau*.72,brightness*.75);
   // Small geometric marks travel with the two counter-rotating rings.
   const marks=compact?24:36;
   for(let i=0;i<marks;i++){
    const a=i*tau/marks+spin,inner=i%3===0?.91:.96;
    line([point(a,r*inner),point(a,r)],brightness*(i%3===0?1:.65));
   }
   for(let i=0;i<6;i++){
    const a=i*tau/6-spin*.8,center=point(a,r*.85),s=Math.max(2,r*.028);
    line([[center[0],center[1]-s],[center[0]+s,center[1]],[center[0],center[1]+s],[center[0]-s,center[1]],[center[0],center[1]-s]],brightness*.9);
   }
   // Fixed particle count; no growing arrays or new timers during powers.
   const sparks=compact?16:28;
   for(let i=0;i<sparks;i++){
    const a=i*2.39996+time*(i%2?-.13:.17),phase=(time*.19+i*.137)%1;
    const radius=r*(.7+phase*.36),p=point(a,radius),tail=point(a-.03,radius);
    line([tail,p],(.12+power*.65)*(1-phase));glow(...p,i%4===0?1.6:1,.16+power*.3);
   }
   if(power>.01){
    const age=1-power;
    for(let i=0;i<3;i++)arc(r*(.36+age*.67+i*.08),0,tau,power*(.5-i*.12));
    if(character==='tigress'){
     ctx.lineWidth=2;
     for(let i=0;i<3;i++)line([[x-r*.8+i*r*.18,y+r*.47],[x-r*.23+i*r*.18,y-r*.42],[x+r*.53+i*r*.1,y-r*.62]],power*.72);
    }else if(character==='shifu'){
     for(let i=0;i<8;i++){const a=i*tau/8+spin;line([point(a,r*(.94-age*.36)),point(a,r*.38)],power*.45);}
     arc(r*(.65-age*.35),0,tau,power*.75);
    }else if(character==='oogway'){
     for(let i=0;i<7;i++){
      const a=i*tau/7-time*.16,p=point(a,r*(.55+age*.45)),s=r*.07;
      line([[p[0]-s,p[1]],[p[0],p[1]-s*.5],[p[0]+s,p[1]],[p[0],p[1]+s*.5],[p[0]-s,p[1]]],power*.65);
     }
    }else{
     for(let i=0;i<(compact?20:32);i++){const a=i*tau/(compact?20:32)+spin;line([point(a,r*(.55+age*.4)),point(a,r*(.63+age*.43))],power*.65);}
    }
   }
   ctx.globalAlpha=1;ctx.lineWidth=1;ctx.shadowBlur=0;
  }
  resize();return {resize,draw,clear,release};
 }
 window.PandaChiEffects=Object.freeze({create});
})();
