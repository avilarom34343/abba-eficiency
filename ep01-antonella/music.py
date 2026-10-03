# 45 s cinematic electronic score + UI sound design, stdlib only. 120 BPM; events match index.html timings.
import math, random, struct, wave
SR, DUR = 44100, 45
N = SR * DUR
out = [0.0] * N
random.seed(3)
TAB = 2048
saw = [sum(math.sin(2 * math.pi * k * i / TAB) / k for k in range(1, 7)) * .5 for i in range(TAB)]
sine = [math.sin(2 * math.pi * i / TAB) for i in range(TAB)]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def add(t0, dur, fn, gain):
    i0 = int(t0 * SR)
    for i in range(max(0, min(int(dur * SR), N - i0))):
        out[i0 + i] += gain * fn(i / SR)

def osc(table, f):
    step = f * TAB / SR
    return lambda t: table[int(t * SR * step) % TAB]

def pad(t0, dur, notes, gain, att=1.2, rel=1.5, table=saw):
    vs = [osc(table, hz(n) * d) for n in notes for d in (1, 1.004)]
    env = lambda t: min(1, t / att) * min(1, (dur - t) / rel)
    lp = [0.0]
    def fn(t):
        x = sum(v(t) for v in vs) / len(vs)
        lp[0] += .08 * (x - lp[0])  # one-pole lowpass for warmth
        return lp[0] * env(t)
    add(t0, dur, fn, gain)

kick = lambda t: math.sin(2 * math.pi * (45 * t + 110 / 28 * (1 - math.exp(-28 * t)))) * math.exp(-6 * t)
hat = lambda t: random.uniform(-1, 1) * math.exp(-80 * t)
click = lambda t: (math.sin(2 * math.pi * 2400 * t) + random.uniform(-.5, .5)) * math.exp(-140 * t)
def chime(f): return lambda t: (math.sin(2 * math.pi * f * t) + .4 * math.sin(2 * math.pi * f * 2.01 * t)) * math.exp(-5 * t)
def whoosh(d, up=True):
    lp = [0.0]
    def fn(t):
        x = t / d; c = .02 + .25 * (x if up else 1 - x)
        lp[0] += c * (random.uniform(-1, 1) - lp[0])
        return lp[0] * math.sin(math.pi * x) ** 2
    return fn
def pulse(f): return lambda t: math.sin(2 * math.pi * f * t) * math.exp(-9 * t)

# --- 0–13: mysterious, curious (A minor drone, sparse pulses)
pad(0, 13.4, [45, 52, 57], .5, att=2)
for t in [0.5, 1.5, 2.3, 3.1, 4.6, 5.6, 6.6, 7.6, 8.6, 10.2, 11.2, 12.2]:
    add(t, .6, pulse(hz(81 + random.choice([0, 3, 7, 10]))), .08)
for t in range(0, 13, 2): add(t, 1.2, pulse(55), .35)
# --- 13–36: build (Am F C G), kick from 13, hats from 17, arp rises
prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
for bar in range(6):
    t0 = 13 + bar * 2; ch = prog[bar % 4]
    pad(t0, 2.1, ch, .32, att=.3, rel=.4)
    for st in range(16):
        add(t0 + st * .125, .16, osc(saw, hz(ch[st % 3] + 12 + (12 if bar > 2 and st % 8 > 3 else 0))), .03 + .012 * bar)
for bar in range(6):  # 25–36 groove continues under phone + dashboard
    t0 = 25 + bar * 2; ch = prog[bar % 4]
    pad(t0, 2.1, ch, .3, att=.3, rel=.4)
    for st in range(16):
        add(t0 + st * .125, .16, osc(saw, hz(ch[st % 3] + 24 if st % 4 == 0 else ch[st % 3] + 12)), .08)
t = 13.0
while t < 41.9:
    add(t, .5, kick, .8 if t < 36 else .6)
    if t >= 17: add(t + .25, .05, hat, .12)
    add(t + .25, .25, osc(sine, hz(prog[int((t - 13) // 2) % 4][0] - 24)), .25)
    t += .5
# --- 36–42: resolution (F → G → C, brighter voicings)
pad(36, 2.1, [53, 57, 60, 64], .4, att=.2); pad(38, 2.1, [55, 59, 62, 67], .4, att=.2); pad(40, 3, [48, 55, 60, 64, 67], .45, att=.2)
# --- 42–45: logo: low boom + shimmering resolve
add(42, 3, lambda t: math.sin(2 * math.pi * 40 * t) * math.exp(-1.6 * t), .7)
pad(42, 3, [60, 64, 67, 72, 76], .35, att=.4, rel=1.6, table=sine)
# --- UI sound design
for t, d, up in [(3.8, .7, True), (9.4, .7, False), (12.4, .7, True), (23.6, .7, True), (30.6, .6, True), (35.3, .7, True), (41.7, .6, False)]:
    add(t, d, whoosh(d, up), .5)
for t in [2.3, 2.7, 6.8, 7.05, 7.3, 7.6, 10.1, 10.25, 13.6, 14.6, 15.6, 18.6, 19.6, 20.6, 21.6, 25.0, 25.75, 28.5, 31.3, 31.45, 31.6, 31.75, 32.7, 32.9, 33.1, 34.5, 34.6, 34.7]:
    add(t, .08, click, .25)
for t, f in [(7.9, 880), (11.2, 660), (16.1, 1320), (17.3, 1760), (26.2, 1320), (26.6, 1760), (28.8, 1175), (29.1, 1568), (29.6, 1320), (30.1, 1760)]:
    add(t, 1.2, chime(f), .1)
for t in [5.0, 22.4]: add(t, 1.6, lambda x: math.sin(2 * math.pi * (300 + 900 * x) * x) * math.sin(math.pi * x / 1.6) * .5, .12)  # scan / system-complete sweep

fade = int(1.2 * SR)
peak = max(abs(s) for s in out) or 1
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(30000 * math.tanh(1.3 * s / peak) / math.tanh(1.3) * min(1, (N - i) / fade))) for i, s in enumerate(out)))
