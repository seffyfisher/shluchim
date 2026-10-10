import { test } from 'node:test';
import assert from 'node:assert';
import { parseChat, renderChat } from './remark-chat.mjs';
test('continuation lines join previous message', () => {
  const m = parseChat('seffy: a\nb\nשלוח: c');
  assert.equal(m.length, 2); assert.equal(m[0].text, 'a\nb'); assert.equal(m[1].who, 'שלוח');
});
test('renders bubbles, escapes html', () => {
  const h = renderChat('seffy: <x>\nבאשר: ok');
  assert.match(h, /chat-user/); assert.match(h, /chat-bot/); assert.match(h, /&lt;x&gt;/);
});
test('shows the שלוח speaker name', () => {
  const h = renderChat('seffy: hi\nבן: רעיון מעולה.\nבאשר: ok');
  assert.match(h, /chat-who">בן</); assert.match(h, /chat-who">באשר</); assert.match(h, /chat-user[^]*chat-who">ספי</);
});
