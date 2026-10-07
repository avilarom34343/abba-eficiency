// The 100-video set.   node render100.mjs stills m001 m002   → out/m/sheet-<id>.jpg (10 frames, one per shot)
//                       node render100.mjs video 1 100         → out/m/<id>.mp4 (master) + out/m/web/<id>.mp4 (gallery copy)
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const [mode, ...rest] = process.argv.slice(2);
const root = path.dirname(new URL(import.meta.url).pathname), out = path.join(root, 'out/m');
fs.mkdirSync(path.join(out, 'web'), { recursive: true }); fs.mkdirSync(path.join(out, 'stills'), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const chromiumOptions = { gl: 'swangle' };
const TIMES = (process.env.TIMES ?? '1.6,3.6,5.9,8.2,11.5,13.7,16,18.2,20.4,23.5').split(',').map(Number);

if (mode === 'stills') {
  for (const id of rest) {
    const composition = await selectComposition({ serveUrl, id, chromiumOptions });
    const files = [];
    for (const s of TIMES) { const f = path.join(out, 'stills', `${id}-${s}.jpg`); files.push(f);
      await renderStill({ serveUrl, composition, frame: Math.round(s * 30), output: f, chromiumOptions, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.25 }); }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap(f => ['-i', f]), '-filter_complex', `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % 5) * 270}_${Math.floor(i / 5) * 480}`).join('|')}`, path.join(out, `sheet-${id}.jpg`)]);
    console.log('sheet', id);
  }
} else {
  const [a, b] = rest.map(Number);
  for (let n = a; n <= b; n++) {
    const id = `m${String(n).padStart(3, '0')}`, master = path.join(out, `${id}.mp4`), web = path.join(out, 'web', `${id}.mp4`);
    if (fs.existsSync(web)) continue;
    const t0 = Date.now(), composition = await selectComposition({ serveUrl, id, chromiumOptions });
    await renderMedia({ serveUrl, composition, codec: 'h264', crf: 20, outputLocation: master, chromiumOptions, concurrency: Number(process.env.CONC ?? 4), x264Preset: 'veryfast' });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', master, '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-maxrate', '600k', '-bufsize', '1200k', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', web]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '11.5', '-i', master, '-frames:v', '1', '-vf', 'scale=270:480', '-q:v', '5', path.join(out, 'web', `${id}.jpg`)]);
    console.log(`done ${id} ${((Date.now() - t0) / 1000).toFixed(0)}s ${(fs.statSync(web).size / 1e6).toFixed(2)}MB`);
  }
}
