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

![Seffy and Basher with an idea for a software gift](/media/posts/software-as-small-gifts/01-personal-gift-1672.webp)

So let's start.

## First, find a problem:

Like any good product, first we find a problem. We're Jewish; this shouldn't be complicated.

Once we've found it, we make sure it hurts enough, or happens often enough, for the person we're building for. Something we've noticed annoys them, takes up their time or makes them do the same work over and over.

From there, open a conversation with the coding shaliach you work with: Grok Bot, Cursor, OpenAI's Codex, Claude Code and the like. You can talk out loud, or give the shaliach a transcript, and ramble away. Everything: what I noticed, what bothered them, what would make them happy and how we'll know the software has done its job. And of course, which private joke we can put inside.

(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

Do all this in Plan mode, planning before building. Ask it to research what already exists, understand what's possible and what's complicated, then make a work plan you can see from above. If the software has an interface, you can also ask for a few prototypes and sample designs to get a feel for the idea before building.

To give the work more structure, I recommend using skills, instruction files that guide the coding shaliach. You can start with [Matt Pocock's skills](https://github.com/mattpocock/skills) or [pstack](https://github.com/cursor/plugins/tree/main/pstack). I'll write more about these ways of working later.

## Hey, hey, you're writing in Yiddish:

Here's what I did with this idea.

A colleague at work, a team lead, kept getting caught by a mistake we all make: typing Hebrew while the keyboard is set to English, or the other way around. You type away, then someone next to you says, "Hey, hey, you're writing in Yiddish."

They mean gibberish, of course. The words in your head were perfectly fine. The keyboard language was simply pointing the wrong way.

It's one of the things I'd noticed getting on his nerves. At some point I thought: wow, this would make a great gift.

My first idea was a small tool running in the background on Windows and Mac. When it spotted a keyboard-language mistake, it would offer a one-click correction. That was our starting point.

And right after the correction, it should throw in something Yiddish for our private joke. That's part of the gift. He'd meet our joke at exactly the moment it always comes up.

![The clear logo on Kochava's hair pin](/media/posts/software-as-small-gifts/02-keyboard-plan-logo-1672.webp)

## What I did with it:

I opened a conversation with the coding shaliach and explained what I wanted to build. Here's my original prompt, as I wrote it. I added the story about my colleague and the joke as part of the planning.

I didn't try to turn it straight into a grand specification. I wanted to convey the fun of it, and the moment the tool should help with. Then I asked: let's research this. What's possible, what isn't, and what makes a tool like this complicated?

I stayed in Plan mode. First, a plan we could look at from above, to understand what we were going to build and what still needed checking. How do you recognize this kind of mistake? When should you suggest a correction? How should it work on each operating system?

### My original TypoSwap prompt

*English translation of my original prompt. The Hebrew original is available below, verbatim.*

<button type="button" data-gift-copy data-done="Copied" data-fail="Text selected for copying" aria-live="polite" hidden>Copy prompt</button>

```chat
seffy: I want to build software that takes care of it whenever I accidentally type in English and get Hebrew and vice versa, it needs to be available across the whole computer and available for Windows and Mac, it needs to be super efficient so it barely affects memory and storage on the computer
and the goal is simple, you typed something in English that you wanted in Hebrew or typed in English that you wanted in Hebrew, something super unclear comes out, the software should let you select the text and extremely easily, using a keyboard shortcut or right-clicking and choosing an option that exists there after you install the software, it immediately changes it to Hebrew or English as needed.
It's very important that it really works very well before everything else, meaning the detection that the text really came out wrong should be excellent so it can also immediately suggest would you like to replace it and did you mean... and not just something you can use passively;
```

```chat-he
seffy: אני רוצה לבנות תוכנה שדואגת לי כל פעם שאני מקליד בטעות באנגלית ויצא לי עברית ולהפך, צריך להיות זמין ברמת כל המחשב וזמין למעכת ההפעלה ווינדוס ומק, זה צריך להיות סופר יעיל שכמעט לא משפיעה על הזכרון והאחסון במחשב
והמטרה היא פשוטה, הקלדת משהו באנגלית שרצית בעברית או הקלדת באנגלית שרצית בעברית, יוצא משהו סופר לא ברור, התוכנה אמור לאפשר לך לסמן את הטקסט ובקלות קיצונית על ידי קיצור מקלדת או לחיצה על מקש ימיני ובחירה מאופציה שם שקיימת אחרי שהתקנת את התוכנה זה ישר יעביר לך לעברית או לאנגלית לפי הצורך.
חשוב מאוד שזה באמת יעבוד ממש טוב לפני הכל , כלומר שהזיהוי שהטקסט אכן לא יצא תקין יהיה מעולה כך שזה יכול ישר גם להציע לך האם תרצה להחליף והתכוונת ל... ולא רק משהו שאפשר להשתמש בו בצורה פאסיבית;
```

I didn't even get into visual design. To me, the ideal experience for this tool is almost invisible: it sits quietly, appears when needed, helps and moves on.

What mattered to me in planning this gift was when the tool steps in and how it does that. That's where I wanted to put the energy, along with the little moment after the correction that would make him smile.

### Seeing the plan from above

*Illustrative reconstruction based on the story · Plan mode*

<button type="button" data-gift-copy data-done="Copied" data-fail="Text selected for copying" aria-live="polite" hidden>Copy prompt</button>

```chat
seffy: The experience should be almost invisible. The tool sits quietly, appears when needed, corrects with a click and moves on. Let's not get into visual design now.

First, show me the work plan from above.
```

**Coding shaliach**

> Proposed plan before we start building:
>
> 1. Research detection of keyboard-language mistakes and the limitations on Windows and Mac.
>
> 2. Define when to offer a correction and what happens when detection is wrong.
>
> 3. Build the conversion and check how to return the corrected text to the application, then add the joke.
>
> 4. Test the behavior and prepare a ZIP package for delivery.

## What changed during the build:

We named the tool TypoSwap. The goal was to take a sentence like `akuo nv akunl` and turn it into `שלום מה שלומך` ("hello, how are you"), without typing everything again.

We built the engine in Rust, a programming language, with an emphasis on low resource use and a minimal interface. The conversion maps physical key positions between Hebrew and English.

To detect a mistake while typing, we added checks based on word and letter-sequence frequency. Processing happens locally on the computer, without storing typing history.

We connected the core to Mac and Windows through native operating-system components. We added an action on selected text, a keyboard shortcut you choose by pressing the keys, and suggestions beside the cursor.

Then testing changed the solution. Mac permissions needed attention. In some applications we could read the text, but replacing it directly was difficult.

We moved to a simple flow: detect a mistake, prepare the correction on the clipboard and show "Ready to paste." The user selects the text and pastes the correction. The original request was for direct replacement; testing led us to this solution.

![Illustration of TypoSwap preparing a correction for pasting](/media/posts/software-as-small-gifts/04-typing-workflow-1120.webp)

*Interface illustration: TypoSwap prepares the correction for pasting. Select the text and paste, without typing it again.*

The little popup disappears after a few seconds. We also put in phrases like "Oy gevalt" for that Yiddish joke of ours.

We packaged Mac builds for Intel and Apple Silicon (Apple's processors), and a Windows installer for x64 (64-bit) computers. We wrote tests for the core, preparing text on the clipboard and the installation mechanisms.

But this is still a test version. Automated tests and a successful build don't mean everything works in every application. My first Windows trial exposed a bug in activating the suggestion beside the cursor, and there's more to check before the gift is ready to hand over.

## A gift in a ZIP file:

Now I have a gift wrapped in a ZIP file, with test versions for both systems. Once I've made sure the flow works properly, I'll send it to my dear colleague. I hope it saves him that annoying moment and makes him laugh along the way.

![The shluchim wrap the software as a gift](/media/posts/software-as-small-gifts/03-wrapped-software-1672.webp)

### What the installation experience looks like

A simulation of the Windows installation experience: extract the ZIP, open the gift, choose a keyboard shortcut and then try the correction.

<video class="software-gift-video" controls playsinline preload="none" poster="/media/posts/software-as-small-gifts/installation-poster.webp" width="1920" height="1080" aria-label="Simulation of the TypoSwap installation experience">
<source src="/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4" type="video/mp4">
</video>

[TypoSwap: opening the gift and installing the app](/media/posts/software-as-small-gifts/TypoSwap-Gift-Walkthrough.mp4)

The ZIP itself got me thinking about the packaging. I wanted installation to feel like opening a gift.

### My original installation-experience prompt

*English translation of my original prompt. The Hebrew original is available below, verbatim.*

<button type="button" data-gift-copy data-done="Copied" data-fail="Text selected for copying" aria-live="polite" hidden>Copy prompt</button>

```chat
seffy: How can we create an installer file that, when you install it, makes you feel like you received a gift, and your installation process includes opening the gift (the zip), just like the experience of tearing gift wrap and removing the things wrapping the gift
```

```chat-he
seffy: איך אפשר לייצר קובץ התקנה שמתקינים אותו מקבלים הרגשה כאילו קיבלת מתנה והתהליך התקנה שלך כולל לפתוח את המתנה(את הזיפ) ממש כמו חווית של קריעת נייר מתנה והסרת הדברים של המתנה ממנה
```

From there we built blue wrapping paper with Hebrew and English keyboard letters. You drag, the paper tears, and TypoSwap appears underneath. In the native Windows installer, opening the gift is part of installation.

Now I'm thinking about the next step: receiving a digital gift through a link and opening the wrapping on a phone too. Swipe, and swipe again, until you find what's inside.

![Opening the TypoSwap gift in blue wrapping paper](/media/posts/software-as-small-gifts/05-gift-installation-925.webp)

*The gift-opening screen. In the trial view shown here, only the wrapping opens; nothing is installed.*

You can try opening the wrapping here too. This is a demo inside the post: pull the ribbon, then peel the paper with a mouse or a finger until you discover what's inside.

<style>
#gift-unwrapping{--p:0;--paper:light-dark(#f5f0e5,#d9d1c2);--paper-edge:light-dark(#ded5c4,#a79c87);--ink:light-dark(#34312c,#eee8de);--secondary:light-dark(#776f63,#bfb5a5);--ribbon:light-dark(#8b293c,#ad4054);--ribbon-light:light-dark(#b74c60,#cb6476);--ribbon-dark:light-dark(#581625,#702237);color:var(--ink);font-family:Arial,sans-serif;text-align:center;padding:22px 16px 20px;overflow:hidden}
#gift-unwrapping *{box-sizing:border-box}
#gift-unwrapping .instruction{margin:0;min-height:30px;font-weight:500;padding-inline:70px}
#gift-unwrapping .scene{height:340px;display:grid;place-items:center;perspective:1000px;direction:ltr}
#gift-unwrapping .gift{position:relative;width:min(340px,calc(100% - 38px));height:242px;transform:rotate(-4deg);transition:transform .7s cubic-bezier(.16,1,.3,1)}
#gift-unwrapping .archive{position:absolute;inset:0;border-radius:12px;background:light-dark(#272b29,#202522);color:#eee9df;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:scale(.95);transition:transform .7s;box-shadow:0 15px 28px light-dark(#50423320,#00000035)}
#gift-unwrapping .archive:before{content:"";position:absolute;top:0;bottom:0;left:24px;width:11px;background:repeating-linear-gradient(0deg,#beb9af 0 3px,#2b2d2b 3px 6px);border-inline:3px solid #444744}
#gift-unwrapping .zip-pull{position:absolute;left:20px;top:27px;width:19px;height:29px;border:3px solid #b7b1a6;border-radius:5px}
#gift-unwrapping .zip-word{font:500 48px ui-monospace,monospace;letter-spacing:7px;margin-bottom:12px}
#gift-unwrapping .filename{font-family:ui-monospace,monospace;direction:ltr;margin:0}
#gift-unwrapping .inside-note{margin:10px 0 0;direction:ltr;color:#d4cec2}
#gift-unwrapping .paper{position:absolute;inset:0;z-index:2;background:var(--paper);border:1px solid var(--paper-edge);transition:transform .65s cubic-bezier(.16,1,.3,1),opacity .5s;box-shadow:inset 0 1px 0 #ffffff60}
#gift-unwrapping .paper-left{right:49.9%;border-radius:9px 0 0 9px;transform-origin:right center;background:linear-gradient(145deg,var(--paper),var(--paper-edge))}
#gift-unwrapping .paper-right{left:49.9%;border-radius:0 9px 9px 0;transform-origin:left center;background:linear-gradient(215deg,var(--paper),var(--paper-edge))}
#gift-unwrapping .paper:after{content:"";position:absolute;inset:0;background:linear-gradient(33deg,transparent 48%,#77684a12 49%,#ffffff35 50%,transparent 51%)}
#gift-unwrapping .ribbon{position:absolute;inset:0;z-index:4;pointer-events:none}
#gift-unwrapping .strip{position:absolute;background:linear-gradient(90deg,var(--ribbon-dark),var(--ribbon-light) 42%,var(--ribbon) 75%,var(--ribbon-dark));box-shadow:2px 3px 5px #00000018;transition:transform .65s cubic-bezier(.16,1,.3,1),opacity .5s;will-change:transform}
#gift-unwrapping .vertical-top{width:27px;height:116px;left:calc(50% - 13.5px);top:0;transform-origin:50% 0}
#gift-unwrapping .vertical-bottom{width:27px;height:130px;left:calc(50% - 13.5px);top:112px;transform-origin:50% 100%}
#gift-unwrapping .horizontal-left,#gift-unwrapping .horizontal-right{height:25px;top:101px;width:50%;background:linear-gradient(180deg,var(--ribbon-dark),var(--ribbon-light) 35%,var(--ribbon));}
#gift-unwrapping .horizontal-left{left:0;transform-origin:left center}
#gift-unwrapping .horizontal-right{right:0;transform-origin:right center}
#gift-unwrapping .bow{position:absolute;left:50%;top:113px;width:0;height:0}
#gift-unwrapping .loop{position:absolute;width:60px;height:39px;top:-27px;border:10px solid var(--ribbon);box-shadow:inset 0 2px 2px #ffffff35,0 3px 3px #00000018;transition:transform .35s,opacity .35s;will-change:transform}
#gift-unwrapping .loop-left{right:-5px;border-radius:75% 80% 18% 80%;transform-origin:right bottom}
#gift-unwrapping .loop-right{left:-5px;border-radius:80% 75% 80% 18%;transform-origin:left bottom}
#gift-unwrapping .knot{position:absolute;width:24px;height:21px;left:-12px;top:-10px;border-radius:6px;background:linear-gradient(90deg,var(--ribbon-dark),var(--ribbon-light),var(--ribbon-dark));box-shadow:0 3px 5px #00000025;transition:transform .4s,opacity .4s}
#gift-unwrapping .tail{position:absolute;width:21px;height:67px;top:116px;left:calc(50% - 11px);background:linear-gradient(90deg,var(--ribbon-dark),var(--ribbon-light) 45%,var(--ribbon));clip-path:polygon(0 0,100% 0,100% 100%,50% 87%,0 100%);transform-origin:center top;transition:transform .4s,opacity .4s;will-change:transform}
#gift-unwrapping .tail-fixed{left:calc(50% - 28px);height:48px;transform:rotate(22deg)}
#gift-unwrapping .handle{position:absolute;z-index:7;border:0;font:inherit;touch-action:none;user-select:none;-webkit-tap-highlight-color:transparent}
#gift-unwrapping .ribbon-handle{width:64px;height:72px;left:calc(50% - 32px);top:132px;background:transparent;transform:translate(var(--hand-x,0px),var(--hand-y,0px));}
#gift-unwrapping .ribbon-handle:active{cursor:grabbing}
#gift-unwrapping .paper-handle{width:50px;height:68px;top:87px;background:var(--paper);border:1px solid var(--paper-edge);color:#655d50;border-radius:4px;box-shadow:0 2px 7px #00000015;transition:transform .65s}
#gift-unwrapping .right-handle{right:-12px;transform:rotate(5deg)}
#gift-unwrapping .left-handle{left:-12px;transform:rotate(-5deg)}
#gift-unwrapping .outcome{min-height:24px;margin:0 0 8px;color:var(--secondary)}
#gift-unwrapping .fallback{color:var(--secondary);margin:8px 0 0}
#gift-unwrapping .replay{font:inherit;border:1px solid var(--paper-edge);border-radius:6px;padding:8px 14px;background:var(--paper);color:#34312c}
#gift-unwrapping .dragging .strip,#gift-unwrapping .dragging .loop,#gift-unwrapping .dragging .knot,#gift-unwrapping .dragging .tail,#gift-unwrapping .dragging .paper,#gift-unwrapping .dragging .handle{transition:none}
#gift-unwrapping[data-stage="1"] .paper-right{transform:translateX(calc(var(--p)*160px)) rotateY(calc(var(--p)*-65deg)) rotate(calc(var(--p)*16deg));opacity:calc(1 - var(--p)*.85)}
#gift-unwrapping[data-stage="1"] .right-handle{transform:translateX(calc(var(--p)*100px)) rotate(calc(5deg + var(--p)*25deg))}
#gift-unwrapping[data-stage="2"] .paper-right,#gift-unwrapping[data-stage="3"] .paper-right{transform:translateX(250px) rotateY(-80deg) rotate(22deg);opacity:0}
#gift-unwrapping[data-stage="2"] .paper-left{transform:translateX(calc(var(--p)*-160px)) rotateY(calc(var(--p)*65deg)) rotate(calc(var(--p)*-16deg));opacity:calc(1 - var(--p)*.85)}
#gift-unwrapping[data-stage="2"] .left-handle{transform:translateX(calc(var(--p)*-100px)) rotate(calc(-5deg - var(--p)*25deg))}
#gift-unwrapping[data-stage="3"] .paper-left{transform:translateX(-250px) rotateY(80deg) rotate(-22deg);opacity:0}
#gift-unwrapping[data-stage="3"] .gift{transform:rotate(0)}
#gift-unwrapping[data-stage="3"] .archive{transform:scale(1)}
#gift-unwrapping [hidden]{display:none!important}
@media(max-width:500px){#gift-unwrapping{padding:20px 10px}#gift-unwrapping .scene{height:315px}#gift-unwrapping .instruction{padding-inline:12px}}
@media(prefers-reduced-motion:reduce){#gift-unwrapping *,#gift-unwrapping *:before,#gift-unwrapping *:after{transition:none!important}}
</style>
<div id="gift-unwrapping" dir="ltr" data-stage="0" aria-label="Open the gift wrapping">
  <p class="instruction" aria-live="polite">Pull the ribbon tail down.</p>
  <div class="scene">
    <div class="gift">
      <div class="archive" aria-hidden="true"><span class="zip-pull" aria-hidden="true"></span><div class="zip-word">ZIP</div><p class="filename">yiddish.zip</p><p class="inside-note">A little something. Just for you.</p></div>
      <div class="paper paper-left" aria-hidden="true"></div>
      <div class="paper paper-right" aria-hidden="true"></div>
      <div class="ribbon" aria-hidden="true">
        <div class="strip vertical-top"></div><div class="strip vertical-bottom"></div>
        <div class="strip horizontal-left"></div><div class="strip horizontal-right"></div>
        <div class="tail tail-fixed"></div>
        <div class="bow"><div class="loop loop-left"></div><div class="loop loop-right"></div><div class="knot"></div></div>
        <div class="tail tail-pull"></div>
      </div>
      <button type="button" class="handle ribbon-handle cursor-interaction" data-step="0" aria-label="Pull the ribbon tail down to untie the knot. You can also click."></button>
      <button type="button" class="handle paper-handle right-handle cursor-interaction" data-step="1" aria-label="Pull the paper right, or click to peel it" hidden>Pull<br>here</button>
      <button type="button" class="handle paper-handle left-handle cursor-interaction" data-step="2" aria-label="Pull the paper left, or click to finish" hidden>A little<br>more</button>
    </div>
  </div>
  <p class="outcome" aria-live="polite">The knot first, then the wrapping.</p>
  <button type="button" class="replay cursor-interaction" hidden>Wrap it again</button>
  <p class="fallback">You can also click or press Enter.</p>
</div>
<script>
(()=>{
const root=document.getElementById("gift-unwrapping");
const q=s=>root.querySelector(s);
const handles=[...root.querySelectorAll(".handle")];
const instruction=q(".instruction"),outcome=q(".outcome"),replay=q(".replay");
const parts={left:q(".loop-left"),right:q(".loop-right"),knot:q(".knot"),pull:q(".tail-pull"),fixed:q(".tail-fixed"),top:q(".vertical-top"),bottom:q(".vertical-bottom"),hleft:q(".horizontal-left"),hright:q(".horizontal-right")};
let stage=0,unthread=0,drag=null,suppress=false,busy=false,animation=0,generation=0;
const clamp=v=>Math.max(0,Math.min(1,v));
const segment=(v,a,b)=>clamp((v-a)/(b-a));
const ease=v=>v*v*(3-2*v);
const instructions=["Pull the ribbon tail down.","Now peel the paper from the side.","One more little pull, and it is yours.","Hey, hey, you are writing in Yiddish."];
const outcomes=["The knot first, then the wrapping.","The ribbon is off. Just the paper left.","You can already peek inside.","The gift is open."];
function ribbon(p,side=0){
 const a=ease(segment(p,0,.46)),b=ease(segment(p,.32,.72)),c=ease(segment(p,.62,1));
 parts.left.style.transform=`rotate(${-18-a*48}deg) scale(${1-a*.92},${1-a*.75})`;
 parts.right.style.transform=`rotate(${18+b*48}deg) scale(${1-b*.94},${1-b*.8})`;
 parts.left.style.opacity=1-a;parts.right.style.opacity=1-b;
 parts.knot.style.transform=`translateY(${b*13+c*38}px) rotate(${a*9}deg) scale(${1-b*.35},${1-a*.2})`;
 parts.knot.style.opacity=1-c;
 parts.pull.style.transform=`translate(${side}px,${p*104}px) rotate(${-8-p*10}deg) scaleY(${1+a*.52})`;
 parts.pull.style.opacity=1-c;
 parts.fixed.style.transform=`translate(${-b*24-c*28}px,${b*29+c*67}px) rotate(${22+b*33+c*20}deg)`;
 parts.fixed.style.opacity=1-c;
 parts.top.style.transform=`rotateX(${c*100}deg) rotate(${-c*19}deg)`;
 parts.bottom.style.transform=`rotateX(${-c*105}deg) rotate(${c*16}deg)`;
 parts.hleft.style.transform=`rotateY(${-c*100}deg) rotate(${-c*17}deg)`;
 parts.hright.style.transform=`rotateY(${c*100}deg) rotate(${c*17}deg)`;
 for(const part of [parts.top,parts.bottom,parts.hleft,parts.hright])part.style.opacity=1-c;
 root.style.setProperty("--hand-x",side+"px");
 root.style.setProperty("--hand-y",p*104+"px");
}
function paint(){
 root.dataset.stage=stage;
 instruction.textContent=instructions[stage];outcome.textContent=outcomes[stage];
 handles.forEach(h=>{h.hidden=Number(h.dataset.step)!==stage;h.disabled=busy;});
 replay.hidden=stage!==3;q(".fallback").hidden=stage===3;
 q(".archive").setAttribute("aria-hidden",stage===3?"false":"true");
}
function save(){
 const api=window.openai;
 if(api&&api.setWidgetState)api.setWidgetState({modelContent:{giftStage:stage,ribbonUntied:stage>0},privateContent:{stage,unthread}}).catch(()=>{});
}
function animateRibbon(target,done){
 cancelAnimationFrame(animation);
 const from=unthread,start=performance.now(),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 function tick(now){
  const t=reduced?1:clamp((now-start)/520);
  unthread=from+(target-from)*ease(t);ribbon(unthread);
  if(t<1)animation=requestAnimationFrame(tick);else{animation=0;if(done)done();}
 }
 animation=requestAnimationFrame(tick);
}
function advance(focus=false){
 if(busy||stage>=3)return;
 if(stage===0){
  busy=true;handles[0].disabled=true;
  animateRibbon(1,()=>{busy=false;stage=1;root.classList.remove("dragging");root.style.setProperty("--p",0);paint();save();if(focus)handles[1].focus({preventScroll:true});});
 }else{
  stage++;root.classList.remove("dragging");root.style.setProperty("--p",0);paint();save();
  if(focus)(stage===3?replay:handles[stage]).focus({preventScroll:true});
 }
}
handles.forEach(handle=>{
 handle.addEventListener("pointerdown",e=>{
  if(busy||drag||Number(handle.dataset.step)!==stage||e.button!==0)return;
  cancelAnimationFrame(animation);suppress=false;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,base:unthread,distance:0,p:0};
  handle.setPointerCapture(e.pointerId);root.classList.add("dragging");
 });
 handle.addEventListener("pointermove",e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  drag.distance=Math.max(drag.distance,Math.hypot(dx,dy));
  if(stage===0){
   const travel=Math.max(0,dy)+Math.max(0,Math.abs(dx)-22)*.18;
   unthread=clamp(drag.base+travel/165);
   ribbon(unthread,Math.max(-28,Math.min(28,dx*.2)));
  }else{
   drag.p=clamp((stage===1?dx:-dx)/Math.min(130,q(".gift").clientWidth*.4));
   root.style.setProperty("--p",drag.p);
  }
 });
 function finish(e){
  if(!drag||drag.id!==e.pointerId)return;
  const d=drag;drag=null;
  suppress=d.distance>5||e.type!=="pointerup";
  if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);
  root.classList.remove("dragging");
  if(stage===0){
   if(e.type==="pointerup"&&unthread>=.84){advance();return;}
   unthread=e.type==="pointerup"?Math.max(d.base,unthread):d.base;
   ribbon(unthread);
   if(unthread>.03){outcome.textContent=unthread<.45?"The knot is loosening. Pull again.":"The loop is opening. Keep pulling.";save();}
  }else if(e.type==="pointerup"&&d.p>=.72)advance();
  else root.style.setProperty("--p",0);
 }
 handle.addEventListener("pointerup",finish);
 handle.addEventListener("pointercancel",finish);
 handle.addEventListener("lostpointercapture",e=>{if(drag&&drag.id===e.pointerId)finish({pointerId:e.pointerId,type:"pointercancel"});});
 handle.addEventListener("click",e=>{
  if(suppress&&e.detail!==0){suppress=false;return;}
  suppress=false;if(Number(handle.dataset.step)===stage)advance(true);
 });
});
replay.addEventListener("click",()=>{
 generation++;cancelAnimationFrame(animation);animation=0;busy=false;drag=null;suppress=false;stage=0;unthread=0;
 root.classList.remove("dragging");root.style.setProperty("--p",0);ribbon(0);paint();save();handles[0].focus({preventScroll:true});
});
function restore(state){
 const data=state&&state.privateContent;
 if(!data||!Number.isInteger(data.stage)||data.stage<0||data.stage>3)return;
 generation++;cancelAnimationFrame(animation);animation=0;drag=null;busy=false;suppress=false;
 stage=data.stage;unthread=stage>0?1:Math.min(.83,clamp(Number(data.unthread)||0));
 root.classList.remove("dragging");root.style.setProperty("--p",0);ribbon(unthread);paint();
}
ribbon(0);paint();
restore(window.openai&&window.openai.widgetState);
window.addEventListener("openai:set_globals",e=>{
 const globals=e.detail&&e.detail.globals;
 if(globals&&Object.prototype.hasOwnProperty.call(globals,"widgetState"))restore(globals.widgetState);
});
})();
</script>

<noscript><p>This is a ZIP-wrapping demo. You can watch the installation video above without JavaScript too.</p></noscript>

How much fun this could be: software someone built especially for you, and that moment of opening a gift.

For now, I'd really love you to tell me here: **what software gifts would you like to see, and who would you give them to?**

I'll build them here in the open, from the problem and the conversations with the shaliach to software you can give as a gift.

<style>
.prose [data-gift-copy]{display:block;margin-block:1rem .35rem;padding:.5rem .8rem;min-height:44px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);color:var(--fg);font:inherit;font-size:.85rem;cursor:pointer}
.prose [data-gift-copy][hidden]{display:none}
.prose [data-gift-copy]:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.prose .software-gift-video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:var(--surface)}
</style>

<script src="/media/posts/software-as-small-gifts/copy-prompts.js" defer></script>
