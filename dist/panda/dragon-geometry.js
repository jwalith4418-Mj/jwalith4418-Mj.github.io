/* Original procedural dragon. No external models, textures, or rendering dependencies. */
(function(root){
'use strict';
const TAU=Math.PI*2;
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const jade=[.75,.40,.08],silver=[.95,.75,.28],gold=[.53,.25,.07],light=[1.,.8,.25],dark=[.27,.11,.025];
function build(options={}){
 const {time=0,progress=0,entry=1,yaw=0,pointerX=0,pointerY=0,pulse=0,mobile=false}=options;
 const vertices=[],rings=mobile?66:86,sides=16;
 const column=Math.min(1,progress*6),phase=time*.22+progress*4.2,center=mobile?0:3.2*(1-column)+Math.sin(progress*TAU)*1.8;
 function path(s){
  const a=s*9+phase;
  const hero=[3.2-s*7.6+Math.sin(a)*2.3,1.7-s*4+Math.cos(a)*1.75,Math.sin(a*.9)*1.5];
  const tower=[Math.sin(a)*2.9,3.5-s*8.7+Math.cos(a)*.7,Math.cos(a)*2];
  const p=mix(hero,tower,column);
  p[0]+=center+pointerX*(1-s)*.7;p[1]+=pointerY*(1-s)*.45;
  p[2]+=(1-entry)*-7;
  if(mobile){p[0]*=.6;p[1]*=.84;p[0]+=.5;}
  return p;
 }
 function basis(s){const p=path(s),f=unit(sub(path(s-.001),path(s+.001))),r=unit(cross([0,1,0],f)),u=unit(cross(f,r));return{p,f,r,u};}
 function local(b,v){return add(b.p,add(mul(b.r,v[0]),add(mul(b.u,v[1]),mul(b.f,v[2]))));}
 function vertex(p,n,c,e){const cs=Math.cos(yaw),sn=Math.sin(yaw),x=p[0]-center;vertices.push(x*cs+p[2]*sn+center,p[1],-x*sn+p[2]*cs,n[0]*cs+n[2]*sn,n[1],-n[0]*sn+n[2]*cs,...c,e);}
 function tri(a,b,c,color,glow=0){const n=unit(cross(sub(b,a),sub(c,a)));vertex(a,n,color,glow);vertex(b,n,color,glow);vertex(c,n,color,glow);}
 function quad(a,b,c,d,color,glow=0){tri(a,b,c,color,glow);tri(a,c,d,color,glow);}
 function cone(a,b,r,color,s=7,glow=0){const f=unit(sub(b,a)),right=unit(cross(Math.abs(f[1])>.9?[1,0,0]:[0,1,0],f)),up=cross(f,right);for(let j=0;j<s;j++){const point=t=>add(a,add(mul(right,Math.cos(t)*r),mul(up,Math.sin(t)*r)));tri(point(j/s*TAU),point((j+1)/s*TAU),b,color,glow);}}
 function ellipsoid(b,centerLocal,size,color,lat=6,lon=10,glow=0){
  function point(i,j){const a=i/lat*Math.PI,t=j/lon*TAU;return local(b,add(centerLocal,[Math.sin(a)*Math.cos(t)*size[0],Math.cos(a)*size[1],Math.sin(a)*Math.sin(t)*size[2]]));}
  for(let i=0;i<lat;i++)for(let j=0;j<lon;j++)quad(point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1),color,glow);
 }
 const spine=[];
 function radius(s){return .06+.39*Math.pow(Math.sin(Math.PI*(.06+s*.94)),.48)*(1-s*.8);}
 const frames=Array.from({length:rings+1},(_,i)=>basis(i/rings));
 const sections=frames.map((b,i)=>Array.from({length:sides+1},(_,j)=>{const a=j/sides*TAU,r=radius(i/rings);return local(b,[Math.cos(a)*r,Math.sin(a)*r*.87,0]);}));
 for(let i=0;i<rings;i++){
  const s=i/rings,b=frames[i],r=radius(s);spine.push(b.p);
  for(let j=0;j<sides;j++){const c=j>sides/2?gold:jade;quad(sections[i][j],sections[i+1][j],sections[i+1][j+1],sections[i][j+1],c);}
  if(i%2===0&&s<.95){
   // Each dorsal blade follows the local tangent of the body.
   const a=local(b,[-r*.2,r*.75,-.1]),c=local(b,[r*.2,r*.75,-.1]),tip=local(b,[0,r+.48*(1-s)+.08,-.24]);
   tri(a,c,tip,silver,.06);tri(c,local(b,[0,r*.8,.17]),tip,jade);tri(local(b,[0,r*.8,.17]),a,tip,jade);
   for(const side of [-1,1]){const p=local(b,[side*r*.78,r*.2,0]);cone(p,local(b,[side*(r+.19),r*.12,-.24]),.10,silver,5);}
  }
  if(i%3===0){
   const lit=.15+pulse*Math.exp(-Math.pow(s-(1-pulse),2)*30);
   for(const side of [-1,1])ellipsoid(b,[side*r*.89,r*.21,0],[.045,.07,.095],light,3,5,lit);
  }
 }
 spine.push(path(1));
 // Broad forehead, long muzzle, lower jaw, brows and paired illuminated eyes.
 const h=basis(0);
 ellipsoid(h,[0,.05,.1],[.43,.34,.62],jade,8,12);
 ellipsoid(h,[0,-.12,.62],[.31,.18,.46],silver,5,10);
 ellipsoid(h,[0,-.27,.51],[.27,.07,.45],gold,4,10);
 for(const side of [-1,1]){
  ellipsoid(h,[side*.32,.1,.3],[.135,.11,.18],dark,4,8);
  ellipsoid(h,[side*.405,.14,.35],[.065,.055,.1],light,4,8,1.7+pulse*2);
  cone(local(h,[side*.29,.22,.17]),local(h,[side*.5,.28,.49]),.09,gold,7);
  cone(local(h,[side*.26,.28,-.05]),local(h,[side*.39,.73,-.45]),.115,gold,8);
  cone(local(h,[side*.39,.73,-.45]),local(h,[side*.49,.91,-.78]),.064,silver,7);
  cone(local(h,[side*.38,-.04,-.05]),local(h,[side*.78,.13,-.55]),.14,jade,7);
  // Swept whiskers form two slender articulated curves.
  let last=local(h,[side*.27,-.07,.86]);
  for(let k=1;k<8;k++){const t=k/7,p=local(h,[side*(.27+t*.9),-.07+Math.sin(t*3+time*.8)*.13,.86-t*.85]);cone(last,p,.022*(1-t*.7),gold,5,.3);last=p;}
  for(let k=0;k<3;k++)cone(local(h,[side*.23,-.17,.42+k*.17]),local(h,[side*.23,-.26,.47+k*.17]),.023,silver,5);
 }
 // Four jointed legs with three claws each; joints inherit their body frame.
 for(const s of [.19,.57])for(const side of [-1,1]){
  const b=basis(s),r=radius(s),swing=Math.sin(time*.6+s*10)*.10;
  const a=local(b,[side*r,-.03,0]),k=local(b,[side*(r+.53),-.28,-.29+swing]),foot=local(b,[side*(r+.65),-.75,-.06]);
  cone(a,k,.14,jade,8);cone(k,foot,.10,jade,8);ellipsoid(b,[side*(r+.65),-.75,-.02],[.17,.1,.21],silver,4,7);
  for(let c=-1;c<=1;c++)cone(local(b,[side*(r+.65)+c*.10,-.78,.1]),local(b,[side*(r+.65)+c*.14,-.92,.34]),.046,gold,6);
 }
 const tail=basis(.96);cone(tail.p,local(tail,[0,.22,-.37]),.1,silver,7,.2);
 const turn=p=>{const cs=Math.cos(yaw),sn=Math.sin(yaw),x=p[0]-center;return[x*cs+p[2]*sn+center,p[1],-x*sn+p[2]*cs];};
 return {vertices:new Float32Array(vertices),spine:spine.map(turn),head:turn(path(0)),rings};
}
const api={build};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DragonGeometry=api;
})(typeof window!=='undefined'?window:globalThis);
