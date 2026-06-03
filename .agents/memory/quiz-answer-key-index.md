---
name: Quiz answer-key index integrity
description: Why quiz grading must derive correctIndex from answer text, not trust the model's numeric index
---

# Quiz answer-key index integrity

When generating multiple-choice quizzes with an LLM, do NOT trust the model's
numeric `correctIndex` field as the source of truth.

**Why:** Observed in production (a 20-question quiz scored 16/20 when the user
truly missed only 1). The model's `correctIndex` frequently disagreed with its
own worked-out explanation and the actually-correct option — e.g. explanation
concludes "the answer is 1.18" (option D) but `correctIndex` was 0. Scoring is
`selectedIndex === q.correctIndex`, so correct answers got marked wrong. The
explanation/worked answer is reliable; the *index* is the weak link.

**How to apply:** Have generation also emit `correctAnswer` (verbatim text of
the correct option) and derive the index server-side by matching that text
against the options (exact-trim match first, then a normalized match —
lowercase, collapse whitespace, strip leading `A)`/`B.` labels). Only fall back
to the raw numeric `correctIndex` when the text matches zero or multiple
options. Keeps positional scoring in attempts correct because the stored index
now reflects the true answer.
