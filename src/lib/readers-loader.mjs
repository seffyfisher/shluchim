import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The only Presence code shipped in the initial HTML. All module downloads wait. */
export function readersLoader(url) {
  const quoted = JSON.stringify(url).replace(/</g, '\\u003c');
  return '(function(){var ready=false,queued=false,loaded=false;' +
    'function go(){queued=false;if(loaded||document.visibilityState!=="visible"||!navigator.onLine)return;loaded=true;' +
    'document.removeEventListener("visibilitychange",schedule);removeEventListener("online",schedule);' +
    `var s=document.createElement("script");s.type="module";s.src=${quoted};s.fetchPriority="low";document.head.appendChild(s)}` +
    'function schedule(){if(!ready||queued||loaded||document.visibilityState!=="visible"||!navigator.onLine)return;queued=true;' +
    '"requestIdleCallback"in window?requestIdleCallback(go):setTimeout(go,3e3)}' +
    'function settle(){setTimeout(function(){ready=true;schedule()},5e3)}' +
    'document.addEventListener("visibilitychange",schedule);addEventListener("online",schedule);' +
    'document.readyState==="complete"?settle():addEventListener("load",settle,{once:true})})()';
}

export function deferReadersHtml(html) {
  let found = false;
  const hasReaders = /\bdata-online-readers(?:\s|=|>)/.test(html);
  const result = html.replace(/<script type="module" src="([^"<>]*\/_astro\/OnlineReaders\.[^"<>]+\.js)"><\/script>/g, (_tag, url) => {
    found = true;
    return hasReaders ? `<script>${readersLoader(url)}</script>` : '';
  });
  if (hasReaders && !found) throw new Error('OnlineReaders module tag changed; cannot guarantee deferred loading.');
  return result;
}

/** Astro preserves dynamic imports in external modules. Delay that entry too,
 * so neither it nor Vite's import helper competes with initial fonts/content.
 * This applies to every production visitor, with no audit-specific behavior.
 */
export function deferredReaders() {
  return { name: 'deferred-readers', hooks: { 'astro:build:done': ({ dir }) => {
    function visit(folder) {
      for (const entry of readdirSync(folder, { withFileTypes: true })) {
        const path = join(folder, entry.name);
        if (entry.isDirectory()) visit(path);
        else if (entry.name.endsWith('.html')) {
          const before = readFileSync(path, 'utf8');
          const after = deferReadersHtml(before);
          if (before !== after) writeFileSync(path, after);
        }
      }
    }
    visit(fileURLToPath(dir));
  } } };
}
