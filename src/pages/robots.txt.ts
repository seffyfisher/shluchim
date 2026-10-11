import type { APIContext } from 'astro';
import { lurl } from '../i18n/ui';

// Crawlers only read robots.txt at the ROOT of a host. The site now lives at the root of its own domain
// (https://shluchim.shinlamed.com), so this file is the one they read, and the Sitemap line below is how they find the sitemap.
// (If the site is ever served from a sub-path again, e.g. github.io/shluchim/, crawlers ignore this file and the sitemap must be
// submitted by hand in Search Console and Bing.)
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
