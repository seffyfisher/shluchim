// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { satteriChat } from './src/lib/remark-chat.mjs';
import { satteriImgSize } from './src/lib/remark-img-size.mjs';
import { satteriPhoto } from './src/lib/remark-photo.mjs';
import { i18nCheck, urlPairs, lastmods } from './src/lib/i18n-check.mjs';
import { seoCheck } from './src/lib/seo-check.mjs';
import { SITE_URL, BASE_PATH } from './src/lib/site-env.mjs';
import { listGuard } from './src/lib/list-guard.mjs';

// Deploy target: defaults live in src/lib/site-env.mjs (custom domain https://shluchim.shinlamed.com, served at the root).
// CI can override with the repo variables SITE_URL / BASE_PATH.
// SHOW_DRAFTS=1 builds drafts into a separate folder so they can never ship by accident.
const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';

const SITE_BASE = new URL(BASE_PATH.replace(/\/?$/, '/'), SITE_URL).href;
const PAIRS = urlPairs(process.cwd(), SITE_BASE);
const LASTMOD = lastmods(process.cwd(), SITE_BASE);

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  output: 'static',
  outDir: SHOW_DRAFTS ? './dist-drafts' : './dist',
  // Hebrew stays at the root (no /he/ prefix, no URL changes); English lives under /en/.
  i18n: { defaultLocale: 'he', locales: ['he', 'en'], routing: { prefixDefaultLocale: false } },
  // Sitemap alternates (he, en, x-default) come from translationKey pairs (English slugs differ from the Hebrew ones); lastmod from post dates.
  integrations: [sitemap({ serialize(item) { const links = PAIRS.get(item.url); const lastmod = LASTMOD.get(item.url); return { ...item, ...(links ? { links } : {}), ...(lastmod ? { lastmod } : {}) }; } }), i18nCheck(), seoCheck(), listGuard()],
  build: { inlineStylesheets: 'always' },
  // Code blocks follow the site theme (light/dark) via CSS variables; colours applied in global.css.
  markdown: { processor: satteri({ mdastPlugins: [satteriChat, satteriImgSize, satteriPhoto] }), shikiConfig: { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' }, defaultColor: false } },
});
