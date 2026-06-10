---
name: Clerk dev-session flicker remounts the app shell
description: In-progress client-only flows must persist to localStorage or they blank out mid-use
---

# Clerk dev-session flicker remounts the AppShell and wipes in-memory state

In this app the signed-in shell is gated on Clerk auth state. With Clerk
development keys the session briefly flickers (a transient 401 then re-auth,
visible in server logs as dashboard calls going 401 -> 200). That flicker
toggles the signed-in gate, which UNMOUNTS and REMOUNTS the page, resetting all
React `useState`. For a multi-step flow this looks to the user like "the screen
blanked out and started over."

**Why it matters:** any flow whose progress lives only in component state (not
the DB) loses everything on a flicker. This has bitten the quiz-taking flow and
the mock-interview (roleplay) flow.

**How to apply:** for any in-progress, client-only flow, snapshot its state to
`localStorage` and restore on mount. Use lazy `useState(() => load())`
initializers (NOT a restore `useEffect`) so the initial render already has the
restored state — otherwise a persist effect can fire on the first render with
empty state and clobber the saved snapshot before restore runs. Clear the
snapshot when the flow legitimately ends/resets. Harden restore against corrupt
payloads, and if the remount can land mid-async-step, re-trigger that step once
on resume so the user isn't stuck. Existing keys: `learnforge:quiz-progress:<id>`,
`learnforge:interview-progress`.
