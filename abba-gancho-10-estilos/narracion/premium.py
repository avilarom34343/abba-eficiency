# Soundtrack for the 10 premium styles: voice 03 (already downloaded) + an original track synthesised here, no external
# services. 160 BPM, one bar = 1.5 s, so every visual cut (1.5, 3.0, 4.5, 6.0) lands on a downbeat.
#   0–6.0  bright pop groove in C (Fmaj7 · G · Am7 · Em7), builds from bar 3
#   6.0–6.7 everything drops out, riser under "y eso la llevó a la"
#   6.7    impact on "quiebra" + a chord that sinks like a tape stop
#   6.7–8.5 half-time minor groove with a sliding 808
#   8.8    bright bell sting under the ABBA signature
#   python3 narracion/premium.py   → public/audio/premium.wav
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mix import narration, SR, HIT, DUR, ROOT  # same voice placement as the first 10 styles

N = int(DUR * SR)
BAR = 1.5; ST = BAR / 16                       # 16th note
rng = np.random.default_rng(7)
L, R = np.zeros(N), np.zeros(N)
verb_send = np.zeros((2, N))

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def add(x, at, gain=1.0, pan=0.0, verb=0.0):
    """Mix a mono sample into the stereo bus at time `at` (s), equal-power pan, optional reverb send."""
    i0 = int(at * SR); x = x[: max(0, N - i0)]
    if i0 < 0 or not len(x): return
    gl, gr = np.cos((pan + 1) * np.pi / 4) * gain, np.sin((pan + 1) * np.pi / 4) * gain
    L[i0:i0 + len(x)] += x * gl; R[i0:i0 + len(x)] += x * gr
    verb_send[0, i0:i0 + len(x)] += x * gl * verb; verb_send[1, i0:i0 + len(x)] += x * gr * verb
def tt(d): return np.arange(int(d * SR)) / SR
def onepole(x, a):
    """One-pole lowpass with (possibly per-sample) coefficient a in 0..1."""
    y = np.empty_like(x); s = 0.0; a = np.broadcast_to(a, x.shape)
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
def saw(f, t, bright, nh=24):
    """Band-limited saw by additive synthesis; `bright` (Hz, scalar or array) is a soft lowpass on the harmonics."""
    out = np.zeros_like(t)
    for h in range(1, nh + 1):
        if f * h > 16000: break
        out += np.sin(2 * np.pi * f * h * t) / h / (1 + (f * h / bright) ** 4)
    return out

# ---------- drums ----------
def kick():
    t = tt(0.45); f = 48 + 110 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + rng.uniform(-1, 1, len(t)) * np.exp(-t * 300) * 0.3
def clap():
    t = tt(0.35); n = rng.uniform(-1, 1, len(t))
    env = sum(np.exp(-np.maximum(t - d, 0) * 90) * (t >= d) for d in (0, .011, .022)) + 0.6 * np.exp(-t * 14) * (t > .03)
    band = onepole(n, 0.45) - onepole(n, 0.08)
    return band * env * 1.6
def hat(open_=False):
    t = tt(0.25 if open_ else 0.05); n = rng.uniform(-1, 1, len(t))
    return (n - onepole(n, 0.6)) * np.exp(-t * (14 if open_ else 90))
K, CL, HC, HO = kick(), clap(), hat(), hat(True)

# ---------- harmony ----------
CHORDS = [[53, 57, 60, 64], [55, 59, 62, 67], [57, 60, 64, 67], [52, 55, 59, 64]]   # Fmaj7 G Am7 Em7 (MIDI)
BASS = [41, 43, 45, 40]
def stab(notes, d=0.32, bright=4000):
    """Supersaw chord stab: 3 detuned voices per note, spread L/R."""
    t = tt(d); env = np.exp(-t * 6) * np.minimum(1, t * 400)
    b = bright * (0.35 + 0.65 * np.exp(-t * 9))
    l = sum(saw(hz(m) * (1 + dt), t, b, 14) for m in notes for dt in (-.006, .0))
    r = sum(saw(hz(m) * (1 + dt), t, b, 14) for m in notes for dt in (.006, .0))
    return l * env * 0.09, r * env * 0.09
def pluck(m, d=0.22):
    t = tt(d); return saw(hz(m), t, 600 + 6000 * np.exp(-t * 25), 18) * np.exp(-t * 11) * np.minimum(1, t * 600)
HOOK = [[72, 76, 77, 76, 72, 69, 72], [74, 79, 81, 79, 74, 71, 74], [76, 79, 84, 81, 79, 76, 79], [79, 83, 86, 83, 88, 86, 91]]
def lead(m, d):
    t = tt(d + 0.15); f = hz(m) * (1 + 0.004 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t * 5))
    ph = np.cumsum(f) / SR
    sq = sum(np.sin(2 * np.pi * h * ph) / h for h in (1, 3, 5, 7, 9)) + 0.5 * np.sin(2 * np.pi * 2 * ph)
    return sq * np.minimum(1, t * 250) * np.exp(-t * 3) * np.clip((d + 0.15 - t) * 12, 0, 1)
def bass(m, d):
    t = tt(d); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.5 * saw(f, t, 500 + 1500 * np.exp(-t * 18), 10)) * np.minimum(1, t * 300) * np.exp(-t * 2.5) * np.minimum(1, (d - t) * 60)
def stereo_add(lr, at, gain):
    l, r = lr; add(l, at, gain, -1, 0.25); add(r, at, gain, 1, 0.25)

for bar in range(4):                            # 0–6.0 s
    b0 = bar * BAR
    for s in (0, 6, 10) + ((14,) if bar == 3 else ()): add(K, b0 + s * ST, 0.95)
    for s in (4, 12): add(CL, b0 + s * ST, 0.55, 0, 0.35)
    for s in range(16):
        if s % 2: add(HO if s % 4 == 2 else HC, b0 + s * ST, 0.34 if s % 4 == 2 else 0.26, 0.3)
        elif bar >= 1: add(HC, b0 + s * ST, 0.16, -0.3)
    for s in (0, 3, 6, 8, 10, 13):              # chord stabs on a bouncy syncopation
        stereo_add(stab([n + 12 for n in CHORDS[bar]], bright=5000 + 1500 * bar), b0 + s * ST, 0.75 if s == 0 else 0.5)
    for s, o in ((0, 0), (3, 12), (6, 0), (8, 12), (10, 0), (11, 7), (14, 12)):
        add(bass(BASS[bar] + o, ST * 1.6), b0 + s * ST, 0.3)
    if bar >= 2:                                # 16th arpeggio lifts the second half
        arp = sorted(CHORDS[bar]) + [n + 12 for n in sorted(CHORDS[bar])]
        for s in range(16): add(pluck(arp[(s * 3) % 8] + 12), b0 + s * ST, 0.11 + 0.05 * (bar - 2) + s * 0.004, np.sin(s) * 0.6, 0.3)
    for s, m in zip((0, 3, 6, 8, 10, 12, 14), HOOK[bar]):   # the hook: a bright, singable lead line
        add(lead(m, ST * (3 if s < 8 else 2)), b0 + s * ST, 0.2, 0, 0.35)
    if bar == 3:                                # snare roll into the drop
        for s in range(8, 16, 1): add(CL, b0 + s * ST, 0.18 + s * 0.02, 0, 0.2)
    if bar < 3:                                 # whoosh into each cut
        t = tt(0.4); n = rng.uniform(-1, 1, len(t)); a = 0.02 + 0.4 * (t / 0.4) ** 2
        add(onepole(n, a) * (t / 0.4) ** 2, b0 + BAR - 0.4, 0.5, 0, 0.3)

# 6.0–6.7: drop-out. Riser (sweeping noise + rising sine) and a ticking 16th hat that speeds up.
t = tt(HIT - 6.0); n = rng.uniform(-1, 1, len(t)); a = 0.01 + 0.5 * (t / t[-1]) ** 2
add(onepole(n, a) * (0.2 + (t / t[-1]) ** 2), 6.0, 0.5, 0, 0.5)
add(np.sin(2 * np.pi * np.cumsum(200 + 1400 * (t / t[-1]) ** 2) / SR) * (t / t[-1]) ** 2 * 0.25, 6.0, 0.5, 0, 0.4)
for k, x in enumerate(np.cumsum([0.09, 0.08, 0.07, 0.06, 0.05, 0.045, 0.04, 0.035, 0.03])):
    if 6.0 + x < HIT - 0.02: add(HC, 6.0 + x, 0.12 + k * 0.02)
# filtered bass note held under the voice so the drop isn't empty
add(bass(28, 0.7) * 0.8, 6.0, 0.35)

# 6.7: the hit — sub boom, crash, and a chord that sinks like a tape stop
t = tt(1.8); add(np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 5)) / SR) * np.exp(-t * 2.2), HIT, 1.0)
t = tt(1.4); n = rng.uniform(-1, 1, len(t)); add((n - onepole(n, 0.3)) * np.exp(-t * 3.5), HIT, 0.45, 0, 0.9)
add(K, HIT, 1.0); add(CL, HIT, 0.8, 0, 0.8)
t = tt(0.9); bend = 2 ** (-(t / 0.9) ** 1.5 * 1.0)      # one octave down
fail = sum(saw(1, np.cumsum(hz(m) * bend) / SR, 2500, 12) for m in (56, 60, 63, 67))   # Abmaj7, sinking
add(fail * np.exp(-t * 2) * 0.12, HIT + 0.02, 0.9, 0, 0.4)

# 6.7–8.5: half-time minor groove (F minor) with a sliding 808
h0 = HIT + 0.75
for s in range(0, 10):
    tq = h0 + s * ST * 2
    if tq > 8.45: break
    if s in (0, 5): add(K, tq, 0.85)
    if s in (4,): add(CL, tq, 0.5, 0, 0.5)
    add(HC, tq, 0.1, 0.4); add(HC, tq + ST, 0.06, -0.4)
t = tt(8.5 - h0); f = hz(29) * 2 ** (-np.clip((t - 0.9) * 4, 0, 1) * 0.25)
add(np.tanh(2.5 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.minimum(1, t * 200) * np.minimum(1, (t[-1] - t) * 20) * 0.5, h0, 0.6)
for s, m in ((0, 65), (3, 68), (6, 72), (10, 70)):        # sparse minor bell motif
    add(pluck(m, 0.4), h0 + s * ST * 2, 0.12, 0.4 * np.sin(s), 0.6)

# 8.8: ABBA sting — FM bells, C major arpeggio, long reverb
for k, m in enumerate((84, 88, 91, 96)):
    t = tt(1.2); f = hz(m)
    add(np.sin(2 * np.pi * f * t + 2.5 * np.exp(-t * 6) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 4), 8.8 + k * 0.07, 0.16, -0.5 + k / 3, 0.9)
t = tt(1.2); add(np.sin(2 * np.pi * hz(36) * t) * np.exp(-t * 3) * np.minimum(1, t * 100), 8.8, 0.35)

# ---------- reverb (convolution with decaying stereo noise), sidechain pump, master ----------
def reverb(x, seed):
    t = tt(1.4); ir = np.random.default_rng(seed).uniform(-1, 1, len(t)) * np.exp(-t * 4.5); ir[: int(.012 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[:len(x)] * 0.35
music = np.stack([L, R]) + np.stack([reverb(verb_send[0], 1), reverb(verb_send[1], 2)])

def pump():   # duck the groove on every kick (bars 0–4) for the bounce of modern pop
    g = np.ones(N)
    for bar in range(4):
        for s in (0, 6, 10):
            i0 = int((bar * BAR + s * ST) * SR); t = tt(0.18); g[i0:i0 + len(t)] = np.minimum(g[i0:i0 + len(t)], 0.55 + 0.45 * (t / 0.18) ** 0.6)
    return g
music *= pump()
music = np.tanh(music / np.abs(music[:int(6 * SR)]).max() * 1.2) / np.tanh(1.2)

if __name__ == '__main__':
    voice = np.array(narration('03')[0])
    env = np.sqrt(np.convolve(voice ** 2, np.ones(int(.05 * SR)) / int(.05 * SR), 'same'))
    target = np.where(env > 0.02, 0.42, 0.85)               # duck the music under the voice
    gain = onepole(target, np.full(N, 0.0015))
    mixx = voice * 1.05 + music * gain
    mixx = np.tanh(mixx / np.abs(mixx).max() * 1.3) / np.tanh(1.3) * 0.97
    out = f'{ROOT}/public/audio/premium.wav'
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mixx.T * 32000).astype('<i2').tobytes())
    with wave.open(f'{ROOT}/narracion/musica-premium.wav', 'wb') as w:   # instrumental alone, for reference
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((music.T * 32000 * 0.9).astype('<i2').tobytes())
    print('wrote', out)
