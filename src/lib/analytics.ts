/**
 * Google Analytics 4 (gtag.js) loader that stays out of the page-load path, so it cannot affect LCP / FCP / CLS / load-time TBT.
 *
 * The official snippet puts `<script async src=".../gtag/js">` in <head>: the download competes with the page's own
 * resources and ~100 KB of JS runs on the main thread while the page is still loading. Here:
 *  1. Inline, at once: only the tiny `dataLayer` / `gtag()` queue and the config call (a few hundred bytes, no network).
 *  2. gtag.js itself is requested only after the `load` event AND when the browser is idle (`requestIdleCallback`,
 *     `setTimeout` where it is missing, e.g. older Safari). The queued calls are replayed when it arrives.
 * JS is unavoidable here (analytics has no CSS-only form); this is the smallest, latest-loading form of it.
 * Trade-off: a visit that ends before the load event + idle (a bounce within a second or two) is not counted.
 */
export function gtagSnippet(id: string): string {
  const q = JSON.stringify(id).replace(/</g, '\\u003c'); // the ID can never close the <script> tag
  return (
    '(function(){window.dataLayer=window.dataLayer||[];' +
    'function gtag(){dataLayer.push(arguments)}window.gtag=gtag;' +
    `gtag("js",new Date());gtag("config",${q});` +
    'function go(){var s=document.createElement("script");s.async=true;' +
    `s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(${q});document.head.appendChild(s)}` +
    'function later(){"requestIdleCallback"in window?requestIdleCallback(go,{timeout:5e3}):setTimeout(go,3e3)}' +
    'document.readyState==="complete"?later():addEventListener("load",later)})()'
  );
}
