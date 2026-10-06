// P09 · Speed: everything is in motion — the frame is tilted, tape-like ticker bands cross the screen, words streak in
// with motion blur and an RGB split, speed lines rush past. On "quiebra" the world freezes and red caution tape slams across.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, DigitalCamera, Grain, ease, prog, rand, shake, useCount, useT } from '../kit';
import { P, PF, V, kickPulse } from './pkit';

const rgb = (k: number): React.CSSProperties => ({ textShadow: `${-6 * k}px 0 0 rgba(255,0,80,.9), ${6 * k}px 0 0 rgba(0,220,255,.9)` });
const cond = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: PF.bebas, fontSize: size, lineHeight: 0.85, color, whiteSpace: 'nowrap', letterSpacing: '0.01em', ...extra });

/** Text that streaks in from the right with a horizontal blur and settles. */
const Streak: React.FC<{ at: number; children: React.ReactNode; dir?: number; style?: React.CSSProperties }> = ({ at, children, dir = 1, style }) => {
  const t = useT(); if (t < at) return null;
  const p = prog(t, at, at + 0.22, ease), v = 1 - p;
  return <div style={{ transform: `translateX(${dir * v * 1400}px) skewX(${-dir * v * 30}deg) scaleX(${1 + v * 0.8})`, filter: `blur(${v * 16}px)`, ...style }}>{children}</div>;
};
/** A diagonal ticker band repeating a phrase. */
const Tape: React.FC<{ text: string; y: number; angle: number; speed: number; bg: string; fg: string; t: number; size?: number }> = ({ text, y, angle, speed, bg, fg, t, size = 90 }) => (
  <div style={{ position: 'absolute', left: -600, right: -600, top: y, transform: `rotate(${angle}deg)`, background: bg, padding: '14px 0', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,.4)' }}>
    <div style={{ ...cond(size, fg), transform: `translateX(${((t * speed) % 1000) - 1000}px)` }}>{`${text} / `.repeat(14)}</div>
  </div>
);

export const P09Speed: React.FC = () => {
  const t0 = useT(), frozen = t0 >= V.HIT + 0.05 && t0 < 8.5;
  const t = frozen ? V.HIT + 0.05 : t0;                         // the world freezes on "quiebra"
  const count = useCount(t), k = kickPulse(t0);
  const sh = shake(t0, V.HIT, 30, 0.5);
  const tilt = -8 + Math.sin(t * 0.8) * 2;
  return (
    <AbsoluteFill style={{ background: frozen ? '#111' : '#0A0A0A', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px) rotate(${tilt}deg) scale(${1.1 + k * 0.03})`, filter: frozen ? 'grayscale(1) contrast(1.2)' : undefined }}>
        {/* speed lines */}
        {Array.from({ length: 34 }, (_, i) => {
          const y = rand(i, 1) * 2200 - 140, len = 200 + rand(i, 2) * 600, x = 1400 - (((t * (1800 + rand(i, 3) * 2200)) + rand(i, 4) * 3000) % 3200);
          return <div key={i} style={{ position: 'absolute', left: x, top: y, width: len, height: 2 + rand(i, 5) * 5, background: i % 5 ? 'rgba(255,255,255,.35)' : P.volt, borderRadius: 4 }} />;
        })}
        {t < 1.5 && <>
          <Tape text="1975" y={260} angle={4} speed={900} bg={P.volt} fg="#000" t={t} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center' }}><Streak at={V.y1975}><span style={{ ...cond(560, '#fff'), ...rgb(1 + k * 2) }}>1975.</span></Streak></div>
          <Tape text="1975" y={1440} angle={-3} speed={-700} bg="#fff" fg="#000" t={t} />
        </>}
        {t >= 1.5 && t < 3.0 && <>
          <div style={{ position: 'absolute', left: -100, right: -100, top: 380, textAlign: 'center' }}><Streak at={1.5} dir={-1}><span style={{ ...cond(620, P.volt), ...rgb(0.6 + k * 2) }}>{count}%</span></Streak></div>
          <Tape text="KODAK ERA INTOCABLE" y={1150} angle={-6} speed={1400} bg={P.volt} fg="#000" t={t} size={110} />
          <Tape text="KODAK ERA INTOCABLE" y={1400} angle={5} speed={-1100} bg="#000" fg="#fff" t={t} size={80} />
        </>}
        {t >= 3.0 && t < V.quiebraLine && <>
          {[['ENTONCES', V.inventa], ['INVENTÓ', 3.55], ['ALGO QUE', 3.95], ['CAMBIARÍA', 4.45], ['EL MUNDO…', 4.95]].map(([w, a], i) => (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 260 + i * 210, textAlign: 'center' }}>
              <Streak at={a as number} dir={i % 2 ? -1 : 1}><span style={{ ...cond(240, i === 4 ? P.volt : '#fff'), ...rgb(0.6 + k * 2) }}>{w}</span></Streak>
            </div>
          ))}
          {t >= 4.5 && <div style={{ position: 'absolute', left: 1300 - prog(t, 4.5, 5.0, ease) * 1050, top: 1340, filter: `blur(${(1 - prog(t, 4.5, 4.9)) * 12}px)` }}><DigitalCamera size={620} body="#fff" accent={P.red} /></div>}
        </>}
        {t >= V.quiebraLine && !frozen && <div style={{ position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center' }}><span style={cond(120, '#fff')}>…Y ESO LA LLEVÓ A LA</span></div>}
      </AbsoluteFill>
      {/* frozen frame: three red caution tapes slam across, glitch slices */}
      {frozen && <>
        {[[-14, 560, 0], [10, 1020, 0.07], [-4, 1360, 0.14]].map(([a, y, d], i) => {
          const p = prog(t0, V.HIT + 0.05 + d, V.HIT + 0.2 + d, ease);
          return <div key={i} style={{ position: 'absolute', left: -600, right: -600, top: y, transform: `rotate(${a}deg) translateX(${(1 - p) * (i % 2 ? 2000 : -2000)}px)`, background: P.red, padding: '18px 0', boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
            <div style={{ ...cond(i === 1 ? 210 : 110, i === 1 ? '#fff' : '#000'), textAlign: 'center', transform: `translateX(${(t0 - V.HIT) * (i % 2 ? -60 : 60)}px)` }}>{i === 1 ? 'QUIEBRA.' : 'QUIEBRA / QUIEBRA / QUIEBRA / QUIEBRA / QUIEBRA / QUIEBRA'}</div>
          </div>;
        })}
        {Math.floor(t0 * 30) % 7 === 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: 300 + rand(Math.floor(t0 * 30)) * 1200, height: 40, background: 'rgba(255,255,255,.18)', transform: 'translateX(30px)' }} />}
      </>}
      {t0 >= 8.5 && <div style={{ position: 'absolute', top: 960, left: -200 + 1500 * prog(t0, 8.6, 9.6), width: 260, height: 4, background: P.volt, boxShadow: `0 0 20px ${P.volt}`, opacity: 1 - prog(t0, 9.5, 9.9) }} />}
      <AbsoluteFill style={{ background: '#fff', opacity: t0 >= V.HIT ? Math.max(0, 1 - (t0 - V.HIT) / 0.1) * 0.85 : 0 }} />
      <Grain opacity={0.08} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
