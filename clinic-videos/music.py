# Upbeat synth-pop bed + impacts for the clinic videos (stdlib only).
# python3 music.py <name> <seconds> <bpm> <root_midi> <cut times csv> [pop times csv]
import math, random, struct, sys, wave
name, DUR, BPM, ROOT = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4])
CUTS = [float(x) for x in sys.argv[5].split(',')]
POPS = [float(x) for x in sys.argv[6].split(',')] if len(sys.argv) > 6 else []
SR, B = 44100, 60 / BPM
N = int(SR * DUR); out = [0.0] * N
random.seed(ROOT)
def add(t0, dur, fn, gain):
    i0 = int(t0 * SR)
    for i in range(max(0, min(int(dur * SR), N - i0))): out[i0 + i] += gain * fn(i / SR)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
kick = lambda t: math.sin(2 * math.pi * (48 * t + 100 / 30 * (1 - math.exp(-30 * t)))) * math.exp(-7 * t)
clap = lambda t: random.uniform(-1, 1) * (math.exp(-25 * t) + .5 * math.exp(-60 * max(0, t - .012)))
hat = lambda t: random.uniform(-1, 1) * math.exp(-75 * t)
def tone(f, d, h=4): return lambda t: sum(math.sin(2 * math.pi * f * k * t) / k for k in range(1, h + 1)) * math.exp(-d * t)
def whoosh(d):
    lp = [0.0]
    def fn(t):
        lp[0] += (.03 + .3 * t / d) * (random.uniform(-1, 1) - lp[0]); return lp[0] * math.sin(math.pi * t / d) ** 2
    return fn
boom = lambda t: math.sin(2 * math.pi * (40 * t + 60 / 8 * (1 - math.exp(-8 * t)))) * math.exp(-3 * t)
pop = lambda t: math.sin(2 * math.pi * (900 + 1400 * math.exp(-40 * t)) * t) * math.exp(-30 * t)
prog = [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]]  # I vi IV V
intro = CUTS[0]
step, n = B / 4, 0
while n * step < DUR - .3:
    t, st = n * step, n % 16
    ch = prog[int(t / (4 * B)) % 4]
    if st % 4 == 0: add(t, .4, kick, .85 if t >= intro else .5)
    if t >= intro:
        if st in (4, 12): add(t, .2, clap, .25)
        if st % 2 == 1: add(t, .05, hat, .14)
        if st % 2 == 1: add(t, .2, tone(hz(ROOT - 12 + ch[0]), 8, 3), .3)
    add(t, .18, tone(hz(ROOT + 12 + ch[st % 3] + (12 if st % 8 > 4 else 0)), 15), .07)
    n += 1
add(0, intro, lambda t: random.uniform(-1, 1) * (t / intro) ** 2, .12)  # riser into the first cut
for c in CUTS:
    add(c, 1.2, boom, .5); add(max(0, c - .35), .35, whoosh(.35), .3)
for p in POPS: add(p, .12, pop, .2)
fade = int(.5 * SR); peak = max(abs(s) for s in out) or 1
with wave.open(name + '.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(30000 * math.tanh(1.4 * s / peak) / math.tanh(1.4) * min(1, (N - i) / fade))) for i, s in enumerate(out)))
