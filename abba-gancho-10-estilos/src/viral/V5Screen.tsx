// V5 · Screen rabbit hole (the "I looked it up and…" screen-recording format): a phone browser — a search typed out,
// an encyclopedia page with highlighter sweeps and zoom-ins on the facts, the inventor's interview clip with the quote,
// a fast scroll through the years, and a BREAKING news page on "quiebra". Taps shown as touch ripples.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, prog, useT } from '../kit';
import { Character, ShadedCamera, Tower } from '../flat/dkit';
import { FACTS, FlatOutro, Q, VF, hitShake, pop } from './vkit';

const BLUE = '#1A56DB', HL = '#FFE45C', RED = '#D92D20';
const Hi: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const t = useT(), p = prog(t, at, at + 0.25);
  return <span style={{ backgroundImage: `linear-gradient(90deg, ${HL} ${p * 100}%, transparent ${p * 100}%)`, padding: '0 4px', borderRadius: 4 }}>{children}</span>;
};
const Tap: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const t = useT(), d = t - at; if (d < -0.25 || d > 0.4) return null;
  const k = Math.max(0, d) / 0.4;
  return <div style={{ position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: '50%', background: 'rgba(80,80,80,.35)', border: '4px solid rgba(255,255,255,.8)', transform: `scale(${d < 0 ? 0.7 : 1 + k})`, opacity: d < 0 ? 0.8 : 1 - k }} />;
};

export const V5Screen: React.FC = () => {
  const t = useT();
  const query = 'kodak 1975 cámara digital'.slice(0, Math.max(0, Math.floor((t - 0.1) * 40)));
  const page = t < 1.5 ? 'search' : t < 4.5 ? 'wiki' : t < Q.years ? 'video' : t < Q.HIT ? 'scroll' : 'news';
  // zoom-ins on the facts, like a creator pinching into the screenshot
  const zoom = page === 'wiki' ? (t < 3.0 ? 1 + 0.35 * prog(t, 2.6, 2.9) * (1 - prog(t, 2.95, 3.05)) : 1 + 0.3 * prog(t, Q.p2, Q.p2 + 0.2) * (1 - prog(t, Q.cam, Q.cam + 0.1))) : page === 'news' ? 1 + 0.06 * pop(t, Q.HIT + 0.1, 200, 16) : 1;
  const zoomOrigin = page === 'wiki' ? (t < 3.0 ? '50% 62%' : '50% 72%') : '50% 40%';
  const scroll = page === 'wiki' ? (t < 3.0 ? 0 : 900 * prog(t, 3.0, 3.3)) : page === 'scroll' ? 4000 * prog(t, Q.years, Q.HIT, z => z * z) : 0;
  const flash = t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.2) : 0;
  return (
    <AbsoluteFill style={{ background: '#F5F5F7', overflow: 'hidden', fontFamily: VF.sans }}>
      <AbsoluteFill style={{ transform: `${hitShake(t, 26)} scale(${zoom})`, transformOrigin: zoomOrigin }}>
        {/* browser chrome */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, height: 120, background: '#fff', borderBottom: '2px solid #E2E2E6', display: 'flex', alignItems: 'center', padding: '0 40px', zIndex: 2 }}>
          <div style={{ flex: 1, height: 74, borderRadius: 37, background: '#EFEFF3', display: 'flex', alignItems: 'center', padding: '0 30px', fontSize: 34, color: '#555' }}>
            {page === 'search' ? 'buscador.com' : page === 'wiki' ? 'enciclopedia.org/Kodak' : page === 'video' ? 'videos.com/entrevista-sasson' : page === 'scroll' ? 'enciclopedia.org/Kodak#historia' : 'noticias.com/ultima-hora'}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 272, bottom: 0, overflow: 'hidden' }}>
          <div style={{ transform: `translateY(${-scroll}px)`, filter: page === 'scroll' ? `blur(${Math.min(8, prog(t, Q.years, Q.years + 0.2) * 8)}px)` : undefined }}>
            {page === 'search' && <div style={{ padding: 60 }}>
              <div style={{ fontFamily: VF.black, fontSize: 110, textAlign: 'center', margin: '80px 0 50px', letterSpacing: '-0.03em' }}>{['#1A56DB', '#D92D20', '#F5B400', '#1A56DB', '#16A34A', '#D92D20'].map((c, i) => <span key={i} style={{ color: c }}>{'Buscar'[i]}</span>)}</div>
              <div style={{ height: 100, borderRadius: 50, border: '3px solid #DADCE0', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 40px', fontSize: 42, boxShadow: '0 4px 14px rgba(0,0,0,.08)' }}>{query}<span style={{ opacity: Math.floor(t * 4) % 2 }}>|</span></div>
              {t >= Q.idea && <div style={{ marginTop: 50, display: 'grid', gap: 40 }}>{[['Kodak — Enciclopedia', 'La primera cámara digital fue inventada en Kodak en 1975…'], ['La cámara que Kodak escondió', 'Steve Sasson construyó un prototipo de 3.6 kg…'], ['¿Por qué quebró Kodak?', 'En 2012 la empresa se declaró en bancarrota…']].map(([h, s], i) => (
                <div key={i} style={{ transform: `translateY(${(1 - pop(t, Q.idea + i * 0.12, 260, 18)) * 60}px)`, opacity: prog(t, Q.idea + i * 0.12, Q.idea + i * 0.12 + 0.15) }}>
                  <div style={{ fontSize: 44, color: BLUE, fontWeight: 600 }}>{h}</div><div style={{ fontSize: 32, color: '#555', marginTop: 8 }}>{s}</div>
                </div>))}</div>}
            </div>}
            {page === 'wiki' && <div style={{ padding: 60, background: '#fff', minHeight: 2400 }}>
              <div style={{ fontFamily: VF.news, fontSize: 96, borderBottom: '2px solid #ccc', paddingBottom: 10 }}>Kodak</div>
              <div style={{ display: 'flex', gap: 30, marginTop: 30 }}>
                <div style={{ flex: 1, fontSize: 38, lineHeight: 1.5, color: '#222' }}>Empresa estadounidense de fotografía con sede en {FACTS.where}. En 1976 vendía <Hi at={2.3}>el 90% de las películas fotográficas</Hi> de Estados Unidos y era considerada <Hi at={2.6}>intocable</Hi>.</div>
                <div style={{ width: 300, border: '2px solid #ccc', background: '#F8F9FA', padding: 16, display: 'grid', justifyItems: 'center', gap: 10 }}><Tower size={180} /><div style={{ fontSize: 26, color: '#555' }}>Sede, Rochester</div></div>
              </div>
              <div style={{ fontFamily: VF.news, fontSize: 64, borderBottom: '2px solid #ccc', paddingBottom: 6, marginTop: 70 }}>La cámara digital</div>
              <div style={{ marginTop: 30, border: '2px solid #ccc', background: '#F8F9FA', padding: 24, display: 'grid', justifyItems: 'center' }}><ShadedCamera size={560} /><div style={{ fontSize: 28, color: '#555', marginTop: 10 }}>Primer prototipo de cámara digital (1975)</div></div>
              <div style={{ fontSize: 38, lineHeight: 1.5, color: '#222', marginTop: 30 }}>En 1975, {FACTS.who.split(',')[0]} creó la primera cámara digital. Pesaba <Hi at={Q.p1}>{FACTS.kg}</Hi>, tardaba <Hi at={Q.p2}>{FACTS.secs.replace(' por foto', '')} en tomar una foto</Hi> de <Hi at={Q.p3}>{FACTS.px}</Hi> y la imagen <Hi at={Q.cam}>{FACTS.tape}</Hi>.</div>
            </div>}
            {page === 'video' && <div style={{ padding: 40 }}>
              <div style={{ position: 'relative', height: 900, borderRadius: 30, overflow: 'hidden', background: 'radial-gradient(70% 60% at 50% 40%, #3a4a6a, #10141c)' }}>
                <div style={{ position: 'absolute', left: 180, top: 260 }}><Character id="v5" t={t} mood={t < Q.no1 ? 'talk' : 'sad'} glasses size={640} /></div>
                <div style={{ position: 'absolute', left: 30, right: 30, bottom: 40, textAlign: 'center', fontSize: 42, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.6)', padding: '10px 20px', borderRadius: 12, opacity: t >= Q.no1 ? 1 : 0 }}>Me dijeron: {FACTS.quote}</div>
                <div style={{ position: 'absolute', left: 30, top: 30, background: RED, color: '#fff', fontSize: 30, fontWeight: 800, padding: '6px 16px', borderRadius: 8 }}>ENTREVISTA</div>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: 'rgba(255,255,255,.25)' }}><div style={{ width: `${prog(t, 4.5, Q.years) * 100}%`, height: '100%', background: RED }} /></div>
              </div>
              <div style={{ marginTop: 30, fontSize: 40, fontWeight: 700 }}>Steve Sasson: «Kodak no quiso mi invento»</div>
              <div style={{ marginTop: 30, display: 'grid', gap: 26 }}>{['¿¿en serio??', 'no puede ser', 'y luego quebraron jaja'].map((c, i) => { const a = [Q.no1, Q.no2, Q.no3][i]; return t >= a && <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'center', transform: `scale(${pop(t, a, 300, 16)})`, transformOrigin: '0 50%' }}><div style={{ width: 70, height: 70, borderRadius: 35, background: ['#F5B400', '#16A34A', '#1A56DB'][i] }} /><div style={{ fontSize: 36, color: '#222' }}><b>usuario{i + 1}</b> {c}</div></div>; })}</div>
            </div>}
            {page === 'scroll' && <div style={{ padding: 60, background: '#fff' }}>{Array.from({ length: 14 }, (_, i) => <div key={i} style={{ marginBottom: 80 }}><div style={{ fontFamily: VF.news, fontSize: 80 }}>{1976 + i * 3}</div>{Array.from({ length: 4 }, (_, j) => <div key={j} style={{ height: 18, background: '#DDD', width: `${90 - j * 12}%`, marginTop: 18 }} />)}</div>)}</div>}
            {page === 'news' && <div style={{ background: '#fff', minHeight: 1700 }}>
              <div style={{ background: RED, color: '#fff', fontWeight: 800, fontSize: 44, padding: '16px 40px', letterSpacing: '0.05em' }}>ÚLTIMA HORA · {FACTS.end.toUpperCase()}</div>
              <div style={{ padding: 50 }}>
                <div style={{ fontFamily: VF.news, fontSize: 104, lineHeight: 1, transform: `scale(${pop(t, Q.HIT, 260, 14)})`, transformOrigin: '0 0' }}>Kodak se declara en <span style={{ color: RED }}>quiebra</span></div>
                <div style={{ marginTop: 40, height: 520, background: '#ddd', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', filter: 'grayscale(.6)', overflow: 'hidden' }}><Tower size={300} crack={prog(t, Q.HIT + 0.3, Q.HIT + 1.3)} lit={0} /></div>
                <div style={{ marginTop: 30, fontSize: 38, color: '#333', lineHeight: 1.4 }}>La empresa que inventó la cámara digital no sobrevivió a ella.</div>
              </div>
            </div>}
          </div>
        </div>
        <Tap at={1.42} x={420} y={760} />
        <Tap at={Q.cam - 0.1} x={540} y={900} />
        <Tap at={4.42} x={700} y={1500} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.85 }} />
      <FlatOutro />
      <AbbaTag color="#888" />
    </AbsoluteFill>
  );
};
