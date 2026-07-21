import type { CareerSkillSlug } from "./career-skills-catalog";

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

export type MatchPair = { term: string; definition: string };

export type CodeChallenge = {
  title: string;
  code: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TypingPhrase = { text: string; context: string };

export type CareerSkillContent = {
  script?: ScriptScenario[];
  math?: MathScenario[];
  pairs?: MatchPair[];
  sequence?: string[];
  code?: CodeChallenge[];
  pcBuild?: string[];
  typing?: TypingPhrase[];
};

export const CAREER_SKILL_CONTENT: Record<CareerSkillSlug, CareerSkillContent> = {
  "family-services": {
    script: [
      {
        prompt: "A parent raises their voice in the lobby saying the wait is unfair. You are at the front desk.",
        options: [
          { text: "Acknowledge frustration, explain the process, and offer a clear wait time", feedback: "De-escalation + transparency builds trust.", points: 3 },
          { text: "Tell them to calm down or leave", feedback: "Dismissive language escalates conflict.", points: 0 },
          { text: "Ignore them until a supervisor arrives", feedback: "Clients need immediate acknowledgment.", points: 1 },
        ],
      },
      {
        prompt: "A client asks you to keep information from their partner. What is your first step?",
        options: [
          { text: "Review confidentiality policy and explain what you can and cannot share", feedback: "Policy-first protects everyone.", points: 3 },
          { text: "Promise full secrecy without checking", feedback: "Never promise before you know the rules.", points: 0 },
          { text: "Share everything with the partner to avoid conflict", feedback: "Violates trust and likely policy.", points: 0 },
        ],
      },
      {
        prompt: "You notice signs a child may be unsafe at home during intake.",
        options: [
          { text: "Follow mandatory reporting procedures immediately", feedback: "Safety overrides everything — document and report.", points: 3 },
          { text: "Wait for more proof over several visits", feedback: "Mandatory reporting has legal timelines.", points: 0 },
          { text: "Ask the parent directly if they abuse the child", feedback: "Can endanger the child and compromise investigation.", points: 0 },
        ],
      },
    ],
  },
  "social-caseworker": {
    script: [
      {
        prompt: "A client misses three appointments and stops returning calls.",
        options: [
          { text: "Attempt outreach through approved channels and document barriers", feedback: "Engagement requires understanding obstacles.", points: 3 },
          { text: "Close the case immediately", feedback: "Premature closure can abandon someone in need.", points: 0 },
          { text: "Visit their home unannounced at midnight", feedback: "Safety and policy limit how outreach happens.", points: 0 },
        ],
      },
      {
        prompt: "A client offers you a gift card to 'speed things up.'",
        options: [
          { text: "Decline politely and report per agency ethics policy", feedback: "Boundaries protect professional integrity.", points: 3 },
          { text: "Accept a small gift — it's harmless", feedback: "Even small gifts create conflicts of interest.", points: 0 },
          { text: "Accept but don't tell your supervisor", feedback: "Undisclosed gifts violate ethics codes.", points: 0 },
        ],
      },
      {
        prompt: "Two family members give conflicting stories about housing needs.",
        options: [
          { text: "Gather facts separately, document both views, verify with records", feedback: "Neutral fact-finding is core casework.", points: 3 },
          { text: "Side with whoever seems more sympathetic", feedback: "Decisions must be evidence-based.", points: 0 },
          { text: "Tell them to work it out without your involvement", feedback: "Facilitation is part of the role.", points: 1 },
        ],
      },
    ],
  },
  cna: {
    pairs: [
      { term: "Normal adult pulse", definition: "60–100 beats per minute" },
      { term: "Normal respiration", definition: "12–20 breaths per minute" },
      { term: "Normal body temperature", definition: "About 98.6°F (37°C)" },
      { term: "BP category: normal", definition: "Below 120/80 mmHg" },
      { term: "Hand hygiene", definition: "Before and after every patient contact" },
      { term: "Fall prevention", definition: "Bed low, call light within reach, non-skid footwear" },
    ],
  },
  "medical-assistant": {
    sequence: [
      "Knock, identify yourself, and confirm patient name",
      "Wash hands and don gloves if needed",
      "Review reason for visit and update chief complaint",
      "Measure vitals: BP, pulse, temperature, respirations",
      "Sanitize equipment and document in the chart",
      "Notify provider that the room is ready",
    ],
  },
  "pharmacy-tech": {
    math: [
      {
        prompt: "Rx: 500 mg tablets, sig: 1 tab PO BID × 10 days. How many tablets to dispense?",
        options: ["10", "20", "30", "40"],
        correctIndex: 1,
        explanation: "BID = twice daily → 2 × 10 days = 20 tablets.",
      },
      {
        prompt: "Order: 250 mL bag at 125 mL/hr. How long until the bag is empty?",
        options: ["1 hour", "2 hours", "3 hours", "4 hours"],
        correctIndex: 1,
        explanation: "250 ÷ 125 = 2 hours.",
      },
      {
        prompt: "Stock: 200 mg/mL. Need 400 mg. How many mL?",
        options: ["1 mL", "2 mL", "4 mL", "8 mL"],
        correctIndex: 1,
        explanation: "400 mg ÷ 200 mg/mL = 2 mL.",
      },
      {
        prompt: "Patient needs 0.5 g. Tablets are 250 mg each. How many tablets?",
        options: ["1", "2", "3", "4"],
        correctIndex: 1,
        explanation: "0.5 g = 500 mg. 500 ÷ 250 = 2 tablets.",
      },
    ],
  },
  "medical-billing-coding": {},
  "phlebotomy-tech": {},
  "dental-assistant": {},
  "lpn-lvn": {},
  "registered-nurse": {},
  "surgical-tech": {},
  "vet-tech": {},
  "patient-care-tech": {},
  "paralegal": {},
  "human-resources": {},
  "insurance-agent": {},
  "auto-mechanic": {},
  "teaching-assistant": {},
  "childcare-cda": {},
  "police-officer": {
    script: [
      {
        prompt: "You stop a driver for a broken taillight. They seem nervous but cooperative.",
        options: [
          { text: "Explain the stop clearly, request license/registration, stay professional", feedback: "Transparency reduces tension on routine stops.", points: 3 },
          { text: "Order them out immediately without explanation", feedback: "Unnecessary escalation on a minor violation.", points: 0 },
          { text: "Search the vehicle without articulable reason", feedback: "Fourth Amendment requires lawful basis.", points: 0 },
        ],
      },
      {
        prompt: "Backup is 10 minutes away and a crowd is forming around an incident.",
        options: [
          { text: "Create perimeter, communicate with dispatch, de-escalate verbally", feedback: "Scene control while awaiting support.", points: 3 },
          { text: "Use force to disperse everyone immediately", feedback: "Minimum necessary force is the standard.", points: 0 },
          { text: "Leave the scene to avoid conflict", feedback: "Abandoning an active scene is not an option.", points: 0 },
        ],
      },
      {
        prompt: "A colleague makes a biased comment about a suspect's neighborhood.",
        options: [
          { text: "Address it professionally and report if it reflects conduct", feedback: "Integrity includes calling out bias.", points: 3 },
          { text: "Laugh along to fit in", feedback: "Silence enables misconduct.", points: 0 },
          { text: "Post about it on social media while on duty", feedback: "Violates professionalism and policy.", points: 0 },
        ],
      },
    ],
  },
  "firefighter-emt": {
    sequence: [
      "Scene size-up: hazards, victims, resources needed",
      "Establish incident command and assign roles",
      "Ensure rescuer PPE and safe approach route",
      "Primary survey: ABCs on critical patients",
      "Ventilate, treat life threats, request additional units",
      "Rehab crews and document patient care handoff",
    ],
  },
  "postal-worker": {
    typing: [
      { text: "742 Evergreen Terrace, Springfield, IL 62704", context: "Residential delivery" },
      { text: "PO Box 8842, Austin, TX 78701", context: "Post office box" },
      { text: "1600 Pennsylvania Ave NW, Washington, DC 20500", context: "Government address" },
      { text: "Unit 12B, 500 Market St, San Francisco, CA 94105", context: "Apartment route" },
      { text: "RR 2 Box 450, Boise, ID 83709", context: "Rural route address" },
    ],
  },
  "office-assistant": {
    typing: [
      { text: "Dear Ms. Johnson, Thank you for confirming Tuesday at 2:00 PM.", context: "Client email" },
      { text: "Please find the attached invoice for services rendered in March.", context: "Billing note" },
      { text: "Conference Room B is reserved for the team stand-up at 9 AM.", context: "Scheduling" },
      { text: "Kind regards, LearnForge Admin Team", context: "Professional sign-off" },
      { text: "Action items: 1) Update roster 2) Print badges 3) Confirm catering", context: "Meeting minutes" },
    ],
  },
  bookkeeper: {
    math: [
      {
        prompt: "Debits total $4,250. Credits total $4,180. By how much is the trial balance off?",
        options: ["$50", "$70", "$80", "$100"],
        correctIndex: 1,
        explanation: "$4,250 − $4,180 = $70 out of balance.",
      },
      {
        prompt: "Invoice $1,200 + 8% sales tax. Total due?",
        options: ["$1,208", "$1,260", "$1,296", "$1,320"],
        correctIndex: 2,
        explanation: "1,200 × 0.08 = 96. Total = $1,296.",
      },
      {
        prompt: "Petty cash fund: start $200, receipts $147. Cash on hand should be?",
        options: ["$43", "$47", "$53", "$63"],
        correctIndex: 2,
        explanation: "200 − 147 = $53 remaining.",
      },
      {
        prompt: "A payment of $850 was recorded as $580. Error amount?",
        options: ["$170", "$270", "$370", "$470"],
        correctIndex: 1,
        explanation: "850 − 580 = $270 understatement.",
      },
    ],
  },
  "bank-teller": {
    math: [
      {
        prompt: "Customer buys $47.83 of goods with a $100 bill. Change?",
        options: ["$52.07", "$52.17", "$53.17", "$62.17"],
        correctIndex: 1,
        explanation: "100.00 − 47.83 = $52.17.",
      },
      {
        prompt: "Deposit: 3 × $20, 4 × $5, 7 × $1. Total?",
        options: ["$67", "$77", "$87", "$97"],
        correctIndex: 1,
        explanation: "60 + 20 + 7 = $77.",
      },
      {
        prompt: "End-of-day drawer: expected $2,500, counted $2,465. Status?",
        options: ["$35 short", "$35 over", "Balanced", "$50 short"],
        correctIndex: 0,
        explanation: "2,500 − 2,465 = $35 short — report immediately.",
      },
      {
        prompt: "Customer wants to withdraw $400. Daily limit is $300. Best response?",
        options: ["Explain limit and offer split withdrawal options", "Give $400 anyway", "Refuse without explanation", "Close their account"],
        correctIndex: 0,
        explanation: "Policy + alternatives = professional service.",
      },
    ],
  },
  electrician: {
    pairs: [
      { term: "Black wire (US typical)", definition: "Hot / ungrounded conductor" },
      { term: "White wire", definition: "Neutral / grounded conductor" },
      { term: "Green or bare copper", definition: "Equipment ground" },
      { term: "Multimeter", definition: "Measures voltage, current, resistance" },
      { term: "Lockout/tagout", definition: "De-energize before working on circuits" },
      { term: "GFCI", definition: "Protects people from ground faults near water" },
    ],
  },
  "hvac-tech": {
    sequence: [
      "Arrive, ID yourself, review work order with customer",
      "Inspect workspace and verify electrical disconnect safety",
      "Check thermostat call and measure supply/return temps",
      "Inspect filter, coil, refrigerant lines, and drain",
      "Perform repair or maintenance per manufacturer spec",
      "Test operation, explain findings, collect signature",
    ],
  },
  "cdl-driver": {
    sequence: [
      "Engine off — check tires, rims, and lug nuts",
      "Inspect lights, reflectors, and windshield",
      "Check mirrors, wipers, horn, and emergency equipment",
      "Engine on — test brakes, gauges, and air pressure",
      "Walk around — check coupling, cargo securement, leaks",
      "Complete log entry and report defects before rolling",
    ],
  },
  "data-analyst": {},
  "software-developer": {},
  "information-technology": {},
  "cybersecurity": {},
  "cloud-computing": {},
  "plumber": {},
  "welder": {},
  "it-support": {
    code: [
      {
        title: "Fix the login script",
        code: `users = ["admin", "guest"]
password = "1234"
if user == "admin":
  print("Welcome")
else
  print("Denied")`,
        question: "Which line has the bug?",
        options: ["Line 1: users list", "Line 3: missing quotes on admin", "Line 4: else needs a colon (:)", "Line 2: password variable"],
        correctIndex: 2,
        explanation: "Python requires a colon after else. Also user should be defined — but the syntax error is the missing colon.",
      },
      {
        title: "Subnet quick check",
        code: `ip = "192.168.1.10"
mask = "255.255.255.0"
# Is this a private address?`,
        question: "192.168.x.x addresses are…",
        options: ["Public routable IPs", "Private RFC 1918 addresses", "Multicast only", "Invalid addresses"],
        correctIndex: 1,
        explanation: "CompTIA A+: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 are private.",
      },
      {
        title: "Ticket priority",
        code: `ticket = "CEO laptop will not boot"
priority = ???`,
        question: "Best priority for a C-level exec with no backup machine?",
        options: ["Low — schedule next week", "Medium — same day", "High — business impact", "Close ticket — user error"],
        correctIndex: 2,
        explanation: "Business impact drives ITIL-style prioritization.",
      },
    ],
    pcBuild: [
      "Install CPU on motherboard (align triangle marker)",
      "Seat RAM in correct DIMM slots",
      "Mount motherboard in case with standoffs",
      "Install PSU and connect 24-pin + CPU power",
      "Attach storage (SSD/HDD) and front-panel cables",
      "Install GPU if needed, cable-manage, power on and POST",
    ],
  },
  "project-management": {
    sequence: [
      "Initiate: charter, stakeholders, high-level scope",
      "Plan: WBS, schedule, budget, risk register",
      "Execute: direct team work and manage communications",
      "Monitor & control: track variance, change requests",
      "Close: final deliverables, lessons learned, release team",
    ],
  },
  "real-estate": {
    script: [
      {
        prompt: "Buyers say a home 'feels wrong' but can't explain why after the showing.",
        options: [
          { text: "Ask specific questions about layout, light, noise, and must-haves", feedback: "Good agents translate feelings into criteria.", points: 3 },
          { text: "Pressure them to offer before other buyers", feedback: "High-pressure tactics destroy trust.", points: 0 },
          { text: "Stop showing them homes permanently", feedback: "Clarifying questions keep the search productive.", points: 0 },
        ],
      },
      {
        prompt: "Seller wants to hide a known roof leak from buyers.",
        options: [
          { text: "Explain disclosure laws and ethical duty", feedback: "Material defects must be disclosed in most states.", points: 3 },
          { text: "Agree to stay silent", feedback: "Fraud exposure for client and agent.", points: 0 },
          { text: "Suggest they fix it secretly without permits", feedback: "Unpermitted work creates liability.", points: 0 },
        ],
      },
      {
        prompt: "Multiple offers arrive on a listing you represent.",
        options: [
          { text: "Present all offers objectively with terms summarized", feedback: "Seller decides — agent facilitates.", points: 3 },
          { text: "Only show the highest price offer", feedback: "Financing and contingencies matter too.", points: 1 },
          { text: "Accept the first offer to close fast", feedback: "Seller may lose better terms.", points: 0 },
        ],
      },
    ],
  },
  cosmetology: {
    sequence: [
      "Wash hands and set clean drape on client",
      "Sanitize all tools in EPA-registered disinfectant",
      "Use new applicators — no double-dipping product",
      "Dispose single-use items after each client",
      "Wipe stations with disinfectant between clients",
      "Document any skin reactions per salon policy",
    ],
  },
  "teacher-cert": {
    sequence: [
      "Identify learning objective aligned to standards",
      "Activate prior knowledge with a short hook",
      "Model skill and check for understanding",
      "Guided practice with feedback",
      "Independent practice and exit ticket assessment",
      "Reflect: what worked, reteach if data shows gaps",
    ],
  },
};
