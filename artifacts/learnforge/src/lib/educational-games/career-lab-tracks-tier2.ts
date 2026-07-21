import type { CareerSkillSlug } from "./career-skills-catalog";
import type { CareerLabModule } from "./career-lab-tracks-extended";

/** Tier-2 high-demand careers from public cert/search audit (2026). */
export const CAREER_LAB_TRACKS_TIER2: Partial<
  Record<CareerSkillSlug, CareerLabModule[]>
> = {
  paralegal: [
    {
      id: "para-intake",
      title: "Client & Matter Intake",
      description: "Capture parties, conflict flags, and matter type before opening a file.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Legal admin",
      prep: [
        {
          prompt: "Why must a firm run a conflict check before opening a new matter file?",
          options: [
            "To estimate billable hours for the client",
            "To identify if the firm already represents an opposing party or related interest",
            "To choose which court will hear the case",
            "To set the statute of limitations deadline automatically",
          ],
          correctIndex: 1,
          explanation:
            "Conflict checks protect clients and the firm from ethical violations when prior relationships create divided loyalty.",
        },
        {
          prompt: "In civil intake, what does noting an SOL concern refer to?",
          options: [
            "Statement of liability owed to the firm",
            "Statute of limitations — deadline to file suit",
            "Standard operating license for paralegals",
            "Summary of litigation costs",
          ],
          correctIndex: 1,
          explanation:
            "Missing a limitations deadline can bar the claim entirely — intake must flag time-sensitive cases early.",
        },
      ],
      recall: [
        {
          prompt: "Which intake field captures the type of legal matter (PI, Family, Criminal)?",
          options: ["Client name", "Matter type", "Conflict check", "SOL concern"],
          correctIndex: 1,
          explanation: "Matter type drives routing, staffing, and which forms and deadlines apply.",
        },
        {
          prompt: "When should a conflict check be marked on intake?",
          options: [
            "Only after the attorney signs the engagement letter",
            "Before substantive work begins — completed or flagged pending",
            "Never — conflicts are handled at trial",
            "Only for criminal matters",
          ],
          correctIndex: 1,
          explanation: "Conflict clearance must be documented before the firm commits to the representation.",
        },
      ],
      content: {
        intakeForm: {
          title: "New Client Intake — Civil Matter",
          brief: "Complete intake before attorney review.",
          scenario: "Potential slip-and-fall — opposing party is employer's insurer.",
          fields: [
            { id: "client", label: "Client name", type: "text", expected: "Reyes, Ana", hint: "Reyes, Ana" },
            { id: "matter", label: "Matter type", type: "select", options: ["PI", "Family", "Criminal"], expected: "PI" },
            { id: "conflict", label: "Conflict check completed?", type: "select", options: ["Yes", "No", "Pending"], expected: "Yes" },
            { id: "sol", label: "SOL concern noted?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "para-privilege-log",
      title: "Privilege Log Entry",
      description: "Log a withheld document on the privilege log like e-discovery practice.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "E-discovery",
      prep: [
        {
          prompt: "When is a document listed on a privilege log instead of produced?",
          options: [
            "When it is too large to upload",
            "When the firm claims attorney-client privilege or work product and withholds it",
            "When Bates numbering has not been assigned yet",
            "When the client requests paper copies only",
          ],
          correctIndex: 1,
          explanation:
            "Withheld documents must be logged so opposing counsel can assess whether the privilege claim is valid.",
        },
        {
          prompt: "What is a Bates number used for in discovery?",
          options: [
            "Tracking billable paralegal hours",
            "Unique document ID for production and reference at depositions",
            "Court-assigned case citation",
            "Client social security verification",
          ],
          correctIndex: 1,
          explanation:
            "Bates stamps let both sides refer to the exact document in motions, depositions, and trial.",
        },
      ],
      recall: [
        {
          prompt: "Which privilege type applies to emails between client and attorney about settlement strategy?",
          options: ["Not privileged", "Attorney-client", "Public record", "Jury instruction"],
          correctIndex: 1,
          explanation:
            "Confidential communications between client and counsel for legal advice are attorney-client privileged.",
        },
        {
          prompt: "What must a privilege log entry include at minimum?",
          options: [
            "Only the file size of the document",
            "Bates ID, author/recipient context, privilege type, and brief description",
            "The full text of the withheld email",
            "Opposing counsel's approval signature",
          ],
          correctIndex: 1,
          explanation:
            "Logs must give enough detail for the other side to understand what was withheld and why.",
        },
      ],
      content: {
        intakeForm: {
          title: "Privilege Log — Doc Review",
          brief: "Document is withheld from production; complete the log entry.",
          scenario: "Email chain between client and attorney re settlement strategy.",
          fields: [
            { id: "bates", label: "Bates range", type: "text", expected: "REYES-0142", hint: "REYES-0142" },
            { id: "author", label: "Author", type: "text", expected: "Ana Reyes", hint: "Ana Reyes" },
            { id: "privilege", label: "Privilege type", type: "select", options: ["Attorney-client", "Work product", "Not privileged"], expected: "Attorney-client" },
            { id: "basis", label: "Brief description", type: "text", expected: "Settlement strategy with counsel", hint: "Settlement strategy with counsel" },
          ],
        },
      },
    },
    {
      id: "para-billing-sheet",
      title: "Billable Hours Ledger",
      description: "Track paralegal time in a matter spreadsheet — real firm workflow.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Legal billing",
      prep: [
        {
          prompt: "Why do firms track paralegal time in tenths of an hour (0.1 hr = 6 min)?",
          options: [
            "Because spreadsheets only accept one decimal place",
            "Industry billing standard for consistent client invoices",
            "IRS requirement for all small businesses",
            "To avoid using formulas in Excel",
          ],
          correctIndex: 1,
          explanation:
            "Legal billing uses standardized time increments so invoices are consistent and auditable.",
        },
        {
          prompt: "Which spreadsheet approach totals hours for a weekly invoice?",
          options: [
            "Manually re-type each hour into the total cell",
            "Use a SUM formula over the hours column",
            "Delete rows until the total looks right",
            "Round every entry to zero",
          ],
          correctIndex: 1,
          explanation: "Formulas reduce errors when multiple tasks contribute to one matter total.",
        },
      ],
      recall: [
        {
          prompt: "In the time sheet lab, which cell should hold the SUM of billable hours?",
          options: ["B2", "C5", "A1", "C2"],
          correctIndex: 1,
          explanation: "C5 is the total row — SUM(B2:B4) aggregates all task hours above it.",
        },
        {
          prompt: "Paralegal time on medical records requests is typically:",
          options: [
            "Non-billable overhead always",
            "Billable matter work when done for the client file",
            "Only billable if the attorney also worked that hour",
            "Never recorded on time sheets",
          ],
          correctIndex: 1,
          explanation:
            "Case-related paralegal tasks are usually billable at the paralegal rate per firm policy.",
        },
      ],
      content: {
        spreadsheet: {
          title: "Matter 2026-041 — Time Sheet",
          brief: "Enter formulas to total billable hours for the weekly invoice.",
          headers: ["", "A", "B", "C"],
          rows: [
            ["1", "Task", "Hours", "Billable"],
            ["2", "Client intake call", "1.5", "1.5"],
            ["3", "Medical records request", "2", "2"],
            ["4", "Draft demand letter", "3.5", "3.5"],
            ["5", "Total billable hours", "", ""],
          ],
          tasks: [
            {
              instruction: "Sum billable hours (B2:B4) in cell C5.",
              targetCell: "C5",
              expectedValue: "7",
              formulaHint: "=SUM(B2:B4)",
            },
          ],
        },
      },
    },
    {
      id: "para-production-log",
      title: "Discovery Production Log",
      description: "Record Bates range and responsiveness for outgoing production.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Litigation support",
      prep: [
        {
          prompt: "What happens during 'document review' before production?",
          options: [
            "Documents are printed for the client only",
            "Responsive docs are identified; privileged items are withheld and logged",
            "All emails are deleted after 30 days",
            "Bates numbers are removed for privacy",
          ],
          correctIndex: 1,
          explanation:
            "Review separates responsive from non-responsive material and flags privilege before anything goes to opposing counsel.",
        },
        {
          prompt: "Why use a secure portal instead of email attachment for production?",
          options: [
            "Portals are always free",
            "Large sets, audit trail, and controlled access reduce spoliation and leakage risk",
            "Email attachments cannot include PDFs",
            "Courts prohibit Bates numbers in email",
          ],
          correctIndex: 1,
          explanation:
            "Secure portals track downloads and handle large productions better than standard email.",
        },
      ],
      recall: [
        {
          prompt: "What must be signed before serving the first production set?",
          options: [
            "Opposing counsel's receipt only",
            "Certification of completeness per court rules and attorney sign-off",
            "The client's tax return",
            "Paralegal bar license",
          ],
          correctIndex: 1,
          explanation:
            "Production certifications attest the set is complete as of the agreed scope — attorney review is required.",
        },
        {
          prompt: "The production log Bates start/end fields record:",
          options: [
            "Court filing fees paid",
            "The range of document IDs included in this production set",
            "Attorney vacation dates",
            "Witness deposition order",
          ],
          correctIndex: 1,
          explanation:
            "Start and end Bates numbers define exactly which documents were delivered in Set 1.",
        },
      ],
      content: {
        intakeForm: {
          title: "Outgoing Production Set 1",
          brief: "Log what goes to opposing counsel after attorney sign-off.",
          scenario: "First production — responsive emails and photos, privileged items removed.",
          fields: [
            { id: "start", label: "Bates start", type: "text", expected: "REYES-0001", hint: "REYES-0001" },
            { id: "end", label: "Bates end", type: "text", expected: "REYES-0138", hint: "REYES-0138" },
            { id: "medium", label: "Production medium", type: "select", options: ["Secure portal", "USB mail", "Email attachment"], expected: "Secure portal" },
            { id: "cert", label: "Certification of completeness signed?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
  ],

  "human-resources": [
    {
      id: "hr-leave-intake",
      title: "FMLA / Leave Request Intake",
      description:
        "Capture leave type, dates, and medical certification status — daily HR operations workflow.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Leave administration",
      content: {
        intakeForm: {
          title: "Leave of Absence Request — HRIS",
          brief: "Complete intake before routing to benefits administrator.",
          scenario: "Employee requests intermittent FMLA for physical therapy after surgery.",
          fields: [
            { id: "employee", label: "Employee name", type: "text", expected: "Patel, Sam", hint: "Patel, Sam" },
            { id: "type", label: "Leave type", type: "select", options: ["FMLA intermittent", "Vacation only", "Unpaid personal"], expected: "FMLA intermittent" },
            { id: "cert", label: "Medical certification received?", type: "select", options: ["Yes", "No", "Pending"], expected: "Pending" },
            { id: "start", label: "Anticipated start date", type: "text", expected: "05/01/2026", hint: "05/01/2026" },
          ],
        },
      },
    },
    {
      id: "hr-complaint-intake",
      title: "Employee Relations Complaint Log",
      description:
        "Document harassment or policy complaints objectively before investigation — SHRM core skill.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Employee relations",
      content: {
        intakeForm: {
          title: "ER Intake — Confidential",
          brief: "Record facts without conclusions; route per anti-retaliation policy.",
          scenario: "Employee reports repeated unwelcome comments from a supervisor over three weeks.",
          fields: [
            { id: "reporter", label: "Reporting employee", type: "text", expected: "Nguyen, Lee", hint: "Nguyen, Lee" },
            { id: "subject", label: "Subject of complaint (role only)", type: "text", expected: "direct supervisor", hint: "direct supervisor" },
            { id: "retaliation", label: "Anti-retaliation policy explained?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "next", label: "Next step", type: "select", options: ["Open investigation per playbook", "Dismiss without review", "Post details in Slack"], expected: "Open investigation per playbook" },
          ],
        },
      },
    },
    {
      id: "hr-onboarding",
      title: "New Hire Onboarding Intake",
      description: "Complete I-9/eligibility and role data accurately.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "HR operations",
      content: {
        intakeForm: {
          title: "Day-1 New Hire Packet",
          brief: "Verify work authorization and job data.",
          scenario: "Full-time hourly associate — benefits eligible.",
          fields: [
            { id: "name", label: "Employee legal name", type: "text", expected: "Kim, Jordan", hint: "Kim, Jordan" },
            { id: "start", label: "Start date", type: "text", expected: "04/01/2026", hint: "04/01/2026" },
            { id: "i9", label: "I-9 Section 1 completed?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "dept", label: "Department", type: "text", expected: "Operations", hint: "Operations" },
          ],
        },
      },
    },
    {
      id: "hr-employee-relations",
      title: "Employee Relations Judgment",
      description: "Harassment reports, FMLA cues, and documentation.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "ER",
      content: {
        script: [
          {
            prompt: "Employee reports supervisor made repeated unwelcome comments.",
            options: [
              { text: "Tell them to handle it themselves", feedback: "Employers must investigate harassment reports.", points: 0 },
              { text: "Thank them, explain anti-retaliation policy, begin documented intake per playbook", feedback: "Correct HR response.", points: 3 },
              { text: "Fire supervisor immediately without investigation", feedback: "Due process and investigation required.", points: 0 },
            ],
          },
          {
            prompt: "Manager asks for employee's medical diagnosis details for attendance issue.",
            options: [
              { text: "Provide full chart from health plan", feedback: "Limit to fitness-for-duty info; privacy laws apply.", points: 0 },
              { text: "Coach manager on ADA/FMLA limits; request only job-related restrictions if needed", feedback: "HR privacy competency.", points: 3 },
              { text: "Post diagnosis in team chat", feedback: "HIPAA/privacy violation.", points: 0 },
            ],
          },
        ],
      },
    },
    {
      id: "hr-terms-match",
      title: "HR Terms & Compliance Match",
      description: "Match core HR/employment concepts.",
      gameType: "match-pairs",
      duration: "5–8 min",
      domain: "Foundations",
      content: {
        pairs: [
          { term: "At-will employment", definition: "Either party may end employment with limited exceptions" },
          { term: "FMLA", definition: "Job-protected leave for qualifying family/medical reasons" },
          { term: "EEOC", definition: "Federal agency enforcing workplace discrimination laws" },
          { term: "Onboarding", definition: "Process integrating a new hire into the organization" },
        ],
      },
    },
  ],

  "surgical-tech": [
    {
      id: "cst-supply-prep",
      title: "Instrument Tray Prep Checklist",
      description:
        "Verify tray contents and sterility indicators before case start — CST daily workflow.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Case preparation",
      content: {
        intakeForm: {
          title: "Major Tray Prep — Lap Chole",
          brief: "Complete checklist before opening to sterile field.",
          scenario: "First case of the day — tray from central sterile supply.",
          fields: [
            { id: "tray", label: "Tray ID verified", type: "text", expected: "LC-2026-04", hint: "LC-2026-04" },
            { id: "indicator", label: "Chemical indicator passed?", type: "select", options: ["Yes", "No", "Not checked"], expected: "Yes" },
            { id: "expiry", label: "Sterility expiration OK?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "count", label: "Instrument count sheet attached?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "cst-sterile-bench",
      title: "Sterile Field Setup Bench",
      description: "Follow CST sterile technique on the lab bench — hand scrub through first count.",
      gameType: "lab-bench-workspace",
      duration: "8–12 min",
      domain: "Sterile technique",
      content: {
        labBench: {
          title: "OR Setup — Sterile Field",
          brief: "Work through setup steps like NBSTSA/CST training.",
          steps: [
            {
              instruction: "After surgical hand scrub, you should:",
              choices: [
                { label: "Air-dry hands at sink then don gown", correct: false, feedback: "Use sterile drying technique per policy." },
                { label: "Dry with sterile towel; don sterile gown and gloves without breaking field", correct: true, feedback: "Correct CST sequence." },
                { label: "Skip gown if gloves are sterile", correct: false, feedback: "Gown and gloves both required." },
              ],
            },
            {
              instruction: "When opening sterile supplies onto the field:",
              choices: [
                { label: "Peel packaging away from you without touching inner contents", correct: true, feedback: "Proper peeling technique preserves sterility." },
                { label: "Shake contents out quickly", correct: false, feedback: "Controlled peel prevents contamination." },
                { label: "Set supplies on non-sterile mayo stand cover", correct: false, feedback: "Only sterile-draped surfaces contact instruments." },
              ],
            },
            {
              instruction: "Before incision, sponge/needle counts require:",
              choices: [
                { label: "Circulator verification with documented initial count", correct: true, feedback: "Team count prevents retained objects." },
                { label: "Surgeon estimate only", correct: false, feedback: "Formal count with circulator is mandatory." },
                { label: "Skip if case is short", correct: false, feedback: "Counts required regardless of case length." },
              ],
            },
          ],
        },
      },
    },
    {
      id: "cst-count-log",
      title: "Sponge & Needle Count Log",
      description: "Document initial OR counts on the sterile count sheet.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Patient safety",
      content: {
        intakeForm: {
          title: "Initial Count Sheet — Case #2026-118",
          brief: "Record counts before incision per OR policy.",
          scenario: "Abdominal laparoscopy — first count with circulator.",
          fields: [
            { id: "sponge", label: "Sponges counted", type: "text", expected: "10", hint: "10" },
            { id: "needles", label: "Needles counted", type: "text", expected: "4", hint: "4" },
            { id: "inst", label: "Major instruments verified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "timeout", label: "Surgical time-out completed?", type: "select", options: ["Yes", "No", "Pending"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "cst-sterile-seq",
      title: "Sterile Field Setup Order",
      description: "Sequence OR setup like NBSTSA/CST training.",
      gameType: "sequence-build",
      duration: "6–10 min",
      domain: "Sterile technique",
      content: {
        sequence: [
          "Perform surgical hand scrub and dry with sterile technique",
          "Don sterile gown and gloves without breaking field",
          "Open sterile supplies using proper peeling technique",
          "Create sterile field and organize instruments",
          "Perform sponge/needle counts with circulator before incision",
        ],
      },
    },
    {
      id: "cst-or-safety",
      title: "OR Safety Judgment",
      description: "Respond to breaks in technique and patient safety events.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Patient safety",
      content: {
        script: [
          {
            prompt: "You suspect a sterile glove tear during setup.",
            options: [
              { text: "Ignore — saves time", feedback: "Break in sterility requires regloving/replacement.", points: 0 },
              { text: "Stop, replace glove, assess field per policy", feedback: "CST standard.", points: 3 },
              { text: "Wipe glove with alcohol", feedback: "Does not restore sterility.", points: 0 },
            ],
          },
          {
            prompt: "Surgeon asks for instrument you did not count in.",
            options: [
              { text: "Pass it quickly from backup tray without count", feedback: "Counts prevent retained objects.", points: 0 },
              { text: "Coordinate with circulator to verify count/documentation before use", feedback: "Team safety protocol.", points: 3 },
              { text: "Leave OR to find instrument alone", feedback: "Never leave sterile field unattended improperly.", points: 1 },
            ],
          },
        ],
      },
    },
    {
      id: "cst-instruments",
      title: "Instruments & Roles Match",
      description: "Match common instruments and OR roles.",
      gameType: "match-pairs",
      duration: "5–8 min",
      domain: "Surgical technology",
      content: {
        pairs: [
          { term: "Mayo stand", definition: "Sterile table for instruments near operative site" },
          { term: "Scalpel", definition: "Cutting instrument; blade replaced per use" },
          { term: "Circulator", definition: "Non-sterile RN/team member managing room and counts" },
          { term: "Time-out", definition: "Universal protocol pause before incision" },
        ],
      },
    },
  ],

  "patient-care-tech": [
    {
      id: "pct-shift-handoff",
      title: "Shift Handoff Report",
      description:
        "Complete SBAR-style handoff fields before leaving the unit — hospital PCT standard.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Communication",
      content: {
        intakeForm: {
          title: "Bedside Handoff — Room 418",
          brief: "Document key changes for oncoming PCT/RN team.",
          scenario: "Patient had increased O₂ needs and refused dinner — family at bedside.",
          fields: [
            { id: "situation", label: "Situation (one line)", type: "text", expected: "increased O2 requirement", hint: "increased O2 requirement" },
            { id: "o2", label: "Current O₂ delivery", type: "text", expected: "4L NC", hint: "4L NC" },
            { id: "intake", label: "PO intake this shift", type: "select", options: ["None", "Full meals", "Snacks only"], expected: "None" },
            { id: "escalate", label: "RN notified of respiratory change?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "pct-io-chart",
      title: "Intake & Output Chart",
      description:
        "Record fluid balance on the patient chart — core acute-care PCT documentation.",
      gameType: "patient-chart-workspace",
      duration: "6–10 min",
      domain: "Clinical monitoring",
      content: {
        patientChart: {
          title: "I&O Record — Med-Surg",
          brief: "Document intake and output for the past 8 hours.",
          patientName: "D. Morgan, 45M",
          chiefComplaint: "Post-op fluid monitoring",
          tasks: [
            { field: "intake", label: "Oral intake (mL)", expected: "240", normalRange: "Per care plan", unit: "mL" },
            { field: "output", label: "Urine output (mL)", expected: "180", normalRange: "Report oliguria < 30 mL/hr", unit: "mL" },
            { field: "bm", label: "Nausea documented (Yes/No)", expected: "Yes", normalRange: "Report to RN" },
          ],
        },
      },
    },
    {
      id: "pct-vitals",
      title: "PCT Vitals & Intake",
      description: "Document vitals and intake like a hospital PCT.",
      gameType: "patient-chart-workspace",
      duration: "8–12 min",
      domain: "Acute care",
      content: {
        patientChart: {
          title: "ED Holding — PCT Assessment",
          brief: "Complete intake before RN assessment.",
          patientName: "D. Morgan, 45M",
          chiefComplaint: "Abdominal pain × 6 hours",
          tasks: [
            { field: "bp", label: "Blood pressure", expected: "138/84", normalRange: "Document trend" },
            { field: "pulse", label: "Pulse", expected: "102", normalRange: "60–100", unit: "bpm" },
            { field: "temp", label: "Temperature (°F)", expected: "100.4", normalRange: "97.8–99.1", unit: "°F" },
          ],
        },
      },
    },
    {
      id: "pct-delegation",
      title: "PCT Scope & Escalation",
      description: "Know what PCTs do vs RN — escalate abnormal findings.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Delegation",
      content: {
        script: [
          {
            prompt: "Patient new O₂ requirement 4L, still short of breath after repositioning.",
            options: [
              { text: "Document only — RN will round later", feedback: "Acute respiratory change needs immediate RN notification.", points: 0 },
              { text: "Notify RN immediately; stay with patient per protocol", feedback: "Correct escalation.", points: 3 },
              { text: "Increase O₂ to 10L without order", feedback: "PCTs follow orders; escalate.", points: 0 },
            ],
          },
          {
            prompt: "Family asks you to explain chemotherapy side effects.",
            options: [
              { text: "Explain in detail — you have experience", feedback: "Teaching/counseling is RN/provider scope.", points: 0 },
              { text: "Arrange RN/pharmacist teaching; provide comfort measures within PCT role", feedback: "Appropriate boundary.", points: 3 },
              { text: "Refer them to the internet", feedback: "Unprofessional; use care team.", points: 0 },
            ],
          },
        ],
      },
    },
    {
      id: "pct-adl-seq",
      title: "ADL & Mobility Assist Order",
      description: "Safe patient care sequence for ambulation and hygiene.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Direct care",
      content: {
        sequence: [
          "Check orders and assess patient readiness",
          "Gather equipment and perform hand hygiene",
          "Explain procedure; ensure privacy and call light reach",
          "Use proper body mechanics and assist devices",
          "Monitor tolerance; document and report changes",
        ],
      },
    },
  ],

  "teaching-assistant": [
    {
      id: "ta-attendance-intake",
      title: "Attendance & Tardy Log",
      description:
        "Document tardies and absences per district policy — paraeducator admin task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Documentation",
      content: {
        intakeForm: {
          title: "Daily Attendance Log — Period 2",
          brief: "Objective entries for office and lead teacher.",
          scenario: "Student arrived 18 minutes late without a pass; third tardy this month.",
          fields: [
            { id: "student", label: "Student ID or initials", type: "text", expected: "J.M.", hint: "J.M." },
            { id: "time", label: "Arrival time", type: "text", expected: "9:18 AM", hint: "9:18 AM" },
            { id: "pass", label: "Office pass presented?", type: "select", options: ["Yes", "No"], expected: "No" },
            { id: "action", label: "Action per handbook", type: "select", options: ["Log tardy; notify lead teacher", "Ignore", "Send home"], expected: "Log tardy; notify lead teacher" },
          ],
        },
      },
    },
    {
      id: "ta-accommodation-checklist",
      title: "IEP Accommodation Checklist",
      description:
        "Verify test accommodations are in place before assessment — legal compliance task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Special education",
      content: {
        intakeForm: {
          title: "Assessment Accommodation Verification",
          brief: "Check each IEP accommodation before testing begins.",
          scenario: "Student has extended time, reduced-distraction setting, and read-aloud for math only.",
          fields: [
            { id: "setting", label: "Reduced-distraction room reserved?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "time", label: "Extended time (1.5×) noted on materials?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "readaloud", label: "Read-aloud limited to math per IEP?", type: "select", options: ["Yes", "No", "All subjects"], expected: "Yes" },
            { id: "teacher", label: "Lead teacher signed off?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "ta-behavior-log",
      title: "Behavior & Accommodation Log",
      description: "Document classroom incidents and IEP cues accurately.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Documentation",
      content: {
        intakeForm: {
          title: "Paraeducator Incident Log",
          brief: "Objective log for lead teacher and admin.",
          scenario: "Student left seat twice during math block; redirection provided.",
          fields: [
            { id: "time", label: "Time", type: "text", expected: "10:15 AM", hint: "10:15 AM" },
            { id: "behavior", label: "Observed behavior (objective)", type: "text", expected: "left seat without permission", hint: "left seat without permission" },
            { id: "action", label: "Staff action", type: "text", expected: "verbal redirect to seat", hint: "verbal redirect to seat" },
            { id: "notify", label: "Lead teacher notified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "ta-classroom",
      title: "Classroom Support Judgment",
      description: "Small groups, confidentiality, and student dignity.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Paraeducator practice",
      content: {
        script: [
          {
            prompt: "Student with IEP asks you to read test questions aloud in main classroom.",
            options: [
              { text: "Read aloud to whole class", feedback: "Follow IEP accommodation location/method.", points: 0 },
              { text: "Provide accommodation per IEP (e.g. reduced-distraction setting)", feedback: "Correct implementation.", points: 3 },
              { text: "Refuse all help — tests must be equal", feedback: "Accommodations are legal requirements.", points: 0 },
            ],
          },
          {
            prompt: "Parent corners you in parking lot for full IEP details.",
            options: [
              { text: "Share entire IEP — parent has right to know", feedback: "Direct parent to teacher/case manager; you share only your role allows.", points: 1 },
              { text: "Politely refer to case manager; do not share confidential records informally", feedback: "FERPA-aware response.", points: 3 },
              { text: "Ignore parent", feedback: "Professional referral is required.", points: 0 },
            ],
          },
        ],
      },
    },
    {
      id: "ta-small-group-seq",
      title: "Small-Group Reteach Sequence",
      description: "Order steps for a para-led reteach session.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Instructional support",
      content: {
        sequence: [
          "Confirm objective with lead teacher",
          "Gather materials and review student needs",
          "Activate prior knowledge with short warm-up",
          "Guide practice with prompts and checks for understanding",
          "Exit check and report results to teacher",
        ],
      },
    },
  ],

  "vet-tech": [
    {
      id: "vet-vitals-chart",
      title: "Triage Vitals Chart",
      description:
        "Document weight, temp, pulse, and respiration before DVM exam — vet tech daily task.",
      gameType: "patient-chart-workspace",
      duration: "6–10 min",
      domain: "Triage",
      content: {
        patientChart: {
          title: "Technician Triage — Canine",
          brief: "Complete vitals before veterinarian exam.",
          patientName: "Buddy — 4 y/o Labrador, 68 lb",
          chiefComplaint: "Vomiting × 12 hours, lethargy",
          tasks: [
            { field: "temp", label: "Temperature (°F)", expected: "102.8", normalRange: "100–102.5°F dogs", unit: "°F" },
            { field: "pulse", label: "Pulse (bpm)", expected: "120", normalRange: "60–140 bpm", unit: "bpm" },
            { field: "resp", label: "Respiratory rate", expected: "28", normalRange: "10–30/min", unit: "/min" },
          ],
        },
      },
    },
    {
      id: "vet-intake",
      title: "Veterinary Patient Intake",
      description: "Species, weight, chief complaint, and vaccination status.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Clinical intake",
      content: {
        intakeForm: {
          title: "Canine Wellness Visit",
          brief: "Triage before technician exam.",
          scenario: "4-year-old Labrador — annual vaccines due.",
          fields: [
            { id: "patient", label: "Patient name", type: "text", expected: "Buddy", hint: "Buddy" },
            { id: "species", label: "Species", type: "text", expected: "Canine", hint: "Canine" },
            { id: "weight", label: "Weight (lb)", type: "text", expected: "68", hint: "68" },
            { id: "rabies", label: "Rabies status", type: "select", options: ["Current", "Overdue", "Unknown"], expected: "Current" },
          ],
        },
      },
    },
    {
      id: "vet-dosage",
      title: "Veterinary Dosage Math",
      description: "mg/kg calculations for medication prep.",
      gameType: "jobsite-workspace",
      duration: "8–12 min",
      domain: "Pharmacy math",
      content: {
        jobsite: {
          title: "Pre-Medication Calculation",
          brief: "Calculate dose from mg/kg order.",
          tasks: [
            { prompt: "Dog 20 kg. Order 5 mg/kg. Total mg?", answer: "100", unit: "mg", explanation: "20 × 5 = 100 mg." },
            { prompt: "Concentration 50 mg/mL. Volume to draw (mL)?", answer: "2", unit: "mL", explanation: "100 ÷ 50 = 2 mL." },
          ],
        },
      },
    },
    {
      id: "vet-safety",
      title: "Vet Tech Safety Judgment",
      description: "Zoonosis, restraint, and controlled drug handling.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Safety",
      content: {
        script: [
          {
            prompt: "Fractious cat needs blood draw; owner insists on no restraint.",
            options: [
              { text: "Proceed without restraint", feedback: "Staff and patient safety require appropriate restraint.", points: 0 },
              { text: "Pause; explain safe restraint options; involve DVM if needed", feedback: "Standard practice.", points: 3 },
              { text: "Sedate without DVM approval", feedback: "Controlled drugs require veterinarian order.", points: 0 },
            ],
          },
          {
            prompt: "You notice expired rabies tag but computer shows current vaccine.",
            options: [
              { text: "Update tag from record after verification", feedback: "Reconcile documentation with verified record.", points: 3 },
              { text: "Ignore — close enough", feedback: "Rabies documentation is legal/public health matter.", points: 0 },
              { text: "Create fake tag", feedback: "Fraud and safety risk.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "childcare-cda": [
    {
      id: "cda-incident-report",
      title: "Injury Incident Report",
      description:
        "Document playground injury objectively for licensing and parent notification — CDA requirement.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Safety documentation",
      content: {
        intakeForm: {
          title: "Incident Report — Playground",
          brief: "Complete before parent pickup; notify director per policy.",
          scenario: "Preschooler scraped knee on mulch; no head injury; ice applied.",
          fields: [
            { id: "child", label: "Child name", type: "text", expected: "Sam Rivera", hint: "Sam Rivera" },
            { id: "injury", label: "Injury description (objective)", type: "text", expected: "scrape left knee", hint: "scrape left knee" },
            { id: "firstaid", label: "First aid provided", type: "text", expected: "cleaned and ice pack", hint: "cleaned and ice pack" },
            { id: "parent", label: "Parent notified at pickup?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "cda-health-screen",
      title: "Daily Health Screen",
      description:
        "Log arrival health checks and exclusion criteria — post-COVID licensing standard.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Health & safety",
      content: {
        intakeForm: {
          title: "Morning Health Screen — Room 3",
          brief: "Document each child's arrival wellness check.",
          scenario: "Child arrived with fever yesterday; parent reports temperature normal today but runny nose.",
          fields: [
            { id: "temp", label: "Temperature at drop-off (°F)", type: "text", expected: "98.4", hint: "98.4" },
            { id: "symptoms", label: "Symptoms today", type: "text", expected: "runny nose", hint: "runny nose" },
            { id: "exclude", label: "Meets exclusion criteria?", type: "select", options: ["No — may attend", "Yes — send home", "Ignore symptoms"], expected: "No — may attend" },
            { id: "director", label: "Director consulted if borderline?", type: "select", options: ["Yes", "No", "Not needed"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "cda-child-intake",
      title: "Child Enrollment Intake",
      description: "Allergies, guardians, and emergency contacts.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Early childhood admin",
      content: {
        intakeForm: {
          title: "Center Enrollment Form",
          brief: "Complete before first day in classroom.",
          scenario: "Preschooler — peanut allergy — divorced parents both authorized pickup.",
          fields: [
            { id: "child", label: "Child name", type: "text", expected: "Sam Rivera", hint: "Sam Rivera" },
            { id: "allergy", label: "Allergy documented", type: "text", expected: "peanut", hint: "peanut" },
            { id: "epi", label: "EpiPen on file?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "pickup", label: "Pickup list verified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "cda-safety",
      title: "Child Safety & Mandated Reporting",
      description: "Supervision, ratios, and abuse reporting judgment.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "CDA competency",
      content: {
        script: [
          {
            prompt: "Child arrives with unexplained bruising pattern and flinches from adults.",
            options: [
              { text: "Document observations; follow state mandated reporting procedure", feedback: "CDA/ethics requirement.", points: 3 },
              { text: "Confront parents in parking lot", feedback: "Follow policy; report to supervisor/agency.", points: 0 },
              { text: "Ignore — not your business", feedback: "Mandated reporter duty.", points: 0 },
            ],
          },
          {
            prompt: "Ratio is 1:10 but policy max is 1:8 during lunch transition.",
            options: [
              { text: "Proceed — short overlap is fine", feedback: "Ratio violations are licensing risks.", points: 0 },
              { text: "Call for float staff or adjust groups before proceeding", feedback: "Active supervision standard.", points: 3 },
              { text: "Lock one child in office", feedback: "Unsafe and prohibited.", points: 0 },
            ],
          },
        ],
      },
    },
    {
      id: "cda-daily-seq",
      title: "Daily Classroom Routine Order",
      description: "Sequence arrival through handwashing and learning block.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Routine",
      content: {
        sequence: [
          "Greet children; verify attendance and health screen",
          "Handwashing and breakfast/snack per plan",
          "Circle time: calendar, songs, objective preview",
          "Centers or guided play with active supervision",
          "Transition, outdoor time if scheduled, document incidents",
        ],
      },
    },
  ],

  "auto-mechanic": [
    {
      id: "ase-work-order-intake",
      title: "Repair Order Intake",
      description:
        "Capture customer concern, mileage, and authorization before bay work — shop counter workflow.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Service advisor",
      content: {
        intakeForm: {
          title: "RO #8842 — Brake Noise",
          brief: "Accurate complaint documentation prevents comebacks.",
          scenario: "Customer reports grinding noise when braking; 2019 sedan, 62,000 miles.",
          fields: [
            { id: "customer", label: "Customer name", type: "text", expected: "Torres, Maria", hint: "Torres, Maria" },
            { id: "mileage", label: "Odometer reading", type: "text", expected: "62000", hint: "62000" },
            { id: "complaint", label: "Customer concern", type: "text", expected: "grinding when braking", hint: "grinding when braking" },
            { id: "auth", label: "Diagnostic fee authorized?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "ase-fluid-check",
      title: "Under-Hood Fluid Inspection",
      description:
        "Record brake fluid, oil level, and coolant readings on the inspection sheet.",
      gameType: "jobsite-workspace",
      duration: "6–10 min",
      domain: "ASE maintenance",
      content: {
        jobsite: {
          title: "Multi-Point Inspection",
          brief: "Enter readings from bay inspection before customer call.",
          tasks: [
            { prompt: "Brake fluid MIN mark is at 50 mm. Measured 48 mm. Service brake fluid? (1=yes 0=no)", answer: "1", unit: "", explanation: "Below MIN — recommend service." },
            { prompt: "Oil level on dipstick: between MIN and MAX. OK to release? (1=yes 0=no)", answer: "1", unit: "", explanation: "Within range — no top-off needed." },
            { prompt: "Coolant reservoir below COLD line on cold engine. Action? (1=top off per spec 0=ignore)", answer: "1", unit: "", explanation: "Top off with correct coolant mix per manufacturer spec." },
          ],
        },
      },
    },
    {
      id: "ase-brake-seq",
      title: "Brake Service Sequence",
      description: "Order lift, inspect, and reassembly steps.",
      gameType: "sequence-build",
      duration: "6–10 min",
      domain: "ASE brakes",
      content: {
        sequence: [
          "Test drive and document complaint (if safe)",
          "Raise vehicle on lift; remove wheels safely",
          "Inspect rotors, pads, calipers, and hardware",
          "Replace/service components per spec; torque lug nuts",
          "Bleed system if opened; road test and document work order",
        ],
      },
    },
    {
      id: "ase-shop-math",
      title: "Shop Math & Specs",
      description: "Torque, measurement, and fluid calculations.",
      gameType: "jobsite-workspace",
      duration: "6–10 min",
      domain: "Shop math",
      content: {
        jobsite: {
          title: "Brake Job Calculator",
          brief: "Verify specs before return to customer.",
          tasks: [
            { prompt: "Lug torque spec 100 Nm. Pattern requires 4 passes. Total Nm applied across one bolt if final pass only counts? (final torque)", answer: "100", unit: "Nm", explanation: "Final torque value is 100 Nm." },
            { prompt: "Rotor minimum thickness 22 mm. Measured 21.2 mm. Replace? (answer 1=yes 0=no)", answer: "1", unit: "", explanation: "Below minimum — must replace." },
          ],
        },
      },
    },
    {
      id: "ase-safety",
      title: "Shop Safety Judgment",
      description: "Lift points, PPE, and customer authorization.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Safety",
      content: {
        script: [
          {
            prompt: "Customer declines recommended brake service — pads metal-to-metal noise.",
            options: [
              { text: "Perform work anyway", feedback: "Need authorization; document refusal.", points: 0 },
              { text: "Document declined service, safety risk explained, sign waiver per shop policy", feedback: "Professional standard.", points: 3 },
              { text: "Disable brakes so they must return", feedback: "Illegal and dangerous.", points: 0 },
            ],
          },
          {
            prompt: "Quick lube bay — coworker skips jack stands on lift.",
            options: [
              { text: "Ignore — experienced tech", feedback: "Stop work; stands required per policy.", points: 0 },
              { text: "Stop job; require proper support before under-vehicle work", feedback: "OSHA/shop safety.", points: 3 },
              { text: "Film for social media", feedback: "Address hazard immediately.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "insurance-agent": [
    {
      id: "ins-fnol-intake",
      title: "First Notice of Loss (FNOL)",
      description:
        "Capture claim facts at first client call — producer licensing and E&O core skill.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Claims intake",
      content: {
        intakeForm: {
          title: "Auto Claim — FNOL",
          brief: "Accurate FNOL speeds adjuster assignment and prevents coverage disputes.",
          scenario: "Rear-ended at stoplight yesterday; other driver cited; minor bumper damage.",
          fields: [
            { id: "date", label: "Date of loss", type: "text", expected: "03/18/2026", hint: "03/18/2026" },
            { id: "location", label: "Loss location", type: "text", expected: "Main St & 5th Ave", hint: "Main St & 5th Ave" },
            { id: "injury", label: "Injuries reported?", type: "select", options: ["No", "Yes — minor", "Unknown"], expected: "No" },
            { id: "police", label: "Police report number", type: "text", expected: "2026-04182", hint: "2026-04182" },
          ],
        },
      },
    },
    {
      id: "ins-premium-spreadsheet",
      title: "Premium Comparison Sheet",
      description:
        "Build side-by-side premium and deductible totals for client presentation.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Policy math",
      content: {
        spreadsheet: {
          title: "Auto Quote Comparison — Garcia Family",
          brief: "Calculate annual and monthly totals for two coverage options.",
          headers: ["", "A", "B", "C", "D"],
          rows: [
            ["1", "Option", "Annual Premium", "Deductible", "Monthly (÷12)"],
            ["2", "Basic 25/50", "960", "1000", ""],
            ["3", "Preferred 100/300", "1440", "500", ""],
            ["4", "Monthly service fee", "5", "5", ""],
            ["5", "Monthly w/ fee", "", "", ""],
          ],
          tasks: [
            {
              instruction: "Basic monthly premium (annual ÷ 12) in D2.",
              targetCell: "D2",
              expectedValue: "80",
              formulaHint: "=B2/12",
            },
            {
              instruction: "Preferred monthly premium in D3.",
              targetCell: "D3",
              expectedValue: "120",
              formulaHint: "=B3/12",
            },
            {
              instruction: "Preferred monthly total with $5 fee in D5 (use D3 + fee).",
              targetCell: "D5",
              expectedValue: "125",
              formulaHint: "=D3+B4",
            },
          ],
        },
      },
    },
    {
      id: "ins-policy-intake",
      title: "Policy Application Intake",
      description: "Capture applicant, coverage, and disclosure fields.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Sales admin",
      content: {
        intakeForm: {
          title: "Auto Policy Application",
          brief: "Accurate application prevents E&O issues.",
          scenario: "New driver adding vehicle — prior carrier lapse 2 months.",
          fields: [
            { id: "applicant", label: "Named insured", type: "text", expected: "Garcia, Luis", hint: "Garcia, Luis" },
            { id: "vin", label: "VIN last 6 verified", type: "text", expected: "4A82K1", hint: "4A82K1" },
            { id: "lapse", label: "Coverage lapse disclosed?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "limit", label: "Bodily injury limit requested", type: "select", options: ["25/50", "50/100", "100/300"], expected: "100/300" },
          ],
        },
      },
    },
    {
      id: "ins-needs-analysis",
      title: "Needs Analysis & Ethics",
      description: "Suitability, replacement, and anti-churn ethics.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Producer ethics",
      content: {
        script: [
          {
            prompt: "Client wants minimum legal limits; teenage driver on policy.",
            options: [
              { text: "Sell minimum — customer is always right", feedback: "Document recommendation for higher limits; explain risk.", points: 1 },
              { text: "Explain exposure; recommend higher limits and UM; document discussion", feedback: "Suitable advice + documentation.", points: 3 },
              { text: "Hide teen driver to lower premium", feedback: "Misrepresentation and fraud.", points: 0 },
            ],
          },
          {
            prompt: "Manager offers bonus to rewrite all policies to new carrier without comparison.",
            options: [
              { text: "Rewrite everyone — bonus matters", feedback: "Churning/replacement regulations.", points: 0 },
              { text: "Compare coverage and cost; rewrite only when beneficial with proper disclosures", feedback: "Ethical producer practice.", points: 3 },
              { text: "Cancel policies without telling clients", feedback: "License violation.", points: 0 },
            ],
          },
        ],
      },
    },
    {
      id: "ins-premium-math",
      title: "Premium & Deductible Math",
      description: "Basic premium impact scenarios for licensing exams.",
      gameType: "math-scenario",
      duration: "6–10 min",
      domain: "Policy math",
      content: {
        math: [
          {
            prompt: "Premium $1,200/yr. Paid monthly with $5 service fee. Monthly total?",
            options: ["$95", "$100", "$105", "$110"],
            correctIndex: 2,
            explanation: "1,200 ÷ 12 = 100; +5 fee = $105.",
          },
          {
            prompt: "$500 deductible. Covered repair $2,300. Insurer pays (ignoring limits)?",
            options: ["$2,300", "$1,800", "$500", "$2,800"],
            correctIndex: 1,
            explanation: "2,300 − 500 = $1,800.",
          },
          {
            prompt: "Client doubles BI limits. Most likely premium effect?",
            options: ["Always drops 50%", "Usually increases", "Unchanged by law", "Policy cancels"],
            correctIndex: 1,
            explanation: "Higher limits generally increase premium.",
          },
        ],
      },
    },
  ],
};
