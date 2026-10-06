// D1/D2 · Video 1's story rebuilt with the second reference's motion language: mood glows, bokeh depth, glass cards,
// word-by-word headline with highlight boxes, particle bursts, and shaded characters that react (idea, joy, the NO, sadness).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, F, prog, useT } from '../kit';
import { FlatOutro, Q, hitShake, pop } from './fkit';
import { Bokeh, Burst, Character, DARK, Glass, GlowBulb, Glow, Headline, LIGHT, ShadedCamera, Theme, Tower } from './dkit';

const Enter: React.FC<{ a: number; b: number; children: React.ReactNode; from?: number }> = ({ a, b, children, from = 1 }) => {
  const t = useT(); if (t < a || t >= b) return null;
  const i = prog(t, a, a + 0.3), o = prog(t, b - 0.2, b);
  return <AbsoluteFill style={{ transform: `translateX(${(1 - i) * 300 * from - o * 300}px) scale(${0.96 + 0.04 * i})`, opacity: i * (1 - o), filter: `blur(${(1 - i) * 12 + o * 12}px)` }}>{children}</AbsoluteFill>;
};

const Story: React.FC<{ th: Theme }> = ({ th }) => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, x => x), 1.6) * 37));
  const parts = t < Q.p1 ? 0.05 : t < Q.p2 ? 0.26 : t < Q.p3 ? 0.51 : t < Q.cam ? 0.76 : 1;
  const crack = prog(t, Q.HIT + 0.1, Q.HIT + 1.1, x => x);
  const flash = t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.25) : 0;
  const lift = prog(t, Q.cam, Q.cam + 0.35);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Glow th={th} />
      <Bokeh th={th} />
      <AbsoluteFill style={{ transform: hitShake(t, 34) }}>
        {/* 1 · 1975, the idea */}
        <Enter a={0} b={1.5}>
          <Glass th={th} at={0.05} x={90} y={520} w={300} h={300} tilt={-6} style={{ filter: 'blur(3px)' }}>
            <div style={{ height: 70, background: th.red }} />
            <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 96, color: th.text, textAlign: 'center', marginTop: 50 }}>1975</div>
          </Glass>
          <div style={{ position: 'absolute', left: 230, top: 760 + (1 - pop(t, 0.05, 160, 14)) * 500 }}><Character id="eng1" t={t} mood={t < Q.idea ? 'talk' : 'wow'} glasses size={620} look={t < Q.idea ? -1 : 0} tilt={t >= Q.idea ? -4 : 0} /></div>
          {t >= Q.idea && <div style={{ position: 'absolute', left: 470, top: 480, transform: `scale(${pop(t, Q.idea, 300, 11)}) rotate(${Math.sin(t * 5) * 6}deg)` }}><GlowBulb size={160} t={t} /></div>}
          <Burst at={Q.idea} x={545} y={560} colors={[th.yellow, '#FFF1B8', th.yellow]} n={34} power={0.8} />
          <div style={{ position: 'absolute', left: -40, right: -40, top: 1560, height: 300, borderRadius: 40, background: th.dark ? 'linear-gradient(#3a2a20,#1c140f)' : 'linear-gradient(#E0B98A,#C99A66)', filter: 'blur(2px)', boxShadow: '0 -20px 60px rgba(0,0,0,.35)' }} />
        </Enter>
        {/* 2 · the untouchable empire */}
        <Enter a={1.5} b={3.0}>
          <div style={{ position: 'absolute', left: 560 - (t - 1.5) * 30, top: 430, transform: `scale(${pop(t, 1.5, 150, 16)})`, transformOrigin: '50% 100%' }}><Tower size={470} /></div>
          <Glass th={th} at={Q.kodak} x={50} y={900} w={480} h={400}>
            <div style={{ padding: 40, display: 'grid', gap: 20 }}>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 34, color: th.sub }}>Mercado de fotografía</span>
              <span style={{ fontFamily: F.body, fontWeight: 800, fontSize: 170, lineHeight: 0.9, color: th.yellow, letterSpacing: '-0.05em', textShadow: th.dark ? `0 0 40px ${th.yellow}66` : undefined }}>{cnt}%</span>
              <div style={{ height: 26, borderRadius: 13, background: th.dark ? 'rgba(255,255,255,.1)' : '#E4DED3', overflow: 'hidden' }}><div style={{ width: `${cnt}%`, height: '100%', background: `linear-gradient(90deg, ${th.yellow}, ${th.green})`, borderRadius: 13 }} /></div>
            </div>
          </Glass>
          <Burst at={Q.full} x={340} y={960} colors={[th.yellow, th.green, '#fff']} n={36} />
        </Enter>
        {/* 3 · building the camera, the first photo */}
        <Enter a={3.0} b={4.5}>
          {t < Q.cam + 0.1 && <Glass th={th} at={3.02} out={Q.cam} x={70} y={520} w={940} h={620} style={{ background: th.dark ? 'linear-gradient(160deg, rgba(91,140,255,.18), rgba(91,140,255,.05))' : 'linear-gradient(160deg,#EEF3FF,#DCE6FB)' }}>
            <svg width="940" height="620" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>{Array.from({ length: 19 }, (_, i) => <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="620" stroke={th.blue} strokeWidth="1.5" />)}{Array.from({ length: 13 }, (_, i) => <line key={i} x1="0" y1={i * 50} x2="940" y2={i * 50} stroke={th.blue} strokeWidth="1.5" />)}</svg>
            <div style={{ position: 'absolute', left: 230, top: 170 }}><ShadedCamera size={480} parts={parts} /></div>
          </Glass>}
          {[Q.p1, Q.p2, Q.p3].map((a, i) => <Burst key={i} at={a} x={[420, 760, 330][i]} y={[760, 820, 840][i]} colors={[th.blue, '#fff']} n={14} power={0.5} />)}
          {t >= Q.cam && <>
            <div style={{ position: 'absolute', left: 240, top: 900 + (1 - pop(t, Q.cam, 180, 14)) * 600 }}><Character id="eng3" t={t} mood="wow" glasses size={600} armsUp={lift} /></div>
            <div style={{ position: 'absolute', left: 340, top: 610 - lift * 40 + Math.sin(t * 6) * 6, transform: `scale(${0.7 + 0.1 * lift}) rotate(${Math.sin(t * 4) * 4}deg)` }}><ShadedCamera size={400} glow={Math.max(0, 1 - Math.abs(t - Q.shot) * 2)} /></div>
          </>}
          <Burst at={Q.shot} x={540} y={700} colors={[th.green, '#fff', th.yellow]} n={50} power={1.2} />
        </Enter>
        {/* 4 · the board says NO, the camera is locked in a drawer */}
        <Enter a={4.5} b={Q.years}>
          <Glass th={th} at={Q.meet} x={250} y={470} w={580} h={330}>
            <div style={{ position: 'absolute', left: 90, top: 50, transform: `scale(${1 - prog(t, Q.drawer, Q.drawer + 0.3) * 0.6}) translateY(${prog(t, Q.drawer, Q.drawer + 0.3) * 700}px)`, opacity: 1 - prog(t, Q.drawer + 0.2, Q.drawer + 0.3) }}><ShadedCamera size={400} /></div>
          </Glass>
          {[0, 1, 2].map(i => {
            const no = [Q.no1, Q.no2, Q.no3][i], x = [10, 370, 730][i];
            return <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: x, top: 880 + (1 - pop(t, [Q.a1, Q.a2, Q.a2 + 0.1][i], 200, 14)) * 500 }}><Character id={`s${i}`} t={t} suit hair={['#9a9a9a', '#3a2a20', '#d8d8d8'][i]} skin={i === 1 ? ['#E8B48E', '#B7785A'] : undefined} mood={t < no ? 'talk' : 'stern'} size={340} look={i === 0 ? 1 : i === 2 ? -1 : 0} /></div>
              {t >= no && <div style={{ position: 'absolute', left: x + 95, top: 820, transform: `scale(${pop(t, no, 320, 12)}) rotate(${(i - 1) * 8}deg)`, padding: '10px 34px', borderRadius: 26, background: th.red, color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 64, boxShadow: `0 0 40px ${th.red}aa, 0 16px 30px rgba(0,0,0,.4)` }}>NO</div>}
              <Burst at={no} x={x + 170} y={860} colors={[th.red, '#fff']} n={18} power={0.6} />
            </React.Fragment>;
          })}
          <div style={{ position: 'absolute', left: -40, right: -40, top: 1260, height: 120, borderRadius: 30, background: th.dark ? 'linear-gradient(#2a2622,#14110f)' : 'linear-gradient(#D9A877,#B07F52)', boxShadow: '0 -10px 40px rgba(0,0,0,.4)' }} />
          {t >= Q.drawer - 0.1 && <div style={{ position: 'absolute', left: 390, top: 1180 + (1 - pop(t, Q.drawer - 0.1)) * 300, width: 300, height: 170, borderRadius: 24, background: 'linear-gradient(#C99A66,#9C7148)', boxShadow: '0 20px 40px rgba(0,0,0,.45)' }}>
            <div style={{ position: 'absolute', left: 100, top: 50, width: 100, height: 16, borderRadius: 8, background: '#5a3f26' }} />
            {t >= Q.drawer + 0.3 && <svg width="80" height="90" style={{ position: 'absolute', left: 110, top: 70, transform: `scale(${pop(t, Q.drawer + 0.3, 320, 12)})` }}><path d="M20 38 V24 a20 20 0 0 1 40 0 V38" stroke="#555" strokeWidth="8" fill="none" /><rect x="8" y="36" width="64" height="48" rx="10" fill={th.yellow} /></svg>}
          </div>}
        </Enter>
        {/* 5 · the years run */}
        <Enter a={Q.years} b={Q.HIT}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 300, letterSpacing: '-0.06em', color: th.text, filter: `blur(${Math.min(6, (t - Q.years) * 6)}px)`, opacity: 0.95 }}>{year}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 300, letterSpacing: '-0.06em', color: th.text }}>{year}</div>
        </Enter>
        {/* 6 · the collapse */}
        {t >= Q.HIT && t < Q.outro && <>
          <div style={{ position: 'absolute', left: 330, top: 640 }}><Tower size={420} crack={crack} lit={0} /></div>
          <Burst at={Q.HIT + 0.15} x={540} y={1100} colors={[th.red, '#9a9a9a', '#fff']} n={60} power={1.4} />
          <div style={{ position: "absolute", left: 40, top: 1150 + (1 - pop(t, Q.HIT + 0.3, 180, 14)) * 600 }}><Character id="eng6" t={t} mood="sad" glasses size={420} tilt={6} /></div>
        </>}
      </AbsoluteFill>
      {t < Q.outro && <Headline th={th} />}
      <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.85, pointerEvents: 'none' }} />
      <FlatOutro />
      <AbbaTag color={th.dark ? '#F4F1EA' : '#FBFAF7'} />
    </AbsoluteFill>
  );
};
export const D1Dark: React.FC = () => <Story th={DARK} />;
export const D2Light: React.FC = () => <Story th={LIGHT} />;
