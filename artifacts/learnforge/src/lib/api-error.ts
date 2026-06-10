export function isAuthError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { status?: number }).status === 401
  );
}

export function errorMessage(err: unknown, fallback: string): string {
  if (isAuthError(err)) {
    return "Your session ended. Please refresh the page or sign in again, then retry.";
  }
  // Surface friendly server-provided reasons for bad-request errors (e.g. the
  // content moderation message when a career/subject isn't allowed). Guard
  // against dumping raw validation blobs (Zod messages are JSON arrays).
  const status = (err as { status?: number })?.status;
  const data = (err as { data?: unknown })?.data;
  if (status === 400 && data && typeof data === "object") {
    const raw = (data as Record<string, unknown>).error;
    if (typeof raw === "string") {
      const reason = raw.trim();
      if (
        reason.length > 0 &&
        reason.length <= 200 &&
        !reason.startsWith("[") &&
        !reason.startsWith("{")
      ) {
        return reason;
      }
    }
  }
  return fallback;
}
