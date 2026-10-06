// V2 · Deadpan chaos (the bill wurtz "history of the entire world" format): hard cuts, flat saturated gradients that
// change on every phrase, text that just appears wherever it wants, crude stick figures, little asides in brackets.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, prog, useT } from '../kit';
import { FlatOutro, Q, VF, hitShake } from './vkit';

const W = '#fff';
const BG: [number, string, string][] = [[0, '#2E6BFF', '#7FB2FF'], [1.5, '#11B85C', '#A6F05A'], [3.0, '#8C3CFF', '#FF6FD8'], [4.5, '#FF7A1A', '#FFD23C'], [Q.no1, '#1d1d1d', '#3a3a3a'], [Q.years, '#4a4a55', '#22222a'], [Q.HIT, '#C8102E', '#3a0008'], [Q.outro, '#000', '#000']];
/** Text that is simply there from `at` (no easing — the joke is that it just appears). */
const T: React.FC<{ at: number; out?: number; x: number; y: number; size: number; rot?: number; c?: string; children: React.ReactNode; font?: string }> = ({ at, out = 99, x, y, size, rot = 0, c = W, children, font = VF.sans }) => {
  const t = useT(); if (t < at || t >= out) return null;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, fontFamily: font, fontWeight: 300, fontSize: size, color: c, whiteSpace: 'pre', lineHeight: 1 }}>{children}</div>;
};
const Stick: React.FC<{ x: number; y: number; s?: number; tie?: boolean; arms?: number; t: number; wob?: number }> = ({ x, y, s = 1, tie, arms = 0, t, wob = 1 }) => {
  const w = Math.sin(t * 9) * 6 * wob;
  return <svg width="300" height="420" style={{ position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0', overflow: 'visible' }}>
    <g stroke={W} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="150" cy="70" r="50" />
      <path d={`M150 120 L150 270 M150 160 L${90 - arms * 20} ${230 - arms * 150 + w} M150 160 L${210 + arms * 20} ${230 - arms * 150 - w} M150 270 L100 390 M150 270 L200 390`} />
      {tie && <path d="M150 125 L140 175 L150 190 L160 175 Z" fill={W} />}
    </g>
    <circle cx="132" cy="62" r="6" fill={W} /><circle cx="168" cy="62" r="6" fill={W} />
  </svg>;
};

export const V2Wurtz: React.FC = () => {
  const t = useT();
  const bg = [...BG].reverse().find(b => t >= b[0])!;
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, z => z), 1.6) * 37));
  const fall = Math.max(0, t - Q.HIT - 0.3);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${150 + Math.sin(t) * 10}deg, ${bg[1]}, ${bg[2]})` }}>
      <AbsoluteFill style={{ transform: hitShake(t, 24) }}>
        {/* 1975 */}
        <T at={0.08} out={0.55} x={170} y={700} size={300}>1975</T>
        <T at={0.3} out={0.55} x={640} y={1030} size={44}>(un año)</T>
        {t >= Q.idea && t < 1.5 && <>
          <Stick x={380} y={820} t={t} arms={1} />
          <svg width="200" height="200" style={{ position: 'absolute', left: 440, top: 560 }}><circle cx="100" cy="90" r="60" fill="#FFE14D" stroke={W} strokeWidth="8" />{Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return <line key={i} x1={100 + Math.cos(a) * 75} y1={90 + Math.sin(a) * 75} x2={100 + Math.cos(a) * 98} y2={90 + Math.sin(a) * 98} stroke={W} strokeWidth="8" strokeLinecap="round" />; })}</svg>
          <T at={Q.idea} x={150} y={380} size={110}>1975</T>
          <T at={0.8} x={620} y={1000} size={46} rot={-8}>un tipo</T>
          <T at={1.05} x={130} y={1250} size={40}>(tiene una idea)</T>
        </>}
        {/* kodak */}
        {t >= 1.5 && t < 3.0 && <>
          <div style={{ position: 'absolute', left: 290, top: 820, width: 500, height: 300, border: `9px solid ${W}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: VF.sans, fontWeight: 300, fontSize: 120, color: W }}>kodak</div>
          <svg width="260" height="160" style={{ position: 'absolute', left: 410, top: 680 }}><path d="M20 140 L40 30 L95 100 L130 20 L165 100 L220 30 L240 140 Z" fill="#FFE14D" stroke={W} strokeWidth="8" strokeLinejoin="round" /></svg>
          <T at={1.8} x={150} y={400} size={200} c="#fff">{`${cnt}%`}</T>
          <T at={1.95} x={630} y={470} size={40} rot={6}>de todo</T>
          {t >= 2.27 && [0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 540 - 330 - i * 70, top: 970 - 330 - i * 70, width: 660 + i * 140, height: 660 + i * 140, borderRadius: '50%', border: `5px solid rgba(255,255,255,${0.7 - i * 0.2})`, transform: `scale(${1 + 0.03 * Math.sin(t * 20 + i)})` }} />)}
          <T at={2.27} x={300} y={1500} size={110}>intocable</T>
          <T at={2.6} x={120} y={1640} size={38}>(según kodak)</T>
        </>}
        {/* the build */}
        {t >= 3.0 && t < 4.5 && <>
          <T at={3.08} x={120} y={330} size={130}>entonces</T>
          {t < Q.cam && <>
            <Stick x={390} y={860} t={t} arms={Math.abs(Math.sin(t * 14))} wob={3} />
            <svg width="420" height="300" style={{ position: 'absolute', left: 330, top: 760 }}>{Array.from({ length: 6 }, (_, i) => <circle key={i} cx={210 + Math.cos(t * 13 + i) * 150} cy={150 + Math.sin(t * 11 + i * 2) * 90} r={40 + 15 * Math.sin(t * 20 + i)} fill="rgba(255,255,255,.35)" />)}</svg>
            <T at={Q.p1} x={160} y={700} size={60} rot={-15}>clank</T>
            <T at={Q.p2} x={700} y={820} size={54} rot={12}>tink</T>
            <T at={Q.p3} x={240} y={1300} size={66} rot={6}>bonk</T>
            <T at={3.5} x={560} y={1450} size={40}>(hace cosas)</T>
          </>}
          {t >= Q.cam && <>
            <svg width="600" height="360" style={{ position: 'absolute', left: 240, top: 780 }}><g stroke={W} strokeWidth="9" fill="none" strokeLinejoin="round"><rect x="20" y="60" width="420" height="260" rx="20" /><rect x="440" y="120" width="70" height="140" /><circle cx="540" cy="190" r="50" /><rect x="70" y="20" width="90" height="40" /></g><circle cx="540" cy="190" r="16" fill={W} /></svg>
            <T at={Q.cam} x={150} y={600} size={64}>algo</T>
            <T at={Q.shot} x={600} y={620} size={70} rot={-10}>*click*</T>
            <T at={Q.shot + 0.05} x={140} y={1260} size={40}>(la primera cámara digital)</T>
            <T at={Q.shot + 0.05} x={140} y={1320} size={40}>(pesa 3.6 kg)</T>
          </>}
        </>}
        {/* the world / the board */}
        {t >= 4.5 && t < Q.years && <>
          {t < Q.no1 ? <>
            <svg width="520" height="520" style={{ position: 'absolute', left: 280, top: 640, transform: `rotate(${t * 60}deg)` }}><circle cx="260" cy="260" r="240" fill="#2E6BFF" stroke={W} strokeWidth="9" /><path d="M120 160 C180 120 240 200 200 260 C160 320 100 260 120 160Z M300 300 C360 260 420 330 380 400 C340 450 280 380 300 300Z M330 120 C370 110 400 160 360 180Z" fill="#11B85C" stroke={W} strokeWidth="6" /></svg>
            <T at={4.5} x={140} y={380} size={110}>que cambiaría</T>
            <T at={4.95} x={300} y={1260} size={150}>el mundo</T>
          </> : <>
            {[0, 1, 2].map(i => <Stick key={i} x={60 + i * 330} y={800} t={t} tie s={0.9} wob={0.3} />)}
            <div style={{ position: 'absolute', left: 40, right: 40, top: 1110, height: 16, background: W }} />
            <T at={Q.no1} x={110} y={560} size={140} c="#FF4D4D">no</T>
            <T at={Q.no2} x={430} y={500} size={190} c="#FFE14D" rot={-6}>no</T>
            <T at={Q.no3} x={760} y={590} size={120} c="#7FD3FF" rot={8}>no.</T>
            <T at={Q.drawer} x={140} y={1300} size={44}>(lo guardaron en un cajón)</T>
            <T at={Q.drawer + 0.12} x={140} y={1370} size={44}>(con llave)</T>
          </>}
        </>}
        {/* years */}
        {t >= Q.years && t < Q.HIT && <>
          <T at={Q.years} x={210} y={760} size={240}>{String(year)}</T>
          <T at={Q.years + 0.1} x={200} y={1080} size={44}>(pasan muchos años)</T>
          <T at={Q.years + 0.35} x={330} y={1170} size={40} rot={-5}>(todos tienen cámara digital)</T>
        </>}
        {/* quiebra: the letters fall apart */}
        {t >= Q.HIT && t < Q.outro && <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center' }}>{'quiebra.'.split('').map((ch, i) => <span key={i} style={{ display: 'inline-block', transform: `translateY(${Math.max(0, fall - i * 0.04) ** 2 * 2600}px) rotate(${Math.max(0, fall - i * 0.04) * (i % 2 ? 160 : -140)}deg)`, fontFamily: VF.sans, fontWeight: 300, fontSize: 200, color: W }}>{ch}</span>)}</div>
          <T at={Q.HIT + 0.5} x={420} y={1250} size={60}>oh no</T>
          <T at={Q.HIT + 0.9} x={200} y={1350} size={40}>(kodak, enero de 2012)</T>
        </>}
      </AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.15) * 0.9 : 0 }} />
      <FlatOutro />
      <AbbaTag />
    </AbsoluteFill>
  );
};
