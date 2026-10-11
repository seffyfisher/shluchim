# Social share cards (public/og/*.jpg)

`card.html` is the source of the two 1200x630 cards (`?lang=he`, `?lang=en`) that every page uses as `og:image`
unless a post has its own `cover`. It uses the site's own fonts and the team avatars, flat colours only.
Regenerate when the cast, the headline or the fonts change (any Playwright install works, it is not a project dependency):

```bash
for l in he en; do
  npx playwright screenshot --viewport-size=1200,630 --wait-for-timeout=800 "file://$PWD/scripts/og-card/card.html?lang=$l" /tmp/og-$l.png
  node -e "require('sharp')('/tmp/og-$l.png').flatten({background:'#fafafa'}).jpeg({quality:88,mozjpeg:true}).toFile('public/og/shluchim-$l.jpg')"
done
```

Keep the headline in sync with `SEO_HOME` and `OG_IMAGE.alt` in `src/config.ts`. Hebrew text on the card follows the usual
vocabulary rule (no סוכנים/בוטים, שְׁלוּחִים with niqqud).
