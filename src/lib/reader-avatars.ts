const VARIANTS = 128;
const SHAPES = 8;
const EXPRESSIONS = VARIANTS / SHAPES;
const COLORS = 3600;
const SVG_NS = 'http://www.w3.org/2000/svg';
export const MAX_READER_AVATARS = 500;
let sequence = 0;

/** Bound decorative DOM even when an untrusted public channel reports a crowd. */
export function readerAvatars(crowd: HTMLElement, sprite: string) {
  const doc = crowd.ownerDocument;
  const win = doc.defaultView;
  const readers = new Map<string, { svg: SVGSVGElement; variant: number; color: number }>();
  const visible = new Set<SVGSVGElement>();
  const observed = new WeakSet<SVGSVGElement>();
  const gestures = new WeakMap<SVGSVGElement, { delay: number; period: number; next: number; look: boolean; blinkUntil: number; lookUntil: number }>();
  const reduced = win?.matchMedia?.('(prefers-reduced-motion: reduce)');
  let disposed = false;
  let timer: number | undefined;
  const active = () => !disposed && doc.visibilityState === 'visible' && !reduced?.matches;
  const stop = (svg: SVGSVGElement) => {
    svg.removeAttribute('data-blinking'); svg.removeAttribute('data-looking');
    const gesture = gestures.get(svg)!;
    gesture.blinkUntil = gesture.lookUntil = 0;
  };
  const wake = (svg: SVGSVGElement) => {
    stop(svg);
    if (!active()) return;
    const gesture = gestures.get(svg)!;
    const now = win!.performance.now();
    gesture.next = now + gesture.delay;
    gesture.lookUntil = now + 1200;
    gesture.look = false;
    svg.setAttribute('data-looking', '');
  };
  // Infinite SVG-mask animations keep the renderer busy even while eyes are
  // still between blinks. One shared timer starts occasional finite CSS
  // gestures instead; no JavaScript runs on animation frames.
  function schedule() {
    win?.clearTimeout(timer); timer = undefined;
    if (!active() || !visible.size) return;
    const next = Math.min(...[...visible].map(svg => {
      const gesture = gestures.get(svg)!;
      return Math.min(gesture.next, gesture.blinkUntil || Infinity, gesture.lookUntil || Infinity);
    }));
    timer = win!.setTimeout(tick, Math.max(1, next - win!.performance.now()));
  }
  function tick() {
    timer = undefined;
    if (!active()) return;
    const now = win!.performance.now();
    for (const svg of visible) {
      const gesture = gestures.get(svg)!;
      if (gesture.blinkUntil && gesture.blinkUntil <= now + 1) { svg.removeAttribute('data-blinking'); gesture.blinkUntil = 0; }
      if (gesture.lookUntil && gesture.lookUntil <= now + 1) { svg.removeAttribute('data-looking'); gesture.lookUntil = 0; }
      if (gesture.next > now + 1) continue;
      svg.setAttribute('data-blinking', '');
      gesture.blinkUntil = now + 180;
      if (gesture.look) { svg.setAttribute('data-looking', ''); gesture.lookUntil = now + 1200; }
      gesture.look = !gesture.look;
      gesture.next = now + gesture.period;
    }
    schedule();
  }
  const moving = (svg: SVGSVGElement) => svg.toggleAttribute('data-moving', visible.has(svg) && doc.visibilityState === 'visible');
  // CSS cannot pause a time-based animation when its icon is clipped by a
  // horizontal scroller. One observer bounds work to the visible characters.
  const Observer = win?.IntersectionObserver;
  const observer = Observer ? new Observer(entries => {
    for (const entry of entries) {
      const svg = entry.target as SVGSVGElement;
      if (disposed || !observed.has(svg)) continue;
      if (entry.isIntersecting) {
        if (!visible.has(svg)) { visible.add(svg); wake(svg); }
      } else { visible.delete(svg); stop(svg); }
      moving(svg);
    }
    schedule();
  }) : undefined;
  const visibility = () => {
    for (const svg of visible) { wake(svg); moving(svg); }
    schedule();
  };
  if (observer) {
    doc.addEventListener('visibilitychange', visibility);
    reduced?.addEventListener?.('change', visibility);
  }
  const node = (name: string, attributes: Record<string, string>) => {
    const element = doc.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    return element;
  };

  function update(keys: string[]) {
    if (disposed) return;
    keys = keys.slice(0, MAX_READER_AVATARS);
    const present = new Set(keys);
    for (const [key, reader] of readers) {
      if (!present.has(key)) {
        observer?.unobserve(reader.svg); observed.delete(reader.svg); visible.delete(reader.svg);
        reader.svg.remove(); readers.delete(key);
      }
    }
    const used = new Set([...readers.values()].map(reader => reader.variant));
    const expressions = new Set([...readers.values()].map(reader => Math.floor(reader.variant / SHAPES)));
    const colors = new Set([...readers.values()].map(reader => reader.color));
    const fragment = doc.createDocumentFragment();
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
      const svg = node('svg', { viewBox: '-120 -120 240 240', width: '40', height: '40' }) as SVGSVGElement;
      const maskId = `online-reader-eyes-${sequence++}`;
      svg.setAttribute('style', `--reader-hue: ${color / 10}`);
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      const definitions = node('defs', {});
      const mask = node('mask', { id: maskId, maskUnits: 'userSpaceOnUse', x: '-120', y: '-120', width: '240', height: '240', style: 'mask-type: luminance' });
      mask.append(node('rect', { x: '-120', y: '-120', width: '240', height: '240', fill: 'white' }));
      const gaze = node('g', { class: 'reader-gaze', fill: 'black' });
      for (let side = 0; side < 2; side++) {
        const blink = node('g', { class: 'reader-blink' });
        blink.append(node('use', { href: `${sprite}#eye-${variant}-${side}` }));
        gaze.append(blink);
      }
      mask.append(gaze); definitions.append(mask);
      svg.append(definitions);
      svg.append(node('use', { href: `${sprite}#body-${variant % SHAPES}`, fill: 'currentColor', mask: `url(#${maskId})` }));
      readers.set(key, { svg, variant, color });
      fragment.append(svg);
      gestures.set(svg, { delay: 700 + (hash >>> 0) % 1800, period: 5000 + (hash >>> 8) % 2500, next: 0, look: false, blinkUntil: 0, lookUntil: 0 });
      observed.add(svg);
      observer?.observe(svg);
    }
    crowd.append(fragment);
    if (observer) schedule();
  }
  return { update, dispose() {
    disposed = true;
    win?.clearTimeout(timer);
    observer?.disconnect();
    if (observer) {
      doc.removeEventListener('visibilitychange', visibility);
      reduced?.removeEventListener?.('change', visibility);
    }
    for (const svg of visible) { svg.removeAttribute('data-moving'); stop(svg); }
    visible.clear();
  } };
}
