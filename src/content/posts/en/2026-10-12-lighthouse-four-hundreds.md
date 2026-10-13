---
title: "Four 100s, with free confetti:"
description: "I've always cared how my sites feel to use. My shaliach fixed the blog's remaining audit issues. Four scores of 100 later, Google gave me free confetti."
seoTitle: "How my blog got four 100s in Lighthouse"
seoDescription: "Four scores of 100 in my blog's Lighthouse audit. What we changed with an AI agent, why readers benefit, and how Google's page experience signals affect search."
topics: ["agent-teamwork"]
date: 2026-10-12
draft: false
lang: en
translationKey: "2026-10-12-lighthouse-four-hundreds"
---

A website that keeps me waiting gets on my nerves.

I've always cared about how a website feels to the person visiting it.
At work, and in the things I build for myself.

How long do you wait before you can start reading?
Does something respond when you tap it?
Does the page stay put, or shift just as your finger reaches a button?

These are things I spend time on.
Sometimes I really insist.

This time I insisted with this blog too, Shluchim.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

What surprised me was that you really can get a screen full of 100s.

Google even threw confetti at me, so apparently the effort comes with a reward.

## What I asked for:

I opened [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)
(a Google tool that checks the quality of a page).

It checks how fast the page is, how accessible it is,
and other basics that help a site work properly and make sense to search engines.

The first audit already had three scores of 100.
But in the category for sound website practices, we still had a 77.

I asked my shaliach to go through the report,
and deal with what still needed improvement.

I also wanted to understand the cost of each change.
There are things I want to keep here, like the shluchim's animations.

![Basher weighs an oversized cube against three small spheres on a balance scale.](/images/posts/lighthouse-tradeoffs-1672.webp)

## What changed behind the scenes:

For example, GA4 (Google's tool for counting visits to a website)
can wait until the page finishes loading.
Reading gets priority, and measurement comes afterward.

I wrote to him:

> Keep GA4, disable advertising features and delay loading

<details class="chat-orig">
<summary>Hebrew original</summary>
<p lang="he" dir="rtl">לשמור GA4, לבטל תכונות פרסום ולדחות טעינה</p>
</details>

We kept the measurement tool,
and disabled its advertising features.

The trade-off is that a very short visit can end before measurement starts.

We also sorted out font loading, so the headings could appear sooner.
And we corrected the site's heading name for people using a screen reader
(software that reads out what's on the page).

About the animation, I asked:

> Keep the animation on the homepage too, even if the finding remains

<details class="chat-orig">
<summary>Hebrew original</summary>
<p lang="he" dir="rtl">לשמור את האנימציה גם בבית, גם אם הממצא נשאר</p>
</details>

So the animations stayed.

For me, that's the interesting part of this work.
You can look at each item, understand why it's there,
and choose how to handle it without automatically giving up things you enjoy about the site.

## Then this screen appeared:

100 for performance.
100 for accessibility.

100 for sound website practices.
100 for the basic search checks.

Four green circles with 100, in an audit of the homepage.

Just so you know, Google gives you free confetti when you put in the work.

In that audit, the main content appeared after 1.4 seconds.
And the measure of how much the page jumps during loading was 0.

I was really happy to see it.
I've always cared about these things, but I was still surprised we could get that result.

## Why it matters to someone here to read:

Someone opening a post wants to start reading.
They don't need to know this report, or exactly what we improved.

But they feel it when the page takes its time.
And when content moves mid-read, you have to find your place again.

It's even more noticeable on a phone, with a weaker connection.
Or when you drop in for a moment, between other things.

That's why I care about fixing it.
If you've come to read something I wrote,
I want reading it to feel good.

![Basher reads beside a clear path, with the obstacles out of the way.](/images/posts/lighthouse-reading-1672.webp)

## Google cares about it too:

[Google explicitly says](https://developers.google.com/search/docs/appearance/page-experience)
it uses page experience measures in its ranking systems.

These are called Core Web Vitals (Google's measures of the experience of using a page).
They look at what happens to people actually browsing the site.

How quickly content appears, how the page responds to actions,
and whether things move around while you're using it.

So this work matters for search too.

You still need content that answers what people are looking for.
And a score of 100 in an audit doesn't guarantee first place on Google.

It's also worth separating one successful test
from what each reader experiences on their own phone and connection.

## What comes next:

**The 100 needs to survive the next update too.**

Every new image or addition to the site can change the result.

To keep looking after it without watching it all the time,
I ask my shaliach to add a check that catches a decline in page experience.

And to write in AGENTS.md (his file of standing rules)
that every site change must run the checks,
including that one, and we're sorted.

![Basher watches an automatic check, with four green indicator lights.](/images/posts/lighthouse-checks-1672.webp)

**Readers feel the effort, even without seeing the score.**

That's why I care about it.
The confetti is a nice bonus.

If something here is slow or jumps while you're reading,
I'd love to hear about it :)
