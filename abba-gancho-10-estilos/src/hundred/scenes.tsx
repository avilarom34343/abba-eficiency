// Scene library for the 100-video set. Every scene takes one beat of content and a local clock (t, d in seconds);
// crash beats carry `hit` (local time of "quiebra") and every crash-capable scene detonates on it.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { query, typing } from './plan';
import { Prop } from './props';
import { BODY, Beat, GlowRing, Glass, Hl, Icon, RED, alpha, beatK, cl, eio, eo, fit, headStyle, hitK, lerp, measure, rng, seg, shake, spr, useSpec } from './core';

type P = { b: Beat; t: number; d: number };
export type Sc = React.FC<P>;
const isYear = (b: Beat) => b.kind === 'year' || b.kind === 'crash' || (b.num !== undefined && b.num >= 1800 && b.num <= 2100 && !b.pre && !b.suf);
const fmt = (b: Beat, v: number) => {
  const dec = (String(b.num ?? '').split('.')[1] ?? '').length;
  return (b.pre ?? '') + (isYear(b) ? String(Math.round(v)) : v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })) + (b.suf ?? '');
};
const numAt = (b: Beat, t: number, at: number, dur = 0.9) => lerp(b.from ?? 0, b.num ?? 0, eo(seg(t, at, at + dur)));
const crashed = (b: Beat, t: number) => b.kind === 'crash' && t >= (b.hit ?? 0);
const items = (b: Beat) => b.items ?? [b.sub ?? b.title];
const tc = (b: Beat, acc: string) => (b.tone === 'up' ? acc : RED);
const lead = (b: Beat, co: string) => (b.sub?.endsWith('…') ? b.sub : `${co}…`);
const after = (b: Beat) => (b.sub?.endsWith('…') ? '' : b.sub ?? '');
const center: React.CSSProperties = { position: 'absolute', left: 70, right: 70, textAlign: 'center' };

/** The camera Sasson built, drawn as a friendly product shot. */
export const CamArt: React.FC<{ size: number; t: number; flash?: number }> = ({ size, t }) => <Prop kind={useSpec().prop} size={size} t={t} style={{ transform: `rotate(${3 * Math.sin(t * 1.3)}deg)` }} />;

/** Beat content laid out in a box: number, product, list, quote, compare or headline. Used inside search results, the island, cards. */
export const Answer: React.FC<{ b: Beat; t: number; at: number; w: number; dark?: boolean; big?: number }> = ({ b, t, at, w, dark, big = 220 }) => {
  const { theme: c, head } = useSpec(); const fg = dark ? '#fff' : c.fg, mute = dark ? 'rgba(255,255,255,.6)' : c.mute;
  const pin = (i: number) => ({ opacity: eo(seg(t, at + i * 0.08, at + i * 0.08 + 0.3)), transform: `translateY(${(1 - eo(seg(t, at + i * 0.08, at + i * 0.08 + 0.4))) * 40}px)` });
  if (b.kind === 'crash' && (crashed(b, t) || b.num === undefined)) {
    const p = spr(t, Math.max(at, b.hit ?? 0), 380, 13), col = tc(b, c.acc);
    return <div style={{ width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {crashed(b, t) ? <div style={{ ...headStyle(head, fit(head, b.title, w, big)), color: col, transform: `scale(${2 - p})`, textAlign: 'center' }}>{b.title}</div>
        : <CamArt size={Math.min(320, w * 0.5)} t={t} />}
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 44, color: mute, textAlign: 'center', ...pin(1) }}>{crashed(b, t) ? after(b) : useSpec().co}</div></div>;
  }
  if (b.num !== undefined && (b.kind === 'num' || b.kind === 'year' || b.kind === 'crash')) {
    const cr = crashed(b, t), txt = fmt(b, numAt(b, t, at, b.kind === 'crash' ? Math.max(0.3, (b.hit ?? 1) - at) : 0.9));
    return <div style={{ width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
      {b.title !== txt && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 46, color: fg, ...pin(0) }}>{b.title}</div>}
      <div style={{ ...headStyle(head, Math.min(big, fit(head, fmt(b, b.num), w, big))), color: fg, fontVariantNumeric: 'tabular-nums', ...pin(0) }}>{txt}</div>
      {b.sub && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 42, color: mute, ...pin(1) }}>{b.sub}</div>}
    </div>;
  }
  if (b.kind === 'product') return <div style={{ width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
    <div style={{ ...pin(0), transform: `scale(${0.6 + 0.4 * spr(t, at, 160, 12)})` }}><CamArt size={Math.min(380, w * 0.6)} t={t} flash={seg(t, at + 0.6, at + 1.0)} /></div>
    <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 60, color: fg, letterSpacing: '-0.03em', ...pin(1) }}>{b.sub}</div>
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>{(b.items ?? []).map((s, i) => <span key={i} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 36, color: fg, padding: '10px 22px', borderRadius: 40, background: alpha(c.acc, 0.18), border: `2px solid ${alpha(c.acc, 0.5)}`, ...pin(2 + i) }}>{s}</span>)}</div>
  </div>;
  if (b.kind === 'compare') return <div style={{ width: w, display: 'flex', gap: 24 }}>{[[b.items?.[0], b.a, c.acc2], [b.items?.[1], b.b, c.acc]].map(([n, s, col], i) =>
    <div key={i} style={{ flex: 1, padding: 28, borderRadius: 32, background: alpha(col as string, 0.14), border: `2px solid ${alpha(col as string, 0.5)}`, ...pin(i) }}>
      <div style={{ ...headStyle(head, 70), color: fg }}>{n}</div><div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 36, color: mute, marginTop: 12 }}>{s}</div></div>)}</div>;
  if (b.kind === 'list') return <div style={{ width: w, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 56, color: fg, letterSpacing: '-0.03em', ...pin(0) }}>{b.title}</div>
    {items(b).map((s, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, ...pin(i + 1) }}>
      <div style={{ width: 54, height: 54, borderRadius: 27, background: c.acc, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${spr(t, at + 0.15 + i * 0.12, 300, 12)})` }}>
        <svg width="30" height="30" viewBox="0 0 30 30"><path d="M6 15 L12 21 L24 8" stroke={c.dark ? '#000' : '#fff'} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - eo(seg(t, at + 0.25 + i * 0.12, at + 0.5 + i * 0.12))} /></svg></div>
      <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 46, color: fg }}>{s}</span></div>)}
  </div>;
  const sz = Math.min(130, fit(head, b.title, w, 130), Math.sqrt((w * 520) / (0.55 * b.title.length)));
  return <div style={{ width: w, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
    <div style={{ ...headStyle(head, sz), color: fg, ...pin(0) }}><Hl text={b.title} hl={b.hl} t={t} at={at + 0.35} /></div>
    {b.sub && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 42, color: mute, ...pin(1) }}>{b.sub}</div>}
  </div>;
};

const Magnifier: React.FC<{ c: string; s?: number }> = ({ c, s = 54 }) => <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" stroke={c} strokeWidth="2.6" fill="none" /><path d="M15.5 15.5 L21 21" stroke={c} strokeWidth="2.6" strokeLinecap="round" /></svg>;

/** Search bar: circle morphs into a pill, camera dollies in and rides the caret, Enter pulls back and results fly in. */
export const SearchBar: React.FC<{ q: string; t: number; t0: number; t1: number; dark: boolean; children?: (enter: number, y: number) => React.ReactNode; y0?: number; y1?: number }> = ({ q, t, t0, t1, children, y0 = 885, y1 = 330 }) => {
  const { theme: c, bpm } = useSpec();
  const bw = 920, bh = 150, fs = 56, cps = q.length / Math.max(0.25, t1 - t0);
  const n = Math.floor(cl((t - t0) * cps, 0, q.length)), enter = t1 + 0.12, up = spr(t, enter, 110, 19);
  const w = lerp(bh, bw, eo(seg(t, 0.02, 0.4))), x = 540 - w / 2, y = lerp(y0, y1, up);
  const caretX = x + 118 + measure(q.slice(0, n), `500 ${fs}px Inter`);
  const Z = lerp(lerp(1.35, 2.25, eo(seg(t, 0, t0 + 0.4))), 1, up) * (1 + 0.012 * beatK(t, bpm));
  const fx = lerp(Math.max(330, caretX - 60), 540, up), fy = lerp(y0 + bh / 2, 960, up);
  const press = 1 - 0.05 * Math.sin(Math.PI * seg(t, enter, enter + 0.2));
  const panel = c.dark ? '#1C1C1F' : '#FFFFFF', ink = c.dark ? '#F5F5F7' : '#1D1D1F';
  return <AbsoluteFill style={{ transformOrigin: '0 0', transform: `perspective(1800px) translate(540px, 960px) scale(${Z}) rotateX(${(1 - up) * 6}deg) translate(${-fx}px, ${-fy}px)` }}>
    <GlowRing x={x} y={y} w={w} h={bh} r={bh / 2} t={t} o={lerp(1, 0.35, up)} />
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: bh, borderRadius: bh / 2, background: panel, transform: `scale(${press})`, overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', paddingLeft: 44 }}>
      <Magnifier c={c.mute} />
      <span style={{ marginLeft: 22, fontFamily: BODY, fontWeight: 500, fontSize: fs, color: ink, whiteSpace: 'pre' }}>{q.slice(0, n)}</span>
      {w > bw * 0.6 && <span style={{ width: 5, height: 70, borderRadius: 3, background: c.acc, marginLeft: 3, opacity: t < enter && (n < q.length || Math.floor(t * 3.5) % 2 === 0) ? 1 : 0 }} />}
      {n === 0 && w > bw * 0.6 && <span style={{ position: 'absolute', left: 120, fontFamily: BODY, fontWeight: 500, fontSize: fs, color: c.mute, opacity: 0.6 }}>Buscar</span>}
    </div>
    {children?.(enter + 0.18, y + bh + 50)}
  </AbsoluteFill>;
};

export const Search: Sc = ({ b, t, d }) => {
  const { theme: c } = useSpec();
  const q = query(b), [t0, t1] = typing(b, d), cr = crashed(b, t);
  return <SearchBar q={q} t={t} t0={t0} t1={t1} dark={c.dark}>{(at, y) => {
    const rows = b.kind === 'list' || b.kind === 'compare' || b.kind === 'product' || b.kind === 'quote' ? [] : items(b).filter(s => s !== b.sub).slice(0, 2);
    return <>
      <Glass t={t} style={{ left: 80, top: y, width: 920, padding: '56px 40px', display: 'flex', justifyContent: 'center', opacity: eo(seg(t, at, at + 0.25)),
        transform: `translateY(${(1 - spr(t, at, 150, 17)) * 260}px) rotate(${cr && b.tone !== 'up' ? (t - (b.hit ?? 0)) * 6 : 0}deg)` }}>
        <Answer b={b} t={t} at={at + 0.1} w={840} /></Glass>
      {rows.map((s, i) => { const a = at + 0.2 + i * 0.1, fall = cr && b.tone !== 'up' ? (t - (b.hit ?? 0)) : 0;
        return <Glass key={i} t={t} r={36} style={{ left: 80, top: y + 560 + i * 170, width: 920, height: 140, display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px',
          opacity: eo(seg(t, a, a + 0.25)), transform: `translateY(${(1 - spr(t, a, 150, 17)) * 300 + 2600 * fall * fall}px) rotate(${fall * (i ? -40 : 30)}deg)` }}>
          <Icon size={78} letter={s[0].toUpperCase()} i={i + 1} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 40, color: c.fg }}>{s}</span>
            <div style={{ width: 420 - i * 90, height: 14, borderRadius: 7, background: alpha(c.mute, 0.35) }} /></div></Glass>; })}
      {cr && <div style={{ ...center, top: 1180, transform: `scale(${2.2 - 1.2 * spr(t, b.hit ?? 0, 400, 13)}) rotate(-6deg)` }}>
        <span style={{ display: 'inline-block', padding: '16px 48px', borderRadius: 30, background: tc(b, c.acc), color: '#fff', fontFamily: BODY, fontWeight: 900, fontSize: Math.min(150, fit({ family: BODY, weight: 900, ls: '-0.04em' }, b.title, 860, 150)), letterSpacing: '-0.04em', boxShadow: `0 30px 80px ${alpha(tc(b, c.acc), 0.6)}` }}>{b.title}</span></div>}
    </>; }}</SearchBar>;
};

/** One word per beat, full-bleed, then the line assembles with a highlight. */
export const Kinetic: Sc = ({ b, t, d }) => {
  const { theme: c, head, co } = useSpec();
  const text = b.kind === 'crash' ? lead(b, co) : b.kind === 'num' || b.kind === 'year' ? `${fmt(b, b.num!)}` : b.title;
  const words = text.split(/\s+/).filter(Boolean), n = words.length;
  const wd = Math.min(0.2, (b.kind === 'crash' ? (b.hit ?? 1) * 0.7 : d * 0.4) / n), tB = n * wd;
  const i = Math.floor(t / wd);
  if (b.kind === 'crash' && t >= (b.hit ?? 0)) {
    const h = b.hit ?? 0, p = spr(t, h, 420, 12), k = hitK(t, h, 0.9);
    return <AbsoluteFill style={{ transform: shake(k, t, 40) }}>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>{Array.from({ length: 12 }, (_, j) => { const a = j * 0.52 + 0.2, L = 1400 * eo(seg(t, h, h + 0.35));
        return <path key={j} d={`M540 900 L${540 + Math.cos(a) * L * 0.4 + 40 * Math.sin(j * 7)} ${900 + Math.sin(a) * L * 0.4} L${540 + Math.cos(a) * L} ${900 + Math.sin(a) * L}`} stroke={b.tone === 'up' ? c.acc : c.fg} strokeOpacity={0.5} strokeWidth={b.tone === 'up' ? 10 : 4} strokeLinecap="round" fill="none" />; })}</svg>
      <div style={{ ...center, top: 960 - fit(head, b.title, 960, 330) * 0.7, ...headStyle(head, fit(head, b.title, 960, 330)), color: tc(b, c.acc), transform: `scale(${3 - 2 * p})`, textShadow: `0 0 80px ${alpha(tc(b, c.acc), 0.6)}` }}>{b.title}</div>
      <div style={{ ...center, top: 1180, fontFamily: BODY, fontWeight: 800, fontSize: 60, color: c.fg, opacity: seg(t, h + 0.4, h + 0.7) }}>{after(b)}</div>
    </AbsoluteFill>;
  }
  if (t < tB && n > 1) {
    const w = words[i] ?? '', lt = t - i * wd, mode = i % 4, size = fit(head, w, 960, 420), p = eo(lt / (wd * 0.8));
    const tr = mode === 0 ? `translateY(${(1 - p) * 110}%)` : mode === 1 ? `scale(${1.7 - 0.7 * p})` : mode === 2 ? `translateX(${(1 - p) * -60}%) skewX(${(1 - p) * 20}deg)` : `scale(${0.3 + 0.7 * spr(lt, 0, 400, 14)})`;
    return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ overflow: mode === 0 ? 'hidden' : 'visible', padding: '0 20px' }}>
        <div style={{ ...headStyle(head, size), color: w === b.hl || (b.hl ?? '').includes(w) ? c.acc : c.fg, transform: tr, whiteSpace: 'nowrap' }}>{w}</div></div></AbsoluteFill>;
  }
  const size = Math.min(230, fit(head, text, 960, 230), Math.sqrt((960 * 820) / (0.56 * text.length)));
  const ws = text.split(' '); let acc = 0;
  return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 }}>
    <div style={{ ...headStyle(head, 520), position: 'absolute', top: 120, left: -((t * 160) % 1200), whiteSpace: 'nowrap', color: 'transparent', WebkitTextStroke: `3px ${alpha(c.fg, 0.12)}` }}>{(words[0] + ' ').repeat(6)}</div>
    <div style={{ width: 960, textAlign: 'center', ...headStyle(head, size) }}>{ws.map((w, j) => {
      const a = tB + j * 0.045, p = spr(t, a, 240, 16); const hlOn = b.hl && b.hl.split(' ').includes(w.replace(/[.,]/g, '')) || (b.hl && w.includes(b.hl));
      acc += w.length;
      return <span key={j} style={{ display: 'inline-block', margin: '0 0.12em', color: hlOn ? c.acc : c.fg, opacity: cl(p * 2), transform: `translateY(${(1 - p) * 80 + 6 * Math.sin(t * 2 + j)}px) rotate(${(1 - p) * 6}deg)` }}>{w}</span>; })}</div>
    {(b.kind === 'num' || b.kind === 'year') && <div style={{ order: -1, fontFamily: BODY, fontWeight: 700, fontSize: 56, color: c.fg, opacity: seg(t, tB, tB + 0.3), maxWidth: 940, textAlign: 'center' }}>{b.title}</div>}
    {b.sub && b.kind !== 'crash' && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 48, color: c.mute, opacity: seg(t, tB + 0.35, tB + 0.6), maxWidth: 900, textAlign: 'center' }}>{b.sub}</div>}
  </AbsoluteFill>;
};

/** Rolling odometer inside a gradient ring. */
export const Counter: Sc = ({ b, t, d }) => {
  const { theme: c, head, bpm } = useSpec();
  const hit = b.hit ?? 0, dur = b.kind === 'crash' ? hit - 0.1 : Math.min(1.2, d * 0.5), v = numAt(b, t, 0.1, dur);
  const target = b.num ?? 0, cr = crashed(b, t), frac = b.suf === '%' ? v / 100 : seg(v, b.from ?? 0, target);
  const digits = fmt(b, target).length, size = fit(head, fmt(b, target), 640, 260), R = 400, C2 = 2 * Math.PI * R;
  const s = fmt(b, v), k = beatK(t, bpm);
  return <AbsoluteFill style={{ transform: cr ? shake(hitK(t, hit), t) : undefined }}>
    <div style={{ ...center, top: 230, ...headStyle(head, Math.min(110, fit(head, b.title, 940, 110))), color: c.fg, opacity: eo(seg(t, 0.05, 0.4)) }}>{b.kind === 'crash' ? b.sub : b.title === s ? '' : <Hl text={b.title} hl={b.hl} t={t} at={0.6} />}</div>
    <svg width={1080} height={1080} style={{ position: 'absolute', top: 420 }}>
      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={cr ? tc(b, c.acc) : c.acc} /><stop offset="1" stopColor={cr ? '#FF9F0A' : c.acc2} /></linearGradient></defs>
      <g transform={`rotate(${t * 20} 540 540)`}>{Array.from({ length: 72 }, (_, i) => { const a = (i / 72) * Math.PI * 2; return <line key={i} x1={540 + Math.cos(a) * 452} y1={540 + Math.sin(a) * 452} x2={540 + Math.cos(a) * (i % 6 ? 468 : 486)} y2={540 + Math.sin(a) * (i % 6 ? 468 : 486)} stroke={c.fg} strokeOpacity={0.3} strokeWidth={3} />; })}</g>
      <circle cx={540} cy={540} r={R} fill="none" stroke={alpha(c.fg, 0.1)} strokeWidth={34} />
      {(!cr || b.tone === 'up') && <circle cx={540} cy={540} r={R} fill="none" stroke="url(#rg)" strokeWidth={34 + 10 * k} strokeLinecap="round" strokeDasharray={C2} strokeDashoffset={C2 * (1 - frac)} transform="rotate(-90 540 540)" />}
      {cr && b.tone !== 'up' && Array.from({ length: 10 }, (_, i) => { const a0 = (i / 10) * Math.PI * 2, f = t - hit, dx = Math.cos(a0 + 0.3) * 900 * f, dy = Math.sin(a0 + 0.3) * 900 * f + 1800 * f * f;
        return <path key={i} d={`M${540 + Math.cos(a0) * R} ${540 + Math.sin(a0) * R} A${R} ${R} 0 0 1 ${540 + Math.cos(a0 + 0.55) * R} ${540 + Math.sin(a0 + 0.55) * R}`} stroke={RED} strokeWidth={34} fill="none" strokeLinecap="round" transform={`translate(${dx} ${dy}) rotate(${f * 200 * (i % 2 ? 1 : -1)} 540 540)`} />; })}
    </svg>
    <div style={{ position: 'absolute', top: 420 + 540 - size * 0.55, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      {s.padStart(digits, ' ').split('').map((ch, i) => <span key={i} style={{ ...headStyle(head, size), color: cr ? tc(b, c.acc) : c.fg, display: 'inline-block', fontVariantNumeric: 'tabular-nums',
        transform: `translateY(${/\d/.test(ch) && t < 0.1 + dur ? Math.sin(t * 40 + i) * 6 : 0}px) scale(${1 + 0.04 * k})` }}>{ch}</span>)}
    </div>
    <div style={{ ...center, top: 1560, fontFamily: BODY, fontWeight: 600, fontSize: 46, color: cr ? tc(b, c.acc) : c.mute, opacity: eo(seg(t, 0.5, 0.8)), ...(cr ? headStyle(head, Math.min(140, fit(head, b.title, 940, 140))) : {}) }}>{cr ? b.title : b.kind === 'crash' ? '' : b.sub}</div>
  </AbsoluteFill>;
};

/** iOS-style notifications stacking from the top. */
export const Notif: Sc = ({ b, t }) => {
  const { theme: c, head } = useSpec();
  const list = b.kind === 'text' ? [b.title, ...(b.sub ? [b.sub] : [])] : items(b);
  const apps = ['Noticias', 'Bolsa', 'Mensajes', 'Calendario'];
  return <AbsoluteFill>
    {b.kind !== 'text' && <div style={{ ...center, top: 300, ...headStyle(head, Math.min(120, fit(head, b.title, 940, 120))), color: c.fg, opacity: eo(seg(t, 0, 0.3)), transform: `translateY(${(1 - eo(seg(t, 0, 0.4))) * 40}px)` }}><Hl text={b.title} hl={b.hl} t={t} at={0.5} /></div>}
    {list.map((s, i) => {
      const a = 0.2 + i * 0.32, p = spr(t, a, 190, 18), above = list.filter((_, j) => j > i && t >= 0.2 + j * 0.32).length;
      const yy = (b.kind === 'text' ? 520 : 680) + above * 250 * spr(t, 0.2 + (i + above) * 0.32, 190, 20);
      return <Glass key={i} t={t + i} r={52} style={{ left: 60, top: yy, width: 960, padding: '30px 34px', display: 'flex', gap: 28, alignItems: 'center', opacity: cl(p * 1.5), zIndex: i,
        background: c.dark ? 'rgba(30,30,36,.96)' : 'rgba(255,255,255,.97)', filter: `brightness(${1 - above * 0.12})`,
        transform: `translateY(${(1 - p) * -420}px) scale(${1 - above * 0.04})` }}>
        <Icon size={104} letter={apps[i % 4][0]} i={i} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: BODY, fontWeight: 600, fontSize: 30, color: c.mute, textTransform: 'uppercase', letterSpacing: '0.04em' }}><span>{apps[i % 4]}</span><span>ahora</span></div>
          <div style={{ fontFamily: BODY, fontWeight: b.kind === 'text' && i === 0 ? 800 : 600, fontSize: b.kind === 'text' && i === 0 ? 58 : 46, color: c.fg, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{s}</div>
        </div></Glass>; })}
  </AbsoluteFill>;
};

/** Chat thread with typing dots. */
export const Chat: Sc = ({ b, t }) => {
  const { theme: c } = useSpec();
  const msgs = b.items ?? [b.title];
  return <AbsoluteFill>
    <Glass t={t} r={60} style={{ left: 190, top: 210, width: 700, height: 120, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px', opacity: eo(seg(t, 0, 0.3)) }}>
      <Icon size={78} letter={(b.who ?? useSpec().co)[0]} /><div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, color: c.fg }}>{b.who ?? useSpec().co}</span>
        <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 28, color: c.mute }}>{t < 0.2 + (msgs.length - 1) * 0.7 ? 'escribiendo…' : 'en línea'}</span></div></Glass>
    {msgs.map((m, i) => {
      const a = 0.35 + i * 0.7, right = i % 2 === 0, p = spr(t, a, 260, 18), typing = t >= a - 0.4 && t < a;
      const y = 470 + msgs.slice(0, i).reduce((s, x) => s + 120 + Math.ceil(x.length / 24) * 66, 0);
      return <React.Fragment key={i}>
        {typing && <div style={{ position: 'absolute', top: y, [right ? 'right' : 'left']: 70, padding: '30px 38px', borderRadius: 44, background: right ? c.acc : alpha(c.fg, 0.12), display: 'flex', gap: 12 }}>
          {[0, 1, 2].map(j => <div key={j} style={{ width: 20, height: 20, borderRadius: 10, background: right ? '#fff' : c.fg, opacity: 0.4 + 0.6 * Math.max(0, Math.sin(t * 12 - j)) }} />)}</div>}
        {t >= a && <div style={{ position: 'absolute', top: y, [right ? 'right' : 'left']: 70, maxWidth: 800, padding: '28px 40px', borderRadius: 48, [right ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 12,
          background: right ? c.acc : (c.dark ? '#2C2C30' : '#E9E9EE'), color: right ? (c.acc === '#FFFC00' || c.acc === '#FFE600' || c.acc === '#FFD60A' ? '#111' : '#fff') : c.fg, fontFamily: BODY, fontWeight: 600, fontSize: 54, lineHeight: 1.18,
          transformOrigin: right ? 'bottom right' : 'bottom left', transform: `scale(${p})`, boxShadow: '0 20px 50px rgba(0,0,0,.25)' }}><Hl text={m} hl={b.hl} t={t} at={a + 0.3} color="#FFD60A" /></div>}
      </React.Fragment>; })}
    {b.sub && <div style={{ ...center, top: 1600, fontFamily: BODY, fontWeight: 600, fontSize: 40, color: c.mute, opacity: seg(t, 0.6 + msgs.length * 0.7, 0.9 + msgs.length * 0.7) }}>{b.sub}</div>}
  </AbsoluteFill>;
};

/** Line chart drawing itself (curvy), with a glowing head; crash beats fall off a cliff on the hit. */
export const Chart: Sc = ({ b, t, d }) => {
  const { theme: c, head, co } = useSpec();
  const crash = b.kind === 'crash', up = b.tone === 'up', hit = b.hit ?? 0, N = 36, r = rng((b.num ?? 7) * 13);
  const ys = Array.from({ length: N }, (_, i) => { const x = i / (N - 1); const base = crash ? (up ? (x < 0.62 ? 0.12 + 0.1 * x : 0.18 + 0.8 * Math.pow((x - 0.62) / 0.38, 1.6)) : x < 0.62 ? 0.15 + 0.8 * Math.pow(x / 0.62, 1.4) : 0.95 - 0.92 * Math.pow((x - 0.62) / 0.38, 0.7)) : 0.12 + 0.82 * Math.pow(x, 1.6);
    return cl(base + (r() - 0.5) * 0.07, 0.02, 1); });
  const p = crash ? (t < hit ? 0.62 * eo(seg(t, 0.1, hit)) : 0.62 + 0.38 * eo(seg(t, hit, hit + 0.55))) : eio(seg(t, 0.15, Math.min(1.5, d * 0.7)));
  const X = (i: number) => 90 + (i / (N - 1)) * 900, Y = (v: number) => 1420 - v * 640;
  let path = `M${X(0)} ${Y(ys[0])}`;
  for (let i = 1; i < N; i++) { const mx = (X(i - 1) + X(i)) / 2; path += ` C${mx} ${Y(ys[i - 1])} ${mx} ${Y(ys[i])} ${X(i)} ${Y(ys[i])}`; }
  const fi = p * (N - 1), i0 = Math.floor(fi), hv = lerp(ys[i0], ys[Math.min(N - 1, i0 + 1)], fi - i0), hx = X(fi), hy = Y(hv);
  const col = crash && t >= hit ? tc(b, c.acc) : c.acc;
  const label = b.num !== undefined ? fmt(b, crash ? lerp(b.from ?? 1975, b.num, p) : (b.from ?? 0) + (b.num - (b.from ?? 0)) * (p >= 0.999 ? 1 : hv / ys[N - 1] * p)) : '';
  return <AbsoluteFill style={{ transform: crash ? shake(hitK(t, hit), t) : undefined }}>
    <div style={{ ...center, top: 250, ...headStyle(head, Math.min(120, fit(head, crash ? co : b.title, 940, 120))), color: c.fg }}>{crash ? co : <Hl text={b.title} hl={b.hl} t={t} at={0.5} />}</div>
    {!crash && b.sub && <div style={{ ...center, top: 420, fontFamily: BODY, fontWeight: 600, fontSize: 44, color: c.mute }}>{b.sub}</div>}
    <svg width={1080} height={1920} style={{ position: 'absolute' }}>
      <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity={0.45} /><stop offset="1" stopColor={col} stopOpacity={0} /></linearGradient>
        <clipPath id="cp"><rect x={0} y={0} width={hx} height={1920} /></clipPath></defs>
      {[0, 1, 2, 3, 4].map(i => <line key={i} x1={90} x2={990} y1={Y(i / 4)} y2={Y(i / 4)} stroke={alpha(c.fg, 0.1)} strokeWidth={2} strokeDasharray="8 12" />)}
      <path d={`${path} L${X(N - 1)} ${Y(0)} L${X(0)} ${Y(0)} Z`} fill="url(#ar)" clipPath="url(#cp)" />
      <path d={path} stroke={col} strokeWidth={12} fill="none" strokeLinecap="round" clipPath="url(#cp)" />
      <circle cx={hx} cy={hy} r={18 + 30 * ((t * 1.5) % 1)} fill={col} opacity={0.4 * (1 - ((t * 1.5) % 1))} />
      <circle cx={hx} cy={hy} r={18} fill="#fff" stroke={col} strokeWidth={8} />
    </svg>
    {label && <div style={{ position: 'absolute', left: cl(hx - 170, 40, 700), top: hy - 170, width: 340, textAlign: 'center' }}>
      <span style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 24, background: col, color: '#fff', fontFamily: BODY, fontWeight: 800, fontSize: 52, fontVariantNumeric: 'tabular-nums' }}>{label}</span></div>}
    {crash && t >= hit && <div style={{ ...center, top: 1500, transform: `scale(${2 - spr(t, hit, 400, 13)})` }}><span style={{ ...headStyle(head, Math.min(170, fit(head, b.title, 940, 170))), color: col }}>{b.title}</span></div>}
  </AbsoluteFill>;
};

/** Apple product-page spec sheet. */
export const Spec: Sc = ({ b, t }) => {
  const { theme: c, head, co } = useSpec();
  const its = b.items ?? [], numeric = its.every(s => /^[\d$]/.test(s));
  return <AbsoluteFill>
    <div style={{ ...center, top: 230, fontFamily: BODY, fontWeight: 600, fontSize: 42, color: c.acc, opacity: eo(seg(t, 0, 0.3)) }}>{b.kind === 'product' ? `${co} · ${b.title}` : b.sub ?? co}</div>
    <div style={{ ...center, top: 300, ...headStyle(head, Math.min(130, fit(head, b.kind === 'product' ? b.sub ?? b.title : b.title, 940, 130))), color: c.fg, transform: `translateY(${(1 - eo(seg(t, 0.05, 0.5))) * 60}px)`, opacity: eo(seg(t, 0.05, 0.35)) }}>
      {b.kind === 'product' ? b.sub : <Hl text={b.title} hl={b.hl} t={t} at={0.6} />}</div>
    <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * spr(t, 0.15, 120, 13)}) translateY(${Math.sin(t * 1.6) * 16}px)` }}>
      <CamArt size={560} t={t} flash={seg(t, 1.0, 1.4)} /></div>
    <div style={{ position: 'absolute', top: 1180, left: 60, right: 60, display: 'flex', flexDirection: numeric ? 'row' : 'column', gap: numeric ? 0 : 20, justifyContent: 'space-between' }}>
      {its.map((s, i) => { const a = 0.4 + i * 0.14, m = s.match(/^([$]?[\d.,]+(?:\s?×\s?[\d.,]+)?)\s*(.*)$/);
        const p = eo(seg(t, a, a + 0.45));
        if (!numeric || !m) return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: p, transform: `translateX(${(1 - p) * 80}px)` }}><Icon size={80} letter={s[0]} i={i} /><span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 56, color: c.fg }}>{s}</span></div>;
        const val = parseFloat(m[1].replace(',', '')), shown = /×/.test(m[1]) ? m[1] : (val * eo(seg(t, a, a + 0.8))).toFixed(m[1].includes('.') ? m[1].split('.')[1].length : 0);
        return <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: i ? `2px solid ${alpha(c.fg, 0.15)}` : 'none', opacity: p, transform: `translateY(${(1 - p) * 60}px)` }}>
          <div style={{ ...headStyle(head, 104), color: c.fg, fontVariantNumeric: 'tabular-nums' }}>{shown}</div>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 32, color: c.mute, marginTop: 10 }}>{m[2]}</div></div>; })}
    </div>
  </AbsoluteFill>;
};

/** Curved year dial rolling to the target year. */
export const Dial: Sc = ({ b, t, d }) => {
  const { theme: c, head, bpm } = useSpec();
  const target = b.num ?? 2012, from = b.from ?? target - 40, hit = b.hit ?? 0;
  const v = lerp(from, target, eio(seg(t, 0.1, b.kind === 'crash' ? hit : Math.min(1.5, d * 0.6)))), cr = crashed(b, t);
  const R = 1250, cy = 1020 + R, deg = 1.6, k = beatK(t, bpm);
  return <AbsoluteFill style={{ transform: cr ? shake(hitK(t, hit), t) : undefined }}>
    <div style={{ ...center, top: 240, fontFamily: BODY, fontWeight: 700, fontSize: 46, color: c.mute, opacity: eo(seg(t, 0, 0.3)) }}>{b.kind === 'crash' ? b.sub : b.title}</div>
    <div style={{ ...center, top: 340, ...headStyle(head, 300), color: cr ? tc(b, c.acc) : c.fg, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.03 * k})` }}>{Math.round(v)}</div>
    <div style={{ ...center, top: 700, fontFamily: BODY, fontWeight: 700, fontSize: cr ? 90 : 50, color: cr ? tc(b, c.acc) : c.fg, opacity: eo(seg(t, 0.6, 0.9)) || (cr ? 1 : 0) }}>{cr ? b.title : b.kind === 'crash' ? '' : b.sub}</div>
    <svg width={1080} height={1920} style={{ position: 'absolute' }}>
      <defs><linearGradient id="dl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={cr ? tc(b, c.acc) : c.acc} stopOpacity={0.35} /><stop offset="1" stopColor={c.bg} stopOpacity={0} /></linearGradient></defs>
      <circle cx={540} cy={cy} r={R} fill="url(#dl)" stroke={alpha(c.fg, 0.25)} strokeWidth={3} />
      <g transform={`rotate(${-(v - from) * deg} 540 ${cy})`}>{Array.from({ length: Math.ceil(target - from) + 30 }, (_, i) => {
        const y = Math.floor(from) - 15 + i, a = ((y - from) * deg - 90) * Math.PI / 180, big = y % 10 === 0, mid = y % 5 === 0, near = Math.max(0, 1 - Math.abs(y - v) / 6);
        return <g key={y}>
          <line x1={540 + Math.cos(a) * R} y1={cy + Math.sin(a) * R} x2={540 + Math.cos(a) * (R - (big ? 90 : mid ? 60 : 36))} y2={cy + Math.sin(a) * (R - (big ? 90 : mid ? 60 : 36))} stroke={near > 0.5 ? (cr ? tc(b, c.acc) : c.acc) : c.fg} strokeOpacity={0.35 + 0.65 * near} strokeWidth={big ? 7 : 4} />
          {(mid || near > 0.9) && <text x={540 + Math.cos(a) * (R - 150)} y={cy + Math.sin(a) * (R - 150) + 16} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={big ? 46 : 34} fill={c.fg} fillOpacity={0.4 + 0.6 * near}
            transform={`rotate(${(y - from) * deg} ${540 + Math.cos(a) * (R - 150)} ${cy + Math.sin(a) * (R - 150)})`}>{y}</text>}
        </g>; })}</g>
      <path d={`M540 ${1020 - 20} l-30 -50 h60 z`} fill={cr ? tc(b, c.acc) : c.acc} />
      <line x1={540} y1={1000} x2={540} y2={1160} stroke={cr ? tc(b, c.acc) : c.acc} strokeWidth={8} strokeLinecap="round" />
    </svg>
  </AbsoluteFill>;
};

/** Two halves, a spinning VS, winner/loser tags. */
export const Split: Sc = ({ b, t }) => {
  const { theme: c, head } = useSpec();
  const [L, Rr] = b.items ?? ['Antes', 'Después'], pa = spr(t, 0.05, 150, 18), pb = spr(t, 0.2, 150, 18), vs = spr(t, 0.5, 200, 11), tag = spr(t, 1.0, 260, 13);
  const half = (top: boolean, p: number, name: string, det: string | undefined, col: string, mark: string) => (
    <div style={{ position: 'absolute', left: 0, right: 0, top: top ? 0 : 960, height: 960, transform: `translateX(${(1 - p) * (top ? -1100 : 1100)}px)`,
      clipPath: top ? 'polygon(0 0, 100% 0, 100% 88%, 0 100%)' : 'polygon(0 12%, 100% 0, 100% 100%, 0 100%)', background: top ? `linear-gradient(160deg, ${alpha(col, 0.35)}, ${alpha(c.bg2, 0.9)})` : `linear-gradient(200deg, ${alpha(col, 0.35)}, ${alpha(c.bg2, 0.9)})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, paddingTop: top ? 60 : 140 }}>
      <div style={{ ...headStyle(head, Math.min(200, fit(head, name, 900, 200))), color: c.fg, transform: `translateY(${Math.sin(t * 1.5 + (top ? 0 : 2)) * 10}px)` }}>{name}</div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 50, color: c.fg, opacity: 0.8 }}>{det}</div>
      <div style={{ width: 160 * tag, height: 10, borderRadius: 5, background: col }} />
    </div>);
  return <AbsoluteFill>
    {half(true, pa, L, b.a, c.acc2, '')}{half(false, pb, Rr, b.b, c.acc, '')}
    <div style={{ position: 'absolute', left: 540 - 110, top: 960 - 110, width: 220, height: 220, borderRadius: 110, background: c.fg, color: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: BODY, fontWeight: 900, fontSize: 80, transform: `scale(${vs}) rotate(${(1 - vs) * 360 + 6 * Math.sin(t * 3)}deg)`, boxShadow: `0 0 80px ${alpha(c.acc, 0.6)}` }}>VS</div>
    <div style={{ ...center, top: 120, fontFamily: BODY, fontWeight: 800, fontSize: 44, color: c.fg, opacity: seg(t, 0.6, 0.9) }}>{b.title}</div>
  </AbsoluteFill>;
};

/** Pixel tiles cover the screen, then dissolve to reveal the line (the first digital photo was 100×100 px). */
export const Pixel: Sc = ({ b, t, d }) => {
  const { theme: c, head } = useSpec();
  const r = rng(b.title.length * 31 + 5), cols = 9, rows = 16, sz = 120;
  const txt = b.num !== undefined ? fmt(b, numAt(b, t, 0.5, 0.8)) : b.title;
  const size = Math.min(260, fit(head, b.num !== undefined ? fmt(b, b.num) : txt, 940, 260), Math.sqrt((940 * 700) / (0.55 * txt.length)));
  return <AbsoluteFill>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36, padding: '0 70px', textAlign: 'center' }}>
      {b.num !== undefined && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 56, color: c.fg }}>{b.title}</div>}
      <div style={{ ...headStyle(head, size), color: c.fg }}>{b.num !== undefined ? txt : <Hl text={txt} hl={b.hl} t={t} at={1.0} />}</div>
      {b.sub && <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 46, color: c.mute, opacity: seg(t, 0.9, 1.2) }}>{b.sub}</div>}</AbsoluteFill>
    {Array.from({ length: cols * rows }, (_, i) => {
      const x = i % cols, y = Math.floor(i / cols), on = r() * 0.35, off = 0.45 + r() * 0.55 + Math.hypot(x - 4, y - 8) * 0.02, col = [c.acc, c.acc2, c.fg, c.bg2][Math.floor(r() * 4)];
      const p = Math.min(spr(t, on, 300, 20), 1 - eo(seg(t, off, off + 0.15)));
      const ripple = 0.5 + 0.5 * Math.sin(t * 6 - Math.hypot(x - 4, y - 8) * 0.8);
      return p > 0.01 ? <div key={i} style={{ position: 'absolute', left: x * sz, top: y * sz, width: sz, height: sz, background: col, opacity: (0.75 + 0.25 * ripple), transform: `scale(${p * 0.94})`, borderRadius: 14 }} /> : null; })}
    {Array.from({ length: 14 }, (_, i) => { const y0 = (i * 137 + t * 300) % 1920; return <div key={'s' + i} style={{ position: 'absolute', left: (i * 211) % 1000, top: y0, width: 40, height: 40, borderRadius: 8, background: c.acc, opacity: 0.18 * seg(t, 1, 1.3) }} />; })}
  </AbsoluteFill>;
};

/** Dynamic-Island pill that blooms into a live activity, headline underneath. */
export const Island: Sc = ({ b, t }) => {
  const { theme: c, head } = useSpec();
  const p = spr(t, 0.12, 160, 17), w = lerp(250, 980, p), h = lerp(76, 330, p);
  const txt = b.kind === 'num' || b.kind === 'year' ? fmt(b, b.num!) : b.title;
  return <AbsoluteFill>
    <GlowRing x={540 - w / 2} y={90} w={w} h={h} r={h / 2.4} t={t} o={0.5 * p} />
    <div style={{ position: 'absolute', left: 540 - w / 2, top: 90, width: w, height: h, borderRadius: h / 2.4, background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 28, padding: `0 ${lerp(20, 48, p)}px` }}>
      {p > 0.5 && <>
        <div style={{ opacity: seg(p, 0.6, 1) }}><Icon size={130} letter={(b.who ?? b.title)[0].toUpperCase()} /></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, opacity: seg(p, 0.7, 1) }}>
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 32, color: 'rgba(255,255,255,.6)' }}>{useSpec().co}</span>
          <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 52, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.02em' }}>{txt.length > 34 ? txt.slice(0, 32) + '…' : txt}</span>
          <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,.15)' }}><div style={{ height: 12, borderRadius: 6, width: `${100 * eo(seg(t, 0.5, 1.8))}%`, background: `linear-gradient(90deg, ${c.acc}, ${c.acc2})` }} /></div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: seg(p, 0.7, 1) }}>{Array.from({ length: 5 }, (_, i) => <div key={i} style={{ width: 9, borderRadius: 5, height: 20 + 46 * Math.abs(Math.sin(t * 9 + i * 1.3)), background: c.acc }} />)}</div>
      </>}
    </div>
    <div style={{ position: 'absolute', left: 60, right: 60, top: 600, display: 'flex', justifyContent: 'center' }}><Answer b={b} t={t} at={0.45} w={960} big={260} /></div>
  </AbsoluteFill>;
};

/** Big serif quote, words land one by one, marker sweeps the key phrase. */
export const Quote: Sc = ({ b, t }) => {
  const { theme: c, head } = useSpec();
  const text = b.title.replace(/[“”"]/g, ''), ws = text.split(' '), size = Math.min(130, Math.sqrt((940 * 760) / (0.55 * text.length)), fit(head, text, 940, 130));
  const done = 0.3 + ws.length * 0.08;
  return <AbsoluteFill>
    <div style={{ position: 'absolute', left: 50 + (1 - eo(seg(t, 0, 0.4))) * -200, top: 160, fontFamily: 'DM Serif Display', fontSize: 560, lineHeight: 1, color: c.acc, opacity: 0.9, transform: `rotate(${4 * Math.sin(t)}deg)` }}>“</div>
    <div style={{ position: 'absolute', left: 70, right: 70, top: 640, ...headStyle(head, size), lineHeight: 1.08, color: c.fg }}>{ws.map((w, i) => {
      const a = 0.3 + i * 0.08, p = eo(seg(t, a, a + 0.3)), hl = b.hl && b.hl.includes(w.replace(/[.,…]/g, ''));
      return <span key={i} style={{ display: 'inline-block', marginRight: '0.25em', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, position: 'relative', isolation: 'isolate' }}>
        {hl && <span style={{ position: 'absolute', left: -6, right: -6, bottom: '0.05em', height: '0.42em', background: alpha(c.acc, 0.6), zIndex: -1, transformOrigin: 'left', transform: `scaleX(${eo(seg(t, done, done + 0.3))})` }} />}{w}</span>; })}</div>
    <div style={{ position: 'absolute', left: 70, top: 1480, display: 'flex', alignItems: 'center', gap: 24, opacity: seg(t, done, done + 0.3) }}>
      <div style={{ width: 120 * eo(seg(t, done, done + 0.5)), height: 5, background: c.acc }} />
      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 44, color: c.mute }}>{b.sub ?? b.who ?? ''}</span></div>
  </AbsoluteFill>;
};

/** A fanned deck of cards; the top one swipes away to reveal the next. */
export const Deck: Sc = ({ b, t, d }) => {
  const { theme: c, head } = useSpec();
  const cards = b.kind === 'compare' ? [`${b.items?.[0]}: ${b.a}`, `${b.items?.[1]}: ${b.b}`] : b.kind === 'product' ? [b.title, ...(b.items ?? [])] : b.kind === 'text' ? [b.title, ...(b.sub ? [b.sub] : [])] : items(b);
  const gap = Math.min(0.55, (d - 0.9) / Math.max(1, cards.length - 1));
  return <AbsoluteFill>
    {b.kind !== 'text' && b.kind !== 'product' && <div style={{ ...center, top: 230, ...headStyle(head, Math.min(110, fit(head, b.title, 940, 110))), color: c.fg, opacity: eo(seg(t, 0, 0.3)) }}>{b.title}</div>}
    {cards.map((s, i) => i).reverse().map(i => {
      const inP = spr(t, 0.05 + i * 0.07, 170, 17), out = i < cards.length - 1 ? eio(seg(t, 0.6 + i * gap, 0.6 + i * gap + 0.35)) : 0, depth = Math.max(0, i - Math.max(0, (t - 0.6) / gap));
      const rot = (i % 2 ? 1 : -1) * depth * 4 + out * 28, size = Math.min(120, fit(head, cards[i], 700, 120), Math.sqrt((700 * 600) / (0.55 * cards[i].length)));
      return <Glass key={i} t={t + i * 0.3} r={64} style={{ left: 130, top: 520, width: 820, height: 980, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: i === 0 ? `linear-gradient(160deg, ${c.acc}, ${c.acc2})` : undefined, opacity: inP * (1 - out),
        transform: `translateY(${(1 - inP) * 900 - depth * 34}px) translateX(${out * 1100}px) rotate(${rot}deg) scale(${1 - depth * 0.05})` }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 40, color: i === 0 ? '#fff' : c.mute }}>{String(i + 1).padStart(2, '0')}</span>
        <span style={{ ...headStyle(head, size), color: i === 0 ? '#fff' : c.fg }}>{cards[i]}</span>
        <div style={{ height: 10, width: 200, borderRadius: 5, background: i === 0 ? 'rgba(255,255,255,.6)' : c.acc }} />
      </Glass>; })}
  </AbsoluteFill>;
};

/** Rows of giant marquee type racing in opposite directions behind a glass card. */
export const Ticker: Sc = ({ b, t }) => {
  const { theme: c, head, bpm } = useSpec();
  const word = (b.kind === 'num' || b.kind === 'year' ? fmt(b, b.num!) : (b.hl ?? b.title.split(' ').slice(-1)[0])).replace(/[“”".…,]/g, '') + ' • ';
  const pc = spr(t, 0.3, 170, 14), k = beatK(t, bpm);
  return <AbsoluteFill>
    {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ position: 'absolute', top: 40 + i * 380, left: 0, whiteSpace: 'nowrap', ...headStyle(head, 330), textTransform: 'uppercase',
      transform: `translateX(${(i % 2 ? -1 : 1) * ((t * 520 + i * 300) % 2400) - (i % 2 ? 0 : 2400)}px) rotate(-4deg)`,
      color: i % 2 ? 'transparent' : alpha(c.acc, 0.85), WebkitTextStroke: i % 2 ? `4px ${alpha(c.fg, 0.4)}` : undefined }}>{word.repeat(10)}</div>)}
    <Glass t={t} r={60} style={{ left: 80, top: 640, width: 920, padding: '64px 50px', display: 'flex', justifyContent: 'center', transform: `scale(${pc * (1 + 0.02 * k)}) rotate(${(1 - pc) * -10 + Math.sin(t * 2) * 1.2}deg)`,
      background: c.dark ? 'rgba(18,18,22,.86)' : 'rgba(255,255,255,.94)' }}><Answer b={b} t={t} at={0.45} w={820} big={230} /></Glass>
  </AbsoluteFill>;
};

/** Split-flap board rolling through the years. */
export const Flip: Sc = ({ b, t, d }) => {
  const { theme: c, head, co } = useSpec();
  const hit = b.hit ?? 0, target = b.num ?? 2012, from = b.from ?? target - 37, cr = crashed(b, t);
  const v = lerp(from, target, eio(seg(t, 0.1, b.kind === 'crash' ? hit : Math.min(1.4, d * 0.55))));
  const s = String(Math.round(v)).padStart(4, '0'), frac = (v * 3) % 1;
  return <AbsoluteFill style={{ transform: cr ? shake(hitK(t, hit), t) : undefined }}>
    <div style={{ ...center, top: 300, ...headStyle(head, Math.min(110, fit(head, b.kind === 'crash' ? lead(b, co) : b.title, 940, 110))), color: c.fg, opacity: eo(seg(t, 0, 0.3)) }}>{b.kind === 'crash' ? lead(b, co) : b.title}</div>
    <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>{s.split('').map((ch, i) => {
      const moving = t < (b.kind === 'crash' ? hit : 1.5) && i >= 2, sq = moving ? 1 - 0.85 * Math.sin(Math.PI * ((frac + i * 0.3) % 1)) ** 8 : 1;
      return <div key={i} style={{ width: 220, height: 340, borderRadius: 26, background: cr ? tc(b, c.acc) : (c.dark ? '#1A1A1E' : '#1D1D1F'), position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.35)',
        transform: `translateY(${(1 - spr(t, i * 0.06, 200, 15)) * 400}px)` }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 250, color: '#fff', transform: `scaleY(${sq})` }}>{ch}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 168, height: 4, background: 'rgba(0,0,0,.6)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: 'rgba(255,255,255,.05)' }} /></div>; })}</div>
    <div style={{ ...center, top: 1060, fontFamily: BODY, fontWeight: 600, fontSize: 48, color: c.mute, opacity: seg(t, 0.8, 1.1) }}>{b.kind === 'crash' ? (cr ? after(b) : '') : b.sub}</div>
    {cr && <div style={{ ...center, top: 1150, transform: `scale(${2.4 - 1.4 * spr(t, hit, 400, 12)}) rotate(-8deg)` }}>
      <span style={{ display: 'inline-block', border: `14px solid ${tc(b, c.acc)}`, borderRadius: 26, padding: '6px 40px', ...headStyle(head, Math.min(190, fit(head, b.title, 820, 190))), color: tc(b, c.acc) }}>{b.title}</span></div>}
  </AbsoluteFill>;
};

/** Twist special: a lead-in line types, then the word slams in (torn glitch when it's bad news, confetti when it's good). */
export const Glitch: Sc = ({ b, t }) => {
  const { theme: c, head, co } = useSpec();
  const hit = b.hit ?? 0.8, pre = lead(b, co), col = tc(b, c.acc), up = b.tone === 'up', n = Math.round(pre.length * seg(t, 0.05, hit - 0.1));
  if (t < hit) return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.25 * t}) ${shake(seg(t, 0.2, hit) * 0.15, t, 20)}` }}>
    <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 84, color: c.fg, letterSpacing: '-0.03em' }}>{pre.slice(0, n)}<span style={{ color: col }}>▍</span></div></AbsoluteFill>;
  const k = hitK(t, hit, 1.1), sz = fit(head, b.title, 1000, 320), r = rng(Math.floor(t * 15));
  return <AbsoluteFill style={{ transform: shake(k, t, 50) }}>
    {Array.from({ length: 30 }, (_, i) => { const f = t - hit, rr = rng(i + 3); const x = 540 + (rr() - 0.5) * 1400 * f, y = up ? 960 - 2600 * f * (0.4 + rr()) + 1900 * f * f : 900 - 900 * f * rr() + 2200 * f * f;
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 24 + rr() * 40, height: 24 + rr() * 40, background: up ? [c.acc, c.acc2, c.fg][i % 3] : i % 3 ? RED : c.fg, borderRadius: up && i % 2 ? 40 : 4, transform: `rotate(${f * 400 * rr()}deg)`, opacity: 0.9 }} />; })}
    {[0, 1, 2, 3].map(i => <div key={i} style={{ ...center, top: 960 - sz * 0.55, ...headStyle(head, sz), color: col, clipPath: `inset(${i * 25}% 0 ${75 - i * 25}% 0)`,
      transform: `translateX(${(r() - 0.5) * (up ? 30 : 160) * k}px) scale(${1 + 0.6 * hitK(t, hit, 0.25)})`, textShadow: `${10 * k}px 0 #00E5FF, ${-10 * k}px 0 #FF2BD6` }}>{b.title}</div>)}
    <div style={{ ...center, top: 1300, fontFamily: BODY, fontWeight: 800, fontSize: 60, color: c.fg, opacity: seg(t, hit + 0.5, hit + 0.8) }}>{after(b)}</div>
  </AbsoluteFill>;
};

/** The object on a pedestal: orbit ring, chips riding the orbit; on a twist it cracks and falls (down) or launches (up). */
export const Hero: Sc = ({ b, t }) => {
  const { theme: c, head, co } = useSpec();
  const hit = b.kind === 'crash' ? b.hit ?? 0.8 : 99, cr = t >= hit, up = b.tone === 'up', f = Math.max(0, t - hit);
  const chips = b.kind === 'product' ? b.items ?? [] : [b.sub ?? co].filter(Boolean) as string[];
  const p = spr(t, 0.05, 140, 13), fy = cr ? (up ? -2200 * f * f : 1600 * f * f) : 0, rot = cr ? (up ? 0 : 50 * f) : 4 * Math.sin(t * 1.4);
  return <AbsoluteFill>
    <div style={{ ...center, top: 200, ...headStyle(head, Math.min(120, fit(head, b.kind === 'product' ? b.sub ?? '' : b.title, 940, 120), Math.sqrt((940 * 330) / (0.55 * (b.kind === 'product' ? b.sub ?? '' : b.title).length)))), color: cr ? tc(b, c.acc) : c.fg,
      transform: cr ? `scale(${2 - spr(t, hit, 400, 13)})` : `translateY(${(1 - eo(seg(t, 0.1, 0.5))) * 40}px)`, opacity: eo(seg(t, 0.1, 0.4)) }}>
      {b.kind === 'product' ? b.sub : b.kind === 'crash' && !cr ? lead(b, co) : <Hl text={b.title} hl={b.hl} t={t} at={0.6} />}</div>
    {b.kind === 'product' && <div style={{ ...center, top: 160, fontFamily: BODY, fontWeight: 600, fontSize: 40, color: c.acc }}>{b.title}</div>}
    <svg width={1080} height={1920} style={{ position: 'absolute' }}>
      <ellipse cx={540} cy={1240} rx={420} ry={90} fill="none" stroke={alpha(c.acc, 0.5)} strokeWidth={4} strokeDasharray="14 18" strokeDashoffset={-t * 80} />
      <ellipse cx={540} cy={1240} rx={300 * p} ry={60 * p} fill={alpha(c.acc, 0.25)} />
      {up && cr && Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <line key={i} x1={540 + Math.cos(a) * 200} y1={900 + Math.sin(a) * 200} x2={540 + Math.cos(a) * (200 + 900 * eo(f * 2))} y2={900 + Math.sin(a) * (200 + 900 * eo(f * 2))} stroke={c.acc} strokeWidth={10} strokeLinecap="round" opacity={1 - seg(f, 0.3, 0.9)} />; })}
    </svg>
    <div style={{ position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${fy + Math.sin(t * 1.8) * 14}px) rotate(${rot}deg) scale(${0.4 + 0.6 * p})` }}>
      <Prop kind={useSpec().prop} size={680} t={t} /></div>
    {!up && cr && <svg width={1080} height={1920} style={{ position: 'absolute' }}><path d="M500 560 L560 700 L520 780 L600 900 L560 1020" stroke={c.fg} strokeWidth={10} fill="none" opacity={1 - seg(f, 0.2, 0.5)} /></svg>}
    {chips.map((s, i) => { const a = t * 0.9 + (i / chips.length) * Math.PI * 2, x = 540 + Math.cos(a) * 420, y = 1240 + Math.sin(a) * 90, front = Math.sin(a) > 0;
      return <div key={i} style={{ position: 'absolute', left: x, top: y + (front ? 40 : -120), transform: `translate(-50%, -50%) scale(${(front ? 1 : 0.8) * spr(t, 0.3 + i * 0.1, 260, 14)})`, zIndex: front ? 2 : 0,
        padding: '14px 30px', borderRadius: 40, background: c.dark ? 'rgba(20,20,26,.9)' : 'rgba(255,255,255,.95)', border: `2px solid ${alpha(c.acc, 0.6)}`, fontFamily: BODY, fontWeight: 700, fontSize: 40, color: c.fg, whiteSpace: 'nowrap' }}>{s}</div>; })}
    {cr && after(b) && <div style={{ ...center, top: 1460, fontFamily: BODY, fontWeight: 700, fontSize: 52, color: c.fg, opacity: seg(f, 0.35, 0.6) }}>{after(b)}</div>}
  </AbsoluteFill>;
};

/** The classic spinning newspaper landing on screen. */
export const Paper: Sc = ({ b, t }) => {
  const { theme: c, co, head } = useSpec();
  const hit = b.kind === 'crash' ? b.hit ?? 0.8 : 0.05, p = spr(t, hit, 90, 15), year = b.num && b.num > 1800 && b.num < 2100 ? b.num : undefined;
  const headline = b.kind === 'year' ? `${b.title} ${b.sub ?? ''}` : b.kind === 'crash' ? `${co}: ${b.title}` : b.title;
  const hs = Math.min(110, Math.sqrt((820 * 380) / (0.55 * headline.length)), fit(head, headline, 820, 110));
  if (b.kind === 'crash' && t < hit) return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 80, color: c.fg, letterSpacing: '-0.03em', opacity: seg(t, 0, 0.2) }}>{lead(b, co)}</div></AbsoluteFill>;
  return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 900, height: 1200, background: '#F4EFE4', borderRadius: 8, boxShadow: '0 50px 120px rgba(0,0,0,.5)', padding: 44, display: 'flex', flexDirection: 'column', gap: 18, color: '#141414',
      transform: `scale(${0.05 + 0.95 * p}) rotate(${(1 - p) * 720 - 3}deg) translateY(${Math.sin(t * 1.2) * 8}px)` }}>
      <div style={{ fontFamily: 'DM Serif Display', fontSize: 88, textAlign: 'center', lineHeight: 1 }}>El Diario de Negocios</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '3px solid #141414', borderBottom: '1px solid #141414', padding: '8px 0', fontFamily: BODY, fontWeight: 600, fontSize: 26 }}>
        <span>{year ?? 'Edición especial'}</span><span>{co.toUpperCase()}</span><span>$1.00</span></div>
      <div style={{ fontFamily: 'Anton', fontSize: hs, lineHeight: 1.02, textTransform: 'uppercase', color: b.kind === 'crash' && b.tone !== 'up' ? '#B3121F' : '#141414' }}>{headline}</div>
      <div style={{ display: 'flex', gap: 24, flex: 1 }}>
        <div style={{ width: 430, background: '#D9D2C3', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'grayscale(1) contrast(1.2)', overflow: 'hidden' }}><Prop kind={useSpec().prop} size={380} t={t} /></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>{Array.from({ length: 16 }, (_, i) => <div key={i} style={{ height: 12, borderRadius: 3, background: '#141414', opacity: 0.18, width: `${70 + ((i * 37) % 30)}%` }} />)}</div>
      </div>
    </div></AbsoluteFill>;
};

/** Dot-matrix map: a route arcs in and a pin drops on the place. */
export const Map: Sc = ({ b, t }) => {
  const { theme: c, head } = useSpec();
  const r = rng(9), dots: [number, number][] = [];
  for (let y = 0; y < 34; y++) for (let x = 0; x < 20; x++) { const nx = x / 20, ny = y / 34, land = Math.sin(nx * 7 + 1) + Math.cos(ny * 9 + nx * 3) + r() * 0.6; if (land > 0.55) dots.push([30 + x * 52, 200 + y * 46]); }
  const px = 600, py = 1000, d = eo(seg(t, 0.2, 1.0)), pin = spr(t, 0.95, 300, 12), ring = (t * 1.2) % 1;
  return <AbsoluteFill>
    <svg width={1080} height={1920} style={{ position: 'absolute', transform: `scale(${1.15 - 0.15 * eo(seg(t, 0, 1.4))})`, transformOrigin: `${px}px ${py}px` }}>
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill={alpha(c.fg, Math.hypot(x - px, y - py) < 260 * d ? 0.55 : 0.18)} />)}
      <path d={`M-40 1700 Q ${px - 500} ${py - 600} ${px} ${py}`} stroke={c.acc} strokeWidth={8} fill="none" strokeDasharray="20 16" pathLength={1000} strokeDashoffset={1000 * (1 - d)} />
      <circle cx={px} cy={py} r={40 + 200 * ring} fill="none" stroke={c.acc} strokeWidth={6} opacity={(1 - ring) * pin} />
      <g transform={`translate(${px} ${py - 120 * (1 - pin)}) scale(${pin})`}><path d="M0 0 C-40 -60 -60 -90 -60 -120 A60 60 0 1 1 60 -120 C60 -90 40 -60 0 0 Z" fill={c.acc} /><circle cx={0} cy={-120} r={24} fill="#fff" /></g>
    </svg>
    <div style={{ ...center, top: 260, ...headStyle(head, 260), color: c.fg, fontVariantNumeric: 'tabular-nums' }}>{Math.round(lerp(b.from ?? (b.num ?? 0) - 30, b.num ?? 0, eo(seg(t, 0.1, 1.0))))}</div>
    <Glass t={t} r={40} style={{ left: 140, top: 1220, width: 800, padding: '30px 40px', opacity: seg(t, 1.1, 1.35), transform: `translateY(${(1 - eo(seg(t, 1.1, 1.5))) * 50}px)` }}>
      <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 56, color: c.fg, letterSpacing: '-0.02em' }}>{b.title}</div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 40, color: c.mute, marginTop: 6 }}>{b.sub}</div></Glass>
  </AbsoluteFill>;
};

/** A receipt printing out of a slot, total ticking up. */
export const Receipt: Sc = ({ b, t }) => {
  const { theme: c, co } = useSpec();
  const p = eo(seg(t, 0.1, 0.9)), H = 1050;
  const row = (l: string, r: string, i: number) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: seg(t, 0.3 + i * 0.1, 0.4 + i * 0.1) }}><span>{l}</span><span>{r}</span></div>;
  return <AbsoluteFill>
    <div style={{ position: 'absolute', left: 120, top: 300, width: 840, height: 60, borderRadius: 30, background: c.dark ? '#000' : '#1D1D1F', boxShadow: '0 20px 50px rgba(0,0,0,.4)' }} />
    <div style={{ position: 'absolute', left: 180, top: 330, width: 720, height: H * p, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: 0, width: 720, height: H, background: '#FBFBF8', padding: '50px 56px', display: 'flex', flexDirection: 'column', gap: 22, fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 36, color: '#1A1A1A',
        transform: `rotate(${Math.sin(t * 2) * 0.6}deg)`, clipPath: 'polygon(0 0,100% 0,100% 98%,95% 100%,90% 98%,85% 100%,80% 98%,75% 100%,70% 98%,65% 100%,60% 98%,55% 100%,50% 98%,45% 100%,40% 98%,35% 100%,30% 98%,25% 100%,20% 98%,15% 100%,10% 98%,5% 100%,0 98%)' }}>
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 48 }}>{co.toUpperCase()}</div>
        <div style={{ textAlign: 'center', opacity: 0.6 }}>* * * * * * * * * *</div>
        {row(b.title, '', 0)}{row(b.sub ?? '', '', 1)}{row('-'.repeat(26), '', 2)}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 56, marginTop: 20 }}><span>TOTAL</span><span>{fmt(b, numAt(b, t, 0.6, 1.0))}</span></div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 5, justifyContent: 'center', height: 110 }}>{Array.from({ length: 46 }, (_, i) => <div key={i} style={{ width: (i * 7) % 3 + 2, background: '#1A1A1A' }} />)}</div>
      </div></div>
  </AbsoluteFill>;
};

// ---------- closing beat: the lesson, signed with the company ----------
const Sign: React.FC<{ t: number; at: number; size?: number; dark?: boolean }> = ({ t, at, size = 120, dark }) => {
  const { theme: c, co, head } = useSpec(); const p = spr(t, at, 220, 14);
  return <div style={{ display: 'flex', alignItems: 'center', gap: 26, transform: `scale(${p})` }}>
    <Prop kind={useSpec().prop} size={size * 1.6} t={t} />
    <span style={{ ...headStyle(head, Math.min(size, fit(head, co, 600, size))), color: dark ? '#fff' : c.fg }}>{co}</span></div>;
};
export const CtaSearch: Sc = ({ b, t }) => {
  const { theme: c, head } = useSpec(); const q = query(b), [t0, t1] = typing(b, 3.8);
  return <SearchBar q={q} t={t} t0={t0} t1={t1} dark={c.dark}>{(at, y) => <>
    <Glass t={t} style={{ left: 80, top: y, width: 920, padding: '50px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, opacity: eo(seg(t, at, at + 0.25)), transform: `translateY(${(1 - spr(t, at, 150, 17)) * 300}px)` }}>
      <Sign t={t} at={at + 0.05} size={110} />
      <div style={{ ...headStyle(head, Math.min(110, fit(head, b.title, 840, 110), Math.sqrt((840 * 300) / (0.55 * b.title.length)))), color: c.fg, textAlign: 'center', opacity: eo(seg(t, at + 0.4, at + 0.7)) }}><Hl text={b.title} hl={b.hl} t={t} at={at + 0.8} /></div>
    </Glass></>}</SearchBar>;
};
export const CtaWord: Sc = ({ b, t }) => {
  const { theme: c, head } = useSpec(); const ws = b.title.split(' '), size = Math.min(200, fit(head, b.title, 960, 200), Math.sqrt((960 * 700) / (0.55 * b.title.length)));
  return <AbsoluteFill style={{ alignItems: 'center' }}>
    <div style={{ position: 'absolute', top: 360, width: 960, textAlign: 'center', ...headStyle(head, size), color: c.fg }}>{ws.map((w, i) => { const p = spr(t, 0.1 + i * 0.12, 320, 13);
      return <span key={i} style={{ display: 'inline-block', margin: '0 0.12em', transform: `scale(${p}) rotate(${(1 - p) * -12}deg)`, color: b.hl && b.hl.split(' ').some(h => w.includes(h)) ? c.acc : c.fg }}>{w}</span>; })}</div>
    <div style={{ position: 'absolute', top: 1180, transform: `translateY(${Math.sin(t * 2) * 8}px)` }}><Sign t={t} at={0.3 + ws.length * 0.12} size={130} /></div>
  </AbsoluteFill>;
};
export const CtaIsland: Sc = ({ b, t }) => {
  const { theme: c, head } = useSpec(); const p = spr(t, 0.1, 150, 16), w = lerp(250, 980, p), h = lerp(76, 420, p);
  return <AbsoluteFill>
    <GlowRing x={540 - w / 2} y={260} w={w} h={h} r={h / 2.6} t={t} o={0.7 * p} />
    <div style={{ position: 'absolute', left: 540 - w / 2, top: 260, width: w, height: h, borderRadius: h / 2.6, background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {p > 0.6 && <Sign t={t} at={0.4} size={120} dark />}</div>
    <div style={{ ...center, top: 900, ...headStyle(head, Math.min(160, fit(head, b.title, 940, 160), Math.sqrt((940 * 600) / (0.55 * b.title.length)))), color: c.fg, opacity: eo(seg(t, 0.9, 1.2)), transform: `translateY(${(1 - eo(seg(t, 0.9, 1.3))) * 60}px)` }}><Hl text={b.title} hl={b.hl} t={t} at={1.4} /></div>
  </AbsoluteFill>;
};
export const SCENES: Record<string, Sc> = { Hero, Paper, Map, Receipt, Search, Kinetic, Counter, Notif, Chat, Chart, Spec, Dial, Split, Pixel, Island, Quote, Deck, Ticker, Flip, Glitch, CtaSearch, CtaWord, CtaIsland };
