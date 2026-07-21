import type { CareerSkillSlug } from "./career-skills-catalog";
import { getCareerLabTrack } from "./career-lab-tracks";
import type { SkillGameContent } from "./skill-game-types";

/** Career-native simulation workspace content (spreadsheet, terminal, chart, jobsite). */
export const CAREER_WORKSPACE_CONTENT: Partial<Record<CareerSkillSlug, SkillGameContent>> = {
  bookkeeper: {
    spreadsheet: {
      title: "Monthly Ledger — Riverside Consulting",
      brief: "Your manager exported Q1 expenses. Complete the highlighted cells with formulas.",
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
          instruction: "Calculate Software total (Jan + Feb) in cell D2.",
          targetCell: "D2",
          expectedValue: "800",
          formulaHint: "=B2+C2",
        },
        {
          instruction: "Calculate Travel total in cell D3.",
          targetCell: "D3",
          expectedValue: "1040",
          formulaHint: "=B3+C3",
        },
        {
          instruction: "Sum all category totals in D5 (D2:D4).",
          targetCell: "D5",
          expectedValue: "2035",
          formulaHint: "=SUM(D2:D4)",
        },
      ],
    },
  },
  "bank-teller": {
    spreadsheet: {
      title: "Teller Drawer Reconciliation",
      brief: "End of shift — balance the drawer. Enter formulas in the highlighted cells.",
      headers: ["", "A", "B", "C"],
      rows: [
        ["1", "Item", "Count", "Value"],
        ["2", " $20 bills", "45", ""],
        ["3", " $5 bills", "32", ""],
        ["4", "Checks", "1", "1250"],
        ["5", "Drawer Total", "", ""],
      ],
      tasks: [
        {
          instruction: "Calculate value of $20 bills (45 × 20) in cell C2.",
          targetCell: "C2",
          expectedValue: "900",
          formulaHint: "=B2*20",
        },
        {
          instruction: "Calculate value of $5 bills in cell C3.",
          targetCell: "C3",
          expectedValue: "160",
          formulaHint: "=B3*5",
        },
        {
          instruction: "Sum all values in C5 (C2:C4).",
          targetCell: "C5",
          expectedValue: "2310",
          formulaHint: "=SUM(C2:C4)",
        },
      ],
    },
  },
  "project-management": {
    spreadsheet: {
      title: "Sprint Budget Tracker",
      brief: "Track task costs for your agile sprint. Complete the budget sheet.",
      headers: ["", "A", "B", "C"],
      rows: [
        ["1", "Task", "Hours", "Cost ($50/hr)"],
        ["2", "Design", "12", ""],
        ["3", "Development", "40", ""],
        ["4", "QA", "8", ""],
        ["5", "Sprint Total", "", ""],
      ],
      tasks: [
        { instruction: "Calculate Design cost in C2 (12 hrs × $50).", targetCell: "C2", expectedValue: "600", formulaHint: "=B2*50" },
        { instruction: "Calculate Development cost in C3.", targetCell: "C3", expectedValue: "2000", formulaHint: "=B3*50" },
        { instruction: "Sum sprint costs in C5.", targetCell: "C5", expectedValue: "2800", formulaHint: "=SUM(C2:C4)" },
      ],
    },
  },
  "data-analyst": {
    spreadsheet: {
      title: "Q2 Regional Sales — Clean & Summarize",
      brief: "Your manager exported raw sales data. Build summary metrics like a junior data analyst.",
      headers: ["", "A", "B", "C", "D"],
      rows: [
        ["1", "Region", "Units", "Unit Price", "Revenue"],
        ["2", "West", "120", "40", ""],
        ["3", "East", "95", "40", ""],
        ["4", "Central", "150", "35", ""],
        ["5", "Total Revenue", "", "", ""],
      ],
      tasks: [
        {
          instruction: "Calculate West revenue (Units × Unit Price) in cell D2.",
          targetCell: "D2",
          expectedValue: "4800",
          formulaHint: "=B2*C2",
        },
        {
          instruction: "Calculate East revenue in cell D3.",
          targetCell: "D3",
          expectedValue: "3800",
          formulaHint: "=B3*C3",
        },
        {
          instruction: "Sum all regional revenue in D5 (D2:D4).",
          targetCell: "D5",
          expectedValue: "13850",
          formulaHint: "=SUM(D2:D4)",
        },
      ],
    },
  },
  "information-technology": {
    terminal: {
      title: "IT Ops — Network Outage Ticket",
      brief: "A floor reports no network access. Use the command line to triage like an IT technician.",
      hostname: "IT-LAB-01",
      prompt: "C:\\Users\\ITOps> ",
      initialOutput: "Priority ticket: Building B — multiple users offline after switch maintenance.",
      steps: [
        {
          instruction: "Verify this workstation received an IP address.",
          expectedCommand: "ipconfig",
          hint: "ipconfig",
        },
        {
          instruction: "Test reachability to a reliable external host.",
          expectedCommand: "ping 8.8.8.8",
          hint: "ping 8.8.8.8",
        },
        {
          instruction: "Open network connections to confirm the adapter is enabled.",
          expectedCommand: "ncpa.cpl",
          hint: "ncpa.cpl",
        },
      ],
    },
  },
  "it-support": {
    terminal: {
      title: "Ticket INC-3847: No Internet",
      brief: "User cannot browse. Use the command line to diagnose and confirm connectivity.",
      hostname: "DESK-042",
      prompt: "C:\\Users\\Tech> ",
      initialOutput: "Ticket opened: User reports no internet access after router reboot.",
      steps: [
        {
          instruction: "Check the IP configuration on this PC.",
          expectedCommand: "ipconfig",
          hint: "ipconfig",
        },
        {
          instruction: "Test connectivity to a public DNS server.",
          expectedCommand: "ping 8.8.8.8",
          hint: "ping 8.8.8.8",
        },
        {
          instruction: "Open network adapter settings to verify the adapter is enabled.",
          expectedCommand: "ncpa.cpl",
          hint: "ncpa.cpl",
        },
      ],
    },
  },
  cna: {
    patientChart: {
      title: "Morning Vitals — Room 12",
      brief: "Document vitals for Mr. Chen before the nurse's rounds.",
      patientName: "James Chen, 68M",
      chiefComplaint: "Post-op day 1 — knee replacement",
      tasks: [
        { field: "bp", label: "Blood pressure (systolic/diastolic)", expected: "120/78", normalRange: "90–120 / 60–80" },
        { field: "pulse", label: "Pulse (bpm)", expected: "72", normalRange: "60–100", unit: "bpm" },
        { field: "temp", label: "Temperature (°F)", expected: "98.6", normalRange: "97.8–99.1", unit: "°F" },
      ],
    },
  },
  "medical-assistant": {
    patientChart: {
      title: "Pre-Provider Vitals",
      brief: "Room the patient and complete the chart before the physician enters.",
      patientName: "Maria Santos, 52F",
      chiefComplaint: "Chest tightness × 2 days",
      tasks: [
        { field: "bp", label: "Blood pressure", expected: "142/88", normalRange: "< 120/80" },
        { field: "o2", label: "SpO₂ (%)", expected: "97", normalRange: "95–100", unit: "%" },
        { field: "weight", label: "Weight (lbs)", expected: "168", unit: "lbs" },
      ],
    },
  },
  "pharmacy-tech": {
    jobsite: {
      title: "Retail Pharmacy — Fill Prescription",
      brief: "Calculate tablets to dispense using the label directions.",
      tasks: [
        {
          prompt: "Rx: Amoxicillin 500 mg, sig: 1 tab PO BID × 10 days. How many tablets?",
          answer: "20",
          unit: "tablets",
          explanation: "BID = twice daily → 2 × 10 days = 20 tablets.",
        },
        {
          prompt: "Label says 250 mg/5 mL. Order is 500 mg. How many mL per dose?",
          answer: "10",
          unit: "mL",
          explanation: "500 mg needs double the 250 mg/5 mL concentration → 10 mL.",
        },
      ],
    },
  },
  electrician: {
    jobsite: {
      title: "Conduit Fill Calculation",
      brief: "On the jobsite, calculate wire and conduit requirements.",
      tasks: [
        {
          prompt: "A 20-amp branch circuit runs 85 feet. Voltage drop limit uses 3% on 120V. Approximate max drop volts?",
          answer: "3.6",
          unit: "volts",
          explanation: "3% of 120V = 3.6V maximum acceptable drop.",
        },
        {
          prompt: "12 AWG copper on a 20A breaker — max continuous load (80% rule) in amps?",
          answer: "16",
          unit: "amps",
          explanation: "80% of 20A = 16A for continuous loads.",
        },
      ],
    },
  },
  "hvac-tech": {
    jobsite: {
      title: "Cooling Load Estimate",
      brief: "Field measurements for a residential service call.",
      tasks: [
        {
          prompt: "Room is 18 ft × 12 ft × 8 ft. Volume in cubic feet?",
          answer: "1728",
          unit: "cu ft",
          explanation: "18 × 12 × 8 = 1,728 cubic feet.",
        },
        {
          prompt: "Supply air 55°F, return air 75°F. Temperature difference (ΔT)?",
          answer: "20",
          unit: "°F",
          explanation: "75 − 55 = 20°F delta T.",
        },
      ],
    },
  },
  "cdl-driver": {
    jobsite: {
      title: "Axle Weight Check",
      brief: "Before leaving the dock, verify weight compliance.",
      tasks: [
        {
          prompt: "Steer axle reads 11,800 lb. Legal max steer (single) is 12,000 lb. Margin remaining?",
          answer: "200",
          unit: "lb",
          explanation: "12,000 − 11,800 = 200 lb remaining.",
        },
        {
          prompt: "Drive axles total 33,400 lb on a 34,000 lb limit. Over or under?",
          answer: "600",
          unit: "lb under",
          explanation: "34,000 − 33,400 = 600 lb under the limit.",
        },
      ],
    },
  },
  "firefighter-emt": {
    jobsite: {
      title: "IV Drip Rate",
      brief: "Calculate medication drip rates in the field.",
      tasks: [
        {
          prompt: "1000 mL bag to run over 8 hours. Drip rate in mL/hr?",
          answer: "125",
          unit: "mL/hr",
          explanation: "1000 ÷ 8 = 125 mL/hr.",
        },
        {
          prompt: "Pediatric weight 44 lb. Using 1 kg ≈ 2.2 lb, weight in kg (round to nearest whole)?",
          answer: "20",
          unit: "kg",
          explanation: "44 ÷ 2.2 = 20 kg.",
        },
      ],
    },
  },
  "family-services": {
    intakeForm: {
      title: "Family Intake — Clark County",
      brief: "A caller reports housing instability. Complete the intake form for supervisor review.",
      scenario:
        "Caller: single parent, two children (4 and 7), eviction notice dated today. No DV indicators. Needs emergency shelter referral.",
      fields: [
        { id: "risk", label: "Immediate safety risk level", type: "select", options: ["Low", "Moderate", "High", "Critical"], expected: "Moderate", hint: "Housing crisis but no DV — Moderate" },
        { id: "household", label: "Household size (adults + children)", type: "text", expected: "3", hint: "1 adult + 2 children" },
        { id: "referral", label: "Primary referral type", type: "select", options: ["Shelter", "Food bank", "Medicaid", "Substance abuse"], expected: "Shelter", hint: "Eviction today → shelter" },
        { id: "notes", label: "Supervisor note (one sentence)", type: "textarea", expected: "expedited shelter placement", hint: "Mention expedited shelter" },
      ],
    },
  },
  "social-caseworker": {
    intakeForm: {
      title: "Crisis Intake — Safety Plan",
      brief: "Document a mandated reporter call and initial safety plan fields.",
      scenario:
        "School counselor reports a 15-year-old disclosed self-harm ideation without a plan. Parent reachable. No weapons in home.",
      fields: [
        { id: "mandated", label: "Mandated reporter source", type: "text", expected: "school counselor", hint: "Who called in?" },
        { id: "safety", label: "Immediate safety plan action", type: "select", options: ["Remove from home", "Safety contract + supervision", "No action", "Hospital hold"], expected: "Safety contract + supervision", hint: "Ideation without plan — supervised safety contract" },
        { id: "followup", label: "Follow-up within (hours)", type: "text", expected: "24", hint: "Crisis follow-up within 24 hours" },
        { id: "collateral", label: "Collateral contact required", type: "select", options: ["Parent only", "Parent and school", "Law enforcement", "None"], expected: "Parent and school", hint: "Coordinate with school" },
      ],
    },
  },
  "police-officer": {
    intakeForm: {
      title: "Traffic Stop — Incident Report",
      brief: "Document a routine traffic stop for records management.",
      scenario:
        "Vehicle: blue sedan, plate NV-4821, speed 47 in a 35 zone. Driver licensed, cooperative, warning issued.",
      fields: [
        { id: "violation", label: "Primary violation code", type: "text", expected: "speeding", hint: "47 in 35 zone" },
        { id: "action", label: "Enforcement action", type: "select", options: ["Arrest", "Citation", "Warning", "No action"], expected: "Warning", hint: "Cooperative driver — warning" },
        { id: "speed", label: "Recorded speed (mph)", type: "text", expected: "47", hint: "Speed from radar" },
        { id: "narrative", label: "Narrative keyword", type: "text", expected: "cooperative", hint: "Driver attitude" },
      ],
    },
  },
  "real-estate": {
    intakeForm: {
      title: "Seller Listing Intake",
      brief: "Complete the listing intake before MLS entry.",
      scenario:
        "Seller wants to list a 3BR/2BA single-family home. Asking $425,000. Occupied; showings after 5 PM weekdays.",
      fields: [
        { id: "price", label: "List price ($)", type: "text", expected: "425000", hint: "Asking price from scenario" },
        { id: "beds", label: "Bedrooms", type: "text", expected: "3", hint: "3BR" },
        { id: "showing", label: "Showing instructions", type: "textarea", expected: "after 5 pm weekdays", hint: "When can buyers tour?" },
        { id: "disclosure", label: "Occupancy disclosure", type: "select", options: ["Vacant", "Tenant occupied", "Owner occupied", "Unknown"], expected: "Owner occupied", hint: "Seller still living there" },
      ],
    },
  },
  cosmetology: {
    labBench: {
      title: "Post-Service Sanitation",
      brief: "State board requires this sequence after every chemical service.",
      steps: [
        {
          instruction: "First step after client leaves the chair:",
          choices: [
            { label: "Sweep hair from floor", correct: false, feedback: "Disinfect tools first — hair can wait." },
            { label: "Place used implements in EPA-registered disinfectant", correct: true, feedback: "Correct — implements soak per state board time." },
            { label: "Reuse cape on next client", correct: false, feedback: "Never reuse without laundering." },
          ],
        },
        {
          instruction: "Disinfectant contact time — you should:",
          choices: [
            { label: "Rinse immediately after dipping", correct: false, feedback: "Must meet label contact time (often 10 min)." },
            { label: "Follow manufacturer contact time, then rinse and dry", correct: true, feedback: "Correct — contact time is licensure requirement." },
            { label: "Wipe with a dry towel only", correct: false, feedback: "Dry wipe does not meet disinfection standard." },
          ],
        },
        {
          instruction: "Single-use items (neck strips, cotton with blood):",
          choices: [
            { label: "Store in drawer for next client", correct: false, feedback: "Single-use means discard after one client." },
            { label: "Discard in covered waste receptacle", correct: true, feedback: "Correct — biohazard protocol for blood exposure." },
            { label: "Spray with water and reuse", correct: false, feedback: "Never reuse contaminated single-use items." },
          ],
        },
      ],
    },
  },
  "teacher-cert": {
    intakeForm: {
      title: "Lesson Plan Intake — Grade 8 ELA",
      brief: "Complete the lesson plan form your mentor teacher requires before observation.",
      scenario:
        "Standard: RI.8.1 cite textual evidence. 50-minute class, 28 students, 4 IEP accommodations (extended time, preferential seating).",
      fields: [
        { id: "objective", label: "Learning objective (starts with 'Students will')", type: "textarea", expected: "students will cite textual evidence", hint: "Use SWBAT / Students will…" },
        { id: "standard", label: "Standard code", type: "text", expected: "RI.8.1", hint: "Reading informational 8.1" },
        { id: "assessment", label: "Formative assessment method", type: "select", options: ["Exit ticket", "Multiple choice only", "No assessment", "Parent email"], expected: "Exit ticket", hint: "Quick check for evidence skill" },
        { id: "accommodation", label: "Documented accommodation", type: "text", expected: "extended time", hint: "One IEP accommodation from scenario" },
      ],
    },
  },
};

export function mergeCareerSkillContent(
  slug: CareerSkillSlug,
  base: SkillGameContent,
): SkillGameContent {
  const workspace = CAREER_WORKSPACE_CONTENT[slug];
  const trackFallback = getCareerLabTrack(slug)?.[0]?.content ?? {};
  // Track first lab fills gaps (e.g. helpdeskQueue / intakeForm) when catalog
  // primary content is still an older drill format.
  return { ...trackFallback, ...base, ...(workspace ?? {}) };
}
