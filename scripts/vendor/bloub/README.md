# Bloub engine (build-time only)

Source: https://github.com/jeremy-prt/bloub
Commit: `b4bb3c1b5f93c7b87a2e8d620f667c4093d97749` (2026-10-16 checkout).
Copyright Jérémy Perret, MIT; the full license is in `LICENSE` and in the
generated sprite. Only non-test `src/bot/*.ts` files are copied here.

Relative imports have `.ts` extensions so Node's native type stripping can
run the generator; redundant blank lines at EOF are trimmed. Geometry and facial expressions are
upstream code, including its eye-fitting corrections.

Run `npm run readers:avatars` after updating this snapshot. It uses BotEngine
to generate 128 shapes/expressions in `src/assets/bloub-readers.svg`. The SVG
is committed, and Vite gives it a content-hashed URL. Neither this engine nor
Vue is imported by the website. Animation is a finite CSS greeting; there is
no per-reader requestAnimationFrame loop or animation dependency.
