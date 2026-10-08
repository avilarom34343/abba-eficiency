// Scene 8 — Emotional association. A rapid montage bound by one visual identity: every shot is a dark silhouette
// eclipsing the same warm low sun, which sits at the same spot of the frame (upper third) in every cut —
// athlete on a cliff edge, a screaming crowd, a race car launching, a skydiver, a mountain ridge, a slow-motion
// snowboard landing. At 4.3 (global 65.0) everything stops: black. At 5.2 (65.9) the can appears alone in the centre.
import * as THREE from 'three';
import * as K from '../assets/kit.js';

const CUTS = [0, 1.0, 1.65, 2.3, 2.95, 3.6, 4.3]; // shot boundaries (local s)
const T_BLACK = 4.3, T_CAN = 5.2;
const SUN_Y = 55, SUN_Z = -300, PITCH = -Math.atan(SUN_Y / -SUN_Z); // pitching the camera down by this puts the sun on the horizon
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

function tex(draw, n = 256) { const c = document.createElement('canvas'); c.width = c.height = n; draw(c.getContext('2d'), n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const GLOW = tex((x, n) => { const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n); });
const DISK = tex((x, n) => { const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); g.addColorStop(0, '#fff6d8'); g.addColorStop(0.55, '#ffc066'); g.addColorStop(0.9, '#ff7a2f'); g.addColorStop(0.97, 'rgba(255,110,40,0.6)'); g.addColorStop(1, 'rgba(255,100,40,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n); });
const CLOUD = tex((x, n) => { const r = K.rng(5); for (let i = 0; i < 14; i++) { const cx = n * (0.25 + r() * 0.5), cy = n * (0.35 + r() * 0.3), rr = n * (0.12 + r() * 0.18);
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, rr); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n); } });
const sprite = (map, color, s, parent, blend = THREE.AdditiveBlending) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, blending: blend, depthWrite: false, fog: false }));
  m.scale.setScalar(s); parent.add(m); return m; };
const SIL = new THREE.MeshStandardMaterial({ color: 0x07080b, roughness: 0.55, metalness: 0.2 });

function makeCar() {
  const g = new THREE.Group(), body = new THREE.MeshStandardMaterial({ color: 0x14161c, metalness: 0.8, roughness: 0.3 });
  const box = (w, h, l, x, y, z, m = body) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); o.position.set(x, y, z); g.add(o); return o; };
  box(0.7, 0.32, 4.2, 0, 0.32, 0); box(1.7, 0.22, 1.6, 0, 0.28, 0.4); box(0.5, 0.35, 1.2, 0, 0.6, 0.2); // tub, sidepods, airbox
  box(1.9, 0.05, 0.5, 0, 0.12, -2.2); box(1.1, 0.05, 0.4, 0, 0.95, 2.0); box(0.05, 0.6, 0.4, 0.55, 0.65, 2.0); box(0.05, 0.6, 0.4, -0.55, 0.65, 2.0); // wings
  const wheels = []; const wg = new THREE.CylinderGeometry(0.34, 0.34, 0.38, 24), wm = new THREE.MeshStandardMaterial({ color: 0x0b0c0f, roughness: 0.7 });
  for (const [x, z, r] of [[0.95, -1.4, 0.3], [-0.95, -1.4, 0.3], [0.98, 1.5, 0.36], [-0.98, 1.5, 0.36]]) { const w = new THREE.Mesh(wg, wm); w.rotation.z = Math.PI / 2; w.scale.setScalar(r / 0.34); w.position.set(x, r, z); g.add(w); wheels.push(w); }
  // spokes ring so the spin reads
  for (const w of wheels) { const s = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 4, 6), new THREE.MeshStandardMaterial({ color: 0x6a7080, metalness: 1, roughness: 0.3 })); s.rotation.y = Math.PI / 2; s.position.x = w.position.x * 1.2; s.position.y = w.position.y; s.position.z = w.position.z; g.add(s); w.userData.spoke = s; }
  const rain = sprite(GLOW, hdr(0xff2a2a, 4), 0.5, g); rain.position.set(0, 0.45, 2.35);
  g.userData = { wheels, rain }; return g;
}

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0);
  const env = K.envMap(renderer); scene.environment = env;
  scene.fog = new THREE.Fog(0x2a1812, 30, 400);
  const cam = K.camera(35); scene.add(cam);
  const rig = K.lightRig(scene, { keyI: 0.25, rimI: 7, rim: 0xff8a3a, fill: 0.12 });
  const sky = K.sky(scene, 0x0a0c1c, 0xff7a3a, 900);

  // the shared sun — fixed in screen space (child of the camera), occluded by whatever stands in front of it
  const sunGrp = new THREE.Group(); cam.add(sunGrp); sunGrp.position.set(0, SUN_Y, SUN_Z);
  const sunHalo = sprite(GLOW, hdr(0xff9a4a, 1.1), 150, sunGrp);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: DISK, color: hdr(0xffffff, 2.2), transparent: true, depthWrite: false, fog: false })); sun.scale.setScalar(44); sunGrp.add(sun);
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffe8d0, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  flash.position.z = -0.2; flash.scale.set(0.2, 0.2, 1); flash.renderOrder = 999; cam.add(flash);

  const sets = []; const set = () => { const g = new THREE.Group(); scene.add(g); sets.push(g); return g; };

  // A — athlete at the cliff edge, about to jump
  const A = set();
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 8), new THREE.MeshStandardMaterial({ color: 0x0b0c10, roughness: 0.9, flatShading: true })); ledge.position.set(0, -2, -2); A.add(ledge);
  const lip = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), ledge.material); lip.scale.set(2.2, 0.5, 1); lip.position.set(-1.5, -0.3, -5.6); A.add(lip);
  const athA = K.figure({ pose: 'stand' }); athA.position.set(0, -0.12, -5.6); A.add(athA);
  const mA = K.mountains(A, { seed: 21, color: 0x16131a, z: -240, width: 700, height: 70 }); mA.position.y = -95;
  const dustA = K.dust(A, { count: 300, area: [10, 6, 14], color: 0xffd0a0, size: 0.03, speed: 0.6, seed: 2, opacity: 0.5 });

  // B — crowd screaming, arms up (instanced silhouettes)
  const B = set(), CN = 230, r = K.rng(44);
  const bodies = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.19, 0.5, 4, 8), SIL, CN), heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 10, 8), SIL, CN);
  const arms = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.05, 0.55, 3, 6), SIL, CN * 2); B.add(bodies, heads, arms);
  const crowd = Array.from({ length: CN }, (_, i) => ({ x: (r() - 0.5) * (6 + (i / CN) * 30), z: -2 - (i / CN) * 34 - r() * 1.5, h: 0.9 + r() * 0.15, ph: r() * 6, up: r() < 0.75, sp: 7 + r() * 5 }));
  const stageGlows = [-12, -6, 0, 6, 12].map((x) => { const s = sprite(GLOW, hdr(0xffd8a8, 2), 8, B); s.position.set(x, 9, -60); return s; });
  const confetti = K.dust(B, { count: 400, area: [20, 10, 30], color: 0xffc27a, size: 0.05, speed: 0.4, seed: 8, opacity: 0.7 }); confetti.position.set(0, 3, -15);

  // C — race car launching down a straight
  const C = set();
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 600), new THREE.MeshStandardMaterial({ color: 0x0d0e12, roughness: 0.35, metalness: 0.4 })); road.rotation.x = -Math.PI / 2; road.position.z = -280; C.add(road);
  const DN = 40, dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.01, 2.2), new THREE.MeshBasicMaterial({ color: hdr(0xd8dde6, 0.8) }), DN * 2); C.add(dashes);
  const kerbs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.04, 1.2), new THREE.MeshStandardMaterial({ color: 0x8a1a1a, roughness: 0.6 }), DN * 2); C.add(kerbs);
  const car = makeCar(); car.rotation.y = Math.PI; C.add(car);
  const mC = K.mountains(C, { seed: 5, color: 0x120f14, z: -260, width: 800, height: 40, snow: false }); mC.position.y = -26;
  const strC = K.streaks(C, { count: 120, len: 8, area: [14, 4, 60], color: 0xffd8b0, seed: 3, opacity: 0.35 }); strC.position.y = 1.5;

  // D — skydiver, clouds rushing up past the lens
  const D = set();
  const diver = K.figure({ pose: 'jump' }); diver.position.set(0, -0.9, -6); D.add(diver);
  const clouds = Array.from({ length: 26 }, (_, i) => { const s = sprite(CLOUD, new THREE.Color(0x9a7f78), 6 + (i % 5) * 3, D, THREE.NormalBlending); s.material.opacity = 0.7;
    s.userData = { x: (K.rng(i + 3)() - 0.5) * 30, z: -3 - (i * 7.3) % 40, ph: (i * 0.37) % 1 }; return s; });
  const strD = K.streaks(D, { count: 120, len: 4, area: [12, 12, 40], color: 0xffe6cc, seed: 6, opacity: 0.4 }); strD.rotation.x = -Math.PI / 2; strD.position.set(0, 0, -6);

  // E — mountain ridge at dusk
  const E = set();
  const mE1 = K.mountains(E, { seed: 31, color: 0x0d0e14, z: -150, width: 520, height: 62, snow: false }); mE1.position.y = -62;
  const mE2 = K.mountains(E, { seed: 9, color: 0x2a2433, z: -260, width: 800, height: 120 }); mE2.position.y = -70;
  const hazeE = K.dust(E, { count: 500, area: [80, 20, 80], color: 0xffcaa0, size: 0.12, speed: 0.4, seed: 12, opacity: 0.35 }); hazeE.position.set(0, -2, -60);

  // F — slow-motion snowboard landing with a spray of snow
  const F = set();
  const snow = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x8c90a0, roughness: 0.85, metalness: 0 })); snow.rotation.x = -Math.PI / 2; snow.position.y = -1.2; F.add(snow);
  const rider = new THREE.Group(); F.add(rider); const rb = K.figure({ pose: 'board' }); rb.rotation.y = Math.PI / 2; rider.add(rb);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 1.55), SIL); board.position.y = 0.02; rider.add(board);
  const mF = K.mountains(F, { seed: 14, color: 0x1a1822, z: -240, width: 700, height: 50 }); mF.position.y = -40;
  const SN = 600, sr = K.rng(71), sv = new Float32Array(SN * 3), spos = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) { const a = sr() * Math.PI * 2, s = 1 + sr() * 4; sv.set([Math.cos(a) * s, 2 + sr() * 5, Math.sin(a) * s * 0.6], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(spos, 3));
  const spray = new THREE.Points(sg, new THREE.PointsMaterial({ color: hdr(0xffe6d0, 1.2), size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); F.add(spray);

  for (const g of [B, C]) { const gr = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x0b0a0c, roughness: 0.6, metalness: 0.2 })); gr.rotation.x = -Math.PI / 2; gr.position.y = -0.01; gr.position.z = -250; g.add(gr); }

  // G — the can alone in the centre
  const G = set();
  const can = K.makeCan({ droplets: 500, seed: 23 }); G.add(can); can.userData.body.material.envMapIntensity = 0.6;
  const gfloor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.35, metalness: 0, envMapIntensity: 0 })); gfloor.rotation.x = -Math.PI / 2; G.add(gfloor);
  const spot = new THREE.SpotLight(0xfff0dd, 0, 12, 0.32, 0.7, 1.5); spot.position.set(0, 5, 0.6); spot.target.position.set(0, 0.5, 0); G.add(spot, spot.target);
  const canGlow = sprite(GLOW, hdr(0xff9a4a, 0.5), 3, G); canGlow.position.set(0, 0.7, -2.5);
  const motes = K.dust(G, { count: 260, area: [3, 2.5, 3], color: 0xffd9a8, size: 0.007, speed: 0.05, seed: 4, opacity: 0.5 }); motes.position.y = 1;

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1);
  const SKY = [[0x05060e, 0x6a2a14], [0x08050a, 0x5a1c10], [0x05060c, 0x5a2814], [0x0e1426, 0x7a4a3a], [0x06081a, 0x5a2416], [0x0a0c18, 0x7a5040]];
  const FOG = [0x1a0e0a, 0x1a0a06, 0x160c08, 0x3a2824, 0x1a100e, 0x2e2424];

  function pose(x, y, z, yaw = 0, roll = 0, fov = 35) { cam.position.set(x, y, z); cam.rotation.set(PITCH, yaw, roll, 'YXZ'); cam.fov = fov; cam.updateProjectionMatrix(); }

  function render(t) {
    let shot = CUTS.findIndex((c, i) => t >= c && t < (CUTS[i + 1] ?? 1e9)); if (t >= T_BLACK) shot = t >= T_CAN ? 6 : -1;
    sets.forEach((g, i) => { g.visible = i === shot; });
    const u = shot >= 0 && shot < 6 ? t - CUTS[shot] : 0, len = shot >= 0 && shot < 6 ? CUTS[shot + 1] - CUTS[shot] : 1, p = u / len;
    const shake = (k, a) => (Math.sin(t * 17 + k) * 0.6 + Math.sin(t * 31 + k * 2) * 0.4) * a;
    const montage = shot >= 0 && shot < 6;
    sky.visible = sunGrp.visible = montage; scene.fog.near = montage ? 30 : 1e4; scene.fog.far = montage ? 400 : 2e4;
    if (montage) { sky.material.uniforms.top.value.set(SKY[shot][0]); sky.material.uniforms.bottom.value.set(SKY[shot][1]); scene.fog.color.set(FOG[shot]); }
    rig.visible = montage; scene.environment = montage ? null : env; // montage = pure silhouettes, no studio reflections
    // white pop on every montage cut after the first, plus a tiny zoom punch
    const sinceCut = montage && shot > 0 ? u : 9; flash.material.opacity = 0.4 * Math.exp(-sinceCut * 35); flash.visible = flash.material.opacity > 0.01;
    const punch = 1 - 0.06 * Math.exp(-sinceCut * 12);
    sunHalo.material.opacity = 0.55 + 0.1 * Math.sin(t * 3);

    if (shot === 0) { // A: slow push toward the athlete; he sinks into a crouch, ready
      pose(0.25 + shake(0, 0.01), 1.3, K.lerp(3.2, 1.6, K.eo(p)), 0.02, 0.01, 34 * punch);
      athA.scale.set(1, K.lerp(1, 0.9, K.eio(p)), 1); athA.rotation.x = K.lerp(-0.05, -0.28, K.eio(p)) + Math.sin(t * 2) * 0.01;
      dustA.userData.update(t, [1.2, 0.2, 0]);
    } else if (shot === 1) { // B: inside the crowd, handheld, bodies bouncing
      pose(shake(1, 0.05), 2.3 + shake(2, 0.04), 4 - p * 1.2, shake(3, 0.01), shake(4, 0.015), 38 * punch);
      crowd.forEach((c, i) => { const b = Math.abs(Math.sin(t * c.sp + c.ph)) * 0.16, y = b;
        m4.compose(v.set(c.x, y + 1.25 * c.h, c.z), q.identity(), s3.set(1, c.h, 1)); bodies.setMatrixAt(i, m4);
        m4.compose(v.set(c.x, y + 1.72 * c.h + 0.05, c.z), q.identity(), s3.set(1, 1, 1)); heads.setMatrixAt(i, m4);
        for (const sd of [-1, 1]) { const ang = c.up ? sd * (0.25 + 0.15 * Math.sin(t * c.sp * 0.5 + c.ph)) : sd * 2.8;
          m4.compose(v.set(c.x + sd * 0.22, y + (c.up ? 1.95 : 1.25) * c.h, c.z), q.setFromEuler(e.set(0, 0, ang)), s3.set(1, 1, 1)); arms.setMatrixAt(i * 2 + (sd > 0), m4); } });
      bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = arms.instanceMatrix.needsUpdate = true;
      stageGlows.forEach((s, i) => { s.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 6 + i)); });
      confetti.userData.update(t, [0.2, -1.5, 0]);
    } else if (shot === 2) { // C: low tracking shot, the car launches away; world scrolls under it
      const vel = K.lerp(30, 90, K.ei(p)), dist = 30 * u + 30 * len * K.ei(p) * 0.6;
      car.position.set(0, 0, K.lerp(-12, -16, K.ei(p))); car.rotation.x = -0.015 * (1 - p);
      car.userData.wheels.forEach((w) => { w.rotation.x = -dist / 0.34; w.userData.spoke.rotation.x = -dist / 0.34; });
      car.userData.rain.material.opacity = Math.floor(t * 8) % 2 ? 1 : 0.3;
      for (let i = 0; i < DN; i++) { const z = ((i * 6 + dist) % (DN * 6)) - DN * 6 + 6;
        for (const sd of [0, 1]) { dashes.setMatrixAt(i * 2 + sd, m4.makeTranslation(sd ? -3.5 : 3.5, 0.01, z));
          kerbs.setMatrixAt(i * 2 + sd, m4.makeTranslation(sd ? -6.6 : 6.6, 0.02, z + (i % 2) * 1.5)); } }
      dashes.instanceMatrix.needsUpdate = kerbs.instanceMatrix.needsUpdate = true;
      pose(0.9 + shake(5, 0.02), 0.62 + shake(6, 0.015), 0.5, 0.05, -0.02, 36 * punch);
      strC.userData.update(t, vel); strC.material.opacity = 0.2 + 0.3 * p;
    } else if (shot === 3) { // D: free fall — diver tumbles slowly, clouds tear upward
      pose(shake(7, 0.03), shake(8, 0.03), 0, 0, Math.sin(t * 1.5) * 0.06, 36 * punch);
      diver.rotation.set(0.3, Math.sin(t * 2) * 0.3, 0.25 + p * 0.3); diver.position.y = -0.9 + Math.sin(t * 3) * 0.05;
      clouds.forEach((s) => { const d = s.userData; const yy = ((d.ph * 60 + t * 55) % 60) - 30; s.position.set(d.x, yy, d.z); });
      strD.userData.update(t, 50);
    } else if (shot === 4) { // E: slow crane up the ridge, a lone figure on the near crest
      pose(0, K.lerp(-1, 3, K.eio(p)), 0, -0.04 + p * 0.05, 0, 34 * punch);
      hazeE.userData.update(t, [1, 0.1, 0]);
    } else if (shot === 5) { // F: slow-motion landing — touchdown at u=0.25, body compresses, snow sprays
      const td = 0.25, air = K.cl(1 - u / td), sm = Math.max(0, u - td) * 0.35;
      rider.position.set(0.1, -1.2 + 1.6 * air * air, -6.5 - u * 0.6); rider.rotation.set(-0.15 * air, 0, 0.12 * air);
      rb.scale.set(1, u > td ? 1 - 0.18 * Math.exp(-sm * 8) * Math.sin(Math.min(1, sm * 6) * Math.PI) - 0.06 : 1, 1);
      for (let i = 0; i < SN; i++) { const vx = sv[i * 3], vy = sv[i * 3 + 1], vz = sv[i * 3 + 2];
        spos.set(u > td ? [rider.position.x + vx * sm, -1.2 + Math.max(0, vy * sm - 4.9 * sm * sm), rider.position.z + vz * sm] : [0, -50, 0], i * 3); }
      sg.attributes.position.needsUpdate = true; spray.material.opacity = 0.9 * (1 - K.seg(sm, 0.15, 0.4));
      pose(-0.4 + shake(9, 0.008), -0.35, 0, -0.01, 0.015, 32 * punch);
    } else if (shot === 6) { // G: silence ends — light finds the can, slow push
      const k = t - T_CAN, li = K.eo(K.seg(k, 0, 0.8));
      spot.intensity = 26 * li; canGlow.material.opacity = 0.5 * li; can.rotation.y = -0.75 + k * 0.18;
      can.userData.body.material.envMapIntensity = 0.6 * li;
      cam.position.set(Math.sin(k * 0.05) * 0.2, 0.78, K.lerp(6.4, 5.2, K.eio(K.seg(k, 0, 3.9)))); cam.fov = 30; cam.updateProjectionMatrix(); cam.lookAt(0, 0.64, 0);
      motes.userData.update(t, [0.05, 0.3, 0]);
    }
  }
  render(0);
  return { scene, camera: cam, render };
}
