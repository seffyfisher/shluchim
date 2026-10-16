---
title: "From my phone, at the beach: a GA4 mystery dressed up as a campaign."
description: "A fake traffic source in GA4 was logging 20,000 sessions a week. My AI agents tracked it down and fixed it while I stayed on the beach."
seoTitle: "A fake GA4 traffic source, fixed by AI agents"
seoDescription: "A fake product_page traffic source in GA4 logged 20,000 sessions a week. The cause was a dataLayer field named source. AI agents fixed it from my phone."
topics: ["ai-at-work", "agent-teamwork"]
date: 2026-09-09
updated: 2026-10-16
draft: false
lang: en
translationKey: "2026-09-11-product-page-beach"
---

I was at the beach, at a birthday party for my kid's friend.
Sun beating down, kids running everywhere,
and my only goal was simply to survive the event in peace.

Then I opened Analytics on my phone (rookie mistake).

I saw something that ruined my quiet:
a new traffic source named product_page,
with around 20,000 sessions (site visits) a week.
And everything was showing up as "not set".

It looked just like a mysterious campaign someone fired up without telling anyone,
or ad spend pouring straight down the drain.
And on the beach, between the snacks and the birthday cake,
you have no laptop and zero energy to start digging into code.

The usual choice in moments like this is pretty annoying:
either pack up, head home to a laptop and ruin the mood for everyone,
or stay on the sand and spend the entire party stressing in your head.

```chat
seffy: There's a campaign in Analytics coming from a source called product_page, with source and campaign "not set", and I can't track it down.
Can you dig into both the site and Analytics, figure out where it comes from so I can fix the "not set", and what it even is?
```

```chat-he
seffy: יש לי קמפיין באנליטיקס שמגיע ממקור שנקרא product_page עם סורס וקמפיין not set ואני לא מצליח לאתר את זה
תוכל לחקור גם את האתר וגם את האנליטיקס כדי להבין מאיפה זה בא שאוכל לתקן שזה מגיע not set ומה זה בכלל
```

It looked like a campaign.
It wasn't.


## What was going on:

The store was pushing a field called source into the dataLayer (the site's data layer),
with internal values like product_page.
In other words, every single product page was announcing itself as a "source".

GA4 (Google Analytics 4) took that name seriously and logged it as an external traffic source.
That's how the Acquisition (traffic sources) report quietly filled up with a lie,
throwing off all the numbers.


![Anali untangles phone analytics beside a small beach umbrella.](/images/posts/product-page-beach-story-1672.webp)


## How it worked:

From my phone at the beach, I got my shluchim moving.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

The analytics shaliach diagnosed it and wrote a handoff, a proper written brief for the next step.
A cloud shaliach opened a PR (pull request) on the site,
and the QA shaliach verified that the fix made sense and didn't break anything else.

We renamed the parameter from source to source_ui,
so it stops getting pushed into traffic sources.

```chat
seffy: Check if source is used anywhere else and rename all of them to source_ui so everything is right.
seffy: Not just this case. Check everything, make sure.
```

```chat-he
seffy: צריך לבדוק אם יש עוד שימוש ב source ולשנות את כולם לsource_ui כדי שהכל יהיה תקין
seffy: לא רק המקרה הזה צריך לבדוק הכל לוודא
```

Heads up: the site and GTM (Google Tag Manager) have to go live together.

I didn't leave the beach or open a laptop.
My phone was enough to run the whole loop and get back to the party with a clear head.


## What to take from this:

**Your phone is enough.**
A short, precise task for the right shaliach. No waiting to get back to the office.

**A handoff between shluchim covers for me in the middle.**
A written brief connects analytics, code and QA, even when I'm not around.

**Let the team close the loop.**
Diagnosis, fix, PR and QA.
I only step in to approve the direction, not to do every step by hand.
