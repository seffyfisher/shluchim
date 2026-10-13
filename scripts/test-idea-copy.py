"""Verify the built article handoff with real Chromium clipboard access; no production dependency.
Run after npm run seo:check: python scripts/test-idea-copy.py
"""
from functools import partial
from html import unescape
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from shutil import which
from threading import Thread
import re
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
shots = root / 'preview-shots' / 'idea-copy'
shots.mkdir(parents=True, exist_ok=True)

# Check every published story, including the longest articles and their embedded HTML/chat/code.
built_posts = set((root / 'dist').glob('**/posts/*/index.html'))
checked_posts = set()
for source_file in (root / 'src/content/posts').glob('*/*.md'):
    lang = source_file.parent.name
    page_file = root / 'dist' / ('en' if lang == 'en' else '') / 'posts' / source_file.stem / 'index.html'
    if page_file not in built_posts:
        continue
    html = page_file.read_text()
    prompts = re.findall(r'<textarea\b[^>]*class="idea-manual"[^>]*>([\s\S]*?)</textarea>', html)
    assert len(prompts) == 1, f'{source_file}: expected one complete prompt'
    prompt = unescape(prompts[0])
    source_body = source_file.read_text().split('---', 2)[2].strip()
    assert prompt.endswith(source_body), f'{source_file}: full source must survive'
    assert prompt.count(source_body) == 1, f'{source_file}: article must be included once'
    prefix = prompt[:-len(source_body)]
    canonical = re.search(r'<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"', html)
    assert canonical, f'{source_file}: page must have a canonical URL'
    canonical_url = unescape(canonical[1])
    blog_url = canonical_url.rsplit('/posts/', 1)[0] + '/'
    # Compare with the rendered page's identity, including its language and BASE_PATH.
    assert canonical_url in prefix, f'{source_file}: prompt must link to this exact post'
    assert blog_url + 'rss.xml' in prefix, f'{source_file}: prompt must carry its language feed'
    assert blog_url + 'about/' in prefix, f'{source_file}: prompt must include its author context'
    checked_posts.add(page_file)
assert checked_posts == built_posts, 'every published post must have its complete source checked'
print(f'All {len(checked_posts)} published posts preserve the complete source, canonical URL and RSS.')

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(root / 'dist')))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=which('chromium'), args=['--no-sandbox'])
        for lang, slug in [('he', '2026-10-12-dial-bot'), ('en', '2026-10-12-my-shluchim-can-make-phone-calls')]:
            context = browser.new_context(viewport={'width': 1440, 'height': 1000}, color_scheme='light', permissions=['clipboard-read', 'clipboard-write'])
            context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(f'{base}/{"en/" if lang == "en" else ""}posts/{slug}/')
            button = page.locator('.idea-copy')
            manual = page.locator('.idea-manual')
            status = page.locator('.idea-status')
            button.wait_for(state='visible')
            prompt = manual.input_value()
            # The live clipboard must contain the entire source, not a rendered-text summary.
            # Astro trims surrounding blank lines; every word and internal line break must survive.
            source = (root / f'src/content/posts/{lang}/{slug}.md').read_text().split('---', 2)[2].strip()
            assert prompt.endswith(source), f'{lang}: source article must survive verbatim'
            assert page.locator('.idea').count() == 1
            assert not manual.is_visible()
            assert status.inner_text() == ''
            assert ('/en/rss.xml' if lang == 'en' else '/rss.xml') in prompt
            assert 'ספי פישר' in prompt if lang == 'he' else 'Seffy Fisher' in prompt
            for mode, width in [('desktop', 1440), ('mobile', 390)]:
                page.set_viewport_size({'width': width, 'height': 1000})
                page.locator('.idea').scroll_into_view_if_needed()
                page.locator('.idea').screenshot(path=str(shots / f'{lang}-{mode}-before.png'), animations='disabled')
            button.click()
            page.wait_for_function('document.querySelector(".idea-copy").hasAttribute("data-done")')
            assert page.evaluate('navigator.clipboard.readText()') == prompt
            assert len(status.inner_text()) > 50 and not manual.is_visible()
            page.locator('.idea').screenshot(path=str(shots / f'{lang}-mobile-copied.png'), animations='disabled')
            # Real feedback survives time and another successful click.
            saved_status = status.inner_text()
            button.click()
            page.wait_for_function('document.querySelector(".idea-copy").hasAttribute("data-done")')
            assert status.inner_text() == saved_status
            button.focus()
            page.keyboard.press('Enter')
            page.wait_for_function('document.querySelector(".idea-copy").hasAttribute("data-done")')
            assert page.evaluate('navigator.clipboard.readText()') == prompt
            # Reject after a previous success: no stale "copied" claim; full text selected for manual copy.
            page.evaluate('Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: () => Promise.reject(new Error("denied"))}})')
            button.click()
            manual.wait_for(state='visible')
            assert button.get_attribute('data-done') is None
            assert status.get_attribute('data-failed') is not None
            assert manual.input_value() == prompt
            assert manual.evaluate('(el) => el.selectionStart === 0 && el.selectionEnd === el.value.length && document.activeElement === el')
            page.locator('.idea').screenshot(path=str(shots / f'{lang}-manual.png'), animations='disabled')
            page.evaluate('Object.defineProperty(navigator, "clipboard", {configurable: true, value: undefined})')
            button.click()
            assert manual.is_visible() and button.get_attribute('data-done') is None
            # A slow clipboard must not report success before the write actually finishes.
            page.evaluate('Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: () => new Promise(resolve => { window.finishIdeaCopy = resolve; })}})')
            button.click()
            assert button.is_disabled() and button.get_attribute('data-done') is None
            assert status.inner_text() == ''
            page.evaluate('window.finishIdeaCopy()')
            page.wait_for_function('document.querySelector(".idea-copy").hasAttribute("data-done")')
            assert button.is_enabled() and not manual.is_visible()
            # Mobile, both directions, dark mode, and large type must never overflow the viewport.
            for theme in ['light', 'dark']:
                page.emulate_media(color_scheme=theme, reduced_motion='reduce')
                for width in [320, 390, 1440]:
                    page.set_viewport_size({'width': width, 'height': 1000})
                    for size in ['100%', '200%']:
                        page.evaluate('(size) => document.documentElement.style.fontSize = size', size)
                        assert page.locator('.idea').evaluate('(el) => el.scrollWidth <= el.clientWidth + 1'), f'{lang}: idea overflow {theme} {width} {size}'
                        assert button.evaluate('(el) => el.getBoundingClientRect().left >= 0 && el.getBoundingClientRect().right <= innerWidth'), f'{lang}: button overflow'
                page.evaluate('document.documentElement.style.fontSize = "100%"')
                page.set_viewport_size({'width': 390, 'height': 1000})
                page.locator('.idea').screenshot(path=str(shots / f'{lang}-{theme}-reduced.png'), animations='disabled')
            assert page.locator('.idea-avatar img').evaluate('(img) => img.currentSrc.includes("basher-still")')
            assert button.evaluate('(el) => getComputedStyle(el).animationName') == 'none'
            assert not errors, errors
            # The footer has the only RSS follow block on the article page.
            page.evaluate('delete navigator.clipboard')
            assert page.locator('.follow').count() == 1
            rss = page.locator('.follow-footer .follow-copy')
            rss.click()
            page.wait_for_function('document.querySelector(".follow-footer .follow-copy").hasAttribute("data-done")')
            assert page.evaluate('navigator.clipboard.readText()') == rss.get_attribute('data-prompt')
            context.close()
            # Exercise the actual touch input path, rather than only resizing a desktop viewport.
            touch_context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce', permissions=['clipboard-read', 'clipboard-write'])
            touch_context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
            touch_page = touch_context.new_page()
            touch_page.goto(f'{base}/{"en/" if lang == "en" else ""}posts/{slug}/')
            touch_page.locator('.idea-copy').tap()
            touch_page.wait_for_function('document.querySelector(".idea-copy").hasAttribute("data-done")')
            assert touch_page.evaluate('navigator.clipboard.readText()') == prompt
            picture_scale = touch_page.locator('.idea-avatar picture').evaluate('(el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a')
            assert picture_scale == (-1 if lang == 'he' else 1), 'Basher must face the button text in each language'
            assert touch_page.locator('.idea-logo svg').count() == 3
            assert touch_page.locator('.idea-avatar img').evaluate('(img) => img.complete && img.naturalWidth > 0')
            touch_context.close()
        context = browser.new_context(java_script_enabled=False)
        page = context.new_page()
        page.goto(f'{base}/posts/2026-10-12-dial-bot/')
        assert not page.locator('.idea').is_visible(), 'no nonworking button with JavaScript disabled'
        assert page.locator('.prose').is_visible()
        context.close()
        browser.close()
    print('Article handoff passed: HE/EN, full source, real clipboard, pending/denied/repeated writes, manual fallback, RSS, real touch, Basher direction, mobile/dark/large type, reduced motion and no JS.')
    print(f'Screenshots: {shots}')
finally:
    server.shutdown()
