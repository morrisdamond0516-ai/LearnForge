import { useState } from "react";
import {
  Check,
  RotateCcw,
  Terminal,
  Stethoscope,
  Ruler,
  FlaskConical,
  ClipboardList,
  Blocks,
  Ticket,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import { useLabModuleFlow } from "@/components/games/lab-module-flow-context";
import type {
  HelpdeskTicketQueueContent,
  IntakeFormWorkspaceContent,
  JobsiteWorkspaceContent,
  LabBenchWorkspaceContent,
  ManipulativeBoardContent,
  PatientChartWorkspaceContent,
  SimCanvasWorkspaceContent,
  SpreadsheetWorkspaceContent,
  TerminalWorkspaceContent,
} from "@/lib/educational-games/skill-game-types";

function normalizeNum(v: string): number | null {
  const n = parseFloat(v.replace(/[$,%]/g, "").trim());
  return Number.isNaN(n) ? null : Math.round(n * 100) / 100;
}

function evalSimpleFormula(
  formula: string,
  rows: string[][],
  overrides: Record<string, string>,
): number | null {
  const f = formula.trim().toUpperCase();
  const cellVal = (ref: string): number | null => {
    const r = ref.toUpperCase();
    if (overrides[r]) return normalizeNum(overrides[r]);
    const col = r.charCodeAt(0) - 65;
    const rowNum = parseInt(r.slice(1), 10);
    if (col < 1 || Number.isNaN(rowNum)) return null;
    const row = rows.find((rw) => rw[0] === String(rowNum));
    if (!row) return null;
    return normalizeNum(row[col] ?? "");
  };

  if (f.startsWith("=SUM(") && f.endsWith(")")) {
    const range = f.slice(5, -1);
    const [start, end] = range.split(":");
    if (!start || !end) return null;
    const startCol = start.charCodeAt(0);
    const startRow = parseInt(start.slice(1), 10);
    const endRow = parseInt(end.slice(1), 10);
    let sum = 0;
    for (let r = startRow; r <= endRow; r++) {
      const v = cellVal(String.fromCharCode(startCol) + r);
      if (v !== null) sum += v;
    }
    return Math.round(sum * 100) / 100;
  }

  if (f.startsWith("=AVERAGE(") && f.endsWith(")")) {
    const range = f.slice(9, -1);
    const [start, end] = range.split(":");
    if (!start || !end) return null;
    const startCol = start.charCodeAt(0);
    const startRow = parseInt(start.slice(1), 10);
    const endRow = parseInt(end.slice(1), 10);
    let sum = 0;
    let count = 0;
    for (let r = startRow; r <= endRow; r++) {
      const v = cellVal(String.fromCharCode(startCol) + r);
      if (v !== null) {
        sum += v;
        count++;
      }
    }
    return count ? Math.round((sum / count) * 100) / 100 : null;
  }

  if (f.startsWith("=COUNT(") && f.endsWith(")")) {
    const range = f.slice(7, -1);
    const [start, end] = range.split(":");
    if (!start || !end) return null;
    const startCol = start.charCodeAt(0);
    const startRow = parseInt(start.slice(1), 10);
    const endRow = parseInt(end.slice(1), 10);
    let count = 0;
    for (let r = startRow; r <= endRow; r++) {
      const v = cellVal(String.fromCharCode(startCol) + r);
      if (v !== null) count++;
    }
    return count;
  }

  const mul = /^=([A-Z]+\d+)\*([0-9.]+)$/.exec(f);
  if (mul) {
    const a = cellVal(mul[1]);
    const b = parseFloat(mul[2]);
    if (a === null || Number.isNaN(b)) return null;
    return Math.round(a * b * 100) / 100;
  }

  const add = /^=([A-Z]+\d+)\+([A-Z]+\d+)$/.exec(f);
  if (add) {
    const a = cellVal(add[1]);
    const b = cellVal(add[2]);
    if (a === null || b === null) return null;
    return Math.round((a + b) * 100) / 100;
  }

  return null;
}

function WorkspaceFinish({
  reward,
  title,
  onRetry,
}: {
  reward: ReturnType<typeof useGameReward>;
  title: string;
  onRetry: () => void;
}) {
  const flow = useLabModuleFlow();

  if (flow?.inFlow) {
    return (
      <Card className="border-primary/30">
        <CardContent className="space-y-4 p-8 text-center">
          <Check className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="text-xl font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">
            Hands-on workspace complete — you&apos;re still in this lab module.
          </p>
          <GameRewardBanner reward={reward} />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={flow.onPracticeComplete}>
              {flow.practiceCompleteLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="text-xl font-semibold">{title}</p>
        <GameRewardBanner reward={reward} />
        <Button onClick={onRetry}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Practice again
        </Button>
      </CardContent>
    </Card>
  );
}

export function SpreadsheetWorkspacePlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: SpreadsheetWorkspaceContent;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean | null>>({});
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  function allCorrect(next: Record<string, boolean | null>) {
    return data.tasks.every((t) => next[t.targetCell.toUpperCase()] === true);
  }

  function checkCell(taskIdx: number) {
    const task = data.tasks[taskIdx];
    const ref = task.targetCell.toUpperCase();
    const input = (values[ref] ?? "").trim();
    const expected = task.expectedValue.trim();
    let ok = normalizeNum(input) === normalizeNum(expected);
    if (!ok && input.startsWith("=")) {
      const result = evalSimpleFormula(input, data.rows, values);
      if (result !== null) ok = normalizeNum(String(result)) === normalizeNum(expected);
    }
    const next = { ...checked, [ref]: ok };
    setChecked(next);
    if (allCorrect(next)) setDone(true);
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Spreadsheet complete"
        onRetry={() => {
          setValues({});
          setChecked({});
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#217346]/30 overflow-hidden">
      <div className="bg-[#217346] px-4 py-2 text-white text-sm font-semibold">{data.title}</div>
      <p className="px-4 text-sm text-muted-foreground">{data.brief}</p>
      <div className="overflow-x-auto px-4">
        <table className="w-full text-xs border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              {data.headers.map((h) => (
                <th key={h} className="border border-border px-2 py-1 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const col = data.headers[ci];
                  if (!col || col === "") {
                    return (
                      <td key={ci} className="border border-border px-2 py-1 bg-muted/50 text-center">
                        {cell}
                      </td>
                    );
                  }
                  const ref = `${col}${row[0]}`.toUpperCase();
                  const taskIdx = data.tasks.findIndex((t) => t.targetCell.toUpperCase() === ref);
                  if (taskIdx >= 0 && cell === "") {
                    const st = checked[ref];
                    return (
                      <td key={ci} className="border border-border p-0">
                        <input
                          className={`w-full min-w-[80px] px-2 py-1 font-mono text-xs bg-background ${
                            st === true ? "bg-green-500/10" : st === false ? "bg-destructive/10" : ""
                          }`}
                          value={values[ref] ?? ""}
                          onChange={(e) => setValues((v) => ({ ...v, [ref]: e.target.value }))}
                          placeholder="="
                        />
                      </td>
                    );
                  }
                  return (
                    <td key={ci} className="border border-border px-2 py-1 font-mono">
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-4 space-y-3">
        {data.tasks.map((task, i) => {
          const ref = task.targetCell.toUpperCase();
          const st = checked[ref];
          return (
            <div key={ref} className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-sm font-medium">
                {i + 1}. {task.instruction}
              </p>
              <div className="flex gap-2 items-center">
                <Button size="sm" variant="outline" onClick={() => checkCell(i)} disabled={!(values[ref] ?? "").trim()}>
                  Check {task.targetCell}
                </Button>
                {st === true ? <Check className="h-5 w-5 text-green-600" /> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TerminalWorkspacePlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: TerminalWorkspaceContent;
}) {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>(
    data.initialOutput
      ? [data.initialOutput]
      : ["Microsoft Windows [Version 10.0.26200]", "(c) LearnForge IT Lab. Type commands to troubleshoot."],
  );
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  const current = data.steps[step];

  function runCommand() {
    const cmd = input.trim().toLowerCase();
    const expected = current.expectedCommand.toLowerCase();
    const normalized = cmd.replace(/\s+/g, " ");
    const ok = normalized === expected || normalized.startsWith(expected);

    let output = "";
    if (!ok) {
      output = `'${input}' is not the expected next step. Try: ${current.hint ?? current.expectedCommand}`;
    } else if (normalized.startsWith("ipconfig /all") || normalized === "ipconfig /all") {
      output =
        "Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : IT-LAB\n   DHCP Enabled. . . . . . . . . . . : Yes\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : 192.168.1.1\n                                       8.8.8.8";
    } else if (normalized.startsWith("ipconfig /flushdns")) {
      output = "Successfully flushed the DNS Resolver Cache.";
    } else if (normalized.startsWith("ipconfig")) {
      output =
        "Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1";
    } else if (normalized.startsWith("ping 192.168.1.1")) {
      output =
        "Pinging 192.168.1.1 with 32 bytes of data:\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nPing statistics: 0% packet loss — gateway reachable.";
    } else if (normalized.startsWith("ping")) {
      output =
        "Pinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: bytes=32 time=14ms TTL=118\nPing statistics: 0% packet loss";
    } else if (normalized.startsWith("git status")) {
      output =
        "On branch fix/login-crash\nChanges to be committed:\n  (use \"git restore --staged <file>...\" to unstage)\n\tmodified:   auth.js\n";
    } else if (normalized === "git add ." || normalized.startsWith("git add ")) {
      output = "";
    } else if (normalized.startsWith("git commit")) {
      output = "[fix/login-crash 9f3a1c2] fix login null crash\n 1 file changed, 3 insertions(+), 1 deletion(-)";
    } else if (normalized.startsWith("nslookup")) {
      output =
        "Server:  dns.contoso.local\nAddress:  192.168.1.1\n\nName:    intranet.contoso.local\nAddress:  10.10.2.44";
    } else if (normalized === "whoami") {
      output = "itlab\\admin";
    } else if (normalized === "hostname") {
      output = data.hostname;
    } else if (normalized === "net user helpdesk") {
      output =
        "User name                    helpdesk\nFull Name                    Help Desk Tech\nAccount active               Yes\nLocal Group Memberships      *Users";
    } else if (normalized.startsWith("net user")) {
      output =
        "User accounts for \\\\" +
        data.hostname +
        "\n\n-------------------------------------------------------------------------------\nAdministrator            Guest                    helpdesk\nThe command completed successfully.";
    } else if (normalized.startsWith("wmic printer")) {
      output =
        "Name              Status\nHP-Floor3         Idle\nMicrosoft Print to PDF  OK";
    } else if (normalized.startsWith("control printers")) {
      output = "[Opened Devices and Printers — set HP-Floor3 as default / clear Offline]";
    } else {
      output =
        current.expectedOutputContains ??
        "[OK] Command accepted — continue to the next troubleshooting step.";
    }

    setLog((l) => [...l, `${data.prompt}${input}`, output]);

    if (ok) {
      if (step + 1 >= data.steps.length) setDone(true);
      else setStep((s) => s + 1);
    }
    setInput("");
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Ticket resolved"
        onRetry={() => {
          setStep(0);
          setInput("");
          setLog(
            data.initialOutput
              ? [data.initialOutput]
              : ["Microsoft Windows [Version 10.0.26200]", "(c) LearnForge IT Lab."],
          );
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border overflow-hidden bg-zinc-950 text-green-400 font-mono text-sm">
      <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 text-zinc-300 text-xs">
        <Terminal className="h-4 w-4" />
        {data.hostname} — {data.title}
      </div>
      <p className="px-3 text-zinc-400 text-xs font-sans">{data.brief}</p>
      <div className="mx-3 rounded bg-black p-3 min-h-[160px] max-h-[220px] overflow-y-auto whitespace-pre-wrap text-xs">
        {log.map((line, i) => (
          <div key={i} className={line.startsWith(data.prompt) ? "text-white" : ""}>
            {line}
          </div>
        ))}
      </div>
      <div className="px-3 pb-3 font-sans text-sm text-foreground bg-card border-t border-border p-3">
        <p className="font-medium mb-2">
          Step {step + 1}/{data.steps.length}: {current.instruction}
        </p>
        <div className="flex gap-2">
          <span className="font-mono text-green-600 py-2">{data.prompt}</span>
          <Input
            className="font-mono flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input.trim() && runCommand()}
            placeholder={current.expectedCommand}
          />
          <Button onClick={runCommand} disabled={!input.trim()}>
            Run
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PatientChartWorkspacePlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: PatientChartWorkspaceContent;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean | null>>({});
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  function checkField(field: string, expected: string) {
    const ok = values[field]?.trim().toLowerCase() === expected.trim().toLowerCase();
    const next = { ...checked, [field]: ok };
    setChecked(next);
    if (data.tasks.every((t) => next[t.field] === true)) setDone(true);
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Chart complete"
        onRetry={() => {
          setValues({});
          setChecked({});
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-primary">
        <Stethoscope className="h-5 w-5" />
        <span className="font-semibold">{data.title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{data.brief}</p>
      <div className="rounded-lg bg-muted/50 p-4 space-y-1 text-sm">
        <p>
          <strong>Patient:</strong> {data.patientName}
        </p>
        <p>
          <strong>Chief complaint:</strong> {data.chiefComplaint}
        </p>
      </div>
      {data.tasks.map((task) => (
        <div key={task.field} className="space-y-2">
          <label className="text-sm font-medium">
            {task.label}
            {task.normalRange ? (
              <span className="text-muted-foreground font-normal"> (normal: {task.normalRange})</span>
            ) : null}
          </label>
          <div className="flex gap-2 items-center">
            <Input
              value={values[task.field] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [task.field]: e.target.value }))}
              placeholder={task.unit ?? ""}
            />
            <Button size="sm" onClick={() => checkField(task.field, task.expected)} disabled={!values[task.field]?.trim()}>
              Save
            </Button>
            {checked[task.field] === true ? <Check className="h-5 w-5 text-green-600" /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function JobsiteWorkspacePlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: JobsiteWorkspaceContent;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  function check(i: number, expected: string) {
    const ok = normalizeNum(answers[i] ?? "") === normalizeNum(expected);
    const next = { ...checked, [i]: ok };
    setChecked(next);
    if (data.tasks.every((_, idx) => next[idx] === true)) setDone(true);
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Jobsite tasks complete"
        onRetry={() => {
          setAnswers({});
          setChecked({});
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <Ruler className="h-5 w-5 text-primary" />
        <span className="font-semibold">{data.title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{data.brief}</p>
      {data.tasks.map((task, i) => (
        <div key={i} className="rounded-lg border border-border p-3 space-y-2">
          <p className="text-sm font-medium">{task.prompt}</p>
          <div className="flex gap-2">
            <Input
              value={answers[i] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
              placeholder={task.unit ?? "Answer"}
            />
            <Button size="sm" onClick={() => check(i, task.answer)} disabled={!answers[i]?.trim()}>
              Check
            </Button>
          </div>
          {checked[i] === false ? <p className="text-xs text-muted-foreground">{task.explanation}</p> : null}
        </div>
      ))}
    </div>
  );
}

function SimVisual({
  visual,
  vars,
}: {
  visual: SimCanvasWorkspaceContent["visual"];
  vars: Record<string, number>;
}) {
  if (visual === "projectile") {
    const v = vars.velocity ?? 20;
    const angle = vars.angle ?? 45;
    const rad = (angle * Math.PI) / 180;
    const range = Math.round(((v * v * Math.sin(2 * rad)) / 9.8) * 10) / 10;
    const height = Math.round((((v * Math.sin(rad)) ** 2) / (2 * 9.8)) * 10) / 10;
    return (
      <div className="rounded-lg bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-950 dark:to-green-950 p-4 min-h-[140px] relative overflow-hidden">
        <div className="absolute bottom-4 left-4 text-xs font-mono space-y-1">
          <p>Range ≈ {range} m</p>
          <p>Max height ≈ {height} m</p>
        </div>
        <svg viewBox="0 0 200 80" className="w-full h-24">
          <path
            d={`M 10 70 Q ${50 + angle} ${20 - v / 3} ${Math.min(180, 10 + range * 2)} 70`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          />
          <circle cx="10" cy="70" r="4" className="fill-orange-500" />
        </svg>
      </div>
    );
  }
  if (visual === "orbit") {
    const altitude = vars.altitude ?? 400;
    const period = Math.round(2 * Math.PI * Math.sqrt(((6371 + altitude) ** 3) / 398600) * 10) / 10;
    return (
      <div className="rounded-lg bg-black p-4 min-h-[140px] flex items-center justify-center relative">
        <div className="absolute top-2 left-2 text-xs font-mono text-blue-300">
          Altitude: {altitude} km · Period ≈ {period} min
        </div>
        <svg viewBox="0 0 120 120" className="w-32 h-32">
          <circle cx="60" cy="60" r="20" fill="#3b82f6" />
          <ellipse cx="60" cy="60" rx={30 + altitude / 20} ry={25 + altitude / 25} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx={60 + 30 + altitude / 20} cy="60" r="3" fill="#fbbf24" />
        </svg>
      </div>
    );
  }
  if (visual === "fraction") {
    const num = vars.numerator ?? 1;
    const den = vars.denominator ?? 4;
    const pct = Math.round((num / den) * 100);
    return (
      <div className="rounded-lg border border-border p-4 min-h-[100px]">
        <p className="text-center text-2xl font-bold mb-2">
          {num}/{den} = {pct}%
        </p>
        <div className="flex gap-0.5 h-8">
          {Array.from({ length: den }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i < num ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
    );
  }
  const x = vars.x ?? 0;
  const m = vars.slope ?? 2;
  const b = vars.intercept ?? 1;
  const y = m * x + b;
  return (
    <div className="rounded-lg border border-border p-4 min-h-[100px] font-mono text-sm">
      <p>
        y = {m}x + {b} → at x={x}, y={Math.round(y * 10) / 10}
      </p>
      <svg viewBox="0 0 200 100" className="w-full h-20 mt-2">
        <line x1="0" y1={90 - b * 5} x2="200" y2={90 - (m * 20 + b) * 5} stroke="currentColor" strokeWidth="2" className="text-primary" />
        <circle cx={100} cy={90 - y * 5} r="4" className="fill-orange-500" />
      </svg>
    </div>
  );
}

export function SimCanvasWorkspacePlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: SimCanvasWorkspaceContent;
}) {
  const initVars = Object.fromEntries(data.variables.map((v) => [v.id, v.default]));
  const [vars, setVars] = useState<Record<string, number>>(initVars);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  function check(i: number) {
    const q = data.questions[i];
    const expected = q.evaluate(vars);
    const tol = q.tolerance ?? 0.5;
    const val = normalizeNum(answers[i] ?? "");
    const ok = val !== null && Math.abs(val - expected) <= tol;
    const next = { ...checked, [i]: ok };
    setChecked(next);
    if (data.questions.every((_, idx) => next[idx] === true)) setDone(true);
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Simulation complete"
        onRetry={() => {
          setVars(initVars);
          setAnswers({});
          setChecked({});
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <p className="font-semibold">{data.title}</p>
      <p className="text-sm text-muted-foreground">{data.brief}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.variables.map((v) => (
          <div key={v.id} className="space-y-1">
            <label className="text-sm font-medium">
              {v.label}: {vars[v.id]}{v.unit ? ` ${v.unit}` : ""}
            </label>
            <input
              type="range"
              min={v.min}
              max={v.max}
              step={v.step}
              value={vars[v.id]}
              onChange={(e) => setVars((prev) => ({ ...prev, [v.id]: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        ))}
      </div>
      <SimVisual visual={data.visual} vars={vars} />
      {data.questions.map((q, i) => (
        <div key={i} className="rounded-lg border border-border p-3 space-y-2">
          <p className="text-sm font-medium">{q.prompt}</p>
          <div className="flex gap-2">
            <Input
              value={answers[i] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
              placeholder={q.unit ?? "Answer"}
            />
            <Button size="sm" onClick={() => check(i)} disabled={!answers[i]?.trim()}>
              Check
            </Button>
            {checked[i] === true ? <Check className="h-5 w-5 text-green-600" /> : null}
          </div>
          {checked[i] === false ? <p className="text-xs text-muted-foreground">{q.explanation}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function LabBenchWorkspacePlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: LabBenchWorkspaceContent;
}) {
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  const current = data.steps[step];

  function pick(label: string, correct: boolean, msg: string) {
    setFeedback(msg);
    if (correct) {
      if (step + 1 >= data.steps.length) setDone(true);
      else setTimeout(() => {
        setStep((s) => s + 1);
        setFeedback(null);
      }, 800);
    }
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Lab complete"
        onRetry={() => {
          setStep(0);
          setFeedback(null);
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" />
        <span className="font-semibold">{data.title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{data.brief}</p>
      <p className="text-xs text-muted-foreground">
        Step {step + 1} of {data.steps.length}
      </p>
      <p className="font-medium">{current.instruction}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {current.choices.map((c) => (
          <Button
            key={c.label}
            variant="outline"
            className="h-auto py-3 text-left justify-start whitespace-normal"
            onClick={() => pick(c.label, c.correct, c.feedback)}
          >
            {c.label}
          </Button>
        ))}
      </div>
      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
    </div>
  );
}

export function ManipulativeBoardPlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: ManipulativeBoardContent;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [taskIdx, setTaskIdx] = useState(0);
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  const task = data.tasks[taskIdx];

  function addItem(id: string) {
    setCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  function removeItem(id: string) {
    setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) - 1) }));
  }

  function checkTask() {
    const count = counts[task.itemId] ?? 0;
    if (count === task.targetCount) {
      if (taskIdx + 1 >= data.tasks.length) setDone(true);
      else {
        setTaskIdx((t) => t + 1);
        setCounts({});
      }
    }
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Board complete"
        onRetry={() => {
          setCounts({});
          setTaskIdx(0);
          setDone(false);
        }}
      />
    );
  }

  const item = data.items.find((i) => i.id === task.itemId)!;

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <Blocks className="h-5 w-5 text-primary" />
        <span className="font-semibold">{data.title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{data.brief}</p>
      <p className="font-medium">
        Task {taskIdx + 1}/{data.tasks.length}: {task.prompt}
      </p>
      <div className="flex flex-wrap gap-2 min-h-[80px] rounded-lg bg-muted/50 p-4 border border-dashed border-border">
        {Array.from({ length: counts[task.itemId] ?? 0 }).map((_, i) => (
          <span key={i} className="text-3xl">{item.emoji}</span>
        ))}
        {(counts[task.itemId] ?? 0) === 0 ? (
          <span className="text-sm text-muted-foreground self-center">Tap + to add {item.label}</span>
        ) : null}
      </div>
      <div className="flex gap-2 items-center">
        <Button size="sm" variant="outline" onClick={() => removeItem(task.itemId)} disabled={(counts[task.itemId] ?? 0) === 0}>
          −
        </Button>
        <span className="font-mono w-8 text-center">{counts[task.itemId] ?? 0}</span>
        <Button size="sm" variant="outline" onClick={() => addItem(task.itemId)}>
          +
        </Button>
        <Button size="sm" onClick={checkTask} disabled={(counts[task.itemId] ?? 0) === 0}>
          Check count
        </Button>
      </div>
    </div>
  );
}

export function IntakeFormWorkspacePlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: IntakeFormWorkspaceContent;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean | null>>({});
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  function checkField(id: string, expected: string, type: IntakeFormWorkspaceContent["fields"][0]["type"]) {
    const raw = values[id]?.trim().toLowerCase() ?? "";
    const exp = expected.trim().toLowerCase();
    const ok = type === "textarea" ? raw.includes(exp) : raw === exp;
    const next = { ...checked, [id]: ok };
    setChecked(next);
    if (data.fields.every((f) => next[f.id] === true)) setDone(true);
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Form submitted"
        onRetry={() => {
          setValues({});
          setChecked({});
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        <span className="font-semibold">{data.title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{data.brief}</p>
      <div className="rounded-lg bg-muted/50 p-3 text-sm">{data.scenario}</div>
      {data.fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label className="text-sm font-medium">{field.label}</label>
          {field.type === "select" && field.options ? (
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={values[field.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
            >
              <option value="">Select…</option>
              {field.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
              value={values[field.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
              placeholder={field.hint}
            />
          ) : (
            <Input
              value={values[field.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
              placeholder={field.hint}
            />
          )}
          <div className="flex gap-2 items-center pt-1">
            <Button size="sm" variant="outline" onClick={() => checkField(field.id, field.expected, field.type)} disabled={!values[field.id]?.trim()}>
              Verify
            </Button>
            {checked[field.id] === true ? <Check className="h-5 w-5 text-green-600" /> : null}
            {checked[field.id] === false ? <span className="text-xs text-destructive">Check hint: {field.hint ?? field.expected}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HelpdeskTicketQueuePlayer({
  gameId,
  data,
}: {
  gameId: string;
  data: HelpdeskTicketQueueContent;
}) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [resolved, setResolved] = useState(0);
  const [done, setDone] = useState(false);
  const reward = useGameReward(gameId, done, 100);

  const ticket = data.tickets[index];

  function pickAction(actionId: string) {
    if (!ticket) return;
    const action = ticket.actions.find((a) => a.id === actionId);
    if (!action) return;
    setFeedback(action.feedback);
    if (!action.correct) return;

    const nextResolved = resolved + 1;
    setResolved(nextResolved);
    if (index + 1 >= data.tickets.length) {
      setDone(true);
    } else {
      setTimeout(() => {
        setIndex((i) => i + 1);
        setFeedback(null);
      }, 700);
    }
  }

  if (done) {
    return (
      <WorkspaceFinish
        reward={reward}
        title="Queue cleared — shift complete"
        onRetry={() => {
          setIndex(0);
          setFeedback(null);
          setResolved(0);
          setDone(false);
        }}
      />
    );
  }

  if (!ticket) return null;

  const priorityClass =
    ticket.priority === "Critical" || ticket.priority === "High"
      ? "bg-destructive/15 text-destructive"
      : ticket.priority === "Medium"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
        : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-4 rounded-xl border border-border overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <Ticket className="h-5 w-5 text-primary" />
          {data.queueName}
        </div>
        <span className="text-sm text-muted-foreground">
          Closed {resolved}/{data.tickets.length} · Ticket {index + 1} of{" "}
          {data.tickets.length}
        </span>
      </div>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-sm text-muted-foreground">{data.brief}</p>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {ticket.id}
              </span>
              <Badge className={priorityClass}>{ticket.priority}</Badge>
              <Badge variant="outline">{ticket.category}</Badge>
              <Badge variant="secondary">{ticket.aPlusDomain}</Badge>
            </div>
            <h3 className="text-lg font-semibold leading-snug">{ticket.subject}</h3>
            <p className="text-sm text-muted-foreground">
              Requester: <span className="text-foreground">{ticket.requester}</span>
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Choose the best next action
              </p>
              {ticket.actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                  onClick={() => pickAction(action.id)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
            {feedback ? (
              <p className="rounded-lg bg-muted/60 p-3 text-sm">{feedback}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
