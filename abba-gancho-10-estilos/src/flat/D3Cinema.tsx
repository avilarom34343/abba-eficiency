// D3 · Cinema: the same story shot like a film — close-ups, fast pull-backs, a low angle on the tower, one quick cut per
// board member slamming NO, and rack focus (blurred foreground / background layers) for depth. Dark mood-glow theme.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, F, inOut, prog, useT } from '../kit';
import { FlatOutro, Q, hitShake, pop } from './fkit';
import { Bokeh, Burst, Character, DARK, GlowBulb, Glow, Headline, ShadedCamera, Tower } from './dkit';

const th = DARK;
type Shot = { a: number; b: number; zoom: [number, number]; pan?: [number, number]; ox?: number; oy?: number };
/** A shot: content scaled/panned between a and b around (ox, oy), with a hard cut and a 2-frame flash-in. */
const ShotBox: React.FC<{ s: Shot; children: React.ReactNode }> = ({ s, children }) => {
  const t = useT(); if (t < s.a || t >= s.b) return null;
  const k = prog(t, s.a, s.b, inOut), z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * k, px = s.pan ? s.pan[0] + (s.pan[1] - s.pan[0]) * k : 0;
  return <AbsoluteFill style={{ transform: `translate(${px}px, 0) scale(${z})`, transformOrigin: `${s.ox ?? 540}px ${s.oy ?? 960}px` }}>{children}</AbsoluteFill>;
};
const Fg: React.FC<{ children: React.ReactNode; blur?: number; style?: React.CSSProperties }> = ({ children, blur = 14, style }) => <div style={{ position: 'absolute', filter: `blur(${blur}px)`, ...style }}>{children}</div>;

export const D3Cinema: React.FC = () => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, x => x), 1.6) * 37));
  const parts = t < Q.p1 ? 0.05 : t < Q.p2 ? 0.26 : t < Q.p3 ? 0.51 : t < Q.cam ? 0.76 : 1;
  const crack = prog(t, Q.HIT + 0.1, Q.HIT + 1.1, x => x);
  const flash = t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.25) : 0;
  const redFlash = [Q.no1, Q.no2, Q.no3].reduce((m, a) => Math.max(m, t >= a ? Math.max(0, 1 - (t - a) / 0.12) : 0), 0);
  const cuts = [Q.idea, 1.5, 3.0, Q.cam, 4.5, Q.no1, Q.no2, Q.no3, Q.drawer, Q.years, Q.HIT];
  const cutFlash = cuts.reduce((m, a) => Math.max(m, t >= a ? Math.max(0, 1 - (t - a) / 0.07) : 0), 0);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Glow th={th} />
      <Bokeh th={th} n={30} />
      <AbsoluteFill style={{ transform: hitShake(t, 36) }}>
        {/* A · extreme close-up: he's thinking */}
        <ShotBox s={{ a: 0, b: Q.idea, zoom: [1.05, 1.15], oy: 900 }}>
          <div style={{ position: 'absolute', left: -110, top: 380 }}><Character id="c1" t={t} mood="talk" glasses size={1300} look={-1} tilt={-3} /></div>
        </ShotBox>
        {/* B · fast pull back: the light bulb pops */}
        <ShotBox s={{ a: Q.idea, b: 1.5, zoom: [1.5, 1.0], oy: 700 }}>
          <div style={{ position: 'absolute', left: 190, top: 720 }}><Character id="c1" t={t} mood="wow" glasses size={700} tilt={-5} /></div>
          <div style={{ position: 'absolute', left: 450, top: 380, transform: `scale(${pop(t, Q.idea, 300, 11)})` }}><GlowBulb size={190} t={t} /></div>
          <Burst at={Q.idea} x={545} y={470} colors={[th.yellow, '#FFF1B8']} n={44} />
          <Fg style={{ left: -60, right: -60, top: 1600, height: 400, borderRadius: 40, background: 'linear-gradient(#3a2a20,#1c140f)' }}>{null}</Fg>
        </ShotBox>
        {/* C · low angle on the tower, the 90% card in the foreground */}
        <ShotBox s={{ a: 1.5, b: 3.0, zoom: [1.12, 1.0], oy: 1500 }}>
          <div style={{ position: 'absolute', left: 230, top: 330 }}><Tower size={620} /></div>
          <div style={{ position: 'absolute', left: 60, top: 1180, padding: '30px 40px', borderRadius: 34, background: 'linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.04))', border: th.border, backdropFilter: 'blur(16px)', boxShadow: th.shadow, transform: `translateY(${(1 - pop(t, Q.kodak, 200, 15)) * 300}px)` }}>
            <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 200, lineHeight: 0.9, color: th.yellow, letterSpacing: '-0.05em', textShadow: `0 0 50px ${th.yellow}66` }}>{cnt}%</div>
            <div style={{ height: 22, marginTop: 20, width: 520, borderRadius: 11, background: 'rgba(255,255,255,.1)' }}><div style={{ width: `${cnt}%`, height: '100%', borderRadius: 11, background: `linear-gradient(90deg, ${th.yellow}, ${th.green})` }} /></div>
          </div>
          <Burst at={Q.full} x={330} y={1250} colors={[th.yellow, th.green]} n={30} />
        </ShotBox>
        {/* D · macro on the build: parts fly in and snap */}
        <ShotBox s={{ a: 3.0, b: Q.cam, zoom: [1.0, 1.12] }}>
          <div style={{ position: 'absolute', left: 90, top: 700 }}><ShadedCamera size={900} parts={parts} glow={t > Q.cam - 0.1 ? 1 : 0} /></div>
          {[Q.p1, Q.p2, Q.p3].map((a, i) => <React.Fragment key={i}>
            {t > a - 0.18 && t < a && <div style={{ position: 'absolute', left: [700, 120, 240][i] + (a - t) * [2400, -2400, 0][i], top: [760, 900, 640][i] + (a - t) * [0, 0, -2400][i], width: 160, height: 18, borderRadius: 9, background: th.blue, filter: 'blur(6px)', opacity: 0.8 }} />}
            <Burst at={a} x={[900, 330, 260][i]} y={[880, 960, 720][i]} colors={[th.blue, '#fff']} n={16} power={0.6} />
          </React.Fragment>)}
          <Fg blur={18} style={{ left: 640, top: 1350, opacity: 0.6 }}><div style={{ width: 380, height: 380, borderRadius: '50%', background: '#2C4A9A' }} /></Fg>
        </ShotBox>
        {/* E · he lifts it: the first photo */}
        <ShotBox s={{ a: Q.cam, b: 4.5, zoom: [1.15, 1.0], oy: 800 }}>
          <div style={{ position: 'absolute', left: 190, top: 860 }}><Character id="c1" t={t} mood="wow" glasses size={700} armsUp={prog(t, Q.cam, Q.cam + 0.2)} /></div>
          <div style={{ position: 'absolute', left: 330, top: 540 + Math.sin(t * 6) * 6 }}><ShadedCamera size={420} glow={Math.max(0, 1 - Math.abs(t - Q.shot) * 3)} /></div>
          <Burst at={Q.shot} x={540} y={640} colors={[th.green, '#fff', th.yellow]} n={60} power={1.3} />
        </ShotBox>
        {/* F · the board, wide, the prototype blurred in the foreground */}
        <ShotBox s={{ a: 4.5, b: Q.no1, zoom: [1.0, 1.08], oy: 1100 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: [10, 370, 730][i], top: 800 }}><Character id={`b${i}`} t={t} suit hair={['#9a9a9a', '#3a2a20', '#d8d8d8'][i]} skin={i === 1 ? ['#E8B48E', '#B7785A'] : undefined} mood="talk" size={340} look={i === 0 ? 1 : i === 2 ? -1 : 0} /></div>)}
          <div style={{ position: 'absolute', left: -40, right: -40, top: 1180, height: 140, borderRadius: 30, background: 'linear-gradient(#2a2622,#14110f)' }} />
          <Fg blur={10} style={{ left: 280, top: 1250 }}><ShadedCamera size={520} /></Fg>
        </ShotBox>
        {/* G/H/I · one close-up per NO */}
        {[Q.no1, Q.no2, Q.no3].map((a, i) => <ShotBox key={i} s={{ a, b: [Q.no2, Q.no3, Q.drawer][i], zoom: [1.12, 1.0], oy: 900 }}>
          <div style={{ position: 'absolute', left: -60, top: 520 }}><Character id={`b${i}`} t={t} suit hair={['#9a9a9a', '#3a2a20', '#d8d8d8'][i]} skin={i === 1 ? ['#E8B48E', '#B7785A'] : undefined} mood="stern" size={1100} tilt={(i - 1) * 4} /></div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center' }}>
            <div style={{ transform: `scale(${2.2 - 1.2 * pop(t, a, 320, 14)}) rotate(${(i - 1) * 8}deg)`, padding: '14px 60px', borderRadius: 40, background: th.red, color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 150, boxShadow: `0 0 60px ${th.red}, 0 20px 40px rgba(0,0,0,.5)` }}>NO</div>
          </div>
        </ShotBox>)}
        {/* J · the drawer shuts and locks */}
        <ShotBox s={{ a: Q.drawer, b: Q.years, zoom: [1.1, 1.0] }}>
          <div style={{ position: 'absolute', left: 190, top: 760, width: 700, height: 400, borderRadius: 40, background: 'linear-gradient(#C99A66,#8C6440)', boxShadow: '0 40px 80px rgba(0,0,0,.6)' }}>
            <div style={{ position: 'absolute', left: 250, top: 90, width: 200, height: 30, borderRadius: 15, background: '#5a3f26' }} />
            <div style={{ position: 'absolute', left: 200, top: -160 + prog(t, Q.drawer, Q.drawer + 0.15) * 260, opacity: 1 - prog(t, Q.drawer + 0.1, Q.drawer + 0.15) }}><ShadedCamera size={300} /></div>
            {t > Q.drawer + 0.17 && <svg width="160" height="180" style={{ position: 'absolute', left: 270, top: 170, transform: `scale(${pop(t, Q.drawer + 0.17, 340, 12)})` }}><path d="M40 76 V48 a40 40 0 0 1 80 0 V76" stroke="#666" strokeWidth="16" fill="none" /><rect x="16" y="72" width="128" height="96" rx="20" fill={th.yellow} /><circle cx="80" cy="114" r="12" fill="#5a3f26" /></svg>}
          </div>
        </ShotBox>
        {/* K · the years run over the blurred tower */}
        <ShotBox s={{ a: Q.years, b: Q.HIT, zoom: [1.0, 1.25] }}>
          <Fg blur={12} style={{ left: 280, top: 420, opacity: 0.6 }}><Tower size={520} /></Fg>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 320, letterSpacing: '-0.06em', color: th.text, textShadow: `0 0 60px ${th.red}` }}>{year}</div>
        </ShotBox>
        {/* L · the collapse, his silhouette in the foreground */}
        <ShotBox s={{ a: Q.HIT, b: Q.outro, zoom: [1.2, 1.0], oy: 1000 }}>
          <div style={{ position: 'absolute', left: 290, top: 520 }}><Tower size={500} crack={crack} lit={0} /></div>
          <Burst at={Q.HIT + 0.15} x={540} y={1100} colors={[th.red, '#9a9a9a', '#fff']} n={70} power={1.5} />
          <div style={{ position: 'absolute', left: -160, top: 1180, filter: 'brightness(.55) saturate(.6)' }}><Character id="c1" t={t} mood="sad" glasses size={760} tilt={8} look={1} /></div>
        </ShotBox>
      </AbsoluteFill>
      {t < Q.outro && <Headline th={th} />}
      <AbsoluteFill style={{ background: '#fff', opacity: Math.max(flash * 0.85, cutFlash * 0.25), pointerEvents: 'none' }} />
      <AbsoluteFill style={{ background: th.red, opacity: redFlash * 0.35, pointerEvents: 'none', mixBlendMode: 'screen' }} />
      <FlatOutro />
      <AbbaTag color="#F4F1EA" />
    </AbsoluteFill>
  );
};
