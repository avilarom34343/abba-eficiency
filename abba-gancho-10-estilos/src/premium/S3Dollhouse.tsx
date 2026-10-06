// Story 3 · Dollhouse: the Kodak building as a cut-away dollhouse. Ground floor: the inventor's lab. Middle floor: the
// film factory (the empire). Top floor: the boardroom. Roof: the 90%. The camera rides up and down the floors like a
// lift; on "quiebra" the floors pancake down one onto another.
import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AbbaTag, inOut, prog, rand, shake, useCount, useT } from '../kit';
import { Env } from '../styles/S04Objeto3D';
import { P } from './pkit';
import { Puffy, Word } from './P08Puffy';
import { B, Board, Lab, Person } from './toykit';
import { Captions, Outro } from './S1Diorama';

type V3 = [number, number, number];
const FLOOR = 2.7, W = 5.6, D = 2.8;
const KEYS: [number, V3, V3][] = [
  [0.0, [0, 1.3, 6.6], [0, 1.15, 0]],
  [1.3, [0, 1.25, 6.0], [0, 1.2, 0]],
  [1.75, [0, 5.2, 21], [0, 4.9, 0]],
  [2.2, [0, 5.2, 22], [0, 4.9, 0]],
  [2.6, [-0.4, 1.4, 6.3], [0, 1.2, 0]],
  [4.4, [0, 1.15, 5.6], [0, 1.6, 0]],
  [4.85, [0, 2 * FLOOR + 1.5, 7.6], [0, 2 * FLOOR + 1.0, 0]],
  [5.85, [0, 2 * FLOOR + 1.4, 6.9], [0, 2 * FLOOR + 1.0, 0]],
  [6.2, [1.9, 2 * FLOOR + 1.1, 4.6], [1.7, 2 * FLOOR + 0.8, 0.3]],
  [6.62, [1.8, 2 * FLOOR + 1.0, 4.3], [1.7, 2 * FLOOR + 0.75, 0.3]],
  [6.95, [0, 4.4, 22], [0, 3.6, 0]],
  [8.5, [0, 3.6, 24], [0, 2.6, 0]],
];
const at = (t: number, i: 1 | 2): V3 => {
  const k = KEYS.findIndex(x => x[0] > t);
  if (k <= 0) return KEYS[k === 0 ? 0 : KEYS.length - 1][i];
  const [ta, a] = [KEYS[k - 1][0], KEYS[k - 1][i]], [tb, b] = [KEYS[k][0], KEYS[k][i]], u = prog(t, ta, tb, inOut);
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
};
const Rig: React.FC<{ t: number; jx: number; jy: number }> = ({ t, jx, jy }) => {
  const { camera } = useThree(), p = at(t, 1);
  camera.position.set(p[0] + jx, p[1] + jy, p[2]); camera.lookAt(...at(t, 2));
  return null;
};

/** The middle floor: a conveyor carrying film canisters, a worker waving them on — Kodak's empire running. */
const Factory: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh position={[0, 0.45, 0.1]}><boxGeometry args={[4.6, 0.18, 0.7]} /><Puffy color="#7FD3FF" /></mesh>
    {[-2, -1, 0, 1, 2].map(x => <mesh key={x} position={[x, 0.22, 0.1]}><boxGeometry args={[0.1, 0.45, 0.5]} /><Puffy color="#5AA9D6" /></mesh>)}
    {Array.from({ length: 7 }, (_, i) => { const x = ((i * 0.75 + Math.min(t, B.HIT) * 0.9) % 5.2) - 2.6; return (
      <group key={i} position={[x, 0.78, 0.1]} rotation={[0, t * 2 + i, 0]}>
        <mesh><cylinderGeometry args={[0.2, 0.2, 0.42, 24]} /><Puffy color={i % 2 ? P.yellow : P.orange} /></mesh>
        <mesh position={[0, 0.24, 0]}><cylinderGeometry args={[0.21, 0.21, 0.07, 24]} /><Puffy color="#2A2340" /></mesh>
      </group>); })}
    <Person t={t + 0.4} position={[-1.9, 0, -0.7]} body={P.yellow} hair="#2a1d16" armR={1.2 + Math.sin(t * 9) * 0.5} />
    <Person t={t + 0.9} position={[1.9, 0, -0.7]} body={P.orange} hair="#c9a77a" armL={1.2 + Math.cos(t * 9) * 0.5} />
  </group>
);

export const S3Dollhouse: React.FC = () => {
  const t = useT(), count = useCount(t);
  const slab = useMemo(() => new RoundedBoxGeometry(W + 0.3, 0.3, D + 0.3, 4, 0.12), []);
  const wall = useMemo(() => new RoundedBoxGeometry(W + 0.3, FLOOR, 0.2, 4, 0.08), []);
  const side = useMemo(() => new RoundedBoxGeometry(0.2, FLOOR, D + 0.3, 4, 0.08), []);
  const j = shake(t, B.HIT, 0.35, 0.8), j2 = shake(t, B.no + 0.25, 0.08, 0.35);
  const flash = t >= B.flash ? Math.max(0, 1 - (t - B.flash) / 0.25) : 0;
  const hit = t >= B.HIT, dark = t >= B.outro;
  const fallT = Math.max(0, t - B.HIT);
  // pancake collapse: each floor drops onto the one below, top floor first
  const drop = (f: number) => { const d = Math.max(0, fallT - (3 - f) * 0.09); return { y: -Math.min(f * FLOOR * 0.82, d * d * 14), rz: Math.min(0.25, d * 0.6) * (f % 2 ? 1 : -1) * (f ? 1 : 0), x: (f ? 1 : 0) * Math.min(0.6, d * 1.2) * (f % 2 ? -1 : 1) }; };
  const floorColors = ['#FFE3F1', '#D7FFF0', '#E5DBFF'];
  return (
    <AbsoluteFill style={{ background: hit ? 'linear-gradient(#3a0a14,#120408)' : 'linear-gradient(#FFD1EC 0%, #C9B8FF 55%, #9FE8FF 100%)' }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 32, position: [0, 4, 20] }}>
        <Env />
        <Rig t={t} jx={j.x + j2.x} jy={j.y + j2.y} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 9, 8]} intensity={2.2} />
        <directionalLight position={[-5, 3, 4]} intensity={0.8} color={hit ? P.red : '#ffd8f0'} />
        <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[9, 64]} /><Puffy color={hit ? '#4a2232' : '#C9F5E4'} /></mesh>
        {[0, 1, 2].map(f => { const d = drop(f); return (
          <group key={f} position={[d.x, f * FLOOR + d.y, 0]} rotation={[0, 0, d.rz]}>
            <mesh geometry={slab} position={[0, -0.15, 0]}><Puffy color={floorColors[f]} /></mesh>
            <mesh geometry={wall} position={[0, FLOOR / 2, -D / 2 - 0.05]}><Puffy color={['#FFF4FB', '#FFF8E0', '#F4F0FF'][f]} /></mesh>
            {[-1, 1].map(s => <mesh key={s} geometry={side} position={[s * (W / 2 + 0.05), FLOOR / 2, 0]}><Puffy color="#FFE9A8" /></mesh>)}
            <group position={[0, 0, 0.1]} scale={0.95}>{f === 0 ? <Lab t={t} floor={false} /> : f === 1 ? <Factory t={t} /> : <Board t={t} floor={false} />}</group>
          </group>); })}
        {/* roof + the market-share sign */}
        {(() => { const d = drop(3); return <group position={[d.x * 1.5, 3 * FLOOR + d.y * 1.1, 0]} rotation={[0, 0, -d.rz * 2]}>
          <mesh geometry={slab} position={[0, -0.15, 0]}><Puffy color="#FF9EC7" /></mesh>
          <group position={[0, 1.0, 0]}><Word s={`${count}%`} at={B.tower} width={2.6} colors={[P.hot, P.violet, P.cyan]} t={t} /></group>
        </group>; })()}
        {/* debris puffs */}
        {fallT > 0.3 && Array.from({ length: 14 }, (_, i) => { const d = fallT - 0.3, a = (i / 14) * Math.PI; return <mesh key={i} position={[Math.cos(a) * (3 + d * 3), 0.3 + rand(i) * d, 1.5 + Math.sin(a) * 1.5]} scale={0.5 + d}><sphereGeometry args={[0.5, 12, 12]} /><meshStandardMaterial color="#d8cfe8" transparent opacity={Math.max(0, 0.6 - d * 0.4)} /></mesh>; })}
        {t > B.HIT && <group position={[0, 5.2, 4]}><Word s="QUIEBRA" at={B.HIT + 0.02} width={5.2} colors={[P.red, '#ff5a4a']} t={t} stagger={0.03} /></group>}
      </ThreeCanvas>
      <Captions />
      <AbsoluteFill style={{ background: '#fff', opacity: Math.max(flash, hit ? Math.max(0, 1 - (t - B.HIT) / 0.12) * 0.7 : 0) }} />
      {dark && <Outro t={t} />}
      <AbbaTag />
    </AbsoluteFill>
  );
};
