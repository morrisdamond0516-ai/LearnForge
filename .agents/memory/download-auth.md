---
name: Authenticated file downloads
description: Why plain <a download> links 401 in this app and how to download authed files.
---
Plain `<a href download>` (and any top-level/anchor navigation) does NOT carry this app's session, so auth-gated endpoints reject it with 401 — even when the user is signed in and the same endpoint returns 200 via the app's normal API calls.

**Why:** web auth here is cookie-based and the working requests go through `fetch(..., { credentials: "include" })`; an anchor download is treated differently (notably inside the Replit preview iframe) and the session isn't applied.

**How to apply:** to download an authed file (CSV export, etc.), fetch it with `credentials: "include"`, get a `blob()`, then `URL.createObjectURL` → programmatic `<a>` click → `revokeObjectURL`. Never wire downloads of protected endpoints as a bare `<a download>`.
