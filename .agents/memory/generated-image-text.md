---
name: Generated images bake in text
description: media-generation often renders unwanted text/titles into images even with a negative prompt; plan to regenerate.
---

When generating a logo, mascot, icon, or any "clean character" asset via the
media-generation `generateImage` skill, the model frequently renders unwanted
text — app names, titles, captions — INTO the image, even when `negativePrompt`
lists "text, words, letters".

**Why:** image models treat the app/brand name in the prompt as something to
draw, and negative prompts are only a weak deterrent for text.

**How to apply:** put an explicit positive instruction in the `prompt` itself
("absolutely no text, no letters, no words, no title, no logo anywhere — only
the character"), keep the negatives too, and expect to inspect the result and
regenerate at least once. Don't reference the brand name in a way that invites
the model to letter it.
