// 09 · Split-screen: a world in full colour on top (Kodak at its peak), a grey one below; on "quiebra" the grey devours the screen.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, Band, C, DigitalCamera, F, FilmRoll, Grain, LINES, Outro, T, Words, prog, rand, shake, useCount, useT } from '../kit';

/** The same world is rendered twice: in colour above the divider, desaturated below it. */
const World: React.FC<{ t: number }> = ({ t }) => {
  const count = useCount(t);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(170deg, ${C.magenta} 0%, ${C.orange} 45%, ${C.blue} 100%)` }} />
      {/* confetti / shapes */}
      {Array.from({ length: 34 }, (_, i) => {
        const x = rand(i, 1) * 1080, y = (rand(i, 2) * 2100 + t * (60 + rand(i, 3) * 140)) % 2100 - 100;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 26 + rand(i, 4) * 40, height: 26 + rand(i, 4) * 40, borderRadius: i % 3 ? '50%' : 8, background: [C.lime, '#fff', C.blue, C.magenta][i % 4], opacity: 0.6, transform: `rotate(${t * 90 * (rand(i, 5) - 0.5)}deg)` }} />;
      })}
      {/* rolls of film raining like success */}
      {Array.from({ length: 5 }, (_, i) => <div key={i} style={{ position: 'absolute', left: 60 + i * 200, top: 1300 + Math.sin(t * 2 + i) * 30, transform: `rotate(${(i - 2) * 12}deg)` }}><FilmRoll size={190} color={[C.orange, C.lime, '#fff', C.orange, C.lime][i]} /></div>)}
      {/* bouncy people dots, a crowd of customers */}
      {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ position: 'absolute', left: 40 + i * 115, top: 1640 - Math.abs(Math.sin(t * 4 + i)) * 40, width: 90, height: 150, borderRadius: '45px 45px 20px 20px', background: ['#fff', C.lime, C.blue][i % 3] }}><div style={{ width: 70, height: 70, margin: '-60px auto 0', borderRadius: '50%', background: '#F1C3A0' }} /></div>)}
      {t < T.inventa && <>
        <Band top={230}><Words text={LINES.a1} at={T.y1975} out={2.85} from="scale" style={{ fontFamily: F.display, fontSize: 220, color: '#fff', textShadow: '0 10px 40px rgba(0,0,0,.25)' }} /></Band>
        <Band top={500}><Words text={LINES.a2} at={T.intocable} out={2.85} style={{ fontFamily: F.display, fontSize: 76, color: '#fff' }} /></Band>
        <div style={{ position: 'absolute', left: 290, right: 290, top: 640, padding: '18px 0', borderRadius: 999, background: 'rgba(255,255,255,.25)', border: '3px solid rgba(255,255,255,.6)', backdropFilter: 'blur(10px)', textAlign: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 120, color: '#fff', opacity: prog(t, T.countStart, T.countStart + 0.2) * (1 - prog(t, 2.8, 3)) }}>{count}%</div>
      </>}
    </AbsoluteFill>
  );
};

export const S09Split: React.FC = () => {
  const t = useT();
  // divider: 960 → steps with each cut, then rushes to the top on the hit
  const base = t < T.cut1 ? 960 : t < T.inventa ? 1100 : t < T.cut2 ? 980 : 1040;
  const div = t < T.HIT ? base + Math.sin(t * 2) * 20 : base - (base + 60) * prog(t, T.HIT, T.HIT + 0.55, x => x * x * (3 - 2 * x));
  const sh = shake(t, T.HIT, 26);
  const camP = prog(t, T.camera, T.camera + 0.5);
  return (
    <AbsoluteFill style={{ background: '#000', transform: `translate(${sh.x}px,${sh.y}px)` }}>
      <AbsoluteFill style={{ clipPath: `inset(0 0 ${1920 - div}px 0)` }}><World t={t} /></AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(${div}px 0 0 0)`, filter: 'grayscale(1) brightness(.55) contrast(1.1)' }}>
        <World t={t} />
        {/* rain in the grey world */}
        {Array.from({ length: 60 }, (_, i) => <div key={i} style={{ position: 'absolute', left: rand(i, 6) * 1080, top: ((rand(i, 7) * 1920 + t * 1400) % 1920), width: 3, height: 60, background: 'rgba(255,255,255,.35)' }} />)}
      </AbsoluteFill>
      {/* glowing divider */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: div - 3, height: 6, background: '#fff', boxShadow: `0 0 30px 8px ${C.lime}`, opacity: t < T.HIT + 0.6 ? 1 : 0 }} />
      {/* the invention sits on the border between both worlds */}
      {t >= T.inventa && t < T.HIT + 0.5 && (
        <div style={{ position: 'absolute', left: 540 - 300, top: div - 210, transform: `scale(${0.6 + 0.4 * camP}) translateY(${(1 - camP) * 80}px)`, opacity: camP }}>
          <div style={{ position: 'absolute', inset: -60, borderRadius: '50%', background: `radial-gradient(${C.lime}66, transparent 70%)` }} />
          <DigitalCamera size={600} mono={t > T.HIT} />
        </div>
      )}
      <Band top={240}><Words text={LINES.b} at={T.inventa + 0.1} out={5.85} stagger={0.06} style={{ fontFamily: F.display, fontSize: 74, color: '#fff', lineHeight: 1.05, textShadow: '0 6px 30px rgba(0,0,0,.3)' }} /></Band>
      <Band top={240}><Words text={LINES.c1} at={T.quiebraLine} out={8.4} style={{ fontFamily: F.display, fontSize: 78, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,.4)' }} /></Band>
      <Band top={1300}><Words text={LINES.c2} at={T.HIT + 0.1} out={8.45} from="scale" style={{ fontFamily: F.display, fontSize: 200, color: C.magenta, textShadow: `0 0 40px ${C.magenta}` }} /></Band>
      <Outro to={0.85} />
      {t >= T.outro && <div style={{ position: 'absolute', left: 0, right: 0, top: 958, height: 4, background: '#fff', opacity: 0.5 * Math.max(0, 1 - (t - T.outro) / 1.4), transform: `scaleX(${Math.max(0, 1 - (t - T.outro) / 1.4)})` }} />}
      <Grain />
      <AbbaTag />
    </AbsoluteFill>
  );
};
