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
  DragDropExercise,
  MultiStepLabExercise,
  LabStep,
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

// Lightweight Excel formula evaluator
function evalFormula(
  formula: string,
  headers: string[],
  rows: string[][],
  taskOverrides: Record<string, string>,
): number | null {
  const cellMap: Record<string, number> = {};
  rows.forEach((row) => {
    const rowNum = row[0];
    headers.forEach((col, ci) => {
      if (ci > 0 && col) {
        const ref = `${col}${rowNum}`.toUpperCase();
        const raw = taskOverrides[ref] ?? row[ci];
        const n = parseFloat((raw ?? "").replace(/[$,]/g, ""));
        if (!isNaN(n)) cellMap[ref] = n;
      }
    });
  });

  const f = (formula.startsWith("=") ? formula.slice(1) : formula).toUpperCase().trim();

  const expandRange = (r: string): number[] => {
    const m = r.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!m) return [];
    const [, c1, r1, c2, r2] = m;
    const vals: number[] = [];
    if (c1 === c2) {
      for (let i = parseInt(r1); i <= parseInt(r2); i++) {
        const v = cellMap[`${c1}${i}`];
        if (v !== undefined) vals.push(v);
      }
    } else {
      // cross-column range — collect by row
      const startCol = c1.charCodeAt(0);
      const endCol = c2.charCodeAt(0);
      for (let row = parseInt(r1); row <= parseInt(r2); row++) {
        for (let col = startCol; col <= endCol; col++) {
          const v = cellMap[`${String.fromCharCode(col)}${row}`];
          if (v !== undefined) vals.push(v);
        }
      }
    }
    return vals;
  };

  try {
    let m: RegExpMatchArray | null;
    if ((m = f.match(/^SUM\(([A-Z]+\d+:[A-Z]+\d+)\)$/))) return expandRange(m[1]).reduce((a, b) => a + b, 0);
    if ((m = f.match(/^AVERAGE\(([A-Z]+\d+:[A-Z]+\d+)\)$/))) { const v = expandRange(m[1]); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
    if ((m = f.match(/^COUNT\(([A-Z]+\d+:[A-Z]+\d+)\)$/))) return expandRange(m[1]).length;
    if ((m = f.match(/^MAX\(([A-Z]+\d+:[A-Z]+\d+)\)$/))) { const v = expandRange(m[1]); return v.length ? Math.max(...v) : null; }
    if ((m = f.match(/^MIN\(([A-Z]+\d+:[A-Z]+\d+)\)$/))) { const v = expandRange(m[1]); return v.length ? Math.min(...v) : null; }
    if ((m = f.match(/^ROUND\((.+),\s*(\d+)\)$/))) {
      const inner = evalFormula("=" + m[1], headers, rows, taskOverrides);
      return inner !== null ? Math.round(inner * 10 ** parseInt(m[2])) / 10 ** parseInt(m[2]) : null;
    }
    // Simple arithmetic with cell refs
    const withVals = f.replace(/[A-Z]+\d+/g, (ref) => String(cellMap[ref] ?? 0));
    if (/^[\d\s+\-*/.()\s]+$/.test(withVals)) {
      // eslint-disable-next-line no-new-func
      return Function(`"use strict"; return (${withVals})`)() as number;
    }
  } catch { /* ignore */ }
  return null;
}

function SpreadsheetExerciseBlock({ exercise }: { exercise: SpreadsheetExercise }) {
  const [taskStates, setTaskStates] = useState<TaskState[]>(
    exercise.tasks.map(() => ({ value: "", checked: false, correct: null })),
  );
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const inputRefs = useState<Record<number, HTMLInputElement | null>>(() => ({}))[0];

  const allDone = taskStates.every((t) => t.checked);
  const allCorrect = taskStates.every((t) => t.correct);

  const normalize = (v: string) => {
    const n = parseFloat(v.replace(/[$,%]/g, "").trim());
    return isNaN(n) ? v.toLowerCase().trim() : Math.round(n * 100) / 100;
  };

  const handleCheck = (i: number) => {
    const task = exercise.tasks[i];
    const input = taskStates[i].value.trim();
    const expected = task.expectedValue.trim();
    let correct = normalize(input) === normalize(expected);
    if (!correct && input.startsWith("=")) {
      const overrides: Record<string, string> = {};
      exercise.tasks.forEach((t, ti) => {
        if (taskStates[ti].value && t.targetCell) overrides[t.targetCell.toUpperCase()] = taskStates[ti].value;
      });
      const result = evalFormula(input, exercise.headers, exercise.rows, overrides);
      if (result !== null) correct = normalize(String(result)) === normalize(expected);
    }
    setTaskStates((prev) => prev.map((t, idx) => idx === i ? { ...t, checked: true, correct } : t));
  };

  const handleReset = (i: number) => {
    setTaskStates((prev) => prev.map((t, idx) => idx === i ? { value: "", checked: false, correct: null } : t));
    setTimeout(() => inputRefs[i]?.focus(), 50);
  };

  const copyFormula = (formula: string, i: number) => {
    navigator.clipboard.writeText(formula).catch(() => {});
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const activeRef = activeTask !== null ? exercise.tasks[activeTask]?.targetCell ?? "" : "";
  const activeFormula = activeTask !== null ? (taskStates[activeTask].value || (exercise.tasks[activeTask]?.formulaHint ?? "")) : "";

  return (
    <div className="rounded-xl border-2 border-[#217346]/40 bg-white dark:bg-card overflow-hidden shadow-sm">
      {/* Excel-style app bar */}
      <div className="bg-[#217346] px-4 py-2 flex items-center gap-3">
        <svg className="h-5 w-5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
          <path d="M8 12.5h2.5l1.5 2.5 1.5-2.5H16l-2.5 4 2.5 4h-2.5L12 18l-1.5 2.5H8l2.5-4L8 12.5z" fill="white" opacity="0.9"/>
        </svg>
        <span className="text-white font-semibold text-sm tracking-wide">{exercise.title}</span>
        <span className="ml-auto text-white/70 text-xs">{exercise.tasks.filter((_, i) => taskStates[i].correct).length}/{exercise.tasks.length} tasks complete</span>
      </div>

      {/* Formula bar */}
      <div className="flex items-center border-b border-gray-300 dark:border-border bg-gray-50 dark:bg-muted/50 px-2 py-1 gap-2">
        <div className="w-14 border border-gray-300 dark:border-border rounded px-2 py-0.5 text-xs font-mono text-center bg-white dark:bg-card text-gray-700 dark:text-foreground flex-shrink-0">
          {activeRef || "—"}
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-border flex-shrink-0" />
        <span className="text-[#217346] dark:text-green-400 font-bold text-sm flex-shrink-0 select-none">fx</span>
        <div className="flex-1 border border-gray-300 dark:border-border rounded px-2 py-0.5 text-xs font-mono bg-white dark:bg-card text-gray-800 dark:text-foreground min-h-[22px]">
          {activeTask !== null ? (
            <span className={activeFormula.startsWith("=") ? "text-[#217346] dark:text-green-400" : ""}>
              {activeFormula || <span className="text-gray-400 italic">click a highlighted cell or type below</span>}
            </span>
          ) : (
            <span className="text-gray-400 italic text-xs">select a cell to begin</span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 bg-gray-50 dark:bg-background">
        <p className="text-sm text-muted-foreground">{exercise.description}</p>

        {/* Spreadsheet grid */}
        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-border bg-white dark:bg-card shadow-sm">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#d0e4c8] dark:bg-muted/80">
                {exercise.headers.map((h, ci) => (
                  <th key={ci} className={`border border-gray-300 dark:border-border px-2 py-1.5 font-bold text-center select-none
                    ${ci === 0 ? "w-10 bg-[#c4dbb8] dark:bg-muted text-gray-500 dark:text-muted-foreground text-[10px]" : "text-[#217346] dark:text-green-400 text-xs min-w-[90px]"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exercise.rows.map((row, ri) => {
                const rowNum = row[0];
                const isLabelRow = ri === 0;
                return (
                  <tr key={ri} className={isLabelRow ? "bg-[#e8f4e8] dark:bg-muted/40" : ri % 2 === 0 ? "bg-white dark:bg-background" : "bg-gray-50/60 dark:bg-muted/20"}>
                    {row.map((cell, ci) => {
                      if (ci === 0) {
                        return (
                          <td key={ci} className="border border-gray-300 dark:border-border px-2 py-1.5 text-center text-gray-400 dark:text-muted-foreground bg-[#e8f4e8] dark:bg-muted/40 font-medium text-[10px] select-none">
                            {cell}
                          </td>
                        );
                      }
                      const colLetter = exercise.headers[ci] ?? "";
                      const cellRef = `${colLetter}${rowNum}`;
                      const taskIdx = exercise.tasks.findIndex((t) => t.targetCell?.toUpperCase() === cellRef.toUpperCase());
                      const isEmpty = cell === "";
                      const isActive = taskIdx >= 0 && taskIdx === activeTask;

                      if (isEmpty && taskIdx >= 0) {
                        const ts = taskStates[taskIdx];
                        return (
                          <td key={ci} onClick={() => setActiveTask(taskIdx)}
                            className={`border px-0.5 py-0.5 cursor-pointer transition-colors
                              ${ts.correct === true ? "border-[#217346] bg-green-50 dark:bg-green-950/30" :
                                ts.correct === false ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                                isActive ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-inner" :
                                "border-blue-400 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30"}`}>
                            {ts.checked ? (
                              <div className={`px-1 py-0.5 text-center font-mono font-semibold ${ts.correct ? "text-[#217346] dark:text-green-400" : "text-red-600 dark:text-red-400 line-through"}`}>
                                {ts.value || "—"}
                                {ts.correct && <span className="ml-1 text-[10px]">✓</span>}
                              </div>
                            ) : (
                              <input
                                ref={(el) => { inputRefs[taskIdx] = el; }}
                                type="text"
                                value={ts.value}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTaskStates((prev) => prev.map((t, idx) => idx === taskIdx ? { ...t, value: val } : t));
                                }}
                                onFocus={() => setActiveTask(taskIdx)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && taskStates[taskIdx].value.trim()) { e.preventDefault(); handleCheck(taskIdx); }
                                  if (e.key === "Tab") {
                                    e.preventDefault();
                                    const next = exercise.tasks.findIndex((_, ti) => ti > taskIdx && !taskStates[ti].checked);
                                    if (next >= 0) { setActiveTask(next); setTimeout(() => inputRefs[next]?.focus(), 10); }
                                  }
                                }}
                                placeholder="type formula…"
                                className="w-full bg-transparent text-center outline-none placeholder-blue-300 font-mono text-xs py-0.5"
                              />
                            )}
                          </td>
                        );
                      }

                      return (
                        <td key={ci} className={`border border-gray-300 dark:border-border px-2 py-1.5 font-mono text-gray-700 dark:text-foreground
                          ${isLabelRow ? "font-bold text-gray-800 dark:text-foreground bg-[#e8f4e8] dark:bg-muted/40 font-sans" : ""}`}>
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

        {/* Step-by-step task panel */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Tasks — complete in order
          </p>
          {exercise.tasks.map((task, i) => {
            const ts = taskStates[i];
            const isActive = i === activeTask;
            const formula = task.formulaHint ?? "";
            return (
              <div key={i}
                className={`rounded-lg border transition-all cursor-pointer
                  ${ts.correct === true ? "border-[#217346] bg-green-50 dark:bg-green-950/30" :
                    ts.correct === false ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                    isActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-sm" :
                    "border-gray-200 dark:border-border bg-white dark:bg-card hover:border-gray-300"}`}
                onClick={() => { setActiveTask(i); setTimeout(() => inputRefs[i]?.focus(), 50); }}
              >
                <div className="flex items-start gap-3 p-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5
                    ${ts.correct === true ? "bg-[#217346] text-white" : ts.correct === false ? "bg-red-500 text-white" : isActive ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-muted text-gray-700 dark:text-foreground"}`}>
                    {ts.correct === true ? "✓" : ts.correct === false ? "✗" : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{task.instruction}</p>

                    {/* Formula guidance */}
                    {formula && !ts.checked && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-[#217346]/10 dark:bg-green-950/30 border border-[#217346]/30 dark:border-green-800 rounded px-2.5 py-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#217346] dark:text-green-400">Type in {task.targetCell}:</span>
                          <code className="text-xs font-mono font-bold text-[#217346] dark:text-green-300">{formula}</code>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyFormula(formula, i); }}
                            className="ml-1 text-[#217346]/70 hover:text-[#217346] dark:text-green-500 dark:hover:text-green-300 transition-colors"
                            title="Copy formula"
                          >
                            {copiedIdx === i ? (
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                            ) : (
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            )}
                          </button>
                        </div>
                        {!ts.checked && (
                          <div className="flex items-center gap-1.5">
                            <input
                              ref={(el) => { inputRefs[i] = el; }}
                              type="text"
                              value={ts.value}
                              onChange={(e) => setTaskStates((prev) => prev.map((t, idx) => idx === i ? { ...t, value: e.target.value } : t))}
                              onFocus={() => setActiveTask(i)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && ts.value.trim()) { e.preventDefault(); handleCheck(i); }
                                if (e.key === "Tab") {
                                  e.preventDefault();
                                  const next = exercise.tasks.findIndex((_, ti) => ti > i && !taskStates[ti].checked);
                                  if (next >= 0) { setActiveTask(next); setTimeout(() => inputRefs[next]?.focus(), 10); }
                                }
                              }}
                              placeholder={formula || "type formula or value…"}
                              className="border border-gray-300 dark:border-border rounded px-2 py-1 text-xs font-mono bg-white dark:bg-muted outline-none focus:ring-2 focus:ring-blue-400 w-36"
                            />
                            <Button size="sm" variant="outline" disabled={!ts.value.trim()} onClick={(e) => { e.stopPropagation(); handleCheck(i); }}
                              className="text-xs h-7 px-2.5">
                              ↵ Check
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Result feedback */}
                    {ts.checked && (
                      <div className="mt-2 space-y-1">
                        <div className={`flex items-center gap-2 text-sm font-semibold ${ts.correct ? "text-[#217346] dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {ts.correct ? <><CheckCircle2 className="h-4 w-4" /> Correct! Cell {task.targetCell} = {task.expectedValue}</> : <><XCircle className="h-4 w-4" /> Expected {task.expectedValue} — formula: <code className="font-mono text-xs">{formula}</code></>}
                        </div>
                        {!ts.correct && (
                          <button onClick={(e) => { e.stopPropagation(); handleReset(i); }} className="text-xs text-blue-600 dark:text-blue-400 underline">
                            Try again
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allDone && allCorrect && (
          <div className="flex items-center gap-2 bg-[#217346]/10 border border-[#217346]/30 rounded-lg px-4 py-3">
            <Trophy className="h-5 w-5 text-[#217346] dark:text-green-400" />
            <div>
              <p className="font-semibold text-sm text-[#217346] dark:text-green-400">All formulas correct!</p>
              <p className="text-xs text-muted-foreground">You can now apply these formulas in a real spreadsheet.</p>
            </div>
          </div>
        )}
        {allDone && !allCorrect && (
          <div className="text-sm text-muted-foreground">
            {taskStates.filter((t) => t.correct).length}/{exercise.tasks.length} correct.{" "}
            <button onClick={() => setTaskStates(exercise.tasks.map(() => ({ value: "", checked: false, correct: null })))} className="text-blue-600 dark:text-blue-400 underline">Reset all</button>
          </div>
        )}
      </div>
    </div>
  );
}

function detectScenarioEnv(role: string): {
  icon: string; label: string; bg: string; border: string; headerBg: string; text: string; badge: string;
} {
  const r = role.toLowerCase();
  if (/nurse|doctor|physician|ER|hospital|patient|clinical|medic|surgeon|therapist|pharmacy|pharm/i.test(r))
    return { icon: "🏥", label: "Clinical Environment", bg: "bg-blue-50/60 dark:bg-blue-950/20", border: "border-blue-300 dark:border-blue-700", headerBg: "bg-blue-600", text: "text-blue-900 dark:text-blue-100", badge: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" };
  if (/lab|chemist|chemistry|biology|experiment|biolog|physics|scientist|specimen|reagent/i.test(r))
    return { icon: "🧪", label: "Science Laboratory", bg: "bg-emerald-50/60 dark:bg-emerald-950/20", border: "border-emerald-300 dark:border-emerald-700", headerBg: "bg-emerald-700", text: "text-emerald-900 dark:text-emerald-100", badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200" };
  if (/attorney|lawyer|judge|court|legal|paralegal|counsel|contract|litigation/i.test(r))
    return { icon: "⚖️", label: "Legal Environment", bg: "bg-amber-50/60 dark:bg-amber-950/20", border: "border-amber-400 dark:border-amber-700", headerBg: "bg-amber-800", text: "text-amber-900 dark:text-amber-100", badge: "bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200" };
  if (/engineer|developer|programmer|IT|network|cyber|sysadmin|tech|devops|security|software/i.test(r))
    return { icon: "💻", label: "Technical Environment", bg: "bg-gray-900/90 dark:bg-gray-950", border: "border-gray-600 dark:border-gray-600", headerBg: "bg-gray-800", text: "text-green-400", badge: "bg-gray-700 text-green-300" };
  if (/teacher|professor|instructor|tutor|educator|classroom|curriculum/i.test(r))
    return { icon: "📚", label: "Educational Setting", bg: "bg-teal-50/60 dark:bg-teal-950/20", border: "border-teal-300 dark:border-teal-700", headerBg: "bg-teal-700", text: "text-teal-900 dark:text-teal-100", badge: "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200" };
  if (/field|outdoor|environ|geolog|archaeolog|forest|soil|ecolog|wildlife/i.test(r))
    return { icon: "🔬", label: "Field Research", bg: "bg-lime-50/60 dark:bg-lime-950/20", border: "border-lime-400 dark:border-lime-700", headerBg: "bg-lime-700", text: "text-lime-900 dark:text-lime-100", badge: "bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200" };
  if (/mechanic|electrician|plumber|carpenter|welder|technician|construct|trade|workshop/i.test(r))
    return { icon: "🔧", label: "Workshop / Trades", bg: "bg-orange-50/60 dark:bg-orange-950/20", border: "border-orange-400 dark:border-orange-700", headerBg: "bg-orange-700", text: "text-orange-900 dark:text-orange-100", badge: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200" };
  // Default: professional office
  return { icon: "💼", label: "Professional Setting", bg: "bg-amber-50/40 dark:bg-amber-950/20", border: "border-amber-300 dark:border-amber-700", headerBg: "bg-amber-700", text: "text-amber-900 dark:text-amber-100", badge: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200" };
}

function ScenarioExerciseBlock({ exercise }: { exercise: ScenarioExercise }) {
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  const optimalIdx = exercise.choices.findIndex((c) => c.isOptimal);
  const env = detectScenarioEnv(exercise.role ?? "");

  return (
    <div className={`rounded-xl border-2 ${env.border} ${env.bg} overflow-hidden`}>
      {/* Immersive environment header */}
      <div className={`${env.headerBg} px-5 py-3`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg leading-none">{env.icon}</span>
            {env.label}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${env.badge}`}>
            On-the-Job Scenario
          </span>
        </div>
      </div>

      {/* Role + situation briefing */}
      <div className="px-5 pt-4 pb-1 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider opacity-60">{exercise.title}</p>
        <div className={`rounded-lg border ${env.border} px-4 py-3 space-y-1.5`}>
          <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${env.text} opacity-70`}>
            🎯 Your role
          </p>
          <p className={`text-sm font-semibold leading-snug ${env.text}`}>{exercise.role}</p>
          <hr className="border-current opacity-10 my-1" />
          <p className={`text-sm leading-relaxed ${env.text} opacity-90`}>{exercise.situation}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
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

// ─── Drag-and-Drop Exercise ───────────────────────────────────────────────────

function DragDropExerciseBlock({ exercise }: { exercise: DragDropExercise }) {
  const [order, setOrder] = useState<string[]>(() =>
    [...exercise.items].sort(() => Math.random() - 0.5).map((it) => it.id),
  );
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [buckets, setBuckets] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const itemsById = Object.fromEntries(exercise.items.map((it) => [it.id, it]));
  const targets = exercise.targets ?? [];

  function handleCheck() {
    let correct = 0;
    if (exercise.variant === "order") {
      order.forEach((id, idx) => {
        const it = itemsById[id];
        if (it.correctPosition === idx) correct++;
      });
    } else if (exercise.variant === "match") {
      exercise.items.forEach((it) => {
        if (matches[it.id] === it.match) correct++;
      });
    } else {
      exercise.items.forEach((it) => {
        const bucket = Object.entries(buckets).find(([, ids]) => ids.includes(it.id))?.[0];
        if (bucket === it.category) correct++;
      });
    }
    setScore(correct);
    setChecked(true);
  }

  function handleReset() {
    setOrder([...exercise.items].sort(() => Math.random() - 0.5).map((it) => it.id));
    setMatches({});
    setBuckets({});
    setSelected(null);
    setChecked(false);
    setScore(0);
  }

  const total = exercise.items.length;
  const allDone =
    exercise.variant === "order"
      ? true
      : exercise.variant === "match"
        ? Object.keys(matches).length === total
        : exercise.items.every((it) =>
            Object.values(buckets).some((ids) => ids.includes(it.id)),
          );

  return (
    <div className="rounded-2xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/20 overflow-hidden">
      <div className="flex items-center gap-2 bg-purple-100/70 dark:bg-purple-900/40 px-5 py-3 border-b border-purple-200 dark:border-purple-700">
        <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="4" rx="1" />
          <rect x="3" y="10" width="18" height="4" rx="1" />
          <rect x="3" y="17" width="18" height="4" rx="1" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
          Interactive Lab — {exercise.variant === "order" ? "Sequence" : exercise.variant === "match" ? "Match" : "Categorize"}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="font-semibold text-sm text-purple-800 dark:text-purple-300">{exercise.title}</p>
          {exercise.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{exercise.description}</p>
          )}
        </div>

        {/* ORDER variant */}
        {exercise.variant === "order" && (
          <div className="space-y-2">
            {order.map((id, idx) => {
              const it = itemsById[id];
              const isCorrect = checked && it.correctPosition === idx;
              const isWrong = checked && it.correctPosition !== idx;
              return (
                <div key={id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer select-none transition-all
                    ${selected === id ? "border-purple-500 bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-400" : "border-border bg-background hover:border-purple-300"}
                    ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/30" : ""}
                    ${isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" : ""}`}
                  onClick={() => {
                    if (checked) return;
                    if (selected && selected !== id) {
                      const a = order.indexOf(selected);
                      const b = order.indexOf(id);
                      const next = [...order];
                      [next[a], next[b]] = [next[b], next[a]];
                      setOrder(next);
                      setSelected(null);
                    } else {
                      setSelected(selected === id ? null : id);
                    }
                  }}
                >
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                    ${isCorrect ? "bg-green-500 text-white" : isWrong ? "bg-red-400 text-white" : "bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200"}`}>
                    {idx + 1}
                  </span>
                  <span className="text-sm leading-snug">{it.label}</span>
                  {checked && isWrong && (
                    <span className="ml-auto text-xs text-muted-foreground">→ pos {(it.correctPosition ?? 0) + 1}</span>
                  )}
                </div>
              );
            })}
            {!checked && (
              <p className="text-xs text-muted-foreground mt-1">Click an item to select it, then click another to swap their positions.</p>
            )}
          </div>
        )}

        {/* MATCH variant */}
        {exercise.variant === "match" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terms</p>
                {exercise.items.map((it) => {
                  const isMatched = !!matches[it.id];
                  const isCorrect = checked && matches[it.id] === it.match;
                  const isWrong = checked && matches[it.id] && matches[it.id] !== it.match;
                  return (
                    <div key={it.id}
                      className={`rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-all select-none
                        ${selected === it.id ? "border-purple-500 bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-400" : isMatched ? "border-purple-300 bg-purple-50 dark:bg-purple-950/30" : "border-border hover:border-purple-300"}
                        ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/30" : ""}
                        ${isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" : ""}`}
                      onClick={() => {
                        if (checked) return;
                        setSelected(selected === it.id ? null : it.id);
                      }}
                    >
                      <span className="font-medium">{it.label}</span>
                      {isMatched && !checked && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{matches[it.id]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Definitions</p>
                {targets.map((target) => {
                  const assignedId = Object.entries(matches).find(([, v]) => v === target)?.[0];
                  const isSelected = selected && !matches[selected];
                  const isCorrect = checked && assignedId && itemsById[assignedId]?.match === target;
                  const isWrong = checked && assignedId && itemsById[assignedId]?.match !== target;
                  return (
                    <div key={target}
                      className={`rounded-lg border px-3 py-2.5 text-sm transition-all select-none
                        ${isSelected && !assignedId ? "cursor-pointer hover:border-purple-400 border-dashed border-purple-300" : ""}
                        ${assignedId ? "border-purple-300 bg-purple-50/60 dark:bg-purple-950/20" : "border-border"}
                        ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/30" : ""}
                        ${isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" : ""}`}
                      onClick={() => {
                        if (checked || !selected) return;
                        const prev = Object.entries(matches).find(([, v]) => v === target)?.[0];
                        if (prev) {
                          const m = { ...matches };
                          delete m[prev];
                          if (selected !== prev) m[selected] = target;
                          setMatches(m);
                        } else if (!matches[selected]) {
                          setMatches({ ...matches, [selected]: target });
                        }
                        setSelected(null);
                      }}
                    >
                      <span className="leading-snug">{target}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Click a term, then click its matching definition.</p>
          </div>
        )}

        {/* CATEGORIZE variant */}
        {exercise.variant === "categorize" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <p className="w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items — click to select</p>
              {exercise.items.filter((it) => !Object.values(buckets).flat().includes(it.id)).map((it) => (
                <button key={it.id}
                  className={`rounded-lg border px-3 py-2 text-sm transition-all
                    ${selected === it.id ? "border-purple-500 bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-400" : "border-border hover:border-purple-300 bg-background"}`}
                  onClick={() => setSelected(selected === it.id ? null : it.id)}
                  disabled={checked}
                >
                  {it.label}
                </button>
              ))}
              {exercise.items.every((it) => Object.values(buckets).flat().includes(it.id)) && !checked && (
                <p className="text-xs text-muted-foreground w-full">All items placed.</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {targets.map((cat) => {
                const inBucket = (buckets[cat] ?? []);
                return (
                  <div key={cat}
                    className={`rounded-xl border-2 border-dashed px-4 py-3 min-h-[80px] transition-all
                      ${selected ? "cursor-pointer border-purple-400 bg-purple-50/40 dark:bg-purple-950/10" : "border-border"}`}
                    onClick={() => {
                      if (!selected || checked) return;
                      const prev = Object.entries(buckets).find(([, ids]) => ids.includes(selected))?.[0];
                      const newBuckets = { ...buckets };
                      if (prev) newBuckets[prev] = newBuckets[prev].filter((id) => id !== selected);
                      newBuckets[cat] = [...(newBuckets[cat] ?? []), selected];
                      setBuckets(newBuckets);
                      setSelected(null);
                    }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {inBucket.map((id) => {
                        const it = itemsById[id];
                        const isCorrect = checked && it.category === cat;
                        const isWrong = checked && it.category !== cat;
                        return (
                          <span key={id}
                            className={`rounded-md px-2 py-1 text-xs font-medium border cursor-pointer
                              ${isCorrect ? "bg-green-100 border-green-400 text-green-800" : isWrong ? "bg-red-100 border-red-400 text-red-800" : "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/40 dark:border-purple-600 dark:text-purple-200"}`}
                            onClick={(e) => {
                              if (checked) return;
                              e.stopPropagation();
                              const newBuckets = { ...buckets };
                              newBuckets[cat] = newBuckets[cat].filter((bid) => bid !== id);
                              setBuckets(newBuckets);
                            }}
                          >
                            {it.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Click an item to select it, then click a category bucket to place it.</p>
          </div>
        )}

        {/* Result banner */}
        {checked && (
          <div className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-4
            ${score === total ? "border-green-400 bg-green-50 dark:bg-green-950/30" : score >= total * 0.6 ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30" : "border-red-400 bg-red-50 dark:bg-red-950/30"}`}>
            <p className="font-semibold text-sm">
              {score === total ? "🎉 Perfect! All correct." : `${score} / ${total} correct — try again!`}
            </p>
            <button onClick={handleReset} className="text-xs underline text-muted-foreground hover:text-foreground">Reset</button>
          </div>
        )}

        {!checked && (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              disabled={exercise.variant !== "order" && !allDone}
              onClick={handleCheck}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Check My Answers
            </Button>
            {exercise.variant !== "order" && !allDone && (
              <span className="text-xs text-muted-foreground">Place all items first</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type CodeRunState = { stdout: string; stderr: string; exitCode: number } | null;

// ─── Multi-Step Lab Simulation ────────────────────────────────────────────────

const LAB_ENV_CONFIG: Record<string, {
  icon: string; label: string; bg: string; border: string; headerBg: string;
  stepBg: string; stepBorder: string; contextBg: string; accentText: string;
}> = {
  lab:       { icon: "🧪", label: "Science Laboratory",    bg: "bg-emerald-50/60 dark:bg-emerald-950/20",  border: "border-emerald-300 dark:border-emerald-700", headerBg: "bg-emerald-700",  stepBg: "bg-emerald-50 dark:bg-emerald-950/40",  stepBorder: "border-emerald-200 dark:border-emerald-800", contextBg: "bg-emerald-100/70 dark:bg-emerald-900/30", accentText: "text-emerald-800 dark:text-emerald-300" },
  clinic:    { icon: "🏥", label: "Clinical Environment",  bg: "bg-blue-50/60 dark:bg-blue-950/20",        border: "border-blue-300 dark:border-blue-700",     headerBg: "bg-blue-700",     stepBg: "bg-blue-50 dark:bg-blue-950/40",        stepBorder: "border-blue-200 dark:border-blue-800",     contextBg: "bg-blue-100/70 dark:bg-blue-900/30",    accentText: "text-blue-800 dark:text-blue-300" },
  office:    { icon: "💼", label: "Professional Setting",  bg: "bg-slate-50/60 dark:bg-slate-950/20",      border: "border-slate-300 dark:border-slate-700",   headerBg: "bg-slate-700",    stepBg: "bg-slate-50 dark:bg-slate-950/40",      stepBorder: "border-slate-200 dark:border-slate-800",   contextBg: "bg-slate-100/70 dark:bg-slate-900/30",  accentText: "text-slate-700 dark:text-slate-300" },
  courtroom: { icon: "⚖️", label: "Legal Proceedings",    bg: "bg-amber-50/60 dark:bg-amber-950/20",      border: "border-amber-400 dark:border-amber-700",   headerBg: "bg-amber-900",    stepBg: "bg-amber-50 dark:bg-amber-950/40",      stepBorder: "border-amber-200 dark:border-amber-800",   contextBg: "bg-amber-100/70 dark:bg-amber-900/30",  accentText: "text-amber-900 dark:text-amber-300" },
  terminal:  { icon: "💻", label: "Technical Lab",         bg: "bg-gray-950",                              border: "border-gray-600",                          headerBg: "bg-gray-900",     stepBg: "bg-gray-900",                           stepBorder: "border-gray-700",                          contextBg: "bg-black/60",                           accentText: "text-green-400" },
  classroom: { icon: "📚", label: "Educational Setting",  bg: "bg-teal-50/60 dark:bg-teal-950/20",        border: "border-teal-300 dark:border-teal-700",     headerBg: "bg-teal-700",     stepBg: "bg-teal-50 dark:bg-teal-950/40",        stepBorder: "border-teal-200 dark:border-teal-800",     contextBg: "bg-teal-100/70 dark:bg-teal-900/30",    accentText: "text-teal-800 dark:text-teal-300" },
  field:     { icon: "🔬", label: "Field Research",        bg: "bg-lime-50/60 dark:bg-lime-950/20",        border: "border-lime-400 dark:border-lime-700",     headerBg: "bg-lime-800",     stepBg: "bg-lime-50 dark:bg-lime-950/40",        stepBorder: "border-lime-200 dark:border-lime-800",     contextBg: "bg-lime-100/70 dark:bg-lime-900/30",    accentText: "text-lime-800 dark:text-lime-300" },
  workshop:  { icon: "🔧", label: "Workshop / Trades",     bg: "bg-orange-50/60 dark:bg-orange-950/20",    border: "border-orange-400 dark:border-orange-700", headerBg: "bg-orange-800",   stepBg: "bg-orange-50 dark:bg-orange-950/40",    stepBorder: "border-orange-200 dark:border-orange-800", contextBg: "bg-orange-100/70 dark:bg-orange-900/30", accentText: "text-orange-800 dark:text-orange-300" },
};

function MultiStepLabExerciseBlock({ exercise }: { exercise: MultiStepLabExercise }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [stepResults, setStepResults] = useState<Array<{ chosen: number; correct: boolean }>>([]);
  const [chosenThisStep, setChosenThisStep] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const cfg = LAB_ENV_CONFIG[exercise.environmentType] ?? LAB_ENV_CONFIG.office;
  const steps = exercise.steps as LabStep[];
  const totalSteps = steps.length;
  const isTerminal = exercise.environmentType === "terminal";

  const currentStep = steps[stepIdx];
  const isDone = stepResults.length === totalSteps;
  const correctCount = stepResults.filter((r) => r.correct).length;

  const handleChoose = (idx: number) => {
    if (confirmed) return;
    setChosenThisStep(idx);
  };

  const handleConfirm = () => {
    if (chosenThisStep === null || confirmed) return;
    const isCorrect = currentStep.choices[chosenThisStep]?.isCorrect === true;
    setStepResults((prev) => [...prev, { chosen: chosenThisStep, correct: isCorrect }]);
    setConfirmed(true);
  };

  const handleNext = () => {
    setStepIdx((i) => i + 1);
    setChosenThisStep(null);
    setConfirmed(false);
  };

  const handleReset = () => {
    setStepIdx(0);
    setStepResults([]);
    setChosenThisStep(null);
    setConfirmed(false);
  };

  const progressPct = isDone ? 100 : Math.round((stepIdx / totalSteps) * 100);

  const textColor = isTerminal ? "text-green-400" : "text-foreground";
  const mutedText = isTerminal ? "text-green-600" : "text-muted-foreground";

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden`}>
      {/* Environment header */}
      <div className={`${cfg.headerBg} px-5 py-3`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg leading-none">{cfg.icon}</span>
            {cfg.label} — Simulation
          </span>
          <span className="text-white/80 text-xs font-medium">
            Step {Math.min(stepIdx + 1, totalSteps)} of {totalSteps}
          </span>
        </div>
        {/* Info bar */}
        {exercise.environmentContext && (
          <p className={`text-xs mt-1.5 font-mono ${isTerminal ? "text-green-300" : "text-white/70"}`}>
            {isTerminal ? `$ ` : ""}{exercise.environmentContext}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-black/10 dark:bg-white/10">
        <div
          className={`h-full transition-all duration-500 ${isDone ? "bg-green-400" : isTerminal ? "bg-green-500" : "bg-white/60"}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-5 space-y-4">
        {/* Title + description */}
        <div>
          <p className={`font-bold text-sm ${cfg.accentText}`}>{exercise.title}</p>
          {exercise.description && (
            <p className={`text-xs mt-0.5 ${mutedText}`}>{exercise.description}</p>
          )}
        </div>

        {/* Step breadcrumb dots */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {steps.map((_, i) => {
            const res = stepResults[i];
            const isCurrent = i === stepIdx && !isDone;
            return (
              <span key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${
                res
                  ? res.correct ? "bg-green-400 scale-110" : "bg-red-400 scale-110"
                  : isCurrent
                    ? isTerminal ? "bg-green-400 ring-2 ring-green-600" : "bg-white ring-2 ring-current ring-offset-1 ring-offset-transparent scale-110"
                    : "bg-black/20 dark:bg-white/20"
              }`} />
            );
          })}
        </div>

        {!isDone && currentStep && (
          <>
            {/* Current step context */}
            {currentStep.context && (
              <div className={`rounded-lg ${cfg.contextBg} border ${cfg.stepBorder} px-4 py-3`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${cfg.accentText}`}>
                  {isTerminal ? "▶ OUTPUT" : "📋 Situation Update"}
                </p>
                <p className={`text-sm leading-relaxed ${isTerminal ? "font-mono text-green-300" : textColor}`}>
                  {currentStep.context}
                </p>
              </div>
            )}

            {/* Task question */}
            <p className={`font-semibold text-sm leading-snug ${textColor}`}>
              {currentStep.task}
            </p>

            {/* Choices */}
            <div className="space-y-2">
              {currentStep.choices.map((choice, i) => {
                const isChosen = chosenThisStep === i;
                const isCorrect = choice.isCorrect === true;
                const showFeedback = confirmed && isChosen;
                const showCorrectMark = confirmed && !isChosen && isCorrect;

                let border = `${cfg.stepBorder}`;
                let bg = `${cfg.stepBg} hover:opacity-90`;
                if (confirmed) {
                  if (isChosen && isCorrect) { border = "border-green-400 dark:border-green-500"; bg = "bg-green-50 dark:bg-green-950/40"; }
                  else if (isChosen && !isCorrect) { border = "border-red-400 dark:border-red-500"; bg = "bg-red-50 dark:bg-red-950/40"; }
                  else if (showCorrectMark) { border = "border-green-400/60 dark:border-green-600"; bg = "bg-green-50/60 dark:bg-green-950/20"; }
                } else if (isChosen) {
                  border = `${cfg.border}`;
                  bg = isTerminal ? "bg-green-950/50" : "bg-white dark:bg-card shadow-sm";
                }

                return (
                  <div key={i} className={`rounded-lg border-2 ${border} ${bg} overflow-hidden transition-all`}>
                    <button
                      disabled={confirmed}
                      onClick={() => handleChoose(i)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 disabled:cursor-default`}
                    >
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
                        confirmed
                          ? isCorrect ? "bg-green-500 text-white" : "bg-gray-300 dark:bg-muted text-muted-foreground"
                          : isChosen ? "bg-current text-white" : "bg-black/15 dark:bg-white/15 text-foreground"
                      }`} style={confirmed ? undefined : isChosen ? { backgroundColor: cfg.headerBg.replace("bg-", "") } : undefined}>
                        {confirmed && isCorrect ? "✓" : confirmed && isChosen && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
                      </span>
                      <span className={`text-sm leading-relaxed ${isTerminal ? "font-mono text-green-300" : textColor}`}>
                        {choice.label}
                      </span>
                    </button>
                    {(showFeedback || showCorrectMark) && choice.feedback && (
                      <div className={`px-4 pb-3 pt-1 text-xs leading-relaxed border-t ${
                        isCorrect ? "border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" : "border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                      }`}>
                        {showCorrectMark ? "✓ " : showFeedback && !isCorrect ? "✗ " : ""}{choice.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Outcome feedback + action */}
            {confirmed ? (
              <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${
                stepResults[stepResults.length - 1]?.correct
                  ? "bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300"
              }`}>
                {stepResults[stepResults.length - 1]?.correct
                  ? currentStep.correctFeedback ?? "✓ Correct — well done!"
                  : currentStep.incorrectFeedback ?? "Not quite — review the feedback above."}
              </div>
            ) : (
              <button
                disabled={chosenThisStep === null}
                onClick={handleConfirm}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
                  chosenThisStep === null
                    ? "border-gray-200 dark:border-border text-muted-foreground cursor-not-allowed"
                    : `${cfg.border} text-white`
                }`}
                style={chosenThisStep !== null ? { backgroundColor: cfg.headerBg.replace("bg-", ""), background: undefined } : undefined}
              >
                Confirm Answer
              </button>
            )}

            {confirmed && stepIdx < totalSteps - 1 && (
              <button
                onClick={handleNext}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Next Step →
              </button>
            )}
            {confirmed && stepIdx === totalSteps - 1 && (
              <button
                onClick={handleNext}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Complete Simulation
              </button>
            )}
          </>
        )}

        {/* Completion screen */}
        {isDone && (
          <div className="text-center space-y-4 py-4">
            <div className={`text-5xl ${correctCount === totalSteps ? "animate-bounce" : ""}`}>
              {correctCount === totalSteps ? "🏆" : correctCount >= Math.ceil(totalSteps / 2) ? "✅" : "📖"}
            </div>
            <div>
              <p className={`text-xl font-bold ${correctCount === totalSteps ? "text-green-600 dark:text-green-400" : textColor}`}>
                {correctCount === totalSteps
                  ? "Perfect simulation run!"
                  : correctCount >= Math.ceil(totalSteps / 2)
                    ? "Good work — keep practicing!"
                    : "Review the steps and try again"}
              </p>
              <p className={`text-sm mt-1 ${mutedText}`}>
                {correctCount} of {totalSteps} steps correct
              </p>
            </div>
            {/* Step-by-step review */}
            <div className="text-left space-y-2 mt-2">
              {steps.map((step, i) => {
                const res = stepResults[i];
                return (
                  <div key={i} className={`rounded-lg border px-3 py-2.5 flex items-start gap-2.5 text-sm ${
                    res?.correct
                      ? "border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-950/20"
                      : "border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/20"
                  }`}>
                    <span className={`flex-shrink-0 font-bold text-xs mt-0.5 ${res?.correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {res?.correct ? "✓" : "✗"} {i + 1}
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-medium text-xs text-foreground">{step.task}</p>
                      {res && !res.correct && (
                        <p className="text-xs text-muted-foreground">
                          Correct: {step.choices.find((c) => c.isCorrect)?.label}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleReset}
              className={`mt-2 px-6 py-2 rounded-lg text-sm font-semibold text-white ${
                correctCount === totalSteps ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
              } transition-colors`}
            >
              {correctCount === totalSteps ? "Run Again" : "Try Again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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

  // Auto-detect old lessons that have no exercises in any section
  const hasNoExercises =
    lesson &&
    !regenerate.isPending &&
    lesson.sections.every(
      (s) => !s.spreadsheetExercise && !s.scenarioExercise && !s.codeExercise && !s.dragDropExercise && !s.labExercise,
    );

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

        {hasNoExercises && (
          <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                This lesson was saved before interactive labs were added.
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Refresh it to get drag-and-drop labs, scenarios, and hands-on exercises.
              </p>
            </div>
            <Button
              size="sm"
              disabled={regenerate.isPending}
              onClick={() => regenerate.mutate({ id: lessonId })}
              className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${regenerate.isPending ? "animate-spin" : ""}`} />
              {regenerate.isPending ? "Upgrading…" : "Add Exercises"}
            </Button>
          </div>
        )}

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

          {section.dragDropExercise && (
            <DragDropExerciseBlock exercise={section.dragDropExercise} />
          )}

          {section.labExercise && (
            <MultiStepLabExerciseBlock exercise={section.labExercise} />
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
