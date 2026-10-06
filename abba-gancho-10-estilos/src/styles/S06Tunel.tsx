// 06 · Viaje en el tiempo: flying down an endless corridor of years and neon frames; on "quiebra" the lights go out one by one.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, Band, C, DigitalCamera, F, Grain, LINES, Outro, T, Vignette, Words, prog, rand, shake, useCount, useT } from '../kit';

const RINGS = 16, GAP = 520;
const cols = [C.magenta, C.blue, C.lime, C.orange];

export const S06Tunel: React.FC = () => {
  const t = useT(), count = useCount(t);
  // travel distance: fast at the start, slows into 1975, glides during the invention, stops at the hit
  const z = 9000 * prog(t, 0, 1.4, x => 1 - Math.pow(1 - x, 3)) + 260 * Math.max(0, Math.min(t, T.HIT) - 1.4);
  const year = Math.round(1900 + 75 * prog(t, 0, 1.1, x => 1 - Math.pow(1 - x, 3)));
  const sh = shake(t, T.HIT, 22);
  const roll = t < T.cut1 ? 0 : t < T.inventa ? -8 : t < T.cut2 ? 0 : t < T.quiebraLine ? 6 : 0; // a new framing every cut
  return (
    <AbsoluteFill style={{ background: '#030208', overflow: 'hidden' }}>
      <AbsoluteFill style={{ perspective: 700, perspectiveOrigin: '50% 46%', transform: `translate(${sh.x}px,${sh.y}px) rotate(${roll}deg) scale(${1 + Math.abs(roll) * 0.01})` }}>
        <div style={{ position: 'absolute', left: 540, top: 880, transformStyle: 'preserve-3d' }}>
          {Array.from({ length: RINGS }, (_, i) => {
            const depth = ((i * GAP - z) % (RINGS * GAP) + RINGS * GAP) % (RINGS * GAP); // distance ahead of the camera
            const zz = -depth + 600;
            const order = Math.floor((i * GAP - z) / (RINGS * GAP)); // which lap, so each ring keeps a stable id
            const id = i + order * RINGS;
            // lights go off one by one from the far end towards us after the hit
            const offAt = T.HIT + 0.05 + (1 - depth / (RINGS * GAP)) * 0.9;
            const on = t < offAt ? 1 : Math.max(0, 1 - (t - offAt) * 8) * (Math.sin(t * 120 + i) > -0.3 ? 1 : 0.3);
            const col = cols[Math.abs(id) % 4];
            const fog = Math.max(0, 1 - depth / (RINGS * GAP * 0.9));
            const yr = 1900 + ((Math.abs(id) * 5) % 80);
            return (
              <div key={i} style={{ position: 'absolute', width: 900, height: 1500, left: -450, top: -750, transform: `translateZ(${zz}px)`, border: `10px solid ${col}`, borderRadius: 40, opacity: fog * (0.08 + 0.92 * on), boxShadow: on > 0.1 ? `0 0 40px ${col}, inset 0 0 40px ${col}` : 'none' }}>
                <div style={{ position: 'absolute', left: 30, top: 40, fontFamily: F.mono, fontWeight: 700, fontSize: 64, color: col, opacity: 0.8 * on }}>{yr}</div>
                <div style={{ position: 'absolute', right: 30, bottom: 40, fontFamily: F.mono, fontWeight: 700, fontSize: 64, color: col, opacity: 0.8 * on }}>{yr}</div>
              </div>
            );
          })}
        </div>
        {/* the glowing door at the end of the corridor with the invention */}
        {t >= T.inventa && (() => { const p = prog(t, T.camera, T.camera + 0.9); const lit = t < T.HIT ? 1 : Math.max(0, 1 - (t - T.HIT - 0.9) * 2); return (
          <div style={{ position: 'absolute', left: 540 - 260, top: 880 - 210, width: 520, height: 420, display: 'grid', placeItems: 'center', opacity: p * (0.15 + 0.85 * lit), transform: `scale(${0.5 + 0.6 * p + 0.04 * Math.sin(t * 5)})` }}>
            <div style={{ position: 'absolute', inset: -120, borderRadius: '50%', background: `radial-gradient(#fff 0%, ${C.lime}88 30%, transparent 70%)`, opacity: lit }} />
            <DigitalCamera size={460} mono={lit < 0.3} />
          </div>); })()}
      </AbsoluteFill>
      {/* HUD year counter */}
      {t < T.inventa && <Band top={720} style={{ fontFamily: F.display, fontSize: 260, color: '#fff', opacity: 1 - prog(t, 2.8, 3.0), textShadow: `0 0 50px ${C.magenta}` }}>{year === 1975 ? LINES.a1 : year}</Band>}
      {t < T.inventa && t >= T.intocable && (
        <div style={{ position: 'absolute', left: 150, right: 150, top: 1240, padding: '26px 30px', borderRadius: 36, background: 'rgba(10,8,30,.55)', border: '2px solid rgba(255,255,255,.25)', backdropFilter: 'blur(14px)', textAlign: 'center', opacity: prog(t, T.intocable, T.intocable + 0.3) * (1 - prog(t, 2.8, 3.0)) }}>
          <Words text={LINES.a2} at={T.intocable} style={{ fontFamily: F.display, fontSize: 62, color: '#fff' }} />
          <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 120, color: C.lime, lineHeight: 1.1 }}>{count}%</div>
        </div>
      )}
      <Band top={250}><Words text={LINES.b} at={T.inventa + 0.1} out={5.85} stagger={0.06} style={{ fontFamily: F.display, fontSize: 72, color: '#fff', lineHeight: 1.05, textShadow: '0 4px 30px #000' }} /></Band>
      <Band top={250}><Words text={LINES.c1} at={T.quiebraLine} out={8.4} style={{ fontFamily: F.display, fontSize: 76, color: '#fff' }} /></Band>
      <Band top={1330}><Words text={LINES.c2} at={T.HIT} out={8.45} from="scale" style={{ fontFamily: F.display, fontSize: 190, color: C.magenta, textShadow: `0 0 50px ${C.magenta}` }} /></Band>
      <Outro to={0.75} />
      {/* last far light flickering out */}
      {t >= T.outro && <div style={{ position: 'absolute', left: 530, top: 870, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: `0 0 40px 14px ${C.lime}`, opacity: Math.max(0, 1 - (t - T.outro) * 1.1) * (rand(Math.floor(t * 20), 3) > 0.35 ? 1 : 0.1) }} />}
      <Vignette strength={0.85} /><Grain />
      <AbbaTag />
    </AbsoluteFill>
  );
};
