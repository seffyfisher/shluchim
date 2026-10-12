"""Run against the built site with Playwright + Chromium; no production dependency."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from shutil import which
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
shots = root / 'preview-shots' / 'hand-cursor'
shots.mkdir(parents=True, exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(root / 'dist')))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
active = 'document.documentElement.hasAttribute("data-hand-pointer")'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=which('chromium'), args=['--no-sandbox'])
        for mode in ('desktop', 'touch', 'reduced'):
            context = browser.new_context(viewport={'width':1440,'height':1000}, has_touch=mode=='touch', is_mobile=mode=='touch', reduced_motion='reduce' if mode=='reduced' else 'no-preference', record_video_dir=str(shots) if mode=='desktop' else None)
            page = context.new_page()
            requests, errors = [], []
            page.on('request', lambda r: requests.append(r.url) if 'cursor-hand.' in r.url else None)
            page.on('pageerror', lambda e: errors.append(str(e)))
            context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
            page.goto(base)
            assert not requests, 'hand must not load on navigation'
            page.mouse.move(750,200)
            page.wait_for_timeout(120)
            page.mouse.move(760,210)
            page.wait_for_timeout(100)
            if mode!='desktop':
                assert not requests and not page.evaluate(active), mode
            else:
                assert len(requests)==1 and page.evaluate(active)
                assert page.locator('.hand-cursor').evaluate('(e)=>getComputedStyle(e).pointerEvents')=='none'
                assert page.locator('.hand-cursor img').evaluate('(i)=>i.naturalWidth')==96
                size=page.locator('.hand-cursor').evaluate('(e)=>parseFloat(getComputedStyle(e).width)')
                assert abs(size-36*1.2)<1/64, 'cursor must be exactly 20% larger'
                for selector in ('.hand-cursor', '.hand-cursor img'):
                    origin=page.locator(selector).evaluate('(e)=>getComputedStyle(e).transformOrigin')
                    assert origin=='7.56px 7.56px', 'flex and rotation must anchor at the scaled fingertip'
                assert page.locator('.hand-cursor img').evaluate('(e)=>getComputedStyle(e).animationDuration')=='3.2s'
                assert page.locator('.hand-cursor img').evaluate('(i)=>getComputedStyle(i).animationPlayState')=='running'
                idle_before=page.locator('.hand-cursor img').evaluate('(i)=>getComputedStyle(i).transform')
                page.wait_for_timeout(1100)
                assert idle_before!=page.locator('.hand-cursor img').evaluate('(i)=>getComputedStyle(i).transform'), 'gentle idle motion continues without pointer movement'
                page.screenshot(path=str(shots/'desktop.png'))
                for x in range(760,1060,5):
                    page.mouse.move(x,210)
                    page.wait_for_timeout(20)
                page.wait_for_timeout(1600)
                assert page.locator('.hand-cursor').evaluate('(e)=>e.style.getPropertyValue("--hand-angle")')=='0deg'
                page.evaluate("""document.body.insertAdjacentHTML('afterbegin', '<input id="cursor-test" style="position:fixed;left:20px;top:20px;z-index:10">')""")
                page.locator('#cursor-test').hover()
                assert not page.evaluate(active)
                assert page.locator('.hand-cursor img').evaluate('(i)=>getComputedStyle(i).animationPlayState')=='paused'
                page.locator('#cursor-test').fill('native input works')
                page.mouse.move(760,210)
                assert page.evaluate(active)
                page.evaluate('document.documentElement.dispatchEvent(new PointerEvent("pointerleave"))')
                assert not page.evaluate(active)
                page.mouse.move(761,211)
                page.evaluate('window.dispatchEvent(new Event("blur"))')
                assert not page.evaluate(active)
                page.mouse.move(762,212)
                page.evaluate('document.dispatchEvent(new Event("visibilitychange"))')
                assert not page.evaluate(active)
                page.emulate_media(reduced_motion='reduce')
                page.mouse.move(763,213)
                assert not page.evaluate(active)
                page.emulate_media(reduced_motion='no-preference')
                page.goto(base+'/posts/2026-10-09-terms-checkbox-dead-clicks/')
                page.locator('.image-enlarge').first.click()
                viewer=page.locator('.image-viewer:popover-open')
                viewer.hover()
                assert not page.evaluate(active)
                assert viewer.evaluate('(e)=>getComputedStyle(e).cursor')!='none'
                page.keyboard.press('Escape')
                assert page.locator('.image-viewer:popover-open').count()==0
            assert not errors, errors
            context.close()
        context=browser.new_context(java_script_enabled=False)
        page=context.new_page()
        page.goto(base)
        page.mouse.move(500,200)
        assert not page.evaluate(active)
        context.close()
        browser.close()
finally:
    server.shutdown()
print('Hand cursor: desktop, lazy image, clicks/popover, fields, settling, leaving, reduced-motion, touch, no-JS OK')
