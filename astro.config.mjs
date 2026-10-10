// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { satteriChat } from './src/lib/remark-chat.mjs';
import { satteriImgSize } from './src/lib/remark-img-size.mjs';
import { i18nCheck, urlPairs } from './src/lib/i18n-check.mjs';

// ONE place to change the deploy target.
// GitHub Pages project site (default): SITE_URL=https://seffyfisher.github.io  BASE_PATH=/shluchim
// Custom domain later:                 SITE_URL=https://stories.example.com    BASE_PATH=/
const SITE_URL = process.env.SITE_URL || 'https://seffyfisher.github.io';
const BASE_PATH = process.env.BASE_PATH || '/shluchim';
// SHOW_DRAFTS=1 builds drafts into a separate folder so they can never ship by accident.
const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';

const PAIRS = urlPairs(process.cwd(), new URL(BASE_PATH.replace(/\/?$/, '/'), SITE_URL).href);

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  output: 'static',
  outDir: SHOW_DRAFTS ? './dist-drafts' : './dist',
  // Hebrew stays at the root (no /he/ prefix, no URL changes); English lives under /en/.
  i18n: { defaultLocale: 'he', locales: ['he', 'en'], routing: { prefixDefaultLocale: false } },
  // Sitemap alternates come from translationKey pairs (English slugs differ from the Hebrew ones).
  integrations: [sitemap({ serialize(item) { const links = PAIRS.get(item.url); return links ? { ...item, links } : item; } }), i18nCheck()],
  build: { inlineStylesheets: 'always' },
  // Code blocks follow the site theme (light/dark) via CSS variables; colours applied in global.css.
  markdown: { processor: satteri({ mdastPlugins: [satteriChat, satteriImgSize] }), shikiConfig: { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' }, defaultColor: false } },
});
