// Build-time: turns ```chat fenced blocks into RTL chat bubbles (no client JS).
// Format: "speaker: text" starts a message; lines without a prefix continue the previous one.
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const USER = new Set(['seffy', 'ספי']);

export function parseChat(src) {
  const msgs = [];
  for (const line of src.split('\n')) {
    const m = line.match(/^\s*([^:\s][^:]{0,24}):\s?(.*)$/);
    if (m && !/^https?$/i.test(m[1])) msgs.push({ who: m[1].trim(), lines: [m[2]] });
    else if (msgs.length) msgs[msgs.length - 1].lines.push(line);
    else if (line.trim()) msgs.push({ who: 'seffy', lines: [line] });
  }
  return msgs.map((m) => ({ ...m, text: m.lines.join('\n').trim() }));
}

export function renderChat(src) {
  const items = parseChat(src).map(({ who, text }) => {
    const user = USER.has(who.toLowerCase());
    const label = user ? 'ספי' : esc(who);
    return `<div class="chat-msg ${user ? 'chat-user' : 'chat-bot'}"><span class="chat-who">${label}</span><p class="chat-bubble">${esc(text).replace(/\n/g, '<br>')}</p></div>`;
  });
  return `<div class="chat" dir="rtl" role="group" aria-label="שיחה">${items.join('')}</div>`;
}

export default function remarkChat() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((c) =>
        c.type === 'code' && c.lang === 'chat' ? { type: 'html', value: renderChat(c.value) } : (walk(c), c));
    };
    walk(tree);
  };
}

// Sätteri (Astro 7 default Markdown processor) mdast plugin.
export const satteriChat = {
  name: 'chat-bubbles',
  code(node, ctx) {
    if (node.lang === 'chat') ctx.replaceNode(node, { type: 'html', value: renderChat(node.value) });
  },
};
