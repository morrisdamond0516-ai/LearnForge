# Email setup — LearnForge & EbookGamez

Three channels, each with a clear job:

| Channel | Use for | Cost |
|---------|---------|------|
| **Gmail** (via Cursor MCP) | Partnership outreach (SCORE, SBDC, etc.) — **draft first, you approve send** | Free |
| **Yahoo (`ebookgames@yahoo.com`)** | CC on every partnership send; inbox for replies | Free |
| **Resend** | Subscriber welcome + weekly digest to you + future broadcasts | Free tier |

---

## 1. Resend (server — already wired)

Set these on **Replit** / your API host (never commit `.env`):

```env
RESEND_API_KEY=re_...
RESEND_FROM=LearnForge <onboarding@your-verified-domain.com>
RESEND_AUDIENCE_ID=...
RESEND_REPLY_TO=ebookgames@yahoo.com
PUBLIC_SITE_URL=https://your-learnforge-url
EBOOKGAMEZ_URL=https://ebookgamez.com
OWNER_NOTIFY_EMAIL=ebookgames@yahoo.com
```

**What it does today**

- `POST /api/newsletter/subscribe` — adds contact + sends welcome email
- `GET /api/newsletter/status` — health check for the Outreach page
- `POST /api/owner/outreach/weekly-digest` — emails you a draft newsletter (owner only)

Verify your sending domain in the [Resend dashboard](https://resend.com/domains).

---

## 2. Gmail + Cursor MCP (one-time OAuth)

Partnership emails should go from **Gmail**, with **CC: ebookgames@yahoo.com**.

### Step A — Add MCP server

Copy `docs/mcp-gmail.example.json` into Cursor:

- **Windows:** `%USERPROFILE%\.cursor\mcp.json`
- **macOS/Linux:** `~/.cursor/mcp.json`

Merge with any existing `mcpServers` block.

### Step B — Authenticate once

```bash
npx gmail-mcp-server setup
```

Sign in with the Google account you use for outreach. Cursor can then **read drafts and create drafts** — not auto-send to SCORE without your OK.

### Step C — Example prompts in Cursor

```
Draft the SCORE partnership email from docs/partnership-outreach-emails.md.
CC ebookgames@yahoo.com. Do not send — create a Gmail draft only.
```

```
Draft a reply to [paste SCORE reply]. CC ebookgames@yahoo.com. Draft only.
```

---

## 3. Yahoo inbox

- **CC** `ebookgames@yahoo.com` on all partnership mail from Gmail
- Optional **Reply-To** on Resend is already `ebookgames@yahoo.com` when `RESEND_REPLY_TO` is set
- Public contact email on the site: `ebookgames@yahoo.com`

---

## 4. In-app Outreach hub

Sign in as owner → **More → Outreach** (`/owner/outreach`):

- Copy partnership templates (SCORE, SBDC, Helpful Marketing, Braven, Volta)
- Check Resend status
- **Email me this week's digest** — Resend → your Yahoo

Templates also live in `docs/partnership-outreach-emails.md`.

---

## 5. Replit deploy checklist

1. Merge `newsletter-resend` (or your feature branch) into production
2. Add Resend env vars above
3. Redeploy API + frontend
4. Test: Games page newsletter signup + Outreach digest button
5. Gmail MCP is **local to Cursor** — no Replit deploy needed

---

## What we deliberately avoid

- Paid marketing SaaS with later upsells
- Auto-sending partnership mail without your approval
- External game links inside LearnForge games

**Signature block (all outreach):**

```
Damond Morris
702-379-0396
ebookgames@yahoo.com
```
