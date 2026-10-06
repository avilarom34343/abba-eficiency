// F5 · Route map: a red dotted route winds down a city map; the pixel mascot walks it and each stop pops a card:
// the idea (1975), the 90% empire, the prototype + first photo, the board's NO, the locked drawer, the years…
// and the road ends at a cliff on "quiebra".
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, F, inOut, prog, useT } from '../kit';
import { Bulb, Camera, Captions, Card, Face, FlatOutro, HQ, K, Mascot, Q, Stamp, hitShake, pop } from './fkit';

const roadX = (y: number) => 540 + 250 * Math.sin(y / 320);
const STOPS: [number, number][] = [[0.0, 420], [1.62, 1120], [3.05, 1820], [4.55, 2520], [5.6, 3120], [6.55, 3900]];   // [arrival time, y]
const mascotY = (t: number) => {
  const k = STOPS.findIndex(s => s[0] > t);
  if (k === -1) return STOPS[STOPS.length - 1][1];
  if (k === 0) return STOPS[0][1];
  const [ta, ya] = STOPS[k - 1], [tb, yb] = STOPS[k];
  return ya + (yb - ya) * prog(t, Math.max(ta + 0.3, tb - 0.55), tb, inOut);
};
const Pin: React.FC<{ x: number; y: number; at: number; t: number; c?: string }> = ({ x, y, at, t, c = K.red }) => {
  const p = pop(t, at, 300, 12); if (t < at) return null;
  return <g transform={`translate(${x} ${y - (1 - p) * 120}) scale(${p})`}><path d="M0 0 C-30 -40 -34 -54 -34 -70 a34 34 0 0 1 68 0 C34 -54 30 -40 0 0Z" fill={c} stroke={K.ink} strokeWidth="5" /><circle cy="-70" r="12" fill="#fff" stroke={K.ink} strokeWidth="4" /></g>;
};

export const F5Route: React.FC = () => {
  const t = useT();
  const my = mascotY(t), mx = roadX(my);
  const fall = Math.max(0, t - Q.HIT);
  const cam = Math.max(0, Math.min(my, 3900) - 600);
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const route = Array.from({ length: 153 }, (_, i) => { const y = 200 + i * 25; return `${i ? 'L' : 'M'}${roadX(y)} ${y}`; }).join(' ');
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, x => x), 1.6) * 37));
  const walk = Math.sin(t * 22) * (t < Q.HIT ? 1 : 0);
  return (
    <AbsoluteFill style={{ background: K.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `${hitShake(t, 30)} translateY(${-cam}px)` }}>
        <svg width="1080" height="5200" style={{ position: 'absolute', left: 0, top: 0 }}>
          {/* city map: pale blocks, streets, a river */}
          {Array.from({ length: 9 }, (_, c) => Array.from({ length: 36 }, (_, r) => <rect key={`${c}-${r}`} x={c * 130 - 40} y={r * 130 + 60} width="100" height="100" rx="10" fill={(c * 7 + r * 3) % 9 === 0 ? '#D8EBD0' : '#E4DED3'} />))}
          <path d="M-50 1500 C300 1400 700 1700 1150 1550 L1150 1660 C700 1810 300 1510 -50 1610Z" fill="#BFDDF2" stroke={K.ink} strokeWidth="3" />
          <path d="M-50 2900 C400 2800 600 3100 1150 2950 L1150 3030 C600 3180 400 2880 -50 2980Z" fill="#BFDDF2" stroke={K.ink} strokeWidth="3" />
          {/* the cliff at the end of the road */}
          <path d="M-20 4020 L1100 4020 L1100 5200 L-20 5200Z" fill="#2a1d24" />
          <path d="M-20 4020 L300 4020 L340 4060 L420 4030 L520 4080 L600 4030 L700 4070 L780 4025 L1100 4020" fill="none" stroke={K.ink} strokeWidth="6" />
          {/* the route, revealed up to the mascot */}
          <clipPath id="rv"><rect x="0" y="0" width="1080" height={my + 10} /></clipPath>
          <path d={route} fill="none" stroke="#fff" strokeWidth="26" strokeLinecap="round" opacity={0.7} />
          <path d={route} clipPath="url(#rv)" fill="none" stroke={K.red} strokeWidth="10" strokeDasharray="2 22" strokeLinecap="round" />
          <Pin t={t} at={0.1} x={roadX(420)} y={420} />
          <Pin t={t} at={1.62} x={roadX(1120)} y={1120} c={K.green} />
          <Pin t={t} at={3.05} x={roadX(1820)} y={1820} c={K.blue} />
          <Pin t={t} at={4.55} x={roadX(2520)} y={2520} />
          <Pin t={t} at={Q.drawer} x={roadX(3120)} y={3120} c={K.yellow} />
          {[1980, 1995, 2005, 2012].map((y, i) => { const yy = 3260 + i * 160, a = Q.years + i * 0.17; return t >= a && <g key={y} transform={`translate(${roadX(yy) + (i % 2 ? -190 : 70)} ${yy}) scale(${pop(t, a)})`}><rect x="0" y="-36" width="130" height="56" rx="14" fill="#fff" stroke={K.ink} strokeWidth="4" /><text x="65" y="4" textAnchor="middle" fontFamily={F.body} fontWeight="800" fontSize="34" fill={K.ink}>{y}</text></g>; })}
        </svg>
        {/* stop cards */}
        {t >= 0.1 && <div style={{ position: 'absolute', left: roadX(420) > 540 ? 90 : 560, top: 240, transform: `scale(${pop(t, 0.12)})` }}><Card w={400} h={330}>
          <div style={{ display: 'grid', justifyItems: 'center', paddingTop: 30, gap: 10 }}><Face size={150} /><div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 64, letterSpacing: '-0.04em' }}>1975</div></div>
          {t >= Q.idea && <div style={{ position: 'absolute', right: 20, top: 16, transform: `scale(${pop(t, Q.idea)})` }}><Bulb size={90} t={t * 2} /></div>}
        </Card></div>}
        {t >= 1.62 && <div style={{ position: 'absolute', left: roadX(1120) > 540 ? 70 : 560, top: 900, transform: `scale(${pop(t, 1.64)})`, display: 'grid', justifyItems: 'center' }}>
          <HQ size={300} />
          <div style={{ marginTop: -40, background: K.green, color: '#fff', border: `4px solid ${K.ink}`, borderRadius: 40, padding: '6px 26px', fontFamily: F.body, fontWeight: 800, fontSize: 56, boxShadow: `5px 6px 0 ${K.ink}` }}>{cnt}%</div>
        </div>}
        {t >= 3.05 && <div style={{ position: 'absolute', left: roadX(1820) > 540 ? 60 : 520, top: 1640, transform: `scale(${pop(t, 3.07)})` }}><Card w={480} h={330} style={{ background: '#E8EEFA' }}>
          <div style={{ position: 'absolute', left: 50, top: 60 }}><Camera size={360} parts={t < Q.p1 ? 0.05 : t < Q.p2 ? 0.26 : t < Q.p3 ? 0.51 : t < Q.cam ? 0.76 : 1} /></div>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.25) : 0 }} />
        </Card></div>}
        {t >= 4.55 && <div style={{ position: 'absolute', left: roadX(2520) > 540 ? 50 : 470, top: 2330, transform: `scale(${pop(t, 4.57)})` }}><Card w={560} h={300}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%', padding: '0 10px' }}>
            {[Q.no1, Q.no2, Q.no3].map((a, i) => <div key={i} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <Face size={140} suit hair={['#9a9a9a', '#3a2a20', '#cfcfcf'][i]} mood={t > a ? 'flat' : 'happy'} bg="#F7E7C9" />
              {t > a && <div style={{ position: 'absolute', top: 40, transform: `scale(${2 - pop(t, a, 300, 14)})` }}><Stamp text="NO" size={56} /></div>}
            </div>)}
          </div>
        </Card></div>}
        {t >= Q.drawer && <div style={{ position: 'absolute', left: roadX(3120) > 540 ? 120 : 600, top: 3000, transform: `scale(${pop(t, Q.drawer)})` }}><Card w={300} h={200} style={{ background: '#E0B98A' }}>
          <div style={{ position: 'absolute', left: 100, top: 70, width: 100, height: 18, borderRadius: 9, background: K.ink }} />
          <svg width="70" height="80" style={{ position: 'absolute', left: 115, top: 100 }}><path d="M18 34 V20 a17 17 0 0 1 34 0 V34" stroke={K.ink} strokeWidth="6" fill="none" /><rect x="6" y="32" width="58" height="42" rx="9" fill={K.yellow} stroke={K.ink} strokeWidth="5" /></svg>
        </Card></div>}
        {/* the mascot walking the route, falling off the cliff on the hit */}
        <div style={{ position: 'absolute', left: mx - 60 + fall * 120, top: my - 120 + fall * fall * 1400, transform: `rotate(${walk * 6 + fall * 300}deg) translateY(${-Math.abs(walk) * 12}px)` }}><Mascot size={120} shock={t >= Q.HIT - 0.2} /></div>
        {/* year counter riding along */}
        {t >= Q.years && t < Q.HIT && <div style={{ position: 'absolute', left: mx + 80, top: my - 150, fontFamily: F.body, fontWeight: 800, fontSize: 70, color: K.ink, background: '#fff', border: `4px solid ${K.ink}`, borderRadius: 18, padding: '0 18px', boxShadow: `5px 6px 0 ${K.ink}` }}>{year}</div>}
      </AbsoluteFill>
      {t >= Q.HIT && t < Q.outro && <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${2.4 - 1.4 * pop(t, Q.HIT + 0.05, 320, 16)})` }}><Stamp text="QUIEBRA" size={150} /></div>}
      {t < Q.outro && <Captions top={1470} />}
      <FlatOutro />
      <AbbaTag color={K.card} />
    </AbsoluteFill>
  );
};
