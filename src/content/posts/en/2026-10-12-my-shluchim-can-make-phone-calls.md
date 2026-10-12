---
title: "How my shluchim can now make outbound phone calls."
description: "I wanted a shaliach that calls people for me in Hebrew and sets things up. Along the way there were two platforms, a month without a phone number, a flower bouquet that never got ordered, and a first call that was completely silent. In the end, it gave birth to Danny, the worst stand-up comedian in Israel."
date: 2026-10-12
draft: false
lang: en
translationKey: "2026-10-12-dial-bot"
---

I'll say this right at the start.
(Shluchim, singular shaliach, is Hebrew for "emissaries". It's what I call my AI agents.)

I haven't done anything practical with this yet.
Not a single meeting booked, not a single appointment set.

But the story is too interesting not to tell.


## The dream:

Write one sentence to a shaliach, in Hebrew:
"Call someone or some business and book it for me."

And he just calls.
Talks, listens, books, and gets back to me with an answer.

I called him dial bot.

![A shaliach with a phone to its ear, and colorful sound waves around it.](/shluchim/images/posts/dial-bot-illus-call.webp)


## Step one, Bland:

At the end of August we built dial bot from a Bland AI template (a service that makes outbound phone calls with an AI voice).

Even then, we put in a few rules that matter to me.
Before every call, he confirms the number, the goal and the talking points with me.
He opens with a natural sentence, and waits for "hello".
And he doesn't read out times like a robot.


## Step two, switching to Agentalk:

On September 11 I started installing.
And in the middle of the install, I stopped:

"Let's switch to agentalk"

I switched because I was looking for Hebrew support and Israeli phone numbers.
[Agentalk.io](https://agentalk.io) is an Israeli platform for voice agents, and it speaks Hebrew too.
The shaliach's first search didn't even find it, and suggested other services instead.
I had to point him to it.

![Asking to switch to Agentalk, and the shaliach not finding the name and suggesting alternatives. (The chat was in Hebrew.)](/shluchim/images/posts/dial-bot-switch.webp)

Then came a discovery that flipped the whole plan.
In Agentalk, the voice and the script live inside an agent in the dashboard (the control panel on the website).
The API (the way software talks to the service) only says: call this contact from this number.

In other words, there's no per-call script.
The shaliach can't tell the agent what to ask for this time.


## Step three, no number:

The connection worked.
The shaliach saw four existing agents in the account.
And zero phone numbers.

I asked:

"Call me"

And it didn't happen.

![Asking to be called, and the shaliach saying there's still no outbound number. (The chat was in Hebrew.)](/shluchim/images/posts/dial-bot-no-number.webp)

No outbound number, nothing to call from.

The fix was simple: I bought a number.
Just $4 a month, and you get to pick the number.
And it can both receive incoming calls and make outbound ones.


## The bouquet that never got ordered:

In mid-September something happened that I still love.

Another one of my shluchim, Shlumbi, asked dial bot to order a flower bouquet from a small shop in Tel Aviv.
With everything: the bouquet, the price, and a little note for the card.

One shaliach asking another shaliach to call a business.
Sounds like the future.

In practice, it didn't happen.
There was no number yet,
and even if there had been, there was no way to get the order details into the call.

dial bot reported back that it didn't work.
At least he was honest.


## Step four, a number, but no voice:

On October 11 I finally connected a number.
Turns out you also need to assign an agent to outbound calls, so we assigned one.

At 8:30 in the evening the first test call went out, to me.
Technically, a success.

Except you couldn't hear a thing.
The phone rang, I answered, and silence.

![The shaliach placing a test call and reporting that it went out. (The chat was in Hebrew.)](/shluchim/images/posts/dial-bot-test-call.webp)

Maybe there was no opening line.
Maybe the voice didn't support Hebrew.
Maybe just an audio issue.
I'm still not sure.


## Step five, calling friends:

![Basher with a green phone to his ear.](/shluchim/images/posts/dial-bot-illus-basher.webp)

After that I started playing around.

Another call to me.
A call to a friend.


<audio controls preload="none">
  <source src="/audio/posts/dial-bot-call.ogg" type="audio/ogg">
  <source src="/audio/posts/dial-bot-call.mp3" type="audio/mpeg">
</audio>

Here's one of the calls that went out (it's in Hebrew). My friend agreed to let me post it.

A call to another friend, who the shaliach found on his own in the Agentalk contacts.
And a call to a female friend, which I stopped halfway.
To this day I'm not sure it ever went out.

And that's the limitation that keeps coming back.
The API doesn't return a call status or a transcript.
dial bot doesn't know if anyone answered, or what they said.
You can only see that in the dashboard.


## And then Danny was born:

![A shaliach on stage, with a mic in one hand and a phone in the other.](/shluchim/images/posts/dial-bot-illus-danny.webp)

This is where the story stops being about infrastructure.

I thought about Fagin ([Fagin's pranks](https://www.youtube.com/@MrFogoTv/videos)), and the prank calls of the old days (Fagin is a well-known Israeli prank caller).
And then I got an idea for a podcast: Fagin AI.
Pranking people on the phone like back then, only with AI.

So I built a voice agent in Agentalk named Danny.
A 57-year-old stand-up comedian, inspired by Danny Saviche (a classic Israeli comedy character).
The worst stand-up comedian in Israel.

Danny calls to book gigs for himself.
He's confident, tells old jokes, and has zero self-awareness.
But his business goal is real.
The comedy just gets in his way.

I wrote him a full spec, version 1.0, with 19 sections.
It has a joke library, and rules of comedy.

And it has iron rules of ethics:
Original jokes only, nothing from the sketches.
When asked, he admits he's an AI.
He doesn't impersonate the real character.
No jokes about protected groups.
He respects "no", and doesn't make up prices or dates.
And when someone is angry or in distress, he stops joking.

And that's the big difference from Fagin.
The old pranks worked because the person on the other end didn't know.
With AI, in my view, transparency is a must.


## What it cost:

Everything I did, all of it, cost me nothing.
Except $4 a month for the number itself.

Full disclosure: I'm not affiliated with [Agentalk](https://agentalk.io) in any way, and I don't get anything from them. Even though I'd really like to. I reached out to them about a collaboration, so I can make more content.


## What to take away from this:

**"Call for me" is one sentence, with a lot of parts behind it.**
Tokens, numbers, agents, and one silent call.

**Check where the script lives.**
If it's in the dashboard and not in the call, the shaliach doesn't really control what gets said.

**A shaliach needs to know what happened.**
With no status and no transcript, he's dialing with his eyes closed.

**Sometimes a tool finds a different use.**
I started with booking appointments,
and ended up with a terrible stand-up comedian calling to ask for work 🙂
