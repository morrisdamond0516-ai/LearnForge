import type { CareerSkillSlug } from "./career-skills-catalog";
import {
  CAREER_LAB_TRACKS_EXTENDED,
  type CareerLabModule,
} from "./career-lab-tracks-extended";
import { CAREER_LAB_TRACKS_TIER1 } from "./career-lab-tracks-tier1";
import { CAREER_LAB_TRACKS_TIER2 } from "./career-lab-tracks-tier2";
import { rebalanceCareerTrack } from "./lab-track-rebalance";

export type { CareerLabModule };
export { moduleHasPhasedFlow } from "./career-lab-tracks-extended";

/**
 * Multi-lab tracks for careers that need more than one scenario
 * (IT, Data Analyst, Software Developer, healthcare, trades, etc.).
 */

export const CAREER_LAB_TRACKS: Partial<
  Record<CareerSkillSlug, CareerLabModule[]>
> = {
  "information-technology": [
    {
      id: "it-network-outage",
      title: "Network Outage Triage",
      description:
        "Building B is offline after switch work. Use the CLI to verify IP, gateway reachability, and adapter status.",
      gameType: "terminal-workspace",
      duration: "8–12 min",
      domain: "Networking",
      content: {
        terminal: {
          title: "INC-9102 — Building B Offline",
          brief:
            "Multiple users report no network after maintenance. Triage from a known-good workstation on that VLAN.",
          hostname: "IT-LAB-01",
          prompt: "C:\\Users\\ITOps> ",
          initialOutput:
            "Priority 1 ticket: Building B — users offline. Start with Layer 3 checks on this station.",
          steps: [
            {
              instruction: "Show IP configuration for this workstation.",
              expectedCommand: "ipconfig",
              hint: "ipconfig",
            },
            {
              instruction: "Ping the default gateway (192.168.1.1).",
              expectedCommand: "ping 192.168.1.1",
              hint: "ping 192.168.1.1",
            },
            {
              instruction: "Ping an external DNS server to test internet path.",
              expectedCommand: "ping 8.8.8.8",
              hint: "ping 8.8.8.8",
            },
            {
              instruction: "Open Network Connections to confirm the adapter is enabled.",
              expectedCommand: "ncpa.cpl",
              hint: "ncpa.cpl",
            },
          ],
        },
      },
    },
    {
      id: "it-dns-resolution",
      title: "DNS Name Resolution Lab",
      description:
        "Users can ping 8.8.8.8 but websites fail by name. Prove DNS is the fault and query records.",
      gameType: "terminal-workspace",
      duration: "8–12 min",
      domain: "Networking / DNS",
      content: {
        terminal: {
          title: "INC-9220 — Sites Fail by Name",
          brief:
            "Browsers cannot open company portals by hostname. IP pings work. Isolate DNS.",
          hostname: "IT-LAB-02",
          prompt: "C:\\Users\\ITOps> ",
          initialOutput:
            "Symptom: ping 8.8.8.8 OK · https://intranet.contoso.local fails. Suspect DNS.",
          steps: [
            {
              instruction: "Confirm outbound IP connectivity still works.",
              expectedCommand: "ping 8.8.8.8",
              hint: "ping 8.8.8.8",
            },
            {
              instruction: "Look up the intranet hostname with nslookup.",
              expectedCommand: "nslookup intranet.contoso.local",
              hint: "nslookup intranet.contoso.local",
            },
            {
              instruction: "Show detailed IP/DNS client settings.",
              expectedCommand: "ipconfig /all",
              hint: "ipconfig /all",
            },
            {
              instruction: "Flush the local DNS resolver cache.",
              expectedCommand: "ipconfig /flushdns",
              hint: "ipconfig /flushdns",
            },
          ],
        },
      },
    },
    {
      id: "it-identity-accounts",
      title: "Identity & Local Accounts",
      description:
        "Verify who you are on the box, list local users, and check a service account — core Windows admin skills.",
      gameType: "terminal-workspace",
      duration: "6–10 min",
      domain: "OS / Identity",
      content: {
        terminal: {
          title: "LAB — Local Account Hygiene",
          brief:
            "Before joining a domain machine to a new OU, confirm identity and local accounts on the staging PC.",
          hostname: "STAGING-PC",
          prompt: "C:\\Users\\Admin> ",
          initialOutput:
            "Task: verify signed-in identity, hostname, and local user list for audit.",
          steps: [
            {
              instruction: "Display the current signed-in user.",
              expectedCommand: "whoami",
              hint: "whoami",
            },
            {
              instruction: "Print this computer's hostname.",
              expectedCommand: "hostname",
              hint: "hostname",
            },
            {
              instruction: "List local user accounts.",
              expectedCommand: "net user",
              hint: "net user",
            },
            {
              instruction: "Show details for the helpdesk account.",
              expectedCommand: "net user helpdesk",
              hint: "net user helpdesk",
            },
          ],
        },
      },
    },
    {
      id: "it-hardware-build",
      title: "PC Hardware Build Order",
      description:
        "Assemble a workstation in the correct ESD-safe order — CompTIA A+ hardware fundamentals.",
      gameType: "code-trace",
      duration: "10–14 min",
      domain: "Hardware (A+)",
      content: {
        code: [
          {
            title: "POST failure after RAM upgrade",
            code: `# Tech notes
# New DIMM installed in slot A2 only
# Board requires dual-channel pairs
beep_code = "1 long, 3 short"`,
            question: "Most likely cause of no POST after adding one stick?",
            options: [
              "GPU driver outdated",
              "Single stick in wrong channel / unsupported config",
              "Wrong Windows edition",
              "Monitor cable unplugged only",
            ],
            correctIndex: 1,
            explanation:
              "Many boards expect matched pairs for dual-channel; odd configs or wrong slots cause memory POST errors.",
          },
          {
            title: "Power connectors",
            code: `psu_cables = ["24-pin ATX", "CPU 8-pin", "PCIe 6+2", "SATA"]
motherboard_needs = ???`,
            question: "What must connect before a modern board will POST?",
            options: [
              "Only SATA power",
              "24-pin ATX and CPU power (4/8-pin)",
              "Only PCIe power",
              "Only front-panel USB",
            ],
            correctIndex: 1,
            explanation:
              "Motherboard needs main ATX power and dedicated CPU power; missing CPU power is a classic no-POST.",
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
        codePhaseSubtitle: "Diagnose hardware issues, then build in order",
        buildPhaseTitle: "Workstation assembly",
        buildPhaseSubtitle: "Order the build steps like a bench tech",
      },
    },
    {
      id: "it-security-response",
      title: "Security Incident Choices",
      description:
        "Handle phishing, USB drops, and privilege requests the way a responsible IT pro would.",
      gameType: "script-choice",
      duration: "6–10 min",
      domain: "Security",
      content: {
        script: [
          {
            prompt:
              "A user forwards an email: 'CEO needs gift cards ASAP — buy and send codes.' What do you do first?",
            options: [
              {
                text: "Tell them to buy the cards quickly to help the CEO",
                feedback: "Classic business email compromise — never buy gift cards from email requests.",
                points: 0,
              },
              {
                text: "Verify via a known-good channel and report as phishing",
                feedback: "Out-of-band verification + report protects the org.",
                points: 3,
              },
              {
                text: "Ignore it — not your ticket queue",
                feedback: "Security incidents need escalation even if informal.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "You find an unmarked USB stick in the lobby labeled 'Payroll.' Next step?",
            options: [
              {
                text: "Plug it into your admin laptop to see what's on it",
                feedback: "Never plug unknown media into production/admin systems.",
                points: 0,
              },
              {
                text: "Turn it in to security / use an isolated forensics process",
                feedback: "Treat as potential malware drop — chain of custody.",
                points: 3,
              },
              {
                text: "Give it to finance since it says Payroll",
                feedback: "Labeling is social engineering.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "A contractor asks for Domain Admin 'just for today' to finish a script.",
            options: [
              {
                text: "Grant Domain Admin temporarily — faster",
                feedback: "Least privilege: never grant DA without change control.",
                points: 0,
              },
              {
                text: "Offer least-privilege access via ticket + approval",
                feedback: "Scoped rights + audit trail is the IT standard.",
                points: 3,
              },
              {
                text: "Share your own admin password verbally",
                feedback: "Credential sharing breaks accountability.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
    {
      id: "it-subnet-math",
      title: "IP & Subnet Fundamentals",
      description:
        "Private ranges, masks, and host counts — the math every IT tech uses on tickets.",
      gameType: "math-scenario",
      duration: "6–10 min",
      domain: "Networking math",
      content: {
        math: [
          {
            prompt: "Which address is a private RFC 1918 address?",
            options: ["8.8.8.8", "192.168.10.25", "1.1.1.1", "208.67.222.222"],
            correctIndex: 1,
            explanation: "192.168.0.0/16 is private; the others are public resolvers.",
          },
          {
            prompt: "On a /24 network (255.255.255.0), how many usable host addresses?",
            options: ["254", "256", "255", "24"],
            correctIndex: 0,
            explanation: "256 addresses minus network and broadcast = 254 usable hosts.",
          },
          {
            prompt: "Default gateway for clients on 10.0.5.0/24 is usually…",
            options: [
              "The client's own IP",
              "A router interface on that subnet (e.g. 10.0.5.1)",
              "Any public DNS IP",
              "255.255.255.255",
            ],
            correctIndex: 1,
            explanation: "Gateway must be an address on the same subnet that routes elsewhere.",
          },
          {
            prompt: "APIPA address 169.254.x.x usually means…",
            options: [
              "DHCP succeeded",
              "DHCP failed / no lease",
              "IPv6 only mode",
              "VPN is connected",
            ],
            correctIndex: 1,
            explanation: "Windows assigns 169.254/16 when DHCP does not respond.",
          },
        ],
      },
    },
    {
      id: "it-incident-sequence",
      title: "Incident Response Order",
      description:
        "Put the ITIL-style response steps in order for a production outage.",
      gameType: "sequence-build",
      duration: "5–8 min",
      domain: "Process",
      content: {
        sequence: [
          "Acknowledge the ticket and gather impact (who / what / when)",
          "Stabilize / restore service with a known workaround if needed",
          "Investigate root cause with logs and reproducible checks",
          "Apply permanent fix and verify with affected users",
          "Document resolution, notify stakeholders, close ticket",
        ],
      },
    },
  ],

  "it-support": [
    {
      id: "helpdesk-asset-intake",
      title: "Loaner Laptop Checkout",
      description:
        "Log asset tag, user, and ticket number when issuing depot equipment — daily A+ ops paperwork.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Asset management",
      content: {
        intakeForm: {
          title: "Loaner Device — INC-4102",
          brief: "User needs a laptop while theirs is repaired. Complete checkout before handoff.",
          scenario: "Dell Latitude loaner for Finance user — original device INC-4098 depot repair.",
          fields: [
            { id: "asset", label: "Loaner asset tag", type: "text", expected: "LF-LT-8842", hint: "LF-LT-8842" },
            { id: "user", label: "Assigned user", type: "text", expected: "Chris Park", hint: "Chris Park" },
            { id: "ticket", label: "Linked ticket", type: "text", expected: "INC-4102", hint: "INC-4102" },
            { id: "return", label: "Expected return date", type: "text", expected: "03/28/2026", hint: "03/28/2026" },
          ],
        },
      },
    },
    {
      id: "helpdesk-security-intake",
      title: "Security Incident Intake",
      description:
        "Document phishing or malware reports before escalating to Tier 2 — standard service desk security workflow.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Security",
      content: {
        intakeForm: {
          title: "Security Triage — Phishing Report",
          brief: "User forwarded suspicious email. Capture intake before SOC handoff.",
          scenario: "Gift-card request email claiming to be CEO — user did not click links.",
          fields: [
            { id: "type", label: "Incident type", type: "select", options: ["Phishing", "Malware", "Lost device"], expected: "Phishing" },
            { id: "clicked", label: "User clicked links?", type: "select", options: ["Yes", "No"], expected: "No" },
            { id: "forward", label: "Original email forwarded to security?", type: "select", options: ["Yes", "No"], expected: "Yes" },
            { id: "escalate", label: "Escalate to SOC?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "helpdesk-ticket-queue",
      title: "Help Desk Ticket Queue (Shift)",
      description:
        "Work a LabSim-style ticket queue — read priority, pick resolve/escalate/ask, close the shift. Closest in-app match to TestOut ticketing.",
      gameType: "helpdesk-ticket-queue",
      duration: "12–18 min",
      domain: "A+ Ops / Ticketing",
      content: {
        helpdeskQueue: {
          title: "Tier-1 Morning Queue",
          brief:
            "You are on the Service Desk. For each ticket, choose the best next action — like closing tickets in LabSim / real ServiceNow queues.",
          queueName: "LF-ServiceDesk · Tier 1",
          tickets: [
            {
              id: "INC-1001",
              subject: "Cannot reach internet after VPN install",
              requester: "Maya Chen (Sales)",
              priority: "High",
              category: "Network",
              aPlusDomain: "Core 1 · Networking",
              description:
                "User installed a vendor VPN client Friday. Today browsers fail. Phone works. They need email for a client call in 20 minutes.",
              actions: [
                {
                  id: "a1",
                  label: "Ask them to wait until Monday — not urgent",
                  correct: false,
                  feedback: "High business impact with a deadline — stay on it.",
                },
                {
                  id: "a2",
                  label:
                    "Gather: can they ping 8.8.8.8? Disconnect VPN and retest; document; escalate if still broken",
                  correct: true,
                  feedback:
                    "Correct triage — isolate VPN vs LAN, then escalate with notes if needed.",
                },
                {
                  id: "a3",
                  label: "Reset their AD password immediately without verifying identity",
                  correct: false,
                  feedback: "Wrong symptom — and never reset without identity checks.",
                },
              ],
            },
            {
              id: "INC-1002",
              subject: "Laptop will not power on — no lights",
              requester: "Omar Diaz (Warehouse)",
              priority: "Medium",
              category: "Hardware",
              aPlusDomain: "Core 1 · Hardware",
              description:
                "Dell Latitude. No LEDs when pressing power. Tried another wall outlet. Battery was swollen last month (already replaced).",
              actions: [
                {
                  id: "b1",
                  label: "Remote into the laptop and run SFC",
                  correct: false,
                  feedback: "Dead power — no OS to remote into.",
                },
                {
                  id: "b2",
                  label:
                    "Have them try AC adapter known-good, check LED on brick, then schedule onsite / depot swap if still dead",
                  correct: true,
                  feedback: "Hardware power path first — classic A+ troubleshooting.",
                },
                {
                  id: "b3",
                  label: "Tell them to buy a new laptop on their personal card",
                  correct: false,
                  feedback: "Not a help desk resolution path.",
                },
              ],
            },
            {
              id: "INC-1003",
              subject: "Phishing email asking for gift cards",
              requester: "Front Desk Shared Mailbox",
              priority: "High",
              category: "Security",
              aPlusDomain: "Core 2 · Security",
              description:
                "Email from 'ceo@contoso-support.com' asks receptionist to buy $500 gift cards and reply with codes. Grammar is odd; logo looks blurry.",
              actions: [
                {
                  id: "c1",
                  label: "Buy the cards to avoid getting the CEO mad",
                  correct: false,
                  feedback: "Classic BEC scam — never purchase gift cards from email.",
                },
                {
                  id: "c2",
                  label:
                    "Do not click links; report as phishing per policy; warn the user; notify security",
                  correct: true,
                  feedback: "Correct security + ops procedure.",
                },
                {
                  id: "c3",
                  label: "Forward the email to the whole company as a joke",
                  correct: false,
                  feedback: "Spreads the threat and confuses staff.",
                },
              ],
            },
            {
              id: "INC-1004",
              subject: "Password expired — locked out of email",
              requester: "Priya Nair (HR)",
              priority: "Medium",
              category: "Account",
              aPlusDomain: "Core 2 · OS / Identity",
              description:
                "User is remote. MFA works on phone but Outlook keeps rejecting password. Last password change was 90 days ago (policy).",
              actions: [
                {
                  id: "d1",
                  label:
                    "Verify identity with approved questions, reset password / unlock per SOP, confirm Outlook reconnects",
                  correct: true,
                  feedback: "Standard account unlock with identity proof.",
                },
                {
                  id: "d2",
                  label: "Disable MFA for the whole company",
                  correct: false,
                  feedback: "Never weaken org security for one ticket.",
                },
                {
                  id: "d3",
                  label: "Ignore — HR can wait until they are in the office",
                  correct: false,
                  feedback: "Remote staff need email; follow remote reset SOP.",
                },
              ],
            },
            {
              id: "INC-1005",
              subject: "Shared printer shows Offline for one user",
              requester: "Chris Park (Finance)",
              priority: "Low",
              category: "Peripherals",
              aPlusDomain: "Core 1 · Hardware",
              description:
                "HP Floor3. Others print fine. Chris recently renamed his PC. Default printer still points to old queue name.",
              actions: [
                {
                  id: "e1",
                  label: "Replace the physical printer immediately",
                  correct: false,
                  feedback: "Others print — not a hardware failure.",
                },
                {
                  id: "e2",
                  label:
                    "Remove/re-add the correct network printer on Chris’s PC; set as default; test page",
                  correct: true,
                  feedback: "Client mapping issue — common help desk fix.",
                },
                {
                  id: "e3",
                  label: "Delete everyone’s printers to start over",
                  correct: false,
                  feedback: "Blast radius too large.",
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "helpdesk-ports",
      title: "Ports & Protocols Match",
      description: "Memorize the ports help desk techs see every day (A+ Core 1).",
      gameType: "match-pairs",
      duration: "5–8 min",
      domain: "A+ Networking",
      content: {
        pairs: [
          { term: "HTTPS", definition: "TCP 443 — encrypted web" },
          { term: "HTTP", definition: "TCP 80 — unencrypted web" },
          { term: "SSH", definition: "TCP 22 — secure remote shell" },
          { term: "RDP", definition: "TCP 3389 — Windows remote desktop" },
          { term: "DNS", definition: "UDP/TCP 53 — name resolution" },
          { term: "DHCP", definition: "UDP 67/68 — automatic IP addressing" },
        ],
      },
    },
    {
      id: "helpdesk-no-internet",
      title: "Help Desk — No Internet",
      description:
        "Walk a single-user no-internet ticket from ipconfig through adapter check.",
      gameType: "terminal-workspace",
      duration: "6–10 min",
      domain: "Help desk",
      content: {
        terminal: {
          title: "INC-3847 — No Internet",
          brief: "Remote user cannot browse after a home router reboot.",
          hostname: "DESK-042",
          prompt: "C:\\Users\\Tech> ",
          initialOutput: "Ticket: User reports no internet after router reboot.",
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
              instruction: "Open network adapter settings.",
              expectedCommand: "ncpa.cpl",
              hint: "ncpa.cpl",
            },
          ],
        },
      },
    },
    {
      id: "helpdesk-printer",
      title: "Help Desk — Printer Offline",
      description: "Verify spooler-related CLI checks and document the fix path.",
      gameType: "terminal-workspace",
      duration: "6–10 min",
      domain: "Peripherals",
      content: {
        terminal: {
          title: "INC-4011 — Printer Offline",
          brief: "Shared printer shows Offline for one user; others print fine.",
          hostname: "DESK-018",
          prompt: "C:\\Users\\Tech> ",
          initialOutput: "Scope: single user · device: HP-Floor3 · others OK.",
          steps: [
            {
              instruction: "Confirm who is signed in on this PC.",
              expectedCommand: "whoami",
              hint: "whoami",
            },
            {
              instruction: "List printers known to this workstation.",
              expectedCommand: "wmic printer list brief",
              hint: "wmic printer list brief",
            },
            {
              instruction: "Open Devices and Printers for the user.",
              expectedCommand: "control printers",
              hint: "control printers",
            },
          ],
        },
      },
    },
    {
      id: "helpdesk-scripting",
      title: "Support Scripts & Ticket Priority",
      description: "Read small scripts and choose correct ticket priority — A+ soft skills + logic.",
      gameType: "code-trace",
      duration: "8–12 min",
      domain: "Scripting / process",
      content: {
        code: [
          {
            title: "Fix the login script",
            code: `users = ["admin", "guest"]
password = "1234"
if user == "admin":
  print("Welcome")
else
  print("Denied")`,
            question: "Which line has the syntax bug?",
            options: [
              "Line 1: users list",
              "Line 3: missing quotes on admin",
              "Line 4: else needs a colon (:)",
              "Line 2: password variable",
            ],
            correctIndex: 2,
            explanation: "Python requires a colon after else.",
          },
          {
            title: "Ticket priority",
            code: `ticket = "CEO laptop will not boot"
priority = ???`,
            question: "Best priority with no spare machine?",
            options: [
              "Low — next week",
              "Medium — same day",
              "High — business impact",
              "Close as user error",
            ],
            correctIndex: 2,
            explanation: "Business impact drives prioritization.",
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
    },
    {
      id: "helpdesk-customer",
      title: "Customer Communication",
      description: "Choose professional help-desk responses under pressure.",
      gameType: "script-choice",
      duration: "5–8 min",
      domain: "Soft skills",
      content: {
        script: [
          {
            prompt: "Angry user: 'This is the third time Wi-Fi dropped today!'",
            options: [
              {
                text: "Blame their home router and hang up",
                feedback: "Dismissive tone escalates tickets.",
                points: 0,
              },
              {
                text: "Acknowledge frustration, gather timeline, start checks",
                feedback: "Empathy + structured triage is help-desk standard.",
                points: 3,
              },
              {
                text: "Tell them to reboot until it works",
                feedback: "Reboot may help but skipping intake loses data.",
                points: 1,
              },
            ],
          },
          {
            prompt: "User asks you to bypass MFA 'just this once.'",
            options: [
              {
                text: "Disable MFA for their account permanently",
                feedback: "Security policy exists for a reason.",
                points: 0,
              },
              {
                text: "Explain policy and offer approved recovery steps",
                feedback: "Follow process; stay helpful within policy.",
                points: 3,
              },
              {
                text: "Share a coworker’s MFA codes",
                feedback: "Never share authentication factors.",
                points: 0,
              },
            ],
          },
        ],
      },
    },
  ],

  "data-analyst": [
    {
      id: "da-stakeholder-intake",
      title: "Analytics Request Intake",
      description:
        "Capture stakeholder metrics, deadline, and data sources before you build a dashboard — real analyst workflow.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Stakeholder mgmt",
      content: {
        intakeForm: {
          title: "Dashboard Request — Marketing Q2",
          brief: "Product wants a funnel dashboard. Complete intake before querying data.",
          scenario: "VP Marketing needs weekly conversion by channel for board review.",
          fields: [
            { id: "metric", label: "Primary metric", type: "text", expected: "Conversion rate", hint: "Conversion rate" },
            { id: "source", label: "Data source", type: "select", options: ["Snowflake warehouse", "Email only", "Guess"], expected: "Snowflake warehouse" },
            { id: "cadence", label: "Refresh cadence", type: "select", options: ["Weekly", "Once", "Real-time only"], expected: "Weekly" },
            { id: "due", label: "First delivery date", type: "text", expected: "04/01/2026", hint: "04/01/2026" },
          ],
        },
      },
    },
    {
      id: "da-cohort-spreadsheet",
      title: "Cohort Retention Sheet",
      description: "Build retention percentages by signup month — common analyst deliverable.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Product analytics",
      content: {
        spreadsheet: {
          title: "Monthly Cohort Retention",
          brief: "Calculate month-1 retention % for each cohort row.",
          headers: ["", "A", "B", "C", "D"],
          rows: [
            ["1", "Cohort", "Users", "Active M1", "Retention %"],
            ["2", "Jan 2026", "1000", "620", ""],
            ["3", "Feb 2026", "1200", "780", ""],
            ["4", "Mar 2026", "900", "567", ""],
            ["5", "Avg retention", "", "", ""],
          ],
          tasks: [
            {
              instruction: "Jan retention % in D2 (Active/Users×100).",
              targetCell: "D2",
              expectedValue: "62",
              formulaHint: "=C2/B2*100",
            },
            {
              instruction: "Feb retention % in D3.",
              targetCell: "D3",
              expectedValue: "65",
              formulaHint: "=C3/B3*100",
            },
            {
              instruction: "Mar retention % in D4 (round to whole number).",
              targetCell: "D4",
              expectedValue: "63",
              formulaHint: "=C4/B4*100",
            },
            {
              instruction: "Average of D2:D4 rounded to whole number in D5.",
              targetCell: "D5",
              expectedValue: "63",
              formulaHint: "=ROUND(AVERAGE(D2:D4),0)",
            },
          ],
        },
      },
    },
    {
      id: "da-sales-summary",
      title: "Regional Sales Summary",
      description: "Build revenue formulas and totals from raw regional units.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Spreadsheet / formulas",
      content: {
        spreadsheet: {
          title: "Q2 Regional Sales — Clean & Summarize",
          brief:
            "Your manager exported raw sales data. Build summary metrics like a junior data analyst.",
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
    },
    {
      id: "da-data-quality",
      title: "Data Quality Checks",
      description: "Flag bad rows and compute corrected metrics — analyst hygiene.",
      gameType: "spreadsheet-workspace",
      duration: "8–12 min",
      domain: "Data quality",
      content: {
        spreadsheet: {
          title: "Weekly Leads — Quality Pass",
          brief:
            "Marketing export has blanks and a bad conversion rate. Fix calculated fields.",
          headers: ["", "A", "B", "C", "D"],
          rows: [
            ["1", "Source", "Leads", "Wins", "Win Rate %"],
            ["2", "Organic", "200", "40", ""],
            ["3", "Paid", "150", "30", ""],
            ["4", "Referral", "50", "15", ""],
            ["5", "Total Wins", "", "", ""],
          ],
          tasks: [
            {
              instruction: "Win rate for Organic = Wins/Leads×100 in D2 (as 20).",
              targetCell: "D2",
              expectedValue: "20",
              formulaHint: "=C2/B2*100",
            },
            {
              instruction: "Win rate for Paid in D3.",
              targetCell: "D3",
              expectedValue: "20",
              formulaHint: "=C3/B3*100",
            },
            {
              instruction: "Sum wins in C5 (C2:C4).",
              targetCell: "C5",
              expectedValue: "85",
              formulaHint: "=SUM(C2:C4)",
            },
          ],
        },
      },
    },
    {
      id: "da-metrics-literacy",
      title: "Metrics Literacy",
      description: "Choose the right metric for the business question.",
      gameType: "math-scenario",
      duration: "5–8 min",
      domain: "Analytics thinking",
      content: {
        math: [
          {
            prompt: "Leadership asks: 'Are we converting traffic better this month?' Best primary metric?",
            options: [
              "Raw page views only",
              "Conversion rate (conversions ÷ visitors)",
              "Server uptime %",
              "Number of Slack messages",
            ],
            correctIndex: 1,
            explanation: "Conversion rate normalizes for traffic volume.",
          },
          {
            prompt: "Average order value rose but revenue fell. What must also be true?",
            options: [
              "Order count fell enough to offset AOV",
              "Taxes disappeared",
              "Currency is invalid",
              "AOV cannot rise if revenue falls",
            ],
            correctIndex: 0,
            explanation: "Revenue ≈ AOV × orders — fewer orders can dominate.",
          },
          {
            prompt: "A dashboard shows 200% conversion. Most likely issue?",
            options: [
              "Perfect marketing",
              "Misdefined numerator/denominator or duplicate events",
              "Normal for ecommerce",
              "Timezone display only",
            ],
            correctIndex: 1,
            explanation: "Rates over 100% usually mean tracking or definition bugs.",
          },
        ],
      },
    },
    {
      id: "da-ai-assisted-analytics",
      title: "AI-Assisted Analytics Judgment",
      description:
        "Modern analysts use Copilot, ChatGPT, and BI AI features — learn when to trust outputs, verify numbers, and follow data governance.",
      gameType: "script-choice",
      duration: "8–12 min",
      domain: "AI + analytics",
      content: {
        script: [
          {
            prompt:
              "Copilot in Excel drafts a pivot showing 42% MoM revenue growth. Your raw sheet sums to 18%. What do you do before the standup?",
            options: [
              {
                text: "Present the Copilot number — it's faster and leadership wants speed",
                feedback: "Never ship AI output without reconciling to source data.",
                points: 0,
              },
              {
                text: "Recompute from source cells, fix the formula range, then report 18%",
                feedback: "Analysts own the number — AI is a draft assistant, not the source of truth.",
                points: 3,
              },
              {
                text: "Average Copilot and your manual calc and report 30%",
                feedback: "There is one correct answer from verified data — don't blend guesses.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "A teammate pastes 500 customer emails into a public chatbot to 'find churn themes.' Company policy forbids PII in external AI.",
            options: [
              {
                text: "Fine if they delete the chat afterward",
                feedback: "Data may already be logged on the vendor side — policy exists for leakage risk.",
                points: 0,
              },
              {
                text: "Stop the paste; use approved tools or anonymized exports only",
                feedback: "Governance first — aggregate or de-identify before any external AI.",
                points: 3,
              },
              {
                text: "Only warn them not to screenshot results",
                feedback: "The violation is sending PII out, not how results are shared.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "ChatGPT writes SQL for 'active users last 30 days.' It joins events to users without a date filter and doubles counts.",
            options: [
              {
                text: "Run it in production — AI writes better SQL than juniors",
                feedback: "AI often hallucinates joins and filters; bad queries corrupt dashboards.",
                points: 0,
              },
              {
                text: "Review logic, add the date window and DISTINCT rules, test on a sample",
                feedback: "Treat AI SQL as a starting draft — you validate grain, filters, and joins.",
                points: 3,
              },
              {
                text: "Ask ChatGPT again until it says the query is perfect",
                feedback: "LLMs can be confidently wrong; testing beats re-prompting alone.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "BI 'insight' AI says: 'Sales dropped because marketing spend fell.' Spend actually rose; the dip is post-holiday seasonality.",
            options: [
              {
                text: "Add the AI insight to the exec deck — it sounds plausible",
                feedback: "Correlation narratives without domain context mislead decisions.",
                points: 0,
              },
              {
                text: "Compare YoY, check seasonality, and write a human-verified explanation",
                feedback: "AI surfaces hypotheses; analysts test them against business context.",
                points: 3,
              },
              {
                text: "Hide the drop and only show positive KPIs",
                feedback: "Cherry-picking is unethical; fix the analysis instead.",
                points: 0,
              },
            ],
          },
          {
            prompt:
              "Your manager asks you to label 10,000 support tickets by topic before Friday. What's a responsible use of AI?",
            options: [
              {
                text: "Auto-label all rows with zero spot-checks to hit the deadline",
                feedback: "Bulk AI labels need sampling and error-rate checks before downstream use.",
                points: 0,
              },
              {
                text: "Pilot on 200 tickets, measure accuracy, fix the prompt, then scale with QA sampling",
                feedback: "Pilot → measure → scale is how teams adopt AI labeling safely.",
                points: 3,
              },
              {
                text: "Refuse — AI can never help with text classification",
                feedback: "AI can help; the skill is validating quality and documenting limitations.",
                points: 1,
              },
            ],
          },
          {
            prompt:
              "You used AI to draft a chart narrative for stakeholders. What should you include in the slide notes?",
            options: [
              {
                text: "Nothing — AI wrote it so it's unbiased",
                feedback: "Disclose assistance and what was verified manually.",
                points: 0,
              },
              {
                text: "Note AI assisted the draft, list metrics you verified in source, and flag open questions",
                feedback: "Transparency builds trust and shows professional analyst judgment.",
                points: 3,
              },
              {
                text: "Only the chatbot model name for credit",
                feedback: "Stakeholders need verification steps, not model branding.",
                points: 1,
              },
            ],
          },
        ],
      },
    },
  ],

  "postal-worker": [
    {
      id: "postal-window-transaction",
      title: "Retail Window Transaction",
      description:
        "Process a customer mailing with correct service class, insurance, and postage — clerk window task.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Retail operations",
      content: {
        intakeForm: {
          title: "Window Transaction — Insured Priority",
          brief: "Complete before printing the receipt.",
          scenario: "Customer mailing fragile item, value $200. Wants fastest domestic service with insurance.",
          fields: [
            { id: "class", label: "Service class", type: "select", options: ["Priority Mail Express", "Priority Mail", "First-Class"], expected: "Priority Mail Express" },
            { id: "insurance", label: "Insurance amount", type: "text", expected: "200", hint: "$200" },
            { id: "hazmat", label: "Hazardous materials declared?", type: "select", options: ["No", "Yes — restricted"], expected: "No" },
            { id: "receipt", label: "Tracking receipt given to customer?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "postal-route-intake",
      title: "Carrier Route Sheet",
      description:
        "Review and sign off on route changes before departure — carrier daily prep.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Delivery operations",
      content: {
        intakeForm: {
          title: "Route 2847 — Morning Prep",
          brief: "Verify changes and safety info before leaving the station.",
          scenario: "3 new delivery points added. Dog warning on Maple St. Certified letter requires signature.",
          fields: [
            { id: "new_stops", label: "New delivery points today", type: "text", expected: "3", hint: "3" },
            { id: "hazard", label: "Animal hazard flagged?", type: "select", options: ["Yes — Maple St", "No hazards"], expected: "Yes — Maple St" },
            { id: "certified", label: "Certified/signature items loaded?", type: "select", options: ["Yes", "No — pull from cage"], expected: "Yes" },
            { id: "vehicle", label: "Vehicle inspection completed?", type: "select", options: ["Yes", "No"], expected: "Yes" },
          ],
        },
      },
    },
    {
      id: "postal-parcel-log",
      title: "Parcel Manifest Intake",
      description: "Log incoming parcels with tracking, ZIP, and service class — real clerk paperwork.",
      gameType: "intake-form-workspace",
      duration: "6–10 min",
      domain: "Mail processing",
      content: {
        intakeForm: {
          title: "Incoming Parcel Log — Window 3",
          brief: "Record each piece before it enters the processing stream.",
          scenario: "Priority Express parcel from retail counter — verify label and service.",
          fields: [
            { id: "tracking", label: "Tracking number", type: "text", expected: "9405 5120 9938 4721 5582 63", hint: "9405 5120 9938 4721 5582 63" },
            { id: "zip", label: "Destination ZIP", type: "text", expected: "89101", hint: "89101" },
            { id: "class", label: "Mail class", type: "select", options: ["Priority", "First-Class", "Media Mail"], expected: "Priority" },
            { id: "weight", label: "Weight (lbs)", type: "text", expected: "2.4", hint: "2.4" },
          ],
        },
      },
    },
    {
      id: "postal-typing",
      title: "Address Typing Speed",
      description: "Type addresses and ZIP codes quickly and accurately — absorbed into warm-up/recall on workspace labs.",
      gameType: "typing-drill",
      duration: "5–8 min",
      domain: "Keyboarding",
      content: {
        typing: [
          { text: "742 Evergreen Terrace, Springfield IL 62704", context: "Residential delivery address" },
          { text: "PO Box 1234, Reno NV 89501", context: "PO Box routing" },
          { text: "1600 Pennsylvania Ave NW, Washington DC 20500", context: "High-profile ZIP accuracy" },
        ],
      },
    },
  ],
};

for (const [slug, modules] of Object.entries(CAREER_LAB_TRACKS_EXTENDED)) {
  CAREER_LAB_TRACKS[slug as CareerSkillSlug] = modules;
}
for (const [slug, modules] of Object.entries(CAREER_LAB_TRACKS_TIER1)) {
  CAREER_LAB_TRACKS[slug as CareerSkillSlug] = modules;
}
for (const [slug, modules] of Object.entries(CAREER_LAB_TRACKS_TIER2)) {
  CAREER_LAB_TRACKS[slug as CareerSkillSlug] = modules;
}

export function getCareerLabTrack(
  slug: CareerSkillSlug,
): CareerLabModule[] | undefined {
  const track = CAREER_LAB_TRACKS[slug];
  if (!track || track.length === 0) return undefined;
  const { labs } = rebalanceCareerTrack(track);
  return labs.length > 0 ? labs : undefined;
}

/** Raw track before rebalance (includes scenario drills). */
export function getCareerLabTrackRaw(
  slug: CareerSkillSlug,
): CareerLabModule[] | undefined {
  const track = CAREER_LAB_TRACKS[slug];
  return track && track.length > 0 ? track : undefined;
}

/** Quiz-style modules absorbed into workspace lab prep/recall. */
export function getCareerAbsorbedDrills(
  slug: CareerSkillSlug,
): CareerLabModule[] {
  const track = CAREER_LAB_TRACKS[slug];
  if (!track) return [];
  return rebalanceCareerTrack(track).absorbedDrills;
}
