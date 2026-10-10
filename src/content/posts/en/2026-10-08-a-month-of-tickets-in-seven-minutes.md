---
title: "A whole month of tickets, in seven minutes."
description: "A monthly summary of 9,001 support tickets against our help center: 16 draft FAQs and two real production bugs."
date: 2026-10-08
draft: false
lang: en
translationKey: "2026-10-08-help-center-monthly"
---

I asked for a monthly summary of the help center,
not just yesterday's daily package.

I wanted to know what customers ask that help.e-vrit.co.il doesn't answer.
Which answers are weak, and what's worth highlighting.


## Background:

Since October 4, a daily routine has run at 10:27.

It reads yesterday's Glassix tickets,
and cross-checks them against the roughly 239 articles in the help center.

Then it writes draft Q&As in Hebrew.
Each draft is marked as new, overlapping, or strengthening.
Nothing gets published without me.


## What happened:

On October 8, I asked for the full month.

Within about 7 minutes, 30 days of Glassix exports were gathered, from September 8 to October 7.
9,001 unique tickets, without a single missing day.

Every recurring topic was ranked by volume and trend,
and marked as missing, weak or covered.

The big ones:

- Shipping: about 1,350.
- A paid-for book won't open: about 850.
- Coupons: about 480.
- Stuck payment: about 430.
- Login: about 410.
- Gifts: about 300.

Some topics are rising sharply.
Part of an order out of stock is up 3x.
Also rising: a damaged or wrong printed book, "delivered but never arrived", and cancellations.

It was all merged into one file of 16 drafts.
Six of them cover about 2,700 tickets a month,
and can be published with almost no policy decisions.

Bugs that an FAQ can't solve were split out.

The shaliach also corrected its own wrong guess about one-click purchase in the app.
It did that after checking a live article.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)


## The follow-up that same night:

I asked which email exactly had the broken "contact us" link.

The shaliach read full ticket threads, and found it.
It's the delay email, "The books you ordered are running a little late",
sent at around 18:00.

It's quoted in 146 tickets, not 37.
There are 16 explicit complaints, and it's still live.

A second bug wasn't in an email at all.
The "order received" SMS links to the QA server.

The shaliach opened two bugs in Linear, E-369 and E-370, using the BUG template.
They were assigned to a developer, with evidence and a request to reproduce.

A checkout failure with a kibbutz address went to Nitza.
She reproduced it against QA, and suggested a copy fix.


## Why this is good:

One picture of the month: what's missing, what's weak and what's rising.

Ready drafts, ranked by impact.
And two real production bugs, with proof.

All from the tickets,
without me digging by hand even once.

The shluchim involved:
the customer service shaliach for the analysis, the drafts and Linear,
the Glassix puller for the daily pulls,
and Nitza for the UX reproduction and the recommendation.


## What to take from this:

**A daily routine builds an archive.**
Because there were 30 daily exports, the monthly summary took minutes.

**Ask "where exactly?".**
One follow-up question turned a vague problem into a specific email,
with the real number, 146 and not 37.

**Separate FAQ from bug.**
Some of the pain is content, and some is code.
Each goes to the right place.

**The shaliach corrects itself against a live source.**
Ask it to check a real article before it draws a conclusion.
