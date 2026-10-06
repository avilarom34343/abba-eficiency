// P08 · Puffy 3D: inflated, glossy toy-like 3D (balloon digits, donuts, pills, a squishy camera) that bounce and squash
// on every kick over a candy gradient; on "quiebra" everything pops into confetti and a red word flops onto the floor.
import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { AbbaTag, Words, prog, rand, useCount, useT } from '../kit';
import { Env } from '../styles/S04Objeto3D';
import { KICKS, P, PF, V } from './pkit';

const font = new FontLoader().parse(fontJson as never);
const cache = new Map<string, { g: THREE.BufferGeometry; w: number }>();
export const glyph = (c: string) => {
  if (!cache.has(c)) {
    const g = new TextGeometry(c, { font, size: 1, depth: 0.35, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.09, bevelSegments: 10 });
    g.computeBoundingBox(); const b = g.boundingBox!; g.translate(-(b.max.x + b.min.x) / 2, -(b.max.y + b.min.y) / 2, 0);
    cache.set(c, { g, w: b.max.x - b.min.x });
  }
  return cache.get(c)!;
};
export const Puffy: React.FC<{ color: string }> = ({ color }) => <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} sheen={1} sheenColor="#ffffff" />;
/** squash & stretch for a bounce that landed `d` seconds ago */
export const squash = (d: number) => { const k = Math.exp(-d * 7) * Math.cos(d * 26); return [1 + 0.18 * k, 1 - 0.22 * k, 1 + 0.18 * k] as [number, number, number]; };
export const sinceKick = (t: number) => t - (KICKS.filter(k => k <= t).pop() ?? -9);

/** A word of balloon letters, each dropping in with a bounce. */
export const Word: React.FC<{ s: string; at: number; width: number; colors: string[]; t: number; y?: number; pop?: number; stagger?: number }> = ({ s, at, width, colors, t, y = 0, pop = 0, stagger = 0.08 }) => {
  const gl = s.split('').map(glyph), gap = 0.12, total = gl.reduce((a, g) => a + g.w + gap, -gap), k = width / total;
  let x = -total / 2;
  return <group scale={k} position={[0, y, 0]}>{gl.map((g, i) => {
    const cx = x + g.w / 2; x += g.w + gap;
    const a = at + i * stagger, d = t - a; if (d < 0) return null;
    const drop = d < 0.25 ? (1 - d / 0.25) ** 2 * 4 : 0;
    const sq = squash(Math.min(d - 0.25 < 0 ? 9 : d - 0.25, sinceKick(t)));
    return <mesh key={i} geometry={g.g} position={[cx, drop, 0]} scale={sq.map(v => v * (1 + pop * 0.4) * (1 - Math.max(0, pop - 0.5) * 2)) as never} rotation={[0, Math.sin(t * 2 + i) * 0.15, Math.sin(t * 3 + i) * 0.05]}><Puffy color={colors[i % colors.length]} /></mesh>;
  })}</group>;
};

const Camera: React.FC<{ t: number; pop: number }> = ({ t, pop }) => {
  const body = useMemo(() => new RoundedBoxGeometry(2.2, 1.4, 1, 6, 0.35), []), sq = squash(sinceKick(t));
  return <group scale={sq.map(v => v * 0.9 * (1 + pop * 0.4) * Math.max(0, 1 - Math.max(0, pop - 0.5) * 2)) as never} rotation={[0.25, Math.sin(t * 1.6) * 0.5 - 0.3, Math.sin(t * 2.2) * 0.08]}>
    <mesh geometry={body}><Puffy color="#FFF4FB" /></mesh>
    <mesh position={[1.25, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.5, 0.55, 0.5, 40]} /><Puffy color={P.violet} /></mesh>
    <mesh position={[1.52, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.36, 0.12, 20, 40]} /><Puffy color={P.cyan} /></mesh>
    <mesh position={[-0.5, 0.86, 0]}><capsuleGeometry args={[0.16, 0.5, 8, 16]} /><Puffy color={P.hot} /></mesh>
    <mesh position={[0.6, -0.35, 0.52]}><sphereGeometry args={[0.13, 24, 24]} /><meshStandardMaterial color={P.red} emissive={P.red} emissiveIntensity={1.5 * (0.6 + 0.4 * Math.sin(t * 12))} /></mesh>
    <mesh position={[-0.4, -0.15, 0.5]}><boxGeometry args={[0.9, 0.5, 0.06]} /><Puffy color="#3b2a6b" /></mesh>
  </group>;
};

export const P08Puffy: React.FC = () => {
  const t = useT(), count = useCount(t);
  const pop = prog(t, V.HIT, V.HIT + 0.18, x => x);
  const toys = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ x: (rand(i, 1) - 0.5) * 3.4, y: (rand(i, 2) - 0.5) * 6, z: -1 - rand(i, 3) * 2, kind: i % 3, c: [P.hot, P.yellow, P.mint, P.cyan, P.violet, P.orange][i % 6], ph: rand(i, 4) * 6 })), []);
  const confetti = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ v: new THREE.Vector3((rand(i, 5) - 0.5) * 9, rand(i, 6) * 7 + 1, (rand(i, 7) - 0.5) * 4), c: [P.hot, P.yellow, P.mint, P.cyan, P.violet][i % 5] })), []);
  const dim = prog(t, V.quiebraLine, V.HIT), dark = prog(t, 8.4, 9.0);
  const qd = t - V.HIT, flop = qd < 0 ? 0 : qd < 0.3 ? (qd / 0.3) ** 2 : 1;
  return (
    <AbsoluteFill style={{ background: t < V.HIT ? `linear-gradient(180deg, #FFB8E8 0%, #C9B8FF 50%, #9FE8FF 100%)` : '#1a0610' }}>
      <AbsoluteFill style={{ background: '#2a0b1e', opacity: dim * 0.5 * (t < V.HIT ? 1 : 0) }} />
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 35, position: [0, 0, 9] }}>
        <Env />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 6]} intensity={2.2 * (1 - dark)} />
        <directionalLight position={[-4, -2, 3]} intensity={1.2 * (1 - dark)} color={t < V.HIT ? '#ffd0f0' : P.red} />
        {t < V.HIT + 0.2 && toys.map((o, i) => {
          const s = 0.45 * (1 + pop * 0.5) * Math.max(0, 1 - Math.max(0, pop - 0.6) * 3), sq = squash(sinceKick(t + i * 0.05));
          return <group key={i} position={[o.x, o.y + Math.sin(t * 1.5 + o.ph) * 0.25, o.z]} rotation={[t * 0.6 + o.ph, t * 0.8, 0]} scale={sq.map(v => v * s) as never}>
            <mesh>{o.kind === 0 ? <torusGeometry args={[0.6, 0.3, 24, 48]} /> : o.kind === 1 ? <capsuleGeometry args={[0.32, 0.7, 10, 20]} /> : <sphereGeometry args={[0.55, 32, 32]} />}<Puffy color={o.c} /></mesh>
          </group>;
        })}
        {t < 1.5 && <Word s="1975" at={V.y1975} width={3.0} colors={[P.hot, P.yellow, P.mint, P.violet]} t={t} />}
        {t >= 1.5 && t < 3.0 && <Word s={`${count}%`} at={1.5} width={2.7} colors={[P.violet, P.cyan, P.hot]} t={t} y={0.6} />}
        {t >= 3.0 && t < V.HIT + 0.2 && <group position={[-0.3, -0.2, 0]} scale={prog(t, 3.0, 3.35, x => 1 - Math.pow(1 - x, 3) * Math.cos(x * 8))}><Camera t={t} pop={pop} /></group>}
        {t >= V.HIT && t < 8.5 && confetti.map((c, i) => {
          const d = t - V.HIT, p = c.v.clone().multiplyScalar(d).add(new THREE.Vector3(0, -5 * d * d, 0));
          return <mesh key={i} position={p} rotation={[d * 9 + i, d * 7, i]} scale={0.09}><boxGeometry args={[1, 1.6, 0.2]} /><meshStandardMaterial color={c.c} /></mesh>;
        })}
        {qd > 0 && t < 8.6 && <group position={[0, 2.2 - flop * 2.2, 0.5]} scale={[1 + 0.25 * Math.exp(-Math.max(0, qd - 0.3) * 6) * (flop === 1 ? 1 : 0), 1 - 0.3 * Math.exp(-Math.max(0, qd - 0.3) * 6) * (flop === 1 ? 1 : 0), 1]}>
          <Word s="QUIEBRA" at={V.HIT} width={2.6} colors={[P.red, '#ff5a4a']} t={t} stagger={0.025} />
        </group>}
        {t >= 8.6 && <mesh position={[0, -0.2 + Math.abs(Math.sin(t * 4)) * 0.6, 0]} scale={0.22 * prog(t, 8.6, 8.9)}><sphereGeometry args={[1, 32, 32]} /><Puffy color={P.hot} /></mesh>}
      </ThreeCanvas>
      {[['Kodak era intocable.', V.kodak, 2.95, 1300], ['Entonces inventó algo que cambiaría el mundo…', V.inventa, 5.85, 300], ['…y eso la llevó a la', V.quiebraLine, 6.65, 1350]].map(([s, a, b, top]) => (
        <div key={s as string} style={{ position: 'absolute', left: 80, right: 80, top: top as number, textAlign: 'center' }}>
          <Words text={s as string} at={a as number} out={b as number} stagger={0.12} from="scale" style={{ fontFamily: PF.round, fontSize: 70, color: '#fff', lineHeight: 1.15, textShadow: `0 6px 0 ${P.violet}, 0 12px 30px rgba(80,0,120,.35)` }} />
        </div>
      ))}
      <AbsoluteFill style={{ background: '#fff', opacity: t >= V.HIT ? Math.max(0, 1 - (t - V.HIT) / 0.12) * 0.75 : 0 }} />
      <AbsoluteFill style={{ background: '#000', opacity: dark * 0.7 }} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
