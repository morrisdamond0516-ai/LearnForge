/**
 * The web app owner gets full access to everything for free, automatically.
 * Matching is case-insensitive on the verified Clerk email address.
 */
const OWNER_EMAILS = new Set(["morris_damond@yahoo.com"]);

export function isOwnerEmail(email: string | null | undefined): boolean {
  return !!email && OWNER_EMAILS.has(email.trim().toLowerCase());
}
