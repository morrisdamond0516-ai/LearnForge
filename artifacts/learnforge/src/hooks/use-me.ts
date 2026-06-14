import { useQuery } from "@tanstack/react-query";

export type Entitlement = {
  pro: boolean;
  source: "owner" | "stripe" | "code" | "junior_trial" | "none";
  until: string | null;
};

export type Me = {
  email: string | null;
  birthDate: string | null;
  age: number | null;
  needsBirthDate: boolean;
  isMinor: boolean;
  isOwner: boolean;
  juniorWindowUntil: string;
  juniorWindowActive: boolean;
  ageVerificationStatus: "none" | "pending" | "approved" | "rejected";
  needsAgeVerification: boolean;
  createdAt: string;
  entitlement: Entitlement;
};

export const ME_QUERY_KEY = ["me"] as const;

/** Account + onboarding status for the signed-in user (raw `/api/me`). */
export function useMe() {
  return useQuery<Me>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load account");
      return (await res.json()) as Me;
    },
  });
}
