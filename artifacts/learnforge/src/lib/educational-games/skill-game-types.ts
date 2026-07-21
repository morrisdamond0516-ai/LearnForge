export type SkillGameType =
  | "code-trace"
  | "typing-drill"
  | "sequence-build"
  | "match-pairs"
  | "math-scenario"
  | "script-choice"
  | "spreadsheet-workspace"
  | "terminal-workspace"
  | "patient-chart-workspace"
  | "jobsite-workspace"
  | "sim-canvas-workspace"
  | "lab-bench-workspace"
  | "manipulative-board"
  | "intake-form-workspace"
  | "helpdesk-ticket-queue";

export const SKILL_GAME_TYPE_LABELS: Record<SkillGameType, string> = {
  "match-pairs": "Memory match",
  "math-scenario": "Problem solving",
  "sequence-build": "Step ordering",
  "script-choice": "Scenario choices",
  "typing-drill": "Typing practice",
  "code-trace": "Code + build",
  "spreadsheet-workspace": "Live spreadsheet",
  "terminal-workspace": "Command-line lab",
  "patient-chart-workspace": "Patient chart",
  "jobsite-workspace": "Jobsite workspace",
  "sim-canvas-workspace": "Interactive simulation",
  "lab-bench-workspace": "Lab bench",
  "manipulative-board": "Hands-on board",
  "intake-form-workspace": "Professional intake form",
  "helpdesk-ticket-queue": "Help desk ticket queue",
};

/** Engines where the learner works in a real workspace (not multiple-choice drills). */
export const WORKSPACE_LAB_TYPES = new Set<SkillGameType>([
  "spreadsheet-workspace",
  "terminal-workspace",
  "patient-chart-workspace",
  "jobsite-workspace",
  "sim-canvas-workspace",
  "lab-bench-workspace",
  "manipulative-board",
  "intake-form-workspace",
  "helpdesk-ticket-queue",
]);

export function isWorkspaceLab(gameType: SkillGameType): boolean {
  return WORKSPACE_LAB_TYPES.has(gameType);
}

export const SKILL_GAME_TYPE_INSTRUCTIONS: Record<SkillGameType, string> = {
  "match-pairs":
    "Flip two cards at a time. Match each term with its correct definition. All pairs must match to finish — fewer moves means a better score.",
  "math-scenario":
    "Read each problem and pick the best answer. You get instant feedback and an explanation after every question.",
  "sequence-build":
    "Put the steps in the correct order using the up/down arrows, then check your answer. Order matters from first step to last.",
  "script-choice":
    "Read each real-world scenario and choose the best professional response. Feedback explains why each choice works or doesn't.",
  "typing-drill":
    "Type each phrase exactly as shown. Context hints tell you when you'd use this language on the job or in class.",
  "code-trace":
    "First, trace the code and fix the bug. Then assemble the PC parts in the correct build order.",
  "spreadsheet-workspace":
    "Work in a real grid like Excel — type formulas, fix data, and complete tasks your manager assigned.",
  "terminal-workspace":
    "Use a command-line terminal like on the job — run commands, read output, and fix the issue step by step.",
  "patient-chart-workspace":
    "Document vitals and chart notes like in a clinic — enter values, spot abnormal readings, complete the chart.",
  "jobsite-workspace":
    "Measure, calculate, and sequence steps on a jobsite — the math and order trades use every day.",
  "sim-canvas-workspace":
    "Adjust variables on the simulation canvas and answer questions — like PhET interactive science labs.",
  "lab-bench-workspace":
    "Follow lab procedure step by step — select reagents, measure, and record observations.",
  "manipulative-board":
    "Drag and group objects on the board to build number sense — counting and grouping like in early classrooms.",
  "intake-form-workspace":
    "Complete a professional intake or report form with the correct fields — the paperwork pros do every shift.",
  "helpdesk-ticket-queue":
    "Work a real ticket queue — read each ticket, pick the right next action (resolve, escalate, or ask for info), and close the shift.",
};

export type ScriptScenario = {
  prompt: string;
  options: { text: string; feedback: string; points: number }[];
};

export type MathScenario = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

/** Short MC questions for lab warm-up (prep) or retention check (recall). */
export type LabPhaseQuestion = MathScenario;

export type MatchPair = { term: string; definition: string };

export type CodeChallenge = {
  title: string;
  code: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  codeSubtitle?: string;
};

export type TypingPhrase = { text: string; context: string };

export type SpreadsheetCellTask = {
  instruction: string;
  targetCell: string;
  expectedValue: string;
  formulaHint?: string;
};

export type SpreadsheetWorkspaceContent = {
  title: string;
  brief: string;
  headers: string[];
  rows: string[][];
  tasks: SpreadsheetCellTask[];
};

export type TerminalStep = {
  instruction: string;
  expectedCommand: string;
  expectedOutputContains?: string;
  hint?: string;
};

export type TerminalWorkspaceContent = {
  title: string;
  brief: string;
  hostname: string;
  prompt: string;
  initialOutput?: string;
  steps: TerminalStep[];
};

export type PatientChartTask = {
  field: string;
  label: string;
  expected: string;
  unit?: string;
  normalRange?: string;
};

export type PatientChartWorkspaceContent = {
  title: string;
  brief: string;
  patientName: string;
  chiefComplaint: string;
  tasks: PatientChartTask[];
};

export type JobsiteTask = {
  prompt: string;
  answer: string;
  unit?: string;
  explanation: string;
};

export type JobsiteWorkspaceContent = {
  title: string;
  brief: string;
  tasks: JobsiteTask[];
  sequence?: string[];
};

export type SimCanvasVariable = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
};

export type SimCanvasQuestion = {
  prompt: string;
  /** Evaluate vars to get expected numeric answer */
  evaluate: (vars: Record<string, number>) => number;
  tolerance?: number;
  unit?: string;
  explanation: string;
};

export type SimCanvasWorkspaceContent = {
  title: string;
  brief: string;
  visual: "projectile" | "orbit" | "graph" | "fraction";
  variables: SimCanvasVariable[];
  questions: SimCanvasQuestion[];
};

export type LabBenchStep = {
  instruction: string;
  choices: { label: string; correct: boolean; feedback: string }[];
};

export type LabBenchWorkspaceContent = {
  title: string;
  brief: string;
  steps: LabBenchStep[];
};

export type ManipulativeItem = {
  id: string;
  emoji: string;
  label: string;
};

export type ManipulativeTask = {
  prompt: string;
  itemId: string;
  targetCount: number;
};

export type ManipulativeBoardContent = {
  title: string;
  brief: string;
  items: ManipulativeItem[];
  tasks: ManipulativeTask[];
};

export type IntakeFormField = {
  id: string;
  label: string;
  type: "text" | "select" | "textarea";
  options?: string[];
  expected: string;
  hint?: string;
};

export type IntakeFormWorkspaceContent = {
  title: string;
  brief: string;
  scenario: string;
  fields: IntakeFormField[];
};

export type HelpdeskTicketAction = {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
};

export type HelpdeskTicket = {
  id: string;
  subject: string;
  requester: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  category: string;
  description: string;
  /** CompTIA A+ style domain tag */
  aPlusDomain: string;
  actions: HelpdeskTicketAction[];
};

export type HelpdeskTicketQueueContent = {
  title: string;
  brief: string;
  queueName: string;
  tickets: HelpdeskTicket[];
};

export type SkillGameContent = {
  script?: ScriptScenario[];
  math?: MathScenario[];
  pairs?: MatchPair[];
  sequence?: string[];
  code?: CodeChallenge[];
  pcBuild?: string[];
  typing?: TypingPhrase[];
  spreadsheet?: SpreadsheetWorkspaceContent;
  terminal?: TerminalWorkspaceContent;
  patientChart?: PatientChartWorkspaceContent;
  jobsite?: JobsiteWorkspaceContent;
  simCanvas?: SimCanvasWorkspaceContent;
  labBench?: LabBenchWorkspaceContent;
  manipulative?: ManipulativeBoardContent;
  intakeForm?: IntakeFormWorkspaceContent;
  helpdeskQueue?: HelpdeskTicketQueueContent;
  codePhaseSubtitle?: string;
  buildPhaseTitle?: string;
  buildPhaseSubtitle?: string;
  finishTitle?: string;
};

export function getSkillGameFormatSummary(
  gameType: SkillGameType,
  content: SkillGameContent,
): string {
  switch (gameType) {
    case "math-scenario":
      return `${content.math?.length ?? 0} problems`;
    case "match-pairs":
      return `${content.pairs?.length ?? 0} pairs to match`;
    case "sequence-build":
      return `${content.sequence?.length ?? 0} steps to order`;
    case "script-choice":
      return `${content.script?.length ?? 0} scenarios`;
    case "typing-drill":
      return `${content.typing?.length ?? 0} phrases to type`;
    case "code-trace":
      return `${content.code?.length ?? 0} code puzzles + PC build`;
    case "spreadsheet-workspace":
      return `${content.spreadsheet?.tasks.length ?? 0} spreadsheet tasks`;
    case "terminal-workspace":
      return `${content.terminal?.steps.length ?? 0} terminal steps`;
    case "patient-chart-workspace":
      return `${content.patientChart?.tasks.length ?? 0} chart entries`;
    case "jobsite-workspace":
      return `${content.jobsite?.tasks.length ?? 0} jobsite tasks`;
    case "sim-canvas-workspace":
      return `${content.simCanvas?.questions.length ?? 0} simulation questions`;
    case "lab-bench-workspace":
      return `${content.labBench?.steps.length ?? 0} lab steps`;
    case "manipulative-board":
      return `${content.manipulative?.tasks.length ?? 0} board tasks`;
    case "intake-form-workspace":
      return `${content.intakeForm?.fields.length ?? 0} form fields`;
    case "helpdesk-ticket-queue":
      return `${content.helpdeskQueue?.tickets.length ?? 0} tickets`;
    default:
      return SKILL_GAME_TYPE_LABELS[gameType];
  }
}
