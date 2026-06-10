---
name: Drizzle partial unique index + onConflict
description: How to do an idempotent upsert against a PARTIAL unique index in this repo's Drizzle version.
---

To make a find-or-create route concurrency-safe, back it with a PARTIAL unique index (`uniqueIndex(...).on(cols).where(sql\`... IS NOT NULL\`)`) and insert with `onConflictDoNothing` + a fallback `select` when `.returning()` comes back empty.

**Two gotchas:**
1. Postgres requires the partial index's predicate to be repeated in the ON CONFLICT clause for index inference, or it errors "no unique or exclusion constraint matching the ON CONFLICT specification". Pass the same `WHERE` predicate.
2. This repo's `drizzle-orm` version names that option `where` (NOT `targetWhere`) inside `onConflictDoNothing({ target: [...], where: sql\`...\` })`. Using `targetWhere` fails typecheck (TS2353).

**Why:** read-then-insert find-or-create has a race that creates duplicate rows; for per-entity quizzes that silently splits aggregated progress across two rows.
**How to apply:** any "one row per (user, parent, index)" find-or-create — quizzes per curriculum module is the existing example.
