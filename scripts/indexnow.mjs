#!/usr/bin/env node
// Notify IndexNow about the stories that changed in the last push. Opt-in, see SEO-GEO.md ("IndexNow").
// Needs INDEXNOW_KEY (any 8-128 chars of a-z, A-Z, 0-9, -) and the file public/<key>.txt containing exactly the key.
// Usage: node scripts/indexnow.mjs [--dry] [--before <sha>]   (BEFORE env also works; default HEAD~1)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { urlsFor, payload } from '../src/lib/indexnow.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const key = process.env.INDEXNOW_KEY || '';
const origin = (process.env.SITE_URL || 'https://shluchim.shinlamed.com').replace(/\/$/, '');
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
let before = args[args.indexOf('--before') + 1] || process.env.BEFORE || '';
if (!before || /^0+$/.test(before)) before = 'HEAD~1';

if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) { console.error('INDEXNOW_KEY is missing or not 8-128 chars of a-z, A-Z, 0-9, -'); process.exit(1); }
const keyFile = `public/${key}.txt`;
const keyOk = existsSync(keyFile) && readFileSync(keyFile, 'utf8').trim() === key;
if (!keyOk) { (dry ? console.warn : console.error)(`${keyFile} must exist and contain exactly the key`); if (!dry) process.exit(1); }

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });
const changed = git('diff', '--name-only', '--diff-filter=AMR', before, 'HEAD', '--', 'src/content', 'src/data/topics.mjs').split('\n').filter(Boolean);
const urls = urlsFor(changed, (f) => readFileSync(f, 'utf8'), `${origin}${base}/`);
if (!urls.length) { console.log(`IndexNow: nothing to announce (${changed.length} changed content file(s), none a published story or page)`); process.exit(0); }

const body = payload(origin, base, key, urls);
if (dry) { console.log(JSON.stringify(body, null, 2)); process.exit(0); }
const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`IndexNow: ${urls.length} URL(s) submitted, HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) { console.error(await res.text()); process.exit(1); }
