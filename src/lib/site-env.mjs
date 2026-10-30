// Pre-launch gate for Arabic (/ar/): while false, all /ar/ pages emit <meta name="robots" content="noindex" />
// (and omit <link rel="canonical">) and are excluded from the XML sitemap and llms.txt until Phase D launch.
export const AR_LAUNCHED = false;

// Where the site lives: ONE place for the defaults (astro.config.mjs, the list guard, remark plugins and
// scripts/indexnow.mjs all read it). CI can override with the repo variables SITE_URL / BASE_PATH
// (an empty variable falls back to these defaults).
//   Custom domain (current):  SITE_URL=https://shluchim.shinlamed.com  BASE_PATH=/
//   GitHub Pages project URL: SITE_URL=https://seffyfisher.github.io   BASE_PATH=/shluchim
export const SITE_URL = (process.env.SITE_URL || 'https://shluchim.shinlamed.com').replace(/\/$/, '');
export const BASE_PATH = process.env.BASE_PATH || '/';

/** '' for a root deployment, '/shluchim' for a sub-path one (never a trailing slash). */
export const BASE = BASE_PATH.replace(/\/+$/, '');

/** Prefix a root-relative path with the base: withBase('/images/a.webp') -> '/images/a.webp' or '/shluchim/images/a.webp'. */
export const withBase = (p) => BASE + (p.startsWith('/') ? p : '/' + p);

/**
 * Content may still carry the old hard-coded '/shluchim/images/...' form (written before the domain move) or the
 * base-free '/images/...' form (what the CMS writes now). Post media also lives under '/media/posts/'.
 * Returns the path inside public/ (e.g. 'images/posts/x.webp') or null when it is not a site image.
 */
export const imagePath = (url) => {
  const m = /^(?:\/shluchim)?\/(images\/.+|media\/posts\/.+\.(?:webp|png|gif))$/i.exec(url || '');
  return m ? m[1] : null;
};
