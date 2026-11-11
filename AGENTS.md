<!-- givemotion:start -->
# Videos with givemotion

Videos in this folder are made with givemotion (HTML + CSS + JS in, MP4 out). Before writing or editing a composition, read
`.agents/skills/givemotion/SKILL.md` (the same pack is in `.claude/skills/givemotion/`). Paths below are relative to this folder.

Loop: plan a shot list (time, what is on screen, camera, transition per scene) → write the `.html` →
`npx givemotion check video.html` (fix every error) → `npx givemotion snapshot video.html` (open `snapshots/sheet.png` and look) →
`npx givemotion render video.html -o out/video.mp4`.

## What to read: technique recipes

| Your video has… | Read |
|---|---|
| A logo, brand sting, intro or end card | `.agents/skills/givemotion/references/techniques/logo-reveal.md` |
| Big type that slams, stacks, rotates; a headline as the star | `.agents/skills/givemotion/references/techniques/kinetic-type.md` |
| Text reveals: words/chars, typewriter, write-on, scramble, highlight | `.agents/skills/givemotion/references/techniques/text-reveals.md` |
| Camera moves: push, follow, whip, bank, zoom to a detail, shake | `.agents/skills/givemotion/references/techniques/camera-moves.md` |
| Several scenes handing over (push, whip, morph, shape wipes) | `.agents/skills/givemotion/references/techniques/scene-transitions.md` |
| Glow, light sweeps, gradients, grain, blur, depth | `.agents/skills/givemotion/references/techniques/light-and-depth.md` |
| Numbers, counters, bar/line charts, callouts | `.agents/skills/givemotion/references/techniques/numbers-and-charts.md` |
| Lines that draw, routes, maps, pins, something travelling a path | `.agents/skills/givemotion/references/techniques/paths-and-maps.md` |
| Flat shapes: grow, squash, split, orbit, morph | `.agents/skills/givemotion/references/techniques/shapes-and-motion-graphics.md` |
| An app/UI with a cursor, clicks, typing, lists | `.agents/skills/givemotion/references/techniques/ui-demo.md` |
| Code in an editor, typing, line highlights | `.agents/skills/givemotion/references/techniques/code-on-screen.md` |
| Impact and energy: slams, shake, bursts, music beats | `.agents/skills/givemotion/references/techniques/impacts-and-energy.md` |
| Word-by-word captions, vertical 9:16 clips | `.agents/skills/givemotion/references/techniques/captions-vertical.md` |
| Whiteboard, sketch, hand-drawn | `.agents/skills/givemotion/references/techniques/hand-drawn.md` |
| A living background behind everything | `.agents/skills/givemotion/references/techniques/backgrounds-and-ambient.md` |

## API reference (look up when needed)

| When… | Read |
|---|---|
| An attribute, preset, easing name, preset CSS or block | `.agents/skills/givemotion/references/api.md` |
| `gm.timeline` in full: positions, keyframes, labels, `gm.fly`, SVG | `.agents/skills/givemotion/references/timeline.md` |
| `gm.camera` worlds, shots, `gm.path.travel`, riding, parallax | `.agents/skills/givemotion/references/camera.md` |
| `gm.chart.*`, chart blocks | `.agents/skills/givemotion/references/charts.md` |
| Diagrams, arrows, `data-sketch`, `gm.connect`, `gm.shape`, path morphs | `.agents/skills/givemotion/references/diagrams.md` |
| Music, beats, voice-over + `givemotion words`, video clips, captions | `.agents/skills/givemotion/references/media-audio.md` |
| Data/templates, `<gm-include>` (scope, scenes, brand kit), blocks, highlight, cursor | `.agents/skills/givemotion/references/data-templates.md` |
| `gm.onFrame`, canvas, three.js, `gm.burst`, springs, noise, random, Lottie | `.agents/skills/givemotion/references/javascript.md` |
| Render options, transparency, cache | `.agents/skills/givemotion/references/output.md` |
| Reviewing frames, learning from a reference video | `.agents/skills/givemotion/references/review.md` |
| A check code | `.agents/skills/givemotion/references/check-codes.md` |
| Motion principles in depth (optional) | `.agents/skills/givemotion/references/motion-design.md`; genre structures in `.agents/skills/givemotion/references/genres/` |
<!-- givemotion:end -->
