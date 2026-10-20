(() => {
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const colors={ironman:'#8bddff',spiderman:'#c9e9ff',strange:'#ffbd72',panther:'#bda1ff',thor:'#c2d4e8',captain:'#d9e7f4'};
  const pointer={x:.5,y:.5,sx:.5,sy:.5};
  let enabled=true, target=null, lastDraw=-100, scrollPulse=0;
  const fields=[...document.querySelectorAll('[data-environment]')].map(canvas=>{
    let ctx=null;try{ctx=canvas.getContext('2d');}catch{}
    if(!ctx)canvas.hidden=true;
    const section=canvas.closest('[data-chapter]');
    return {id:canvas.dataset.environment,canvas,ctx,section,figure:section.querySelector('[data-hero]'),width:0,height:0,pulse:0,age:0,seed:1,origin:{x:.5,y:.45}};
  });
  function setMode(on,quiet=false){
    enabled=on;document.getElementById('web-pulse').disabled=!on;
    if(quiet)for(const f of fields){f.pulse=0;if(f.ctx)f.ctx.clearRect(0,0,f.width,f.height);}
  }
  function trigger(id,x=.5,y=.45){
    if(!enabled||document.hidden||document.body.classList.contains('modal-open'))return;
    const f=fields.find(f=>f.id===id);if(!f)return;
    f.pulse=1;f.age=0;f.seed++;f.origin={x:clamp(x,0,1),y:clamp(y,0,1)};
  }
  function resize(){for(const f of fields){f.width=0;f.height=0;}}
  function configure(f,r){
    const w=Math.max(1,r.width),h=Math.max(1,Math.min(innerHeight,r.height));
    if(w!==f.width||h!==f.height){
      f.width=w;f.height=h;
      const dpr=Math.min(devicePixelRatio||1,innerWidth<760?1.25:1.5);
      f.canvas.width=Math.round(w*dpr);f.canvas.height=Math.round(h*dpr);
      f.canvas.style.height=h+'px';f.ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    const offset=clamp(-r.top,0,Math.max(0,r.height-f.height));
    f.canvas.style.top=offset.toFixed(1)+'px';return r.top+offset;
  }
  function draw(f,time,viewportTop){
    const {ctx:c,width:w,height:h,pulse:p}=f;
    c.clearRect(0,0,w,h);c.strokeStyle=c.fillStyle=colors[f.id];c.lineWidth=1;c.shadowBlur=0;
    const line=(pts,alpha)=>{c.globalAlpha=alpha;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();};
    const ring=(x,y,r,alpha,start=0,end=Math.PI*2)=>{c.globalAlpha=alpha;c.beginPath();c.arc(x,y,Math.max(1,r),start,end);c.stroke();};
    const dot=(x,y,r,alpha)=>{c.globalAlpha=alpha;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
    const mx=pointer.sx*w,my=pointer.sy*innerHeight-viewportTop;
    const ox=f.origin.x*w,oy=f.origin.y*h;
    if(f.id==='spiderman'){
      // Curved silk rings and a compressed foreground hammock.
      const hubs=[[w*.9,h*.16,1],[w*.08,h*.95,.85],[w*.77,h*.72,.3]];
      const count=w<760?18:28;
      function bend(x,y){
        const dx=mx-x,dy=my-y,dist=Math.hypot(dx,dy),tension=Math.exp(-dist*dist/(w*w*.032));
        const distance=Math.hypot(ox-x,oy-y);
        const ripple=p*Math.sin(distance*.025-f.age*10)*Math.exp(-Math.abs(distance-f.age*w*.32)/(w*.17));
        return[x+dx*tension*.045+Math.sin(time*.6+y*.008)*1.5+ripple*10,y+dy*tension*.045+Math.cos(time*.6+x*.008)*1.5+ripple*8];
      }
      for(let hub=0;hub<hubs.length;hub++){
        const [x,y,depth]=hubs[hub],radius=Math.max(w,h)*(hub===2?.58:.95);
        c.lineWidth=hub===2?1.15:.65;
        for(let i=0;i<count;i++){
          const a=i*Math.PI*2/count,pts=[[x,y]];
          for(let j=1;j<=8;j++){
            const d=radius*j/8;
            pts.push(bend(x+Math.cos(a)*d,y+Math.sin(a)*d*depth));
          }
          line(pts,(hub===2?.27:.075)+p*.075);
        }
        for(let j=1;j<=11;j++){
          const pts=[],r=radius*j/12;
          for(let i=0;i<=count*5;i++){
            const a=i*Math.PI*2/(count*5),sag=1-.035*Math.sin((i%5)/5*Math.PI);
            pts.push(bend(x+Math.cos(a)*r*sag,y+Math.sin(a)*r*sag*depth));
          }
          line(pts,(hub===2?.22:.065)+p*.075);
        }
      }
      // Travelling glints follow the hammock's radial threads.
      c.lineWidth=1;
      for(let i=0;i<(w<760?10:18);i++){
        const a=i*Math.PI*2/count,r=((time*18+i*59)%Math.max(w,h))*.58;
        dot(w*.77+Math.cos(a)*r,h*.72+Math.sin(a)*r*.3,1.1,.22);
      }
      if(target&&target.isConnected!==false){
        const r=target.getBoundingClientRect(),x=r.left+r.width/2,y=r.top-viewportTop+12;
        line([[w*.94,0],[x+(w*.94-x)*.6,y*.25],[x,y]],.3);
        dot(x,y,3,.45);
      }
      if(p>0)for(let i=0;i<3;i++)ring(ox,oy,f.age*w*.38+i*20,p*(.4-i*.09));
      if(mx>=0&&mx<=w&&my>=0&&my<=h){ring(mx,my,12,.2);dot(mx,my,2,.28);}
    }else if(f.id==='ironman'){
      const x=w*.22+pointer.sx*12,y=h*.48;
      for(let i=0;i<4;i++)ring(x,y,Math.min(w,h)*(.22+i*.055),.085,time*.12+i,time*.12+i+Math.PI*1.6);
      for(let i=0;i<12;i++){
        const y=h*.12+i*h*.065;line([[w*.035,y],[w*.065,y],[w*.065+18,y-8]],.13);
      }
      if(p>0){ring(ox,oy,30+f.age*Math.max(w,h)*.52,p*.34);for(let i=0;i<24;i++){const a=i*Math.PI/12,r=f.age*w*.52;line([[ox+Math.cos(a)*r,oy+Math.sin(a)*r],[ox+Math.cos(a)*(r+45),oy+Math.sin(a)*(r+45)]],p*.3);}}
    }else if(f.id==='strange'){
      const x=w*.78,y=h*.49,r=Math.min(w,h)*.34;
      for(let i=0;i<3;i++)ring(x,y,r+i*18,.12+i*.015,time*(i%2?.1:-.1),time*(i%2?.1:-.1)+Math.PI*1.72);
      for(let i=0;i<35;i++){const a=i*.18+time*.12;dot(x+Math.cos(a)*r,y+Math.sin(a)*r,1.25,.18);}
      if(p>0)for(let i=0;i<4;i++)ring(ox,oy,(.15+f.age*.28)*Math.max(w,h)+i*16,p*.22,time*.6+i,time*.6+i+Math.PI*1.65);
    }else if(f.id==='panther'){
      // Sparse angular suit channels replace the repeating wallpaper lattice.
      for(let side=0;side<2;side++)for(let i=0;i<7;i++){
        const x=side?w*(.88-i*.024):w*(.08+i*.024),y=h*(i*.14-.05);
        const response=Math.exp(-Math.hypot(mx-x,my-y)/220);
        const dx=(side?-1:1)*w*.055;
        line([[x,y],[x+dx,y+h*.1],[x+dx*.65,y+h*.15],[x+dx*1.5,y+h*.24]],.055+response*.15+p*.08);
        dot(x+dx,y+h*.1,1.7,.15+response*.2);
      }
      for(let i=0;i<16;i++){
        const x=(i*.173*w+Math.sin(time*.12+i)*12+w)%w,y=(i*.237*h-time*8+h*10)%h;
        dot(x,y,1.2,.16);
      }
      if(p>0){
        c.lineWidth=1.6;
        for(let i=0;i<3;i++){
          const spread=f.age*w*.22,x=ox+(i-1)*(18+spread*.12);
          line([[x-spread*.25,oy-spread*.55],[x+spread*.2,oy],[x-spread*.08,oy+spread*.55]],p*.38);
        }
        c.lineWidth=1;
        for(let i=0;i<3;i++)ring(ox,oy,20+f.age*w*.31+i*18,p*(.2-i*.04));
      }
    }else if(f.id==='thor'){
      const anchor=window.HeroEffects?.anchor(f.figure.querySelector('img'),'thor');
      const hx=anchor?anchor.x:ox,hy=anchor?anchor.y-viewportTop:oy;
      // Silver rain and restrained gold stay strongest around Thor.
      c.strokeStyle='#e4bc7d';
      const floorY=Math.min(h*.82,Math.max(h*.45,hy+h*.65));
      for(let i=0;i<3;i++){
        const pts=[];for(let j=0;j<=56;j++){const a=j*Math.PI*2/56;pts.push([w*.76+Math.cos(a)*w*(.11+i*.015),floorY+Math.sin(a)*h*(.04+i*.007)]);}
        line(pts,.08);
      }
      c.strokeStyle=colors.thor;
      for(let i=0;i<(w<760?32:65);i++){
        const x=(i*137.7+time*(18+pointer.sx*8))%w,y=(i*197.3+time*(85+i%4*9))%h;
        line([[x,y],[x-7,y+28+i%3*9]],.08+p*.035);
      }
      if(p>0){
        const age=f.age,charge=clamp(age/.25,0,1),strike=age>=.25&&age<.88?Math.sin((age-.25)/.63*Math.PI):0;
        ring(hx,hy,12+charge*20,(age<.5?.2:.07)*p);
        if(strike>0){
          // Stable geometry per activation: a single strike, without random flashing.
          const start=[w*.82,-24],end=[hx,hy],pts=[start];
          for(let i=1;i<17;i++){
            const t=i/17,noise=Math.sin(i*7.31+f.seed*3.7)*w*.028*Math.sin(t*Math.PI);
            pts.push([start[0]+(end[0]-start[0])*t+noise,start[1]+(end[1]-start[1])*t]);
          }
          pts.push(end);c.lineWidth=8;c.shadowColor='#e4bc7d';c.shadowBlur=22;line(pts,strike*.2);
          c.shadowBlur=0;c.strokeStyle='#fff6d0';c.lineWidth=2;line(pts,strike*.8);
          for(const index of [4,8,12]){
            const branch=[pts[index]],sign=index===8?1:-1;
            for(let j=1;j<6;j++)branch.push([pts[index][0]+sign*w*.02*j+Math.sin(j*8+f.seed)*w*.009,pts[index][1]+h*.024*j]);
            c.lineWidth=1;line(branch,strike*.35);
          }
        }
        c.strokeStyle=colors.thor;c.lineWidth=1;
        if(age>.55){
          const wave=clamp(1-(age-.55)/1.75,0,1),r=(age-.55)*Math.max(w,h)*.38;
          for(let i=0;i<3;i++)ring(hx,hy,r+i*15,wave*(.28-i*.06));
          for(let i=0;i<20;i++){const a=i*Math.PI/10;dot(hx+Math.cos(a)*r,hy+Math.sin(a)*r,1.7,wave*.3);}
        }
      }
    }else if(f.id==='captain'){
      const anchor=window.HeroEffects?.anchor(f.figure.querySelector('img'),'captain');
      const x=anchor?anchor.x:ox,y=anchor?anchor.y-viewportTop:oy;
      // Ambient flecks stay close to the figure; no oversized idle orbits.
      for(let i=0;i<8;i++)dot(x+Math.sin(i*1.9+time*.08)*Math.min(w*.09,100),y+Math.cos(i*1.3+time*.06)*h*.22,1,.08);
      if(p>0&&f.age<1.5){
        const travel=clamp(f.age/.85,0,1),reach=Math.min(w*.13,150),pts=[];
        for(let i=0;i<18;i++){
          const t=Math.max(0,travel-i*.018),a=t*Math.PI*1.8;
          pts.push([x+Math.sin(a)*reach,y+(1-Math.cos(a))*h*.1]);
        }
        c.lineWidth=2;line(pts,p*.45);c.lineWidth=1;
        const [sx,sy]=pts[0];ring(sx,sy,10,p*.5);ring(sx,sy,15,p*.22);
        if(f.age>.65){
          const strength=clamp(1-(f.age-.65)/.85,0,1);
          c.strokeStyle='#f47b7e';
          for(let i=0;i<12;i++){
            const a=i*Math.PI/6,r=12+(f.age-.65)*70;
            line([[sx+Math.cos(a)*r,sy+Math.sin(a)*r],[sx+Math.cos(a)*(r+10),sy+Math.sin(a)*(r+10)]],strength*.3);
          }
        }
      }
    }
    c.globalAlpha=1;c.lineWidth=1;c.shadowBlur=0;
  }
  function frame(time,dt){
    if(!enabled||document.hidden)return;
    pointer.sx+=(pointer.x-pointer.sx)*(1-Math.exp(-dt*8));pointer.sy+=(pointer.y-pointer.sy)*(1-Math.exp(-dt*8));
    for(const f of fields)if(f.pulse>0){f.age+=dt;f.pulse=Math.max(0,1-f.age/2.6);}
    if(time-lastDraw<.032)return;lastDraw=time;
    for(const f of fields){
      if(!f.ctx)continue;
      const r=f.section.getBoundingClientRect();
      if(r.bottom<=0||r.top>=innerHeight){
        if(f.width){f.canvas.width=f.canvas.height=1;f.width=f.height=0;}
        continue;
      }
      const top=configure(f,r);draw(f,time,top);
      if(f.id==='spiderman'||f.id==='thor'){
        const figure=f.figure.getBoundingClientRect();
        f.canvas.style.opacity=figure.bottom>0&&figure.top<innerHeight?'1':'.16';
      }
    }
  }
  function reset(){for(const f of fields){f.pulse=0;f.age=0;}target=null;}
  document.getElementById('web-pulse').addEventListener('click',()=>{
    trigger('spiderman',.5,.48);
    if(enabled){window.HeroAudio?.play('spiderman');document.getElementById('hero-status').textContent='SPIDER-MAN / WEB PULSE';}
  });
  document.addEventListener('pointermove',e=>{
    pointer.x=clamp(e.clientX/innerWidth,0,1);pointer.y=clamp(e.clientY/innerHeight,0,1);
    const section=e.target.closest?.('[data-chapter]');
    target=section?.dataset.chapter==='spiderman'?e.target.closest('.project-card')||e.target.closest('.index-card'):null;
  },{passive:true});
  document.addEventListener('pointerleave',()=>{target=null;});
  document.addEventListener('click',e=>{
    const section=e.target.closest?.('[data-chapter]');if(!section||e.target.closest('[data-hero]')||e.target.closest('#web-pulse'))return;
    if(section.dataset.chapter!=='spiderman')return;
    const r=section.getBoundingClientRect(),offset=clamp(-r.top,0,Math.max(0,r.height-innerHeight));
    trigger('spiderman',(e.clientX-r.left)/Math.max(1,r.width),(e.clientY-r.top-offset)/innerHeight);
  });
  document.getElementById('project-track').addEventListener('scroll',()=>{
    if(performance.now()-scrollPulse<260)return;scrollPulse=performance.now();trigger('spiderman',.5,.8);
  },{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  window.ChapterEnvironments=Object.freeze({frame,setMode,trigger,reset});
})();
