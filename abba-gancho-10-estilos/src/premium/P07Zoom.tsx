// P07 · Infinite zoom: one continuous dive. Every scene has a portal at the centre (a ring, the progress dial, the
// camera lens, a red dot) and on each downbeat the camera dives through it into the next scene, ending on "quiebra".
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, DigitalCamera, Grain, inOut, prog, shake, useCount, useT } from '../kit';
import { P, PF, V } from './pkit';

const R0 = 60, FULL = 1110, S = FULL / R0;          // portal radius in a scene, radius that covers the screen
const DIVES = [1.25, 2.75, 4.25, 5.67, 6.52];         // each dive ends on a cut: 1.5, 3.0, 4.5, 5.92, 6.7
const DIVE_LEN = [0.25, 0.25, 0.25, 0.25, 0.18];
const type = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: PF.round, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.04em', lineHeight: 1, ...extra });
const Ring: React.FC<{ color: string; w?: number }> = ({ color, w = 10 }) => <div style={{ position: 'absolute', left: 540 - R0 - w, top: 960 - R0 - w, width: (R0 + w) * 2, height: (R0 + w) * 2, borderRadius: '50%', border: `${w}px solid ${color}`, boxSizing: 'border-box' }} />;

const Scene: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const count = useCount(t);
  switch (i) {
    case 0: return <AbsoluteFill style={{ background: P.hot }}>
      <div style={type(300, P.yellow, { top: 470 })}>19</div><div style={type(300, P.yellow, { top: 1150 })}>75.</div><Ring color={P.yellow} /></AbsoluteFill>;
    case 1: return <AbsoluteFill style={{ background: P.violet }}>
      <svg width="1080" height="1920" style={{ position: 'absolute' }}><circle cx="540" cy="960" r="200" stroke="rgba(255,255,255,.2)" strokeWidth="40" fill="none" />
        <circle cx="540" cy="960" r="200" stroke={P.mint} strokeWidth="40" fill="none" strokeLinecap="round" strokeDasharray={`${count / 100 * 1257} 1257`} transform="rotate(-90 540 960)" /></svg>
      <div style={type(250, P.mint, { top: 420 })}>{count}%</div>
      <div style={type(84, '#fff', { top: 1260, opacity: t > V.kodak ? 1 : 0 })}>Kodak era<br />intocable.</div><Ring color="#fff" w={6} /></AbsoluteFill>;
    case 2: return <AbsoluteFill style={{ background: P.yellow }}>
      <div style={type(130, P.black, { top: 420 })}>Entonces</div><div style={type(130, P.black, { top: 1220, opacity: t > 3.55 ? 1 : 0 })}>inventó</div>
      <div style={type(130, P.hot, { top: 1380, opacity: t > 3.95 ? 1 : 0 })}>algo</div><Ring color={P.black} /></AbsoluteFill>;
    case 3: { const k = (R0 / 44) * 520 / 520; // DigitalCamera lens (cx 490, cy 175, r 44 in its 520-wide viewBox) sits exactly on the portal
      return <AbsoluteFill style={{ background: P.cyan }}>
        <div style={type(96, P.black, { top: 380 })}>que cambiaría<br />el mundo…</div>
        <div style={{ position: 'absolute', left: 540 - 490 * k, top: 960 - 175 * k }}><DigitalCamera size={520 * k} body="#fff" accent={P.hot} /></div></AbsoluteFill>; }
    case 4: return <AbsoluteFill style={{ background: '#000' }}>
      <div style={type(66, '#fff', { top: 760 })}>…y eso la llevó a la</div><div style={{ position: 'absolute', left: 540 - R0, top: 960 - R0, width: R0 * 2, height: R0 * 2, borderRadius: '50%', background: P.red, boxShadow: `0 0 60px ${P.red}` }} /></AbsoluteFill>;
    default: return <AbsoluteFill style={{ background: P.red }}><div style={type(200, '#000', { top: 850 })}>quiebra.</div></AbsoluteFill>;
  }
};

export const P07Zoom: React.FC = () => {
  const t = useT();
  // continuous dive depth u: integer = sitting in scene u; each dive is eased, with a slow creep in between
  let u = DIVES.reduce((acc, d, i) => acc + prog(t, d, d + DIVE_LEN[i], inOut), 0);
  u += t < V.HIT ? ((t % 1.5) / 1.5) * 0.06 : 0;
  const sh = shake(t, V.HIT, 44, 0.6);
  const punch = t >= V.HIT ? 1 + 0.18 * Math.exp(-(t - V.HIT) * 7) : 1;
  const base = Math.floor(u), out = prog(t, 8.4, 8.9);
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px) scale(${punch})`, opacity: 1 - out }}>
        {[base, base + 1].filter(i => i <= 5).map(i => {
          const sc = Math.pow(S, u - i);
          return <AbsoluteFill key={i} style={{ transform: `scale(${sc})`, transformOrigin: '540px 960px', clipPath: i === 0 ? undefined : `circle(${FULL}px at 540px 960px)`, filter: `blur(${Math.min(8, Math.max(0, (sc - 2) * 0.15))}px)` }}><Scene i={i} t={t} /></AbsoluteFill>;
        })}
      </AbsoluteFill>
      {/* outro: the red dot we dove through, shrunk to a heartbeat */}
      {t >= 8.4 && <div style={{ position: 'absolute', left: 528, top: 948, width: 24, height: 24, borderRadius: '50%', background: P.red, opacity: out, transform: `scale(${1 + 0.4 * Math.max(0, Math.sin(t * 9))})`, boxShadow: `0 0 30px ${P.red}` }} />}
      <Grain opacity={0.06} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
