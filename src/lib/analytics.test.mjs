import { test } from 'node:test';
import assert from 'node:assert';
import vm from 'node:vm';
import { gtagSnippet } from './analytics.ts';

const ID = 'G-TEST123';
const ORIGIN = 'https://blog.example.test';

/** Minimal element stub: enough of closest()/dataset/classList for the delegated tracker's simple selectors. */
function el(tag, { cls = [], data = {}, attrs = {}, parent = null } = {}) {
  const node = { tagName: tag.toUpperCase(), classList: cls, dataset: data, parentElement: parent, id: '',
    getAttribute: (name) => attrs[name] ?? null };
  if (attrs.href) node.href = new URL(attrs.href, ORIGIN).href;
  const matches = (n, sel) => {
    const m = /^([a-z]*)((?:\.[\w-]+)*)((?:\[[\w-]+\])*)$/.exec(sel.trim());
    if (!m) throw new Error(`unsupported selector ${sel}`);
    const [, t, classes, props] = m;
    if (t && n.tagName !== t.toUpperCase()) return false;
    if (classes && !classes.slice(1).split('.').every((c) => n.classList.includes(c))) return false;
    return [...props.matchAll(/\[([\w-]+)\]/g)].every(([, a]) => a === 'class' ? n.classList.length > 0
      : a.startsWith('data-') ? n.dataset[a.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] !== undefined
      : n.getAttribute(a) !== null);
  };
  node.closest = (sel) => {
    for (let n = node; n; n = n.parentElement) if (sel.split(',').some((part) => matches(n, part))) return n;
    return null;
  };
  return node;
}
const click = (win, target) => win.interactionListeners.click.fn({ target });
const events = (win) => win.dataLayer.filter((a) => a[0] === 'event').map((a) => a[2]);

/** Runs the snippet in a stub browser and records what it does. */
function run({ readyState = 'loading', idle = true, id = ID, pathname = '/' } = {}) {
  const appended = [], listeners = {}, interactionListeners = {}, idleQueue = [], timers = [];
  const win = {
    document: { readyState, head: { appendChild: (el) => appended.push(el) }, createElement: () => ({}),
      documentElement: { lang: 'he' },
      addEventListener: (type, fn, opts) => { interactionListeners[type] = { fn, opts }; } },
    location: new URL(pathname, ORIGIN),
    addEventListener: (type, fn) => { listeners[type] = fn; },
    setTimeout: (fn, ms) => timers.push({ fn, ms }),
  };
  if (idle) win.requestIdleCallback = (fn, opts) => idleQueue.push({ fn, opts });
  win.window = win;
  vm.runInNewContext(gtagSnippet(id), Object.assign(win, { document: win.document, encodeURIComponent, Date, URL }));
  win.interactionListeners = interactionListeners;
  return { win, appended, listeners, interactionListeners, idleQueue, timers };
}

test('gtag.js is not requested while the page is loading', () => {
  const { appended, listeners, idleQueue, timers } = run();
  assert.equal(appended.length, 0);
  assert.equal(idleQueue.length, 0);
  assert.equal(timers.length, 0);
  assert.equal(typeof listeners.load, 'function', 'waits for the load event');
});

test('after load it waits five seconds and then an idle moment before requesting gtag.js', () => {
  const { appended, listeners, idleQueue, timers } = run();
  listeners.load();
  assert.equal(appended.length, 0, 'nothing is appended straight from the load event');
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 5000);
  assert.equal(idleQueue.length, 0);
  timers[0].fn();
  assert.equal(idleQueue.length, 1);
  assert.equal(idleQueue[0].opts?.timeout, undefined, 'never forces the download into a busy interval');
  idleQueue[0].fn();
  assert.equal(appended.length, 1);
  assert.equal(appended[0].async, true);
  assert.equal(appended[0].fetchPriority, 'low');
  assert.equal(appended[0].src, `https://www.googletagmanager.com/gtag/js?id=${ID}`);
});

test('without requestIdleCallback it falls back to a timer, not to loading at once', () => {
  const { appended, listeners, timers } = run({ idle: false });
  listeners.load();
  assert.equal(appended.length, 0);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 5000);
  timers[0].fn();
  assert.equal(timers.length, 2);
  assert.ok(timers[1].ms >= 1000);
  timers[1].fn();
  assert.equal(appended.length, 1);
});

test('a page that is already complete schedules the settling period without waiting for load', () => {
  const { appended, listeners, idleQueue, timers } = run({ readyState: 'complete' });
  assert.equal(listeners.load, undefined);
  assert.equal(appended.length, 0);
  assert.equal(timers.length, 1);
  timers[0].fn();
  assert.equal(idleQueue.length, 1);
});

test('the dataLayer is queued up front with real arguments objects, in the order gtag.js expects', () => {
  const { win } = run();
  const q = win.dataLayer.map((a) => Array.from(a));
  assert.equal(q.length, 2);
  assert.equal(q[0][0], 'js'); assert.ok(q[0][1] instanceof Date);
  assert.equal(q[1][0], 'config');
  assert.equal(q[1][1], ID);
  assert.equal(typeof win.gtag, 'function', 'window.gtag stays available for custom events');
  win.gtag('event', 'x');
  assert.deepEqual(Array.from(win.dataLayer[2]), ['event', 'x']);
});

test('advertising identifiers and personalization are disabled before gtag.js loads', () => {
  const { win, appended } = run();
  const config = win.dataLayer.find((a) => a[0] === 'config')[2];
  assert.equal(config?.allow_google_signals, false);
  assert.equal(config?.allow_ad_personalization_signals, false);
  assert.equal(appended.length, 0);
});

test('a repeated load notification cannot request the library twice', () => {
  const { appended, listeners, idleQueue, timers } = run();
  listeners.load();
  listeners.load();
  assert.equal(timers.length, 1);
  timers[0].fn();
  for (const task of idleQueue) task.fn();
  assert.equal(appended.length, 1);
});

test('the ID can never close the script tag', () => {
  assert.ok(!gtagSnippet('</script><script>alert(1)</script>').includes('</script>'));
});

test('interaction listeners are installed at once, passive and delegated, while gtag.js still waits', () => {
  const { interactionListeners, appended, timers, idleQueue } = run();
  assert.deepEqual(Object.keys(interactionListeners).sort(), ['analytics:result', 'change', 'click', 'ended', 'play', 'submit']);
  for (const handler of Object.values(interactionListeners)) {
    assert.equal(handler.opts.passive, true);
    assert.equal(handler.opts.capture, true);
  }
  assert.equal(appended.length + timers.length + idleQueue.length, 0, 'load timing is unchanged');
});

test('clicks before gtag.js is ready are queued and delivered in order once it loads', () => {
  const { win, listeners, timers, idleQueue, appended } = run({ pathname: '/posts/2026-10-12-dial-bot/' });
  const main = el('main');
  const idea = el('section', { data: { analyticsContent: 'idea' }, parent: main });
  const button = el('button', { cls: ['idea-copy'], data: { analyticsAction: 'copy' }, attrs: { type: 'button' }, parent: idea });
  click(win, button); // Before load: GA is nowhere near ready.
  win.interactionListeners['analytics:result'].fn({ target: button, detail: 'success' });
  assert.equal(appended.length, 0, 'gtag.js not requested yet');
  // Stand-in for gtag.js: it replays dataLayer in order when it arrives, then handles new pushes directly.
  const hits = [];
  const library = () => { for (const a of win.dataLayer) hits.push(Array.from(a)); win.dataLayer.push = (a) => hits.push(Array.from(a)); };
  listeners.load(); timers[0].fn(); idleQueue[0].fn();
  assert.equal(appended.length, 1);
  library();
  click(win, button);
  assert.deepEqual(hits.map((h) => h[0] === 'event' ? `${h[2].action}${h[2].result ? '=' + h[2].result : ''}` : h[0]),
    ['js', 'config', 'copy', 'result=success', 'copy']);
  const [copy, result] = hits.slice(2).map((h) => h[2]);
  assert.equal(hits[2][1], 'select_content');
  assert.deepEqual({ ...result }, { content_type: 'idea', item_id: 'idea-copy', action: 'result', placement: 'main',
    site_language: 'he', post_slug: '2026-10-12-dial-bot', result: 'success' });
  assert.equal(copy.post_slug, '2026-10-12-dial-bot');
});

test('copy and feedback events carry post_slug on post pages only', () => {
  for (const [pathname, slug] of [['/en/posts/2026-10-12-my-shluchim-can-make-phone-calls/', '2026-10-12-my-shluchim-can-make-phone-calls'], ['/about/', undefined], ['/', undefined]]) {
    const { win } = run({ pathname });
    const follow = el('div', { data: { analyticsContent: 'follow' }, parent: el('footer') });
    click(win, el('button', { cls: ['follow-copy'], data: { analyticsAction: 'copy' }, attrs: { type: 'button' }, parent: follow }));
    const fb = el('section', { data: { analyticsContent: 'feedback' }, parent: el('main') });
    const form = el('form', { cls: ['fb-form'], data: { analyticsId: 'post' }, parent: fb });
    win.interactionListeners['analytics:result'].fn({ target: form, detail: 'success' });
    const input = Object.assign(el('input', { parent: el('div', { cls: ['fb-rate'], parent: form }) }), { value: 'helped', matches: (s) => s === '.fb-rate input' });
    win.interactionListeners.change.fn({ target: input });
    const rows = events(win);
    assert.deepEqual(rows.map((r) => r.content_type), ['follow', 'feedback', 'feedback']);
    assert.deepEqual(rows.map((r) => r.post_slug), [slug, slug, slug], pathname);
    if (!slug) assert.ok(rows.every((r) => !('post_slug' in r)));
  }
});

test('post_slug is not added to other content types', () => {
  const { win } = run({ pathname: '/posts/2026-10-12-dial-bot/' });
  click(win, el('summary', { parent: el('details', { parent: el('main') }) }));
  click(win, el('a', { attrs: { href: '/about/' }, parent: el('nav', { cls: ['post-foot'], parent: el('main') }) }));
  assert.ok(events(win).every((r) => !('post_slug' in r)));
});

test('internal links carry a label naming their group', () => {
  const { win } = run({ pathname: '/posts/2026-10-12-dial-bot/' });
  const main = el('main'), footer = el('footer');
  const cases = [
    [el('a', { attrs: { href: '/topics/x/' }, parent: el('nav', { cls: ['links', 'topics'], data: { analyticsLabel: 'footer_topics' }, parent: footer }) }), 'footer_topics'],
    [el('a', { attrs: { href: '/posts/b/' }, parent: el('h3', { parent: el('li', { parent: el('ul', { parent: el('aside', { cls: ['related'], parent: main }) }) }) }) }), 'related'],
    [el('a', { attrs: { href: '/posts/c/' }, parent: el('h3', { parent: el('li', { parent: el('ol', { cls: ['stories'], parent: main }) }) }) }), 'stories'],
    [el('a', { attrs: { href: '/friends/' }, parent: el('p', { parent: el('div', { cls: ['prose'], parent: main }) }) }), 'prose'],
    [el('a', { attrs: { href: '#main' }, parent: el('body') }), 'other'],
  ];
  for (const [link] of cases) click(win, link);
  const rows = events(win);
  assert.deepEqual(rows.map((r) => r.label), cases.map(([, l]) => l));
  assert.ok(rows.every((r) => r.action === 'navigate' && r.content_type === 'a'));
  assert.equal(rows[1].item_id, `${ORIGIN}/posts/b/`, 'item_id shape unchanged');
});

test('mailto clicks are tracked without the address; tel and outbound links are not', () => {
  const { win } = run({ pathname: '/about/' });
  const prose = el('article', { cls: ['prose'], parent: el('main') });
  for (const href of ['mailto:private@example.com', 'tel:123', 'https://example.com/', '/file.pdf']) {
    click(win, el('a', { attrs: { href }, parent: prose }));
  }
  const rows = events(win);
  assert.equal(rows.length, 1, JSON.stringify(rows));
  assert.deepEqual({ ...rows[0] }, { content_type: 'a', item_id: 'mailto', action: 'email', placement: 'main', site_language: 'he', label: 'prose' });
  assert.ok(!JSON.stringify(rows).includes('private'));
});
