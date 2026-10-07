// The 100-video set: shared timeline, spec context, easing helpers and the always-moving layers
// (background, particles, camera drift, captions) that every video wears.
import React, { createContext, useContext } from 'react';
import { AbsoluteFill, spring, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

([
  ['Inter', 'inter-400.ttf', '400'], ['Inter', 'inter-600.ttf', '600'], ['Inter', 'inter-800.ttf', '800'], ['Inter', 'inter-900.ttf', '900'],
  ['Sora', 'sora-800.ttf', '800'], ['Syne', 'syne-800.ttf', '800'], ['Instrument Serif', 'instrument-serif-400.ttf', '400'],
  ['JetBrains Mono', 'jetbrains-mono-500.ttf', '500'], ['JetBrains Mono', 'jetbrains-mono-700.ttf', '700'],
  ['DM Serif Display', 'dm-serif-display-400.ttf', '400'], ['Bricolage Grotesque', 'bricolage-grotesque-800.ttf', '800'],
  ['Anton', 'anton.ttf', '400'], ['Bebas Neue', 'bebas-neue.ttf', '400'], ['Unbounded', 'unbounded-800.ttf', '800'],
] as const).forEach(([family, file, weight]) => loadFont({ family, url: staticFile(`fonts/${file}`), weight }));

// ---------- timeline (seconds) — identical for all 100, the music generator uses the same numbers ----------
export const FPS = 30, W = 1080, H = 1920;
export { DUR, PH, HIT, SHOTS } from './plan';
import { PH, HIT } from './plan';

// ---------- spec ----------
export type Beat = {
  kind: 'year' | 'num' | 'product' | 'crash' | 'text' | 'quote' | 'chat' | 'compare' | 'list' | 'cta'; tone?: 'up' | 'down';
  title: string; sub?: string; q?: string; hl?: string; num?: number; from?: number; pre?: string; suf?: string;
  items?: string[]; a?: string; b?: string; who?: string; hit?: number; line?: string;
};
export type Theme = { name: string; bg: string; bg2: string; fg: string; mute: string; acc: string; acc2: string; dark: boolean };
export type Head = { family: string; weight: number; ls: string; upper?: boolean; lh?: number };
export type Spec = {
  n: number; id: string; label: string; co: string; prop: string; tone: 'up' | 'down'; voice: boolean; theme: Theme; head: Head; bg: string; trans: string; caps: string;
  scenes: string[]; beats: Beat[]; bpm: number; genre: string; cam: number; particles: boolean;
};
export const Ctx = createContext<Spec>(null!);
export const useSpec = () => useContext(Ctx);
export const RED = '#FF3B30';

// ---------- math ----------
export const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eo = (x: number) => 1 - Math.pow(1 - cl(x), 4);                 // expo-ish out (Apple feel)
export const eio = (x: number) => { x = cl(x); return x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2; };
export const spr = (t: number, at: number, stiffness = 170, damping = 15) =>
  spring({ frame: Math.round((t - at) * FPS), fps: FPS, config: { stiffness, damping } });
export const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
/** 1 on every beat (grid anchored on the HIT), decaying fast. */
export const beatK = (t: number, bpm: number, sharp = 9) => { const b = 60 / bpm, ph = (((t - HIT) % b) + b) % b; return Math.exp(-ph * sharp); };
export const hitK = (t: number, at = HIT, len = 0.7) => (t < at ? 0 : Math.max(0, 1 - (t - at) / len));
export const shake = (k: number, t: number, amp = 30) => `translate(${Math.sin(t * 97) * amp * k}px, ${Math.cos(t * 73) * amp * k}px)`;
export const alpha = (hex: string, a: number) => hex + Math.round(cl(a) * 255).toString(16).padStart(2, '0');

// ---------- type ----------
let ctx2d: CanvasRenderingContext2D | null = null;
export const measure = (text: string, font: string) => {
  ctx2d ??= document.createElement('canvas').getContext('2d');
  ctx2d!.font = font; return ctx2d!.measureText(text).width;
};
export const headStyle = (h: Head, size: number): React.CSSProperties => ({
  fontFamily: h.family, fontWeight: h.weight, letterSpacing: h.ls, fontSize: size, lineHeight: h.lh ?? 0.98,
  textTransform: h.upper ? 'uppercase' : 'none',
});
/** Largest size (≤ max) at which the longest word of `text` fits in `w` px. */
export const fit = (h: Head, text: string, w: number, max: number) => {
  const longest = text.split(/\s+/).reduce((m, s) => Math.max(m, measure(h.upper ? s.toUpperCase() : s, `${h.weight} 100px "${h.family}"`)), 1);
  return Math.min(max, (w / longest) * 100 * 0.96);
};
export const BODY = 'Inter';

// ---------- background ----------
export const Bg: React.FC<{ t: number }> = ({ t }) => {
  const { theme: c, bg, bpm } = useSpec();
  const k = beatK(t, bpm), hk = hitK(t, HIT, 1.2);
  const base: React.CSSProperties = { background: `radial-gradient(120% 80% at 50% 40%, ${c.bg2}, ${c.bg})` };
  const blob = (x: number, y: number, r: number, col: string, a: number) => `radial-gradient(${r}px ${r}px at ${x}px ${y}px, ${alpha(col, a)}, transparent)`;
  let layer: React.ReactNode = null;
  if (bg === 'mesh') {
    layer = <AbsoluteFill style={{ backgroundImage: [
      blob(300 + 220 * Math.sin(t * 0.5), 500 + 180 * Math.cos(t * 0.4), 900, c.acc, c.dark ? 0.38 : 0.28),
      blob(800 + 200 * Math.cos(t * 0.37), 1400 + 220 * Math.sin(t * 0.45), 1000, c.acc2, c.dark ? 0.32 : 0.24),
      blob(540 + 300 * Math.sin(t * 0.23 + 2), 960, 700, c.fg, c.dark ? 0.06 : 0.0)].join(',') }} />;
  } else if (bg === 'grid') {
    const lines = Array.from({ length: 16 }, (_, i) => { const z = ((i + (t * 0.9) % 1) / 16); return 1180 + Math.pow(z, 2.2) * 760; });
    layer = <svg width={W} height={H} style={{ position: 'absolute' }}>
      <defs><linearGradient id="gfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.acc} stopOpacity="0" /><stop offset="1" stopColor={c.acc} stopOpacity="0.55" /></linearGradient></defs>
      {lines.map((y, i) => <line key={i} x1={0} x2={W} y1={y} y2={y} stroke="url(#gfade)" strokeWidth={2} />)}
      {Array.from({ length: 19 }, (_, i) => { const x = (i - 9) * 140; return <line key={'v' + i} x1={540 + x * 0.12} y1={1180} x2={540 + x * 3.2} y2={H} stroke={alpha(c.acc, 0.35)} strokeWidth={2} />; })}
      <rect x={0} y={1060} width={W} height={160} fill={`url(#gfade)`} opacity={0.4 + 0.3 * k} />
      {Array.from({ length: 16 }, (_, i) => { const z = (i + (t * 0.9) % 1) / 16; return <line key={'u' + i} x1={0} x2={W} y1={740 - Math.pow(z, 2.2) * 740} y2={740 - Math.pow(z, 2.2) * 740} stroke={alpha(c.acc2, 0.18)} strokeWidth={2} />; })}
    </svg>;
  } else if (bg === 'dots') {
    layer = <AbsoluteFill style={{ backgroundImage: `radial-gradient(${alpha(c.fg, c.dark ? 0.22 : 0.16)} 2.5px, transparent 3px)`, backgroundSize: '44px 44px',
      backgroundPosition: `${(t * 18) % 44}px ${(t * 30) % 44}px`, WebkitMaskImage: `radial-gradient(700px 900px at ${540 + 200 * Math.sin(t * 0.6)}px ${900 + 300 * Math.cos(t * 0.5)}px, black, transparent)` }}>
      <AbsoluteFill style={{ backgroundImage: blob(540 + 200 * Math.sin(t * 0.6), 900 + 300 * Math.cos(t * 0.5), 800, c.acc, 0.35) }} /></AbsoluteFill>;
  } else if (bg === 'rays') {
    layer = <AbsoluteFill style={{ backgroundImage: `repeating-conic-gradient(from ${t * 12}deg at 50% 45%, ${alpha(c.acc, c.dark ? 0.13 : 0.1)} 0deg 7deg, transparent 7deg 18deg)`,
      WebkitMaskImage: 'radial-gradient(closest-side at 50% 45%, transparent 8%, black 60%, transparent 100%)', transform: `scale(${1.6 + 0.05 * k})` }} />;
  } else if (bg === 'rings') {
    layer = <svg width={W} height={H} style={{ position: 'absolute' }}>{Array.from({ length: 9 }, (_, i) => {
      const r = ((i / 9 + t * 0.12) % 1) * 1300; return <circle key={i} cx={540} cy={900} r={r} fill="none" stroke={i % 2 ? c.acc : c.acc2} strokeOpacity={0.35 * (1 - r / 1300)} strokeWidth={3 + 8 * k * (1 - r / 1300)} />; })}</svg>;
  } else if (bg === 'aurora') {
    layer = <AbsoluteFill>{[c.acc, c.acc2, c.acc].map((col, i) => <div key={i} style={{ position: 'absolute', left: -400, width: 1900, height: 520, top: 260 + i * 520 + 90 * Math.sin(t * 0.5 + i * 2),
      transform: `rotate(${-18 + 6 * Math.sin(t * 0.3 + i)}deg)`, background: `linear-gradient(90deg, transparent, ${alpha(col, c.dark ? 0.32 : 0.22)}, transparent)`, borderRadius: 400, filter: 'blur(60px)' }} />)}</AbsoluteFill>;
  }
  return <AbsoluteFill style={base}>{layer}
    <AbsoluteFill style={{ background: RED, opacity: 0.35 * hk * hk }} />
    <AbsoluteFill style={{ background: `radial-gradient(closest-side, transparent 55%, ${alpha(c.dark ? '#000000' : c.bg, c.dark ? 0.6 : 0.35)})` }} />
  </AbsoluteFill>;
};

export const Particles: React.FC<{ t: number }> = ({ t }) => {
  const { theme: c, bpm } = useSpec(); const k = beatK(t, bpm, 6); const r = rng(7);
  return <AbsoluteFill>{Array.from({ length: 26 }, (_, i) => {
    const x = r() * W, sp = 30 + r() * 70, y = (((r() * H - t * sp) % H) + H) % H, s = 4 + r() * 8;
    return <div key={i} style={{ position: 'absolute', left: x + 30 * Math.sin(t + i), top: y, width: s, height: s, borderRadius: s, background: i % 3 ? c.acc : c.fg,
      opacity: (0.25 + 0.5 * k) * (0.4 + 0.6 * Math.sin(i + t * 2) ** 2), transform: `scale(${1 + k})` }} />;
  })}</AbsoluteFill>;
};

// ---------- captions for the voice (only during the hook) ----------
const WORDS: [string, number, number][] = (() => {
  const P: [string[], number, number][] = [
    [['1975.'], PH[0], 1.95], [['Kodak', 'era', 'intocable.'], PH[1], 1.36],
    [['Entonces', 'inventó', 'algo', 'que', 'cambiaría', 'el', 'mundo…'], PH[2], 2.4], [['y', 'eso', 'la', 'llevó', 'a', 'la'], PH[3], 0.79]];
  const out: [string, number, number][] = [];
  for (const [ws, at, d] of P) { const tot = ws.join('').length; let acc = 0;
    for (const w of ws) { const a = at + (acc / tot) * d; acc += w.length; out.push([w, a, at + (acc / tot) * d]); } }
  out.push(['quiebra.', HIT, 8.6]); return out;
})();
const LINES = [[0, 1], [1, 4], [4, 8], [8, 11], [11, 15]];
export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { theme: c, caps, head } = useSpec();
  if (caps === 'none' || t > 8.7) return null;
  const li = LINES.findIndex(([a, b]) => t >= WORDS[a][1] - 0.05 && (b >= WORDS.length || t < WORDS[b][1] - 0.05));
  if (li < 0) return null;
  const ws = WORDS.slice(LINES[li][0], LINES[li][1]);
  const shell: React.CSSProperties = { position: 'absolute', left: 60, right: 60, top: 1480, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 18px', alignItems: 'center' };
  if (caps === 'pill') return <div style={shell}>{ws.map(([w, a, b], i) => {
    const on = t >= a, cur = on && t < b + 0.05, p = spr(t, a, 260, 16);
    return <span key={i} style={{ fontFamily: BODY, fontWeight: 800, fontSize: 64, color: cur ? (c.dark ? '#000' : '#fff') : '#fff', padding: '6px 18px', borderRadius: 18,
      background: cur ? c.acc : 'transparent', opacity: on ? 1 : 0, transform: `scale(${0.6 + 0.4 * p})`, textShadow: cur ? 'none' : '0 4px 18px rgba(0,0,0,.55)' }}>{w}</span>; })}</div>;
  if (caps === 'bold') return <div style={shell}>{ws.filter(([, a]) => t >= a).slice(-3).map(([w, a], i) => {
    const p = spr(t, a, 300, 14);
    return <span key={w + i} style={{ ...headStyle(head, 104), textTransform: 'uppercase', color: '#fff', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill',
      transform: `scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -8}deg)`, display: 'inline-block' }}>{w}</span>; })}</div>;
  if (caps === 'clean') return <div style={{ ...shell, top: 1520 }}>{ws.map(([w, a], i) => (
    <span key={i} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 56, color: c.fg, opacity: t >= a ? 1 : 0.22, transform: `translateY(${(1 - eo(seg(t, a, a + 0.25))) * 14}px)`, display: 'inline-block' }}>{w}</span>))}</div>;
  // 'type': monospace typed with a caret
  const full = ws.map(w => w[0]).join(' '), a0 = ws[0][1], a1 = ws[ws.length - 1][2];
  const n = Math.round(full.length * seg(t, a0, a1 - 0.05));
  return <div style={{ ...shell, top: 1520 }}><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 52, color: c.fg, background: alpha(c.dark ? '#000000' : '#ffffff', 0.55), padding: '10px 22px', borderRadius: 14 }}>
    {full.slice(0, n)}<span style={{ color: c.acc, opacity: Math.floor(t * 4) % 2 ? 1 : 0.2 }}>▍</span></span></div>;
};

// ---------- shared UI bits ----------
export const Glass: React.FC<{ style?: React.CSSProperties; t: number; children?: React.ReactNode; r?: number }> = ({ style, t, children, r = 48 }) => {
  const { theme: c } = useSpec();
  return <div style={{ position: 'absolute', borderRadius: r, overflow: 'hidden', background: c.dark ? 'linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.04))' : 'linear-gradient(160deg, rgba(255,255,255,.96), rgba(255,255,255,.7))',
    border: `1.5px solid ${c.dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.06)'}`, boxShadow: c.dark ? '0 40px 90px rgba(0,0,0,.55)' : '0 30px 70px rgba(30,30,60,.16)', ...style }}>
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent 35%, ${c.dark ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.7)'} 50%, transparent 65%)`,
      transform: `translateX(${(((t * 0.45) % 1.6) - 0.8) * 200}%)` }} />
    {children}
  </div>;
};
/** Apple-Intelligence style glow ring around a rounded rect. */
export const GlowRing: React.FC<{ x: number; y: number; w: number; h: number; r: number; t: number; o?: number }> = ({ x, y, w, h, r, t, o = 1 }) => {
  const { theme: c } = useSpec();
  const grad = `conic-gradient(from ${t * 160}deg, ${c.acc}, ${c.acc2}, #FF9F0A, #FF375F, ${c.acc})`;
  return <>
    <div style={{ position: 'absolute', left: x - 16, top: y - 16, width: w + 32, height: h + 32, borderRadius: r + 16, background: grad, filter: 'blur(28px)', opacity: 0.75 * o }} />
    <div style={{ position: 'absolute', left: x - 5, top: y - 5, width: w + 10, height: h + 10, borderRadius: r + 5, background: grad, opacity: o }} />
  </>;
};
export const Icon: React.FC<{ size: number; letter: string; i?: number }> = ({ size, letter, i = 0 }) => {
  const { theme: c } = useSpec(); const cols = [[c.acc, c.acc2], [c.acc2, c.acc], ['#34C759', '#0A84FF'], ['#FF9F0A', '#FF375F']][i % 4];
  return <div style={{ width: size, height: size, borderRadius: size * 0.26, background: `linear-gradient(140deg, ${cols[0]}, ${cols[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontFamily: BODY, fontWeight: 900, fontSize: size * 0.5, flexShrink: 0, boxShadow: `0 10px 30px ${alpha(cols[0], 0.45)}` }}>{letter}</div>;
};
/** Highlights `hl` inside `text` (accent pill that wipes in at `at`). */
export const Hl: React.FC<{ text: string; hl?: string; t: number; at: number; color?: string }> = ({ text, hl, t, at, color }) => {
  const { theme: c } = useSpec();
  if (!hl || !text.includes(hl)) return <>{text}</>;
  const [a, b] = [text.indexOf(hl), text.indexOf(hl) + hl.length], p = eo(seg(t, at, at + 0.35));
  return <>{text.slice(0, a)}<span style={{ position: 'relative', display: 'inline-block', isolation: 'isolate', color: p > 0.5 ? (c.dark ? '#000' : '#fff') : undefined }}>
    <span style={{ position: 'absolute', left: '-0.08em', right: '-0.08em', top: '0.04em', bottom: '-0.02em', background: color ?? c.acc, borderRadius: '0.14em', transformOrigin: 'left', transform: `scaleX(${p})`, zIndex: -1 }} />
    {hl}</span>{text.slice(b)}</>;
};
