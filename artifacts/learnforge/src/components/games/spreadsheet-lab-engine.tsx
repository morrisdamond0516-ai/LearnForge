import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDot,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import { useLabModuleFlow } from "@/components/games/lab-module-flow-context";
import type { SpreadsheetWorkspaceContent } from "@/lib/educational-games/skill-game-types";

const COLS = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function colLetter(idx: number): string {
  return String.fromCharCode(65 + idx);
}

function parseRef(ref: string): { col: number; row: number } | null {
  const m = /^([A-Z]+)(\d+)$/.exec(ref.toUpperCase());
  if (!m) return null;
  const col = m[1]!.split("").reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) - 1;
  const row = parseInt(m[2]!, 10) - 1;
  return { col, row };
}

function toNumber(v: string): number | null {
  const n = parseFloat(v.replace(/[$,%]/g, "").trim());
  return isNaN(n) ? null : Math.round(n * 1e6) / 1e6;
}

function evalFormula(
  formula: string,
  cells: string[][],
  overrides: Record<string, string>,
): string | null {
  const f = formula.trim().toUpperCase();
  if (!f.startsWith("=")) return null;

  const getVal = (ref: string): number | null => {
    const r = ref.toUpperCase();
    if (r in overrides) return toNumber(overrides[r] ?? "");
    const pos = parseRef(r);
    if (!pos) return null;
    const row = cells[pos.row];
    if (!row) return null;
    return toNumber(row[pos.col + 1] ?? "");
  };

  const rangeVals = (start: string, end: string): number[] => {
    const s = parseRef(start);
    const e = parseRef(end);
    if (!s || !e) return [];
    const vals: number[] = [];
    for (let r = s.row; r <= e.row; r++) {
      for (let c = s.col; c <= e.col; c++) {
        const ref = colLetter(c) + (r + 1);
        const v = getVal(ref);
        if (v !== null) vals.push(v);
      }
    }
    return vals;
  };

  const expr = f.slice(1);

  const sumM = /^SUM\(([A-Z]+\d+):([A-Z]+\d+)\)$/.exec(expr);
  if (sumM) {
    const vals = rangeVals(sumM[1]!, sumM[2]!);
    return vals.length ? String(vals.reduce((a, b) => a + b, 0)) : null;
  }
  const avgM = /^AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)$/.exec(expr);
  if (avgM) {
    const vals = rangeVals(avgM[1]!, avgM[2]!);
    return vals.length ? String(Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 1e4) / 1e4) : null;
  }
  const countM = /^COUNT\(([A-Z]+\d+):([A-Z]+\d+)\)$/.exec(expr);
  if (countM) {
    return String(rangeVals(countM[1]!, countM[2]!).length);
  }
  const maxM = /^MAX\(([A-Z]+\d+):([A-Z]+\d+)\)$/.exec(expr);
  if (maxM) {
    const vals = rangeVals(maxM[1]!, maxM[2]!);
    return vals.length ? String(Math.max(...vals)) : null;
  }
  const minM = /^MIN\(([A-Z]+\d+):([A-Z]+\d+)\)$/.exec(expr);
  if (minM) {
    const vals = rangeVals(minM[1]!, minM[2]!);
    return vals.length ? String(Math.min(...vals)) : null;
  }

  // simple arithmetic: =A1+B1, =A1*B2, =A1-B1, =A1/B1
  const arithM = /^([A-Z]+\d+)\s*([+\-*/])\s*([A-Z]+\d+)$/.exec(expr);
  if (arithM) {
    const a = getVal(arithM[1]!);
    const b = getVal(arithM[3]!);
    if (a === null || b === null) return null;
    switch (arithM[2]) {
      case "+": return String(Math.round((a + b) * 1e6) / 1e6);
      case "-": return String(Math.round((a - b) * 1e6) / 1e6);
      case "*": return String(Math.round(a * b * 1e6) / 1e6);
      case "/": return b !== 0 ? String(Math.round((a / b) * 1e6) / 1e6) : "#DIV/0!";
    }
  }
  // =A1*0.15 etc
  const mulConst = /^([A-Z]+\d+)\s*([*/])\s*([\d.]+)$/.exec(expr);
  if (mulConst) {
    const a = getVal(mulConst[1]!);
    const n = parseFloat(mulConst[3]!);
    if (a === null || isNaN(n)) return null;
    return String(mulConst[2] === "*" ? Math.round(a * n * 1e6) / 1e6 : Math.round((a / n) * 1e6) / 1e6);
  }
  // =A1 (reference)
  const refOnly = /^([A-Z]+\d+)$/.exec(expr);
  if (refOnly) {
    const v = getVal(refOnly[1]!);
    return v !== null ? String(v) : null;
  }

  return null;
}

function normalizeAnswer(v: string): string {
  return v.replace(/[$,%\s]/g, "").toLowerCase().trim();
}

function answersMatch(input: string, expected: string): boolean {
  if (normalizeAnswer(input) === normalizeAnswer(expected)) return true;
  const ni = toNumber(input);
  const ne = toNumber(expected);
  if (ni !== null && ne !== null) return Math.abs(ni - ne) < 0.01;
  return false;
}

type CellState = "idle" | "correct" | "incorrect";

export function SpreadsheetLabEngine({
  gameId,
  data,
}: {
  gameId: string;
  data: SpreadsheetWorkspaceContent;
}) {
  const numDataRows = data.rows.length;
  const numCols = Math.max(data.headers.length, ...data.rows.map((r) => r.length));
  const totalRows = numDataRows + 2;

  const [values, setValues] = useState<Record<string, string>>({});
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const [activeCell, setActiveCell] = useState<string>("A1");
  const [formulaBarContent, setFormulaBarContent] = useState("");
  const [taskResults, setTaskResults] = useState<Record<string, boolean | null>>({});
  const [done, setDone] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);

  const reward = useGameReward(gameId, done, 100);
  const flow = useLabModuleFlow();
  const inputRefs = useRef<Record<string, HTMLInputElement>>({});

  const getCellValue = useCallback(
    (ref: string): string => {
      const r = ref.toUpperCase();
      const override = values[r];
      if (override !== undefined) {
        if (override.startsWith("=")) {
          const computed = evalFormula(override, data.rows, values);
          return computed ?? override;
        }
        return override;
      }
      const pos = parseRef(r);
      if (!pos) return "";
      if (pos.row === 0) return data.headers[pos.col] ?? "";
      const row = data.rows[pos.row - 1];
      return row ? (row[pos.col] ?? "") : "";
    },
    [values, data.headers, data.rows],
  );

  const handleCellClick = (ref: string) => {
    setActiveCell(ref.toUpperCase());
    const v = values[ref.toUpperCase()] ?? getCellValue(ref);
    setFormulaBarContent(v);
  };

  const handleCellChange = (ref: string, val: string) => {
    const r = ref.toUpperCase();
    setValues((prev) => ({ ...prev, [r]: val }));
    if (r === activeCell) setFormulaBarContent(val);
    setCellStates((prev) => ({ ...prev, [r]: "idle" }));
  };

  const handleFormulaBarChange = (val: string) => {
    setFormulaBarContent(val);
    const r = activeCell.toUpperCase();
    setValues((prev) => ({ ...prev, [r]: val }));
    setCellStates((prev) => ({ ...prev, [r]: "idle" }));
  };

  const checkAllTasks = () => {
    const newStates: Record<string, CellState> = {};
    const newResults: Record<string, boolean | null> = {};
    let allCorrect = true;
    for (const task of data.tasks) {
      const ref = task.targetCell.toUpperCase();
      const raw = values[ref] ?? "";
      let input = raw;
      if (raw.startsWith("=")) {
        const computed = evalFormula(raw, data.rows, values);
        input = computed ?? raw;
      }
      const ok = answersMatch(input, task.expectedValue);
      newStates[ref] = ok ? "correct" : raw.trim() ? "incorrect" : "idle";
      newResults[ref] = raw.trim() ? ok : null;
      if (!ok) allCorrect = false;
    }
    setCellStates((prev) => ({ ...prev, ...newStates }));
    setTaskResults(newResults);
    setCheckedAll(true);
    if (allCorrect) setDone(true);
  };

  const handleRetry = () => {
    setValues({});
    setCellStates({});
    setActiveCell("A1");
    setFormulaBarContent("");
    setTaskResults({});
    setDone(false);
    setCheckedAll(false);
  };

  const isTaskCell = (ref: string) =>
    data.tasks.some((t) => t.targetCell.toUpperCase() === ref.toUpperCase());

  const getDisplayValue = (ref: string): string => {
    const r = ref.toUpperCase();
    const raw = values[r];
    if (raw === undefined) return getCellValue(r);
    if (raw.startsWith("=")) {
      const computed = evalFormula(raw, data.rows, values);
      return computed ?? raw;
    }
    return raw;
  };

  useEffect(() => {
    const val = values[activeCell] ?? getCellValue(activeCell);
    setFormulaBarContent(val);
  }, [activeCell, values, getCellValue]);

  const taskCellSet = new Set(data.tasks.map((t) => t.targetCell.toUpperCase()));

  const completedCount = data.tasks.filter(
    (t) => taskResults[t.targetCell.toUpperCase()] === true,
  ).length;

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/30 overflow-hidden">
        <div className="bg-[#217346] px-4 py-2 text-white text-sm font-semibold flex items-center gap-2">
          <span>📊 {data.title}</span>
        </div>
        <div className="p-8 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <p className="text-xl font-semibold">Spreadsheet Complete</p>
          <p className="text-sm text-muted-foreground">
            All {data.tasks.length} tasks completed correctly.
          </p>
          <GameRewardBanner reward={reward} />
          <div className="flex gap-2 justify-center flex-wrap">
            {flow?.inFlow ? (
              <Button onClick={flow.onPracticeComplete}>
                {flow.practiceCompleteLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden text-sm">
      {/* Excel-style title bar */}
      <div className="bg-[#217346] px-3 py-1.5 text-white text-xs font-medium flex items-center gap-3">
        <span>📊</span>
        <span className="flex-1">{data.title}.xlsx — Microsoft Excel</span>
        <span className="opacity-70 text-[10px]">Lab Workbook</span>
      </div>

      {/* Ribbon row */}
      <div className="bg-[#f0f0f0] dark:bg-zinc-800 border-b border-border px-3 py-1 flex gap-4 text-xs text-muted-foreground">
        {["Home", "Insert", "Formulas", "Data", "Review", "View"].map((tab) => (
          <span
            key={tab}
            className={`cursor-default ${tab === "Home" ? "text-foreground font-medium border-b-2 border-[#217346] pb-0.5" : ""}`}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Formula bar */}
      <div className="flex items-center gap-0 border-b border-border bg-background">
        <div className="w-16 shrink-0 px-2 py-1 text-xs font-mono text-center border-r border-border bg-muted/40 font-medium">
          {activeCell}
        </div>
        <div className="px-2 text-muted-foreground text-xs border-r border-border select-none">
          <em>fx</em>
        </div>
        <input
          className="flex-1 px-2 py-1 text-xs font-mono bg-background outline-none"
          value={formulaBarContent}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          placeholder="Enter formula or value"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Spreadsheet grid */}
        <div className="flex-1 overflow-auto">
          <table className="border-collapse text-xs font-mono w-full min-w-max">
            <thead>
              <tr>
                <th className="w-8 min-w-[2rem] bg-[#e8e8e8] dark:bg-zinc-700 border border-[#c0c0c0] dark:border-zinc-600 text-center text-[10px] text-muted-foreground select-none sticky left-0 z-10" />
                {Array.from({ length: numCols }, (_, i) => (
                  <th
                    key={i}
                    className="min-w-[90px] bg-[#e8e8e8] dark:bg-zinc-700 border border-[#c0c0c0] dark:border-zinc-600 px-1 py-0.5 text-center text-[10px] text-muted-foreground select-none"
                  >
                    {colLetter(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalRows }, (_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="w-8 bg-[#e8e8e8] dark:bg-zinc-700 border border-[#c0c0c0] dark:border-zinc-600 text-center text-[10px] text-muted-foreground select-none sticky left-0">
                    {rowIdx + 1}
                  </td>
                  {Array.from({ length: numCols }, (_, colIdx) => {
                    const ref = `${colLetter(colIdx)}${rowIdx + 1}`;
                    const isActive = ref === activeCell;
                    const isTask = taskCellSet.has(ref);
                    const state = cellStates[ref] ?? "idle";
                    const displayVal = getDisplayValue(ref);
                    const isEditable = isTask;
                    const isHeader = rowIdx === 0;

                    return (
                      <td
                        key={colIdx}
                        className={`border border-[#d0d0d0] dark:border-zinc-700 p-0 relative ${
                          isActive
                            ? "ring-2 ring-inset ring-[#217346] z-10"
                            : ""
                        } ${isHeader ? "bg-[#f0f0f0] dark:bg-zinc-800 font-bold" : ""}`}
                        onClick={() => handleCellClick(ref)}
                      >
                        {isEditable ? (
                          <div className={`relative ${state === "correct" ? "bg-emerald-100 dark:bg-emerald-900/30" : state === "incorrect" ? "bg-red-100 dark:bg-red-900/20" : "bg-amber-50 dark:bg-amber-900/10"}`}>
                            {state === "correct" && (
                              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-emerald-600 text-[10px]">✓</span>
                            )}
                            {state === "incorrect" && (
                              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 text-[10px]">✗</span>
                            )}
                            <input
                              ref={(el) => {
                                if (el) inputRefs.current[ref] = el;
                              }}
                              className={`w-full px-1.5 py-0.5 bg-transparent outline-none font-mono text-xs ${
                                state === "incorrect" ? "text-red-600" : ""
                              }`}
                              value={isActive ? (values[ref] ?? displayVal) : displayVal}
                              onChange={(e) => handleCellChange(ref, e.target.value)}
                              onFocus={() => handleCellClick(ref)}
                              placeholder="="
                            />
                          </div>
                        ) : (
                          <div
                            className={`px-1.5 py-0.5 min-h-[22px] cursor-cell whitespace-nowrap overflow-hidden ${
                              isHeader ? "font-semibold text-center" : ""
                            }`}
                          >
                            {displayVal}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Task panel */}
        <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tasks — {completedCount}/{data.tasks.length}
            </p>
          </div>
          <div className="p-3 text-xs text-muted-foreground border-b border-border">
            {data.brief}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {data.tasks.map((task, i) => {
              const ref = task.targetCell.toUpperCase();
              const result = taskResults[ref];
              return (
                <div
                  key={ref}
                  className={`rounded-lg border p-2 space-y-1 text-xs transition-colors cursor-pointer ${
                    result === true
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : result === false
                        ? "bg-red-500/10 border-red-500/20"
                        : activeCell === ref
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "border-border"
                  }`}
                  onClick={() => {
                    setActiveCell(ref);
                    inputRefs.current[ref]?.focus();
                  }}
                >
                  <div className="flex items-start gap-1.5">
                    {result === true ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : result === false ? (
                      <X className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                    ) : activeCell === ref ? (
                      <CircleDot className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <p className={`font-medium ${result === true ? "line-through text-muted-foreground" : ""}`}>
                        {i + 1}. Cell <span className="font-mono">{task.targetCell}</span>
                      </p>
                      <p className="text-muted-foreground leading-snug">{task.instruction}</p>
                      {task.formulaHint && (
                        <p className="font-mono text-[10px] text-muted-foreground/70 bg-muted/50 rounded px-1 py-0.5">
                          {task.formulaHint}
                        </p>
                      )}
                      {result === false && checkedAll && (
                        <p className="text-red-600 text-[10px]">
                          Expected: {task.expectedValue}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-border space-y-2">
            <Button className="w-full" size="sm" onClick={checkAllTasks}>
              Check All Answers
            </Button>
            {checkedAll && !done && (
              <p className="text-xs text-center text-muted-foreground">
                {completedCount}/{data.tasks.length} correct — fix the red cells and check again
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
