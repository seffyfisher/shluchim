// Build-time: turns ```chat fenced blocks into chat bubbles (no client JS).
// Format: "speaker: text" starts a message; lines without a prefix continue the previous one.
// Direction and labels follow the post's language (frontmatter `lang`, default he): he = rtl, en = ltr.
// English posts may add a line "original: <Hebrew text>" right after a message; it is rendered under that
// bubble as a collapsible <details> "Hebrew original" (pure HTML/CSS, no JS).
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

export function renderChat(src, lang = 'he') {
  const l = L[lang] ?? L.he;
  const items = parseChat(src).map(({ who, text, orig }) => {
    const user = USER.has(who.toLowerCase());
    const label = user ? l.user : esc(who);
    const details = orig && lang !== 'he'
      ? `<details class="chat-orig"><summary>${l.orig}</summary><p lang="he" dir="rtl">${br(orig)}</p></details>`
      : '';
    return `<div class="chat-msg ${user ? 'chat-user' : 'chat-bot'}"><span class="chat-who">${label}</span><p class="chat-bubble">${br(text)}</p>${details}</div>`;
  });
  return `<div class="chat" dir="${l.dir}" role="group" aria-label="${l.chat}">${items.join('')}</div>`;
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
export const satteriChat = {
  name: 'chat-bubbles',
  code(node, ctx) {
    if (node.lang === 'chat') ctx.replaceNode(node, { type: 'html', value: renderChat(node.value, ctx.data?.astro?.frontmatter?.lang ?? 'he') });
  },
};
