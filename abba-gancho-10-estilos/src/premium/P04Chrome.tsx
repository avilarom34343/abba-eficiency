// P04 · Chrome 3D: liquid-chrome 3D type ("1975", the counter, "QUIEBRA") lit by neon, an orbiting camera move per bar,
// the 1975 digital camera spinning inside chrome rings; on the hit it cracks and a burst of chrome shards flies out.
import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { AbbaTag, Grain, Words, ease, inOut, prog, rand, shake, useCount, useT } from '../kit';
import { Camera3D, Env } from '../styles/S04Objeto3D';
import { P, PF, V, kickPulse } from './pkit';

const font = new FontLoader().parse(fontJson as never);
const geoCache = new Map<string, THREE.BufferGeometry>();
const textGeo = (s: string) => {
  if (!geoCache.has(s)) { const g = new TextGeometry(s, { font, size: 1, depth: 0.32, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.035, bevelSegments: 5 }); g.center(); geoCache.set(s, g); }
  return geoCache.get(s)!;
};
const Chrome: React.FC<{ color?: string }> = ({ color = '#ffffff' }) => <meshPhysicalMaterial color={color} metalness={0.75} roughness={0.14} clearcoat={1} iridescence={0.6} iridescenceIOR={1.6} envMapIntensity={3} />;
const Text3D: React.FC<{ s: string; color?: string; glow?: number } & JSX.IntrinsicElements['group']> = ({ s, color, glow = 0, ...g }) => (
  <group {...g}><mesh geometry={textGeo(s)}>{glow ? <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={glow} metalness={0.5} roughness={0.2} clearcoat={1} /> : <Chrome color={color} />}</mesh></group>
);
const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const bar = Math.min(4, Math.floor(t / 1.5)), u = (t % 1.5) / 1.5;          // a fresh orbit each bar
  const a = [-0.5, 0.45, -0.35, 0.3, 0][bar] + [0.35, -0.3, 0.3, -0.25, 0][bar] * u, d = [7.5, 6.6, 8.2, 7, 7][bar] - u * 0.6;
  camera.position.set(Math.sin(a) * d, 0.5 + Math.sin(t) * 0.3, Math.cos(a) * d); camera.lookAt(0, 0, 0);
  return null;
};

export const P04Chrome: React.FC = () => {
  const t = useT(), count = useCount(t), k = kickPulse(t);
  const sh = shake(t, V.HIT, 30, 0.6);
  const shards = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ dir: new THREE.Vector3(rand(i, 1) - 0.5, rand(i, 2) - 0.3, rand(i, 3) - 0.2).normalize(), sp: 3 + rand(i, 4) * 6, s: 0.05 + rand(i, 5) * 0.16, c: [P.hot, P.cyan, P.volt, '#ffffff'][i % 4] })), []);
  const q = prog(t, V.HIT, V.HIT + 0.35, ease);                                  // "QUIEBRA" flies at the lens
  const camIn = prog(t, 2.9, 3.4, inOut), dark = prog(t, 8.4, 9.0);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 45% at 50% 48%, ${t < V.HIT ? '#2a0f5c' : '#3a0505'}, #050208 75%)` }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px)` }}>
        <ThreeCanvas width={1080} height={1920} camera={{ fov: 32, position: [0, 0.5, 8] }}>
          <Env />
          <Rig t={t} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 6]} intensity={3 * (1 - dark)} />
          <pointLight position={[-4, 3, 4]} intensity={300 * (1 - dark)} color={t < V.HIT ? P.hot : P.red} />
          <pointLight position={[4, -2, 3]} intensity={300 * (1 - dark)} color={t < V.HIT ? P.cyan : '#ff6a00'} />
          <pointLight position={[0, 4, -3]} intensity={200 * (1 - dark)} color={P.volt} />
          {t < 1.5 && <Text3D s="1975" scale={0.62 + k * 0.03} rotation={[0, Math.sin(t * 1.4) * 0.35, 0]} position={[0, 0, 0]} />}
          {t >= 1.5 && t < 3.1 && <Text3D s={`${count}%`} scale={(0.78 + k * 0.04) * (1 - camIn)} rotation={[0.1, Math.sin(t * 2) * 0.3, 0]} position={[0, 0.5, 0]} color="#e8f6ff" />}
          {t >= 2.9 && t < 8.6 && (
            <group scale={camIn * 0.52 * (1 - 0.35 * q)} position={[0, 0.7 * q, 0]} rotation={[0.2, t < V.HIT ? t * 1.1 : V.HIT * 1.1, 0]}>
              <Camera3D t={t} />
              {t < V.HIT && [0, 1, 2].map(i => (
                <mesh key={i} rotation={[t * (0.8 + i * 0.3) + i, t * 0.6 + i * 2, 0]}><torusGeometry args={[2.4 + i * 0.35, 0.04, 16, 120]} /><Chrome color={[P.hot, P.cyan, P.volt][i]} /></mesh>
              ))}
            </group>
          )}
          {t >= V.HIT && t < 8.6 && shards.map((s, i) => {
            const d = t - V.HIT, p = s.dir.clone().multiplyScalar(s.sp * d).add(new THREE.Vector3(0, -4 * d * d, 0));
            return <mesh key={i} position={p} rotation={[d * 8 * s.dir.x, d * 9 * s.dir.y, d * 7]} scale={s.s}><tetrahedronGeometry args={[1, 0]} /><Chrome color={s.c} /></mesh>;
          })}
          {t >= V.HIT && t < 8.6 && <Text3D s="QUIEBRA" color="#ff3030" glow={0.9} scale={0.26 + 0.1 * (1 - q)} position={[0, -0.75 + (1 - q) * 2, 1.2 + (1 - q) * 4]} rotation={[-0.15, 0, 0]} />}
          {t >= 8.5 && <mesh rotation={[t * 0.8, t * 1.1, 0]} scale={0.35 * prog(t, 8.6, 9.1)}><torusGeometry args={[1, 0.08, 16, 90]} /><Chrome color={P.hot} /></mesh>}
        </ThreeCanvas>
      </AbsoluteFill>
      {/* 2D lines (the voice) over the 3D */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1390, textAlign: 'center' }}>
        <Words text="Kodak era intocable." at={V.kodak} out={2.95} style={{ fontFamily: PF.round, fontSize: 70, color: '#fff' }} />
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 300, textAlign: 'center' }}>
        <Words text="Entonces inventó algo que cambiaría el mundo…" at={V.inventa} out={5.85} stagger={0.2} style={{ fontFamily: PF.round, fontSize: 66, color: '#fff', lineHeight: 1.15 }} />
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 300, textAlign: 'center' }}>
        <Words text="…y eso la llevó a la" at={V.quiebraLine} out={8.3} style={{ fontFamily: PF.round, fontSize: 64, color: '#fff' }} />
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: t >= V.HIT ? Math.max(0, 1 - (t - V.HIT) / 0.15) * 0.8 : 0 }} />
      <AbsoluteFill style={{ background: '#000', opacity: dark * 0.6 }} />
      <Grain opacity={0.06} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
