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
- DB schema (source of truth): `lib/db/src/schema/*.ts` (subjects, documents, quizzes, attempts, learnSessions), re-exported from `index.ts`
- API routes: `artifacts/api-server/src/routes/*.ts` (subjects, documents, quizzes, attempts, learn, dashboard, storage)
- AI logic: `artifacts/api-server/src/lib/ai.ts` (quiz generation, study-guide research, level assessment)
- Frontend pages: `artifacts/learnforge/src/pages/*`; theme in `artifacts/learnforge/src/index.css`

## Architecture decisions

- Quiz generation and topic research are synchronous JSON AI calls (not streaming): the server asks for JSON output, parses/sanitizes it, then persists. Frontend shows a generating state during the call.
- Quiz questions and attempt results are stored as JSONB columns rather than separate normalized tables — they are always read/written as a whole with their parent.
- Placement level thresholds: score >= 80 Advanced, >= 50 Intermediate, else Beginner (`assessLevel` in `ai.ts`).
- Foreign keys link documents/quizzes/learnSessions to subjects (set null on delete) and attempts to quizzes (cascade). Routes also reject non-existent linkage IDs with 404 before insert.
- No authentication: this is a single-user personal tool. Object storage private-object serving uses the template default (no per-user ACL) consistent with that.

## Product

- Dashboard: progress summary, recent activity, per-subject levels
- Subjects: browse and create custom subjects
- Quizzes: generate placement/practice/exam quizzes from a subject, document, or free-form topic; take them and get scored results with explanations and an assessed level
- Learn: AI study guides for any topic (summary, sections, key points, next steps)
- Documents: upload PDFs/files to use as quiz source material

## User preferences

- No emojis in the UI.

## Gotchas

- wouter v3 `<Link>` renders its own `<a>` — never nest an `<a>` inside it (causes nested-anchor hydration errors). Put className/onClick directly on `Link`.
- The copied OpenAI server lib and object-storage-web lib are composite TS projects; they must stay in the root `tsconfig.json` references and have `composite: true`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
