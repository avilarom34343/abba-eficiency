// V4 · Business documentary (the MagnatesMedia / ColdFusion format): dark, grainy, dramatic. A glowing pin on
// Rochester, sepia "archive" prints, a gold market-share chart, a confidential memo stamped REJECTED, film vs digital
// lines crossing as the years run, then the stock crash and spinning newspaper headlines.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, Grain, prog, useT } from '../kit';
import { Character, ShadedCamera, Tower } from '../flat/dkit';
import { CAPS, FACTS, FlatOutro, Q, VF, hitShake, pop } from './vkit';

const GOLD = '#E8B547', RED = '#E5383B', BG = '#0B0D12';
const Print: React.FC<{ at: number; x: number; y: number; rot: number; w: number; h: number; caption: string; children: React.ReactNode }> = ({ at, x, y, rot, w, h, caption, children }) => {
  const t = useT(); if (t < at) return null;
  const p = pop(t, at, 220, 16);
  return <div style={{ position: 'absolute', left: x, top: y, width: w, padding: '18px 18px 60px', background: '#EFE6D2', transform: `rotate(${rot}deg) scale(${1.4 - 0.4 * p}) translateY(${(1 - p) * -80}px)`, opacity: Math.min(1, p * 3), boxShadow: '0 30px 50px rgba(0,0,0,.6)' }}>
    <div style={{ height: h, overflow: 'hidden', background: '#6b5a40', filter: 'sepia(1) contrast(1.15) brightness(.95)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>{children}</div>
    <div style={{ position: 'absolute', left: 22, bottom: 16, fontFamily: VF.type, fontSize: 28, color: '#3a3020' }}>{caption}</div>
  </div>;
};
const Sub: React.FC = () => {
  const t = useT(), c = CAPS.find(([, a, b]) => t >= a && t < b); if (!c || t >= Q.outro) return null;
  return <div style={{ position: 'absolute', left: 60, right: 60, bottom: 230, textAlign: 'center', fontFamily: VF.sans, fontWeight: 800, fontSize: 52, color: '#fff', textShadow: '0 4px 16px rgba(0,0,0,.9)' }}>{c[0].split(' ').map((w, i) => <span key={i} style={{ color: /intocable|inventó|mundo|quiebra|1975/.test(w) ? GOLD : '#fff' }}>{w} </span>)}</div>;
};
/** Polyline drawn up to progress p. */
const Line: React.FC<{ pts: [number, number][]; p: number; c: string; w?: number; glow?: boolean }> = ({ pts, p, c, w = 8, glow }) => {
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0]} ${q[1]}`).join(' ');
  return <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" style={glow ? { filter: `drop-shadow(0 0 12px ${c})` } : undefined} />;
};

export const V4Doc: React.FC = () => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, z => z), 1.6) * 37));
  const flash = t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.2) : 0;
  const zoom = (a: number, b: number, z0: number, z1: number) => z0 + (z1 - z0) * prog(t, a, b, z => z);
  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: hitShake(t, 30) }}>
        {/* 1 · Rochester, 1975 */}
        {t < 1.5 && <AbsoluteFill style={{ transform: `scale(${zoom(0, 1.5, 1.6, 1.0)})`, transformOrigin: '560px 760px' }}>
          <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M${-200 + i * 60} 0 L${i * 60 + 300} 1920`} stroke="#1A2230" strokeWidth={i % 5 ? 2 : 5} />)}
            {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M0 ${i * 70} L1080 ${i * 70 - 200}`} stroke="#1A2230" strokeWidth={i % 4 ? 2 : 5} />)}
            <path d="M0 980 C300 900 500 1100 1080 960" stroke="#1D3A5C" strokeWidth="60" fill="none" />
            <circle cx="560" cy="760" r={30 + 30 * ((t * 1.5) % 1)} fill="none" stroke={GOLD} strokeWidth="4" opacity={1 - ((t * 1.5) % 1)} />
            <circle cx="560" cy="760" r="16" fill={GOLD} style={{ filter: `drop-shadow(0 0 16px ${GOLD})` }} />
          </svg>
          <div style={{ position: 'absolute', left: 600, top: 700, fontFamily: VF.type, fontSize: 40, color: GOLD }}>Rochester, NY</div>
        </AbsoluteFill>}
        {t >= 0.5 && t < 1.5 && <Print at={0.5} x={160} y={980} rot={-4} w={460} h={420} caption={FACTS.who}><Character id="d4" t={t} mood={t < Q.idea ? 'talk' : 'wow'} glasses size={420} /></Print>}
        <div style={{ position: 'absolute', left: 70, top: 200, fontFamily: VF.type, fontSize: 46, color: '#cfc6b0', opacity: t < 1.5 ? 1 : 0 }}>■ 1975</div>
        {/* 2 · the empire, in gold */}
        {t >= 1.5 && t < 3.0 && <>
          <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 8 }, (_, i) => <line key={i} x1="80" x2="1000" y1={500 + i * 110} y2={500 + i * 110} stroke="#1D2533" strokeWidth="2" />)}
            <Line pts={[[80, 1260], [250, 1180], [400, 1100], [560, 950], [700, 860], [850, 700], [1000, 560]]} p={prog(t, 1.55, 2.7)} c={GOLD} w={10} glow />
          </svg>
          <div style={{ position: 'absolute', left: 80, top: 330, fontFamily: VF.sans, fontWeight: 800, fontSize: 230, color: GOLD, letterSpacing: '-0.05em', textShadow: `0 0 50px ${GOLD}55` }}>{cnt}%</div>
          <div style={{ position: 'absolute', left: 90, top: 1330, fontFamily: VF.type, fontSize: 36, color: '#cfc6b0' }}>Kodak · películas vendidas en EE. UU.</div>
          <div style={{ position: 'absolute', left: 760, top: 1000, transform: `scale(${pop(t, 1.6, 200, 16)})`, opacity: 0.9 }}><Tower size={240} /></div>
        </>}
        {/* 3 · archive prints of the prototype */}
        {t >= 3.0 && t < 4.5 && <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 50% 45%, #2a2016, #0B0D12 75%)' }} />
          <Print at={3.05} x={110} y={420} rot={-5} w={620} h={420} caption="Prototipo, 1975"><div style={{ marginBottom: 60 }}><ShadedCamera size={520} parts={t < Q.p3 ? 0.76 : 1} /></div></Print>
          <Print at={Q.p2} x={500} y={1000} rot={6} w={460} h={300} caption={FACTS.secs}><div style={{ fontFamily: VF.type, fontSize: 150, color: '#efe6d2', marginBottom: 60 }}>0:23</div></Print>
          {[[Q.p1, FACTS.kg], [Q.p3, FACTS.px], [Q.cam, FACTS.tape]].map(([a, s], i) => t >= (a as number) && <div key={i} style={{ position: 'absolute', left: 90, top: 1050 + i * 80, fontFamily: VF.type, fontSize: 40, color: GOLD, opacity: prog(t, a as number, (a as number) + 0.1) }}>— {s}</div>)}
        </>}
        {/* 4 · the confidential memo */}
        {t >= 4.5 && t < Q.years && <div style={{ position: 'absolute', left: 90, top: 360, width: 900, height: 1100, background: '#F2EEE3', transform: `rotate(-2deg) scale(${zoom(4.5, Q.years, 0.96, 1.06)})`, boxShadow: '0 40px 70px rgba(0,0,0,.7)', padding: 60 }}>
          <div style={{ fontFamily: VF.type, fontSize: 40, color: '#222' }}>MEMORANDO INTERNO</div>
          <div style={{ fontFamily: VF.type, fontSize: 30, color: '#666', marginTop: 8 }}>Para: Junta directiva · Asunto: cámara digital</div>
          <div style={{ height: 4, background: '#222', margin: '24px 0' }} />
          {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ height: 16, background: '#C9C2B3', width: `${85 - (i * 11) % 30}%`, marginBottom: 22 }} />)}
          <div style={{ position: 'relative', fontFamily: VF.type, fontSize: 46, color: '#111', marginTop: 20, lineHeight: 1.25 }}>
            <span style={{ background: `linear-gradient(90deg, ${GOLD}aa ${prog(t, Q.no2, Q.no3 + 0.15) * 100}%, transparent 0)` }}>{FACTS.quote}</span>
          </div>
          {t >= Q.no1 && <div style={{ position: 'absolute', left: 170, top: 760, border: `10px solid ${RED}`, color: RED, fontFamily: VF.type, fontSize: 120, padding: '6px 30px', transform: `rotate(-14deg) scale(${2.2 - 1.2 * pop(t, Q.no1, 320, 15)})`, opacity: 0.88 }}>RECHAZADO</div>}
          {t >= Q.drawer && <div style={{ position: 'absolute', right: 60, bottom: 50, fontFamily: VF.type, fontSize: 40, color: RED, opacity: prog(t, Q.drawer, Q.drawer + 0.1) }}>→ archivar</div>}
        </div>}
        {/* 5 · film falls, digital rises */}
        {t >= Q.years && t < Q.HIT && <>
          <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
            <Line pts={[[80, 700], [400, 720], [650, 820], [850, 1050], [1000, 1300]]} p={prog(t, Q.years, Q.HIT)} c={GOLD} w={10} glow />
            <Line pts={[[80, 1350], [400, 1330], [650, 1150], [850, 850], [1000, 620]]} p={prog(t, Q.years, Q.HIT)} c="#5B8CFF" w={10} glow />
          </svg>
          <div style={{ position: 'absolute', left: 80, top: 330, fontFamily: VF.sans, fontWeight: 800, fontSize: 200, color: '#fff', letterSpacing: '-0.05em' }}>{year}</div>
          <div style={{ position: 'absolute', left: 90, top: 560, fontFamily: VF.type, fontSize: 36, color: GOLD }}>■ película</div>
          <div style={{ position: 'absolute', left: 90, top: 610, fontFamily: VF.type, fontSize: 36, color: '#5B8CFF' }}>■ cámaras digitales</div>
        </>}
        {/* 6 · crash + headlines */}
        {t >= Q.HIT && t < Q.outro && <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 50% 50%, #3a0a0c, #0B0D12 80%)' }} />
          <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}><Line pts={[[80, 520], [300, 540], [420, 600], [520, 900], [640, 1100], [760, 1400], [1000, 1600]]} p={prog(t, Q.HIT, Q.HIT + 0.5)} c={RED} w={12} glow /></svg>
          {[0, 1, 2].map(i => { const a = Q.HIT + 0.1 + i * 0.22, p = pop(t, a, 200, 14); return t >= a && <div key={i} style={{ position: 'absolute', left: 110 + i * 30, top: 520 + i * 260, width: 860, padding: 30, background: '#F2EEE3', transform: `rotate(${(1 - p) * 540 + [-6, 4, -2][i]}deg) scale(${p})`, boxShadow: '0 30px 60px rgba(0,0,0,.7)' }}>
            <div style={{ fontFamily: VF.news, fontSize: 40, borderBottom: '3px solid #222', paddingBottom: 6 }}>{['El Diario', 'La Gaceta', 'Noticias'][i]} · {FACTS.end}</div>
            <div style={{ fontFamily: VF.news, fontSize: [96, 80, 72][i], lineHeight: 1, marginTop: 14 }}>{['Kodak se declara en bancarrota', 'El fin de un gigante', '131 años de historia, en quiebra'][i]}</div>
          </div>; })}
        </>}
      </AbsoluteFill>
      <Sub />
      {/* letterbox + grain for the documentary feel */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: '#000' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: '#000' }} />
      <Grain opacity={0.12} />
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.8 }} />
      <FlatOutro />
      <AbbaTag />
    </AbsoluteFill>
  );
};
