// Scene 4 — Discovery. "Necesitaba hacer que la gente quisiera formar parte de Red Bull." (local 0.3–4.19)
// A lone athlete on a snow ridge at golden hour, scarf whipping in the wind, camera orbiting close (0–2.2).
// Then the camera cranes up and back and the landscape fills with people: a snowboarder carving, a motocross
// rider jumping a dirt crest, climbers on a rock tower, a surfer on the bay, a paraglider. No can — a lifestyle.
import * as THREE from 'three';
import * as K from '../assets/kit.js';

const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const SEA = -13;

// one heightfield for the whole valley: the hero's ridge runs into the distance along -z, the left side falls
// into a bay, the right side climbs into a second massif; a dirt plateau sits in the left valley.
function H(x, z) {
  const spine = 2.6 * Math.exp(-(x * x + z * z) / 18) - 0.55 * Math.abs(x - 3 * Math.sin(z * 0.05)) - 0.045 * Math.max(0, -z) * (1 - Math.min(1, Math.max(0, -z - 40) / 60));
  const massif = 22 * Math.exp(-((x - 42) ** 2 + (z + 40) ** 2) / 500) + 12 * Math.exp(-((x - 20) ** 2 + (z + 90) ** 2) / 400);
  const plateau = 6 * Math.exp(-((x + 18) ** 2 + (z + 26) ** 2) / 60);
  const n = Math.sin(x * 0.37 + z * 0.21) * 0.35 + Math.sin(x * 0.11 - z * 0.17) * 0.9 + Math.sin(x * 1.3 + z * 0.9) * 0.08;
  return Math.max(SEA - 3, Math.max(spine, -16) + massif + plateau + n - Math.max(0, -x - 10) * 0.25);
}

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function create(renderer) {
  const scene = new THREE.Scene();
  scene.environment = K.envMap(renderer); scene.environmentIntensity = 0.25;
  scene.fog = new THREE.Fog(0x8a6a5a, 30, 260);
  const cam = K.camera(38);
  K.sky(scene, 0x10204a, 0xf09a5a, 700);
  const GLOW = glowTex();
  const sprite = (color, s, parent) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); m.scale.setScalar(s); parent.add(m); return m; };

  // low golden sun behind the ridge (back-light → silhouettes with warm rim), cool sky fill
  const sunDir = new THREE.Vector3(-0.25, 0.12, -1).normalize();
  const sun = new THREE.DirectionalLight(0xffb070, 5); sun.position.copy(sunDir).multiplyScalar(100); scene.add(sun);
  const fill = new THREE.HemisphereLight(0x6f86c0, 0x2a1c18, 0.9); scene.add(fill);
  const front = new THREE.DirectionalLight(0x9fb4ff, 0.6); front.position.set(10, 20, 30); scene.add(front);
  const sunDisk = sprite(hdr(0xffd9a0, 2.2), 70, scene); sunDisk.position.copy(sunDir).multiplyScalar(520);
  const sunHalo = sprite(hdr(0xff9a50, 0.8), 260, scene); sunHalo.position.copy(sunDisk.position);

  // ---------- terrain ----------
  const geo = new THREE.PlaneGeometry(260, 260, 180, 180).rotateX(-Math.PI / 2); geo.translate(0, 0, -100);
  const p = geo.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal, snow = new THREE.Color(0xe8ecf4), rock = new THREE.Color(0x2a2522), dirt = new THREE.Color(0x5a3a26), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), flat = nrm.getY(i);
    const s = K.cl((flat - 0.72) * 5) * K.cl((y + 9) / 4); const d = Math.exp(-((x + 18) ** 2 + (z + 26) ** 2) / 50);
    c.copy(rock).lerp(snow, s).lerp(dirt, K.cl(d * 1.6)); col.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, flatShading: true })));
  const far = K.mountains(scene, { seed: 5, color: 0x2a2f45, z: -330, width: 900, height: 120 }); far.position.y = -20;
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshPhysicalMaterial({ color: 0x0d2235, roughness: 0.12, metalness: 0.6, clearcoat: 1 }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(-200, SEA, -120); scene.add(sea);
  const glint = sprite(hdr(0xffc080, 1.2), 60, scene); glint.position.set(-70, SEA + 0.5, -200);

  // rock tower for the climbers
  const towerGeo = new THREE.CylinderGeometry(2.2, 4.2, 22, 7, 6); { const tp = towerGeo.attributes.position, r = K.rng(12); for (let i = 0; i < tp.count; i++) { const k = 1 + (r() - 0.5) * 0.3; tp.setX(i, tp.getX(i) * k); tp.setZ(i, tp.getZ(i) * k); } towerGeo.computeVertexNormals(); }
  const TOWER = new THREE.Vector3(9, H(9, -16) + 8, -16);
  const tower = new THREE.Mesh(towerGeo, new THREE.MeshStandardMaterial({ color: 0x3a302a, roughness: 0.95, flatShading: true })); tower.position.copy(TOWER); scene.add(tower);

  // ---------- hero: lone athlete on the summit ----------
  const hero = K.figure({ color: 0x0b0d12 }); const HERO_Y = H(0, 0); hero.position.set(0, HERO_Y - 0.05, 0); scene.add(hero);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.45, 0.2), hero.children[0].material); pack.position.set(0, 1.3, 0.2); hero.add(pack);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.5, 0.04), new THREE.MeshStandardMaterial({ color: 0x1b2a6b, metalness: 0.4, roughness: 0.35 })); board.position.set(0.05, 1.15, 0.33); board.rotation.z = 0.12; hero.add(board);
  const scarfGeo = new THREE.PlaneGeometry(0.9, 0.11, 18, 1).translate(0.45, 0, 0), sBase = scarfGeo.attributes.position.array.slice();
  const scarf = new THREE.Mesh(scarfGeo, new THREE.MeshStandardMaterial({ color: 0xc23a1e, roughness: 0.7, side: THREE.DoubleSide })); scarf.position.set(0.05, 1.56, 0.05); hero.add(scarf);
  const spin = K.dust(scene, { count: 900, area: [14, 3, 8], color: 0xfff1e0, size: 0.03, speed: 1.0, seed: 3, opacity: 0.7 }); spin.position.set(2, HERO_Y + 0.6, 0);

  // ---------- the people who join ----------
  const fig = (pose, s = 1) => { const f = K.figure({ pose, color: 0x0c0e13 }); f.scale.setScalar(s); scene.add(f); return f; };
  // snowboarder carving down the right slope, leaving a snow plume
  const sb = fig('board', 1.4); const sbBoard = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.4), board.material); sbBoard.position.y = 0.06; sb.add(sbBoard);
  const sbSpray = K.dust(scene, { count: 260, area: [3, 1.5, 3], color: 0xffffff, size: 0.08, speed: 0.2, seed: 7, opacity: 0.8 });
  // motocross rider jumping the dirt plateau
  const mx = new THREE.Group(); scene.add(mx); const mxRider = K.figure({ pose: 'ride', color: 0x0c0e13 }); mxRider.position.set(-0.1, 0.45, 0); mx.add(mxRider);
  const metal = new THREE.MeshStandardMaterial({ color: 0x15171c, metalness: 0.7, roughness: 0.4 });
  for (const wx of [-0.75, 0.75]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.08, 8, 20), metal); w.position.set(wx, 0.36, 0); mx.add(w); }
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.18), new THREE.MeshStandardMaterial({ color: 0xd2202f, roughness: 0.4, metalness: 0.3 })); frame.position.set(0, 0.75, 0); frame.rotation.z = 0.12; mx.add(frame);
  mx.scale.setScalar(1.5); const mxDust = K.dust(scene, { count: 220, area: [6, 2, 3], color: 0xd9a070, size: 0.12, speed: 0.4, seed: 9, opacity: 0.5 });
  // climbers on the tower
  const climbers = [0, 1].map((i) => { const f = fig('climb', 1.1); return f; });
  // surfer on a breaking wave in the bay
  const wave = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 26, 24, 1, true, 0, Math.PI * 1.2), new THREE.MeshPhysicalMaterial({ color: 0x1d5a70, roughness: 0.15, metalness: 0.2, clearcoat: 1, side: THREE.DoubleSide }));
  wave.rotation.set(0, 0.5, Math.PI / 2); wave.position.set(-46, SEA + 1.2, -60); scene.add(wave);
  const foam = K.dust(scene, { count: 300, area: [24, 1.4, 2], color: 0xffffff, size: 0.18, speed: 0.6, seed: 13, opacity: 0.7 }); foam.position.set(-46, SEA + 2.3, -60); foam.rotation.y = 0.5;
  const surfer = fig('board', 1.6); const sBoard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.4 })); sBoard.position.y = 0.05; surfer.add(sBoard);
  // paraglider over the valley
  const pg = new THREE.Group(); scene.add(pg);
  const wing = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 1.4, 24, 1, true, -0.7, 1.4), new THREE.MeshStandardMaterial({ color: 0xff7a2f, roughness: 0.6, side: THREE.DoubleSide, emissive: 0x401000 }));
  wing.rotation.set(Math.PI / 2, 0, Math.PI / 2); wing.position.y = 4; pg.add(wing); const pilot = K.figure({ pose: 'stand', color: 0x0c0e13 }); pilot.scale.setScalar(0.8); pg.add(pilot);
  pg.scale.setScalar(1.3);

  // each newcomer arrives with a soft warm glint as the camera reveals them
  const cast = [[sb, 1.9], [mx, 2.3], [climbers[0], 2.7], [surfer, 3.1], [pg, 3.5]].map(([o, at]) => ({ o, at, g: sprite(hdr(0xffc890, 1.6), 6, scene) }));
  const haze = K.dust(scene, { count: 1200, area: [120, 30, 120], color: 0xffe0c0, size: 0.18, speed: 0.4, seed: 21, opacity: 0.25 }); haze.position.set(0, -2, -40);

  const tmp = new THREE.Vector3(), look = new THREE.Vector3(), q = new THREE.Vector3();

  function render(t) {
    const hand = (k) => Math.sin(t * 1.2 + k) * 0.6 + Math.sin(t * 2.7 + k * 2.1) * 0.3 + Math.sin(t * 5.1 + k * 3.7) * 0.1;
    // ---- camera: slow close orbit around the hero, then a big crane up/back that opens the valley
    const orbit = t * 0.16, crane = K.eio(K.seg(t, 1.9, 4.8));
    const th = 0.55 - orbit - crane * 0.25, R = K.lerp(3.6, 30, crane), Y = HERO_Y + K.lerp(1.3, 13, crane);
    cam.position.set(Math.sin(th) * R + hand(0) * 0.03, Y + hand(1) * 0.03, Math.cos(th) * R);
    look.set(0, HERO_Y + 1.25, 0).lerp(q.set(-6, HERO_Y - 8, -38), crane); cam.lookAt(look); cam.rotation.z += hand(2) * 0.005;
    cam.fov = K.lerp(38, 46, crane); cam.updateProjectionMatrix();

    // ---- wind: scarf flutter, body sway, spindrift
    const a = scarfGeo.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) { const u = sBase[i] / 0.9; a[i + 1] = sBase[i + 1] + Math.sin(u * 7 - t * 16) * 0.07 * u - u * 0.12; a[i + 2] = sBase[i + 2] + Math.sin(u * 5 - t * 13 + 1) * 0.12 * u; }
    scarfGeo.attributes.position.needsUpdate = true; scarfGeo.computeVertexNormals();
    hero.rotation.set(0, 0.2 + Math.sin(t * 0.5) * 0.04, Math.sin(t * 3.1) * 0.012);
    spin.userData.update(t, [3, 0.2, 0.4]);

    // ---- the cast
    const sbu = K.seg(t, 0, 4.8); tmp.set(K.lerp(9, 18, sbu), 0, K.lerp(-4, 4, sbu) + Math.sin(sbu * 9) * 2.2); tmp.y = H(tmp.x, tmp.z);
    sb.position.copy(tmp); sb.rotation.set(0, Math.cos(sbu * 9) * 0.8 + 1.2, Math.sin(sbu * 9) * 0.35);
    sbSpray.position.copy(tmp).add(q.set(0, 0.4, 0)); sbSpray.userData.update(t, [0.6, 0.6, 0]);
    const mu = K.seg(t, 1.8, 4.6), mxX = K.lerp(-24, -10, mu), base = H(mxX, -26), arc = Math.max(0, Math.sin(K.cl((mu - 0.25) / 0.6) * Math.PI)) * 5;
    mx.position.set(mxX, base + arc, -26); mx.rotation.set(0, -0.3, (mu > 0.25 && mu < 0.85 ? 0.25 - (mu - 0.25) * 0.7 : 0));
    mxDust.position.set(mxX - 2.5, base + 0.6, -26); mxDust.userData.update(t, [-1.5, 0.3, 0]);
    climbers.forEach((f, i) => { const ang = 2.3 + i * 0.35, h = -3 + i * 2.2 + t * 0.25; const rr = K.lerp(4.2, 2.2, (h + 11) / 22) + 0.15;
      f.position.set(TOWER.x + Math.cos(ang) * rr, TOWER.y + h, TOWER.z + Math.sin(ang) * rr); f.rotation.set(0, -ang + Math.PI / 2, 0); });
    const su = K.seg(t, 0, 4.8); surfer.position.set(-46 + K.lerp(-6, 6, su) * Math.cos(0.5), SEA + 2.1, -60 - K.lerp(-6, 6, su) * Math.sin(0.5) + 1.4); surfer.rotation.set(0, 0.5, Math.sin(t * 2) * 0.1);
    foam.userData.update(t, [1.2, 0.3, 0]);
    pg.position.set(K.lerp(-8, 4, K.seg(t, 0, 4.8)), HERO_Y + 9 + Math.sin(t * 0.7) * 0.5, -46); pg.rotation.set(0, 0.4, Math.sin(t * 0.9) * 0.08);
    cast.forEach(({ o, at, g }) => { const k = K.seg(t, at, at + 0.35), f = 1 - K.seg(t, at + 0.35, at + 1.2);
      g.position.copy(o.position).add(q.set(0, 1.8, 0)); g.visible = t > at; g.material.opacity = k * K.lerp(0.35, 1, f); g.scale.setScalar(K.lerp(3, 9, k)); });

    sunHalo.material.opacity = 0.9; glint.material.opacity = 0.6 + 0.2 * Math.sin(t * 3);
    haze.userData.update(t, [1.2, 0.05, 0.2]);
  }
  render(0);
  return { scene, camera: cam, render };
}
