"""Bundle ordered CSS sources and fingerprint local CSS/JS references."""
from pathlib import Path
import json, hashlib, re
root = Path(__file__).resolve().parents[1] / 'dist'
manifest = json.loads((root / 'styles-manifest.json').read_text(encoding='utf-8'))
for theme, sources in manifest.items():
    output = '\n'.join('/* ' + name + ' */\n' + (root / name).read_text(encoding='utf-8') for name in sources)
    (root / (theme + '.bundle.css')).write_text(output, encoding='utf-8')
    page = root / ('panda/index.html' if theme == 'panda' else 'index.html')
    html = page.read_text(encoding='utf-8')
    version = hashlib.sha256(output.encode()).hexdigest()[:12]
    html = re.sub(theme + r'\.bundle\.css\?v=[^"\s]+', theme + '.bundle.css?v=' + version, html)
    def script_version(match):
        source = match.group(1)
        script = root / source.lstrip('/')
        fingerprint = hashlib.sha256(script.read_bytes()).hexdigest()[:12]
        return source + '?v=' + fingerprint
    html = re.sub(r'(?<=src=")(/[^"?]+\.js)(?:\?[^"\s]*)?', script_version, html)
    page.write_text(html, encoding='utf-8')
    print(f'{theme}: {len(sources)} sources, {len(output.encode())} bytes')
