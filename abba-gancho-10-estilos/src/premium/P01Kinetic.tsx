// P01 · Kinetic: sports-ad typography. Giant condensed italic words slam in on the kick, outline echoes trail behind,
// the background flips black/volt on every cut; "QUIEBRA" lands as a red stack that collapses.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, DigitalCamera, Grain, prog, rand, shake, useCount, useT } from '../kit';
import { P, PF, V, kickPulse } from './pkit';

const big = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: PF.condensed, fontSize: size, lineHeight: 0.86, color, textTransform: 'uppercase', fontStyle: 'italic', transform: 'skewX(-9deg)', whiteSpace: 'nowrap', ...extra,
});
const outline = (c: string, w = 3): React.CSSProperties => ({ color: 'transparent', WebkitTextStroke: `${w}px ${c}` });

/** A word that slams in: overshoot scale + motion blur, then stays. */
const Slam: React.FC<{ at: number; children: React.ReactNode; from?: number; style?: React.CSSProperties }> = ({ at, children, from = 1.9, style }) => {
  const t = useT(); if (t < at) return null;
  const p = prog(t, at, at + 0.16, x => x), s = from + (1 - from) * p + Math.sin(Math.min(1, (t - at) / 0.35) * Math.PI) * 0.04;
  return <div style={{ transform: `scale(${s})`, filter: `blur(${(1 - p) * 10}px)`, opacity: Math.min(1, p * 3), ...style }}>{children}</div>;
};

export const P01Kinetic: React.FC = () => {
  const t = useT(), count = useCount(t), k = kickPulse(t);
  const scene = t < 1.5 ? 0 : t < 3 ? 1 : t < 4.5 ? 2 : t < V.quiebraLine ? 3 : t < V.HIT ? 4 : t < 8.5 ? 5 : 6;
  const bg = [P.black, P.volt, P.black, P.volt, P.black, P.red, P.black][scene];
  const ink = bg === P.volt ? P.black : P.white;
  const sh = shake(t, V.HIT, 40, 0.7);
  const zoom = 1 + k * 0.035;
  return (
    <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px) scale(${zoom})` }}>
        {scene === 0 && <>
          {/* outline echoes drifting behind the year */}
          {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 260 + i * 260 - t * 60 * (i % 2 ? 1 : -1), textAlign: 'center', opacity: 0.25 }}>
            <span style={big(330, '', outline(P.volt, 2))}>1975 1975</span></div>)}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 520, display: 'grid', justifyItems: 'center' }}>
            <Slam at={V.y1975}><span style={big(560, P.white)}>19</span></Slam>
            <Slam at={V.y1975 + 0.56}><span style={big(560, P.volt)}>75.</span></Slam>
          </div>
        </>}
        {scene === 1 && <>
          <div style={{ position: 'absolute', left: -40, right: -40, top: 230, textAlign: 'center', opacity: 0.9 }}>
            <span style={big(760, '', outline(P.black, 4))}>{count}%</span>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, display: 'grid', justifyItems: 'center', rowGap: 10 }}>
            <Slam at={V.kodak}><span style={big(300, P.black)}>KODAK</span></Slam>
            <Slam at={V.intocable} from={1.5}><span style={big(150, P.white, { background: P.black, padding: '6px 26px' })}>ERA INTOCABLE.</span></Slam>
          </div>
        </>}
        {scene === 2 && <>
          {/* marquee rows: each word of the line runs across the screen, alternating directions */}
          {['ENTONCES', 'INVENTÓ', 'ALGO', 'QUE', 'CAMBIARÍA', 'EL MUNDO…'].map((w, i) => {
            const on = t >= V.inventa + i * 0.3, dir = i % 2 ? 1 : -1, x = dir * (t - 3) * 520 - (dir > 0 ? 900 : 0);
            return <div key={i} style={{ position: 'absolute', left: x - 300, top: 220 + i * 250, whiteSpace: 'nowrap' }}>
              <span style={big(250, on ? P.volt : '', on ? {} : outline('#ffffff55', 2))}>{`${w} `.repeat(4)}</span>
            </div>;
          })}
        </>}
        {scene === 3 && <>
          {/* the invention: camera at the centre of a rotating sunburst */}
          <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i / 24) * Math.PI * 2 + t * 0.6;
              return <path key={i} d={`M540 960 L${540 + Math.cos(a) * 1800} ${960 + Math.sin(a) * 1800} L${540 + Math.cos(a + 0.12) * 1800} ${960 + Math.sin(a + 0.12) * 1800}Z`} fill={P.black} opacity={0.08} />;
            })}
          </svg>
          <Slam at={4.5} from={0.3} style={{ position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center' }}>
            <DigitalCamera size={760} body="#fff" accent={P.red} led={0.6 + 0.4 * Math.sin(t * 20)} />
          </Slam>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center' }}><Slam at={4.5}><span style={big(190, P.black)}>EL MUNDO…</span></Slam></div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center' }}><Slam at={4.75}><span style={big(96, P.volt, { background: P.black, padding: '4px 22px' })}>CÁMARA DIGITAL</span></Slam></div>
        </>}
        {scene === 4 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: prog(t, V.quiebraLine, V.quiebraLine + 0.2) }}>
            <span style={big(96, P.white, { letterSpacing: '0.04em' })}>…Y ESO LA LLEVÓ A LA</span>
          </div>
        )}
        {scene === 5 && <>
          {/* stacked QUIEBRA: the middle one solid, the others outlines that peel away and fall */}
          {Array.from({ length: 9 }, (_, i) => {
            const d = i - 4, fall = Math.max(0, t - V.HIT - 0.5 - Math.abs(d) * 0.06);
            const enter = prog(t, V.HIT + Math.abs(d) * 0.03, V.HIT + 0.12 + Math.abs(d) * 0.03, x => x);
            return <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 760 + d * 190 + fall * fall * 900 * (d === 0 ? 0 : 1), textAlign: 'center', transform: `translateX(${(1 - enter) * 1200 * (d % 2 ? 1 : -1)}px) rotate(${fall * 30 * (rand(i) - 0.5) * (d ? 1 : 0)}deg)` }}>
              <span style={big(230, d === 0 ? P.white : '', d === 0 ? { textShadow: `8px 8px 0 ${P.black}` } : outline(P.black, 3))}>QUIEBRA.</span>
            </div>;
          })}
        </>}
        {scene === 6 && (
          /* outro: one volt speed line that crosses the dark, leaves a short underline */
          <div style={{ position: 'absolute', top: 980, left: 140 + 800 * prog(t, 8.55, 9.1) * 0, width: 800 * prog(t, 8.55, 9.0), height: 10, background: P.volt, transform: 'skewX(-30deg)', opacity: 1 - prog(t, 9.4, 10) * 0.6, boxShadow: `0 0 30px ${P.volt}` }} />
        )}
      </AbsoluteFill>
      {/* flash on the hit + on each cut */}
      {[1.5, 3, 4.5, V.HIT].map(c => <AbsoluteFill key={c} style={{ background: c === V.HIT ? '#fff' : bg === P.volt ? '#fff' : P.volt, opacity: t >= c ? Math.max(0, 1 - (t - c) / 0.12) * 0.8 : 0 }} />)}
      <Grain opacity={0.07} />
      <AbbaTag color={scene === 6 ? P.white : 'transparent'} />
    </AbsoluteFill>
  );
};
