// P06 · Shape reveals: every kick wipes in a new colour world through a growing shape (circle, star, rounded square,
// diamond), the type swaps colour with it and bounces; the voice drives one huge word at a time. "Quiebra" is a red burst.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, DigitalCamera, Grain, prog, shake, useCount, useT } from '../kit';
import { KICKS, P, PF, V } from './pkit';

const PAL: [string, string][] = [[P.hot, P.yellow], [P.violet, P.mint], [P.yellow, P.violet], [P.cyan, P.hot], [P.orange, '#fff'], [P.mint, P.violet], ['#fff', P.hot], [P.volt, P.black]];
const SHAPES = ['circle', 'star', 'square', 'diamond'] as const;
const star = (p: number, n = 5) => `polygon(${Array.from({ length: n * 2 }, (_, i) => { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2 + p * 0.8, r = (i % 2 ? 0.45 : 1) * p * 2600; return `${540 + Math.cos(a) * r}px ${960 + Math.sin(a) * r}px`; }).join(',')})`;
const clip = (shape: typeof SHAPES[number], p: number) =>
  shape === 'circle' ? `circle(${p * 1110}px at 540px 960px)` : shape === 'star' ? star(p)
    : shape === 'square' ? `inset(${(1 - p) * 960}px ${(1 - p) * 540}px round ${120 * (1 - p) + 20}px)`
      : `polygon(540px ${960 - p * 1700}px, ${540 + p * 1700}px 960px, 540px ${960 + p * 1700}px, ${540 - p * 1700}px 960px)`;
const WORDS: [number, string][] = [[V.inventa, 'Entonces'], [3.55, 'inventó'], [3.95, 'algo'], [4.22, 'que'], [4.45, 'cambiaría'], [4.95, 'el mundo…']];

const Content: React.FC<{ t: number; fg: string; since: number }> = ({ t, fg, since }) => {
  const count = useCount(t), pop = 0.8 + 0.2 * (1 - Math.exp(-since * 14) * Math.cos(since * 22));   // springy pop on reveal
  const type = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: PF.round, fontWeight: 800, fontSize: size, color: fg, letterSpacing: '-0.04em', lineHeight: 0.95, textAlign: 'center', ...extra });
  const box = (c: React.ReactNode) => <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${pop})` }}>{c}</AbsoluteFill>;
  if (t < 1.5) return box(<div style={type(260)}>1975.</div>);
  if (t < 3.0) return box(<div style={{ display: 'grid', justifyItems: 'center', gap: 50 }}><div style={type(380)}>{count}%</div><div style={type(76, { opacity: t > V.kodak ? 1 : 0 })}>Kodak era<br />intocable.</div></div>);
  if (t < 4.5) { const w = [...WORDS].reverse().find(([a]) => t >= a); return box(<div style={type(w && w[1].length > 7 ? 150 : 210)}>{w?.[1] ?? ''}</div>); }
  return box(<div style={{ display: 'grid', justifyItems: 'center', gap: 60 }}>
    <div style={{ transform: `rotate(${Math.sin(t * 6) * 6}deg)` }}><DigitalCamera size={620} body="#fff" accent={P.red} /></div>
    <div style={type(t < 4.95 ? 130 : 150)}>{t < 4.95 ? 'cambiaría' : 'el mundo…'}</div>
  </div>);
};

export const P06Shapes: React.FC = () => {
  const t = useT(), sh = shake(t, V.HIT, 36, 0.6);
  const kicks = KICKS.filter(k => k < V.quiebraLine);
  const n = kicks.filter(k => k <= t).length;                                  // layers revealed so far
  const layer = (i: number) => {
    const at = kicks[i], p = prog(t, at, at + 0.28), [bg, fg] = PAL[i % PAL.length];
    return <AbsoluteFill key={i} style={{ background: bg, clipPath: p < 1 ? clip(SHAPES[i % 4], p) : undefined }}><Content t={t} fg={fg} since={t - at} /></AbsoluteFill>;
  };
  const q = prog(t, V.HIT, V.HIT + 0.3), shrink = prog(t, 8.1, 8.6);
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px)` }}>
        {t < V.quiebraLine && <>{n >= 2 && layer(n - 2)}{n >= 1 && layer(n - 1)}</>}
        {t >= V.quiebraLine && t < V.HIT && (
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <div style={{ fontFamily: PF.round, fontWeight: 800, fontSize: 64, color: '#fff', opacity: prog(t, V.quiebraLine, V.quiebraLine + 0.2) }}>…y eso la llevó a la</div>
          </AbsoluteFill>
        )}
        {t >= V.HIT && t < 8.6 && <>
          {/* concentric burst rings, then the red world shrinks back to a dot */}
          <AbsoluteFill style={{ background: P.red, clipPath: `circle(${prog(t, V.HIT, V.HIT + 0.25) * 1110 * (1 - shrink)}px at 540px 960px)` }} />
          <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>{[0, 1, 2].map(i => { const p = prog(t, V.HIT + 0.1 + i * 0.08, V.HIT + 0.9 + i * 0.08); return <circle key={i} cx="540" cy="960" r={200 + p * 900} fill="none" stroke={i % 2 ? '#000' : '#fff'} strokeWidth={30 * (1 - p)} />; })}</svg>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', clipPath: `circle(${1110 * (1 - shrink)}px at 540px 960px)` }}>
            <div style={{ fontFamily: PF.round, fontWeight: 800, fontSize: 190, color: '#000', letterSpacing: '-0.05em', transform: `scale(${0.6 + 0.4 * q + 0.08 * Math.exp(-(t - V.HIT) * 6)}) rotate(${(1 - q) * -10}deg)` }}>quiebra.</div>
          </AbsoluteFill>
        </>}
        {/* outro: a tiny spinning star in the dark */}
        {t >= 8.55 && <AbsoluteFill style={{ background: P.volt, clipPath: star(0.03 + 0.005 * Math.sin(t * 6)), transform: `rotate(${t * 90}deg)`, opacity: prog(t, 8.6, 9.0) }} />}
      </AbsoluteFill>
      <Grain opacity={0.05} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
