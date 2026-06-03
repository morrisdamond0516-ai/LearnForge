---
name: Quiz in-progress persistence / resume
description: Why quiz-take must persist progress to localStorage and not regenerate on remount
---

# Quiz in-progress persistence / resume

A quiz that regenerates its question set on every mount AND keeps progress only
in component state is fragile: any remount throws away the learner's answers and
forces a brand-new test.

**Why:** Reported by a customer — the test "blanks out and restarts, makes me do
another test." The app uses Clerk dev keys whose sessions flicker, and the app
shell is gated by `<Show when="signed-in">`; when the session momentarily flips,
AppShell unmounts/remounts. Combined with quiz-take calling `/quizzes/:id/refresh`
(a 20-30s AI generation) on mount, each remount wiped answers and generated a new
quiz. Page reloads (incl. Vite HMR in dev) did the same.

**How to apply:** Persist the active attempt (title, the exact generated
questions, answers keyed by question.id, current index) to localStorage and
restore it on mount, skipping regeneration when saved progress exists. Only
regenerate when there is no saved progress. Clear on successful submit; keep on
submit error (don't destroy answers on transient failures). Harden restore:
drop corrupt payloads and clamp the saved/rendered index to a valid range so a
bad index can't render an undefined question and blank the page. Skipping
regeneration on remount also keeps the DB quiz row equal to the restored set, so
positional server scoring stays consistent.
