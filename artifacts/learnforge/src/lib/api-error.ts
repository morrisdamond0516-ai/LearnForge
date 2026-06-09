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
  return fallback;
}
