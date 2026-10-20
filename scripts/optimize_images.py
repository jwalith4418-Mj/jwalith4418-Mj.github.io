"""Generate WebP derivatives, keep original artwork, update runtime references."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]/'dist'
report=root.parent/'reports/image-savings.json'
changes={item['derivative']:item for item in json.loads(report.read_text(encoding='utf-8'))} if report.exists() else {}
for folder in ['marvel','kungfu']:
 for image in (root/'assets'/folder).iterdir():
  if image.suffix.lower() not in ['.png','.webp'] or image.stat().st_size<120000 or image.stem.endswith('-optimized'): continue
  if image.suffix.lower()=='.png' and image.with_suffix('.webp').exists(): continue
  output=image.with_name(image.stem+'-optimized.webp')
  if output.exists(): continue
  with Image.open(image) as im:
   im.thumbnail((1100,1500),Image.Resampling.LANCZOS)
   im.save(output,'WEBP',quality=84,method=4)
  if output.stat().st_size>=image.stat().st_size: output.unlink();continue
  # File names in the character registry are relative; full paths occur in CSS/HTML.
  for p in root.rglob('*'):
   if p.is_file() and p.suffix in ['.js','.css','.html'] and 'assets' not in p.relative_to(root).parts:
    s=p.read_text(encoding='utf-8');updated=s.replace(image.name,output.name)
    if s!=updated:p.write_text(updated,encoding='utf-8')
  changes[str(output.relative_to(root))]={'original':str(image.relative_to(root)),'derivative':str(output.relative_to(root)), 'before':image.stat().st_size,'after':output.stat().st_size}
report.write_text(json.dumps(list(changes.values()),indent=2),encoding='utf-8')
print(f'{len(changes)} derivatives inventoried (originals retained).')
