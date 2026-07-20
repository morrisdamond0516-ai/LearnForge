import { Router } from "express";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  js: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  ts: { language: "typescript", version: "5.0.3" },
  sql: { language: "sqlite3", version: "3.36.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
  "c++": { language: "c++", version: "10.2.0" },
  ruby: { language: "ruby", version: "3.0.1" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.50.0" },
  bash: { language: "bash", version: "5.1.0" },
  shell: { language: "bash", version: "5.1.0" },
};

router.post("/execute-code", requireAuth, async (req, res) => {
  const { language, code } = req.body as { language?: unknown; code?: unknown };
  if (
    typeof language !== "string" ||
    language.length === 0 ||
    language.length > 20 ||
    typeof code !== "string" ||
    code.length === 0 ||
    code.length > 10000
  ) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const lang = language.toLowerCase().trim();
  const pistonLang = LANGUAGE_MAP[lang] ?? { language: lang, version: "*" };

  try {
    const pistonRes = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang.language,
        version: pistonLang.version,
        files: [{ content: code }],
        stdin: "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!pistonRes.ok) {
      res.status(502).json({ error: "Code execution service unavailable" });
      return;
    }

    const result = (await pistonRes.json()) as {
      run?: { stdout?: string; stderr?: string; code?: number };
      compile?: { stderr?: string };
    };

    const stdout = (result.run?.stdout ?? "").trim();
    const stderr = (result.run?.stderr ?? result.compile?.stderr ?? "").trim();
    const exitCode = result.run?.code ?? 0;

    res.json({ stdout, stderr, exitCode });
  } catch (err) {
    req.log.warn({ err }, "Code execution failed");
    res.status(502).json({ error: "Code execution unavailable — check your answer against the expected output" });
  }
});

export default router;
