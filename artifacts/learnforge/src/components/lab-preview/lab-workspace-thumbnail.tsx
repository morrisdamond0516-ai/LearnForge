import type { SkillGameContent, SkillGameType } from "@/lib/educational-games/skill-game-types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<SkillGameType, { bg: string }> = {
  "intake-form-workspace": { bg: "from-sky-50 to-blue-100 dark:from-sky-950/40 dark:to-blue-900/30" },
  "spreadsheet-workspace": { bg: "from-emerald-50 to-green-100 dark:from-emerald-950/40 dark:to-green-900/30" },
  "terminal-workspace": { bg: "from-zinc-800 to-zinc-900" },
  "patient-chart-workspace": { bg: "from-rose-50 to-pink-100 dark:from-rose-950/40 dark:to-pink-900/30" },
  "helpdesk-ticket-queue": { bg: "from-violet-50 to-purple-100 dark:from-violet-950/40 dark:to-purple-900/30" },
  "jobsite-workspace": { bg: "from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-900/30" },
  "lab-bench-workspace": { bg: "from-teal-50 to-cyan-100 dark:from-teal-950/40 dark:to-cyan-900/30" },
  "sim-canvas-workspace": { bg: "from-indigo-50 to-blue-100 dark:from-indigo-950/40 dark:to-blue-900/30" },
  "manipulative-board": { bg: "from-yellow-50 to-amber-100 dark:from-yellow-950/40 dark:to-amber-900/30" },
  "code-trace": { bg: "from-slate-50 to-slate-200 dark:from-slate-900/40 dark:to-slate-800/30" },
  "typing-drill": { bg: "from-slate-50 to-slate-200 dark:from-slate-900/40 dark:to-slate-800/30" },
  "sequence-build": { bg: "from-slate-50 to-slate-200 dark:from-slate-900/40 dark:to-slate-800/30" },
  "match-pairs": { bg: "from-slate-50 to-slate-200 dark:from-slate-900/40 dark:to-slate-800/30" },
  "math-scenario": { bg: "from-slate-50 to-slate-200 dark:from-slate-900/40 dark:to-slate-800/30" },
  "script-choice": { bg: "from-slate-50 to-slate-200 dark:from-slate-900/40 dark:to-slate-800/30" },
};

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function IntakeMock({ content }: { content?: SkillGameContent }) {
  const form = content?.intakeForm;
  const fields = form?.fields?.slice(0, 3) ?? [
    { id: "a", label: "Service class", type: "select" as const, options: ["Priority", "Standard"], expected: "" },
    { id: "b", label: "Insurance amount", type: "text" as const, expected: "", hint: "$200" },
    { id: "c", label: "Hazmat declared?", type: "select" as const, options: ["No", "Yes"], expected: "" },
  ];
  return (
    <div className="space-y-1 p-2">
      <div className="text-[8px] font-semibold leading-tight text-sky-800 dark:text-sky-200">
        {truncate(form?.title ?? "Professional intake form", 42)}
      </div>
      {fields.map((f) => (
        <div key={f.id} className="space-y-0.5">
          <div className="text-[7px] font-medium text-sky-700/80 dark:text-sky-300/80">
            {truncate(f.label, 28)}
          </div>
          {f.type === "select" ? (
            <div className="flex h-4 items-center justify-between rounded border border-sky-200/70 bg-white/90 px-1 text-[6px] text-sky-900 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-100">
              <span className="truncate">{f.options?.[0] ?? "Select…"}</span>
              <span className="text-sky-400">▾</span>
            </div>
          ) : (
            <div className="h-4 rounded border border-sky-200/70 bg-white/90 px-1 text-[6px] leading-4 text-muted-foreground dark:border-sky-800/50 dark:bg-sky-950/40">
              {f.hint ? truncate(f.hint, 20) : "Enter value…"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SpreadsheetMock({ content }: { content?: SkillGameContent }) {
  const sheet = content?.spreadsheet;
  const rows = sheet?.rows?.slice(0, 4) ?? [
    ["", "Jan", "Feb", "Mar"],
    ["Users", "120", "135", "128"],
    ["Active", "74", "88", "81"],
    ["Retention %", "?", "?", "?"],
  ];
  const title = sheet?.title;
  return (
    <div className="p-1.5">
      {title ? (
        <div className="mb-1 text-[7px] font-semibold text-emerald-800 dark:text-emerald-200">
          {truncate(title, 36)}
        </div>
      ) : null}
      <div className="overflow-hidden rounded border border-emerald-300/60 dark:border-emerald-800/50">
        <table className="w-full text-[7px] leading-tight">
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={ri === 0 ? "bg-emerald-200/70 font-semibold dark:bg-emerald-900/50" : ""}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      "border border-emerald-200/50 px-1 py-0.5 dark:border-emerald-800/30",
                      cell === "?" && "bg-yellow-100 font-bold text-amber-700 dark:bg-yellow-900/40",
                    )}
                  >
                    {cell || "\u00a0"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TerminalMock({ content }: { content?: SkillGameContent }) {
  const term = content?.terminal;
  const title = term?.title ?? "INC-1042 — Network ticket";
  const output =
    term?.initialOutput?.slice(0, 72) ??
    "Symptom: no network · ping 8.8.8.8 OK · suspect DNS";
  const step = term?.steps?.[0]?.instruction;
  return (
    <div className="space-y-1 p-2 font-mono text-[7px] leading-snug text-green-400">
      <div className="font-semibold text-green-300">{truncate(title, 40)}</div>
      <div className="text-green-400/75">{truncate(output, 80)}</div>
      {step ? (
        <div className="text-green-300/60">→ {truncate(step, 50)}</div>
      ) : null}
      <div className="flex items-center gap-1 pt-0.5">
        <span className="text-green-500">{term?.prompt ?? "C:\\>"}</span>
        <span className="h-2.5 flex-1 rounded bg-green-900/50" />
        <span className="animate-pulse text-green-400">▌</span>
      </div>
    </div>
  );
}

function PatientChartMock({ content }: { content?: SkillGameContent }) {
  const chart = content?.patientChart;
  const tasks = chart?.tasks?.slice(0, 3) ?? [
    { field: "bp", label: "Blood pressure", expected: "118/76" },
    { field: "hr", label: "Heart rate", expected: "82" },
    { field: "spo2", label: "SpO₂", expected: "97%" },
  ];
  return (
    <div className="space-y-1 p-2">
      <div className="text-[8px] font-semibold text-rose-800 dark:text-rose-200">
        {chart?.patientName ?? "Patient chart"}
      </div>
      {chart?.chiefComplaint ? (
        <div className="text-[6px] text-rose-600/80 dark:text-rose-400/80">
          CC: {truncate(chart.chiefComplaint, 40)}
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-1">
        {tasks.map((v) => (
          <div
            key={v.field}
            className="rounded border border-rose-200/70 bg-white/80 p-1 dark:border-rose-800/40 dark:bg-rose-950/30"
          >
            <div className="text-[6px] text-rose-600/70">{truncate(v.label, 12)}</div>
            <div className="text-[8px] font-bold text-rose-800 dark:text-rose-200">
              {v.expected ? truncate(v.expected, 8) : "___"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketQueueMock({ content }: { content?: SkillGameContent }) {
  const queue = content?.helpdeskQueue;
  const tickets =
    queue?.tickets?.slice(0, 3).map((t) => ({
      label: t.subject,
      priority: t.priority,
    })) ?? [
      { label: "VPN connection down", priority: "Critical" as const },
      { label: "Printer offline — HR floor", priority: "High" as const },
      { label: "Password reset request", priority: "Medium" as const },
    ];
  const priorityColor: Record<string, string> = {
    Critical: "bg-red-500",
    High: "bg-orange-500",
    Medium: "bg-yellow-500",
    Low: "bg-slate-400",
  };
  return (
    <div className="space-y-1 p-2">
      <div className="text-[8px] font-semibold text-violet-800 dark:text-violet-200">
        {truncate(queue?.queueName ?? queue?.title ?? "Help desk queue", 32)}
      </div>
      {tickets.map((t, i) => (
        <div
          key={t.label}
          className={cn(
            "flex items-center gap-1 rounded border px-1.5 py-1 text-[7px]",
            i === 0
              ? "border-violet-300 bg-violet-100/90 dark:border-violet-700 dark:bg-violet-900/50"
              : "border-violet-200/60 bg-white/70 dark:border-violet-800/30 dark:bg-violet-950/20",
          )}
        >
          <div
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              priorityColor[t.priority] ?? "bg-violet-500",
            )}
          />
          <span className="truncate text-violet-900 dark:text-violet-100">
            {truncate(t.label, 34)}
          </span>
        </div>
      ))}
    </div>
  );
}

function JobsiteMock({ content }: { content?: SkillGameContent }) {
  const site = content?.jobsite;
  const tasks = site?.tasks?.slice(0, 2) ?? [
    { prompt: "Lug torque spec 100 Nm. Measured?", answer: "100", unit: "Nm" },
    { prompt: "Rotor min 22 mm. Measured 21.2 mm. Replace?", answer: "1", unit: "" },
  ];
  return (
    <div className="space-y-1 p-2">
      <div className="text-[8px] font-semibold text-amber-900 dark:text-amber-200">
        {truncate(site?.title ?? "Jobsite workspace", 36)}
      </div>
      {tasks.map((t, i) => (
        <div
          key={i}
          className="rounded border border-amber-200/70 bg-white/80 p-1 dark:border-amber-800/40 dark:bg-amber-950/30"
        >
          <div className="text-[6px] leading-snug text-amber-900/90 dark:text-amber-100/90">
            {truncate(t.prompt, 52)}
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            <div className="h-3.5 flex-1 rounded border border-amber-300/60 bg-amber-50 px-1 text-[6px] leading-[14px] text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/30">
              {t.unit ? `___ ${t.unit}` : "___"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LabBenchMock({ content }: { content?: SkillGameContent }) {
  const bench = content?.labBench;
  const stepIdx = 0;
  const step = bench?.steps?.[stepIdx];
  const total = bench?.steps?.length ?? 3;
  const choices = step?.choices?.slice(0, 2) ?? [
    { label: "Clean slide and label with sample ID", correct: true },
    { label: "Start at highest objective power", correct: false },
  ];
  return (
    <div className="space-y-1 p-2">
      <div className="text-[6px] font-medium text-teal-600/80 dark:text-teal-400/80">
        Step {stepIdx + 1} of {total}
      </div>
      <div className="text-[7px] font-medium leading-snug text-teal-900 dark:text-teal-100">
        {truncate(step?.instruction ?? "Choose the correct lab procedure step.", 72)}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {choices.map((c, i) => (
          <div
            key={i}
            className="rounded border border-teal-300/70 bg-white px-1 py-1 text-[5px] leading-tight text-teal-900 dark:border-teal-700/50 dark:bg-teal-950/40 dark:text-teal-100"
          >
            {truncate(c.label, 42)}
          </div>
        ))}
      </div>
    </div>
  );
}

function SimCanvasMock({ content }: { content?: SkillGameContent }) {
  const sim = content?.simCanvas;
  const vars = sim?.variables ?? [];
  const v0 = vars.find((v) => v.id === "velocity")?.default ?? vars[0]?.default ?? 30;
  const angle = vars.find((v) => v.id === "angle")?.default ?? vars[1]?.default ?? 40;
  const visual = sim?.visual ?? "graph";

  if (visual === "fraction") {
    const num = vars.find((v) => v.id === "numerator")?.default ?? 1;
    const den = vars.find((v) => v.id === "denominator")?.default ?? 4;
    return (
      <div className="p-2">
        <div className="mb-1 text-center text-[9px] font-bold text-indigo-800 dark:text-indigo-200">
          {num}/{den}
        </div>
        <div className="flex h-5 gap-px overflow-hidden rounded border border-indigo-200/60">
          {Array.from({ length: den }).map((_, i) => (
            <div
              key={i}
              className={cn("flex-1", i < num ? "bg-indigo-500" : "bg-indigo-100 dark:bg-indigo-900/40")}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[88px]">
      {/* Visual canvas — dominates the thumbnail */}
      <div
        className={cn(
          "absolute inset-0 overflow-hidden rounded-b-md",
          visual === "orbit" ? "bg-black" : "bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-950 dark:to-green-950",
        )}
      >
        {visual === "projectile" ? (
          <>
            <div className="absolute bottom-1 left-1.5 font-mono text-[5px] text-sky-800/80 dark:text-sky-300/80">
              v₀={v0} m/s · θ={angle}°
            </div>
            <svg viewBox="0 0 120 50" className="absolute inset-x-0 bottom-0 h-3/4 w-full">
              <path
                d={`M 8 42 Q ${30 + angle / 2} ${8 - v0 / 8} ${Math.min(112, 8 + v0 * 1.2)} 42`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-indigo-600"
              />
              <circle cx="8" cy="42" r="3" className="fill-orange-500" />
            </svg>
          </>
        ) : visual === "orbit" ? (
          <>
            <div className="absolute left-1.5 top-1 font-mono text-[5px] text-blue-300">
              orbit · period ≈ 90 min
            </div>
            <svg viewBox="0 0 80 50" className="absolute inset-0 m-auto h-full w-full p-2">
              <circle cx="40" cy="25" r="10" className="fill-blue-500" />
              <ellipse cx="40" cy="25" rx="28" ry="16" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="66" cy="25" r="2.5" className="fill-amber-400" />
            </svg>
          </>
        ) : (
          <svg viewBox="0 0 100 50" className="absolute inset-0 h-full w-full p-2">
            <line x1="5" y1="42" x2="95" y2="12" stroke="currentColor" strokeWidth="2" className="text-indigo-600" />
            <circle cx="55" cy="25" r="3" className="fill-orange-500" />
          </svg>
        )}
      </div>
      {/* Slider overlay at top */}
      {vars.length > 0 ? (
        <div className="relative z-10 mx-1.5 mt-1 space-y-0.5 rounded bg-background/85 px-1 py-0.5 backdrop-blur-sm">
          {vars.slice(0, 1).map((v) => (
            <div key={v.id} className="flex items-center gap-1">
              <span className="w-10 shrink-0 truncate text-[5px]">{truncate(v.label, 12)}</span>
              <div className="relative h-1 flex-1 rounded-full bg-indigo-200/80">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-indigo-500"
                  style={{ width: `${((v.default - v.min) / (v.max - v.min)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ManipulativeMock({ content }: { content?: SkillGameContent }) {
  const board = content?.manipulative;
  const task = board?.tasks?.[0];
  const item = board?.items?.find((i) => i.id === task?.itemId) ?? board?.items?.[0];
  const emoji = item?.emoji ?? "🍎";
  const count = task?.targetCount ?? 3;
  const totalTasks = board?.tasks?.length ?? 2;
  return (
    <div className="space-y-1 p-2">
      <div className="text-[6px] leading-snug text-amber-900/90 dark:text-amber-100/90">
        <span className="font-semibold">Task 1/{totalTasks}:</span>{" "}
        {truncate(task?.prompt ?? "Add items to the board.", 52)}
      </div>
      {/* Work area — matches real manipulative board */}
      <div className="flex min-h-[36px] flex-wrap items-center gap-0.5 rounded border border-dashed border-amber-400/60 bg-amber-50/80 p-1.5 dark:border-amber-700/40 dark:bg-amber-950/30">
        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <span key={i} className="text-base leading-none">
            {emoji}
          </span>
        ))}
      </div>
      {/* Controls row — matches real +/- UI */}
      <div className="flex items-center gap-1">
        <div className="flex h-4 w-4 items-center justify-center rounded border border-amber-300/70 bg-white text-[8px] font-bold text-amber-800">
          −
        </div>
        <span className="w-3 text-center font-mono text-[7px] font-bold">{count}</span>
        <div className="flex h-4 w-4 items-center justify-center rounded border border-amber-300/70 bg-white text-[8px] font-bold text-amber-800">
          +
        </div>
        <div className="ml-auto rounded bg-amber-600 px-1.5 py-0.5 text-[5px] font-semibold text-white">
          Check count
        </div>
      </div>
    </div>
  );
}

/** Pick the richest mock based on actual content, falling back to gameType. */
function WorkspaceMock({
  gameType,
  content,
}: {
  gameType: SkillGameType;
  content?: SkillGameContent;
}) {
  if (content?.intakeForm) return <IntakeMock content={content} />;
  if (content?.spreadsheet) return <SpreadsheetMock content={content} />;
  if (content?.terminal) return <TerminalMock content={content} />;
  if (content?.patientChart) return <PatientChartMock content={content} />;
  if (content?.helpdeskQueue) return <TicketQueueMock content={content} />;
  if (content?.jobsite) return <JobsiteMock content={content} />;
  if (content?.labBench) return <LabBenchMock content={content} />;
  if (content?.simCanvas) return <SimCanvasMock content={content} />;
  if (content?.manipulative) return <ManipulativeMock content={content} />;

  switch (gameType) {
    case "intake-form-workspace":
      return <IntakeMock content={content} />;
    case "spreadsheet-workspace":
      return <SpreadsheetMock content={content} />;
    case "terminal-workspace":
      return <TerminalMock content={content} />;
    case "patient-chart-workspace":
      return <PatientChartMock content={content} />;
    case "helpdesk-ticket-queue":
      return <TicketQueueMock content={content} />;
    case "jobsite-workspace":
      return <JobsiteMock content={content} />;
    case "lab-bench-workspace":
      return <LabBenchMock content={content} />;
    case "sim-canvas-workspace":
      return <SimCanvasMock content={content} />;
    case "manipulative-board":
      return <ManipulativeMock content={content} />;
    default:
      return <IntakeMock content={content} />;
  }
}

export function LabWorkspaceThumbnail({
  gameType,
  content,
  title,
  className,
  size = "md",
}: {
  gameType: SkillGameType;
  content?: SkillGameContent;
  title?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const style = TYPE_STYLES[gameType];
  const isDark = gameType === "terminal-workspace";
  const isCanvas = gameType === "sim-canvas-workspace" || !!content?.simCanvas;
  const windowTitle =
    title ??
    content?.intakeForm?.title ??
    content?.spreadsheet?.title ??
    content?.terminal?.title ??
    content?.patientChart?.title ??
    content?.jobsite?.title ??
    content?.labBench?.title ??
    content?.simCanvas?.title ??
    content?.manipulative?.title ??
    content?.helpdeskQueue?.title;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border shadow-inner",
        isDark ? "border-zinc-700" : "border-border/60",
        size === "sm" && "h-32",
        size === "md" && "h-44",
        size === "lg" && "h-56",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", style.bg)} />
      <div
        className={cn(
          "relative flex items-center gap-1.5 border-b px-2 py-0.5",
          isDark ? "border-white/10 bg-zinc-900/80" : "border-black/5 bg-white/60 dark:bg-background/60",
        )}
      >
        <div className="flex gap-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400/80" />
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/80" />
          <div className="h-1.5 w-1.5 rounded-full bg-green-400/80" />
        </div>
        {windowTitle ? (
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[7px] font-medium",
              isDark ? "text-green-300/90" : "text-foreground/75",
            )}
          >
            {truncate(windowTitle, 42)}
          </span>
        ) : null}
      </div>
      <div className={cn("relative overflow-hidden", isCanvas && "h-[calc(100%-18px)]")}>
        <WorkspaceMock gameType={gameType} content={content} />
      </div>
    </div>
  );
}
