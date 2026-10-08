// Scene 3 — Strategy. A dim, cold war room: a wall crammed with ads, billboards, charts and clippings, a
// businessman silhouette studying it ("Pero Dietrich Mateschitz entendió algo.", local 0.3–2.87).
// From 3.6 ("No necesitaba gastar todo su dinero…") the ads are torn off one by one and flutter to the floor,
// the light turns from cold to warm, and he pins one single image: an athlete mid-air (≈8.0).
import * as THREE from 'three';
import * as K from '../assets/kit.js';

const T_PULL = 3.7, T_PULL_END = 7.3, T_PIN = 7.95;
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

// ---------- 4×4 atlas of archetype ad material (no logos, no wordmarks — bars stand in for copy) ----------
function atlas() {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'), r = K.rng(41);
  const copy = (x0, y0, w, n, col, h = 7) => { x.fillStyle = col; for (let i = 0; i < n; i++) x.fillRect(x0, y0 + i * (h + 6), w * (0.55 + r() * 0.45), h); };
  const bottle = (cx, by, s, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(cx - 8 * s, by - 120 * s); x.lineTo(cx + 8 * s, by - 120 * s); x.lineTo(cx + 9 * s, by - 90 * s);
    x.bezierCurveTo(cx + 26 * s, by - 70 * s, cx + 18 * s, by - 40 * s, cx + 24 * s, by - 20 * s); x.lineTo(cx + 22 * s, by); x.lineTo(cx - 22 * s, by); x.lineTo(cx - 24 * s, by - 20 * s);
    x.bezierCurveTo(cx - 18 * s, by - 40 * s, cx - 26 * s, by - 70 * s, cx - 9 * s, by - 90 * s); x.closePath(); x.fill(); };
  const can = (cx, by, s, col) => { x.fillStyle = col; x.fillRect(cx - 24 * s, by - 90 * s, 48 * s, 90 * s); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(cx - 14 * s, by - 88 * s, 6 * s, 86 * s); };
  const tiles = [
    () => { x.fillStyle = '#b8121d'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#fff'; x.lineWidth = 10; x.beginPath(); x.moveTo(0, 190); x.bezierCurveTo(80, 150, 170, 230, 256, 170); x.stroke(); bottle(128, 230, 1.5, '#2a0f0b'); copy(20, 20, 120, 2, '#fff', 12); },
    () => { x.fillStyle = '#123d9c'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(255,255,255,${0.05 + i * 0.01})`; x.beginPath(); x.moveTo(128, 120); x.arc(128, 120, 200, i * 0.45, i * 0.45 + 0.2); x.fill(); } can(128, 220, 1.4, '#c9d3ea'); copy(20, 20, 150, 2, '#fff', 12); },
    () => { x.fillStyle = '#e9e4d8'; x.fillRect(0, 0, 256, 256); copy(20, 18, 160, 1, '#333', 10); for (let i = 0; i < 6; i++) { const h = 30 + r() * 150; x.fillStyle = i === 2 ? '#c4202c' : '#3b4a66'; x.fillRect(30 + i * 34, 230 - h, 24, h); } x.fillStyle = '#333'; x.fillRect(22, 230, 215, 2); },
    () => { x.fillStyle = '#f1efe8'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#c9d6e6'; x.lineWidth = 1; for (let i = 0; i < 256; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); }
      x.strokeStyle = '#1b3f8f'; x.lineWidth = 5; x.beginPath(); x.moveTo(20, 220); for (let i = 1; i <= 10; i++) x.lineTo(20 + i * 22, 220 - i * 16 + (r() - 0.5) * 30); x.stroke(); copy(20, 18, 140, 1, '#333', 10); },
    () => { x.fillStyle = '#e6e2d6'; x.fillRect(0, 0, 256, 256); let a = -1.5; [['#c4202c', 0.42], ['#1b3f8f', 0.28], ['#2f8a3a', 0.18], ['#9aa3b2', 0.12]].forEach(([col, f]) => { x.fillStyle = col; x.beginPath(); x.moveTo(128, 140); x.arc(128, 140, 90, a, a + f * 6.283); x.fill(); a += f * 6.283; }); copy(20, 16, 120, 1, '#333', 10); },
    () => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#f6a24a'); g.addColorStop(0.55, '#e5523a'); g.addColorStop(0.56, '#20556e'); g.addColorStop(1, '#0d2a3a'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      x.fillStyle = '#ffe2a0'; x.beginPath(); x.arc(70, 130, 26, 0, 7); x.fill(); bottle(180, 240, 1.4, '#3a0d0d'); copy(16, 18, 140, 2, '#fff', 12); },
    () => { x.fillStyle = '#d9d5c8'; x.fillRect(0, 0, 256, 256); copy(14, 14, 228, 2, '#222', 14); x.fillStyle = '#6d6a62'; x.fillRect(14, 60, 120, 96); x.fillStyle = '#2b2a27'; x.beginPath(); x.arc(74, 92, 12, 0, 7); x.fill(); x.fillRect(64, 104, 20, 40);
      copy(144, 62, 98, 9, '#444', 5); copy(14, 168, 228, 7, '#444', 5); },
    () => { x.fillStyle = '#2f9a3c'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#e8f56a'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(40 + r() * 180, 40 + r() * 120, 8 + r() * 14, 0, 7); x.fill(); } bottle(128, 235, 1.4, '#cfeec0'); copy(20, 20, 130, 2, '#fff', 12); },
    () => { x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#333'; x.lineWidth = 2; for (let i = 0; i < 6; i++) { const cx = 14 + (i % 3) * 80, cy = 30 + Math.floor(i / 3) * 110; x.strokeRect(cx, cy, 70, 52); x.beginPath(); x.arc(cx + 35, cy + 30, 10 + r() * 8, 0, 7); x.stroke(); copy(cx, cy + 60, 60, 2, '#666', 5); } },
    () => { x.fillStyle = '#e9e6dd'; x.fillRect(0, 0, 256, 256); copy(16, 16, 150, 1, '#222', 12); for (let i = 0; i < 8; i++) { x.fillStyle = '#bbb'; x.fillRect(16, 50 + i * 24, 60, 10); x.fillStyle = ['#c4202c', '#1b3f8f', '#2f8a3a'][i % 3]; x.fillRect(86, 48 + i * 24, 30 + r() * 130, 14); } },
    () => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#203048'); g.addColorStop(1, '#4a5a3a'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); x.fillStyle = '#d9d5c8'; x.fillRect(0, 200, 256, 56);
      for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,240,200,${0.3 + r() * 0.6})`; x.fillRect(r() * 256, 40 + r() * 60, 3, 3); } copy(12, 210, 230, 3, '#333', 6); },
    () => { x.fillStyle = '#f7d21e'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#c4121e'; x.font = 'bold 110px Arial'; x.textAlign = 'center'; x.fillText('%', 128, 150); copy(30, 190, 196, 3, '#222', 10); },
    () => { x.fillStyle = '#f4e27a'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#3a3320'; x.lineWidth = 4; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(24, 50 + i * 32); for (let k = 0; k < 8; k++) x.lineTo(24 + k * 26, 50 + i * 32 + (r() - 0.5) * 12); x.stroke(); } },
    () => { x.fillStyle = '#efece4'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#2b2620'; x.fillRect(16, 16, 224, 180); for (let s = 0; s < 3; s++) { x.fillStyle = '#6b5a44'; x.fillRect(16, 70 + s * 60, 224, 6); for (let i = 0; i < 9; i++) { x.fillStyle = ['#b8121d', '#3a0d0d', '#2f9a3c'][(i + s) % 3]; x.fillRect(22 + i * 24, 30 + s * 60, 16, 40); } } },
    () => { x.fillStyle = '#07080b'; x.fillRect(0, 0, 256, 256); const g = x.createRadialGradient(128, 110, 4, 128, 110, 130); g.addColorStop(0, 'rgba(255,220,180,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); bottle(128, 220, 1.5, '#5a1a12'); copy(40, 232, 176, 1, '#ddd', 8); },
    () => { x.fillStyle = '#e9e6dd'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#999'; x.beginPath(); x.moveTo(30, 20); x.lineTo(30, 226); x.lineTo(236, 226); x.stroke(); for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.2 ? '#c4202c' : '#1b3f8f'; x.beginPath(); x.arc(40 + r() * 190, 30 + r() * 190, 3 + r() * 5, 0, 7); x.fill(); } },
  ];
  tiles.forEach((f, i) => { x.save(); x.translate((i % 4) * 256, Math.floor(i / 4) * 256); x.beginPath(); x.rect(0, 0, 256, 256); x.clip(); f(); x.restore(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ---------- the one image that stays: an athlete mid-air at sunset ----------
function heroImage() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 640; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, '#1d3a6e'); g.addColorStop(0.45, '#f0904a'); g.addColorStop(0.62, '#ffd27a'); g.addColorStop(1, '#3a1a10'); x.fillStyle = g; x.fillRect(0, 0, 512, 640);
  const s = x.createRadialGradient(300, 400, 10, 300, 400, 170); s.addColorStop(0, 'rgba(255,248,220,1)'); s.addColorStop(0.3, 'rgba(255,220,150,.6)'); s.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = s; x.fillRect(0, 0, 512, 640);
  x.fillStyle = '#140b08'; x.beginPath(); x.moveTo(0, 640); x.lineTo(0, 470); x.lineTo(90, 430); x.lineTo(170, 500); x.lineTo(250, 455); x.lineTo(512, 540); x.lineTo(512, 640); x.fill(); // ramp ridge
  x.save(); x.translate(250, 250); x.rotate(-0.35); x.fillStyle = '#100808'; // rider + bike, mid-air
  x.lineWidth = 9; x.strokeStyle = '#100808'; for (const wx of [-70, 70]) { x.beginPath(); x.arc(wx, 40, 34, 0, 7); x.stroke(); }
  x.lineWidth = 11; x.beginPath(); x.moveTo(-70, 40); x.lineTo(-10, 0); x.lineTo(50, 6); x.lineTo(70, 40); x.moveTo(50, 6); x.lineTo(40, -30); x.stroke();
  x.beginPath(); x.ellipse(-5, -40, 16, 34, -0.6, 0, 7); x.fill(); x.beginPath(); x.arc(12, -82, 15, 0, 7); x.fill();
  x.lineWidth = 9; x.beginPath(); x.moveTo(5, -55); x.lineTo(38, -32); x.moveTo(-18, -12); x.lineTo(-30, 10); x.lineTo(-10, 20); x.stroke(); x.restore();
  x.strokeStyle = 'rgba(255,240,210,.35)'; x.lineWidth = 2; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(110 - i * 6, 330 + i * 12); x.lineTo(30 - i * 6, 365 + i * 12); x.stroke(); }
  x.strokeStyle = '#f4efe4'; x.lineWidth = 22; x.strokeRect(0, 0, 512, 640); // print border
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020306);
  scene.environment = K.envMap(renderer);
  scene.fog = new THREE.FogExp2(0x070b14, 0.07);
  const cam = K.camera(46);
  const rig = K.lightRig(scene, { keyI: 0.5, rimI: 1.2, fill: 0.06 });

  // ---------- room ----------
  const concrete = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.92, metalness: 0 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), concrete); wall.position.set(0, 3.2, -0.02); scene.add(wall);
  const cork = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.3, 0.04), new THREE.MeshStandardMaterial({ color: 0x3a3128, roughness: 1 })); cork.position.set(0, 2.55, 0); scene.add(cork);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x15171c, metalness: 0.8, roughness: 0.35 });
  for (const [w, h, px, py] of [[3.72, 0.06, 0, 4.72], [3.72, 0.06, 0, 0.38], [0.06, 4.4, -1.83, 2.55], [0.06, 4.4, 1.83, 2.55]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), frameMat); b.position.set(px, py, 0.02); scene.add(b); }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshPhysicalMaterial({ color: 0x0b0c10, roughness: 0.32, metalness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = 5; scene.add(floor);
  // long table in the foreground edge with a dim lamp
  const table = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 0.9), new THREE.MeshStandardMaterial({ color: 0x101115, roughness: 0.4, metalness: 0.4 })); table.position.set(1.7, 0.92, 3.4); scene.add(table);
  for (const [lx, lz] of [[0.5, 3.0], [2.9, 3.0], [0.5, 3.8], [2.9, 3.8]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.05), frameMat); l.position.set(lx, 0.45, lz); scene.add(l); }
  const papers = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.36), new THREE.MeshStandardMaterial({ color: 0xbfc4cc, roughness: 0.9 })); papers.position.set(1.4, 0.96, 3.3); papers.rotation.y = 0.3; scene.add(papers);

  // overhead practical: a long cold fluorescent bar that warms up
  const tube = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 0.06), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })); tube.position.set(0, 5.4, 1.4); scene.add(tube);
  const spot = new THREE.SpotLight(0xffffff, 0, 14, 0.55, 0.65, 1.4); spot.position.set(0, 5.6, 3.2); spot.target.position.set(0, 2.5, 0); scene.add(spot, spot.target);
  const heroSpot = new THREE.SpotLight(0xffb36a, 0, 10, 0.2, 0.5, 1.2); heroSpot.position.set(0.4, 5.2, 3.0); heroSpot.target.position.set(0, 2.55, 0); scene.add(heroSpot, heroSpot.target);
  const wallBounce = new THREE.PointLight(0x9fbaff, 0, 7, 1.6); wallBounce.position.set(0, 2.4, 1.4); scene.add(wallBounce);
  const rimL = new THREE.PointLight(0x9fbaff, 0, 6, 1.5); rimL.position.set(-1.6, 2.4, 1.2); scene.add(rimL);

  // ---------- the wall of advertising ----------
  const tex = atlas(), r = K.rng(17);
  const cards = [], pinGeo = new THREE.SphereGeometry(0.018, 10, 8);
  const pinMats = [new THREE.MeshStandardMaterial({ color: 0xc4202c, roughness: 0.3, metalness: 0.2 }), new THREE.MeshStandardMaterial({ color: 0xdfe3ea, roughness: 0.2, metalness: 0.9 })];
  const COLS = 5, ROWS = 8;
  for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
    const big = r() < 0.18, w = big ? 0.9 + r() * 0.2 : 0.52 + r() * 0.16, h = w * (big ? 0.68 : 0.8 + r() * 0.5), tile = Math.floor(r() * 16);
    const geo = new THREE.PlaneGeometry(w, h).translate(0, -h / 2, 0), uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, ((tile % 4) + uv.getX(i)) / 4, 1 - (Math.floor(tile / 4) + 1 - uv.getY(i)) / 4);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0, side: THREE.DoubleSide, transparent: true }));
    const g = new THREE.Group(); g.add(mesh);
    const pin = new THREE.Mesh(pinGeo, pinMats[r() < 0.7 ? 0 : 1]); pin.position.set(0, -0.03, 0.015); g.add(pin);
    const x0 = -1.42 + col * 0.71 + (r() - 0.5) * 0.24, y0 = 4.62 - row * 0.52 + (r() - 0.5) * 0.12 + h * 0.12;
    const home = new THREE.Vector3(x0, Math.min(4.66, y0 + h * 0.4), 0.03 + (row * COLS + col) * 0.0009 + (big ? 0.012 : 0));
    g.position.copy(home); g.rotation.z = (r() - 0.5) * 0.12; scene.add(g);
    cards.push({ g, mesh, home, rz: g.rotation.z, h, spin: (r() - 0.5) * 6, drift: (r() - 0.5) * 1.4, out: 0.7 + r() * 0.6, land: [(r() - 0.5) * 3.0, 0.3 + r() * 1.3], order: r() });
  }
  // tear order: shuffled, slow at first then a cascade (gap ≈ 0.4 s → 0.03 s)
  [...cards].sort((a, b) => a.order - b.order).forEach((c, k, all) => { c.tp = K.lerp(T_PULL, T_PULL_END, Math.pow(k / (all.length - 1), 0.55)); });

  // red strings connecting pins (strategy-board look) — vanish as their cards leave
  const pairs = []; for (let i = 0; i < cards.length; i++) { const j = Math.floor(r() * cards.length); if (j !== i && r() < 0.6) pairs.push([cards[i], cards[j]]); }
  const sPos = new Float32Array(pairs.length * 6), sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const strings = new THREE.LineSegments(sGeo, new THREE.LineBasicMaterial({ color: 0xb01822, transparent: true, opacity: 0.75 })); scene.add(strings);

  // ---------- the businessman ----------
  const man = K.figure({ color: 0x07080b }); man.scale.setScalar(1.02); scene.add(man);
  const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.95, 16), man.children[0].material); coat.position.y = 0.98; man.add(coat); // long coat silhouette
  const armR = man.children[3], up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();

  // ---------- the hero image ----------
  const heroTex = heroImage();
  const hero = new THREE.Group(); scene.add(hero);
  const heroMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.25).translate(0, -0.625, 0), new THREE.MeshStandardMaterial({ map: heroTex, emissive: 0xffffff, emissiveMap: heroTex, emissiveIntensity: 0, roughness: 0.6, side: THREE.DoubleSide }));
  hero.add(heroMesh); const heroPin = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), pinMats[0]); heroPin.position.set(0, -0.04, 0.02); hero.add(heroPin);
  const glowC = document.createElement('canvas'); glowC.width = glowC.height = 128; const gx = glowC.getContext('2d'), gg = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gg.addColorStop(0, 'rgba(255,255,255,1)'); gg.addColorStop(0.4, 'rgba(255,255,255,.25)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), color: hdr(0xffa050, 1), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  halo.position.set(0, 2.55, -0.01); scene.add(halo);

  const motes = K.dust(scene, { count: 700, area: [5, 5.5, 4], color: 0xdfe6ff, size: 0.012, speed: 0.06, seed: 23, opacity: 0.5 }); motes.position.set(0, 2.8, 2);

  const cold = { key: new THREE.Color(0x9fbaff), fog: new THREE.Color(0x070b14), tube: hdr(0xcfe0ff, 2.2), bg: new THREE.Color(0x020306) };
  const warm = { key: new THREE.Color(0xffb070), fog: new THREE.Color(0x140c07), tube: hdr(0xffc890, 2.4), bg: new THREE.Color(0x070402) };
  const tgt = new THREE.Vector3(), tmp = new THREE.Vector3();

  function render(t) {
    const w = K.eio(K.seg(t, 3.6, 8.4)); // cold → warm through the second line
    const hand = (k) => Math.sin(t * 1.1 + k) * 0.6 + Math.sin(t * 2.3 + k * 2.1) * 0.3 + Math.sin(t * 4.7 + k * 3.7) * 0.1;

    // ---- light grade
    const flick = t < 0.6 ? (Math.sin(t * 90) > 0.2 ? 1 : 0.35) : 1; // fluorescent strike-up
    scene.fog.color.copy(cold.fog).lerp(warm.fog, w); scene.background.copy(cold.bg).lerp(warm.bg, w);
    tube.material.color.copy(cold.tube).lerp(warm.tube, w).multiplyScalar(flick);
    spot.color.copy(cold.key).lerp(warm.key, w); spot.intensity = 7 * flick * K.lerp(1, 0.75, w);
    wallBounce.color.copy(spot.color); wallBounce.intensity = 0.5 * flick;
    rimL.color.copy(cold.key).lerp(new THREE.Color(0xff8a3a), w); rimL.intensity = 1.5 + 1.5 * w;
    rig.children[0].color.copy(cold.key).lerp(warm.key, w); rig.children[1].intensity = 1.2 + 3 * w;
    scene.environmentIntensity = K.lerp(0.1, 0.16, w);
    const pin = K.seg(t, T_PIN, T_PIN + 0.5);
    heroSpot.intensity = 9 * K.eo(K.seg(t, T_PIN - 0.2, T_PIN + 0.9));

    // ---- cards: peel from the top pin, swing out, flutter down, land on the floor
    for (const c of cards) {
      const dt = t - c.tp; c.g.visible = true;
      if (dt <= 0) { c.g.position.copy(c.home); c.g.rotation.set(0, 0, c.rz); continue; }
      const peel = K.eo(K.seg(dt, 0, 0.22)), f = Math.max(0, dt - 0.18), fall = K.cl(f / 1.1);
      const yAir = c.home.y + 0.12 * peel - 4.9 * f * f * 0.55;
      const landed = yAir <= 0.02;
      c.g.position.set(K.lerp(c.home.x, c.land[0], K.eo(fall)) + Math.sin(f * 5 + c.spin) * 0.12 * (1 - fall), Math.max(0.012, yAir), c.home.z + 0.3 * peel + K.lerp(0, c.land[1], K.eo(fall)) * c.out);
      if (landed) c.g.rotation.set(-Math.PI / 2, 0, c.rz + c.spin * 0.6);
      else c.g.rotation.set(-1.1 * peel - K.lerp(0, 0.5, fall) + Math.sin(f * 9 + c.spin) * 0.6 * fall, c.drift * f, c.rz + c.spin * f * 0.6);
    }
    pairs.forEach(([a, b], i) => { const on = t < Math.min(a.tp, b.tp);
      if (on) { sPos.set([a.home.x, a.home.y - 0.03, a.home.z + 0.02, b.home.x, b.home.y - 0.03, b.home.z + 0.02], i * 6); } else sPos.fill(0, i * 6, i * 6 + 6); });
    sGeo.attributes.position.needsUpdate = true; strings.visible = t < T_PULL_END;

    // ---- the man: studies the wall, tilts his head; walks in to pin the image, steps back
    const walkIn = K.eio(K.seg(t, T_PIN - 1.0, T_PIN - 0.15)), back = K.eio(K.seg(t, T_PIN + 0.55, 9.6));
    const mz = K.lerp(K.lerp(2.0, 0.62, walkIn), 1.1, back), mx = K.lerp(K.lerp(-0.45, -0.2, walkIn), -0.95, back);
    const step = Math.sin(K.seg(t, T_PIN - 1.0, T_PIN - 0.15) * Math.PI * 3) * 0.02 * (walkIn > 0 && walkIn < 1);
    man.position.set(mx, step, mz); man.rotation.set(0, Math.PI + Math.sin(t * 0.4) * 0.05, 0);
    man.children[1].position.set(Math.sin(t * 0.6) * 0.015 + (t > 1.4 && t < 3 ? 0.02 : 0), 1.72, 0);
    const reach = K.eo(K.seg(t, T_PIN - 0.45, T_PIN)) * (1 - K.eio(K.seg(t, T_PIN + 0.35, T_PIN + 0.8)));
    const b = K.lerp(0.15, 2.5, reach); dir.set(0.12, -Math.cos(b), Math.sin(b)).normalize(); // man faces -z after the PI turn → local +z is toward the wall
    armR.quaternion.setFromUnitVectors(up, dir.clone().negate()); armR.position.set(0.27, 1.5, 0).addScaledVector(dir, 0.28);

    // ---- hero image: carried in, pressed onto the empty board, starts to glow
    const carry = K.eo(K.seg(t, T_PIN - 0.45, T_PIN));
    hero.visible = t > T_PIN - 0.45;
    hero.position.set(K.lerp(0.25, 0, carry), K.lerp(2.2, 3.18, carry), K.lerp(0.75, 0.035, carry)); hero.rotation.set(0, 0, K.lerp(-0.25, -0.03, carry) + Math.sin(pin * 12) * 0.03 * (1 - pin));
    heroPin.scale.setScalar(t > T_PIN ? 1 : 0.001);
    heroMesh.material.emissiveIntensity = 0.05 + 0.22 * K.eo(K.seg(t, T_PIN, T_PIN + 1.2));
    halo.visible = t > T_PIN; halo.position.set(0, 2.55, -0.01); halo.scale.set(K.lerp(0.5, 3.4, K.eo(pin)), K.lerp(0.5, 3.8, K.eo(pin)), 1); halo.material.opacity = 0.3 * K.eo(pin);

    // ---- camera: slow dolly behind him (cold), lateral drift while the wall empties, push-in on the image
    const a = K.eio(K.seg(t, 0, 3.6)), m = K.eio(K.seg(t, 3.6, 7.6)), p = K.eio(K.seg(t, 7.8, 9.7));
    tmp.set(-1.1, 1.75, 7.0).lerp(tgt.set(-0.55, 1.55, 6.0), a);
    tmp.lerp(tgt.set(0.85, 1.8, 6.3), m); tmp.lerp(tgt.set(0.1, 2.3, 4.1), p);
    cam.position.copy(tmp).add(tgt.set(hand(0) * 0.025, hand(1) * 0.02, 0));
    tgt.set(K.lerp(-0.15, 0.1, m), K.lerp(2.35, 2.25, m), 0).lerp(tmp.set(0, 2.55, 0), p);
    cam.lookAt(tgt); cam.rotation.z += hand(2) * 0.004;
    cam.fov = K.lerp(46, 40, p); cam.updateProjectionMatrix();

    motes.userData.update(t, [0.04, 0.12, 0]);
  }
  render(0);
  return { scene, camera: cam, render };
}
