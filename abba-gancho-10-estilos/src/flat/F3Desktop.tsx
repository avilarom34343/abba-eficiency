// F3 · Desktop: the story on a computer screen. A note with the idea, the market window, a cursor assembling the
// camera in a design app, the board's reply e-mail, the file dragged into a locked folder, and Kodak "quitting unexpectedly".
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, F, prog, useT } from '../kit';
import { Bar, Bulb, Camera, Captions, Card, Chrome, FlatOutro, K, Mascot, Q, Stamp, hitShake, pop } from './fkit';

const Win: React.FC<{ at: number; out?: number; x: number; y: number; w: number; h: number; title: string; children?: React.ReactNode; t: number; fall?: number }> = ({ at, out = 99, x, y, w, h, title, children, t, fall = 0 }) => {
  if (t < at || t > out) return null;
  const p = pop(t, at, 240, 14);
  return <div style={{ position: 'absolute', left: x, top: y + fall * fall * 2600, transform: `scale(${p}) rotate(${fall * 25 * (x > 400 ? 1 : -1)}deg)`, transformOrigin: '50% 100%' }}>
    <Card w={w} h={h} tilt={false}><Chrome title={title} /><div style={{ position: 'relative', height: h - 50 }}>{children}</div></Card>
  </div>;
};
// cursor path: [time, x, y]
const CUR: [number, number, number][] = [[0, 900, 1200], [0.4, 560, 520], [1.5, 600, 700], [3.2, 380, 900], [3.45, 470, 760], [3.6, 700, 900], [3.7, 640, 760], [3.85, 330, 920], [3.95, 420, 720], [4.2, 760, 1000], [4.6, 700, 900], [5.6, 440, 860], [5.85, 760, 1150], [6.2, 820, 1200]];
const cursor = (t: number) => {
  const k = CUR.findIndex(c => c[0] > t); if (k <= 0) return CUR[k === 0 ? 0 : CUR.length - 1].slice(1);
  const a = CUR[k - 1], b = CUR[k], u = prog(t, a[0], b[0]);
  return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
};

export const F3Desktop: React.FC = () => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const typed = 'Idea: una cámara sin rollo.'.slice(0, Math.max(0, Math.floor((t - 0.25) * 30)));
  const fall = Math.max(0, t - Q.HIT - 0.35);
  const [cx, cy] = cursor(t);
  const press = [Q.p1, Q.p2, Q.p3, Q.drawer].some(c => t >= c && t < c + 0.08);
  const year = t < Q.years ? 1975 : Math.min(2012, 1975 + Math.floor(Math.pow(prog(t, Q.years, Q.HIT - 0.05, x => x), 1.6) * 37));
  const dragFile = t >= Q.drawer - 0.25 && t < Q.drawer + 0.25;
  return (
    <AbsoluteFill style={{ background: K.bg, fontFamily: F.body }}>
      <AbsoluteFill style={{ transform: hitShake(t, 30) }}>
        {/* menu bar + dock */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, height: 54, borderBottom: `4px solid ${K.ink}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 30, padding: '0 34px', fontWeight: 800, fontSize: 26 }}><span>●</span><span>Kodak OS</span><span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{year}</span></div>
        <div style={{ position: 'absolute', left: 170, right: 170, top: 1260, height: 110, borderRadius: 30, border: `4px solid ${K.ink}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-around', boxShadow: `6px 8px 0 ${K.ink}` }}>
          {[K.yellow, K.green, K.blue, K.red, '#B38BFF'].map((c, i) => <div key={i} style={{ width: 70, height: 70, borderRadius: 18, background: c, border: `4px solid ${K.ink}`, transform: `translateY(${-Math.max(0, Math.sin((t - [0.1, 1.7, 3.0, 4.55, 5.9][i]) * 9)) * 20 * (Math.abs(t - [0.1, 1.7, 3.0, 4.55, 5.9][i] - 0.17) < 0.17 ? 1 : 0)}px)` }} />)}
        </div>
        {/* folder "Archivado" (appears for the drag) */}
        {t >= Q.meet && <div style={{ position: 'absolute', left: 700, top: 1030, transform: `scale(${pop(t, Q.meet + 0.2)})`, display: 'grid', justifyItems: 'center', gap: 6 }}>
          <svg width="150" height="116"><path d="M6 20 h50 l12 14 h76 v76 h-138z" fill={K.blue} stroke={K.ink} strokeWidth="5" />{t > Q.drawer + 0.2 && <g transform="translate(55 40)"><path d="M10 22 V14 a10 10 0 0 1 20 0 V22" stroke={K.ink} strokeWidth="5" fill="none" /><rect x="2" y="20" width="36" height="30" rx="6" fill={K.yellow} stroke={K.ink} strokeWidth="4" /></g>}</svg>
          <span style={{ fontWeight: 800, fontSize: 26 }}>Archivado</span>
        </div>}
        <Win t={t} at={0.1} out={1.5} x={110} y={330} w={620} h={420} title="Notas">
          <div style={{ padding: 30, fontWeight: 700, fontSize: 46, lineHeight: 1.2, color: K.ink }}>{typed}<span style={{ opacity: Math.floor(t * 4) % 2 }}>|</span></div>
          <div style={{ position: 'absolute', left: 30, bottom: 40, display: 'grid', gap: 14 }}><Bar w={380} /><Bar w={280} /></div>
        </Win>
        {t >= Q.idea && t < 1.5 && <div style={{ position: 'absolute', left: 660, top: 280, transform: `scale(${pop(t, Q.idea)}) rotate(10deg)` }}><Bulb size={170} t={t * 2} /></div>}
        <Win t={t} at={1.55} out={3.0} x={140} y={330} w={800} h={560} title="Mercado · fotografía">
          <svg width="800" height="500" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="230" cy="250" r="150" fill="#F3EEE6" stroke={K.ink} strokeWidth="5" />
            <circle cx="230" cy="250" r="75" fill="none" stroke={K.green} strokeWidth="150" strokeDasharray={`${(cnt / 100) * 471} 471`} transform="rotate(-90 230 250)" />
            <circle cx="230" cy="250" r="150" fill="none" stroke={K.ink} strokeWidth="5" />
          </svg>
          <div style={{ position: 'absolute', left: 430, top: 150, fontWeight: 800, fontSize: 130, letterSpacing: '-0.05em' }}>{cnt}%</div>
          <div style={{ position: 'absolute', left: 436, top: 300, fontWeight: 800, fontSize: 34, color: K.green }}>Kodak</div>
        </Win>
        <Win t={t} at={3.02} out={4.5} x={90} y={330} w={900} h={640} title="Prototipo.cad">
          <div style={{ position: 'absolute', inset: 0, background: '#E8EEFA' }} />
          <div style={{ position: 'absolute', left: 200, top: 130, transform: `scale(${1 + 0.06 * Math.max(0, 1 - Math.abs(t - Q.cam) * 6)})` }}><Camera size={500} parts={t < Q.p1 ? 0.05 : t < Q.p2 ? 0.26 : t < Q.p3 ? 0.51 : t < Q.cam ? 0.76 : 1} /></div>
        </Win>
        <Win t={t} at={Q.shot} out={4.5} x={560} y={720} w={380} h={360} title="Foto_001">
          <div style={{ margin: 20, height: 260, border: `4px solid ${K.ink}`, background: 'linear-gradient(#9fd2ff,#fff)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}><Mascot size={150} /></div>
        </Win>
        <Win t={t} at={Q.meet} out={Q.years} x={90} y={300} w={900} h={680} title="Correo">
          <div style={{ padding: 30, display: 'grid', gap: 14 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: K.gray }}>De: Junta directiva</div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>Re: Cámara digital</div>
            <div style={{ height: 4, background: K.ink, margin: '6px 0' }} />
            {[[Q.no1, 'No.', 120], [Q.no2, 'Nadie quiere ver fotos en una pantalla.', 40], [Q.no3, 'Está lindo… pero no se lo digas a nadie.', 40]].map(([a, s, size]) => t >= (a as number) && <div key={s as string} style={{ fontSize: size as number, fontWeight: 800, color: s === 'No.' ? K.red : K.ink, lineHeight: 1.1, transform: `scale(${pop(t, a as number, 300, 14)})`, transformOrigin: '0 50%' }}>{s}</div>)}
          </div>
          {/* the attachment the cursor drags away */}
          {t < Q.drawer + 0.25 && <div style={{ position: 'absolute', left: 30, bottom: 30, display: 'flex', alignItems: 'center', gap: 14, border: `4px solid ${K.ink}`, borderRadius: 16, padding: '10px 18px', background: '#fff', transform: dragFile ? `translate(${(cx - 230) * prog(t, Q.drawer - 0.25, Q.drawer + 0.2)}px, ${(cy - 930) * prog(t, Q.drawer - 0.25, Q.drawer + 0.2)}px) scale(${1 - prog(t, Q.drawer, Q.drawer + 0.25) * 0.6})` : undefined }}><Camera size={120} /><span style={{ fontWeight: 800, fontSize: 28 }}>camara.proto</span></div>}
        </Win>
        <Win t={t} at={Q.years} out={Q.HIT} x={240} y={440} w={600} h={520} title="Calendario">
          <div style={{ fontWeight: 800, fontSize: 190, textAlign: 'center', marginTop: 120, letterSpacing: '-0.05em' }}>{year}</div>
        </Win>
        {/* the crash: error dialog, windows falling */}
        <Win t={t} at={Q.HIT} out={Q.outro} x={130} y={420} w={820} h={470} title="Error" fall={fall}>
          <div style={{ display: 'flex', gap: 30, alignItems: 'center', padding: 40 }}>
            <div style={{ width: 130, height: 130, borderRadius: 65, background: K.red, border: `5px solid ${K.ink}`, color: '#fff', fontSize: 100, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</div>
            <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15 }}>Kodak se cerró<br />inesperadamente.</div>
          </div>
          <div style={{ position: 'absolute', right: 40, bottom: 40, border: `4px solid ${K.ink}`, borderRadius: 14, padding: '10px 30px', fontWeight: 800, fontSize: 30, background: K.bar }}>2012</div>
        </Win>
        {t >= Q.HIT && t < Q.outro && <div style={{ position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', transform: `scale(${2.4 - 1.4 * pop(t, Q.HIT + 0.15, 320, 16)})`, opacity: t > Q.HIT + 0.15 ? 1 : 0 }}><Stamp text="QUIEBRA" size={150} /></div>}
        {/* cursor */}
        {t < Q.HIT && <svg width="70" height="80" style={{ position: 'absolute', left: cx, top: cy, transform: `scale(${press ? 0.8 : 1})` }}><path d="M5 5 L5 60 L20 46 L32 72 L44 66 L32 41 L52 41 Z" fill="#fff" stroke={K.ink} strokeWidth="5" strokeLinejoin="round" /></svg>}
      </AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.22) * 0.9 : 0 }} />
      {t < Q.outro && <Captions top={1450} />}
      <FlatOutro />
      <AbbaTag color={K.card} />
    </AbsoluteFill>
  );
};
