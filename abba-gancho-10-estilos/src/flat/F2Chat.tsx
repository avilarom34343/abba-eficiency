// F2 · Chat: the story told inside a phone. The engineer's messages, the market card, the first photo, the board's
// group chat answering NO ("está lindo… pero no se lo digas a nadie"), years scrolling by, and the news alert that cracks the screen.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, F, prog, useT } from '../kit';
import { Bulb, Camera, Captions, Face, FlatOutro, K, Mascot, Q, Stamp, hitShake, pop } from './fkit';

type Msg = { at: number; side: 'me' | 'them' | 'sys'; who?: number; body: React.ReactNode; h: number };
const Bubble: React.FC<{ m: Msg; t: number }> = ({ m, t }) => {
  const p = pop(t, m.at, 260, 13);
  const me = m.side === 'me', sys = m.side === 'sys';
  return (
    <div style={{ display: 'flex', justifyContent: sys ? 'center' : me ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 10, transform: `scale(${p})`, transformOrigin: me ? '100% 100%' : '0 100%', height: m.h * Math.min(1, p * 1.5), opacity: Math.min(1, p * 2) }}>
      {m.side === 'them' && <Face size={64} suit hair={['#9a9a9a', '#3a2a20', '#cfcfcf'][m.who ?? 0]} mood="flat" bg="#F7E7C9" />}
      <div style={{ maxWidth: 400, padding: '16px 22px', borderRadius: 26, border: `4px solid ${K.ink}`, background: sys ? '#fff' : me ? K.blue : '#fff', color: me ? '#fff' : K.ink, fontFamily: F.body, fontWeight: 700, fontSize: 34, lineHeight: 1.15, boxShadow: `4px 5px 0 ${K.ink}`, borderBottomRightRadius: me ? 6 : 26, borderBottomLeftRadius: m.side === 'them' ? 6 : 26 }}>{m.body}</div>
    </div>
  );
};

export const F2Chat: React.FC = () => {
  const t = useT();
  const cnt = Math.round(90 * prog(t, Q.count, Q.full - 0.05));
  const board = t >= Q.meet;
  const msgs: Msg[] = board ? [
    { at: Q.meet, side: 'me', body: <div style={{ display: 'grid', gap: 8 }}><div style={{ background: '#fff', borderRadius: 14, border: `3px solid ${K.ink}`, padding: 8 }}><Camera size={260} /></div>Les presento: la cámara digital.</div>, h: 330 },
    { at: Q.no1, side: 'them', who: 0, body: 'No.', h: 76 },
    { at: Q.no2, side: 'them', who: 1, body: 'Nadie quiere ver fotos en una pantalla.', h: 116 },
    { at: Q.no3, side: 'them', who: 2, body: 'Está lindo… pero no se lo digas a nadie.', h: 116 },
    { at: Q.drawer, side: 'sys', body: <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><svg width="30" height="36"><path d="M8 16 V10 a7 7 0 0 1 14 0 V16" stroke={K.ink} strokeWidth="4" fill="none" /><rect x="3" y="15" width="24" height="19" rx="5" fill={K.yellow} stroke={K.ink} strokeWidth="3" /></svg>Proyecto archivado</span>, h: 76 },
  ] : [
    { at: 0.15, side: 'sys', body: '1975', h: 70 },
    { at: Q.idea, side: 'me', body: <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Bulb size={56} t={t * 2} />Tengo una idea</span>, h: 96 },
    { at: Q.kodak, side: 'sys', body: <div style={{ display: 'grid', gap: 10, width: 330 }}><span>Kodak · cuota de mercado</span><span style={{ fontSize: 76, fontWeight: 800, letterSpacing: '-0.04em' }}>{cnt}%</span><div style={{ height: 22, borderRadius: 11, border: `3px solid ${K.ink}`, overflow: 'hidden' }}><div style={{ width: `${cnt}%`, height: '100%', background: K.green }} /></div></div>, h: 250 },
    { at: Q.build, side: 'me', body: <div style={{ background: '#E8EEFA', borderRadius: 14, border: `3px solid ${K.ink}`, padding: 10 }}><Camera size={300} parts={t < Q.p1 ? 0.05 : t < Q.p2 ? 0.26 : t < Q.p3 ? 0.51 : t < Q.cam ? 0.76 : 1} /></div>, h: 260 },
    { at: Q.shot, side: 'me', body: '¡Funciona! Primera foto digital.', h: 116 },
  ];
  // the chat scrolls up as it fills; during the "years" beat it races through dated separators
  const total = msgs.filter(m => t >= m.at).reduce((a, m) => a + m.h + 24, 0);
  const years = t >= Q.years ? prog(t, Q.years, Q.HIT, x => x * x) : 0;
  const scroll = Math.max(0, total - 960) + years * 2400;
  const alert = pop(t, Q.HIT, 300, 15), crack = t >= Q.HIT;
  return (
    <AbsoluteFill style={{ background: K.bg, fontFamily: F.body }}>
      <AbsoluteFill style={{ transform: hitShake(t, 30) }}>
        <div style={{ position: 'absolute', left: 190, top: 150 + (1 - pop(t, 0, 180, 14)) * 1500, width: 700, height: 1220, borderRadius: 80, background: K.ink, padding: 18, boxShadow: `14px 16px 0 rgba(0,0,0,.18)` }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 64, background: '#F6F2EA', overflow: 'hidden', position: 'relative' }}>
            {/* chat header */}
            <div style={{ height: 150, background: '#fff', borderBottom: `4px solid ${K.ink}`, display: 'flex', alignItems: 'center', gap: 18, padding: '30px 30px 0', position: 'relative', zIndex: 2 }}>
              {board ? <div style={{ display: 'flex' }}>{[0, 1, 2].map(i => <div key={i} style={{ marginLeft: i ? -26 : 0 }}><Face size={74} suit hair={['#9a9a9a', '#3a2a20', '#cfcfcf'][i]} mood="flat" bg="#F7E7C9" /></div>)}</div> : <Face size={80} />}
              <div style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 34, color: K.ink }}>{board ? 'Junta directiva' : 'Steve · Laboratorio'}</span>
                <span style={{ fontWeight: 600, fontSize: 24, color: K.green }}>{board ? (t < Q.no1 ? 'escribiendo…' : '3 miembros') : 'en línea'}</span>
              </div>
            </div>
            <div style={{ position: 'absolute', left: 24, right: 24, top: 170, transform: `translateY(${-scroll}px)`, display: 'grid', gap: 24 }}>
              {msgs.filter(m => t >= m.at).map((m, i) => <Bubble key={`${board}${i}`} m={m} t={t} />)}
              {years > 0 && [1980, 1990, 1995, 2001, 2005, 2008, 2010, 2012].map(y => <div key={y} style={{ display: 'flex', justifyContent: 'center', height: 260 }}><span style={{ alignSelf: 'center', background: '#fff', border: `3px solid ${K.ink}`, borderRadius: 30, padding: '8px 28px', fontWeight: 800, fontSize: 40 }}>{y}</span></div>)}
            </div>
            {/* the camera flash on the first photo */}
            <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: t >= Q.shot ? Math.max(0, 1 - (t - Q.shot) / 0.25) : 0 }} />
            {/* the news alert */}
            {t >= Q.HIT && <div style={{ position: 'absolute', left: 20, right: 20, top: 30 + (1 - alert) * -300, zIndex: 3, background: '#fff', border: `4px solid ${K.ink}`, borderRadius: 30, padding: 22, display: 'flex', gap: 18, alignItems: 'center', boxShadow: `6px 8px 0 ${K.ink}` }}>
              <div style={{ width: 70, height: 70, borderRadius: 18, background: K.red, border: `3px solid ${K.ink}`, color: '#fff', fontWeight: 800, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</div>
              <div style={{ display: 'grid', gap: 6 }}><span style={{ fontWeight: 800, fontSize: 26, color: K.red }}>NOTICIAS · 2012</span><span style={{ fontWeight: 800, fontSize: 32, color: K.ink }}>Kodak se declara en quiebra</span></div>
            </div>}
            {crack && <svg width="664" height="1184" style={{ position: 'absolute', inset: 0, zIndex: 4 }}>
              {Array.from({ length: 10 }, (_, i) => { const a = i * 0.63 + 0.2, r1 = 120 + (i % 3) * 40; const L = prog(t, Q.HIT + 0.05, Q.HIT + 0.2); return <path key={i} d={`M332 640 L${332 + Math.cos(a) * r1 * L} ${640 + Math.sin(a) * r1 * L} L${332 + Math.cos(a + 0.15) * 520 * L} ${640 + Math.sin(a + 0.15) * 620 * L}`} stroke={K.ink} strokeWidth="4" fill="none" />; })}
              <circle cx="332" cy="640" r="40" fill="none" stroke={K.ink} strokeWidth="3" />
            </svg>}
          </div>
        </div>
        {t >= Q.HIT && t < Q.outro && <div style={{ position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', transform: `scale(${2.4 - 1.4 * pop(t, Q.HIT + 0.12, 320, 16)})`, opacity: t > Q.HIT + 0.12 ? 1 : 0 }}><Stamp text="QUIEBRA" size={150} /></div>}
        <div style={{ position: 'absolute', left: 60, top: 1180 + (1 - pop(t, 0.9)) * 300 }}><Mascot size={110} shock={t >= Q.HIT} /></div>
      </AbsoluteFill>
      {t < Q.outro && <Captions top={1470} />}
      <FlatOutro />
      <AbbaTag color={K.card} />
    </AbsoluteFill>
  );
};
