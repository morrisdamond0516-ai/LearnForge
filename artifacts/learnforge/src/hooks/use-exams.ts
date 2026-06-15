import { useMutation, useQuery } from "@tanstack/react-query";

export type CatalogExam = {
  slug: string;
  name: string;
  blurb: string;
  questionCount: number;
  durationMin: number;
};

export type CatalogCategory = {
  key: string;
  label: string;
  exams: CatalogExam[];
};

export type ExamCatalog = {
  pro: boolean;
  categories: CatalogCategory[];
};

export type CertificateDto = {
  id: number;
  examSlug: string;
  examName: string;
  category: string | null;
  score: number;
  level: string;
  issuedAt: string;
  expiresAt: string;
  expired: boolean;
};

export const EXAM_CATALOG_KEY = ["exam-catalog"] as const;
export const CERTIFICATES_KEY = ["certificates"] as const;

/** Certified exam catalog + the viewer's Pro status. */
export function useExamCatalog() {
  return useQuery<ExamCatalog>({
    queryKey: EXAM_CATALOG_KEY,
    queryFn: async () => {
      const res = await fetch("/api/exams/catalog", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load the exam catalog");
      return (await res.json()) as ExamCatalog;
    },
  });
}

/** The signed-in user's earned certificates. */
export function useCertificates() {
  return useQuery<CertificateDto[]>({
    queryKey: CERTIFICATES_KEY,
    queryFn: async () => {
      const res = await fetch("/api/exams/certificates", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load certificates");
      return (await res.json()) as CertificateDto[];
    },
  });
}

export function useCertificate(id: string) {
  return useQuery<CertificateDto>({
    queryKey: [...CERTIFICATES_KEY, id],
    queryFn: async () => {
      const res = await fetch(
        `/api/exams/certificates/${encodeURIComponent(id)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to load certificate");
      return (await res.json()) as CertificateDto;
    },
  });
}

/** Start a certified exam; resolves to the generated quiz id. */
export function useStartExam() {
  return useMutation<{ quizId: number }, Error, string>({
    mutationFn: async (slug) => {
      const res = await fetch(
        `/api/exams/${encodeURIComponent(slug)}/start`,
        { method: "POST", credentials: "include" },
      );
      if (!res.ok) {
        let msg = "Could not start this exam. Please try again.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) msg = data.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      return (await res.json()) as { quizId: number };
    },
  });
}
