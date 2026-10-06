import React from 'react';
import { F1Cards } from './F1Cards';
import { F2Chat } from './F2Chat';
import { F3Desktop } from './F3Desktop';
import { F4Sketch } from './F4Sketch';
import { F5Route } from './F5Route';
import { D1Dark, D2Light } from './D1Story';
import { D3Cinema } from './D3Cinema';

// id = out/<id>.mp4; all flat versions share public/audio/flat.wav (voice 03 + the flat track + UI sound design)
export const FLAT: [string, React.FC][] = [
  ['f1-tarjetas', F1Cards], ['f2-chat', F2Chat], ['f3-escritorio', F3Desktop], ['f4-libreta', F4Sketch], ['f5-ruta', F5Route],
  // depth versions (second reference)
  ['fd1-oscuro', D1Dark], ['fd2-crema', D2Light], ['fd3-cine', D3Cinema],
];
