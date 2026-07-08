import { logger } from "./logger";

const RESEND_API = "https://api.resend.com";

export type ResendConfig = {
  apiKey: string;
  from: string;
  audienceId?: string;
  replyTo?: string;
  learnforgeUrl: string;
  ebookgamezUrl: string;
};

export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return null;

  return {
    apiKey,
    from,
    audienceId: process.env.RESEND_AUDIENCE_ID?.trim() || undefined,
    replyTo:
      process.env.RESEND_REPLY_TO?.trim() ||
      "ebookgames@yahoo.com",
    learnforgeUrl:
      process.env.PUBLIC_SITE_URL?.trim() ||
      process.env.LEARNFORGE_PUBLIC_URL?.trim() ||
      "https://ebookgamez.com",
    ebookgamezUrl:
      process.env.EBOOKGAMEZ_URL?.trim() || "https://ebookgamez.com",
  };
}

async function resendFetch(
  config: ResendConfig,
  path: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; data?: unknown }> {
  const res = await fetch(`${RESEND_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = undefined;
  }
  return { ok: res.ok, status: res.status, data };
}

export async function addContactToAudience(
  config: ResendConfig,
  email: string,
  source: string,
): Promise<void> {
  if (!config.audienceId) return;

  const result = await resendFetch(config, `/audiences/${config.audienceId}/contacts`, {
    email,
    unsubscribed: false,
    first_name: source.slice(0, 50),
  });

  if (!result.ok && result.status !== 409) {
    logger.warn({ status: result.status, data: result.data }, "Resend audience contact failed");
  }
}

function welcomeEmailHtml(config: ResendConfig): string {
  const games = `${config.learnforgeUrl.replace(/\/$/, "")}/games`;
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:0 auto;padding:24px">
  <h1 style="font-size:22px;margin-bottom:8px">Welcome to LearnForge</h1>
  <p>Thanks for subscribing. You will get occasional updates on free learning games, career practice tools, and new features — no spam.</p>
  <p><strong>Start here:</strong></p>
  <ul>
    <li><a href="${games}">Play educational games</a> — Quiz Show, Career Skills Lab, School Skills Lab, and more</li>
    <li><a href="${config.learnforgeUrl}">Take AI practice exams</a> for school or career goals</li>
    <li><a href="${config.ebookgamezUrl}">Visit EbookGamez</a> — free browser games and ebooks</li>
  </ul>
  <p style="font-size:13px;color:#555">You are receiving this because you signed up on LearnForge or EbookGamez. Reply to this email if you have questions.</p>
</body>
</html>`;
}

export async function sendWelcomeEmail(
  config: ResendConfig,
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = {
    from: config.from,
    to: [email],
    subject: "Welcome — free games & learning from LearnForge",
    html: welcomeEmailHtml(config),
  };
  if (config.replyTo) payload.reply_to = config.replyTo;

  const result = await resendFetch(config, "/emails", payload);
  if (!result.ok) {
    const err =
      typeof result.data === "object" &&
      result.data &&
      "message" in result.data &&
      typeof (result.data as { message: unknown }).message === "string"
        ? (result.data as { message: string }).message
        : `Resend error (${result.status})`;
    return { ok: false, error: err };
  }
  return { ok: true };
}

function ownerNotifyEmail(): string {
  return (
    process.env.OWNER_NOTIFY_EMAIL?.trim() ||
    process.env.RESEND_REPLY_TO?.trim() ||
    "ebookgames@yahoo.com"
  );
}

function weeklyDigestHtml(config: ResendConfig): string {
  const games = `${config.learnforgeUrl.replace(/\/$/, "")}/games`;
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:0 auto;padding:24px">
  <h1 style="font-size:20px">LearnForge weekly picks (draft)</h1>
  <p>Use this as a starting point for your Literary Club / Resend broadcast.</p>
  <ul>
    <li><strong>School Skills Lab</strong> — K–12, college &amp; trade school</li>
    <li><strong>Career Skills Lab</strong> — 19 careers</li>
    <li><strong>Quiz Show, Survival Run, Career Cash</strong></li>
  </ul>
  <p>
    <a href="${games}">Play games</a> ·
    <a href="${config.ebookgamezUrl}">EbookGamez</a>
  </p>
  <p style="font-size:13px;color:#555">Partnership outreach: send from Gmail and CC ebookgames@yahoo.com.</p>
</body>
</html>`;
}

export async function sendOwnerDigestEmail(
  config: ResendConfig,
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = {
    from: config.from,
    to: [ownerNotifyEmail()],
    subject: "LearnForge weekly picks — games & learning updates",
    html: weeklyDigestHtml(config),
  };
  if (config.replyTo) payload.reply_to = config.replyTo;

  const result = await resendFetch(config, "/emails", payload);
  if (!result.ok) {
    const err =
      typeof result.data === "object" &&
      result.data &&
      "message" in result.data &&
      typeof (result.data as { message: unknown }).message === "string"
        ? (result.data as { message: string }).message
        : `Resend error (${result.status})`;
    return { ok: false, error: err };
  }
  return { ok: true };
}

export async function subscribeNewsletter(
  email: string,
  source: string,
): Promise<
  | { ok: true }
  | { ok: false; reason: "not_configured" | "invalid_email" | "send_failed"; message: string }
> {
  const config = getResendConfig();
  if (!config) {
    return {
      ok: false,
      reason: "not_configured",
      message: "Newsletter is not configured on this server yet.",
    };
  }

  await addContactToAudience(config, email, source);
  const sent = await sendWelcomeEmail(config, email);
  if (!sent.ok) {
    logger.error({ email, err: sent.error }, "Welcome email failed");
    return {
      ok: false,
      reason: "send_failed",
      message: "Could not send welcome email. Please try again later.",
    };
  }

  return { ok: true };
}
