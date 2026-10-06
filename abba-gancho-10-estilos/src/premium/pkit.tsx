// Extra pieces for the 10 premium styles: display fonts, the beat grid of the original track (160 BPM), pixel font.
import React from 'react';
import { staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { T } from '../kit';

([['Anton', 'anton.ttf', '400', 'normal'], ['Bebas Neue', 'bebas-neue.ttf', '400', 'normal'], ['Unbounded', 'unbounded-800.ttf', '800', 'normal'],
  ['Inter Tight', 'inter-tight-900i.ttf', '900', 'italic']] as const)
  .forEach(([family, file, weight, style]) => loadFont({ family, url: staticFile(`fonts/${file}`), weight, style }));
export const PF = { condensed: 'Anton', bebas: 'Bebas Neue', round: 'Unbounded', sans: 'Inter Tight' };

// ---------- the track's grid: 160 BPM, bar = 1.5 s, so cuts at 1.5 / 3.0 / 4.5 / 6.0 are downbeats ----------
export const BEAT = 0.375, BAR = 1.5;
export const KICKS = [0, 1, 2, 3].flatMap(b => [0, 6, 10].map(s => b * BAR + s * BAR / 16)).concat([4.5 + 14 * BAR / 16]);
/** 1 on each kick, decaying to 0 (for scale bumps / flashes in sync with the music). */
export const kickPulse = (t: number, decay = 9) => {
  if (t >= T.quiebraLine) return 0;
  const last = KICKS.filter(k => k <= t).pop();
  return last === undefined ? 0 : Math.exp(-(t - last) * decay);
};
/** Index of the current beat (0.375 s), useful to step colour cycles on the beat. */
export const beatIndex = (t: number) => Math.floor(t / BEAT);

// ---------- dopamine palette ----------
export const P = { volt: '#D4FF00', red: '#FF2D2D', hot: '#FF3D8B', violet: '#7A3CFF', cyan: '#00E0FF', orange: '#FF6A00', yellow: '#FFD600', mint: '#1DF2A4', black: '#000', white: '#fff' };

// ---------- 5×7 pixel font (only the glyphs the hook needs) ----------
const G: Record<string, string> = {
  '0': '01110100011001110101110011000101110', '1': '00100011000010000100001000010001110', '5': '11111100001111000001000011000101110',
  '7': '11111000010001000100010000100001000', '2': '01110100010000100010001000100011111', '3': '11111000100010000010000011000101110',
  '4': '00010001100101010010111110001000010', '6': '00110010001000011110100011000101110', '8': '01110100011000101110100011000101110', '9': '01110100011000101111000010001001100', '%': '11000110010001000100010000100110011',
  Q: '01110100011000110001101011001001101', U: '10001100011000110001100011000101110', I: '01110001000010000100001000010001110',
  E: '11111100001000011110100001000011111', B: '11110100011000111110100011000111110', R: '11110100011000111110101001001010001',
  A: '01110100011000111111100011000110001', '.': '00000000000000000000000000110001100', ' ': '00000000000000000000000000000000000',
};
/** Cells (col,row) lit for a word in the pixel font, 6 columns per glyph. */
export const pixelCells = (word: string) => word.split('').flatMap((ch, k) => (G[ch] ?? G[' ']).split('').flatMap((b, i) => b === '1' ? [[k * 6 + (i % 5), Math.floor(i / 5)]] : []));

/** Repeat a node n times along a direction (for echo / stacked-outline type). */
export const Echo: React.FC<{ n: number; dx?: number; dy?: number; render: (i: number) => React.ReactNode }> = ({ n, dx = 0, dy = 0, render }) => (
  <>{Array.from({ length: n }, (_, i) => <div key={i} style={{ position: 'absolute', inset: 0, transform: `translate(${dx * i}px, ${dy * i}px)` }}>{render(i)}</div>)}</>
);

// ---------- when voice 03 actually says each part (measured from public/audio/premium.wav) ----------
export const V = { y1975: 0.08, kodak: 1.8, intocable: 2.27, inventa: 3.1, mundo: 4.6, quiebraLine: 5.92, HIT: 6.7 };
