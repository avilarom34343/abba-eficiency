// Shared kit for the clinic videos: three.js stage, deterministic seek(), easing and dental models.
import * as THREE from 'three';
import { RoomEnvironment } from './RoomEnvironment.js';
export { THREE };

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const ease = x => (x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const out = x => 1 - (1 - x) ** 3;
export const back = x => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
export const seg = (t, a, b, f = ease) => f(clamp((t - a) / (b - a)));
export const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(42);

export function stage({ bg = '#081022', fov = 30 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
  renderer.setSize(1080, 1920);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;
  document.getElementById('gl').appendChild(renderer.domElement);
  document.body.style.setProperty('--bg', bg);
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const camera = new THREE.PerspectiveCamera(fov, 1080 / 1920, .1, 200);
  const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(3, 5, 6);
  const rim = new THREE.DirectionalLight('#5fd4ff', 3); rim.position.set(-6, 2, -4);
  const warm = new THREE.DirectionalLight('#ff9fd0', 1.2); warm.position.set(5, -3, -2);
  scene.add(key, rim, warm, new THREE.AmbientLight('#ffffff', .25));
  return { renderer, scene, camera };
}

// One clock for CSS captions and the 3D scene: render.cjs calls window.seek(ms) per frame.
export function run({ renderer, scene, camera }, duration, update) {
  window.DURATION = duration;
  window.seek = ms => {
    document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; });
    update(ms / 1000);
    renderer.render(scene, camera);
  };
  if (!location.search.includes('render')) {
    const t0 = performance.now();
    (function loop() { window.seek((performance.now() - t0) % (duration * 1000)); requestAnimationFrame(loop); })();
  }
  window.READY = true;
}

export const mats = {
  tooth: () => new THREE.MeshPhysicalMaterial({ color: '#f5f0e6', roughness: .22, clearcoat: .8, clearcoatRoughness: .12, sheen: .4, sheenColor: '#ffffff' }),
  gum: () => new THREE.MeshPhysicalMaterial({ color: '#e0707f', roughness: .42, clearcoat: .5, clearcoatRoughness: .3 }),
  metal: () => new THREE.MeshStandardMaterial({ color: '#f2f6fb', metalness: 1, roughness: .28, envMapIntensity: 3 }),
  bone: () => new THREE.MeshPhysicalMaterial({ color: '#efe3cf', roughness: .7, transparent: true, opacity: .55 }),
  glow: c => new THREE.MeshBasicMaterial({ color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
};

// Stylised tooth: a deformed sphere. Crown is y>0 (grows +y), root is y<0.
const SHAPE = { // half-width, half-depth, crown height, root length
  incisor: [.42, .28, 1.0, 1.4], lateral: [.34, .25, .9, 1.25], canine: [.38, .34, 1.05, 1.7],
  premolar: [.36, .4, .8, 1.3], molar: [.5, .5, .72, 1.2] };
export function toothGeo(kind = 'incisor', rootScale = 1) {
  const [hw, hd, ch, rl0] = SHAPE[kind], rl = rl0 * rootScale, g = new THREE.SphereGeometry(1, 72, 72), p = g.attributes.position;
  const flat = kind === 'incisor' || kind === 'lateral';
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i), X, Y, Z;
    if (y >= 0) {
      Y = ch * y ** (flat ? .5 : .7);
      X = x * hw * (1 - .08 * y);
      Z = z * hd * (flat ? 1 - .55 * y : 1 - .2 * y);
      if (kind === 'molar' || kind === 'premolar') Y += .07 * Math.cos(x * 7) * Math.cos(z * 7) * y * y;
      if (kind === 'canine') Y += .18 * (1 - Math.abs(x)) * y * y;
    } else {
      const s = 1 + y * .78;
      X = x * hw * s * .92; Z = z * hd * s; Y = y * rl;
    }
    p.setXYZ(i, X, Y, Z);
  }
  g.computeVertexNormals();
  return g;
}

// Dental arch (crowns up, front faces +z). Returns teeth with their slot on the curve.
const KINDS = ['incisor', 'lateral', 'canine', 'premolar', 'premolar', 'molar', 'molar'];
const WIDTH = { incisor: .86, lateral: .7, canine: .78, premolar: .74, molar: 1.02 };
export function arch({ gum = true } = {}) {
  const pts = []; for (let x = -5; x <= 5; x += .2) pts.push(new THREE.Vector3(x, 0, -.3 * x * x));
  const curve = new THREE.CatmullRomCurve3(pts), L = curve.getLength(), group = new THREE.Group(), teeth = [];
  let half = 0; const tm = mats.tooth(), geos = Object.fromEntries(Object.keys(SHAPE).map(k => [k, toothGeo(k, .25)]));
  for (const side of [-1, 1]) {
    let s = .02;
    for (const kind of KINDS) {
      const w = WIDTH[kind], u = .5 + side * (s + w / 2) / L; s += w + .05;
      const pos = curve.getPointAt(u), tan = curve.getTangentAt(u), yaw = Math.atan2(-tan.z, tan.x);
      const mesh = new THREE.Mesh(geos[kind], tm);
      mesh.position.copy(pos); mesh.rotation.y = yaw;
      group.add(mesh);
      teeth.push({ mesh, kind, u, base: pos.clone(), yaw, side });
    }
    half = s;
  }
  teeth.sort((a, b) => a.u - b.u);
  if (gum) {
    const gpts = []; for (let u = .5 - (half + .2) / L; u <= .5 + (half + .2) / L; u += .01) gpts.push(curve.getPointAt(u).add(new THREE.Vector3(0, -.3, -.05)));
    const g = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gpts), 200, .44, 32), mats.gum());
    group.add(g);
  }
  return { group, teeth, curve };
}
