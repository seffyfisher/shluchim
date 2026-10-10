---
title: "A weekly Clarity digest that stays quiet when there's nothing to say."
description: "Every Monday my Clarity AI agent reports rage clicks, dead clicks and problem session recordings, but only when something actually matters."
date: 2026-09-28
draft: false
lang: en
translationKey: "2026-10-05-clarity-weekly-digest"
---

I wanted a shaliach that reads e-vrit's Microsoft Clarity.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

Clarity records sessions (visits) on the site.
That's how you see rage clicks (repeated clicks on something that doesn't respond), dead clicks, JS errors and recordings of problem sessions.

The ask: a report in Hebrew, short and direct,
without touching any Clarity settings.

```chat
seffy: This coming week I'd like to focus on cart recordings that show problems we can look into.
seffy: I want to understand which problems there are actually worth fixing.
```

```chat-he
seffy: אשמח להתמקד בשבוע הקרוב בהקלטות בסל שמעידות על בעיות שאפשר לבחון
seffy: אשמח להבין מה באמת בעיות שיש שם ששווה לתקן
```


## How it worked:

Basher hooked up the Clarity API as a connector.

The Clarity shaliach set a weekly routine, every Monday at 09:10.
This week vs. last week.
In a quiet week it stays silent, and only speaks when there's something that matters.

It also froze a baseline for friction in the mobile cart and shipping steps.
Cart: 70 rage clicks, 2,772 dead clicks.
Shipping: 27 rage clicks, 566 dead clicks.

Together with Anali's numbers from Google Analytics,
we'll be able to measure the planned slim mobile cart change, before and after,
over the same 7-day window.


## The message that got a 💯:

The week of September 21 to 28.

About 369k sessions.
456 rage clicks, down from 772.
26,320 dead clicks, 3.6%, down from 4.37%.

JS errors at about 3%, flagged as known noise.

The cart spike calmed down.
Dead clicks in the cart dropped from 6,053 to 3,853, and rage clicks from 108 to 39.
But the cart is still number 1 for friction.

In the recordings you see repeated mobile taps on the shipping and payment button,
a "save" loop in shipping, a confusing toggle (on/off switch), and rage over coupons.

Five direct links to recordings were attached,
plus one recommendation: keep the slim mobile cart, with the button at the top, as the next thing to ship.

The holiday week after that, it stayed quiet.


## Who took part:

The Clarity shaliach, Basher, Anali with the Google Analytics baseline,
and the Daily hand meeting shaliach, to get aligned on the cart.


## What to take from this:

**A weekly routine that knows how to stay quiet.**
A quiet week doesn't need a message.

**Freeze a baseline before a change.**
That way you'll actually know whether the slim cart helped.

**Numbers, recordings and one recommendation.**
Not a list of twenty things, just the next thing to ship.
