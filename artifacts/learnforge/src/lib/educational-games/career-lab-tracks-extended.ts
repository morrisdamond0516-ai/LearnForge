/**
 * Research-based multi-lab tracks for careers that need authentic practice.
 *
 * Criteria for a lab track (not quiz-only / not typing-only):
 * - Job uses tools daily (spreadsheet, terminal, chart, form, code, jobsite math)
 * - Mistakes have real consequences (safety, money, compliance, patients)
 * - Employers hire on demonstrated skill, not reading alone
 *
 * Added / expanded here: Software Developer, healthcare, trades, office, PM,
 * bookkeeping, teaching, public safety, real estate, cosmetology, casework.
 */
import type { CareerSkillSlug } from "./career-skills-catalog";
import type {
  LabPhaseQuestion,
  SkillGameContent,
  SkillGameType,
} from "./skill-game-types";

export type CareerLabModule = {
  id: string;
  title: string;
  description: string;
  gameType: SkillGameType;
  duration: string;
  domain: string;
  content: SkillGameContent;
  /** Optional warm-up questions before the hands-on workspace (Step 1). */
  prep?: LabPhaseQuestion[];
  /** Optional retention check after the workspace (Step 3). */
  recall?: LabPhaseQuestion[];
};

export function moduleHasPhasedFlow(_mod: CareerLabModule): boolean {
  return true;
}

export const CAREER_LAB_TRACKS_EXTENDED: Partial<
  Record<CareerSkillSlug, CareerLabModule[]>
> = {
  "software-developer": [
    {
      id: "dev-ticket-intake",
      title: "Bug Ticket Intake",
      description:
        "Capture repro steps, environment, and severity before you debug — how real teams triage work.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Agile / triage",
      content: {
        intakeForm: {
          title: "JIRA — Login crash on mobile",
          brief: "Complete intake before assigning sprint work.",
          scenario: "iOS app crashes on login when user taps SSO — production since last release.",
          fields: [
            { id: "severity", label: "Severity", type: "select", options: ["P1-Critical", "P3-Low"], expected: "P1-Critical" },
            { id: "env", label: "Environment", type: "select", options: ["Production", "Local only"], expected: "Production" },
            { id: "repro", label: "Repro steps documented?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "owner", label: "Assigned team", type: "text", expected: "Platform", hint: "Platform" },
          ],
        },
      },
    },
    {
      id: "dev-debug",
      title: "Debug the Broken Script",
      description: "Find syntax and logic bugs like a junior developer on a ticket.",
      gameType: "code-trace",
      duration: "10–14 min",
      domain: "Coding",
      content: {
        code: [
          {
            title: "Off-by-one in a loop",
            code: `scores = [88, 92, 75]
total = 0
for i in range(len(scores) + 1):
  total += scores[i]
print(total / len(scores))`,
            question: "What goes wrong at runtime?",
            options: [
              "Division by zero",
              "IndexError — loop runs one past the list",
              "scores is immutable",
              "print cannot divide",
            ],
            correctIndex: 1,
            explanation: "range(len(scores)+1) visits an invalid index.",
          },
          {
            title: "Null / undefined access",
            code: `user = null
console.log(user.name.toUpperCase())`,
            question: "Best fix before reading user.name?",
            options: [
              "Ignore the error",
              "Guard: if (user && user.name) { ... }",
              "Delete the line permanently",
              "Convert null to 0",
            ],
            correctIndex: 1,
            explanation: "Null-check before property access prevents crashes.",
          },
        ],
        pcBuild: [
          "Clarify requirements and acceptance criteria",
          "Write failing test or reproduce the bug",
          "Implement the smallest fix",
          "Run tests / manual check",
          "Open pull request with clear description",
          "Address review feedback and merge",
        ],
        codePhaseSubtitle: "Debug first, then order the delivery workflow",
        buildPhaseTitle: "Ship checklist",
        buildPhaseSubtitle: "Order the steps of a professional code change",
      },
    },
    {
      id: "dev-git-cli",
      title: "Git CLI Workflow",
      description: "status → add → commit — the daily developer terminal loop.",
      gameType: "terminal-workspace",
      duration: "8–12 min",
      domain: "Version control",
      content: {
        terminal: {
          title: "Feature branch — save your work",
          brief: "You fixed a bug locally. Stage and commit with a clear message.",
          hostname: "dev-laptop",
          prompt: "C:\\repos\\app> ",
          initialOutput: "On branch fix/login-crash — 1 file modified: auth.js",
          steps: [
            {
              instruction: "Show the working tree status.",
              expectedCommand: "git status",
              hint: "git status",
            },
            {
              instruction: "Stage all changes.",
              expectedCommand: "git add .",
              hint: "git add .",
            },
            {
              instruction: "Create a commit with a message.",
              expectedCommand: 'git commit -m "fix login null crash"',
              hint: 'git commit -m "fix login null crash"',
            },
            {
              instruction: "Confirm the working tree is clean.",
              expectedCommand: "git status",
              hint: "git status",
            },
          ],
        },
      },
    },
    {
      id: "dev-ci-terminal",
      title: "CI Pipeline Terminal",
      description:
        "Run tests and lint locally before push — the daily quality gate developers use.",
      gameType: "terminal-workspace",
      duration: "8–12 min",
      domain: "DevOps basics",
      content: {
        terminal: {
          title: "Pre-push checks — feature/login-fix",
          brief: "Verify tests pass before opening your pull request.",
          hostname: "dev-laptop",
          prompt: "C:\\repos\\app> ",
          initialOutput: "You fixed auth.js — run the standard check script before git push.",
          steps: [
            {
              instruction: "Install dependencies if needed (npm install).",
              expectedCommand: "npm install",
              hint: "npm install",
            },
            {
              instruction: "Run the unit test suite.",
              expectedCommand: "npm test",
              hint: "npm test",
            },
            {
              instruction: "Run the linter.",
              expectedCommand: "npm run lint",
              hint: "npm run lint",
            },
          ],
        },
      },
    },
    {
      id: "dev-complexity",
      title: "Complexity & Data Basics",
      description: "Choose Big-O and structure tradeoffs interviewers expect.",
      gameType: "math-scenario",
      duration: "6–10 min",
      domain: "CS fundamentals",
      content: {
        math: [
          {
            prompt: "Looking up a key in a hash map (average case) is…",
            options: ["O(n)", "O(1)", "O(n²)", "O(log n) only"],
            correctIndex: 1,
            explanation: "Average hash map lookup is constant time.",
          },
          {
            prompt: "Nested loop over n items then n items is typically…",
            options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            correctIndex: 2,
            explanation: "n × n iterations → quadratic.",
          },
          {
            prompt: "Best structure for FIFO task queue?",
            options: ["Stack only", "Queue", "Unsorted array scans only", "Binary tree required"],
            correctIndex: 1,
            explanation: "Queues process first-in, first-out.",
          },
        ],
      },
    },
    {
      id: "dev-code-review",
      title: "Code Review Judgment",
      description: "Respond professionally to review feedback and insecure PRs.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Team skills",
      content: {
        script: [
          {
            prompt: "A PR hard-codes an API key in source. You are reviewing.",
            options: [
              {
                text: "Approve — it works in staging",
                feedback: "Secrets in source are a critical security failure.",
                points: 0,
              },
              {
                text: "Request changes: move secret to env / vault and rotate the key",
                feedback: "Correct — block merge until secrets are handled.",
                points: 3,
              },
              {
                text: "Quietly copy the key for your own scripts",
                feedback: "Never exfiltrate credentials.",
                points: 0,
              },
            ],
          },
          {
            prompt: "Reviewer asks you to split a 1,200-line PR.",
            options: [
              {
                text: "Argue that bigger PRs are faster",
                feedback: "Large PRs hide bugs and slow review.",
                points: 0,
              },
              {
                text: "Split into smaller focused PRs with clear descriptions",
                feedback: "Professional teams prefer reviewable diffs.",
                points: 3,
              },
              {
                text: "Force-merge to main",
                feedback: "Bypassing review breaks trust and safety.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
    {
      id: "dev-deliver",
      title: "Feature Delivery Sequence",
      description: "Order how professional teams ship a feature safely.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Process",
      content: {
        sequence: [
          "Clarify user story and acceptance criteria",
          "Implement on a feature branch with tests",
          "Open PR and address code review",
          "Merge, deploy to staging, verify",
          "Release to production and monitor errors",
        ],
      },
    },
    {
      id: "dev-ai-coding",
      title: "AI Coding Assistant Judgment",
      description:
        "Copilot and ChatGPT are daily tools — learn when to accept, test, or reject AI-generated code.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "AI + engineering",
      content: {
        script: [
          {
            prompt:
              "Copilot suggests a 40-line function that 'fixes' the bug. You don't fully understand it but the tests pass locally.",
            options: [
              {
                text: "Merge immediately — green tests mean it's fine",
                feedback: "Tests can miss edge cases; you own maintainability and security.",
                points: 0,
              },
              {
                text: "Read line-by-line, add cases, get review, then merge",
                feedback: "Professional teams treat AI code as a draft that still needs human review.",
                points: 3,
              },
              {
                text: "Delete your tests so nothing fails",
                feedback: "Never weaken quality gates for speed.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "ChatGPT returns a login handler that builds SQL with string concatenation from user input.",
            options: [
              {
                text: "Ship it — AI writes production-ready security",
                feedback: "LLMs often produce SQL injection and other classic vulnerabilities.",
                points: 0,
              },
              {
                text: "Reject; rewrite with parameterized queries and security review",
                feedback: "You must verify security properties AI cannot guarantee.",
                points: 3,
              },
              {
                text: "Add a comment 'TODO: security' and merge",
                feedback: "Known-vulnerable code must not reach production.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "You're stuck on a prod bug and paste a log snippet with API keys into a public chatbot.",
            options: [
              {
                text: "Fine — delete the chat after you get the answer",
                feedback: "Secrets may already be retained; use approved tools and redacted logs.",
                points: 0,
              },
              {
                text: "Redact secrets, use company-approved AI or internal docs only",
                feedback: "Credential hygiene applies to every AI prompt.",
                points: 3,
              },
              {
                text: "Rotate keys only if the chatbot company asks",
                feedback: "Assume exposure once secrets leave your controlled environment.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "A teammate commits AI-generated code under their name without noting AI assistance in the PR.",
            options: [
              {
                text: "No issue — AI output is theirs once pasted",
                feedback: "Teams need transparency to review license, security, and quality risks.",
                points: 1,
              },
              {
                text: "Ask them to disclose AI use, verify license terms, and document what was tested",
                feedback: "Disclosure + verification is becoming standard engineering practice.",
                points: 3,
              },
              {
                text: "Report them for cheating",
                feedback: "AI is a tool; the issue is undisclosed risk, not tool use itself.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
  ],

  bookkeeper: [
    {
      id: "bk-ledger",
      title: "Monthly Expense Ledger",
      description: "Sum categories with spreadsheet formulas.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Bookkeeping",
      content: {
        spreadsheet: {
          title: "Monthly Ledger — Riverside Consulting",
          brief: "Complete highlighted totals for the month-end close.",
          headers: ["", "A", "B", "C", "D"],
          rows: [
            ["1", "Category", "Jan", "Feb", "Total"],
            ["2", "Software", "420", "380", ""],
            ["3", "Travel", "150", "890", ""],
            ["4", "Supplies", "75", "120", ""],
            ["5", "TOTALS", "", "", ""],
          ],
          tasks: [
            {
              instruction: "Software total in D2 (Jan+Feb).",
              targetCell: "D2",
              expectedValue: "800",
              formulaHint: "=B2+C2",
            },
            {
              instruction: "Travel total in D3.",
              targetCell: "D3",
              expectedValue: "1040",
              formulaHint: "=B3+C3",
            },
            {
              instruction: "Grand total in D5 (D2:D4).",
              targetCell: "D5",
              expectedValue: "2035",
              formulaHint: "=SUM(D2:D4)",
            },
          ],
        },
      },
    },
    {
      id: "bk-reconcile",
      title: "Bank Rec Worksheet",
      description: "Reconcile book balance to bank statement.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Reconciliation",
      content: {
        spreadsheet: {
          title: "Bank Reconciliation",
          brief: "Statement end balance vs books — compute adjusted balance.",
          headers: ["", "A", "B"],
          rows: [
            ["1", "Item", "Amount"],
            ["2", "Bank statement balance", "5000", ""],
            ["3", "Deposits in transit", "400", ""],
            ["4", "Outstanding checks", "250", ""],
            ["5", "Adjusted bank balance", "", ""],
          ],
          tasks: [
            {
              instruction: "Adjusted = statement + deposits − checks in B5 (5150).",
              targetCell: "B5",
              expectedValue: "5150",
              formulaHint: "=B2+B3-B4",
            },
          ],
        },
      },
    },
    {
      id: "bk-concepts",
      title: "Debits, Credits & Controls",
      description: "Core accounting judgment questions.",
      gameType: "math-scenario",
      duration: "6–10 min",
      domain: "Accounting basics",
      content: {
        math: [
          {
            prompt: "To increase cash (asset), you typically…",
            options: ["Credit cash", "Debit cash", "Ignore the entry", "Only use journals later"],
            correctIndex: 1,
            explanation: "Assets increase with debits.",
          },
          {
            prompt: "A $50 bank fee on the statement not yet in books should…",
            options: [
              "Be ignored",
              "Be recorded as an expense / reduce cash in books",
              "Increase revenue",
              "Delete the statement",
            ],
            correctIndex: 1,
            explanation: "Book-to-bank differences need adjusting entries.",
          },
        ],
      },
    },
    {
      id: "bk-ai-automation",
      title: "AI & Automation in Bookkeeping",
      description:
        "Accounting software now auto-codes and reconciles with AI — learn what to trust and what to verify.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "AI + accounting",
      content: {
        script: [
          {
            prompt:
              "QuickBooks AI auto-categorized 200 receipts. Month-end is tomorrow. The owner wants you to close without review.",
            options: [
              {
                text: "Close the books — AI is more accurate than humans",
                feedback: "Auto-coding mislabels meals, capital assets, and owner draws routinely.",
                points: 0,
              },
              {
                text: "Sample high-dollar and unusual items, fix miscodes, then close",
                feedback: "Analysts verify automation; auditors will ask how you validated.",
                points: 3,
              },
              {
                text: "Delete all AI suggestions and re-enter everything manually",
                feedback: "AI can speed work; blind manual redo wastes time without adding control.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "A coworker uploads the full payroll register to a free AI tool to 'write variance commentary.'",
            options: [
              {
                text: "Good idea — saves time on the management report",
                feedback: "Payroll is sensitive PII; external AI may violate policy and privacy law.",
                points: 0,
              },
              {
                text: "Stop the upload; use anonymized summaries in approved systems only",
                feedback: "Governance applies to accounting data like any customer database.",
                points: 3,
              },
              {
                text: "Only wrong if the file includes SSN formatting",
                feedback: "Names, pay rates, and hours are still sensitive.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "Bank feed AI matched a $4,800 wire to 'Office Supplies' but memo says 'Equipment deposit.'",
            options: [
              {
                text: "Accept the match — the AI learned from past entries",
                feedback: "Large misclassifications distort financial statements and tax lines.",
                points: 0,
              },
              {
                text: "Open the transaction, read source docs, reclassify to fixed assets",
                feedback: "Human judgment on material items is still core bookkeeping skill.",
                points: 3,
              },
              {
                text: "Split 50/50 between supplies and equipment",
                feedback: "Use source documents for one correct classification.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
  ],

  "project-management": [
    {
      id: "pm-risk-intake",
      title: "Risk Register Entry",
      description:
        "Log a project risk with probability, impact, and mitigation — PMP/CAPM core deliverable.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Risk management",
      content: {
        intakeForm: {
          title: "Risk Register — Website Redesign",
          brief: "Document the risk before the stakeholder review meeting.",
          scenario: "Third-party API vendor may deprecate v2 endpoint before go-live.",
          fields: [
            { id: "risk", label: "Risk description", type: "text", expected: "API deprecation before launch", hint: "API deprecation before launch" },
            { id: "prob", label: "Probability", type: "select", options: ["High", "Medium", "Low"], expected: "Medium" },
            { id: "impact", label: "Impact", type: "select", options: ["High", "Medium", "Low"], expected: "High" },
            { id: "response", label: "Response strategy", type: "select", options: ["Mitigate — build adapter layer", "Accept", "Ignore"], expected: "Mitigate — build adapter layer" },
          ],
        },
      },
    },
    {
      id: "pm-status-report",
      title: "Weekly Status Report",
      description:
        "Summarize schedule, budget, and blockers for executive stakeholders.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Reporting",
      content: {
        spreadsheet: {
          title: "Project Status — Sprint 6",
          brief: "Complete the RAG status table for the steering committee.",
          headers: ["", "A", "B", "C"],
          rows: [
            ["1", "Area", "Planned", "Actual"],
            ["2", "Tasks completed", "12", "10"],
            ["3", "Budget spent ($)", "45000", "48200"],
            ["4", "Variance ($)", "", ""],
          ],
          tasks: [
            { instruction: "Task variance in C2 (Actual − Planned).", targetCell: "C4", expectedValue: "-2", formulaHint: "=B2-C2 (task shortfall)" },
            { instruction: "Budget variance in C4 (Actual − Planned).", targetCell: "C4", expectedValue: "3200", formulaHint: "=C3-B3" },
          ],
        },
      },
    },
    {
      id: "pm-budget",
      title: "Sprint Budget Sheet",
      description: "Track task costs and remaining budget.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Cost",
      content: {
        spreadsheet: {
          title: "Sprint Budget Tracker",
          brief: "Complete cost totals for the agile sprint.",
          headers: ["", "A", "B", "C"],
          rows: [
            ["1", "Task", "Hours", "Cost"],
            ["2", "Design", "10", "500"],
            ["3", "Build", "40", "2000"],
            ["4", "Test", "15", "750"],
            ["5", "Total Cost", "", ""],
          ],
          tasks: [
            {
              instruction: "Sum costs in C5 (C2:C4).",
              targetCell: "C5",
              expectedValue: "3250",
              formulaHint: "=SUM(C2:C4)",
            },
          ],
        },
      },
    },
    {
      id: "pm-lifecycle",
      title: "Project Lifecycle Order",
      description: "Order Initiate → Plan → Execute → Monitor → Close.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "PMP process",
      content: {
        sequence: [
          "Initiate: charter, stakeholders, high-level scope",
          "Plan: WBS, schedule, budget, risk register",
          "Execute: direct team work and manage communications",
          "Monitor & control: track variance, change requests",
          "Close: final deliverables, lessons learned, release team",
        ],
      },
    },
    {
      id: "pm-stakeholders",
      title: "Stakeholder Conversations",
      description: "Handle scope creep and status honestly.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Leadership",
      content: {
        script: [
          {
            prompt: "Sponsor wants a large feature mid-sprint with no extra time.",
            options: [
              {
                text: "Say yes silently and hope the team overtime covers it",
                feedback: "Hidden commitments destroy trust and quality.",
                points: 0,
              },
              {
                text: "Log a change request: impact on scope, time, cost",
                feedback: "Change control is core PM practice.",
                points: 3,
              },
              {
                text: "Refuse rudely and ignore the sponsor",
                feedback: "Collaborate with data, don't stonewall.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
  ],

  electrician: [
    {
      id: "elec-panel-intake",
      title: "Panel Schedule Intake",
      description:
        "Document circuit assignments and amperage on a residential panel schedule — apprentice paperwork.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Code compliance",
      content: {
        intakeForm: {
          title: "200A Residential Panel Schedule",
          brief: "Record circuit assignments before the inspector arrives.",
          scenario: "New construction — kitchen GFCI, HVAC, and dryer circuits need documenting.",
          fields: [
            { id: "circuit1", label: "Circuit 1–2 (240V) assignment", type: "text", expected: "Electric range", hint: "Electric range" },
            { id: "circuit3", label: "Circuit 3 (20A) assignment", type: "text", expected: "Kitchen GFCI", hint: "Kitchen GFCI" },
            { id: "circuit5", label: "Circuit 5–6 (240V) assignment", type: "text", expected: "HVAC condenser", hint: "HVAC condenser" },
            { id: "ground", label: "Grounding electrode connected?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "elec-service-ticket",
      title: "Service Call Work Order",
      description:
        "Complete a residential service call ticket with findings and parts — field paperwork.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Field documentation",
      content: {
        intakeForm: {
          title: "Work Order — No Power to Outlet",
          brief: "Document findings before invoicing.",
          scenario: "Kitchen outlet dead. Found tripped GFCI upstream in garage — reset resolved.",
          fields: [
            { id: "complaint", label: "Customer complaint", type: "text", expected: "no power to kitchen outlet", hint: "no power to kitchen outlet" },
            { id: "finding", label: "Root cause", type: "text", expected: "tripped GFCI in garage", hint: "tripped GFCI in garage" },
            { id: "action", label: "Corrective action", type: "text", expected: "reset GFCI; tested downstream outlets", hint: "reset GFCI; tested downstream outlets" },
            { id: "parts", label: "Parts used", type: "select", options: ["None", "New GFCI receptacle", "Wire and box"], expected: "None" },
          ],
        },
      },
    },
    {
      id: "elec-jobsite",
      title: "Jobsite Electrical Math",
      description: "Voltage drop and continuous load calculations.",
      gameType: "jobsite-workspace",
      duration: "8–12 min",
      domain: "Field math",
      content: {
        jobsite: {
          title: "Conduit & Load Lab",
          brief: "Calculate like an apprentice on a residential service.",
          tasks: [
            {
              prompt: "3% of 120V max drop — volts?",
              answer: "3.6",
              unit: "volts",
              explanation: "0.03 × 120 = 3.6V.",
            },
            {
              prompt: "80% of a 20A breaker continuous load?",
              answer: "16",
              unit: "amps",
              explanation: "0.8 × 20 = 16A.",
            },
          ],
        },
      },
    },
    {
      id: "elec-safety",
      title: "Lockout Sequence",
      description: "Order safe de-energize steps before work.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Safety",
      content: {
        sequence: [
          "Notify affected people and identify energy sources",
          "Shut down equipment using normal controls",
          "Isolate energy (breakers/disconnects) and apply locks/tags",
          "Verify zero energy with a tested meter",
          "Perform work, then remove locks in reverse and restore power",
        ],
      },
    },
    {
      id: "elec-terms",
      title: "Wire & Device Match",
      description: "Match conductors and devices to their roles.",
      gameType: "match-pairs",
      duration: "5–8 min",
      domain: "Code literacy",
      content: {
        pairs: [
          { term: "Black wire (US typical)", definition: "Hot / ungrounded conductor" },
          { term: "White wire", definition: "Neutral / grounded conductor" },
          { term: "Green or bare copper", definition: "Equipment ground" },
          { term: "GFCI", definition: "Protects people from ground faults near water" },
        ],
      },
    },
  ],

  "hvac-tech": [
    {
      id: "hvac-service-ticket",
      title: "Service Call Work Order",
      description:
        "Document complaint, diagnosis, and refrigerant handled on a residential no-cool call.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Field documentation",
      content: {
        intakeForm: {
          title: "Work Order — No Cooling",
          brief: "Complete before leaving the job site.",
          scenario: "Capacitor failed on condenser — replaced. System charged to spec.",
          fields: [
            { id: "complaint", label: "Customer complaint", type: "text", expected: "no cooling", hint: "no cooling" },
            { id: "finding", label: "Diagnosis", type: "text", expected: "failed run capacitor", hint: "failed run capacitor" },
            { id: "refrigerant", label: "Refrigerant added (oz)", type: "text", expected: "0", hint: "0" },
            { id: "epa", label: "EPA 608 cert type used", type: "select", options: ["Type II", "Universal", "Not applicable"], expected: "Not applicable" },
          ],
        },
      },
    },
    {
      id: "hvac-refrigerant-log",
      title: "Refrigerant Tracking Log",
      description:
        "Record refrigerant purchase, recovery, and disposal per EPA Section 608.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "EPA compliance",
      content: {
        intakeForm: {
          title: "Refrigerant Log — R-410A",
          brief: "Document per EPA 608 requirements before end of day.",
          scenario: "Recovered 2 lb R-410A from a condemned unit. Added 3 lb to new install.",
          fields: [
            { id: "recovered", label: "Recovered (lb)", type: "text", expected: "2", hint: "2" },
            { id: "added", label: "Added to system (lb)", type: "text", expected: "3", hint: "3" },
            { id: "cylinder", label: "Recovery cylinder tagged?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "disposal", label: "Vented to atmosphere?", type: "select", options: ["No — recovered per EPA", "Yes"], expected: "No — recovered per EPA" },
          ],
        },
      },
    },
    {
      id: "hvac-load",
      title: "Cooling Load Field Math",
      description: "Volume and ΔT calculations on a service call.",
      gameType: "jobsite-workspace",
      duration: "8–12 min",
      domain: "Field math",
      content: {
        jobsite: {
          title: "Residential Service Call",
          brief: "Measure and calculate before recommending equipment.",
          tasks: [
            {
              prompt: "Room 18×12×8 ft — volume?",
              answer: "1728",
              unit: "cu ft",
              explanation: "18×12×8 = 1,728.",
            },
            {
              prompt: "Supply 55°F, return 75°F — ΔT?",
              answer: "20",
              unit: "°F",
              explanation: "75 − 55 = 20°F.",
            },
          ],
        },
      },
    },
    {
      id: "hvac-service",
      title: "Service Call Sequence",
      description: "Order a professional HVAC visit.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Process",
      content: {
        sequence: [
          "Arrive, ID yourself, review work order with customer",
          "Inspect workspace and verify electrical disconnect safety",
          "Check thermostat call and measure supply/return temps",
          "Inspect filter, coil, refrigerant lines, and drain",
          "Perform repair or maintenance per manufacturer spec",
          "Test operation, explain findings, collect signature",
        ],
      },
    },
  ],

  cna: [
    {
      id: "cna-vitals",
      title: "Morning Vitals Chart",
      description: "Document BP, pulse, and temperature accurately.",
      gameType: "patient-chart-workspace",
      duration: "6–10 min",
      domain: "Clinical",
      content: {
        patientChart: {
          title: "Morning Vitals — Room 12",
          brief: "Document vitals for Mr. Chen before nurse rounds.",
          patientName: "James Chen, 68M",
          chiefComplaint: "Post-op day 1 — knee replacement",
          tasks: [
            { field: "bp", label: "Blood pressure", expected: "120/78", normalRange: "90–120 / 60–80" },
            { field: "pulse", label: "Pulse (bpm)", expected: "72", normalRange: "60–100", unit: "bpm" },
            { field: "temp", label: "Temperature (°F)", expected: "98.6", normalRange: "97.8–99.1", unit: "°F" },
          ],
        },
      },
    },
    {
      id: "cna-adl-intake",
      title: "ADL Assistance Log",
      description:
        "Document bathing and mobility assistance per care plan — core CNA shift paperwork.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "ADLs",
      content: {
        intakeForm: {
          title: "Morning Care — Room 12",
          brief: "Log ADL support provided before nurse rounds.",
          scenario: "Mr. Chen post-op knee — partial assist with shower and ambulation.",
          fields: [
            { id: "id", label: "Two-patient identifiers verified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "bath", label: "Bathing assistance level", type: "select", options: ["Independent", "Partial assist", "Full assist"], expected: "Partial assist" },
            { id: "mobility", label: "Mobility device used", type: "select", options: ["Walker", "None", "Wheelchair only"], expected: "Walker" },
            { id: "skin", label: "Skin integrity checked?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "cna-io-chart",
      title: "Intake & Output Chart",
      description:
        "Record fluid intake and urine output — essential CNA monitoring skill.",
      gameType: "patient-chart-workspace",
      duration: "6–10 min",
      domain: "Clinical monitoring",
      content: {
        patientChart: {
          title: "I&O Shift Record — Room 12",
          brief: "Document intake and output for the past 8 hours.",
          patientName: "James Chen, 68M",
          chiefComplaint: "Fluid balance monitoring post-op",
          tasks: [
            { field: "intake", label: "Oral intake (mL)", expected: "480", normalRange: "Per care plan", unit: "mL" },
            { field: "output", label: "Urine output (mL)", expected: "350", normalRange: "Report oliguria", unit: "mL" },
            { field: "bm", label: "Bowel movement documented (Yes/No)", expected: "Yes", normalRange: "Document if none" },
          ],
        },
      },
    },
    {
      id: "cna-safety",
      title: "Patient Safety Choices",
      description: "Fall risk, PPE, and escalation judgment.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Safety",
      content: {
        script: [
          {
            prompt: "Patient wants to walk alone after sedation. You should…",
            options: [
              { text: "Let them go — autonomy first", feedback: "Post-sedation fall risk requires assistance/policy.", points: 0 },
              { text: "Stay with them / use assistive device per care plan", feedback: "Safety before convenience.", points: 3 },
              { text: "Ignore the call light", feedback: "Neglect.", points: 0 },
            ],
          },
        ],
      },
    },
    {
      id: "cna-adl",
      title: "ADL Assist Sequence",
      description: "Order safe morning care steps.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "ADLs",
      content: {
        sequence: [
          "Knock, introduce yourself, verify patient identity",
          "Explain procedure and gather supplies",
          "Perform hand hygiene and apply PPE as required",
          "Complete care, ensure call light and bed position safe",
          "Remove PPE, hand hygiene, document",
        ],
      },
    },
  ],

  "medical-assistant": [
    {
      id: "ma-referral-intake",
      title: "Referral & Authorization Intake",
      description:
        "Capture referral details and insurance pre-auth status before scheduling — daily MA admin task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Front office",
      content: {
        intakeForm: {
          title: "Specialist Referral — Cardiology",
          brief: "Complete referral form so scheduler can book.",
          scenario: "Dr. Patel orders cardiology consult for chest tightness patient. Insurance requires pre-auth.",
          fields: [
            { id: "patient", label: "Patient name", type: "text", expected: "Santos, Maria", hint: "Santos, Maria" },
            { id: "specialist", label: "Referred to (specialty)", type: "text", expected: "Cardiology", hint: "Cardiology" },
            { id: "auth", label: "Pre-authorization obtained?", type: "select", options: ["Yes", "Pending", "Not required"], expected: "Pending" },
            { id: "urgency", label: "Urgency", type: "select", options: ["Routine", "Urgent", "Stat"], expected: "Urgent" },
          ],
        },
      },
    },
    {
      id: "ma-medication-log",
      title: "Medication Reconciliation Log",
      description:
        "Verify and document current meds, allergies, and OTCs before provider exam — patient safety core.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Clinical safety",
      content: {
        intakeForm: {
          title: "Med Rec — Pre-Visit Update",
          brief: "Confirm medication list matches patient report.",
          scenario: "Patient added an OTC supplement since last visit. Penicillin allergy on file.",
          fields: [
            { id: "allergy", label: "Allergy verified", type: "text", expected: "Penicillin", hint: "Penicillin" },
            { id: "new_med", label: "New medication/supplement", type: "text", expected: "fish oil 1000 mg daily", hint: "fish oil 1000 mg daily" },
            { id: "changes", label: "Any dose changes since last visit?", type: "select", options: ["Yes", "No"], expected: "No" },
            { id: "provider", label: "Ready for provider review?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "ma-chart",
      title: "Pre-Provider Chart",
      description: "Room the patient and enter vitals before the physician.",
      gameType: "patient-chart-workspace",
      duration: "6–10 min",
      domain: "Clinical",
      content: {
        patientChart: {
          title: "Pre-Provider Vitals",
          brief: "Complete the chart before the physician enters.",
          patientName: "Maria Santos, 52F",
          chiefComplaint: "Chest tightness × 2 days",
          tasks: [
            { field: "bp", label: "Blood pressure", expected: "142/88", normalRange: "< 120/80" },
            { field: "pulse", label: "Pulse", expected: "88", normalRange: "60–100", unit: "bpm" },
            { field: "temp", label: "Temperature (°F)", expected: "99.1", normalRange: "97.8–99.1", unit: "°F" },
          ],
        },
      },
    },
    {
      id: "ma-rooming",
      title: "Rooming Sequence",
      description: "Order clinic rooming workflow.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Clinic flow",
      content: {
        sequence: [
          "Call patient, verify identity and visit reason",
          "Record vitals and update allergies/meds",
          "Prepare exam room / instruments needed",
          "Notify provider patient is ready",
          "Document visit prep in the chart",
        ],
      },
    },
  ],

  "pharmacy-tech": [
    {
      id: "rx-label-intake",
      title: "Prescription Label Verification",
      description:
        "Verify patient, drug, directions, and quantity on the label before pharmacist check — PTCB daily task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Dispensing accuracy",
      content: {
        intakeForm: {
          title: "Label QA — Rx #48291",
          brief: "Catch label errors before the pharmacist signs off.",
          scenario: "Amoxicillin 500 mg, 1 cap TID × 7 days. Patient: Kim Lee. DOB: 04/15/1988.",
          fields: [
            { id: "patient", label: "Patient name matches Rx?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "drug", label: "Drug & strength correct?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "qty", label: "Quantity dispensed", type: "text", expected: "21", hint: "1 × 3 × 7 = 21" },
            { id: "exp", label: "Beyond-use date on label?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "rx-inventory-intake",
      title: "Controlled Substance Count",
      description:
        "Perform perpetual inventory count on Schedule II — DEA compliance task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Inventory / DEA",
      content: {
        intakeForm: {
          title: "C-II Count — Oxycodone 5 mg",
          brief: "Physical count must match log. Document discrepancies per policy.",
          scenario: "Log shows 98 tabs. Physical count: 97 tabs.",
          fields: [
            { id: "log_count", label: "Log quantity", type: "text", expected: "98", hint: "98" },
            { id: "physical", label: "Physical count", type: "text", expected: "97", hint: "97" },
            { id: "match", label: "Counts match?", type: "select", options: ["Yes", "No — discrepancy"], expected: "No — discrepancy" },
            { id: "action", label: "Next step", type: "select", options: ["Notify pharmacist immediately", "Ignore 1-tab difference", "Adjust log silently"], expected: "Notify pharmacist immediately" },
          ],
        },
      },
    },
    {
      id: "rx-math",
      title: "Dosage Calculation Lab",
      description: "Tablet counts and mL doses from sig codes.",
      gameType: "jobsite-workspace",
      duration: "8–12 min",
      domain: "Pharmacy math",
      content: {
        jobsite: {
          title: "Retail Pharmacy — Fill Prescription",
          brief: "Calculate dispense quantities accurately.",
          tasks: [
            {
              prompt: "Amoxicillin 500 mg, 1 tab BID × 10 days — tablets?",
              answer: "20",
              unit: "tablets",
              explanation: "2 × 10 = 20.",
            },
            {
              prompt: "250 mg/5 mL stock; order 500 mg — mL per dose?",
              answer: "10",
              unit: "mL",
              explanation: "Double concentration volume → 10 mL.",
            },
          ],
        },
      },
    },
    {
      id: "rx-safety",
      title: "Dispense Safety Choices",
      description: "Allergy and look-alike drug judgment.",
      gameType: "script-choice",
      duration: "5–8 min",
      domain: "Safety",
      content: {
        script: [
          {
            prompt: "Patient allergy: penicillin. Rx: amoxicillin. You…",
            options: [
              { text: "Fill it — close enough", feedback: "Cross-sensitivity risk — stop and alert pharmacist.", points: 0 },
              { text: "Alert the pharmacist before filling", feedback: "Correct safety escalation.", points: 3 },
              { text: "Tell the patient to take half dose", feedback: "Never counsel dose changes as a tech alone.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "medical-billing-coding": [
    {
      id: "mbc-claim-intake",
      title: "Claim Intake & Superbill",
      description:
        "Complete patient, provider, and date-of-service fields before the claim goes to the payer.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Billing workflow",
      content: {
        intakeForm: {
          title: "CMS-1500 / Professional Claim Intake",
          brief: "Build a clean claim from the office superbill.",
          scenario:
            "Established patient office visit — Dr. Patel, NPI on file — DOS today, group policy primary.",
          fields: [
            {
              id: "patient",
              label: "Patient name (Last, First)",
              type: "text",
              expected: "Nguyen, Linh",
              hint: "Nguyen, Linh",
            },
            {
              id: "dos",
              label: "Date of service (MM/DD/YYYY)",
              type: "text",
              expected: "03/15/2026",
              hint: "03/15/2026",
            },
            {
              id: "provider",
              label: "Rendering provider NPI",
              type: "text",
              expected: "1234567890",
              hint: "1234567890",
            },
            {
              id: "pos",
              label: "Place of service",
              type: "select",
              options: ["11 Office", "21 Inpatient", "23 ER"],
              expected: "11 Office",
            },
          ],
        },
      },
    },
    {
      id: "mbc-era-spreadsheet",
      title: "ERA Payment Reconciliation",
      description:
        "Reconcile allowed amounts, payer payment, and patient responsibility from a remittance — CPC billing desk work.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Revenue cycle",
      content: {
        spreadsheet: {
          title: "ERA — Claim #88421",
          brief: "Enter patient responsibility after payer adjudication.",
          headers: ["", "A", "B", "C", "D"],
          rows: [
            ["1", "Line", "Billed", "Allowed", "Paid"],
            ["2", "99213", "150", "120", "96"],
            ["3", "36415", "25", "20", "16"],
            ["4", "Total paid", "", "", ""],
            ["5", "Patient responsibility", "", "", ""],
          ],
          tasks: [
            {
              instruction: "Sum paid amounts (D2:D3) in D4.",
              targetCell: "D4",
              expectedValue: "112",
              formulaHint: "=SUM(D2:D3)",
            },
            {
              instruction: "Patient responsibility = total allowed (C2:C3) minus total paid (D4) in D5.",
              targetCell: "D5",
              expectedValue: "28",
              formulaHint: "=SUM(C2:C3)-D4",
            },
          ],
        },
      },
    },
    {
      id: "mbc-denial-appeal-intake",
      title: "Denial Appeal Intake",
      description:
        "Log denial reason, appeal deadline, and documentation checklist before resubmission.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Appeals",
      content: {
        intakeForm: {
          title: "Appeal — CO-4 Modifier Mismatch",
          brief: "Payer denied claim; build appeal packet intake.",
          scenario: "ERA code CO-4 on CPT 99213 with modifier 25 — office visit with procedure same day.",
          fields: [
            { id: "reason", label: "Denial code", type: "text", expected: "CO-4", hint: "CO-4" },
            { id: "deadline", label: "Appeal deadline", type: "text", expected: "04/15/2026", hint: "04/15/2026" },
            { id: "doc", label: "Operative note attached?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "corrected", label: "Corrected claim ready?", type: "select", options: ["Yes", "No", "Pending"], expected: "Pending" },
          ],
        },
      },
    },
    {
      id: "mbc-icd-cpt",
      title: "Diagnosis & Procedure Coding",
      description:
        "Pick the best ICD-10-CM and CPT pairing for common outpatient visits (CPC-style judgment).",
      gameType: "math-scenario",
      duration: "8–12 min",
      domain: "ICD-10 / CPT",
      content: {
        math: [
          {
            prompt:
              "Established patient, expanded problem-focused visit, 25 minutes face-to-face. Best CPT level?",
            options: [
              "99211 — minimal",
              "99213 — low complexity established",
              "99215 — high complexity new patient",
              "93000 — ECG only",
            ],
            correctIndex: 1,
            explanation:
              "99213 fits a straightforward established visit; 99215 is for high complexity, not a routine 25-min visit.",
          },
          {
            prompt:
              "Chart documents Type 2 diabetes without complications, on metformin. Primary ICD-10-CM?",
            options: ["E11.9", "I10", "Z00.00", "J06.9"],
            correctIndex: 0,
            explanation: "E11.9 = Type 2 diabetes mellitus without complications.",
          },
          {
            prompt:
              "Procedure note: laceration repair, simple, 2.5 cm, scalp. Typical CPT family?",
            options: [
              "12001–12007 simple repair by length/site",
              "36415 routine venipuncture",
              "99283 ER visit",
              "90471 immunization admin",
            ],
            correctIndex: 0,
            explanation: "Simple repair codes are selected by length and anatomical site.",
          },
        ],
      },
    },
    {
      id: "mbc-denials",
      title: "Denial & Appeals Judgment",
      description:
        "Read remittance advice cues and choose the right billing follow-up.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Revenue cycle",
      content: {
        script: [
          {
            prompt:
              "ERA shows CO-4: procedure code inconsistent with modifier. First best action?",
            options: [
              {
                text: "Rebill identical claim hoping payer changes mind",
                feedback: "Duplicate unchanged claims usually re-deny.",
                points: 0,
              },
              {
                text: "Review superbill, correct CPT/modifier, resubmit with documentation if needed",
                feedback: "Fix the root coding mismatch before resubmission.",
                points: 3,
              },
              {
                text: "Write off balance without review",
                feedback: "Premature write-offs lose legitimate revenue.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "Claim denied CO-29 — time limit for filing has expired. What do you check?",
            options: [
              {
                text: "Whether original submission met payer timely filing rules and proof exists",
                feedback: "Appeals need evidence of timely original or valid exception.",
                points: 3,
              },
              {
                text: "Change the patient DOB and resubmit",
                feedback: "Falsifying demographics is fraud.",
                points: 0,
              },
              {
                text: "Bill the patient immediately with no review",
                feedback: "Verify payer policy and internal submission dates first.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "Prior authorization was required but missing. Office wants to 'add auth number retroactively.'",
            options: [
              {
                text: "Invent an auth number so the claim clears",
                feedback: "Fabricating authorization is compliance fraud.",
                points: 0,
              },
              {
                text: "Follow payer policy: obtain retro auth if allowed, or appeal/write off per contract",
                feedback: "Revenue cycle follows payer rules and documentation.",
                points: 3,
              },
              {
                text: "Ignore — auth only matters for inpatient",
                feedback: "Many outpatient procedures and imaging require prior auth.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
    {
      id: "mbc-ai-coding",
      title: "AI-Assisted Coding Judgment",
      description:
        "EHR and encoder AI suggest codes — learn what to accept, query, and send to compliance.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "AI + HIM",
      content: {
        script: [
          {
            prompt:
              "Encoder AI auto-suggests J06.9 (acute URI) for a visit where the provider documented strep pharyngitis with positive rapid test.",
            options: [
              {
                text: "Accept AI code — faster claim submission",
                feedback: "Specific documented diagnosis should drive code selection.",
                points: 0,
              },
              {
                text: "Code to documented strep (e.g. B95.0 strep as cause) per guidelines and query if unclear",
                feedback: "Coder verifies specificity against provider documentation.",
                points: 3,
              },
              {
                text: "Bill both URI and strep to maximize payment",
                feedback: "Unbundling or conflicting codes trigger audits.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "A coworker pastes full patient notes into a public AI tool to 'guess the CPT code.'",
            options: [
              {
                text: "Smart — AI is trained on medicine",
                feedback: "PHI in external AI violates HIPAA and employer policy.",
                points: 0,
              },
              {
                text: "Stop; use approved encoder or de-identified summaries only",
                feedback: "Same governance as any clinical data handling.",
                points: 3,
              },
              {
                text: "Only wrong if the patient is a minor",
                feedback: "HIPAA applies regardless of patient age.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "AI suggests upcoding 99214 when time and MDM in the note support 99213 only.",
            options: [
              {
                text: "Use 99214 — AI optimizes revenue",
                feedback: "Upcoding beyond documentation is compliance risk.",
                points: 0,
              },
              {
                text: "Code to documented MDM/time; query provider if borderline",
                feedback: "Professional coders align levels with audit-defensible documentation.",
                points: 3,
              },
              {
                text: "Let the biller pick any level — payers don't check",
                feedback: "Payers audit E/M levels routinely.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
  ],

  "office-assistant": [
    {
      id: "office-intake",
      title: "Visitor / Meeting Intake",
      description: "Complete a professional front-desk intake form.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Admin",
      content: {
        intakeForm: {
          title: "Visitor Log",
          brief: "Record a vendor visit for building security.",
          scenario: "Courier from FastShip arriving for Suite 400 — badge required.",
          fields: [
            { id: "name", label: "Visitor full name", type: "text", expected: "Jordan Lee", hint: "Jordan Lee" },
            { id: "company", label: "Company", type: "text", expected: "FastShip", hint: "FastShip" },
            { id: "host", label: "Host employee", type: "text", expected: "A. Rivera", hint: "A. Rivera" },
            {
              id: "purpose",
              label: "Purpose",
              type: "select",
              options: ["Delivery", "Interview", "Maintenance"],
              expected: "Delivery",
            },
          ],
        },
      },
    },
    {
      id: "office-schedule",
      title: "Meeting Cost Sheet",
      description: "Total supplies for a team offsite.",
      gameType: "spreadsheet-workspace",
      duration: "6–10 min",
      domain: "Office math",
      content: {
        spreadsheet: {
          title: "Offsite Supply Budget",
          brief: "Sum line items for the admin budget request.",
          headers: ["", "A", "B"],
          rows: [
            ["1", "Item", "Cost"],
            ["2", "Catering", "240"],
            ["3", "Badges", "35"],
            ["4", "Printouts", "20"],
            ["5", "Total", ""],
          ],
          tasks: [
            {
              instruction: "Total in B5 (B2:B4).",
              targetCell: "B5",
              expectedValue: "295",
              formulaHint: "=SUM(B2:B4)",
            },
          ],
        },
      },
    },
    {
      id: "office-typing",
      title: "Business Email Typing",
      description: "Type professional email phrases accurately.",
      gameType: "typing-drill",
      duration: "3–5 min",
      domain: "Typing",
      content: {
        typing: [
          { text: "Thank you for meeting with us yesterday afternoon.", context: "Follow-up email" },
          { text: "Please find the agenda attached for Friday's standup.", context: "Scheduling" },
        ],
      },
    },
    {
      id: "office-ai-tools",
      title: "AI Tools at the Front Desk",
      description:
        "Copilot and chatbots draft email and schedules — learn verification, tone, and confidentiality.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "AI + admin",
      content: {
        script: [
          {
            prompt:
              "Copilot drafts a reply to a client confirming a $12,000 contract change. You didn't verify the attachment version.",
            options: [
              {
                text: "Send immediately — AI writes professional email",
                feedback: "Wrong attachment or terms create legal and client-trust issues.",
                points: 0,
              },
              {
                text: "Open the source file, confirm numbers, edit tone, then send",
                feedback: "Admins own accuracy; AI is a draft assistant.",
                points: 3,
              },
              {
                text: "Forward to the client with 'AI wrote this'",
                feedback: "You still must verify content before external send.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "A manager asks you to paste the visitor log (names, companies, phone numbers) into a public chatbot for a weekly summary.",
            options: [
              {
                text: "Do it — saves 10 minutes",
                feedback: "Visitor logs are PII; many employers forbid external AI on operational data.",
                points: 0,
              },
              {
                text: "Summarize manually or use an approved internal tool with redacted data",
                feedback: "Data governance applies to front-office records.",
                points: 3,
              },
              {
                text: "Only remove phone numbers and proceed",
                feedback: "Names + companies can still identify individuals.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "Scheduling AI double-booked the conference room and the CEO's calendar for the board prep.",
            options: [
              {
                text: "Let both meetings happen — AI optimized the calendar",
                feedback: "Automation errors need human reconciliation before invites go out.",
                points: 0,
              },
              {
                text: "Resolve the conflict, confirm with both owners, then update invites",
                feedback: "Executive support still requires judgment on priorities.",
                points: 3,
              },
              {
                text: "Cancel the board prep without asking",
                feedback: "Never cancel executive meetings without explicit direction.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
  ],

  "teacher-cert": [
    {
      id: "teach-grade-sheet",
      title: "Gradebook Entry",
      description:
        "Enter scores and calculate averages in a class gradebook — teacher daily admin.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Assessment",
      content: {
        spreadsheet: {
          title: "Grade 6 Math — Unit 3 Scores",
          brief: "Enter formulas for class averages and identify students needing intervention.",
          headers: ["", "A", "B", "C", "D"],
          rows: [
            ["1", "Student", "Quiz 1", "Quiz 2", "Average"],
            ["2", "Aiden", "82", "78", ""],
            ["3", "Bella", "91", "95", ""],
            ["4", "Carlos", "68", "72", ""],
            ["5", "Class Avg", "", "", ""],
          ],
          tasks: [
            { instruction: "Aiden's average in D2.", targetCell: "D2", expectedValue: "80", formulaHint: "=AVERAGE(B2:C2)" },
            { instruction: "Carlos's average in D4.", targetCell: "D4", expectedValue: "70", formulaHint: "=AVERAGE(B4:C4)" },
            { instruction: "Class average of averages in D5.", targetCell: "D5", expectedValue: "82", formulaHint: "=ROUND(AVERAGE(D2:D4),0)" },
          ],
        },
      },
    },
    {
      id: "teach-sub-plan",
      title: "Substitute Teacher Plan",
      description:
        "Complete the sub plan form so instruction continues in your absence — admin requirement.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Planning",
      content: {
        intakeForm: {
          title: "Sub Plan — Mrs. Johnson, Room 204",
          brief: "Leave clear instructions for a guest teacher.",
          scenario: "Absent tomorrow. Period 2 has a quiz; Period 4 is independent reading. Two students have IEP accommodations.",
          fields: [
            { id: "schedule", label: "Period 2 activity", type: "text", expected: "Unit 3 quiz", hint: "Unit 3 quiz" },
            { id: "period4", label: "Period 4 activity", type: "text", expected: "independent reading", hint: "independent reading" },
            { id: "iep", label: "Students with accommodations noted?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "emergency", label: "Emergency contact (dept chair)", type: "text", expected: "Mr. Reyes, Room 210", hint: "Mr. Reyes, Room 210" },
          ],
        },
      },
    },
    {
      id: "teach-plan",
      title: "Lesson Plan Intake",
      description: "Standards, objectives, assessment, accommodations.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Planning",
      content: {
        intakeForm: {
          title: "Lesson Plan Form",
          brief: "Complete a standards-aligned plan for observation.",
          scenario: "Grade 6 math — ratios; 45-minute block.",
          fields: [
            { id: "objective", label: "Learning objective", type: "text", expected: "Students will solve ratio problems", hint: "Students will solve ratio problems" },
            { id: "standard", label: "Standard code", type: "text", expected: "6.RP.A.1", hint: "6.RP.A.1" },
            {
              id: "assessment",
              label: "Exit ticket type",
              type: "select",
              options: ["Quiz", "Discussion", "Project"],
              expected: "Quiz",
            },
          ],
        },
      },
    },
    {
      id: "teach-classroom",
      title: "Classroom Management Choices",
      description: "Respond to disruptions professionally.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Management",
      content: {
        script: [
          {
            prompt: "Two students argue loudly during independent work.",
            options: [
              { text: "Yell across the room to stop", feedback: "Escalates; model calm proximity.", points: 0 },
              { text: "Quiet proximity, separate, reteach expectation", feedback: "Low-profile correction works.", points: 3 },
              { text: "Ignore completely all period", feedback: "Safety and climate suffer.", points: 0 },
            ],
          },
        ],
      },
    },
    {
      id: "teach-ai-classroom",
      title: "AI in the Classroom",
      description:
        "Students and teachers use AI daily — academic integrity, lesson design, and safe classroom policy.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "AI + teaching",
      content: {
        script: [
          {
            prompt:
              "A student turns in an essay that reads like ChatGPT — strong structure, no personal examples from class discussions.",
            options: [
              {
                text: "Grade on writing quality only — you can't prove AI",
                feedback: "District policy usually requires addressing academic integrity with evidence.",
                points: 1,
              },
              {
                text: "Follow school AI policy: conference, revision or integrity referral, document process",
                feedback: "Consistent policy protects students and teachers.",
                points: 3,
              },
              {
                text: "Publicly accuse them in front of the class",
                feedback: "Handle integrity issues privately per policy.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "You used AI to generate a full week's lesson plans. Observation is next week.",
            options: [
              {
                text: "Print as-is — AI knows standards better than you",
                feedback: "You must align objectives, pacing, and accommodations to your actual students.",
                points: 0,
              },
              {
                text: "Edit for your standards, checks for understanding, and IEP accommodations",
                feedback: "AI drafts; teachers own instructional decisions.",
                points: 3,
              },
              {
                text: "Hide that you used AI from your evaluator",
                feedback: "Transparency about tools is increasingly expected.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "Students ask if they may use AI on homework. Your district allows 'AI as tutor, not author.'",
            options: [
              {
                text: "Ban all AI forever in your class",
                feedback: "District policy may allow guided use; clarify rather than contradict.",
                points: 1,
              },
              {
                text: "Explain allowed uses (hints, checking work) vs prohibited (submitting AI text as their own)",
                feedback: "Clear norms teach digital citizenship.",
                points: 3,
              },
              {
                text: "Tell them to use AI freely — skills don't matter",
                feedback: "Learning objectives still require demonstrated student thinking.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "AI grading tool marks 30 essays in a minute. Parent conference is tonight.",
            options: [
              {
                text: "Read every essay yourself before discussing grades with parents",
                feedback: "You are accountable for feedback families receive.",
                points: 3,
              },
              {
                text: "Trust the AI rubric — it's consistent",
                feedback: "Auto-graders miss nuance, bias, and student growth stories.",
                points: 0,
              },
              {
                text: "Change all grades to the class average",
                feedback: "Avoids the problem without serving students.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
  ],

  "police-officer": [
    {
      id: "leo-evidence-log",
      title: "Evidence Collection Log",
      description:
        "Document chain of custody for seized evidence — academy and field training requirement.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Evidence",
      content: {
        intakeForm: {
          title: "Evidence Intake — Case #2026-1847",
          brief: "Complete before transporting to evidence room.",
          scenario: "Traffic stop — driver consent search found open container in back seat.",
          fields: [
            { id: "item", label: "Item description", type: "text", expected: "open beer bottle", hint: "open beer bottle" },
            { id: "location", label: "Found where in vehicle", type: "text", expected: "rear passenger floorboard", hint: "rear passenger floorboard" },
            { id: "photos", label: "Photographed in situ?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "sealed", label: "Placed in evidence bag and sealed?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "leo-use-of-force-report",
      title: "Use-of-Force Documentation",
      description:
        "Complete a use-of-force report after a physical detention — accountability requirement.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Accountability",
      content: {
        intakeForm: {
          title: "UOF Report — Incident #2026-1848",
          brief: "Document facts objectively within end-of-shift window.",
          scenario: "Subject resisted handcuffing during DUI arrest. Arm-bar takedown used — no injuries to either party.",
          fields: [
            { id: "force_type", label: "Type of force used", type: "select", options: ["Empty-hand control", "OC spray", "Taser", "Firearm"], expected: "Empty-hand control" },
            { id: "resistance", label: "Subject resistance level", type: "select", options: ["Passive", "Active", "Aggressive"], expected: "Active" },
            { id: "injury", label: "Injuries to subject?", type: "select", options: ["None", "Minor", "Serious"], expected: "None" },
            { id: "supervisor", label: "Supervisor notified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "leo-report",
      title: "Incident Report Form",
      description: "Complete a traffic-stop report accurately.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Documentation",
      content: {
        intakeForm: {
          title: "Traffic Stop Report",
          brief: "Document a speeding stop with citation.",
          scenario: "I-15 NB — 82 in a 65 — citation issued.",
          fields: [
            { id: "location", label: "Location", type: "text", expected: "I-15 NB MM 42", hint: "I-15 NB MM 42" },
            { id: "violation", label: "Primary violation", type: "text", expected: "Speeding", hint: "Speeding" },
            {
              id: "action",
              label: "Disposition",
              type: "select",
              options: ["Warning", "Citation", "Arrest"],
              expected: "Citation",
            },
          ],
        },
      },
    },
    {
      id: "leo-ethics",
      title: "Use-of-Force Judgment",
      description: "Choose proportionate, lawful responses.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Ethics",
      content: {
        script: [
          {
            prompt: "Compliant driver with expired tags only. Best approach?",
            options: [
              { text: "Immediate high-risk felony stop", feedback: "Disproportionate for tags alone.", points: 0 },
              { text: "Standard stop, verify ID, cite or warn per policy", feedback: "Proportionate policing.", points: 3 },
              { text: "Ignore all traffic law", feedback: "Not an option on duty.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "firefighter-emt": [
    {
      id: "emt-pcr-intake",
      title: "Patient Care Report (PCR)",
      description:
        "Document call time, chief complaint, vitals, and interventions — EMS documentation standard.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Documentation",
      content: {
        intakeForm: {
          title: "PCR — Medical Aid",
          brief: "Complete before hospital handoff.",
          scenario: "68F, chest pain onset 30 min prior. Aspirin administered. Vitals: BP 148/92, HR 98, SpO₂ 94% on 2L NC.",
          fields: [
            { id: "complaint", label: "Chief complaint", type: "text", expected: "chest pain", hint: "chest pain" },
            { id: "bp", label: "Blood pressure", type: "text", expected: "148/92", hint: "148/92" },
            { id: "intervention", label: "Medication given", type: "text", expected: "aspirin 324 mg PO", hint: "aspirin 324 mg PO" },
            { id: "transport", label: "Transport decision", type: "select", options: ["ALS transport", "BLS transport", "Refusal"], expected: "ALS transport" },
          ],
        },
      },
    },
    {
      id: "emt-equipment-check",
      title: "Apparatus Check-Off",
      description:
        "Verify critical equipment at start of shift — NFPA standard.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Readiness",
      content: {
        intakeForm: {
          title: "Engine 7 — Morning Check",
          brief: "Document equipment status before going in-service.",
          scenario: "Start of 24-hour shift. Last crew noted low O₂ tank.",
          fields: [
            { id: "scba", label: "SCBA cylinders full (4500 psi)?", type: "select", options: ["Yes", "No — needs fill"], expected: "Yes" },
            { id: "o2", label: "Oxygen tank replaced?", type: "select", options: ["Yes", "No — still low"], expected: "Yes" },
            { id: "aed", label: "AED pads in date?", type: "select", options: ["Yes", "No — expired"], expected: "Yes" },
            { id: "narcan", label: "Narcan stock verified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "emt-math",
      title: "Field Dose / Triage Math",
      description: "Calculate under time pressure.",
      gameType: "jobsite-workspace",
      duration: "8–12 min",
      domain: "EMS math",
      content: {
        jobsite: {
          title: "EMS Field Calculations",
          brief: "Quick math before ALS intercept.",
          tasks: [
            {
              prompt: "Patient 80 kg; protocol 1 mg/kg — mg dose?",
              answer: "80",
              unit: "mg",
              explanation: "1 × 80 = 80 mg.",
            },
          ],
        },
      },
    },
    {
      id: "emt-triage",
      title: "Scene Size-Up Sequence",
      description: "Order scene safety and patient access.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Operations",
      content: {
        sequence: [
          "Ensure scene safety and BSI/PPE",
          "Determine mechanism / nature of illness",
          "Locate and count patients; request add'l resources",
          "Primary survey (ABC) and treat life threats",
          "Package, transport, hand off with report",
        ],
      },
    },
  ],

  "real-estate": [
    {
      id: "re-closing-sheet",
      title: "Closing Cost Estimate",
      description:
        "Build a buyer closing cost estimate — agent and pre-licensing exam skill.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Transactions",
      content: {
        spreadsheet: {
          title: "Buyer Closing Costs — $425,000 Purchase",
          brief: "Calculate key closing costs for the buyer.",
          headers: ["", "A", "B"],
          rows: [
            ["1", "Item", "Amount"],
            ["2", "Purchase price", "425000"],
            ["3", "Down payment (5%)", ""],
            ["4", "Loan amount", ""],
            ["5", "Title insurance (0.5% of price)", ""],
            ["6", "Total cash to close (down + title)", ""],
          ],
          tasks: [
            { instruction: "Down payment in B3 (5% of price).", targetCell: "B3", expectedValue: "21250", formulaHint: "=B2*0.05" },
            { instruction: "Loan amount in B4 (price − down).", targetCell: "B4", expectedValue: "403750", formulaHint: "=B2-B3" },
            { instruction: "Title insurance in B5.", targetCell: "B5", expectedValue: "2125", formulaHint: "=B2*0.005" },
            { instruction: "Total cash to close in B6.", targetCell: "B6", expectedValue: "23375", formulaHint: "=B3+B5" },
          ],
        },
      },
    },
    {
      id: "re-showing-checklist",
      title: "Open House Checklist",
      description:
        "Prepare showing documentation and safety compliance before an open house.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Listing management",
      content: {
        intakeForm: {
          title: "Open House Prep — 123 Oak Dr",
          brief: "Complete checklist before visitors arrive.",
          scenario: "Sunday open house 1–4pm. Seller's pet needs to be removed. Lead paint disclosure required (built 1972).",
          fields: [
            { id: "disclosure", label: "Lead paint disclosure signed?", type: "select", options: ["Yes", "No", "Not applicable"], expected: "Yes" },
            { id: "pet", label: "Pets removed per seller agreement?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "sign_in", label: "Guest sign-in sheet ready?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "lockbox", label: "Lockbox code verified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "re-listing",
      title: "Listing Intake",
      description: "Seller listing fields and disclosures.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Transactions",
      content: {
        intakeForm: {
          title: "Seller Listing Intake",
          brief: "Capture price and key disclosure flags.",
          scenario: "3/2 ranch — seller wants list at $425,000.",
          fields: [
            { id: "price", label: "List price", type: "text", expected: "425000", hint: "425000" },
            { id: "beds", label: "Bedrooms", type: "text", expected: "3", hint: "3" },
            {
              id: "disclosure",
              label: "Known roof leak?",
              type: "select",
              options: ["Yes", "No", "Unknown"],
              expected: "No",
            },
          ],
        },
      },
    },
    {
      id: "re-ethics",
      title: "Agency Ethics",
      description: "Disclosure and pressure situations.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Ethics",
      content: {
        script: [
          {
            prompt: "Seller asks to hide a known roof leak.",
            options: [
              { text: "Agree to stay silent", feedback: "Material defects require disclosure.", points: 0 },
              { text: "Explain disclosure duty and refuse", feedback: "Protects clients and license.", points: 3 },
              { text: "Suggest unpermitted patch overnight", feedback: "Creates liability.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  cosmetology: [
    {
      id: "cosmo-client-intake",
      title: "Client Consultation Form",
      description:
        "Document client history, allergies, and service goals before chemical service — board exam task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Client care",
      content: {
        intakeForm: {
          title: "New Client Consultation — Color Service",
          brief: "Complete before mixing any chemical product.",
          scenario: "New client wants full highlight. Reports scalp sensitivity and previous henna use.",
          fields: [
            { id: "allergy", label: "Known allergies or sensitivities", type: "text", expected: "scalp sensitivity", hint: "scalp sensitivity" },
            { id: "henna", label: "Previous henna or metallic dye?", type: "select", options: ["Yes", "No", "Unknown"], expected: "Yes" },
            { id: "patch", label: "Patch test completed?", type: "select", options: ["Yes — clear", "No — schedule first", "Skipped"], expected: "No — schedule first" },
            { id: "consent", label: "Service consent signed?", type: "select", options: ["Yes", "No"], expected: "No" },
          ],
        },
      },
    },
    {
      id: "cosmo-chemical-log",
      title: "Chemical Service Record",
      description:
        "Log formula, timing, and results after a color service — salon documentation standard.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Technical documentation",
      content: {
        intakeForm: {
          title: "Color Service Record — Client #847",
          brief: "Document so the next stylist can replicate or adjust.",
          scenario: "Full highlight with 30-vol developer, 45 min processing. Result: even lift, toned to ash.",
          fields: [
            { id: "formula", label: "Formula used", type: "text", expected: "30-vol developer + lightener", hint: "30-vol developer + lightener" },
            { id: "time", label: "Processing time (min)", type: "text", expected: "45", hint: "45" },
            { id: "result", label: "Result notes", type: "text", expected: "even lift, ash toner applied", hint: "even lift, ash toner applied" },
            { id: "next", label: "Recommended follow-up", type: "select", options: ["6 weeks", "8 weeks", "Not scheduled"], expected: "6 weeks" },
          ],
        },
      },
    },
    {
      id: "cosmo-sanitize",
      title: "Sanitation Lab Bench",
      description: "State-board style disinfect procedure.",
      gameType: "lab-bench-workspace",
      duration: "8–12 min",
      domain: "Sanitation",
      content: {
        labBench: {
          title: "Implement Disinfection",
          brief: "Follow board order after each chemical service.",
          steps: [
            {
              instruction: "First step after client leaves the chair:",
              choices: [
                { label: "Sweep hair from floor", correct: false, feedback: "Disinfect tools first." },
                { label: "Place used implements in EPA-registered disinfectant", correct: true, feedback: "Correct — soak per label time." },
                { label: "Reuse cape on next client", correct: false, feedback: "Never reuse without laundering." },
              ],
            },
            {
              instruction: "Disinfectant contact time — you should:",
              choices: [
                { label: "Rinse immediately after dipping", correct: false, feedback: "Must meet label contact time." },
                { label: "Follow manufacturer contact time, then rinse and dry", correct: true, feedback: "Correct." },
                { label: "Wipe with a dry towel only", correct: false, feedback: "Dry wipe is not disinfection." },
              ],
            },
          ],
        },
      },
    },
    {
      id: "cosmo-client",
      title: "Client Consult Choices",
      description: "Patch tests and contraindications.",
      gameType: "script-choice",
      duration: "5–8 min",
      domain: "Client care",
      content: {
        script: [
          {
            prompt: "Client wants bleach with open scalp sores.",
            options: [
              { text: "Proceed carefully", feedback: "Contraindication — do not chemical process.", points: 0 },
              { text: "Refuse chemical service; suggest medical clearance", feedback: "Correct professional judgment.", points: 3 },
              { text: "Use stronger developer", feedback: "Worsens injury.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "family-services": [
    {
      id: "fs-safety-assessment",
      title: "Safety Assessment Form",
      description:
        "Complete structured decision-making safety fields during a home visit.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Child welfare",
      content: {
        intakeForm: {
          title: "SDM Safety Assessment — Home Visit",
          brief: "Document safety factors before leaving the home.",
          scenario: "Unannounced visit — 2 children present, home clean, caregiver cooperative, no visible injuries. Prior report of educational neglect.",
          fields: [
            { id: "children", label: "Children present and accounted for", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "hazard", label: "Immediate environmental hazard?", type: "select", options: ["None observed", "Yes — document"], expected: "None observed" },
            { id: "access", label: "Access to food/utilities?", type: "select", options: ["Adequate", "Inadequate"], expected: "Adequate" },
            { id: "plan", label: "Safety plan required?", type: "select", options: ["No — safe", "Yes — with services", "Yes — removal needed"], expected: "No — safe" },
          ],
        },
      },
    },
    {
      id: "fs-service-plan",
      title: "Service Plan Documentation",
      description:
        "Create measurable goals and referrals for a family's case plan.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Case planning",
      content: {
        intakeForm: {
          title: "Family Service Plan — Morgan Household",
          brief: "Document goals and referrals agreed upon with caregiver.",
          scenario: "Family referred for food insecurity. Caregiver agrees to SNAP application and parent education classes.",
          fields: [
            { id: "goal", label: "Primary goal", type: "text", expected: "stable food access", hint: "stable food access" },
            { id: "referral1", label: "Referral #1", type: "text", expected: "SNAP application assistance", hint: "SNAP application assistance" },
            { id: "referral2", label: "Referral #2", type: "text", expected: "parent education class", hint: "parent education class" },
            { id: "review", label: "Next review date", type: "text", expected: "60 days", hint: "60 days" },
          ],
        },
      },
    },
    {
      id: "fs-intake",
      title: "Family Intake Form",
      description: "Risk screening and referral fields.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Casework",
      content: {
        intakeForm: {
          title: "Family Services Intake",
          brief: "Document a new family referral.",
          scenario: "School referred household for food insecurity support.",
          fields: [
            { id: "caregiver", label: "Primary caregiver", type: "text", expected: "Taylor Morgan", hint: "Taylor Morgan" },
            {
              id: "risk",
              label: "Immediate safety risk?",
              type: "select",
              options: ["None identified", "Yes — escalate", "Unknown"],
              expected: "None identified",
            },
            {
              id: "referral",
              label: "Primary referral need",
              type: "select",
              options: ["Food", "Housing", "Childcare"],
              expected: "Food",
            },
          ],
        },
      },
    },
    {
      id: "fs-ethics",
      title: "Confidentiality Choices",
      description: "Handle disclosures within policy.",
      gameType: "script-choice",
      duration: "5–8 min",
      domain: "Ethics",
      content: {
        script: [
          {
            prompt: "Neighbor asks for case details 'to help.'",
            options: [
              { text: "Share the file verbally", feedback: "Breaks confidentiality.", points: 0 },
              { text: "Decline; explain privacy; offer public resource info only", feedback: "Correct boundary.", points: 3 },
              { text: "Post on social media for donations naming the family", feedback: "Never identify clients publicly.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "social-caseworker": [
    {
      id: "sw-resource-referral",
      title: "Community Resource Referral",
      description:
        "Match client needs to local services and document the referral.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Resource navigation",
      content: {
        intakeForm: {
          title: "Resource Referral — Housing Assistance",
          brief: "Document referral before follow-up deadline.",
          scenario: "Client needs emergency housing. Eligible for Section 8 waitlist and emergency shelter tonight.",
          fields: [
            { id: "need", label: "Primary need", type: "text", expected: "emergency housing", hint: "emergency housing" },
            { id: "immediate", label: "Immediate referral", type: "text", expected: "emergency shelter", hint: "emergency shelter" },
            { id: "longterm", label: "Long-term referral", type: "text", expected: "Section 8 waitlist application", hint: "Section 8 waitlist application" },
            { id: "followup", label: "Follow-up within", type: "select", options: ["24 hours", "1 week", "30 days"], expected: "24 hours" },
          ],
        },
      },
    },
    {
      id: "sw-case-note",
      title: "Case Note Documentation",
      description:
        "Write objective SOAP-style case notes after a client session — licensing exam skill.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Documentation",
      content: {
        intakeForm: {
          title: "Session Note — Alex Kim",
          brief: "Complete case note within 24 hours per agency policy.",
          scenario: "Client reported improved mood, attending job readiness program. Still anxious about custody hearing next week.",
          fields: [
            { id: "subjective", label: "Client self-report", type: "text", expected: "improved mood", hint: "improved mood" },
            { id: "objective", label: "Observable behavior", type: "text", expected: "attending job readiness program", hint: "attending job readiness program" },
            { id: "plan", label: "Next steps", type: "text", expected: "continue services; prep for custody hearing", hint: "continue services; prep for custody hearing" },
            { id: "risk", label: "Current risk level", type: "select", options: ["Low", "Moderate", "High"], expected: "Low" },
          ],
        },
      },
    },
    {
      id: "sw-intake",
      title: "Crisis Intake & Safety Plan",
      description: "Document crisis fields completely.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Casework",
      content: {
        intakeForm: {
          title: "Crisis Intake",
          brief: "Capture safety plan essentials.",
          scenario: "Adult client reports escalating home conflict; no current injuries.",
          fields: [
            { id: "client", label: "Client name", type: "text", expected: "Alex Kim", hint: "Alex Kim" },
            {
              id: "danger",
              label: "Immediate danger?",
              type: "select",
              options: ["No", "Yes", "Unsure"],
              expected: "No",
            },
            { id: "contact", label: "Emergency contact", type: "text", expected: "Sam Kim", hint: "Sam Kim" },
          ],
        },
      },
    },
    {
      id: "sw-mandate",
      title: "Mandated Reporting Judgment",
      description: "When to escalate suspected harm.",
      gameType: "script-choice",
      duration: "5–8 min",
      domain: "Compliance",
      content: {
        script: [
          {
            prompt: "Child discloses ongoing physical abuse at home.",
            options: [
              { text: "Keep it confidential forever", feedback: "Mandated reporters must report suspected abuse.", points: 0 },
              { text: "Follow mandated reporting procedure immediately", feedback: "Correct legal/ethical duty.", points: 3 },
              { text: "Confront the alleged abuser alone tonight", feedback: "Unsafe and outside role — report through channels.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "bank-teller": [
    {
      id: "teller-ctr-intake",
      title: "Currency Transaction Report",
      description:
        "Complete CTR fields for cash transactions over $10,000 — BSA/AML compliance.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "BSA compliance",
      content: {
        intakeForm: {
          title: "CTR — Cash Deposit $12,500",
          brief: "File within 15 days per FinCEN requirement.",
          scenario: "Business customer deposits $12,500 cash. Valid ID presented.",
          fields: [
            { id: "amount", label: "Cash amount", type: "text", expected: "12500", hint: "12500" },
            { id: "id_type", label: "ID type presented", type: "select", options: ["Driver license", "Passport", "None"], expected: "Driver license" },
            { id: "transaction", label: "Transaction type", type: "select", options: ["Deposit", "Withdrawal", "Exchange"], expected: "Deposit" },
            { id: "filed", label: "CTR filed?", type: "select", options: ["Yes", "Not yet — pending supervisor"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "teller-end-of-day",
      title: "End-of-Day Balancing Sheet",
      description:
        "Reconcile transactions, checks, and vault to the system — daily teller close.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Cash handling",
      content: {
        spreadsheet: {
          title: "Teller Close — Station 3",
          brief: "Balance your drawer and cash received to the system total.",
          headers: ["", "A", "B"],
          rows: [
            ["1", "Item", "Amount"],
            ["2", "Starting cash", "5000"],
            ["3", "Cash received", "8200"],
            ["4", "Cash paid out", "3100"],
            ["5", "Expected ending cash", ""],
            ["6", "Checks received", "4500"],
            ["7", "Total activity (cash + checks)", ""],
          ],
          tasks: [
            { instruction: "Expected ending cash in B5 (start + received − paid).", targetCell: "B5", expectedValue: "10100", formulaHint: "=B2+B3-B4" },
            { instruction: "Total activity in B7.", targetCell: "B7", expectedValue: "14600", formulaHint: "=B5+B6" },
          ],
        },
      },
    },
    {
      id: "teller-drawer",
      title: "Drawer Reconciliation",
      description: "Balance cash and checks at end of shift.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Cash handling",
      content: {
        spreadsheet: {
          title: "Teller Drawer Reconciliation",
          brief: "Enter formulas for bill values and total.",
          headers: ["", "A", "B", "C"],
          rows: [
            ["1", "Item", "Count", "Value"],
            ["2", "$20 bills", "45", ""],
            ["3", "$5 bills", "32", ""],
            ["4", "Checks", "1", "1250"],
            ["5", "Drawer Total", "", ""],
          ],
          tasks: [
            {
              instruction: "Value of $20s in C2 (45×20).",
              targetCell: "C2",
              expectedValue: "900",
              formulaHint: "=B2*20",
            },
            {
              instruction: "Value of $5s in C3.",
              targetCell: "C3",
              expectedValue: "160",
              formulaHint: "=B3*5",
            },
            {
              instruction: "Sum values in C5 (C2:C4).",
              targetCell: "C5",
              expectedValue: "2310",
              formulaHint: "=SUM(C2:C4)",
            },
          ],
        },
      },
    },
    {
      id: "teller-fraud",
      title: "Fraud Red Flags",
      description: "Handle suspicious withdrawals.",
      gameType: "script-choice",
      duration: "5–8 min",
      domain: "Security",
      content: {
        script: [
          {
            prompt: "Customer appears coached by someone on speakerphone for a large cash out.",
            options: [
              { text: "Process quickly to avoid a line", feedback: "Possible elder/fraud exploitation — escalate.", points: 0 },
              { text: "Follow bank fraud protocol; involve supervisor", feedback: "Correct.", points: 3 },
              { text: "Give personal cell advice off camera", feedback: "Stay in policy channels.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "cdl-driver": [
    {
      id: "cdl-pretrip-checklist",
      title: "Pre-Trip Inspection Form",
      description:
        "Document defects and sign off on readiness before leaving the yard — CDL daily requirement.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "FMCSA compliance",
      content: {
        intakeForm: {
          title: "DVIR — Unit 847",
          brief: "Complete Driver Vehicle Inspection Report before rolling.",
          scenario: "Day cab + 53' dry van. Last driver noted low air pressure warning — shop says fixed.",
          fields: [
            { id: "tires", label: "All tires inspected (tread & pressure)?", type: "select", options: ["Yes — pass", "No — defect noted"], expected: "Yes — pass" },
            { id: "brakes", label: "Service brakes tested?", type: "select", options: ["Yes — pass", "No — defect noted"], expected: "Yes — pass" },
            { id: "air", label: "Air pressure build-up OK?", type: "select", options: ["Yes — in spec", "No — still low"], expected: "Yes — in spec" },
            { id: "sign", label: "DVIR signed and dated?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "cdl-hos-log",
      title: "Hours of Service Log",
      description:
        "Record drive, on-duty, and sleeper time per FMCSA HOS rules.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "HOS compliance",
      content: {
        intakeForm: {
          title: "ELD Log — Day 1",
          brief: "Enter status changes accurately per 14-hour / 11-hour rules.",
          scenario: "Started driving 0600. Fueled 0900 (30 min). Arrived 1400. 8 hr drive, 30 min on-duty not driving.",
          fields: [
            { id: "drive", label: "Total driving hours", type: "text", expected: "8", hint: "8" },
            { id: "on_duty", label: "On-duty not driving (hrs)", type: "text", expected: "0.5", hint: "0.5" },
            { id: "remaining", label: "Drive time remaining today (of 11 hr)", type: "text", expected: "3", hint: "11 − 8 = 3" },
            { id: "violation", label: "Any HOS violation?", type: "select", options: ["No", "Yes"], expected: "No" },
          ],
        },
      },
    },
    {
      id: "cdl-weight",
      title: "Weight & Bridge Math",
      description: "Verify legal axle math before rolling.",
      gameType: "jobsite-workspace",
      duration: "8–12 min",
      domain: "Compliance",
      content: {
        jobsite: {
          title: "Pre-Trip Weight Lab",
          brief: "Confirm loads before a long haul.",
          tasks: [
            {
              prompt: "Steer 11,000 + drive 33,000 + trailer 34,000 — total lbs?",
              answer: "78000",
              unit: "lbs",
              explanation: "11k+33k+34k = 78,000.",
            },
          ],
        },
      },
    },
    {
      id: "cdl-pretrip",
      title: "Pre-Trip Inspection Order",
      description: "Order a proper CDL pre-trip.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Safety",
      content: {
        sequence: [
          "Engine off — check tires, rims, and lug nuts",
          "Inspect lights, reflectors, and windshield",
          "Check mirrors, wipers, horn, and emergency equipment",
          "Engine on — test brakes, gauges, and air pressure",
          "Walk around — check coupling, cargo securement, leaks",
          "Complete log entry and report defects before rolling",
        ],
      },
    },
  ],
};
