// Scene 2 — Competition. A dark 1980s supermarket aisle of towering giant soft drinks (red cola cans, dark cola
// bottles, green lemon-lime bottles). One small two-tone can sits squeezed between giants; slow push toward it.
// Narration (local): 0.1–6.62 "Cuando Red Bull llegó a Europa en los años ochenta, competir contra Coca-Cola y Pepsi parecía una locura."
import * as THREE from 'three';
import * as K from '../assets/kit.js';

const T_APPEAR = 0.5, T_GIANTS = 3.4; // hero picked out by light; giants flare up on "Coca-Cola y Pepsi"
const LEVELS = [[0, 'green'], [7.5, 'can'], [15, 'dark'], [22.5, 'can'], [28.5, 'green'], [36, 'dark']]; // plank tops
const HERO_Y = 7.5, TOP = 43.5;
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

// Lathe with v = height fraction so labels can be drawn by height.
function lathe(prof, seg = 24) {
  const H = prof[prof.length - 1][1], g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < p.count; i++) uv.setY(i, p.getY(i) / H);
  return g;
}
// Vertical label texture: bands = [[v0, v1, css], ...] drawn bottom-up.
function bandTex(bands) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d');
  for (const [a, b, col] of bands) { x.fillStyle = col; x.fillRect(0, (1 - b) * 512, 64, (b - a) * 512); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const PRODUCTS = {
  can: { step: 2.1, geo: () => lathe([[0, 0], [0.82, 0], [0.94, 0.12], [0.96, 0.32], [0.96, 4.4], [0.86, 4.8], [0.8, 5.0], [0.82, 5.08], [0, 5.08]]),
    mat: () => new THREE.MeshPhysicalMaterial({ metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.55,
      map: bandTex([[0, 1, '#b8121c'], [0, 0.065, '#c7cad1'], [0.86, 1, '#c7cad1'], [0.17, 0.19, '#f3f3f3'], [0.77, 0.79, '#f3f3f3'], [0.3, 0.66, '#cc1a24']]) }) },
  dark: { step: 1.85, geo: () => lathe([[0, 0], [0.7, 0], [0.85, 0.15], [0.86, 3.6], [0.75, 4.3], [0.45, 5.0], [0.32, 5.6], [0.33, 6.1], [0.38, 6.2], [0.36, 6.4], [0, 6.4]]),
    mat: () => new THREE.MeshPhysicalMaterial({ metalness: 0.1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 0.8,
      map: bandTex([[0, 1, '#1d0d07'], [0.27, 0.5, '#a8111a'], [0.3, 0.31, '#f0e8dc'], [0.46, 0.47, '#f0e8dc'], [0.965, 1, '#b3141c']]) }) },
  green: { step: 1.7, geo: () => lathe([[0, 0], [0.66, 0], [0.78, 0.18], [0.78, 4.0], [0.6, 4.8], [0.32, 5.6], [0.28, 6.2], [0.33, 6.3], [0.31, 6.6], [0, 6.6]]),
    mat: () => new THREE.MeshPhysicalMaterial({ metalness: 0.05, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 0.7, emissive: 0x03140a,
      map: bandTex([[0, 1, '#2b8a3e'], [0, 0.15, '#1f6e30'], [0.3, 0.52, '#efe6a2'], [0.39, 0.43, '#3aa34d'], [0.965, 1, '#2f8f3f']]) }) },
};

function priceStrip() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 16; const x = c.getContext('2d'), r = K.rng(42);
  x.fillStyle = '#9a937f'; x.fillRect(0, 0, 512, 16);
  for (let i = 4; i < 512; i += 26 + r() * 30) { x.fillStyle = ['#d23a2a', '#f2c230', '#ffffff', '#2a62c9'][Math.floor(r() * 4)]; x.fillRect(i, 3, 12 + r() * 8, 10); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x06080a);
  scene.environment = K.envMap(renderer);
  scene.fog = new THREE.Fog(0x0a0e12, 24, 120);
  const cam = K.camera(50); scene.add(cam);
  const rig = K.lightRig(scene, { keyI: 0.7, rimI: 2.2, fill: 0.03 });
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x1c140e, 0.12));
  const top = new THREE.DirectionalLight(0xe4f2ff, 0.35); top.position.set(0, 10, 3); scene.add(top);

  // ---------- giants: instanced per product type ----------
  const placed = { can: [], dark: [], green: [] }, m = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), r = K.rng(7);
  const put = (type, x, y, z) => placed[type].push(m.compose(new THREE.Vector3(x, y, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6.28), one).clone());
  for (const [y, type] of LEVELS) {
    const st = PRODUCTS[type].step, n = Math.floor(17 / st) + 1;
    for (const z of [1.2, -0.9]) for (let i = 0; i < n; i++) {
      let x = (i - (n - 1) / 2) * st;
      if (y === HERO_Y) { if (Math.abs(x) < 0.1) continue; if (Math.abs(x) < 2.2) x = Math.sign(x) * 1.35; } // open a narrow slot for the newcomer
      put(type, x, y, z);
    }
    for (const sx of [-1, 1]) for (let z = 4; z < 46; z += st) put(type, sx * 11.2, y, z); // aisle walls
  }
  for (const k of Object.keys(placed)) {
    const im = new THREE.InstancedMesh(PRODUCTS[k].geo(), PRODUCTS[k].mat(), placed[k].length);
    placed[k].forEach((mm, i) => im.setMatrixAt(i, mm)); scene.add(im);
  }

  // ---------- shelving ----------
  const steel = new THREE.MeshStandardMaterial({ color: 0x3a3833, metalness: 0.6, roughness: 0.5, envMapIntensity: 0.3 });
  const back = new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.9 });
  const ptex = priceStrip(), pmat = (rep) => { const t = ptex.clone(); t.repeat.set(rep, 1); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.05, roughness: 0.6, color: 0x777777, envMapIntensity: 0.2 }); };
  const add = (geo, mat, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.y = ry; scene.add(o); return o; };
  const frontStrip = pmat(4), sideStrip = pmat(9);
  for (const [y] of LEVELS.concat([[TOP]])) {
    add(new THREE.BoxGeometry(19.6, 0.35, 4.8), steel, 0, y - 0.175, 0);
    add(new THREE.PlaneGeometry(19.6, 0.55), frontStrip, 0, y - 0.3, 2.42);
    for (const sx of [-1, 1]) { add(new THREE.BoxGeometry(4, 0.35, 44), steel, sx * 12, y - 0.175, 24); add(new THREE.PlaneGeometry(44, 0.55), sideStrip, sx * 9.98, y - 0.3, 24, -sx * Math.PI / 2); }
  }
  add(new THREE.PlaneGeometry(20, 50), back, 0, 22, -2.3);
  for (const sx of [-1, 1]) {
    add(new THREE.PlaneGeometry(46, 50), back, sx * 14, 22, 24, -sx * Math.PI / 2);
    add(new THREE.BoxGeometry(0.35, 50, 0.35), steel, sx * 9.8, 22, 2.4);
    for (let z = 4; z < 46; z += 10) add(new THREE.BoxGeometry(0.3, 50, 0.3), steel, sx * 10.05, 22, z);
  }
  add(new THREE.BoxGeometry(19.6, 1, 4.8), back, 0, -0.85, 0); // kick plate

  // 80s checker linoleum, glossy
  const fc = document.createElement('canvas'); fc.width = fc.height = 128; const fx = fc.getContext('2d');
  fx.fillStyle = '#6a624f'; fx.fillRect(0, 0, 128, 128); fx.fillStyle = '#2a231d'; fx.fillRect(0, 0, 64, 64); fx.fillRect(64, 64, 64, 64);
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(60, 60); ft.anisotropy = 8;
  const floor = add(new THREE.PlaneGeometry(240, 240), new THREE.MeshPhysicalMaterial({ map: ft, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 0.25 }), 0, -1.35, 20);
  floor.rotation.x = -Math.PI / 2;
  const ceil = add(new THREE.PlaneGeometry(60, 80), new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: 1 }), 0, 50, 20); ceil.rotation.x = Math.PI / 2;

  // fluorescent tubes (one flickers)
  const tubeMat = new THREE.MeshBasicMaterial({ color: hdr(0xe2f4ff, 2.6), fog: false }), flickMat = tubeMat.clone();
  const tubeGeo = new THREE.BoxGeometry(0.5, 0.25, 5.2), tubes = [];
  for (const x of [-5, 5]) for (let z = -1; z < 46; z += 7) tubes.push(add(tubeGeo, tubes.length === 9 ? flickMat : tubeMat, x, 49.6, z));

  // ---------- the newcomer ----------
  const hero = K.makeCan({ droplets: 120, seed: 4 }); hero.position.set(0, HERO_Y, 1.25); scene.add(hero);
  const spot = new THREE.SpotLight(0xfff0d8, 0, 22, 0.13, 0.7, 2); spot.position.set(0.8, HERO_Y + 9, 6); spot.target = hero; scene.add(spot);
  const kick = new THREE.PointLight(0xffb070, 0, 4, 2); kick.position.set(0, HERO_Y + 0.9, -0.6); scene.add(kick);
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const gx = gc.getContext('2d'), gg = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gg.addColorStop(0, 'rgba(255,255,255,1)'); gg.addColorStop(0.3, 'rgba(255,255,255,0.35)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), color: hdr(0xffc890, 1.1), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.position.set(0, HERO_Y + 0.7, -1.9); halo.scale.setScalar(3.2); scene.add(halo);

  const motes = K.dust(scene, { count: 900, area: [18, 30, 40], color: 0xdfe8ff, size: 0.05, speed: 0.12, seed: 13, opacity: 0.3 }); motes.position.set(0, 14, 20);

  const from = new THREE.Vector3(2.4, 1.0, 38), to = new THREE.Vector3(0.22, HERO_Y + 1.1, 7.2);
  const lookFrom = new THREE.Vector3(0, 17, 0), lookTo = new THREE.Vector3(0, HERO_Y + 0.62, 0), look = new THREE.Vector3();

  function render(t, d = 7.1) {
    // ---- camera: low worm's-eye at the giants -> long slow push down the aisle into the slot
    const p = K.eio(K.seg(t, -0.9, d)), pl = K.eio(K.seg(t, -0.4, d - 0.3));
    const hand = (k) => Math.sin(t * 1.1 + k) * 0.6 + Math.sin(t * 2.3 + k * 1.7) * 0.3 + Math.sin(t * 4.7 + k * 2.9) * 0.1;
    const amp = K.lerp(0.08, 0.02, p);
    cam.position.lerpVectors(from, to, p); cam.position.y += Math.sin(p * Math.PI) * 2.2; // slight crane arc
    cam.position.x += hand(0) * amp; cam.position.y += hand(1) * amp;
    cam.fov = K.lerp(52, 36, p); cam.updateProjectionMatrix();
    cam.lookAt(look.lerpVectors(lookFrom, lookTo, pl)); cam.rotation.z += hand(2) * 0.003 + K.lerp(-0.035, 0, p);

    // ---- the newcomer is picked out of the dark
    const ap = K.eo(K.seg(t, T_APPEAR, T_APPEAR + 1.1));
    spot.intensity = 90 * ap; kick.intensity = 1.5 * ap; halo.material.opacity = 0.55 * ap * (0.9 + 0.1 * Math.sin(t * 2.2));
    hero.rotation.y = 0.9 + t * 0.12;

    // ---- giants assert themselves on "Coca-Cola y Pepsi"
    const g = K.eio(K.seg(t, T_GIANTS, T_GIANTS + 1.2));
    rig.children[1].intensity = 2.2 + 3 * g; rig.children[0].intensity = 0.7 + 0.4 * g;
    flickMat.color.copy(hdr(0xe2f4ff, (Math.sin(Math.floor(t * 14) * 12.9898) * 43758.5453 % 1 + 1) % 1 > 0.35 ? 2.6 : 0.4));
    motes.userData.update(t, [0.05, -0.15, 0.02]);
  }
  render(0);
  return { scene, camera: cam, render };
}
