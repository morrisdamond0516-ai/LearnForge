---
name: Entitlement grant atomicity & idempotency
description: How Pro-time grants (users.proUntil) from access codes / PayPal must be committed so paid value is never burned or double-granted.
---

# Entitlement grant atomicity & idempotency

Any operation that grants Pro time (`users.proUntil` via `grantProDays`) MUST commit
in the SAME database transaction as the thing that authorizes it. Granting in a second,
separate statement is a correctness bug.

**Why:** code review flagged that a split "claim code" → then "extend proUntil" (two
non-transactional writes) can burn paid value: if the second write fails, the code is
irreversibly consumed (or the PayPal payment captured) but the user gets no Pro time.
Same failure class for any external-payment capture-then-grant flow.

**How to apply:**
- Access codes: the guarded claim UPDATE (`status='active' ... RETURNING`) and the
  grant run inside one `db.transaction`. The race-loser simply gets `null` (no row).
- External one-time payments (PayPal): keep a durable ledger table whose PRIMARY KEY is
  the provider's order/capture id. Insert the ledger row with `onConflictDoNothing()...returning()`
  and grant ONLY when a row was actually inserted — both in one transaction. A replayed/
  retried capture inserts 0 rows → grant nothing (idempotent), so users are never double-granted.
- Capture must also tolerate "already captured": detect the provider's ALREADY_CAPTURED
  error and fall back to GET-order, so a retry after a transient failure reconciles the
  grant instead of erroring out.
- Stack time with `GREATEST(COALESCE(proUntil, now()), now()) + days` so adding time to an
  already-active entitlement extends it rather than truncating.
