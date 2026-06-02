---
name: wouter Link nested anchor
description: Why nesting <a> inside wouter Link breaks hydration
---
In wouter v3, `<Link href>` renders its own `<a>` element. Wrapping a child `<a>` (or another Link) inside produces nested anchors → React "in HTML, <a> cannot be a descendant of <a>" hydration error.

**Why:** Hit this after a design subagent generated `<Link><a>...</a></Link>` nav items.
**How to apply:** Put className/onClick/etc directly on `<Link>`. For a styled Button-as-link, use `<Button asChild><Link>...</Link></Button>` (Button renders the anchor via Slot), not Link-wrapping-Button.
