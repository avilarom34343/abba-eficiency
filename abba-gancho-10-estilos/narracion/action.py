# 15 s soundtrack for the cartoon cut: action-comedy "heist" groove at 100 BPM (one bar = 2.4 s, so the story drops
# in on bar 2), keyboard clicks under the search hook, gag sound effects on every cue, a sad trombone on "quiebra",
# and voice 03 laid at its natural pace (no time-stretch).   python3 narracion/action.py → public/audio/action.wav
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mix import SR, ROOT, decode, speech_segments
from flat import tt, hz, onepole, kick, snap, hat, pop, click, whoosh, ding, stamp, shutter, slide, impact, reverb

DUR = 15.0; N = int(DUR * SR)
BEAT = 0.6; ST = BEAT / 4; BAR = 2.4
# voice phrases (raw take, natural pace) and the story cues the video uses — keep in sync with src/cartoon/cues.ts
PH = [2.4, 4.75, 6.6, 9.61]
HIT = 10.4
rng = np.random.default_rng(11)
bus = np.zeros((2, N)); send = np.zeros((2, N))
def add(x, at, g=1.0, pan=0.0, verb=0.0):
    i0 = int(at * SR); x = x[: max(0, N - i0)]
    if i0 < 0 or not len(x): return
    gl, gr = np.cos((pan + 1) * np.pi / 4) * g, np.sin((pan + 1) * np.pi / 4) * g
    bus[0, i0:i0 + len(x)] += x * gl; bus[1, i0:i0 + len(x)] += x * gr
    send[0, i0:i0 + len(x)] += x * gl * verb; send[1, i0:i0 + len(x)] += x * gr * verb
def saw(f, t, bright, nh=16):
    return sum(np.sin(2 * np.pi * f * h * t) / h / (1 + (f * h / bright) ** 4) for h in range(1, nh + 1) if f * h < 15000)
def brass(m, d, g=1.0):
    """Punchy synth brass: detuned saws with a filter swell."""
    t = tt(d); b = 900 + 3200 * np.minimum(1, t * 14) * np.exp(-t * 3)
    x = saw(hz(m), t, b) + saw(hz(m) * 1.006, t, b)
    return x * np.minimum(1, t * 120) * np.minimum(1, (d - t) * 40) * 0.5 * g
def bass(m, d):
    t = tt(d); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.6 * saw(f, t, 700, 8)) * np.minimum(1, t * 300) * np.minimum(1, (d - t) * 60) * np.exp(-t * 3)
def tromb(m0, m1, d):
    """Sad trombone slide with vibrato."""
    t = tt(d); f = hz(m0) * (hz(m1) / hz(m0)) ** (t / d) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t * 3))
    ph = np.cumsum(f) / SR
    x = sum(np.sin(2 * np.pi * h * ph) / h ** 1.2 for h in range(1, 10))
    return onepole(x, 0.25) * np.minimum(1, t * 30) * np.minimum(1, (d - t) * 12)
K, SN, HH = kick(), snap(), hat()

# ---------- 0 – 2.4: the search hook (typing, a ticking pulse, a rising swell) ----------
for i in range(22): add(click(), 0.15 + i * 0.065 + (i % 3) * 0.01, 0.35, (-1) ** i * 0.3)       # keystrokes
add(click(), 1.62, 0.6); add(pop(520), 1.65, 0.5)                                             # enter
for b in range(4): add(HH, b * BEAT, 0.12)
t = tt(BAR - 1.4); u = t / t[-1]
add(onepole(rng.uniform(-1, 1, len(t)), 0.02 + 0.4 * u ** 2) * u ** 2, 1.4, 0.45, 0, 0.5)    # riser into the drop
add(whoosh(0.4), 2.0, 0.5)

# ---------- 2.4 – 9.6: the heist groove ----------
RIFF = [(0, 50), (3, 50), (6, 53), (8, 55), (10, 56), (11, 55), (14, 53)]        # D minor spy riff (16th steps)
ROOTS = [38, 38, 41, 36]
end = 9.6
for bar in range(1, 5):
    b0 = bar * BAR
    for s in range(16):
        tq = b0 + s * ST
        if tq >= end: break
        if s in (0, 7, 10): add(K, tq, 0.8)
        if s in (4, 12): add(SN, tq, 0.55, 0, 0.3)
        add(HH, tq, 0.1 if s % 2 else 0.16, 0.35 if s % 2 else -0.35)
        if s % 2 == 0: add(bass(ROOTS[bar - 1] + (12 if s % 4 == 2 else 0), ST * 1.8), tq, 0.4)
    for s, m in RIFF:
        tq = b0 + s * ST
        if tq < end: add(brass(m + 12, ST * 1.6), tq, 0.32, 0.2, 0.25)
    if bar >= 2:                                                                   # brass hits answer the riff
        for s in (12, 14):
            tq = b0 + s * ST
            if tq < end: [add(brass(m + 12, ST * 1.2, 0.7), tq, 0.22, -0.3, 0.3) for m in (62, 65, 69)]
# gag sound design on the story cues
CUES = [(3.4, ding(93), 0.3), (3.45, pop(900), 0.4), (4.6, whoosh(), 0.4), (5.05, ding(96), 0.25), (5.2, ding(100), 0.25),
        (6.45, whoosh(), 0.4), (6.75, click(), 0.6), (6.95, click(), 0.6), (7.15, click(), 0.6), (7.6, pop(1000), 0.5), (7.8, shutter(), 0.7),
        (8.0, whoosh(), 0.4), (8.5, stamp(), 0.55), (8.75, stamp(), 0.5), (9.0, stamp(), 0.5), (9.4, slide(), 0.6), (9.55, stamp(), 0.4)]
for at, x, g in CUES: add(x, at, g, 0, 0.15)
for k in range(8): add(click(), 5.0 + k * 0.06, 0.15)                                          # counter ticks

# ---------- 9.6 – 10.4: drop out, years flipping, riser ----------
t = tt(HIT - 9.6); u = t / t[-1]
add(onepole(rng.uniform(-1, 1, len(t)), 0.02 + 0.5 * u ** 2) * u ** 2.5, 9.6, 0.5, 0, 0.6)
for k, x in enumerate(np.cumsum([0.12, 0.1, 0.09, 0.08, 0.07, 0.06, 0.05, 0.045, 0.04])):
    if 9.62 + x < HIT - 0.02: add(click(), 9.62 + x, 0.3, 0.4 * (-1) ** k)

# ---------- 10.4: the hit, sad trombone, money flying, "les dije" ----------
add(impact(), HIT, 1.0, 0, 0.5)
for i, (a, b, d) in enumerate([(55, 54, 0.38), (54, 53, 0.38), (53, 52, 0.38), (52, 46, 1.1)]):
    add(tromb(a, b, d), HIT + 0.45 + i * 0.42, 0.42, 0, 0.35)
for i in range(6): add(pop(1200 + i * 150), HIT + 0.3 + i * 0.12, 0.18, (-1) ** i * 0.5)
# ---------- 12.9 – 15: closing search (typing) + sting ----------
for i in range(30): add(click(), 12.95 + i * 0.045, 0.3, (-1) ** i * 0.3)
for k, m in enumerate((62, 65, 69, 74)): add(brass(m, 1.0, 0.8), 14.35 + k * 0.03, 0.18, -0.4 + k * 0.27, 0.6)
add(ding(98), 14.35, 0.25, 0, 0.6)

music = bus + np.stack([reverb(send[0], 1), reverb(send[1], 2)])
music = np.tanh(music / np.abs(music[:, int(2.4 * SR):int(9.6 * SR)]).max() * 1.15) / np.tanh(1.15)

if __name__ == '__main__':
    raw = f'{ROOT}/narracion/raw/03.mp3'
    voice = np.zeros(N)
    for at, (a, b) in zip(PH, speech_segments(raw)):
        v = np.array(decode(raw, 1.0, a, b)); i0 = int(at * SR); voice[i0:i0 + len(v)] += v[: N - i0]
    env = np.sqrt(np.convolve(voice ** 2, np.ones(int(.05 * SR)) / int(.05 * SR), 'same'))
    gain = onepole(np.where(env > 0.02, 0.45, 0.9), np.full(N, 0.0015))
    out = voice * 1.1 + music * gain
    out = np.tanh(out / np.abs(out).max() * 1.25) / np.tanh(1.25) * 0.97
    with wave.open(f'{ROOT}/public/audio/action.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out.T * 32000).astype('<i2').tobytes())
    print('wrote public/audio/action.wav')
