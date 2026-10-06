// P10 · Ribbons: glossy 3D ribbons flow through the frame like a launch-event wallpaper, breathing with the kick and
// changing colour per bar; on "quiebra" they snap straight, drain to grey and fall, leaving one red thread.
import React, { useEffect, useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { AbbaTag, DigitalCamera, Grain, Words, ease, prog, useCount, useT } from '../kit';
import { Env } from '../styles/S04Objeto3D';
import { P, PF, V, kickPulse } from './pkit';

const COLS = [[P.hot, P.violet, P.cyan, P.yellow, P.orange, P.mint], [P.cyan, P.mint, P.volt, P.violet, P.hot, P.yellow]];
const Ribbon: React.FC<{ i: number; t: number; snap: number; fall: number }> = ({ i, t, snap, fall }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 60 }, (_, j) => {
    const u = j / 59, wave = (1 - snap) * (Math.sin(u * 6 + t * (1.2 + i * 0.15) + i) * 0.9 + Math.sin(u * 11 - t * 0.8 + i * 2) * 0.3);
    return new THREE.Vector3(-4 + u * 8, (i - 2.5) * 0.55 + wave - fall * fall * (2 + i * 0.6), Math.cos(u * 5 + t + i) * 0.8 * (1 - snap));
  })), 160, 0.16 + 0.05 * Math.sin(i), 20, false), [i, t, snap, fall]);
  useEffect(() => () => geo.dispose(), [geo]);
  const bar = Math.min(3, Math.floor(t / 1.5)), col = COLS[bar % 2][i % 6];
  return <mesh geometry={geo} rotation={[0, 0, 0.9]}><meshPhysicalMaterial color={snap > 0.5 ? '#7a7a80' : col} roughness={0.18} clearcoat={1} iridescence={0.5} sheen={0.6} /></mesh>;
};

export const P10Ribbons: React.FC = () => {
  const t = useT(), count = useCount(t), k = kickPulse(t);
  const snap = prog(t, V.HIT, V.HIT + 0.15, x => x), fall = Math.max(0, t - V.HIT - 0.3);
  const dark = prog(t, 8.4, 9.0);
  const sans = (size: number, color = '#fff', extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: PF.sans, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.045em', lineHeight: 1, ...extra });
  return (
    <AbsoluteFill style={{ background: t < V.HIT ? 'radial-gradient(80% 60% at 50% 50%, #1b1035, #05030a)' : '#070707' }}>
      <AbsoluteFill style={{ transform: `scale(${1 + k * 0.03})`, opacity: 1 - dark * 0.9 }}>
        <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, position: [0, 0, 9] }}>
          <Env />
          <ambientLight intensity={0.3} />
          <directionalLight position={[2, 4, 6]} intensity={2.5} />
          <pointLight position={[-3, -3, 3]} intensity={30} color={P.hot} />
          {Array.from({ length: 6 }, (_, i) => <Ribbon key={i} i={i} t={Math.min(t, V.HIT + 0.15)} snap={snap} fall={fall} />)}
          {/* the one red thread that remains */}
          {t >= V.HIT && <mesh rotation={[0, 0, 0.9]} position={[0, 0, 0.5]}><cylinderGeometry args={[0.035, 0.035, 12 * prog(t, V.HIT, V.HIT + 0.4), 12]} /><meshStandardMaterial color={P.red} emissive={P.red} emissiveIntensity={2} /></mesh>}
        </ThreeCanvas>
      </AbsoluteFill>
      {/* frosted text panel keeps the type readable over the ribbons */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {t < 1.5 && <div style={{ ...sans(320), transform: `scale(${1.08 - 0.08 * prog(t, 0, 1.4, ease)})`, opacity: prog(t, V.y1975, V.y1975 + 0.4), textShadow: '0 20px 80px rgba(0,0,0,.6)' }}>1975.</div>}
        {t >= 1.5 && t < 3.0 && <div style={{ display: 'grid', gap: 30 }}>
          <div style={{ ...sans(420), textShadow: '0 20px 80px rgba(0,0,0,.6)' }}>{count}%</div>
          <Words text="Kodak era intocable." at={V.kodak} stagger={0.12} from="blur" style={sans(84)} />
        </div>}
        {t >= 3.0 && t < V.quiebraLine && <div style={{ display: 'grid', gap: 60, justifyItems: 'center' }}>
          <Words text="Entonces inventó algo que cambiaría el mundo…" at={V.inventa} stagger={0.24} from="blur" style={{ ...sans(92), padding: '0 90px', lineHeight: 1.05 }} />
          {t >= 4.5 && <div style={{ opacity: prog(t, 4.5, 4.9), transform: `translateY(${(1 - prog(t, 4.5, 5.0, ease)) * 80}px)`, padding: 36, borderRadius: 48, background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(255,255,255,.4)' }}><DigitalCamera size={480} body="#fff" accent={P.hot} /></div>}
        </div>}
        {t >= V.quiebraLine && t < 8.5 && <div style={{ display: 'grid', gap: 40 }}>
          <div style={{ ...sans(70, '#c7c7cc'), opacity: prog(t, V.quiebraLine, V.quiebraLine + 0.25) }}>…y eso la llevó a la</div>
          <div style={{ ...sans(250, P.red), opacity: t >= V.HIT ? 1 : 0, transform: `scale(${1 + 0.3 * (1 - prog(t, V.HIT, V.HIT + 0.3, ease))})`, textShadow: '0 0 60px rgba(255,45,45,.6)' }}>quiebra.</div>
        </div>}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: t >= V.HIT ? Math.max(0, 1 - (t - V.HIT) / 0.12) * 0.6 : 0 }} />
      <Grain opacity={0.05} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
