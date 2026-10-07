// One of the 100: spec → background, camera, ten shots with transitions, captions, flashes.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { Bg, Captions, Ctx, DUR, FPS, HIT, Head, Particles, SHOTS, Spec, Theme, alpha, beatK, eo, hitK, lerp, rng, seg, shake } from './core';
import { SCENES } from './scenes';
import { PLAN } from './plan';
import MUSIC from './music.json';

const THEMES: Theme[] = [
  { name: 'Noche', bg: '#06060A', bg2: '#16161F', fg: '#F5F5F7', mute: '#8E8E9A', acc: '#0A84FF', acc2: '#BF5AF2', dark: true },
  { name: 'Grafito', bg: '#0A0A0B', bg2: '#1F1F22', fg: '#FFFFFF', mute: '#8E8E93', acc: '#FF9F0A', acc2: '#FF375F', dark: true },
  { name: 'Hielo', bg: '#EDEDF2', bg2: '#FFFFFF', fg: '#1D1D1F', mute: '#6E6E73', acc: '#0071E3', acc2: '#5E5CE6', dark: false },
  { name: 'Lima', bg: '#070C07', bg2: '#132013', fg: '#F2FFF0', mute: '#86A386', acc: '#B8FF2E', acc2: '#2EFFB0', dark: true },
  { name: 'Coral', bg: '#FFEFE6', bg2: '#FFFFFF', fg: '#1E1412', mute: '#8A6E66', acc: '#FF5A36', acc2: '#FFB000', dark: false },
  { name: 'Océano', bg: '#020D1C', bg2: '#0A2547', fg: '#EAF6FF', mute: '#7FA3C4', acc: '#36D6FF', acc2: '#2F6BFF', dark: true },
  { name: 'Neón', bg: '#0E040C', bg2: '#2A0E22', fg: '#FFF0FB', mute: '#B07FA6', acc: '#FF3FD2', acc2: '#7A5CFF', dark: true },
  { name: 'Papel', bg: '#ECE7DE', bg2: '#FAF8F4', fg: '#151515', mute: '#77706A', acc: '#E63B2E', acc2: '#1F4FFF', dark: false },
  { name: 'Oro', bg: '#0B0906', bg2: '#211A0E', fg: '#FFF8EA', mute: '#A89A7E', acc: '#FFC53D', acc2: '#FF7A2F', dark: true },
  { name: 'Menta', bg: '#E4F8F0', bg2: '#FFFFFF', fg: '#062A1F', mute: '#4F7A6B', acc: '#00B37E', acc2: '#0077FF', dark: false },
  { name: 'Brasa', bg: '#120404', bg2: '#2B0A08', fg: '#FFF1EE', mute: '#B08580', acc: '#FF4D2E', acc2: '#FFD60A', dark: true },
  { name: 'Lavanda', bg: '#EEEAFF', bg2: '#FFFFFF', fg: '#160F3A', mute: '#6B6394', acc: '#6E3BFF', acc2: '#FF4FA3', dark: false },
];
const HEADS: Head[] = [
  { family: 'Inter', weight: 900, ls: '-0.055em' }, { family: 'Inter', weight: 800, ls: '-0.045em' }, { family: 'Inter', weight: 900, ls: '-0.04em', upper: true },
  { family: 'Sora', weight: 800, ls: '-0.04em' }, { family: 'Syne', weight: 800, ls: '-0.03em' }, { family: 'Bricolage Grotesque', weight: 800, ls: '-0.04em' },
  { family: 'Anton', weight: 400, ls: '0em', upper: true, lh: 1.02 }, { family: 'Bebas Neue', weight: 400, ls: '0.01em', upper: true, lh: 0.95 },
  { family: 'Unbounded', weight: 800, ls: '-0.03em' }, { family: 'Instrument Serif', weight: 400, ls: '-0.02em', lh: 1.0 }, { family: 'DM Serif Display', weight: 400, ls: '-0.02em' },
  { family: 'Inter', weight: 900, ls: '-0.055em' },
];
const BGS = ['mesh', 'grid', 'dots', 'rays', 'rings', 'aurora'];
const TRANS = ['zoom', 'whip', 'circle', 'push', 'flash', 'spin'];
const CAPS = ['pill', 'bold', 'clean', 'type'];

const lum = (h: string) => { const v = parseInt(h.slice(1), 16); return (0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) / 255; };
export const SPECS: Spec[] = PLAN.map(({ n, co, c1: k1, c2: k2, prop, tone, beats, scenes }) => {
  let c1 = k1, c2 = k2;
  const r = rng(n * 31 + 7), m = (MUSIC as { genre: string; bpm: number }[])[n];
  let base = THEMES[(n * 5 + Math.floor(n / 12)) % 12];
  if (!base.dark && lum(c1) > 0.62) base = THEMES[(n % 6) * 2 % 12].dark ? THEMES[(n % 6) * 2 % 12] : THEMES[0];   // a yellow brand needs a dark stage
  const mixW = (h: string, k: number) => '#' + [0, 2, 4].map(i => Math.round(parseInt(h.slice(1 + i, 3 + i), 16) * (1 - k) + 255 * k).toString(16).padStart(2, '0')).join('');
  if (base.dark && lum(c1) < 0.22) [c1, c2] = lum(c2) > 0.3 ? [c2, c1] : [mixW(c1, 0.45), c2];   // near-black brands can't be the accent on a dark stage
  const theme = { ...base, acc: c1, acc2: c2 === '#111111' || c2 === '#1A1A1A' || c2 === '#1D1D1F' || c2 === '#282828' || c2 === '#171A20' ? base.acc2 : c2 };
  const head = HEADS[(n * 7 + Math.floor(n / 24)) % 12];
  return { n, id: `m${String(n + 1).padStart(3, '0')}`, label: `${co} · ${m.genre}`, co, prop, tone, voice: n === 0, theme, head, bg: BGS[(n + Math.floor(n / 6)) % 6], trans: TRANS[(n * 5 + Math.floor(n / 6)) % 6],
    caps: n === 0 ? 'pill' : 'none', scenes, beats, bpm: m.bpm, genre: m.genre, cam: 0.6 + r() * 0.8, particles: r() < 0.6 };
});

const Shot: React.FC<{ i: number; t: number; sp: Spec }> = ({ i, t, sp }) => {
  const [a, b] = SHOTS[i], ov = sp.trans === 'circle' || sp.trans === 'push' ? 0.4 : 0;
  if (t < a || t >= b + ov || (i === SHOTS.length - 1 && t >= b)) return null;
  const e = i === 0 ? eo(seg(t, 0, 0.35)) : eo(seg(t, a, a + 0.4)), x = i === SHOTS.length - 1 ? 0 : ov ? eo(seg(t, b, b + 0.4)) : eo(seg(t, b - 0.22, b));
  let style: React.CSSProperties = {};
  switch (sp.trans) {
    case 'zoom': style = { transform: `scale(${lerp(0.72, 1, e) * (1 + 0.6 * x)})`, opacity: e * (1 - x) }; break;
    case 'whip': style = { transform: `translateX(${(1 - e) * 1080 - x * 1080}px) skewX(${(1 - e) * -10 + x * 10}deg)` }; break;
    case 'circle': style = { clipPath: `circle(${e * 150}% at 50% ${i % 2 ? 30 : 70}%)` }; break;
    case 'push': style = { transform: `translateY(${(1 - e) * 1920 - x * 1920}px)` }; break;
    case 'flash': style = { transform: `scale(${lerp(1.18, 1, e)})`, opacity: 1 - x }; break;
    default: style = { transform: `rotate(${(1 - e) * -16 + x * 16}deg) scale(${lerp(0.6, 1, e) * (1 + 0.4 * x)})`, opacity: e * (1 - x) };
  }
  const C = SCENES[sp.scenes[i]];
  return <AbsoluteFill style={{ ...style, background: sp.trans === 'circle' || sp.trans === 'push' ? 'transparent' : undefined }}>
    {(sp.trans === 'circle' || sp.trans === 'push') && i > 0 && <Bg t={t} />}
    <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * seg(t, a, b)})` }}><C b={sp.beats[i]} t={t - a} d={b - a} /></AbsoluteFill>
  </AbsoluteFill>;
};

export const Video: React.FC<{ sp: Spec }> = ({ sp }) => {
  const t = useCurrentFrame() / FPS, k = beatK(t, sp.bpm), c = sp.theme;
  const cut = SHOTS.reduce((m, [a]) => (t >= a && t - a < m ? t - a : m), 9);
  const flash = (sp.trans === 'flash' ? Math.max(0, 1 - cut / 0.14) * 0.8 : 0) + Math.max(0, 1 - Math.abs(t - HIT) / 0.12) * 0.9;
  return <Ctx.Provider value={sp}>
    <AbsoluteFill style={{ background: c.bg, overflow: 'hidden' }}>
      <Bg t={t} />
      {sp.particles && <Particles t={t} />}
      <AbsoluteFill style={{ transform: `scale(${1 + 0.014 * k * sp.cam}) rotate(${Math.sin(t * 0.45) * 0.7 * sp.cam}deg) ${shake(hitK(t, HIT, 0.6), t, 22)}` }}>
        {SHOTS.map((_, i) => <Shot key={i} i={i} t={t} sp={sp} />)}
      </AbsoluteFill>
      <Captions t={t} />
      <div style={{ position: 'absolute', left: 0, top: 0, height: 8, width: `${(t / DUR) * 100}%`, background: `linear-gradient(90deg, ${c.acc}, ${c.acc2})` }} />
      <AbsoluteFill style={{ background: '#fff', opacity: Math.min(1, flash) }} />
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${120 + 80 * k}px ${alpha(c.acc, 0.12 * sp.cam)}` }} />
    </AbsoluteFill>
    <Audio src={staticFile(`audio/m/${sp.id.slice(1)}.wav`)} />
  </Ctx.Provider>;
};
