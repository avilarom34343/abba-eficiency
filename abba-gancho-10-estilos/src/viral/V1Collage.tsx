// V1 · Paper collage (the Vox / Johnny Harris explainer look): halftone cut-outs with white sticker edges on textured
// paper, tape, typewriter labels with real facts, red marker circles and arrows, a slow Ken Burns push, and a
// newspaper clipping slamming in on "quiebra".
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, prog, useT } from '../kit';
import { Character, ShadedCamera, Tower } from '../flat/dkit';
import { FACTS, FlatOutro, Paper, Q, Tape, VF, halftone, hitShake, pop, torn } from './vkit';

const RED = '#D93A2B', INK = '#1a1a1a';
/** Printed cut-out: grayscale + halftone texture + white sticker border, slapped onto the page. */
const Cut: React.FC<{ at: number; x: number; y: number; rot?: number; children: React.ReactNode; out?: number }> = ({ at, x, y, rot = -3, children, out = 99 }) => {
  const t = useT(); if (t < at || t > out) return null;
  const p = pop(t, at, 260, 15);
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translateY(${(1 - p) * -160}px) rotate(${rot + (1 - p) * 12}deg) scale(${1.25 - 0.25 * p})`, opacity: Math.min(1, p * 3), filter: 'drop-shadow(7px 0 0 #fff) drop-shadow(-7px 0 0 #fff) drop-shadow(0 7px 0 #fff) drop-shadow(0 -7px 0 #fff) drop-shadow(0 16px 14px rgba(0,0,0,.35))' }}>
    <div style={{ position: 'relative', filter: 'url(#print) contrast(1.3)' }}>{children}</div>
  </div>;
};
/** Typewriter label on a white paper strip, typed on. */
const Label: React.FC<{ at: number; x: number; y: number; text: string; rot?: number; size?: number; red?: boolean; speed?: number }> = ({ at, x, y, text, rot = -2, size = 38, red, speed = 0.025 }) => {
  const t = useT(); if (t < at) return null;
  const n = Math.ceil(prog(t, at, at + speed * text.length + 0.05, z => z) * text.length);
  return <div style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${pop(t, at, 300, 16)})`, transformOrigin: '0 50%', background: red ? RED : '#FBF8F0', color: red ? '#fff' : INK, padding: '8px 16px', fontFamily: VF.type, fontSize: size, boxShadow: '0 6px 10px rgba(0,0,0,.2)', clipPath: torn(at * 10, 18, 1.4), whiteSpace: 'nowrap' }}>{text.slice(0, n)}</div>;
};
/** Red marker stroke that draws itself. */
const Marker: React.FC<{ d: string; at: number; dur?: number; w?: number }> = ({ d, at, dur = 0.3, w = 9 }) => {
  const t = useT(), p = prog(t, at, at + dur, z => z); if (p <= 0) return null;
  return <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}><path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={RED} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.92} /></svg>;
};
/** Big headline card (black type on a white strip), like the explainer's title cards. */
const Title: React.FC<{ at: number; out: number; text: string; y?: number; size?: number }> = ({ at, out, text, y = 210, size = 96 }) => {
  const t = useT(); if (t < at || t >= out) return null;
  return <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: '#FBF8F0', padding: '10px 30px', fontFamily: VF.black, fontSize: size, color: INK, letterSpacing: '-0.02em', transform: `rotate(-1.5deg) scaleX(${pop(t, at, 300, 18)})`, boxShadow: '0 10px 18px rgba(0,0,0,.25)', clipPath: torn(at * 7, 22, 1.2) }}>{text}</div>
  </div>;
};
const Scene: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const t = useT(); if (t < a || t >= b) return null;
  const k = prog(t, a, b, z => z);
  return <AbsoluteFill style={{ transform: `scale(${1.0 + 0.06 * k}) translateX(${(prog(t, a, a + 0.22) - 1) * -1100}px)` }}>{children}</AbsoluteFill>;
};

export const V1Collage: React.FC = () => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const parts = t < Q.p1 ? 0.3 : 1;
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, z => z), 1.6) * 37));
  const flash = t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.2) : 0;
  return (
    <AbsoluteFill>
      <Paper />
      {/* printed-photo look: grayscale + paper grain, kept inside each cut-out's own shape */}
      <svg width="0" height="0" style={{ position: 'absolute' }}><filter id="print"><feColorMatrix type="saturate" values="0" result="g" /><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.6 -0.5" result="nn" /><feComposite in="nn" in2="SourceAlpha" operator="in" result="grain" /><feBlend in="g" in2="grain" mode="multiply" /></filter></svg>
      <AbsoluteFill style={{ transform: hitShake(t, 30) }}>
        {/* 1 · 1975: the inventor */}
        <Scene a={0} b={1.5}>
          <Title at={0.08} out={1.5} text="1975" size={150} />
          <Cut at={0.12} x={200} y={620} rot={-4}><Character id="v1a" t={t} mood={t < Q.idea ? 'talk' : 'wow'} glasses size={680} /></Cut>
          <Tape x={420} y={600} rot={-6} />
          <Label at={0.5} x={120} y={1430} text={FACTS.who} />
          <Label at={0.8} x={300} y={1500} text="ingeniero de Kodak" rot={1.5} />
          <Marker at={Q.idea} d="M540 560 C380 560 330 700 380 820 C430 940 680 930 720 800 C760 680 680 560 520 580" />
          <Marker at={Q.idea + 0.2} dur={0.2} d="M800 520 L720 640 M720 640 L760 600 M720 640 L700 590" w={8} />
          <Label at={Q.idea + 0.25} x={700} y={450} text="la idea" red rot={4} size={44} />
        </Scene>
        {/* 2 · the empire */}
        <Scene a={1.5} b={3.0}>
          <Title at={1.5} out={3.0} text="KODAK" size={150} />
          <div style={{ position: 'absolute', left: 60, top: 460, width: 960, height: 520, background: '#DCE3D2', clipPath: torn(3, 30, 1.5), boxShadow: '0 10px 20px rgba(0,0,0,.2)', transform: 'rotate(1.5deg)' }}>
            <svg width="960" height="520">{Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${i * 80 - 100} 0 L${i * 80 + 60} 520`} stroke="#B7C2AE" strokeWidth="6" />)}<path d="M0 300 C300 260 600 360 960 280" stroke="#9BB7D8" strokeWidth="40" fill="none" /></svg>
          </div>
          <Label at={1.6} x={110} y={490} text={FACTS.where} size={34} />
          <Cut at={1.62} x={560} y={540} rot={3}><Tower size={360} /></Cut>
          <div style={{ position: 'absolute', left: 90, top: 1060, fontFamily: VF.black, fontSize: 260, color: RED, letterSpacing: '-0.04em', transform: `rotate(-4deg) scale(${pop(t, Q.kodak, 260, 14)})`, opacity: t >= Q.kodak ? 1 : 0 }}>{cnt}%</div>
          <Marker at={Q.full} d="M80 1180 C80 1050 640 1040 660 1170 C680 1320 120 1330 90 1220" />
          <Label at={Q.full - 0.2} x={130} y={1400} text="de las películas vendidas en EE. UU." size={34} />
        </Scene>
        {/* 3 · the invention, annotated with the real specs */}
        <Scene a={3.0} b={4.5}>
          <Title at={3.0} out={4.5} text="EL INVENTO" size={120} />
          <Cut at={3.08} x={150} y={690} rot={-2}><ShadedCamera size={760} parts={parts} /></Cut>
          <Tape x={160} y={680} rot={-12} /><Tape x={780} y={700} rot={10} />
          {[[Q.p1, FACTS.kg, 140, 520, 'M300 600 L360 720'], [Q.p2, FACTS.secs, 470, 1220, 'M600 1210 L560 1100'], [Q.p3, FACTS.px, 120, 1330, 'M260 1320 L330 1120'], [Q.cam, FACTS.tape, 520, 1420, 'M700 1410 L760 1120']].map(([a, s, x, y, d]) => <React.Fragment key={s as string}>
            <Marker at={a as number} dur={0.12} d={d as string} w={6} />
            <Label at={(a as number) + 0.05} x={x as number} y={y as number} text={s as string} size={36} />
          </React.Fragment>)}
          {t >= Q.shot && <div style={{ position: 'absolute', left: 640, top: 380, width: 300, height: 300, background: '#fff', padding: 16, transform: `rotate(7deg) scale(${pop(t, Q.shot, 260, 14)})`, boxShadow: '0 14px 20px rgba(0,0,0,.3)' }}>
            <div style={{ width: '100%', height: '100%', background: '#888', imageRendering: 'pixelated', display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)' }}>{Array.from({ length: 100 }, (_, i) => <div key={i} style={{ background: `hsl(0 0% ${30 + ((i * 37) % 50)}%)` }} />)}</div>
          </div>}
        </Scene>
        {/* 4 · the board */}
        <Scene a={4.5} b={Q.years}>
          <Title at={4.5} out={Q.years} text="LA JUNTA" size={120} />
          {[0, 1, 2].map(i => <Cut key={i} at={[Q.meet, Q.a1, Q.a2][i]} x={[20, 360, 700][i]} y={600} rot={[-3, 1, 4][i]}><Character id={`v1s${i}`} t={t} suit hair={['#9a9a9a', '#3a2a20', '#d8d8d8'][i]} mood={t < [Q.no1, Q.no2, Q.no3][i] ? 'talk' : 'stern'} size={360} /></Cut>)}
          {[Q.no1, Q.no2, Q.no3].map((a, i) => <React.Fragment key={i}>
            <Marker at={a} dur={0.12} d={`M${[90, 430, 770][i]} 560 L${[90, 430, 770][i]} 470 L${[160, 500, 840][i]} 560 L${[160, 500, 840][i]} 470`} w={12} />
            <Marker at={a + 0.04} dur={0.1} d={`M${[230, 570, 910][i]} 470 C${[200, 540, 880][i]} 470 ${[200, 540, 880][i]} 560 ${[230, 570, 910][i]} 560 C${[260, 600, 940][i]} 560 ${[260, 600, 940][i]} 470 ${[230, 570, 910][i]} 470`} w={12} />
          </React.Fragment>)}
          <Label at={Q.no1} x={40} y={1120} text={FACTS.quote} size={36} rot={-1} speed={0.008} />
          {t >= Q.drawer && <div style={{ position: 'absolute', left: 300, top: 1260, padding: '10px 40px', border: `8px solid ${RED}`, color: RED, fontFamily: VF.type, fontSize: 90, transform: `rotate(-8deg) scale(${2 - pop(t, Q.drawer, 320, 15)})`, opacity: 0.9 }}>ARCHIVADO</div>}
        </Scene>
        {/* 5 · the years */}
        <Scene a={Q.years} b={Q.HIT}>
          {Array.from({ length: Math.max(1, Math.floor((year - 1975) / 6) + 1) }, (_, i) => <Label key={i} at={Q.years + i * 0.1} x={160 + (i % 2) * 220} y={420 + i * 160} text={String(1975 + i * 6 + (i ? 1 : 0))} size={90} rot={(i % 2 ? 3 : -3)} />)}
          <Label at={Q.years} x={540} y={1300} text={String(year)} size={120} red rot={-4} />
        </Scene>
        {/* 6 · the newspaper */}
        {t >= Q.HIT && t < Q.outro && <div style={{ position: 'absolute', left: 70, top: 330, width: 940, height: 1150, background: '#F4EEDF', clipPath: torn(9, 30, 1.6), transform: `rotate(${-3 + (1 - pop(t, Q.HIT, 240, 13)) * -25}deg) scale(${1.6 - 0.6 * pop(t, Q.HIT, 240, 13)})`, boxShadow: '0 30px 40px rgba(0,0,0,.4)', padding: 50 }}>
          <div style={{ fontFamily: VF.news, fontSize: 92, textAlign: 'center', borderBottom: `5px double ${INK}`, paddingBottom: 10 }}>El Diario</div>
          <div style={{ fontFamily: VF.type, fontSize: 30, textAlign: 'center', margin: '12px 0' }}>{FACTS.end}</div>
          <div style={{ fontFamily: VF.news, fontSize: 104, lineHeight: 0.98, textAlign: 'center', marginTop: 20 }}>Kodak se declara en bancarrota</div>
          <div style={{ display: 'flex', gap: 30, marginTop: 40 }}>
            <div style={{ width: 380, height: 420, background: '#bbb', ...halftone('#333', 7, 2.2), display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}><div style={{ filter: 'grayscale(1)' }}><Tower size={230} crack={prog(t, Q.HIT + 0.2, Q.HIT + 1.2)} lit={0} /></div></div>
            <div style={{ flex: 1, display: 'grid', gap: 14, alignContent: 'start' }}>{Array.from({ length: 11 }, (_, i) => <div key={i} style={{ height: 14, background: '#9b9384', width: `${70 + (i * 13) % 30}%` }} />)}</div>
          </div>
        </div>}
        {t >= Q.HIT + 0.25 && <Marker at={Q.HIT + 0.25} dur={0.25} d="M160 560 L920 1260 M920 560 L160 1260" w={22} />}
      </AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.85 }} />
      <FlatOutro />
      <AbbaTag color="#FBF8F0" />
    </AbsoluteFill>
  );
};
