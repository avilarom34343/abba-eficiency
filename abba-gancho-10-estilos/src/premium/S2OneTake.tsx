// Story 2 · One take: the whole story in a single continuous camera move through one toy world. The lab and the
// boardroom sit in front of the giant Kodak tower; the camera cranes up to the tower, swoops back to the inventor,
// whips over to the board meeting, and pulls back just in time to watch the tower collapse.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { AbbaTag, inOut, prog, shake, useT } from '../kit';
import { Env } from '../styles/S04Objeto3D';
import { P } from './pkit';
import { Word, Puffy } from './P08Puffy';
import { B, Board, Lab, Tower } from './toykit';
import { Captions, Outro } from './S1Diorama';

type V3 = [number, number, number];
const LAB: V3 = [-2.2, 0, 0], BOARD: V3 = [2.6, 0.003, 0.4], TOWER: V3 = [0, 0, -6.5];
const KEYS: [number, V3, V3][] = [                          // time, camera position, look-at
  [0.0, [-2.2, 1.9, 4.4], [-2.2, 1.5, -0.5]],
  [1.3, [-2.0, 1.9, 3.9], [-2.2, 1.6, -0.5]],
  [1.75, [-0.6, 1.0, 5.6], [0, 7.0, -6.5]],
  [2.15, [-0.9, 1.3, 5.1], [0, 8.2, -6.5]],
  [2.6, [-3.8, 2.1, 3.1], [-2.2, 1.2, 0]],
  [3.05, [-2.2, 0.8, 4.3], [-2.2, 1.7, 0]],
  [4.4, [-1.9, 0.8, 4.7], [-2.2, 2.0, -0.3]],
  [4.8, [2.6, 2.1, 7.2], [2.6, 1.0, 0.4]],
  [5.85, [2.6, 1.8, 6.0], [2.6, 1.2, 0.4]],
  [6.2, [4.9, 1.7, 4.1], [4.2, 0.75, 0.7]],
  [6.62, [4.7, 1.5, 3.8], [4.3, 0.7, 0.7]],
  [6.95, [0, 3.2, 13.5], [0, 5.0, -6.5]],
  [8.5, [0, 2.8, 15], [0, 3.0, -6.5]],
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

export const S2OneTake: React.FC = () => {
  const t = useT();
  const j = shake(t, B.HIT, 0.25, 0.7), j2 = shake(t, B.no + 0.25, 0.08, 0.35);
  const flash = t >= B.flash ? Math.max(0, 1 - (t - B.flash) / 0.25) : 0;
  const hit = t >= B.HIT, dark = t >= B.outro;
  const hue = (t * 40) % 360;
  return (
    <AbsoluteFill style={{ background: hit ? 'linear-gradient(#3a0a14,#120408)' : `linear-gradient(hsl(${300 + hue * 0.2} 90% 88%), hsl(${190 + hue * 0.2} 90% 85%))` }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, position: [0, 2, 8] }}>
        <Env />
        <Rig t={t} jx={j.x + j2.x} jy={j.y + j2.y} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 7, 6]} intensity={2.3} />
        <directionalLight position={[-4, 2, 3]} intensity={0.9} color={hit ? P.red : '#ffd8f0'} />
        <mesh position={[0, -0.03, -2]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[14, 64]} /><Puffy color={hit ? '#5a2a3a' : '#FFF0F7'} /></mesh>
        <group position={LAB}><Lab t={t} /></group>
        <group position={BOARD}><Board t={t} /></group>
        <group position={TOWER} scale={1.6}><Tower t={t} /></group>
        {t > B.HIT + 0.25 && <group position={[0, 2.4, 4]}><Word s="QUIEBRA" at={B.HIT + 0.25} width={3.2} colors={[P.red, '#ff5a4a']} t={t} stagger={0.03} /></group>}
      </ThreeCanvas>
      <Captions />
      <AbsoluteFill style={{ background: '#fff', opacity: Math.max(flash, hit ? Math.max(0, 1 - (t - B.HIT) / 0.12) * 0.7 : 0) }} />
      {dark && <Outro t={t} />}
      <AbbaTag />
    </AbsoluteFill>
  );
};
