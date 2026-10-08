// Scene 10 — The lesson + final shot. A dark void with a single can (0–5.1), the can recedes into the dark
// (5.1–8.3), the world re-forms around it from shockwaves (8.5–11.6), keeps growing (12.4–15.5), then a long
// crane pull-back leaves the can tiny at the heart of a massive world (15.5–19.5; the master overlays the
// closing line in the y≈700–1000 band, so that band is kept to dark fogged ground / sky).
// Reuses scene 9's world builder so the world that "energy built" is the same world here.
import * as THREE from 'three';
import * as K from '../assets/kit.js';
import { buildWorld, aim, sprite, hdr } from './s09.js';

const L2 = 5.1, L3 = 8.5, L4 = 12.4, FINAL = 15.5;
const WAVES = [8.5, 9.6, 10.7, 12.4, 13.6, 14.8, 16.2];

export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0);
  scene.environment = K.envMap(renderer);
  const cam = K.camera(32); scene.add(cam);
  const rig = K.lightRig(scene, { keyI: 1.6, rimI: 5 });
  const world = buildWorld(scene);

  const can = K.makeCan({ droplets: 500, seed: 23 }); scene.add(can);
  const body = can.userData.body.material;
  const spot = new THREE.SpotLight(0xf2f5ff, 0, 12, 0.32, 0.7, 1.4); spot.position.set(0.4, 5, 0.8); spot.target.position.set(0, 0.6, 0); scene.add(spot, spot.target);
  const glow = sprite(hdr(0xffb060, 1.4), 1, scene); glow.position.y = 0.7;
  const motes = K.dust(scene, { count: 300, area: [4, 3, 4], color: 0xdfe8ff, size: 0.008, speed: 0.04, seed: 13, opacity: 0.5 }); motes.position.y = 1.2;

  function render(t) {
    const recede = K.eio(K.seg(t, L2, L2 + 3.2)), form = K.seg(t, L3, L4), grow = K.seg(t, L4, FINAL), fin = K.seg(t, FINAL, 22);

    // product: lit alone, then sinks into the dark, then re-lit by the world around it
    can.rotation.y = 2.2 + t * 0.12;
    spot.intensity = 45 * (1 - 0.85 * recede) * K.eo(K.seg(t, 0, 1.2));
    body.envMapIntensity = K.lerp(1, 0.06, recede) + 0.6 * K.eo(form);
    rig.children[0].intensity = 1.6 * (1 - 0.94 * recede) + 1.2 * K.eo(form);
    rig.children[1].intensity = 5 * (1 - 0.85 * recede) + 3 * K.eo(form);
    rig.children[2].intensity = 1.2 * (1 - 0.9 * recede);
    motes.userData.update(t, [0.05, 0.3, 0]); motes.material.opacity = 0.5 * (1 - recede);

    // world re-forming around the product
    const reach = 45 * K.eo(form) + 140 * K.eo(grow) + 120 * K.eo(fin);
    const waves = WAVES.filter((b) => t >= b && (t - b) * 60 < 400).slice(-4).map((b) => (t - b) * 60);
    world.set(t, { reach, waves, gain: K.eo(K.seg(t, L3 - 0.2, L3 + 0.6)), core: 0.12 + 0.9 * K.eo(form) * (1 - 0.5 * fin),
      speed: K.seg(t, 9.0, 11.2), risk: K.seg(t, L4, 14.2), adr: K.seg(t, 13.4, 16.2), sky: 0.7 * K.eo(K.seg(t, 9.2, 13)) + 0.3 * K.eo(grow),
      fogD: K.lerp(0.03, 0.006, K.eo(K.seg(t, L3, 13))) + 0.0045 * K.eio(K.seg(t, FINAL - 1, 18)), crowdGain: K.lerp(1, 0.2, K.eio(K.seg(t, FINAL - 1, 18))), beamGain: K.lerp(1, 0.3, fin) });
    const D = 4.8 * Math.pow(4.0 / 4.8, K.eio(K.seg(t, 0, L2))) * Math.pow(11 / 4, K.eio(K.seg(t, L2, 8.3))) * Math.pow(24 / 11, K.eio(K.seg(t, L3, 12.2)))
      * Math.pow(55 / 24, K.eio(K.seg(t, L4, FINAL))) * Math.pow(125 / 55, K.eo(fin) * 0.85 + fin * 0.15);
    glow.visible = t > L3 - 0.3; glow.scale.setScalar(D * 0.05 * K.eo(K.seg(t, L3 - 0.3, L3 + 1)) * (1 + 0.15 * Math.sin(t * 3)));

    // camera: slow push on the product, drift back as it fades, then a long crane/orbit pull-back
    const H = 1.0 + 1.4 * K.eio(K.seg(t, L2, 8.3)) + 7 * K.eio(K.seg(t, L3, 12.2)) + 12 * K.eio(K.seg(t, L4, FINAL)) + 18 * (K.eo(fin) * 0.85 + fin * 0.15);
    const ndc = -0.12 * K.eio(K.seg(t, L2, 8.3)) - 0.23 * K.eio(K.seg(t, L3, FINAL));
    const hand = (s) => Math.sin(t * 0.9 + s) * 0.6 + Math.sin(t * 2.1 + s * 2.1) * 0.3 + Math.sin(t * 4.3 + s * 3.7) * 0.1;
    cam.fov = K.lerp(32, 40, K.eio(K.seg(t, L3, FINAL))); cam.updateProjectionMatrix();
    aim(cam, D, H, -0.25 + t * 0.028 + hand(0) * 0.003, 0.65, ndc + hand(1) * 0.003, hand(2) * 0.004);
  }
  render(0);
  return { scene, camera: cam, render };
}
