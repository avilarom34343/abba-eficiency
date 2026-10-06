import React from 'react';
import { AbsoluteFill, Audio, Composition, staticFile } from 'remotion';
import { DUR, FPS } from './kit';
import { S01Particulas } from './styles/S01Particulas';
import { S02Collage } from './styles/S02Collage';
import { S03Dato } from './styles/S03Dato';
import { S04Objeto3D } from './styles/S04Objeto3D';
import { S05Tipo3D } from './styles/S05Tipo3D';
import { S06Tunel } from './styles/S06Tunel';
import { S07Personaje } from './styles/S07Personaje';
import { S08Pizarra } from './styles/S08Pizarra';
import { S09Split } from './styles/S09Split';
import { S10Minimal } from './styles/S10Minimal';
import { PREMIUM } from './premium';
import { FLAT } from './flat';
import { VIRAL } from './viral';
import { Story15 } from './cartoon/Story15';

// id = output file name (out/<id>.mp4) and audio track (public/audio/<id>.wav)
export const STYLES: [string, React.FC][] = [
  ['01-particulas', S01Particulas], ['02-collage-revista', S02Collage], ['03-dato-como-arte', S03Dato], ['04-objeto-3d', S04Objeto3D],
  ['05-tipografia-3d', S05Tipo3D], ['06-viaje-en-el-tiempo', S06Tunel], ['07-personajes', S07Personaje], ['08-pizarra-de-estrategia', S08Pizarra],
  ['09-split-screen', S09Split], ['10-metafora-minimal', S10Minimal],
];

const WithSound: React.FC<{ id: string; C: React.FC }> = ({ id, C }) => (
  <AbsoluteFill><C /><Audio src={staticFile(`audio/${id.startsWith('c') ? 'action' : id.startsWith('f') ? 'flat' : /^[ps]/.test(id) ? 'premium' : id}.wav`)} /></AbsoluteFill>
);

export const Root: React.FC = () => (
  <>
    {[...STYLES, ...PREMIUM, ...FLAT, ...VIRAL, ['c1-caricatura-15s', Story15, 15] as [string, React.FC, number]].map(([id, C, secs = DUR]) => (
      <Composition key={id} id={id} component={() => <WithSound id={id} C={C} />} durationInFrames={secs * FPS} fps={FPS} width={1080} height={1920} />
    ))}
  </>
);
