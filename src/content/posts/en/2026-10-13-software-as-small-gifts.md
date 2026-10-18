---
title: "Software as (small) gifts"
description: "A colleague's wrong-keyboard-language habit became TypoSwap, a small software gift for Mac and Windows. Still in testing, with our joke and a tear-open installer."
listDescription: "A keyboard-language mistake became a gift idea: TypoSwap, a ready-to-paste correction and an installer you unwrap."
seoTitle: "Personal software gifts with AI: TypoSwap"
seoDescription: "TypoSwap is a gift for 2 operating systems, Mac and Windows: local keyboard correction, ready-to-paste text and tear-open installation. Still in testing."
emoji: "🎁"
topics: ["everyday-ai", "ai-at-work"]
date: 2026-10-13
draft: false
lang: en
translationKey: "2026-10-13-software-as-small-gifts"
---

We're used to giving the people we love physical gifts. A book, a piece of clothing, a gadget, or even, heaven forbid, a gift card. I think it's time to widen the options: give software as a gift. Something we built for a person we love, that solves one of their problems and perhaps hides a joke only the two of us understand.

Following the discussion about disposable software, the kind you build, use and throw away, I think there's room for software you build in someone's honor. A small, personal tool whose idea starts with paying attention to someone you love.

![Seffy and Bashar with an idea for a software gift](/media/posts/software-as-small-gifts/01-personal-gift-1672.webp)

So let's start.

## First, find a problem:

Like any good product, first we find a problem. We're Jewish; this shouldn't be complicated.

Once we've found it, we make sure it hurts enough, or happens often enough, for the person we're building for. Something we've noticed annoys them, takes up their time or makes them do the same work over and over.

From there, open a conversation with the coding shaliach you work with: Grok Bot, Cursor, OpenAI's Codex, Claude Code and the like. You can talk out loud, or give the shaliach a transcript, and ramble away. Everything: what I noticed, what bothered them, what would make them happy and how we'll know the software has done its job. And of course, which private joke we can put inside.

(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

Do all this in Plan mode, planning before building. Ask it to research what already exists, understand what's possible and what's complicated, then make a work plan you can see from above. If the software has an interface, you can also ask for a few prototypes and sample designs to get a feel for the idea before building.

To give the work more structure, I recommend using skills, instruction files that guide the coding shaliach. You can start with [Matt Pocock's skills](<https://github.com/mattpocock/skills>) or [pstack](<https://github.com/cursor/plugins/tree/main/pstack>). I'll write more about these ways of working later.

## Hey, hey, you're writing in Yiddish:

Here's what I did with this idea.

A colleague at work, a team lead, kept getting caught by a mistake we all make: typing Hebrew while the keyboard is set to English, or the other way around. You type away, then someone next to you says, "Hey, hey, you're writing in Yiddish."

They mean gibberish, of course. The words in your head were perfectly fine. The keyboard language was simply pointing the wrong way.

It's one of the things I'd noticed getting on his nerves. At some point I thought: wow, this would make a great gift.

My first idea was a small tool running in the background on Windows and Mac. When it spotted a keyboard-language mistake, it would offer a one-click correction. That was our starting point.

And right after the correction, it should throw in something Yiddish for our private joke. That's part of the gift. He'd meet our joke at exactly the moment it always comes up.

![Kochava's hair clip with the clear logo](/media/posts/software-as-small-gifts/02-keyboard-plan-logo-1672.webp)

## What I did with it:

I opened a conversation with the coding shaliach and explained what I wanted to build. Here's my original prompt, as I wrote it. I added the story about my colleague and the joke as part of the planning.

I didn't try to turn it straight into a grand specification. I wanted to convey the fun of it, and the moment the tool should help with. Then I asked: let's research this. What's possible, what isn't, and what makes a tool like this complicated?

I stayed in Plan mode. First, a plan we could look at from above, to understand what we were going to build and what still needed checking. How do you recognize this kind of mistake? When should you suggest a correction? How should it work on each operating system?

### My original TypoSwap prompt

*English translation of my original prompt. The Hebrew original is available below, verbatim.*

<button type="button" data-gift-copy aria-live="polite" data-done="Copied" data-fail="Selected for manual copying" data-analytics-content="idea" data-analytics-action="copy" data-analytics-id="software-gift-typoswap" hidden>Copy prompt</button>

```chat
seffy: I want to build software that takes care of it whenever I accidentally type in English and get Hebrew and vice versa, it needs to be available across the whole computer and available for Windows and Mac, it needs to be super efficient so it barely affects memory and storage on the computer
and the goal is simple, you typed something in English that you wanted in Hebrew or typed in English that you wanted in Hebrew, something super unclear comes out, the software should let you select the text and extremely easily, using a keyboard shortcut or right-clicking and choosing an option that exists there after you install the software, it immediately changes it to Hebrew or English as needed.
It's very important that it really works very well before everything else, meaning the detection that the text really came out wrong should be excellent so it can also immediately suggest would you like to replace it and did you mean... and not just something you can use passively;
```

**Original Hebrew prompt, verbatim:**

<button type="button" data-gift-copy aria-live="polite" data-done="הועתק" data-fail="סימנתי את הטקסט להעתקה ידנית" data-analytics-content="idea" data-analytics-action="copy" data-analytics-id="software-gift-typoswap-original-he" hidden>העתקת הפרומפט</button>

```chat-he
seffy: אני רוצה לבנות תוכנה שדואגת לי כל פעם שאני מקליד בטעות באנגלית ויצא לי עברית ולהפך, צריך להיות זמין ברמת כל המחשב וזמין למעכת ההפעלה ווינדוס ומק, זה צריך להיות סופר יעיל שכמעט לא משפיעה על הזכרון והאחסון במחשב
והמטרה היא פשוטה, הקלדת משהו באנגלית שרצית בעברית או הקלדת באנגלית שרצית בעברית, יוצא משהו סופר לא ברור, התוכנה אמור לאפשר לך לסמן את הטקסט ובקלות קיצונית על ידי קיצור מקלדת או לחיצה על מקש ימיני ובחירה מאופציה שם שקיימת אחרי שהתקנת את התוכנה זה ישר יעביר לך לעברית או לאנגלית לפי הצורך.
חשוב מאוד שזה באמת יעבוד ממש טוב לפני הכל , כלומר שהזיהוי שהטקסט אכן לא יצא תקין יהיה מעולה כך שזה יכול ישר גם להציע לך האם תרצה להחליף והתכוונת ל... ולא רק משהו שאפשר להשתמש בו בצורה פאסיבית;
```

I didn't even get into visual design. To me, the ideal experience for this tool is almost invisible: it sits quietly, appears when needed, helps and moves on.

What mattered to me in planning this gift was when the tool steps in and how it does that. That's where I wanted to put the energy, along with the little moment after the correction that would make him smile.

### Seeing the plan from above

*Illustrative reconstruction based on the story · Plan mode*

<button type="button" data-gift-copy aria-live="polite" data-done="Copied" data-fail="Selected for manual copying" data-analytics-content="idea" data-analytics-action="copy" data-analytics-id="software-gift-plan" hidden>Copy prompt</button>

```chat
seffy: The experience should be almost invisible. The tool sits quietly, appears when needed, corrects with a click and moves on. Let's not get into visual design now.

First, show me the work plan from above.
```

**Coding shaliach**

> Proposed plan before we start building:
>
> 1. Research detection of keyboard-language mistakes and the limitations on Windows and Mac.
> 2. Define when to offer a correction and what happens when detection is wrong.
> 3. Build the conversion and check how to return the corrected text to the application, then add the joke.
> 4. Test the behavior and prepare a ZIP package for delivery.

## What changed during the build:

We named the tool TypoSwap. The goal was to take a sentence like `akuo nv akunl` and turn it into `שלום מה שלומך` ("hello, how are you"), without typing everything again.

We built the engine in Rust, a programming language, with an emphasis on low resource use and a minimal interface. The conversion maps physical key positions between Hebrew and English.

To detect a mistake while typing, we added checks based on word and letter-sequence frequency. Processing happens locally on the computer, without storing typing history.

We connected the core to Mac and Windows through native operating-system components. We added an action on selected text, a keyboard shortcut you choose by pressing the keys, and suggestions beside the cursor.

Then testing changed the solution. Mac permissions needed attention. In some applications we could read the text, but replacing it directly was difficult.

We moved to a simple flow: detect a mistake, prepare the correction on the clipboard and show "Ready to paste." The user selects the text and pastes the correction. The original request was for direct replacement; testing led us to this solution.

![TypoSwap interface illustration showing a correction ready to paste](/media/posts/software-as-small-gifts/04-typing-workflow-1120.webp)

*Interface illustration: TypoSwap prepares the correction for pasting. Select the text and paste, without typing it again.*

The little popup disappears after a few seconds. We also put in phrases like "Oy gevalt" for that Yiddish joke of ours.

We packaged Mac builds for Intel and Apple Silicon (Apple's processors), and a Windows installer for x64 (64-bit) computers. We wrote tests for the core, preparing text on the clipboard and the installation mechanisms.

But this is still a test version. Automated tests and a successful build don't mean everything works in every application. My first Windows trial exposed a bug in activating the suggestion beside the cursor, and there's more to check before the gift is ready to hand over.

## A gift in a ZIP file:

Now I have a gift wrapped in a ZIP file, with test versions for both systems. Once I've made sure the flow works properly, I'll send it to my dear colleague. I hope it saves him that annoying moment and makes him laugh along the way.

![The shluchim wrapping software as a gift](/media/posts/software-as-small-gifts/03-wrapped-software-1672.webp)

### What the installation experience looks like

A simulation of the Windows installation experience: extract the ZIP, open the gift, choose a keyboard shortcut and then try the correction.

<video class="software-gift-video" controls playsinline preload="none" width="1920" height="1080" poster="/media/posts/software-as-small-gifts/installation-poster.webp" aria-label="Simulation of the TypoSwap Windows installation experience">
<source src="/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4" type="video/mp4">
<a href="/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4">Original simulation file (MP4)</a>
</video>

[Original simulation file (MP4)](/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4)

The ZIP itself got me thinking about the packaging. I wanted installation to feel like opening a gift.

### My original installation-experience prompt

*English translation of my original prompt. The Hebrew original is available below, verbatim.*

<button type="button" data-gift-copy aria-live="polite" data-done="Copied" data-fail="Selected for manual copying" data-analytics-content="idea" data-analytics-action="copy" data-analytics-id="software-gift-installation" hidden>Copy prompt</button>

```chat
seffy: How can we create an installer file that, when you install it, makes you feel like you received a gift, and your installation process includes opening the gift (the zip), just like the experience of tearing gift wrap and removing the things wrapping the gift
```

**Original Hebrew prompt, verbatim:**

<button type="button" data-gift-copy aria-live="polite" data-done="הועתק" data-fail="סימנתי את הטקסט להעתקה ידנית" data-analytics-content="idea" data-analytics-action="copy" data-analytics-id="software-gift-installation-original-he" hidden>העתקת הפרומפט</button>

```chat-he
seffy: איך אפשר לייצר קובץ התקנה שמתקינים אותו מקבלים הרגשה כאילו קיבלת מתנה והתהליך התקנה שלך כולל לפתוח את המתנה(את הזיפ) ממש כמו חווית של קריעת נייר מתנה והסרת הדברים של המתנה ממנה
```

From there we built blue wrapping paper with Hebrew and English keyboard letters. You drag, the paper tears, and TypoSwap appears underneath. In the native Windows installer, opening the gift is part of installation.

Now I'm thinking about the next step: receiving a digital gift through a link and opening the wrapping on a phone too. Swipe, and swipe again, until you find what's inside.

![Opening a TypoSwap gift wrapped in blue paper](/media/posts/software-as-small-gifts/05-gift-installation-925.webp)

*The gift-opening screen. In the trial view shown here, only the wrapping opens; nothing is installed.*

How much fun this could be: software someone built especially for you, and that moment of opening a gift.

For now, I'd really love you to tell me here: **what software gifts would you like to see, and who would you give them to?**

I'll build them here in the open, from the problem and the conversations with the shaliach to software you can give as a gift.

## More software gifts:

* [Orbit Windows](<https://github.com/seffyfisher/orbit-windows>): In my view, this app changes the whole way you work with multiple windows on Windows.

![Orbit Windows gift-wrapping preview from the original repository](/media/posts/software-as-small-gifts/06-orbit-windows-wrapped-1024.webp)

* [Kol-Chen](<https://github.com/seffyfisher/kol-chen>): A tool for recording system audio on a Mac, instead of all those awkward workarounds.

![Kol-Chen wrapped in gift paper featuring cassette tapes](/media/posts/software-as-small-gifts/07-kol-chen-wrapped-480.webp)

<style>
.prose [data-gift-copy]{display:block;margin-block:1rem .35rem;padding:.5rem .8rem;min-height:44px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);color:var(--fg);font:inherit;font-size:.85rem;cursor:pointer}
.prose [data-gift-copy][hidden]{display:none}
.prose [data-gift-copy]:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.prose .software-gift-video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:var(--surface)}
</style>

<script src="/media/posts/software-as-small-gifts/copy-prompts.js" defer></script>
