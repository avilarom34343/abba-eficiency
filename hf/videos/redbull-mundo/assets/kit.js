// Shared building blocks for the Red Bull documentary scenes. Every scene module imports from here so the
// film keeps one look: dark, high-contrast, cool rim light, warm practicals, dust in the air.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const W = 1080, H = 1920, ASPECT = W / H;
export const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t, a, b) => cl((t - a) / (b - a));
export const lerp = (a, b, x) => a + (b - a) * x;
export const eio = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const eo = (x) => 1 - Math.pow(1 - cl(x), 3);
export const ei = (x) => Math.pow(cl(x), 3);
/** Deterministic PRNG (mulberry32). Never use Math.random — renders must be identical on every seek. */
export const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };

export const PAL = {
  night: 0x05060a, steel: 0x8a93a6, ice: 0xbcd7ff, ember: 0xff7a2f, blue: 0x1b2a6b, silver: 0xd8dde6, red: 0xd2202f, gold: 0xffc23d,
};

/** Standard vertical camera. */
export function camera(fov = 35) { const c = new THREE.PerspectiveCamera(fov, ASPECT, 0.05, 2000); return c; }

/** Cinematic light rig: cool key from the side, warm rim behind, faint fill. Returns the group so scenes can move it. */
export function lightRig(scene, { key = 0xbcd7ff, rim = 0xff7a2f, keyI = 3, rimI = 5, fill = 0.25 } = {}) {
  const g = new THREE.Group();
  const k = new THREE.DirectionalLight(key, keyI); k.position.set(-4, 3, 4); g.add(k);
  const r = new THREE.DirectionalLight(rim, rimI); r.position.set(3, 2, -5); g.add(r);
  const t = new THREE.DirectionalLight(0xffffff, 1.2); t.position.set(0, 6, 1); g.add(t);
  g.add(new THREE.AmbientLight(0x8899bb, fill));
  scene.add(g); return g;
}

let _pmrem = null, _env = null;
/** Studio reflections for metal (built once from a procedural room). */
export function envMap(renderer) {
  if (_env) return _env;
  _pmrem = new THREE.PMREMGenerator(renderer);
  _env = _pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  return _env;
}

/** Can label texture: two-tone deep blue / silver with a diamond checker band at the seam. Archetype only — no logo, no wordmark. */
function canTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
  const g1 = x.createLinearGradient(0, 0, 0, 512); g1.addColorStop(0, '#24357e'); g1.addColorStop(1, '#141f52');
  x.fillStyle = g1; x.fillRect(0, 0, 512, 512);
  const g2 = x.createLinearGradient(0, 0, 0, 512); g2.addColorStop(0, '#eef1f6'); g2.addColorStop(1, '#b9c0cc');
  x.fillStyle = g2; x.fillRect(512, 0, 512, 512);
  // diamond checker at both seams
  for (const sx of [512, 0]) for (let r = 0; r < 16; r++) for (let k = 0; k < 4; k++) {
    if ((r + k) % 2) continue; x.fillStyle = sx === 512 ? '#24357e' : '#d9dee7';
    const cx = sx + (k - 2) * 26 + 13, cy = r * 32 + 16; x.beginPath(); x.moveTo(cx, cy - 16); x.lineTo(cx + 13, cy); x.lineTo(cx, cy + 16); x.lineTo(cx - 13, cy); x.fill();
  }
  // warm sun disk — abstract energy mark, not a logo
  for (const cx of [256, 768]) { const rg = x.createRadialGradient(cx, 250, 10, cx, 250, 120); rg.addColorStop(0, '#ffd44a'); rg.addColorStop(0.7, '#f4a51c'); rg.addColorStop(1, 'rgba(244,165,28,0)'); x.fillStyle = rg; x.beginPath(); x.arc(cx, 250, 120, 0, Math.PI * 2); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/** 250 ml slim can, ~1.3 units tall, origin at its base. Condensation droplets are instanced. */
export function makeCan({ droplets = 260, seed = 3 } = {}) {
  const g = new THREE.Group();
  const prof = [[0, 0], [0.205, 0], [0.235, 0.03], [0.24, 0.08], [0.24, 1.1], [0.215, 1.2], [0.2, 1.25], [0.205, 1.27], [0, 1.27]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), new THREE.MeshPhysicalMaterial({ map: canTexture(), metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }));
  g.add(body);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 64), new THREE.MeshStandardMaterial({ color: 0xd5d9e0, metalness: 1, roughness: 0.18 })); lid.position.y = 1.262; g.add(lid);
  const tab = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 24), new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 1, roughness: 0.2 })); tab.rotation.x = Math.PI / 2; tab.position.set(0.05, 1.272, 0); g.add(tab);
  const r = rng(seed), drop = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 0.0, transparent: true, opacity: 0.3, clearcoat: 1 }), droplets);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < droplets; i++) { const a = r() * Math.PI * 2, y = 0.12 + r() * 0.95, s = 0.0025 + r() ** 3 * 0.007;
    m.compose(new THREE.Vector3(Math.cos(a) * 0.243, y, Math.sin(a) * 0.243), q, new THREE.Vector3(s, s * 1.35, s * 0.6)); drop.setMatrixAt(i, m); }
  g.add(drop); g.userData.body = body; return g;
}

/** Vertical gradient sky dome. */
export function sky(scene, top = 0x0b1022, bottom = 0x2a1a14, radius = 800) {
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 p; void main(){ float h = smoothstep(-0.15, 0.6, p.y); gl_FragColor = vec4(mix(bottom, top, h), 1.); }' });
  const s = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), m); scene.add(s); return s;
}

/** Jagged mountain ridge (displaced plane), placed along -z. */
export function mountains(scene, { seed = 1, color = 0x1a2030, z = -120, width = 600, height = 90, snow = true } = {}) {
  const geo = new THREE.PlaneGeometry(width, height * 2.2, 220, 60); const p = geo.attributes.position; const r = rng(seed);
  const ph = Array.from({ length: 6 }, () => r() * 10);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); const ridge = (Math.sin(x * 0.02 + ph[0]) * 0.5 + Math.sin(x * 0.051 + ph[1]) * 0.3 + Math.sin(x * 0.13 + ph[2]) * 0.12 + Math.abs(Math.sin(x * 0.29 + ph[3])) * 0.08);
    const top = height * (0.55 + 0.45 * ridge); p.setY(i, y > 0 ? Math.min(y, top) : y); p.setZ(i, Math.sin(x * 0.17 + y * 0.11 + ph[4]) * 3); }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0, flatShading: true });
  if (snow) mat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n float sn = smoothstep(0.62, 0.8, vNormal.y*0.5+0.5); gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.82,0.86,0.95), sn*0.55);'); };
  const m = new THREE.Mesh(geo, mat); m.position.set(0, -10, z); scene.add(m); return m;
}

/** Floating dust / snow / sparks. Call update(t) every render; positions derive from t only. */
export function dust(scene, { count = 600, area = [20, 30, 20], color = 0xffffff, size = 0.04, speed = 0.3, seed = 9, opacity = 0.6 } = {}) {
  const r = rng(seed), base = new Float32Array(count * 3), pos = new Float32Array(count * 3), ph = new Float32Array(count);
  for (let i = 0; i < count; i++) { base[i * 3] = (r() - 0.5) * area[0]; base[i * 3 + 1] = (r() - 0.5) * area[1]; base[i * 3 + 2] = (r() - 0.5) * area[2]; ph[i] = r() * 100; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  scene.add(pts);
  pts.userData.update = (t, wind = [0.1, -1, 0]) => { for (let i = 0; i < count; i++) {
    for (let k = 0; k < 3; k++) { const span = area[k]; let v = base[i * 3 + k] + wind[k] * speed * t + Math.sin(t * 0.7 + ph[i] + k) * 0.15; v = ((v + span / 2) % span + span) % span - span / 2; pos[i * 3 + k] = v; } }
    geo.attributes.position.needsUpdate = true; };
  return pts;
}

/** Stylised athlete silhouette from capsules (reads as a person in rim light). pose: 'stand'|'ride'|'board'|'climb'|'jump'. */
export function figure({ color = 0x0d0f14, pose = 'stand' } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 }); const g = new THREE.Group();
  const cap = (r, l, x, y, z, rx = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 12), mat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); return m; };
  const P = { stand: [0, 0, 0.15, -0.15, 0.05], ride: [0.5, -0.9, 0.9, -0.8, 0.6], board: [0.35, 0.6, -0.6, 0.4, -0.3], climb: [-0.2, 1.2, -1.4, 0.3, 0], jump: [0.4, -1.4, 1.4, -0.5, 0.5] }[pose] ?? [0, 0, 0, 0, 0];
  cap(0.16, 0.5, 0, 1.25, 0, P[0] * 0.3); // torso
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), mat); head.position.set(0, 1.72, 0); g.add(head);
  cap(0.055, 0.45, -0.28, 1.25, 0, 0, P[1] * 0.6 + 0.2); cap(0.055, 0.45, 0.28, 1.25, 0, 0, P[2] * 0.6 - 0.2); // arms
  cap(0.075, 0.55, -0.11, 0.5, 0, P[3] * 0.4, 0.05); cap(0.075, 0.55, 0.11, 0.5, 0, P[4] * 0.4, -0.05); // legs
  return g;
}

/** Speed streaks (thin additive lines) for velocity; update(t, speed). */
export function streaks(scene, { count = 160, len = 6, area = [12, 20, 60], color = 0xbcd7ff, seed = 4, opacity = 0.5 } = {}) {
  const r = rng(seed), geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 6), base = [];
  for (let i = 0; i < count; i++) base.push([(r() - 0.5) * area[0], (r() - 0.5) * area[1], -r() * area[2]]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(lines);
  lines.userData.update = (t, speed = 20) => { base.forEach(([x, y, z], i) => { const zz = ((z + t * speed) % area[2] + area[2]) % area[2] - area[2] + 4; pos.set([x, y, zz, x, y, zz - len], i * 6); }); geo.attributes.position.needsUpdate = true; };
  return lines;
}

/** Rectangular glowing screen whose content is a canvas you redraw per frame (for media walls). */
export function screen(scene, w = 1.6, h = 0.9, draw = null, { res = 256 } = {}) {
  const c = document.createElement('canvas'); c.width = res; c.height = Math.round(res * h / w); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scene.add(m);
  m.userData.paint = (t) => { if (draw) { draw(c.getContext('2d'), c.width, c.height, t); tex.needsUpdate = true; } };
  return m;
}
