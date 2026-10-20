/* Native WebGL scene: continuous scroll travel, articulated mesh, inertial orbit, energy wake. */
(() => {
'use strict';
const canvas=document.getElementById('dragon-world'),fallback=document.getElementById('dragon-fallback');
if(!canvas||!window.DragonGeometry)return;
const status=document.getElementById('dragon-status'),wake=document.getElementById('dragon-wake'),surface=document.getElementById('dragon-control');
let gl;try{gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});}catch{}
const fail=()=>{canvas.hidden=true;fallback.hidden=false;document.body.classList.add('dragon-unavailable');wake.disabled=true;surface.hidden=false;status.textContent='CHARACTERS READY · CHI RESTING';};
if(!gl){fail();return;}
const vertex=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;attribute float aGlow;uniform mat4 uProjection;varying vec3 vPosition;varying vec3 vNormal;varying vec3 vColor;varying float vGlow;void main(){vPosition=aPosition;vNormal=aNormal;vColor=aColor;vGlow=aGlow;gl_Position=uProjection*vec4(aPosition,1.0);}`;
const fragment=`precision mediump float;varying vec3 vPosition;varying vec3 vNormal;varying vec3 vColor;varying float vGlow;uniform float uTime;uniform float uPulse;void main(){vec3 n=normalize(vNormal),eye=normalize(vec3(0.,0.,17.)-vPosition);float rim=pow(1.-abs(dot(n,eye)),2.5);float key=max(0.,dot(n,normalize(vec3(-.6,.8,1.))));float fill=max(0.,dot(n,normalize(vec3(.9,-.4,.6))));float spec=pow(max(0.,dot(reflect(-normalize(vec3(-.6,.8,1.)),n),eye)),24.);vec3 prism=vec3(1.,.68,.22)*(.75+.25*cos(dot(n,eye)*5.+vPosition.y*.35));vec3 color=vColor*(.35+key*1.1)+vec3(.22,.11,.04)*fill+prism*rim*.38+vec3(1.,.8,.4)*spec*.8+vec3(1.,.68,.16)*vGlow*(.45+uPulse*.8);float fog=clamp((17.-vPosition.z-12.)/22.,0.,.62);color=mix(color,vec3(.035,.018,.005),fog);gl_FragColor=vec4(color,1.);}`;
const bgVertex=`attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}`;
const bgFragment=`precision mediump float;uniform vec2 uResolution;uniform float uTime;uniform float uProgress;uniform vec2 uPointer;uniform float uPulse;float hash(vec2 p){return fract(sin(dot(mod(p,vec2(37.,31.)),vec2(12.9898,7.233)))*143.5453);}void main(){vec2 uv=gl_FragCoord.xy/uResolution, p=(uv-.5)*vec2(uResolution.x/uResolution.y,1.);float h=sin(p.x*2.2+uTime*.08+sin(p.y*3.))*cos(p.y*2.8-uProgress*3.);float mist=exp(-length(p-vec2(.35*sin(uProgress*6.),.12))*2.);vec3 c=vec3(.017,.008,.003)+vec3(.04,.02,.005)*mist*(.6+h*.3);c+=vec3(.048,.020,.014)*exp(-length(p+vec2(.5,.3))*3.);vec2 cell=floor(gl_FragCoord.xy/3.);float star=step(.9993,hash(cell));c+=vec3(.65,.36,.08)*star*(.4+.4*sin(uTime+hash(cell)*20.));float flare=exp(-length(uv-uPointer)*5.);c+=vec3(.12,.055,.005)*flare*(.2+uPulse*.9);c*=1.-.45*length(uv-.5);gl_FragColor=vec4(c,1.);}`;
function program(vs,fs){const p=gl.createProgram();for(const [type,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader compilation failed');gl.attachShader(p,s);gl.deleteShader(s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Shader linking failed');return p;}
const particleVertex=`attribute vec3 aPosition;attribute vec3 aColor;attribute float aSize;uniform mat4 uProjection;uniform float uRatio;varying vec3 vColor;void main(){vColor=aColor;vec4 p=uProjection*vec4(aPosition,1.);gl_Position=p;gl_PointSize=aSize*uRatio*17./p.w;}`;
const particleFragment=`precision mediump float;varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5)*2.;float a=exp(-d*d*6.)*.6;if(d>1.)discard;gl_FragColor=vec4(vColor*a,a);}`;
let dragon,bg,particles;try{dragon=program(vertex,fragment);bg=program(bgVertex,bgFragment);particles=program(particleVertex,particleFragment);}catch{fail();return;}
function uniforms(p,names){return Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));}
const du=uniforms(dragon,['uProjection','uTime','uPulse']),bu=uniforms(bg,['uResolution','uTime','uProgress','uPointer','uPulse']);
const pu=uniforms(particles,['uProjection','uRatio']),dust=gl.createBuffer(),particleAttrs=[['aPosition',3,0],['aColor',3,12],['aSize',1,24]].map(([n,size,offset])=>({loc:gl.getAttribLocation(particles,n),size,offset}));
const mesh=gl.createBuffer(),quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
const attrs=[['aPosition',3,0],['aNormal',3,12],['aColor',3,24],['aGlow',1,36]].map(([n,size,offset])=>({loc:gl.getAttribLocation(dragon,n),size,offset})),bgAttr=gl.getAttribLocation(bg,'aPosition');
let raf=0,last=0,clock=0,progress=0,targetProgress=0,yaw=0,targetYaw=0,galleryOrbit=0,targetGalleryOrbit=0,pulse=0,entry=0,dragging=false,dragX=0,dragYaw=0,lost=false,shown=true,paused=false,quiet=false;
const pointer={x:0,y:0,sx:0,sy:0},clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function projection(aspect){const f=1/Math.tan(Math.PI/8),near=.1,far=80;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,(2*far*near)/(near-far)-17*(far+near)/(near-far),17]);}
function resize(){const ratio=Math.min(devicePixelRatio||1,innerWidth<760?1.4:1.7);canvas.width=Math.round(innerWidth*ratio);canvas.height=Math.round(innerHeight*ratio);gl.viewport(0,0,canvas.width,canvas.height);schedule();}
function updateTarget(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);targetProgress=clamp(scrollY/max,0,1);schedule();}
function modes(){paused=document.body.classList.contains('motion-paused');quiet=document.body.classList.contains('reading-mode')||document.body.classList.contains('reduced-motion');shown=!document.hidden&&!document.body.classList.contains('modal-open');canvas.style.opacity=quiet||lost?'0':(targetProgress<.2?'.86':'.42');wake.disabled=quiet||paused||lost;status.textContent=quiet?'READING MODE':lost?'CHARACTERS READY · CHI RESTING':paused?'INNER PEACE · MOTION PAUSED':'CHOOSE A GUIDE · RELEASE YOUR CHI';if(raf&&(quiet||!shown)){cancelAnimationFrame(raf);raf=0;}if(!quiet&&shown)schedule();}
document.addEventListener('portfolio-activity',schedule);
function schedule(){if(!raf&&!lost&&!quiet&&shown)raf=requestAnimationFrame(frame);}
function frame(now){
 raf=0;if(lost||quiet||!shown)return;if(!paused&&last&&now-last<32){schedule();return;}const dt=Math.min(.05,Math.max(.001,(now-(last||now-16))/1000));last=now;
 if(!paused){clock+=dt;entry=clamp(clock/4.4,0,1);entry=1-Math.pow(1-entry,3);progress+=(targetProgress-progress)*(1-Math.exp(-dt*5));yaw+=(targetYaw-yaw)*(1-Math.exp(-dt*7));galleryOrbit+=(targetGalleryOrbit-galleryOrbit)*(1-Math.exp(-dt*4));pointer.sx+=(pointer.x-pointer.sx)*(1-Math.exp(-dt*4));pointer.sy+=(pointer.y-pointer.sy)*(1-Math.exp(-dt*4));pulse=Math.max(0,pulse-dt*.38);}
 gl.disable(gl.DEPTH_TEST);gl.useProgram(bg);gl.bindBuffer(gl.ARRAY_BUFFER,quad);for(const a of attrs)gl.disableVertexAttribArray(a.loc);gl.enableVertexAttribArray(bgAttr);gl.vertexAttribPointer(bgAttr,2,gl.FLOAT,false,0,0);gl.uniform2f(bu.uResolution,canvas.width,canvas.height);gl.uniform1f(bu.uTime,clock);gl.uniform1f(bu.uProgress,progress);gl.uniform2f(bu.uPointer,.5+pointer.sx*.5,.5+pointer.sy*.5);gl.uniform1f(bu.uPulse,pulse);gl.drawArrays(gl.TRIANGLES,0,6);
 const model=window.DragonGeometry.build({time:clock,progress,entry,yaw:yaw+galleryOrbit+pointer.sx*.12-(1-entry)*1.15,pointerX:pointer.sx,pointerY:pointer.sy,pulse,mobile:innerWidth<760});
 gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.useProgram(dragon);gl.bindBuffer(gl.ARRAY_BUFFER,mesh);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.DYNAMIC_DRAW);
 for(const a of attrs){gl.enableVertexAttribArray(a.loc);gl.vertexAttribPointer(a.loc,a.size,gl.FLOAT,false,40,a.offset);}const matrix=projection(innerWidth/innerHeight);gl.uniformMatrix4fv(du.uProjection,false,matrix);gl.uniform1f(du.uTime,clock);gl.uniform1f(du.uPulse,pulse);gl.drawArrays(gl.TRIANGLES,0,model.vertices.length/10);
 const count=innerWidth<760?220:540,points=new Float32Array(count*7);
 for(let i=0;i<count;i++){const s=(i/count+clock*.024)%1,idx=Math.min(model.spine.length-1,Math.floor(s*(model.spine.length-1))),p=model.spine[idx],a=i*2.399+clock*.2,r=.36+(i%7)*.11;points.set([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r,p[2]+Math.sin(a*.73)*r,.75+(i%5)*.025,.35+(i%7)*.03,.07+(i%3)*.03,(i%16===0?14:3)+pulse*9],i*7);}
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);gl.useProgram(particles);gl.bindBuffer(gl.ARRAY_BUFFER,dust);gl.bufferData(gl.ARRAY_BUFFER,points,gl.DYNAMIC_DRAW);for(const a of attrs)gl.disableVertexAttribArray(a.loc);for(const a of particleAttrs){gl.enableVertexAttribArray(a.loc);gl.vertexAttribPointer(a.loc,a.size,gl.FLOAT,false,28,a.offset);}gl.uniformMatrix4fv(pu.uProjection,false,matrix);gl.uniform1f(pu.uRatio,canvas.width/innerWidth);gl.drawArrays(gl.POINTS,0,count);gl.depthMask(true);gl.disable(gl.BLEND);
 if(!paused&&window.PortfolioActivity?.active()!==false)schedule();
}
function ignite(){if(quiet||paused)return;pulse=1;status.textContent='GOLDEN CHI AWAKENED';wake.classList.add('ignited');setTimeout(()=>{wake.classList.remove('ignited');modes();},2600);schedule();}
wake.addEventListener('click',ignite);
surface.addEventListener('pointerdown',e=>{if(quiet||paused||e.button>0)return;dragging=true;dragX=e.clientX;dragYaw=targetYaw;surface.setPointerCapture(e.pointerId);surface.classList.add('dragging');});
surface.addEventListener('pointermove',e=>{if(dragging)targetYaw=dragYaw+(e.clientX-dragX)/innerWidth*3;schedule();});
const release=()=>{dragging=false;surface.classList.remove('dragging');};surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);surface.addEventListener('lostpointercapture',release);window.addEventListener('blur',release);
surface.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetYaw+=e.key==='ArrowRight'?.22:-.22;schedule();}if(e.key==='Home'){targetYaw=0;schedule();}});
window.addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth*2-1;pointer.y=1-e.clientY/innerHeight*2;},{passive:true});
window.addEventListener('scroll',updateTarget,{passive:true});window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;modes();});
new MutationObserver(modes).observe(document.body,{attributes:true,attributeFilter:['class']});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;canvas.hidden=true;if(raf)cancelAnimationFrame(raf);raf=0;fallback.hidden=false;modes();});
canvas.addEventListener('webglcontextrestored',()=>location.reload());
window.DragonExperience={focusProject(index){targetGalleryOrbit=index*.31;schedule();}};
resize();updateTarget();modes();
})();
