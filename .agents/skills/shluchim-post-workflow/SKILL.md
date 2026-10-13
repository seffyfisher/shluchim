---
name: shluchim-post-workflow
description: Write, revise, illustrate, translate, review, or publish a post for Seffy Fisher's Shluchim blog (שְׁלוּחִים, shluchim.shinlamed.com). Follow his voice, original-story dates, real prompt quotations, and separate text and image approval stages. Use for this blog's posts, including continuing an existing draft.
---

# Shluchim post workflow

Read [the complete workflow](references/shluchim-post-workflow.md) before working
on a post. It is Seffy's supplied process, including the writing and illustration
rules. Follow its stages in order and keep track of completed approvals.

## Starting and continuing

- Start from a story Seffy marked with 💯 or an explicit request to write a
  Shluchim post. His direct request authorizes starting without another marker.
- Continue an existing draft using its conversation, edits, original story date,
  attachments, and approvals. A request to take it through publication authorizes
  the work, while the final wording and images still follow the approval stages.
- Before asking for approval, prepare the complete Hebrew wording, title,
  2–4 sentence summary, and original story date. Show every word in chat.
  Incorporate requested edits and show the whole revised text again.
- Ask one question at a time. Resolve routine technical choices using repository
  conventions and Seffy's existing instructions.
- Generate illustrations after text approval. Show each image and its position
  for approval, then prepare English and publish both languages. A supplied GIF
  remains the original media: obtain its bytes before publication and preserve
  the animation. A local path in a screenshot is not a downloaded asset.
- Check the live Hebrew and English posts on mobile and desktop, then send both
  verified links. Report any blocked stage without claiming it is complete.

## Using this repository

Find the Shluchim repository and read its `AGENTS.md`, `PUBLISHING.md`, content
schema, and existing post before editing. Seffy's direct instructions take
precedence over this skill; preserve his factual claims without strengthening
them or inventing events or quotations.

For the current Astro site:

- Hebrew: `src/content/posts/he/<original-date>-<slug>.md`.
- English: `src/content/posts/en/<same-file-name>.md`; preserve the shared
  `translationKey`, story date, and topics. Create English after text and image
  approval, as specified in the workflow.
- Store the workflow's `summary` as the site's visible `description`.
  `status: draft` maps to `draft: true`. Keep that flag until the publication
  stage; an approval record alone does not publish a file.
- Include the repository's SEO fields, topics, language, translation key, and
  unique contextual Hebrew emoji. Do not replace the schema with the illustrative
  `summary` / `status` frontmatter from the supplied workflow.
- Real prompt quotations are blockquotes, styled as chat bubbles with CSS.
  Preserve their wording exactly. Existing `chat` fences remain supported.
- Use the existing draft build and preview for review, with images at their
  intended positions. Run the checks required by `AGENTS.md` before committing
  content or configuration. Push to `main` only at the approved publication stage.

## Keeping the process available

The project copy of this skill and its reference is the source for installation.
Use `scripts/install-post-workflow.py` from the repository to install it under
the current user's `~/.agents/skills/`. Reinstall after an intentional workflow
update. Keep the supplied reference intact; document repository adaptations here.
