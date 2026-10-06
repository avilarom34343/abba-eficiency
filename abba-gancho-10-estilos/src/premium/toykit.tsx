// Toy-world kit for the story versions (S01–S03): puffy characters, props and the three story sets
// (the lab, the tower, the boardroom). Each set lives around its own origin; the versions only decide staging and camera.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ease, prog, rand, useCount } from '../kit';
import { P } from './pkit';
import { Puffy, Word, squash } from './P08Puffy';

// ---------- story beats (seconds), locked to voice 03 ----------
export const B = { idea: 0.55, tower: 1.5, build: 2.2, invent: 3.0, flash: 3.75, board: 4.5, no: 5.15, drawer: 5.92, lock: 6.4, HIT: 6.7, outro: 8.5 };

const box = (w: number, h: number, d: number, r = 0.08) => new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2));
const useBox = (w: number, h: number, d: number, r?: number) => useMemo(() => box(w, h, d, r), [w, h, d, r]);
const Glow: React.FC<{ color: string; k?: number }> = ({ color, k = 1.5 }) => <meshStandardMaterial color={color} emissive={color} emissiveIntensity={k} />;

// ---------- a person ----------
type PersonProps = { t: number; body?: string; hair?: string; tie?: boolean; armL?: number; armR?: number; shake?: number; sad?: number; hop?: number; look?: number } & JSX.IntrinsicElements['group'];
/** Toy person ~1.6 units tall, origin at the feet. arm angles in radians (0 = down, π = straight up). */
export const Person: React.FC<PersonProps> = ({ t, body = '#7FD3FF', hair = '#5B3A29', tie, armL = 0.15, armR = 0.15, shake = 0, sad = 0, hop = 0, look = 0, ...g }) => {
  const blink = (t * 1000 + (g.position ? 300 : 0)) % 2700 < 110 ? 0.15 : 1;
  const headRot = Math.sin(t * 22) * 0.45 * shake + look;
  const y = Math.abs(Math.sin(hop * Math.PI)) * 0.35;
  return (
    <group {...g}>
      <group position={[0, y, 0]}>
        {[-0.11, 0.11].map(x => <mesh key={x} position={[x, 0.22, 0]}><capsuleGeometry args={[0.085, 0.26, 6, 12]} /><Puffy color="#2A2340" /></mesh>)}
        <mesh position={[0, 0.72, 0]}><capsuleGeometry args={[0.24, 0.34, 8, 20]} /><Puffy color={body} /></mesh>
        {tie && <mesh position={[0, 0.78, 0.235]} rotation={[0.08, 0, 0]}><boxGeometry args={[0.07, 0.3, 0.03]} /><Puffy color={P.red} /></mesh>}
        {([[-1, armL], [1, armR]] as const).map(([s, a]) => (
          <group key={s} position={[s * 0.27, 0.95, 0]} rotation={[0, 0, s * a]}>
            <mesh position={[0, -0.2, 0]}><capsuleGeometry args={[0.065, 0.28, 6, 12]} /><Puffy color={body} /></mesh>
            <mesh position={[0, -0.4, 0]}><sphereGeometry args={[0.07, 16, 16]} /><Puffy color="#F2C29B" /></mesh>
          </group>
        ))}
        <group position={[0, 1.3, 0]} rotation={[sad * 0.45, headRot, 0]}>
          <mesh><sphereGeometry args={[0.27, 32, 32]} /><Puffy color="#F2C29B" /></mesh>
          <mesh position={[0, 0.09, -0.02]} scale={[1.04, 0.62, 1.04]}><sphereGeometry args={[0.27, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><Puffy color={hair} /></mesh>
          {[-0.09, 0.09].map(x => <mesh key={x} position={[x, 0.02, 0.245]} scale={[1, blink, 1]}><sphereGeometry args={[0.038, 12, 12]} /><meshStandardMaterial color="#111" /></mesh>)}
          <mesh position={[0, -0.09 + sad * 0.03, 0.25]} rotation={[0, 0, sad > 0.5 ? 0 : Math.PI]}><torusGeometry args={[0.06, 0.016, 8, 16, Math.PI]} /><meshStandardMaterial color="#5a1d1d" /></mesh>
          {[-0.17, 0.17].map(x => <mesh key={x} position={[x, -0.06, 0.2]}><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color="#FF8FB1" transparent opacity={0.55} /></mesh>)}
        </group>
      </group>
    </group>
  );
};

// ---------- props ----------
/** The 1975 digital camera as a toy. `parts` 0→1 assembles it piece by piece (parts fly in from around). */
export const ToyCamera: React.FC<{ t: number; parts?: number; led?: number } & JSX.IntrinsicElements['group']> = ({ t, parts = 1, led = 1, ...g }) => {
  const body = useBox(1.1, 0.7, 0.5, 0.16);
  const piece = (i: number) => { const p = prog(parts, i / 5, i / 5 + 0.3, ease); return { p, off: (1 - p) * 2.2, rot: (1 - p) * 3 }; };
  const P0 = piece(0), P1 = piece(1), P2 = piece(2), P3 = piece(3), P4 = piece(4);
  return (
    <group {...g}>
      {P0.p > 0 && <mesh geometry={body} position={[0, -P0.off, 0]} rotation={[P0.rot, 0, 0]}><Puffy color="#FFF4FB" /></mesh>}
      {P1.p > 0 && <group position={[0.62 + P1.off, 0.05, 0]} rotation={[0, 0, Math.PI / 2 + P1.rot]}>
        <mesh><cylinderGeometry args={[0.24, 0.27, 0.26, 32]} /><Puffy color={P.violet} /></mesh>
        <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.17, 0.06, 12, 32]} /><Puffy color={P.cyan} /></mesh>
      </group>}
      {P2.p > 0 && <mesh position={[-0.25, 0.43 + P2.off, 0]} rotation={[0, 0, Math.PI / 2 + P2.rot]}><capsuleGeometry args={[0.08, 0.22, 6, 12]} /><Puffy color={P.hot} /></mesh>}
      {P3.p > 0 && <mesh position={[-0.2 - P3.off, -0.05, 0.26]}><boxGeometry args={[0.46, 0.26, 0.04]} /><Puffy color="#3b2a6b" /></mesh>}
      {P4.p > 0 && <mesh position={[0.3, -0.18, 0.26 + P4.off]}><sphereGeometry args={[0.065, 16, 16]} /><Glow color={P.red} k={2.2 * led * (0.6 + 0.4 * Math.sin(t * 12))} /></mesh>}
    </group>
  );
};
export const Bulb: React.FC<{ on: number; t: number } & JSX.IntrinsicElements['group']> = ({ on, t, ...g }) => (
  <group {...g} scale={on * (1 + 0.1 * Math.sin(t * 9))}>
    <mesh position={[0, 0.12, 0]}><sphereGeometry args={[0.22, 24, 24]} /><Glow color={P.yellow} k={2.5} /></mesh>
    <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.1, 0.1, 0.14, 16]} /><Puffy color="#bbb" /></mesh>
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2 + t * 1.5]}><mesh position={[0, 0.45, 0]}><capsuleGeometry args={[0.025, 0.12, 4, 8]} /><Glow color={P.yellow} k={2} /></mesh></mesh>)}
    <pointLight color={P.yellow} intensity={6 * on} distance={4} />
  </group>
);
const Desk: React.FC = () => { const top = useBox(1.9, 0.12, 0.8, 0.05); return <group>
  <mesh geometry={top} position={[0, 0.72, 0]}><Puffy color="#FFB86B" /></mesh>
  {[-0.8, 0.8].map(x => <mesh key={x} position={[x, 0.36, 0]}><boxGeometry args={[0.1, 0.72, 0.6]} /><Puffy color="#E0904A" /></mesh>)}
</group>; };
const Gear: React.FC<{ color: string } & JSX.IntrinsicElements['group']> = ({ color, ...g }) => (
  <group {...g}><mesh><torusGeometry args={[0.16, 0.07, 10, 24]} /><Puffy color={color} /></mesh>
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]}><mesh position={[0, 0.25, 0]}><boxGeometry args={[0.08, 0.1, 0.1]} /><Puffy color={color} /></mesh></mesh>)}</group>
);

// ---------- set 1: the lab (idea → building → the camera → first photo) ----------
export const Lab: React.FC<{ t: number; floor?: boolean }> = ({ t, floor = true }) => {
  const idea = prog(t, B.idea, B.idea + 0.35, x => 1 - Math.pow(1 - x, 3) * Math.cos(x * 9));
  const build = prog(t, B.build, B.invent + 0.15, x => x);                     // parts fly in
  const lift = prog(t, B.invent + 0.25, B.invent + 0.6, ease);                 // he lifts the camera overhead
  const hammer = t > B.build && t < B.invent ? Math.abs(Math.sin(t * 18)) : 0;
  const hop = t > B.invent + 0.6 && t < B.board ? ((t - B.invent - 0.6) * 2.4) % 1 : 0;
  return (
    <group>
      {floor && <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[3.2, 48]} /><Puffy color="#FFE3F1" /></mesh>}
      <Desk />
      {t < B.board && <>
      <Person t={t} position={[0, 0, -0.75]} armL={0.3 + hammer * 1.2 + lift * 2.6} armR={0.3 + (t < B.idea ? Math.abs(Math.sin(t * 14)) * 0.5 : 0) + lift * 2.6} hop={hop} look={t < B.idea ? -0.2 : 0} />
      <Bulb on={t < B.invent ? idea : Math.max(0, 1 - (t - B.invent) * 4)} t={t} position={[0, 2.25, -0.75]} />
      {/* papers with sketches, then flying gears while building */}
      {t < B.build && [0, 1, 2].map(i => <mesh key={i} position={[-0.5 + i * 0.35, 0.8, 0.1]} rotation={[-Math.PI / 2, 0, (i - 1) * 0.3]}><planeGeometry args={[0.3, 0.4]} /><meshStandardMaterial color="#fff" /></mesh>)}
      {t >= B.build && t < B.invent + 0.3 && [P.hot, P.cyan, P.yellow, P.mint].map((c, i) => <Gear key={i} color={c} position={[Math.sin(t * 6 + i * 1.6) * 1.1, 1.3 + Math.cos(t * 5 + i) * 0.5, 0.2]} rotation={[0, 0, t * 6 * (i % 2 ? 1 : -1)]} scale={0.8} />)}
      <ToyCamera t={t} parts={build} position={[0, 0.98 + lift * 1.05, 0.05 - lift * 0.6]} rotation={[0.15, Math.sin(t * 2) * 0.3 * lift, 0]} scale={0.7} />
      </>}
    </group>
  );
};

// ---------- set 2: the tower ("intocable", then the collapse) ----------
export const Tower: React.FC<{ t: number }> = ({ t }) => {
  const count = useCount(t);
  const body = useBox(1.6, 1.3, 1.6, 0.18);
  const fall = Math.max(0, t - B.HIT - 0.15), lit = t < B.HIT ? 1 : Math.max(0, 1 - (t - B.HIT) * 5);
  const chunks = 4;
  return (
    <group>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4, 48]} /><Puffy color="#C9F5E4" /></mesh>
      {Array.from({ length: chunks }, (_, i) => {
        const d = Math.max(0, fall - (chunks - 1 - i) * 0.07), dir = i % 2 ? 1 : -1;
        return <group key={i} position={[dir * d * 1.4 * (i / chunks + 0.3), 0.66 + i * 1.32 - d * d * 4 * (i + 1) * 0.6, d * 0.6]} rotation={[d * 1.2 * dir, 0, dir * d * 1.6 * (0.3 + i * 0.25)]}>
          <mesh geometry={body}><Puffy color={i % 2 ? '#FFF4FB' : '#FFE9A8'} /></mesh>
          {Array.from({ length: 6 }, (_, w) => <mesh key={w} position={[-0.5 + (w % 3) * 0.5, -0.25 + Math.floor(w / 3) * 0.5, 0.81]}><boxGeometry args={[0.3, 0.3, 0.03]} />{lit > 0.05 && (w + i) % 3 ? <Glow color={P.yellow} k={1.2 * lit} /> : <Puffy color="#3b2a6b" />}</mesh>)}
        </group>;
      })}
      {/* rooftop sign: the market share, toppling with the top floor */}
      <group position={[fall * 2.4, 5.75 - fall * fall * 7, fall * 0.8]} rotation={[0, 0, -fall * 2.2]}>
        <Word s={`${count}%`} at={B.tower} width={1.7} colors={[P.hot, P.violet, P.cyan]} t={t} />
      </group>
      {/* dust after the collapse */}
      {fall > 0 && Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * fall * 2.5, 0.2 + fall * 0.6 * rand(i), Math.sin(a) * fall * 1.5]} scale={0.3 + fall * 0.5}><sphereGeometry args={[0.4, 12, 12]} /><meshStandardMaterial color="#d8cfe8" transparent opacity={Math.max(0, 0.6 - fall * 0.35)} /></mesh>; })}
    </group>
  );
};

// ---------- set 3: the boardroom (he presents, they say NO, the camera goes in a drawer) ----------
export const Board: React.FC<{ t: number; floor?: boolean }> = ({ t, floor = true }) => {
  const table = useBox(2.6, 0.14, 1.0, 0.06), cab = useBox(0.9, 1.0, 0.8, 0.1), drw = useBox(0.8, 0.36, 0.08, 0.04), lockBody = useBox(0.9, 0.7, 0.4, 0.15);
  const no = t - B.no;
  const slide = prog(t, B.drawer, B.drawer + 0.3, ease), close = prog(t, B.drawer + 0.32, B.lock - 0.02, ease);
  const shake = t > B.no && t < B.drawer + 0.2 ? 1 : 0;
  const sad = prog(t, B.no + 0.2, B.no + 0.6);
  // camera path: on the table in front of the suits → pushed to the cabinet → into the drawer
  const cam = new THREE.Vector3(-0.2, 0.86, 0.15).lerp(new THREE.Vector3(1.7, 0.92, 0.65), slide).add(new THREE.Vector3(0, -0.25 * close, -0.35 * close));
  return (
    <group>
      {floor && <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[3.6, 48]} /><Puffy color="#E5DBFF" /></mesh>}
      {[-0.8, 0, 0.8].map((x, i) => <Person key={x} t={t + i * 0.13} position={[x, 0, -0.75]} body="#2B2F55" hair={['#9a9a9a', '#3a2a20', '#cfcfcf'][i]} tie shake={shake} armR={i === 2 && t > B.drawer - 0.1 && t < B.drawer + 0.4 ? 1.3 : 0.15} sad={-0.2} />)}
      <mesh geometry={table} position={[0, 0.72, 0]}><Puffy color="#B07CFF" /></mesh>
      {[-1.1, 1.1].map(x => <mesh key={x} position={[x, 0.36, 0]}><boxGeometry args={[0.12, 0.72, 0.7]} /><Puffy color="#8A5CE0" /></mesh>)}
      <Person t={t} position={[-1.55, 0, 0.6]} rotation={[0, 0.6, 0]} armR={t < B.no ? 1.4 + Math.sin(t * 8) * 0.2 : 0.2} armL={0.2} sad={sad} />
      {/* the cabinet with its drawer */}
      <group position={[1.7, 0, 0.3]}>
        <mesh geometry={cab} position={[0, 0.5, 0]}><Puffy color="#FFB86B" /></mesh>
        <group position={[0, 0.7, 0.4 + 0.45 * (slide > 0 ? 1 - close : 0) * prog(t, B.drawer - 0.15, B.drawer)]}>
          <mesh geometry={drw}><Puffy color="#E0904A" /></mesh>
          <mesh position={[0, 0, 0.06]}><capsuleGeometry args={[0.03, 0.18, 4, 8]} /><Puffy color="#fff" /></mesh>
        </group>
        {t >= B.lock && <group position={[0, 0.55, 0.48]} scale={squash(t - B.lock).map(v => v * 0.22 * prog(t, B.lock, B.lock + 0.12)) as never}>
          <mesh position={[0, 0.25, 0]}><torusGeometry args={[0.32, 0.09, 10, 24, Math.PI]} /><Puffy color="#ccc" /></mesh>
          <mesh geometry={lockBody}><Puffy color={P.yellow} /></mesh>
        </group>}
      </group>
      {t < B.drawer + 0.6 && <ToyCamera t={t} position={cam} rotation={[0.1, -0.3 + slide * 0.6, 0]} scale={0.45 * (1 - close * 0.2)} />}
      {/* the NO slams onto the table */}
      {no > 0 && t < B.drawer + 0.2 && <group position={[0, 1.45, 0.25]}>
        <Word s="NO" at={B.no} width={1.5} colors={[P.red]} t={t} stagger={0.04} />
      </group>}
    </group>
  );
};
