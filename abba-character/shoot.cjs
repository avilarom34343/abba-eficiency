// node shoot.cjs     → dot-01.png … dot-10.png  (index.html cards + dot3d.html)
// node shoot.cjs v2  → dot2-01.png … dot2-10.png (v2.html?v=1..10)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http');
const root = path.join(__dirname, '..'), T = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf' };
const server = http.createServer((q, r) => fs.readFile(path.join(root, decodeURIComponent(q.url.split('?')[0])), (e, b) => { r.writeHead(e ? 404 : 200, { 'content-type': T[path.extname(q.url.split('?')[0])] || 'application/octet-stream' }); r.end(b); })).listen(0);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  p.on('pageerror', e => console.error(e.message));
  let n = 0;
  const v2 = process.argv[2] === 'v2', prefix = v2 ? 'dot2' : 'dot';
  const pages = v2 ? Array.from({ length: 10 }, (_, i) => `v2.html?v=${i + 1}`) : ['index.html', 'dot3d.html'];
  for (const page of pages) {
    await p.goto(`http://127.0.0.1:${server.address().port}/abba-character/${page}`);
    await p.waitForFunction(() => window.READY);
    for (const card of await p.$$('.card')) await card.screenshot({ path: path.join(__dirname, `${prefix}-${String(++n).padStart(2, '0')}.png`) });
  }
  await b.close(); server.close();
})();
