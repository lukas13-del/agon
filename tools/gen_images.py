"""Erstellt die Übungsbilder für Agon mit Gemini (Nano Banana).

Aufruf:  python tools/gen_images.py            (alle fehlenden Bilder)
         python tools/gen_images.py bulgarian   (nur diese Übung, überschreibt)

Der API-Schlüssel kommt aus der Umgebungsvariable GOOGLE_AI_API_KEY oder aus
~/.claude/settings.json (mcpServers.nanobanana-mcp.env). Bildgenerierung braucht
in Google AI Studio eine aktivierte Abrechnung.
"""
import base64, io, json, os, re, sys, time, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MODEL = 'gemini-3.1-flash-image-preview'
URL = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'

STYLE = (
    'Minimalist Japandi-style instructional fitness illustration. Two panels side by side on one warm off-white '
    'paper background (#ECEAE4) with generous empty space between them: LEFT panel = START position, RIGHT panel = '
    'END position of the same exercise, same camera angle in both. A faceless, athletic man in plain dark grey '
    'training clothes. Fine charcoal ink line drawing with soft flat fills in muted stone grey and beige; the '
    'equipment accented in muted moss green (#56654F). Calm, clean, anatomically correct, correct technique. '
    'No text, no letters, no numbers, no arrows, no labels, no logos, no frame.'
)


def api_key():
    k = os.environ.get('GOOGLE_AI_API_KEY')
    if k:
        return k
    s = json.loads((Path.home() / '.claude' / 'settings.json').read_text(encoding='utf-8'))
    return s['mcpServers']['nanobanana-mcp']['env']['GOOGLE_AI_API_KEY']


def exercises():
    src = (ROOT / 'js' / 'data.js').read_text(encoding='utf-8')
    out = {}
    for m in re.finditer(r"^  (\w+): \{ name: '([^']+)', eq: '(\w+)'.*?steps: \[(.*?)\],", src, re.S | re.M):
        steps = re.findall(r"'([^']*)'", m.group(4))
        out[m.group(1)] = {'name': m.group(2), 'eq': m.group(3), 'steps': steps}
    return out


def generate(prompt, key):
    body = {
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '16:9', 'imageSize': '1K'}},
    }
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.loads(r.read())
    for part in data['candidates'][0]['content']['parts']:
        if 'inlineData' in part:
            return base64.b64decode(part['inlineData']['data'])
    raise RuntimeError('Keine Bilddaten in der Antwort')


def main():
    key = api_key()
    ex = exercises()
    only = sys.argv[1:]
    outdir = ROOT / 'img' / 'ex'
    outdir.mkdir(parents=True, exist_ok=True)
    for exid, d in ex.items():
        target = outdir / f'{exid}.webp'
        if only and exid not in only:
            continue
        if target.exists() and not only:
            continue
        prompt = (f"{STYLE}\nExercise: {d['name']} (German name). How it is performed: " + ' '.join(d['steps']) +
                  '\nLeft panel shows the beginning of the movement, right panel the end of the movement.')
        for attempt in range(3):
            try:
                raw = generate(prompt, key)
                img = Image.open(io.BytesIO(raw)).convert('RGB')
                img.thumbnail((960, 540))
                img.save(target, 'WEBP', quality=82)
                print('ok', exid)
                break
            except Exception as e:  # noqa: BLE001
                print('Fehler', exid, e)
                time.sleep(5 * (attempt + 1))
    have = sorted(p.stem for p in outdir.glob('*.webp'))
    (ROOT / 'js' / 'images.js').write_text(
        '// Übungen, für die ein Bild in img/ex/<id>.webp vorhanden ist\nexport const IMAGES = new Set([\n'
        + ''.join(f"  '{h}',\n" for h in have) + ']);\n', encoding='utf-8')
    print(len(have), 'Bilder vorhanden')


if __name__ == '__main__':
    main()
