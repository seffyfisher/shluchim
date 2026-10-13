---
title: "My shaliach just wanted to buy cottage cheese for the kids at Rami Levy"
description: "I asked the Chef, the shaliach that plans my meals, to fill a cart at Rami Levy so I'd have all the groceries for the week of meals he planned for me. Rami Levy's site blocked him, because Grok Bot's cloud computer goes out to the internet from the US, not from Israel. We also tried knocking on Shufersal's gates, we talked about a VPN, and in the end Grok Bot added a new feature that routes network traffic out through my own local computer. We tested it, and now when the Chef runs automatically every week and plans my weekly meals, he also does my shopping at Rami Levy with no problem."
listDescription: "Rami Levy blocked my Chef's US connection. My home computer got him into the cart."
seoTitle: "Israeli grocery site blocks US IPs: route via home PC"
seoDescription: "Rami Levy returned 403 to my cloud AI agent with a US IP. Routing through my home computer gave an Israeli IP and a 200, so it now fills the cart weekly."
topics: ["everyday-ai"]
date: 2026-10-13
draft: false
lang: en
translationKey: "2026-10-13-chef-rami-levy-routing"
---
At first, it didn't work.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

## The request:

I'm not exactly a chef (to put it mildly).

So I set up the Chef, a shaliach that plans my weekly meals.
A simple menu, and a shopping list.

I asked him what's the best deal.
He said Rami Levy online is usually the cheapest for a basket of groceries.

I wrote to him "Godspeed".
And he went off to fill a cart, with instructions to stop before payment.

![The Chef planning a weekly menu and a shopping list](/shluchim/images/posts/chef-rami-levy-1-plan.webp)

## What actually happened:

He didn't get to the cart.
He didn't even get to Rami Levy's homepage.

Rami Levy's site showed him a Cloudflare block page (a service that protects websites and filters who gets in).
Zero items in the cart.

We tried Shufersal.
Same story.

## Why we got blocked:

My shluchim don't live at my place.
They run on a computer in the cloud.

The Chef checked where he goes out to the internet from,
based on the IP (the address a computer shows up with on the internet).
And the address wasn't Israeli.

Israeli supermarket sites block traffic from abroad.
So as far as they're concerned, my shaliach is just some goy from America.

![The shaliach blocked by a block page on Rami Levy's site](/shluchim/images/posts/chef-rami-levy-2-blocked.webp)

## I tried to solve it myself:

I wrote to him:

> Can you change your computer's access so it comes from Israel, because otherwise we get blocked

He honestly answered that he doesn't have an "Israel" switch.

So I tried again:

> Maybe install some opensource vpn that can make it look like you're coming from Israel

A VPN (software that sends traffic through a server somewhere else) is a good idea.
But the software alone isn't enough, you also need an exit server in Israel.
And he didn't find a free, reliable VPN with an Israeli exit.

The truth is there is a solution with an Israeli exit server, but it costs money, and spending money is something I like less 🙈

## That day's solution:

The Chef sent me a neat shopping list to paste.
I pasted it into the app on my phone, and finished the order myself.

Not magic.
But dinner got served to the kids.

## The real solution, routing through my computer:

What's really missing here is an Israeli address.
And I have one, my laptop at home that's always on (I turn off the screen but the computer runs all the time).

Grok Bot now has a feature exactly for this.
Routing (sending network traffic through another computer),
through my personal computer.

![Routing the shaliach's traffic through my computer at home](/shluchim/images/posts/chef-rami-levy-3-route.webp)

The shaliach keeps working on the cloud computer(!)
but its network requests go out through my computer (an Israeli exit).
That way the site sees an Israeli address, not an American one.

And the part I loved most:
My computer needs to be on, with the Grok Bot app open on it.
I don't need to sit in front of it.
It works when I'm out with my phone, and also from a routine that runs by itself on a regular basis every week.

## We tested it, we didn't just take it on faith:

On October 12 we tested it again, with numbers.

Without routing, the cloud computer went out from the United States.
And Rami Levy answered 403 (a code that means "you don't have access").

Through routing, the IP came out Israeli.
And Rami Levy answered 200 (a code that means everything is fine).

![A full cart at Rami Levy after routing worked](/shluchim/images/posts/chef-rami-levy-4-cart.webp)


## OK, now how do you ask for it:

It takes getting used to, Grok Bot works in a paradigm of: no more user interface.
Everything goes through the agent, any feature they add, you just ask the agent for it (see for example the case of [adding email to the agents](https://shluchim.shinlamed.com/en/posts/2026-10-11-one-email-address-a-front-door/))
The simplest thing is to ask the shaliach, he knows what to do from there, instead of us having to hunt for some checkbox in some remote menu.
It takes getting used to, because for decades we've worked with computers differently.

"Route through my computer and check that you're going out from Israel." (*Route egress through a desktop)

And in the app itself, according to the official documentation,
it's the setting Route traffic through this computer,
in Settings, under Computer and then Network.

All the details are in [Grok Bot's official documentation](https://docs.x.ai/grok-bot/private-networks).

**As the sages said: as the sages already said: you toiled and found, believe it. All I wanted was to buy cottage cheese, not to build international communications infrastructure**

P.S.

## A little extra technical digging I learned along the way:

Another shaliach of mine, Dima, ran into something confusing.
A supermarket chain's site loaded fine in the cloud browser,
and at the same time curl (a tool that requests a page from the server on the command line) got a 403 from it.

In other words, a page that loads doesn't prove routing works.
The test I trust is the exit IP.

## What to take away from this:

Your shluchim don't live at your place.
If a site blocks traffic from abroad, it blocks them too.

Your computer at home is the Israeli address.
Turn on routing, leave the computer on and the app open, and that's it.

Check the IP, not the page.
If the address is Israeli and the site answers 200, it works.
