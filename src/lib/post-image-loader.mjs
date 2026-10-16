import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

function imageLoader(url) {
  const quoted = JSON.stringify(url).replace(/</g, '\\u003c');
  return '(function(){function open(e){if(e.newState!=="open"||!(e.target instanceof HTMLElement)||!e.target.matches(".image-viewer"))return;' +
    'document.removeEventListener("beforetoggle",open,true);var s=document.createElement("script");s.type="module";' +
    `s.src=${quoted};document.head.appendChild(s)}` +
    'document.addEventListener("beforetoggle",open,true)})()';
}

export function deferPostImagesHtml(html) {
  const hasViewer = html.includes('class="image-viewer"');
  let found = false;
  const result = html.replace(/<script type="module" src="([^"<>]*\/_astro\/PostPage\.[^"<>]+\.js)"><\/script>/g, (_tag, url) => {
    found = true;
    return hasViewer ? `<script>${imageLoader(url)}</script>` : '';
  });
  if (hasViewer && !found) throw new Error('PostPage module tag changed; cannot guarantee deferred image gestures.');
  return result;
}

// Native HTML owns image opening. Fetch the gesture entry and Vite's shared
// import helper only when a reader opens an image, never during initial paint.
export function deferredPostImages() {
  return { name: 'deferred-post-images', hooks: { 'astro:build:done': ({ dir }) => {
    function visit(folder) {
      for (const entry of readdirSync(folder, { withFileTypes: true })) {
        const path = join(folder, entry.name);
        if (entry.isDirectory()) visit(path);
        else if (entry.name.endsWith('.html')) {
          const before = readFileSync(path, 'utf8');
          const after = deferPostImagesHtml(before);
          if (before !== after) writeFileSync(path, after);
        }
      }
    }
    visit(fileURLToPath(dir));
  } } };
}
