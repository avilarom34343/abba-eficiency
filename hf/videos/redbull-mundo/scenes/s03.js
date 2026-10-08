// placeholder — replaced by the scene worker
import * as THREE from 'three';
import * as K from '../assets/kit.js';
export function create(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05060a);
  const cam = K.camera(35); cam.position.set(0, 0.7, 4);
  const env = K.envMap(renderer); scene.environment = env; K.lightRig(scene);
  const can = K.makeCan(); scene.add(can);
  return { scene, camera: cam, render(t, d) { can.rotation.y = t * 0.6; cam.lookAt(0, 0.65, 0); } };
}
