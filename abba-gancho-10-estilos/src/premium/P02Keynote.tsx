// P02 · Keynote: product-launch look. Black stage, gradient type with a moving sheen, the camera revealed as a hero product
// on a reflective floor; on "quiebra" the colour drains out of everything and the product drops off its pedestal.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AbbaTag, DigitalCamera, Words, ease, prog, shake, useCount, useT } from '../kit';
import { PF, V } from './pkit';

const GRAD = 'linear-gradient(100deg, #FF8A00 0%, #FF2D8B 35%, #9B4DFF 65%, #2FB8FF 100%)';
/** Gradient-filled text with a light sheen that sweeps across; `sat` 0 drains it to grey. */
const Grad: React.FC<{ children: React.ReactNode; size: number; sheenAt: number; sat?: number; weight?: number; style?: React.CSSProperties }> = ({ children, size, sheenAt, sat = 1, weight = 800, style }) => {
  const t = useT(), x = -60 + 220 * prog(t, sheenAt, sheenAt + 1.1, ease);
  return (
    <span style={{
      fontFamily: PF.sans, fontWeight: weight, fontSize: size, letterSpacing: '-0.045em', lineHeight: 1, display: 'inline-block', paddingBottom: '0.08em',
      backgroundImage: `linear-gradient(100deg, transparent ${x - 12}%, rgba(255,255,255,.85) ${x}%, transparent ${x + 12}%), ${GRAD}`,
      WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `saturate(${sat})`, ...style,
    }}>{children}</span>
  );
};
const Fade: React.FC<{ a: number; b: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ a, b, children, style }) => {
  const t = useT(), i = prog(t, a, a + 0.6), o = prog(t, b - 0.25, b);
  return <div style={{ position: 'absolute', left: 80, right: 80, textAlign: 'center', opacity: i * (1 - o), transform: `scale(${1.06 - 0.06 * i})`, filter: `blur(${(1 - i) * 18 + o * 12}px)`, ...style }}>{children}</div>;
};

export const P02Keynote: React.FC = () => {
  const t = useT(), count = useCount(t);
  const drain = 1 - prog(t, V.HIT, V.HIT + 0.5);                       // colour drains on "quiebra"
  const sh = shake(t, V.HIT, 14, 0.4);
  const reveal = prog(t, 4.3, 5.3, ease), drop = prog(t, V.HIT, V.HIT + 0.9, x => x * x);
  const spin = Math.sin(Math.min(t, V.HIT) * 0.9) * 22;               // slow turntable sway
  return (
    <AbsoluteFill style={{ background: '#000', transform: `translate(${sh.x}px,${sh.y}px)` }}>
      {/* ambient colour glow behind everything, drains to grey on the hit */}
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% ${55 + 10 * Math.sin(t * 0.7)}%, rgba(155,77,255,${0.32 * drain}), transparent 70%), radial-gradient(50% 30% at 30% 30%, rgba(255,45,139,${0.18 * drain}), transparent 70%)` }} />
      <Fade a={V.y1975} b={1.5} style={{ top: 700 }}><Grad size={330} sheenAt={0.4}>1975.</Grad></Fade>
      <Fade a={1.5} b={3.0} style={{ top: 560 }}>
        <div style={{ fontFamily: PF.sans, fontWeight: 600, fontSize: 64, color: '#86868B', letterSpacing: '-0.02em' }}>Kodak era</div>
        <Grad size={150} sheenAt={2.3}>intocable.</Grad>
        <div style={{ marginTop: 90 }}><Grad size={400} sheenAt={2.5} weight={900}>{count}%</Grad></div>
      </Fade>
      <Fade a={3.0} b={V.quiebraLine} style={{ top: 330 }}>
        <Words text="Entonces inventó algo" at={V.inventa} stagger={0.12} from="blur" style={{ fontFamily: PF.sans, fontWeight: 700, fontSize: 84, color: '#F5F5F7', letterSpacing: '-0.03em' }} />
        <div style={{ opacity: prog(t, V.mundo - 0.5, V.mundo) }}><Grad size={92} sheenAt={V.mundo}>que cambiaría el mundo…</Grad></div>
      </Fade>
      {/* hero product on a reflective floor */}
      {t >= 4.2 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', perspective: 1400, opacity: reveal * (1 - prog(t, 8.3, 8.6)) }}>
          <div style={{ transform: `translateY(${(1 - reveal) * 120 + drop * 900}px) rotateY(${spin}deg) rotateZ(${drop * 28}deg) scale(${0.9 + 0.1 * reveal})`, filter: `saturate(${drain}) brightness(${0.55 + 0.45 * drain})` }}>
            <DigitalCamera size={720} led={drain} />
            <div style={{ transform: 'scaleY(-1)', opacity: 0.25 * (1 - drop), maskImage: 'linear-gradient(transparent 40%, #000)', WebkitMaskImage: 'linear-gradient(transparent 40%, #000)', marginTop: -30 }}><DigitalCamera size={720} led={drain} /></div>
          </div>
          {/* the light sweep across the product */}
          <div style={{ position: 'absolute', top: 0, width: 260, height: 520, left: -300 + 1700 * prog(t, 4.8, 5.7), background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent)', transform: 'skewX(-20deg)', mixBlendMode: 'overlay' }} />
        </div>
      )}
      <Fade a={V.quiebraLine} b={8.5} style={{ top: 330 }}>
        <div style={{ fontFamily: PF.sans, fontWeight: 600, fontSize: 70, color: '#86868B', letterSpacing: '-0.02em' }}>…y eso la llevó a la</div>
      </Fade>
      {t >= V.HIT && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: 1 - prog(t, 8.3, 8.6) }}>
          <span style={{ display: 'inline-block', fontFamily: PF.sans, fontWeight: 900, fontSize: 250, letterSpacing: '-0.06em', color: '#FF3B30', transform: `scale(${1 + 0.25 * (1 - prog(t, V.HIT, V.HIT + 0.35, ease))})`, textShadow: '0 0 80px rgba(255,59,48,.5)' }}>quiebra.</span>
        </div>
      )}
      {/* outro: a single thin glowing line, like a closed product box */}
      {t >= 8.5 && <div style={{ position: 'absolute', top: 960, left: 540 - 300 * prog(t, 8.6, 9.3, ease), width: 600 * prog(t, 8.6, 9.3, ease), height: 2, background: 'linear-gradient(90deg, transparent, #fff, transparent)', boxShadow: '0 0 24px #9B4DFF' }} />}
      <AbbaTag color="#F5F5F7" />
    </AbsoluteFill>
  );
};
