// Scene 1 — Hook. Macro can in darkness (0–5.8), the world snaps in behind it (5.8),
// and at "identidad" (8.7) light bursts outward and the universe locks in around the product.
import * as THREE from 'three';
import * as K from '../assets/kit.js';

const T_WORLD = 5.8, T_ID = 8.7;
const FLOOR = -30; // the can sits on a pillar overlooking a valley; the world spreads below

function glowTex(rays = false) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  if (rays) {
    const r = K.rng(21); x.translate(128, 128);
    for (let i = 0; i < 90; i++) { const a = r() * Math.PI * 2, w = 0.004 + r() * 0.02, L = 60 + r() * 68;
      x.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.6})`; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a - w) * L, Math.sin(a - w) * L); x.lineTo(Math.cos(a + w) * L, Math.sin(a + w) * L); x.fill(); }
    x.globalCompositeOperation = 'destination-in'; x.setTransform(1, 0, 0, 1, 0, 0);
  }
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const GLOW = glowTex(), RAYS = glowTex(true);
const sprite = (color, s, parent, tex = GLOW) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.scale.setScalar(s); m.userData.c0 = new THREE.Color(color); parent.add(m); return m; };
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const additive = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, ...o });
// reveal a TubeGeometry along its length (indices are grouped per tubular segment)
const drawTube = (m, p) => { const g = m.geometry, per = g.parameters.radialSegments * 6; g.setDrawRange(0, Math.floor(K.cl(p) * g.parameters.tubularSegments) * per); m.visible = p > 0; };

function makeJet() {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x2b3038, metalness: 0.85, roughness: 0.35 });
  const add = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
  add(new THREE.CylinderGeometry(0.55, 0.38, 7, 12), 0, 0, 0, 0, 0, Math.PI / 2);
  add(new THREE.ConeGeometry(0.38, 2.4, 12), 4.7, 0, 0, 0, 0, -Math.PI / 2);
  for (const s of [1, -1]) { add(new THREE.BoxGeometry(2.2, 0.08, 4.6), -0.7, 0, s * 2.4, 0, s * 0.5, 0); add(new THREE.BoxGeometry(1.1, 0.06, 1.6), -3.0, 0, s * 0.9, 0, s * 0.5, 0); }
  add(new THREE.BoxGeometry(1.6, 1.9, 0.08), -2.9, 0.95, 0, 0, 0, -0.4);
  g.userData.burner = sprite(hdr(0xff8a3a, 3), 2.6, g); g.userData.burner.position.set(-3.9, 0, 0);
  sprite(hdr(0xff2020, 4), 0.9, g).position.set(-1.6, 0, 4.4); sprite(hdr(0x30ff60, 4), 0.9, g).position.set(-1.6, 0, -4.4);
  const tw = sprite(hdr(0xffffff, 4), 0.8, g); tw.position.set(-3.6, 1.9, 0); g.userData.strobe = tw;
  // contrail: long additive ribbon fading to the tail
  const c = document.createElement('canvas'); c.width = 256; c.height = 8; const x = c.getContext('2d'); const lg = x.createLinearGradient(0, 0, 256, 0);
  lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(255,255,255,0.7)'); x.fillStyle = lg; x.fillRect(0, 0, 256, 8);
  const trail = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.5), additive({ map: new THREE.CanvasTexture(c), color: hdr(0xbcd7ff, 0.8) })); trail.position.set(-34, 0, 0); g.add(trail);
  return g;
}

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
  scene.environment = K.envMap(renderer);
  const fogCol = new THREE.Color(0x15121d); scene.fog = new THREE.Fog(fogCol.clone(), 60, 720);
  const cam = K.camera(28); scene.add(cam);
  const rig = K.lightRig(scene, { keyI: 2.6, rimI: 6 });

  // ---------- hero: the can on a black stone pillar ----------
  const can = K.makeCan({ droplets: 700, seed: 11 }); scene.add(can);
  can.userData.body.material.envMapIntensity = 0.7;
  const stone = new THREE.MeshPhysicalMaterial({ color: 0x07080b, roughness: 0.18, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, -FLOOR, 72), stone); pillar.position.y = FLOOR / 2; scene.add(pillar);
  const rimLine = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.012, 6, 160), new THREE.MeshBasicMaterial({ color: hdr(0xbcd7ff, 2.2), fog: false }));
  rimLine.rotation.x = Math.PI / 2; scene.add(rimLine);
  const backLight = new THREE.PointLight(0xffb070, 0, 0, 2); backLight.position.set(0, 0.9, -1.4); scene.add(backLight);
  const sweep = new THREE.SpotLight(0xdfe8ff, 0, 8, 0.25, 0.8, 2); scene.add(sweep); scene.add(sweep.target); sweep.target.position.set(0, 0.6, 0);
  const motes = K.dust(scene, { count: 420, area: [3.2, 2.4, 3.2], color: 0xffd9a8, size: 0.006, speed: 0.05, seed: 5, opacity: 0.55 }); motes.position.y = 0.9;

  // ---------- the world (hidden until 5.8) ----------
  const world = new THREE.Group(); scene.add(world);
  const skyTop = new THREE.Color(0x060a1c), skyBot = new THREE.Color(0x4a2414), black = new THREE.Color(0);
  const sky = K.sky(world, 0, 0, 800);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ color: 0x0b0c10, roughness: 0.85, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR; world.add(floor);
  const mFar = K.mountains(world, { seed: 7, color: 0x1c2131, z: -340, width: 900, height: 150 }); mFar.position.y = FLOOR;
  const mNear = K.mountains(world, { seed: 2, color: 0x0f121a, z: -240, width: 700, height: 70, snow: false }); mNear.position.y = FLOOR;
  const hemi = new THREE.HemisphereLight(0x4a5a80, 0x0a0806, 0); world.add(hemi);
  const moon = new THREE.DirectionalLight(0x9fb4ff, 0); moon.position.set(-30, 60, 80); world.add(moon);

  // racetrack: dark ribbon with two glowing edge lines that draw themselves in
  const Y = FLOOR + 0.08;
  const track = new THREE.CatmullRomCurve3([[-55, -62], [-18, -50], [12, -64], [48, -56], [60, -88], [32, -112], [-6, -98], [-38, -124], [-66, -96]].map(([x, z]) => new THREE.Vector3(x, Y, z)), true, 'centripetal');
  const N = 500, half = 4, pts = track.getSpacedPoints(N), up = new THREE.Vector3(0, 1, 0);
  const edgeL = [], edgeR = [], rib = new Float32Array((N + 1) * 6), idx = [];
  pts.forEach((p, i) => { const tg = track.getTangentAt(i / N), n = new THREE.Vector3().crossVectors(up, tg).normalize();
    const l = p.clone().addScaledVector(n, half), r = p.clone().addScaledVector(n, -half); rib.set([l.x, l.y, l.z, r.x, r.y, r.z], i * 6);
    if (i < N) { edgeL.push(l.clone().setY(Y + 0.25)); edgeR.push(r.clone().setY(Y + 0.25)); idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); } });
  const ribGeo = new THREE.BufferGeometry(); ribGeo.setAttribute('position', new THREE.BufferAttribute(rib, 3)); ribGeo.setIndex(idx); ribGeo.computeVertexNormals();
  const ribbon = new THREE.Mesh(ribGeo, new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.45, metalness: 0.3, side: THREE.DoubleSide })); world.add(ribbon);
  const edges = [[edgeL, 0xffffff, 2.2], [edgeR, 0xff7a2f, 3]].map(([e, c, k]) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(e, true), 600, 0.22, 4, true), new THREE.MeshBasicMaterial({ color: hdr(c, k), fog: false })); world.add(m); return m; });
  // cars as light trails running the circuit
  const cars = []; for (let i = 0; i < 7; i++) { const trail = []; for (let k = 0; k < 9; k++) trail.push(sprite(hdr(i % 3 ? 0xff3a2a : 0xfff2e0, 3 * (1 - k / 10)), 2.2 - k * 0.12, world)); cars.push(trail); }

  // floodlight towers
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1d24, metalness: 0.7, roughness: 0.4 });
  const towers = [[-64, -70], [64, -72], [-56, -132], [56, -134], [-22, -150], [22, -152]].map(([x, z], i) => {
    const g = new THREE.Group(); g.position.set(x, FLOOR, z); world.add(g);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 40, 8), poleMat); pole.position.y = 20; g.add(pole);
    const head = new THREE.Mesh(new THREE.BoxGeometry(7, 3.2, 0.6), new THREE.MeshBasicMaterial({ color: 0, fog: false })); head.position.set(0, 41, 0); head.lookAt(0, 30, 80); g.add(head);
    const glow = sprite(hdr(0xfff1d6, 1), 22, g); glow.position.set(0, 41, 1);
    // searchlight beam (opens at "identidad")
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(7, 0.6, 220, 24, 1, true).translate(0, 110, 0), new THREE.ShaderMaterial({ uniforms: { uOp: { value: 0 }, uCol: { value: new THREE.Color(0xcfe0ff) } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform float uOp; uniform vec3 uCol; varying vec2 vUv; void main(){ float a = pow(1.0 - vUv.y, 2.2) * uOp; gl_FragColor = vec4(uCol * a, a); }' }));
    beam.position.set(0, 41, 0); g.add(beam);
    return { g, head, glow, beam, on: 6.3 + i * 0.22, sway: i * 1.7 };
  });

  // grandstand + crowd lights (phone lights, camera flashes)
  const stand = new THREE.Mesh(new THREE.BoxGeometry(170, 1, 34), new THREE.MeshStandardMaterial({ color: 0x0c0d12, roughness: 0.9 }));
  stand.position.set(0, FLOOR + 10, -168); stand.rotation.x = 0.62; world.add(stand);
  const CN = 3800, cr = K.rng(77), cpos = new Float32Array(CN * 3), cph = new Float32Array(CN), cord = new Float32Array(CN), ccol = new Float32Array(CN * 3);
  const warm = new THREE.Color(0xffd7a0), cool = new THREE.Color(0xcfe2ff), ember = new THREE.Color(0xff7a2f);
  for (let i = 0; i < CN; i++) { const u = cr(), v = cr(); const x = (u - 0.5) * 165, d = v * 32;
    cpos.set([x, FLOOR + 1 + d * Math.sin(0.62) + 0.6, -154 - d * Math.cos(0.62)], i * 3); cph[i] = cr(); cord[i] = K.cl(u * 0.8 + cr() * 0.2);
    const c = cr() < 0.55 ? warm : cr() < 0.7 ? cool : ember; ccol.set([c.r, c.g, c.b], i * 3); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(cpos, 3)); cg.setAttribute('aPh', new THREE.BufferAttribute(cph, 1));
  cg.setAttribute('aOrd', new THREE.BufferAttribute(cord, 1)); cg.setAttribute('aCol', new THREE.BufferAttribute(ccol, 3));
  const crowdMat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uRev: { value: 0 }, uBoost: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aPh; attribute float aOrd; attribute vec3 aCol; uniform float uT, uRev, uBoost; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); float on = smoothstep(aOrd, aOrd + 0.08, uRev);
        float tw = 0.55 + 0.45*sin(uT*(2.0 + aPh*4.0) + aPh*40.0); float fl = step(0.975 - uBoost*0.05, fract(aPh*13.7 + uT*(0.5 + aPh)))*4.0;
        vC = aCol * on * (tw + fl) * (1.2 + uBoost*1.5); gl_PointSize = max(1.5, (2.0 + aPh*2.5)*(260.0 / -mv.z)); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: 'varying vec3 vC; void main(){ float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)); gl_FragColor = vec4(vC*a, a); }' });
  world.add(new THREE.Points(cg, crowdMat));

  // aircraft formation crossing the sky
  const jets = [[0, 0, 0], [-9, -2.5, 7], [-9, -2.5, -7]].map((o) => { const j = makeJet(); world.add(j); return { j, o }; });

  // world haze
  const haze = K.dust(world, { count: 1400, area: [90, 40, 120], color: 0xbcd7ff, size: 0.16, speed: 0.6, seed: 31, opacity: 0.35 }); haze.position.set(0, -10, -60);

  // ---------- the "identidad" burst ----------
  const halo = sprite(hdr(0xffe2b0, 3), 1, scene); halo.position.set(0, 0.75, -1.6);
  const rays = sprite(hdr(0xffd08a, 2.2), 1, scene, RAYS); rays.position.set(0, 0.75, -1.7);
  const ringV = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 128), additive({ color: hdr(0xfff0d8, 2.5), side: THREE.DoubleSide })); scene.add(ringV);
  const ringF = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 256), additive({ color: hdr(0xffc27a, 3), side: THREE.DoubleSide })); ringF.rotation.x = -Math.PI / 2; ringF.position.set(0, FLOOR + 0.3, -20); scene.add(ringF);
  const orbits = [[16, 0.035, 0.35, 0.3, 0x9fc4ff], [28, 0.05, -0.25, -0.45, 0xffb46a], [46, 0.08, 0.15, 0.18, 0xbcd7ff]].map(([R, r, tx, tz, c], i) => {
    const pts = []; for (let k = 0; k < 256; k++) { const a = (k / 256) * Math.PI * 2 + Math.PI * 1.5; pts.push(new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R)); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 400, r, 4, true), new THREE.MeshBasicMaterial({ color: hdr(c, 2.4), fog: false, transparent: true }));
    const g = new THREE.Group(); g.rotation.set(tx, 0, tz); g.position.y = 0.6; g.add(m); scene.add(g); return { g, m, i };
  });
  const speed = K.streaks(scene, { count: 140, len: 5, area: [14, 24, 70], color: 0xdfe8ff, seed: 8, opacity: 0 }); scene.remove(speed); cam.add(speed);

  const camTarget = new THREE.Vector3(), tmp = new THREE.Vector3();

  function render(t) {
    const wOn = t >= T_WORLD, wp = K.seg(t, T_WORLD, T_WORLD + 1.5), id = K.seg(t, T_ID, T_ID + 1.6), idOn = t >= T_ID;
    const hand = (k) => (Math.sin(t * 1.3 + k) * 0.6 + Math.sin(t * 2.9 + k * 2.1) * 0.3 + Math.sin(t * 5.3 + k * 3.7) * 0.1);

    // ---- camera: macro creep -> violent dolly-out -> slow crane/orbit -> impact shake
    const mp = K.eio(K.seg(t, 0, T_WORLD)), po = K.eo(K.seg(t, T_WORLD, T_WORLD + 1.4)), drift = K.seg(t, T_WORLD + 1.4, 10.3);
    const theta = K.lerp(-0.42, 0.06, mp) + K.lerp(0, -0.16, drift);
    let r = K.lerp(1.5, 0.92, mp), y = K.lerp(0.98, 0.8, mp);
    r = K.lerp(r, 7.2, po) + drift * 2.2; y = K.lerp(y, 1.7, po) + drift * 0.6;
    camTarget.set(0, 0.72, 0).lerp(tmp.set(0, -3.5, -45), po);
    const shake = idOn ? Math.exp(-(t - T_ID) * 5) * Math.sin((t - T_ID) * 46) : 0;
    const hAmp = K.lerp(0.004, 0.03, po);
    cam.position.set(Math.sin(theta) * r + hand(0) * hAmp, y + hand(1) * hAmp + shake * 0.06, Math.cos(theta) * r + (idOn ? K.eo(id) * 0.8 : 0));
    cam.fov = K.lerp(26, 40, po); cam.updateProjectionMatrix(); cam.lookAt(camTarget); cam.rotation.z += hand(2) * 0.004 + shake * 0.006;

    // ---- can + macro light
    can.rotation.y = 0.5 + t * 0.32;
    sweep.position.set(Math.sin(t * 0.5 - 1.2) * 2.4, 2.4, Math.cos(t * 0.5 - 1.2) * 2.4); sweep.intensity = 14 * (1 - po * 0.6);
    rig.children[1].intensity = 6 + (idOn ? 6 * (1 - id) : 0);
    backLight.intensity = (wOn ? 6 : 1.5) + (idOn ? 60 * Math.exp(-(t - T_ID) * 3) + 8 : 0);
    motes.userData.update(t, [0.05, 0.4, 0]);

    // ---- world
    world.visible = wOn;
    const wk = wOn ? K.lerp(0.55, 1, K.eo(wp)) : 0;
    sky.material.uniforms.top.value.copy(black).lerp(skyTop, wk); sky.material.uniforms.bottom.value.copy(black).lerp(skyBot, wk * (1 + 0.35 * K.eo(id)));
    scene.fog.color.copy(black).lerp(fogCol, wk);
    const rise = K.eo(K.seg(t, T_WORLD, T_WORLD + 1.4)); mFar.scale.y = K.lerp(0.05, 1, rise); mNear.scale.y = K.lerp(0.05, 1, K.eo(K.seg(t, T_WORLD + 0.1, T_WORLD + 1.2)));
    hemi.intensity = 0.7 * wk; moon.intensity = 0.9 * wk + (idOn ? 0.6 * K.eo(id) : 0);
    const tp = K.eio(K.seg(t, 6.0, 7.6)); edges.forEach((m) => drawTube(m, tp)); ribGeo.setDrawRange(0, Math.floor(tp * N) * 6);
    cars.forEach((trail, i) => trail.forEach((s, k) => { const u = (((t - 7.2) * 0.055 * (1 + i * 0.04) + i / 7 - k * 0.0035) % 1 + 1) % 1;
      track.getPointAt(u, s.position); s.position.y += 0.6; s.visible = t > 7.2 && u < tp + 0.001; s.material.opacity = K.seg(t, 7.2, 7.6); }));
    towers.forEach((T, i) => { const on = K.seg(t, T.on, T.on + 0.12), boost = idOn ? 1 + 0.8 * K.eo(id) : 1;
      T.head.material.color.copy(hdr(0xfff1d6, 3.5 * on * boost)); T.glow.material.opacity = on * 0.9; T.glow.scale.setScalar(22 * boost);
      T.beam.material.uniforms.uOp.value = idOn ? 0.22 * K.eo(K.seg(t, T_ID + i * 0.05, T_ID + 0.5 + i * 0.05)) : 0;
      T.beam.rotation.set(Math.sin(t * 0.6 + T.sway) * 0.28 - 0.12, 0, Math.sin(t * 0.45 + T.sway * 1.3) * 0.35); });
    crowdMat.uniforms.uT.value = t; crowdMat.uniforms.uRev.value = K.lerp(-0.1, 1.1, K.seg(t, 6.7, 8.1)); crowdMat.uniforms.uBoost.value = idOn ? K.eo(id) : 0;
    jets.forEach(({ j, o }) => { const x = K.lerp(-75, 70, K.seg(t, 6.0, 10.3)); j.position.set(x + o[0], 34 + o[1] + Math.sin(t * 0.8) * 0.6, -170 + o[2]); j.rotation.set(0.12 + Math.sin(t * 0.7) * 0.03, 0, 0.05);
      j.userData.strobe.visible = Math.floor(t * 2.4) % 2 === 0; j.userData.burner.scale.setScalar(2.4 + Math.sin(t * 31) * 0.3); });
    haze.userData.update(t, [0.6, 0.1, 0.3]);

    // ---- burst at "identidad"
    const b = K.eo(K.seg(t, T_ID, T_ID + 0.9));
    halo.visible = rays.visible = ringV.visible = ringF.visible = idOn;
    halo.scale.setScalar(K.lerp(0.5, 9, b)); halo.material.opacity = idOn ? K.lerp(1, 0.32, K.seg(t, T_ID + 0.2, 10.3)) : 0;
    rays.scale.setScalar(K.lerp(1, 13, b)); rays.material.rotation = t * 0.08; rays.material.opacity = idOn ? K.lerp(0.9, 0.28, K.seg(t, T_ID + 0.3, 10.3)) : 0;
    const rv = K.eo(K.seg(t, T_ID, T_ID + 0.8)); ringV.position.set(0, 0.7, 0); ringV.lookAt(cam.position); ringV.scale.setScalar(0.3 + rv * 22); ringV.material.opacity = 1 - rv;
    const rf = K.eo(K.seg(t, T_ID + 0.05, T_ID + 1.5)); ringF.scale.setScalar(2 + rf * 300); ringF.material.opacity = 1 - rf;
    orbits.forEach(({ g, m, i }) => { const p = K.eio(K.seg(t, T_ID + 0.1 + i * 0.18, T_ID + 0.9 + i * 0.18)); drawTube(m, p); m.material.opacity = 0.85;
      g.rotation.y = t * (0.05 + i * 0.02) * (i % 2 ? -1 : 1); });
    const sk = Math.max(K.seg(t, T_WORLD, T_WORLD + 0.15) * (1 - K.seg(t, T_WORLD + 0.4, T_WORLD + 1.3)), idOn ? 1 - K.seg(t, T_ID, T_ID + 0.7) : 0);
    speed.material.opacity = 0.5 * sk; speed.visible = sk > 0; speed.userData.update(t, idOn ? -45 : -70);
  }
  render(0);
  return { scene, camera: cam, render };
}
