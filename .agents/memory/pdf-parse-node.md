---
name: pdf-parse in Node server
description: Which pdf-parse version/import path works server-side and why others crash
---

# Extracting PDF text in a Node (esbuild-bundled) server

Use `pdf-parse@1.x`, imported from the deep path:

```ts
// @ts-expect-error no type declarations for the deep import path
import pdfParse from "pdf-parse/lib/pdf-parse.js";
const data = await pdfParse(buffer); // { text }
```

**Why not the package root / pdf-parse v2:**
- pdf-parse **v2**'s main entry bundles the browser pdf.js *display layer*, which references `DOMMatrix` and tries to load `@napi-rs/canvas`. In a headless Node server these are undefined → `ReferenceError: DOMMatrix is not defined` at startup (server won't boot). Its `./node` subpath only exports a header utility, not the `PDFParse`/`getText` API.
- pdf-parse **v1**'s `index.js` runs a debug-only test-file read (`!module.parent`) that fires under esbuild bundling and crashes at import. Importing the lib file directly (`pdf-parse/lib/pdf-parse.js`) skips index.js entirely.

**How to apply:** any server-side PDF text extraction in this repo. Pair with `@types/pdf-parse` (v1 types, declared for the package root only — hence the `@ts-expect-error` on the deep import).
