// Build-time SEO / GEO guard. It runs on every build and keeps the search work from rotting.
//  - Normal build / deploy: problems are logged as warnings and NEVER block publishing.
//  - SEO_STRICT=1 (npm run seo:check, and the "SEO guard" GitHub workflow): errors fail the build.
// What it checks is written up in SEO-GEO.md. If you change a rule here, change it there too.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './frontmatter.mjs';
import { TOPICS, TOPIC_SLUGS } from '../data/topics.mjs';

const LIMITS = { title: 65, descMin: 70, descMax: 160 };
const BRAND = { he: 'שלוחים', en: 'Shluchim' };
const NIQQUD = /[֑-ׇ]/;
// Hebrew standing rule (PUBLISHING.md): readers never see סוכנים/בוטים. The product name Grok Bot / גרוקבוט is fine.
const HE_BANNED = /סוכנ|(?<!גרוק)בוט/;
const HE_BARE_SHLUCHIM = /שלוחים/; // must carry the niqqud form שְׁלוּחִים in reader-facing Hebrew
const strict = process.env.SEO_STRICT === '1';

const mdFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => join(dir, f)) : []);

/** Source lint: frontmatter of every published post/page. Returns { errors, warnings }. */
export function lintContent(root) {
  const errors = [];
  const warnings = [];
  const seen = { he: { title: new Map(), desc: new Map() }, en: { title: new Map(), desc: new Map() } };
  const topicsByKey = new Map();

  const check = (file, lang, d, kind) => {
    const where = relative(root, file);
    const err = (m) => errors.push(`${where}: ${m}`);
    const warn = (m) => warnings.push(`${where}: ${m}`);
    const { seoTitle, seoDescription } = d;
    if (!seoTitle) err('missing seoTitle (the <title> people see in search results)');
    if (!seoDescription) err('missing seoDescription (the snippet people see in search results)');
    if (seoTitle) {
      const full = `${seoTitle} · ${BRAND[lang]}`;
      if (full.length > LIMITS.title) warn(`<title> is ${full.length} chars (> ${LIMITS.title}), search results will cut it: "${full}"`);
      const dup = seen[lang].title.get(seoTitle); if (dup) err(`seoTitle duplicates ${dup}`); else seen[lang].title.set(seoTitle, where);
    }
    if (seoDescription) {
      const n = seoDescription.length;
      if (n < LIMITS.descMin || n > LIMITS.descMax) warn(`seoDescription is ${n} chars (aim for ${LIMITS.descMin}-${LIMITS.descMax})`);
      const dup = seen[lang].desc.get(seoDescription); if (dup) err(`seoDescription duplicates ${dup}`); else seen[lang].desc.set(seoDescription, where);
    }
    for (const [name, text] of [['seoTitle', seoTitle], ['seoDescription', seoDescription]]) {
      if (!text) continue;
      if (lang === 'he') {
        if (HE_BANNED.test(text)) err(`${name} uses סוכנים/בוטים, which the reader-facing rule forbids (use "עוזרי AI" or the product name גרוקבוט / Grok Bot)`);
        if (HE_BARE_SHLUCHIM.test(text)) err(`${name} writes שלוחים without niqqud, use שְׁלוּחִים`);
      } else if (NIQQUD.test(text)) err(`${name} has niqqud in English text`);
    }
    if (kind === 'post') {
      const topics = Array.isArray(d.topics) ? d.topics : [];
      if (!topics.length) warn('no topics (adds the story to topic hubs and "more stories"); pick 1-3 from src/data/topics.mjs');
      for (const t of topics) if (!TOPIC_SLUGS.includes(t)) err(`unknown topic "${t}"`);
      topicsByKey.set(`${d.translationKey || where}`, [...(topicsByKey.get(d.translationKey || where) ?? []), { lang, topics: [...topics].sort().join(',') }]);
    }
  };

  for (const lang of ['he', 'en']) {
    for (const file of mdFiles(join(root, `src/content/posts/${lang}`))) {
      const { data } = parseFrontmatter(readFileSync(file, 'utf8'));
      if (data.draft !== 'false' || file.endsWith('example-draft.md')) continue; // drafts never ship
      check(file, lang, { ...data, translationKey: data.translationKey || file.split('/').pop().replace(/\.md$/, '') }, 'post');
    }
    for (const file of mdFiles(join(root, `src/content/pages/${lang}`))) check(file, lang, parseFrontmatter(readFileSync(file, 'utf8')).data, 'page');
  }
  for (const [key, list] of topicsByKey) {
    const he = list.find((x) => x.lang === 'he'); const en = list.find((x) => x.lang === 'en');
    if (he && en && he.topics !== en.topics) warnings.push(`${key}: Hebrew and English versions have different topics (${he.topics || 'none'} vs ${en.topics || 'none'})`);
  }
  // Topic hub copy follows the same vocabulary rules.
  for (const slug of TOPIC_SLUGS) {
    for (const [field, text] of Object.entries(TOPICS[slug].he)) for (const s of [].concat(text)) {
      if (HE_BANNED.test(s)) errors.push(`src/data/topics.mjs: ${slug}.he.${field} uses סוכנים/בוטים`);
      if (HE_BARE_SHLUCHIM.test(s)) errors.push(`src/data/topics.mjs: ${slug}.he.${field} writes שלוחים without niqqud`);
    }
    for (const [field, text] of Object.entries(TOPICS[slug].en)) for (const s of [].concat(text)) if (NIQQUD.test(s)) errors.push(`src/data/topics.mjs: ${slug}.en.${field} has niqqud`);
  }
  return { errors, warnings };
}

// ---------------------------------------------------------------------------------------------------------------
// Built-page audit
// ---------------------------------------------------------------------------------------------------------------
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const attrs = (tag) => {
  const out = {};
  for (const m of tag.matchAll(/([A-Za-z_:][\w:.-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) out[m[1].toLowerCase()] ??= decode(m[2] ?? m[3] ?? m[4] ?? '');
  return out;
};
const tagsOf = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map((m) => attrs(m[1]));
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

/** Audit the built site in `dist`. `site` = origin (no trailing slash), `base` = '' for a root deployment or '/shluchim'-style for a sub-path. */
export function auditDist(dist, site, base) {
  const errors = [];
  const warnings = [];
  const files = walk(dist);
  const pages = new Map(); // canonical url -> { file, hreflang }
  const exists = (urlPath) => {
    let p = urlPath.split('#')[0].split('?')[0];
    if (base && p.startsWith(base)) p = p.slice(base.length);
    p = decodeURIComponent(p);
    const full = join(dist, p);
    return existsSync(full) && (statSync(full).isFile() || existsSync(join(full, 'index.html')));
  };

  // admin/ is the CMS editor (noindex on purpose); 404.html is not a public page.
  const htmlFiles = files.filter((f) => f.endsWith('.html')).filter((f) => !/[\\/]404\.html$/.test(f) && !/^admin[\\/]/.test(relative(dist, f)));
  for (const file of htmlFiles) {
    const rel = relative(dist, file);
    const html = readFileSync(file, 'utf8');
    const err = (m) => errors.push(`${rel}: ${m}`);
    const warn = (m) => warnings.push(`${rel}: ${m}`);
    const head = /<head[\s\S]*?<\/head>/i.exec(html)?.[0] ?? '';
    if (/http-equiv="refresh"/i.test(head)) continue; // redirect stubs
    const metas = tagsOf(head, 'meta');
    const metaBy = (key, val) => metas.find((m) => m[key] === val)?.content;
    const links = tagsOf(head, 'link');
    const title = /<title>([\s\S]*?)<\/title>/i.exec(head)?.[1];
    const lang = /<html[^>]*\blang="?(\w+)/i.exec(html)?.[1];
    const canonical = links.find((l) => l.rel === 'canonical')?.href;
    const robots = metaBy('name', 'robots') ?? '';

    if (!title) err('missing <title>'); else if (decode(title).length > LIMITS.title + 20) warn(`<title> is ${decode(title).length} chars`);
    const description = metaBy('name', 'description');
    if (!description) err('missing meta description');
    if (!canonical) err('missing canonical link');
    else {
      if (!canonical.startsWith(site)) err(`canonical is not on ${site}: ${canonical}`);
      pages.set(canonical, { file: rel, hreflang: Object.fromEntries(links.filter((l) => l.rel === 'alternate' && l.hreflang).map((l) => [l.hreflang, l.href])) });
    }
    if (/noindex/i.test(robots)) err('page is noindex (public pages must be indexable)');
    const h1 = (html.match(/<h1\b/gi) ?? []).length;
    if (h1 !== 1) err(`${h1} <h1> elements (want exactly 1)`);

    // social card
    const og = metaBy('property', 'og:image');
    if (!og) err('missing og:image');
    else if (og.startsWith(site) && !exists(new URL(og).pathname)) err(`og:image file not found: ${og}`);
    for (const p of ['og:title', 'og:description', 'og:url', 'og:type']) if (!metaBy('property', p)) err(`missing ${p}`);
    if (metaBy('name', 'twitter:card') !== 'summary_large_image') err('missing twitter:card summary_large_image');

    // structured data
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!ld.length) err('missing JSON-LD');
    let nodes = [];
    for (const m of ld) {
      try { const j = JSON.parse(m[1]); nodes = nodes.concat(j['@graph'] ?? [j]); } catch (e) { err(`JSON-LD does not parse: ${e.message}`); }
    }
    const types = new Set(nodes.map((n) => n['@type']));
    for (const need of ['Person', 'WebSite']) if (ld.length && !types.has(need)) err(`JSON-LD has no ${need} node`);
    const ids = new Set(nodes.map((n) => n['@id']).filter(Boolean));
    for (const n of nodes) {
      if (n['@type'] === 'BlogPosting') {
        for (const k of ['headline', 'description', 'datePublished', 'dateModified', 'inLanguage', 'author', 'image', 'mainEntityOfPage']) if (!n[k]) err(`BlogPosting is missing ${k}`);
        if (n.inLanguage && lang && n.inLanguage !== lang) err(`BlogPosting inLanguage ${n.inLanguage} != html lang ${lang}`);
        if (n.author?.['@id'] && !ids.has(n.author['@id'])) err('BlogPosting author does not resolve to a node in the page graph');
        if (n.isPartOf?.['@id'] && !ids.has(n.isPartOf['@id'])) err('BlogPosting isPartOf does not resolve to a node in the page graph');
        if (n.image?.[0] && !String(n.image[0]).startsWith('http')) err('BlogPosting image must be an absolute URL');
      }
      if (n['@type'] === 'BreadcrumbList') for (const it of n.itemListElement ?? []) if (!it.name || !it.item) err('BreadcrumbList item without name/item');
    }
    if (/\/posts\/[^/]+\/index\.html$/.test(rel.replace(/\\/g, '/')) && !types.has('BlogPosting')) err('post page has no BlogPosting node');

    // internal links and assets must exist
    for (const [tag, attr] of [['a', 'href'], ['img', 'src'], ['link', 'href'], ['source', 'srcset']]) {
      for (const a of tagsOf(html, tag)) {
        const v = a[attr];
        if (!v || attr === 'srcset') continue;
        const internal = v.startsWith('/') && !v.startsWith('//') && (!base || v === base || v.startsWith(base + '/'));
        if (internal && !exists(v)) err(`broken internal ${tag} ${attr}: ${v}`);
      }
    }
  }

  // hreflang must be reciprocal: if A lists B as its `l` version, B must list A under A's own language (x-default does not count)
  for (const [url, info] of pages) {
    const selfLang = Object.entries(info.hreflang).find(([k, v]) => k !== 'x-default' && v === url)?.[0];
    if (Object.keys(info.hreflang).length && !selfLang) errors.push(`${info.file}: hreflang set does not include the page itself`);
    for (const [l, href] of Object.entries(info.hreflang)) {
      if (l === 'x-default' || href === url) continue;
      const back = pages.get(href);
      if (!back) errors.push(`${info.file}: hreflang ${l} points to ${href}, which is not a built page`);
      else if (selfLang && back.hreflang[selfLang] !== url) errors.push(`${info.file}: hreflang ${l} (${href}) does not link back as ${selfLang}`);
    }
  }
  // sitemap + machine files
  for (const f of ['sitemap-index.xml', 'llms.txt', 'robots.txt']) if (!existsSync(join(dist, f))) errors.push(`${f} was not generated`);
  return { errors, warnings, pages: htmlFiles.length };
}

export const seoCheck = () => {
  let site = '';
  let base = '';
  return {
    name: 'shluchim-seo-check',
    hooks: {
      'astro:config:done': ({ config }) => { site = String(config.site).replace(/\/$/, ''); base = (config.base || '').replace(/\/$/, ''); },
      'astro:build:start': ({ logger }) => {
        const { errors, warnings } = lintContent(process.cwd());
        if (warnings.length) logger.warn(`SEO: ${warnings.length} suggestion(s)\n  ${warnings.join('\n  ')}`);
        if (errors.length) (strict ? logger.error : logger.warn).call(logger, `SEO: ${errors.length} problem(s) in the content\n  ${errors.join('\n  ')}`);
        globalThis.__seoSourceErrors = errors;
      },
      'astro:build:done': ({ dir, logger }) => {
        if (process.env.SHOW_DRAFTS === '1') return; // preview builds are noindex on purpose
        const { errors, warnings, pages } = auditDist(fileURLToPath(dir), site, base);
        const all = [...(globalThis.__seoSourceErrors ?? []), ...errors];
        if (warnings.length) logger.warn(`SEO: ${warnings.length} page warning(s)\n  ${warnings.join('\n  ')}`);
        if (errors.length) (strict ? logger.error : logger.warn).call(logger, `SEO: ${errors.length} problem(s) in the built pages\n  ${errors.join('\n  ')}`);
        if (!all.length) logger.info(`SEO guard OK: ${pages} pages checked (titles, descriptions, canonical, hreflang, JSON-LD, social cards, internal links)`);
        if (strict && all.length) throw new Error(`SEO guard failed with ${all.length} problem(s). See SEO-GEO.md for the rules.`);
      },
    },
  };
};
