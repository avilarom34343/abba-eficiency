// 04 · Objeto 3D: film roll and the first digital camera spin like premium products; on "quiebra" the camera cracks and its light dies.
import React, { useEffect } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AbbaTag, Band, C, F, Flash, Grain, LINES, Outro, T, Vignette, Words, ease, inOut, prog, shake, useCount, useT } from '../kit';

const Env: React.FC = () => { // studio reflections
  const { gl, scene } = useThree();
  useEffect(() => { const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; }, [gl, scene]);
  return null;
};
const glossy = (color: string, extra: object = {}) => <meshPhysicalMaterial color={color} roughness={0.25} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} {...extra} />;

const Camera3D: React.FC<{ t: number }> = ({ t }) => {
  const crack = prog(t, T.HIT, T.HIT + 0.25, x => x);          // the body splits a few mm
  const led = t < T.HIT ? 1 : Math.max(0, 1 - (t - T.HIT) * 6) * (Math.sin(t * 90) > 0 ? 1 : 0.2);
  const half = (side: number) => (
    <group position={[side * (0.02 + crack * 0.09), -crack * 0.04 * side, 0]} rotation={[0, 0, side * crack * 0.05]}>
      <mesh position={[side * 0.7, 0, 0]}><boxGeometry args={[1.4, 1.6, 1.3]} />{glossy('#E9E6F2')}</mesh>
      <mesh position={[side * 0.7, 0.62, 0]}><boxGeometry args={[1.42, 0.36, 1.32]} />{glossy('#B9B2CE')}</mesh>
    </group>
  );
  return (
    <group>
      {half(-1)}{half(1)}
      <mesh position={[-0.35, -0.15, 0.66]}><boxGeometry args={[1.25, 0.72, 0.06]} />{glossy('#2A2540')}</mesh>
      <mesh position={[-0.6, -0.15, 0.7]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.04, 32]} />{glossy('#B9B2CE')}</mesh>
      <mesh position={[-0.1, -0.15, 0.7]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.04, 32]} />{glossy('#B9B2CE')}</mesh>
      <mesh position={[0.85, -0.35, 0.68]}><sphereGeometry args={[0.09, 32, 32]} /><meshStandardMaterial color={C.magenta} emissive={C.magenta} emissiveIntensity={3 * led} /></mesh>
      {/* side lens */}
      <mesh position={[1.62, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.42, 0.42, 0.5, 64]} />{glossy('#2A2540')}</mesh>
      <mesh position={[1.88, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.06, 64]} /><meshPhysicalMaterial color="#6F64A8" roughness={0} metalness={0.5} clearcoat={1} /></mesh>
      <pointLight position={[0.85, -0.35, 1.2]} color={C.magenta} intensity={4 * led} distance={3} />
    </group>
  );
};
const Roll3D: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh><cylinderGeometry args={[0.7, 0.7, 2.1, 64]} />{glossy(C.orange, { metalness: 0.6, roughness: 0.2 })}</mesh>
    <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.72, 0.72, 0.18, 64]} />{glossy('#2A2540')}</mesh>
    <mesh position={[0, -1.1, 0]}><cylinderGeometry args={[0.72, 0.72, 0.18, 64]} />{glossy('#2A2540')}</mesh>
    <mesh position={[0, 1.32, 0]}><cylinderGeometry args={[0.18, 0.18, 0.3, 32]} />{glossy('#2A2540')}</mesh>
    {/* film strip leaving the canister */}
    {Array.from({ length: 10 }, (_, i) => {
      const k = Math.min(1, prog(t, 0.2, 2.6) * 10 - i);
      return k > 0 ? <mesh key={i} position={[0.75 + i * 0.32, Math.sin(i * 0.7 + t) * 0.08, 0.05 * i]} rotation={[0, -0.12 * i, 0]}><boxGeometry args={[0.32 * k, 1.1, 0.02]} /><meshStandardMaterial color="#1d1a2b" roughness={0.4} /></mesh> : null;
    })}
  </group>
);

export const S04Objeto3D: React.FC = () => {
  const t = useT(), count = useCount(t);
  const B = t >= T.inventa;
  const swap = prog(t, T.inventa - 0.2, T.inventa + 0.6, inOut);
  const dim = t < T.HIT ? 1 : 0.18 + 0.82 * Math.max(0, 1 - (t - T.HIT) * 3);
  const sh = shake(t, T.HIT, 24);
  // a new camera angle every ~1.5 s
  const angle = t < T.cut1 ? -0.6 + t * 0.35 : t < T.inventa ? 0.9 + (t - T.cut1) * 0.3 : t < T.cut2 ? -0.9 + (t - T.inventa) * 0.5 : t < T.HIT ? 0.35 - (t - T.cut2) * 0.2 : 0.05;
  const dist = t < T.cut1 ? 11 - t : t < T.inventa ? 8.2 : t < T.cut2 ? 12.5 - (t - T.inventa) : t < T.HIT ? 10.5 - (t - T.cut2) * 0.6 : 9.6;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 45%, ${t < T.HIT ? '#3b1670' : '#120a20'}, ${C.bg} 75%)` }}>
      <Band top={420}><Words text={LINES.a1} at={T.y1975} out={T.inventa - 0.2} from="scale" style={{ fontFamily: F.display, fontSize: 300, color: 'rgba(255,255,255,.14)', letterSpacing: -6 }} /></Band>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px)` }}>
        <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, position: [0, 0.6, 9] }}>
          <Env />
          <CameraRig angle={angle} dist={dist} />
          <ambientLight intensity={0.15 * dim} />
          <directionalLight position={[3, 5, 4]} intensity={2.4 * dim} />
          <directionalLight position={[-5, 1, -3]} intensity={1.4 * dim} color={C.blue} />
          <directionalLight position={[4, -3, -2]} intensity={2 * dim} color={C.magenta} />
          <group position={[0, -0.2 + (1 - swap) * 0 , 0]} visible={!B || swap < 1} scale={1 - swap} rotation={[0.15, t * 0.9, 0.1]}><Roll3D t={t} /></group>
          <group visible={swap > 0} position={[-0.3, 0, 0]} scale={swap * 0.85} rotation={[0.22 + Math.sin(t) * 0.04, -0.45 + 0.3 * Math.sin(Math.min(t, T.HIT) * 0.9), 0]}><Camera3D t={t} /></group>
        </ThreeCanvas>
      </AbsoluteFill>
      {/* glass card with the counter */}
      {t < T.inventa && (
        <div style={{ position: 'absolute', left: 140, right: 140, top: 1300, padding: '34px 40px', borderRadius: 44, background: 'rgba(255,255,255,.1)', border: '2px solid rgba(255,255,255,.25)', backdropFilter: 'blur(18px)', opacity: prog(t, T.intocable, T.intocable + 0.4) * (1 - prog(t, 2.8, 3.0)), transform: `translateY(${(1 - prog(t, T.intocable, T.intocable + 0.5, ease)) * 80}px)`, textAlign: 'center' }}>
          <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 150, color: '#fff', lineHeight: 1 }}>{count}%</div>
          <Words text={LINES.a2} at={T.intocable + 0.1} style={{ fontFamily: F.body, fontWeight: 800, fontSize: 58, color: C.lime, marginTop: 10 }} />
        </div>
      )}
      <Band top={250}><Words text={LINES.b} at={T.inventa + 0.1} out={5.85} stagger={0.06} style={{ fontFamily: F.display, fontSize: 72, color: '#fff', lineHeight: 1.05 }} /></Band>
      <Band top={250}><Words text={LINES.c1} at={T.quiebraLine} out={8.4} style={{ fontFamily: F.display, fontSize: 76, color: '#fff' }} /></Band>
      <Band top={1330}><Words text={LINES.c2} at={T.HIT} out={8.45} from="scale" style={{ fontFamily: F.display, fontSize: 190, color: C.magenta, textShadow: `0 0 50px ${C.magenta}` }} /></Band>
      <Flash at={T.HIT} len={0.15} />
      <Outro to={0.82} />
      <Vignette /><Grain />
      <AbbaTag />
    </AbsoluteFill>
  );
};
const CameraRig: React.FC<{ angle: number; dist: number }> = ({ angle, dist }) => {
  const { camera } = useThree();
  camera.position.set(Math.sin(angle) * dist, 0.9, Math.cos(angle) * dist); camera.lookAt(0, -0.1, 0);
  return null;
};
