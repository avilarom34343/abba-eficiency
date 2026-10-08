// Scene 5 — Extreme world. A door of light opens in a black void and the camera dives through it (0–5.8),
// then a match-cut montage where every cut carries the camera roll of the previous shot:
// motocross launch (5.8 "Motocross") → snowboard 540 (7.1 "Snowboard") → aircraft in a canyon (8.4 "Aviones")
// → formula car into a corner (9.7 "Fórmula Uno").
import * as THREE from 'three';
import * as K from '../assets/kit.js';

const CUT = [0, 5.8, 7.1, 8.4, 9.7, 99];
const PI = Math.PI;
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

function gradTex(radial) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = radial ? x.createRadialGradient(64, 64, 0, 64, 64, 64) : x.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(radial ? 0.2 : 0.3, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const GLOW = gradTex(true), FALL = gradTex(false);
const sprite = (color, s, parent) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.scale.setScalar(s); parent.add(m); return m; };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, ...o });
const box = (p, mat, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); p.add(m); return m; };
const ground = (p, color, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), std(color, { roughness: 0.95, ...o })); m.rotation.x = -PI / 2; p.add(m); return m; };

// wheel spinning about local x; returns { g, hub }
function wheel(p, r, w, x, y, z, rimCol = 0xc9ced6) {
  const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); const hub = new THREE.Group(); g.add(hub);
  const tire = new THREE.Mesh(new THREE.TorusGeometry(r, w, 10, 28), std(0x0b0b0d, { roughness: 0.9 })); tire.rotation.y = PI / 2; hub.add(tire);
  const metal = std(rimCol, { metalness: 1, roughness: 0.25 });
  for (let k = 0; k < 3; k++) box(hub, metal, 0.02, r * 2, 0.04, 0, 0, 0, (k * PI) / 3);
  return { g, hub };
}

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0);
  scene.environment = K.envMap(renderer);
  scene.fog = new THREE.Fog(0, 10, 100);
  const cam = K.camera(38); scene.add(cam);
  const rig = K.lightRig(scene); const [key, rim, top, amb] = rig.children;
  const flare = sprite(0xffffff, 3.2, cam); flare.position.z = -1;
  const speed = K.streaks(scene, { count: 150, len: 7, area: [16, 26, 80], color: 0xfff0dc, seed: 15, opacity: 0.45 }); scene.remove(speed); cam.add(speed);
  const v = new THREE.Vector3(), w = new THREE.Vector3();
  const hand = (t, a) => [Math.sin(t * 1.7) * a + Math.sin(t * 4.1) * a * 0.4, Math.sin(t * 2.3 + 1) * a + Math.sin(t * 5.3) * a * 0.3];

  // ======================= 0 · the door of light =======================
  const S0 = new THREE.Group();
  K.sky(S0, 0x1a2a58, 0xffa45a, 700);
  K.mountains(S0, { seed: 12, color: 0x2a3552, z: -300, width: 1000, height: 130 });
  K.mountains(S0, { seed: 4, color: 0x141824, z: -170, width: 700, height: 45, snow: false });
  sprite(hdr(0xffd49a, 2.6), 220, S0).position.set(0, 22, -520);
  const outside = ground(S0, 0x3a2a20); outside.position.z = -1512;
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), std(0x07080b, { roughness: 0.18, metalness: 0.7 })); inside.rotation.x = -PI / 2; inside.position.set(0, 0.002, 88); S0.add(inside);
  const wallMat = std(0x030405, { roughness: 0.8 }), DOOR_Z = -12, DH = 7.5;
  const plane = () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), wallMat); m.position.z = DOOR_Z; S0.add(m); return m; };
  const wl = plane(), wr = plane(), lint = plane();
  const leak = std(0, { emissive: hdr(0xffe2b8, 3) });
  const jl = box(S0, leak, 0.05, DH, 0.05, 0, DH / 2, DOOR_Z), jr = box(S0, leak, 0.05, DH, 0.05, 0, DH / 2, DOOR_Z), jt = box(S0, leak, 1, 0.05, 0.05, 0, DH, DOOR_Z);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 16), new THREE.MeshBasicMaterial({ map: FALL, color: hdr(0xffc68c, 1.3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  pool.rotation.x = -PI / 2; pool.position.set(0, 0.01, DOOR_Z + 8); S0.add(pool);
  const doorGlow = sprite(hdr(0xffe6c0, 1.6), 1, S0); doorGlow.position.set(0, DH * 0.45, DOOR_Z - 0.5);
  const beamDust = K.dust(S0, { count: 700, area: [6, 8, 18], color: 0xffd8a8, size: 0.035, speed: 0.08, seed: 41, opacity: 0.55 }); beamDust.position.set(0, 4, DOOR_Z + 6);
  const walker = K.figure({ pose: 'stand', color: 0x050608 }); S0.add(walker);

  // ======================= 1 · motocross launch =======================
  const S1 = new THREE.Group();
  K.sky(S1, 0x101c40, 0xff7a36, 700);
  K.mountains(S1, { seed: 3, color: 0x1b1822, z: -260, width: 900, height: 70, snow: false });
  sprite(hdr(0xffa850, 3), 160, S1).position.set(-30, 12, -480);
  ground(S1, 0x2b1d14);
  const dirt = std(0x3a2618, { roughness: 1 });
  box(S1, dirt, 5, 0.6, 8, 0, 1.05, -11.6, -0.33);
  for (let i = 0; i < 6; i++) box(S1, dirt, 3 + i, 1 + (i % 3), 4, (i % 2 ? 1 : -1) * (14 + i * 6), 0, -30 - i * 18, 0, i, 0); // berms
  const bike = new THREE.Group(); S1.add(bike);
  const plastic = new THREE.MeshPhysicalMaterial({ color: 0x24357e, roughness: 0.35, metalness: 0.3, clearcoat: 1 }), chrome = std(0xd8dde6, { metalness: 1, roughness: 0.2 });
  const wR = wheel(bike, 0.32, 0.07, 0, 0.36, -0.72, 0x6a707a), wF = wheel(bike, 0.34, 0.06, 0, 0.38, 0.78, 0x6a707a);
  box(bike, plastic, 0.3, 0.22, 0.75, 0, 0.85, 0.05); box(bike, plastic, 0.24, 0.1, 0.8, 0, 0.92, -0.45, 0.1); box(bike, chrome, 0.06, 0.06, 0.9, 0, 0.5, -0.35, -0.2);
  box(bike, chrome, 0.05, 0.85, 0.05, 0, 0.75, 0.65, 0.35); box(bike, plastic, 0.3, 0.05, 0.4, 0, 0.78, 0.92, -0.3); box(bike, chrome, 0.7, 0.04, 0.04, 0, 1.12, 0.5);
  box(bike, std(0x1a1b20, { metalness: 0.6, roughness: 0.4 }), 0.28, 0.3, 0.35, 0, 0.55, 0.05);
  const rider = K.figure({ pose: 'ride', color: 0x101218 }); rider.scale.setScalar(0.8); rider.position.set(0, 0.42, -0.15); rider.rotation.x = 0.35; bike.add(rider);
  const roost = K.dust(S1, { count: 500, area: [5, 3, 5], color: 0xc89a6a, size: 0.05, speed: 0.4, seed: 7, opacity: 0.5 }); roost.position.set(0, 2.5, -8.5);

  // ======================= 2 · snowboard 540 =======================
  const S2 = new THREE.Group();
  K.sky(S2, 0x1d4a96, 0xd4e6ff, 700);
  K.mountains(S2, { seed: 5, color: 0x7f8ea8, z: -230, width: 900, height: 150 });
  sprite(hdr(0xfff4e0, 1.3), 70, S2).position.set(-160, 70, -420);
  const snow = std(0xd6deea, { roughness: 0.75 }); ground(S2, 0x74819a, { roughness: 0.9 });
  box(S2, snow, 4, 1.2, 5, -1.6, 0.6, 0.5, 0, 0, -0.35);
  const boarder = new THREE.Group(); S2.add(boarder);
  const bf = K.figure({ pose: 'board', color: 0x14171e }); bf.rotation.y = PI / 2; boarder.add(bf);
  box(boarder, new THREE.MeshPhysicalMaterial({ color: 0xffc23d, roughness: 0.3, clearcoat: 1 }), 0.32, 0.04, 1.55, 0, 0.02, 0);
  const spray = K.dust(S2, { count: 600, area: [4, 3, 4], color: 0xffffff, size: 0.05, speed: 0.6, seed: 19, opacity: 0.7 }); spray.position.set(-1, 1.5, 0);
  const flakes = K.dust(S2, { count: 800, area: [24, 16, 24], color: 0xffffff, size: 0.04, speed: 0.5, seed: 23, opacity: 0.6 }); flakes.position.set(0, 4, 0);

  // ======================= 3 · aircraft through the canyon =======================
  const S3 = new THREE.Group();
  K.sky(S3, 0x2c4e8c, 0xffb478, 700);
  sprite(hdr(0xffd8a0, 2.5), 140, S3).position.set(-40, 90, -600);
  ground(S3, 0x5a3220);
  const rock = std(0x7a3e22, { roughness: 0.95, flatShading: true, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const geo = new THREE.PlaneGeometry(420, 150, 180, 50), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i);
      p.setZ(i, 7 * Math.sin(x * 0.045 + s) + 3.5 * Math.sin(x * 0.13 + y * 0.09 + s * 2) + 1.6 * Math.sin(x * 0.41 - y * 0.33) + Math.abs(Math.sin(y * 0.21)) * 2.5); }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, rock); m.rotation.y = s * PI / 2 * -1; m.position.set(s * 21, 55, -150); S3.add(m);
  }
  const jet = new THREE.Group(); S3.add(jet);
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xdfe3ea, metalness: 0.7, roughness: 0.25, clearcoat: 1 }), navy = new THREE.MeshPhysicalMaterial({ color: 0x1b2a6b, metalness: 0.5, roughness: 0.3, clearcoat: 1 });
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.16, 4.2, 16), paint); fus.rotation.x = PI / 2; jet.add(fus);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 16), navy); nose.rotation.x = PI / 2; nose.position.z = 2.4; jet.add(nose);
  box(jet, navy, 5.6, 0.07, 1.0, 0, -0.1, 0.6); box(jet, navy, 2.0, 0.05, 0.55, 0, 0.05, -1.85); box(jet, paint, 0.05, 0.8, 0.6, 0, 0.42, -1.8);
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 10, 0, PI * 2, 0, PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x0a0d14, metalness: 0.2, roughness: 0.05, clearcoat: 1 }));
  canopy.scale.set(1, 0.9, 2.2); canopy.position.set(0, 0.22, 0.6); jet.add(canopy);
  const prop = new THREE.Group(); prop.position.z = 2.72; jet.add(prop);
  box(prop, std(0x111216, { metalness: 0.5 }), 0.12, 1.9, 0.03, 0, 0, 0); box(prop, std(0x111216, { metalness: 0.5 }), 1.9, 0.12, 0.03, 0, 0, 0);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, depthWrite: false })); prop.add(disc);
  const smoke = []; for (const s of [-1, 1]) for (let k = 0; k < 26; k++) { const sp = sprite(hdr(0xffffff, 0.9), 1, S3); sp.material.fog = true; smoke.push({ sp, s, k }); }
  const jetPos = (t, out) => out.set(5.5 * Math.sin(t * 1.9), 9 + 1.6 * Math.sin(t * 2.4), 30 - 62 * (t - CUT[3]));

  // ======================= 4 · formula car into the corner =======================
  const S4 = new THREE.Group();
  K.sky(S4, 0x04060e, 0x2a1830, 700);
  K.mountains(S4, { seed: 9, color: 0x0b0d14, z: -260, width: 900, height: 50, snow: false });
  ground(S4, 0x020203, { roughness: 1 });
  const track = new THREE.CatmullRomCurve3([[-3, -110], [-3, -40], [-1.5, -14], [4, -5], [14, -0.5], [44, 1]].map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const N = 240, half = 5.5, up = new THREE.Vector3(0, 1, 0), rib = new Float32Array((N + 1) * 6), idx = [], edges = [];
  for (let i = 0; i <= N; i++) { const pp = track.getPointAt(i / N), n = new THREE.Vector3().crossVectors(up, track.getTangentAt(i / N)).normalize();
    rib.set([pp.x + n.x * half, 0.01, pp.z + n.z * half, pp.x - n.x * half, 0.01, pp.z - n.z * half], i * 6); edges.push([pp, n]);
    if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rib, 3)); rg.setIndex(idx); rg.computeVertexNormals();
  S4.add(new THREE.Mesh(rg, std(0x0e0f12, { roughness: 0.35, metalness: 0.2, side: THREE.DoubleSide })));
  const kerb = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.08, 0.9), std(0xffffff, { roughness: 0.7 }), N * 2), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), red = new THREE.Color(0xd2202f), wht = new THREE.Color(0x8a8e96);
  edges.forEach(([pp, n], i) => { for (const s of [-1, 1]) { const k = i * 2 + (s > 0); q.setFromAxisAngle(up, Math.atan2(n.x, n.z));
    mm.compose(new THREE.Vector3(pp.x + n.x * (half + 0.45) * s, 0.04, pp.z + n.z * (half + 0.45) * s), q, new THREE.Vector3(1, 1, 1)); kerb.setMatrixAt(k, mm); kerb.setColorAt(k, (i >> 1) % 2 ? red : wht); } });
  S4.add(kerb);
  const lamps = []; for (let i = 0; i < 14; i++) { const [pp, n] = edges[Math.floor((i / 14) * N)], g = new THREE.Group(); g.position.set(pp.x - n.x * 12, 0, pp.z - n.z * 12); S4.add(g);
    box(g, std(0x15171c, { metalness: 0.7 }), 0.3, 12, 0.3, 0, 6, 0); sprite(hdr(0xfff0d8, 2.2), 6, g).position.y = 12; lamps.push(g); }
  const crowd = K.dust(S4, { count: 900, area: [160, 8, 6], color: 0xffd7a0, size: 0.25, speed: 0, seed: 61, opacity: 0.7 }); crowd.position.set(10, 6, -70);
  const car = new THREE.Group(); S4.add(car);
  const livery = new THREE.MeshPhysicalMaterial({ color: 0x1b2a6b, metalness: 0.6, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }), silver = new THREE.MeshPhysicalMaterial({ color: 0xd8dde6, metalness: 0.9, roughness: 0.2, clearcoat: 1 });
  const carbon = std(0x0c0d10, { metalness: 0.4, roughness: 0.4 });
  box(car, carbon, 1.5, 0.08, 4.6, 0, 0.14, 0); box(car, livery, 0.5, 0.32, 2.3, 0, 0.38, 1.5); box(car, livery, 1.5, 0.42, 1.8, 0, 0.42, -0.3); box(car, silver, 0.62, 0.55, 1.7, 0, 0.66, -0.95);
  box(car, std(0xffc23d, { roughness: 0.3 }), 0.4, 0.2, 0.4, 0, 0.35, 2.75); box(car, livery, 2.0, 0.04, 0.45, 0, 0.12, 2.75); box(car, livery, 1.2, 0.05, 0.42, 0, 1.0, -2.25); box(car, carbon, 0.04, 0.5, 0.5, 0.6, 0.8, -2.25); box(car, carbon, 0.04, 0.5, 0.5, -0.6, 0.8, -2.25);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), silver); helmet.position.set(0, 0.78, 0.35); car.add(helmet);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 20, PI), carbon); halo.rotation.x = -PI / 2; halo.position.set(0, 0.86, 0.35); car.add(halo);
  const cw = [[0.85, 1.6, 0.34], [-0.85, 1.6, 0.34], [0.86, -1.45, 0.37], [-0.86, -1.45, 0.37]].map(([x, z, r]) => { const W = wheel(car, r * 0.78, r * 0.24, x, r, z, 0xffc23d); W.hub.scale.set(1.6, 1, 1); return W; });
  const tail = sprite(hdr(0xff2a20, 3), 0.7, car); tail.position.set(0, 0.55, -2.4);
  const trail = []; for (let k = 0; k < 18; k++) trail.push(sprite(hdr(0xff3a2a, 1.6 * (1 - k / 20)), 0.6, S4));

  const shots = [
    { g: S0, fog: [0x2a1c18, 80, 800], rig: [0xbcd7ff, 0.6, 0xffb070, 2, 0.08] },
    { g: S1, fog: [0x5a3226, 60, 520], rig: [0xbcd7ff, 1.6, 0xff8a3a, 7, 0.35] },
    { g: S2, fog: [0xb8cbe6, 50, 480], rig: [0xdfeaff, 2.2, 0xffffff, 3, 0.4] },
    { g: S3, fog: [0xc9895a, 40, 300], rig: [0xffd2a0, 3.4, 0xffb070, 3, 0.5] },
    { g: S4, fog: [0x0e0c16, 40, 260], rig: [0xbcd7ff, 2.2, 0xff7a2f, 4, 0.12] },
  ];
  shots.forEach((s) => scene.add(s.g));

  function render(t) {
    let i = 0; while (t >= CUT[i + 1]) i++;
    const S = shots[i], a = CUT[i], b = CUT[i + 1];
    shots.forEach((s, k) => { s.g.visible = k === i; });
    scene.fog.color.set(S.fog[0]); scene.fog.near = S.fog[1]; scene.fog.far = S.fog[2];
    key.color.set(S.rig[0]); key.intensity = S.rig[1]; rim.color.set(S.rig[2]); rim.intensity = S.rig[3]; amb.intensity = S.rig[4]; top.intensity = i === 0 ? 0.2 : 1.2;
    speed.visible = false; let fov = 38;

    if (i === 0) {
      const open = K.eio(K.seg(t, 0.4, 4.2)), gap = K.lerp(0.04, 5.2, open);
      wl.scale.set(300, 300, 1); wl.position.set(-gap / 2 - 150, 150, DOOR_Z); wr.scale.set(300, 300, 1); wr.position.set(gap / 2 + 150, 150, DOOR_Z);
      lint.scale.set(gap + 0.02, 300, 1); lint.position.set(0, DH + 150, DOOR_Z);
      jl.position.x = -gap / 2; jr.position.x = gap / 2; jt.scale.x = gap; const leakK = 1 - open * 0.6; [jl, jr, jt].forEach((m) => m.material.emissive.copy(hdr(0xffe2b8, 3 * leakK)));
      pool.scale.x = gap * 1.15 + 0.1; pool.material.opacity = 0.2 + 0.45 * K.seg(t, 0.2, 1.5);
      doorGlow.scale.set(gap * 1.6 + 1.2, DH * 1.3, 1); doorGlow.material.opacity = 0.9 - open * 0.5;
      beamDust.userData.update(t, [0, 0.2, 0.6]);
      const wk = K.seg(t, 2.6, 5.8); walker.visible = t > 1.2; walker.position.set(Math.sin(t * 0.7) * 0.05, Math.abs(Math.sin(t * 7)) * 0.05 * (wk > 0), DOOR_Z - 1 - K.ei(wk) * 30);
      const x = K.seg(t, 0, 5.8), z = 13 - 29 * (0.3 * x + 0.7 * x * x), [hx, hy] = hand(t, 0.03);
      cam.position.set(hx, 1.7 + 0.5 * x + hy, z); cam.lookAt(0, 2.6 + 0.6 * x, -200); fov = K.lerp(38, 46, K.ei(K.seg(t, 4.4, 5.8)));
      speed.visible = t > 4.3; speed.material.opacity = 0.5 * K.seg(t, 4.3, 5.4); speed.userData.update(t, 60);
    } else if (i === 1) {
      const tau = 0.2 + (t - a), y = 2.6 + 7 * tau - 3 * tau * tau, z = -8 + 6.2 * tau;
      bike.position.set(0.25 * Math.sin(tau * 2), y, z); bike.rotation.set(-Math.atan2(7 - 6 * tau, 6.2) * 0.75, Math.sin(tau * 3) * 0.15, Math.sin(tau * 2.6) * 0.35);
      wR.hub.rotation.x = t * 38; wF.hub.rotation.x = t * 30;
      roost.userData.update(tau, [0, 1.5, -1.5]); roost.material.opacity = 0.55 * (1 - K.seg(t, a, a + 0.9));
      const [hx, hy] = hand(t, 0.04); cam.position.set(12.5 - (t - a) * 1.2 + hx, 1.6 + hy, -1.5 + (t - a) * 0.8); cam.lookAt(v.set(bike.position.x, y * 0.5 + 1.2, z - 0.6)); fov = 40;
    } else if (i === 2) {
      const u = t - a, tau = 0.05 + u, y = 1.9 + 7.4 * tau - 3.9 * tau * tau;
      boarder.position.set(-1.2 + 1.9 * tau, y, 0.2); boarder.rotation.set(Math.sin(tau * 2.4) * 0.35, K.eio(K.seg(u, 0.05, 1.2)) * 3 * PI, Math.sin(tau * 3.1) * 0.25);
      spray.userData.update(u, [1.2, 1.4, 0]); spray.material.opacity = 0.75 * (1 - K.seg(u, 0, 0.9)); flakes.userData.update(t, [0.3, -1, 0.2]);
      const ang = K.lerp(0.55, -0.15, K.eio(u / 1.3)), [hx, hy] = hand(t, 0.035);
      cam.position.set(Math.sin(ang) * 9 + hx, 2.6 + hy, Math.cos(ang) * 9); cam.lookAt(boarder.position.x * 0.7, y * 0.6 + 0.9, 0); fov = 40;
    } else if (i === 3) {
      jetPos(t, v); jetPos(t + 0.05, w); jet.position.copy(v); jet.lookAt(w); jet.rotateZ(-0.55 * Math.cos(t * 1.9) - 0.1); prop.rotation.z = t * 55;
      smoke.forEach(({ sp, s, k }) => { const tk = t - k * 0.035; jetPos(tk, w); sp.position.set(w.x + s * 2.7 * Math.cos(0.55 * Math.cos(tk * 1.9)), w.y - 0.1 - s * 2.7 * Math.sin(0.55 * Math.cos(tk * 1.9)), w.z);
        sp.scale.setScalar(0.3 + k * 0.05); sp.material.opacity = 0.45 * (1 - k / 26) * K.seg(tk, a - 0.5, a); });
      const [hx, hy] = hand(t, 0.08); jetPos(t - 0.1, w);
      cam.position.set(w.x * 0.6 + hx, w.y + 2.6 + hy, v.z + 15); cam.lookAt(v.x * 0.9, v.y + 0.9, v.z - 6); fov = 40;
      speed.visible = true; speed.material.opacity = 0.35; speed.userData.update(t, 70);
    } else {
      const u = t - a, p = K.lerp(0.02, 0.96, K.seg(u, 0, 1.6) * (1.12 - 0.12 * K.seg(u, 0, 1.6)));
      track.getPointAt(p, v); track.getPointAt(Math.min(1, p + 0.01), w); car.position.copy(v); car.lookAt(w); car.rotateZ(-0.06 * K.seg(p, 0.6, 0.8));
      cw.forEach((W, k) => { W.hub.rotation.x = t * 60; if (k < 2) W.g.rotation.y = 0.3 * Math.sin(PI * K.seg(p, 0.62, 0.92)); });
      trail.forEach((s, k) => { track.getPointAt(Math.max(0, p - k * 0.004), s.position); s.position.y = 0.55; s.material.opacity = 0.8; });
      tail.visible = Math.floor(t * 8) % 2 === 0;
      crowd.userData.update(t, [0, 0, 0]);
      const [hx, hy] = hand(t, 0.025), look = K.eio(K.seg(p, 0.45, 1));
      cam.position.set(-4.5 + hx, 0.55 + hy, 6.5); cam.lookAt(w.set(K.lerp(v.x, v.x * 0.7, look), 0.5, v.z)); fov = K.lerp(16, 32, K.eio(K.seg(p, 0.3, 0.8)));
    }
    cam.fov = fov; cam.updateProjectionMatrix();
    // match-cut continuity: each shot exits on a roll the next one enters out of
    const roll = (i < 4 ? 0.28 * K.ei(K.seg(t, b - 0.25, b)) : 0) - (i > 0 ? 0.28 * (1 - K.eo(K.seg(t, a, a + 0.35))) : 0);
    cam.rotateZ(roll);
    flare.material.opacity = i > 0 ? 0.55 * (1 - K.seg(t, a, a + 0.14)) : 0; flare.visible = flare.material.opacity > 0;
  }
  render(0);
  return { scene, camera: cam, render };
}
