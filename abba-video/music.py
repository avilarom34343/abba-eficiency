# 30 s, 120 BPM synth-pop loop (stdlib only). Beats land on the video's scene cuts (every 0.5 s).
import math, random, struct, wave
SR, DUR, B = 44100, 30, 0.5
N = SR * DUR
out = [0.0] * N
random.seed(7)

def add(t0, dur, fn, gain):
    i0 = int(t0 * SR)
    for i in range(min(int(dur * SR), N - i0)):
        out[i0 + i] += gain * fn(i / SR)

hz = lambda m: 440 * 2 ** ((m - 69) / 12)
kick = lambda t: math.sin(2 * math.pi * (50 * t + 100 / 30 * (1 - math.exp(-30 * t)))) * math.exp(-7 * t)
snare = lambda t: (random.uniform(-1, 1) * .8 + math.sin(2 * math.pi * 190 * t) * .5) * math.exp(-16 * t)
hat = lambda t: random.uniform(-1, 1) * math.exp(-70 * t)
crash = lambda t: random.uniform(-1, 1) * math.exp(-2.2 * t)
def tone(f, decay, harm=4):
    return lambda t: sum(math.sin(2 * math.pi * f * k * t) / k for k in range(1, harm + 1)) * math.exp(-decay * t)

prog = [[48, 52, 55, 60], [43, 47, 50, 55], [45, 48, 52, 57], [41, 45, 48, 53]]  # C G Am F
for bar in range(15):
    t_bar, chord = bar * 4 * B, prog[bar % 4]
    for step in range(16):  # 16ths
        t = t_bar + step * B / 4
        intro = t < 2.5
        if step % 4 == 0: add(t, .45, kick, .9)
        if step % 8 == 4 and not intro: add(t, .25, snare, .35)
        if step % 2 == 1: add(t, .06, hat, .12 if intro else .2)
        if step % 2 == 1 and not intro: add(t, .22, tone(hz(chord[0] - 12), 7, 3), .32)  # off-beat bass
        add(t, .2, tone(hz(chord[step % 4] + 12 + (12 if step % 8 > 3 else 0)), 14), .07 if intro else .1)
# intro riser into the ABBA drop + crashes on the big moments
add(0, 2.5, lambda t: (math.sin(2 * math.pi * (200 * t + 160 * t * t)) * .4 + random.uniform(-1, 1) * .3) * (t / 2.5) ** 2, .35)
for t in (2.5, 25, 27.5): add(t, 1.8, crash, .18)
for t in (5, 7, 9.5, 12, 14.5, 17, 19.5, 22.5):  # whoosh into each cut
    add(t - .3, .3, lambda x: random.uniform(-1, 1) * math.sin(math.pi * x / .3) ** 2, .12)
fade = int(.6 * SR)
peak = max(abs(math.tanh(s)) for s in out)
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(32000 * math.tanh(s) / peak * min(1, (N - i) / fade))) for i, s in enumerate(out)))
