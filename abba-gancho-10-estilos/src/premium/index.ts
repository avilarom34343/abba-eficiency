import React from 'react';
import { P01Kinetic } from './P01Kinetic';
import { P02Keynote } from './P02Keynote';
import { P03Glass } from './P03Glass';
import { P04Chrome } from './P04Chrome';
import { P05Pixel } from './P05Pixel';
import { P06Shapes } from './P06Shapes';
import { P07Zoom } from './P07Zoom';
import { P08Puffy } from './P08Puffy';
import { P09Speed } from './P09Speed';
import { P10Ribbons } from './P10Ribbons';

// id = out/<id>.mp4; all premium styles share public/audio/premium.wav (voice 03 + the original track)
export const PREMIUM: [string, React.FC][] = [
  ['p01-cinetico', P01Kinetic], ['p02-keynote', P02Keynote], ['p03-vidrio-liquido', P03Glass], ['p04-cromo-3d', P04Chrome], ['p05-pixeles', P05Pixel],
  ['p06-formas', P06Shapes], ['p07-zoom-infinito', P07Zoom], ['p08-inflables-3d', P08Puffy], ['p09-velocidad', P09Speed], ['p10-cintas-3d', P10Ribbons],
];
