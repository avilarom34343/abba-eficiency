// P03 · Liquid glass: saturated colour blobs drift behind frosted-glass cards that spring in on the beat;
// on "quiebra" the glass shatters into shards and the colour behind it bleeds out to red.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, DigitalCamera, Grain, ease, prog, rand, shake, useCount, useSpring, useT } from '../kit';
import { P, PF, V, kickPulse } from './pkit';

const BLOBS = [P.hot, P.violet, P.cyan, P.yellow, P.orange, P.mint];
const glass: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,.34), rgba(255,255,255,.08))', backdropFilter: 'blur(34px) saturate(1.6)',
  border: '2px solid rgba(255,255,255,.55)', boxShadow: '0 30px 80px rgba(0,0,0,.25), inset 0 2px 0 rgba(255,255,255,.7)', borderRadius: 64,
};
const txt = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: PF.round, fontWeight: 800, fontSize: size, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.02, textShadow: '0 4px 30px rgba(0,0,0,.18)', ...extra });

/** A glass card that springs in at `at` and leaves at `out`. */
const Card: React.FC<{ at: number; out: number; top: number; children: React.ReactNode; pad?: string; round?: number }> = ({ at, out, top, children, pad = '50px 60px', round }) => {
  const t = useT(), s = useSpring(at, { damping: 11, stiffness: 160 }), o = prog(t, out - 0.2, out);
  if (t < at || t > out + 0.05) return null;
  return <div style={{ position: 'absolute', left: 90, right: 90, top, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - s) * 260}px) scale(${0.7 + 0.3 * s - o * 0.15})`, opacity: Math.min(1, s * 2) * (1 - o) }}>
    <div style={{ ...glass, padding: pad, textAlign: 'center', ...(round ? { borderRadius: round } : {}) }}>{children}</div>
  </div>;
};

export const P03Glass: React.FC = () => {
  const t = useT(), count = useCount(t), k = kickPulse(t);
  const red = prog(t, V.HIT, V.HIT + 0.4);
  const sh = shake(t, V.HIT, 30, 0.5);
  const dark = prog(t, 8.4, 9.0);
  return (
    <AbsoluteFill style={{ background: '#140A2E', overflow: 'hidden' }}>
      {/* drifting colour blobs; turn red then fade after the hit */}
      <AbsoluteFill style={{ filter: 'blur(90px)', opacity: 1 - dark * 0.9 }}>
        {BLOBS.map((c, i) => {
          const x = 540 + Math.sin(t * (0.5 + i * 0.13) + i * 2) * 380, y = 960 + Math.cos(t * (0.4 + i * 0.11) + i) * 700, r = 520 + 80 * Math.sin(t + i) + k * 60;
          return <div key={i} style={{ position: 'absolute', left: x - r / 2, top: y - r / 2, width: r, height: r, borderRadius: '50%', background: red > 0 ? (i % 2 ? P.red : '#3a0a0a') : c, opacity: 0.95 }} />;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#000', opacity: dark * 0.88 }} />
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px)` }}>
        <Card at={V.y1975} out={1.45} top={720}><div style={txt(250)}>1975.</div></Card>
        <Card at={1.5} out={2.95} top={520} pad="60px 50px">
          {/* glass progress ring with the counter */}
          <svg width="520" height="520" viewBox="0 0 520 520">
            <circle cx="260" cy="260" r="220" stroke="rgba(255,255,255,.25)" strokeWidth="34" fill="none" />
            <circle cx="260" cy="260" r="220" stroke="#fff" strokeWidth="34" fill="none" strokeLinecap="round" strokeDasharray={`${(count / 100) * 1382} 1382`} transform="rotate(-90 260 260)" style={{ filter: 'drop-shadow(0 0 16px #fff)' }} />
            <text x="260" y="300" textAnchor="middle" style={txt(140)} fill="#fff">{count}%</text>
          </svg>
          <div style={{ ...txt(76), marginTop: 30 }}>Kodak era<br />intocable.</div>
        </Card>
        <Card at={V.inventa} out={4.45} top={640}><div style={txt(96)}>Entonces<br />inventó algo</div></Card>
        <Card at={4.5} out={V.quiebraLine - 0.05} top={440} pad="60px 50px">
          <div style={{ ...txt(72), marginBottom: 40 }}>que cambiaría<br />el mundo…</div>
          <div style={{ transform: `rotate(${Math.sin(t * 3) * 4}deg) scale(${1 + k * 0.05})` }}><DigitalCamera size={560} body="#fff" accent={P.hot} /></div>
        </Card>
        <Card at={V.quiebraLine} out={V.HIT - 0.02} top={820} pad="40px 50px"><div style={txt(64)}>…y eso la llevó a la</div></Card>
        {/* the shattered card: 14 shards from a grid of jittered points, each flying off with its own spin */}
        {t >= V.HIT && t < 8.6 && Array.from({ length: 14 }, (_, i) => {
          const c = i % 2, r = Math.floor(i / 2), cx = [0, 50, 100], cy = [0, 14, 28, 42, 56, 70, 86, 100];
          const j = (a: number, b: number) => 50 + (rand(a * 7 + b, 9) - 0.5) * 30;
          const pts = [[cx[c], cy[r]], [c ? 100 : j(r, 1), cy[r]], [c ? 100 : j(r + 1, 1), cy[r + 1]], [cx[c], cy[r + 1]]];
          if (c) { pts[0][0] = j(r, 1); pts[3][0] = j(r + 1, 1); }
          const d = Math.max(0, t - V.HIT - 0.45), dir = c ? 1 : -1;
          return <div key={i} style={{ position: 'absolute', left: 90, right: 90, top: 640, height: 640, clipPath: `polygon(${pts.map(p => `${p[0]}% ${p[1]}%`).join(',')})`, transform: `translate(${dir * d * 500 * (0.5 + rand(i))}px, ${d * d * 1800}px) rotate(${dir * d * 70 * rand(i, 3)}deg)`, ...glass, borderRadius: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.5), rgba(255,255,255,.15))' }} />;
        })}
        {t >= V.HIT && <>
          {/* crack lines over the glass the moment it breaks */}
          <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 1 - prog(t, V.HIT + 0.4, V.HIT + 0.6) }}>
            {Array.from({ length: 9 }, (_, i) => { const a = i * 0.7 + 0.3; return <path key={i} d={`M540 960 L${540 + Math.cos(a) * 200} ${960 + Math.sin(a) * 240} L${540 + Math.cos(a + 0.2) * 520} ${960 + Math.sin(a + 0.2) * 560}`} stroke="#fff" strokeWidth="5" fill="none" />; })}
          </svg>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: 1 - prog(t, 8.3, 8.6) }}>
            <span style={{ ...txt(200), display: 'inline-block', transform: `scale(${1 + 0.3 * (1 - prog(t, V.HIT, V.HIT + 0.3, ease))})`, textShadow: '0 10px 60px rgba(120,0,0,.6)' }}>quiebra.</span>
          </div>
        </>}
        {/* outro: one tiny glass bead pulsing in the dark */}
        {t >= 8.5 && <div style={{ position: 'absolute', left: 490, top: 910, width: 100, height: 100, borderRadius: '50%', ...glass, opacity: prog(t, 8.6, 9.0), transform: `scale(${0.9 + 0.1 * Math.sin(t * 5)})` }} />}
      </AbsoluteFill>
      <Grain opacity={0.05} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
