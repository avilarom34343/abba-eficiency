// Scene 6 — Becomes content. A dark media control room: operators in silhouette before a curved wall of live
// feeds (0–3.6, "Y después hizo algo todavía más grande"). The camera dives into the centre screen and flies
// down a tunnel of screens that multiplies into a vast wall. The feeds re-cut on the words:
// "eventos" (5.0) crowds/stages, "equipos" (6.4) teams, "contenido" (8.3) the whole wall goes live.
import * as THREE from 'three';
import * as K from '../assets/kit.js';

const PI = Math.PI, BEATS = [5.0, 6.4, 8.3], CY = 4.95, WALL_Z = -14;
const hsh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
// feed mix per phase: before "eventos", events, teams, content
const MIX = [['moto', 'snow', 'race', 'air', 'ridge', 'moto', 'race', 'snow'], ['crowd', 'stage', 'race', 'crowd', 'stage', 'air', 'crowd', 'moto'],
  ['team', 'team', 'moto', 'team', 'crowd', 'team', 'snow', 'race'], ['studio', 'moto', 'race', 'crowd', 'team', 'air', 'snow', 'stage']];

function paintFeed(x, W, H, t, ch) {
  const ph = t < BEATS[0] ? 0 : t < BEATS[1] ? 1 : t < BEATS[2] ? 2 : 3, kind = MIX[ph][ch], u = (t * 0.45 + ch * 0.37) % 1;
  const grad = (a, b, y0 = 0, y1 = H) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); };
  const fig = (fx, fy, s, c) => { x.fillStyle = c; x.beginPath(); x.arc(fx, fy - s * 1.7, s * 0.32, 0, PI * 2); x.fill(); x.fillRect(fx - s * 0.28, fy - s * 1.35, s * 0.56, s * 0.8); x.fillRect(fx - s * 0.24, fy - s * 0.6, s * 0.18, s * 0.6); x.fillRect(fx + s * 0.06, fy - s * 0.6, s * 0.18, s * 0.6); };
  if (kind === 'moto') {
    grad('#1c1840', '#e0702c'); x.fillStyle = '#1a120c'; x.fillRect(0, H * 0.72, W, H); x.beginPath(); x.moveTo(W * 0.05, H * 0.72); x.lineTo(W * 0.3, H * 0.52); x.lineTo(W * 0.32, H * 0.72); x.fill();
    const bx = W * (0.3 + u * 0.6), by = H * (0.5 - Math.sin(u * PI) * 0.32); x.strokeStyle = '#08080a'; x.lineWidth = 4;
    x.beginPath(); x.arc(bx - 12, by, 8, 0, PI * 2); x.stroke(); x.beginPath(); x.arc(bx + 12, by - 4, 8, 0, PI * 2); x.stroke(); x.beginPath(); x.moveTo(bx - 12, by); x.lineTo(bx, by - 12); x.lineTo(bx + 12, by - 4); x.stroke(); fig(bx, by - 8, 9, '#08080a');
  } else if (kind === 'snow') {
    grad('#2459b0', '#cfe2ff'); x.fillStyle = '#eef3fb'; x.beginPath(); x.moveTo(0, H); x.lineTo(W * 0.35, H * 0.3); x.lineTo(W * 0.6, H * 0.55); x.lineTo(W * 0.8, H * 0.25); x.lineTo(W, H * 0.5); x.lineTo(W, H); x.fill();
    const rx = W * (0.1 + u * 0.8), ry = H * (0.75 - u * 0.3); x.fillStyle = 'rgba(255,255,255,0.8)'; for (let k = 0; k < 14; k++) x.fillRect(rx - k * 4, ry + hsh(k, ch) * 8, 3, 3); fig(rx, ry, 8, '#10131c');
  } else if (kind === 'race') {
    x.fillStyle = '#07080c'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a2c33'; x.beginPath(); x.moveTo(W * 0.42, H * 0.35); x.lineTo(W * 0.58, H * 0.35); x.lineTo(W, H); x.lineTo(0, H); x.fill();
    for (let k = 0; k < 6; k++) { const z = ((k / 6 + t * 1.4) % 1), y = H * (0.35 + z * z * 0.65); x.fillStyle = k % 2 ? '#d2202f' : '#e8eaee'; x.fillRect(W * (0.42 - z * 0.42) - 6, y, 8 + z * 10, 2 + z * 8); }
    const cx = W * (0.5 + Math.sin(t * 2 + ch) * 0.12); x.fillStyle = '#24357e'; x.fillRect(cx - 22, H * 0.66, 44, 16); x.fillStyle = '#ff3a2a'; x.fillRect(cx - 4, H * 0.7, 8, 4); x.fillStyle = '#ffc23d'; x.fillRect(cx - 26, H * 0.62, 52, 4);
  } else if (kind === 'air') {
    grad('#2c4e8c', '#ffb478'); x.fillStyle = '#5a2a18'; x.fillRect(0, 0, W * 0.18, H); x.fillRect(W * 0.82, 0, W * 0.18, H);
    const px = W * (0.15 + u * 0.7), py = H * (0.45 + Math.sin(u * 6) * 0.1); x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, py + 10); x.lineTo(px, py); x.stroke();
    x.fillStyle = '#e8ebf0'; x.fillRect(px - 14, py - 2, 28, 5); x.fillRect(px - 3, py - 12, 6, 24);
  } else if (kind === 'ridge') {
    grad('#120c24', '#f09050'); x.fillStyle = '#05060a'; x.beginPath(); x.moveTo(0, H); for (let k = 0; k <= 10; k++) x.lineTo((W * k) / 10, H * (0.55 + hsh(k, 3) * 0.25)); x.lineTo(W, H); x.fill(); fig(W * 0.5, H * 0.58, 10, '#05060a');
  } else if (kind === 'crowd' || kind === 'stage') {
    x.fillStyle = '#05040a'; x.fillRect(0, 0, W, H);
    if (kind === 'stage') for (let k = 0; k < 5; k++) { const bx = W * (0.15 + k * 0.175), sw = Math.sin(t * 2 + k) * 30; x.fillStyle = `rgba(${k % 2 ? '255,180,90' : '150,190,255'},0.35)`; x.beginPath(); x.moveTo(bx, 0); x.lineTo(bx + sw - 20, H); x.lineTo(bx + sw + 20, H); x.fill(); }
    else { const g = x.createRadialGradient(W / 2, H * 0.3, 4, W / 2, H * 0.3, W * 0.5); g.addColorStop(0, 'rgba(255,190,110,0.9)'); g.addColorStop(1, 'rgba(255,190,110,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    const f = Math.floor(t * 7); for (let k = 0; k < 160; k++) { const fx = hsh(k, 1) * W, fy = H * (0.55 + hsh(k, 2) * 0.45), on = hsh(k, f) > 0.55; x.fillStyle = on ? '#fff1d6' : '#3a3040'; x.fillRect(fx, fy, on ? 3 : 2, on ? 3 : 2); }
    x.fillStyle = '#000'; for (let k = 0; k < 14; k++) { const hx = (k + 0.5) * (W / 14), hy = H - 6 - Math.abs(Math.sin(t * 6 + k)) * 6; x.beginPath(); x.arc(hx, hy, 9, 0, PI * 2); x.fill(); }
  } else if (kind === 'team') {
    grad('#2a3040', '#0c0e14'); x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(0, H * 0.82, W, 2);
    for (let k = 0; k < 5; k++) { fig(W * (0.18 + k * 0.16), H * 0.86, 15 + (k === 2) * 3, k === 2 ? '#1b2a6b' : '#0a0c12'); x.fillStyle = '#ffc23d'; x.fillRect(W * (0.18 + k * 0.16) - 6, H * 0.86 - 15 * 1.2, 12, 3); }
    const sx = ((t * 40 + ch * 30) % (W + 60)) - 30; x.fillStyle = 'rgba(190,215,255,0.12)'; x.fillRect(sx, 0, 30, H);
  } else { // studio: camera on a tripod filming an athlete
    grad('#101420', '#05060a'); x.fillStyle = 'rgba(255,220,170,0.25)'; x.beginPath(); x.arc(W * 0.7, H * 0.3, 40, 0, PI * 2); x.fill(); fig(W * 0.7, H * 0.85, 16, '#1b2a6b');
    x.fillStyle = '#0a0b0e'; x.fillRect(W * 0.18, H * 0.45, 46, 26); x.fillRect(W * 0.18 + 46, H * 0.49, 14, 16); x.strokeStyle = '#0a0b0e'; x.lineWidth = 3; x.beginPath(); x.moveTo(W * 0.27, H * 0.62); x.lineTo(W * 0.2, H); x.moveTo(W * 0.27, H * 0.62); x.lineTo(W * 0.34, H); x.stroke();
  }
  // broadcast overlay: brackets, LIVE, timecode, camera id
  x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 2; const m = 8, l = 14;
  for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { x.beginPath(); x.moveTo(cx + sx * l, cy); x.lineTo(cx, cy); x.lineTo(cx, cy + sy * l); x.stroke(); }
  if (Math.floor(t * 2 + ch * 0.5) % 2 === 0) { x.fillStyle = '#ff2a2a'; x.beginPath(); x.arc(20, 22, 5, 0, PI * 2); x.fill(); }
  x.font = '600 12px Inter, sans-serif'; x.fillStyle = '#ffffff'; x.fillText(ph === 3 && ch % 2 ? 'REC' : 'LIVE', 30, 26); x.fillText('CAM 0' + (ch + 1), W - 62, 26);
  const T = 43.2 + t, ff = Math.floor((T % 1) * 30), ss = Math.floor(T) % 60, mm = Math.floor(T / 60) + ch * 7;
  x.font = '12px monospace'; x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillText(`00:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, 14, H - 14);
}

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020308);
  scene.environment = K.envMap(renderer);
  scene.fog = new THREE.Fog(0x04060e, 12, 80);
  const cam = K.camera(42); scene.add(cam);
  const rig = K.lightRig(scene, { keyI: 1.2, rimI: 4, fill: 0.08 });
  const SW = 1.6, SH = 0.9;

  // eight live feeds; every screen in the scene shares one of these canvases
  const feeds = Array.from({ length: 8 }, (_, ch) => { const m = K.screen(scene, SW, SH, (x, W, H, t) => paintFeed(x, W, H, t, ch), { res: 256 }); scene.remove(m); m.material.fog = true; return m; });

  // ---------- control room ----------
  const room = new THREE.Group(); scene.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x06070a, roughness: 0.15, metalness: 0.7 })); floor.rotation.x = -PI / 2; room.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.8 })); ceil.rotation.x = PI / 2; ceil.position.y = 11; room.add(ceil);
  const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xbcd7ff).multiplyScalar(1.6) });
  for (const sx of [-4.5, -1.5, 1.5, 4.5]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 30), stripMat); s.position.set(sx, 10.95, -2); room.add(s); }
  const wallScreens = [], frameMat = new THREE.MeshStandardMaterial({ color: 0x0b0c10, metalness: 0.8, roughness: 0.3 });
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), frameMat); backing.position.set(0, 5, WALL_Z - 0.6); room.add(backing);
  for (let c = -3; c <= 3; c++) for (let r = 0; r < 9; r++) {
    if (c === 0 && r === 4) continue; // the screen we fly into is a hole into the tunnel
    const a = c * 0.115, mat = feeds[((c + 3) * 3 + r * 5) % 8].material.clone();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), mat); m.position.set(Math.sin(a) * 16, 0.5 + r + 0.45, WALL_Z + 16 * (1 - Math.cos(a))); m.rotation.y = -a; room.add(m);
    wallScreens.push({ m, d: Math.hypot(c, (r - 4) * 0.8) });
  }
  const consoleMat = new THREE.MeshStandardMaterial({ color: 0x101217, metalness: 0.75, roughness: 0.32 }), glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x4a7dff).multiplyScalar(1.2) });
  const operators = [];
  [[-6.5, 9], [-3.5, 7], [-0.5, 5]].forEach(([z, w], row) => {
    const d = new THREE.Mesh(new THREE.BoxGeometry(w, 0.85, 1.1), consoleMat); d.position.set(0, 0.42, z); room.add(d);
    const e = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, 0.03), glowMat); e.position.set(0, 0.86, z - 0.56); room.add(e);
    for (let k = 0; k < Math.floor(w / 1.4); k++) { const x = -w / 2 + 0.7 + k * 1.4;
      const mon = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.35), feeds[(k + row * 3) % 8].material); mon.position.set(x, 1.12, z - 0.3); mon.rotation.x = -0.15; room.add(mon);
      if ((k + row) % 2 === 0) { const f = K.figure({ color: 0x07080b }); f.scale.setScalar(0.82); f.position.set(x + 0.2, -0.28, z + 0.75); room.add(f); operators.push(f); } }
  });
  const wash = new THREE.PointLight(0x7aa0ff, 40, 30, 2); wash.position.set(0, 5, WALL_Z + 4); room.add(wash);
  const motes = K.dust(scene, { count: 700, area: [14, 10, 24], color: 0xbcd7ff, size: 0.025, speed: 0.06, seed: 13, opacity: 0.45 }); motes.position.set(0, 5, -2);

  // ---------- tunnel of screens + the vast wall ----------
  const geo = new THREE.PlaneGeometry(SW, SH), dummy = new THREE.Object3D();
  const tunnel = new THREE.Group(); tunnel.position.set(0, CY, 0); scene.add(tunnel);
  const inst = feeds.map((f) => ({ list: [], mat: f.material }));
  const RINGS = 41, PER = 12;
  for (let i = 0; i < RINGS; i++) for (let j = 0; j < PER; j++) { const a = (j / PER) * PI * 2 + (i % 2) * (PI / PER), z = WALL_Z - 1.5 - i * 2.2;
    inst[(i * 5 + j * 3) % 8].list.push({ p: [Math.cos(a) * 3.1, Math.sin(a) * 4.8, z], z, wall: false }); }
  const VW = 36, VH = 58, VZ = -168;
  for (let c = 0; c < VW; c++) for (let r = 0; r < VH; r++) { const x = (c - VW / 2 + 0.5) * 1.75, y = (r - VH / 2 + 0.5) * 1.0;
    inst[(c * 3 + r * 7) % 8].list.push({ p: [x, y, VZ], z: VZ, wall: true, d: Math.hypot(x, y) }); }
  const vast = new THREE.Group(); vast.position.y = CY; scene.add(vast);
  const meshes = inst.flatMap(({ list: all, mat }) => [false, true].map((isWall) => { const list = all.filter((q) => q.wall === isWall), im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((s, k) => { dummy.position.set(...s.p); if (s.wall) dummy.rotation.set(0, 0, 0); else dummy.lookAt(0, 0, s.z); dummy.updateMatrix(); im.setMatrixAt(k, dummy.matrix); im.setColorAt(k, new THREE.Color(1, 1, 1)); });
    (isWall ? vast : tunnel).add(im); return { im, list }; }));
  const ribs = new THREE.Group(); tunnel.add(ribs); const ribMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9fc4ff).multiplyScalar(1.4), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < RINGS; i += 3) { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 4, 64), ribMat); r.scale.set(3.9, 5.7, 1); r.position.z = WALL_Z - 1.5 - i * 2.2 - 1.1; ribs.add(r); }
  const speed = K.streaks(scene, { count: 160, len: 5, area: [7, 10, 60], color: 0xbcd7ff, seed: 6, opacity: 0.4 }); scene.remove(speed); cam.add(speed);
  const col = new THREE.Color();

  function render(t) {
    for (const f of feeds) f.userData.paint(t);
    const inRoom = t < 3.62;
    // camera: slow push over the operators, accelerating dive into the centre screen, then down the tunnel
    const x = K.seg(t, 0, 3.6), s = K.seg(t, 3.6, 9.8);
    const z = t < 3.6 ? 9 - 22.5 * (0.35 * x + 0.65 * x * x * x) : WALL_Z + 0.5 - 92 * (1 - Math.pow(1 - s, 2.2));
    const hx = Math.sin(t * 1.3) * 0.03 + Math.sin(t * 3.7) * 0.012, hy = Math.sin(t * 1.7 + 1) * 0.025;
    const y = t < 3.6 ? K.lerp(2.3, CY, K.eio(x)) : CY;
    cam.position.set(K.lerp(0.7, 0, K.eio(x)) + hx, y + hy, z);
    cam.lookAt(K.lerp(0.3, 0, x) + hx * 0.5, K.lerp(4.2, CY, x) + hy, z - 20);
    cam.fov = K.lerp(42, 54, K.eio(K.seg(t, 2.6, 4.4))) - 4 * K.eio(K.seg(t, 7.8, 9.8)); cam.updateProjectionMatrix();
    cam.rotateZ(t > 3.6 ? Math.sin(s * PI) * 0.06 : 0);

    room.visible = inRoom; motes.visible = inRoom; motes.userData.update(t, [0.05, 0.2, 0]);
    // wall lights up from the centre outward on the first line
    wallScreens.forEach(({ m, d }) => { const on = K.seg(t, 0.15 + d * 0.12, 0.45 + d * 0.12); m.material.color.setScalar(0.08 + 0.82 * on); });
    operators.forEach((o, k) => { o.rotation.y = Math.sin(t * 0.8 + k) * 0.08; });
    wash.intensity = 40 * K.seg(t, 0.2, 1.2);
    rig.children[1].intensity = 4;

    // tunnel + vast wall: brightness waves on the beat words, the wall goes live from its centre at "contenido"
    tunnel.rotation.z = K.eio(s) * 0.3; ribs.visible = t > 3.3;
    scene.fog.near = K.lerp(12, 30, K.seg(t, 7.2, 9)); scene.fog.far = K.lerp(80, 240, K.seg(t, 6.0, 8.0));
    for (const { im, list } of meshes) { list.forEach((q, k) => {
      let b;
      if (q.wall) b = 0.35 + 0.65 * K.eo(K.seg(t - BEATS[2], q.d * 0.018, q.d * 0.018 + 0.35));
      else { b = 0.72; for (const bt of BEATS) if (t > bt) { const front = cam.position.z - (t - bt) * 40; b += 0.9 * Math.exp(-Math.pow((q.z - front) / 3, 2)); } }
      im.setColorAt(k, col.setScalar(b)); }); im.instanceColor.needsUpdate = true; }
    speed.visible = t > 3.6; speed.material.opacity = 0.4 * K.seg(t, 3.6, 4.2) * (1 - K.seg(t, 7.6, 8.6)); speed.userData.update(t, 50);
  }
  render(0);
  return { scene, camera: cam, render };
}
