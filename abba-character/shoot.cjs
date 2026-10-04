// node shoot.cjs → dot-01.png … dot-10.png (cards from index.html + the 3D one)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http');
const root = path.join(__dirname, '..'), T = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf' };
const server = http.createServer((q, r) => fs.readFile(path.join(root, decodeURIComponent(q.url.split('?')[0])), (e, b) => { r.writeHead(e ? 404 : 200, { 'content-type': T[path.extname(q.url)] || 'application/octet-stream' }); r.end(b); })).listen(0);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  p.on('pageerror', e => console.error(e.message));
  let n = 0;
  for (const page of ['index.html', 'dot3d.html']) {
    await p.goto(`http://127.0.0.1:${server.address().port}/abba-character/${page}`);
    await p.waitForFunction(() => window.READY);
    for (const card of await p.$$('.card')) await card.screenshot({ path: path.join(__dirname, `dot-${String(++n).padStart(2, '0')}.png`) });
  }
  await b.close(); server.close();
})();
