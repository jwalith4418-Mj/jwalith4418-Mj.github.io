(() => {
  'use strict';
  const palettes = {ironman:'#8deaff',spiderman:'#e7efff',strange:'#ffbc6b',panther:'#b297ff',thor:'#e4bc7d',captain:'#d9e7f4'};
  const anchors={ironman:[.84,.4],spiderman:[.71,.93],strange:[.5,.43],panther:[.5,.45],thor:[.655,.05],captain:[.635,.43]};
  function anchor(image,id,input={}){
    const r=image.getBoundingClientRect(),iw=image.naturalWidth||Number(image.getAttribute('width'))||750,ih=image.naturalHeight||Number(image.getAttribute('height'))||1000;
    const fit=Math.min(r.width/iw,r.height/ih),original=anchors[id]||[.5,.5];
    const [x,y]=image.classList.contains('rig-source')&&window.FigureRig?window.FigureRig.deform(id,...original,input,iw/ih):original;
    return{x:r.left+(r.width-iw*fit)/2+x*iw*fit,y:r.top+(r.height-ih*fit)/2+y*ih*fit};
  }
  function create(canvas, id, image) {
    let ctx = null, width = 1, height = 1;
    try { ctx = canvas.getContext('2d'); } catch {}
    if (!ctx) { canvas.hidden = true; return {resize(){},draw(){},clear(){}}; }
    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      width = Math.max(1, r.width); height = Math.max(1, r.height);
      const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function clear() { ctx.clearRect(0,0,width,height); }
    function draw(power, time, age=0, attention=0) {
      clear();
      const iw = image.naturalWidth || Number(image.getAttribute('width')) || 750;
      const ih = image.naturalHeight || Number(image.getAttribute('height')) || 1000;
      const fit = Math.min(width / iw, height / ih), w = iw * fit, h = ih * fit;
      const left = (width - w) / 2, top = (height - h) / 2;
      const point = (x,y) => {const p=image.classList.contains('rig-source')&&window.FigureRig?window.FigureRig.deform(id,x,y,{time,power,age,attention},iw/ih):[x,y];return [left+p[0]*w,top+p[1]*h];};
      const glow = (x,y,r,alpha) => {
        ctx.globalAlpha=alpha;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      };
      const circle = (x,y,r,alpha,start=0,end=Math.PI*2) => {
        ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,Math.max(1,r),start,end);ctx.stroke();
      };
      const line = (points,alpha) => {
        ctx.globalAlpha=alpha;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();
      };
      ctx.fillStyle=ctx.strokeStyle=ctx.shadowColor=palettes[id];ctx.lineWidth=1.25;
      if (id==='ironman') {
        const [x,y]=point(.52,.47);
        glow(x,y,Math.max(3,w*.014),.23+Math.sin(time*1.4)*.06+power*.38+attention*.16);
        if(attention>.02){
          circle(x,y,w*.13,.12*attention,time*.9,time*.9+Math.PI*1.5);
          circle(x,y,w*.18,.1*attention,-time*.7,-time*.7+Math.PI);
        }
        if(power>0){
          const hand=point(.84,.4);
          glow(...hand,Math.max(4,w*.02),power*.6);
          circle(...hand,12+(1-power)*w*.45,power*.6);
          circle(x,y,22+(1-power)*w*.29,power*.34);
          for(let i=0;i<24;i++){
            const a=i*Math.PI*2/24, r=20+(1-power)*(w*.48+i%3*12);
            line([[x+Math.cos(a)*r,y+Math.sin(a)*r],[x+Math.cos(a)*(r+12),y+Math.sin(a)*(r+12)]],power*.65);
          }
        }
      } else if (id==='spiderman') {
        const origin=point(.71,.93), end=point(.96,.06);
        // A taut strand and travelling glint connect the figure to the web scene.
        line([origin,end],.12+attention*.2);
        const glint=(time*.35)%1;
        glow(origin[0]+(end[0]-origin[0])*glint,origin[1]+(end[1]-origin[1])*glint,1.3,.25+attention*.3);
        if(power>0){
          const travel=Math.min(1,(1-power)*5);
          line([origin,[origin[0]+(end[0]-origin[0])*travel,origin[1]+(end[1]-origin[1])*travel]],power*.9);
          for(let i=0;i<10;i++){
            const angle=i*Math.PI*2/10, radius=w*.38*travel;
            line([end,[end[0]+Math.cos(angle)*radius,end[1]+Math.sin(angle)*radius]],power*.35);
          }
          for(let i=1;i<4;i++)circle(...end,w*.1*i*travel,power*.35);
        }
      } else if(id==='strange') {
        const [x,y]=point(.5,.43),radius=w*.32;
        circle(x,y,radius,.18+attention*.18,time*.2,time*.2+Math.PI*1.5);
        if(power>0){
          circle(x,y,radius*(1.1+(1-power)*.45),power*.7);
          for(let i=0;i<32;i++){
            const a=i*.196+time, r=radius*(1.2+(1-power)*.7);
            glow(x+Math.cos(a)*r,y+Math.sin(a)*r,1.5,power*.7);
          }
        }
      } else if(id==='panther') {
        const [x,y]=point(.5,.45);
        if(attention>.02)for(let i=0;i<3;i++){
          const phase=(time*.3+i/3)%1;
          circle(x,y,w*(.08+phase*.33),(1-phase)*attention*.18);
        }
        if(power>0)for(let i=0;i<4;i++)circle(x,y,Math.max(3,w*((1-power)*.65+i*.08)),power*(.6-i*.1));
      } else if(id==='thor') {
        const target=point(.655,.05);
        glow(...target,Math.max(3,w*.018),.12+power*.38+attention*.12);
        if(power>0){
          const charge=Math.min(1,age/.25),strike=age>=.25&&age<.88?Math.sin((age-.25)/.63*Math.PI):0;
          circle(...target,6+charge*w*.055,power*.35);
          for(let i=0;i<7;i++){
            const a=i*Math.PI*2/7+time*.6,r=w*.085*(1-charge*.6);
            line([[target[0]+Math.cos(a)*r,target[1]+Math.sin(a)*r],target],power*.24);
          }
          if(strike>0){
            ctx.lineWidth=2;ctx.shadowBlur=16;line([target,point(.73,.11),point(.66,.16),point(.75,.21)],strike*.7);ctx.shadowBlur=0;
            glow(...target,Math.max(4,w*.03),strike*.45);
          }
          if(age>.55)circle(...target,(age-.55)*w*.7,power*.4);
        }
      } else if(id==='captain') {
        const [x,y]=point(.635,.43),r=w*.34;
        if(attention>.02)circle(x,y,r*.82,attention*.25,time*.8,time*.8+Math.PI*.7);
        if(power>0){
        circle(x,y,r*(1+(1-power)*.55),power*.6);
        circle(x,y,r*.75,power*.4);
        const path=[];
        for(let i=0;i<26;i++){
          const a=i*.11+time*2;path.push([x+Math.cos(a)*r*1.4,y+Math.sin(a)*r*.65]);
        }
        ctx.lineWidth=2;line(path,power*.7);
        }
      }
      // Small drifting sparks remain local to the visible character scene.
      if(id!=='spiderman' && id!=='captain')for(let i=0;i<8;i++){
        const [x,y]=point(((i*.173+time*.012)%1),((i*.239-time*.018)%1+1)%1);
        glow(x,y,.9,.12);
      }
      ctx.globalAlpha=1;ctx.shadowBlur=0;
    }
    resize();return {resize,draw,clear};
  }
  window.HeroEffects=Object.freeze({create,anchor});
})();
