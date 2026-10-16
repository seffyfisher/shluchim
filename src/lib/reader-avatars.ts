const VARIANTS = 128;
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Reconcile one actual Bloub SVG per Presence key, retaining existing nodes. */
export function readerAvatars(crowd: HTMLElement, sprite: string) {
  const readers = new Map<string, { svg: SVGSVGElement; variant: number }>();
  return (keys: string[]) => {
    const present = new Set(keys);
    for (const [key, reader] of readers) {
      if (!present.has(key)) { reader.svg.remove(); readers.delete(key); }
    }
    const used = new Set([...readers.values()].map(reader => reader.variant));
    const fragment = crowd.ownerDocument.createDocumentFragment();
    for (const key of keys.toSorted()) {
      if (readers.has(key)) continue;
      let hash = 2166136261;
      for (const character of key) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
      let variant = (hash >>> 0) % VARIANTS;
      // Prefer different faces while the repertoire has unused combinations.
      while (used.size < VARIANTS && used.has(variant)) variant = (variant + 1) % VARIANTS;
      used.add(variant);
      const svg = crowd.ownerDocument.createElementNS(SVG_NS, 'svg');
      const use = crowd.ownerDocument.createElementNS(SVG_NS, 'use');
      // The external symbol owns its centred viewBox. The outer viewport
      // starts at zero, otherwise the nested symbol is translated and clipped.
      svg.setAttribute('viewBox', '0 0 316 316');
      svg.setAttribute('width', '36');
      svg.setAttribute('height', '36');
      use.setAttribute('href', `${sprite}#reader-${variant}`);
      svg.append(use);
      readers.set(key, { svg, variant });
      fragment.append(svg);
    }
    crowd.append(fragment);
  };
}
