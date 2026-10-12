// CSS/native popover own presentation. JS is needed only for pointer gestures,
// focal-point zoom and panning; no dependency or background animation loop.
type Point = { x: number; y: number };
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));

for (const viewer of document.querySelectorAll<HTMLElement>('.image-viewer')) {
  const stage = viewer.querySelector<HTMLElement>('.image-viewer-scroll')!;
  const img = stage.querySelector<HTMLImageElement>('img')!;
  let initialized = false;
  const initialize = () => {
    if (viewer.matches(':popover-open') && !initialized) {
      initialized = true;
      setup(viewer, stage, img);
    }
  };
  viewer.addEventListener('toggle', initialize);
  initialize(); // The module is fetched lazily, so the first popover may already be open.
}

function setup(viewer: HTMLElement, stage: HTMLElement, img: HTMLImageElement) {
  let width = 0, height = 0, scale = 1, x = 0, y = 0, fit = 1, maximum = 4;
  let frame = 0, moved = false, started = 0, touchZoomAt = -Infinity, tapOrigin: Point | undefined;
  let lastTap: { at: number; point: Point } | undefined;
  const pointers = new Map<number, Point>();
  let pinch: { distance: number; mid: Point } | undefined;
  const local = (event: { clientX: number; clientY: number }): Point => {
    const rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const paint = () => {
    x = width * scale <= stage.clientWidth ? (stage.clientWidth - width * scale) / 2 : clamp(x, stage.clientWidth - width * scale, 0);
    y = height * scale <= stage.clientHeight ? (stage.clientHeight - height * scale) / 2 : clamp(y, stage.clientHeight - height * scale, 0);
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      viewer.toggleAttribute('data-zoomed', scale > 1);
    });
  };
  const reset = () => { scale = 1; paint(); };
  const zoom = (next: number, point: Point) => {
    const bounded = clamp(next, 1, maximum);
    x = point.x - (point.x - x) * bounded / scale;
    y = point.y - (point.y - y) * bounded / scale;
    scale = bounded;
    paint();
  };
  const toggleZoom = (point: Point) => scale > 1 ? reset() : zoom(Math.max(2, 1 / fit), point);
  const resize = () => {
    if (!viewer.matches(':popover-open') || !img.naturalWidth) return;
    viewer.setAttribute('data-gestures', '');
    const styles = getComputedStyle(viewer);
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const horizontal = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight) + parseFloat(styles.borderLeftWidth) + parseFloat(styles.borderRightWidth);
    const vertical = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom) + parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    const gaps = (parseFloat(styles.rowGap) || 0) * 2;
    const availableWidth = Math.max(1, Math.min(innerWidth - 2 * fontSize, 100 * fontSize) - horizontal);
    const minimumWidth = Math.min(300, availableWidth);
    viewer.style.width = `${Math.max(minimumWidth, Math.min(img.naturalWidth, availableWidth)) + horizontal}px`;
    for (let pass = 0; pass < 2; pass++) {
      const availableHeight = Math.max(1, innerHeight - 2 * fontSize - vertical - gaps - viewer.querySelector<HTMLElement>('.image-viewer-tools')!.offsetHeight - viewer.querySelector<HTMLElement>('.image-viewer-hint')!.offsetHeight);
      fit = Math.min(1, availableWidth / img.naturalWidth, availableHeight / img.naturalHeight);
      width = img.naturalWidth * fit; height = img.naturalHeight * fit;
      viewer.style.width = `${Math.max(minimumWidth, width) + horizontal}px`;
    }
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    stage.style.height = `${height}px`;
    stage.style.width = '100%';
    maximum = Math.max(4, 1 / fit);
    pointers.clear(); pinch = undefined; lastTap = undefined;
    reset();
  };
  const observer = new ResizeObserver(resize);
  const open = () => { observer.observe(document.documentElement); resize(); };
  viewer.addEventListener('toggle', () => {
    if (viewer.matches(':popover-open')) open();
    else { observer.disconnect(); pointers.clear(); pinch = undefined; viewer.removeAttribute('data-dragging'); }
  });
  img.addEventListener('load', resize);
  if (img.complete) open();
  else observer.observe(document.documentElement);
  viewer.querySelector('.image-viewer-reset')!.addEventListener('click', reset);
  stage.addEventListener('wheel', (event) => {
    if (event.target !== img || !width) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
    zoom(scale * Math.exp(-clamp(delta, -100, 100) / 200), local(event));
  }, { passive: false });
  stage.addEventListener('dblclick', (event) => {
    if (performance.now() - touchZoomAt < 400) return;
    event.preventDefault(); toggleZoom(local(event));
  });
  const geometry = () => {
    const [a, b] = [...pointers.values()];
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  };
  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !width) return;
    const point = local(event);
    if (pointers.size === 0) { moved = false; started = performance.now(); tapOrigin = point; }
    pointers.set(event.pointerId, point);
    stage.setPointerCapture(event.pointerId);
    if (event.pointerType === 'touch') event.preventDefault();
    if (pointers.size === 2) { pinch = geometry(); moved = true; }
    viewer.toggleAttribute('data-dragging', scale > 1);
  });
  stage.addEventListener('pointermove', (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const point = local(event);
    pointers.set(event.pointerId, point);
    if (tapOrigin && Math.hypot(point.x - tapOrigin.x, point.y - tapOrigin.y) > 6) moved = true;
    if (pointers.size === 2 && pinch) {
      const next = geometry();
      x += next.mid.x - pinch.mid.x; y += next.mid.y - pinch.mid.y;
      if (pinch.distance > 0) zoom(scale * next.distance / pinch.distance, next.mid);
      pinch = next;
    } else if (pointers.size === 1 && scale > 1) {
      x += point.x - previous.x; y += point.y - previous.y; paint();
    }
  });
  const end = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId); pinch = undefined;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (!pointers.size) {
      viewer.removeAttribute('data-dragging');
      if (event.type === 'pointerup' && event.pointerType === 'touch' && !moved && performance.now() - started < 300) {
        const point = local(event), at = performance.now();
        if (lastTap && at - lastTap.at < 350 && Math.hypot(point.x - lastTap.point.x, point.y - lastTap.point.y) < 24) {
          toggleZoom(point); touchZoomAt = at; lastTap = undefined;
        } else lastTap = { at, point };
      }
    }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('lostpointercapture', end);
  stage.addEventListener('keydown', (event) => {
    const center = { x: stage.clientWidth / 2, y: stage.clientHeight / 2 };
    if (event.key === '+' || event.key === '=') zoom(scale * 1.25, center);
    else if (event.key === '-' || event.key === '_') zoom(scale / 1.25, center);
    else if (event.key === '0') reset();
    else if (scale > 1 && event.key.startsWith('Arrow')) {
      x += event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0;
      y += event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0; paint();
    } else return;
    event.preventDefault();
  });
}
