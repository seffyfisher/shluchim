"""Refresh metadata from the published RSS. Never uploads, generates or copies audio."""
import argparse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

FEED_URL = 'https://www.spreaker.com/show/7465546/episodes/feed'
SNAPSHOT = Path(__file__).resolve().parents[1] / 'src/data/podcast-feed.json'
MAX_BYTES = 5 * 1024 * 1024
ITUNES = '{http://www.itunes.com/dtds/podcast-1.0.dtd}'


class FeedError(ValueError):
    pass


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.ignored = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.ignored += 1
        elif tag in ('p', 'div', 'br', 'li'):
            self.parts.append(' ')

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.ignored = max(0, self.ignored - 1)
        elif tag in ('p', 'div', 'li'):
            self.parts.append(' ')

    def handle_data(self, data):
        if not self.ignored:
            self.parts.append(data)


def plain_text(value, limit=320):
    parser = PlainText()
    parser.feed(value)
    text = ' '.join(''.join(parser.parts).split())
    if len(text) > limit:
        return text[:limit].rsplit(' ', 1)[0].rstrip('.,;') + '…'
    return text


def web_url(value, *, host=False):
    value = value.strip()
    parsed = urlsplit(value)
    if (parsed.scheme not in ('https', 'http') or not parsed.hostname or
            parsed.username or parsed.password or any(ord(c) < 32 for c in value)):
        raise FeedError('Episode contains an invalid public URL')
    if host and parsed.hostname != 'spreaker.com' and not parsed.hostname.endswith('.spreaker.com'):
        raise FeedError('Episode page is not on the verified Spreaker host')
    return value


def duration_seconds(value):
    if not value:
        return None
    parts = value.strip().split(':')
    if len(parts) > 3 or any(not re.fullmatch(r'\d+', part) for part in parts):
        raise FeedError('Invalid episode duration')
    if len(parts) > 1 and any(int(part) >= 60 for part in parts[1:]):
        raise FeedError('Invalid episode duration')
    seconds = 0
    for part in parts:
        seconds = seconds * 60 + int(part)
    if seconds <= 0 or seconds > 2**53 - 1:
        raise FeedError('Invalid episode duration')
    return seconds


def read_snapshot(path):
    if not path.exists():
        return {'schemaVersion': 1, 'source': FEED_URL, 'episodes': []}
    data = json.loads(path.read_text())
    if data.get('schemaVersion') != 1 or data.get('source') != FEED_URL or not isinstance(data.get('episodes'), list):
        raise FeedError('Existing snapshot has an unexpected schema or source')
    guids = [entry.get('guid') for entry in data['episodes']]
    if any(not isinstance(guid, str) or not guid.strip() for guid in guids) or len(guids) != len(set(guids)):
        raise FeedError('Existing snapshot must have one entry per nonempty GUID')
    return data


def parse_feed(content, now=None):
    now = now or datetime.now(timezone.utc)
    if len(content) > MAX_BYTES:
        raise FeedError('Feed exceeds the size limit')
    if b'\x00' in content or b'<!DOCTYPE' in content.upper() or b'<!ENTITY' in content.upper():
        raise FeedError('Feed DTDs and entities are not supported')
    try:
        root = ET.fromstring(content)
    except ET.ParseError as error:
        raise FeedError('Feed is not valid XML') from error
    channel = root.find('channel') if root.tag == 'rss' else None
    if channel is None:
        raise FeedError('Expected an RSS channel')
    language = (channel.findtext('language') or 'he').strip()
    entries = {}
    for item in channel.findall('item'):
        guid = (item.findtext('guid') or '').strip()
        title = (item.findtext('title') or '').strip()
        if not guid or not title:
            raise FeedError('Every episode must have a GUID and title; no title-based matching')
        try:
            published = parsedate_to_datetime(item.findtext('pubDate') or '')
            if published.tzinfo is None:
                raise ValueError('Missing time zone')
            published = published.astimezone(timezone.utc)
        except (TypeError, ValueError, OverflowError) as error:
            raise FeedError(f'Invalid publication date for GUID {guid}') from error
        if published > now:
            continue  # A future-dated item is not published for this refresh yet.
        enclosure = item.find('enclosure')
        if enclosure is None:
            raise FeedError(f'Audio enclosure missing for GUID {guid}')
        mime = enclosure.get('type', '')
        if not (mime.startswith('audio/') or mime == 'application/ogg'):
            raise FeedError(f'Expected an audio enclosure for GUID {guid}')
        number = (item.findtext(ITUNES + 'episode') or '').strip()
        if number and (not number.isdigit() or int(number) <= 0):
            raise FeedError('Invalid episode number')
        entry = {
            'guid': guid,
            'title': title,
            'published': published.isoformat().replace('+00:00', 'Z'),
            'durationSeconds': duration_seconds(item.findtext(ITUNES + 'duration')),
            'number': int(number) if number else None,
            'language': language,
            'description': plain_text(item.findtext('description') or item.findtext(ITUNES + 'summary') or ''),
            # RSS item links can be canonical blog posts, not Spreaker pages.
            'pageUrl': web_url(item.findtext('link') or ''),
            'audioUrl': web_url(enclosure.get('url', '')),
            'audioType': mime,
        }
        if guid in entries and entries[guid] != entry:
            raise FeedError(f'Conflicting duplicate GUID {guid}; retaining the last good snapshot')
        entries[guid] = entry
    if not entries:
        raise FeedError('Feed has no published episodes; retaining the last good snapshot')
    return list(entries.values())


def fetch_feed():
    request = Request(FEED_URL, headers={
        'User-Agent': 'Shluchim-podcast-metadata/1.0 (+https://shluchim.shinlamed.com/podcast/)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
    })
    with urlopen(request, timeout=25) as response:
        web_url(response.url, host=True)
        if response.status != 200:
            raise FeedError(f'Feed returned HTTP {response.status}')
        return response.read(MAX_BYTES + 1)


def refresh(path=SNAPSHOT, fetcher=fetch_feed, now=None):
    now = now or datetime.now(timezone.utc)
    previous = read_snapshot(path)
    fetched = parse_feed(fetcher(), now)
    # RSS can have a moving window. Preserve older known entries, keyed by GUID.
    merged = {entry['guid']: entry for entry in previous['episodes']}
    merged.update({entry['guid']: entry for entry in fetched})
    episodes = sorted(merged.values(), key=lambda entry: (entry['published'], entry['guid']), reverse=True)
    if episodes == previous['episodes']:
        return False
    snapshot = {'schemaVersion': 1, 'source': FEED_URL,
                'updatedAt': now.isoformat().replace('+00:00', 'Z'), 'episodes': episodes}
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, prefix=path.name + '.', delete=False, encoding='utf-8') as output:
            temporary = output.name
            json.dump(snapshot, output, ensure_ascii=False, indent=2)
            output.write('\n')
            output.flush()
            os.fsync(output.fileno())
        os.chmod(temporary, 0o644)
        os.replace(temporary, path)
    finally:
        if temporary and os.path.exists(temporary):
            os.unlink(temporary)
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--feed-file', type=Path, help='Use a verified local RSS capture instead of making a request')
    args = parser.parse_args()
    try:
        changed = refresh(fetcher=args.feed_file.read_bytes if args.feed_file else fetch_feed)
    except (FeedError, OSError, ValueError) as error:
        print(f'Podcast refresh failed; snapshot unchanged: {error}', file=sys.stderr)
        return 1
    print('Podcast snapshot updated.' if changed else 'Podcast snapshot unchanged; feed checked successfully.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
