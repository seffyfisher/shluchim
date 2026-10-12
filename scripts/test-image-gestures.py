"""Browser smoke test for a built site; requires Playwright and Chromium on the test machine."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from shutil import which
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
shots = root / 'preview-shots' / 'image-gestures'
shots.mkdir(parents=True, exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(root / 'dist')))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=which('chromium'), headless=True, args=['--no-sandbox'])
        for mobile in (False, True):
            context = browser.new_context(viewport={'width': 390 if mobile else 1440, 'height': 844 if mobile else 1000}, is_mobile=mobile, has_touch=mobile)
            context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
            errors = []
            gesture_requests = []
            page = context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('request', lambda r: gesture_requests.append(r.url) if '/_astro/image-gestures.' in r.url else None)
            page.goto(base + '/posts/2026-10-09-terms-checkbox-dead-clicks/')
            assert not gesture_requests, 'gesture module must not load before an image is opened'
            trigger = page.locator('.image-enlarge').first
            trigger.click()
            viewer = page.locator('.image-viewer:popover-open')
            stage = viewer.locator('.image-viewer-scroll')
            image = stage.locator('img')
            page.wait_for_function('document.querySelector(".image-viewer:popover-open img")?.style.transform')
            assert len(gesture_requests) == 1, 'gesture module loads once, on demand'
            page.wait_for_timeout(100)
            fitted = image.bounding_box()
            natural = image.evaluate('(i) => ({ width: i.naturalWidth, height: i.naturalHeight })')
            assert fitted['width'] <= natural['width'] + 1 and fitted['height'] <= natural['height'] + 1
            assert fitted['width'] <= stage.bounding_box()['width'] + 1 and fitted['height'] <= stage.bounding_box()['height'] + 1
            point = {'x': fitted['x'] + fitted['width'] / 2, 'y': fitted['y'] + fitted['height'] / 2}
            if not mobile:
                page.mouse.move(point['x'], point['y'])
                page.mouse.wheel(0, -100)
                page.wait_for_timeout(80)
                assert image.bounding_box()['width'] > fitted['width']
                viewer.locator('.image-viewer-reset').click()
                page.wait_for_timeout(50)
                image.dblclick()
                page.wait_for_timeout(80)
                assert image.bounding_box()['width'] > fitted['width']
                image.dblclick()
                page.wait_for_timeout(80)
                assert abs(image.bounding_box()['width'] - fitted['width']) < 1
                stage.focus()
                page.keyboard.press('+')
                page.wait_for_timeout(50)
                assert image.bounding_box()['width'] > fitted['width']
                page.keyboard.press('0')
            else:
                page.touchscreen.tap(point['x'], point['y'])
                page.wait_for_timeout(80)
                page.touchscreen.tap(point['x'], point['y'])
                page.wait_for_timeout(80)
                assert image.bounding_box()['width'] > fitted['width']
                viewer.locator('.image-viewer-reset').tap()
                page.wait_for_timeout(100)
                session = context.new_cdp_session(page)
                def touch(kind, points):
                    session.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': points})
                def fingers(spread):
                    return [{'x': point['x'] - spread, 'y': point['y'], 'id': 1}, {'x': point['x'] + spread, 'y': point['y'], 'id': 2}]
                touch('touchStart', fingers(30))
                touch('touchMove', fingers(70))
                touch('touchMove', fingers(100))
                # Lift one finger; the remaining finger must smoothly pan.
                touch('touchMove', [fingers(100)[0]])
                page.wait_for_timeout(80)
                enlarged = image.bounding_box()
                assert enlarged['width'] > fitted['width'] * 2
                touch('touchMove', [{'x': point['x'] - 130, 'y': point['y'] - 40, 'id': 1}])
                touch('touchEnd', [])
                page.wait_for_timeout(80)
                shifted = image.bounding_box()
                assert shifted['x'] != enlarged['x'] or shifted['y'] != enlarged['y']
            page.screenshot(path=str(shots / ('mobile-zoom.png' if mobile else 'desktop-fit.png')))
            page.keyboard.press('Escape')
            assert viewer.count() == 0
            trigger.click()
            page.wait_for_timeout(100)
            assert abs(image.bounding_box()['width'] - fitted['width']) < 1
            # A genuinely small source stays at its pixel size, even on desktop.
            page.route('**/small-test.svg', lambda r: r.fulfill(content_type='image/svg+xml', body='<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="gray"/></svg>'))
            image.evaluate('(i) => { i.src = "/small-test.svg"; }')
            page.wait_for_function('document.querySelector(".image-viewer:popover-open img")?.naturalWidth === 120')
            page.wait_for_timeout(80)
            assert abs(image.bounding_box()['width'] - 120) < 1
            if mobile:
                page.set_viewport_size({'width': 844, 'height': 390})
                page.wait_for_timeout(100)
                bounds = viewer.bounding_box()
                assert bounds['width'] <= 844 and bounds['height'] <= 390
                assert abs(image.bounding_box()['width'] - 120) < 1
            page.mouse.click(1, 1)
            assert viewer.count() == 0
            assert not errors, errors
            assert len(gesture_requests) == 1, 'reopening reuses the same loaded module'
            print('PASS: mobile double-tap, real two-finger pinch, one-finger pan, orientation, natural sizing and close' if mobile else 'PASS: desktop wheel, double-click, keyboard, natural sizing and close', flush=True)
            context.close()
        context = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
        context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
        page = context.new_page()
        page.goto(base + '/posts/2026-10-09-terms-checkbox-dead-clicks/')
        page.locator('.image-enlarge').first.click()
        viewer = page.locator('.image-viewer:popover-open')
        assert viewer.is_visible() and not viewer.locator('.image-viewer-reset').is_visible()
        assert viewer.bounding_box()['width'] <= 390
        page.keyboard.press('Escape')
        assert viewer.count() == 0
        print('PASS: no-JS native opening and closing, no inactive gesture controls', flush=True)
        browser.close()
finally:
    server.shutdown()
