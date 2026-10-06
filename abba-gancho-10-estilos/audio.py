# Sound design for the 10 hooks (stdlib only): low pulse building tension, whooshes on cuts,
# counter ticks, a shimmer for the camera, a dry hit on "quiebra" (6.7 s) then near-silence.
# python3 audio.py  → public/audio/<id>.wav for every style (each with its own tone)
import math, random, struct, wave, os
SR, DUR = 44100, 10.0
N = int(SR * DUR)
HIT, CUTS = 6.7, [1.5, 3.0, 4.5, 6.0, 8.5]
STYLES = ['01-particulas', '02-collage-revista', '03-dato-como-arte', '04-objeto-3d', '05-tipografia-3d',
          '06-viaje-en-el-tiempo', '07-personajes', '08-pizarra-de-estrategia', '09-split-screen', '10-metafora-minimal']

def render(idx):
    random.seed(idx); out = [0.0] * N
    root = [41, 38, 43, 36, 40, 39, 45, 42, 37, 33][idx]           # MIDI note of the pulse, different per style
    soft = idx == 9                                                  # the minimal version stays very quiet
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    def add(t0, dur, fn, g):
        i0 = int(t0 * SR)
        for i in range(max(0, min(int(dur * SR), N - i0))): out[i0 + i] += g * fn(i / SR)
    # pulse: heartbeat-like, accelerating towards the hit
    t, beat = 0.0, 0.75
    while t < HIT - 0.05:
        add(t, .5, lambda x, f=hz(root): math.sin(2 * math.pi * f * x) * math.exp(-7 * x) + .4 * math.sin(4 * math.pi * f * x) * math.exp(-12 * x), .5 if not soft else .25)
        t += beat; beat = max(.36, beat * .95)
    # rising pad under the whole build-up
    add(0, HIT, lambda x: (math.sin(2 * math.pi * hz(root + 24) * x) + .5 * math.sin(2 * math.pi * hz(root + 31) * x)) * (x / HIT) ** 2, .07)
    # whooshes into every cut
    for c in CUTS:
        lp = [0.0]
        def wh(x, d=.4, lp=lp): lp[0] += (.02 + .35 * x / d) * (random.uniform(-1, 1) - lp[0]); return lp[0] * math.sin(math.pi * x / d) ** 2
        add(c - .4, .4, wh, .35 if not soft else .15)
    # counter ticks (1.1 → 2.7 s)
    for k in range(10): add(1.15 + k * .16, .03, lambda x: random.uniform(-1, 1) * math.exp(-160 * x), .18)
    # shimmer when the camera appears
    add(3.6, 1.6, lambda x: sum(math.sin(2 * math.pi * hz(root + 48 + d) * x) for d in (0, 4, 7, 12)) / 4 * math.exp(-1.8 * x) * min(1, x * 20), .14)
    # the hit: sub drop + dry crack, then silence
    add(HIT, 2.2, lambda x: math.sin(2 * math.pi * (35 * x + 70 / 6 * (1 - math.exp(-6 * x)))) * math.exp(-2.2 * x), 1.0 if not soft else .55)
    add(HIT, .25, lambda x: random.uniform(-1, 1) * math.exp(-22 * x), .7 if not soft else .3)
    # outro: low drone fading + a soft click (drawer / light off) at 9.0 s
    add(8.5, 1.5, lambda x: math.sin(2 * math.pi * hz(root) * x) * math.exp(-1.5 * x), .12)
    add(9.0, .06, lambda x: random.uniform(-1, 1) * math.exp(-90 * x), .25)
    peak = max(abs(s) for s in out) or 1; fade = int(.3 * SR)
    os.makedirs('public/audio', exist_ok=True)
    with wave.open(f'public/audio/{STYLES[idx]}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(29000 * math.tanh(1.3 * s / peak) / math.tanh(1.3) * min(1, (N - i) / fade))) for i, s in enumerate(out)))

for i in range(len(STYLES)): render(i)
print('ok', len(STYLES))
