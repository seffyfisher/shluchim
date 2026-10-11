import type { APIContext } from 'astro';
import { lurl } from '../i18n/ui';

// Crawlers only read robots.txt at the ROOT of a host. On the GitHub Pages project site this file is served at
// /shluchim/robots.txt, which they ignore (no robots.txt at the root = everything allowed, which is what we want).
// It starts to matter when the site moves to its own domain (SITE_URL=https://... BASE_PATH=/): then it is the root file.
// Policy: search engines, AI search/answer engines and AI assistants are all welcome. Do not add Disallow rules for
// them without Seffy's explicit decision (see SEO-GEO.md).
export const GET = ({ site }: APIContext) => {
  const sitemap = new URL(lurl('he', 'sitemap-index.xml'), site).href;
  const body = `# Everything is open to every crawler: Googlebot, Bingbot, OpenAI (GPTBot, OAI-SearchBot, ChatGPT-User),
# Anthropic (ClaudeBot, Claude-SearchBot, Claude-User), PerplexityBot, Google-Extended, Applebot-Extended and the rest.
User-agent: *
Allow: /

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
