"""Copy the reviewed, explicitly selected evidence; never bulk-publish a work folder.

Usage: python scripts/collect_local_evidence.py --hackathon-root PATH --research-root PATH
Only known non-confidential PDFs and selected source fragments are included.
"""
from pathlib import Path
import argparse, ast, hashlib, json, zipfile

parser=argparse.ArgumentParser()
parser.add_argument('--hackathon-root',type=Path,required=True)
parser.add_argument('--research-root',type=Path,required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
destination=root/'dist/assets/evidence'
records=[]

def publish(project,source,data,target,kind,scope):
    (destination/target).write_bytes(data)
    records.append({'project':project,'source':source,'published':target,'kind':kind,
                    'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),
                    'checked_on':'2026-10-20','scope':scope})

pdfs=[
 ('cropdoctor','AI CROP DOCTOR/CropDoctor_Report_2026.pdf','cropdoctor-project-report-2026.pdf','Team course report; reported capabilities and impact are not independently validated.'),
 ('agtech-intelligence-concept','AGTECH/Early Farmer Validation.pdf','agtech-early-farmer-discovery.pdf','Document-reported interviews with three farmers; explicitly not statistically significant pilot validation.'),
 ('cognitiveos-aios','AI OS/CognitiveOS.pdf','cognitiveos-founding-document.pdf','Product-vision and architecture presentation; its scale, market and performance claims are unverified.'),
 ('aquagen-systems','AWS/Coastal_AWG_Engineering_Report.pdf','aquagen-coastal-engineering-study.pdf','Concept engineering assumptions and proposed validation; not measured prototype yields or certified water quality.'),
 ('aquacore-hydraulic-desalination','HYDRAULIC INTENSIFIER SEAWATER PURIFIER/desalination_startup_report.pdf','aquacore-early-desalination-study.pdf','Related early desalination concept, not a tested hydraulic-intensifier design. No prototype or laboratory validation established.')]
for project,relative,target,scope in pdfs:
    publish(project,'project/'+relative,(args.research_root/relative).read_bytes(),target,'design-pdf',scope)
certificate='ISRO/2026H2S06BAH-P37593.pdf'
publish('climaverse','hackathon/'+certificate,(args.hackathon_root/certificate).read_bytes(),
        'climaverse-hackathon-participation.pdf','participation-certificate',
        'Participation and idea submission only; not a technical research result or winner/finalist claim.')

def source(project,base,relative,target,function=None,preamble=''):
    data=(base/relative).read_bytes()
    text=data.decode('utf-8-sig')
    if function:
        node=next(n for n in ast.parse(text).body if isinstance(n,ast.FunctionDef) and n.name==function)
        text='\n'.join(text.splitlines()[node.lineno-1:node.end_lineno])+'\n'
    else:
        # Syntax review only; no imports or application code are executed here.
        ast.parse(text)
    origin=('hackathon/' if base==args.hackathon_root else 'project/')+relative
    header=f'Reviewed source: {origin}\nOriginal file SHA-256: {hashlib.sha256(data).hexdigest()}\nChecked: 2026-10-20\nScope: Source inspection, not full application validation.\n{preamble}\n---\n'
    publish(project,origin,(header+text).encode(),target,'source-excerpt','Selected source only; not a complete application or independent result.')

source('cdis',args.hackathon_root,'AI resume/CDIS_MVP_v2.0/cdis/app/services/decision.py','cdis-alignment-source.txt','compute_alignment')
source('aletheia',args.hackathon_root,'IITM/aletheia/aletheia/aletheia/pipeline.py','aletheia-pipeline-source.txt')
source('adaptive-learning',args.research_root,'OVAEL_v0.01_FINAL/OVAEL_v0.01/src/adaptive_backend/adaptive.py','ovael-adaptive-source.txt')
source('openmythos-extension',args.research_root,'OPEN MTHYOS/OpenMythos_v4/OpenMythos_v4/open_mythos/variants.py','openmythos-configuration-source.txt',preamble='Supplied extension of upstream OpenMythos by Kye Gomez. The supplied LICENSE is MIT, copyright 2026 Kye Gomez; README license wording differs. Original license notice accompanies this excerpt.\nUpstream: https://github.com/The-Swarm-Corporation/OpenMythos\nConfigurations are not trained checkpoints or achieved benchmark scores.')
license_path='OPEN MTHYOS/OpenMythos_v4/OpenMythos_v4/LICENSE'
publish('openmythos-extension','project/'+license_path,(args.research_root/license_path).read_bytes(),
        'openmythos-supplied-license.txt','license-notice','Verbatim supplied MIT notice; README license wording differs.')

for project,base,archive,member,target in [
 ('climaverse',args.hackathon_root,'ISRO/CLIMAVERSE.zip','climaverse/climaverse/twin/ledger.py','climaverse-ledger-source.txt'),
 ('attendance-tracker-pro',args.research_root,'AI CROP DOCTOR/AttendanceTrackerPro.zip','AttendanceTrackerPro/app/src/main/java/com/attendance/tracker/data/model/SubjectAttendance.java','attendance-summary-source.txt')]:
    with zipfile.ZipFile(base/archive) as bundle:data=bundle.read(member)
    if member.endswith('.py'):ast.parse(data.decode())
    header=f'Reviewed source: {archive} :: {member}\nSource SHA-256: {hashlib.sha256(data).hexdigest()}\nScope: Selected prototype source; not a complete application or validated deployment.\n\n---\n'.encode()
    publish(project,archive+' :: '+member,header+data,target,'source-excerpt','Selected prototype component; no full application test.')

for project,base,relative,target in [
 ('cdis',args.hackathon_root,'AI resume/CDIS_MVP_v2.0/cdis/docs/ARCHITECTURE.md','cdis-architecture.md'),
 ('aletheia',args.hackathon_root,'IITM/aletheia/aletheia/ARCHITECTURE.md','aletheia-architecture.md'),
 ('adaptive-learning',args.research_root,'OVAEL_v0.01_FINAL/OVAEL_v0.01/README.md','ovael-prototype-notes.md')]:
    data=(base/relative).read_bytes()
    if 'CONFIDENTIAL' in data.decode('utf-8').upper():raise ValueError('Do not publish an internal document: '+relative)
    publish(project,relative,data,target,'architecture-notes','Supplied architecture documentation; stated outcomes have not been independently reproduced.')

(destination/'local-evidence-provenance.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(f'Collected {len(records)} reviewed files; all originals retained.')
