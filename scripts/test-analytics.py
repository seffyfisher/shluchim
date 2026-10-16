"""Real Chromium checks against the production build; external requests are stubbed, never sent.
Run after npm run build: python3 scripts/test-analytics.py
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from shutil import which
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(root / 'dist')))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'

def events(page):
    return page.evaluate("dataLayer.filter(x=>x[0]==='event').map(x=>({name:x[1],...x[2]}))")

def clear(page):
    page.evaluate('dataLayer.length=0')

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=which('chromium'), args=['--no-sandbox'])
        for prefix, slug in [('', '2026-10-12-dial-bot'), ('en/', '2026-10-12-my-shluchim-can-make-phone-calls')]:
            context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
            ga_requests = []
            def route_request(route):
                url = route.request.url
                if 'googletagmanager.com/gtag/js' in url:
                    ga_requests.append(url)
                    route.fulfill(content_type='text/javascript', body='window.__gaTestLoaded=true')
                elif route.request.method == 'POST':
                    route.fulfill(content_type='text/html', body="<script>parent.postMessage('feedback-thanks','*')</script>")
                elif url.startswith(base): route.continue_()
                else: route.abort()
            context.route('**/*', route_request)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(f'{base}/{prefix}posts/{slug}/', wait_until='load')
            assert not ga_requests, 'no GA network request at load'
            # The UI works immediately, before measurement is installed.
            page.locator('.idea-copy').click()
            assert not events(page), 'early interactions are deliberately unmeasured'
            page.wait_for_function('window.__gaTestLoaded === true', timeout=20000)
            assert len(ga_requests) == 1

            for selector, content, placement in [('.idea-copy', 'idea', 'main'), ('.follow-copy', 'follow', 'footer')]:
                clear(page)
                page.locator(selector).focus()
                page.locator(selector).press('Enter')
                page.wait_for_function("dataLayer.some(x=>x[2]?.result==='success')")
                rows = events(page)
                assert len(rows) == 2, rows
                assert [row['action'] for row in rows] == ['copy', 'result']
                assert all(row['content_type'] == content and row['placement'] == placement for row in rows), rows
                assert all(row['name'] == 'select_content' for row in rows)
                assert rows[1]['result'] == 'success'

            clear(page)
            page.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async()=>{throw Error('denied')}}})")
            page.locator('.idea-copy .done').click()
            page.wait_for_function("dataLayer.some(x=>x[2]?.result==='error')")
            assert len(events(page)) == 2
            assert page.locator('.idea-manual').is_visible(), 'fallback remains usable'

            clear(page)
            page.locator('.theme-option input[value="dark"]').first.evaluate('(e)=>e.click()')
            assert len(events(page)) == 1
            assert events(page)[0]['item_id'] == 'dark'

            if page.locator('.fb-form').count():
                clear(page)
                page.locator('.fb-rate input[value="helped"]').check()
                page.locator('.fb-form textarea').fill('PRIVATE-FEEDBACK')
                page.locator('.fb-form input[type="email"]').fill('private@example.com')
                page.locator('.fb-form button[type="submit"]').click()
                page.wait_for_function("dataLayer.some(x=>x[2]?.content_type==='feedback'&&x[2]?.result==='success')")
                rows = events(page)
                assert [row['action'] for row in rows] == ['change', 'submit', 'result'], rows
                assert 'PRIVATE-FEEDBACK' not in str(rows) and 'private@example.com' not in str(rows)
                page.locator('.fb-dlg-x').click()

            clear(page)
            # Same-origin paths shed query parameters; nested targets still count once.
            page.evaluate("""() => {
              const a=document.createElement('a'); a.href='/en/?email=PRIVATE';
              a.innerHTML='<span>nested</span>'; a.addEventListener('click',e=>e.preventDefault());
              document.body.append(a); a.firstChild.click();
            }""")
            rows = events(page)
            assert len(rows) == 1 and rows[0]['link_url'] == base + '/en/', rows
            clear(page)
            page.evaluate("""() => {
              for (const href of ['https://example.com/', '/test.pdf', 'mailto:private@example.com', 'tel:123']) {
                const a=document.createElement('a'); a.href=href;
                a.addEventListener('click',e=>e.preventDefault());document.body.append(a);a.click();
              }
            }""")
            assert not events(page), 'no duplicate outbound/download events or personal contact URLs'

            clear(page)
            page.locator('audio').first.dispatch_event('play')
            page.locator('audio').first.dispatch_event('ended')
            assert [row['action'] for row in events(page)] == ['play', 'complete']
            assert all(row['content_type'] == 'audio' for row in events(page))
            assert not errors, errors
            context.close()

        context = browser.new_context()
        context.route('**/*', lambda r: r.fulfill(content_type='text/javascript', body='window.__gaTestLoaded=true')
                      if 'googletagmanager.com/gtag/js' in r.request.url else
                      r.continue_() if r.request.url.startswith(base) else r.abort())
        page = context.new_page()
        page.goto(base + '/podcast/')
        page.wait_for_function('window.__gaTestLoaded === true', timeout=20000)
        clear(page)
        summary = page.locator('.podcast-episode-player summary').first
        summary.click()
        summary.locator('..').locator('.spotify-load').click()
        rows = events(page)
        assert len(rows) == 2 and rows[0]['action'] == 'open', rows
        assert rows[1]['content_type'] == 'podcast' and rows[1]['action'] == 'load_player', rows
        assert rows[0]['item_id'] == rows[1]['item_id'], rows
        browser.close()
        print('Analytics browser checks passed: deferred activation, HE/EN, keyboard/nested clicks, clipboard outcomes, feedback privacy, navigation, deduplication, audio and Spotify.')
finally:
    server.shutdown()
