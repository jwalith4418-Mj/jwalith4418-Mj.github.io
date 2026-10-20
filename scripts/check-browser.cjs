const path=require('node:path');
const reportDir=path.join(__dirname,'../reports');
/* Real Chromium UI smoke tests. Start the static server on port 8000 first. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),results=[];
 const widths=process.argv.slice(2).map(Number).filter(n=>n>=320&&n<=2560);
 for(const theme of ['marvel','panda'])for(const width of widths.length?widths:[1440,390]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  await page.goto('http://localhost:8000/'+(theme==='panda'?'panda/index.html':'')+'?theme='+theme);
  await page.waitForTimeout(700);
  const total=await page.evaluate(()=>PORTFOLIO.projects.length);
  assert.equal(await page.locator('.project-card').count(),total);
  assert.equal(await page.locator('.latest-project').count(),1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page overflow '+theme+width);
  // Open every project through its real delegated button and inspect all evidence destinations.
  for(const id of await page.evaluate(()=>PORTFOLIO.projects.map(p=>p.id))){
   await page.evaluate(id=>document.querySelector('[data-open-project="'+id+'"]').click(),id);
   await page.locator('#detail-dialog').waitFor({state:'visible'});
   assert.equal(await page.locator('.resource-panel').count(),1);
   assert.equal(await page.locator('.resource-list>div').count(),7);
   assert.equal(await page.locator('#detail-title').evaluate(e=>document.activeElement===e),true);
   for(const href of await page.locator('.resource-panel a,.supporting-resources a').evaluateAll(a=>a.map(e=>e.getAttribute('href')))){
    assert(!/^(?:javascript:|null|#)$/.test(href));
    if(href.startsWith('/'))assert((await page.request.get('http://localhost:8000'+href)).ok(),href);
   }
   const hasCase=await page.evaluate(id=>!!PORTFOLIO.projects.find(p=>p.id===id).caseStudy,id);
   if(hasCase)assert.equal(await page.locator('.technical-case>section').count(),6);
   if(id==='tes-website'){
    assert.equal(await page.locator('a[href="https://github.com/TESIIITM/TES-Website/pull/32"]').count(),1);
    assert.equal(await page.locator('a[href="https://github.com/TESIIITM/TES-Website/pull/35"]').count(),1);
   }
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#detail-dialog').evaluate(e=>e.open),false);
  }
  await page.locator('[data-filter="ai"]').click({force:true});
  assert.equal(await page.locator('.project-card').count(),await page.evaluate(()=>PORTFOLIO.projects.filter(p=>p.group==='ai').length));
  await page.locator('[data-filter="all"]').click({force:true});
  await page.locator('#view-toggle').click({force:true});
  await page.locator('#project-search').fill('Blackbox');
  assert.equal(await page.locator('.index-card').count(),1);
  await page.locator('#project-search').fill('no-such-project-763');
  assert(await page.locator('#search-empty').isVisible());
  await page.locator('#project-search').fill('');
  await page.evaluate(()=>document.querySelector('#work').scrollIntoView({behavior:'instant'}));
  await page.waitForTimeout(200);
  await page.screenshot({path:path.join(reportDir,`work-${theme}-${width}.png`)});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(100);
  assert(await page.locator('body').evaluate(e=>e.classList.contains('reduced-motion')));
  // Deep links and themes remain independent static documents.
  await page.goto('http://localhost:8000/'+(theme==='panda'?'panda/index.html':'')+'?theme='+theme+'#project/blackbox');
  await page.locator('#detail-dialog').waitFor({state:'visible'});
  assert.equal(await page.locator('#detail-title').textContent(),'Blackbox');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  results.push({theme,width,projects:total,errors,missing,passed:true});
  await context.close();
 }
 // Actual theme navigation and all arcade choices.
 const context=await browser.newContext(),page=await context.newPage();
 await page.goto('http://localhost:8000/?theme=marvel');
 await page.locator('[data-theme-link="panda"]').first().click();
 await page.waitForURL('**/panda/index.html?theme=panda**');
 assert.equal(await page.locator('html').getAttribute('data-portfolio-theme'),'panda');
 await page.goto('http://localhost:8000/arcade/index.html?theme=panda');
 assert.equal(await page.locator('[data-game]').count(),3);
 for(const game of ['reactor','web','reflex']){
  await page.locator('[data-game="'+game+'"]').click();
  await page.locator('#start-game').click();
  assert((await page.locator('#game-status').textContent()).includes('Round started'));
  await page.locator('#pause-game').click();
  assert((await page.locator('#game-status').textContent()).includes('Round paused'));
 }
 await page.goto('http://localhost:8000/?theme=marvel');
 await page.waitForTimeout(3200);
 assert(await page.locator('body').evaluate(e=>e.classList.contains('motion-resting')),'Ambient motion rests');
 await page.mouse.move(300,300);
 assert(await page.evaluate(()=>PortfolioActivity.active()),'Interaction wakes the scene');
 await page.locator('[data-hero="ironman"]').click();
 assert(await page.locator('.art-ironman').evaluate(e=>e.classList.contains('powered')),'Character power still responds after resting');
 await context.close();await browser.close();
 const reportPath=path.join(reportDir,'browser-tests.json');
 const previous=fs.existsSync(reportPath)?JSON.parse(fs.readFileSync(reportPath,'utf8')):[];
 const combined=[...previous.filter(a=>!results.some(b=>a.theme===b.theme&&a.width===b.width)),...results];
 fs.writeFileSync(reportPath,JSON.stringify(combined,null,2));
 console.log(`PASS: ${results.length} browser configurations; every project, evidence URL, dialog, filter, search, reduced motion, deep link, theme navigation, arcade play/pause, idle rest and character wake.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
