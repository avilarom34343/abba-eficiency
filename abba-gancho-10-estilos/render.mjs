// Renders every style (or the ones passed as arguments) to out/<id>.mp4 + out/<id>.png (frame at 7 s, the "quiebra" punch).
//   node render.mjs                     → all 10
//   node render.mjs 03-dato-como-arte   → just one
//   node render.mjs --preview 04-objeto-3d → contact-sheet stills only (out/preview/<id>-<sec>.png)
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2), preview = args.includes('--preview');
const wanted = args.filter(a => !a.startsWith('--'));
const root = path.dirname(new URL(import.meta.url).pathname);
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const ids = fs.readdirSync(path.join(root, 'public/audio')).map(f => f.replace('.wav', '')).sort();
const chromiumOptions = { gl: 'swangle' }; // software WebGL: works on machines without a GPU
fs.mkdirSync(path.join(root, 'out/preview'), { recursive: true });

for (const id of ids.filter(i => !wanted.length || wanted.includes(i))) {
  const composition = await selectComposition({ serveUrl, id, chromiumOptions });
  if (preview) {
    for (const s of [0.6, 2.2, 3.4, 4.8, 6.3, 7.0, 7.8, 9.4]) {
      await renderStill({ serveUrl, composition, frame: Math.round(s * 30), output: path.join(root, `out/preview/${id}-${s}.png`), chromiumOptions, imageFormat: 'png' });
    }
    console.log('preview', id);
    continue;
  }
  const t0 = Date.now();
  await renderMedia({ serveUrl, composition, codec: 'h264', crf: 18, outputLocation: path.join(root, `out/${id}.mp4`), chromiumOptions, concurrency: 3 });
  await renderStill({ serveUrl, composition, frame: 210, output: path.join(root, `out/${id}.png`), chromiumOptions, imageFormat: 'png' });
  console.log(`done ${id} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
