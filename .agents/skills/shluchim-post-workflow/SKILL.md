---
name: shluchim-post-workflow
description: Compatibility router for preparing or continuing Seffy Fisher's Shluchim blog posts. Use the complete shluchim-blog-post skill for writing, image approval, English and publication checks.
---

# Shluchim workflow compatibility

Read [shluchim-blog-post](../shluchim-blog-post/SKILL.md) and the references it
requires. That complete uploaded skill is the authoritative writing and image
process. Seffy's direct requests take precedence, and existing approvals persist.

For the Astro repository, read `AGENTS.md` and `PUBLISHING.md`: the workflow's
`summary` is the site's `description`, while `status: draft` is `draft: true`.
Keep original dates, SEO metadata, unique Hebrew emoji, and matching language
files and translation keys. Set `draft: false` at the approved publication stage.

The earlier supplied single-file workflow remains in `references/` as a preserved
source document. The full skill replaces it for future post work.

Install both names globally with `python3 scripts/install-post-workflow.py`.
