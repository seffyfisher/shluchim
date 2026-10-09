// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ONE place to change the deploy target.
// GitHub Pages project site (default): SITE_URL=https://seffyfisher.github.io  BASE_PATH=/Bots-tales
// Custom domain later:                 SITE_URL=https://stories.example.com    BASE_PATH=/
const SITE_URL = process.env.SITE_URL || 'https://seffyfisher.github.io';
const BASE_PATH = process.env.BASE_PATH || '/Bots-tales';
// SHOW_DRAFTS=1 builds drafts into a separate folder so they can never ship by accident.
const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  output: 'static',
  outDir: SHOW_DRAFTS ? './dist-drafts' : './dist',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
  // Code blocks follow the site theme (light/dark) via CSS variables; colours applied in global.css.
  markdown: { shikiConfig: { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' }, defaultColor: false } },
});
