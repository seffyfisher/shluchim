import { writeFileSync } from 'node:fs';
import { BotEngine } from './vendor/bloub/engine.ts';
import { SHAPES } from './vendor/bloub/skins.ts';
import { EXPRESSIONS } from './vendor/bloub/expressions.ts';
import { RAYON, DEMI_VIEWBOX } from './vendor/bloub/repere.ts';

// Render actual Bloub geometry once, instead of shipping Vue or running the
// engine for every connected visitor. Idle poses only need body and eye holes.
const definitions = [], symbols = [];
for (let expression = 0; expression < EXPRESSIONS.length; expression++) {
  for (let shape = 0; shape < SHAPES.length; shape++) {
    const index = expression * SHAPES.length + shape;
    const frame = new BotEngine(RAYON, 'idle', SHAPES[shape].radii, EXPRESSIONS[expression]).sample(0);
    if (expression === 0) definitions.push(`<path id="body-${shape}" d="${frame.bodyPath}"/>`);
    const eyes = frame.eyes.map(eye => `<path d="${eye.d}" transform="${eye.matrix}" opacity="${eye.alpha}"/>`).join('');
    definitions.push(`<mask id="eyes-${index}" maskUnits="userSpaceOnUse" x="-${DEMI_VIEWBOX}" y="-${DEMI_VIEWBOX}" width="${DEMI_VIEWBOX * 2}" height="${DEMI_VIEWBOX * 2}"><rect x="-${DEMI_VIEWBOX}" y="-${DEMI_VIEWBOX}" width="${DEMI_VIEWBOX * 2}" height="${DEMI_VIEWBOX * 2}" fill="white"/><g fill="black">${eyes}</g></mask>`);
    symbols.push(`<symbol id="reader-${index}" viewBox="-${DEMI_VIEWBOX} -${DEMI_VIEWBOX} ${DEMI_VIEWBOX * 2} ${DEMI_VIEWBOX * 2}"><use href="#body-${shape}" fill="currentColor" mask="url(#eyes-${index})"/></symbol>`);
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg"><!-- Bloub by Jérémy Perret, MIT. Source and full license: /licenses/bloub.txt. Generated from b4bb3c1; do not edit by hand. --><defs>${definitions.join('')}</defs>${symbols.join('')}</svg>\n`;
writeFileSync(new URL('../src/assets/bloub-readers.svg', import.meta.url), svg);
console.log(`Generated ${symbols.length} Bloub reader avatars (${Buffer.byteLength(svg)} bytes).`);
