---
name: Stripe via stripe-replit-sync on Replit
description: Two non-obvious gotchas wiring the Replit Stripe connector + stripe-replit-sync in a bundled Node server.
---

# Stripe connector + stripe-replit-sync gotchas

## 1. Connector credential field is `secret`, not `secret_key`
The Replit Stripe connector's credential payload (`/api/v2/connection?include_secrets=true&connector_names=stripe`)
returns the key under `settings.secret` (plus `settings.publishable`, `settings.webhook_secret`,
`account_id`, `mcp`). The generic Stripe skill template reads `settings.secret_key`, which does
NOT exist on this connector, so credential fetch silently fails with "not connected / missing secret key".
**How to apply:** read `settings.secret ?? settings.secret_key` (keep the fallback for portability).
Confirm the live shape with `listConnections('stripe')[0].settings` in the code-execution sandbox
(key names only — never print values).

## 2. `stripe-replit-sync` MUST be esbuild-external
`runMigrations()` reads its `.sql` migration files from disk via a path relative to its own
package dir (`path.resolve(__dirname, "./migrations")`). When the api-server build (esbuild,
`build.mjs`) bundles the package, that path resolves into the bundle output dir instead, so
migrations find zero `.sql` files: the `stripe` schema gets created but NO tables, and startup
later throws `relation "stripe.accounts" does not exist` from `findOrCreateManagedWebhook`.
**Why:** classic "package reads sibling files at runtime" + bundler problem (same family as sharp,
@google-cloud/* in the build.mjs external list).
**How to apply:** add `"stripe-replit-sync"` to the esbuild `external` array in the server's
`build.mjs`. Symptom of regression: schema present, tables missing.

## 3. `runMigrations` has no `schema` option
Its TS type (`MigrationConfig`) only takes `{ databaseUrl, ssl?, logger? }`; the schema is
hardcoded to `"stripe"` internally. Passing `schema: "stripe"` is a TS error and does nothing —
call `runMigrations({ databaseUrl })`.
