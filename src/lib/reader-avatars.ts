const VARIANTS = 128;
const SHAPES = 8;
const EXPRESSIONS = VARIANTS / SHAPES;
const COLORS = 3600;
const SVG_NS = 'http://www.w3.org/2000/svg';
export const MAX_READER_AVATARS = 500;

/** Bound decorative DOM even when an untrusted public channel reports a crowd. */
export function readerAvatars(crowd: HTMLElement, sprite: string) {
  const readers = new Map<string, { svg: SVGSVGElement; variant: number; color: number }>();
  return (keys: string[]) => {
    keys = keys.slice(0, MAX_READER_AVATARS);
    const present = new Set(keys);
    for (const [key, reader] of readers) {
      if (!present.has(key)) { reader.svg.remove(); readers.delete(key); }
    }
    const used = new Set([...readers.values()].map(reader => reader.variant));
    const expressions = new Set([...readers.values()].map(reader => Math.floor(reader.variant / SHAPES)));
    const colors = new Set([...readers.values()].map(reader => reader.color));
    const fragment = crowd.ownerDocument.createDocumentFragment();
    for (const key of keys.toSorted()) {
      if (readers.has(key)) continue;
      let hash = 2166136261;
      for (const character of key) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
      let variant = (hash >>> 0) % VARIANTS;
      // Give each of the first 16 readers a different expression, then use
      // the remaining shape/expression combinations before repeating.
      if (expressions.size < EXPRESSIONS) {
        // Keep the hashed shape when moving to another expression.
        while (expressions.has(Math.floor(variant / SHAPES))) variant = (variant + SHAPES) % VARIANTS;
      } else {
        while (used.size < VARIANTS && used.has(variant)) variant = (variant + 1) % VARIANTS;
      }
      used.add(variant);
      expressions.add(Math.floor(variant / SHAPES));
      let color = (hash >>> 8) % COLORS;
      // Resolve hue collisions with a large step to keep new colours varied.
      while (colors.size < COLORS && colors.has(color)) color = (color + 1379) % COLORS;
      colors.add(color);
      const svg = crowd.ownerDocument.createElementNS(SVG_NS, 'svg');
      const use = crowd.ownerDocument.createElementNS(SVG_NS, 'use');
      // The external symbol owns its centred viewBox. The outer viewport
      // starts at zero, otherwise the nested symbol is translated and clipped.
      svg.setAttribute('viewBox', '0 0 316 316');
      svg.setAttribute('width', '32');
      svg.setAttribute('height', '32');
      svg.setAttribute('style', `--reader-hue: ${color / 10}`);
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      use.setAttribute('href', `${sprite}#reader-${variant}`);
      svg.append(use);
      readers.set(key, { svg, variant, color });
      fragment.append(svg);
    }
    crowd.append(fragment);
  };
}
