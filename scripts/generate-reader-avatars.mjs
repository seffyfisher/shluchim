import { writeFileSync } from 'node:fs';
import { BotEngine } from './vendor/bloub/engine.ts';
import { SHAPES } from './vendor/bloub/skins.ts';
import { EXPRESSIONS } from './vendor/bloub/expressions.ts';
import { RAYON } from './vendor/bloub/repere.ts';

// Use upstream body and eye geometry at build time, without shipping Vue or a
// per-reader engine. Idle faces need no margin for the editor's orbit effects.
// The website masks each body with these eyes and animates that mask with CSS.
const bodies = [], eyes = [];
for (let expression = 0; expression < EXPRESSIONS.length; expression++) {
  for (let shape = 0; shape < SHAPES.length; shape++) {
    const index = expression * SHAPES.length + shape;
    const frame = new BotEngine(RAYON, 'idle', SHAPES[shape].radii, EXPRESSIONS[expression]).sample(0);
    if (expression === 0) bodies.push(`<path id="body-${shape}" d="${frame.bodyPath}"/>`);
    frame.eyes.forEach((eye, side) => eyes.push(`<path id="eye-${index}-${side}" d="${eye.d}" transform="${eye.matrix}" opacity="${eye.alpha}"/>`));
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg"><!-- Bloub by Jérémy Perret, MIT. Source and full license: /licenses/bloub.txt. Generated from b4bb3c1; do not edit by hand. --><defs>${bodies.join('')}${eyes.join('')}</defs></svg>\n`;
writeFileSync(new URL('../src/assets/bloub-readers.svg', import.meta.url), svg);
console.log(`Generated ${bodies.length} Bloub bodies and ${eyes.length} eyes (${Buffer.byteLength(svg)} bytes).`);
