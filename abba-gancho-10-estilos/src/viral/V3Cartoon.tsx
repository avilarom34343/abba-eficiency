// V3 · Cartoon comedy (the OverSimplified history-cartoon format): flat colours, thick outlines, big expressive heads,
// sight gags and speech bubbles. The CEO bathing in money, the inventor's "¡mira!", the board's "no", the drawer,
// everyone ageing, and the building swallowing the CEO on "quiebra".
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, prog, rand, useT } from '../kit';
import { FlatOutro, Q, VF, hitShake, pop } from './vkit';

const INK = '#141414', OL = 7;
type Who = 'steve' | 'ceo' | 'exec1' | 'exec2';
const LOOK: Record<Who, { skin: string; hair: string | null; body: string; bald?: boolean; stache?: boolean; glasses?: boolean; fat?: number }> = {
  steve: { skin: '#F2C29B', hair: '#5B3A1E', body: '#E8833A', glasses: true },
  ceo: { skin: '#F0B994', hair: null, body: '#5A5F6E', bald: true, stache: true, fat: 1.35 },
  exec1: { skin: '#D9A07A', hair: '#2A2A2A', body: '#3B4A7A' },
  exec2: { skin: '#F4CFB2', hair: '#C9C9C9', body: '#6B4A3A', fat: 1.15 },
};
/** Big-headed cartoon person. face: brows/mouth; age 0..1 turns hair grey and adds a beard. */
const Toon: React.FC<{ who: Who; x: number; y: number; s?: number; mood?: 'grin' | 'smug' | 'no' | 'sad' | 'shock' | 'laugh'; arm?: number; t: number; age?: number; flip?: boolean }> = ({ who, x, y, s = 1, mood = 'grin', arm = 0, t, age = 0, flip }) => {
  const L = LOOK[who], fat = L.fat ?? 1, bob = Math.sin(t * 8 + x) * 4;
  const hair = age > 0.5 ? '#D8D8D8' : L.hair;
  const brow = mood === 'no' ? 12 : mood === 'shock' ? -12 : mood === 'sad' ? -6 : 0, browTilt = mood === 'no' || mood === 'smug' ? 16 : mood === 'sad' ? -16 : 0;
  return <svg width="400" height="560" viewBox="0 0 400 560" style={{ position: 'absolute', left: x, top: y + bob, transform: `scale(${flip ? -s : s}, ${s})`, transformOrigin: '200px 560px', overflow: 'visible' }}>
    <g stroke={INK} strokeWidth={OL} strokeLinejoin="round" strokeLinecap="round">
      {/* legs + body */}
      <path d="M160 470 L150 550 M240 470 L250 550" fill="none" />
      <path d={`M${200 - 90 * fat} 480 C${200 - 95 * fat} 340 ${200 - 60 * fat} 300 200 300 C${200 + 60 * fat} 300 ${200 + 95 * fat} 340 ${200 + 90 * fat} 480 Z`} fill={L.body} />
      {who !== 'steve' && <path d="M200 305 L188 330 L200 420 L212 330 Z" fill="#C8102E" />}
      {who === 'steve' && <path d="M160 305 L200 360 L240 305" fill="#fff" />}
      {/* arms */}
      <path d={`M${200 - 80 * fat} 360 Q${130 - 60 * fat} 420 ${140 - 40 * fat} 470`} fill="none" />
      <path d={`M${200 + 80 * fat} 360 Q${290 + 40 * fat} ${360 - arm * 130} ${270 + 40 * fat} ${430 - arm * 200}`} fill="none" />
      <circle cx={270 + 40 * fat} cy={430 - arm * 200} r="20" fill={L.skin} />
      {/* head */}
      <ellipse cx="200" cy="170" rx={120 * Math.min(1.12, fat)} ry="135" fill={L.skin} />
      {hair && !L.bald && <path d="M72 175 C40 0 360 0 328 175 C305 105 255 88 200 92 C145 88 95 105 72 175Z" fill={hair} />}
      {L.bald && <path d="M84 190 C70 140 90 120 100 160 M316 190 C330 140 310 120 300 160" fill={hair ?? '#888'} strokeWidth="5" />}
      {/* brows, eyes */}
      {[-1, 1].map(sd => <path key={sd} d={`M${200 + sd * 25} ${120 + brow} L${200 + sd * 75} ${120 + brow - sd * 0}`} transform={`rotate(${sd * browTilt} ${200 + sd * 50} ${120 + brow})`} strokeWidth="10" />)}
      {[-1, 1].map(sd => mood === 'laugh' ? <path key={sd} d={`M${200 + sd * 35} 160 Q${200 + sd * 50} 140 ${200 + sd * 65} 160`} fill="none" strokeWidth="8" /> : <circle key={sd} cx={200 + sd * 50} cy="158" r={mood === 'shock' ? 15 : 10} fill={INK} stroke="none" />)}
      {L.glasses && <g fill="none" strokeWidth="6"><circle cx="150" cy="158" r="32" /><circle cx="250" cy="158" r="32" /><path d="M182 158 L218 158" /></g>}
      {L.stache && <path d="M150 215 C170 195 200 205 200 212 C200 205 230 195 250 215 C230 225 210 220 200 216 C190 220 170 225 150 215Z" fill="#6B6B6B" />}
      {age > 0 && <path d={`M100 200 C110 ${280 + 40 * age} 290 ${280 + 40 * age} 300 200 C280 260 120 260 100 200Z`} fill="#D8D8D8" opacity={Math.min(1, age * 1.5)} />}
      {/* mouth */}
      {mood === 'grin' && <path d="M140 225 Q200 300 260 225 Z" fill="#fff" />}
      {mood === 'laugh' && <path d="M140 220 Q200 320 260 220 Z" fill="#8A1C1C" />}
      {mood === 'smug' && <path d="M160 238 Q210 255 245 228" fill="none" />}
      {mood === 'no' && <path d="M165 245 L235 245" fill="none" />}
      {mood === 'sad' && <path d="M160 255 Q200 225 240 255" fill="none" />}
      {mood === 'shock' && <ellipse cx="200" cy="245" rx="22" ry="30" fill="#8A1C1C" />}
      {who === 'ceo' && <g><path d="M235 238 L320 220" stroke="#8B5A2B" strokeWidth="16" /><circle cx="324" cy="219" r="7" fill="#FF6A00" stroke="none" /></g>}
    </g>
    {mood === 'sad' && <path d="M135 180 q-6 20 0 28 q6 -8 0 -28Z" fill="#6EC6FF" />}
  </svg>;
};
const Bubble: React.FC<{ at: number; out?: number; x: number; y: number; text: string; size?: number; w?: number; tail?: 'l' | 'r' }> = ({ at, out = 99, x, y, text, size = 64, w, tail = 'l' }) => {
  const t = useT(); if (t < at || t >= out) return null;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `scale(${pop(t, at, 320, 13)})`, transformOrigin: tail === 'l' ? '10% 100%' : '90% 100%' }}>
    <div style={{ position: 'relative', background: '#fff', border: `${OL}px solid ${INK}`, borderRadius: 40, padding: '14px 30px', fontFamily: VF.hand, fontSize: size, color: INK, width: w, lineHeight: 1.05, textAlign: 'center' }}>{text}
      <div style={{ position: 'absolute', bottom: -34, [tail === 'l' ? 'left' : 'right']: 50, width: 40, height: 40, background: '#fff', borderRight: `${OL}px solid ${INK}`, borderBottom: `${OL}px solid ${INK}`, transform: 'rotate(45deg) skew(10deg,10deg)' } as React.CSSProperties} />
    </div>
  </div>;
};
const Room: React.FC<{ wall: string; floor: string }> = ({ wall, floor }) => <>
  <AbsoluteFill style={{ background: wall }} />
  <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, bottom: 0, background: floor, borderTop: `${OL}px solid ${INK}` }} />
</>;
const Sign: React.FC<{ text: string; x: number; y: number }> = ({ text, x, y }) => <div style={{ position: 'absolute', left: x, top: y, background: '#FFF4D6', border: `${OL}px solid ${INK}`, padding: '8px 26px', fontFamily: VF.hand, fontSize: 52, color: INK, transform: 'rotate(-2deg)' }}>{text}</div>;
const ToonCam: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <svg width="300" height="190" style={{ position: 'absolute', left: x, top: y, transform: `scale(${s}) rotate(${rot}deg)`, overflow: 'visible' }}><g stroke={INK} strokeWidth={OL} strokeLinejoin="round"><rect x="10" y="40" width="210" height="140" rx="16" fill="#E9E6F2" /><rect x="220" y="70" width="40" height="80" fill="#3B4A7A" /><circle cx="270" cy="110" r="32" fill="#fff" /><circle cx="270" cy="110" r="12" fill={INK} /><rect x="40" y="16" width="60" height="26" fill="#C8102E" /><rect x="40" y="80" width="110" height="60" rx="8" fill="#2A2540" /></g></svg>
);

export const V3Cartoon: React.FC = () => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, z => z), 1.6) * 37));
  const age = prog(t, Q.years, Q.HIT);
  const sink = prog(t, Q.HIT + 0.15, Q.HIT + 0.7, z => z * z);
  const flash = t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.2) : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: hitShake(t, 30) }}>
        {/* 1 · the lab */}
        {t < 1.5 && <>
          <Room wall="#9ED6C8" floor="#C9A27A" />
          <Sign text="Laboratorio Kodak · 1975" x={150} y={250} />
          <div style={{ position: 'absolute', left: 120, top: 1160, width: 840, height: 60, background: '#B07A4A', border: `${OL}px solid ${INK}`, borderRadius: 14 }} />
          <Toon who="steve" x={340} y={600} s={1.5} t={t} mood={t < Q.idea ? 'smug' : 'grin'} arm={t >= Q.idea ? 1 : 0} />
          {t >= Q.idea && <svg width="200" height="220" style={{ position: 'absolute', left: 440, top: 170, transform: `scale(${pop(t, Q.idea, 320, 10)})` }}><g stroke={INK} strokeWidth={OL}><path d="M100 20 C50 20 30 60 40 90 C48 115 70 120 70 150 L130 150 C130 120 152 115 160 90 C170 60 150 20 100 20Z" fill="#FFE14D" /><rect x="70" y="150" width="60" height="30" fill="#bbb" /></g></svg>}
          <Bubble at={0.9} x={600} y={300} text="¡ya sé!" tail="l" />
        </>}
        {/* 2 · the CEO bathing in money */}
        {t >= 1.5 && t < 3.0 && <>
          <Room wall="#F7D35C" floor="#7A4A2A" />
          <Sign text="Kodak · oficina del jefe" x={170} y={250} />
          <Toon who="ceo" x={330} y={560} s={1.45} t={t} mood={t < 2.3 ? 'smug' : 'laugh'} />
          <div style={{ position: 'absolute', left: 120, top: 1050, width: 840, height: 380, background: '#fff', border: `${OL}px solid ${INK}`, borderRadius: '30px 30px 200px 200px' }} />
          {Array.from({ length: 22 }, (_, i) => <div key={i} style={{ position: 'absolute', left: 140 + rand(i, 1) * 760, top: 1010 + rand(i, 2) * 80 - Math.abs(Math.sin(t * 6 + i)) * 60, width: 110, height: 56, background: '#7BC86C', border: `5px solid ${INK}`, transform: `rotate(${(rand(i, 3) - 0.5) * 60}deg)`, borderRadius: 6 }} />)}
          <div style={{ position: 'absolute', left: 600, top: 330, fontFamily: VF.black, fontSize: 150, color: '#C8102E', WebkitTextStroke: `5px ${INK}`, transform: `rotate(8deg) scale(${pop(t, Q.kodak, 300, 12)})` }}>{cnt}%</div>
          <Bubble at={2.3} x={80} y={420} text="jo jo jo" />
        </>}
        {/* 3 · building it */}
        {t >= 3.0 && t < 4.5 && <>
          <Room wall="#9ED6C8" floor="#C9A27A" />
          <Toon who="steve" x={160} y={620} s={1.4} t={t} mood={t < Q.cam ? 'smug' : 'grin'} arm={t < Q.cam ? Math.abs(Math.sin(t * 16)) : 0.8} />
          {t < Q.cam && [Q.p1, Q.p2, Q.p3].map((a, i) => t >= a && <div key={i} style={{ position: 'absolute', left: [620, 700, 560][i], top: [700, 860, 980][i], fontFamily: VF.black, fontSize: 70, color: INK, transform: `rotate(${(i - 1) * 15}deg) scale(${pop(t, a, 320, 12)})` }}>{['¡CLANK!', '¡TINK!', '¡BONK!'][i]}</div>)}
          {t < Q.cam && [0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 300 + i * 70, top: 560 - ((t * 3 + i * 0.3) % 1) * 100, width: 22, height: 34, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#6EC6FF', border: `4px solid ${INK}` }} />)}
          {t >= Q.cam && <ToonCam x={560} y={760} s={1.3} rot={-6} />}
          <Bubble at={Q.cam} x={520} y={500} text="¡mira!" tail="l" />
        </>}
        {/* 4 · the board */}
        {t >= 4.5 && t < Q.years && <>
          <Room wall="#B9A6E6" floor="#5A3A2A" />
          <Toon who="exec1" x={-40} y={590} s={1.0} t={t} mood={t < Q.no2 ? 'smug' : 'no'} />
          <Toon who="ceo" x={340} y={560} s={1.15} t={t} mood={t < Q.no1 ? 'smug' : 'no'} />
          <Toon who="exec2" x={720} y={590} s={1.0} t={t} mood={t < Q.no3 ? 'smug' : 'no'} />
          <div style={{ position: 'absolute', left: -20, right: -20, top: 1120, height: 120, background: '#8A5A3A', border: `${OL}px solid ${INK}` }} />
          {t < Q.drawer && <ToonCam x={390} y={1000} s={0.8} />}
          {t >= Q.drawer && <ToonCam x={390 + prog(t, Q.drawer, Q.drawer + 0.2) * 500} y={1000 + prog(t, Q.drawer, Q.drawer + 0.2) * 300} s={0.8} rot={prog(t, Q.drawer, Q.drawer + 0.2) * 90} />}
          <Bubble at={Q.no1} x={440} y={330} text="no." size={80} />
          <Bubble at={Q.no2} x={20} y={420} text="no" size={64} />
          <Bubble at={Q.no3} x={640} y={330} text="no" size={64} tail="r" />
          <Bubble at={Q.drawer} x={70} y={1300} text="está lindo… pero no se lo digas a nadie" size={46} w={900} />
        </>}
        {/* 5 · everyone gets old */}
        {t >= Q.years && t < Q.HIT && <>
          <Room wall="#B9A6E6" floor="#5A3A2A" />
          <Toon who="ceo" x={340} y={620} s={1.45} t={t} mood="smug" age={age} />
          <div style={{ position: 'absolute', left: 340, top: 160, width: 400, height: 220, background: '#fff', border: `${OL}px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: VF.black, fontSize: 130, color: INK, transform: `rotate(${Math.sin(t * 40) * 3}deg)` }}>{year}</div>
        </>}
        {/* 6 · quiebra: the floor opens under the CEO */}
        {t >= Q.HIT && t < Q.outro && <>
          <Room wall="#3A2A3A" floor="#2A1A1A" />
          <div style={{ position: 'absolute', left: 240, top: 1380, width: 600, height: 120 * prog(t, Q.HIT, Q.HIT + 0.15), background: '#000', borderRadius: '50%', border: `${OL}px solid ${INK}` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1440, overflow: 'hidden' }}><Toon who="ceo" x={340} y={600 + sink * 1300} s={1.3} t={t} mood="shock" age={1} /></div>
          {Array.from({ length: 12 }, (_, i) => { const d = Math.max(0, t - Q.HIT - 0.1); return <div key={i} style={{ position: 'absolute', left: 500 + Math.cos(i) * d * 600, top: 900 - d * 500 + d * d * 600 + i * 10, width: 100, height: 50, background: '#7BC86C', border: `5px solid ${INK}`, transform: `rotate(${d * 400 * (i % 2 ? 1 : -1)}deg)` }} />; })}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: VF.black, fontSize: 190, color: '#FF4D4D', WebkitTextStroke: `7px ${INK}`, transform: `rotate(-4deg) scale(${pop(t, Q.HIT, 300, 11)})` }}>¡QUIEBRA!</div>
          <Toon who="steve" x={700} y={900} s={0.8} t={t} mood="smug" arm={0.6} />
          <Bubble at={Q.HIT + 0.6} x={560} y={830} text="les dije" size={52} tail="r" />
        </>}
      </AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.9 }} />
      <FlatOutro />
      <AbbaTag />
    </AbsoluteFill>
  );
};
