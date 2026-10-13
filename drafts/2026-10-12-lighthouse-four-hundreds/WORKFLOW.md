# Lighthouse story release

## Current state

Seffy approved the full Hebrew text and all three illustrations. After being told
that the GIF file had not reached the cloud, he explicitly instructed:
“דחוף הכל ליצור הסיפור מוכן שחרר”. The release proceeds with the approved text
and illustrations in Hebrew and English. The unavailable original GIF is omitted
from this release; that limitation must be reported plainly.

## Content and source assets

- Story date: 2026-10-12, preserved in both language files.
- Slug and translation key: `2026-10-12-lighthouse-four-hundreds`.
- Two real quotations, faithfully translated with native Hebrew-original details.
- Three approved illustrations: tradeoffs, reading and checks. Their original PNGs
  are in `images/`, 1672×941 native, exceeding twice the actual article width.
- Public WebP assets are quality 92, in 1024px and native 1672px widths, with no upscaling.
- The shared image renderer emits responsive candidates only when a matching
  derivative actually exists. This adds no client JavaScript.
- Placements match the approved review; images have at least two paragraphs between them.

## Checks before release

- Rebased onto latest main, including the assistant handoff and external-link rules.
- Existing test suite and controlled featured build pass.
- Strict production SEO guard passes for 72 pages and 28 matching language pairs.
- Link guard passes: 546 external links open a new tab; 1,978 site links stay in the same tab.
- Chromium production checks: Hebrew and English, mobile and desktop, both themes,
  responsive images, no draft badge, indexing, canonical links and working assistant copy.
- RSS, sitemap and llms.txt include the new story.

## Future original GIF

Seffy requested the actual recording first, after the visible summary. The desktop
attachment provided a preview and a Mac path, but no downloadable animated bytes.
If the original GIF arrives as a file or ZIP, preserve all animation frames, insert
it first in both posts, verify the two pages, and publish the approved media update.
Do not manufacture a replacement screenshot or animation.

The maintenance paragraph is prospective: it does not claim that this writing
session implemented a Core Web Vitals regression suite.
