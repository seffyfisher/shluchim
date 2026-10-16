/** Serialized into the delayed GA loader. No imports, DOM scans, observers or per-element listeners.
 * JS is necessary to measure interactions; all handlers are passive and never wait for delivery.
 */
export function installInteractions() {
  const options = { capture: true, passive: true };
  const path = (value) => {
    try {
      const url = new URL(value, location.href);
      return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : undefined;
    } catch { return undefined; }
  };
  const report = (element, action, extra = {}) => {
    try {
      const group = element.closest('[data-analytics-content]');
      const section = element.closest('header,footer,main');
      const link = element.closest('a[href]');
      window.gtag('event', 'select_content', {
        content_type: group?.dataset.analyticsContent || element.tagName.toLowerCase(),
        item_id: link ? path(link.href) : element.dataset.analyticsId || element.id ||
          element.getAttribute('popovertarget') || element.classList[0] || element.tagName.toLowerCase(),
        action,
        placement: section?.tagName.toLowerCase() || 'page',
        language: document.documentElement.lang,
        ...extra,
      });
    } catch { /* Measurement must never break the reader's action, even if GA is blocked. */ }
  };
  document.addEventListener('click', (event) => {
    const element = event.target.closest?.('a[href],button,summary');
    if (!element || element.disabled || element.getAttribute('aria-hidden') === 'true') return;
    if (element.tagName === 'A') {
      let url;
      try { url = new URL(element.href, location.href); } catch { return; }
      if (!/^https?:$/.test(url.protocol)) return; // Never collect mailto/tel addresses.
      // GA4 Enhanced Measurement owns outbound clicks and its supported file extensions.
      if (url.origin !== location.origin || /\.(pdf|xlsx?|docx?|txt|rtf|csv|exe|key|pp[stx]*|7z|pkg|rar|gz|zip|avi|mov|mp4|mpe?g|wmv|midi?|mp3|wav|wma)$/i.test(url.pathname)) return;
      report(element, 'navigate', { link_url: path(element.href),
        // Only same-page fragments are useful for in-page navigation; never send query strings.
        ...(url.pathname === location.pathname && url.hash ? { item_id: url.pathname + url.hash } : {}),
      });
    } else if (element.tagName === 'SUMMARY') {
      report(element, element.parentElement.open ? 'close' : 'open');
    } else {
      if (element.type === 'submit' && element.form?.method !== 'dialog') return;
      report(element, element.dataset.analyticsAction || 'click');
    }
  }, options);
  document.addEventListener('change', (event) => {
    const element = event.target;
    // Only these enumerated choices; never read arbitrary form fields or their labels.
    if (element.matches('.theme-option input') && ['light', 'dark', 'system'].includes(element.value)) {
      report(element, 'change', { content_type: 'theme', item_id: element.value });
    } else if (element.matches('.fb-rate input') && ['helped', 'not_really'].includes(element.value)) {
      report(element, 'change', { content_type: 'feedback', item_id: element.value });
    }
  }, options);
  document.addEventListener('submit', (event) => {
    if (event.target.matches('.fb-form')) report(event.target, 'submit');
  }, options);
  // Components emit only outcomes, after their normal UI work. No dependency on GA being present.
  document.addEventListener('analytics:result', (event) => {
    if (['success', 'error', 'slow'].includes(event.detail)) {
      report(event.target, 'result', { result: event.detail });
    }
  }, options);
  for (const [eventName, action] of [['play', 'play'], ['ended', 'complete']]) {
    document.addEventListener(eventName, (event) => {
      if (event.target.matches?.('audio,video')) {
        report(event.target, action, { item_id: path(event.target.currentSrc) });
      }
    }, options);
  }
}
