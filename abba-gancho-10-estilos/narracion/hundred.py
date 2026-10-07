# 100 soundtracks for the company-story set, all synthesised here (no samples, no ElevenLabs).
# Same 25 s arrangement for every track: a sparse build, the drop on HIT (the story's twist), the groove under the
# story, a breakdown under the closing line. Twelve genres, each track with its own key, tempo, hook and sounds,
# plus sound design locked to the video: keyboard clicks while a search bar types, a whoosh on every cut.
#   python3 narracion/hundred.py [first last]  → public/audio/m/NNN.wav + src/hundred/music.json
import json, os, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mix import SR, ROOT, decode, speech_segments
from flat import click, whoosh, impact, reverb, pop

DUR = 25.0; N = int(DUR * SR)
PH = [0.3, 2.5, 4.1, 6.75]; HIT = 7.54; OUTRO = 21.2
CUTS = [2.5, 4.1, 6.75, 10, 12.24, 14.48, 16.72, 18.96, 21.2]
PLAN = json.load(open(f'{ROOT}/narracion/plan.json'))

# ---------- dsp ----------
def tt(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def filt(x, f, kind='low', o=2):
    f = np.clip(f, 20, SR / 2 * 0.95); return sosfilt(butter(o, f / (SR / 2), kind, output='sos'), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos'), x)
def sweep(x, f0, f1, B=512):
    """Low-pass whose cutoff glides f0→f1 (exponential), block-wise."""
    out = np.empty_like(x); zi = None
    for i in range(0, len(x), B):
        f = f0 * (f1 / f0) ** (i / max(1, len(x))); sos = butter(2, min(f, SR * 0.45) / (SR / 2), 'low', output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        out[i:i + B], zi = sosfilt(sos, x[i:i + B], zi=zi)
    return out
def env(n, a=0.005, r=0.05):
    e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def noise(d, rng): return rng.uniform(-1, 1, int(d * SR))
def saw(f, t): return 2 * ((f * t) % 1) - 1
def sq(f, t, duty=0.5): return np.where((f * t) % 1 < duty, 1.0, -1.0)
def tri(f, t): return 2 * np.abs(saw(f, t)) - 1

# ---------- instruments ----------
class Kit:
    def __init__(s, rng, char):
        s.rng = rng; c = char
        s.kick = s._kick(c.get('kick_f0', 150), c.get('kick_f1', 46), c.get('kick_dec', 0.32), c.get('kick_dist', 1.0))
        s.snare = s._snare(c.get('snare_tone', 190), c.get('snare_dec', 0.16)); s.clap = s._clap()
        s.hat = s._hat(0.035); s.ohat = s._hat(0.22); s.rim = s._rim(); s.shaker = s._shaker(); s.cowbell = s._cowbell(c.get('bell_f', 560))
        s.tom = s._tom(95); s.taiko = s._tom(62, 0.9)
    def _kick(s, f0, f1, dec, dist):
        t = tt(dec * 3); f = f1 + (f0 - f1) * np.exp(-t * 28); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec)
        x[:int(0.004 * SR)] += s.rng.uniform(-0.6, 0.6, int(0.004 * SR)); return np.tanh(x * dist) / np.tanh(dist)
    def _snare(s, tone, dec):
        t = tt(0.4); n = filt(s.rng.uniform(-1, 1, len(t)), 1800, 'high') * np.exp(-t / dec)
        return 0.9 * n + 0.6 * np.sin(2 * np.pi * tone * t) * np.exp(-t / 0.05)
    def _clap(s):
        t = tt(0.35); n = bp(s.rng.uniform(-1, 1, len(t)), 900, 3200); e = np.zeros(len(t))
        for k in range(3): e += np.exp(-np.maximum(0, t - k * 0.011) / 0.008) * (t >= k * 0.011)
        return n * (e + 0.5 * np.exp(-t / 0.12))
    def _hat(s, dec): t = tt(dec * 5); return filt(s.rng.uniform(-1, 1, len(t)), 7500, 'high') * np.exp(-t / dec)
    def _rim(s): t = tt(0.06); return np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.012) + 0.4 * bp(s.rng.uniform(-1, 1, len(t)), 2000, 6000) * np.exp(-t / 0.01)
    def _shaker(s): t = tt(0.09); return bp(s.rng.uniform(-1, 1, len(t)), 4000, 11000) * np.sin(np.pi * t / 0.09) ** 2
    def _cowbell(s, f):
        t = tt(0.35); x = sq(f, t) + sq(f * 1.48, t); return bp(x, 500, 3500) * np.exp(-t / 0.09) * 0.6
    def _tom(s, f, dec=0.35):
        t = tt(dec * 2.5); x = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t * 20))) / SR) * np.exp(-t / dec)
        return x + 0.3 * filt(s.rng.uniform(-1, 1, len(t)), 900) * np.exp(-t / 0.05)

def sub(m, d): t = tt(d); return np.sin(2 * np.pi * mtof(m) * t) * env(len(t), 0.004, 0.03)
def b808(m, d, glide=None, drive=1.8):
    t = tt(d); f = mtof(m) * np.ones(len(t))
    if glide is not None: f = mtof(glide) + (mtof(m) - mtof(glide)) * (1 - np.exp(-t * 25))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3) * env(len(t), 0.003, 0.04)
    return np.tanh(x * drive) / np.tanh(drive) * 0.55
def sawbass(m, d, cut=900): t = tt(d); f = mtof(m); return filt(saw(f, t) + 0.6 * np.sin(2 * np.pi * f / 2 * t), cut) * env(len(t), 0.003, 0.03) * np.exp(-t * 2)
def reese(m, d): t = tt(d); f = mtof(m); return filt(saw(f * 0.995, t) + saw(f * 1.006, t), 520) * 0.7 * env(len(t), 0.01, 0.05) + 0.5 * sub(m - 12, d)
def acid(m, d, cut): t = tt(d); x = saw(mtof(m), t); return np.tanh(sweep(x, cut * 2.5, cut * 0.4) * 2) * env(len(t), 0.002, 0.02) * 0.6
def chip(m, d, duty=0.25): t = tt(d); return sq(mtof(m), t, duty) * env(len(t), 0.002, 0.03) * np.exp(-t * 3) * 0.5
def supersaw(ms, d, cut, att=0.01, det=0.012):
    t = tt(d); x = sum(saw(mtof(m) * (1 + det * k), t + 0.13 * k) for m in ms for k in (-2, -1, 0, 1, 2)) / (5 * len(ms))
    return filt(x, cut) * env(len(t), att, 0.1)
def epiano(ms, d):
    t = tt(d); x = 0
    for m in ms: f = mtof(m); x = x + np.sin(2 * np.pi * f * t + 1.3 * np.exp(-t * 5) * np.sin(2 * np.pi * f * t)) * np.exp(-t * 1.6)
    return x / len(ms) * env(len(t), 0.003, 0.08)
def organ(ms, d):
    t = tt(d); x = sum(np.sin(2 * np.pi * mtof(m) * h * t) / h for m in ms for h in (1, 2, 3, 4)) / len(ms)
    return x * 0.5 * env(len(t), 0.004, 0.03)
def stab(ms, d, cut=2500): t = tt(d); return filt(sum(saw(mtof(m), t) + saw(mtof(m) * 1.007, t) for m in ms) / len(ms), cut) * np.exp(-t * 7) * env(len(t), 0.002, 0.02) * 0.6
def strings(ms, d):
    t = tt(d); vib = 1 + 0.004 * np.sin(2 * np.pi * 5 * t)
    return filt(sum(saw(mtof(m) * vib * (1 + 0.003 * k), t) for m in ms for k in (-1, 1)) / (2 * len(ms)), 2800) * env(len(t), 0.25, 0.3)
def pluck(m, d, bright=0.5, rng=None):
    f = mtof(m); p = max(2, int(SR / f)); n = int(d * SR); y = np.zeros(n + p)
    y[:p] = filt((rng or np.random.default_rng(1)).uniform(-1, 1, p), 1500 + 9000 * bright) if p > 12 else np.random.default_rng(1).uniform(-1, 1, p)
    dec = 0.996 if f < 400 else 0.992
    for k in range(1, (n // p) + 1):
        prev = y[(k - 1) * p:k * p]; y[k * p:(k + 1) * p] = dec * 0.5 * (prev + np.roll(prev, 1))[:len(y[k * p:(k + 1) * p])]
    return y[:n] * env(n, 0.001, 0.03)
def bell(m, d): t = tt(d); f = mtof(m); return np.sin(2 * np.pi * f * t + 2.2 * np.exp(-t * 3) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 2.2) * env(len(t), 0.001, 0.05)
def sqlead(m, d): t = tt(d); vib = 1 + 0.008 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t * 4); return filt(sq(mtof(m) * vib, t, 0.4), 3500) * env(len(t), 0.005, 0.05) * 0.5
def sawlead(m, d): t = tt(d); vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t * 3); return filt(saw(mtof(m) * vib, t) + saw(mtof(m) * vib * 1.008, t), 5000) * env(len(t), 0.004, 0.06) * 0.4
def flute(m, d): t = tt(d); vib = 1 + 0.006 * np.sin(2 * np.pi * 5 * t); return (np.sin(2 * np.pi * mtof(m) * vib * t) + 0.15 * np.sin(4 * np.pi * mtof(m) * t)) * env(len(t), 0.04, 0.08)
def brass(m, d): t = tt(d); x = saw(mtof(m), t) + saw(mtof(m) * 1.006, t); return sweep(x, 700, 4000) * env(len(t), 0.02, 0.06) * 0.45
def vox(m, d):
    t = tt(d); x = saw(mtof(m), t); return (bp(x, 600, 900) + 0.7 * bp(x, 1000, 1400)) * env(len(t), 0.01, 0.04) * 1.6

# ---------- harmony ----------
MINOR = [0, 2, 3, 5, 7, 8, 10]; MAJOR = [0, 2, 4, 5, 7, 9, 11]; DORIAN = [0, 2, 3, 5, 7, 9, 10]
PROGS = {'minor': [[0, 5, 2, 6], [0, 3, 5, 4], [0, 5, 3, 4], [0, 6, 5, 6], [0, 3, 6, 4]], 'major': [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 4, 4], [3, 4, 0, 5]]}
def deg(scale, root, d, octv=0): return root + scale[d % 7] + 12 * (d // 7 + octv)
def chord(scale, root, d, n=3, octv=0): return [deg(scale, root, d + 2 * k, octv) for k in range(n)]

# ---------- genres: tempo range, scale, and a bar-writer ----------
# each writer(A, b0, bi, sec) places one bar; sec in {'intro', 'drop', 'outro'}; A = arranger with helpers
def g_trap(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for s in A.pick([[0, 10], [0, 7, 10], [0, 3, 10, 13]]): A.drum(k.kick, b0 + s * st, 0.9)
        A.drum(k.clap, b0 + 8 * st, 0.6, verb=0.25); A.drum(k.snare, b0 + 8 * st, 0.35)
        for s in range(0, 16, 2): A.drum(k.hat, b0 + s * st, 0.18, pan=0.3)
        if bi % 2: [A.drum(k.hat, b0 + (12 + j / 3) * st, 0.13, pan=-0.3) for j in range(6)]
        r = A.chord_root(bi); A.music(b808(r - 12, 4 * A.beat, glide=r - 7 if bi % 2 else None), b0, 0.55)
    A.pad(b0, bi, sec, lambda ms, d: supersaw(ms, d, 1600, 0.15), 0.18)
    A.hook(b0, bi, sec, lambda m, d: bell(m + 12, max(d, 0.4)), 0.22)
def g_house(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for b in range(4): A.drum(k.kick, b0 + b * A.beat, 0.85)
        for s in (4, 12): A.drum(k.clap, b0 + s * st, 0.45, verb=0.2)
        for s in (2, 6, 10, 14): A.drum(k.ohat, b0 + s * st, 0.16)
        for s in range(16): A.drum(k.shaker, b0 + s * st, 0.07 + 0.05 * (s % 2), pan=0.4)
        r = A.chord_root(bi)
        for s in (2, 6, 10, 14): A.music(sawbass(r - 12, st * 1.6, 700), b0 + s * st, 0.5)
        for s in A.pick([[0, 3, 6, 10], [2, 6, 10, 13], [0, 6, 10]]): A.music(organ(A.chord(bi, 4, 1), st * 1.5), b0 + s * st, 0.2)
    else: A.pad(b0, bi, sec, lambda ms, d: epiano(ms, d), 0.3)
    A.hook(b0, bi, sec, lambda m, d: pluck(m + 12, max(d, 0.3), 0.7, A.rng), 0.3)
def g_synthwave(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for s in (0, 8): A.drum(k.kick, b0 + s * st, 0.85)
        for s in (4, 12): A.drum(k.snare, b0 + s * st, 0.55, verb=0.6)
        for s in range(0, 16, 2): A.drum(k.hat, b0 + s * st, 0.12)
        r = A.chord_root(bi)
        for s in range(0, 16, 2): A.music(sawbass(r - 12 + (12 if s % 4 == 2 else 0), st * 1.8, 1200), b0 + s * st, 0.4)
        for s in range(16): A.music(pluck(A.chord(bi, 3, 1)[s % 3] + 12, st * 2, 0.8, A.rng), b0 + s * st, 0.12, pan=0.5 * (-1) ** s, verb=0.3)
    A.pad(b0, bi, sec, lambda ms, d: supersaw(ms, d, 2600, 0.3, 0.018), 0.2)
    A.hook(b0, bi, sec, lambda m, d: sawlead(m + 12, max(d, 0.25)), 0.22)
def g_phonk(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for s in A.pick([[0, 3, 6, 10], [0, 6, 8, 11, 14], [0, 3, 8, 11]]): A.drum(k.kick, b0 + s * st, 0.9)
        A.drum(k.clap, b0 + 8 * st, 0.5); [A.drum(k.hat, b0 + s * st, 0.12) for s in range(0, 16, 2)]
        r = A.chord_root(bi); A.music(b808(r - 12, 2 * A.beat, drive=4), b0, 0.5); A.music(b808(r - 12, 2 * A.beat, drive=4), b0 + 2 * A.beat, 0.45)
        for s in range(16):
            m = A.motif[(s + bi * 16) % len(A.motif)]
            if (s * 7 + bi) % 3 != 1: A.music(A.kit._cowbell(mtof(m + 12)), b0 + s * st, 0.3, pan=0.2)
    else:
        A.pad(b0, bi, sec, lambda ms, d: strings(ms, d), 0.18)
        A.hook(b0, bi, sec, lambda m, d: A.kit._cowbell(mtof(m + 12)), 0.25)
def g_dnb(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for s in A.pick([[0, 10], [0, 7, 10], [0, 10, 11]]): A.drum(k.kick, b0 + s * st, 0.85)
        for s in (4, 12): A.drum(k.snare, b0 + s * st, 0.6, verb=0.2)
        for s in range(16): A.drum(k.hat, b0 + s * st, 0.08 + 0.06 * (s % 2 == 0), pan=0.3)
        A.music(reese(A.chord_root(bi) - 12, 4 * A.beat), b0, 0.4)
    A.pad(b0, bi, sec, lambda ms, d: strings(ms, d), 0.22)
    A.hook(b0, bi, sec, lambda m, d: pluck(m + 12, max(d, 0.25), 0.9, A.rng), 0.3)
def g_dembow(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for b in range(4): A.drum(k.kick, b0 + b * A.beat, 0.85)
        for s in (3, 6, 11, 14): A.drum(k.snare, b0 + s * st, 0.4); A.drum(k.rim, b0 + s * st, 0.2)
        for s in range(0, 16, 2): A.drum(k.hat, b0 + s * st, 0.1)
        r = A.chord_root(bi)
        for s in (0, 3, 8, 11): A.music(sub(r - 12, st * 2.5), b0 + s * st, 0.55)
        for s in (0, 3, 6, 10, 12): A.music(pluck(A.chord(bi, 3, 1)[s % 3] + 12, st * 2, 0.6, A.rng), b0 + s * st, 0.18, pan=0.3)
    A.pad(b0, bi, sec, lambda ms, d: supersaw(ms, d, 1800, 0.2), 0.16)
    A.hook(b0, bi, sec, lambda m, d: sqlead(m + 12, max(d, 0.2)), 0.22)
def g_lofi(A, b0, bi, sec):
    k, st = A.kit, A.st; sw = st * 0.33
    if sec == 'drop':
        for s in A.pick([[0, 7, 10], [0, 10], [0, 3, 10]]): A.drum(k.kick, b0 + s * st + (sw if s % 2 else 0), 0.8)
        for s in (4, 12): A.drum(k.snare, b0 + s * st, 0.45, verb=0.15)
        for s in range(0, 16, 2): A.drum(k.hat, b0 + s * st + (sw if s % 4 == 2 else 0), 0.12)
        A.music(sub(A.chord_root(bi) - 12, 3.5 * A.beat), b0, 0.5)
    A.pad(b0, bi, sec, lambda ms, d: epiano(ms + [ms[0] + 10], d), 0.34)
    A.hook(b0, bi, sec, lambda m, d: flute(m + 12, max(d, 0.3)), 0.2)
def g_hyperpop(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for s in (0, 4, 8, 10, 12): A.drum(k.kick, b0 + s * st, 0.9)
        for s in (4, 12): A.drum(k.clap, b0 + s * st, 0.5)
        for s in range(16): A.drum(k.hat, b0 + s * st, 0.1)
        A.music(b808(A.chord_root(bi) - 12, 4 * A.beat, drive=3), b0, 0.45)
        for s in range(16): A.music(chip(A.chord(bi, 3, 1)[s % 3] + 24, st * 0.9, 0.125), b0 + s * st, 0.12, pan=0.6 * (-1) ** s)
    A.pad(b0, bi, sec, lambda ms, d: supersaw(ms, d, 4000, 0.05, 0.02), 0.18)
    A.hook(b0, bi, sec, lambda m, d: chip(m + 24, max(d, 0.15), 0.5), 0.25)
def g_disco(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for b in range(4): A.drum(k.kick, b0 + b * A.beat, 0.8)
        for s in (4, 12): A.drum(k.snare, b0 + s * st, 0.45); A.drum(k.clap, b0 + s * st, 0.25)
        for s in range(16): A.drum(k.ohat if s % 4 == 2 else k.hat, b0 + s * st, 0.12)
        r = A.chord_root(bi)
        for s, o in ((0, 0), (2, 12), (4, 0), (6, 12), (8, 0), (10, 12), (12, 0), (14, 12)): A.music(pluck(r - 12 + o, st * 1.5, 0.9, A.rng), b0 + s * st, 0.5)
        for s in (2, 6, 10, 14): A.music(stab(A.chord(bi, 3, 1), st * 0.8, 3500), b0 + s * st, 0.18, pan=-0.3)
    A.pad(b0, bi, sec, lambda ms, d: strings(ms, d), 0.2)
    A.hook(b0, bi, sec, lambda m, d: brass(m + 12, max(d, 0.25)), 0.26)
def g_epic(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for s in A.pick([[0, 6, 8, 11], [0, 3, 8, 10, 12], [0, 8, 10, 14]]): A.drum(k.taiko, b0 + s * st, 0.8, verb=0.4)
        for s in (4, 12): A.drum(k.snare, b0 + s * st, 0.4, verb=0.5)
        for s in range(16): A.music(strings([A.chord(bi, 3, 0)[s % 3]], st * 1.1), b0 + s * st, 0.1, pan=0.3 * (-1) ** s)
        if bi % 2 == 0: A.music(brass(A.chord_root(bi) - 12, 2 * A.beat), b0, 0.35); A.music(brass(A.chord_root(bi) - 5, 2 * A.beat), b0, 0.25)
    A.pad(b0, bi, sec, lambda ms, d: strings(ms, d), 0.28)
    A.hook(b0, bi, sec, lambda m, d: brass(m + 12, max(d, 0.3)), 0.24)
def g_techno(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for b in range(4): A.drum(k.kick, b0 + b * A.beat, 0.9)
        for s in (2, 6, 10, 14): A.drum(k.ohat, b0 + s * st, 0.14)
        for s in (3, 11, 14): A.drum(k.rim, b0 + s * st, 0.18, pan=0.4)
        A.drum(k.clap, b0 + 12 * st, 0.3, verb=0.4)
        cut = 500 + 1800 * (0.5 + 0.5 * np.sin(bi * 1.3))
        for s in range(16):
            if (s * 5 + bi) % 4 != 3: A.music(acid(A.motif[s % len(A.motif)] - 12, st * 0.9, cut), b0 + s * st, 0.22)
    else: A.pad(b0, bi, sec, lambda ms, d: supersaw(ms, d, 900, 0.4), 0.2)
    A.hook(b0, bi, sec, lambda m, d: bell(m + 12, max(d, 0.3)), 0.15)
def g_jersey(A, b0, bi, sec):
    k, st = A.kit, A.st
    if sec == 'drop':
        for s in (0, 4, 8, 10, 12, 14) if bi % 2 else (0, 3, 6, 8, 12, 14): A.drum(k.kick, b0 + s * st, 0.9)
        for s in (4, 12): A.drum(k.clap, b0 + s * st, 0.5)
        A.music(b808(A.chord_root(bi) - 12, 2 * A.beat), b0, 0.45)
        for s in (2, 5, 9, 13): A.music(vox(A.chord(bi, 3, 1)[s % 3] + 12, st * 1.2), b0 + s * st, 0.2, pan=0.4 * (-1) ** s)
    A.pad(b0, bi, sec, lambda ms, d: supersaw(ms, d, 2200, 0.1), 0.15)
    A.hook(b0, bi, sec, lambda m, d: pluck(m + 12, max(d, 0.3), 0.8, A.rng), 0.28)

GENRES = [  # name, writer, bpm range, mode, character
    ('Trap', g_trap, (138, 150), 'minor', dict(kick_dec=0.25)), ('House', g_house, (122, 126), 'major', dict(kick_f0=130, kick_dec=0.22)),
    ('Synthwave', g_synthwave, (100, 112), 'minor', dict(snare_dec=0.22)), ('Phonk', g_phonk, (128, 140), 'minor', dict(kick_dist=3.0, bell_f=600)),
    ('Drum & Bass', g_dnb, (170, 176), 'minor', dict(kick_dec=0.18, snare_tone=230)), ('Dembow', g_dembow, (92, 98), 'minor', dict(kick_dec=0.2)),
    ('Lo-fi', g_lofi, (84, 92), 'major', dict(kick_dec=0.25, snare_dec=0.12)), ('Hyperpop', g_hyperpop, (150, 160), 'major', dict(kick_dist=2.5)),
    ('Disco funk', g_disco, (112, 120), 'major', dict(kick_dec=0.2)), ('Épica', g_epic, (88, 96), 'minor', dict()),
    ('Techno', g_techno, (128, 132), 'minor', dict(kick_dist=1.6, kick_dec=0.28)), ('Jersey club', g_jersey, (138, 142), 'minor', dict(kick_dist=2.0)),
]

class Arranger:
    def __init__(s, n):
        s.n = n; s.rng = np.random.default_rng(1000 + n); g = GENRES[(n * 7 + n // 12) % 12]
        s.name, s.writer, (lo, hi), mode, char = g
        s.bpm = int(round(lo + (hi - lo) * s.rng.random())); s.beat = 60 / s.bpm; s.st = s.beat / 4; s.bar = 4 * s.beat
        s.scale = {'minor': MINOR, 'major': MAJOR}[mode] if s.rng.random() < 0.8 else DORIAN
        s.root = 45 + (n * 5) % 12; s.prog = PROGS['minor' if s.scale is not MAJOR else 'major'][s.rng.integers(0, 4)]
        s.kit = Kit(s.rng, char)
        # the hook: a 16-step rhythm and a melody walking the scale, answered on the second bar
        rh = sorted(set([0] + list(s.rng.choice(range(1, 16), size=s.rng.integers(4, 8), replace=False))))
        walk, d = [], int(s.rng.integers(0, 3)) * 2
        for _ in rh: d = int(np.clip(d + s.rng.choice([-2, -1, 1, 2, 0, 3]), -3, 9)); walk.append(d)
        s.hook_rh, s.hook_deg = rh, walk
        s.motif = [deg(s.scale, s.root, x) for x in walk]
        s.bus = np.zeros((2, N)); s.dr = np.zeros((2, N)); s.send = np.zeros((2, N)); s.kicks = []
    def pick(s, opts): return opts[s.n % len(opts)]
    def chord_root(s, bi): return deg(s.scale, s.root, s.prog[bi % 4])
    def chord(s, bi, n=3, octv=0): return chord(s.scale, s.root, s.prog[bi % 4], n, octv)
    def _add(s, buf, x, at, g, pan, verb):
        i0 = int(round(at * SR))
        if i0 >= N or len(x) == 0: return
        if i0 < 0: x = x[-i0:]; i0 = 0
        x = x[:N - i0]; l, r = np.cos((pan + 1) * np.pi / 4) * g, np.sin((pan + 1) * np.pi / 4) * g
        buf[0, i0:i0 + len(x)] += x * l; buf[1, i0:i0 + len(x)] += x * r
        if verb: s.send[0, i0:i0 + len(x)] += x * l * verb; s.send[1, i0:i0 + len(x)] += x * r * verb
    def drum(s, x, at, g, pan=0.0, verb=0.05):
        if x is s.kit.kick or x is s.kit.taiko: s.kicks.append(at); g *= 0.6
        elif x is s.kit.hat or x is s.kit.ohat or x is s.kit.shaker or x is s.kit.rim: g *= 2.0
        s._add(s.dr, x, at, g, pan, verb)
    def music(s, x, at, g, pan=0.0, verb=0.15): s._add(s.bus, x, at, g, pan, verb)
    def pad(s, b0, bi, sec, inst, g):
        ms = s.chord(bi, 3, 0)
        x = inst(ms, s.bar * 1.02)
        if sec == 'intro': x = sweep(x, 400, 1800)
        s.music(x, b0, g * (0.8 if sec == 'intro' else 1.0), verb=0.3)
    def hook(s, b0, bi, sec, inst, g):
        if sec == 'intro' and s.n == 0 and bi < -2: return         # Kodak: keep the first bars clear for the voice
        g *= 1.7
        for j, st in enumerate(s.hook_rh):
            d = (s.hook_deg[j] + (0 if bi % 2 == 0 or j < len(s.hook_rh) - 2 else -2))
            nxt = s.hook_rh[j + 1] if j + 1 < len(s.hook_rh) else 16
            m = deg(s.scale, s.root, d)
            s.music(inst(m, (nxt - st) * s.st * 0.95), b0 + st * s.st, g * (0.75 if sec != 'drop' else 1.0), pan=0.15, verb=0.3)

def render(n):
    A = Arranger(n); p = PLAN[n]
    first = -int(np.ceil(HIT / A.bar))
    for bi in range(first, int((DUR - HIT) / A.bar) + 2):
        b0 = HIT + bi * A.bar
        if b0 >= DUR: break
        sec = 'intro' if bi < 0 else 'outro' if b0 >= OUTRO - A.bar * 0.25 else 'drop'
        A.writer(A, b0, bi, sec)
        if sec != 'drop':                                           # a lighter pulse so the intro and the close still move
            lift = 1.0 if sec == 'outro' else 0.55 + 0.45 * (bi - first) / max(1, -first)
            for s_ in range(0, 16, 2): A.drum(A.kit.hat, b0 + s_ * A.st, 0.07 * lift, pan=0.3 * (-1) ** s_)
            for s_ in (4, 12): A.drum(A.kit.rim, b0 + s_ * A.st, 0.1 * lift)
            if A.n != 0: A.drum(A.kit.kick, b0, 0.55 * lift); A.drum(A.kit.kick, b0 + 2 * A.beat, 0.4 * lift)
            A.music(sub(A.chord_root(bi) - 12, A.bar * 0.9), b0, 0.25 * lift)
    # build into the drop: riser + snare roll, then a beat of air; impact on the hit; final chord on the outro
    t = tt(A.bar); u = t / t[-1]
    A.music(sweep(A.rng.uniform(-1, 1, len(t)), 300, 9000) * u ** 2 * 0.5, HIT - A.bar, 1.0, verb=0.4)
    for j in range(16): A.drum(A.kit.snare, HIT - A.bar + A.bar * (1 - 0.5 ** (j / 3.0)), 0.1 + 0.25 * j / 16)
    i0, i1 = int((HIT - A.beat * 0.5) * SR), int(HIT * SR); A.bus[:, i0:i1] *= 0.15; A.dr[:, i0:i1] *= 0.0
    A.music(impact(), HIT, 1.0, verb=0.5); A.drum(A.kit.kick, HIT, 1.0)
    A.music(supersaw(A.chord(0, 4, 0), 3.4, 3000, 0.01), DUR - 3.6, 0.3, verb=0.6)
    # sound design locked to the picture
    for c in CUTS: A.music(whoosh(0.3), c - 0.22, 0.22, pan=0.2 * np.sin(c))
    for a, b, nch in p['typed']:
        for j in range(int(nch)): A.music(click(), a + (b - a) * j / max(1, nch), 0.28, pan=0.3 * (-1) ** j)
        A.music(pop(700), b + 0.12, 0.35)
    # mix: sidechain the music on kicks, reverb, glue
    tg = np.arange(N) / SR; pump = np.ones(N)
    for k in sorted(A.kicks):
        i = int(k * SR); seglen = min(N - i, int(0.25 * SR))
        if 0 <= i < N: pump[i:i + seglen] = np.minimum(pump[i:i + seglen], 1 - 0.5 * np.exp(-np.arange(seglen) / SR / 0.07))
    music = A.bus * pump + A.dr + np.stack([reverb(A.send[0], 1), reverb(A.send[1], 2)]) * 1.4
    music = np.stack([filt(music[0], 28, 'high'), filt(music[1], 28, 'high')])
    music = music - 0.55 * np.stack([filt(music[0], 140), filt(music[1], 140)])   # tame the low end so hooks and hats read
    ref = np.sqrt(np.mean(music[:, int(HIT * SR):int(OUTRO * SR)] ** 2)) + 1e-9
    music = np.tanh(music / ref * 0.2 * 1.6) / np.tanh(1.6) * 0.95 / 0.95
    if n == 0:                                                     # Kodak keeps voice 03, music ducks under it
        raw = f'{ROOT}/narracion/raw/03.mp3'; voice = np.zeros(N)
        for at, (a, b) in zip(PH, speech_segments(raw)):
            v = np.array(decode(raw, 1.0, a, b)); i0 = int(at * SR); voice[i0:i0 + len(v)] += v[: N - i0]
        e = np.sqrt(np.convolve(voice ** 2, np.ones(2205) / 2205, 'same'))
        g = filt(np.where(e > 0.02, 0.4, 1.0), 6)
        music = music * g + voice * 1.2
    out = np.tanh(music * 1.2) / np.tanh(1.2) * 0.97
    out *= np.minimum(1, (DUR - tg) / 0.4)                         # fade the tail
    os.makedirs(f'{ROOT}/public/audio/m', exist_ok=True)
    with wave.open(f'{ROOT}/public/audio/m/{n + 1:03d}.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out.T * 32000).astype('<i2').tobytes())
    return {'genre': A.name, 'bpm': A.bpm}

if __name__ == '__main__':
    a, b = (int(x) for x in sys.argv[1:3]) if len(sys.argv) > 2 else (0, 99)
    path = f'{ROOT}/src/hundred/music.json'; meta = json.load(open(path)) if os.path.exists(path) else [{}] * 100
    for n in range(a, b + 1):
        meta[n] = render(n); print(n + 1, meta[n], flush=True)
    json.dump(meta, open(path, 'w'))
