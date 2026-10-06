import React from 'react';
import { V1Collage } from './V1Collage';
import { V2Wurtz } from './V2Wurtz';
import { V3Cartoon } from './V3Cartoon';
import { V4Doc } from './V4Doc';
import { V5Screen } from './V5Screen';

// five viral short-form formats; ids start with "f" so they use public/audio/flat.wav
export const VIRAL: [string, React.FC][] = [
  ['fv1-collage', V1Collage], ['fv2-caos', V2Wurtz], ['fv3-caricatura', V3Cartoon], ['fv4-documental', V4Doc], ['fv5-pantalla', V5Screen],
];
