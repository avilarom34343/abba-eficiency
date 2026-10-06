// Cartoon kit for the 15 s cut: curvy shaded characters (no straight-stick limbs), rooms with depth (windows with a
// skyline, light pools, plants, perspective floors), rounded speech bubbles, and the search-engine UI used for the hook.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { F, rand } from '../kit';

export const INK = '#2A1E1A';
// voice 03 at natural pace (see narracion/action.py) and the story cues
export const C = { p1: 2.4, idea: 3.4, p2: 4.75, count: 4.9, full: 5.2, p3: 6.6, k1: 6.75, k2: 6.95, k3: 7.15, cam: 7.6, shot: 7.8, board: 8.0, no1: 8.5, no2: 8.75, no3: 9.0, quote: 9.15, drawer: 9.4, years: 9.6, HIT: 10.4, gloat: 11.6, end: 12.9, abba: 14.35 };
export const SANS = F.body; // Inter Tight: the closest freely licensed match to Apple's SF Pro

// ---------- characters ----------
type Who = 'steve' | 'ceo' | 'exec1' | 'exec2';
const LOOK: Record<Who, { skin: [string, string]; hair?: [string, string]; body: [string, string]; pants: string; fat: number; glasses?: boolean; stache?: boolean; tie?: string }> = {
  steve: { skin: ['#FFD9BC', '#E9A47F'], hair: ['#7A4B2A', '#4A2A14'], body: ['#FFA45B', '#E0702A'], pants: '#3B4A7A', fat: 1, glasses: true },
  ceo: { skin: ['#FFCBA8', '#E39A76'], body: ['#7C8396', '#4E5468'], pants: '#3A3E4C', fat: 1.4, stache: true, tie: '#D7263D' },
  exec1: { skin: ['#E7B08C', '#B9785A'], hair: ['#3A3A3A', '#151515'], body: ['#4A64B0', '#2C3E78'], pants: '#22284A', fat: 1, tie: '#F2B33D' },
  exec2: { skin: ['#FFE0CA', '#E8B092'], hair: ['#EDEDED', '#B9B9B9'], body: ['#8A5A44', '#5E3A2A'], pants: '#3A2A22', fat: 1.18, tie: '#2FA36B' },
};
export type Mood = 'grin' | 'smug' | 'no' | 'sad' | 'shock' | 'laugh' | 'talk';
/** A curvy, shaded cartoon person (~560 px tall at s = 1, feet at the bottom centre). */
export const Toon: React.FC<{ who: Who; x: number; y: number; s?: number; mood?: Mood; armR?: number; armL?: number; t: number; age?: number; flip?: boolean; lean?: number; hold?: React.ReactNode }> = ({ who, x, y, s = 1, mood = 'grin', armR = 0, armL = 0, t, age = 0, flip, lean = 0, hold }) => {
  const L = LOOK[who], f = L.fat, id = `${who}${Math.round(x)}`;
  const breathe = Math.sin(t * 3 + x) * 0.015, bob = Math.abs(Math.sin(t * 5 + x)) * 6 * (mood === 'laugh' ? 2 : 0.4);
  const blink = ((t + x / 300) % 2.8) < 0.09 ? 0.12 : 1;
  const talk = mood === 'talk' || mood === 'laugh' ? Math.abs(Math.sin(t * 15)) : 0;
  const hairC = age > 0.5 ? ['#F2F2F2', '#C8C8C8'] : L.hair;
  // arm: shoulder → elbow → hand along a smooth curve; a = 0 hanging, 1 raised
  const arm = (side: number, a: number) => {
    const sx = 200 + side * 78 * f, sy = 330, hx = 200 + side * (110 * f + 40 * a), hy = 470 - a * 330, cx = 200 + side * (150 * f + 30 * a), cy = 400 - a * 120;
    return { d: `M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`, hx, hy };
  };
  const aL = arm(-1, armL), aR = arm(1, armR);
  return (
    <svg width="400" height="600" viewBox="0 0 400 600" style={{ position: 'absolute', left: x, top: y - bob, transform: `scale(${flip ? -s : s}, ${s}) rotate(${lean}deg)`, transformOrigin: '200px 590px', overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}sk`} cx="38%" cy="30%" r="80%"><stop offset="0" stopColor={L.skin[0]} /><stop offset="1" stopColor={L.skin[1]} /></radialGradient>
        <linearGradient id={`${id}bd`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={L.body[0]} /><stop offset="1" stopColor={L.body[1]} /></linearGradient>
        {hairC && <linearGradient id={`${id}hr`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={hairC[0]} /><stop offset="1" stopColor={hairC[1]} /></linearGradient>}
      </defs>
      <ellipse cx="200" cy="592" rx={110 * f} ry="16" fill="rgba(0,0,0,.22)" />
      <g stroke={INK} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
        {/* legs: soft curves into rounded shoes */}
        {[-1, 1].map(sd => <g key={sd}>
          <path d={`M${200 + sd * 40} 470 C${200 + sd * 46} 520 ${200 + sd * 40} 545 ${200 + sd * 44} 572`} stroke={INK} strokeWidth="50" fill="none" />
          <path d={`M${200 + sd * 40} 470 C${200 + sd * 46} 520 ${200 + sd * 40} 545 ${200 + sd * 44} 572`} stroke={L.pants} strokeWidth="38" fill="none" />
          <ellipse cx={200 + sd * 56} cy="580" rx="40" ry="18" fill="#2B2B33" />
        </g>)}
        {/* body: pear shape */}
        <g transform={`scale(${1 + breathe}, ${1 - breathe}) `} style={{ transformOrigin: '200px 480px' }}>
          <path d={`M200 300 C${200 + 95 * f} 300 ${200 + 120 * f} 400 ${200 + 108 * f} 470 C${200 + 100 * f} 505 ${200 - 100 * f} 505 ${200 - 108 * f} 470 C${200 - 120 * f} 400 ${200 - 95 * f} 300 200 300Z`} fill={`url(#${id}bd)`} />
          <path d={`M${200 - 70 * f} 330 C${200 - 90 * f} 380 ${200 - 92 * f} 430 ${200 - 80 * f} 465`} stroke="rgba(255,255,255,.35)" strokeWidth="10" fill="none" />
          {L.tie ? <path d="M200 312 L186 336 L200 430 L214 336Z" fill={L.tie} /> : <path d="M168 306 Q200 350 232 306" fill="#fff" />}
        </g>
        {/* arms (curved) + hands */}
        {[aL, aR].map((a, i) => <g key={i}><path d={a.d} stroke={INK} strokeWidth="46" fill="none" /><path d={a.d} stroke={L.body[1]} strokeWidth="34" fill="none" /><circle cx={a.hx} cy={a.hy} r="22" fill={`url(#${id}sk)`} /></g>)}
        {hold && <g transform={`translate(${(aL.hx + aR.hx) / 2 - 90} ${Math.min(aL.hy, aR.hy) - 120})`} stroke="none">{hold}</g>}
        {/* head */}
        <g transform={`rotate(${Math.sin(t * 2 + x) * 3 + (mood === 'no' ? Math.sin(t * 20) * 6 : 0)} 200 290)`}>
          <ellipse cx="200" cy="175" rx={122 * Math.min(1.1, f)} ry="132" fill={`url(#${id}sk)`} />
          <path d="M112 120 C130 70 170 52 205 50" stroke="rgba(255,255,255,.5)" strokeWidth="9" fill="none" />
          {hairC ? <path d={`M78 170 C58 40 150 18 205 26 C270 30 336 70 322 172 C306 112 262 86 210 90 C176 92 150 112 132 104 C112 120 92 140 78 170Z`} fill={`url(#${id}hr)`} />
            : <path d="M86 196 C70 150 86 128 100 164 M314 196 C330 150 314 128 300 164" fill="none" stroke="#9A9A9A" strokeWidth="10" />}
          {/* brows */}
          {[-1, 1].map(sd => { const tilt = mood === 'no' || mood === 'smug' ? 14 : mood === 'sad' ? -14 : mood === 'shock' ? 0 : 0, up = mood === 'shock' ? -14 : mood === 'grin' ? -6 : 0; return <path key={sd} d={`M${200 + sd * 22} ${126 + up} Q${200 + sd * 50} ${112 + up} ${200 + sd * 80} ${124 + up}`} transform={`rotate(${sd * tilt} ${200 + sd * 50} ${120 + up})`} fill="none" strokeWidth="9" stroke={hairC ? hairC[1] : '#7A7A7A'} />; })}
          {/* eyes */}
          {[-1, 1].map(sd => mood === 'laugh' ? <path key={sd} d={`M${200 + sd * 32} 162 Q${200 + sd * 50} 142 ${200 + sd * 68} 162`} fill="none" strokeWidth="8" /> :
            <g key={sd} transform={`translate(${200 + sd * 50} 160) scale(1 ${blink})`}><ellipse rx="19" ry={mood === 'shock' ? 25 : 21} fill="#fff" strokeWidth="5" /><circle cx={mood === 'smug' ? 6 : 0} cy="3" r="10" fill={INK} stroke="none" /><circle cx={(mood === 'smug' ? 6 : 0) - 4} cy="-2" r="3.5" fill="#fff" stroke="none" /></g>)}
          {L.glasses && <g fill="rgba(200,230,255,.18)" strokeWidth="6"><rect x="118" y="128" width="66" height="60" rx="22" /><rect x="216" y="128" width="66" height="60" rx="22" /><path d="M184 152 Q200 144 216 152" fill="none" /></g>}
          <path d="M196 182 Q186 206 202 210" fill="none" strokeWidth="5" stroke="rgba(120,50,30,.55)" />
          {[-1, 1].map(sd => <ellipse key={sd} cx={200 + sd * 70} cy="210" rx="20" ry="11" fill="#FF8C8C" opacity=".35" stroke="none" />)}
          {L.stache && <path d="M148 226 C170 204 198 214 200 222 C202 214 230 204 252 226 C230 238 212 232 200 228 C188 232 170 238 148 226Z" fill="#7B7B7B" />}
          {age > 0 && <path d={`M96 200 C108 ${290 + 50 * age} 292 ${290 + 50 * age} 304 200 C284 270 116 270 96 200Z`} fill="#F2F2F2" opacity={Math.min(1, age * 1.4)} />}
          {mood === 'grin' && <path d="M146 228 Q200 300 254 228 Q200 248 146 228Z" fill="#fff" />}
          {(mood === 'laugh' || mood === 'talk') && <path d={`M150 226 Q200 ${262 + 40 * talk} 250 226 Q200 240 150 226Z`} fill="#8A1C1C" />}
          {mood === 'smug' && <path d="M162 240 Q214 258 248 230" fill="none" strokeWidth="7" />}
          {mood === 'no' && <path d="M168 246 Q200 238 232 246" fill="none" strokeWidth="8" />}
          {mood === 'sad' && <path d="M160 258 Q200 226 240 258" fill="none" strokeWidth="8" />}
          {mood === 'shock' && <ellipse cx="200" cy="250" rx="24" ry="32" fill="#8A1C1C" />}
          {who === 'ceo' && <g><path d="M238 240 Q290 230 330 214" stroke="#8B5A2B" strokeWidth="18" fill="none" /><circle cx="334" cy="212" r="8" fill="#FF6A00" stroke="none" />{Array.from({ length: 3 }, (_, i) => <circle key={i} cx={340 + Math.sin(t * 2 + i) * 8} cy={190 - ((t * 40 + i * 30) % 90)} r={8 + i * 3} fill="rgba(255,255,255,.35)" stroke="none" />)}</g>}
        </g>
      </g>
      {mood === 'sad' && <path d={`M132 ${178 + ((t * 120) % 60)} q-8 22 0 30 q8 -8 0 -30Z`} fill="#6EC6FF" />}
    </svg>
  );
};

// ---------- sets with depth ----------
type RoomKind = 'lab' | 'office' | 'board' | 'dark';
const ROOM: Record<RoomKind, { wall: [string, string]; floor: [string, string]; sky: [string, string]; lamp: string }> = {
  lab: { wall: ['#BFEAE0', '#7CC7B8'], floor: ['#D8B48A', '#9C7550'], sky: ['#FFB16E', '#FF6F91'], lamp: 'rgba(255,240,200,.55)' },
  office: { wall: ['#FFE08A', '#F2B33D'], floor: ['#9A5A36', '#5E321C'], sky: ['#7FD3FF', '#C9F0FF'], lamp: 'rgba(255,255,230,.6)' },
  board: { wall: ['#CDB8FF', '#8E6FE0'], floor: ['#6E4632', '#3E2418'], sky: ['#2B2F6E', '#FF8A5B'], lamp: 'rgba(255,230,200,.5)' },
  dark: { wall: ['#4A2A3A', '#1E1018'], floor: ['#2A1414', '#120808'], sky: ['#3A0A14', '#120408'], lamp: 'rgba(255,60,60,.35)' },
};
/** A room with a perspective floor, an arched window with skyline, a pool of lamp light, a plant and wall details. `px` shifts it for parallax. */
export const Room: React.FC<{ kind: RoomKind; t: number; px?: number }> = ({ kind, t, px = 0 }) => {
  const R = ROOM[kind];
  return <AbsoluteFill style={{ transform: `translateX(${px}px) scale(1.08)` }}>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${R.wall[0]}, ${R.wall[1]})` }} />
    {/* arched window with sky + skyline */}
    <div style={{ position: 'absolute', left: 560, top: 300, width: 420, height: 560, borderRadius: '210px 210px 24px 24px', border: `14px solid ${INK}`, overflow: 'hidden', background: `linear-gradient(${R.sky[0]}, ${R.sky[1]})`, boxShadow: 'inset 0 0 60px rgba(0,0,0,.25), 0 20px 40px rgba(0,0,0,.18)' }}>
      <div style={{ position: 'absolute', left: 160, top: 300, width: 160, height: 160, borderRadius: '50%', background: kind === 'dark' ? '#5a1010' : '#FFF3B0', filter: 'blur(4px)', opacity: 0.85 }} />
      <svg width="420" height="560" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 9 }, (_, i) => { const h = 120 + rand(i, 3) * 200, w = 40 + rand(i, 4) * 40; return <g key={i}><rect x={i * 48 - 10} y={560 - h} width={w} height={h} rx="8" fill={kind === 'dark' ? '#1a0a0e' : 'rgba(40,40,80,.55)'} />{Array.from({ length: 6 }, (_, j) => <rect key={j} x={i * 48 - 2 + (j % 2) * 16} y={560 - h + 14 + Math.floor(j / 2) * 30} width="8" height="12" fill={kind === 'dark' ? 'rgba(255,60,60,.4)' : 'rgba(255,240,170,.8)'} />)}</g>; })}
      </svg>
      <div style={{ position: 'absolute', left: 196, top: 0, width: 14, height: '100%', background: INK }} />
      <div style={{ position: 'absolute', left: 0, top: 260, width: '100%', height: 14, background: INK }} />
    </div>
    {/* wall details: a shelf or a framed picture */}
    {kind === 'lab' && <div style={{ position: 'absolute', left: 80, top: 560, width: 380, height: 26, borderRadius: 13, background: '#8A5A36', border: `6px solid ${INK}` }}>
      {[0, 1, 2, 3].map(i => <div key={i} style={{ position: 'absolute', left: 20 + i * 88, bottom: 26, width: 54, height: 80, borderRadius: '14px 14px 8px 8px', background: i % 2 ? '#FFD84D' : '#FF7A3C', border: `6px solid ${INK}` }} />)}
    </div>}
    {kind === 'board' && <div style={{ position: 'absolute', left: 90, top: 360, width: 360, height: 280, borderRadius: 20, border: `14px solid #C9A04A`, background: 'linear-gradient(135deg,#2E6B4F,#1B3A2C)', boxShadow: '0 16px 30px rgba(0,0,0,.3)' }}><svg width="332" height="252"><path d="M0 200 C80 120 160 200 332 90 L332 252 L0 252Z" fill="#4C9B6E" /><circle cx="250" cy="70" r="30" fill="#FFE08A" /></svg></div>}
    {kind === 'office' && <div style={{ position: 'absolute', left: 120, top: 380, width: 260, height: 300, borderRadius: 20, background: 'linear-gradient(#FFE9A8,#E2B54A)', border: `8px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 90, color: '#B07A10' }}>#1</div>}
    {/* lamp light pool */}
    <div style={{ position: 'absolute', left: 120, top: 200, width: 840, height: 1300, background: `radial-gradient(50% 50% at 50% 40%, ${R.lamp}, transparent 70%)`, mixBlendMode: 'screen' }} />
    {/* floor with perspective boards + rug */}
    <div style={{ position: 'absolute', left: -100, right: -100, top: 1300, bottom: -100, background: `linear-gradient(${R.floor[0]}, ${R.floor[1]})`, borderTop: `10px solid ${INK}` }}>
      <svg width="1280" height="720" style={{ position: 'absolute', inset: 0 }}>{Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${640 + (i - 6) * 70} 0 L${640 + (i - 6) * 260} 720`} stroke="rgba(0,0,0,.12)" strokeWidth="4" />)}</svg>
      <div style={{ position: 'absolute', left: 260, top: 120, width: 760, height: 220, borderRadius: '50%', background: kind === 'dark' ? '#3a1018' : 'rgba(255,255,255,.18)', border: `8px solid rgba(0,0,0,.15)` }} />
    </div>
    {/* plant */}
    <svg width="240" height="420" style={{ position: 'absolute', left: -20, top: 980 }}>
      <g stroke={INK} strokeWidth="6" strokeLinejoin="round">{[-0.6, -0.2, 0.25, 0.6].map((a, i) => <path key={i} d={`M120 300 C${120 + a * 80} ${200} ${120 + a * 200} ${120 + Math.sin(t * 2 + i) * 6} ${120 + a * 160} ${60 + i * 12}`} fill="none" strokeWidth="10" stroke="#2E7D4F" />)}
        {[-0.6, -0.2, 0.25, 0.6].map((a, i) => <ellipse key={i} cx={120 + a * 160} cy={60 + i * 12 + Math.sin(t * 2 + i) * 6} rx="36" ry="18" transform={`rotate(${a * 60} ${120 + a * 160} ${60 + i * 12})`} fill="#4CB774" />)}
        <path d="M60 300 L180 300 L165 410 L75 410Z" fill="#E07A4A" />
      </g>
    </svg>
    <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,.35))' }} />
  </AbsoluteFill>;
};

/** Rounded speech bubble with a curved tail. */
export const Bubble: React.FC<{ show: number; x: number; y: number; text: string; size?: number; w?: number; tail?: 'l' | 'r'; color?: string }> = ({ show, x, y, text, size = 62, w, tail = 'l', color = '#fff' }) => {
  if (show <= 0) return null;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `scale(${show})`, transformOrigin: tail === 'l' ? '15% 110%' : '85% 110%' }}>
    <div style={{ position: 'relative', background: color, border: `6px solid ${INK}`, borderRadius: 48, padding: '16px 34px', fontFamily: SANS, fontWeight: 800, fontSize: size, color: INK, width: w, lineHeight: 1.08, textAlign: 'center', letterSpacing: '-0.02em', boxShadow: '0 14px 26px rgba(0,0,0,.2)' }}>{text}
      <svg width="70" height="60" style={{ position: 'absolute', bottom: -52, [tail === 'l' ? 'left' : 'right']: 46, transform: tail === 'r' ? 'scaleX(-1)' : undefined, overflow: 'visible' } as React.CSSProperties}><path d="M4 0 C10 30 30 50 60 54 C40 40 34 20 38 0Z" fill={color} stroke={INK} strokeWidth="6" strokeLinejoin="round" /><rect x="6" y="-8" width="30" height="12" fill={color} /></svg>
    </div>
  </div>;
};
/** The 1975 camera, cartoon-shaded. */
export const Cam: React.FC<{ w?: number }> = ({ w = 220 }) => (
  <svg width={w} height={w * 0.66} viewBox="0 0 300 198" style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,.3))' }}>
    <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#CFCBDD" /></linearGradient></defs>
    <g stroke={INK} strokeWidth="7" strokeLinejoin="round"><rect x="10" y="40" width="210" height="148" rx="26" fill="url(#cg)" /><rect x="214" y="70" width="40" height="86" rx="10" fill="#3B4A7A" /><circle cx="262" cy="113" r="34" fill="#fff" /><circle cx="262" cy="113" r="16" fill="#1E2A6E" /><rect x="40" y="14" width="62" height="30" rx="8" fill="#E2412E" /><rect x="38" y="84" width="118" height="64" rx="12" fill="#2A2540" /></g>
    <circle cx="254" cy="104" r="6" fill="#fff" /><circle cx="186" cy="160" r="9" fill="#FF4D4D" />
  </svg>
);
