// Shared kit for the 10 hook styles: fonts, palette, the master timeline, and reusable pieces.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/fonts';

// ---------- fonts (served locally: the render browser can't fetch Google Fonts through the proxy) ----------
const fonts: [string, string, string][] = [
  ['Archivo Black', 'archivo-black-400.ttf', '400'],
  ['Inter Tight', 'inter-tight-300.ttf', '300'], ['Inter Tight', 'inter-tight-600.ttf', '600'], ['Inter Tight', 'inter-tight-800.ttf', '800'],
  ['Space Grotesk', 'space-grotesk-500.ttf', '500'], ['Space Grotesk', 'space-grotesk-700.ttf', '700'],
  ['Permanent Marker', 'permanent-marker-400.ttf', '400'],
];
fonts.forEach(([family, file, weight]) => loadFont({ family, url: staticFile(`fonts/${file}`), weight }));
export const F = { display: 'Archivo Black', body: 'Inter Tight', mono: 'Space Grotesk', hand: 'Permanent Marker' };

// ---------- palette ----------
export const C = { bg: '#07060F', magenta: '#FF2BD6', blue: '#2F6BFF', lime: '#B6FF3B', orange: '#FF7A1A', white: '#FFFFFF', ink: '#0B0A14', gray: '#8A8A96' };

// ---------- master timeline (seconds) — identical for all 10 versions ----------
export const FPS = 30, DUR = 10;
export const T = {
  y1975: 0.15, intocable: 0.9, countStart: 1.1, countEnd: 2.7, // 0–3 s
  cut1: 1.5, inventa: 3.0, camera: 3.6, cut2: 4.5,              // 3–6 s
  quiebraLine: 6.0, HIT: 6.7,                                   // 6–8.5 s · HIT = the punch of the hook
  outro: 8.5, abba: 8.8,                                        // 8.5–10 s
};
export const LINES = {
  a1: '1975.', a2: 'Kodak era intocable.', b: 'Entonces inventó algo que cambiaría el mundo…', c1: '…y eso la llevó a la', c2: 'quiebra.',
};
export const SAFE = 150; // px kept free of important text, top and bottom

// ---------- timing helpers ----------
export const s2f = (s: number) => Math.round(s * FPS);
export const useT = () => useCurrentFrame() / FPS;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
/** 0→1 progress between two times (seconds), eased and clamped. */
export const prog = (t: number, a: number, b: number, e = ease) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const between = (t: number, a: number, b: number) => t >= a && t < b;
export const useSpring = (at: number, config = { damping: 13, stiffness: 170 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  return spring({ frame: f - s2f(at), fps, config });
};
/** deterministic pseudo-random */
export const rand = (i: number, salt = 1) => { const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453; return x - Math.floor(x); };
/** camera shake offset that decays after `at` */
export const shake = (t: number, at: number, amp = 26, len = 0.6) => {
  const k = t < at ? 0 : Math.max(0, 1 - (t - at) / len);
  return { x: Math.sin(t * 93) * amp * k, y: Math.cos(t * 71) * amp * k };
};

// ---------- text ----------
type WordsProps = { text: string; at: number; out?: number; stagger?: number; style?: React.CSSProperties; wordStyle?: (i: number, w: string) => React.CSSProperties; from?: 'up' | 'down' | 'blur' | 'scale' };
/** Word-by-word kinetic entrance (and optional exit). */
export const Words: React.FC<WordsProps> = ({ text, at, out = 99, stagger = 0.07, style, wordStyle, from = 'up' }) => {
  const t = useT();
  const words = text.split(' ');
  const gone = prog(t, out, out + 0.3, Easing.in(Easing.cubic));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.28em', ...style }}>
      {words.map((w, i) => {
        const p = prog(t, at + i * stagger, at + i * stagger + 0.55);
        const tr = from === 'up' ? `translateY(${(1 - p) * 0.9}em)` : from === 'down' ? `translateY(${-(1 - p) * 0.9}em)` : from === 'scale' ? `scale(${0.4 + 0.6 * p})` : '';
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'visible' }}>
            <span style={{ display: 'inline-block', opacity: p * (1 - gone), transform: `${tr} translateY(${-gone * 0.4}em)`, filter: `blur(${(1 - p) * 14 + gone * 10}px)`, ...wordStyle?.(i, w) }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Percentage counter 0 → 90%. */
export const useCount = (t: number, to = 90) => Math.round(to * prog(t, T.countStart, T.countEnd, Easing.out(Easing.cubic)));

/** Small, elegant ABBA signature in the bottom-right corner (inside the safe zone). */
export const AbbaTag: React.FC<{ color?: string; at?: number }> = ({ color = '#fff', at = T.abba }) => {
  const t = useT(), p = prog(t, at, at + 0.8);
  return (
    <div style={{ position: 'absolute', right: 72, bottom: SAFE + 30, fontFamily: F.body, fontWeight: 600, fontSize: 30, letterSpacing: `${0.5 + (1 - p) * 0.4}em`, color, opacity: p * 0.85 }}>ABBA</div>
  );
};

/** Film grain + vignette for a cinematic finish. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity }}>
      <svg width="1080" height="1920"><filter id={`g${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 6} /></filter><rect width="100%" height="100%" filter={`url(#g${f % 6})`} /></svg>
    </AbsoluteFill>
  );
};
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(85% 60% at 50% 50%, transparent 45%, rgba(0,0,0,${strength}) 100%)` }} />
);
/** White flash at a given time. */
export const Flash: React.FC<{ at: number; color?: string; len?: number }> = ({ at, color = '#fff', len = 0.25 }) => {
  const t = useT(), o = t < at ? 0 : Math.max(0, 1 - (t - at) / len);
  return <AbsoluteFill style={{ background: color, opacity: o * 0.85, pointerEvents: 'none' }} />;
};
/** Fade to near-black for the outro. */
export const Outro: React.FC<{ at?: number; to?: number }> = ({ at = T.outro, to = 0.92 }) => {
  const t = useT();
  return <AbsoluteFill style={{ background: '#000', opacity: prog(t, at, at + 0.6) * to, pointerEvents: 'none' }} />;
};

// ---------- illustrations (flat, no real logos) ----------
/** The first digital camera (1975): a toaster-sized box with a side lens and a cassette deck. */
export const DigitalCamera: React.FC<{ size?: number; body?: string; accent?: string; led?: number; mono?: boolean; style?: React.CSSProperties }> = ({ size = 520, body = '#E9E6F2', accent = C.magenta, led = 1, mono, style }) => {
  const dark = mono ? '#3a3a44' : '#2A2540', mid = mono ? '#6b6b75' : '#B9B2CE';
  return (
    <svg viewBox="0 0 520 360" width={size} height={size * 360 / 520} style={style}>
      <rect x="40" y="70" width="380" height="230" rx="26" fill={body} />
      <rect x="40" y="70" width="380" height="54" rx="26" fill={mid} />
      <rect x="40" y="100" width="380" height="24" fill={mid} />
      <rect x="80" y="160" width="190" height="104" rx="12" fill={dark} />
      <rect x="98" y="178" width="154" height="68" rx="8" fill={mono ? '#55555f' : '#4B4370'} />
      <circle cx="140" cy="212" r="20" fill={mid} /><circle cx="210" cy="212" r="20" fill={mid} />
      <rect x="296" y="160" width="96" height="38" rx="10" fill={dark} />
      <circle cx="318" cy="236" r="12" fill={mono ? '#777' : accent} opacity={0.25 + 0.75 * led} />
      <circle cx="318" cy="236" r={22} fill={accent} opacity={mono ? 0 : 0.35 * led} />
      <rect x="420" y="120" width="70" height="110" rx="14" fill={dark} />
      <circle cx="490" cy="175" r="44" fill={dark} /><circle cx="490" cy="175" r="30" fill={mono ? '#4a4a52' : '#6F64A8'} /><circle cx="482" cy="166" r="9" fill="#fff" opacity="0.6" />
      <rect x="120" y="44" width="70" height="30" rx="8" fill={dark} />
    </svg>
  );
};
/** Film canister with a strip of film. */
export const FilmRoll: React.FC<{ size?: number; color?: string; strip?: number }> = ({ size = 300, color = C.orange, strip = 1 }) => (
  <svg viewBox="0 0 300 300" width={size} height={size}>
    <rect x="30" y="40" width="120" height="220" rx="20" fill={color} />
    <rect x="30" y="40" width="120" height="30" rx="10" fill="#2A2540" /><rect x="30" y="230" width="120" height="30" rx="10" fill="#2A2540" />
    <rect x="76" y="20" width="28" height="24" rx="6" fill="#2A2540" />
    <g transform={`translate(150 100) scale(${strip} 1)`}>
      <rect width="150" height="100" fill="#1d1a2b" />
      {Array.from({ length: 8 }, (_, i) => <React.Fragment key={i}><rect x={8 + i * 18} y="8" width="10" height="10" rx="2" fill="#e9e6f2" /><rect x={8 + i * 18} y="82" width="10" height="10" rx="2" fill="#e9e6f2" /></React.Fragment>)}
      <rect x="10" y="28" width="60" height="44" rx="4" fill={C.blue} opacity="0.7" /><rect x="80" y="28" width="60" height="44" rx="4" fill={C.magenta} opacity="0.7" />
    </g>
  </svg>
);

/** Full-bleed text block centred in a band (keeps clear of the safe zones). */
export const Band: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: 'absolute', left: 70, right: 70, top, textAlign: 'center', ...style }}>{children}</div>
);
