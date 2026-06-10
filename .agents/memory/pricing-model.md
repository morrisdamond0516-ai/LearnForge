---
name: Pricing model
description: LearnForge's pricing tiers and the free-access rules billing must enforce.
---

# Pricing model

Public `/pricing` page (standalone, adaptive header via Clerk `<Show>`; routed at top level in App.tsx before the ProtectedGate catch-all so signed-out users reach it without redirect).

Tiers:
- **Students (under 18):** free forever, full access, no card.
- **Adults (18+):** 6 months free, then **Pro Monthly $12.99/mo** or **Pro Annual $89.99/yr** (~$7.50/mo, "Save 42%").
- **Schools & educators:** custom / contact us.

**Why:** Owner's chosen model — free for ages 0–18, paid for 18+ after a 6-month free period. Prices set to undercut typical study/test-prep apps ($13–$40/mo).

**How to apply:** The page is marketing copy only — there is NO billing or entitlement enforcement yet (no age gate, no trial countdown, no payments). If/when billing is added, the enforceable rules are: age-based free access (under 18) + a per-user 6-month free window for adults, then require an active Pro plan. Keep plan copy and enforced entitlements in lockstep to avoid policy drift. Provider not yet chosen.
