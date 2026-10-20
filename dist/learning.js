(() => {
 'use strict';
 const buttons=[...document.querySelectorAll('[data-learning-filter]')];
 const groups=[...document.querySelectorAll('[data-learning-group]')];
 const records=[...document.querySelectorAll('[data-learning-record]')];
 const count=document.getElementById('learning-count');
 if(!count)return;
 const labels={all:'learning & experience records',program:'selected programs',certification:'certifications',experience:'experience records'};
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const chosen=button.dataset.learningFilter;
  buttons.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  groups.forEach(group=>{group.hidden=chosen!=='all'&&group.dataset.learningGroup!==chosen;});
  const total=records.filter(r=>chosen==='all'||r.dataset.learningRecord===chosen).length;
  count.textContent=total+' '+labels[chosen];
 }));
})();
