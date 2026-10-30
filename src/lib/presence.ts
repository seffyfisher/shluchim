import { readerAvatars, MAX_READER_AVATARS } from './reader-avatars.ts';
import { isLang, type Lang } from '../i18n/ui.ts';

const READER_ID = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

const PRESENCE_COPY: Record<Lang, { locale: string; solo: string; many: (n: string) => string; more: (extra: number) => string }> = {
  he: {
    locale: 'he-IL',
    solo: 'רק אתה כאן כרגע. אל דאגה, עוד רגע מישהו מצטרף.',
    many: (n) => `יש כאן עכשיו ${n} קוראים`,
    more: (extra) => `ועוד ${extra} קוראים`,
  },
  en: {
    locale: 'en',
    solo: "Just you here right now. Don't worry, someone will join soon.",
    many: (n) => `${n} readers here right now`,
    more: (extra) => `${extra} more readers`,
  },
  ar: {
    locale: 'ar-u-nu-latn',
    solo: 'أنت وحدك هنا الآن. لا تقلق، سينضم قارئ آخر بعد قليل.',
    many: (n) => `يوجد هنا الآن ${n} قراء`,
    more: (extra) => `و${extra} قراء آخرون`,
  },
};

type Realtime = typeof import('@supabase/realtime-js');

/**
 * A shared, anonymous count of visible browsers, across pages and languages.
 * JS is necessary to receive live state on this static site. readers-loader.mjs
 * defers this entire entry until load + half a second + browser idle. The SDK
 * is another dynamic chunk, requested only when the browser is idle again.
 */
export function mountOnlineReaders(
  element: HTMLElement,
  loadRealtime: () => Promise<Pick<Realtime, 'RealtimeClient'>> = () => import('@supabase/realtime-js'),
) {
  const doc = element.ownerDocument;
  const win = doc.defaultView!;
  const label = element.querySelector<HTMLElement>('[data-readers-label]')!;
  const overflow = element.querySelector<HTMLElement>('[data-readers-overflow]');
  const { url, key, lang, sprite } = element.dataset;
  if (!url || !key?.startsWith('sb_publishable_')) return;
  const crowd = element.querySelector<HTMLElement>('[data-readers-crowd]');
  const renderAvatars = crowd && sprite ? readerAvatars(crowd, sprite) : undefined;

  let client: InstanceType<Realtime['RealtimeClient']> | undefined;
  let reusableClient: typeof client;
  let stopping: Promise<unknown> | undefined;
  let pending = false, away = false;
  let generation = 0;
  let idle: number | undefined, fallback: number | undefined;
  const hide = () => element.removeAttribute('data-ready');
  const active = () => !away && doc.visibilityState === 'visible' && win.navigator.onLine;

  function suspend() {
    generation++;
    pending = false;
    hide();
    if (idle !== undefined) win.cancelIdleCallback(idle);
    win.clearTimeout(fallback);
    idle = fallback = undefined;
    const previous = client;
    client = undefined;
    // Close before queuing channel-leave frames: Phoenix waits for its send
    // buffer, and pagehide can freeze that wait in the back/forward cache.
    if (previous) {
      stopping = Promise.allSettled([previous.disconnect(), previous.removeAllChannels()])
        // Invalidate Phoenix's saved pageshow reconnect after teardown too.
        .then(() => previous.disconnect()).catch(() => {});
    }
  }

  async function connect() {
    idle = fallback = undefined;
    if (!active()) { pending = false; return; }
    const current = generation;
    try {
      const { RealtimeClient } = await loadRealtime();
      if (stopping) await stopping;
      if (current !== generation || !active()) return;
      // Share a daily random ID across tabs, not a permanent public browser ID.
      // Rotation happens on connection; an already-connected tab keeps its ID.
      // Never send names, page paths, emails or account IDs.
      let visitor: string = win.crypto.randomUUID();
      try {
        const day = new Date().toISOString().slice(0, 10);
        const stored = win.localStorage.getItem('shluchim-presence-id');
        const id = stored?.startsWith(`${day}:`) ? stored.slice(11) : undefined;
        if (id && READER_ID.test(id)) visitor = id;
        else win.localStorage.setItem('shluchim-presence-id', `${day}:${visitor}`);
      } catch { /* With blocked storage, count this tab only. */ }
      // Phoenix retains page lifecycle hooks. Reuse its client so restoring a
      // cached page cannot reconnect a discarded transport beside a new one.
      const connection = reusableClient ??= new RealtimeClient(url!, { params: { apikey: key! } });
      client = connection;
      pending = false;
      const channel = connection.channel('shluchim-online', {
        config: { presence: { key: visitor, enabled: true }, private: false },
      });
      let tracked = false;
      let subscription = 0;
      const render = () => {
        if (current !== generation || !tracked) return;
        const state = channel.presenceState();
        // Wait for our own presence to sync; never invent a count of one.
        if (!state[visitor]?.length) { hide(); return; }
        // Channel keys and metadata are public, attacker-controlled input.
        // Ignore metadata, malformed IDs and prototype property names entirely.
        const keys = Object.keys(state).filter(id => id.length === 36 && READER_ID.test(id));
        const count = keys.length; // keys, not per-tab entries
        const copy = PRESENCE_COPY[isLang(lang) ? lang : 'en'];
        const text = count === 1 ? copy.solo : copy.many(count.toLocaleString(copy.locale));
        if (label.textContent !== text) label.textContent = text;
        renderAvatars?.update(keys);
        if (overflow) {
          const extra = Math.max(0, count - MAX_READER_AVATARS);
          overflow.hidden = extra === 0;
          overflow.textContent = extra ? `+${extra.toLocaleString(copy.locale)}` : '';
          overflow.setAttribute('aria-label', copy.more(extra));
        }
        element.setAttribute('data-ready', '');
      };
      channel.on('presence', { event: 'sync' }, render).subscribe(async (status) => {
        if (current !== generation) return;
        const attempt = ++subscription;
        tracked = false;
        hide();
        if (status !== 'SUBSCRIBED') return;
        try {
          const result = await channel.track({});
          if (current !== generation || attempt !== subscription) return;
          tracked = result === 'ok';
          render();
        } catch { if (current === generation) suspend(); }
      });
    } catch { if (current === generation) suspend(); }
  }

  function schedule() {
    if (pending || client || !active()) return;
    pending = true;
    if (typeof win.requestIdleCallback === 'function') idle = win.requestIdleCallback(() => { void connect(); });
    else fallback = win.setTimeout(() => { void connect(); }, 250);
  }
  const visibility = () => active() ? schedule() : suspend();
  const pagehide = () => { away = true; suspend(); };
  const pageshow = () => { away = false; schedule(); };
  doc.addEventListener('visibilitychange', visibility);
  win.addEventListener('offline', suspend);
  win.addEventListener('online', schedule);
  win.addEventListener('pagehide', pagehide);
  win.addEventListener('pageshow', pageshow);
  schedule();

  return () => {
    away = true;
    suspend();
    renderAvatars?.dispose();
    doc.removeEventListener('visibilitychange', visibility);
    win.removeEventListener('offline', suspend);
    win.removeEventListener('online', schedule);
    win.removeEventListener('pagehide', pagehide);
    win.removeEventListener('pageshow', pageshow);
  };
}
