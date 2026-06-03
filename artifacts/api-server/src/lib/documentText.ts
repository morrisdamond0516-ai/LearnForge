// pdf-parse v1's index.js runs a debug-only file read when bundled, which
// crashes at import time. Importing the lib entry directly avoids that path.
// @ts-expect-error no type declarations for the deep import path
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { ObjectStorageService } from "./objectStorage";

// Keep this aligned with the transcript slice in ai.ts (generateCareerRecommendations).
const MAX_CHARS = 4000;
// Hard cap on the object we are willing to download/parse, to avoid memory
// pressure or slow parses from very large or malicious uploads.
const MAX_BYTES = 10 * 1024 * 1024;
// Upper bound on how long a single PDF parse may run.
const PARSE_TIMEOUT_MS = 15_000;

const objectStorageService = new ObjectStorageService();

function looksLikeText(contentType: string | null): boolean {
  if (!contentType) return false;
  return (
    contentType.startsWith("text/") ||
    contentType === "application/json" ||
    contentType === "application/csv"
  );
}

function isPdf(contentType: string | null, objectPath: string): boolean {
  if (contentType === "application/pdf") return true;
  return objectPath.toLowerCase().endsWith(".pdf");
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("parse timed out")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Best-effort extraction of readable text from an uploaded document so the AI
 * can actually reason about a learner's transcript. Returns null when the file
 * cannot be read, is too large, or holds no extractable text (e.g. a scanned
 * image PDF).
 */
export async function extractDocumentText(
  objectPath: string,
  contentType: string | null,
  maxChars: number = MAX_CHARS,
): Promise<string | null> {
  let buffer: Buffer;
  try {
    const file = await objectStorageService.getObjectEntityFile(objectPath);
    const [metadata] = await file.getMetadata();
    const size = Number(metadata.size ?? 0);
    if (size > MAX_BYTES) return null;
    buffer = await objectStorageService.downloadObjectBuffer(file);
  } catch {
    return null;
  }

  if (buffer.length > MAX_BYTES) return null;

  let text = "";
  if (isPdf(contentType, objectPath)) {
    try {
      const data: { text?: string } = await withTimeout(
        pdfParse(buffer),
        PARSE_TIMEOUT_MS,
      );
      text = data.text ?? "";
    } catch {
      return null;
    }
  } else if (looksLikeText(contentType)) {
    text = buffer.toString("utf-8");
  } else {
    return null;
  }

  const cleaned = text.replace(/\s+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, maxChars);
}
