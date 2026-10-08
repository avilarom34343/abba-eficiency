// Scene 9 — The world. The can ignites into an abstract energy core; each word of the line
// ("energía, velocidad, riesgo, adrenalina") sends a shockwave across an energy grid that builds a piece
// of the film's world: the grid itself, a racing circuit, mountains + athletes, a crowd + aircraft.
// buildWorld / aim / glow helpers are exported so scene 10 rebuilds the same world around the can.
import * as THREE from 'three';
import * as K from '../assets/kit.js';

// beats, local seconds (line 70.0–73.19 global; word onsets estimated from the cue)
const B_E = 0.75, B_V = 1.45, B_R = 2.2, B_A = 2.85;

export const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
function glowTex(rays) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  if (rays) {
    const r = K.rng(41); x.translate(128, 128);
    for (let i = 0; i < 80; i++) { const a = r() * Math.PI * 2, w = 0.004 + r() * 0.018, L = 60 + r() * 68;
      x.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.6})`; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a - w) * L, Math.sin(a - w) * L); x.lineTo(Math.cos(a + w) * L, Math.sin(a + w) * L); x.fill(); }
    x.globalCompositeOperation = 'destination-in'; x.setTransform(1, 0, 0, 1, 0, 0);
  }
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let _glow, _rays;
export function sprite(color, s, parent, rays = false) {
  _glow ??= glowTex(false); _rays ??= glowTex(true);
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: rays ? _rays : _glow, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.scale.setScalar(s); parent.add(m); return m;
}
export const additive = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, ...o });
const drawTube = (m, p) => { const g = m.geometry, per = g.parameters.radialSegments * 6; g.setDrawRange(0, Math.floor(K.cl(p) * g.parameters.tubularSegments) * per); m.visible = p > 0; };

/** Place the camera on an orbit around the origin: distance D, height H, yaw, framing world point (0,focusY,0) at screen NDC y = ndcY. */
export function aim(cam, D, H, yaw, focusY, ndcY = 0, roll = 0) {
  cam.position.set(Math.sin(yaw) * D, H, Math.cos(yaw) * D);
  const pitch = Math.atan2(H - focusY, D) + Math.atan(ndcY * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
  cam.rotation.order = 'YXZ'; cam.rotation.set(-pitch, yaw, roll);
}

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }';

/** The world that energy builds: energy grid floor, circuit, mountains + spires + athletes, stadium crowd, aircraft, sky.
 *  Driven entirely by set(t, s) with s = { reach, waves[4], speed, risk, adr, sky, gain, core }. */
export function buildWorld(scene, { fog = 0x0c0f1a } = {}) {
  const root = new THREE.Group(); scene.add(root);
  const fogCol = new THREE.Color(fog); scene.fog = new THREE.FogExp2(fogCol.clone(), 0.004);
  const skyTop = new THREE.Color(0x050a1e), skyBot = new THREE.Color(0x3a1d12), black = new THREE.Color(0);
  const sky = K.sky(root, 0, 0, 900);

  // energy grid floor (polar rings + spokes + fine grid, lit only where the energy has reached)
  const groundMat = new THREE.ShaderMaterial({
    uniforms: { uReach: { value: 0 }, uWaves: { value: new THREE.Vector4(-1, -1, -1, -1) }, uFog: { value: fogCol }, uFogD: { value: 0.004 }, uGain: { value: 1 }, uCore: { value: 0 }, uT: { value: 0 } },
    vertexShader: 'varying vec3 vW; varying float vD; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mv = viewMatrix*w; vD = -mv.z; gl_Position = projectionMatrix*mv; }',
    fragmentShader: `uniform float uReach, uFogD, uGain, uCore, uT; uniform vec4 uWaves; uniform vec3 uFog; varying vec3 vW; varying float vD;
      float ln(float v, float w){ float d = fwidth(v); float dist = abs(fract(v + 0.5) - 0.5); return (1.0 - smoothstep(w, w + d * 1.5, dist)) * smoothstep(0.45, 0.08, d); }
      float wv(float r, float w){ return w > 0.0 ? exp(-abs(r - w) * 0.7) * exp(-w * 0.012) : 0.0; }
      void main(){ float r = length(vW.xz); float a = atan(vW.z, vW.x) / 6.28318;
        float rings = ln(r / 6.0, 0.02);
        float spokes = ln(a * 48.0 + sin(r * 0.07) * 0.35, 0.03) * smoothstep(3.0, 9.0, r);
        float grid = ln(vW.x / 2.0, 0.025) + ln(vW.z / 2.0, 0.025);
        float pat = rings * 0.9 + spokes * 0.65 + grid * 0.18;
        float inside = 1.0 - smoothstep(uReach - 14.0, uReach + 1.0, r);
        float edge = uReach > 0.01 ? exp(-abs(r - uReach) * 0.3) : 0.0;
        float W = wv(r, uWaves.x) + wv(r, uWaves.y) + wv(r, uWaves.z) + wv(r, uWaves.w);
        vec3 warm = vec3(1.0, 0.58, 0.22), cool = vec3(0.32, 0.52, 1.0);
        vec3 c = mix(warm, cool, smoothstep(8.0, 80.0, r));
        float flick = 0.85 + 0.15 * sin(uT * 9.0 + r * 0.8);
        float e = pat * (inside * 0.55 * flick + edge * 2.2) + W * (0.35 + pat * 2.6) + edge * 0.12;
        vec3 col = vec3(0.010, 0.012, 0.018) + c * e * uGain * 1.5 + warm * exp(-r * 0.45) * uCore;
        float f = 1.0 - exp(-pow(vD * uFogD, 2.0)); gl_FragColor = vec4(mix(col, uFog, f), 1.0); }`,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), groundMat); ground.rotation.x = -Math.PI / 2; root.add(ground);

  // velocidad: a racing circuit that draws itself around the source, with car light trails
  const N = 360, curve = new THREE.CatmullRomCurve3(Array.from({ length: 24 }, (_, k) => { const a = (k / 24) * Math.PI * 2; const R = 30 + 6 * Math.sin(3 * a + 0.6) + 3 * Math.sin(5 * a + 1.2);
    return new THREE.Vector3(Math.cos(a) * R, 0.06, Math.sin(a) * R); }), true, 'centripetal');
  const pts = curve.getSpacedPoints(N), up = new THREE.Vector3(0, 1, 0), rib = new Float32Array((N + 1) * 6), idx = [], eL = [], eR = [];
  pts.forEach((p, i) => { const n = new THREE.Vector3().crossVectors(up, curve.getTangentAt((i % N) / N)).normalize();
    const l = p.clone().addScaledVector(n, 2.6), r = p.clone().addScaledVector(n, -2.6); rib.set([l.x, l.y, l.z, r.x, r.y, r.z], i * 6);
    if (i < N) { eL.push(l.clone().setY(0.2)); eR.push(r.clone().setY(0.2)); idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); } });
  const ribGeo = new THREE.BufferGeometry(); ribGeo.setAttribute('position', new THREE.BufferAttribute(rib, 3)); ribGeo.setIndex(idx); ribGeo.computeVertexNormals();
  root.add(new THREE.Mesh(ribGeo, new THREE.MeshStandardMaterial({ color: 0x0d0e12, roughness: 0.4, metalness: 0.4, side: THREE.DoubleSide })));
  const edges = [[eL, 0xffffff, 2.0], [eR, 0xff7a2f, 3.0]].map(([e, c, k]) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(e, true), 480, 0.14, 4, true), new THREE.MeshBasicMaterial({ color: hdr(c, k), fog: false })); root.add(m); return m; });
  const cars = Array.from({ length: 6 }, (_, i) => Array.from({ length: 8 }, (_, k) => sprite(hdr(i % 2 ? 0xff3a2a : 0xfff2e0, 3.2 * (1 - k / 9)), 2.4 - k * 0.15, root)));

  // riesgo: mountains + rock spires with athletes on the summits
  const mFar = K.mountains(root, { seed: 5, color: 0x1a2032, z: -330, width: 1100, height: 150 });
  const mNear = K.mountains(root, { seed: 12, color: 0x0d1018, z: -220, width: 800, height: 70, snow: false });
  const rock = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.85, metalness: 0.05, flatShading: true });
  const spires = [[-46, -58, 30, 'jump'], [38, -74, 38, 'stand'], [-86, -30, 22, null], [76, -36, 26, 'board'], [6, -108, 46, null], [-20, -88, 18, null]].map(([x, z, h, pose], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
    const m = new THREE.Mesh(new THREE.ConeGeometry(h * 0.22, h, 7, 3), rock); m.position.y = h / 2; m.rotation.y = i; g.add(m);
    if (pose) { const f = K.figure({ pose }); f.scale.setScalar(1.8); f.position.y = h - 0.4; f.rotation.y = i * 1.3; g.add(f);
      const halo = sprite(hdr(0xffb36a, 1.6), 9, g); halo.position.set(0, h + 1.6, -2); }
    return { g, h, i };
  });

  // adrenalina: stadium crowd (phone lights + flashes), searchlights, aircraft contrails
  const CN = 3600, cr = K.rng(88), cpos = new Float32Array(CN * 3), cph = new Float32Array(CN), cord = new Float32Array(CN), ccol = new Float32Array(CN * 3);
  const warm = new THREE.Color(0xffd7a0), cool = new THREE.Color(0xcfe2ff), ember = new THREE.Color(0xff7a2f);
  for (let i = 0; i < CN; i++) { const u = cr(), tier = cr(); const a = -Math.PI * (0.12 + u * 0.76), R = 92 + tier * 26;
    cpos.set([Math.cos(a) * R, 0.8 + tier * 14, Math.sin(a) * R], i * 3); cph[i] = cr(); cord[i] = K.cl(Math.abs(u - 0.5) * 1.6 + cr() * 0.2);
    const c = cr() < 0.55 ? warm : cr() < 0.7 ? cool : ember; ccol.set([c.r, c.g, c.b], i * 3); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(cpos, 3)); cg.setAttribute('aPh', new THREE.BufferAttribute(cph, 1));
  cg.setAttribute('aOrd', new THREE.BufferAttribute(cord, 1)); cg.setAttribute('aCol', new THREE.BufferAttribute(ccol, 3));
  const crowdMat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uRev: { value: 0 }, uGain: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aPh; attribute float aOrd; attribute vec3 aCol; uniform float uT, uRev, uGain; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); float on = smoothstep(aOrd, aOrd + 0.1, uRev);
        float tw = 0.55 + 0.45*sin(uT*(2.0 + aPh*4.0) + aPh*40.0); float fl = step(0.97, fract(aPh*13.7 + uT*(0.6 + aPh)))*4.0;
        vC = aCol * on * (tw + fl) * 1.4 * uGain; gl_PointSize = max(1.5, (2.0 + aPh*2.5)*(300.0 / -mv.z)); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: 'varying vec3 vC; void main(){ float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)); gl_FragColor = vec4(vC*a, a); }' });
  root.add(new THREE.Points(cg, crowdMat));
  const beamMat = () => new THREE.ShaderMaterial({ uniforms: { uOp: { value: 0 }, uCol: { value: new THREE.Color(0xcfe0ff) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: VERT, fragmentShader: 'uniform float uOp; uniform vec3 uCol; varying vec2 vUv; void main(){ float a = pow(1.0 - vUv.y, 2.4) * uOp; gl_FragColor = vec4(uCol * a, a); }' });
  const beams = [-0.2, -0.36, -0.5, -0.64, -0.8].map((f, i) => { const a = Math.PI * f, m = new THREE.Mesh(new THREE.CylinderGeometry(6, 0.5, 240, 20, 1, true).translate(0, 120, 0), beamMat());
    m.position.set(Math.cos(a) * 118, 14, Math.sin(a) * 118); root.add(m); return { m, i }; });
  const jets = [[-1, 62, -150, 0.0], [1, 48, -120, 0.25], [-1, 78, -200, 0.45]].map(([dir, y, z, d]) => { const g = new THREE.Group(); root.add(g);
    sprite(hdr(0xfff2e0, 3.5), 5, g); const c = document.createElement('canvas'); c.width = 256; c.height = 8; const x = c.getContext('2d'), lg = x.createLinearGradient(0, 0, 256, 0);
    lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(255,255,255,0.75)'); x.fillStyle = lg; x.fillRect(0, 0, 256, 8);
    const trail = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.9), additive({ map: new THREE.CanvasTexture(c), color: hdr(0xbcd7ff, 1.2) })); trail.position.x = -60; g.add(trail);
    g.scale.x = dir; return { g, dir, y, z, d }; });

  const hemi = new THREE.HemisphereLight(0x4a5a80, 0x0a0806, 0); root.add(hemi);
  const haze = K.dust(root, { count: 900, area: [160, 50, 160], color: 0xbcd7ff, size: 0.18, speed: 0.6, seed: 23, opacity: 0.3 }); haze.position.y = 18;

  function set(t, s) {
    const u = groundMat.uniforms; u.uReach.value = s.reach; u.uGain.value = s.gain ?? 1; u.uCore.value = s.core ?? 0; u.uT.value = t;
    const w = s.waves ?? []; u.uWaves.value.set(w[0] ?? -1, w[1] ?? -1, w[2] ?? -1, w[3] ?? -1);
    const fd = s.fogD ?? 0.004; u.uFogD.value = fd; scene.fog.density = fd;
    const sk = s.sky ?? 0; sky.material.uniforms.top.value.copy(black).lerp(skyTop, sk); sky.material.uniforms.bottom.value.copy(black).lerp(skyBot, sk);
    fogCol.copy(black).lerp(new THREE.Color(fog), 0.25 + 0.75 * sk); scene.fog.color.copy(fogCol); hemi.intensity = 0.8 * sk;

    const sp = s.speed ?? 0; edges.forEach((m) => drawTube(m, K.eio(sp))); ribGeo.setDrawRange(0, Math.floor(K.eio(sp) * N) * 6);
    cars.forEach((trail, i) => trail.forEach((p, k) => { const v = (((t * 0.16 * (1 + i * 0.05)) + i / 6 - k * 0.004) % 1 + 1) % 1;
      curve.getPointAt(v, p.position); p.position.y += 0.6; p.visible = sp > 0.3 && v < K.eio(sp); p.material.opacity = K.seg(sp, 0.3, 0.6); }));

    const rk = s.risk ?? 0; mFar.scale.y = K.lerp(0.02, 1, K.eo(rk)); mNear.scale.y = K.lerp(0.02, 1, K.eo(K.seg(rk, 0.1, 0.9)));
    mFar.visible = mNear.visible = rk > 0;
    spires.forEach(({ g, h, i }) => { const p = K.eo(K.seg(rk, i * 0.08, 0.5 + i * 0.08)); g.position.y = -h * (1 - p); g.visible = p > 0; });

    const ad = s.adr ?? 0; crowdMat.uniforms.uT.value = t; crowdMat.uniforms.uRev.value = K.lerp(-0.1, 1.1, ad); crowdMat.uniforms.uGain.value = s.crowdGain ?? 1;
    beams.forEach(({ m, i }) => { m.material.uniforms.uOp.value = 0.2 * K.seg(ad, 0.2 + i * 0.1, 0.5 + i * 0.1) * (s.beamGain ?? 1); m.rotation.set(Math.sin(t * 0.5 + i * 1.7) * 0.3 - 0.15, 0, Math.sin(t * 0.4 + i) * 0.35); });
    jets.forEach(({ g, dir, y, z, d }) => { const p = K.seg(ad, d, 1) * (s.jetRun ?? 1); g.visible = ad > d; g.position.set(dir * K.lerp(-180, 180, p), y + Math.sin(t * 0.7 + z) * 0.8, z); });
    haze.userData.update(t, [0.5, 0.1, 0.3]);
  }
  return { root, set, ground };
}

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0);
  scene.environment = K.envMap(renderer);
  const cam = K.camera(30); scene.add(cam);
  const rig = K.lightRig(scene, { keyI: 2.2, rimI: 6 });
  const world = buildWorld(scene);

  // the can, which ignites from within and becomes the source
  const can = K.makeCan({ droplets: 400, seed: 19 }); scene.add(can);
  const body = can.userData.body.material; body.emissiveMap = body.map; body.emissive = new THREE.Color(0xffffff);
  const coreLight = new THREE.PointLight(0xffa860, 0, 0, 1.6); coreLight.position.set(0, 1.2, 0); scene.add(coreLight);

  // the energy source: nested wire shells, hot core glow, rays, a light column
  const core = new THREE.Group(); core.position.y = 0.7; scene.add(core);
  const shells = [[0.55, 1, 0xffc27a, 2.4], [1.0, 1, 0x9fc4ff, 1.6], [1.7, 0, 0xffe0b0, 1.0]].map(([r, det, c, k]) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, det), additive({ color: hdr(c, k), wireframe: true })); core.add(m); return m; });
  const hot = sprite(hdr(0xfff0d0, 2), 1, core), halo = sprite(hdr(0xffa850, 1.6), 1, core), rays = sprite(hdr(0xffd08a, 1.8), 1, core, true);
  const ringMat = additive({ color: hdr(0xfff0d8, 2.6), side: THREE.DoubleSide });
  const rings = [B_E, B_V, B_R, B_A].map((b) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.95, 1, 128), ringMat.clone()); core.add(m); return { m, b }; });
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.7, 400, 24, 1, true).translate(0, 200, 0), new THREE.ShaderMaterial({ uniforms: { uOp: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: VERT, fragmentShader: 'uniform float uOp; varying vec2 vUv; void main(){ float a = pow(1.0 - vUv.y, 1.6) * uOp; gl_FragColor = vec4(vec3(1.0, 0.75, 0.45) * a * 2.0, a); }' }));
  scene.add(column);
  const sparks = K.dust(scene, { count: 500, area: [8, 6, 8], color: 0xffc27a, size: 0.035, speed: 0.6, seed: 7, opacity: 0.8 }); sparks.position.y = 2.5;
  const speed = K.streaks(scene, { count: 150, len: 6, area: [16, 26, 70], color: 0xdfe8ff, seed: 3, opacity: 0 }); scene.remove(speed); cam.add(speed);

  function render(t) {
    const ign = K.seg(t, 0, B_E), burst = K.eo(K.seg(t, B_E, B_E + 0.5)), canOn = t < B_E + 0.32;
    const kick = (b, a = 1) => (t >= b ? Math.exp(-(t - b) * 6) * a : 0);
    const pulse = kick(B_E) + kick(B_V, 0.6) + kick(B_R, 0.6) + kick(B_A, 0.8);

    // can: inner glow builds, then white-hot and swallowed by the core
    can.visible = canOn; can.rotation.y = 0.4 + t * 0.9; can.position.y = 0.12 * K.eio(ign);
    body.emissiveIntensity = K.lerp(0, 0.22, K.ei(ign)) + 6 * K.seg(t, B_E - 0.1, B_E + 0.3); can.scale.set(1 - 0.4 * burst, 1 + 0.1 * burst, 1 - 0.4 * burst);

    // core
    const on = K.eo(K.seg(t, B_E - 0.15, B_E + 0.4)), grow = K.eo(K.seg(t, B_E, 4.2));
    core.visible = t > B_E - 0.15;
    hot.scale.setScalar(on * (1.2 + grow * 2.5 + pulse * 1.2)); halo.scale.setScalar(on * (2.8 + grow * 12 + pulse * 3)); halo.material.opacity = 0.45;
    rays.scale.setScalar(on * (4 + grow * 26)); rays.material.rotation = t * 0.12; rays.material.opacity = 0.3 + pulse * 0.3;
    shells.forEach((m, i) => { m.scale.setScalar(on * (1 + grow * (0.5 + i * 0.6) + pulse * 0.25)); m.rotation.set(t * (0.4 + i * 0.2), t * (0.7 - i * 0.45), 0); m.material.opacity = 0.75 - i * 0.15; });
    rings.forEach(({ m, b }) => { const p = K.eo(K.seg(t, b, b + 0.7)); m.visible = t >= b && p < 1; m.scale.setScalar(0.5 + p * 26); m.material.opacity = 1 - p; m.lookAt(cam.position); });
    column.material.uniforms.uOp.value = 0.3 * kick(B_E, 1) + 0.16 * K.eo(K.seg(t, B_A, B_A + 0.6));
    coreLight.intensity = 2 * K.ei(ign) + on * (30 + pulse * 60);
    rig.children[1].intensity = 6 + pulse * 4;
    sparks.userData.update(t, [0, 2.2, 0]); sparks.visible = t > B_E; sparks.scale.setScalar(1 + grow * 3);

    // world: each word is a shockwave that builds the next layer
    const reach = 14 * K.eo(K.seg(t, B_E, B_V)) + 26 * K.eo(K.seg(t, B_V, B_R)) + 50 * K.eo(K.seg(t, B_R, B_A)) + 140 * K.eo(K.seg(t, B_A, 4.2));
    const wave = (b) => (t >= b ? (t - b) * 70 : -1);
    world.set(t, { reach, waves: [wave(B_E), wave(B_V), wave(B_R), wave(B_A)], speed: K.seg(t, B_V, B_V + 0.8), risk: K.seg(t, B_R, B_R + 0.9), adr: K.seg(t, B_A, 4.2),
      sky: K.eo(K.seg(t, B_V, 4.0)), core: on * (2 + pulse * 3), fogD: K.lerp(0.02, 0.0035, K.eo(K.seg(t, B_E, 3.6))) });

    // camera: macro on the can -> pushed back by each shockwave, crane up and orbit over the new world
    const k = K.eio(K.seg(t, 0, 4.2)) * 0.35 + K.eo(K.seg(t, B_E - 0.1, 4.2)) * 0.65, D = 4.6 * Math.pow(15, k), H = K.lerp(0.95, 30, Math.pow(k, 1.15));
    const hand = (s) => Math.sin(t * 1.3 + s) * 0.6 + Math.sin(t * 2.9 + s * 2.1) * 0.3 + Math.sin(t * 5.3 + s * 3.7) * 0.1;
    const shake = kick(B_E, 1) * Math.sin(t * 50) * 0.02 + kick(B_V, 0.5) * Math.sin(t * 44) * 0.012 + kick(B_A, 0.6) * Math.sin(t * 47) * 0.012;
    cam.fov = K.lerp(30, 40, k); cam.updateProjectionMatrix();
    aim(cam, D, H, K.lerp(-0.3, 0.32, k) + hand(0) * 0.004, K.lerp(0.72, 0.7, k), K.lerp(0, -0.38, k) + hand(1) * 0.004 + shake, hand(2) * 0.006 + shake * 0.5);
    const sk = Math.max(kick(B_V, 1), kick(B_A, 0.7)); speed.material.opacity = 0.55 * sk; speed.visible = sk > 0.02; speed.userData.update(t, -60);
  }
  render(0);
  return { scene, camera: cam, render };
}
