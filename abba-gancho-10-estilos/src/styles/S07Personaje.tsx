// 07 · Personajes: a flat, friendly engineer on a "player card"; he proudly shows his invention, and on "quiebra" his smile freezes.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, Band, C, DigitalCamera, F, Grain, LINES, Outro, T, Words, ease, prog, rand, shake, useCount, useT } from '../kit';

/** Flat illustrated 70s engineer (generic, friendly). `arm` 0→1 raises the camera; `frozen` stops every micro-animation. */
const Engineer: React.FC<{ t: number; arm: number; frozen: boolean }> = ({ t, arm, frozen }) => {
  const tt = frozen ? T.HIT : t;
  const blink = !frozen && (tt % 2.6) < 0.12 ? 0.1 : 1;
  const bob = Math.sin(tt * 3) * 6;
  const smile = frozen ? 0.55 : 1;
  return (
    <svg viewBox="0 0 600 900" width="600" height="900">
      <g transform={`translate(0 ${bob})`}>
        {/* body: lab coat over shirt and tie */}
        <path d="M120 900 Q130 600 300 580 Q470 600 480 900Z" fill="#F4F2FA" />
        <path d="M250 590 L300 700 L350 590Z" fill="#9FC4FF" /><path d="M292 640 L308 640 L318 760 L300 790 L282 760Z" fill={C.orange} />
        {/* left arm resting */}
        <path d="M150 680 Q110 780 150 880" stroke="#F4F2FA" strokeWidth="70" fill="none" strokeLinecap="round" />
        {/* head */}
        <rect x="270" y="500" width="60" height="90" rx="20" fill="#E8B48F" />
        <ellipse cx="300" cy="400" rx="140" ry="160" fill="#F1C3A0" />
        <path d="M160 380 Q150 230 300 220 Q460 230 440 390 Q430 300 300 300 Q190 300 160 380Z" fill="#5B3A22" />
        <path d="M165 380 Q150 470 175 500 L185 420Z M435 380 Q450 470 425 500 L415 420Z" fill="#5B3A22" />
        {/* glasses + eyes */}
        <g stroke="#2A2540" strokeWidth="8" fill="rgba(255,255,255,.35)"><rect x="200" y="365" width="85" height="65" rx="18" /><rect x="315" y="365" width="85" height="65" rx="18" /><path d="M285 392 H315" /></g>
        <ellipse cx="243" cy="398" rx="11" ry={14 * blink} fill="#2A2540" /><ellipse cx="357" cy="398" rx="11" ry={14 * blink} fill="#2A2540" />
        {/* mustache + smile */}
        <path d="M245 470 Q300 445 355 470 Q330 485 300 478 Q270 485 245 470Z" fill="#5B3A22" />
        <path d={`M255 495 Q300 ${495 + 40 * smile} 345 495`} stroke="#8A3B2E" strokeWidth="9" fill={smile === 1 ? '#fff' : 'none'} strokeLinecap="round" />
        <circle cx="205" cy="455" r="20" fill={C.magenta} opacity={frozen ? 0 : 0.25} /><circle cx="395" cy="455" r="20" fill={C.magenta} opacity={frozen ? 0 : 0.25} />
        {/* right arm raising the camera */}
        <g transform={`rotate(${-arm * 115} 450 650)`}>
          <path d="M450 650 Q520 760 470 860" stroke="#F4F2FA" strokeWidth="70" fill="none" strokeLinecap="round" />
          <circle cx="470" cy="860" r="34" fill="#F1C3A0" />
          {arm > 0.05 && <g transform={`translate(470 860) rotate(${arm * 115}) translate(-150 -230)`} opacity={arm}><DigitalCamera size={360} mono={frozen} /></g>}
        </g>
      </g>
    </svg>
  );
};

export const S07Personaje: React.FC = () => {
  const t = useT(), count = useCount(t);
  const frozen = t >= T.HIT;
  const arm = prog(t, T.camera, T.camera + 0.6, ease);
  const gray = prog(t, T.HIT, T.HIT + 0.25, x => x);
  const flip = prog(t, T.outro, T.outro + 0.6);
  const sh = shake(t, T.HIT, 20, 0.4);
  const slide = (at: number) => ({ opacity: prog(t, at, at + 0.3), transform: `translateX(${(1 - prog(t, at, at + 0.45, ease)) * 300}px)` });
  const flipDigit = (d: string, i: number) => {
    const p = prog(t, T.y1975 + i * 0.12, T.y1975 + i * 0.12 + 0.35);
    return <div key={i} style={{ width: 120, height: 170, borderRadius: 18, background: '#16112b', display: 'grid', placeItems: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 130, color: '#fff', transform: `rotateX(${(1 - p) * 90}deg)`, boxShadow: 'inset 0 -85px 0 rgba(255,255,255,.04)' }}>{d}</div>;
  };
  const bg = t < T.inventa ? `linear-gradient(160deg, ${C.magenta}, #6a1bd8)` : `linear-gradient(160deg, ${C.lime}, #19c37d)`;
  return (
    <AbsoluteFill style={{ background: '#05040b', perspective: 1800 }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px,${sh.y}px) rotateY(${flip * 180}deg)`, opacity: flip < 0.5 ? 1 : 0, filter: `grayscale(${gray}) brightness(${1 - gray * 0.35})` }}>
        <AbsoluteFill style={{ background: bg }} />
        {/* city-dot skyline */}
        <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>{Array.from({ length: 140 }, (_, i) => <circle key={i} cx={(i % 20) * 56 + 20} cy={1320 + Math.floor(i / 20) * 60 + (rand(i, 2) * 30)} r={6 + rand(i, 3) * 6} fill="#fff" opacity={rand(Math.floor(t * 3) + i, 5) > 0.3 ? 0.8 : 0.2} />)}</svg>
        <div style={{ position: 'absolute', left: 70, top: 190, display: 'flex', gap: 14, ...slide(0.05) }}>
          <span style={{ padding: '10px 22px', borderRadius: 12, background: '#16112b', fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: '#fff' }}>JUGADOR 01</span>
          <span style={{ padding: '10px 22px', borderRadius: 12, background: '#fff', fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: '#16112b' }}>INGENIERO</span>
        </div>
        <div style={{ position: 'absolute', right: 60, top: 280, fontFamily: F.display, fontSize: 210, color: '#fff', lineHeight: 0.9, textAlign: 'right', ...slide(0.15), opacity: 0.95 }}>STEVE<br /><span style={{ fontSize: 90 }}>SASSON</span></div>
        <div style={{ position: 'absolute', left: -40, top: 640, transform: 'scale(1.25)', transformOrigin: '0 0' }}><Engineer t={t} arm={arm} frozen={frozen} /></div>
        {/* stat cards */}
        {t < T.inventa && <>
          <div style={{ position: 'absolute', right: 70, top: 700, display: 'flex', gap: 10, perspective: 600 }}>{[...'1975'].map(flipDigit)}<span style={{ fontFamily: F.display, fontSize: 130, color: '#fff', alignSelf: 'flex-end' }}>.</span></div>
          <div style={{ position: 'absolute', right: 70, top: 920, width: 470, padding: '24px 28px', borderRadius: 30, background: 'rgba(255,255,255,.18)', border: '2px solid rgba(255,255,255,.4)', backdropFilter: 'blur(12px)', ...slide(T.intocable) }}>
            <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: '#fff', opacity: 0.8 }}>KODAK · MERCADO</div>
            <div style={{ fontFamily: F.display, fontSize: 130, color: '#fff', lineHeight: 1 }}>{count}%</div>
            <div style={{ height: 16, borderRadius: 8, background: 'rgba(0,0,0,.25)', marginTop: 10 }}><div style={{ width: `${count}%`, height: '100%', borderRadius: 8, background: C.lime }} /></div>
          </div>
        </>}
        {t >= T.intocable && t < 3.1 && <Band top={1560} style={{ left: 60, right: 60, opacity: 1 - prog(t, 2.85, 3.05) }}><Words text={LINES.a2} at={T.intocable} out={2.85} style={{ fontFamily: F.display, fontSize: 66, color: '#fff', background: '#16112b', borderRadius: 26, padding: '18px 26px' }} /></Band>}
        {t >= T.inventa && t < 6.1 && <Band top={1520} style={{ left: 60, right: 60, opacity: 1 - prog(t, 5.85, 6.05) }}><Words text={LINES.b} at={T.inventa + 0.1} out={5.85} stagger={0.06} style={{ fontFamily: F.display, fontSize: 58, color: '#fff', lineHeight: 1.1, background: '#16112b', borderRadius: 26, padding: '18px 26px' }} /></Band>}
        {t >= T.quiebraLine && t < 8.7 && <Band top={1560} style={{ left: 60, right: 60, opacity: 1 - prog(t, 8.4, 8.65) }}><Words text={LINES.c1} at={T.quiebraLine} out={8.4} style={{ fontFamily: F.display, fontSize: 62, color: '#fff', background: '#16112b', borderRadius: 26, padding: '18px 26px' }} /></Band>}
        {t >= T.inventa && t < T.HIT && [0, 1, 2, 3, 4].map(i => { const p = prog(t, T.camera + 0.4 + i * 0.1, T.camera + 1.4 + i * 0.1); return <div key={i} style={{ position: 'absolute', left: 520 + Math.cos(i * 1.3) * 240 * p, top: 820 + Math.sin(i * 1.3) * 160 * p, width: 26, height: 26, background: '#fff', transform: `rotate(45deg) scale(${1 - p})`, opacity: 1 - p }} />; })}
      </AbsoluteFill>
      {/* stamp keeps its colour while everything else freezes into grey */}
      {t >= T.HIT && t < T.outro + 0.3 && (() => { const p = prog(t, T.HIT, T.HIT + 0.18, x => x); return (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', transform: `rotate(-10deg) scale(${2.2 - 1.2 * p})`, opacity: p * (1 - prog(t, T.outro, T.outro + 0.3)) }}>
          <span style={{ padding: '10px 40px', border: `14px solid ${C.magenta}`, borderRadius: 30, fontFamily: F.display, fontSize: 170, color: C.magenta, background: 'rgba(5,4,11,.35)' }}>{LINES.c2}</span>
        </div>); })()}
      {/* card back after the flip */}
      <AbsoluteFill style={{ transform: `rotateY(${flip * 180 - 180}deg)`, opacity: flip >= 0.5 ? 1 : 0, background: '#07060d', display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 300, height: 300, borderRadius: '50%', border: '2px solid #ffffff20', boxShadow: `0 0 ${60 * Math.max(0, 1 - (t - T.outro - 0.6))}px ${C.magenta}55` }} />
      </AbsoluteFill>
      <Outro at={T.outro + 0.4} to={0.5} />
      <Grain />
      <AbbaTag />
    </AbsoluteFill>
  );
};
