---
name: Codegen rewrites the literal substring "interview" -> "iln"
description: A blanket find/replace in the OpenAPI->Orval codegen pipeline corrupts any generated name/path/enum containing "interview"; avoid that substring in generated artifacts.
---

The OpenAPI -> Orval codegen pipeline blanket-replaces the literal substring
`interview` with `iln` (case-preserving) across ALL generated output —
operationIds, schema/type names, hook names, **URL path string literals**, and
even **enum string values**. Examples seen: `InterviewInput` -> `IlnInput`,
enum value `interviewer` -> `ilner`, URL `/api/interview/message` ->
`/api/iln/message`. This silently breaks the client<->server contract because
the generated client then calls a URL the server never registered.

**Why:** the substitution is not in `lib/api-spec/orval.config.ts` (no such
transformer there) — it comes from elsewhere in the pipeline, so you cannot fix
it by editing the orval config. It is invisible until runtime (typecheck still
passes; the request just 404s).

**How to apply:** never use the substring `interview` in anything that flows
through codegen — OpenAPI `operationId`s, `paths`, schema names, or enum string
values. Pick a different stem. For the mock-interview feature we used
`roleplay` for paths/schemas/hooks and role enum values `host`/`candidate`.
After any regen, grep the generated dir for `iln` (must be 0) and confirm the
expected URLs/enum values are intact before trusting the build.
