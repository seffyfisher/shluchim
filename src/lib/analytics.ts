/**
 * Google Analytics 4 (gtag.js) loader that keeps the download out of the initial page-load path.
 *
 * The official snippet puts `<script async src=".../gtag/js">` in <head>: the download competes with the page's own
 * resources and ~100 KB of JS runs on the main thread while the page is still loading. Here:
 *  1. Inline, at once: only the tiny `dataLayer` / `gtag()` queue and the config call (no network).
 *     Google Signals and advertising personalization are disabled; first-party audience measurement stays enabled.
 *  2. gtag.js itself is requested only after the `load` event, a 5-second settling period, AND when the browser is idle
 *     (`requestIdleCallback`, without a timeout that can force it into a busy interval). Older browsers fall back to
 *     a 3-second timer after the settling period.
 *     The queued calls are replayed when it arrives.
 *  3. Passive delegated interaction listeners are installed at that same idle moment, never before load.
 *     One recommended GA4 event (select_content) describes site-specific actions with dynamic parameters.
 * The download has low priority, but executing Google's library still costs main-thread time after it arrives.
 * Idle scheduling reduces competition; it cannot guarantee zero impact on subsequent interactions or late rendering.
 * JS is unavoidable here (analytics has no CSS-only form).
 * Trade-off: visits ending before load + 5 seconds + idle, or a page that stays busy, may not be counted.
 */
import { installInteractions } from './analytics-interactions.mjs';

export function gtagSnippet(id: string): string {
  const q = JSON.stringify(id).replace(/</g, '\\u003c'); // the ID can never close the <script> tag
  return (
    '(function(){window.dataLayer=window.dataLayer||[];' +
    'function gtag(){dataLayer.push(arguments)}window.gtag=gtag;' +
    `gtag("js",new Date());gtag("config",${q},{allow_google_signals:false,allow_ad_personalization_signals:false});` +
    'var loaded=false;function go(){if(loaded)return;loaded=true;' +
    `(${installInteractions.toString()})();` +
    'var s=document.createElement("script");s.async=true;s.fetchPriority="low";' +
    `s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(${q});document.head.appendChild(s)}` +
    'function later(){"requestIdleCallback"in window?requestIdleCallback(go):setTimeout(go,3e3)}' +
    'var scheduled=false;function settle(){if(scheduled)return;scheduled=true;setTimeout(later,5e3)}' +
    'document.readyState==="complete"?settle():addEventListener("load",settle,{once:true})})()'
  );
}
