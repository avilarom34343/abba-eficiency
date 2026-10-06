// 03 · Dato como arte: market share climbs like an empire; on "quiebra" it collapses and becomes a film roll unrolling into the dark.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, Band, C, DigitalCamera, F, Flash, Grain, LINES, Outro, T, Vignette, Words, inOut, prog, rand, shake, useCount, useT } from '../kit';

const X0 = 110, X1 = 970, Y0 = 1460, Y1 = 760;               // chart area
const share = (u: number) => 0.18 + 0.72 * (1 - Math.pow(1 - u, 2.2)) + 0.02 * Math.sin(u * 14); // climbs to ~90%
const px = (u: number) => X0 + (X1 - X0) * u, py = (v: number) => Y0 - (Y0 - Y1) * (v / 0.92);

export const S03Dato: React.FC = () => {
  const t = useT();
  const grow = prog(t, 0.2, T.countEnd, inOut);                // line drawing progress
  const count = useCount(t);
  const pts = Array.from({ length: 61 }, (_, i) => i / 60).filter(u => u <= grow);
  const line = pts.map((u, i) => `${i ? 'L' : 'M'}${px(u).toFixed(1)},${py(share(u)).toFixed(1)}`).join(' ');
  const head = { x: px(grow), y: py(share(grow)) };
  const crash = prog(t, T.HIT, T.HIT + 0.35, x => x * x);       // vertical collapse
  const unroll = prog(t, T.HIT + 0.3, 9.6, x => x);             // film strip unrolling
  const zoom = t < T.cut1 ? 1 + 0.04 * t : t < T.inventa ? 1.16 : t < T.cut2 ? 1.05 : t < T.quiebraLine ? 1.12 : t < T.HIT ? 1.0 : 1.0 + 0.1 * crash;
  const sh = shake(t, T.HIT, 28);
  const endX = px(1), endY = py(share(1));
  const stripTop = endY, stripLen = crash * 380 + unroll * 1400;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, #0b0a24, ${C.bg} 60%)` }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px) scale(${zoom})`, transformOrigin: '60% 55%' }}>
        {/* grid */}
        <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={X0} x2={X1} y1={Y0 - i * 100} y2={Y0 - i * 100} stroke="#ffffff12" strokeWidth="2" />)}
          {/* empire skyline: bars rising behind the line */}
          {Array.from({ length: 14 }, (_, i) => {
            const u = (i + 0.5) / 14, h = (Y0 - py(share(u))) * prog(t, 0.3 + i * 0.12, 0.9 + i * 0.12) * (1 - crash * (0.4 + rand(i, 4) * 0.6));
            return <rect key={i} x={px(u) - 24} y={Y0 - h} width="48" height={h} rx="6" fill={`url(#bar)`} opacity={0.55 * (1 - unroll * 0.8)} />;
          })}
          <defs>
            <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.lime} /><stop offset="1" stopColor={C.blue} stopOpacity="0.1" /></linearGradient>
            <linearGradient id="ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.blue} /><stop offset=".6" stopColor={C.magenta} /><stop offset="1" stopColor={C.lime} /></linearGradient>
          </defs>
          {grow > 0 && <path d={`${line} L${head.x},${Y0} L${X0},${Y0}Z`} fill="url(#ln)" opacity={0.18 * (1 - crash)} />}
          {grow > 0 && <path d={line} stroke="url(#ln)" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={1 - unroll} style={{ filter: `drop-shadow(0 0 18px ${C.magenta})` }} />}
          {/* the crash: a straight drop from the peak */}
          {crash > 0 && <line x1={endX} y1={endY} x2={endX} y2={endY + crash * 380} stroke={C.magenta} strokeWidth="14" strokeLinecap="round" />}
        </svg>
        {/* line head: glowing dot + counter */}
        {grow > 0 && t < T.HIT && <div style={{ position: 'absolute', left: head.x - 22, top: head.y - 22, width: 44, height: 44, borderRadius: '50%', background: '#fff', boxShadow: `0 0 40px 10px ${C.magenta}` }} />}
        {grow > 0.05 && t < T.inventa && <div style={{ position: 'absolute', left: Math.min(head.x - 160, 640), top: head.y - 210, padding: '14px 26px', borderRadius: 26, background: 'rgba(255,255,255,.12)', border: '2px solid rgba(255,255,255,.3)', backdropFilter: 'blur(14px)', fontFamily: F.mono, fontWeight: 700, fontSize: 110, color: '#fff' }}>{count}%</div>}
        {/* invention pin at the 1975 peak */}
        {t >= T.camera && t < T.HIT + 0.3 && (() => { const p = prog(t, T.camera, T.camera + 0.5); return (
          <div style={{ position: 'absolute', left: endX - 470, top: endY - 230, opacity: p * (1 - crash), transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})` }}>
            <div style={{ padding: 30, borderRadius: 40, background: 'rgba(255,255,255,.1)', border: '2px solid rgba(255,255,255,.28)', backdropFilter: 'blur(16px)', boxShadow: `0 0 80px ${C.lime}55` }}><DigitalCamera size={380} /></div>
            <div style={{ position: 'absolute', left: 340, top: 360, width: 6, height: 110, background: '#fff' }} />
          </div>); })()}
        {/* film strip unrolling from the crash point */}
        {crash > 0 && (
          <div style={{ position: 'absolute', left: endX - 70, top: stripTop, width: 140, height: stripLen, overflow: 'hidden', transform: `rotate(${Math.sin(t * 2.4) * 4 * unroll}deg)`, transformOrigin: 'top center' }}>
            <div style={{ position: 'absolute', inset: 0, background: '#16131f', borderLeft: `3px solid ${C.magenta}`, borderRight: `3px solid ${C.magenta}` }} />
            {Array.from({ length: 40 }, (_, i) => <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: 10, top: i * 46 + 8, width: 18, height: 24, borderRadius: 4, background: '#e9e6f2' }} />
              <div style={{ position: 'absolute', right: 10, top: i * 46 + 8, width: 18, height: 24, borderRadius: 4, background: '#e9e6f2' }} />
              {i % 3 === 0 && <div style={{ position: 'absolute', left: 38, top: i * 46 + 6, width: 64, height: 120, borderRadius: 6, background: [C.blue, C.magenta, C.orange][(i / 3) % 3], opacity: 0.5 }} />}
            </React.Fragment>)}
          </div>
        )}
        {crash > 0 && <div style={{ position: 'absolute', left: endX - 95, top: stripTop + stripLen - 95, width: 190, height: 190, borderRadius: '50%', background: `repeating-radial-gradient(#16131f 0 8px, #2a2540 8px 12px)`, border: `4px solid ${C.magenta}`, transform: `rotate(${unroll * 1400}deg)` }} />}
      </AbsoluteFill>
      <Band top={210}><Words text={LINES.a1} at={T.y1975} out={2.85} from="scale" style={{ fontFamily: F.display, fontSize: 180, color: '#fff' }} /></Band>
      <Band top={420}><Words text={LINES.a2} at={T.intocable} out={2.85} style={{ fontFamily: F.body, fontWeight: 800, fontSize: 72, color: C.lime }} /></Band>
      <Band top={250}><Words text={LINES.b} at={T.inventa + 0.1} out={5.85} stagger={0.06} style={{ fontFamily: F.display, fontSize: 72, color: '#fff', lineHeight: 1.05 }} /></Band>
      <Band top={250}><Words text={LINES.c1} at={T.quiebraLine} out={8.4} style={{ fontFamily: F.display, fontSize: 76, color: '#fff' }} /></Band>
      <Band top={420}><Words text={LINES.c2} at={T.HIT} out={8.45} from="scale" style={{ fontFamily: F.display, fontSize: 200, color: C.magenta, textShadow: `0 0 50px ${C.magenta}` }} /></Band>
      <Flash at={T.HIT} len={0.2} />
      <Outro to={0.72} />
      <Vignette /><Grain />
      <AbbaTag />
    </AbsoluteFill>
  );
};
