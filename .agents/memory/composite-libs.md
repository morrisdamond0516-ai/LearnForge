---
name: Composite libs in pnpm monorepo
description: Libs referenced by artifacts/root tsconfig must be composite
---
Any lib listed in the root `tsconfig.json` `references` (and referenced by an artifact's tsconfig) must have `composite: true`, `declarationMap: true`, `emitDeclarationOnly: true`. Otherwise `tsc --build` / artifact typecheck fails with TS6306 "Referenced project must have setting composite: true".

**Why:** Copied `object-storage-web` lib was missing composite settings; learnforge typecheck failed until added.
**How to apply:** When copying/creating a lib that artifacts import, match the tsconfig of an existing composite lib (e.g. api-client-react). React/JSX libs additionally need `"jsx": "react-jsx"`.
