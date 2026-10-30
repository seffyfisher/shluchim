// Native popover handles opening/closing. A small post-only script adds wheel,
// double-click/tap and pinch zoom, which HTML/CSS cannot implement.
import { isExternalLink } from './links.mjs';
export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const IMAGE_LABELS = {
  he: { open: 'הגדלת תמונה', close: 'סגירה', reset: 'איפוס', original: 'מקור', hint: 'צביטה, לחיצה כפולה או גלגלת על התמונה להגדלה. גרירה להזזה.', keyboard: 'הגדלת תמונה: פלוס ומינוס להגדלה, חצים להזזה ו־0 לאיפוס.' },
  en: { open: 'Enlarge image', close: 'Close', reset: 'Reset', original: 'Original', hint: 'Pinch, double-tap or scroll over the image to zoom. Drag to move.', keyboard: 'Image zoom: use +, −, arrow keys and 0 to reset.' },
  ar: { open: 'تكبير الصورة', close: 'إغلاق', reset: 'إعادة الضبط', original: 'الأصل', hint: 'قرّب بإصبعيك أو انقر مرتين أو مرّر فوق الصورة للتكبير. اسحب للتحريك.', keyboard: 'تكبير الصورة: استخدم + و− والأسهم للتنقل و0 لإعادة الضبط.' },
};
export const imageLabels = (lang = 'he') => IMAGE_LABELS[lang] ?? IMAGE_LABELS.he;

export function imagePopover({ id, src, alt = '', lang = 'he' }) {
  const l = imageLabels(lang);
  const target = escapeHtml(id);
  // Phrasing elements keep the viewer valid even inside a Markdown paragraph.
  return `<span id="${target}" class="image-viewer" popover role="dialog" aria-label="${l.open}" tabindex="-1">` +
    `<span class="image-viewer-tools"><button type="button" class="image-viewer-reset">${l.reset}</button>` +
    `<a href="${escapeHtml(src)}"${isExternalLink(src) ? ' target="_blank" rel="noopener"' : ''}>${l.original}</a>` +
    `<button type="button" popovertarget="${target}" popovertargetaction="hide" autofocus>${l.close}</button></span>` +
    `<span class="image-viewer-scroll" tabindex="0" aria-label="${l.keyboard}"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" draggable="false"></span>` +
    `<span class="image-viewer-hint">${l.hint}</span></span>`;
}

export function imageViewer(thumbnail, options) {
  const l = imageLabels(options.lang);
  return `<button class="image-enlarge" type="button" popovertarget="${escapeHtml(options.id)}" aria-label="${escapeHtml(`${l.open}${options.alt ? `: ${options.alt}` : ''}`)}">${thumbnail}</button>` + imagePopover(options);
}
