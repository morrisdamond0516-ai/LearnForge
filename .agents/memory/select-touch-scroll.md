---
name: Select dropdown touch scrolling
description: Why the shared shadcn Select omits Radix scroll-up/down buttons (mobile scroll fix)
---

# shadcn Select must scroll natively, not via Radix scroll buttons

The shared `components/ui/select.tsx` intentionally does NOT render
`<SelectScrollUpButton />` / `<SelectScrollDownButton />` inside `SelectContent`.
The `SelectContent` keeps `overflow-y-auto` + `max-h-[--radix-select-content-available-height]`
so the list scrolls natively (real scrollbar / touch drag).

**Why:** Radix's scroll-up/down chevron buttons scroll only on mouse hover/press.
On touch devices (phones — i.e. the deployed app on a real phone) there is no hover,
so long dropdowns (e.g. the 19-item career picker in the interview roleplay and the
quiz generator) could not be scrolled — users couldn't reach the lower options.
Removing the buttons makes the content the native scroll container, which works on
both touch and desktop.

**How to apply:** Do NOT "restore the shadcn default" by adding the scroll buttons
back — that reintroduces the mobile-can't-scroll bug. The button components are still
exported from select.tsx for API compatibility; they're just not used in Content.
Note also: the Viewport must NOT carry `h-[var(--radix-select-trigger-height)]`
(that older shadcn class clipped the list to one row).
