# Final audio for each hook: ElevenLabs narration placed on the timeline + ElevenLabs music (ducked under the voice,
# stopped with a tape-stop on "quiebra") + sound effects. Then muxes it into out/<id>.mp4 without re-rendering video.
#   python3 narracion/mix.py            → all 10
#   python3 narracion/mix.py 03         → just one
import array, math, os, random, re, subprocess, sys, wave

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HIT, CUTS, DUR = 6.7, [1.5, 3.0, 4.5, 6.0, 8.5], 10.0
STYLES = {  # id: (narration file, music file)
    '01-particulas': ('01', 'synthwave'), '02-collage-revista': ('02', 'playful'), '03-dato-como-arte': ('03', 'lofi'),
    '04-objeto-3d': ('04', 'minimalpop'), '05-tipografia-3d': ('05', 'disco'), '06-viaje-en-el-tiempo': ('06', 'synthwave'),
    '07-personajes': ('07', 'playful'), '08-pizarra-de-estrategia': ('08', 'lofi'), '09-split-screen': ('09', 'disco'),
    '10-metafora-minimal': ('10', 'minimalpop'),
}

def decode(path, tempo=1.0, start=None, end=None):
    """Decode (a slice of) an audio file to mono float samples, optionally time-stretched without pitch change."""
    cmd = ['ffmpeg', '-v', 'error']
    if start is not None: cmd += ['-ss', f'{start:.3f}', '-to', f'{end:.3f}']
    cmd += ['-i', path, '-ac', '1', '-ar', str(SR)]
    if tempo != 1.0: cmd += ['-af', f'atempo={tempo:.4f}']
    cmd += ['-f', 's16le', '-']
    a = array.array('h', subprocess.run(cmd, capture_output=True, check=True).stdout)
    return [s / 32768 for s in a]

def speech_segments(path):
    """Split a narration take into its 4 spoken phrases, at the 3 longest pauses (finer detection if a pause is short)."""
    seg = _segments(path, '-38dB', 0.12)
    if len(seg) == 3:  # two sentences ran together: split the longest phrase at its quietest 40 ms in the middle third
        k = max(range(3), key=lambda i: seg[i][1] - seg[i][0]); a, b = seg[k]
        x = decode(path, 1.0, a, b); w = int(0.04 * SR)
        lo, hi = len(x) // 3, 2 * len(x) // 3
        cut = min(range(lo, hi - w, w // 2), key=lambda i: sum(v * v for v in x[i:i + w]))
        t = a + (cut + w / 2) / SR
        seg = seg[:k] + [(a, t), (t, b)] + seg[k + 1:]
    return seg

def _segments(path, noise, dur):
    log = subprocess.run(['ffmpeg', '-v', 'info', '-i', path, '-af', f'silencedetect=n={noise}:d={dur}', '-f', 'null', '-'], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout)
    sil = list(zip(starts, ends + [total] * (len(starts) - len(ends))))
    head = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0                       # leading silence
    tail = sil[-1][0] if sil and sil[-1][1] >= total - 0.05 else total          # trailing silence
    inner = sorted([s for s in sil if s[0] > head + 0.05 and s[1] < tail - 0.05], key=lambda s: s[1] - s[0], reverse=True)[:3]
    cuts = sorted(inner)
    bounds, cur = [], head
    for a, b in cuts: bounds.append((cur, a)); cur = b
    bounds.append((cur, tail))
    return bounds

def place(track, samples, at, gain=1.0):
    i0 = int(at * SR)
    for i, s in enumerate(samples):
        if 0 <= i0 + i < len(track): track[i0 + i] += s * gain

def narration(code):
    path = f'{ROOT}/narracion/raw/{code}.mp3'
    seg = speech_segments(path)
    if len(seg) != 4: raise SystemExit(f'{code}: expected 4 phrases, found {len(seg)} {seg}')
    d = [b - a for a, b in seg]
    voice = [0.0] * int(DUR * SR)
    # phrases 1+2 ("1975." "Kodak era intocable.") in 0–3 s; phrase 3 in 3–5.9 s; phrase 4 lands "quiebra" on the hit
    tA = min(1.35, max(1.0, (d[0] + d[1]) / 2.75))
    tB = min(1.35, max(1.0, d[2] / 2.7))
    tC = min(1.3, max(1.0, d[3] / 2.2))
    p1, p2 = decode(path, tA, *seg[0]), decode(path, tA, *seg[1])
    place(voice, p1, 0.08); place(voice, p2, 0.08 + len(p1) / SR + 0.1)
    place(voice, decode(path, tB, *seg[2]), 3.1)
    p4 = decode(path, tC, *seg[3])
    start4 = min(6.7, max(5.9, HIT + 0.05 - (len(p4) / SR - 0.62)))         # "quiebra" ≈ last 0.62 s of the phrase
    place(voice, p4, start4)
    return voice, (tA, tB, tC, start4)

def music(name):
    m = decode(f'{ROOT}/narracion/musica/{name}.mp3')[: int(DUR * SR)]
    m += [0.0] * (int(DUR * SR) - len(m))
    # tape stop: playback speed ramps to 0 over 0.45 s ending on the hit, then silence
    ts, te = int((HIT - 0.45) * SR), int(HIT * SR)
    out, pos = m[:ts], float(ts)
    for i in range(ts, te):
        speed = 1 - (i - ts) / (te - ts)
        j = int(pos); out.append(m[j] * (0.4 + 0.6 * speed) if j < len(m) else 0.0); pos += speed
    out += [0.0] * (len(m) - len(out))
    peak = max(abs(s) for s in out) or 1
    return [s / peak for s in out]

def sfx():
    random.seed(5)
    fx = [0.0] * int(DUR * SR)
    def add(t0, dur, fn, g):
        i0 = int(t0 * SR)
        for i in range(min(int(dur * SR), len(fx) - i0)): fx[i0 + i] += g * fn(i / SR)
    for c in CUTS:  # whoosh into each cut
        lp = [0.0]
        def wh(x, d=.35, lp=lp): lp[0] += (.03 + .3 * x / d) * (random.uniform(-1, 1) - lp[0]); return lp[0] * math.sin(math.pi * x / d) ** 2
        add(c - .35, .35, wh, .5)
    for k in range(10): add(1.15 + k * .16, .03, lambda x: random.uniform(-1, 1) * math.exp(-160 * x), .25)  # counter ticks
    add(HIT, 1.8, lambda x: math.sin(2 * math.pi * (38 * x + 60 / 6 * (1 - math.exp(-6 * x)))) * math.exp(-2.4 * x), .9)  # sub drop
    add(HIT, .2, lambda x: random.uniform(-1, 1) * math.exp(-25 * x), .5)                                       # dry crack
    add(9.0, .06, lambda x: random.uniform(-1, 1) * math.exp(-90 * x), .2)                                       # final click
    return fx

def envelope(x, win=0.05):
    n = int(win * SR); out = [0.0] * len(x); acc = 0.0
    for i, s in enumerate(x):
        acc += s * s - (x[i - n] ** 2 if i >= n else 0)
        out[i] = math.sqrt(max(acc, 0) / n)
    return out

def mix(sid):
    code, mname = STYLES[sid]
    voice, timing = narration(code)
    mus, fx = music(mname), sfx()
    env = envelope(voice)
    g, out = 0.5, []
    for i in range(len(voice)):
        target = 0.16 if env[i] > 0.02 else 0.42          # duck the music under the voice
        g += (target - g) * (0.0008 if target > g else 0.004)
        out.append(voice[i] * 1.0 + mus[i] * g + fx[i] * 0.55)
    peak = max(abs(s) for s in out) or 1
    norm = 0.97 / peak
    pcm = array.array('h', (int(32000 * math.tanh(s * norm * 1.2) / math.tanh(1.2)) for s in out))
    wav = f'{ROOT}/public/audio/{sid}.wav'
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    mp4 = f'{ROOT}/out/{sid}.mp4'; tmp = mp4 + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, mp4)
    print(sid, 'tempo/placement', [round(v, 2) for v in timing])

for sid in STYLES:
    if len(sys.argv) < 2 or any(sid.startswith(a) for a in sys.argv[1:]): mix(sid)
