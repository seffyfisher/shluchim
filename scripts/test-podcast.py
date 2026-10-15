"""Local podcast review checks. Requires Playwright + system Chromium; no site dependencies."""
import json
import os
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

BASE = os.environ.get('PODCAST_TEST_URL', 'http://127.0.0.1:4321').rstrip('/')
OUT = Path('preview-shots/podcast')
POST = '/posts/2026-10-13-wake-up-sky/'
ROUTES = ['/podcast/', POST]
OUT.mkdir(parents=True, exist_ok=True)


def visit(page, route):
    response = page.goto(BASE + route, wait_until='networkidle')
    assert response.status == 200
    page.evaluate('document.fonts.ready')


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'horizontal page overflow'


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=which('chromium'), args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1100}, color_scheme='light', reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    requests = []
    page.on('request', lambda request: requests.append(request.url))
    for route in ROUTES:
        visit(page, route)
        assert page.locator('html').get_attribute('dir') == 'rtl'
        assert page.locator('h1').count() == 1
        assert page.locator('.spotify-load').first.is_visible()
        assert page.locator('.spotify-player iframe').count() == 0
        assert not any(url.startswith('https://open.spotify.com/') for url in requests)
        assert page.locator('link[rel="canonical"]').get_attribute('href') == 'https://shluchim.shinlamed.com' + route
        assert len(page.locator('meta[name="description"]').get_attribute('content')) >= 70
        assert page.locator('.podcast-links a[target="_blank"]').count() >= 1
        assert page.locator('.podcast-links a[target="_blank"]').first.get_attribute('rel') == 'noopener'
        for width in [320, 375, 390, 768, 1440]:
            for theme in ['light', 'dark']:
                page.set_viewport_size({'width': width, 'height': 1100})
                page.evaluate('(theme) => document.documentElement.dataset.theme = theme', theme)
                no_overflow(page)
                button = page.locator('.spotify-load').first.bounding_box()
                assert button['height'] >= 44
        for width in [320, 375, 390]:
            page.set_viewport_size({'width': width, 'height': 1100})
            page.evaluate("document.documentElement.style.fontSize = '32px'")
            no_overflow(page)
        page.evaluate("document.documentElement.style.fontSize = ''")
        page.set_viewport_size({'width': 1440, 'height': 1100})
        page.evaluate("document.documentElement.dataset.theme = 'light'")
        name = 'podcast' if route == '/podcast/' else 'post-listen'
        page.screenshot(animations='disabled', path=str(OUT / (name + '-desktop.png')), full_page=route == '/podcast/')
        page.set_viewport_size({'width': 390, 'height': 1300})
        page.screenshot(animations='disabled', path=str(OUT / (name + '-mobile.png')), full_page=route == '/podcast/')
        page.evaluate("document.documentElement.dataset.theme = 'dark'")
        page.screenshot(animations='disabled', path=str(OUT / (name + '-mobile-dark.png')), full_page=route == '/podcast/')

    # The unrelated post and English counterpart must never acquire an episode.
    for route in ['/posts/2026-10-06-reminders-shaliach/', '/en' + POST]:
        visit(page, route)
        assert page.locator('.podcast-listen').count() == 0

    # Keyboard access from the skip link into the main content and player button.
    visit(page, '/podcast/')
    page.keyboard.press('Tab')
    assert page.locator(':focus').get_attribute('class') == 'skip'
    page.keyboard.press('Enter')
    page.keyboard.press('Tab')
    assert page.locator(':focus').get_attribute('class') == 'podcast-button spotify-load'

    # Controlled external document, only to verify local loaded state and attributes.
    page.route('https://open.spotify.com/**', lambda route: route.fulfill(status=200, content_type='text/html', body='<button>Frame test control</button>'))
    before = page.locator('.spotify-stage').first.bounding_box()
    page.keyboard.press('Enter')
    page.locator('.spotify-player[data-state="loaded"]').wait_for()
    frame = page.locator('.spotify-player iframe')
    assert frame.get_attribute('title') == 'Spotify: הפודקסט של שְׁלוּחִים'
    assert '/embed/show/6ueCCm5YS5Oth66FbwkjO8?' in frame.get_attribute('src')
    assert 'autoplay' not in frame.get_attribute('src')
    assert 'autoplay' not in frame.get_attribute('allow')
    assert 'encrypted-media' in frame.get_attribute('allow')
    assert page.evaluate("document.activeElement.tagName") == 'IFRAME'
    after = page.locator('.spotify-stage').first.bounding_box()
    assert before['height'] == after['height'], 'player load must not shift its layout'
    page.keyboard.press('Tab')
    page.keyboard.press('Tab')
    assert page.locator(':focus').evaluate('(element) => element.tagName') == 'A', 'keyboard must be able to leave frame'
    visit(page, POST)
    page.locator('.spotify-load').first.click()
    page.locator('.spotify-player[data-state="loaded"]').wait_for()
    assert '/embed/episode/1Ccf2UKMMvEhrCb4mvnKJt?' in page.locator('.spotify-player iframe').get_attribute('src')

    # Every archive entry remains a native HTML row. A verified GUID can also
    # open its own episode player, separately from the changing show player.
    visit(page, '/podcast/')
    snapshot = json.loads(Path('src/data/podcast-feed.json').read_text())
    assert page.locator('.podcast-episodes li').count() == len(snapshot['episodes'])
    archive_player = page.locator('[data-episode-guid="https://api.spreaker.com/episode/75804362"] .podcast-episode-player')
    archive_player.locator('summary').focus()
    page.keyboard.press('Enter')
    assert archive_player.get_attribute('open') is not None
    assert archive_player.locator('iframe').count() == 0
    archive_player.locator('.spotify-load').click()
    archive_player.locator('.spotify-player[data-state="loaded"]').wait_for()
    assert '/embed/episode/1Ccf2UKMMvEhrCb4mvnKJt?' in archive_player.locator('iframe').get_attribute('src')

    # Stalled network: the frame never completes. The clock advances only in this test context.
    page.unroute('https://open.spotify.com/**')
    stalled = []
    page.route('https://open.spotify.com/**', lambda route: stalled.append(route))
    visit(page, '/podcast/')
    page.clock.install()
    page.locator('.spotify-load').first.click()
    assert page.locator('.spotify-player').first.get_attribute('data-state') == 'loading'
    page.clock.fast_forward(16000)
    assert page.locator('.spotify-player').first.get_attribute('data-state') == 'error'
    assert page.locator('.spotify-load').first.is_enabled()
    assert page.locator('.podcast-links a').first.is_visible()
    page.locator('.spotify-load').first.click()
    assert page.locator('.spotify-player').first.get_attribute('data-state') == 'loading'
    page.clock.fast_forward(16000)
    assert page.locator('.spotify-player').first.get_attribute('data-state') == 'error'
    for route in stalled:
        route.abort()
    page.unroute('https://open.spotify.com/**')
    assert not errors, errors
    page.close()

    nojs = browser.new_page(java_script_enabled=False, viewport={'width': 390, 'height': 1100})
    for route in ROUTES:
        visit(nojs, route)
        assert nojs.locator('.spotify-load').first.is_hidden()
        assert nojs.locator('.spotify-player noscript').first.is_visible()
        assert nojs.locator('.podcast-links a').first.is_visible()
        assert nojs.locator('.spotify-player iframe').count() == 0
        no_overflow(nojs)
    browser.close()

print(json.dumps({'result': 'passed', 'screenshots': [str(path) for path in sorted(OUT.glob('*.png'))], 'checks': 'RTL, metadata, explicit association, 320–1440px, light/dark, no-JS, no pre-click Spotify requests, keyboard, loading, loaded, timeout, retry, layout stability, no autoplay, iframe title and fallback links'}, ensure_ascii=False))
