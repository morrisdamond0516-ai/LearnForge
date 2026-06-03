---
name: Object storage multi-user ACL
description: How to make the template object-storage lib actually private-per-user when adding auth to a previously single-user app.
---

# Making template object storage private-per-user

The copied object-storage template (`lib/objectStorage.ts` + `lib/objectAcl.ts`) ships **open by default**: `GET /storage/objects/*` has the ACL check commented out, and uploaded objects have **no ACL policy** at all. Just adding `requireAuth` is NOT enough — any authenticated user who learns another user's `objectPath` can still read the file. This is an IDOR.

To close it you need all three of these, or it leaks:

1. **Claim ownership at registration, immutably.** When the object is attached to a DB record (e.g. `POST /documents`), set the ACL `{ owner: userId, visibility: "private" }`. Make the claim *immutable*: read the existing policy first and reject (403) if it's already owned by someone else, instead of blindly overwriting. Blind overwrite = known-path hijack/TOCTOU.
2. **Enforce on read.** Uncomment/enable `canAccessObjectEntity({ userId, objectFile, READ })` in the GET route and 403 on false.
3. **Fail closed on no-ACL.** `canAccessObject` already returns `false` when an object has no policy — keep it that way. This means legacy objects uploaded before the ACL flow existed become unreadable; that's correct for a fresh multi-user rollout (don't backfill unless there's real pre-existing user data).

**Why:** the template's commented ACL block and policy-less uploads make "I added login" feel done while every file is still cross-user readable by path. The fail-closed default + immutable claim are the parts that are easy to miss.

**How to apply:** any time you take a single-user app's object storage multi-user, or wire auth onto the object-storage template. Server-side reads that download the object directly (not via the HTTP route) bypass the ACL — gate those on an ownership check of the parent DB row instead.
