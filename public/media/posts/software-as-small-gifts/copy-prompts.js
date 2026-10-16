// Clipboard access needs JavaScript; the prompts remain readable and selectable without it.
for (const button of document.querySelectorAll('[data-gift-copy]')) {
  const chat = button.nextElementSibling ?? button.parentElement?.nextElementSibling;
  const prompt = chat?.querySelector('.chat-user .chat-bubble');
  if (!prompt) continue;
  const idle = button.textContent;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt.innerText);
      button.textContent = button.dataset.done;
    } catch {
      const range = document.createRange();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = button.dataset.fail;
    }
    setTimeout(() => { button.textContent = idle; }, 2200);
  });
}
