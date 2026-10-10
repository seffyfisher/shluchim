---
title: "My work email and calendar, without a connector."
description: "The Outlook connector was blocked, so I signed in once in my AI agent's browser, and got the calendar as a bonus."
date: 2026-10-09
draft: false
lang: en
translationKey: "2026-10-09-work-outlook-browser"
---

My work email simply wouldn't connect to Grok Bot.

My workplace blocked the official Outlook connector (a built-in connection between systems).
So my shluchim couldn't send anything from my work email,
like reaching out to AI narration vendors for audiobooks.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)


## How it worked:

On October 9, at around one in the morning, Basher checked the mail records for our site's domain.
He confirmed it was Microsoft 365.

He ruled out the remote computer route.
That needs approval for every command, and has no access to my browser.

Instead, he opened Outlook on the web in his cloud browser,
and handed me the screen for a single sign-in with MFA (multi-factor authentication).

I didn't give anyone a password, and the session (the active connection) was saved.
Basher saved the setup to shared memory,
so every shaliach now knows how to use "work email".


![How we started connecting my work email: the shaliach offers to open the Outlook sign-in page in its browser and hand me the screen so I can sign in.](/shluchim/images/posts/work-outlook-connect.webp)


## The end-to-end test:

Basher wrote a draft in the work inbox with the day's open tasks.
He showed me a screenshot,
and sent it to my personal email only after I approved.

Then I caught that the signature was missing.
Filling in the whole message body wiped Outlook's automatic signature.

The fix is simple: type above the signature and make sure it's there.
That was saved as a rule for all the shluchim.

The next real use was a draft to the head of development, ahead of Sunday's sale.
This time with a signature.


![I ask whether he ever sends an email without going through me, and the shaliach replies that no email goes out without my explicit approval.](/shluchim/images/posts/work-outlook-approval.webp)


## And the calendar came as a gift:

It turned out the same session also opens my work calendar.
No extra connector and no extra sign-in.

That led to a routine, Monday to Wednesday at 09:00.
It reports only work meetings, and stays quiet on days with no meetings.

This is the part that changed my mornings the most.
The shluchim see my real schedule,
and I get a morning picture without opening Outlook.


## The rules we built in:

No email goes out unless I explicitly approve that specific email.

The calendar is read-only.
No creating, editing, accepting or deleting events.


## What to take from this:

**A blocked connector isn't the end of the road.**
One sign-in in the shaliach's browser solved it, without handing over a password.

**One sign-in, two services.**
Once email worked, the calendar was already there.
Worth checking what else the same sign-in opens.

**Test end to end.**
Draft, screenshot, approval and only then send.
That's how the missing signature got caught, before it reached anyone outside.

**Every fix becomes a shared rule.**
The lesson about the signature and the calendar was saved for all the shluchim, not just Basher.
