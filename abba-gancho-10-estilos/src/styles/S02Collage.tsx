// 02 · Collage de revista: paper cut-outs, tape and illustrated photos assemble in stop-motion; on "quiebra" the page tears in two.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { AbbaTag, C, DigitalCamera, F, FilmRoll, LINES, Outro, T, prog, rand, shake, useCount, useT } from '../kit';

const torn = (w: number, h: number, seed: number, j = 10) => { // jagged-edged rectangle as a polygon
  const p: string[] = [], step = 26;
  for (let x = 0; x <= w; x += step) p.push(`${x},${rand(x, seed) * j}`);
  for (let y = 0; y <= h; y += step) p.push(`${w - rand(y, seed + 1) * j},${y}`);
  for (let x = w; x >= 0; x -= step) p.push(`${x},${h - rand(x, seed + 2) * j}`);
  for (let y = h; y >= 0; y -= step) p.push(`${rand(y, seed + 3) * j},${y}`);
  return p.join(' ');
};
const Paper: React.FC<{ w: number; h: number; color: string; seed: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ w, h, color, seed, style, children }) => (
  <div style={{ position: 'absolute', width: w, height: h, ...style }}>
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,.35))' }}><polygon points={torn(w, h, seed)} fill={color} /></svg>
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>{children}</div>
  </div>
);
const Tape: React.FC<{ x: number; y: number; r: number; w?: number }> = ({ x, y, r, w = 170 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: 52, transform: `rotate(${r}deg)`, background: 'repeating-linear-gradient(90deg,rgba(255,250,220,.75) 0 10px,rgba(255,250,220,.6) 10px 20px)', boxShadow: '0 2px 6px rgba(0,0,0,.15)' }} />
);
/** Ransom-note letters: every character cut from a different magazine. */
const Ransom: React.FC<{ text: string; at: number; size: number; palette?: string[]; stagger?: number }> = ({ text, at, size, palette = [C.magenta, C.blue, C.lime, C.orange, '#fff', '#111'], stagger = 0.06 }) => {
  const t = useT();
  const fonts = [F.display, F.mono, F.hand, F.body];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
      {[...text].map((ch, i) => {
        const p = prog(t, at + i * stagger, at + i * stagger + 0.1, x => x), bg = palette[i % palette.length];
        return ch === ' ' ? <span key={i} style={{ width: size * 0.3 }} /> : (
          <span key={i} style={{ display: 'inline-block', padding: `${size * 0.04}px ${size * 0.1}px`, background: bg, color: bg === '#fff' || bg === C.lime ? '#111' : '#fff', fontFamily: fonts[i % 4], fontWeight: 800, fontSize: size * (0.9 + rand(i, 2) * 0.25), lineHeight: 1, transform: `rotate(${(rand(i, 3) - 0.5) * 12}deg) scale(${p < 1 ? 1.6 - 0.6 * p : 1})`, opacity: p > 0 ? 1 : 0, boxShadow: '0 6px 10px rgba(0,0,0,.3)' }}>{ch}</span>
        );
      })}
    </div>
  );
};
/** Flat illustrated "photo" (not real): a family scene with sun and hills. */
const Polaroid: React.FC<{ hue: string; seed: number }> = ({ hue, seed }) => (
  <div style={{ width: 300, height: 350, background: '#fdfbf4', padding: 18, boxShadow: '0 12px 24px rgba(0,0,0,.35)' }}>
    <svg viewBox="0 0 264 250" width="264" height="250">
      <rect width="264" height="250" fill={hue} /><circle cx={200 - seed * 40} cy="70" r="34" fill="#FFE27A" />
      <path d="M0 190 Q80 130 160 180 T264 160 V250 H0Z" fill="#2c2350" opacity=".55" />
      {[70, 120, 170].map((x, i) => <g key={i}><circle cx={x} cy={150 + i * 4} r="16" fill="#f3c9a8" /><rect x={x - 18} y={166 + i * 4} width="36" height="60" rx="14" fill={['#2F6BFF', '#FF7A1A', '#B6FF3B'][i]} /></g>)}
    </svg>
  </div>
);

const Collage: React.FC = () => {
  const t = useT(), f = useCurrentFrame();
  const step = Math.floor(f / 2.5); // stop-motion jitter at ~12 fps
  const jit = (k: number, a = 1.5) => (rand(step, k) - 0.5) * a;
  const slap = (at: number) => { const p = prog(t, at, at + 0.18, x => x); return { opacity: p > 0 ? 1 : 0, scale: `${p < 1 ? 1.35 - 0.35 * p : 1}` } as React.CSSProperties; }; // `scale` composes with each element's own rotate()
  const count = useCount(t);
  const A = t < T.inventa, B = t >= T.inventa && t < T.quiebraLine;
  return (
    <AbsoluteFill style={{ background: '#EFE6D6' }}>
      <AbsoluteFill style={{ opacity: 0.35, background: 'repeating-linear-gradient(0deg,transparent 0 3px,rgba(120,90,50,.06) 3px 4px)' }} />
      {A && <>
        <Paper w={900} h={560} color={C.magenta} seed={1} style={{ left: 90 + jit(1), top: 230 + jit(2), transform: `rotate(${-3 + jit(3)}deg)`, ...slap(0.05) }}>
          <div style={{ paddingTop: 150 }}><Ransom text={LINES.a1} at={T.y1975} size={170} palette={['#fff', C.lime, C.blue, '#111', C.orange]} /></div>
        </Paper>
        <Paper w={860} h={150} color="#fff" seed={2} style={{ left: 110 + jit(4), top: 830, transform: `rotate(${2 + jit(5)}deg)`, ...slap(T.intocable) }}>
          <div style={{ fontFamily: F.display, fontSize: 70, color: '#111', textAlign: 'center', paddingTop: 36 }}>{LINES.a2}</div>
        </Paper>
        <Tape x={430} y={800} r={-6} />
        <div style={{ position: 'absolute', left: 580, top: 1080, ...slap(T.countStart), transform: `rotate(${8 + jit(6)}deg) scale(${t > T.countEnd ? 1 + 0.12 * Math.max(0, 1 - (t - T.countEnd) * 4) : 1})` }}>
          <div style={{ width: 380, height: 380, borderRadius: '50%', background: C.orange, display: 'grid', placeItems: 'center', boxShadow: '0 14px 26px rgba(0,0,0,.35)', border: '10px dashed #fff3' }}>
            <span style={{ fontFamily: F.display, fontSize: 150, color: '#111' }}>{count}%</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 90, top: 1130, transform: `rotate(${-8 + jit(7)}deg)`, ...slap(T.cut1) }}><Polaroid hue="#9FC4FF" seed={0} /></div>
        <Tape x={150} y={1110} r={10} w={140} />
        <div style={{ position: 'absolute', left: 300, top: 1380, transform: `rotate(${5 + jit(8)}deg)`, ...slap(T.cut1 + 0.25) }}><FilmRoll size={280} /></div>
      </>}
      {B && <>
        <Paper w={980} h={1200} color={C.blue} seed={5} style={{ left: 50 + jit(1), top: 300 + jit(2), transform: `rotate(${1.5 + jit(3)}deg)` }} />
        <div style={{ position: 'absolute', left: 80, right: 80, top: 360, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
          {LINES.b.split(' ').map((w, i) => (
            <span key={i} style={{ display: 'inline-block', padding: '8px 18px', background: i % 3 === 0 ? '#fff' : i % 3 === 1 ? C.lime : '#111', color: i % 3 === 2 ? '#fff' : '#111', fontFamily: i % 2 ? F.display : F.mono, fontWeight: 700, fontSize: 64, transform: `rotate(${(rand(i, 9) - 0.5) * 8 + jit(i)}deg)`, ...slap(T.inventa + i * 0.12) }}>{w}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 140, top: 820, transform: `rotate(${-4 + jit(11, 2)}deg) scale(${1 + 0.03 * Math.sin(t * 6)})`, ...slap(T.camera) }}>
          <Paper w={800} h={600} color="#fff" seed={8}><div style={{ paddingTop: 70, display: 'grid', placeItems: 'center' }}><DigitalCamera size={680} /></div></Paper>
        </div>
        <Tape x={180} y={800} r={-20} /><Tape x={760} y={1380} r={-14} />
        {[0, 1, 2, 3].map(i => <svg key={i} width="90" height="90" viewBox="0 0 24 24" style={{ position: 'absolute', left: [120, 880, 860, 160][i], top: [760, 790, 1420, 1450][i], ...slap(T.camera + 0.2 + i * 0.1), transform: `rotate(${t * 40 + i * 30}deg)` }}><path d="M12 1l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill={[C.lime, C.magenta, C.orange, '#fff'][i]} /></svg>)}
      </>}
    </AbsoluteFill>
  );
};

export const S02Collage: React.FC = () => {
  const t = useT(), f = useCurrentFrame();
  const tear = prog(t, T.HIT, T.HIT + 0.7);
  const sh = shake(t, T.HIT, 30);
  const edge = Array.from({ length: 40 }, (_, i) => `${540 + (rand(i, 21) - 0.5) * 90}px ${i * 50}px`).join(',');
  const left = `polygon(0 0, ${edge}, 0 1920px)`, right = `polygon(1080px 0, ${edge}, 1080px 1920px)`;
  const C2 = t >= T.quiebraLine;
  return (
    <AbsoluteFill style={{ background: '#050408', transform: `translate(${sh.x}px,${sh.y}px)` }}>
      {!C2 && <Collage />}
      {C2 && <>
        {/* the last page: a calm cream sheet with the line, which tears on the hit */}
        {[left, right].map((clip, k) => (
          <AbsoluteFill key={k} style={{ clipPath: clip, transform: `translateX(${(k ? 1 : -1) * tear * 620}px) rotate(${(k ? 1 : -1) * tear * 9}deg)`, transformOrigin: k ? '100% 100%' : '0 100%' }}>
            <AbsoluteFill style={{ background: '#EFE6D6' }} />
            <Paper w={900} h={260} color="#fff" seed={12} style={{ left: 90, top: 640, transform: 'rotate(-2deg)' }}>
              <div style={{ fontFamily: F.display, fontSize: 68, color: '#111', textAlign: 'center', paddingTop: 50, lineHeight: 1.1 }}>{LINES.c1}</div>
            </Paper>
            <div style={{ position: 'absolute', left: 300, top: 1000 }}><Polaroid hue="#FFC59F" seed={1} /></div>
            <Tape x={360} y={980} r={-8} />
          </AbsoluteFill>
        ))}
        {t >= T.HIT && Array.from({ length: 16 }, (_, i) => { // paper scraps flying out of the tear
          const d = t - T.HIT, x = 540 + (rand(i, 31) - 0.5) * 900 * d, y = 400 + rand(i, 32) * 1100 + 500 * d * d;
          return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 40 + rand(i, 33) * 60, height: 30 + rand(i, 34) * 40, background: ['#EFE6D6', '#fff', C.magenta, C.blue][i % 4], transform: `rotate(${d * 500 * (rand(i, 35) - 0.5)}deg)`, opacity: Math.max(0, 1 - d * 0.5) }} />;
        })}
        <div style={{ position: 'absolute', left: 60, right: 60, top: 860, opacity: t >= T.HIT ? 1 : 0 }}>
          <Ransom text={LINES.c2} at={T.HIT + 0.02} stagger={0.025} size={150} palette={[C.magenta, '#fff', C.magenta, '#111', C.magenta]} />
        </div>
      </>}
      <Outro to={0.9} />
      {t >= T.outro && (() => { const d = t - T.outro; return <div style={{ position: 'absolute', left: 420 + Math.sin(d * 3) * 120, top: 300 + d * 420, width: 110, height: 80, background: '#EFE6D6', transform: `rotate(${Math.sin(d * 4) * 40}deg)`, opacity: 0.8 }} />; })()}
      <AbbaTag />
    </AbsoluteFill>
  );
};
