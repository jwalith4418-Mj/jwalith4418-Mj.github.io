/* Optional evidence lives with each project in content.js. Never turn a missing URL into a link. */
(() => {
 'use strict';
 const labels={repository:'GitHub repository',demo:'Live demo',research:'Research / design PDF',source:'Source / contribution',report:'Technical documentation',media:'Screenshots / video'};
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function url(value){
  if(typeof value!=='string')return null;
  if(/^\/assets\/evidence\/[a-zA-Z0-9_./-]+$/.test(value)&&!value.includes('..'))return value;
  try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}
 }
 function resources(p){
  const data={...(p.evidence||{})};
  if(p.repository_url&&!data.repository)data.repository={url:p.repository_url};
  if(p.demo_url&&!data.demo)data.demo={url:p.demo_url};
  return data;
 }
 function summary(p){
  const items=Object.entries(resources(p)).filter(([,v])=>url(v?.url));
  return '<span class="evidence-preview">'+(items.length?items.length+' inspectable '+(items.length===1?'resource':'resources'):'Evidence links pending')+'</span>';
 }
 function capture(p){
  const media=p.evidence?.media,href=url(media?.url);
  if(media?.kind!=='image'||!href)return '';
  return '<figure class="project-capture"><a href="'+escape(href)+'" target="_blank" rel="noopener noreferrer"><img src="'+escape(href)+'" alt="'+escape(media.alt||p.name+' interface capture')+'" width="1440" height="1000" loading="lazy" decoding="async"></a><figcaption>'+escape(media.note||'Product interface capture')+'</figcaption></figure>';
 }
 function supporting(p){
  const items=(p.supportingResources||[]).filter(item=>url(item?.url));
  if(!items.length)return '';
  return '<section class="supporting-resources" aria-label="Additional project evidence"><h3>More evidence</h3><ul>'+items.map(item=>'<li><a href="'+escape(url(item.url))+'" target="_blank" rel="noopener noreferrer">'+escape(item.label||'Open evidence')+' ↗</a>'+(item.note?'<p>'+escape(item.note)+'</p>':'')+'</li>').join('')+'</ul></section>';
 }
 function render(p){
  const data=resources(p);
  return '<section class="resource-panel" aria-label="Project evidence"><div class="resource-heading"><p class="eyebrow">OPEN THE EVIDENCE</p><h3>Inspect the work.</h3><p>Published artifacts and availability, in one place.</p></div><dl class="resource-list">'+Object.entries(labels).map(([key,label])=>{
   const item=data[key],href=url(item?.url);
   return '<div><dt>'+label+'</dt><dd>'+(href?'<a href="'+escape(href)+'" target="_blank" rel="noopener noreferrer">'+escape(item.label||'Open resource')+' ↗</a>'+(item.note?'<small>'+escape(item.note)+'</small>':'')+(url(item.attribution?.url)?'<small><a href="'+escape(url(item.attribution.url))+'" target="_blank" rel="noopener noreferrer">'+escape(item.attribution.label)+' ↗</a></small>':''):'<span class="resource-pending">'+escape(item?.status||(key==='research'?'PDF not supplied':'Link not supplied'))+'</span>')+'</dd></div>';
  }).join('')+'<div><dt>Technical case study</dt><dd>'+(p.caseStudy?'Six-part case study below':'Scope and validation notes below; full architecture write-up pending')+'</dd></div></dl><p class="resource-footnote">Character illustrations represent the theme. Only explicitly labelled product captures demonstrate an application.</p></section>'+supporting(p)+capture(p);
 }
 function caseStudy(p){
  if(!p.caseStudy)return '';
  return '<section class="technical-case"><p class="eyebrow">TECHNICAL CASE STUDY</p>'+Object.entries(p.caseStudy).map(([title,text])=>'<section><h3>'+escape(title)+'</h3><p>'+escape(text)+'</p></section>').join('')+'</section>';
 }
 window.ProjectResources=Object.freeze({render,summary,url,caseStudy});
 function install(){
  const projects=window.PORTFOLIO?.projects||[];
  for(const node of document.querySelectorAll('[data-project-total]'))node.textContent=projects.length;
  for(const button of document.querySelectorAll('[data-filter]')){
   const count=button.querySelector('span');
   if(count)count.textContent=projects.filter(p=>button.dataset.filter==='all'||p.group===button.dataset.filter).length;
  }
  const featured=projects.find(p=>p.featured),toolbar=document.querySelector('.work-toolbar');
  if(featured&&toolbar){
   const article=document.createElement('article');article.className='latest-project';
   article.innerHTML='<div><p class="eyebrow">FEATURED / '+escape(featured.stage)+'</p><h3>'+escape(featured.displayName||featured.name)+'</h3></div><p>'+escape(featured.summary)+'</p><button type="button" data-open-project="'+escape(featured.id)+'">'+escape(featured.featuredAction||'Inspect the project')+' ↗</button>';
   toolbar.before(article);
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
