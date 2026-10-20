"""Small synthetic checks of supplied components. Does not validate either application."""
from pathlib import Path
import argparse, ast, hashlib, json, sys, types, zipfile
parser=argparse.ArgumentParser()
parser.add_argument('--hackathon-root',type=Path,required=True)
parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[1]/'reports/additional-component-checks.json')
args=parser.parse_args()

p=args.hackathon_root/'AI resume/CDIS_MVP_v2.0/cdis/app/services/decision.py'
text=p.read_text(encoding='utf-8');node=next(n for n in ast.parse(text).body if isinstance(n,ast.FunctionDef) and n.name=='compute_alignment')
namespace={};exec(compile(ast.Module(body=[node],type_ignores=[]),str(p),'exec'),namespace)
alignment=namespace['compute_alignment']
assert alignment({'Python':2,'SQL':1},{'Python':100,'SQL':0})['alignment_score']==67
assert alignment({'Python':2,'SQL':1},{'Python':100,'SQL':100})['alignment_score']==100
assert alignment({'Python':2,'SQL':1},{})['alignment_score']==0
assert alignment({'SQL':1,'Python':2},{'Python':100,'SQL':0})==alignment({'Python':2,'SQL':1},{'Python':100,'SQL':0})
records=[{'project':'cdis','checked_on':'2026-10-20','source_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'result':'Synthetic weighted scores match 67, 100 and 0; reordered requirements replay identically.','limits':'Only compute_alignment was executed. This is not a hiring probability, user outcome, API test or validation of the complete rule engine.'}]

with zipfile.ZipFile(args.hackathon_root/'ISRO/CLIMAVERSE.zip') as z:data=z.read('climaverse/climaverse/twin/ledger.py')
module=types.ModuleType('review_climaverse_ledger');sys.modules[module.__name__]=module
exec(compile(data,'climaverse/twin/ledger.py','exec'),module.__dict__)
ledger=module.SyncLedger();ledger.append(1,'synthetic-state-1',2,1.2);ledger.append(2,'synthetic-state-2',2,1.8)
assert ledger.verify();ledger._rows[0].mean_value=999;assert not ledger.verify()
records.append({'project':'climaverse','checked_on':'2026-10-20','source_sha256':hashlib.sha256(data).hexdigest(),'result':'A two-record synthetic sync ledger verifies; editing the first mean value is detected.','limits':'In-memory ledger only. No climate prediction, satellite ingestion, independent anchoring or forecasting skill was validated.'})
args.output.write_text(json.dumps(records,indent=2),encoding='utf-8')
print('PASS: CDIS alignment bounds/replay and CLIMAVERSE ledger/tamper scenarios. Focused synthetic component checks only.')
