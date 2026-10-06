// Depth kit for the D versions: glow backgrounds that change with the mood, floating bokeh particles, glass cards,
// word-by-word headlines with highlight boxes, and shaded (not 3D) characters with idle animation and expressions.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { F, prog, rand, useT } from '../kit';
import { CAPS, Q, pop } from './fkit';

export type Theme = { dark: boolean; bg: string; text: string; sub: string; card: string; border: string; shadow: string; yellow: string; red: string; green: string; blue: string };
export const DARK: Theme = { dark: true, bg: '#0C1210', text: '#F4F1EA', sub: 'rgba(244,241,234,.6)', card: 'linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.03))', border: '1.5px solid rgba(255,255,255,.14)', shadow: '0 40px 80px rgba(0,0,0,.55)', yellow: '#FFC93C', red: '#FF5A4E', green: '#3DDC84', blue: '#5B8CFF' };
export const LIGHT: Theme = { dark: false, bg: '#EFEAE2', text: '#1B1B1F', sub: 'rgba(27,27,31,.55)', card: 'linear-gradient(160deg, #FFFFFF, #F6F2EA)', border: '4px solid #1B1B1F', shadow: '8px 10px 0 #1B1B1F, 0 40px 70px rgba(60,40,20,.18)', yellow: '#F5C542', red: '#E2412E', green: '#34B26A', blue: '#2C4A9A' };

// ---------- mood glow: neutral → gold (empire) → green (invention) → red (the NO and the crash) ----------
const MOODS: [number, string][] = [[0, '#7a4a2a'], [1.5, '#8a6a1c'], [3.0, '#1f8a52'], [4.9, '#1f8a52'], [5.15, '#b8322a'], [8.4, '#b8322a'], [8.8, '#200a08']];
const mix = (a: string, b: string, k: number) => { const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
export const moodColor = (t: number) => { const k = MOODS.findIndex(m => m[0] > t); if (k <= 0) return k === 0 ? MOODS[0][1] : MOODS[MOODS.length - 1][1]; return mix(MOODS[k - 1][1], MOODS[k][1], prog(t, MOODS[k - 1][0], MOODS[k][0])); };
export const Glow: React.FC<{ th: Theme }> = ({ th }) => {
  const t = useT(), c = moodColor(t), pulse = t >= Q.HIT ? 0.25 * Math.exp(-(t - Q.HIT) * 3) : 0;
  return <AbsoluteFill style={{ background: th.bg }}>
    <AbsoluteFill style={{ background: `radial-gradient(70% 45% at ${50 + 8 * Math.sin(t * 0.6)}% ${30 + 5 * Math.cos(t * 0.5)}%, ${c}${th.dark ? '' : ''}, transparent 75%)`, opacity: (th.dark ? 0.85 : 0.35) + pulse }} />
    <AbsoluteFill style={{ background: `radial-gradient(60% 35% at 50% 95%, ${c}, transparent 70%)`, opacity: th.dark ? 0.45 : 0.18 }} />
    {th.dark && <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.65))' }} />}
  </AbsoluteFill>;
};
/** Floating bokeh: some sharp, some heavily blurred (foreground) for depth of field. */
export const Bokeh: React.FC<{ th: Theme; n?: number }> = ({ th, n = 26 }) => {
  const t = useT(), c = moodColor(t);
  return <AbsoluteFill style={{ pointerEvents: 'none' }}>{Array.from({ length: n }, (_, i) => {
    const near = i % 5 === 0, s = near ? 60 + rand(i, 2) * 80 : 6 + rand(i, 3) * 10;
    const y = ((rand(i, 4) * 2200 - t * (near ? 90 : 35) * (0.5 + rand(i, 5))) % 2200 + 2200) % 2200 - 140;
    const x = rand(i, 6) * 1080 + Math.sin(t * 0.8 + i) * 30;
    return <div key={i} style={{ position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: i % 3 ? c : th.yellow, opacity: near ? 0.18 : 0.5, filter: `blur(${near ? 18 : 1}px)`, mixBlendMode: th.dark ? 'screen' : 'multiply' }} />;
  })}</AbsoluteFill>;
};
/** A burst of particles at `at` from (x,y): flies out, falls with gravity, fades. */
export const Burst: React.FC<{ at: number; x: number; y: number; colors: string[]; n?: number; power?: number }> = ({ at, x, y, colors, n = 40, power = 1 }) => {
  const t = useT(), d = t - at; if (d < 0 || d > 1.6) return null;
  return <>{Array.from({ length: n }, (_, i) => {
    const a = rand(i, 11) * Math.PI * 2, v = (300 + rand(i, 12) * 700) * power, s = 8 + rand(i, 13) * 14;
    const px = x + Math.cos(a) * v * d, py = y + Math.sin(a) * v * d * 0.8 + 900 * d * d;
    return <div key={i} style={{ position: 'absolute', left: px, top: py, width: s, height: i % 3 ? s : s * 0.5, borderRadius: i % 2 ? '50%' : 3, background: colors[i % colors.length], opacity: Math.max(0, 1 - d / 1.4), transform: `rotate(${d * 500 * (rand(i, 14) - 0.5)}deg)`, boxShadow: `0 0 12px ${colors[i % colors.length]}` }} />;
  })}</>;
};
/** Glass card (dark) or ink card (light), with a springy entrance that includes blur and lift. */
export const Glass: React.FC<{ th: Theme; at: number; out?: number; x: number; y: number; w: number; h: number; children?: React.ReactNode; tilt?: number; style?: React.CSSProperties }> = ({ th, at, out = 99, x, y, w, h, children, tilt = 0, style }) => {
  const t = useT(); if (t < at || t > out + 0.25) return null;
  const p = pop(t, at, 200, 15), o = prog(t, out, out + 0.25), drift = Math.sin(t * 1.3 + x) * 6;
  return <div style={{ position: 'absolute', left: x, top: y + (1 - p) * 120 + drift - o * 60, width: w, height: h, borderRadius: th.dark ? 34 : 26, background: th.card, border: th.border, boxShadow: th.shadow, backdropFilter: th.dark ? 'blur(18px)' : undefined, transform: `perspective(1500px) rotateX(${(1 - p) * 25 + tilt}deg) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2) * (1 - o), filter: `blur(${(1 - Math.min(1, p)) * 10 + o * 10}px)`, overflow: 'hidden', ...style }}>{children}</div>;
};

// ---------- headline: the narration, word by word, with highlight boxes on key words ----------
const HL: Record<string, 'y' | 'r' | 'g'> = { intocable: 'y', inventó: 'g', mundo: 'g', 'quiebra.': 'r', '1975.': 'y', cinco: 'y' };
const LINES: [string, number, number][] = [['1975.', 0.08, 1.72], ['Kodak era intocable.', 1.78, 3.05], ['Entonces inventó algo', 3.08, 4.24], ['que cambiaría el mundo…', 4.24, 5.85], ['…y eso la llevó a la', 5.9, 6.66], ['quiebra.', 6.68, 8.4]];
export const Headline: React.FC<{ th: Theme; top?: number; size?: number }> = ({ th, top = 230, size = 92 }) => {
  const t = useT(), line = LINES.find(([, a, b]) => t >= a && t < b);
  if (!line) return null;
  const [text, a] = line, words = text.split(' '), big = text === 'quiebra.';
  // word timings follow the voice captions
  const wordAt = (i: number) => { const caps = CAPS.filter(c => c[1] >= a - 0.05 && c[1] < line[2]); const per = (line[2] - a) * 0.55 / words.length; return caps.length > 1 ? a + i * per : a + i * Math.min(0.18, per); };
  return <div style={{ position: 'absolute', left: 60, right: 60, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 24, rowGap: 6 }}>
    {words.map((w, i) => {
      const at = wordAt(i), p = pop(t, at, 260, 16), hl = HL[w.replace('…', '')] ?? HL[w];
      if (t < at) return <span key={i} style={{ fontFamily: F.body, fontWeight: 800, fontSize: big ? size * 2.2 : size, opacity: 0 }}>{w}</span>;
      const col = hl === 'y' ? th.yellow : hl === 'r' ? th.red : hl === 'g' ? th.green : th.text;
      const box = hl && !big;
      return <span key={i} style={{ position: 'relative', display: 'inline-block', fontFamily: F.body, fontWeight: 800, fontSize: big ? size * 2.2 : size, lineHeight: 1.08, letterSpacing: '-0.03em', color: box ? (th.dark ? '#111' : '#fff') : big ? th.red : col, transform: `translateY(${(1 - p) * 40}px) scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2), filter: `blur(${(1 - Math.min(1, p)) * 8}px)`, padding: box ? '0 12px' : 0, textShadow: big ? `0 0 60px ${th.red}88` : th.dark ? '0 6px 30px rgba(0,0,0,.5)' : undefined }}>
        {box && <span style={{ position: 'absolute', inset: '6% 0 2% 0', background: col, borderRadius: 10, transform: `scaleX(${pop(t, at + 0.08, 300, 18)})`, transformOrigin: '0 50%', zIndex: -1 }} />}
        <span style={{ position: 'relative' }}>{w}</span>
      </span>;
    })}
  </div>;
};

// ---------- characters: shaded busts (gradients, rim light, soft shadow), with blink, breathing, expressions ----------
export type Mood = 'happy' | 'wow' | 'sad' | 'stern' | 'shock' | 'talk';
type CharProps = { id: string; t: number; mood?: Mood; suit?: boolean; hair?: string; skin?: [string, string]; shirt?: [string, string]; glasses?: boolean; armsUp?: number; look?: number; tilt?: number; size?: number };
export const Character: React.FC<CharProps> = ({ id, t, mood = 'happy', suit, hair = '#3B2A22', skin = ['#F6CFB0', '#D9967A'], shirt = suit ? ['#3A3F6E', '#1E2140'] : ['#FFFFFF', '#CFD8E3'], glasses, armsUp = 0, look = 0, tilt = 0, size = 400 }) => {
  const seed = id.length * 1.7;
  const blink = ((t + seed) % 3.1) < 0.1 ? 0.1 : 1;
  const breathe = 1 + Math.sin(t * 2.4 + seed) * 0.012;
  const bob = Math.sin(t * 1.9 + seed) * 4;
  const headRot = tilt + Math.sin(t * 1.3 + seed) * 2.5;
  const talk = mood === 'talk' ? Math.abs(Math.sin(t * 16)) : 0;
  const brow = mood === 'wow' || mood === 'shock' ? -10 : mood === 'stern' ? 8 : mood === 'sad' ? -4 : 0;
  const browRot = mood === 'stern' ? 14 : mood === 'sad' ? -14 : 0;
  const g = (n: string) => `${id}-${n}`;
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 400 460" style={{ overflow: 'visible', filter: 'drop-shadow(0 30px 30px rgba(0,0,0,.35))' }}>
      <defs>
        <radialGradient id={g('skin')} cx="38%" cy="32%" r="75%"><stop offset="0" stopColor={skin[0]} /><stop offset="1" stopColor={skin[1]} /></radialGradient>
        <linearGradient id={g('shirt')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={shirt[0]} /><stop offset="1" stopColor={shirt[1]} /></linearGradient>
        <linearGradient id={g('hair')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix(hair, '#ffffff', 0.25)} /><stop offset="1" stopColor={hair} /></linearGradient>
      </defs>
      <g transform={`translate(0 ${bob * 0.4}) scale(${breathe}) `} style={{ transformOrigin: '200px 460px' }}>
        {/* arms raised (holding something overhead) */}
        {armsUp > 0 && [-1, 1].map(s => <path key={s} d={`M${200 + s * 120} 380 C${200 + s * 150} ${380 - 160 * armsUp} ${200 + s * 120} ${330 - 260 * armsUp} ${200 + s * 85} ${330 - 300 * armsUp}`} stroke={`url(#${g('shirt')})`} strokeWidth="46" strokeLinecap="round" fill="none" />)}
        {armsUp > 0 && [-1, 1].map(s => <circle key={s} cx={200 + s * 85} cy={330 - 300 * armsUp} r="26" fill={`url(#${g('skin')})`} />)}
        {/* torso */}
        <path d="M30 470 C30 370 100 318 200 318 C300 318 370 370 370 470 Z" fill={`url(#${g('shirt')})`} />
        {suit ? <>
          <path d="M160 322 L200 420 L240 322 Z" fill="#F4F1EA" />
          <path d="M186 340 L200 330 L214 340 L206 430 L200 440 L194 430 Z" fill="#D9363E" />
          <path d="M150 322 L200 430 L120 360 Z M250 322 L200 430 L280 360 Z" fill="rgba(0,0,0,.25)" />
        </> : <>
          <path d="M150 322 L200 380 L250 322 Z" fill="#7FB3E6" />
          <path d="M140 322 L195 400 L120 470 L80 470 Z M260 322 L205 400 L280 470 L320 470 Z" fill="rgba(0,0,0,.08)" />
          <rect x="250" y="390" width="46" height="8" rx="4" fill="#2C4A9A" />
        </>}
        {/* neck */}
        <path d="M168 270 L168 330 Q200 350 232 330 L232 270 Z" fill={skin[1]} />
        <ellipse cx="200" cy="326" rx="40" ry="10" fill="rgba(0,0,0,.18)" />
        {/* head */}
        <g transform={`rotate(${headRot} 200 300) translate(${look * 6} ${bob * 0.6})`}>
          <circle cx="120" cy="200" r="20" fill={skin[1]} /><circle cx="280" cy="200" r="20" fill={skin[1]} />
          <ellipse cx="200" cy="190" rx="82" ry="94" fill={`url(#${g('skin')})`} />
          <ellipse cx="236" cy="210" rx="48" ry="70" fill="rgba(120,50,30,.10)" />
          <path d="M126 150 C130 112 160 98 200 98" stroke="rgba(255,255,255,.35)" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* hair */}
          <path d={suit ? 'M116 178 C108 108 160 86 205 88 C258 90 296 118 286 182 C274 146 246 128 204 128 C162 128 134 146 116 178Z' : 'M114 190 C100 100 170 76 214 84 C268 92 300 130 286 186 C280 150 252 120 214 126 C210 140 160 150 134 150 C124 160 118 172 114 190Z'} fill={`url(#${g('hair')})`} />
          {/* brows */}
          {[-1, 1].map(s => <rect key={s} x={200 + s * 34 - 18} y={150 + brow} width="36" height="8" rx="4" fill={hair} transform={`rotate(${s * browRot} ${200 + s * 34} ${154 + brow})`} />)}
          {/* eyes */}
          {[-1, 1].map(s => <g key={s} transform={`translate(${200 + s * 34} 186) scale(1 ${blink})`}>
            <ellipse rx="15" ry={mood === 'wow' || mood === 'shock' ? 18 : 15} fill="#fff" />
            <circle cx={look * 4} cy="1" r="9" fill="#4A3426" /><circle cx={look * 4} cy="1" r="5" fill="#111" /><circle cx={look * 4 - 3} cy="-3" r="3" fill="#fff" />
            {mood === 'sad' && <path d="M-16 -10 L16 -4 L16 -20 L-16 -20Z" fill={skin[0]} transform={`scale(${s} 1)`} />}
            {mood === 'stern' && <path d="M-16 -18 L16 -4 L16 -20 L-16 -20Z" fill={skin[0]} transform={`scale(${-s} 1)`} />}
          </g>)}
          {glasses && <g fill="rgba(180,220,255,.12)" stroke="#2a2a2a" strokeWidth="5"><rect x="144" y="166" width="52" height="40" rx="14" /><rect x="204" y="166" width="52" height="40" rx="14" /><path d="M196 184 L204 184" /></g>}
          <path d="M200 196 Q190 222 202 226" stroke="rgba(120,50,30,.35)" strokeWidth="5" fill="none" strokeLinecap="round" />
          {[-1, 1].map(s => <ellipse key={s} cx={200 + s * 52} cy="226" rx="16" ry="9" fill="#FF8C8C" opacity="0.35" />)}
          {/* mouth */}
          {mood === 'happy' && <path d="M170 240 Q200 268 230 240 Q200 252 170 240Z" fill="#7A2A2A" stroke="#7A2A2A" strokeWidth="5" strokeLinejoin="round" />}
          {mood === 'wow' && <><path d="M166 236 Q200 290 234 236 Z" fill="#7A2A2A" /><path d="M176 238 Q200 248 224 238 L222 244 Q200 252 178 244Z" fill="#fff" /></>}
          {mood === 'talk' && <ellipse cx="200" cy="246" rx="20" ry={4 + 12 * talk} fill="#7A2A2A" />}
          {mood === 'sad' && <path d="M174 252 Q200 234 226 252" stroke="#7A2A2A" strokeWidth="6" fill="none" strokeLinecap="round" />}
          {mood === 'stern' && <path d="M176 246 L224 244" stroke="#7A2A2A" strokeWidth="7" strokeLinecap="round" />}
          {mood === 'shock' && <ellipse cx="200" cy="252" rx="16" ry="22" fill="#7A2A2A" />}
        </g>
      </g>
    </svg>
  );
};

// ---------- props with shading ----------
export const ShadedCamera: React.FC<{ size?: number; parts?: number; glow?: number; led?: number }> = ({ size = 400, parts = 1, glow = 0, led = 1 }) => {
  const v = (i: number) => parts >= (i + 1) / 4;
  return <svg width={size} height={size * 0.62} viewBox="0 0 360 224" style={{ overflow: 'visible', filter: `drop-shadow(0 24px 24px rgba(0,0,0,.4)) drop-shadow(0 0 ${40 * glow}px rgba(61,220,132,${0.8 * glow}))` }}>
    <defs>
      <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#C9CED8" /></linearGradient>
      <radialGradient id="cl" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#6A86FF" /><stop offset="0.5" stopColor="#1E2A6E" /><stop offset="1" stopColor="#05081E" /></radialGradient>
    </defs>
    {v(0) ? <><rect x="20" y="40" width="250" height="160" rx="26" fill="url(#cb)" /><rect x="20" y="40" width="250" height="40" rx="20" fill="rgba(255,255,255,.6)" /></> : <rect x="20" y="40" width="250" height="160" rx="26" fill="none" stroke="#5B8CFF" strokeWidth="3" strokeDasharray="10 8" />}
    {v(1) ? <><rect x="266" y="78" width="54" height="84" rx="12" fill="#2C3A7A" /><circle cx="322" cy="120" r="38" fill="#DADFEA" /><circle cx="322" cy="120" r="26" fill="url(#cl)" /><circle cx="312" cy="108" r="7" fill="#fff" opacity=".8" /></> : <circle cx="322" cy="120" r="38" fill="none" stroke="#5B8CFF" strokeWidth="3" strokeDasharray="8 7" />}
    {v(2) ? <><rect x="50" y="92" width="130" height="70" rx="12" fill="#1B1E2E" /><circle cx="85" cy="127" r="15" fill="#C9CED8" /><circle cx="145" cy="127" r="15" fill="#C9CED8" /><circle cx="85" cy="127" r="5" fill="#555" /><circle cx="145" cy="127" r="5" fill="#555" /></> : <rect x="50" y="92" width="130" height="70" rx="12" fill="none" stroke="#5B8CFF" strokeWidth="3" strokeDasharray="8 7" />}
    {v(3) ? <><rect x="60" y="16" width="58" height="28" rx="8" fill="#E2412E" /><circle cx="226" cy="168" r="10" fill="#FF5A4E" opacity={0.3 + 0.7 * led} /><circle cx="226" cy="168" r="18" fill="#FF5A4E" opacity={0.25 * led} /></> : <rect x="60" y="16" width="58" height="28" rx="8" fill="none" stroke="#5B8CFF" strokeWidth="3" strokeDasharray="6 6" />}
  </svg>;
};
export const GlowBulb: React.FC<{ size?: number; t: number }> = ({ size = 150, t }) => (
  <div style={{ position: 'relative', width: size, height: size }}>
    <div style={{ position: 'absolute', inset: -size * 0.6, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,90,.75), rgba(255,214,90,0) 65%)', transform: `scale(${1 + 0.08 * Math.sin(t * 8)})` }} />
    <svg width={size} height={size} viewBox="0 0 110 110" style={{ position: 'relative', overflow: 'visible' }}>
      <defs><radialGradient id="bg1" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#FFF6C8" /><stop offset="1" stopColor="#FFB928" /></radialGradient></defs>
      <path d="M55 8 C31 8 18 28 23 46 C27 60 39 64 39 78 L71 78 C71 64 83 60 87 46 C92 28 79 8 55 8Z" fill="url(#bg1)" />
      <rect x="39" y="80" width="32" height="18" rx="5" fill="#B9BCC6" /><rect x="39" y="86" width="32" height="4" fill="#8E929E" />
      <path d="M44 40 Q55 54 66 40" stroke="#C47A00" strokeWidth="4" fill="none" />
    </svg>
  </div>
);
/** Kodak HQ tower with lit windows; `crack` 0..1 splits and drops it. */
export const Tower: React.FC<{ size?: number; crack?: number; lit?: number }> = ({ size = 420, crack = 0, lit = 1 }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 300 420" style={{ overflow: 'visible', filter: 'drop-shadow(0 30px 30px rgba(0,0,0,.45))' }}>
    <defs><linearGradient id="tw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F2EEE6" /><stop offset="0.55" stopColor="#D8D2C6" /><stop offset="1" stopColor="#A9A296" /></linearGradient></defs>
    {[0, 1].map(s => <g key={s} transform={`translate(${(s ? 1 : -1) * crack * 70} ${crack * crack * 260 * (s ? 1.2 : 1)}) rotate(${(s ? 1 : -1) * crack * 18} ${s ? 220 : 80} 420)`}>
      <clipPath id={`tc${s}`}><path d={s ? 'M150 0 L300 0 L300 420 L160 420 L140 300 L165 200 L140 110Z' : 'M0 0 L150 0 L140 110 L165 200 L140 300 L160 420 L0 420Z'} /></clipPath>
      <g clipPath={`url(#tc${s})`}>
        <rect x="40" y="40" width="220" height="380" rx="12" fill="url(#tw)" />
        <rect x="20" y="20" width="260" height="34" rx="8" fill="#E2412E" />
        {Array.from({ length: 24 }, (_, i) => <rect key={i} x={62 + (i % 4) * 46} y={80 + Math.floor(i / 4) * 54} width="30" height="36" rx="5" fill={lit > 0.5 && (i * 7) % 5 ? '#FFD45A' : '#3a3f55'} style={lit > 0.5 && (i * 7) % 5 ? { filter: 'drop-shadow(0 0 8px #FFC93C)' } : undefined} />)}
      </g>
    </g>)}
  </svg>
);
