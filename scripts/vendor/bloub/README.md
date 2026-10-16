# Bloub engine (build-time only)

Source: https://github.com/jeremy-prt/bloub
Commit: `b4bb3c1b5f93c7b87a2e8d620f667c4093d97749` (2026-10-16 checkout).
Copyright Jérémy Perret, MIT; the full license is in `LICENSE` and in the
generated sprite. Only non-test `src/bot/*.ts` files are copied here.

Relative imports have `.ts` extensions so Node's native type stripping can
run the generator; redundant blank lines at EOF are trimmed. Geometry and facial expressions are
upstream code, including its eye-fitting corrections.

Run `npm run readers:avatars` after updating this snapshot. It uses BotEngine
to generate 8 bodies and eyes for 128 shapes/expressions in `src/assets/bloub-readers.svg`. The SVG
is committed, and Vite gives it a content-hashed URL. Neither this engine nor
Vue is imported by the website. The site assembles transparent eye masks and
adds finite CSS blinking and gentle gaze drift, with different timing per reader.
The tighter 240-unit viewport makes eyes legible in the same single-row band.
One IntersectionObserver pauses characters clipped by the scroller or outside
the viewport; background tabs and reduced-motion preferences stay still. One
shared timer triggers occasional gestures and pauses in the background: an
infinite SVG-mask animation kept the renderer busy between blinks. CSS renders
the gestures, with no JavaScript on animation frames.
Without IntersectionObserver, faces remain visible and static. The CSS motion
adapts the upstream idle behaviour; it does not replay its 14-state editor or
run its engine, Vue, a per-reader animation loop, or another dependency.
