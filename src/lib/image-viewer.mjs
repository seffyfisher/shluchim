// Static HTML only: native popover handles opening, Escape and outside clicks;
// a checkbox and CSS handle zoom. Reuse the same URL to share the image cache.
export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const imageLabels = (lang) => lang === 'en'
  ? { open: 'Enlarge image', close: 'Close', zoom: 'Zoom', original: 'Open original image' }
  : { open: 'הגדלת תמונה', close: 'סגירה', zoom: 'זום', original: 'פתיחת התמונה המקורית' };

export function imagePopover({ id, src, alt = '', lang = 'he' }) {
  const l = imageLabels(lang);
  const target = escapeHtml(id);
  // Phrasing elements keep the viewer valid even inside a Markdown paragraph.
  return `<span id="${target}" class="image-viewer" popover role="dialog" aria-label="${l.open}" tabindex="-1">` +
    `<span class="image-viewer-tools"><label><input class="image-viewer-zoom" type="checkbox"> ${l.zoom}</label>` +
    `<a href="${escapeHtml(src)}" target="_blank" rel="noopener">${l.original}</a>` +
    `<button type="button" popovertarget="${target}" popovertargetaction="hide" autofocus>${l.close}</button></span>` +
    `<span class="image-viewer-scroll" tabindex="0"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></span></span>`;
}

export function imageViewer(thumbnail, options) {
  const l = imageLabels(options.lang);
  return `<button class="image-enlarge" type="button" popovertarget="${escapeHtml(options.id)}" aria-label="${escapeHtml(`${l.open}${options.alt ? `: ${options.alt}` : ''}`)}">${thumbnail}</button>` + imagePopover(options);
}
