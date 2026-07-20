import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetLessonById,
  getGetLessonByIdQueryKey,
  useStartLessonPractice,
  useRegenerateLesson,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookMarked,
  Trophy,
  Zap,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type {
  LessonSection,
  LessonKeyTerm,
  SpreadsheetExercise,
  ScenarioExercise,
  CodeExercise,
} from "@workspace/api-client-react";

type AnswerState = {
  selected: number;
  revealed: boolean;
};

function CheckQuestion({
  question,
  answer,
  onAnswer,
}: {
  question: LessonSection["checkQuestion"];
  answer: AnswerState | null;
  onAnswer: (idx: number) => void;
}) {
  const revealed = answer?.revealed ?? false;
  const selected = answer?.selected ?? -1;
  const correct = question.correctIndex;

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 space-y-4">
      <p className="font-semibold text-sm uppercase tracking-wider text-primary flex items-center gap-2">
        <Zap className="h-4 w-4" /> Check your understanding
      </p>
      <p className="text-base font-medium leading-snug">{question.prompt}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let variant: string =
            "border border-border bg-background hover:bg-muted text-foreground";
          if (revealed) {
            if (i === correct) {
              variant =
                "border-2 border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 font-semibold";
            } else if (i === selected && i !== correct) {
              variant =
                "border-2 border-destructive bg-destructive/10 text-destructive font-semibold";
            } else {
              variant = "border border-border/40 bg-muted/40 text-muted-foreground";
            }
          } else if (selected === i) {
            variant =
              "border-2 border-primary bg-primary/10 text-primary font-semibold";
          }

          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => !revealed && onAnswer(i)}
              className={`w-full text-left rounded-lg px-4 py-3 text-sm transition-colors cursor-pointer disabled:cursor-default ${variant}`}
            >
              <span className="font-bold mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className={`flex items-start gap-3 rounded-lg p-4 text-sm ${
            selected === correct
              ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200"
              : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200"
          }`}
        >
          {selected === correct ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span>{question.explanation}</span>
        </div>
      )}
    </div>
  );
}

type TaskState = { value: string; checked: boolean; correct: boolean | null };

function SpreadsheetExerciseBlock({ exercise }: { exercise: SpreadsheetExercise }) {
  const [tasks, setTasks] = useState<TaskState[]>(
    exercise.tasks.map(() => ({ value: "", checked: false, correct: null })),
  );

  const allChecked = tasks.every((t) => t.checked);

  const handleCheck = (i: number) => {
    const expected = exercise.tasks[i].expectedValue.trim();
    const raw = tasks[i].value.trim();
    // Accept numeric equivalence (e.g. "3000" == "3,000" or "3000.00")
    const normalize = (v: string) => {
      const n = parseFloat(v.replace(/,/g, ""));
      return isNaN(n) ? v.toLowerCase() : n;
    };
    const correct =
      raw.toLowerCase() === expected.toLowerCase() ||
      normalize(raw) === normalize(expected);
    setTasks((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, checked: true, correct } : t)),
    );
  };

  const handleReset = (i: number) => {
    setTasks((prev) =>
      prev.map((t, idx) =>
        idx === i ? { value: "", checked: false, correct: null } : t,
      ),
    );
  };

  return (
    <div className="rounded-xl border-2 border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-green-200 dark:border-green-800 flex items-center gap-2">
        <span className="text-green-700 dark:text-green-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M3 15h18M9 3v18" />
          </svg>
          {exercise.title}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">{exercise.description}</p>

        {/* Spreadsheet grid */}
        <div className="overflow-x-auto rounded-lg border border-green-200 dark:border-green-800 bg-white dark:bg-card">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-muted">
                {exercise.headers.map((h, ci) => (
                  <th
                    key={ci}
                    className={`border border-gray-300 dark:border-border px-2 py-1 font-semibold text-center min-w-[80px] ${
                      ci === 0 ? "w-8 bg-gray-200 dark:bg-muted text-muted-foreground" : "text-gray-600 dark:text-muted-foreground"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exercise.rows.map((row, ri) => {
                // Find tasks targeting cells in this row
                const rowNum = row[0]; // first cell is the row number
                return (
                  <tr
                    key={ri}
                    className={ri % 2 === 0 ? "bg-white dark:bg-background" : "bg-gray-50 dark:bg-muted/30"}
                  >
                    {row.map((cell, ci) => {
                      if (ci === 0) {
                        return (
                          <td
                            key={ci}
                            className="border border-gray-300 dark:border-border px-2 py-1 text-center text-muted-foreground bg-gray-100 dark:bg-muted font-medium"
                          >
                            {cell}
                          </td>
                        );
                      }
                      // Determine column letter from headers
                      const colLetter = exercise.headers[ci] ?? "";
                      const cellRef = `${colLetter}${rowNum}`;
                      const taskIdx = exercise.tasks.findIndex(
                        (t) => t.targetCell === cellRef,
                      );
                      const isEmpty = cell === "";

                      if (isEmpty && taskIdx >= 0) {
                        const ts = tasks[taskIdx];
                        return (
                          <td
                            key={ci}
                            className="border border-blue-400 dark:border-blue-500 px-1 py-0.5 bg-blue-50 dark:bg-blue-950/30"
                          >
                            {ts.checked ? (
                              <span
                                className={`font-semibold px-1 ${
                                  ts.correct
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400 line-through"
                                }`}
                              >
                                {ts.value || "—"}
                              </span>
                            ) : (
                              <input
                                type="text"
                                value={ts.value}
                                onChange={(e) =>
                                  setTasks((prev) =>
                                    prev.map((t, idx) =>
                                      idx === taskIdx
                                        ? { ...t, value: e.target.value }
                                        : t,
                                    ),
                                  )
                                }
                                placeholder="?"
                                className="w-full bg-transparent text-center outline-none placeholder-blue-400 font-mono"
                              />
                            )}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={ci}
                          className={`border border-gray-300 dark:border-border px-2 py-1 ${
                            ri === 0 ? "font-semibold text-gray-700 dark:text-foreground bg-gray-50 dark:bg-muted/50" : "font-mono text-gray-700 dark:text-foreground"
                          }`}
                        >
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Task cards */}
        <div className="space-y-3">
          {exercise.tasks.map((task, i) => {
            const ts = tasks[i];
            return (
              <div
                key={i}
                className={`rounded-lg border p-3 space-y-2 ${
                  ts.correct === true
                    ? "border-green-400 bg-green-50 dark:bg-green-950/30"
                    : ts.correct === false
                      ? "border-red-400 bg-red-50 dark:bg-red-950/30"
                      : "border-gray-200 dark:border-border bg-white dark:bg-card"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium leading-snug">{task.instruction}</p>
                </div>

                {!ts.checked && (
                  <div className="flex items-center gap-2 pl-7">
                    {task.targetCell && (
                      <span className="text-xs font-mono bg-gray-100 dark:bg-muted px-2 py-0.5 rounded border border-gray-300 dark:border-border text-muted-foreground">
                        {task.targetCell}
                      </span>
                    )}
                    <input
                      type="text"
                      value={ts.value}
                      onChange={(e) =>
                        setTasks((prev) =>
                          prev.map((t, idx) =>
                            idx === i ? { ...t, value: e.target.value } : t,
                          )
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && ts.value.trim()) handleCheck(i);
                      }}
                      placeholder="Your answer…"
                      className="flex-1 text-sm border rounded px-2 py-1 bg-white dark:bg-muted border-gray-300 dark:border-border outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCheck(i)}
                      disabled={!ts.value.trim()}
                    >
                      Check
                    </Button>
                  </div>
                )}

                {ts.checked && (
                  <div className="pl-7 space-y-1">
                    <div
                      className={`flex items-center gap-2 text-sm font-medium ${
                        ts.correct
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {ts.correct ? (
                        <><CheckCircle2 className="h-4 w-4" /> Correct!</>
                      ) : (
                        <><XCircle className="h-4 w-4" /> Not quite — expected {exercise.tasks[i].expectedValue}</>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                      {task.formulaHint}
                    </p>
                    {!ts.correct && (
                      <button
                        onClick={() => handleReset(i)}
                        className="text-xs text-blue-600 dark:text-blue-400 underline"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allChecked && tasks.every((t) => t.correct) && (
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
            <Trophy className="h-4 w-4" /> All tasks complete — great work!
          </div>
        )}
      </div>
    </div>
  );
}

function ScenarioExerciseBlock({ exercise }: { exercise: ScenarioExercise }) {
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  const optimalIdx = exercise.choices.findIndex((c) => c.isOptimal);

  return (
    <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 overflow-hidden">
      <div className="px-5 py-3 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
        <span className="text-amber-700 dark:text-amber-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
          <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          On-the-Job Scenario
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Role + situation */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            {exercise.title}
          </p>
          <div className="rounded-lg bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
              🎯 {exercise.role}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{exercise.situation}</p>
          </div>
        </div>

        <p className="text-sm font-semibold text-foreground">What do you do?</p>

        {/* Choice buttons */}
        <div className="space-y-2">
          {exercise.choices.map((choice, i) => {
            const isSelected = selected === i;
            const isOptimal = choice.isOptimal;
            const showResult = revealed && isSelected;
            const showCorrect = revealed && !isSelected && isOptimal;

            let borderClass = "border-gray-200 dark:border-border";
            if (showResult && isOptimal) borderClass = "border-green-400 dark:border-green-500";
            if (showResult && !isOptimal) borderClass = "border-red-400 dark:border-red-500";
            if (showCorrect) borderClass = "border-green-400 dark:border-green-500 opacity-80";

            let bgClass = "bg-white dark:bg-card hover:bg-amber-50 dark:hover:bg-amber-950/20";
            if (showResult && isOptimal) bgClass = "bg-green-50 dark:bg-green-950/30";
            if (showResult && !isOptimal) bgClass = "bg-red-50 dark:bg-red-950/30";
            if (showCorrect) bgClass = "bg-green-50/60 dark:bg-green-950/20";

            return (
              <div key={i} className={`rounded-lg border-2 ${borderClass} ${bgClass} overflow-hidden transition-colors`}>
                <button
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 disabled:cursor-default"
                >
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
                    revealed
                      ? isOptimal
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 dark:bg-muted text-muted-foreground"
                      : "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">{choice.label}</span>
                </button>

                {(showResult || showCorrect) && (
                  <div className={`px-4 pb-3 pt-1 text-sm leading-relaxed border-t ${
                    isOptimal
                      ? "border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                      : "border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                  }`}>
                    <div className="flex items-center gap-2 mb-1 font-semibold text-xs uppercase tracking-wider">
                      {isOptimal ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Best approach</>
                      ) : showResult ? (
                        <><XCircle className="h-3.5 w-3.5" /> What actually happens</>
                      ) : (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> What would've happened</>
                      )}
                    </div>
                    {choice.outcome}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {revealed && (
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-amber-700 dark:text-amber-400 underline"
          >
            Reset scenario
          </button>
        )}

        {revealed && selected === optimalIdx && (
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
            <Trophy className="h-4 w-4" /> Great call — that's the professional approach!
          </div>
        )}
      </div>
    </div>
  );
}

type CodeRunState = { stdout: string; stderr: string; exitCode: number } | null;

function CodeExerciseBlock({ exercise }: { exercise: CodeExercise }) {
  const [code, setCode] = useState(exercise.starterCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CodeRunState>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const languageLabel: Record<string, string> = {
    python: "Python", javascript: "JavaScript", typescript: "TypeScript",
    sql: "SQL", java: "Java", ruby: "Ruby", go: "Go", rust: "Rust",
    bash: "Bash", cpp: "C++",
  };
  const label = languageLabel[exercise.language] ?? exercise.language.toUpperCase();

  const runCode = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/execute-code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: exercise.language, code }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setResult({ stdout: "", stderr: err.error ?? "Execution failed", exitCode: 1 });
      } else {
        const data = (await res.json()) as { stdout: string; stderr: string; exitCode: number };
        setResult(data);
      }
    } catch {
      setResult({ stdout: "", stderr: "Could not reach execution service", exitCode: 1 });
    } finally {
      setRunning(false);
    }
  };

  const isCorrect =
    result !== null &&
    result.exitCode === 0 &&
    result.stdout.trim() === exercise.expectedOutput.trim();

  return (
    <div className="rounded-xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50/30 dark:bg-violet-950/20 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-violet-200 dark:border-violet-800 flex items-center justify-between">
        <span className="text-violet-700 dark:text-violet-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          {exercise.title}
        </span>
        <span className="text-xs font-mono bg-violet-200 dark:bg-violet-900 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded">
          {label}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground">{exercise.description}</p>

        {/* Code editor */}
        <div className="rounded-lg border border-violet-200 dark:border-violet-800 overflow-hidden bg-gray-950">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border-b border-gray-800">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-500 ml-1">{exercise.language}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setResult(null);
            }}
            spellCheck={false}
            rows={Math.max(6, code.split("\n").length + 1)}
            className="w-full bg-gray-950 text-gray-100 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
            style={{ tabSize: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const newCode = code.substring(0, start) + "  " + code.substring(end);
                setCode(newCode);
                requestAnimationFrame(() => {
                  e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                });
              }
            }}
          />
        </div>

        {/* Run button + expected output */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={runCode}
            disabled={running}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {running ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running…</>
            ) : (
              <>▶ Run Code</>
            )}
          </Button>
          {(exercise.hints ?? []).length > 0 && (
            <button
              onClick={() => {
                setShowHint(true);
                setHintIndex((i) => Math.min(i + 1, (exercise.hints ?? []).length - 1));
              }}
              className="text-sm text-violet-600 dark:text-violet-400 underline"
            >
              {showHint && hintIndex < (exercise.hints ?? []).length - 1 ? "Next hint" : "Hint"}
            </button>
          )}
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="text-sm text-muted-foreground underline"
          >
            {showSolution ? "Hide solution" : "Show solution"}
          </button>
        </div>

        {showHint && (exercise.hints ?? [])[hintIndex] && (
          <div className="flex items-start gap-2 text-sm bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-lg px-4 py-3 text-violet-800 dark:text-violet-300">
            <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{(exercise.hints ?? [])[hintIndex]}</span>
          </div>
        )}

        {/* Output panel */}
        {result !== null && (
          <div className={`rounded-lg border overflow-hidden ${
            isCorrect
              ? "border-green-400 dark:border-green-600"
              : "border-red-400 dark:border-red-600"
          }`}>
            <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
              isCorrect
                ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
            }`}>
              {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {isCorrect ? "Correct output!" : "Output doesn't match yet"}
            </div>
            {result.stdout && (
              <pre className="px-4 py-3 text-sm font-mono bg-gray-950 text-gray-100 overflow-x-auto whitespace-pre-wrap">
                {result.stdout}
              </pre>
            )}
            {result.stderr && (
              <pre className="px-4 py-3 text-sm font-mono bg-red-950/30 text-red-300 overflow-x-auto whitespace-pre-wrap">
                {result.stderr}
              </pre>
            )}
            {!isCorrect && (
              <div className="px-3 py-2 bg-gray-900 text-xs text-gray-400 flex items-center gap-2">
                <span className="text-gray-500">Expected:</span>
                <code className="text-gray-200">{exercise.expectedOutput}</code>
              </div>
            )}
          </div>
        )}

        {showSolution && (
          <div className="rounded-lg border border-violet-200 dark:border-violet-800 overflow-hidden bg-gray-950">
            <div className="px-3 py-1.5 bg-gray-900 text-xs text-gray-400 border-b border-gray-800">
              Solution
            </div>
            <pre className="px-4 py-3 text-sm font-mono text-gray-100 overflow-x-auto whitespace-pre-wrap">
              {exercise.solutionCode}
            </pre>
          </div>
        )}

        {isCorrect && (
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
            <Trophy className="h-4 w-4" /> Your output matches — great work!
          </div>
        )}
      </div>
    </div>
  );
}

function KeyTermsGlossary({ terms }: { terms: LessonKeyTerm[] }) {
  if (terms.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <BookMarked className="h-5 w-5 text-primary" /> Key Terms
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {terms.map((kt, i) => (
          <div
            key={i}
            className="rounded-lg border bg-muted/40 p-4 space-y-1"
          >
            <p className="font-semibold text-sm text-foreground">{kt.term}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {kt.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id || "0");
  const [, setLocation] = useLocation();

  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Map<number, AnswerState>>(new Map());
  const [done, setDone] = useState(false);

  const queryClient = useQueryClient();
  const startPractice = useStartLessonPractice();
  const regenerate = useRegenerateLesson({
    mutation: {
      onSuccess: (updated) => {
        queryClient.setQueryData(getGetLessonByIdQueryKey(lessonId), updated);
        setCurrentSection(0);
        setAnswers(new Map());
        setDone(false);
      },
    },
  });

  const { data: lesson, isLoading, error } = useGetLessonById(lessonId, {
    query: {
      enabled: !!lessonId,
      queryKey: getGetLessonByIdQueryKey(lessonId),
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-destructive font-medium">Lesson not found.</p>
        <Link href="/learn">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learn
          </Button>
        </Link>
      </div>
    );
  }

  const totalSections = lesson.sections.length;
  const section = lesson.sections[currentSection];
  const currentAnswer = answers.get(currentSection) ?? null;
  const isAnswered = currentAnswer?.revealed ?? false;
  const isLastSection = currentSection === totalSections - 1;
  const progress = done ? 100 : Math.round((currentSection / totalSections) * 100);

  const handleAnswer = (idx: number) => {
    const next = new Map(answers);
    next.set(currentSection, { selected: idx, revealed: true });
    setAnswers(next);
  };

  const handleNext = () => {
    if (isLastSection) {
      setDone(true);
    } else {
      setCurrentSection((n) => n + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const levelColors: Record<string, string> = {
    Beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };
  const levelClass = levelColors[lesson.level] ?? levelColors["Beginner"];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/learn">
            <Button variant="ghost" className="-ml-4 text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learn
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            disabled={regenerate.isPending}
            onClick={() => regenerate.mutate({ id: lessonId })}
            title="Regenerate this lesson with fresh interactive exercises"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${regenerate.isPending ? "animate-spin" : ""}`} />
            {regenerate.isPending ? "Regenerating…" : "Refresh Exercises"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${levelClass}`}>
            {lesson.level}
          </span>
          {lesson.subjectName && (
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              {lesson.subjectName}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          {lesson.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {lesson.summary}
        </p>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {done
                ? "All sections complete"
                : `Section ${currentSection + 1} of ${totalSections}`}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {!done && section ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {currentSection + 1}
              </span>
              <h2 className="text-2xl font-bold tracking-tight">
                {section.heading}
              </h2>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
            {section.content.split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-foreground">
                {para}
              </p>
            ))}
          </div>

          <Card className="border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-none">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Worked Example
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {section.example.split(/\n\n+/).map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-foreground/90 mb-2 last:mb-0 font-mono whitespace-pre-wrap"
                >
                  {para}
                </p>
              ))}
            </CardContent>
          </Card>

          {section.practicalTip && (
            <Card className="border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20 shadow-none">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Pro Tip
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {section.practicalTip}
                </p>
              </CardContent>
            </Card>
          )}

          {section.spreadsheetExercise && (
            <SpreadsheetExerciseBlock exercise={section.spreadsheetExercise} />
          )}

          {section.scenarioExercise && (
            <ScenarioExerciseBlock exercise={section.scenarioExercise} />
          )}

          {section.codeExercise && (
            <CodeExerciseBlock exercise={section.codeExercise} />
          )}

          <CheckQuestion
            question={section.checkQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />

          {isAnswered && (
            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg">
                {isLastSection ? (
                  <>
                    <Trophy className="mr-2 h-5 w-5" /> Finish Lesson
                  </>
                ) : (
                  <>
                    Next Section <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : done ? (
        <div className="space-y-10">
          <Card className="border-2 border-primary/30 bg-primary/5 text-center py-10 px-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Lesson Complete!</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  You worked through all {totalSections} sections of this
                  lesson. Now test what you learned with a practice quiz.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                <Button
                  size="lg"
                  disabled={startPractice.isPending}
                  onClick={() =>
                    startPractice.mutate(
                      { id: lessonId },
                      {
                        onSuccess: (quiz) =>
                          setLocation(`/quizzes/${quiz.id}`),
                      },
                    )
                  }
                >
                  {startPractice.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Building your quiz…</>
                  ) : (
                    <><BookOpen className="mr-2 h-5 w-5" /> Take a Practice Quiz</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setCurrentSection(0);
                    setAnswers(new Map());
                    setDone(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Review Lesson Again
                </Button>
              </div>
            </div>
          </Card>

          <KeyTermsGlossary terms={lesson.keyTerms} />

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Sections Covered
            </h3>
            <div className="space-y-2">
              {lesson.sections.map((sec, i) => {
                const a = answers.get(i);
                const got = a
                  ? a.selected === sec.checkQuestion.correctIndex
                  : false;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm py-2 border-b border-border/50 last:border-0"
                  >
                    {got ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={got ? "text-foreground" : "text-muted-foreground"}>
                      {sec.heading}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
