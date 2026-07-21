import type { CareerSkillSlug } from "./career-skills-catalog";
import type { CareerLabModule } from "./career-lab-tracks-extended";

/** Tier-1 high-demand careers added from public search / cert audit (2026). */
export const CAREER_LAB_TRACKS_TIER1: Partial<
  Record<CareerSkillSlug, CareerLabModule[]>
> = {
  "phlebotomy-tech": [
    {
      id: "phleb-label-intake",
      title: "Specimen Labeling & Handling",
      description:
        "Verify labels, special handling (ice/light protection), and specimen rejection criteria.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Post-analytical",
      content: {
        intakeForm: {
          title: "Specimen QC — Pre-Transport",
          brief: "Verify every tube before placing in courier bin.",
          scenario: "3 tubes drawn: SST (lipids), lavender (CBC), light blue (PT/INR). Light blue tube is underfilled.",
          fields: [
            { id: "labels", label: "All tubes labeled at bedside?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "underfill", label: "Light blue tube underfilled — action?", type: "select", options: ["Send anyway", "Redraw per policy", "Top off from SST"], expected: "Redraw per policy" },
            { id: "ice", label: "Any tubes require ice transport?", type: "select", options: ["No", "Yes — ammonia/ABG"], expected: "No" },
            { id: "centrifuge", label: "SST centrifuged within time limit?", type: "select", options: ["Yes", "No — flag"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "phleb-difficult-draw",
      title: "Difficult Draw Documentation",
      description:
        "Document a failed or difficult venipuncture per policy — patient safety and legal record.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Clinical documentation",
      content: {
        intakeForm: {
          title: "Difficult Draw Log",
          brief: "Complete after two unsuccessful attempts per policy.",
          scenario: "Elderly patient, fragile veins. Two attempts failed — referred to supervisor for butterfly needle draw.",
          fields: [
            { id: "attempts", label: "Number of attempts", type: "text", expected: "2", hint: "2" },
            { id: "sites", label: "Sites attempted", type: "text", expected: "right AC, left hand", hint: "right AC, left hand" },
            { id: "outcome", label: "Outcome", type: "select", options: ["Successful on 2nd", "Referred to supervisor", "Patient refused"], expected: "Referred to supervisor" },
            { id: "patient_notified", label: "Patient informed of referral?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "phleb-order-intake",
      title: "Lab Order & Patient ID",
      description: "Verify orders, fasting status, and two-identifier patient ID before draw.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Pre-analytical",
      content: {
        intakeForm: {
          title: "Outpatient Lab Requisition",
          brief: "Confirm the draw is safe and correct before venipuncture.",
          scenario: "Fasting lipid panel — walk-in patient with paper order.",
          fields: [
            { id: "patient", label: "Patient name", type: "text", expected: "Santos, Maria", hint: "Santos, Maria" },
            { id: "dob", label: "Date of birth", type: "text", expected: "04/12/1988", hint: "04/12/1988" },
            { id: "fasting", label: "Fasting confirmed?", type: "select", options: ["Yes", "No", "Unknown"], expected: "Yes" },
            { id: "tube", label: "Primary tube for lipid panel", type: "select", options: ["SST/gold", "Lavender EDTA", "Light blue citrate"], expected: "SST/gold" },
          ],
        },
      },
    },
    {
      id: "phleb-draw-sequence",
      title: "Venipuncture Setup Order",
      description: "Order PPE, patient prep, and collection steps like on the floor.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Procedure",
      content: {
        sequence: [
          "Perform hand hygiene and don gloves",
          "Verify patient identity with two identifiers",
          "Apply tourniquet and select vein",
          "Cleanse site per policy; allow to dry",
          "Perform venipuncture and collect tubes in order of draw",
          "Label tubes at bedside; dispose sharps safely",
        ],
      },
    },
    {
      id: "phleb-safety",
      title: "Phlebotomy Safety Judgment",
      description: "Handle wrong tube, hemolysis risk, and needlestick scenarios.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Safety",
      content: {
        script: [
          {
            prompt: "You drew a lavender tube but the order is for a blood culture first.",
            options: [
              { text: "Use the lavender anyway — one stick only", feedback: "Order of draw prevents cross-contamination; recollect if policy requires.", points: 0 },
              { text: "Follow order-of-draw policy; redraw or consult supervisor per protocol", feedback: "Correct pre-analytical quality control.", points: 3 },
              { text: "Shake all tubes hard to mix faster", feedback: "Gentle inversion prevents hemolysis.", points: 0 },
            ],
          },
          {
            prompt: "Needlestick after draw — patient is HIV status unknown.",
            options: [
              { text: "Wash and keep working — low risk", feedback: "Immediate exposure protocol is mandatory.", points: 0 },
              { text: "Wash wound, report immediately, begin occupational health protocol", feedback: "Standard needlestick response.", points: 3 },
              { text: "Ask patient to pay for your testing", feedback: "Employer occupational health handles work exposures.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "lpn-lvn": [
    {
      id: "lpn-wound-chart",
      title: "Wound Assessment Chart",
      description:
        "Document wound size, drainage, and dressing changes — LPN clinical documentation.",
      gameType: "patient-chart-workspace",
      duration: "6–10 min",
      domain: "Wound care",
      content: {
        patientChart: {
          title: "Wound Assessment — Room 8",
          brief: "Document surgical incision status for RN review.",
          patientName: "Robert Ellis, 72M",
          chiefComplaint: "Post-op day 2 — hip replacement",
          tasks: [
            { field: "size", label: "Wound size (cm)", expected: "4 × 1", normalRange: "Compare to baseline" },
            { field: "drainage", label: "Drainage type", expected: "serosanguinous", normalRange: "Document color and amount" },
            { field: "edges", label: "Wound edges", expected: "approximated", normalRange: "Report dehiscence" },
          ],
        },
      },
    },
    {
      id: "lpn-mar-intake",
      title: "MAR Documentation",
      description:
        "Document medication administration on the MAR — LPN scope of practice.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Medication administration",
      content: {
        intakeForm: {
          title: "MAR Entry — 0800 Med Pass",
          brief: "Document after administering scheduled medications.",
          scenario: "Metoprolol 25 mg PO given at 0802. Patient tolerated without complaint. BP pre-dose: 148/92.",
          fields: [
            { id: "drug", label: "Medication given", type: "text", expected: "Metoprolol 25 mg PO", hint: "Metoprolol 25 mg PO" },
            { id: "time", label: "Time administered", type: "text", expected: "0802", hint: "0802" },
            { id: "bp", label: "Pre-dose BP", type: "text", expected: "148/92", hint: "148/92" },
            { id: "response", label: "Adverse reaction?", type: "select", options: ["None", "Yes — document"], expected: "None" },
          ],
        },
      },
    },
    {
      id: "lpn-vitals-chart",
      title: "Licensed Nurse Vitals Chart",
      description: "Document assessment findings and spot abnormal values.",
      gameType: "patient-chart-workspace",
      duration: "8–12 min",
      domain: "Assessment",
      content: {
        patientChart: {
          title: "Afternoon Assessment — Room 8",
          brief: "LPN documents before notifying RN per facility protocol.",
          patientName: "Robert Ellis, 72M",
          chiefComplaint: "Post-op day 2 — hip replacement",
          tasks: [
            { field: "bp", label: "Blood pressure", expected: "148/92", normalRange: "< 130/80" },
            { field: "pulse", label: "Pulse (bpm)", expected: "88", normalRange: "60–100", unit: "bpm" },
            { field: "o2", label: "SpO₂ (%)", expected: "94", normalRange: "≥ 92 on RA", unit: "%" },
          ],
        },
      },
    },
    {
      id: "lpn-medication-math",
      title: "Medication Dosage Math",
      description: "Calculate safe doses — core LPN/LVN skill on exams and the job.",
      gameType: "math-scenario",
      duration: "8–12 min",
      domain: "Pharmacology math",
      content: {
        math: [
          {
            prompt: "Order: 500 mg PO. Stock: 250 mg tablets. How many tablets?",
            options: ["1", "2", "3", "0.5"],
            correctIndex: 1,
            explanation: "500 ÷ 250 = 2 tablets.",
          },
          {
            prompt: "IV bag 1,000 mL over 8 hours. Pump rate (mL/hr)?",
            options: ["63", "125", "250", "500"],
            correctIndex: 1,
            explanation: "1,000 ÷ 8 = 125 mL/hr.",
          },
          {
            prompt: "Patient weight 176 lb. Dose 5 mg/kg (use 80 kg rounded). Total mg?",
            options: ["200", "400", "880", "80"],
            correctIndex: 1,
            explanation: "80 kg × 5 mg/kg = 400 mg.",
          },
        ],
      },
    },
    {
      id: "lpn-scope-judgment",
      title: "Scope & Clinical Judgment",
      description: "Delegation, escalation, and LPN/LVN scope decisions.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Nursing practice",
      content: {
        script: [
          {
            prompt: "Patient SpO₂ 88% on room air, new confusion. You are the LPN.",
            options: [
              { text: "Document only — RN is busy", feedback: "Acute changes require immediate escalation.", points: 0 },
              { text: "Assess, apply oxygen per protocol, notify RN/MD promptly", feedback: "Timely escalation is within LPN scope.", points: 3 },
              { text: "Discharge patient to reduce workload", feedback: "Unsafe and outside judgment.", points: 0 },
            ],
          },
          {
            prompt: "UAP asks you to sign off on an assessment you did not perform.",
            options: [
              { text: "Sign — team trust matters", feedback: "Never document care you did not provide or verify.", points: 0 },
              { text: "Decline; perform or witness required assessment per policy", feedback: "Accountability protects patients and license.", points: 3 },
              { text: "Tell UAP to forge RN signature", feedback: "Fraud and patient harm risk.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  "registered-nurse": [
    {
      id: "rn-mar-intake",
      title: "Medication Administration Check",
      description:
        "Verify the five rights on the MAR before passing meds — NCLEX-critical safety workflow.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Medication safety",
      content: {
        intakeForm: {
          title: "MAR Pre-Check — Room 214",
          brief: "Complete safety verification before administering scheduled dose.",
          scenario: "Metoprolol 25 mg PO due 0900 — patient Aisha Khan, 58F.",
          fields: [
            { id: "patient", label: "Right patient verified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "drug", label: "Right drug & dose confirmed?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "time", label: "Right time (within window)?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "allergy", label: "Allergy check completed?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "rn-assessment-chart",
      title: "RN Admission Assessment",
      description: "Complete priority assessment data on a new admission.",
      gameType: "patient-chart-workspace",
      duration: "8–12 min",
      domain: "NCLEX clinical",
      content: {
        patientChart: {
          title: "ED to Med-Surg Handoff",
          brief: "Document baseline before first med pass.",
          patientName: "Aisha Khan, 58F",
          chiefComplaint: "Chest pain — rule out ACS",
          tasks: [
            { field: "bp", label: "Blood pressure", expected: "162/96", normalRange: "Monitor trend" },
            { field: "pain", label: "Pain (0–10)", expected: "7", normalRange: "Reassess after intervention" },
            { field: "o2", label: "SpO₂ on 2L NC (%)", expected: "96", normalRange: "≥ 92%", unit: "%" },
          ],
        },
      },
    },
    {
      id: "rn-post-op-chart",
      title: "Post-Op Assessment Chart",
      description:
        "Document incision, pain, and neurovascular status after orthopedic surgery.",
      gameType: "patient-chart-workspace",
      duration: "8–12 min",
      domain: "Surgical nursing",
      content: {
        patientChart: {
          title: "Post-Op Hour 4 — Hip Repair",
          brief: "Complete focused assessment before next pain med.",
          patientName: "Robert Ellis, 72M",
          chiefComplaint: "Post-op day 0 — left hip arthroplasty",
          tasks: [
            { field: "pain", label: "Pain (0–10)", expected: "5", normalRange: "Reassess after intervention" },
            { field: "pulse", label: "Pulse (bpm)", expected: "92", normalRange: "60–100", unit: "bpm" },
            { field: "o2", label: "SpO₂ on RA (%)", expected: "93", normalRange: "≥ 92%", unit: "%" },
          ],
        },
      },
    },
    {
      id: "rn-dosage-math",
      title: "RN Dosage & IV Math",
      description: "NCLEX-style calculations for safe medication administration.",
      gameType: "math-scenario",
      duration: "10–14 min",
      domain: "Dosage calc",
      content: {
        math: [
          {
            prompt: "Heparin 25,000 units in 250 mL D5W. Order 1,200 units/hr. Pump rate (mL/hr)?",
            options: ["6", "12", "24", "120"],
            correctIndex: 1,
            explanation: "25,000 U / 250 mL = 100 U/mL. 1,200 ÷ 100 = 12 mL/hr.",
          },
          {
            prompt: "Which patient do you see FIRST?",
            options: [
              "Post-op day 1 reporting 4/10 incision pain",
              "New SOB with SpO₂ 89% after ambulation",
              "Diabetic requesting snack before lunch tray",
              "Discharge teaching scheduled in 2 hours",
            ],
            correctIndex: 1,
            explanation: "Airway/breathing compromise takes priority (ABCs).",
          },
          {
            prompt: "Pediatric weight 44 lb. Safe dose 10 mg/kg/day divided BID (use 20 kg). Per dose?",
            options: ["50 mg", "100 mg", "200 mg", "20 mg"],
            correctIndex: 1,
            explanation: "20 kg × 10 = 200 mg/day ÷ 2 = 100 mg per dose.",
          },
        ],
      },
    },
    {
      id: "rn-priority-judgment",
      title: "NCLEX Priority & Safety",
      description: "Prioritize care and respond to complications like the licensing exam.",
      gameType: "script-choice",
      duration: "10–14 min",
      domain: "Clinical judgment",
      content: {
        script: [
          {
            prompt: "Patient receiving IV vancomycin reports flushing and itch. First action?",
            options: [
              { text: "Stop infusion, assess airway/breathing, notify provider per protocol", feedback: "Possible infusion reaction — stop and assess.", points: 3 },
              { text: "Slow rate and document later", feedback: "Symptoms may escalate; assess and notify now.", points: 1 },
              { text: "Continue — vancomycin always causes redness", feedback: "Distinguish expected redness from reaction.", points: 0 },
            ],
          },
          {
            prompt: "Provider orders discharge; patient still cannot safely ambulate after hip repair.",
            options: [
              { text: "Discharge — family will help", feedback: "Unsafe discharge risks readmission and harm.", points: 0 },
              { text: "Communicate safety concern; arrange PT/home services per protocol", feedback: "Advocate for safe transition.", points: 3 },
              { text: "Refuse to document discharge", feedback: "Use chain of command and care coordination.", points: 1 },
            ],
          },
        ],
      },
    },
    {
      id: "rn-ai-documentation",
      title: "AI Scribe & EHR Judgment",
      description: "Verify AI-drafted nursing notes and avoid documentation errors.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "AI + nursing",
      content: {
        script: [
          {
            prompt: "AI scribe charted 'patient denied pain' but you just medicated for 8/10 pain.",
            options: [
              { text: "Sign the note — AI saves time", feedback: "You are accountable for accurate documentation.", points: 0 },
              { text: "Edit to match your assessment and interventions before signing", feedback: "Verify every AI draft against what you did.", points: 3 },
              { text: "Delete all nursing notes for the shift", feedback: "Continuity of care requires accurate records.", points: 0 },
            ],
          },
          {
            prompt: "Nurse pastes patient SSN and diagnosis into a public AI to 'write care plan faster.'",
            options: [
              { text: "Acceptable if they delete the chat", feedback: "PHI in external AI violates HIPAA.", points: 0 },
              { text: "Stop; use approved EHR tools and de-identified prompts only", feedback: "Same governance as any clinical data.", points: 3 },
              { text: "Only wrong for psychiatric patients", feedback: "HIPAA applies to all PHI.", points: 1 },
            ],
          },
        ],
      },
    },
  ],

  "dental-assistant": [
    {
      id: "dental-treatment-log",
      title: "Treatment Notes & Charting",
      description:
        "Document completed procedures and materials used in the patient chart — chairside DA task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Clinical documentation",
      content: {
        intakeForm: {
          title: "Post-Procedure Chart — Prophy & Exam",
          brief: "Complete before patient leaves the operatory.",
          scenario: "Adult prophy completed. Dentist found Class II on #19 — schedule restoration.",
          fields: [
            { id: "procedure", label: "Procedures completed", type: "text", expected: "prophylaxis, periodic exam", hint: "prophylaxis, periodic exam" },
            { id: "finding", label: "Dentist finding", type: "text", expected: "Class II caries #19", hint: "Class II caries #19" },
            { id: "fluoride", label: "Fluoride applied?", type: "select", options: ["Yes", "No — declined"], expected: "Yes" },
            { id: "next", label: "Follow-up scheduled", type: "select", options: ["Yes — restoration #19", "No", "Patient will call"], expected: "Yes — restoration #19" },
          ],
        },
      },
    },
    {
      id: "dental-tray-setup",
      title: "Operatory Tray Setup",
      description:
        "Prepare the instrument tray for a composite restoration — chairside efficiency skill.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Clinical setup",
      content: {
        intakeForm: {
          title: "Tray Setup — Class II Composite",
          brief: "Verify instruments and materials before seating the patient.",
          scenario: "Composite restoration on #19 — local anesthesia, rubber dam, and curing light needed.",
          fields: [
            { id: "anesthesia", label: "Anesthesia syringe set up?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "dam", label: "Rubber dam kit ready?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "material", label: "Composite shade selected?", type: "select", options: ["Yes — matched to chart", "No"], expected: "Yes — matched to chart" },
            { id: "light", label: "Curing light tested?", type: "select", options: ["Yes — working", "No — find replacement"], expected: "Yes — working" },
          ],
        },
      },
    },
    {
      id: "dental-intake",
      title: "Dental Patient Intake",
      description: "Medical history, allergies, and chief complaint before treatment.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Front office",
      content: {
        intakeForm: {
          title: "New Patient Intake",
          brief: "Flag allergy before the dentist starts.",
          scenario: "Adult prophy and exam — reports latex sensitivity.",
          fields: [
            { id: "name", label: "Patient name", type: "text", expected: "Lee, Jordan", hint: "Lee, Jordan" },
            { id: "allergy", label: "Documented allergy", type: "text", expected: "latex", hint: "latex" },
            { id: "cc", label: "Chief complaint", type: "text", expected: "routine cleaning", hint: "routine cleaning" },
            { id: "consent", label: "HIPAA / treatment consent obtained?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "dental-infection",
      title: "Infection Control Choices",
      description: "Sterilization, PPE, and operatory turnover like state board expects.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "OSHA / CDC",
      content: {
        script: [
          {
            prompt: "Instrument cassette finished ultrasonic cycle. Next step before storage?",
            options: [
              { text: "Air dry in open tray indefinitely", feedback: "Sterilization or sealed sterile storage per protocol.", points: 0 },
              { text: "Package and run autoclave cycle; verify indicators", feedback: "Correct sterilization workflow.", points: 3 },
              { text: "Wipe with alcohol and reuse on next patient", feedback: "Critical instruments require sterilization.", points: 0 },
            ],
          },
          {
            prompt: "Patient coughs during procedure — aerosol-generating step.",
            options: [
              { text: "Continue without PPE change", feedback: "Use appropriate PPE and room protocol for AGPs.", points: 0 },
              { text: "Pause, don required PPE, follow office airborne/aerosol policy", feedback: "Protect staff and next patients.", points: 3 },
              { text: "Cancel all future appointments", feedback: "Follow exposure policy, not blanket cancellation.", points: 1 },
            ],
          },
        ],
      },
    },
    {
      id: "dental-radiograph-seq",
      title: "Radiograph Safety Sequence",
      description: "Order steps for safe dental X-ray capture.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Radiography",
      content: {
        sequence: [
          "Confirm pregnancy/status and thyroid collar per policy",
          "Set exposure factors for sensor/film type",
          "Position sensor and align cone",
          "Instruct patient to remain still; step behind barrier",
          "Expose and verify image quality before dismissal",
        ],
      },
    },
  ],

  cybersecurity: [
    {
      id: "cyber-incident-report",
      title: "Security Incident Report",
      description:
        "Document a confirmed phishing incident with timeline, scope, and containment actions — SOC analyst deliverable.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Incident response",
      content: {
        intakeForm: {
          title: "IR Report — Phishing Compromise",
          brief: "Complete before the 24-hour reporting window closes.",
          scenario: "Marketing user clicked phishing link, entered credentials. Password reset done. No lateral movement detected.",
          fields: [
            { id: "category", label: "Incident category", type: "select", options: ["Phishing — credential harvest", "Ransomware", "Insider threat"], expected: "Phishing — credential harvest" },
            { id: "scope", label: "Accounts compromised", type: "text", expected: "1", hint: "1" },
            { id: "containment", label: "Containment action taken", type: "text", expected: "password reset and session revoke", hint: "password reset and session revoke" },
            { id: "lateral", label: "Lateral movement detected?", type: "select", options: ["No", "Yes — escalate"], expected: "No" },
          ],
        },
      },
    },
    {
      id: "cyber-vuln-intake",
      title: "Vulnerability Triage Log",
      description:
        "Prioritize CVEs from a scan report by severity, exploitability, and asset value — Security+ skill.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Vulnerability management",
      content: {
        intakeForm: {
          title: "Vuln Triage — Monthly Scan",
          brief: "Document priority and remediation owner for three findings.",
          scenario: "Scan found: Critical RCE on public web server, Medium XSS on internal wiki, Low info disclosure on dev box.",
          fields: [
            { id: "crit_priority", label: "Critical RCE — remediation priority", type: "select", options: ["P1 — patch within 24 hrs", "P3 — next quarter", "Accept risk"], expected: "P1 — patch within 24 hrs" },
            { id: "crit_owner", label: "Critical RCE — owner team", type: "text", expected: "web ops", hint: "web ops" },
            { id: "med_priority", label: "Medium XSS — priority", type: "select", options: ["P1", "P2 — patch within 30 days", "Accept"], expected: "P2 — patch within 30 days" },
            { id: "low_action", label: "Low info disclosure — action", type: "select", options: ["Patch", "Accept risk with documentation", "Ignore"], expected: "Accept risk with documentation" },
          ],
        },
      },
    },
    {
      id: "cyber-threat-match",
      title: "Threats & Controls Match",
      description: "Match Security+ concepts — malware, MFA, encryption.",
      gameType: "match-pairs",
      duration: "5–8 min",
      domain: "Security+ foundations",
      content: {
        pairs: [
          { term: "Phishing", definition: "Social engineering via deceptive email/links" },
          { term: "MFA", definition: "Requires two or more verification factors" },
          { term: "Ransomware", definition: "Encrypts data; demands payment for keys" },
          { term: "Least privilege", definition: "Minimum access needed for the role" },
        ],
      },
    },
    {
      id: "cyber-incident",
      title: "Security Incident Response",
      description: "Choose professional responses to active threats.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Incident response",
      content: {
        script: [
          {
            prompt: "User reports ransomware banner on finance PC. First containment step?",
            options: [
              { text: "Pay the ransom immediately", feedback: "Isolate and follow IR playbook before any payment discussion.", points: 0 },
              { text: "Disconnect host from network; notify SOC/IR team", feedback: "Contain spread first.", points: 3 },
              { text: "Reboot repeatedly until banner disappears", feedback: "May worsen encryption and destroy forensics.", points: 0 },
            ],
          },
          {
            prompt: "CEO email asks for urgent wire transfer — headers show external relay.",
            options: [
              { text: "Process — CEO is always urgent", feedback: "Classic BEC; verify out-of-band.", points: 0 },
              { text: "Verify via known callback; report phishing to security", feedback: "Security+ social engineering defense.", points: 3 },
              { text: "Reply with banking details to confirm", feedback: "Never engage attacker thread.", points: 0 },
            ],
          },
        ],
      },
    },
    {
      id: "cyber-log-triage",
      title: "Log Triage Terminal",
      description: "Use CLI-style checks to investigate suspicious activity.",
      gameType: "terminal-workspace",
      duration: "8–12 min",
      domain: "SOC basics",
      content: {
        terminal: {
          title: "ALERT-4421 — Failed Logins",
          brief: "Multiple failed logins from one IP on a server.",
          hostname: "SEC-ANALYST-01",
          prompt: "analyst@soc:~$ ",
          initialOutput: "Ticket: 847 failed SSH attempts in 10 minutes from 203.0.113.44",
          steps: [
            { instruction: "Check recent authentication log entries.", expectedCommand: "last", hint: "last" },
            { instruction: "Review failed login attempts in auth log.", expectedCommand: "grep Failed /var/log/auth.log", hint: "grep Failed /var/log/auth.log" },
            { instruction: "Block the attacking IP at the host firewall.", expectedCommand: "iptables -A INPUT -s 203.0.113.44 -j DROP", hint: "iptables -A INPUT -s 203.0.113.44 -j DROP" },
          ],
        },
      },
    },
    {
      id: "cyber-ai-threats",
      title: "AI-Enhanced Threat Judgment",
      description: "Deepfakes, AI phishing, and vishing — modern Security+ context.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "AI + security",
      content: {
        script: [
          {
            prompt: "Video call 'CFO' authorizes wire — voice matches but callback number is wrong.",
            options: [
              { text: "Wire funds — video verified identity", feedback: "Deepfake/voice clone attacks exist; verify out-of-band.", points: 0 },
              { text: "Hold transfer; verify via known corporate directory callback", feedback: "Multi-factor verification for financial requests.", points: 3 },
              { text: "Ask them to send another video", feedback: "Attackers can regenerate; use non-video channel.", points: 1 },
            ],
          },
          {
            prompt: "AI-written phishing email passes SPF/DKIM and has perfect grammar.",
            options: [
              { text: "Safe because filters didn't flag it", feedback: "AI improves phishing; user reporting still critical.", points: 0 },
              { text: "Train users to verify links/senders; report suspicious mail anyway", feedback: "Defense in depth beyond filters.", points: 3 },
              { text: "Disable all external email", feedback: "Business still needs mail; layered controls instead.", points: 1 },
            ],
          },
        ],
      },
    },
  ],

  "cloud-computing": [
    {
      id: "cloud-iam-terminal",
      title: "Cloud IAM & CLI Checks",
      description: "Use a cloud-style CLI to verify identity, list users, and inspect bucket policy flags.",
      gameType: "terminal-workspace",
      duration: "8–12 min",
      domain: "Cloud security",
      content: {
        terminal: {
          title: "LAB — AWS Account Hygiene",
          brief: "Before closing a security audit, verify IAM and S3 public-access settings from the CLI.",
          hostname: "cloud-audit-01",
          prompt: "aws> ",
          initialOutput:
            "Audit ticket SEC-441: possible public S3 bucket and over-privileged dev role. Start with identity.",
          steps: [
            {
              instruction: "Show the caller identity for the current credentials.",
              expectedCommand: "aws sts get-caller-identity",
              hint: "aws sts get-caller-identity",
            },
            {
              instruction: "List IAM users in the account.",
              expectedCommand: "aws iam list-users",
              hint: "aws iam list-users",
            },
            {
              instruction: "Check S3 public access block settings for the account.",
              expectedCommand: "aws s3control get-public-access-block",
              hint: "aws s3control get-public-access-block",
            },
            {
              instruction: "List S3 buckets to identify scope.",
              expectedCommand: "aws s3 ls",
              hint: "aws s3 ls",
            },
          ],
        },
      },
    },
    {
      id: "cloud-incident-intake",
      title: "Cloud Incident Intake Form",
      description: "Log a cloud security incident — blast radius, containment, and notification fields.",
      gameType: "intake-form-workspace",
      duration: "8–12 min",
      domain: "Cloud operations",
      content: {
        intakeForm: {
          title: "Cloud Security Incident — SEC-441",
          brief: "Complete intake when customer PII bucket is world-readable.",
          scenario: "GuardDuty alert: S3 bucket prod-analytics-public with 12k objects readable.",
          fields: [
            { id: "severity", label: "Severity", type: "select", options: ["P1-Critical", "P2-High", "P3-Low"], expected: "P1-Critical" },
            { id: "contain", label: "Containment action taken", type: "select", options: ["Block public access enabled", "No action yet", "Deleted account"], expected: "Block public access enabled" },
            { id: "region", label: "Primary region affected", type: "text", expected: "us-east-1", hint: "us-east-1" },
            { id: "notify", label: "Security/compliance notified?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "cloud-shared-responsibility",
      title: "Cloud Concepts & Shared Responsibility",
      description: "AWS/Azure basics — who secures what in the cloud.",
      gameType: "math-scenario",
      duration: "6–10 min",
      domain: "Cloud foundations",
      content: {
        math: [
          {
            prompt: "Customer configures S3 bucket public by mistake. Under shared responsibility, who fixes the config?",
            options: ["AWS only", "Customer — they own bucket policy/IAM", "ISP", "No one — cloud is automatic"],
            correctIndex: 1,
            explanation: "Customer responsibility for data and access configuration (IaaS/PaaS).",
          },
          {
            prompt: "Best first step for least-privilege IAM?",
            options: ["Give AdministratorAccess to all devs", "Start with job-function policies; remove unused permissions", "Share root account keys", "Disable MFA for automation"],
            correctIndex: 1,
            explanation: "Least privilege is core CLF-C02 / AZ-900 concept.",
          },
          {
            prompt: "Multi-AZ deployment primarily improves…",
            options: ["Color of dashboard", "Availability during AZ failure", "Free tier usage", "Email deliverability"],
            correctIndex: 1,
            explanation: "Availability and fault tolerance across zones.",
          },
        ],
      },
    },
    {
      id: "cloud-iam-incidents",
      title: "IAM & Data Exposure Choices",
      description: "Respond to public buckets, leaked keys, and misconfigured roles.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "Cloud security",
      content: {
        script: [
          {
            prompt: "Git commit contains AWS access key in plain text.",
            options: [
              { text: "Delete commit from laptop only", feedback: "Rotate keys immediately; assume compromise.", points: 0 },
              { text: "Revoke key, rotate credentials, scan repos, enable secrets scanning", feedback: "Standard cloud credential incident response.", points: 3 },
              { text: "Change key name but keep same secret", feedback: "Rotation means new credentials.", points: 0 },
            ],
          },
          {
            prompt: "S3 bucket alert: customer PII objects are world-readable.",
            options: [
              { text: "Block public access, audit logs, notify security/compliance", feedback: "Contain, investigate, report per policy.", points: 3 },
              { text: "Wait for next sprint", feedback: "Data exposure is urgent.", points: 0 },
              { text: "Delete the entire AWS account", feedback: "Overreaction; remediate config and assess impact.", points: 1 },
            ],
          },
        ],
      },
    },
    {
      id: "cloud-incident-seq",
      title: "Cloud Incident Runbook Order",
      description: "Sequence a professional cloud outage / security response.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Operations",
      content: {
        sequence: [
          "Confirm alert and assign incident commander",
          "Identify blast radius — region, service, accounts affected",
          "Contain — revoke keys, block access, isolate resources",
          "Communicate status to stakeholders per runbook",
          "Restore from backup or failover; verify health checks",
          "Post-incident review and preventive controls",
        ],
      },
    },
    {
      id: "cloud-cost-governance",
      title: "Cost & FinOps Judgment",
      description: "Orphaned resources, budget alerts, and responsible cloud spend.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "FinOps",
      content: {
        script: [
          {
            prompt: "Dev left 50 unused Elastic IPs and oversized instances over weekend.",
            options: [
              { text: "Ignore — cloud is cheap", feedback: "FinOps and tagging policies prevent waste.", points: 0 },
              { text: "Release unused resources; enforce budgets/tags and alert thresholds", feedback: "CLF/AZ-900 cost optimization topic.", points: 3 },
              { text: "Delete production database to save money", feedback: "Right-size and automate shutdown of non-prod.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  plumber: [
    {
      id: "plumb-work-order",
      title: "Service Call Work Order",
      description:
        "Document customer complaint, findings, and parts used on a residential service call.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Field documentation",
      content: {
        intakeForm: {
          title: "Work Order — Kitchen Leak",
          brief: "Complete before leaving the job site.",
          scenario: "Supply line under kitchen sink leaking at compression fitting. Replaced fitting and supply hose.",
          fields: [
            { id: "complaint", label: "Customer complaint", type: "text", expected: "leak under kitchen sink", hint: "leak under kitchen sink" },
            { id: "finding", label: "Root cause", type: "text", expected: "failed compression fitting", hint: "failed compression fitting" },
            { id: "parts", label: "Parts replaced", type: "text", expected: "compression fitting + supply hose", hint: "compression fitting + supply hose" },
            { id: "test", label: "Pressure test passed?", type: "select", options: ["Yes", "No — still leaking"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "plumb-permit-intake",
      title: "Permit Application Form",
      description:
        "Complete a plumbing permit application for new rough-in work — journeyman/master requirement.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Code compliance",
      content: {
        intakeForm: {
          title: "Plumbing Permit — New Bathroom",
          brief: "File with the building department before rough-in.",
          scenario: "Adding half-bath to existing residential. New 3\" drain, 1/2\" supply, and vent tie-in.",
          fields: [
            { id: "scope", label: "Scope of work", type: "text", expected: "new half-bath rough-in", hint: "new half-bath rough-in" },
            { id: "fixtures", label: "Number of fixtures", type: "text", expected: "2", hint: "2 (toilet + lavatory)" },
            { id: "drain", label: "Drain size", type: "select", options: ["2 inch", "3 inch", "4 inch"], expected: "3 inch" },
            { id: "license", label: "Contractor license # on file?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "plumb-pipe-math",
      title: "Pipe & Drain Math",
      description: "Calculate run, slope, and fittings on a service call.",
      gameType: "jobsite-workspace",
      duration: "8–12 min",
      domain: "Field math",
      content: {
        jobsite: {
          title: "Drain Line Layout",
          brief: "Plan a 3-inch drain with proper slope.",
          tasks: [
            { prompt: "Horizontal run 24 ft. Minimum drop at 1/4 in per ft (inches)?", answer: "6", unit: "in", explanation: "24 × 0.25 = 6 inches total drop." },
            { prompt: "Pipe length needed: 24 ft run + 2 ft fitting allowance?", answer: "26", unit: "ft", explanation: "Add fitting allowance to ordered length." },
          ],
        },
      },
    },
    {
      id: "plumb-repair-seq",
      title: "Leak Repair Sequence",
      description: "Order shutdown, repair, and pressure test steps.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Service call",
      content: {
        sequence: [
          "Locate shutoff and verify water is off",
          "Relieve pressure and drain affected section",
          "Cut out damaged section; deburr and dry fit",
          "Solvent-weld or thread per code and material",
          "Pressure test or fill and check for leaks",
          "Restore service and document work for customer",
        ],
      },
    },
    {
      id: "plumb-safety",
      title: "Plumber Safety Judgment",
      description: "Gas odor, confined space, and permit scenarios.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Safety / code",
      content: {
        script: [
          {
            prompt: "Strong gas odor at water heater — customer wants you to light pilot now.",
            options: [
              { text: "Light pilot immediately — they need hot water", feedback: "Gas leak protocol first; evacuate and call utility if needed.", points: 0 },
              { text: "Do not ignite; ventilate, shut gas, leak-check per code", feedback: "Correct safety sequence.", points: 3 },
              { text: "Use candle to find leak", feedback: "Never use open flame to detect gas.", points: 0 },
            ],
          },
          {
            prompt: "Owner wants you to skip permit on main line reroute to save time.",
            options: [
              { text: "Skip — small job", feedback: "Code and permits protect property and license.", points: 0 },
              { text: "Explain permit/inspection requirements; proceed legally", feedback: "Professional standard.", points: 3 },
              { text: "Do work at night so inspector won't see", feedback: "Violates code and ethics.", points: 0 },
            ],
          },
        ],
      },
    },
  ],

  welder: [
    {
      id: "weld-wps-intake",
      title: "WPS Reading & Setup",
      description:
        "Read a welding procedure specification and set machine parameters — fabrication shop daily task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Quality / certification",
      content: {
        intakeForm: {
          title: "WPS Setup — Structural MIG",
          brief: "Document settings from the WPS before striking the first arc.",
          scenario: "WPS calls for GMAW, ER70S-6 wire, 75/25 gas, 22V, 280 ipm wire feed, 3/8\" mild steel.",
          fields: [
            { id: "process", label: "Welding process", type: "select", options: ["GMAW (MIG)", "SMAW (Stick)", "GTAW (TIG)"], expected: "GMAW (MIG)" },
            { id: "wire", label: "Filler metal", type: "text", expected: "ER70S-6", hint: "ER70S-6" },
            { id: "voltage", label: "Voltage set (V)", type: "text", expected: "22", hint: "22" },
            { id: "gas", label: "Shielding gas", type: "select", options: ["75/25 Ar/CO₂", "100% CO₂", "Pure Argon"], expected: "75/25 Ar/CO₂" },
          ],
        },
      },
    },
    {
      id: "weld-inspection-form",
      title: "Visual Inspection Report",
      description:
        "Complete a VT inspection form after finishing a weld — CWI/QC skill.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Quality control",
      content: {
        intakeForm: {
          title: "VT Report — Joint #A-14",
          brief: "Document visual inspection findings before NDE.",
          scenario: "Butt joint, full penetration. Bead appearance uniform. Minor spatter on base metal. No cracks visible.",
          fields: [
            { id: "profile", label: "Weld profile acceptable?", type: "select", options: ["Yes", "No — excess convexity"], expected: "Yes" },
            { id: "cracks", label: "Surface cracks visible?", type: "select", options: ["None", "Yes — reject"], expected: "None" },
            { id: "spatter", label: "Spatter removal needed?", type: "select", options: ["Yes — minor cleanup", "No", "Excessive — grind"], expected: "Yes — minor cleanup" },
            { id: "accept", label: "VT result", type: "select", options: ["Accept", "Reject — repair needed"], expected: "Accept" },
          ],
        },
      },
    },
    {
      id: "weld-setup-seq",
      title: "Welding Setup & PPE",
      description: "Order pre-weld safety and equipment checks.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Safety",
      content: {
        sequence: [
          "Review work order and material spec (MIG/TIG/stick)",
          "Inspect PPE — helmet, gloves, FR clothing, ventilation",
          "Ground workpiece; check gas/lead connections",
          "Set amperage/voltage per WPS or chart",
          "Tack and weld per sequence; interpass inspection",
          "Mark completion and clean slag/spatter",
        ],
      },
    },
    {
      id: "weld-material-math",
      title: "Material & Bead Math",
      description: "Estimate rod/wire use and cut lengths on the job.",
      gameType: "jobsite-workspace",
      duration: "6–10 min",
      domain: "Shop math",
      content: {
        jobsite: {
          title: "Fabrication Bench",
          brief: "Plan material for a simple joint.",
          tasks: [
            { prompt: "Plate sections 18 in + 18 in + 4 in overlap waste. Total in?", answer: "40", unit: "in", explanation: "18+18+4 = 40 in stock used." },
            { prompt: "Cut 4 pieces at 14 in each from 72 in stock. Waste (in)?", answer: "16", unit: "in", explanation: "72 − 4×14 = 16 in waste." },
          ],
        },
      },
    },
    {
      id: "weld-quality",
      title: "Weld Quality Judgment",
      description: "Defects, fumes, and confined-space decisions.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Quality",
      content: {
        script: [
          {
            prompt: "Visual shows porosity in critical structural bead. Foreman says 'grind and ship.'",
            options: [
              { text: "Ship — paint hides it", feedback: "Critical welds need repair per WPS/inspector.", points: 0 },
              { text: "Stop; grind out, repair per WPS, re-inspect", feedback: "Correct quality control.", points: 3 },
              { text: "Fill with epoxy instead of weld", feedback: "Not acceptable structural repair.", points: 0 },
            ],
          },
          {
            prompt: "Confined space tank weld — ventilation fan failed.",
            options: [
              { text: "Finish quickly without air", feedback: "Fume/asphyxiation risk — stop until ventilated.", points: 0 },
              { text: "Stop work; restore ventilation and gas monitoring per OSHA", feedback: "Confined space protocol.", points: 3 },
              { text: "Wear dust mask only", feedback: "Welding fumes need proper ventilation/respiratory protection.", points: 0 },
            ],
          },
        ],
      },
    },
  ],
};
