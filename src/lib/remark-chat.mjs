// Build-time: turns ```chat fenced blocks into chat bubbles (no client JS).
// Format: "speaker: text" starts a message; lines without a prefix continue the previous one.
// Direction and labels follow the post's language (frontmatter `lang`, default he): he = rtl, en = ltr.
// English posts can carry the Hebrew original in two ways, both rendered under each bubble as a collapsible
// <details> "Hebrew original" (pure HTML/CSS, no JS):
//   - a line "original: <Hebrew text>" right after a message, or
//   - a ```chat-he block right after the ```chat block (messages paired by order).
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const USER = new Set(['seffy', 'ספי']);
const ORIG = new Set(['original', 'מקור']);
const L = {
  he: { dir: 'rtl', chat: 'שיחה', user: 'ספי', orig: 'המקור בעברית' },
  en: { dir: 'ltr', chat: 'Conversation', user: 'Seffy', orig: 'Hebrew original' },
};

export function parseChat(src) {
  const msgs = [];
  let cur = null; // the message or original that unprefixed lines continue
  for (const line of src.split('\n')) {
    const m = line.match(/^\s*([^:\s][^:]{0,24}):\s?(.*)$/);
    if (m && !/^https?$/i.test(m[1])) {
      if (ORIG.has(m[1].trim().toLowerCase()) && msgs.length) {
        const last = msgs[msgs.length - 1];
        last.orig = [m[2]]; cur = last.orig;
      } else { msgs.push({ who: m[1].trim(), lines: [m[2]] }); cur = msgs[msgs.length - 1].lines; }
    }
    else if (cur) cur.push(line);
    else if (line.trim()) { msgs.push({ who: 'seffy', lines: [line] }); cur = msgs[msgs.length - 1].lines; }
  }
  return msgs.map(({ orig, ...m }) => ({ ...m, text: m.lines.join('\n').trim(), ...(orig ? { orig: orig.join('\n').trim() } : {}) }));
}

const br = (s) => esc(s).replace(/\n/g, '<br>');

export function renderChat(src, lang = 'he', heSrc = null) {
  const l = L[lang] ?? L.he;
  const msgs = parseChat(src);
  const he = heSrc ? parseChat(heSrc) : null;
  const paired = he && he.length === msgs.length;
  if (paired) msgs.forEach((m, i) => { if (!m.orig) m.orig = he[i].text; });
  const items = msgs.map(({ who, text, orig }) => {
    const user = USER.has(who.toLowerCase());
    const label = user ? l.user : esc(who);
    const details = orig && lang !== 'he'
      ? `<details class="chat-orig"><summary>${l.orig}</summary><p lang="he" dir="rtl">${br(orig)}</p></details>`
      : '';
    return `<div class="chat-msg ${user ? 'chat-user' : 'chat-bot'}"><span class="chat-who">${label}</span><p class="chat-bubble">${br(text)}</p>${details}</div>`;
  });
  // Unpaired chat-he (different message count): one details under the whole conversation.
  const tail = he && !paired && lang !== 'he'
    ? `<details class="chat-orig chat-orig-all"><summary>${l.orig}</summary><p lang="he" dir="rtl">${he.map((m) => br(m.text)).join('<br><br>')}</p></details>`
    : '';
  return `<div class="chat" dir="${l.dir}" role="group" aria-label="${l.chat}">${items.join('')}${tail}</div>`;
}

/** Pairs each ```chat block with the ```chat-he block that directly follows it (by chat source text). */
export function pairHebrew(source = '') {
  const map = new Map();
  const re = /```chat\n([\s\S]*?)\n```\s*\n```chat-he\n([\s\S]*?)\n```/g;
  for (const m of source.matchAll(re)) map.set(m[1].replace(/\s+$/, ''), m[2]);
  return map;
}

export default function remarkChat() {
  return (tree, file) => {
    const lang = file?.data?.astro?.frontmatter?.lang ?? 'he';
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((c) =>
        c.type === 'code' && c.lang === 'chat' ? { type: 'html', value: renderChat(c.value, lang) } : (walk(c), c));
    };
    walk(tree);
  };
}

// Sätteri (Astro 7 default Markdown processor) mdast plugin.
export const satteriChat = (fctx) => {
  const pairs = pairHebrew(fctx?.source);
  return {
    name: 'chat-bubbles',
    code(node, ctx) {
      const lang = ctx.data?.astro?.frontmatter?.lang ?? 'he';
      if (node.lang === 'chat') ctx.replaceNode(node, { type: 'html', value: renderChat(node.value, lang, pairs.get(node.value.replace(/\s+$/, '')) ?? null) });
      // A chat-he block is folded into the bubbles above it; on its own it renders as a Hebrew chat.
      else if (node.lang === 'chat-he') ctx.replaceNode(node, { type: 'html', value: [...pairs.values()].includes(node.value) ? '' : renderChat(node.value, 'he') });
    },
  };
};
