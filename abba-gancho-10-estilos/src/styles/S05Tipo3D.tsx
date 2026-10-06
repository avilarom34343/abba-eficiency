// 05 · Tipografía 3D: thick extruded words fall and stack into a tower; on "quiebra" the tower collapses.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, C, DigitalCamera, F, Grain, LINES, Outro, T, Vignette, prog, rand, shake, useCount, useT } from '../kit';

type Block = { text: string; at: number; color: string; size: number; cam?: boolean };
const extrude = (col: string, depth = 16) => Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${col}`).join(',');

export const S05Tipo3D: React.FC = () => {
  const t = useT(), count = useCount(t);
  const blocks: Block[] = [
    { text: LINES.a1, at: T.y1975, color: C.magenta, size: 210 },
    { text: 'Kodak', at: T.intocable, color: C.blue, size: 150 },
    { text: 'era', at: T.intocable + 0.2, color: C.orange, size: 130 },
    { text: 'intocable.', at: T.intocable + 0.4, color: C.lime, size: 130 },
    { text: `${count}%`, at: T.countStart, color: '#fff', size: 170 },
    { text: 'Entonces inventó', at: T.inventa, color: C.blue, size: 100 },
    { text: 'algo que', at: T.inventa + 0.35, color: C.orange, size: 100 },
    { text: 'cambiaría el mundo…', at: T.inventa + 0.7, color: C.magenta, size: 84 },
    { text: '', at: T.camera + 0.3, color: '#fff', size: 0, cam: true },
    { text: '…y eso la llevó a la', at: T.quiebraLine, color: C.lime, size: 76 },
  ];
  const H = (b: Block) => (b.cam ? 330 : b.size * 1.12 + 30);
  // stack positions from the floor (y = 1700) upwards
  let y = 1700; const slots = blocks.map(b => { y -= H(b) + 8; return y; });
  const towerTop = Math.min(...slots.filter((_, i) => t >= blocks[i].at));
  const camY = Math.max(0, 760 - (isFinite(towerTop) ? towerTop : 1700)) * (1 - prog(t, T.HIT, T.HIT + 1.2)); // follow the tower up, back down after the fall
  const fallT = Math.max(0, t - T.HIT);
  const sh = shake(t, T.HIT + 0.2, 34, 0.8);
  const quiebra = prog(t, T.HIT + 0.08, T.HIT + 0.3, x => x * x);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #1a0b3d 0%, ${C.bg} 70%)`, perspective: 1600 }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${camY + sh.y}px) rotateX(8deg)`, transformOrigin: '50% 100%' }}>
        <div style={{ position: 'absolute', left: -200, right: -200, top: 1700, height: 600, background: 'linear-gradient(#ffffff10,#0000)' }} />
        {blocks.map((b, i) => {
          if (t < b.at) return null;
          const land = prog(t, b.at, b.at + 0.42, x => 1 - Math.pow(1 - x, 2) * Math.cos(x * 9) * (1 - x)); // drop with a bounce
          const top = slots[i] - (1 - land) * 1300;
          // collapse: higher blocks fall further and spin more
          const k = (blocks.length - i) / blocks.length, d = Math.max(0, fallT - (1 - k) * 0.12);
          const fx = (rand(i, 2) - 0.5) * 900 * d + (i % 2 ? 1 : -1) * 260 * d * k, fy = 1500 * d * d * (0.6 + k), rot = (rand(i, 3) - 0.5) * 220 * d * (0.4 + k);
          const sway = Math.sin(t * 2.2 + i) * (t > T.quiebraLine ? 6 : 2) * (i / blocks.length);
          return (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', transform: `translate(${fx + sway}px, ${fy}px) rotate(${rot + sway * 0.3}deg)`, opacity: d > 1.4 ? 0 : 1 }}>
              {b.cam ? (
                <div style={{ padding: '24px 40px', background: '#fff', borderRadius: 28, boxShadow: extrude('#b9b2ce', 18).split(',').map(s => s.replace(/ 0 /, ' 0 0 ')).join(',') }}><DigitalCamera size={380} /></div>
              ) : (
                <div style={{ padding: '6px 34px', background: b.color, borderRadius: 26, boxShadow: `${extrude(shade(b.color), 18).replace(/(\d+)px (\d+)px 0/g, '$1px $2px 0 0')}` }}>
                  <span style={{ fontFamily: F.display, fontSize: b.size, lineHeight: 1.12, color: b.color === '#fff' ? C.ink : '#fff', textShadow: extrude('rgba(0,0,0,.35)', 6), whiteSpace: 'nowrap' }}>{b.text}</span>
                </div>
              )}
            </div>
          );
        })}
      </AbsoluteFill>
      {/* the slam */}
      {t >= T.HIT + 0.08 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 840, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - quiebra) * -900}px) scale(${1 + (1 - Math.min(1, (t - T.HIT - 0.3) * 4)) * 0.08 * (t > T.HIT + 0.3 ? 1 : 0)})`, opacity: 1 - prog(t, 8.4, 8.7) }}>
          <div style={{ padding: '10px 50px', background: C.magenta, borderRadius: 34, boxShadow: extrude('#8a0f73', 26).replace(/(\d+)px (\d+)px 0/g, '$1px $2px 0 0') }}>
            <span style={{ fontFamily: F.display, fontSize: 200, color: '#fff', lineHeight: 1.1 }}>{LINES.c2}</span>
          </div>
        </div>
      )}
      {t >= T.HIT + 0.3 && Array.from({ length: 22 }, (_, i) => { const d = t - T.HIT - 0.3; return ( // dust puff
        <div key={i} style={{ position: 'absolute', left: 540 + (rand(i, 7) - 0.5) * 900 * Math.min(1, d * 2), top: 1120 - rand(i, 8) * 200 * d, width: 60, height: 60, borderRadius: '50%', background: '#fff', opacity: Math.max(0, 0.25 - d * 0.2), filter: 'blur(10px)' }} />); })}
      <Outro to={0.9} />
      {/* outro detail: one block still rocking on the floor */}
      {t >= T.outro && <div style={{ position: 'absolute', left: 0, right: 0, top: 1480, display: 'flex', justifyContent: 'center', opacity: 0.85 * prog(t, T.outro, T.outro + 0.4) }}>
        <div style={{ padding: '6px 30px', background: C.lime, borderRadius: 22, transform: `rotate(${Math.sin((t - T.outro) * 7) * 9 * Math.max(0, 1 - (t - T.outro) / 1.5)}deg)`, transformOrigin: '50% 100%' }}><span style={{ fontFamily: F.display, fontSize: 80, color: '#111' }}>1975</span></div>
      </div>}
      <Vignette /><Grain />
      <AbbaTag />
    </AbsoluteFill>
  );
};
const shade = (hex: string) => { // darker side colour for the extrusion
  if (!hex.startsWith('#') || hex.length !== 7) return '#555';
  const n = parseInt(hex.slice(1), 16), k = 0.55;
  return `rgb(${((n >> 16) & 255) * k | 0},${((n >> 8) & 255) * k | 0},${(n & 255) * k | 0})`;
};
