import React from 'react';
import { F1Cards } from './F1Cards';
import { F2Chat } from './F2Chat';
import { F3Desktop } from './F3Desktop';
import { F4Sketch } from './F4Sketch';
import { F5Route } from './F5Route';

// id = out/<id>.mp4; all flat versions share public/audio/flat.wav (voice 03 + the flat track + UI sound design)
export const FLAT: [string, React.FC][] = [
  ['f1-tarjetas', F1Cards], ['f2-chat', F2Chat], ['f3-escritorio', F3Desktop], ['f4-libreta', F4Sketch], ['f5-ruta', F5Route],
];
