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
test('english chat is ltr with a Hebrew-original details', () => {
  const h = renderChat('seffy: You can release the posts\noriginal: אפשר לשחרר את הפוסטים\nבאשר: ok', 'en');
  assert.match(h, /dir="ltr"/); assert.match(h, /aria-label="Conversation"/); assert.match(h, /chat-who">Seffy</);
  assert.match(h, /<details class="chat-orig"><summary>Hebrew original<\/summary><p lang="he" dir="rtl">אפשר לשחרר את הפוסטים<\/p><\/details>/);
  assert.equal((h.match(/chat-msg/g) || []).length, 2);
});
test('hebrew chat output unchanged', () => {
  assert.equal(renderChat('seffy: hi'), '<div class="chat" dir="rtl" role="group" aria-label="שיחה"><div class="chat-msg chat-user"><span class="chat-who">ספי</span><p class="chat-bubble">hi</p></div></div>');
});
