// Tiny frontmatter reader for build-time checks (no YAML dependency). Handles the shapes used in this repo and the
// ones the CMS writes: `key: value`, `key: "double quoted, with \" escapes"`, `key: 'single quoted'`,
// flow lists `key: ["a", "b"]` and block lists (`key:` followed by `  - a` lines).
export function parseFrontmatter(src) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!m) return { data: {}, body: src };
  const data = {};
  const lines = m[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*?)\s*$/.exec(lines[i]);
    if (!kv) continue;
    const [, key, raw] = kv;
    if (raw === '' && /^\s+-\s/.test(lines[i + 1] ?? '')) {
      const list = [];
      while (/^\s+-\s/.test(lines[i + 1] ?? '')) list.push(value(lines[++i].replace(/^\s+-\s+/, '').trim()));
      data[key] = list;
    } else data[key] = value(raw);
  }
  return { data, body: m[2] };
}

function value(raw) {
  if (raw.startsWith('[') && raw.endsWith(']')) {
    const inner = raw.slice(1, -1).trim();
    return inner ? inner.split(',').map((x) => value(x.trim())) : [];
  }
  if (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2) {
    try { return JSON.parse(raw); } catch { return raw.slice(1, -1).replace(/\\"/g, '"'); }
  }
  if (raw.startsWith("'") && raw.endsWith("'") && raw.length >= 2) return raw.slice(1, -1).replace(/''/g, "'");
  return raw;
}
