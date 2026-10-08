// Scene 7 — Transformation. The can on a table in a dark boardroom (0–1.1). The walls hinge open and fall flat,
// the camera pulls back and cranes up while the room expands into an ecosystem: a circuit around the table,
// a media studio, an aircraft hangar, a stadium bowl full of people, mountains (1.1–4.0). From 4.0
// ("…empresa de entretenimiento") the whole world lights up and the can is a tiny glowing point at its centre.
import * as THREE from 'three';
import * as K from '../assets/kit.js';

const FL = -0.85; // floor height (table top = 0)
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, 'rgba(255,255,255,0.5)'); g.addColorStop(0.55, 'rgba(255,255,255,0.1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const GLOW = glowTex();
const sprite = (color, s, parent) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.scale.setScalar(s); parent.add(m); return m; };
const drawTube = (m, p) => { const g = m.geometry, per = g.parameters.radialSegments * 6; g.setDrawRange(0, Math.floor(K.cl(p) * g.parameters.tubularSegments) * per); m.visible = p > 0; };
const beamMat = (col) => new THREE.ShaderMaterial({ uniforms: { uOp: { value: 0 }, uCol: { value: new THREE.Color(col) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform float uOp; uniform vec3 uCol; varying vec2 vUv; void main(){ float a = pow(1.0 - vUv.y, 2.0) * uOp; gl_FragColor = vec4(uCol * a, a); }' });

// wall panels: dark slats with faint warm seams (they become glowing floor tiles once they fall)
function wallTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#0d0f15'; x.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#11141c' : '#0b0d12'; x.fillRect(i * 32, 0, 32, 256); }
  x.fillStyle = '#3a2a1c'; for (let i = 0; i <= 16; i++) x.fillRect(i * 32 - 1, 0, 2, 256);
  x.fillStyle = '#5b3b22'; x.fillRect(0, 200, 512, 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function makeJet(mat) {
  const g = new THREE.Group();
  const add = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
  add(new THREE.CylinderGeometry(0.55, 0.38, 7, 12), 0, 0, 0, 0, 0, Math.PI / 2);
  add(new THREE.ConeGeometry(0.38, 2.4, 12), 4.7, 0, 0, 0, 0, -Math.PI / 2);
  for (const s of [1, -1]) { add(new THREE.BoxGeometry(2.2, 0.08, 4.6), -0.7, 0, s * 2.4, 0, s * 0.5, 0); add(new THREE.BoxGeometry(1.1, 0.06, 1.6), -3.0, 0, s * 0.9, 0, s * 0.5, 0); }
  add(new THREE.BoxGeometry(1.6, 1.9, 0.08), -2.9, 0.95, 0, 0, 0, -0.4);
  return g;
}

// screen painters for the media studio (abstract sports feeds, LIVE dot, timecode — no brands)
const painters = [
  (x, w, h, t) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a2a5a'); g.addColorStop(1, '#e0773a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#0a0b10'; x.beginPath(); x.moveTo(0, h); for (let i = 0; i <= 8; i++) x.lineTo(i * w / 8, h * (0.55 + 0.2 * Math.abs(Math.sin(i * 1.7)))); x.lineTo(w, h); x.fill();
    const px = ((t * 60) % (w + 40)) - 20; x.fillStyle = '#0a0b10'; x.beginPath(); x.arc(px, h * 0.5 - Math.sin(t * 3) * 20, 7, 0, 7); x.fill(); },
  (x, w, h, t) => { x.fillStyle = '#081018'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffb35a'; x.lineWidth = 3; x.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40; x.lineTo(u * w, h * 0.55 - Math.sin(u * 9 + t * 4) * h * 0.18 * Math.sin(u * 3 + 1)); } x.stroke(); },
  (x, w, h, t) => { x.fillStyle = '#0b0f1c'; x.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { const v = 0.3 + 0.6 * Math.abs(Math.sin(i * 1.3 + t * 2)); x.fillStyle = i % 3 ? '#6f9cff' : '#ff8a3a'; x.fillRect(12 + i * (w - 24) / 8, h * (1 - v) - 6, (w - 24) / 8 - 6, h * v); } },
  (x, w, h, t) => { x.fillStyle = '#121620'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d8dde6'; x.lineWidth = 2; x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.38, h * 0.32, 0, 0, 7); x.stroke();
    for (let i = 0; i < 3; i++) { const a = t * (1.5 + i * 0.3) + i * 2; x.fillStyle = i ? '#ff4a3a' : '#fff'; x.beginPath(); x.arc(w / 2 + Math.cos(a) * w * 0.38, h / 2 + Math.sin(a) * h * 0.32, 5, 0, 7); x.fill(); } },
];
const overlay = (x, w, h, t, i) => { if ((Math.floor(t * 2 + i) % 2) === 0) { x.fillStyle = '#ff2a2a'; x.beginPath(); x.arc(16, 16, 6, 0, 7); x.fill(); }
  x.fillStyle = 'rgba(255,255,255,0.8)'; x.font = 'bold 14px monospace'; const s = Math.floor(t * 30); x.fillText(`00:${String(12 + i).padStart(2, '0')}:${String(Math.floor(s / 30) % 60).padStart(2, '0')}:${String(s % 30).padStart(2, '0')}`, w - 108, h - 10); };

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0);
  scene.environment = K.envMap(renderer);
  const fogCol = new THREE.Color(0x0c0b14); scene.fog = new THREE.Fog(fogCol.clone(), 60, 560);
  const cam = K.camera(32); scene.add(cam);
  const rig = K.lightRig(scene, { keyI: 2.2, rimI: 5 });

  // ---------- table + can ----------
  const can = K.makeCan({ droplets: 400, seed: 17 }); scene.add(can); can.userData.body.material.envMapIntensity = 0.8;
  const gloss = new THREE.MeshPhysicalMaterial({ color: 0x08090c, roughness: 0.15, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 96), gloss); top.position.y = -0.03; scene.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.45, -FL, 32), gloss); leg.position.y = FL / 2; scene.add(leg);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.008, 6, 160), new THREE.MeshBasicMaterial({ color: hdr(0xffb070, 1.6), fog: false })); edge.rotation.x = Math.PI / 2; scene.add(edge);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.4, metalness: 0.3, envMapIntensity: 0.12 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FL; scene.add(floor);
  const pendant = new THREE.PointLight(0xffc48a, 3, 0, 2); scene.add(pendant);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.25, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x15171c, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide })); scene.add(shade);
  const bulb = sprite(hdr(0xffd8a0, 3), 0.35, scene);
  const canHalo = sprite(hdr(0xffc070, 2), 1, scene); canHalo.position.set(0, 0.7, 0);

  // ---------- the room: 4 hinged walls + ceiling ----------
  const R = 4.5, WH = 4, wallMat = new THREE.MeshStandardMaterial({ map: wallTex(), roughness: 0.7, metalness: 0.2, envMapIntensity: 0.3, emissive: 0xffffff, emissiveIntensity: 0, side: THREE.DoubleSide });
  wallMat.emissiveMap = wallMat.map;
  const walls = [[0, 0.7], [Math.PI / 2, 1.15], [-Math.PI / 2, 1.3], [Math.PI, 1.45]].map(([ry, at]) => {
    const pivot = new THREE.Group(); pivot.rotation.y = ry; scene.add(pivot);
    const hinge = new THREE.Group(); hinge.position.set(0, FL, R); pivot.add(hinge); // wall at +z in pivot space, falls outward (+z)
    const w = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, WH), wallMat); w.position.y = WH / 2; hinge.add(w);
    return { hinge, at };
  });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R), new THREE.MeshStandardMaterial({ color: 0x07080b, roughness: 0.9, side: THREE.DoubleSide }));
  ceil.rotation.x = Math.PI / 2; scene.add(ceil);

  // ---------- the world ----------
  const world = new THREE.Group(); scene.add(world);
  const sky = K.sky(world, 0x070b1e, 0x4a2414, 900);
  const mFar = K.mountains(world, { seed: 4, color: 0x1c2234, z: -380, width: 1000, height: 170 }); mFar.position.y += FL;
  const mNear = K.mountains(world, { seed: 12, color: 0x10131c, z: -260, width: 800, height: 80, snow: false }); mNear.position.y += FL;
  const hemi = new THREE.HemisphereLight(0x4a5a80, 0x0a0806, 0); world.add(hemi);
  const moon = new THREE.DirectionalLight(0x9fb4ff, 0); moon.position.set(-40, 80, 60); world.add(moon);
  const dark = new THREE.MeshStandardMaterial({ color: 0x15171d, roughness: 0.55, metalness: 0.6 });

  // circuit around the table: ribbon + glowing edges that draw in + light-trail cars
  const Y = FL + 0.05, N = 400, half = 1.6;
  const track = new THREE.CatmullRomCurve3([[0, 12], [11, 9], [15, -2], [10, -12], [0, -16], [-9, -12], [-15, -4], [-12, 7]].map(([x, z]) => new THREE.Vector3(x, Y, z)), true, 'centripetal');
  const pts = track.getSpacedPoints(N), up = new THREE.Vector3(0, 1, 0), eL = [], eR = [], rib = new Float32Array((N + 1) * 6), idx = [];
  pts.forEach((p, i) => { const n = new THREE.Vector3().crossVectors(up, track.getTangentAt(i / N)).normalize();
    const l = p.clone().addScaledVector(n, half), r = p.clone().addScaledVector(n, -half); rib.set([l.x, l.y, l.z, r.x, r.y, r.z], i * 6);
    if (i < N) { eL.push(l.clone().setY(Y + 0.08)); eR.push(r.clone().setY(Y + 0.08)); idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); } });
  const ribGeo = new THREE.BufferGeometry(); ribGeo.setAttribute('position', new THREE.BufferAttribute(rib, 3)); ribGeo.setIndex(idx); ribGeo.computeVertexNormals();
  world.add(new THREE.Mesh(ribGeo, new THREE.MeshStandardMaterial({ color: 0x17181d, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide })));
  const edges = [[eL, 0xffffff, 2], [eR, 0xff7a2f, 3]].map(([e, c, k]) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(e, true), 500, 0.07, 4, true), new THREE.MeshBasicMaterial({ color: hdr(c, k), fog: false })); world.add(m); return m; });
  const cars = []; for (let i = 0; i < 5; i++) { const tr = []; for (let k = 0; k < 8; k++) tr.push(sprite(hdr(i % 2 ? 0xff3a2a : 0xfff2e0, 3 * (1 - k / 9)), 0.9 - k * 0.07, world)); cars.push(tr); }

  // media studio (right): platform, arc of live screens, lighting truss
  const studio = new THREE.Group(); studio.position.set(24, FL, -26); studio.rotation.y = -0.5; world.add(studio);
  const plat = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 10), dark); plat.position.y = 0.25; studio.add(plat);
  const screens = [];
  for (let i = 0; i < 6; i++) { const a = (i - 2.5) * 0.28, s = K.screen(studio, 3.6, 2.1, (x, w, h, t) => { painters[i % 4](x, w, h, t + i); overlay(x, w, h, t, i); }, { res: 256 });
    s.position.set(Math.sin(a) * 9, 2.2 + (i % 2) * 2.4, -Math.cos(a) * 9 + 4); s.rotation.y = -a; screens.push(s); }
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7, 6), dark); p.position.set(-7 + i * 4.6, 3.5, 3.5); studio.add(p); }
  const truss = new THREE.Mesh(new THREE.BoxGeometry(15, 0.3, 0.3), dark); truss.position.set(0, 7, 3.5); studio.add(truss);
  const studioLights = []; for (let i = 0; i < 5; i++) { const s = sprite(hdr(0xdfe8ff, 2.5), 2.2, studio); s.position.set(-6 + i * 3, 6.8, 3.6); studioLights.push(s); }

  // aircraft hangar (left): half-cylinder arch, warm interior, a jet parked inside
  const hangar = new THREE.Group(); hangar.position.set(-24, FL, -30); hangar.rotation.y = 0.45; world.add(hangar);
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 16, 40, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1b1e26, roughness: 0.5, metalness: 0.7, side: THREE.DoubleSide }));
  arch.rotation.x = Math.PI / 2; arch.rotation.y = Math.PI / 2; hangar.add(arch);
  const back = new THREE.Mesh(new THREE.CircleGeometry(7, 40, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x0c0d11, roughness: 0.8, emissive: 0xff9a50, emissiveIntensity: 0 })); back.position.z = -8; hangar.add(back);
  const hfloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.3, metalness: 0.4, emissive: 0xffa060, emissiveIntensity: 0 })); hfloor.rotation.x = -Math.PI / 2; hfloor.position.y = 0.02; hangar.add(hfloor);
  const jet = makeJet(new THREE.MeshStandardMaterial({ color: 0x8a93a6, metalness: 0.9, roughness: 0.25 })); jet.rotation.y = -Math.PI / 2; jet.position.set(0, 1.4, -1); hangar.add(jet);
  const hLights = []; for (let i = 0; i < 4; i++) { const s = sprite(hdr(0xffcf90, 2.4), 2.4, hangar); s.position.set(0, 6.2, 6 - i * 4); hLights.push(s); }
  const hangLamp = new THREE.PointLight(0xffb070, 0, 30, 1.5); hangLamp.position.set(0, 5, 2); hangar.add(hangLamp);

  // stadium bowl (behind): open frustum + pitch + crowd lights + floodlight towers
  const stadium = new THREE.Group(); stadium.position.set(0, FL, -82); world.add(stadium);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(36, 22, 13, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x0e1016, roughness: 0.85, side: THREE.DoubleSide })); bowl.position.y = 6.5; stadium.add(bowl);
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(36.5, 37, 14, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x1a1d25, roughness: 0.5, metalness: 0.6, emissive: 0x2a3a66, emissiveIntensity: 0.15 })); shell.position.y = 7; stadium.add(shell);
  const crown = new THREE.Mesh(new THREE.TorusGeometry(36.6, 0.12, 6, 160), new THREE.MeshBasicMaterial({ color: hdr(0xbcd7ff, 2), fog: false })); crown.rotation.x = Math.PI / 2; crown.position.y = 14; stadium.add(crown);
  const pitch = new THREE.Mesh(new THREE.CircleGeometry(22, 64), new THREE.MeshStandardMaterial({ color: 0x0d1a12, roughness: 0.8, emissive: 0x1d4a2a, emissiveIntensity: 0 })); pitch.rotation.x = -Math.PI / 2; pitch.position.y = 0.05; stadium.add(pitch);
  const CN = 3200, cr = K.rng(41), cpos = new Float32Array(CN * 3), cph = new Float32Array(CN), cord = new Float32Array(CN), ccol = new Float32Array(CN * 3);
  const warm = new THREE.Color(0xffd7a0), cool = new THREE.Color(0xcfe2ff), ember = new THREE.Color(0xff7a2f);
  for (let i = 0; i < CN; i++) { const a = cr() * Math.PI * 2, v = cr(), rad = K.lerp(22.6, 35.4, v), y = v * 13 + 0.3; cpos.set([Math.cos(a) * rad, y, Math.sin(a) * rad], i * 3);
    cph[i] = cr(); cord[i] = K.cl(v * 0.7 + cr() * 0.3); const c = cr() < 0.55 ? warm : cr() < 0.7 ? cool : ember; ccol.set([c.r, c.g, c.b], i * 3); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(cpos, 3)); cg.setAttribute('aPh', new THREE.BufferAttribute(cph, 1));
  cg.setAttribute('aOrd', new THREE.BufferAttribute(cord, 1)); cg.setAttribute('aCol', new THREE.BufferAttribute(ccol, 3));
  const crowdMat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uRev: { value: 0 }, uBoost: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aPh; attribute float aOrd; attribute vec3 aCol; uniform float uT, uRev, uBoost; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); float on = smoothstep(aOrd, aOrd + 0.1, uRev);
        float tw = 0.55 + 0.45*sin(uT*(2.0 + aPh*4.0) + aPh*40.0); float fl = step(0.975 - uBoost*0.05, fract(aPh*13.7 + uT*(0.5 + aPh)))*4.0;
        vC = aCol * on * (tw + fl) * (1.0 + uBoost*1.4); gl_PointSize = max(1.5, (2.0 + aPh*2.5)*(220.0 / -mv.z)); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: 'varying vec3 vC; void main(){ float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)); gl_FragColor = vec4(vC*a, a); }' });
  stadium.add(new THREE.Points(cg, crowdMat));
  const towers = [0.6, 2.2, 3.8, 5.4].map((a, i) => { const g = new THREE.Group(); g.position.set(Math.cos(a) * 38, 0, Math.sin(a) * 38); stadium.add(g);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 26, 8), dark); pole.position.y = 13; g.add(pole);
    const glow = sprite(hdr(0xfff1d6, 2.2), 7, g); glow.position.y = 27;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(6, 0.5, 180, 20, 1, true).translate(0, 90, 0), beamMat(0xcfe0ff)); beam.position.y = 27; g.add(beam);
    return { glow, beam, ph: i * 1.7 }; });

  // the anchor: a shaft of light falling on the can, and a floor shockwave at "entretenimiento"
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 4, 60, 32, 1, true).translate(0, -30, 0), beamMat(0xffd6a0)); shaft.rotation.x = Math.PI; shaft.position.y = 60; scene.add(shaft);
  const wave = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 160), new THREE.MeshBasicMaterial({ color: hdr(0xffc27a, 3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
  wave.rotation.x = -Math.PI / 2; wave.position.y = FL + 0.1; scene.add(wave);
  const jets = [0, 1].map(() => { const j = makeJet(dark); world.add(j); const b = sprite(hdr(0xff8a3a, 3), 2.4, j); b.position.x = -3.9; return j; });
  const haze = K.dust(world, { count: 900, area: [120, 40, 160], color: 0xbcd7ff, size: 0.18, speed: 0.6, seed: 23, opacity: 0.3 }); haze.position.set(0, 10, -50);
  const motes = K.dust(scene, { count: 300, area: [3, 2.4, 3], color: 0xffd9a8, size: 0.006, speed: 0.05, seed: 6, opacity: 0.5 }); motes.position.y = 0.9;

  const look = new THREE.Vector3(), tmp = new THREE.Vector3(), black = new THREE.Color(0);
  const skyTop = new THREE.Color(0x070b1e), skyBot = new THREE.Color(0x4a2414);

  function render(t) {
    const hand = (k) => Math.sin(t * 1.3 + k) * 0.6 + Math.sin(t * 2.9 + k * 2.1) * 0.3 + Math.sin(t * 5.3 + k * 3.7) * 0.1;
    const ent = K.seg(t, 4.0, 5.2), entOn = t >= 4.0;

    // ---- camera: close on the can -> exponential pull-back + crane (1.0–4.2) -> slow drift/orbit to the end
    const pb = K.eio(K.seg(t, 0.9, 4.2)), dr = K.seg(t, 4.2, 7.7);
    const r = 3.4 * Math.pow(84 / 3.4, pb) + dr * 10, y = K.lerp(1.15, 40, Math.pow(pb, 1.3)) + dr * 4;
    const th = K.lerp(-0.32, 0.04, pb) + dr * 0.14;
    look.set(0, 0.62, 0).lerp(tmp.set(0, 2, -34), K.eio(K.seg(t, 1.3, 4.2)));
    const amp = K.lerp(0.006, 0.25, pb);
    cam.position.set(Math.sin(th) * r + hand(0) * amp, y + hand(1) * amp, Math.cos(th) * r);
    cam.fov = K.lerp(30, 44, pb); cam.updateProjectionMatrix(); cam.lookAt(look); cam.rotation.z += hand(2) * 0.004;

    // ---- can + room light
    can.rotation.y = 0.6 + Math.PI * 0.5 + t * 0.25;
    pendant.position.set(0, 2.8 + K.ei(K.seg(t, 1.0, 2.6)) * 40, 0); shade.position.set(0, pendant.position.y + 0.12, 0); bulb.position.copy(pendant.position);
    pendant.intensity = 1.4 * (1 - K.seg(t, 1.6, 2.6)) + 1;
    shade.visible = bulb.visible = t < 2.6;
    rig.children[1].intensity = 5 + (entOn ? 4 * (1 - ent) : 0);
    canHalo.scale.setScalar(K.lerp(0.9, 5, pb)); canHalo.material.opacity = K.lerp(0.05, 0.8, pb) * (entOn ? 1 + 0.6 * Math.exp(-(t - 4) * 3) : 1);
    motes.userData.update(t, [0.05, 0.4, 0]); motes.visible = pb < 0.5;

    // ---- room opens: walls hinge outward and fall flat, seams glow; ceiling lifts away
    walls.forEach(({ hinge, at }) => { const f = K.ei(K.seg(t, at, at + 0.9)); hinge.rotation.x = f * Math.PI / 2; });
    wallMat.emissiveIntensity = 0.15 + 1.1 * K.seg(t, 1.2, 2.4);
    ceil.position.y = FL + WH + K.ei(K.seg(t, 0.9, 2.2)) * 50; ceil.visible = t < 2.2;

    // ---- world grows in (staggered), lit by the time the second line starts
    const wOn = t > 0.9; world.visible = wOn;
    const wk = K.eo(K.seg(t, 1.1, 2.8));
    sky.material.uniforms.top.value.copy(black).lerp(skyTop, wk); sky.material.uniforms.bottom.value.copy(black).lerp(skyBot, wk * (1 + 0.4 * K.eo(ent)));
    scene.fog.color.copy(black).lerp(fogCol, wk);
    hemi.intensity = 0.35 * wk; moon.intensity = 0.8 * wk;
    mFar.scale.y = K.lerp(0.02, 1, K.eo(K.seg(t, 1.6, 3.4))); mNear.scale.y = K.lerp(0.02, 1, K.eo(K.seg(t, 1.8, 3.4)));
    const tp = K.eio(K.seg(t, 1.6, 3.0)); edges.forEach((m) => drawTube(m, tp)); ribGeo.setDrawRange(0, Math.floor(tp * N) * 6);
    cars.forEach((tr, i) => tr.forEach((s, k) => { const u = (((t - 2.4) * 0.09 * (1 + i * 0.05) + i / 5 - k * 0.006) % 1 + 1) % 1;
      track.getPointAt(u, s.position); s.position.y += 0.25; s.visible = t > 2.4 && u < tp + 0.001; }));
    const rise = (a) => Math.max(0.001, K.eo(K.seg(t, a, a + 1.1)));
    studio.scale.set(1, rise(2.3), 1); hangar.scale.set(1, rise(2.0), 1); stadium.scale.set(1, rise(2.1), 1);
    const sOn = K.seg(t, 2.8, 3.3);
    screens.forEach((s, i) => { s.visible = t > 2.9 + i * 0.08; s.userData.paint(t); s.material.color.setScalar(K.seg(t, 2.9 + i * 0.08, 3.1 + i * 0.08) * (entOn ? 1.25 : 1)); });
    studioLights.forEach((s, i) => { s.material.opacity = K.seg(t, 2.8 + i * 0.07, 2.9 + i * 0.07); });
    hLights.forEach((s, i) => { s.material.opacity = K.seg(t, 2.6 + i * 0.1, 2.7 + i * 0.1); });
    back.material.emissiveIntensity = 0.35 * K.seg(t, 2.6, 3.2); hfloor.material.emissiveIntensity = 0.05 * K.seg(t, 2.6, 3.2); hangLamp.intensity = 20 * K.seg(t, 2.6, 3.2);
    pitch.material.emissiveIntensity = 0.5 * K.seg(t, 2.9, 3.6) * (entOn ? 1 + 0.6 * K.eo(ent) : 1);
    crowdMat.uniforms.uT.value = t; crowdMat.uniforms.uRev.value = K.lerp(-0.1, 1.1, K.seg(t, 2.8, 4.2)); crowdMat.uniforms.uBoost.value = entOn ? K.eo(ent) : 0;
    towers.forEach((T, i) => { T.glow.material.opacity = K.seg(t, 2.7 + i * 0.12, 2.8 + i * 0.12);
      T.beam.material.uniforms.uOp.value = entOn ? 0.2 * K.eo(K.seg(t, 4.0 + i * 0.06, 4.6 + i * 0.06)) : 0;
      T.beam.rotation.set(Math.sin(t * 0.6 + T.ph) * 0.3 - 0.15, 0, Math.sin(t * 0.45 + T.ph * 1.3) * 0.35); });
    jets.forEach((j, i) => { const x = K.lerp(-110, 90, K.seg(t, 3.6 + i * 0.25, 7.7 + i * 0.25)); j.position.set(x - i * 8, 46 + i * 3, -120 - i * 9); j.rotation.set(0.1, 0, 0.06); j.visible = t > 3.6; });
    haze.userData.update(t, [0.6, 0.1, 0.3]);

    // ---- anchor shaft + shockwave on "entretenimiento"
    shaft.material.uniforms.uOp.value = 0.35 * K.seg(t, 2.4, 3.6) * (entOn ? 1 + 0.8 * Math.exp(-(t - 4) * 2.5) : 1);
    const wv = K.eo(K.seg(t, 4.0, 5.6)); wave.visible = entOn && wv < 1; wave.scale.setScalar(1.5 + wv * 110); wave.material.opacity = 1 - wv;
  }
  render(0);
  return { scene, camera: cam, render };
}
