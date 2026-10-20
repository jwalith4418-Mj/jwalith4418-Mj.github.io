const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.join(__dirname,'../dist');
const context={window:{},URL,document:{readyState:'loading',addEventListener(){}}};
for(const f of ['content.js','project-resources.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),context);
const {PORTFOLIO:data,ProjectResources:api}=context.window;
const ids=new Set();
for(const p of data.projects){
 assert(!ids.has(p.id),'Duplicate id '+p.id);ids.add(p.id);
 for(const key of ['id','name','displayName','category','summary','stage','scope','group','number'])assert.equal(typeof p[key],'string',p.id+' '+key);
 for(const item of Object.values(p.evidence||{})){
  if(!item.url)continue;
  assert(api.url(item.url),'Unsafe URL '+item.url);
  if(item.url.startsWith('/'))assert(fs.existsSync(path.join(root,item.url)),item.url);
 }
 for(const item of p.supportingResources||[]){assert(api.url(item.url));if(item.url.startsWith('/'))assert(fs.existsSync(path.join(root,item.url)),item.url);}
 assert.equal((api.render(p).match(/<dt>/g)||[]).length,7);
 assert(!api.render(p).includes('href="null"'));
}
for(const bad of ['javascript:alert(1)','data:text/html,hi','//evil.example','/assets/evidence/../secret','https://user:pass@example.com'])assert.equal(api.url(bad),null,bad);
assert(!api.render({evidence:{demo:{url:'javascript:alert(1)'}}}).includes('href='));
assert(api.render({evidence:{demo:{status:'<img onerror=alert(1)>'}}}).includes('&lt;img'));
for(const file of JSON.parse(fs.readFileSync(path.join(root,'assets/evidence/blackbox-provenance.json'),'utf8'))){
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/evidence',file.published))).digest('hex'),file.sha256);
}
for(const file of JSON.parse(fs.readFileSync(path.join(root,'assets/evidence/local-evidence-provenance.json'),'utf8'))){
 const bytes=fs.readFileSync(path.join(root,'assets/evidence',file.published));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256,file.published);
 assert(ids.has(file.project),file.project);
 if(['design-pdf','participation-certificate'].includes(file.kind))assert.equal(bytes.subarray(0,5).toString(),'%PDF-',file.published);
}
console.log(`PASS: ${ids.size} project schemas, resource paths, protocol rejection, escaped text, PDF signatures and Blackbox/local artifact fingerprints.`);
