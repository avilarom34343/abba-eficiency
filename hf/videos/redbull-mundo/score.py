# Score + sound design for the Red Bull documentary (both versions share it). Synthesised in code:
# a subtle cinematic bed that ducks under the narration, plus sound effects locked to the scene beats.
#   python3 score.py  → assets/score.wav (48 kHz stereo, 96 s) — copy to ../redbull-2d/assets/
import os, sys, json, wave
import numpy as np
from scipy.signal import butter, sosfilt
sys.path.insert(0, '/home/user/abba-eficiency/abba-gancho-10-estilos/narracion')
import hundred as H   # instruments (strings, supersaw, sub, filters) from the 100-video generator

SR = H.SR; DUR = 96.0; N = int(DUR * SR)
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)
mus = np.zeros((2, N)); fx = np.zeros((2, N)); send = np.zeros((2, N))

def tt(d): return np.arange(int(d * SR)) / SR
def add(buf, x, at, g=1.0, pan=0.0, verb=0.2):
    i0 = int(at * SR); x = x[: max(0, N - i0)]
    if i0 < 0 or not len(x): return
    l, r = np.cos((pan + 1) * np.pi / 4) * g, np.sin((pan + 1) * np.pi / 4) * g
    buf[0, i0:i0 + len(x)] += x * l; buf[1, i0:i0 + len(x)] += x * r
    send[0, i0:i0 + len(x)] += x * l * verb; send[1, i0:i0 + len(x)] += x * r * verb
def noise(d): return rng.uniform(-1, 1, int(d * SR))
def env(d, a, r, shape=1.0): t = tt(d); return np.minimum(1, t / max(a, 1e-3)) ** shape * np.minimum(1, (d - t) / max(r, 1e-3))
def bp(x, lo, hi): return sosfilt(butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f / (SR / 2), 'low', output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f / (SR / 2), 'high', output='sos'), x)

# ---------- sound effects ----------
def whoosh(d=0.9, lo=200, hi=4000):
    t = tt(d); u = t / d; x = H.sweep(noise(d), lo, hi) * np.sin(np.pi * u) ** 2; return x * 1.6
def boom(d=2.5, f0=55):
    t = tt(d); return np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.5 * np.exp(-t * 6))) / SR) * np.exp(-t * 1.6) + 0.4 * lp(noise(d), 300) * np.exp(-t * 4)
def riser(d=2.0): t = tt(d); u = t / d; return H.sweep(noise(d), 150, 9000) * u ** 2.5 * 0.6
def wind(d, seed=0):
    t = tt(d); g = 0.55 + 0.45 * np.sin(2 * np.pi * 0.23 * t + seed) * np.sin(2 * np.pi * 0.07 * t + 1.3)
    return (bp(noise(d), 180, 900) * 0.8 + bp(noise(d), 1500, 4000) * 0.15) * g * env(d, 0.8, 1.2)
def engine(d, f0, f1, grit=3.0):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d); ph = np.cumsum(f) / SR
    x = sum(np.sin(2 * np.pi * k * ph) / k for k in range(1, 12)) + 0.3 * noise(d)
    return lp(np.tanh(x * grit), 4000) * env(d, 0.05, 0.3) * 0.4
def jet(d):
    t = tt(d); u = t / d; dop = 1 + 0.25 * np.tanh((0.5 - u) * 6)
    return (H.sweep(noise(d), 800, 2500) * 0.6 + np.sin(2 * np.pi * np.cumsum(900 * dop) / SR) * 0.15) * np.sin(np.pi * u) ** 1.5
def crowd(d):
    t = tt(d); x = sum(bp(noise(d), lo, lo * 1.6) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.5 + k * 0.37) * t + k)) for k, lo in enumerate([300, 520, 900, 1500, 2400]))
    return x * env(d, 1.0, 1.5) * 0.7
def swish(d=0.5): t = tt(d); u = t / d; return bp(noise(d), 2500, 9000) * np.sin(np.pi * u) ** 3
def click(): t = tt(0.05); return np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 120) + 0.3 * noise(0.05) * np.exp(-t * 200)
def tear(d=0.45): t = tt(d); return bp(noise(d), 1200, 6000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 37 * t))) * np.exp(-t * 3)
def hum(d): t = tt(d); return (np.sin(2 * np.pi * 100 * t) * 0.3 + np.sin(2 * np.pi * 200 * t) * 0.1 + bp(noise(d), 3000, 6000) * 0.04) * env(d, 0.5, 0.5)
def blip(f): t = tt(0.12); return np.sin(2 * np.pi * f * t) * np.exp(-t * 30)
def thump(): t = tt(0.6); return np.sin(2 * np.pi * np.cumsum(70 * (1 + np.exp(-t * 25))) / SR) * np.exp(-t * 7)
def shimmer(d): t = tt(d); u = t / d; return sum(np.sin(2 * np.pi * f * t * (1 + 0.002 * np.sin(5 * t))) for f in (880, 1320, 1760, 2640)) * u ** 2 * 0.08

# S1 hook
add(fx, whoosh(1.2, 120, 2500), 5.2, 0.5); add(fx, riser(1.6), 7.1, 0.6); add(fx, boom(3.0), 8.7, 0.9, 0, 0.5)
# S2 supermarket
add(fx, hum(7.0), 10.3, 0.25); add(fx, click(), 13.6, 0.4); add(fx, whoosh(0.6), 17.1, 0.3)
# S3 strategy wall: posters torn off, one pin
for k, tq in enumerate([21.4, 22.2, 22.9, 23.5, 24.0, 24.4]): add(fx, tear(0.4), tq, 0.35, (-1) ** k * 0.4)
add(fx, click(), 25.9, 0.7); add(fx, boom(2.0, 48), 25.95, 0.35, 0, 0.4)
# S4 mountain wind
add(fx, wind(5.2, 1), 27.0, 0.55); add(fx, whoosh(1.0, 100, 1500), 29.6, 0.35)
# S5 extreme montage
add(fx, whoosh(1.0), 31.6, 0.6); add(fx, riser(2.2), 35.4, 0.5)
add(fx, engine(1.4, 70, 190, 4), 37.4, 0.8); add(fx, boom(1.0, 60), 38.55, 0.6)
add(fx, swish(0.6), 38.95, 0.7); add(fx, wind(1.2, 3), 39.0, 0.4)
add(fx, jet(1.6), 40.1, 0.8)
add(fx, engine(1.6, 260, 620, 2.5), 41.4, 0.7, 0.3); add(fx, whoosh(0.7, 300, 6000), 42.7, 0.5)
# S6 media room
add(fx, hum(9.8) * 0.5, 43.2, 0.25)
for k in range(24): add(fx, blip(900 + (k * 173) % 1400), 44.0 + k * 0.38, 0.12, ((k * 7) % 5 - 2) / 3)
add(fx, whoosh(1.2, 200, 5000), 46.6, 0.45)
# S7 transformation: pull-back whooshes, crowd swell
for tq in (53.6, 55.2, 56.8): add(fx, whoosh(1.1, 120, 3000), tq, 0.4)
add(fx, crowd(4.5), 56.5, 0.5)
# S8 montage then hard silence
add(fx, crowd(2.4), 62.6, 0.6); add(fx, engine(0.9, 300, 700), 63.3, 0.45); add(fx, wind(1.2, 5), 63.9, 0.4); add(fx, boom(0.9, 70), 64.6, 0.6)
add(fx, thump(), 65.9, 0.7)
# S9 energy
add(fx, shimmer(4.0), 69.8, 1.0); add(fx, riser(3.0), 70.6, 0.35); add(fx, boom(2.5, 50), 73.6, 0.5)
# S10 lesson and rebuild
add(fx, whoosh(2.0, 80, 1200), 82.3, 0.35); add(fx, crowd(6.0) * 0.6, 86.0, 0.35); add(fx, boom(3.5, 45), 89.5, 0.6, 0, 0.6)

# ---------- music bed (D minor, slow) ----------
root = 38
chords = [[0, 3, 7], [-4, 0, 3], [-7, -4, 0], [-2, 2, 5]]   # i – VI – III(ish) – VII
def pad(at, d, ch, g, cut=1400):
    x = H.strings([root + 12 + c for c in ch], d) + 0.5 * H.supersaw([root + 24 + c for c in ch], d, cut, 0.8, 0.01)
    add(mus, x * env(d, 1.5, 1.5), at, g, 0, 0.5)
bar = 4.0
for k, at in enumerate(np.arange(0, 96, bar)):
    ch = chords[k % 4]; g = 0.22
    if 65.0 <= at < 66: continue
    if 74.0 <= at < 82: g = 0.14
    pad(at, bar + 1.0, ch, g)
    add(mus, H.sub(root - 12 + ch[0], bar * 0.95) * env(bar * 0.95, 0.4, 0.6), at, 0.18)
# pulse (heartbeat kick + ticking) in the montages and the build
def pulse(a, b, bpm, g):
    beat = 60 / bpm
    for k, at in enumerate(np.arange(a, b, beat)):
        add(mus, thump(), at, g); add(mus, H.Kit(rng, {})._hat(0.03), at + beat / 2, g * 0.25, 0.3)
pulse(32.0, 43.1, 120, 0.35); pulse(60.9, 64.95, 132, 0.4); pulse(82.5, 89.4, 100, 0.25)
# motif on piano-like epiano at key lines
for at, notes in [(6.4, [62, 65, 69]), (27.4, [62, 69]), (53.3, [65, 69, 72]), (70.0, [69, 72, 74, 77]), (86.4, [62, 65, 69, 74])]:
    for j, m in enumerate(notes): add(mus, H.epiano([m], 2.5), at + j * 0.45, 0.12, 0.2, 0.6)

# ---------- mix ----------
vo = np.zeros(N)
with wave.open(os.path.join(HERE, 'assets/narration.wav')) as w:
    a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(float) / 32768; a = np.interp(np.arange(N) * w.getframerate() / SR, np.arange(len(a)), a) if w.getframerate() != SR else a
    vo[:len(a[:N])] = a[:N]
e = np.sqrt(np.convolve(vo ** 2, np.ones(2400) / 2400, 'same'))
duck = H.filt(np.where(e > 0.015, 0.35, 1.0), 4)            # music sits under the voice
silence = np.ones(N); i0, i1 = int(65.0 * SR), int(65.8 * SR); silence[i0:i1] = 0   # "everything stops"
rev = np.stack([H.reverb(send[0], 1), H.reverb(send[1], 2)]) * 1.6
out = (mus * duck + fx * (0.6 + 0.4 * duck) + rev * duck) * silence
out = np.tanh(out / (np.abs(out).max() + 1e-9) * 1.4) / np.tanh(1.4) * 0.5     # bed level well under the -1 dBFS voice
fade = np.minimum(1, (DUR - np.arange(N) / SR) / 2.5); out *= fade
with wave.open(os.path.join(HERE, 'assets/score.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out.T * 32000).astype('<i2').tobytes())
print('wrote assets/score.wav', SR)
