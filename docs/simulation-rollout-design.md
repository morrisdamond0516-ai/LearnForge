# Simulation rollout design

LearnForge simulation modules combine the best patterns from proven platforms — built in-app, no external links, no per-student VM cost.

## Platforms we learned from

| Platform | What works | What we adopt in LearnForge |
|----------|------------|-----------------------------|
| **PhET** | Manipulate variables; instant visual feedback; inquiry-based | `sim-canvas` sliders, live diagrams (physics, aerospace) |
| **Labster** | Step-level procedural labs; instrumentation; checkpoints | Multi-step workspaces with per-step validation |
| **TestOut LabSim** | Job-realistic tools (terminal, tickets); cert alignment | `terminal-workspace`, cert track links |
| **Gizmos / ExploreLearning** | Graphs update as variables change | Spreadsheet + sim-canvas graph readouts |
| **Khan Academy** | Mastery path + interactive practice before quiz | Curriculum → sim module → quiz (in that order) |

## What we took from Replit's branch (and what we skipped)

| Replit piece | Decision |
|--------------|----------|
| Multi-step lab *concept* | **Keep** — implemented as career/school/subject workspaces |
| Spreadsheet formula grid | **Keep** — simplified, no copy-paste gimmicks |
| 1,700-line `lesson.tsx` | **Skip** — split into `simulation-workspace-engines.tsx` |
| AI-generated lesson per topic | **Skip** — static authored sims + AI quizzes only |
| Piston external code API | **Skip** — in-browser only |
| `lessons` DB table | **Skip** — content in TypeScript catalogs (reliable, versioned) |
| Drag-drop as primary interaction | **Skip** — only where authentic (manipulatives K–2) |

## Engine map (all careers, school levels, subjects)

| Engine | Authentic use |
|--------|----------------|
| `spreadsheet-workspace` | Bookkeeper, bank teller, PM, college, Data Analyst multi-lab track |
| `terminal-workspace` | IT / CompTIA A+ multi-lab tracks (network, DNS, identity, help desk) |
| `patient-chart-workspace` | CNA, medical assistant |
| `jobsite-workspace` | Trades, CDL, HVAC, electrician, fire/EMT, pharmacy math |
| `sim-canvas-workspace` | Physics, aerospace, earth science, circuits |
| `lab-bench-workspace` | Chemistry, biology labs (middle–college) |
| `manipulative-board` | K–2 counting, grouping, early literacy |
| `intake-form-workspace` | Social work, family services, police reports |
| `script-choice` | Negotiation / ethics where conversation *is* the job |
| `typing-drill` | Postal, office (real keyboard work) |

## Curriculum (streamlined)

Each module path:

1. **Simulation** (Games → Career / School / Subject lab)
2. **Practice quiz** (in-app, until ≥80%)
3. **Optional** 0–1 outside resource (no URLs in UI — name only)

External materials are optional and deprioritized. Core advancement = sim + quiz mastery.

## Pricing

No change to customer Stripe plans. Simulations add value on existing Free/Pro/Junior tiers.

## Replit deploy

Branch: `simulation-modules-v2`. After merge:

```bash
git fetch origin && git reset --hard origin/main
pnpm install
pnpm run db:push   # only if schema changed
# Redeploy
```

No new secrets required for simulations.
