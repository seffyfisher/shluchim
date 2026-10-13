// @ts-check
import { defineConfig } from 'astro/config';
import { cpSync, copyFileSync, mkdirSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { satteriChat } from './src/lib/remark-chat.mjs';
import { satteriImgSize } from './src/lib/remark-img-size.mjs';
import { satteriPhoto } from './src/lib/remark-photo.mjs';
import { i18nCheck, urlPairs, lastmods } from './src/lib/i18n-check.mjs';
import { seoCheck } from './src/lib/seo-check.mjs';
import { SITE_URL, BASE_PATH } from './src/lib/site-env.mjs';
import { listGuard } from './src/lib/list-guard.mjs';
import { satteriLinks, linkGuard } from './src/lib/links.mjs';

// Deploy target: defaults live in src/lib/site-env.mjs (custom domain https://shluchim.shinlamed.com, served at the root).
// CI can override with the repo variables SITE_URL / BASE_PATH.
// SHOW_DRAFTS=1 builds drafts into a separate folder so they can never ship by accident.
const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';

const SITE_BASE = new URL(BASE_PATH.replace(/\/?$/, '/'), SITE_URL).href;
const PAIRS = urlPairs(process.cwd(), SITE_BASE);
const LASTMOD = lastmods(process.cwd(), SITE_BASE);

// Cached older HTML still requests the former public URLs. Build aliases from the same
// source files, while new pages use Vite's hashed URLs. This adds no browser JavaScript.
const legacyAssetUrls = {
  name: 'legacy-asset-urls',
  hooks: {
    'astro:build:done': ({ dir }) => {
      cpSync(new URL('./src/assets/shluchim/', import.meta.url), new URL('shluchim/', dir), { recursive: true });
      mkdirSync(new URL('fonts/', dir), { recursive: true });
      for (const font of ['noa-shalev-regular-AlefAlefAlef.woff2', 'young-serif-400.woff2']) {
        copyFileSync(new URL(`./src/fonts/${font}`, import.meta.url), new URL(`fonts/${font}`, dir));
      }
    },
  },
};

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  output: 'static',
  outDir: SHOW_DRAFTS ? './dist-drafts' : './dist',
  // Hebrew stays at the root (no /he/ prefix, no URL changes); English lives under /en/.
  i18n: { defaultLocale: 'he', locales: ['he', 'en'], routing: { prefixDefaultLocale: false } },
  // Sitemap alternates (he, en, x-default) come from translationKey pairs (English slugs differ from the Hebrew ones); lastmod from post dates.
  integrations: [sitemap({ serialize(item) { const links = PAIRS.get(item.url); const lastmod = LASTMOD.get(item.url); return { ...item, ...(links ? { links } : {}), ...(lastmod ? { lastmod } : {}) }; } }), legacyAssetUrls, i18nCheck(), seoCheck(), listGuard(), linkGuard()],
  build: { inlineStylesheets: 'always' },
  // Code blocks follow the site theme (light/dark) via CSS variables; colours applied in global.css.
  markdown: { processor: satteri({ mdastPlugins: [satteriChat, satteriImgSize, satteriPhoto], hastPlugins: [satteriLinks], features: { rawHtml: true } }), shikiConfig: { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' }, defaultColor: false } },
});
