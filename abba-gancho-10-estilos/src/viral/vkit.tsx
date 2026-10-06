// Shared bits for the five viral-format versions (V1–V5): extra fonts, paper/halftone textures, facts and the cue sheet
// (same voice 03 + flat.wav as the flat versions, so the cues in ../flat/fkit apply).
import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { rand } from '../kit';
export { Q, CAPS, pop, hitShake, FlatOutro } from '../flat/fkit';

([['Special Elite', 'special-elite.ttf', '400'], ['Playfair Display', 'playfair-display-900.ttf', '900'], ['Patrick Hand', 'patrick-hand.ttf', '400']] as const)
  .forEach(([family, file, weight]) => loadFont({ family, url: staticFile(`fonts/${file}`), weight }));
export const VF = { type: 'Special Elite', news: 'Playfair Display', hand: 'Patrick Hand', sans: 'Inter Tight', black: 'Archivo Black' };

/** Real details of the story (used as labels; all verifiable). */
export const FACTS = { who: 'Steve Sasson, 24 años', where: 'Rochester, Nueva York', kg: '3.6 kg', secs: '23 segundos por foto', px: '100 × 100 píxeles', tape: 'se guardaba en un casete', quote: '«Está lindo… pero no se lo digas a nadie.»', end: 'Enero de 2012' };

/** Paper texture: warm base + fractal noise + faint fibres. */
export const Paper: React.FC<{ color?: string; opacity?: number }> = ({ color = '#EDE4D3', opacity = 0.35 }) => (
  <AbsoluteFill style={{ background: color }}>
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity }}>
      <filter id="pp"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0.55 0" /></filter>
      <rect width="1080" height="1920" filter="url(#pp)" />
    </svg>
  </AbsoluteFill>
);
/** CSS halftone dot pattern (for "printed photo" fills). */
export const halftone = (ink = '#1a1a1a', size = 9, dot = 2.6) => ({ backgroundImage: `radial-gradient(circle, ${ink} ${dot}px, transparent ${dot + 0.6}px)`, backgroundSize: `${size}px ${size}px` });
/** Irregular torn-paper polygon for clip-path (deterministic). */
export const torn = (seed: number, n = 28, amp = 2.2) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${rand(seed + i, 1) * amp}%`);
  for (let i = 0; i <= n; i++) pts.push(`${100 - rand(seed + i, 2) * amp}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - rand(seed + i, 3) * amp}%`);
  for (let i = n; i >= 0; i--) pts.push(`${rand(seed + i, 4) * amp}% ${(i / n) * 100}%`);
  return `polygon(${pts.join(',')})`;
};
/** A strip of semi-transparent tape. */
export const Tape: React.FC<{ x: number; y: number; rot?: number; w?: number }> = ({ x, y, rot = -8, w = 150 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: 44, background: 'rgba(240,230,190,.75)', transform: `rotate(${rot}deg)`, boxShadow: '0 2px 4px rgba(0,0,0,.15)', clipPath: 'polygon(0 8%, 4% 0, 96% 6%, 100% 0, 100% 92%, 95% 100%, 5% 94%, 0 100%)' }} />
);
