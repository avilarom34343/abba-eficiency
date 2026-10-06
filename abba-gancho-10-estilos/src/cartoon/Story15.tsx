// Cartoon cut, 15 s: a search-engine hook (the camera rides the caret as the question is typed, results drop in, we
// dive into the first one), the story as a shaded cartoon in rooms with depth, and a closing search for ABBA.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { prog, rand, useT } from '../kit';
import { pop } from '../flat/fkit';
import { Bubble, C, Cam, INK, Room, SANS, Toon } from './ckit';

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const inout = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
let ctx: CanvasRenderingContext2D | null = null;
const measure = (s: string, size: number) => { ctx ??= document.createElement('canvas').getContext('2d'); ctx!.font = `600 ${size}px "Inter Tight"`; return ctx!.measureText(s).width; };

// ---------- the search engine (hook + ending) ----------
const Search: React.FC<{ t: number; a: number; text: string; cps: number; enter: number; results?: [string, string][]; dive?: number; end?: React.ReactNode }> = ({ t, a, text, cps, enter, results, dive, end }) => {
  const n = Math.max(0, Math.min(text.length, (t - a) * cps)), shown = text.slice(0, Math.floor(n));
  const size = 50, boxX = 90, boxY = 820, textX = boxX + 110;
  // camera: zoomed on the caret while typing, eased back out on enter, then dives into the first result
  const caretX = textX + measure(text.slice(0, Math.floor(n)), size) + (n % 1) * 6;
  const out = prog(t, enter, enter + 0.35, inout);
  const Z = 2.5 + (1 - 2.5) * out, follow = 1 - out;
  const cx = caretX * follow + 540 * (1 - follow), cy = (boxY + 60) * follow + 960 * (1 - follow);
  const d = dive ? prog(t, dive, dive + 0.45, x => x * x * x) : 0; // scaled layer stays under the 4096 px GPU texture limit
  const tx = 540 - cx * Z, ty = 960 - cy * Z;
  return <AbsoluteFill style={{ background: 'linear-gradient(180deg,#F8FAFF,#EEF2FB)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1500, overflow: 'hidden', transform: `translate(${tx}px, ${ty}px) scale(${Z})`, transformOrigin: '0 0' }}>
      <div style={{ position: 'absolute', inset: 0, ...(d > 0 ? { transform: `scale(${1 + d * 1.6})`, transformOrigin: '175px 1065px', filter: `blur(${d * 14}px)`, opacity: 1 - d * 0.6 } : {}) }}>
        {/* soft decorative blobs for depth */}
        <div style={{ position: 'absolute', left: -200, top: 200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(#DCE7FF, transparent 70%)' }} />
        <div style={{ position: 'absolute', left: 600, top: 1300, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(#FFE3EC, transparent 70%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: '-0.05em' }}>{'Buscar'.split('').map((c, i) => <span key={i} style={{ color: ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'][i], display: 'inline-block', transform: `translateY(${-Math.max(0, Math.sin((t - a) * 10 - i * 0.6)) * 14 * (t - a < 0.8 ? 1 : 0)}px)` }}>{c}</span>)}</div>
        <div style={{ position: 'absolute', left: boxX, top: boxY, width: 900, height: 120, borderRadius: 60, background: '#fff', boxShadow: `0 ${6 + 10 * out}px ${24 + 20 * out}px rgba(60,80,140,${0.12 + 0.08 * out})`, border: '2px solid #E3E6EE', display: 'flex', alignItems: 'center' }}>
          <svg width="44" height="44" style={{ marginLeft: 40 }}><circle cx="18" cy="18" r="13" stroke="#9AA0A6" strokeWidth="4" fill="none" /><path d="M28 28 L40 40" stroke="#9AA0A6" strokeWidth="5" strokeLinecap="round" /></svg>
          <div style={{ marginLeft: 26, fontFamily: SANS, fontWeight: 600, fontSize: size, color: '#1F1F1F', whiteSpace: 'pre' }}>{shown}<span style={{ display: 'inline-block', width: 4, height: 56, marginLeft: 3, verticalAlign: 'middle', background: '#4285F4', opacity: t > enter ? 0 : Math.floor(t * 5) % 2 ? 1 : 0.2 }} /></div>
          <svg width="44" height="44" style={{ marginLeft: 'auto', marginRight: 40 }}><rect x="15" y="4" width="14" height="24" rx="7" fill="#4285F4" /><path d="M8 22 Q22 40 36 22 M22 36 L22 42" stroke="#EA4335" strokeWidth="4" fill="none" strokeLinecap="round" /></svg>
        </div>
        {results && results.map(([h, s], i) => { const p = pop(t, enter + 0.12 + i * 0.1, 260, 16); return t >= enter + 0.12 + i * 0.1 && (
          <div key={i} style={{ position: 'absolute', left: 90, top: 990 + i * 165, width: 900, height: 150, borderRadius: 32, background: '#fff', boxShadow: '0 12px 30px rgba(60,80,140,.12)', display: 'flex', gap: 24, alignItems: 'center', padding: 20, transform: `translateY(${(1 - p) * 120}px)`, opacity: Math.min(1, p * 2) }}>
            <div style={{ width: 130, height: 110, borderRadius: 20, overflow: 'hidden', background: ['linear-gradient(#BFEAE0,#7CC7B8)', 'linear-gradient(#FFE08A,#F2B33D)', 'linear-gradient(#CDB8FF,#8E6FE0)'][i], position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', left: 14, top: 22, transform: 'scale(.24)', transformOrigin: '0 0' }}>{i === 1 ? <Cam w={420} /> : null}</div>
              {i !== 1 && <div style={{ position: 'absolute', left: 30, top: 14, width: 70, height: 70, borderRadius: '50%', background: '#FFD9BC', border: `4px solid ${INK}` }} />}
            </div>
            <div style={{ display: 'grid', gap: 10 }}><span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#1A0DAB', letterSpacing: '-0.02em' }}>{h}</span><span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 25, color: '#5F6368', lineHeight: 1.2 }}>{s}</span></div>
          </div>); })}
        {end}
      </div>
    </div>
    <AbsoluteFill style={{ background: '#fff', opacity: d }} />
  </AbsoluteFill>;
};

// ---------- subtitles (sound-off viewers) ----------
const SUBS: [string, number, number][] = [['Mil novecientos', 2.4, 3.3], ['setenta y cinco.', 3.3, 4.4], ['Kodak', 4.75, 5.2], ['era intocable.', 5.2, 6.2], ['Entonces inventó algo', 6.6, 7.7], ['que cambiaría el mundo…', 7.7, 9.05], ['…y eso la llevó a la', 9.61, 10.38], ['quiebra.', 10.4, 11.4]];
const Subs: React.FC<{ t: number }> = ({ t }) => {
  const s = SUBS.find(([, a, b]) => t >= a && t < b); if (!s) return null;
  const p = pop(t, s[1], 320, 18);
  return <div style={{ position: 'absolute', left: 60, right: 60, top: 1540, textAlign: 'center' }}>
    <span style={{ display: 'inline-block', transform: `scale(${0.85 + 0.15 * p})`, fontFamily: SANS, fontWeight: 800, fontSize: 64, color: s[0] === 'quiebra.' ? '#FF4D4D' : '#fff', letterSpacing: '-0.02em', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill' } as React.CSSProperties}>{s[0]}</span>
  </div>;
};
const Chip: React.FC<{ t: number; at: number; text: string; color?: string }> = ({ t, at, text, color = '#fff' }) => {
  if (t < at) return null;
  return <div style={{ position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', justifyContent: 'center' }}><div style={{ transform: `scale(${pop(t, at, 300, 14)}) rotate(-3deg)`, background: color, border: `6px solid ${INK}`, borderRadius: 30, padding: '10px 36px', fontFamily: SANS, fontWeight: 800, fontSize: 84, color: INK, letterSpacing: '-0.03em', boxShadow: '0 12px 0 rgba(0,0,0,.18)' }}>{text}</div></div>;
};
/** A scene with a slow push-in and a little parallax between the room and the characters. */
const Scene: React.FC<{ t: number; a: number; b: number; room: 'lab' | 'office' | 'board' | 'dark'; children: React.ReactNode }> = ({ t, a, b, room, children }) => {
  if (t < a || t >= b) return null;
  const k = prog(t, a, b, x => x), inn = prog(t, a, a + 0.2, ease);
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.07 * k + (1 - inn) * 0.15})` }}>
    <Room kind={room} t={t} px={-20 * k} />
    <AbsoluteFill style={{ transform: `translateX(${-50 * k}px)` }}>{children}</AbsoluteFill>
  </AbsoluteFill>;
};
const Sparks: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const d = t - at; if (d < 0 || d > 0.5) return null;
  return <>{Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <div key={i} style={{ position: 'absolute', left: x + Math.cos(a) * d * 500, top: y + Math.sin(a) * d * 500 + d * d * 600, width: 16, height: 6, borderRadius: 3, background: i % 2 ? '#FFD84D' : '#FF8A3C', transform: `rotate(${a}rad)`, opacity: 1 - d * 2 }} />; })}</>;
};

export const Story15: React.FC = () => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, C.count, C.full));
  const year = t < C.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, C.years, C.HIT - 0.05, x => x), 1.6) * 37));
  const age = prog(t, C.years, C.HIT);
  const sink = prog(t, C.HIT + 0.15, C.HIT + 0.8, x => x * x);
  const shake = t >= C.HIT && t < C.HIT + 0.6 ? 26 * (1 - (t - C.HIT) / 0.6) : t >= C.no1 && t < C.drawer ? 4 : 0;
  const flash = Math.max(t >= C.shot ? Math.max(0, 1 - (t - C.shot) / 0.22) : 0, t >= 2.4 ? Math.max(0, 1 - (t - 2.4) / 0.15) * 0.8 : 0, t >= C.end ? Math.max(0, 1 - (t - C.end) / 0.15) * 0.6 : 0);
  const lift = prog(t, C.cam, C.cam + 0.25, ease);
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      {t < 2.4 && <Search t={t} a={0.1} text="¿Por qué quebró Kodak?" cps={15.5} enter={1.62} dive={1.95}
        results={[['Kodak: la empresa que inventó su propio final', 'En 1975 un ingeniero creó la primera cámara digital…'], ['La cámara que Kodak escondió', 'Pesaba 3.6 kg y tardaba 23 segundos en tomar una foto…'], ['Kodak se declara en bancarrota (2012)', 'Tras 131 años, el gigante de la fotografía…']]} />}
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 90) * shake}px, ${Math.cos(t * 70) * shake}px)` }}>
        {/* 1975 · the idea */}
        <Scene t={t} a={2.4} b={4.6} room="lab">
          <Chip t={t} at={2.5} text="1975" color="#FFE08A" />
          <Toon who="steve" x={300} y={760} s={1.5} t={t} mood={t < C.idea ? 'smug' : 'grin'} armR={t >= C.idea ? ease(prog(t, C.idea, C.idea + 0.2)) * 0.9 : Math.abs(Math.sin(t * 12)) * 0.25} />
          <div style={{ position: 'absolute', left: 60, right: 60, top: 1180, height: 120, borderRadius: 40, background: 'linear-gradient(#D49A62,#A8703E)', border: `8px solid ${INK}`, boxShadow: '0 20px 30px rgba(0,0,0,.3)' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 120 + i * 120, top: -18, width: 110, height: 30, background: '#fff', border: `5px solid ${INK}`, borderRadius: 6, transform: `rotate(${(i - 1) * 8}deg)` }} />)}
          </div>
          {t >= C.idea && <div style={{ position: 'absolute', left: 440, top: 330, transform: `scale(${pop(t, C.idea, 320, 10)})` }}>
            <div style={{ position: 'absolute', left: -90, top: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(rgba(255,230,120,.8), transparent 65%)' }} />
            <svg width="200" height="240" style={{ position: 'relative', overflow: 'visible' }}>{Array.from({ length: 9 }, (_, i) => { const r = (i / 9) * Math.PI * 2 + t; return <path key={i} d={`M${100 + Math.cos(r) * 120} ${100 + Math.sin(r) * 120} L${100 + Math.cos(r) * 160} ${100 + Math.sin(r) * 160}`} stroke="#FFC93C" strokeWidth="12" strokeLinecap="round" />; })}
              <g stroke={INK} strokeWidth="7"><path d="M100 10 C45 10 25 55 36 88 C45 115 70 122 70 152 L130 152 C130 122 155 115 164 88 C175 55 155 10 100 10Z" fill="#FFE14D" /><rect x="70" y="152" width="60" height="34" rx="8" fill="#C9C9D2" /></g></svg>
          </div>}
          <Bubble show={t >= C.idea + 0.3 ? pop(t, C.idea + 0.3, 320, 13) : 0} x={560} y={520} text="¡ya sé!" />
        </Scene>
        {/* the empire */}
        <Scene t={t} a={4.6} b={6.45} room="office">
          <Toon who="ceo" x={330} y={720} s={1.45} t={t} mood={t < 5.4 ? 'smug' : 'laugh'} armR={0.4 + 0.2 * Math.sin(t * 6)} armL={0.4 + 0.2 * Math.cos(t * 6)} />
          <div style={{ position: 'absolute', left: 90, top: 1080, width: 900, height: 340, borderRadius: '40px 40px 220px 220px', background: 'linear-gradient(#FFFFFF,#D8DDE8)', border: `8px solid ${INK}`, boxShadow: '0 30px 40px rgba(0,0,0,.35)' }} />
          {Array.from({ length: 26 }, (_, i) => <div key={i} style={{ position: 'absolute', left: 110 + rand(i, 1) * 780, top: 1030 + rand(i, 2) * 70 - Math.abs(Math.sin(t * 7 + i)) * 70, width: 120, height: 62, borderRadius: 10, background: 'linear-gradient(#9BE08A,#5DB04E)', border: `5px solid ${INK}`, transform: `rotate(${(rand(i, 3) - 0.5) * 70 + Math.sin(t * 5 + i) * 10}deg)` }} />)}
          <div style={{ position: 'absolute', left: 560, top: 420, transform: `rotate(8deg) scale(${pop(t, C.p2, 300, 12)})`, fontFamily: SANS, fontWeight: 900, fontSize: 190, color: '#FFD84D', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 14px 0 rgba(0,0,0,.2)', letterSpacing: '-0.05em' } as React.CSSProperties}>{cnt}%</div>
          <Bubble show={t >= 5.4 ? pop(t, 5.4, 320, 13) : 0} x={60} y={520} text="jo jo jo" />
        </Scene>
        {/* building it, the first photo */}
        <Scene t={t} a={6.45} b={8.0} room="lab">
          <Toon who="steve" x={180} y={760} s={1.45} t={t} mood={t < C.cam ? 'smug' : 'grin'} armR={t < C.cam ? Math.abs(Math.sin(t * 16)) * 0.7 : 0.95 * lift} armL={t < C.cam ? 0.1 : 0.95 * lift} hold={t >= C.cam ? <Cam w={180} /> : undefined} />
          <div style={{ position: 'absolute', left: 520, top: 1150, width: 480, height: 110, borderRadius: 36, background: 'linear-gradient(#D49A62,#A8703E)', border: `8px solid ${INK}` }} />
          {t < C.cam && <div style={{ position: 'absolute', left: 620, top: 1000, transform: `scale(${0.6 + 0.4 * prog(t, 6.6, C.cam)}) rotate(${Math.sin(t * 20) * 4}deg)` }}><Cam w={260} /></div>}
          {[C.k1, C.k2, C.k3].map((a, i) => <React.Fragment key={i}><Sparks t={t} at={a} x={720} y={1080} />{t >= a && t < C.cam && <div style={{ position: 'absolute', left: [600, 760, 640][i], top: [760, 860, 940][i], transform: `rotate(${(i - 1) * 14}deg) scale(${pop(t, a, 320, 12)})`, fontFamily: SANS, fontWeight: 900, fontSize: 80, color: '#fff', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill' } as React.CSSProperties}>{['¡CLANK!', '¡TINK!', '¡BONK!'][i]}</div>}</React.Fragment>)}
          <Bubble show={t >= C.cam + 0.05 ? pop(t, C.cam + 0.05, 320, 13) : 0} x={560} y={480} text="¡mira!" />
        </Scene>
        {/* the board says no */}
        <Scene t={t} a={8.0} b={C.years} room="board">
          <Toon who="exec1" x={-30} y={780} s={1.0} t={t} mood={t < C.no2 ? 'smug' : 'no'} />
          <Toon who="ceo" x={340} y={740} s={1.15} t={t} mood={t < C.no1 ? 'smug' : t < C.quote ? 'no' : 'talk'} />
          <Toon who="exec2" x={710} y={780} s={1.0} t={t} mood={t < C.no3 ? 'smug' : 'no'} />
          <div style={{ position: 'absolute', left: -40, right: -40, top: 1180, height: 170, borderRadius: '50% 50% 30px 30px / 60% 60% 30px 30px', background: 'linear-gradient(#A0663E,#6B3E22)', border: `8px solid ${INK}`, boxShadow: '0 30px 40px rgba(0,0,0,.4)' }} />
          <div style={{ position: 'absolute', left: 400 + prog(t, C.drawer, C.drawer + 0.25, ease) * 700, top: 1100 - Math.sin(prog(t, C.drawer, C.drawer + 0.25) * Math.PI) * 120, transform: `rotate(${prog(t, C.drawer, C.drawer + 0.25) * 200}deg)` }}><Cam w={230} /></div>
          {[[C.no1, 400, 330, 'no.', 'l'], [C.no2, 30, 450, 'no', 'l'], [C.no3, 690, 450, 'no', 'r']].map(([a, x, y, s, tl]) => <Bubble key={a as number} show={t >= (a as number) && t < C.quote ? pop(t, a as number, 340, 12) : 0} x={x as number} y={y as number} text={s as string} size={86} color="#FFE1E1" tail={tl as 'l' | 'r'} />)}
          <Bubble show={t >= C.quote ? pop(t, C.quote, 300, 15) : 0} x={60} y={360} text="Está lindo… pero no se lo digas a nadie." size={54} w={920} />
        </Scene>
        {/* the years: he gets old */}
        <Scene t={t} a={C.years} b={C.HIT} room="board">
          <Toon who="ceo" x={340} y={740} s={1.45} t={t} mood="smug" age={age} />
          <div style={{ position: 'absolute', left: 300, top: 250, width: 480, height: 260, borderRadius: 30, background: '#fff', border: `8px solid ${INK}`, boxShadow: '0 16px 0 rgba(0,0,0,.2)', overflow: 'hidden' }}>
            <div style={{ height: 70, background: '#EA4335', borderBottom: `6px solid ${INK}` }} />
            <div style={{ textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 140, color: INK, letterSpacing: '-0.05em', lineHeight: 1.2, transform: `translateY(${((t * 20) % 1) * -14}px)` }}>{year}</div>
          </div>
        </Scene>
        {/* quiebra: the floor opens */}
        <Scene t={t} a={C.HIT} b={C.end} room="dark">
          <div style={{ position: 'absolute', left: 200, top: 1360, width: 680, height: 170 * prog(t, C.HIT, C.HIT + 0.15, ease), borderRadius: '50%', background: 'radial-gradient(#000 60%, #1a0505)', border: `8px solid ${INK}` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1450, overflow: 'hidden' }}><Toon who="ceo" x={340} y={760 + sink * 1300} s={1.35} t={t} mood="shock" age={1} armR={1} armL={1} /></div>
          {Array.from({ length: 16 }, (_, i) => { const d = Math.max(0, t - C.HIT - 0.15); return <div key={i} style={{ position: 'absolute', left: 520 + Math.cos(i * 1.7) * d * 700, top: 1000 - d * 700 + d * d * 700 + (i % 4) * 20, width: 110, height: 56, borderRadius: 10, background: 'linear-gradient(#9BE08A,#5DB04E)', border: `5px solid ${INK}`, transform: `rotate(${d * 500 * (i % 2 ? 1 : -1)}deg)` }} />; })}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `rotate(-5deg) scale(${pop(t, C.HIT, 320, 10)})`, fontFamily: SANS, fontWeight: 900, fontSize: 200, color: '#FF4D4D', WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill', letterSpacing: '-0.04em', textShadow: '0 18px 0 rgba(0,0,0,.35)' } as React.CSSProperties}>¡QUIEBRA!</div>
          <Toon who="steve" x={720} y={1060} s={0.75} t={t} mood="smug" armR={0.5} />
          <Bubble show={t >= C.gloat ? pop(t, C.gloat, 320, 13) : 0} x={560} y={880} text="les dije" size={52} tail="r" />
        </Scene>
      </AbsoluteFill>
      {/* closing search: the question for the viewer */}
      {t >= C.end && <Search t={t} a={C.end + 0.05} text="¿Mi negocio será el próximo Kodak?" cps={22} enter={C.abba - 0.1}
        end={t >= C.abba ? <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, display: 'grid', justifyItems: 'center', gap: 16, transform: `scale(${pop(t, C.abba, 260, 14)})` }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 150, color: INK, letterSpacing: '-0.05em' }}>ABBA</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: '#5F6368' }}>automatización e IA para tu negocio</div>
        </div> : undefined} />}
      {t >= 2.4 && t < C.end && <Subs t={t} />}
      <AbsoluteFill style={{ background: '#fff', opacity: flash, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
