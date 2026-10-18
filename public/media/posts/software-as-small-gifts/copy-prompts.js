// Clipboard access needs JavaScript; the prompts remain readable and selectable without it.
for (const button of document.querySelectorAll('[data-gift-copy]')) {
  const chat = button.nextElementSibling ?? button.parentElement?.nextElementSibling;
  const prompt = chat?.querySelector('.chat-user .chat-bubble');
  if (!prompt) continue;
  const idle = button.textContent;
  button.hidden = false;
  button.addEventListener('click', async () => {
    let result = 'error';
    try {
      await navigator.clipboard.writeText(prompt.innerText);
      button.textContent = button.dataset.done;
      result = 'success';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = button.dataset.fail;
    }
    // Report the confirmed clipboard outcome, never the prompt/clipboard text.
    // Measurement is optional and must not affect copying or manual selection.
    try { button.dispatchEvent(new CustomEvent('analytics:result', { detail: result, bubbles: true })); } catch { /* optional */ }
    setTimeout(() => { button.textContent = idle; }, 2200);
  });
}
