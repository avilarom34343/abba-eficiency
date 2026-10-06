// 08 · Pizarra de estrategia: a founder's board — marker strokes and sticky notes draw themselves; on "quiebra" a giant arrow crashes down and crosses everything out.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, C, F, Grain, LINES, Outro, T, prog, shake, useCount, useT } from '../kit';

/** A path that draws itself between `at` and `at+dur`. */
const Stroke: React.FC<{ d: string; at: number; dur?: number; color?: string; w?: number }> = ({ d, at, dur = 0.5, color = '#fff', w = 10 }) => {
  const t = useT(), p = prog(t, at, at + dur, x => x);
  return <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={p > 0 ? 1 : 0} />;
};
/** Sticky note that slaps onto the board. */
const Note: React.FC<{ x: number; y: number; w: number; h: number; color: string; at: number; r: number; fall?: number; children: React.ReactNode }> = ({ x, y, w, h, color, at, r, fall = 0, children }) => {
  const t = useT(), p = prog(t, at, at + 0.22, x2 => x2);
  return (
    <div style={{ position: 'absolute', left: x, top: y + fall * fall * 1600, width: w, height: h, background: color, boxShadow: '0 18px 30px rgba(0,0,0,.45)', transform: `rotate(${r + fall * 70}deg) scale(${p < 1 ? 1.4 - 0.4 * p : 1})`, opacity: p > 0 ? 1 : 0, padding: 26, fontFamily: F.hand, color: '#16131f', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, background: 'rgba(0,0,0,.06)' }} />
      {children}
    </div>
  );
};
/** Handwriting that reveals left-to-right. */
const Hand: React.FC<{ text: string; at: number; dur: number; size: number; color?: string; style?: React.CSSProperties }> = ({ text, at, dur, size, color = '#fff', style }) => {
  const t = useT(), p = prog(t, at, at + dur, x => x);
  return <div style={{ fontFamily: F.hand, fontSize: size, color, lineHeight: 1.15, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, ...style }}>{text}</div>;
};

export const S08Pizarra: React.FC = () => {
  const t = useT(), count = useCount(t);
  const pan = t < T.cut1 ? 0 : t < T.inventa ? -40 : t < T.cut2 ? -620 : t < T.quiebraLine ? -700 : t < T.HIT ? -1240 : -1660; // the board slides like a camera
  const panP = prog(t, Math.floor(t / 1.5) * 1.5, Math.floor(t / 1.5) * 1.5 + 0.5);
  const sh = shake(t, T.HIT, 30);
  const fall = Math.max(0, t - T.HIT - 0.15);
  const dark = prog(t, T.outro, T.outro + 0.8);
  const pie = (count / 100) * Math.PI * 2;
  return (
    <AbsoluteFill style={{ background: '#121418' }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y + pan * (0.85 + 0.15 * panP)}px)` }}>
        <AbsoluteFill style={{ height: 3600, backgroundImage: 'radial-gradient(#ffffff22 2px, transparent 2px)', backgroundSize: '44px 44px' }} />
        <svg width="1080" height="3600" style={{ position: 'absolute', inset: 0 }}>
          {/* A: 1975 → pie chart 90% */}
          <Stroke d="M330 520 C 430 520, 520 600, 560 700" at={0.7} color={C.lime} w={9} />
          <Stroke d="M540 670 L562 704 L590 676" at={1.0} dur={0.2} color={C.lime} w={9} />
          <circle cx="760" cy="900" r="190" fill="none" stroke="#ffffff30" strokeWidth="6" />
          {count > 0 && <path d={`M760 900 L760 710 A190 190 0 ${pie > Math.PI ? 1 : 0} 1 ${760 + 190 * Math.sin(pie)} ${900 - 190 * Math.cos(pie)} Z`} fill={C.magenta} opacity="0.85" />}
          <Stroke d="M540 1170 C 600 1090, 920 1080, 990 1150 C 1040 1210, 980 1290, 760 1290 C 560 1290, 500 1220, 540 1170" at={2.75} dur={0.4} color={C.lime} w={8} />
          {/* B: sketch of the first digital camera */}
          <Stroke d="M210 1700 h520 a30 30 0 0 1 30 30 v260 a30 30 0 0 1 -30 30 h-520 a30 30 0 0 1 -30 -30 v-260 a30 30 0 0 1 30 -30" at={T.camera} dur={0.6} w={11} />
          <Stroke d="M760 1790 h90 v150 h-90" at={T.camera + 0.4} dur={0.3} w={11} />
          <Stroke d="M935 1865 m-70 0 a70 70 0 1 0 140 0 a70 70 0 1 0 -140 0" at={T.camera + 0.6} dur={0.35} w={11} color={C.orange} />
          <Stroke d="M250 1790 h260 v140 h-260 z" at={T.camera + 0.5} dur={0.35} w={8} />
          <Stroke d="M330 1860 m-26 0 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0 M430 1860 m-26 0 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0" at={T.camera + 0.8} dur={0.3} w={7} />
          <Stroke d="M150 1640 l-40 -40 M960 1650 l40 -50 M120 2080 l-40 30 M980 2080 l40 40" at={T.camera + 1.0} dur={0.3} color={C.lime} w={9} />
          <Stroke d="M120 2150 C 200 2250, 700 2280, 900 2200" at={T.camera + 1.1} dur={0.4} color={C.magenta} w={8} />
        </svg>
        <Note x={70} y={330} w={300} h={260} color={C.lime} at={T.y1975} r={-5}><span style={{ fontSize: 96 }}>{LINES.a1}</span></Note>
        <Note x={90} y={760} w={380} h={330} color={C.magenta} at={T.intocable} r={4} fall={t > T.HIT ? fall : 0}><span style={{ fontSize: 62, color: '#fff' }}>{LINES.a2}</span></Note>
        <div style={{ position: 'absolute', left: 600, top: 1140, width: 320, textAlign: 'center', fontFamily: F.hand, fontSize: 110, color: '#fff', opacity: count > 0 ? 1 : 0 }}>{count}%</div>
        <Hand text={LINES.b} at={T.inventa + 0.1} dur={1.2} size={78} style={{ position: 'absolute', left: 80, right: 80, top: 1380 }} />
        <Hand text={LINES.c1} at={T.quiebraLine} dur={0.6} size={80} style={{ position: 'absolute', left: 80, right: 80, top: 2440 }} />
        <Note x={620} y={2600} w={340} h={300} color={C.orange} at={T.quiebraLine + 0.3} r={6} fall={t > T.HIT ? Math.max(0, fall - 0.2) : 0}><svg width="220" height="200" viewBox="0 0 220 200"><g stroke="#16131f" strokeWidth="8" fill="none" strokeLinecap="round"><rect x="30" y="40" width="70" height="120" rx="12" /><path d="M100 70 h90 v60 h-90" /><path d="M115 82 h10 M140 82 h10 M165 82 h10 M115 118 h10 M140 118 h10 M165 118 h10" /></g></svg></Note>
        {/* the hit: giant arrow down + crossing out */}
        <svg width="1080" height="3600" style={{ position: 'absolute', inset: 0 }}>
          <Stroke d="M140 2470 C 300 2620, 420 2760, 560 2930" at={T.HIT} dur={0.18} color={C.magenta} w={46} />
          <Stroke d="M450 2870 L565 2945 L600 2800" at={T.HIT + 0.15} dur={0.12} color={C.magenta} w={46} />
          <Stroke d="M90 2420 L1000 2960 M1000 2420 L90 2960" at={T.HIT + 0.25} dur={0.25} color="#fff" w={14} />
        </svg>
        <Hand text={LINES.c2} at={T.HIT + 0.05} dur={0.3} size={210} color={C.magenta} style={{ position: 'absolute', left: 0, right: 0, top: 3030, textAlign: 'center' }} />
        <svg width="1080" height="3600" style={{ position: 'absolute', inset: 0 }}><Stroke d="M250 3300 C 450 3285, 700 3290, 860 3300 M270 3335 C 470 3320, 700 3325, 840 3335" at={T.HIT + 0.35} dur={0.3} color="#fff" w={10} /></svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#000', opacity: dark * 0.9 }} />
      {t >= T.outro && <Note x={420 + Math.sin(t * 2) * 30} y={260 + (t - T.outro) * 340} w={220} h={200} color={C.lime} at={T.outro} r={(t - T.outro) * 60}><span style={{ fontSize: 46 }}>1975.</span></Note>}
      <Outro at={9.4} to={0.3} />
      <Grain opacity={0.12} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
