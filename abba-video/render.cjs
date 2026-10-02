// Renders index.html frame-by-frame (seeking every animation) and muxes with music.wav.
// Usage: python3 music.py && node render.cjs [outDir]   → abba-video.mp4
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30, SECONDS = 30, frames = process.argv[2] || path.join(__dirname, 'frames');
(async () => {
  fs.mkdirSync(frames, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  for (let f = 0; f < FPS * SECONDS; f++) {
    await page.evaluate(ms => document.getAnimations().forEach(a => (a.currentTime = ms)), (f * 1000) / FPS);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); // let the seek paint
    await page.screenshot({ path: `${frames}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 93 });
  }
  await browser.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', FPS, '-i', `${frames}/f%04d.jpg`, '-i', path.join(__dirname, 'music.wav'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    path.join(__dirname, 'abba-video.mp4')].map(String), { stdio: 'inherit' });
})();
