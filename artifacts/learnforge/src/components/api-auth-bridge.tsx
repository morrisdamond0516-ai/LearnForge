import { useAuth } from "@clerk/react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useRef } from "react";

function attachTokenGetter(getToken: () => Promise<string | null>) {
  setAuthTokenGetter(async () => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  });
}

/**
 * Attaches the Clerk session token to API requests before any child queries run.
 * Must render inside ClerkLoaded on signed-in routes.
 */
export function ApiAuthBridge() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const queryClient = useQueryClient();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Sync attach so the first API call after sign-in already has a bearer token
  // (useEffect runs too late — queries fire on first paint).
  if (isLoaded && isSignedIn) {
    attachTokenGetter(() => getTokenRef.current());
  } else if (isLoaded) {
    setAuthTokenGetter(null);
  }

  useLayoutEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      attachTokenGetter(() => getTokenRef.current());
      // Refetch queries that may have failed with 401 before auth was ready.
      void queryClient.invalidateQueries();
    } else {
      setAuthTokenGetter(null);
    }
  }, [isLoaded, isSignedIn, queryClient]);

  return null;
}
