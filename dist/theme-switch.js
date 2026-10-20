/* Same-origin portfolio themes. Each document owns and releases its own effects. */
(() => {
 'use strict';
 const THEME_KEY='jwalith.portfolio.theme', STATE_KEY='jwalith.portfolio.switch';
 const themes=['marvel','panda'], sections=['home','selected-work','work','writing','about','global-exposure','contact'];
 const current=document.documentElement.dataset.portfolioTheme;
 if(!themes.includes(current))return;
 const read=(storage,key)=>{try{return window[storage].getItem(key);}catch{return null;}};
 const write=(storage,key,value)=>{try{window[storage].setItem(key,value);}catch{}};
 const clear=()=>{try{window.sessionStorage.removeItem(STATE_KEY);}catch{}};
 const pageFor=theme=>theme==='panda'?'/panda/index.html':'/';
 const requested=new URL(location.href).searchParams.get('theme');
 const remembered=read('localStorage',THEME_KEY);
 const desired=themes.includes(requested)?requested:themes.includes(remembered)?remembered:current;
 if(desired!==current){
  const destination=new URL(location.href);destination.pathname=pageFor(desired);destination.searchParams.set('theme',desired);
  location.replace(destination.href);return;
 }
 write('localStorage',THEME_KEY,current);
 const warmed=new Set(),prefetched=new Set();
 function allowedWarmup(){
  const connection=window.navigator?.connection;
  return !document.hidden&&!connection?.saveData&&!/^(?:slow-)?2g$/.test(connection?.effectiveType||'');
 }
 async function warmTheme(target){
  if(!themes.includes(target)||target===current||warmed.has(target)||!allowedWarmup()||typeof window.fetch!=='function'||typeof window.DOMParser!=='function')return;
  warmed.add(target);
  const url=new URL(pageFor(target),location.href);url.searchParams.set('theme',target);
  try{
   const response=await window.fetch(url.href,{credentials:'same-origin',cache:'force-cache'});
   if(!response.ok)throw Error('Theme warmup unavailable');
   const html=await response.text();if(!allowedWarmup())return;
   const page=new window.DOMParser().parseFromString(html,'text/html');
   const existing=new Set([...document.querySelectorAll('script[src],link[href],img[src]')].map(node=>new URL(node.getAttribute('src')||node.getAttribute('href'),location.href).href));
   for(const node of page.querySelectorAll('script[src],link[rel="stylesheet"],link[rel="preload"][as="image"]')){
    const source=node.getAttribute('src')||node.getAttribute('href');if(!source)continue;
    const asset=new URL(source,url);
    if(asset.origin!==url.origin||existing.has(asset.href)||prefetched.has(asset.href))continue;
    const hint=document.createElement('link');hint.rel='prefetch';hint.href=asset.href;hint.setAttribute('fetchpriority','low');
    document.head.appendChild(hint);prefetched.add(asset.href);
   }
  }catch{warmed.delete(target);}
 }
 function init(){
  const body=document.body, switchLink=document.getElementById('portfolio-theme-switch');
  if(!body||!switchLink)return;
  let navigating=false,restoreCancelled=false;
  const intent=event=>{const link=event.target.closest?.('[data-theme-link]');if(link)warmTheme(link.dataset.themeLink);};
  document.addEventListener('pointerover',intent,{passive:true});document.addEventListener('focusin',intent);
  function view(){
   const line=Math.min(innerHeight*.35,220);
   const available=sections.map(id=>document.getElementById(id)).filter(Boolean);
   let anchor=available[0];
   for(const element of available)if(element.getBoundingClientRect().top<=line)anchor=element;
   if(!anchor)return {section:'home',progress:0};
   const rect=anchor.getBoundingClientRect();
   return {section:anchor.id,progress:Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height)))};
  }
  document.addEventListener('click',event=>{
   const link=event.target.closest?.('[data-theme-link]');
   if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const target=link.dataset.themeLink;
   if(!themes.includes(target)||target===current)return;
   event.preventDefault();if(navigating)return;navigating=true;
   const state=view(), detail=/^#(?:project|essay)\//.test(location.hash);
   const destination=new URL(link.href,location.href);
   destination.pathname=pageFor(target);destination.searchParams.set('theme',target);
   destination.hash=detail?location.hash:'#'+state.section;
   write('sessionStorage',STATE_KEY,JSON.stringify({...state,to:target,hash:destination.hash,reading:body.classList.contains('reading-mode'),paused:body.classList.contains('motion-paused'),stamp:Date.now()}));
   write('localStorage',THEME_KEY,target);
   link.setAttribute('aria-busy','true');
   // Mute an opted-in sound layer and freeze outgoing effects before navigation.
   const sound=document.getElementById('sound-toggle');
   if(sound?.getAttribute('aria-pressed')==='true')sound.click();
   body.classList.add('motion-paused');
   // Start the navigation immediately; keep the outgoing page visible while it loads.
   location.assign(destination.href);
  });
  let state;try{state=JSON.parse(read('sessionStorage',STATE_KEY)||'null');}catch{state=null;}
  clear();
  const valid=state&&state.to===current&&state.hash===location.hash&&sections.includes(state.section)&&Number.isFinite(state.progress)&&state.progress>=0&&state.progress<=1&&Number.isFinite(state.stamp)&&Date.now()-state.stamp>=0&&Date.now()-state.stamp<30000;
  if(valid){
   if(state.reading&&!body.classList.contains('reading-mode'))document.getElementById('reading-toggle')?.click();
   if(state.paused&&!body.classList.contains('motion-paused'))document.getElementById('motion-toggle')?.click();
   if(!/^#(?:project|essay)\//.test(location.hash)){
    const restoreUntil=Date.now()+1200;
    const cancel=()=>{restoreCancelled=true;};
    for(const name of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(name,cancel,{once:true,passive:true});
    const restore=()=>{
     if(restoreCancelled||Date.now()>restoreUntil||location.hash!==state.hash)return null;
     const anchor=document.getElementById(state.section);if(!anchor)return null;
     const rect=anchor.getBoundingClientRect(),top=scrollY+rect.top;
     window.scrollTo({top:Math.max(0,top+rect.height*state.progress),behavior:'instant'});
     return anchor;
    };
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
     const anchor=restore();
     if(anchor){anchor.setAttribute('tabindex','-1');anchor.focus({preventScroll:true});}
    }));
    // Reconcile late fonts/images briefly; user input cancels every correction.
    document.fonts?.ready.then(restore).catch(()=>{});
    window.setTimeout(restore,280);window.setTimeout(restore,700);
   }
  }
  window.addEventListener('pageshow',event=>{
   if(!event.persisted)return;
   navigating=false;body.classList.remove('theme-leaving');
   body.classList.toggle('motion-paused',document.getElementById('motion-toggle')?.getAttribute('aria-pressed')==='true');
   document.querySelectorAll('[data-theme-link]').forEach(link=>link.removeAttribute('aria-busy'));
   write('localStorage',THEME_KEY,current);
  });
 }
 // Register after the existing deferred applications so their controls are ready.
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
