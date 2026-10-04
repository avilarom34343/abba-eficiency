// node render.cjs v1-brackets [outDir]          → v1-brackets.mp4 (needs v1-brackets.wav from music.py)
// node render.cjs v1-brackets outDir 1.5,8,20   → preview JPGs at those seconds only
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), http = require('http');
// ES modules don't load from file://, so serve this folder locally.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf' };
const server = http.createServer((q, r) => fs.readFile(path.join(__dirname, decodeURIComponent(q.url.split('?')[0])), (e, b) => { r.writeHead(e ? 404 : 200, { 'content-type': TYPES[path.extname(q.url.split('?')[0])] || 'application/octet-stream' }); r.end(b); })).listen(0);
const [name, outDir = path.join(__dirname, 'frames', name), only] = process.argv.slice(2), FPS = 30;
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/${name}.html?render`);
  await page.waitForFunction(() => window.READY && document.fonts.status === 'loaded');
  const dur = await page.evaluate(() => window.DURATION);
  const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(dur * FPS) }, (_, f) => f / FPS);
  for (const [i, t] of times.entries()) {
    await page.evaluate(ms => window.seek(ms), t * 1000);
    await page.screenshot({ path: `${outDir}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  await browser.close(); server.close();
  if (only) return;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', FPS, '-i', `${outDir}/f%04d.jpg`, '-i', path.join(__dirname, name + '.wav'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    path.join(__dirname, name + '.mp4')].map(String), { stdio: 'inherit' });
})();
