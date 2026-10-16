import { readerAvatars } from './reader-avatars.ts';

type Realtime = typeof import('@supabase/realtime-js');

/**
 * A shared, anonymous count of visible browsers, across pages and languages.
 * JS is necessary to receive live state on this static site. readers-loader.mjs
 * defers this entire entry until load + five seconds + browser idle. The SDK
 * is another dynamic chunk, requested only when the browser is idle again.
 */
export function mountOnlineReaders(
  element: HTMLElement,
  loadRealtime: () => Promise<Pick<Realtime, 'RealtimeClient'>> = () => import('@supabase/realtime-js'),
) {
  const doc = element.ownerDocument;
  const win = doc.defaultView!;
  const label = element.querySelector<HTMLElement>('[data-readers-label]')!;
  const { url, key, lang, sprite } = element.dataset;
  if (!url || !key?.startsWith('sb_publishable_')) return;
  const crowd = element.querySelector<HTMLElement>('[data-readers-crowd]');
  const renderAvatars = crowd && sprite ? readerAvatars(crowd, sprite) : undefined;

  let client: InstanceType<Realtime['RealtimeClient']> | undefined;
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
    // Stop the transport at once, including offline/pagehide; also tear down
    // channel retry timers. Do not keep working in a background tab.
    if (previous) {
      void previous.removeAllChannels().catch(() => {});
      void previous.disconnect().catch(() => {});
    }
  }

  async function connect() {
    idle = fallback = undefined;
    if (!active()) { pending = false; return; }
    const current = generation;
    try {
      const { RealtimeClient } = await loadRealtime();
      if (current !== generation || !active()) return;
      // One random key per browser, shared by tabs. Never send names, page
      // paths, emails or account IDs. Storage-disabled browsers still work.
      let visitor: string = win.crypto.randomUUID();
      try {
        const stored = win.localStorage.getItem('shluchim-presence-id');
        if (stored && /^[\da-f-]{36}$/i.test(stored)) visitor = stored;
        else win.localStorage.setItem('shluchim-presence-id', visitor);
      } catch { /* With blocked storage, count this tab only. */ }
      const connection = new RealtimeClient(url!, { params: { apikey: key! } });
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
        const count = Object.keys(state).length; // keys, not per-tab entries
        const text = lang === 'he'
          ? `${count.toLocaleString('he-IL')} ${count === 1 ? 'קורא כאן עכשיו' : 'קוראים כאן עכשיו'}`
          : `${count.toLocaleString('en')} ${count === 1 ? 'reader here now' : 'readers here now'}`;
        if (label.textContent !== text) label.textContent = text;
        renderAvatars?.(Object.keys(state));
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
    else fallback = win.setTimeout(() => { void connect(); }, 3000);
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
    doc.removeEventListener('visibilitychange', visibility);
    win.removeEventListener('offline', suspend);
    win.removeEventListener('online', schedule);
    win.removeEventListener('pagehide', pagehide);
    win.removeEventListener('pageshow', pageshow);
  };
}
