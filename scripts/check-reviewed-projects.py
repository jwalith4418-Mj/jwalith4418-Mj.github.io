import importlib.util,sys,json,hashlib,math,copy
from pathlib import Path
from fractions import Fraction as F
import argparse
parser=argparse.ArgumentParser(description='Focused component checks against the supplied project source. This is not a full application test.')
parser.add_argument('--source-root',type=Path,required=True)
base=parser.parse_args().source_root
paths={'cropdoctor':base/'AI CROP DOCTOR/aicropfinal/intelligence/physics.py','nexus':base/'Nexus/nexus-decision-twin-v18/nexus-rin/backend/forward_ledger/ledger.py','veritas':base/'openai/VERITAS_V6_2/VERITAS_V6_1/src/veritas/celv/lra.py'}
def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);module=importlib.util.module_from_spec(spec);sys.modules[name]=module;spec.loader.exec_module(module);return module
crop=load('review_crop',paths['cropdoctor']);et=crop.et0_hargreaves(32,22,16.8,150);assert math.isfinite(et) and et>0
start=50.;dry=crop.water_balance_step(start,'Rice','mid','Loamy',et,0,0);wet=crop.water_balance_step(start,'Rice','mid','Loamy',et,10,0);assert 0<=dry<start<wet<=100
assert crop.water_balance_step(99,'Rice','mid','Loamy',et,500,0)==100
ledger=load('review_ledger',paths['nexus'])
class MemoryStore:
 def load(self):return []
 def append(self,entry):pass
store=MemoryStore();chain=ledger.Ledger(store)
for t in [1000,1001,1002]:chain.append(ledger.Prediction('Test decision',['a','b'],[.6,.4],0,.6,'Test reasoning','Test watch'),created_at=t)
assert chain.verify();chain._entries[0].prediction['decision']='edited'
try:chain.verify();raise AssertionError('Tamper went undetected')
except ledger.TamperError:pass
lra=load('review_lra',paths['veritas']);cons=[lra.LinCons.make({'x':F(-1)},F(3),False,[11]),lra.LinCons.make({'x':F(1)},F(-2),False,[22])];result=lra.is_satisfiable(cons);assert result.sat is False;assert lra.check_core(cons,result.core);assert not lra.check_core(cons,[11]);sat=[lra.LinCons.make({'x':F(-1)},F(1),False,[33]),lra.LinCons.make({'x':F(1)},F(-2),False,[44])];w=lra.is_satisfiable(sat);assert w.sat and all(c.satisfied_by(w.model) for c in sat)
print('PASS: supplied Python source: crop water-balance scenarios, ledger integrity and tamper detection, exact contradictory/satisfiable constraints and rechecked core. Focused synthetic examples only; no full application, field or deployment validation.')
