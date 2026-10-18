# Social share cards (public/og/*.jpg)

`card.html` is the source of the two 1200x630 cards (`?lang=he`, `?lang=en`) that every page uses as `og:image`
unless it is a post with usable artwork. Posts get their own card automatically at build time
(`src/lib/og-images.mjs`, served from `/og/posts/`): `socialImage`, then `cover`, then the article's images, cropped
to 1200x630 and never enlarged. A post whose images are all too small for a 600x315 card keeps this site card.
The site card uses the site's own fonts and the team avatars, flat colours only.
Regenerate when the cast, the headline or the fonts change (any Playwright install works, it is not a project dependency):

```bash
for l in he en; do
  npx playwright screenshot --viewport-size=1200,630 --wait-for-timeout=800 "file://$PWD/scripts/og-card/card.html?lang=$l" /tmp/og-$l.png
  node -e "require('sharp')('/tmp/og-$l.png').flatten({background:'#fafafa'}).jpeg({quality:88,mozjpeg:true}).toFile('public/og/shluchim-$l.jpg')"
done
```

Keep the headline in sync with `SEO_HOME` and `OG_IMAGE.alt` in `src/config.ts`. Hebrew text on the card follows the usual
vocabulary rule (no סוכנים/בוטים, שְׁלוּחִים with niqqud).
