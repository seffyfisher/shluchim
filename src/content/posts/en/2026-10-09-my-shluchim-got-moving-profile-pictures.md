---
title: "My shluchim got profile pictures that move."
description: "Basher turned character expression sheets into animated profile pictures, and each AI agent set its own new picture."
date: 2026-10-09
draft: false
lang: en
translationKey: "2026-10-09-animated-avatars"
---

I made character sheets for my shluchim.
A character sheet is a grid of 8 to 16 frozen poses with different expressions.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

I asked Basher to turn each one into a smooth animated profile picture.


## How it worked:

Basher cut each grid into frames (individual images),
and removed the white background so it was transparent.

Then he aligned the head so it wouldn't jump.
Each character had a different anchor: the chin, the hat or the base.

He added transition frames with easing,
meaning each pose gradually melts into the next.
And it all came out as an APNG file, an animated image that works like a PNG.

Each shaliach got its file, and set the picture itself.
Anali, Shon (strategy), Hiba (invoices),
Dima, Kochava, Chef and Shlomby.


## My rounds of feedback:

I asked for a transparent background, and a head that doesn't jump.

```chat
seffy: make it smoother, add frames
```

For Kochava we removed the ponytail,
and rebuilt the top of her head, rounded.

And the files came out too big for the profile picture limit.
So we compressed them to about 2 MB.


## What didn't work:

Chef's chewing still looked like something dissolving.

Basically, a gradual transition between frozen images doesn't create real motion.
For real motion you need a video model, or motion interpolation (filling in motion between images).


## The best moment:

Shlomby got a 360° spin, in 16 frames,
in a loop (a repeating cycle) without a single seam.

I gave him a 💯.

![Shlomby, the fitness shaliach, spinning 360 degrees: a black character with antennas and an orange headband.](/shluchim/images/posts/shlumbi.webp)


## What to take from this:

**One anchor per character.**
Chin, hat or base.
That way the head doesn't jump between frames.

**Check the limit before you finish.**
A beautiful file that doesn't fit as a profile picture isn't worth much.

**Know where the tool ends.**
Transitioning between images isn't motion.
When you need real motion, go to a video model.
