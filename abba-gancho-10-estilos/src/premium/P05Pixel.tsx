// P05 · Pixel grid: the whole screen is a 27×48 LED wall. Numbers are drawn in pixels, every kick sends a colour ripple
// through the grid, the invention becomes a pixel camera; on "quiebra" the red letters land and the wall collapses tile by tile.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, Words, prog, rand, shake, useCount, useT } from '../kit';
import { KICKS, P, PF, V, pixelCells } from './pkit';

const CELL = 40, COLS = 27, ROWS = 48;
const hsl = (h: number, l = 58) => `hsl(${h % 360} 100% ${l}%)`;
/** Lit cells for a word, centred horizontally, starting at row r0. */
const word = (w: string, r0: number) => { const c = pixelCells(w), W = w.length * 6 - 1, x0 = Math.floor((COLS - W) / 2); return c.map(([x, y]) => [x + x0, y + r0]); };
const camera = (): number[][] => {
  const out: number[][] = [];
  for (let y = 19; y <= 29; y++) for (let x = 4; x <= 22; x++) { const lens = Math.hypot(x - 17, y - 24); if (y === 19 || y === 29 || x === 4 || x === 22 || (lens < 3.6 && lens > 2.2)) out.push([x, y]); }
  for (let x = 7; x <= 10; x++) out.push([x, 18]);                                   // top button
  return out;
};

export const P05Pixel: React.FC = () => {
  const t = useT(), count = useCount(t);
  const sh = shake(t, V.HIT, 26, 0.5);
  // which cells are lit, and in what colour, for this moment
  const lit = new Map<string, string>();
  const put = (cells: number[][], col: (x: number, y: number, i: number) => string | null) => cells.forEach(([x, y], i) => { const c = col(x, y, i); if (c) lit.set(`${x},${y}`, c); });
  if (t < 1.5) put(word('1975', 20), (x) => (t > V.y1975 + x * 0.04 ? hsl(300 + x * 6) : null));
  else if (t < 3.0) put(word(`${count}%`, 15), (x) => hsl(170 + x * 5 + t * 80, 66));
  else if (t < 4.5) {                                                                  // equaliser: the beat, visualised
    for (let x = 1; x < COLS - 1; x += 1) {
      const h = Math.round(6 + 10 * Math.abs(Math.sin(x * 0.7 + t * 9)) * (0.4 + 0.6 * Math.exp(-((t - 3) % 0.375) * 6)) + 6 * Math.sin(x * 0.3 + t * 3) ** 2);
      for (let y = 0; y < h; y++) lit.set(`${x},${36 - y}`, hsl(110 - y * 7));
    }
  } else if (t < V.quiebraLine) put(camera(), (x, y) => (Math.hypot(x - 17, y - 24) < 4 ? P.cyan : '#fff'));
  else if (t < V.HIT) { if (Math.floor(t * 8) % 2) lit.set('13,23', P.red); }
  else if (t < 8.6) { put(word('QUIE', 14), () => P.red); put(word('BRA.', 23), () => P.red); }
  const lastKick = KICKS.filter(k => k <= t).pop() ?? -9;
  const rip = t < V.quiebraLine ? t - lastKick : t >= V.HIT ? t - V.HIT : 9;
  const fallT = t - V.HIT - 0.55;
  return (
    <AbsoluteFill style={{ background: '#050507', transform: `translate(${sh.x}px,${sh.y}px)` }}>
      <svg width="1080" height="1920">
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const x = i % COLS, y = Math.floor(i / COLS), key = `${x},${y}`, on = lit.get(key);
          const d = Math.hypot(x - 13, (y - 24) * 0.9), wave = Math.exp(-((d - rip * 38) ** 2) / 8) * Math.exp(-rip * 2);
          const fall = fallT > 0 && t < 8.6 ? Math.max(0, fallT - rand(x, 5) * 0.5 - (ROWS - y) * 0.008) : 0;
          const fy = fall * fall * 2600, out = t >= 8.5;
          const base = out ? (x === 13 && y === 24 && Math.floor(t * 3) % 2 ? P.volt : '#0b0b10') : on ?? (wave > 0.05 ? hsl(t >= V.HIT ? 0 : 280 + d * 6 + t * 40, 14 + 22 * wave) : '#111118');
          const s = on && !out ? 34 + 3 * Math.exp(-rip * 6) : 34;
          return <rect key={i} x={x * CELL + (CELL - s) / 2} y={y * CELL + (CELL - s) / 2 + fy} width={s} height={s} rx={7} fill={base} opacity={fy > 1920 ? 0 : 1} style={on && !out ? { filter: `drop-shadow(0 0 10px ${on})` } : undefined} />;
        })}
      </svg>
      {/* the spoken line, as a clean caption bar */}
      {[['Kodak era intocable.', V.kodak, 2.95, 1180], ['Entonces inventó algo que cambiaría el mundo…', V.inventa, 5.85, 210], ['…y eso la llevó a la', V.quiebraLine, 6.65, 1180]].map(([s, a, b, top]) => (
        <div key={s as string} style={{ position: 'absolute', left: 80, right: 80, top: top as number, textAlign: 'center' }}>
          <Words text={s as string} at={a as number} out={b as number} stagger={0.12} style={{ fontFamily: PF.round, fontSize: 64, color: '#fff', lineHeight: 1.15 }} />
        </div>
      ))}
      <AbsoluteFill style={{ background: '#fff', opacity: t >= V.HIT ? Math.max(0, 1 - (t - V.HIT) / 0.12) * 0.7 : 0 }} />
      <AbbaTag />
    </AbsoluteFill>
  );
};
