---
title: "From my phone, at the beach: a GA4 mystery dressed up as a campaign."
description: "A fake traffic source in GA4 was logging 20,000 sessions a week. My AI agents tracked it down and fixed it while I stayed on the beach."
date: 2026-09-09
draft: false
lang: en
translationKey: "2026-09-11-product-page-beach"
---

I was at the beach, at a birthday party.
Sun on my head.

From my phone, I was trying to make sense of something weird in GA4.
A source called product_page, with around 20,000 sessions a week.

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

The store was pushing a field called source into the dataLayer, with values like product_page.
In other words, every product page was announcing a "source".

GA4 treats that name as a traffic source.
So the Acquisition report quietly filled up with a lie.


## How it worked:

From my phone at the beach, I got my shluchim moving.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

The analytics shaliach diagnosed it and wrote a handoff, a proper written brief for the next one.
A cloud shaliach opened a PR on the site,
and the QA shaliach checked that the fix made sense.

We renamed the parameter from source to source_ui,
so it stops getting shoved into the traffic parameters.

```chat
seffy: Check if source is used anywhere else and rename all of them to source_ui so everything is right.
seffy: Not just this case. Check everything, make sure.
```

```chat-he
seffy: צריך לבדוק אם יש עוד שימוש ב source ולשנות את כולם לsource_ui כדי שהכל יהיה תקין
seffy: לא רק המקרה הזה צריך לבדוק הכל לוודא
```

Heads up: the site and GTM (Google Tag Manager) have to go live together.

I didn't pack up and leave the beach.
My phone was enough to run the whole loop and get back in the water.


## What to take from this:

**Your phone is enough.**
A short, precise task for the right shaliach. No waiting to get back to the office.

**A handoff between shluchim covers for me in the middle.**
A written brief connects analytics, code and QA, even when I'm not around.

**Let the team close the loop.**
Diagnosis, fix, PR and QA.
I only step in to approve the direction, not to do every step by hand.
