// 01 · Partículas: "1975" and "90%" are built from thousands of glowing particles; on "quiebra" they crumble into dust.
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, Band, C, F, Flash, Grain, LINES, Outro, T, Vignette, Words, inOut, prog, rand, shake, useT } from '../kit';

const N = 4200, W = 1080, H = 1920, CY = 760;
type Pts = Float32Array; // x,y pairs
const cache = new Map<string, Pts>();

/** Sample a shape drawn on an offscreen canvas into N target points (deterministic order). */
const sample = (key: string, draw: (g: CanvasRenderingContext2D) => void): Pts | null => {
  if (cache.has(key)) return cache.get(key)!;
  if (!document.fonts.check(`100px "${F.display}"`)) return null;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!; g.fillStyle = '#fff'; draw(g);
  const d = g.getImageData(0, 0, W, H).data, pts: number[] = [];
  for (let y = 0; y < H; y += 5) for (let x = 0; x < W; x += 5) if (d[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
  const out = new Float32Array(N * 2), M = pts.length / 2;
  for (let i = 0; i < N; i++) { const k = Math.floor(rand(i, 7) * M); out[i * 2] = pts[k * 2] + (rand(i, 3) - 0.5) * 4; out[i * 2 + 1] = pts[k * 2 + 1] + (rand(i, 4) - 0.5) * 4; }
  cache.set(key, out); return out;
};
const textShape = (txt: string, size = 330) => sample(`t:${txt}`, g => { g.font = `${size}px "${F.display}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, CY); });
const cameraShape = () => sample('camera', g => {
  const r = (x: number, y: number, w: number, h: number, rr: number) => { g.beginPath(); g.roundRect(x, y, w, h, rr); g.fill(); };
  g.translate(150, 560); g.scale(1.45, 1.45);
  r(0, 40, 380, 230, 26); r(380, 90, 70, 110, 14); g.beginPath(); g.arc(450, 145, 44, 0, Math.PI * 2); g.fill(); r(80, 14, 70, 30, 8);
  g.globalCompositeOperation = 'destination-out'; r(40, 130, 190, 104, 12); r(256, 130, 96, 38, 10); g.globalCompositeOperation = 'source-over';
  g.beginPath(); g.arc(100, 182, 20, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(170, 182, 20, 0, Math.PI * 2); g.fill();
});

export const S01Particulas: React.FC = () => {
  const t = useT(), ref = useRef<HTMLCanvasElement>(null);
  const scatter = useMemo(() => { const a = new Float32Array(N * 2); for (let i = 0; i < N; i++) { a[i * 2] = rand(i, 11) * W; a[i * 2 + 1] = rand(i, 12) * H; } return a; }, []);
  const counts = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

  useLayoutEffect(() => {
    const g = ref.current!.getContext('2d')!; g.clearRect(0, 0, W, H);
    const s1975 = textShape(LINES.a1), cam = cameraShape();
    if (!s1975 || !cam) return;
    // keyframe list: [time, shape]; particles interpolate between consecutive shapes
    const keys: [number, Pts][] = [[0, scatter], [0.75, s1975], [1.55, s1975]];
    counts.forEach((n, k) => keys.push([1.7 + k * 0.12, textShape(`${n}%`)!]));
    keys.push([2.95, textShape('90%')!], [3.25, scatter], [4.1, cam]);
    let a = keys[0], b = keys[0];
    for (let k = 0; k < keys.length - 1; k++) if (t >= keys[k][0]) { a = keys[k]; b = keys[k + 1]; }
    const local = t >= keys[keys.length - 1][0] ? 1 : inOut(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]))));
    const A = t >= keys[keys.length - 1][0] ? cam : a[1], B = t >= keys[keys.length - 1][0] ? cam : b[1];
    g.globalCompositeOperation = 'lighter';
    const fall = Math.max(0, t - T.HIT);
    for (let i = 0; i < N; i++) {
      let x = A[i * 2] + (B[i * 2] - A[i * 2]) * local, y = A[i * 2 + 1] + (B[i * 2 + 1] - A[i * 2 + 1]) * local;
      const ph = rand(i, 5) * 6.283;
      x += Math.sin(t * 2.2 + ph) * 2.2; y += Math.cos(t * 1.9 + ph) * 2.2;
      let alpha = 0.85, size = 3.2 + rand(i, 6) * 2.2;
      if (fall > 0) { // crumble into dust: gravity + drift, shrinking and fading
        const d = Math.max(0, fall - rand(i, 8) * 0.35);
        y += 900 * d * d * (0.6 + rand(i, 9)); x += (rand(i, 10) - 0.5) * 260 * d + Math.sin(d * 6 + ph) * 18 * d;
        alpha *= Math.max(0, 1 - d * 0.55); size *= Math.max(0.35, 1 - d * 0.6);
      }
      const hue = 300 - (x / W) * 140 + (fall > 0 ? -280 * Math.min(1, fall) : 0);
      g.fillStyle = `hsla(${hue},100%,${fall > 0 ? 75 : 62}%,${alpha * 0.22})`; g.fillRect(x - size * 1.6, y - size * 1.6, size * 3.2, size * 3.2);
      g.fillStyle = `hsla(${hue},100%,80%,${alpha})`; g.fillRect(x - size / 2, y - size / 2, size, size);
    }
  });

  const shot = t < T.cut1 ? 0 : t < T.inventa ? 1 : t < T.cut2 ? 2 : t < T.quiebraLine ? 3 : t < T.HIT ? 4 : 5; // a cut every 1–2 s
  const zoom = [1.0, 1.08, 0.94, 1.04, 1.12, 1.0][shot] + prog(t, [0, T.cut1, T.inventa, T.cut2, T.quiebraLine, T.HIT][shot], [T.cut1, T.inventa, T.cut2, T.quiebraLine, T.HIT, 10][shot], x => x) * 0.05;
  const sh = shake(t, T.HIT, 34);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(60% 40% at ${50 + Math.sin(t) * 10}% 40%, #2a0a4a, ${C.bg} 70%)` }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px) scale(${zoom})` }}>
        <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />
      </AbsoluteFill>
      <Band top={1040}><Words text={LINES.a2} at={T.intocable} out={2.85} style={{ fontFamily: F.display, fontSize: 82, color: '#fff' }} /></Band>
      <Band top={250}><Words text={LINES.b} at={T.inventa + 0.1} out={5.85} stagger={0.06} style={{ fontFamily: F.display, fontSize: 74, color: '#fff', lineHeight: 1.05 }} /></Band>
      <Band top={250}><Words text={LINES.c1} at={T.quiebraLine} out={8.4} style={{ fontFamily: F.display, fontSize: 80, color: '#fff' }} /></Band>
      <Band top={1080}><Words text={LINES.c2} at={T.HIT} out={8.45} from="scale" style={{ fontFamily: F.display, fontSize: 190, color: C.magenta, textShadow: `0 0 60px ${C.magenta}` }} /></Band>
      <Flash at={T.HIT} color={C.magenta} len={0.3} />
      <Outro to={0.94} />
      <Vignette /><Grain />
      <AbbaTag />
    </AbsoluteFill>
  );
};
