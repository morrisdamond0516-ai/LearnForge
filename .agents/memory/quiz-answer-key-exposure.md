---
name: Quiz answer-key exposure
description: Why credential-issuing exams must strip the answer key from the client quiz payload.
---

The normal quiz GET/refresh payload (`toQuizResponse` in `routes/quizzes.ts`) sends each
question's full `correctIndex` and `explanation` to the browser. For ordinary
practice/placement quizzes this is fine (self-study).

**Rule:** any quiz that issues a real credential (certified exams — `quiz.examSlug` set)
MUST neutralize `correctIndex` (-1) and `explanation` (null) in the client response.

**Why:** otherwise a learner reads the answer key from the API/localStorage and farms
certificates, defeating the whole point of a "certified" exam.

**How to apply:** it is safe to neutralize because the take only renders prompt/options
and submits positional indices; grading in `attempts.ts` reads the REAL `correctIndex`
from the DB quiz row, and post-submit explanations come from the attempt's own `results`
snapshot — neither depends on the client payload. Also re-check entitlement on
`/quizzes/:id/refresh` for exam quizzes so the gate isn't only at exam start.
