// Story 1 · Diorama: the story told with toy characters, one shot per beat, the camera pushing / orbiting on each cut.
// 1975 the idea → the untouchable tower → building it → the first photo → the board says NO → the drawer → the tower falls.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { AbbaTag, Words, ease, inOut, prog, shake, useT } from '../kit';
import { Env } from '../styles/S04Objeto3D';
import { P, PF } from './pkit';
import { Word } from './P08Puffy';
import { B, Board, Lab, Tower } from './toykit';

type V3 = [number, number, number];
type Shot = { from: number; to: number; set: 'lab' | 'tower' | 'board'; cam: [V3, V3]; look: [V3, V3]; bg: string };
const SHOTS: Shot[] = [
  { from: 0, to: 1.5, set: 'lab', cam: [[0, 1.9, 7], [0.3, 1.9, 4.6]], look: [[0, 1.3, -0.4], [0, 1.6, -0.6]], bg: 'linear-gradient(#FFD1EC,#C9B8FF)' },
  { from: 1.5, to: B.build, set: 'tower', cam: [[0, 0.4, 9.5], [0, 1.2, 10.5]], look: [[0, 1.5, 0], [0, 4.4, 0]], bg: 'linear-gradient(#9FE8FF,#D7FFF0)' },
  { from: B.build, to: 3.0, set: 'lab', cam: [[-3.2, 2.2, 3.4], [-2.2, 1.8, 3.8]], look: [[0, 1.2, 0], [0, 1.3, 0]], bg: 'linear-gradient(#FFE38A,#FFB0D9)' },
  { from: 3.0, to: 4.5, set: 'lab', cam: [[0, 0.7, 4.6], [0.6, 0.6, 5.4]], look: [[0, 1.6, 0], [0, 2.0, -0.3]], bg: 'linear-gradient(#C9B8FF,#9FE8FF)' },
  { from: 4.5, to: B.drawer, set: 'board', cam: [[0, 2.2, 8.2], [0, 1.9, 6.4]], look: [[0, 1.0, 0], [0, 1.2, 0]], bg: 'linear-gradient(#E5DBFF,#FFC2C2)' },
  { from: B.drawer, to: B.HIT, set: 'board', cam: [[3.6, 1.9, 4.0], [3.1, 1.6, 3.4]], look: [[1.2, 0.8, 0.3], [1.5, 0.75, 0.3]], bg: 'linear-gradient(#8E7BB8,#4A3B6E)' },
  { from: B.HIT, to: B.outro, set: 'tower', cam: [[0, 2.6, 11.5], [0, 2.2, 12.5]], look: [[0, 2.2, 0], [0, 1.6, 0]], bg: 'linear-gradient(#3a0a14,#120408)' },
  { from: B.outro, to: 10, set: 'board', cam: [[2.4, 1.0, 2.0], [2.2, 0.9, 1.7]], look: [[1.7, 0.7, 0.4], [1.7, 0.7, 0.4]], bg: '#050306' },
];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const Rig: React.FC<{ pos: V3; look: V3; jolt: { x: number; y: number } }> = ({ pos, look, jolt }) => {
  const { camera } = useThree();
  camera.position.set(pos[0] + jolt.x * 0.01, pos[1] + jolt.y * 0.01, pos[2]); camera.lookAt(...look);
  return null;
};
export const CAPTIONS: [string, number, number][] = [['1975.', 0.08, 1.45], ['Kodak era intocable.', 1.8, 2.95], ['Entonces inventó algo', 3.1, 4.45], ['que cambiaría el mundo…', 4.5, 5.85], ['…y eso la llevó a la', 5.92, 6.65]];
export const Captions: React.FC = () => <>{CAPTIONS.map(([s, a, b]) => (
  <div key={s} style={{ position: 'absolute', left: 80, right: 80, bottom: 260, textAlign: 'center' }}>
    <Words text={s} at={a} out={b} stagger={0.1} from="scale" style={{ fontFamily: PF.round, fontSize: 58, color: '#fff', lineHeight: 1.15, textShadow: `0 5px 0 ${P.violet}, 0 10px 26px rgba(60,0,100,.35)` }} />
  </div>
))}</>;

/** Near-black ending: the shut drawer, and the camera's red light still blinking through the gap. */
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const a = prog(t, B.outro, B.outro + 0.5), blink = Math.sin(t * 7) > 0 ? 1 : 0.25;
  return <AbsoluteFill style={{ background: '#050306', opacity: a }}>
    <div style={{ position: 'absolute', left: 290, top: 820, width: 500, height: 220, borderRadius: 26, border: '3px solid #241d33' }} />
    <div style={{ position: 'absolute', left: 470, top: 900, width: 140, height: 14, borderRadius: 7, background: '#241d33' }} />
    <div style={{ position: 'absolute', left: 300, top: 1036, width: 480, height: 6, background: `linear-gradient(90deg, transparent, rgba(255,45,45,${0.7 * blink}), transparent)`, filter: 'blur(3px)' }} />
    <div style={{ position: 'absolute', left: 528, top: 1030, width: 24, height: 24, borderRadius: '50%', background: P.red, opacity: blink, boxShadow: `0 0 40px 12px rgba(255,45,45,${0.5 * blink})` }} />
  </AbsoluteFill>;
};

export const S1Diorama: React.FC = () => {
  const t = useT();
  const s = SHOTS.find(x => t >= x.from && t < x.to) ?? SHOTS[SHOTS.length - 1];
  const k = prog(t, s.from, s.to, inOut);
  const jolt = shake(t, B.HIT, 30, 0.6), jolt2 = shake(t, B.no + 0.25, 14, 0.35);
  const flash = t >= B.flash ? Math.max(0, 1 - (t - B.flash) / 0.25) : 0;
  const dark = s.from >= B.outro;
  const qd = t - B.HIT - 0.25;
  return (
    <AbsoluteFill style={{ background: s.bg }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 38, position: [0, 2, 8] }}>
        <Env />
        <Rig pos={lerp3(s.cam[0], s.cam[1], k)} look={lerp3(s.look[0], s.look[1], k)} jolt={{ x: jolt.x + jolt2.x, y: jolt.y + jolt2.y }} />
        <ambientLight intensity={dark ? 0.05 : 0.55} />
        <directionalLight position={[3, 6, 5]} intensity={dark ? 0.1 : 2.3} />
        <directionalLight position={[-4, 2, 3]} intensity={dark ? 0 : 0.9} color={t >= B.HIT && !dark ? P.red : '#ffd8f0'} />
        {dark && <pointLight position={[1.7, 0.72, 0.9]} color={P.red} intensity={3 * (0.5 + 0.5 * Math.sin(t * 6))} distance={2} />}
        {s.set === 'lab' && <Lab t={t} />}
        {s.set === 'tower' && <Tower t={t} />}
        {s.set === 'board' && !dark && <Board t={t} />}
        {s.set === 'tower' && qd > 0 && <group position={[0, 1.2, 3.2]}><Word s="QUIEBRA" at={B.HIT + 0.25} width={2.7} colors={[P.red, '#ff5a4a']} t={t} stagger={0.03} /></group>}
      </ThreeCanvas>
      <Captions />
      <AbsoluteFill style={{ background: '#fff', opacity: Math.max(flash, t >= B.HIT ? Math.max(0, 1 - (t - B.HIT) / 0.12) * 0.7 : 0) }} />
      <AbsoluteFill style={{ background: '#000', opacity: 0.6 * (1 - prog(t, s.from, s.from + 0.08)) }} />
      {dark && <Outro t={t} />}
      <AbbaTag />
    </AbsoluteFill>
  );
};
