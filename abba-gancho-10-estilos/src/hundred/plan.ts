// Pure plan of the 100 videos (no React): timeline, which scene shows each beat, and when the search bars type.
// The music generator reads it:  esbuild src/hundred/plan.ts --bundle --platform=node | DUMP_PLAN=1 node > narracion/plan.json
import type { Beat } from './core';
import { STORIES } from './stories';

export const DUR = 25;
export const PH = [0.3, 2.5, 4.1, 6.75];            // voice 03 phrases, natural pace
export const HIT = 7.54;                            // "quiebra" onset
export const SHOTS: [number, number][] = [[0, 2.5], [2.5, 4.1], [4.1, 6.75], [6.75, 10],
  [10, 12.24], [12.24, 14.48], [14.48, 16.72], [16.72, 18.96], [18.96, 21.2], [21.2, 25]];
export const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };

export const FITS: Record<Beat['kind'], string[]> = {
  year: ['Search', 'Counter', 'Dial', 'Pixel', 'Island', 'Flip', 'Paper', 'Map'],
  num: ['Counter', 'Chart', 'Search', 'Kinetic', 'Pixel', 'Island', 'Ticker', 'Receipt'],
  product: ['Spec', 'Hero', 'Island', 'Search'],
  crash: ['Glitch', 'Search', 'Kinetic', 'Paper', 'Hero'],
  text: ['Kinetic', 'Search', 'Island', 'Notif', 'Ticker', 'Pixel', 'Deck', 'Hero', 'Paper'],
  quote: ['Quote', 'Island', 'Quote', 'Kinetic'],
  chat: ['Chat'],
  compare: ['Split', 'Deck', 'Split'],
  list: ['Notif', 'Spec', 'Deck', 'Island'],
  cta: ['CtaSearch', 'CtaWord', 'CtaIsland'],
};
const YEARISH = ['Counter', 'Dial', 'Flip', 'Chart'];   // crash beats that carry a year can also roll a dial
export const query = (b: Beat) => b.q ?? b.title.toLowerCase().replace(/[“”".…]/g, '');
/** [start, end] of the typing inside a search shot (local seconds). */
export const typing = (b: Beat, d: number): [number, number] => b.kind === 'cta' ? [0.2, 1.25]
  : b.kind === 'crash' ? [0.12, (b.hit ?? 1) - 0.32] : [0.3, 0.3 + Math.min(query(b).length * 0.045, 0.85, d * 0.3)];

export const PLAN = STORIES.map((st, n) => {
  const r = rng(n * 977 + 13), used: Record<string, number> = {}, beats = st.beats;
  const scenes = beats.map((b, i) => {
    if (b.kind === 'cta') return FITS.cta[(n + Math.floor(n / 10)) % 3];
    if (i === 0 && n % 3 === 0 && b.kind !== 'chat') return 'Search';
    let opts = FITS[b.kind];
    if (b.kind === 'crash' && b.num && b.num > 1800) opts = [...opts, ...YEARISH];
    if (b.kind === 'num' && b.title.length > 30) opts = opts.filter(s => s !== 'Ticker' && s !== 'Pixel');
    const free = opts.filter(s => (used[s] ?? 0) < 1);
    const s = (free.length ? free : opts)[Math.floor(r() * (free.length ? free : opts).length)]; used[s] = (used[s] ?? 0) + 1; return s;
  });
  const typed = scenes.flatMap((s, i) => s === 'Search' || s === 'CtaSearch' ? [[...typing(beats[i], SHOTS[i][1] - SHOTS[i][0]).map(x => +(x + SHOTS[i][0]).toFixed(3)), query(beats[i]).length]] : []);
  return { n, co: st.co, c1: st.c1, c2: st.c2, prop: st.prop, tone: st.tone, beats, scenes, typed };
});

declare const process: { env: Record<string, string | undefined> };
if (typeof window === 'undefined' && process.env.DUMP_PLAN) console.log(JSON.stringify(PLAN.map(({ n, co, tone, scenes, typed, beats }) => ({ n, co, tone, scenes, typed, twist: beats[3].title, end: beats[9].title }))));
