// New-tab links are rendered and checked at build time; no browser JavaScript.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToHast } from 'satteri';
import { SITE_URL } from './site-env.mjs';

/** Only HTTP(S) links to a different host open a new tab; site URLs and fragments stay here. */
export function isExternalLink(href, site = SITE_URL) {
  try {
    const destination = new URL(href, site);
    return ['http:', 'https:'].includes(destination.protocol) && destination.host !== new URL(site).host;
  } catch {
    return false;
  }
}

const relTokens = (rel) => (Array.isArray(rel) ? rel : String(rel ?? '').split(/\s+/)).filter(Boolean);

export const satteriLinks = {
  name: 'new-tab-links',
  element: {
    filter: ['a', 'area'],
    visit(node, ctx) {
      if (node.properties.href == null) return;
      if (!isExternalLink(node.properties.href)) {
        ctx.setProperty(node, 'target', null);
        return;
      }
      const rel = relTokens(node.properties.rel).filter((token) => token.toLowerCase() !== 'opener');
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', [...new Set([...rel, 'noopener'])]);
    },
  },
};

const htmlFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
});

/** Audit every built HTML page, including links in navigation, Markdown and raw HTML. */
export function auditLinks(dir, site = SITE_URL) {
  const errors = [];
  const files = htmlFiles(dir);
  let links = 0;
  let external = 0;
  for (const file of files) {
    const walk = (node) => {
      if (node.type === 'element' && ['a', 'area'].includes(node.tagName) && node.properties.href != null) {
        links++;
        const { href, target, rel } = node.properties;
        const where = `${relative(dir, file)}: link ${JSON.stringify(href)}`;
        if (isExternalLink(href, site)) {
          external++;
          if (target !== '_blank') errors.push(`${where} needs target="_blank"`);
          const tokens = relTokens(rel).map((token) => token.toLowerCase());
          if (!tokens.includes('noopener') || tokens.includes('opener')) errors.push(`${where} needs rel="noopener" without opener`);
        } else if (target && target !== '_self') errors.push(`${where} must open in the same tab`);
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(htmlToHast(readFileSync(file, 'utf8')));
  }
  return { errors, pages: files.length, links, external };
}

export const linkGuard = () => ({
  name: 'shluchim-link-guard',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const { errors, pages, links, external } = auditLinks(fileURLToPath(dir));
      if (errors.length) throw new Error(`External link guard failed:\n  ${errors.join('\n  ')}`);
      logger.info(`links OK: ${external} external links open a new tab; ${links - external} site links stay in the same tab across ${pages} HTML pages`);
    },
  },
});
