---
name: Preview blanks / "no color" in privacy browsers
description: When a user reports the dev preview is blank, colorless, or unresponsive but server screenshots look fine, suspect their browser/cache, not the app.
---

When a user insists the app is "black and white", "blank", "flashes then disappears",
or "clicking does nothing" — but your own app_preview screenshots and curl of the
served HTML/CSS show a correct, fully-styled, working app — the problem is on the
client side, not in the code. Confirm by curling the served CSS for the actual color
tokens and by screenshotting routes directly.

**Why:** Privacy-hardened browsers (e.g. Norton Private Browser, which injects a
`PowerVideo` script) block the Vite HMR WebSocket. The console shows repeated
`[vite] server connection lost. Polling for restart...`. The page renders for a
moment, then the lost dev connection / runtime-error overlay blanks it. Aggressive
caching in the preview iframe also survives normal and even hard refreshes.

**How to apply:**
- Don't keep "fixing" phantom app bugs. Verify server output first (curl CSS + screenshot routes).
- Ask which browser / whether they use the preview pane vs a separate tab. Recommend a
  standard browser (Edge/Chrome) for the live dev preview; the published static build
  has no WebSocket dependency and works far better in locked-down browsers.
- A dev-only no-store Cache-Control middleware in the Vite config removes stale-cache as a variable.
