/** Shared outreach identity — Gmail send, Yahoo CC, Resend reply-to. */
export const OUTREACH = {
  name: "Damond Morris",
  phone: "702-379-0396",
  yahooEmail: "ebookgames@yahoo.com",
  ebookgamezUrl: "https://ebookgamez.com",
} as const;

export function outreachSignature(): string {
  return `${OUTREACH.name}\n${OUTREACH.phone}\n${OUTREACH.yahooEmail}`;
}

export function learnforgeGamesUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/games`;
}
