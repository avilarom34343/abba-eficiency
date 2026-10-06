// F1 · Explainer cards (closest to the reference): illustrated UI cards pop in on each cue over the cream ground.
// The idea → the untouchable company → the build → the first photo → the board's NO → the drawer → the crash.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, F, prog, useCount, useT } from '../kit';
import { Bar, Bulb, Camera, Captions, Card, Chrome, Face, FlatOutro, HQ, Header, K, Mascot, Pop, Q, Stamp, hitShake, pop } from './fkit';

const Scene: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const t = useT(); if (t < a || t >= b) return null;
  const x = (1 - prog(t, a, a + 0.25)) * 1100 - prog(t, b - 0.18, b) * 1100;     // slides in from the right, out to the left
  return <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>{children}</AbsoluteFill>;
};

export const F1Cards: React.FC = () => {
  const t = useT(), count = useCount(t);
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, x => x), 1.6) * 37));
  const crash = prog(t, Q.HIT, Q.HIT + 0.5, x => x * x);
  const flash = t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.2) : 0;
  const header = t < 1.5 ? 'KODAK · 1975' : t < 3 ? 'EL IMPERIO' : t < 4.5 ? 'EL INVENTO' : t < Q.years ? 'LA JUNTA' : t < Q.HIT ? `AÑO ${year}` : 'EL FINAL';
  void count;
  return (
    <AbsoluteFill style={{ background: K.bg, fontFamily: F.body }}>
      <AbsoluteFill style={{ transform: hitShake(t) }}>
        {/* 1 · the idea */}
        <Scene a={0} b={1.5}>
          <Pop at={Q.y1975} style={{ left: 120, top: 380 }}><Card w={360} h={400}>
            <div style={{ height: 90, background: K.red, borderBottom: `4px solid ${K.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>{[0, 1].map(i => <div key={i} style={{ width: 16, height: 40, borderRadius: 8, background: '#fff', border: `3px solid ${K.ink}`, marginTop: -40 }} />)}</div>
            <div style={{ fontWeight: 800, fontSize: 120, textAlign: 'center', marginTop: 60, color: K.ink, letterSpacing: '-0.04em' }}>1975</div>
          </Card></Pop>
          <Pop at={Q.y1975 + 0.15} style={{ left: 560, top: 470 }}><Card w={400} h={420}>
            <div style={{ display: 'grid', justifyItems: 'center', gap: 18, paddingTop: 40 }}><Face size={170} /><Bar w={200} c={K.ink} /><Bar w={140} /></div>
            <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 50 }}><Bar w={80} h={20} c={K.blue} /><Bar w={80} h={20} /></div>
          </Card></Pop>
          <Pop at={Q.idea} style={{ left: 700, top: 300 }}><Bulb size={140} on={1} t={t * 2} /></Pop>
          <Pop at={0.9} from="up" style={{ left: 150, top: 880 }}><Mascot size={110} /></Pop>
        </Scene>
        {/* 2 · the untouchable company */}
        <Scene a={1.5} b={3.0}>
          <Pop at={1.55} style={{ left: 90, top: 330 }}><HQ size={420} /></Pop>
          <Pop at={Q.kodak} from="right" style={{ left: 520, top: 460 }}><Card w={470} h={330}>
            <Chrome title="Mercado" />
            <div style={{ padding: 26, display: 'grid', gap: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 110, color: K.ink, letterSpacing: '-0.04em', lineHeight: 1 }}>{cnt}%</div>
              <div style={{ height: 34, borderRadius: 17, border: `4px solid ${K.ink}`, background: '#fff', overflow: 'hidden' }}><div style={{ width: `${cnt / 0.9 * 0.9}%`, height: '100%', background: K.green }} /></div>
            </div>
          </Card></Pop>
          <Pop at={Q.full} style={{ left: 840, top: 400 }}><div style={{ background: K.green, color: '#fff', border: `4px solid ${K.ink}`, borderRadius: 40, padding: '8px 22px', fontWeight: 800, fontSize: 34 }}>N.º 1</div></Pop>
        </Scene>
        {/* 3 · building it, the first photo */}
        <Scene a={3.0} b={4.5}>
          <Pop at={3.02} style={{ left: 110, top: 360 }}><Card w={860} h={560} style={{ background: '#E8EEFA' }}>
            <svg width="860" height="560" style={{ position: 'absolute', inset: 0 }}>{Array.from({ length: 18 }, (_, i) => <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="560" stroke="#C9D4EE" strokeWidth="2" />)}{Array.from({ length: 12 }, (_, i) => <line key={i} x1="0" y1={i * 50} x2="860" y2={i * 50} stroke="#C9D4EE" strokeWidth="2" />)}</svg>
            <div style={{ position: 'absolute', left: 230, top: 150, transform: `scale(${1 + 0.06 * Math.max(0, 1 - Math.abs(t - Q.cam) * 6)})` }}>
              <Camera size={420} parts={t < Q.p1 ? 0.05 : t < Q.p2 ? 0.26 : t < Q.p3 ? 0.51 : t < Q.cam ? 0.76 : 1} led={Math.sin(t * 10) > 0 ? 1 : 0.3} />
            </div>
            <div style={{ position: 'absolute', left: 30, top: 24, fontWeight: 800, fontSize: 30, color: K.blue }}>PROTOTIPO · 1975</div>
          </Card></Pop>
          {/* the first digital photo slides out */}
          {t > Q.shot && <div style={{ position: 'absolute', left: 620, top: 860 + (1 - pop(t, Q.shot + 0.05)) * -200, transform: 'rotate(8deg)' }}><Card w={260} h={300} tilt={false}><div style={{ margin: 18, height: 200, border: `4px solid ${K.ink}`, background: 'linear-gradient(#9fd2ff,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Face size={110} /></div></Card></div>}
        </Scene>
        {/* 4 · the board says NO, the camera goes in a drawer */}
        <Scene a={4.5} b={Q.years}>
          <Pop at={Q.meet} style={{ left: 70, top: 300 }}><Card w={940} h={640}>
            <Chrome title="Junta directiva" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, padding: 26 }}>
              {[Q.a1, Q.a2, Q.a2 + 0.1].map((a, i) => {
                const no = [Q.no1, Q.no2, Q.no3][i];
                return <div key={i} style={{ height: 250, borderRadius: 18, border: `4px solid ${K.ink}`, background: '#F3EEE6', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ transform: `scale(${pop(t, a)})` }}><Face size={150} suit hair={['#9a9a9a', '#3a2a20', '#cfcfcf'][i]} mood={t > no ? 'flat' : 'happy'} bg="#F7E7C9" /></div>
                  {t > no && <div style={{ position: 'absolute', transform: `scale(${2 - pop(t, no, 300, 14)})`, opacity: Math.min(1, (t - no) * 8) }}><Stamp text="NO" size={70} /></div>}
                </div>;
              })}
            </div>
            <div style={{ position: 'absolute', left: 26, right: 26, bottom: 26, height: 240, borderRadius: 18, border: `4px solid ${K.ink}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 30, padding: '0 30px' }}>
              <Face size={150} mood={t > Q.no1 + 0.2 ? 'sad' : 'happy'} />
              <div style={{ transform: `translateX(${prog(t, Q.drawer, Q.drawer + 0.25) * 500}px) scale(${1 - prog(t, Q.drawer, Q.drawer + 0.25) * 0.5})`, opacity: 1 - prog(t, Q.drawer + 0.15, Q.drawer + 0.25) }}><Camera size={300} /></div>
            </div>
          </Card></Pop>
          {/* the drawer that swallows it */}
          {t > Q.drawer - 0.15 && <div style={{ position: 'absolute', left: 640, top: 1000, transform: `scale(${pop(t, Q.drawer - 0.15)})` }}><Card w={320} h={190} style={{ background: '#E0B98A' }}>
            <div style={{ position: 'absolute', left: 110, top: 70, width: 100, height: 18, borderRadius: 9, background: K.ink }} />
            {t > Q.drawer + 0.25 && <div style={{ position: 'absolute', left: 130, top: 104, transform: `scale(${pop(t, Q.drawer + 0.25)})` }}><svg width="60" height="70"><path d="M15 30 V18 a15 15 0 0 1 30 0 V30" stroke={K.ink} strokeWidth="6" fill="none" /><rect x="6" y="28" width="48" height="38" rx="8" fill={K.yellow} stroke={K.ink} strokeWidth="5" /></svg></div>}
          </Card></div>}
        </Scene>
        {/* 5 · the years fly by */}
        <Scene a={Q.years} b={Q.HIT}>
          <div style={{ position: 'absolute', left: 290, top: 420 }}><Card w={500} h={520}>
            <div style={{ height: 110, background: K.red, borderBottom: `4px solid ${K.ink}` }} />
            <div style={{ fontWeight: 800, fontSize: 170, textAlign: 'center', marginTop: 90, color: K.ink, letterSpacing: '-0.05em', transform: `translateY(${((t * 30) % 1) * -10}px)` }}>{year}</div>
          </Card></div>
        </Scene>
        {/* 6 · the crash */}
        {t >= Q.HIT && t < Q.outro && <>
          <div style={{ position: 'absolute', left: 90, top: 360 }}><Card w={900} h={600}>
            <Chrome title="Kodak · acciones" />
            <svg width="900" height="550" style={{ position: 'absolute', top: 50 }}>
              <path d={`M40 ${150} L180 ${120} L320 ${140} L460 ${110} L${460 + 380 * crash} ${110 + 380 * crash}`} stroke={K.red} strokeWidth="10" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', left: 520, top: 320 }}><HQ size={260} crack={crash} lights={0} /></div>
          </Card></div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center', transform: `scale(${2.4 - 1.4 * pop(t, Q.HIT + 0.02, 320, 16)})` }}><Stamp text="QUIEBRA" size={150} /></div>
          <div style={{ position: 'absolute', left: 120, top: 1060 }}><Mascot size={120} shock /></div>
        </>}
      </AbsoluteFill>
      {t < Q.outro && <><Header text={header} /><Captions /></>}
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.9 }} />
      <FlatOutro />
      <AbbaTag color={K.card} />
    </AbsoluteFill>
  );
};
