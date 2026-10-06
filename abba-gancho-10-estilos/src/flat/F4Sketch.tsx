// F4 · Sketchbook: the story drawn live on notebook pages, stroke by stroke, with pages flipping on each beat.
// Stick-figure inventor + light bulb, the 90% empire, the camera sketched part by part, the board's NO bubbles,
// years crossed out, and a red marker scrawl: QUIEBRA.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, F, prog, useT } from '../kit';
import { Captions, FlatOutro, K, Q, hitShake } from './fkit';

const INK = '#22223A', MARK = K.red;
/** A path that draws itself between a and b seconds. */
const D: React.FC<{ d: string; a: number; b?: number; c?: string; w?: number; t: number; fill?: string }> = ({ d, a, b, c = INK, w = 7, t, fill }) => {
  const p = prog(t, a, b ?? a + 0.35, x => x);
  return p <= 0 ? null : <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={c} strokeWidth={w} fill={p >= 1 && fill ? fill : 'none'} strokeLinecap="round" strokeLinejoin="round" />;
};
const Hand: React.FC<{ x: number; y: number; size: number; a: number; t: number; c?: string; rot?: number; children: string }> = ({ x, y, size, a, t, c = INK, rot = -3, children }) => {
  const n = Math.floor(prog(t, a, a + 0.04 * children.length + 0.05, z => z) * children.length);
  return <text x={x} y={y} fontFamily={F.hand} fontSize={size} fill={c} transform={`rotate(${rot} ${x} ${y})`}>{children.slice(0, n)}</text>;
};
const Stick: React.FC<{ x: number; y: number; a: number; t: number; s?: number; suit?: boolean; arms?: 'up' | 'down' }> = ({ x, y, a, t, s = 1, suit, arms = 'down' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <D t={t} a={a} b={a + 0.2} d="M0 -110 a32 32 0 1 0 0.1 0" />
    <D t={t} a={a + 0.15} b={a + 0.3} d="M0 -46 L0 50" w={8} />
    <D t={t} a={a + 0.25} b={a + 0.4} d={arms === 'up' ? 'M-60 -90 L0 -20 L60 -90' : 'M-50 20 L0 -20 L50 20'} />
    <D t={t} a={a + 0.3} b={a + 0.45} d="M-40 120 L0 50 L40 120" />
    {suit && <D t={t} a={a + 0.4} b={a + 0.5} d="M-6 -40 L0 0 L6 -40" c={MARK} w={6} />}
  </g>
);
/** Notebook page; flips away (rotateY) when `out` passes. */
const Page: React.FC<{ a: number; b: number; t: number; children: React.ReactNode }> = ({ a, b, t, children }) => {
  if (t < a - 0.01 || t >= b + 0.3) return null;
  const flip = prog(t, b, b + 0.3);
  return <AbsoluteFill style={{ transformOrigin: '0 50%', transform: `perspective(2200px) rotateY(${-flip * 100}deg)`, zIndex: Math.round(100 - a * 10) }}>
    <div style={{ position: 'absolute', left: 70, top: 220, width: 940, height: 1150, background: '#FFFDF7', border: `4px solid ${K.ink}`, borderRadius: 18, boxShadow: `8px 10px 0 ${K.ink}`, overflow: 'hidden' }}>
      <svg width="940" height="1150" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1="0" x2="940" y1={90 + i * 50} y2={90 + i * 50} stroke="#BFD3EE" strokeWidth="2" />)}
        <line x1="110" x2="110" y1="0" y2="1150" stroke="#F2A7A0" strokeWidth="3" />
        {[200, 575, 950].map(y => <circle key={y} cx="50" cy={y} r="16" fill={K.bg} stroke="#c9c2b5" strokeWidth="3" />)}
        {children}
      </svg>
    </div>
  </AbsoluteFill>;
};

export const F4Sketch: React.FC = () => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const hit = t >= Q.HIT;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <AbsoluteFill style={{ transform: hitShake(t, 34) }}>
        {/* back pages for depth */}
        {[2, 1].map(i => <div key={i} style={{ position: 'absolute', left: 70 + i * 10, top: 220 + i * 12, width: 940, height: 1150, background: '#F7F2E8', border: `4px solid ${K.ink}`, borderRadius: 18 }} />)}
        <Page a={0} b={1.5} t={t}>
          <Hand t={t} a={0.1} x={170} y={210} size={120}>1975</Hand>
          <Stick t={t} a={0.2} x={400} y={800} s={1.5} arms="up" />
          <D t={t} a={0.3} b={0.6} d="M560 900 L880 900 M590 900 L590 1040 M850 900 L850 1040" w={8} />
          <g transform="translate(470 420)">
            <D t={t} a={Q.idea} b={Q.idea + 0.25} d="M0 -80 C-50 -80 -70 -40 -60 -10 C-50 15 -30 25 -30 50 L30 50 C30 25 50 15 60 -10 C70 -40 50 -80 0 -80Z" fill={K.yellow} />
            <D t={t} a={Q.idea + 0.2} b={Q.idea + 0.3} d="M-25 65 L25 65 M-18 80 L18 80" />
            {Array.from({ length: 7 }, (_, i) => { const r = (i / 7) * Math.PI * 1.2 - Math.PI * 1.1; return <D key={i} t={t} a={Q.idea + 0.28 + i * 0.03} b={Q.idea + 0.4 + i * 0.03} d={`M${Math.cos(r) * 100} ${-20 + Math.sin(r) * 100} L${Math.cos(r) * 140} ${-20 + Math.sin(r) * 140}`} c={MARK} w={6} />; })}
          </g>
        </Page>
        <Page a={1.5} b={3.0} t={t}>
          <D t={t} a={1.55} b={1.95} d="M170 900 L170 420 L470 420 L470 900 Z M150 420 L320 300 L490 420" w={8} />
          {[0, 1, 2].map(r => [0, 1].map(c => <D key={`${r}${c}`} t={t} a={1.7 + (r * 2 + c) * 0.04} b={1.85 + (r * 2 + c) * 0.04} d={`M${210 + c * 140} ${490 + r * 130} h80 v70 h-80 Z`} w={6} />))}
          <Hand t={t} a={1.8} x={190} y={1000} size={70}>KODAK</Hand>
          <circle cx="720" cy="560" r="160" fill="none" stroke={INK} strokeWidth="7" opacity={t > 1.8 ? 1 : 0} />
          <path d={`M720 560 L720 400 A160 160 0 ${cnt > 50 ? 1 : 0} 1 ${720 + 160 * Math.sin(cnt / 100 * Math.PI * 2)} ${560 - 160 * Math.cos(cnt / 100 * Math.PI * 2)} Z`} fill={K.green} stroke={INK} strokeWidth="6" opacity={cnt > 0 ? 0.9 : 0} />
          <Hand t={t} a={Q.full - 0.1} x={600} y={850} size={120} c={MARK}>{`${cnt}%`}</Hand>
          <D t={t} a={Q.full} b={Q.full + 0.3} d="M570 800 C560 700 860 690 870 790 C880 900 580 910 570 820" c={MARK} w={7} />
        </Page>
        <Page a={3.0} b={4.5} t={t}>
          <Hand t={t} a={3.05} x={170} y={250} size={64}>el prototipo</Hand>
          <g transform="translate(180 420) scale(1.7)">
            <D t={t} a={3.15} b={Q.p1} d="M20 40 h250 a22 22 0 0 1 22 22 v116 a22 22 0 0 1 -22 22 h-250 a22 22 0 0 1 -22 -22 v-116 a22 22 0 0 1 22 -22Z" w={5} />
            <D t={t} a={Q.p1} b={Q.p2} d="M292 80 h40 v80 h-40 M362 120 a30 30 0 1 0 0.1 0 M362 120 a12 12 0 1 0 0.1 0" w={5} />
            <D t={t} a={Q.p2} b={Q.p3} d="M50 90 h130 v70 h-130 Z M85 125 a14 14 0 1 0 0.1 0 M145 125 a14 14 0 1 0 0.1 0" w={5} />
            <D t={t} a={Q.p3} b={Q.cam} d="M60 40 v-22 h56 v22 M226 168 a10 10 0 1 0 0.1 0" w={5} c={MARK} />
          </g>
          {t >= Q.shot && <g transform="translate(720 860)">{Array.from({ length: 12 }, (_, i) => { const r = (i / 12) * Math.PI * 2; const L = prog(t, Q.shot, Q.shot + 0.15); return <line key={i} x1={Math.cos(r) * 30} y1={Math.sin(r) * 30} x2={Math.cos(r) * (30 + 90 * L)} y2={Math.sin(r) * (30 + 90 * L)} stroke={K.yellow} strokeWidth="10" strokeLinecap="round" />; })}</g>}
          <Hand t={t} a={Q.shot} x={200} y={1000} size={96} c={MARK}>¡funciona!</Hand>
        </Page>
        <Page a={4.5} b={Q.years} t={t}>
          <Hand t={t} a={4.55} x={170} y={230} size={64}>la junta</Hand>
          <D t={t} a={4.6} b={4.9} d="M150 670 L800 670 M190 670 L190 860 M760 670 L760 860" w={8} />
          {[300, 470, 640].map((x, i) => <Stick key={x} t={t} a={4.62 + i * 0.1} x={x} y={600} s={0.9} suit />)}
          {[Q.no1, Q.no2, Q.no3].map((a, i) => <g key={i} transform={`translate(${300 + i * 170} ${330 - (i % 2) * 40})`}>
            <D t={t} a={a} b={a + 0.15} d="M-70 -50 h140 a20 20 0 0 1 20 20 v50 a20 20 0 0 1 -20 20 h-90 l-30 30 v-30 h-20 a20 20 0 0 1 -20 -20 v-50 a20 20 0 0 1 20 -20Z" w={6} />
            <Hand t={t} a={a + 0.05} x={-44} y={20} size={58} c={MARK} rot={0}>NO</Hand>
          </g>)}
          <D t={t} a={Q.drawer} b={Q.drawer + 0.2} d="M560 950 h230 v130 h-230 Z M630 1010 h90" w={7} />
          <D t={t} a={Q.drawer + 0.2} b={Q.drawer + 0.3} d="M555 945 L795 1085 M795 945 L555 1085" c={MARK} w={7} />
          <Stick t={t} a={4.7} x={300} y={960} s={0.85} arms="up" />
        </Page>
        <Page a={Q.years} b={Q.HIT + 1.9} t={t}>
          {[1980, 1990, 2000, 2012].map((y, i) => { const a = Q.years + i * 0.16; return <g key={y}>
            <Hand t={t} a={a} x={220} y={330 + i * 190} size={130} rot={-2}>{String(y)}</Hand>
            {i < 3 && <D t={t} a={a + 0.1} b={a + 0.2} d={`M200 ${300 + i * 190} L640 ${280 + i * 190}`} c={MARK} w={9} />}
          </g>; })}
          {/* the crash: red scrawl over the page */}
          {hit && <>
            <D t={t} a={Q.HIT} b={Q.HIT + 0.3} d="M140 300 C400 200 700 500 300 600 C-20 700 900 700 700 900 C500 1100 200 900 800 1050" c={MARK} w={16} />
            <g transform={`translate(470 620) scale(${1 + 0.6 * Math.max(0, 1 - (t - Q.HIT) * 5)}) rotate(-8)`}>
              <text x="0" y="0" textAnchor="middle" fontFamily={F.hand} fontSize={170} fill={MARK} stroke="#FFFDF7" strokeWidth="10" paintOrder="stroke">QUIEBRA</text>
            </g>
          </>}
        </Page>
      </AbsoluteFill>
      {t < Q.outro && <Captions top={1460} />}
      <FlatOutro />
      <AbbaTag color={K.card} />
    </AbsoluteFill>
  );
};
