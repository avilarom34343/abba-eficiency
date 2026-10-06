# Soundtrack for the flat (2D explainer) versions, modelled on the reference reel: a warm lo-fi bed in F# minor / A major
# at 90 BPM, a music-box hook that starts on the first frame, and UI sound design (pops, clicks, whooshes, stamps, a
# shutter) on every animation cue. Voice 03 on top.  python3 narracion/flat.py → public/audio/flat.wav
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mix import narration, SR, ROOT

DUR, HIT = 10.0, 6.68
N = int(DUR * SR); BEAT = 60 / 90; ST = BEAT / 4          # 90 BPM: beat 10 lands on the "quiebra" hit
rng = np.random.default_rng(3)
bus = np.zeros((2, N)); send = np.zeros((2, N))

def tt(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def add(x, at, g=1.0, pan=0.0, verb=0.0):
    i0 = int(at * SR); x = x[: max(0, N - i0)]
    if i0 < 0 or not len(x): return
    gl, gr = np.cos((pan + 1) * np.pi / 4) * g, np.sin((pan + 1) * np.pi / 4) * g
    bus[0, i0:i0 + len(x)] += x * gl; bus[1, i0:i0 + len(x)] += x * gr
    send[0, i0:i0 + len(x)] += x * gl * verb; send[1, i0:i0 + len(x)] += x * gr * verb
def onepole(x, a):
    y = np.empty_like(x); s = 0.0; a = np.broadcast_to(a, x.shape)
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
def noise(d): return rng.uniform(-1, 1, int(d * SR))

# ---------- instruments ----------
def rhodes(m, d=1.3):
    """FM electric piano: bell-ish attack that mellows, with a touch of tremolo."""
    t = tt(d); f = hz(m); idx = 1.6 * np.exp(-t * 5)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) + 0.15 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 8)
    return x * np.exp(-t * 2.2) * np.minimum(1, t * 300) * (1 + 0.12 * np.sin(2 * np.pi * 4.5 * t))
def musicbox(m, d=0.9):
    t = tt(d); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 9) + 0.2 * np.sin(2 * np.pi * 4.2 * f * t) * np.exp(-t * 14)) * np.exp(-t * 4.5) * np.minimum(1, t * 900)
def sub(m, d):
    t = tt(d); return np.sin(2 * np.pi * hz(m) * t) * np.minimum(1, t * 200) * np.minimum(1, (d - t) * 30) * (0.7 + 0.3 * np.exp(-t * 4))
def kick():
    t = tt(0.4); return np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-t * 28)) / SR) * np.exp(-t * 9)
def snap():
    t = tt(0.25); n = noise(0.25); return (onepole(n, 0.5) - onepole(n, 0.1)) * np.exp(-t * 28) * 1.4
def hat():
    t = tt(0.04); n = noise(0.04); return (n - onepole(n, 0.5)) * np.exp(-t * 110)
K, SN, HH = kick(), snap(), hat()

# ---------- UI sound design ----------
def pop(f0=900):
    t = tt(0.12); return np.sin(2 * np.pi * np.cumsum(f0 * (0.45 + 0.55 * np.exp(-t * 40))) / SR) * np.exp(-t * 32)
def click():
    t = tt(0.02); return noise(0.02) * np.exp(-t * 400) + np.sin(2 * np.pi * 2500 * t) * np.exp(-t * 300) * 0.5
def whoosh(d=0.35):
    t = tt(d); u = t / d; return onepole(noise(d), 0.02 + 0.35 * u ** 2) * np.sin(np.pi * u) ** 2 * 2
def ding(m=88):
    t = tt(1.0); f = hz(m); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 6)) * np.exp(-t * 3.5)
def stamp():
    t = tt(0.3); return np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-t * 40)) / SR) * np.exp(-t * 16) + onepole(noise(0.3), 0.3) * np.exp(-t * 40) * 0.8
def shutter():
    return np.concatenate([click() * 1.2, np.zeros(int(.05 * SR)), click()])
def slide(d=0.3):
    t = tt(d); return onepole(noise(d), 0.08) * np.minimum(1, t * 30) * np.exp(-t * 6) * 1.5
def impact():
    t = tt(1.6); boom = np.sin(2 * np.pi * np.cumsum(32 + 70 * np.exp(-t * 7)) / SR) * np.exp(-t * 2.4)
    crack = (noise(1.6) - onepole(noise(1.6), 0.25)) * np.exp(-t * 7)
    return boom + 0.5 * crack

# ---------- the groove ----------
CH = [[54, 57, 61, 64], [50, 54, 57, 61], [45, 52, 57, 61], [52, 56, 59, 64]]     # F#m7 · Dmaj7 · A · E
ROOT_ = [30, 26, 33, 28]
# the hook: a 2-bar music-box line in F# minor pentatonic, syncopated (16th steps, MIDI)
HOOK = [(0, 81), (3, 85), (6, 88), (8, 85), (10, 90), (14, 88), (16, 85), (19, 83), (22, 81), (24, 78), (26, 81), (30, 83)]
bars = int(HIT / (BEAT * 4)) + 1
for half in range(int(5.92 / (BEAT * 2)) + 1):               # chord every half bar (2 beats) until the drop
    t0 = half * BEAT * 2
    if t0 >= 5.92: break
    c = CH[half % 4]
    for k, m in enumerate(c): add(rhodes(m, 1.4), t0 + k * 0.012, 0.13, -0.4 + k * 0.27, 0.35)
    add(sub(ROOT_[half % 4], BEAT * 2 - 0.02), t0, 0.17)
for rep in range(2):                                         # hook from frame 0, twice (2 bars each = 5.33 s)
    for s, m in HOOK:
        tq = rep * BEAT * 8 + s * ST
        if tq < 5.92: add(musicbox(m), tq, 0.4, 0.25, 0.4)
for b in range(int(5.92 / BEAT) + 1):                        # drums come in on beat 2 so the hook breathes first
    tq = b * BEAT
    if tq >= 5.92 or b < 1: continue
    if b % 2 == 0: add(K, tq, 0.55)
    if b % 4 == 3: add(K, tq + ST * 2, 0.35)
    if b % 2: add(SN, tq, 0.35, 0, 0.4)
    for sw in (0, 2.3):                                      # swung 8th hats
        add(HH, tq + sw * ST, 0.09, 0.35)
# vinyl crackle bed
cr = np.zeros(N); idx = rng.integers(0, N, 900); cr[idx] = rng.uniform(-1, 1, 900); add(onepole(cr, 0.5) * 0.6, 0, 0.12)

# 5.92 → 6.68: drop-out under "…y eso la llevó a la": reversed swell + rising ticks (the calendar flipping)
t = tt(HIT - 5.92); u = t / t[-1]
add(onepole(noise(t[-1] + 1 / SR), 0.02 + 0.5 * u ** 2)[: len(t)] * u ** 2.5, 5.92, 0.5, 0, 0.6)
add(rhodes(57, 0.8)[::-1][: len(t)] * u, 5.92, 0.25, 0, 0.5)
for k, x in enumerate(np.cumsum([0.12, 0.1, 0.085, 0.07, 0.06, 0.05, 0.045, 0.04, 0.035])):
    if 5.98 + x < HIT - 0.02: add(click(), 5.98 + x, 0.25 + 0.03 * k, 0.4 * (-1) ** k)

# 6.68: the hit, then the outro in A major with the hook resolved, slower
add(impact(), HIT, 0.95, 0, 0.5); add(stamp(), HIT + 0.3, 0.6)
for k, m in enumerate([45, 52, 57, 61, 64]): add(rhodes(m, 2.6), HIT + 0.35 + k * 0.03, 0.1, -0.5 + k / 4, 0.6)
add(sub(33, 1.6), HIT + 0.35, 0.3)
for s, m in ((0, 85), (3, 83), (6, 81), (12, 76)): add(musicbox(m, 1.4) * np.exp(-tt(1.4) * 0.8), 8.8 + s * ST * 1.2, 0.18, 0.3, 0.7)

# ---------- UI cues (shared by all five flat versions) ----------
CUES = [(0.1, pop(700), 0.45), (0.55, ding(93), 0.25), (1.5, whoosh(), 0.35), (1.78, pop(820), 0.45), (2.75, ding(88), 0.28),
        (3.0, whoosh(), 0.35), (3.15, pop(760), 0.4), (3.45, click(), 0.5), (3.7, click(), 0.5), (3.95, click(), 0.5), (4.15, pop(980), 0.45),
        (4.3, shutter(), 0.6), (4.5, whoosh(), 0.35), (4.62, pop(660), 0.4), (4.85, pop(880), 0.3), (4.95, pop(990), 0.3),
        (5.15, stamp(), 0.55), (5.3, stamp(), 0.45), (5.45, stamp(), 0.45), (5.62, slide(), 0.5), (8.5, whoosh(0.5), 0.2)]
for k in range(9): CUES.append((1.9 + k * 0.09, click(), 0.18))   # counter ticks up to 90%
for at, x, g in CUES: add(x, at, g, 0, 0.15)

def reverb(x, seed):
    t = tt(1.6); ir = np.random.default_rng(seed).uniform(-1, 1, len(t)) * np.exp(-t * 3.8); ir[: int(.015 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[:len(x)] * 0.3
music = bus + np.stack([reverb(send[0], 1), reverb(send[1], 2)])
music = np.tanh(music / np.abs(music[:, :int(5.9 * SR)]).max() * 1.1) / np.tanh(1.1)

if __name__ == '__main__':
    voice = np.array(narration('03')[0])
    env = np.sqrt(np.convolve(voice ** 2, np.ones(int(.05 * SR)) / int(.05 * SR), 'same'))
    gain = onepole(np.where(env > 0.02, 0.5, 0.9), np.full(N, 0.0015))
    out = voice * 1.05 + music * gain
    out = np.tanh(out / np.abs(out).max() * 1.25) / np.tanh(1.25) * 0.97
    for path, sig in ((f'{ROOT}/public/audio/flat.wav', out), (f'{ROOT}/narracion/musica-flat.wav', music * 0.9)):
        with wave.open(path, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((sig.T * 32000).astype('<i2').tobytes())
    print('wrote public/audio/flat.wav')
