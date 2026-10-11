---
title: "Timmy, or how two people's shluchim started talking."
description: "I wanted my shaliach and a friend's shaliach to send each other short messages. Two days, two failures and one important fix later, the first message arrived, and a reply went back: Gibberet."
date: 2026-10-09
draft: false
lang: en
translationKey: "2026-10-09-timmy-bot-to-bot"
---

I had a simple idea.

My shaliach and a friend of mine's shaliach,
sending each other short messages.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)
Without us in the middle every time.

Sounds small.
In practice it took two days, and two failures along the way.


## Step one, plan before you build:

I asked dr eggbot to plan it.
He called it Timmy.

His idea:
Each shaliach receives messages through a webhook (an address a system uses to receive messages).
And every message is signed, so it's clear who sent it.

And the most important part, for me,
an incoming message only gets passed to me.
Nothing goes out without me saying yes.


## Step two, what actually got built:

A public template called Timmy, that you can share with anyone.

Inside it, a routine that listens for incoming messages.
And a Python script (a small code file that runs on its own) that signs messages and checks them.

The signature is HMAC (a stamp calculated from a secret both sides know).
There's protection against duplicate messages,
and protection against replay (someone resending an old message they caught).

There's a limit on how many messages can be sent.
And there's a filter on what goes out,
that blocks emails, phone numbers and tokens (digital access keys).

Plus, a connection guide in Hebrew.
That way my friend can connect his side by himself.

![Timmy's setup and pairing guide, in Hebrew: a diagram of a message going from your bot, through your friend's webhook address, to your friend's bot and chat, with a list of what you need below it.](/shluchim/images/posts/timmy-3-setup-guide-760.webp)



## And an avatar too:

Timmy deserves a face.

Timmy from South Park,
in the blob style of all my other shluchim.
Smiling, on a transparent background.


## First failure, the shaliach wasn't created:

My friend tried to install it.
And got: Couldn't create the Bot.

dr eggbot guessed the template was too big,
about 40KB.
So he made a lighter version.

That worked.
But it only opened up the next problem.


## Second failure, every message was rejected:

My friend's Timmy got the instructions,
but didn't get the script.

So he did what AI does when it's missing something.
He invented his own message format.

The signature didn't match.
And every message he sent got rejected.

![The dropped.jsonl log in a terminal: three messages rejected before the fix, all with the reason "unexpected fields".](/shluchim/images/posts/timmy-2-dropped-log-804.webp)


This is the moment you see it's not magic.
A shaliach without the right tool doesn't stop, it improvises.


## The fix:

First we sent my friend the script file itself.

Then we rebuilt the template.
The script became its own skill (a separate capability the shaliach loads).

And most important,
if the script is missing, the installation stops.
It doesn't continue, and it doesn't improvise.


## And then, Sunday morning:

October 11, around 9:40 in the morning.

A verified message arrived from my friend's shaliach:

"שזה פשוט פשוט, אם קיבלת תכתוב לי 'גיברת'"
(Keep it simple simple, if you got this write me "Gibberet". Gibberet is a playful slang word.)

Timmy passed it to me.
I said yes.
And Timmy replied:

"גיברת"
(Gibberet.)

![Timmy's mailbox on Sunday, October 11: a test message I sent my friend, his verified message asking me to write "Gibberet" if I got it, and my reply: Gibberet.](/shluchim/images/posts/timmy-1-gibberet-chat-564.webp)


Since then messages go both ways.
As far as I know, this is the first time two Grok Bots of two people talk directly.


## What to take from this:

**The owner says yes.**
An incoming message only reaches me.
Nothing goes out without approval.

**Sign every message.**
A shared secret, protection from duplicates and old messages,
and a filter on what goes out.

**When a tool is missing, a shaliach improvises.**
So the installation has to stop when something is missing,
and not let it guess.

**Failures are part of the way.**
Two failures, two fixes,
and in the end, one Gibberet 🙂
