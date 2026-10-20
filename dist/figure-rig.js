/* Continuous 2D mesh deformation. The source artwork and its attribution stay intact. */
(function(root,factory){
 'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FigureRig=api;
})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 // Pivots, influence centres and radii were placed against the actual cutouts.
 const profiles={
  ironman:[[.53,.3,.55,.15,.15,.18,.012,.035],[.72,.38,.86,.37,.18,.25,.018,-.13],[.28,.5,.14,.61,.2,.22,-.012,.1]],
  spiderman:[[.62,.3,.64,.15,.13,.19,.014,-.05],[.7,.43,.65,.68,.14,.28,.013,.09],[.48,.17,.36,.17,.2,.16,-.016,-.12]],
  strange:[[.42,.23,.4,.14,.12,.13,.01,.035],[.48,.3,.28,.31,.24,.18,.01,-.1],[.59,.42,.78,.58,.2,.28,.023,.09]],
  panther:[[.52,.32,.54,.22,.14,.16,.014,-.05],[.28,.37,.19,.6,.16,.26,-.012,.1],[.64,.46,.7,.7,.15,.25,.013,-.08]],
  thor:[[.51,.2,.51,.13,.11,.13,.01,-.035],[.63,.24,.7,.11,.19,.19,.012,-.13],[.6,.46,.8,.69,.19,.24,.02,.1]],
  captain:[[.46,.15,.46,.08,.16,.12,.012,.04],[.71,.25,.66,.43,.31,.22,.01,-.09],[.19,.32,.12,.48,.15,.2,-.01,.07]],
  po:[[.48,.4,.45,.28,.21,.2,.015,.04],[.7,.42,.86,.19,.2,.3,.02,-.15],[.41,.69,.13,.64,.24,.22,-.018,-.13]],
  tigress:[[.52,.39,.55,.26,.23,.18,.012,-.05],[.52,.36,.4,.13,.24,.21,.02,-.13],[.51,.4,.25,.53,.27,.19,-.02,.16]],
  shifu:[[.58,.43,.6,.27,.28,.3,.015,.06],[.32,.49,.25,.59,.18,.21,.009,-.08],[.4,.75,.19,.79,.24,.2,.023,.07]],
  oogway:[[.5,.48,.49,.27,.14,.2,.01,.04],[.53,.52,.62,.36,.19,.25,.014,-.1],[.38,.63,.16,.53,.24,.28,.02,.08]]
 };
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const number=(v,f=0)=>Number.isFinite(v)?v:f;
 function deform(id,u,v,input={},aspect=1){
  const time=number(input.time),power=clamp(number(input.power),0,1),attention=clamp(number(input.attention),0,1);
  const phase=clamp(number(input.age)/1.15,0,1),gesture=Math.sin(phase*Math.PI)*power;
  aspect=clamp(number(aspect,1),.25,3);let x=u,y=v;
  const border=clamp((.97-v)/.09,0,1); // Preserve the lower edge and source artist marks.
  for(const [i,bone] of (profiles[id]||[]).entries()){
   const [px,py,cx,cy,rx,ry,idle,action]=bone,dx=(u-cx)/rx,dy=(v-cy)/ry;
   const weight=Math.exp(-(dx*dx+dy*dy)*1.8)*border;
   const a=Math.sin(time*(.95+i*.23)+i)*idle*(1+attention*.45)+gesture*action;
   const vx=(u-px)*aspect,vy=v-py,cos=Math.cos(a),sin=Math.sin(a);
   x+=((vx*cos-vy*sin)/aspect-(u-px))*weight;
   y+=(vx*sin+vy*cos-vy)*weight;
  }
  // A small torso breath connects the separate joint influences.
  const breath=Math.sin(time*1.6)*.0025*(1+attention*.25)*border;
  x+=(u-.5)*Math.exp(-Math.pow((v-.5)/.28,2))*breath;
  return [x,y];
 }
 function mesh(columns=24,rows=32){
  const uv=new Float32Array((columns+1)*(rows+1)*2),indices=new Uint16Array(columns*rows*6);
  for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){const i=(y*(columns+1)+x)*2;uv[i]=x/columns;uv[i+1]=y/rows;}
  let k=0;for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const i=y*(columns+1)+x;indices.set([i,i+1,i+columns+1,i+1,i+columns+2,i+columns+1],k);k+=6;}
  return {uv,indices};
 }
 function create(image,identity){
  const noop={draw(){},sync(){},resize(){},quiet(){},release(){}};
  if(typeof document==='undefined'||!document.createElement)return noop;
  const canvas=document.createElement('canvas');canvas.className='figure-rig';canvas.setAttribute('aria-hidden','true');
  let gl=null,program=null,texture=null,positionBuffer=null,uvBuffer=null,indexBuffer=null,ready=false,lost=false,failed=false,loadedSrc='',positions,grid,width=1,height=1,fit=[0,0,1,1],aspect=1,attached=false;
  const id=()=>typeof identity==='function'?identity():identity;
  function show(on){if(!attached)return;canvas.hidden=!on;image.classList.toggle('rig-source',on);}
  function cleanup(){if(!gl||lost)return;if(texture)gl.deleteTexture(texture);if(positionBuffer)gl.deleteBuffer(positionBuffer);if(uvBuffer)gl.deleteBuffer(uvBuffer);if(indexBuffer)gl.deleteBuffer(indexBuffer);if(program)gl.deleteProgram(program);texture=positionBuffer=uvBuffer=indexBuffer=program=null;ready=false;loadedSrc='';}
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('figure shader');}return s;}
  function setup(){
   if(ready||lost||failed)return ready;
   try{
    gl??=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,depth:false,stencil:false});
    if(!gl){failed=true;return false;}
    const vert=shader(gl.VERTEX_SHADER,'attribute vec2 aPosition;attribute vec2 aUV;uniform vec2 uViewport;uniform vec4 uFit;varying vec2 vUV;void main(){vec2 p=uFit.xy+aPosition*uFit.zw;gl_Position=vec4(p.x/uViewport.x*2.0-1.0,1.0-p.y/uViewport.y*2.0,0.0,1.0);vUV=aUV;}');
    const frag=shader(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D uImage;varying vec2 vUV;void main(){gl_FragColor=texture2D(uImage,vUV);}');
    program=gl.createProgram();gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);gl.deleteShader(vert);gl.deleteShader(frag);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('figure program');
    grid=mesh();positions=new Float32Array(grid.uv.length);
    positionBuffer=gl.createBuffer();uvBuffer=gl.createBuffer();indexBuffer=gl.createBuffer();texture=gl.createTexture();
    gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffer);gl.bufferData(gl.ARRAY_BUFFER,grid.uv,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,grid.indices,gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);ready=true;return true;
   }catch{failed=true;cleanup();show(false);return false;}
  }
  function resize(){
   if(!attached)return;
   const r=image.getBoundingClientRect(),w=image.offsetWidth||r.width,h=image.offsetHeight||r.height;if(!w||!h)return;
   const padding=20,widthCss=w+padding*2,heightCss=h+padding*2,dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<760?1.25:1.75);
   width=Math.round(widthCss*dpr);height=Math.round(heightCss*dpr);
   if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
   const style=getComputedStyle(image),origin=style.transformOrigin?.split(' ')||['50%','80%'];
   canvas.style.left=((image.offsetLeft||0)-padding)+'px';canvas.style.top=((image.offsetTop||0)-padding)+'px';canvas.style.width=widthCss+'px';canvas.style.height=heightCss+'px';
   canvas.style.transformOrigin=origin.map((n,i)=>(n.endsWith('%')?parseFloat(n)/100*(i?h:w):parseFloat(n)||0)+padding+'px').join(' ');canvas.style.filter=style.filter;
   const iw=image.naturalWidth||Number(image.getAttribute('width'))||w,ih=image.naturalHeight||Number(image.getAttribute('height'))||h,scale=Math.min(w/iw,h/ih);
   aspect=iw/ih;fit=[(padding+(w-iw*scale)/2)*dpr,(padding+(h-ih*scale)/2)*dpr,iw*scale*dpr,ih*scale*dpr];
  }
  function sync(){if(canvas.hidden)return;canvas.style.transform=image.style.transform;canvas.style.opacity=image.style.opacity||'1';}
  function draw(input={}){
   if(lost||!image.complete||!image.naturalWidth||!setup()){show(false);return;}
   try{
    const src=image.currentSrc||image.src;
    if(src!==loadedSrc){resize();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);loadedSrc=src;}
    for(let i=0;i<grid.uv.length;i+=2){const p=deform(id(),grid.uv[i],grid.uv[i+1],input,aspect);positions[i]=p[0];positions[i+1]=p[1];}
    gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,positions,gl.DYNAMIC_DRAW);
    const loc=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffer);const uvLoc=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(uvLoc);gl.vertexAttribPointer(uvLoc,2,gl.FLOAT,false,0,0);
    gl.uniform2f(gl.getUniformLocation(program,'uViewport'),width,height);gl.uniform4f(gl.getUniformLocation(program,'uFit'),...fit);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(gl.getUniformLocation(program,'uImage'),0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.drawElements(gl.TRIANGLES,grid.indices.length,gl.UNSIGNED_SHORT,0);
    show(true);sync();
   }catch{failed=true;cleanup();show(false);}
  }
  try{image.parentElement.appendChild(canvas);attached=true;canvas.hidden=true;resize();}catch{return noop;}
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;ready=false;show(false);});
  canvas.addEventListener('webglcontextrestored',()=>{lost=failed=false;program=texture=positionBuffer=uvBuffer=indexBuffer=null;ready=false;loadedSrc='';resize();});
  image.addEventListener('load',()=>{loadedSrc='';resize();});
  return {draw,sync,resize,quiet(){show(false);},release(){show(false);cleanup();canvas.width=canvas.height=1;}};
 }
 return Object.freeze({profiles,deform,mesh,create});
});
