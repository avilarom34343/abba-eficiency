---
compositionId: bgm
duration_s: 25.0
canvas: {"w": 1080, "h": 1920, "fps": 30}
mode: autonomous
message: "Blockbuster pudo comprar Netflix por $50 M, dijo que no, y quebró"
style:
  font: "Barlow / IBM Plex Mono"
  palette: ["#111111", "#E85D26", "#F0ECE5", "#888880", "#282826"]
assets: false
build_notes: ["one paused timeline per frame", "no remote assets", "Spanish copy, lowercase display per preset", "vertical 1080x1920: keep hero text inside 90px side margins, nothing important below y=1600"]
avoid: ["generic slideshow", "tiny unreadable hero text", "real brand logos", "empty frames between hits"]
---

## Frame 1 — f1

- src: compositions/frames/01-f1.html
- duration: 7.55s
- span_sec: [0.0, 7.55]
- pacing: beat_cut
- mood: [tense, hype]
- feel: dense snare fill building under a filtered bed into the drop kick at 7.55

### Groups

- **g1** — free_design
  - span_sec: [0.0, 2.93]
  - free_design: { dominant_system: "giant year type + VHS cassette drawn in SVG sliding in", primitives: ["kinetic-letter-in", "slot-machine-reveal", "overlay-pop"], density_topology: "accumulate" }
  - anchors: [0.05, 0.51, 1.39, 2.04]
  - copy: ["2000", "blockbuster", "dallas, texas"]
- **g2** — free_design
  - span_sec: [2.93, 4.46]
  - free_design: { dominant_system: "count-up stat (installed component compositions/components/count-up.html) to 9,000 with a grid of tiny store icons filling behind", primitives: ["counting-punch", "color-grid-shuffle"], density_topology: "accumulate" }
  - anchors: [2.93, 3.11, 3.6, 3.69]
  - copy: ["9,000 tiendas", "blockbuster en su mejor momento"]
- **g3** — free_design
  - span_sec: [4.46, 7.55]
  - free_design: { dominant_system: "phone chat thread, bubbles pop one per hit (pattern of installed block compositions/message-thread-reveal.html), header 'junta de blockbuster'", primitives: ["staggered-reveal", "overlay-pop"], density_topology: "accumulate" }
  - anchors: [4.46, 5.13, 5.99, 6.66, 7.15]
  - copy: ["netflix se vende por $50 M.", "¿películas por correo?", "no, gracias."]

## Frame 2 — f2

- src: compositions/frames/02-f2.html
- duration: 7.68s
- span_sec: [7.55, 15.23]
- pacing: beat_cut
- mood: [aggressive, hype]
- feel: the drop: heavy kick-snare groove at full energy, a hit every eighth note

### Groups

- **g1** — free_design
  - span_sec: [7.55, 9.08]
  - free_design: { dominant_system: "headline slam of the single word NO. full-bleed on fire-orange register (installed component compositions/components/headline-slam.html) with screen shake and RGB split", primitives: ["braam-punch", "screen-shake", "chromatic-split", "radial-burst-lines"], density_topology: "single hit then hold" }
  - anchors: [7.55, 7.89, 8.2, 8.5]
  - copy: ["no.", "a comprar netflix por $50 M"]
- **g2** — free_design
  - span_sec: [9.08, 12.14]
  - free_design: { dominant_system: "kinetic type: one word per hit stacking into the sentence, keyword 'se rieron' recolored orange", primitives: ["content-swap", "kinetic-letter-in", "palette-flip"], density_topology: "accumulate then hold" }
  - anchors: [9.08, 9.45, 9.85, 10.24, 10.61, 11.01, 11.38]
  - copy: ["se rieron de netflix en la junta", "según el cofundador de netflix"]
- **g3** — free_design
  - span_sec: [12.14, 15.23]
  - free_design: { dominant_system: "iris-open reveal of a big play triangle + year roll 2000→2007 (slot machine digits)", primitives: ["iris-open", "slot-machine-reveal", "overlay-pop"], density_topology: "reveal then hold" }
  - anchors: [12.14, 12.54, 12.93, 13.7, 14.35]
  - copy: ["2007", "netflix lanza el streaming"]

## Frame 3 — f3

- src: compositions/frames/03-f3.html
- duration: 6.16s
- span_sec: [15.23, 21.39]
- pacing: beat_cut
- mood: [dark, cinematic]
- feel: second phrase of the groove, steady hits, dips at 19 then surges at 21

### Groups

- **g1** — free_design
  - span_sec: [15.23, 18.3]
  - free_design: { dominant_system: "decline chart: store count line drawing down from 9,000 (2004) to the 2010 bankruptcy, value counting down (installed component compositions/components/decline-chart.html)", primitives: ["value-counter", "directional-fill"], density_topology: "build then lock" }
  - anchors: [15.23, 15.63, 16.37, 16.77, 17.53]
  - copy: ["2010", "blockbuster se declara en quiebra", "9,000 → 0"]
- **g2** — free_design
  - span_sec: [18.3, 21.39]
  - free_design: { dominant_system: "map of the US west coast in dots, a single pin drops on Bend, Oregon with ripples, then a split stat card Blockbuster 1 tienda vs Netflix 300 M+ cuentas", primitives: ["overlay-pop", "staggered-reveal", "hard-cut"], density_topology: "reveal then compare" }
  - anchors: [18.3, 18.69, 19.06, 19.85, 20.62, 20.99]
  - copy: ["hoy queda 1 tienda", "bend, oregon", "blockbuster · 1 tienda", "netflix · 300 M+ cuentas"]

## Frame 4 — f4

- src: compositions/frames/04-f4.html
- duration: 3.61s
- span_sec: [21.39, 25.0]
- pacing: beat_cut
- mood: [cinematic]
- feel: outro breakdown, hits thin out, final kick at 24.45 then tail
### Groups

- **g1** — free_design
  - span_sec: [21.39, 25.0]
  - free_design: { dominant_system: "closing lockup: the lesson line lands word by word, keyword 'futuro' in fire-orange, then negative-space hold with the VHS cassette small under it", primitives: ["kinetic-letter-in", "negative-space-hold", "chrome-sweep"], density_topology: "land then hold" }
  - anchors: [21.39, 22.15, 22.92, 24.45]
  - copy: ["se rieron del futuro.", "blockbuster × netflix"]
