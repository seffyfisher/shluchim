---
title: "Bar2Go pickup points at checkout, with one small change."
description: "Kochava, my AI developer, first researched the checkout's shipping step, and only then added a link to the pickup points map."
date: 2026-10-07
draft: false
lang: en
translationKey: "2026-10-07-bar2go-pickup-points"
---

At our checkout, anyone who picks "delivery to a pickup point" can't see where the points are.
There's just a name, and a line saying you'll choose later.

That task had been sitting in our Linear.


## Research first:

Before a single line of code, Kochava researched how the checkout's shipping step works today.
(Kochava is one of my shluchim. That's Hebrew for "emissaries", and it's what I call my AI agents.)
Research only, no code.

I wanted to understand what happens in the checkout today
before changing anything in it.

When the research came back to me, I marked it with 💯.


## The change:

A narrow change.

Under the pickup points text there's now a link:
"📍 See the list of available pickup points >".

It opens Bar2Go's map in a popup, inside an iframe.
If the popup is blocked, it opens in a new tab.

The rest of the checkout wasn't touched.


## The checks:

QA, and mobile screenshots.

The task in Linear was updated with the screenshots, per the template.
And a pull request was opened, for the head of the dev team to review.


## What to take from this:

**Research before code.**
First understand what happens today, and only then touch it.

**On the most sensitive page, the smallest change.**
Checkout is where the money changes hands.
One link, with a new-tab fallback, and nothing else touched.
