"""Metadata synchronization tests; all feeds below are controlled fixtures."""
from datetime import datetime, timezone
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('podcast_sync', Path(__file__).with_name('sync-podcast.py'))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)
NOW = datetime(2026, 10, 15, 18, tzinfo=timezone.utc)


def item(guid='fixture-one', title='A fixture episode', date='Thu, 15 Oct 2026 12:00:00 +0000', duration='5:14', description='Published description.'):
    return f'''<item><guid isPermaLink="false">{guid}</guid><title>{title}</title>
    <pubDate>{date}</pubDate><link>https://www.spreaker.com/episode/fixture--123</link>
    <description><![CDATA[{description}]]></description><itunes:duration>{duration}</itunes:duration>
    <itunes:episode>1</itunes:episode><enclosure url="https://api.spreaker.com/download/episode/123/fixture.mp3" type="audio/mpeg" /></item>'''


def feed(*items):
    return ('<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"><channel><language>he</language>' + ''.join(items) + '</channel></rss>').encode()


class PodcastSyncTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / 'snapshot.json'

    def refresh(self, content):
        return sync.refresh(self.path, lambda: content, NOW)

    def test_first_snapshot_and_idempotent_refresh(self):
        self.assertTrue(self.refresh(feed(item())))
        content = self.path.read_bytes()
        entry = json.loads(content)['episodes'][0]
        self.assertEqual(entry['guid'], 'fixture-one')
        self.assertEqual(entry['durationSeconds'], 314)
        self.assertEqual(entry['published'], '2026-10-15T12:00:00Z')
        self.assertFalse(self.refresh(feed(item())))
        self.assertEqual(self.path.read_bytes(), content)

    def test_deduplicates_guids_without_conflating_matching_titles(self):
        self.refresh(feed(item(), item(), item(guid='different-guid')))
        self.assertEqual(len(json.loads(self.path.read_text())['episodes']), 2)

    def test_changed_guid_metadata_updates_in_place(self):
        self.refresh(feed(item()))
        self.refresh(feed(item(title='Corrected title')))
        entries = json.loads(self.path.read_text())['episodes']
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['title'], 'Corrected title')

    def test_keeps_older_entries_when_rss_window_moves(self):
        self.refresh(feed(item(guid='older', date='Wed, 14 Oct 2026 12:00:00 +0000')))
        self.refresh(feed(item(guid='newer')))
        self.assertEqual([e['guid'] for e in json.loads(self.path.read_text())['episodes']], ['newer', 'older'])

    def test_conflicting_duplicates_fail_without_replacing_snapshot(self):
        self.refresh(feed(item()))
        before = self.path.read_bytes()
        with self.assertRaises(sync.FeedError):
            self.refresh(feed(item(), item(title='Conflicting duplicate')))
        self.assertEqual(self.path.read_bytes(), before)

    def test_bad_feed_or_item_preserves_exact_last_good_bytes(self):
        self.refresh(feed(item()))
        before = self.path.read_bytes()
        invalid = [b'<html>Access denied</html>', b'<rss>', feed(), feed(item(guid='')),
                   feed(item(date='not a date')), feed(item(duration='3:99')),
                   feed(item()).replace(b'audio/mpeg', b'text/html'),
                   feed(item()).replace(b'https://www.spreaker.com/episode/fixture--123', b'javascript:alert(1)')]
        for content in invalid:
            with self.subTest(content=content[:80]), self.assertRaises(sync.FeedError):
                self.refresh(content)
            self.assertEqual(self.path.read_bytes(), before)

    def test_network_error_preserves_snapshot(self):
        self.refresh(feed(item()))
        before = self.path.read_bytes()
        def fail():
            raise OSError('HTTP 503 or timeout')
        with self.assertRaises(OSError):
            sync.refresh(self.path, fail, NOW)
        self.assertEqual(self.path.read_bytes(), before)

    def test_failed_atomic_replace_preserves_snapshot_and_cleans_temporary_file(self):
        self.refresh(feed(item()))
        before = self.path.read_bytes()
        with patch.object(sync.os, 'replace', side_effect=OSError('simulated disk failure')):
            with self.assertRaises(OSError):
                self.refresh(feed(item(guid='new')))
        self.assertEqual(self.path.read_bytes(), before)
        self.assertEqual(list(self.path.parent.iterdir()), [self.path])

    def test_markup_becomes_plain_text_and_script_content_is_removed(self):
        entry = sync.parse_feed(feed(item(description='<p>Hello &amp; goodbye.</p><script>bad()</script><p>Another line.</p>')), NOW)[0]
        self.assertEqual(entry['description'], 'Hello & goodbye. Another line.')

    def test_future_dated_entries_are_not_published_early(self):
        entries = sync.parse_feed(feed(item(), item(guid='future', date='Fri, 16 Oct 2026 12:00:00 +0000')), NOW)
        self.assertEqual([e['guid'] for e in entries], ['fixture-one'])

    def test_dtd_and_oversized_input_are_rejected(self):
        for content in [b'<!DOCTYPE rss [<!ENTITY x "expanded">]><rss><channel /></rss>', b'x' * (sync.MAX_BYTES + 1)]:
            with self.assertRaises(sync.FeedError):
                sync.parse_feed(content, NOW)

    def test_duration_formats_and_optional_duration(self):
        self.assertEqual(sync.duration_seconds('314'), 314)
        self.assertEqual(sync.duration_seconds('01:02:03'), 3723)
        self.assertIsNone(sync.duration_seconds(None))

    def test_rss_item_link_can_be_an_exact_canonical_blog_url(self):
        url = b'https://shluchim.shinlamed.com/posts/2026-10-13-wake-up-sky/'
        content = feed(item()).replace(b'https://www.spreaker.com/episode/fixture--123', url)
        self.assertEqual(sync.parse_feed(content, NOW)[0]['pageUrl'], url.decode())

    def test_verified_first_item_metadata_fixture(self):
        fixture = Path(__file__).with_name('fixtures') / 'podcast-first-item.xml'
        entry = sync.parse_feed(fixture.read_bytes(), NOW)[0]
        self.assertEqual(entry['guid'], 'https://api.spreaker.com/episode/75804362')
        self.assertEqual(entry['pageUrl'], 'https://shluchim.shinlamed.com/posts/2026-10-13-wake-up-sky/')
        self.assertEqual(entry['audioUrl'], 'https://api.spreaker.com/download/episode/75804362/eps1_upload.mp3')
        self.assertEqual(entry['durationSeconds'], 315)
        self.assertEqual(entry['published'], '2026-10-15T10:06:06Z')

    def test_malformed_existing_snapshot_is_not_overwritten(self):
        self.path.write_text('{"schemaVersion":2}')
        with self.assertRaises(sync.FeedError):
            self.refresh(feed(item()))
        self.assertEqual(self.path.read_text(), '{"schemaVersion":2}')


if __name__ == '__main__':
    unittest.main()
