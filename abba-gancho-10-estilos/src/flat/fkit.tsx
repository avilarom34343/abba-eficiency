// Flat explainer kit (modelled on the reference reel): warm cream ground, flat illustrated UI cards with a thick ink
// outline and a hard offset shadow, springy pop-ins, captions in black boxes. Shared by the five flat versions (F1–F5).
import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import { F, prog, useT } from '../kit';
import '../premium/pkit';

export const K = { bg: '#EFEAE2', ink: '#1B1B1F', card: '#FBFAF7', bar: '#DCD5C8', red: '#E2412E', green: '#34B26A', blue: '#2C4A9A', yellow: '#F5C542', skin: '#E9B89A', hair: '#3B2A22', gray: '#8C8A85', pink: '#F4B6B0' };
// voice 03 + flat.wav cue times (see narracion/flat.py CUES)
export const Q = { y1975: 0.1, idea: 0.55, kodak: 1.78, count: 1.9, full: 2.75, build: 3.15, p1: 3.45, p2: 3.7, p3: 3.95, cam: 4.15, shot: 4.3, meet: 4.62, a1: 4.85, a2: 4.95, no1: 5.15, no2: 5.3, no3: 5.45, drawer: 5.62, years: 5.92, HIT: 6.68, outro: 8.5 };
export const CAPS: [string, number, number][] = [['Mil novecientos', 0.08, 0.8], ['setenta y cinco.', 0.8, 1.72], ['Kodak', 1.78, 2.2], ['era intocable.', 2.2, 3.05], ['Entonces', 3.08, 3.42], ['inventó algo', 3.42, 4.24], ['que cambiaría', 4.24, 4.95], ['el mundo…', 4.95, 5.85], ['…y eso la llevó', 5.9, 6.34], ['a la', 6.34, 6.66], ['quiebra.', 6.68, 8.4]];

/** Springy 0→1 (with overshoot) starting at `at` seconds. */
/** Same as usePop but pure (safe inside conditionals / loops). */
export const pop = (t: number, at: number, stiff = 220, damp = 12) => spring({ frame: Math.round((t - at) * 30), fps: 30, config: { stiffness: stiff, damping: damp } });
export const usePop = (at: number, stiff = 220, damp = 12) => pop(useCurrentFrame() / 30, at, stiff, damp);
export const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'scale' | 'up' | 'left' | 'right'; out?: number }> = ({ at, children, style, from = 'scale', out = 99 }) => {
  const t = useT(), p = usePop(at), o = prog(t, out, out + 0.2);
  if (t < at || t > out + 0.2) return null;
  const tr = from === 'scale' ? `scale(${p})` : from === 'up' ? `translateY(${(1 - p) * 140}px) scale(${0.9 + 0.1 * p})` : `translateX(${(1 - p) * (from === 'left' ? -500 : 500)}px)`;
  return <div style={{ position: 'absolute', transform: `${tr} scale(${1 - o * 0.3})`, opacity: Math.min(1, p * 3) * (1 - o), ...style }}>{children}</div>;
};
/** The signature card: off-white, ink outline, hard shadow. */
export const Card: React.FC<{ w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties; tilt?: boolean }> = ({ w, h, children, style, tilt = true }) => (
  <div style={{ width: w, height: h, background: K.card, border: `4px solid ${K.ink}`, borderRadius: 26, boxShadow: `8px 10px 0 ${K.ink}`, position: 'relative', overflow: 'hidden', transform: tilt ? 'perspective(1600px) rotateX(6deg) rotateY(-5deg)' : undefined, ...style }}>{children}</div>
);
export const Bar: React.FC<{ w: number; c?: string; h?: number; style?: React.CSSProperties }> = ({ w, c = K.bar, h = 14, style }) => <div style={{ width: w, height: h, borderRadius: h, background: c, ...style }} />;
/** Little browser chrome for window cards. */
export const Chrome: React.FC<{ title?: string }> = ({ title }) => (
  <div style={{ height: 46, borderBottom: `4px solid ${K.ink}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', background: '#fff' }}>
    {[K.red, K.yellow, K.green].map(c => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, border: `2px solid ${K.ink}` }} />)}
    {title && <div style={{ marginLeft: 12, fontFamily: F.body, fontWeight: 800, fontSize: 24, color: K.ink }}>{title}</div>}
  </div>
);

// ---------- illustrations ----------
export const Face: React.FC<{ size?: number; hair?: string; mood?: 'happy' | 'sad' | 'shock' | 'flat'; suit?: boolean; bg?: string }> = ({ size = 120, hair = K.hair, mood = 'happy', suit, bg = '#CFE9F7' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="56" fill={bg} stroke={K.ink} strokeWidth="4" />
    <clipPath id="fc"><circle cx="60" cy="60" r="54" /></clipPath>
    <g clipPath="url(#fc)">
      <path d={suit ? 'M14 120 Q60 80 106 120Z' : 'M20 120 Q60 84 100 120Z'} fill={suit ? '#2B2F55' : '#fff'} stroke={K.ink} strokeWidth="4" />
      {suit && <path d="M56 98 L60 120 L64 98Z" fill={K.red} />}
      <circle cx="60" cy="56" r="26" fill={K.skin} stroke={K.ink} strokeWidth="4" />
      <path d="M33 52 Q36 26 60 27 Q85 27 87 52 Q74 40 60 42 Q46 40 33 52Z" fill={hair} stroke={K.ink} strokeWidth="3" />
      <circle cx="51" cy="58" r="3.2" fill={K.ink} /><circle cx="69" cy="58" r="3.2" fill={K.ink} />
      {mood === 'happy' && <path d="M51 67 Q60 75 69 67" stroke={K.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
      {mood === 'sad' && <path d="M51 72 Q60 64 69 72" stroke={K.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
      {mood === 'flat' && <path d="M52 69 L68 69" stroke={K.ink} strokeWidth="3.5" strokeLinecap="round" />}
      {mood === 'shock' && <ellipse cx="60" cy="70" rx="5" ry="7" fill={K.ink} />}
    </g>
  </svg>
);
export const Bulb: React.FC<{ size?: number; on?: number; t?: number }> = ({ size = 110, on = 1, t = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 110 110" style={{ overflow: 'visible' }}>
    {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + t; return <line key={i} x1={55 + Math.cos(a) * 46} y1={46 + Math.sin(a) * 46} x2={55 + Math.cos(a) * (58 + 6 * on)} y2={46 + Math.sin(a) * (58 + 6 * on)} stroke={K.ink} strokeWidth="4" strokeLinecap="round" opacity={on} />; })}
    <path d="M55 12 C33 12 22 30 26 46 C29 58 40 62 40 76 L70 76 C70 62 81 58 84 46 C88 30 77 12 55 12Z" fill={on > 0.5 ? K.yellow : '#fff'} stroke={K.ink} strokeWidth="4" />
    <rect x="40" y="78" width="30" height="16" rx="4" fill="#cfcfcf" stroke={K.ink} strokeWidth="4" />
  </svg>
);
/** The 1975 digital camera, flat. `parts` 0..1 reveals it piece by piece. */
export const Camera: React.FC<{ size?: number; parts?: number; led?: number }> = ({ size = 360, parts = 1, led = 1 }) => {
  const v = (i: number) => (parts >= (i + 1) / 4 ? 1 : 0);
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 360 224" style={{ overflow: 'visible' }}>
      {v(0) ? <rect x="20" y="40" width="250" height="160" rx="22" fill="#fff" stroke={K.ink} strokeWidth="5" /> : <rect x="20" y="40" width="250" height="160" rx="22" fill="none" stroke={K.blue} strokeWidth="3" strokeDasharray="10 8" />}
      {v(1) ? <><rect x="270" y="80" width="50" height="80" rx="10" fill={K.blue} stroke={K.ink} strokeWidth="5" /><circle cx="322" cy="120" r="34" fill="#fff" stroke={K.ink} strokeWidth="5" /><circle cx="322" cy="120" r="17" fill={K.ink} /><circle cx="316" cy="113" r="5" fill="#fff" /></>
        : <circle cx="322" cy="120" r="34" fill="none" stroke={K.blue} strokeWidth="3" strokeDasharray="8 7" />}
      {v(2) ? <><rect x="50" y="90" width="130" height="70" rx="10" fill={K.ink} /><circle cx="85" cy="125" r="14" fill="#fff" /><circle cx="145" cy="125" r="14" fill="#fff" /></>
        : <rect x="50" y="90" width="130" height="70" rx="10" fill="none" stroke={K.blue} strokeWidth="3" strokeDasharray="8 7" />}
      {v(3) ? <><rect x="60" y="18" width="56" height="26" rx="6" fill={K.red} stroke={K.ink} strokeWidth="5" /><circle cx="226" cy="168" r="10" fill={K.red} opacity={0.35 + 0.65 * led} stroke={K.ink} strokeWidth="3" /></>
        : <rect x="60" y="18" width="56" height="26" rx="6" fill="none" stroke={K.blue} strokeWidth="3" strokeDasharray="6 6" />}
    </svg>
  );
};
/** Kodak headquarters as a flat storefront (red/white awning like the reference's shop), no logo. */
export const HQ: React.FC<{ size?: number; crack?: number; lights?: number }> = ({ size = 380, crack = 0, lights = 1 }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 380 437" style={{ overflow: 'visible' }}>
    <g transform={`translate(${-crack * 30} ${crack * 40}) rotate(${-crack * 6} 100 437)`}>
      <path d="M30 120 L190 120 L190 420 L30 420Z" fill="#fff" stroke={K.ink} strokeWidth="5" />
      {[0, 1, 2].map(r => [0, 1].map(c => <rect key={`${r}${c}`} x={56 + c * 66} y={200 + r * 66} width="44" height="44" rx="6" fill={lights > 0.5 ? K.yellow : '#9a9a9a'} stroke={K.ink} strokeWidth="4" />))}
    </g>
    <g transform={`translate(${crack * 30} ${crack * 60}) rotate(${crack * 8} 280 437)`}>
      <path d="M190 120 L350 120 L350 420 L190 420Z" fill="#fff" stroke={K.ink} strokeWidth="5" />
      {[0, 1, 2].map(r => [0, 1].map(c => <rect key={`${r}${c}`} x={214 + c * 66} y={200 + r * 66} width="44" height="44" rx="6" fill={lights > 0.5 ? K.yellow : '#9a9a9a'} stroke={K.ink} strokeWidth="4" />))}
    </g>
    <g transform={`translate(0 ${crack * 80}) rotate(${crack * 10} 190 120)`}>
      <path d="M14 70 L366 70 L366 130 L14 130Z" fill="#fff" stroke={K.ink} strokeWidth="5" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${14 + i * 44} 70 L${58 + i * 44} 70 L${58 + i * 44} 130 L${14 + i * 44} 130Z`} fill={i % 2 ? '#fff' : K.red} stroke={K.ink} strokeWidth="4" />)}
      <rect x="120" y="20" width="140" height="44" rx="10" fill={K.blue} stroke={K.ink} strokeWidth="5" />
      <rect x="140" y="36" width="100" height="12" rx="6" fill="#fff" />
    </g>
    {crack > 0 && <path d="M190 120 L176 200 L204 260 L182 330 L196 420" stroke={K.ink} strokeWidth="6" fill="none" opacity={Math.min(1, crack * 5)} />}
  </svg>
);
/** Big rubber stamp text. */
export const Stamp: React.FC<{ text: string; size?: number; rot?: number; color?: string }> = ({ text, size = 120, rot = -12, color = K.red }) => (
  <div style={{ transform: `rotate(${rot}deg)`, border: `${size * 0.07}px solid ${color}`, borderRadius: size * 0.18, padding: `${size * 0.04}px ${size * 0.22}px`, fontFamily: F.body, fontWeight: 800, fontSize: size, lineHeight: 1, color, letterSpacing: '0.04em', background: 'rgba(255,255,255,.55)' }}>{text}</div>
);
/** A pixel-art mascot: a little film canister with eyes (like the reference's pixel fire guide). */
const MASCOT = ['....KKKK....', '...KYYYYK...', '..KYYYYYYK..', '.KKKKKKKKKK.', '.KOOOOOOOOK.', '.KOWKOOWKOK.', '.KOWKOOWKOK.', '.KOOOOOOOOK.', '.KOOMMMMOOK.', '.KKKKKKKKKK.', '..KK....KK..'];
export const Mascot: React.FC<{ size?: number; shock?: boolean }> = ({ size = 96, shock }) => {
  const px = size / 12, col: Record<string, string> = { K: K.ink, Y: '#FFD84D', O: '#FF9A3C', W: '#fff', M: shock ? K.ink : '#B4462E' };
  return <svg width={size} height={size * 11 / 12} style={{ imageRendering: 'pixelated' }}>{MASCOT.flatMap((row, y) => row.split('').map((c, x) => c === '.' ? null : <rect key={`${x},${y}`} x={x * px} y={y * px} width={px + 0.5} height={px + 0.5} fill={shock && c === 'M' && (x === 4 || x === 7) ? 'transparent' : col[c]} />))}</svg>;
};

// ---------- text ----------
export const Captions: React.FC<{ top?: number; dark?: boolean }> = ({ top = 1440, dark }) => {
  const t = useT(), c = CAPS.find(([, a, b]) => t >= a && t < b);
  if (!c) return null;
  return <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center' }}>
    <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 50, color: dark ? K.ink : '#fff', background: dark ? '#fff' : '#000', padding: '4px 16px', lineHeight: 1.2 }}>{c[0]}</span>
  </div>;
};
export const Header: React.FC<{ text: string; top?: number; color?: string }> = ({ text, top = 1350, color = '#3a3a3a' }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 60, color, letterSpacing: '-0.01em' }}>{text}</div>
);
/** Dark ending shared by all flat versions: the locked drawer with the camera's red light blinking through the gap. */
export const FlatOutro: React.FC = () => {
  const t = useT(), a = prog(t, Q.outro, Q.outro + 0.5), blink = Math.sin(t * 7) > 0 ? 1 : 0.25;
  if (t < Q.outro) return null;
  return <AbsoluteFill style={{ background: '#0b0a0c', opacity: a }}>
    <div style={{ position: 'absolute', left: 290, top: 820, width: 500, height: 220, borderRadius: 26, border: '4px solid #2a2630' }} />
    <div style={{ position: 'absolute', left: 470, top: 900, width: 140, height: 14, borderRadius: 7, background: '#2a2630' }} />
    <div style={{ position: 'absolute', left: 528, top: 1030, width: 24, height: 24, borderRadius: '50%', background: K.red, opacity: blink, boxShadow: `0 0 40px 12px rgba(226,65,46,${0.5 * blink})` }} />
  </AbsoluteFill>;
};
/** Whole-scene shake on the hit. */
export const hitShake = (t: number, amp = 26) => { const k = t < Q.HIT ? 0 : Math.max(0, 1 - (t - Q.HIT) / 0.6); return `translate(${Math.sin(t * 93) * amp * k}px, ${Math.cos(t * 71) * amp * k}px)`; };
