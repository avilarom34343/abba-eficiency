// 10 · Metáfora minimal: lots of negative space; a small camera glows alone in the centre, and on "quiebra" a drawer shuts it into the dark.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, C, F, Grain, LINES, T, Words, ease, prog, shake, useCount, useT } from '../kit';

const LineCamera: React.FC<{ glow: number }> = ({ glow }) => (
  <svg viewBox="0 0 520 360" width="300" height="208" style={{ filter: `drop-shadow(0 0 ${18 * glow}px rgba(255,255,255,${0.6 * glow}))` }}>
    <g stroke="#fff" strokeWidth="5" fill="none" strokeLinejoin="round" opacity={0.35 + 0.65 * glow}>
      <rect x="40" y="70" width="380" height="230" rx="26" /><rect x="80" y="160" width="190" height="104" rx="12" />
      <circle cx="140" cy="212" r="20" /><circle cx="210" cy="212" r="20" /><rect x="420" y="120" width="70" height="110" rx="14" />
      <circle cx="490" cy="175" r="44" /><rect x="120" y="44" width="70" height="30" rx="8" />
    </g>
    <circle cx="318" cy="236" r="10" fill={C.magenta} opacity={glow} />
  </svg>
);

export const S10Minimal: React.FC = () => {
  const t = useT(), count = useCount(t);
  const drawer = prog(t, T.HIT - 0.15, T.HIT + 0.12, x => x * x * x);        // the drawer slams shut on the hit
  const glow = t < T.camera ? 0 : prog(t, T.camera, T.camera + 0.8) * (0.85 + 0.15 * Math.sin(t * 3));
  const slit = t < T.HIT ? 0 : Math.max(0, 1 - (t - T.HIT - 0.1) / 2.2);       // light leaking from the gap, fading out
  const sh = shake(t, T.HIT + 0.1, 10, 0.3);
  const lift = t < T.cut1 ? 0 : t < T.inventa ? -40 : 0;                         // gentle reframing between cuts
  const textStyle: React.CSSProperties = { fontFamily: F.body, fontWeight: 300, color: '#fff', letterSpacing: '0.02em' };
  return (
    <AbsoluteFill style={{ background: '#050505', transform: `translate(${sh.x}px,${sh.y}px)` }}>
      {/* A: tiny, precise typography + hairline counter */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760 + lift * prog(t, T.cut1, T.cut1 + 0.6, ease), textAlign: 'center' }}>
        <Words text={LINES.a1} at={T.y1975} out={2.85} style={{ ...textStyle, fontSize: 64, fontWeight: 600 }} />
        <Words text={LINES.a2} at={T.intocable} out={2.85} style={{ ...textStyle, fontSize: 50, marginTop: 18, opacity: 0.85 }} />
        <div style={{ width: 420, height: 2, margin: '60px auto 0', background: 'rgba(255,255,255,.12)', opacity: 1 - prog(t, 2.8, 3.0) }}>
          <div style={{ width: `${count / 0.9 * 0.9}%`, height: '100%', background: '#fff', boxShadow: '0 0 12px #fff' }} />
        </div>
        <div style={{ ...textStyle, fontFamily: F.mono, fontWeight: 500, fontSize: 40, marginTop: 22, opacity: count > 0 ? 1 - prog(t, 2.8, 3.0) : 0 }}>{count}%</div>
      </div>
      {/* B: the camera, alone */}
      {t >= T.inventa && <>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560 }}><Words text={LINES.b} at={T.inventa + 0.1} out={5.85} stagger={0.08} style={{ ...textStyle, fontSize: 54, lineHeight: 1.3, padding: '0 120px' }} /></div>
        <div style={{ position: 'absolute', left: 390, top: 900, opacity: prog(t, T.camera, T.camera + 0.6), transform: `scale(${0.96 + 0.04 * prog(t, T.camera, T.HIT)})` }}>
          <div style={{ position: 'absolute', inset: -120, background: `radial-gradient(rgba(255,255,255,${0.12 * glow}), transparent 65%)` }} />
          <LineCamera glow={glow} />
        </div>
        {/* the drawer: a dark front panel that rises and closes over the camera */}
        <div style={{ position: 'absolute', left: 300, width: 480, top: 1360 - drawer * 470, height: 380, background: 'linear-gradient(#101010, #080808)', borderTop: '2px solid #262626', boxShadow: '0 -20px 60px rgba(0,0,0,.9)', opacity: prog(t, T.HIT - 0.5, T.HIT - 0.25) }}>
          <div style={{ width: 120, height: 8, borderRadius: 4, background: '#333', margin: '60px auto 0' }} />
        </div>
        {/* thin slit of light above the shut drawer */}
        {t >= T.HIT && <div style={{ position: 'absolute', left: 310, width: 460, top: 886, height: 3, background: '#fff', opacity: slit, boxShadow: `0 0 24px 6px rgba(255,255,255,${0.5 * slit})` }} />}
      </>}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 600 }}><Words text={LINES.c1} at={T.quiebraLine} out={8.4} style={{ ...textStyle, fontSize: 56 }} /></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1420 }}><Words text={LINES.c2} at={T.HIT} out={8.45} style={{ ...textStyle, fontSize: 96, fontWeight: 800, color: C.magenta, letterSpacing: '0.12em', textShadow: `0 0 30px ${C.magenta}88` }} /></div>
      <Grain opacity={0.06} />
      <AbbaTag color="rgba(255,255,255,.7)" />
    </AbsoluteFill>
  );
};
