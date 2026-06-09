# LearnForge

An AI-powered learning and test-prep web app: pick any subject, generate custom quizzes/exams, take placement tests to find your level, generate AI study guides, and upload your own PDFs/notes to turn into tests.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/learnforge run dev` — run the web frontend (use workflows in practice, not bare dev)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` (Postgres), OpenAI integration vars, Object Storage vars (all provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Web: React 19 + Vite + wouter + TanStack Query + shadcn/ui
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- AI: OpenAI integration (`@workspace/integrations-openai-ai-server`), model `gpt-5.4`
- File uploads: Replit Object Storage via `@workspace/object-storage-web` (Uppy + presigned PUT)

## Where things live

- API contract (source of truth): `lib/api-spec/openapi.yaml` → codegen produces `@workspace/api-zod` and `@workspace/api-client-react`
- DB schema (source of truth): `lib/db/src/schema/*.ts` (subjects, documents, quizzes, attempts, learnSessions, careerPlans, curricula), re-exported from `index.ts`
- API routes: `artifacts/api-server/src/routes/*.ts` (subjects, documents, quizzes, attempts, learn, dashboard, storage, career, curriculum)
- AI logic: `artifacts/api-server/src/lib/ai.ts` (quiz generation, study-guide research, level assessment, career recommendations, curriculum generation)
- Document text extraction: `artifacts/api-server/src/lib/documentText.ts` (downloads an uploaded object and pulls readable text — PDF via pdf-parse, text/* directly)
- Frontend pages: `artifacts/learnforge/src/pages/*`; theme in `artifacts/learnforge/src/index.css`

## Architecture decisions

- Quiz generation and topic research are synchronous JSON AI calls (not streaming): the server asks for JSON output, parses/sanitizes it, then persists. Frontend shows a generating state during the call.
- Quiz questions and attempt results are stored as JSONB columns rather than separate normalized tables — they are always read/written as a whole with their parent.
- Placement level thresholds: score >= 80 Advanced, >= 50 Intermediate, else Beginner (`assessLevel` in `ai.ts`).
- Foreign keys link documents/quizzes/learnSessions to subjects (set null on delete) and attempts to quizzes (cascade). Routes also reject non-existent linkage IDs with 404 before insert.
- Per-user accounts via Replit-managed Clerk. Every owned table (subjects/documents/quizzes/attempts/learnSessions/careerPlans/curricula) has a nullable `user_id`; preset/seed subjects keep `user_id = NULL` and are shared read-only to everyone. Server: clerk proxy mounted before body parsers; `clerkMiddleware` via `publishableKeyFromHost`; `requireAuth` middleware sets `req.userId`; all data routers gated behind it (health public; storage self-guards). Every route scopes by `req.userId` (inserts set it; reads/updates/deletes filter by it; subject lookups allow `or(isNull(userId), eq(userId, me))`; cross-entity validation respects ownership). Web auth is cookie-based same-origin, so `custom-fetch` needs no token wiring. CORS is restricted to an allowlist built from `REPLIT_DEV_DOMAIN`/`REPLIT_DOMAINS` (credentials on). Frontend: `ClerkProvider` with branded appearance, `/sign-in` + `/sign-up`, signed-out users see a public Landing page, signed-in users get the app shell; query cache is cleared on user switch.
- Object storage is per-user: uploaded objects get a private ACL with `owner = req.userId` claimed at document registration (`POST /documents`), and the claim is immutable (re-registering an object owned by someone else is rejected, not overwritten). `GET /storage/objects/*` enforces `canAccessObjectEntity` and denies objects with no ACL (fail-closed). Server-side reads (e.g. transcript text extraction) download the object directly after an ownership check on the parent document, bypassing the HTTP ACL path.
- Career Pathways uses the uploaded document's real text: the route downloads the object and extracts readable text (capped 4000 chars, aligned with the prompt slice in `ai.ts`) before passing it to the AI. Extraction is best-effort and bounded — files over 10MB or that exceed a 15s PDF parse timeout are skipped, and if extraction fails or yields nothing (e.g. scanned-image PDF), the request still succeeds with the AI told the text could not be read. The route also rejects an empty AI result (no recommendations / blank summary) with a 500 rather than persisting it.
- Real-exam length for career tests: career/certification quizzes can match the actual exam's question count via an "Auto" length option (`autoLength` on QuizGenerateInput). When set with a career, the route calls `getCareerExamInfo(career, section)` (ai.ts) to ask the AI the real exam's typical count, clamped to [3,60]. Generation is batched: `generateQuizContent` splits totals over `QUIZ_BATCH_SIZE` (15) into parallel AI calls (bounded retry rounds to reach the target) and merges+renumbers, so large sets (up to `MAX_QUIZ_QUESTIONS` = 60) come back complete instead of truncated. The intended target count (resolvedCount) is persisted as `quizzes.questionCount`, and refresh preserves it, so a one-off generation shortfall never permanently shrinks the test.
- Document-grounded quizzes: when a quiz is tied to an uploaded document (`documentId`), generation reads the document's actual text (not just its name). The route extracts readable text via `extractDocumentText` (capped at `QUIZ_SOURCE_MAX_CHARS` = 12000, larger than the career path's 4000 — `extractDocumentText` now takes an optional `maxChars`) and passes it as `documentText` into `generateQuizContent`/`generateQuizBatch`, where the prompt tells the model to identify the key testable content and ground every question/answer/explanation strictly in that material. Applied in both create and refresh paths. Extraction is best-effort: scanned-image PDFs, oversized files, or parse failures return null and the prompt falls back to name-only behavior, so generation still succeeds. The embedded document text is framed as untrusted reference content (anti-prompt-injection: the model is told to ignore any instructions inside it). Refresh scopes the document lookup by `req.userId` to match the create path.
- Answer-key integrity: the model's numeric `correctIndex` is not trusted on its own — it frequently disagrees with the model's own worked-out explanation/correct option, which caused correct answers to be graded wrong. Generation now also asks for `correctAnswer` (verbatim text of the correct option) and the server derives the index via `resolveCorrectIndex` (exact-trim match first, then a normalized match that lowercases, collapses whitespace, and strips leading `A)`/`B.` labels). It only falls back to the raw `correctIndex` when the text matches zero or multiple options. Scoring in `attempts.ts` is unchanged (`selectedIndex === q.correctIndex`, positional) and stays correct because the stored index now reflects the true answer.
- Resumable in-progress quizzes: `quiz-take.tsx` persists the active attempt (title, the exact generated question set, the answers map keyed by question.id, and current index) to `localStorage` under `learnforge:quiz-progress:<quizId>`, re-saving on every answer/navigation change. On mount it restores saved progress and SKIPS regeneration; it only calls `/quizzes/:id/refresh` (which generates a fresh set) when there is no saved progress. This means a page reload or an AppShell remount (e.g. a Clerk dev-session flicker toggling `<Show when="signed-in">`) no longer wipes answers or forces a brand-new test — the learner resumes in place. Progress is cleared on successful submit (so a genuinely new attempt regenerates) but kept on submit error (don't destroy answers on transient failures). Restore is hardened: invalid/corrupt payloads are dropped and the current index is clamped to a valid range (also clamped at render via `safeIdx`) so a bad saved index can never blank the page. Server scoring stays consistent because skipping regeneration on remount leaves the DB quiz row equal to the restored set.
- Fresh questions per take: taking a quiz regenerates its questions instead of replaying the stored set, so a learner can't memorize answers. `POST /quizzes/:id/refresh` regenerates from the quiz's stored params (mode/subject/topic/document/difficulty/count), persists the new set onto `quizzes.questions`, and returns it; `quiz-take.tsx` fires this once on mount. `generateQuizContent` adds a per-call variation key + instruction so each set differs. Submit (`/quizzes/:id/attempts`) still scores against the quiz row, which is consistent because generation fires exactly once per take (no React StrictMode in `main.tsx`); attempts also snapshot their own question data into `attempts.results`, so regenerating never corrupts past results.
- AI mock-interview (roleplay): a live, non-persisted interview practice flow under the Learn section, usable for any curated career. Two stateless endpoints (gated by `requireAuth`): `POST /roleplay/message` takes `{career, focus?, messages[]}` and returns the next interviewer turn (`conductInterviewTurn` in `ai.ts` — plain text, stays in character, one question per turn, opens the interview when `messages` is empty; maps message roles `host`->`assistant`, `candidate`->`user`); `POST /roleplay/evaluate` returns structured JSON feedback (`evaluateInterview` — `overallScore` 0-100 clamped, `summary`, `strengths[]`, `improvements[]`, `recommendedTopics[]`). The whole transcript is sent on every call (no server-side session). Both prompts treat candidate/transcript text as untrusted data and ignore instructions embedded in it (anti-prompt-injection, same posture as document-grounded quizzes). Frontend `pages/interview.tsx` is a 3-stage flow (setup -> live chat -> feedback report) at `/learn/interview`; recommended topics link to `/learn?topic=<t>`.
- CODEGEN GOTCHA — never use the substring "interview" in anything that flows through OpenAPI->Orval codegen (operationIds, paths, schema names, enum values). The pipeline blanket-replaces the literal substring `interview`->`iln` (case-preserving) in ALL generated output including URL path literals and enum string values, silently breaking the client/server contract (typecheck still passes; requests 404). This is NOT in `orval.config.ts` and can't be fixed there. The mock-interview feature is therefore named `roleplay` everywhere in the contract, with role enum values `host`/`candidate`. After any regen, grep the generated dir for `iln` (must be 0).

## Product

- Dashboard: progress summary, recent activity, per-subject levels
- Subjects: browse and create custom subjects
- Quizzes: generate placement/practice/exam quizzes from a subject, document, free-form topic, or a career/certification (a realistic practice test that mirrors the real hiring or professional certification exam for that role, picked from a curated dropdown with an "Other" custom entry, plus an optional test-section focus like Math/Reading/Situational Judgment passed via `topic`; `career` is stored on the quiz so refresh regenerates in the same context). Each time you take one, a fresh set of questions is generated (you can't just memorize answers); get scored results with explanations and an assessed level
- Learn: AI study guides for any topic (summary, sections, key points, next steps), plus an AI mock-interview roleplay (practice a realistic interview with an AI hiring manager for any career, then get a scored feedback report with strengths, improvements, and topics to study)
- Curriculum: after an assessment (or from the Curriculum page), generate a tailored learning plan for a subject + assessed level. The AI returns ordered modules, each grouping the best real learning materials (books, videos, worksheets, tools, courses) with author/provider and a "where to find it" note (no fabricated URLs). The "Build my curriculum" button on the quiz results page seeds generation with the subject, assessed level, and the prompts of missed questions as focus areas. Plans are saved and browsable. Mirrors the Career Pathways architecture (schema/route/openapi/codegen/list+detail pages).
- Documents: upload PDFs/files to use as quiz source material
- Career Pathways: upload a transcript/document + career goal + preferences (format/budget/location/timeline) → AI recommends real schools/programs, skill gaps, and next steps; plans are saved and browsable
- Onboarding/guidance (built for students and first-time users): a "How it works" Help page (`pages/help.tsx`, route `/help`, in the nav) explains the core loop and every feature in plain language; a first-time welcome walkthrough (`components/welcome-tour.tsx`) auto-opens once per user (localStorage flag `learnforge:welcome-seen`, with an in-session fallback if storage is blocked) and is replayable via the `learnforge:start-tour` window event (exported `startTour()`), wired to buttons on the Help page and Dashboard; nuanced quiz-generator options use a touch-friendly `components/help-tip.tsx` (click/tap Popover, not hover, with a padded tap target) for inline plain-language hints. `WelcomeTour` is rendered once inside `Layout` so it overlays the whole signed-in app.

## Planned / future

- ebookgamez monetization bridge (not built yet): the Curriculum and Career Pathways AI already recommend real book titles (currently shown as plain "where to find it" notes). Future work is to turn those recommended titles into "Buy on ebookgamez" links/buttons so students can purchase at the moment a book is recommended, ideally with affiliate tracking to earn per sale. Blocked on deciding how ebookgamez exposes books (a search/URL pattern to link to, vs. an API/catalog to pull real titles + prices). Revisit once that's known.

## User preferences

- No emojis in the UI.

## Gotchas

- wouter v3 `<Link>` renders its own `<a>` — never nest an `<a>` inside it (causes nested-anchor hydration errors). Put className/onClick directly on `Link`.
- The copied OpenAI server lib and object-storage-web lib are composite TS projects; they must stay in the root `tsconfig.json` references and have `composite: true`.
- PDF text extraction uses `pdf-parse@1.x` imported from the deep path `pdf-parse/lib/pdf-parse.js` (with a `@ts-expect-error`, no types for that path). Do NOT import the package root or pdf-parse v2: v2's main entry bundles the browser pdf.js display layer which needs `DOMMatrix`/`@napi-rs/canvas` and crashes at server startup; v1's index.js runs a debug-only file read when bundled.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
