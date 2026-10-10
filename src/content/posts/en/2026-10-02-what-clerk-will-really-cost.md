---
title: "What Clerk will cost, without guessing from login events."
description: "Pricing Clerk by monthly retained users, including our reader app, showed our first estimate was an order of magnitude too low."
date: 2026-10-02
draft: false
lang: en
translationKey: "2026-10-02-clerk-auth-cost"
---

I asked what Clerk, the sign-up and login service, would cost us,
based on our sign-up and login volumes.

Including the reader app, not just the website.

I wanted a number for planning.
Not a guess from login events alone.


## How it worked:

Basher and the analytics shaliach pulled Clerk's pricing.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)
Clerk charges by MRU, monthly retained users.

In parallel, they pulled data from GA4, for both the store and the reader.

And then they showed the gap.
Based on login events alone, it comes to about $25 a month.
But for planning, we need about $500 a month,
from around 73,000 signed-in MRUs in the reader.


## What came out:

We caught an order-of-magnitude shortfall,
before any budget or product decisions.


## What to take from this:

**Price by the vendor's metric.**
Clerk counts MRUs.
Login events alone are misleading.

**Store and reader together.**
If part of the usage is in the app,
don't pull only the website data.

**A planning number vs. a "what I have right now" number.**
Let the analytics shaliach separate the two,
before you set a budget.
