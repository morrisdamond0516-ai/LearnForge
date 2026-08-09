/**
 * AI Career Path — learn the AI stack employers hire for in 2026.
 *
 * Foundations (linear) → role tracks (Data, Applied AI, ML, MLOps, Product).
 * Pedagogy: mental model → practice → explain → spaced recall.
 * Honest scope: career judgment + structured drills, not a GPU training cluster.
 */

export type AiRubricItem = {
  id: string;
  label: string;
  patterns: string[];
};

export type AiTeachBlock = {
  idea: string;
  mentalModel: string[];
  workedExample: { title: string; body: string };
  misconception: string;
  jobSignal: string;
};

export type AiPractice =
  | {
      kind: "choice";
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }
  | {
      kind: "prompt-rubric";
      brief: string;
      placeholder: string;
      mustInclude: AiRubricItem[];
      minPassed: number;
    }
  | {
      kind: "sequence";
      prompt: string;
      /** Correct order of step labels */
      correctOrder: string[];
    }
  | {
      kind: "checklist";
      prompt: string;
      items: { id: string; label: string; required: boolean }[];
      minRequired: number;
    }
  | {
      kind: "scenario";
      prompt: string;
      options: { text: string; correct: boolean; feedback: string }[];
    };

export type AiLesson = {
  id: string;
  title: string;
  teach: AiTeachBlock;
  practice: AiPractice;
  concepts: string[];
  reflect: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

export type AiModule = {
  id: string;
  title: string;
  track: "foundation" | "role";
  roleLabel?: string;
  description: string;
  youWillUnderstand: string;
  duration: string;
  masteryRequired: number;
  /** Soft guidance shown in UI (not a hard gate). */
  recommendedAfter?: string[];
  lessons: AiLesson[];
  recall: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};

export const AI_JOB_PATH_MODULES: AiModule[] = [
  {
    id: "ai-systems",
    title: "How AI Systems Really Work",
    track: "foundation",
    description:
      "Separate hype from systems: training vs inference, models vs products, where humans stay in the loop.",
    youWillUnderstand:
      "An AI product is a system (data → model → interface → evaluation), not a magic chatbot.",
    duration: "25–40 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-sys-train-infer",
        title: "Training vs inference",
        concepts: ["training", "inference", "systems"],
        teach: {
          idea: "Training fits a model to data. Inference uses a trained model to answer new inputs.",
          mentalModel: [
            "Training is expensive, offline-ish, and changes model weights.",
            "Inference is the live request path users feel (latency + cost).",
            "Most product bugs are inference/product bugs, not 'the model is sentient'.",
          ],
          workedExample: {
            title: "Support bot",
            body: "You fine-tune or prompt a model once (or periodically). Every customer message is inference — retrieve context, call the model, return an answer, log for eval.",
          },
          misconception:
            "Thinking every user question 'retrains' the model — it usually does not.",
          jobSignal: "AI Engineer and ML roles both expect you to know which side of the line you're on.",
        },
        practice: {
          kind: "choice",
          prompt: "A user asks your app a question and gets an answer in 800ms. What mostly just happened?",
          options: [
            "Full model training from scratch",
            "Inference (and maybe retrieval) on an existing model",
            "The database rewrote the model's weights",
            "A human typed the answer live",
          ],
          correctIndex: 1,
          explanation:
            "Interactive answers are inference. Training is a separate, heavier process.",
        },
        reflect: {
          prompt: "Why does the train/infer split matter for cost?",
          options: [
            "It doesn't",
            "Training and inference have different cost/latency profiles — you optimize them differently",
            "Inference always costs more than training",
            "Only GPUs matter, not the split",
          ],
          correctIndex: 1,
          explanation:
            "Hiring managers want people who can talk about cost and latency on the right side of the system.",
        },
      },
      {
        id: "ai-sys-stack",
        title: "The AI product stack",
        concepts: ["stack", "RAG", "evals"],
        teach: {
          idea: "Shipping AI means stacking pieces: data, model, orchestration, UI, logging, evaluation.",
          mentalModel: [
            "UI collects intent → orchestration builds a prompt/context → model responds → post-process → log.",
            "RAG adds a retrieval step before the model.",
            "Evals measure whether the stack is good enough to ship.",
          ],
          workedExample: {
            title: "Docs Q&A",
            body: "Index docs → embed query → retrieve chunks → prompt LLM with chunks → cite sources → score answers weekly.",
          },
          misconception:
            "Believing 'pick a model' is the whole job — integration and measurement are the job.",
          jobSignal: "Applied AI Engineer roles are mostly this stack, not research papers.",
        },
        practice: {
          kind: "sequence",
          prompt: "Order a minimal docs Q&A request path:",
          correctOrder: [
            "User asks a question",
            "Retrieve relevant document chunks",
            "Build prompt with question + chunks",
            "Call the model (inference)",
            "Return answer with citations + log for eval",
          ],
        },
        reflect: {
          prompt: "Where do most enterprise AI projects fail?",
          options: [
            "Only at picking GPT vs Claude",
            "At data quality, retrieval, evals, and product fit — not model brand alone",
            "Only at CSS",
            "Only when using open source",
          ],
          correctIndex: 1,
          explanation: "The stack around the model decides reliability.",
        },
      },
      {
        id: "ai-sys-roles",
        title: "Who does what on an AI team",
        concepts: ["roles", "careers"],
        teach: {
          idea: "2026 demand splits: Data for AI, Applied AI Engineer, ML Engineer, MLOps, Product — overlapping skills, different primary jobs.",
          mentalModel: [
            "Data: pipelines and trustworthy datasets.",
            "Applied AI: product features with LLMs/RAG/agents.",
            "ML Engineer: train/adapt models and metrics.",
            "MLOps: deploy, monitor, rollback.",
            "Product: problem framing, risk, build-vs-buy.",
          ],
          workedExample: {
            title: "Fraud feature",
            body: "Data engineers feed labeled events → ML trains a model → MLOps serves it → Applied AI may add an LLM explanation layer → Product sets false-positive budget.",
          },
          misconception:
            "Assuming 'Prompt Engineer' is the main career — prompting is table stakes inside broader roles.",
          jobSignal: "Pick a primary track after foundations; learn neighboring skills next.",
        },
        practice: {
          kind: "scenario",
          prompt:
            "A startup wants a chatbot over internal policies next quarter. Who should lead day-to-day build?",
          options: [
            {
              text: "Applied AI Engineer (RAG + evals + API integration)",
              correct: true,
              feedback:
                "Correct — this is classic applied AI product work, with data help for the corpus.",
            },
            {
              text: "Only a research scientist training a foundation model from scratch",
              correct: false,
              feedback:
                "Overkill and too slow. Use an existing model + retrieval first.",
            },
            {
              text: "Only a visual designer with no eval plan",
              correct: false,
              feedback: "UI matters, but reliability needs engineering + measurement.",
            },
            {
              text: "Ignore data cleaning — the model will figure it out",
              correct: false,
              feedback: "Garbage docs → garbage answers. Data quality still matters.",
            },
          ],
        },
        reflect: {
          prompt: "Prompt engineering in 2026 is best treated as…",
          options: [
            "The only AI job worth learning",
            "A core skill inside Applied AI / product work, not usually a standalone career",
            "Useless",
            "Only for artists",
          ],
          correctIndex: 1,
          explanation: "Employers absorbed prompting into broader AI engineering expectations.",
        },
      },
      {
        id: "ai-sys-baseline",
        title: "Always beat a baseline",
        concepts: ["baselines", "measurement"],
        teach: {
          idea: "Before fancy models, define a baseline: rules, search, or a simple model. If AI can't beat it, don't ship complexity.",
          mentalModel: [
            "Baseline = simplest acceptable solution.",
            "Measure AI against that baseline on the same eval set.",
            "Complexity needs a payoff.",
          ],
          workedExample: {
            title: "Ticket routing",
            body: "Keyword rules route 70% correctly. An ML model must clearly beat 70% on a held-out set before replacing rules.",
          },
          misconception: "Shipping the trendiest model without a baseline comparison.",
          jobSignal: "ML and Applied AI interviews love baseline thinking.",
        },
        practice: {
          kind: "choice",
          prompt: "Your LLM demo 'feels smart' but you have no baseline. What next?",
          options: [
            "Ship immediately",
            "Define success metrics and a simple baseline, then compare",
            "Buy more GPUs first",
            "Delete the product",
          ],
          correctIndex: 1,
          explanation: "Measurement before mythology.",
        },
        reflect: {
          prompt: "A baseline exists to…",
          options: [
            "Make charts pretty",
            "Prove the AI approach is worth its complexity and risk",
            "Replace all tests",
            "Avoid talking to users",
          ],
          correctIndex: 1,
          explanation: "This habit separates professionals from demo-chasers.",
        },
      },
    ],
    recall: [
      {
        prompt: "Inference means…",
        options: [
          "Updating model weights on all data",
          "Using a trained model to produce outputs for new inputs",
          "Deleting the dataset",
          "Only batch ETL",
        ],
        correctIndex: 1,
        explanation: "Live answers are inference.",
      },
      {
        prompt: "Which role focuses most on deploy/monitor/rollback for models?",
        options: ["UI designer", "MLOps", "Copywriter", "Only legal"],
        correctIndex: 1,
        explanation: "MLOps owns production reliability.",
      },
    ],
  },
  {
    id: "ai-python",
    title: "Python Literacy for AI Work",
    track: "foundation",
    description:
      "Python shows up in most AI job posts — enough fluency to read pipelines, notebooks, and glue code.",
    youWillUnderstand:
      "AI work is data-in / data-out: lists, dicts, functions, and clear shapes beat clever one-liners.",
    duration: "25–40 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-py-shapes",
        title: "Think in data shapes",
        concepts: ["lists", "dicts", "schemas"],
        teach: {
          idea: "Models and APIs expect structured inputs. Knowing shapes prevents silent bugs.",
          mentalModel: [
            "Tabular row ≈ dict of column → value.",
            "Batch ≈ list of rows.",
            "Nested JSON is dicts inside dicts — know the path.",
          ],
          workedExample: {
            title: "Chat message",
            body: `{ "role": "user", "content": "Hello" } — a dict the API understands.`,
          },
          misconception: "Treating all data as one giant string forever.",
          jobSignal: "Data + Applied AI work is mostly shaping data correctly.",
        },
        practice: {
          kind: "choice",
          prompt: "You need 100 examples of {text, label}. Best in-memory shape?",
          options: [
            "One long string with commas",
            "A list of dicts with text and label keys",
            "A single integer",
            "A CSS file",
          ],
          correctIndex: 1,
          explanation: "List[dict] maps cleanly to datasets and DataFrames.",
        },
        reflect: {
          prompt: "Why care about schema before training or RAG?",
          options: [
            "Schemas are optional decoration",
            "Mismatched shapes cause silent failures and bad metrics",
            "Only SQL needs schemas",
            "LLMs ignore structure always",
          ],
          correctIndex: 1,
          explanation: "Shape bugs waste weeks.",
        },
      },
      {
        id: "ai-py-functions",
        title: "Pure helpers you can test",
        concepts: ["functions", "testing"],
        teach: {
          idea: "Wrap cleaning and prompting steps in small functions with clear inputs/outputs.",
          mentalModel: [
            "One job per function.",
            "Return values > hidden globals.",
            "Test helpers without calling the paid API every time.",
          ],
          workedExample: {
            title: "normalize_email",
            body: "strip + lower → predictable emails for joins and dedupe.",
          },
          misconception: "One 400-line notebook cell that 'just runs'.",
          jobSignal: "MLOps and ML engineers inherit your functions — make them boringly clear.",
        },
        practice: {
          kind: "sequence",
          prompt: "Order a clean AI glue-code habit:",
          correctOrder: [
            "Write a small pure function for one transform",
            "Add a couple of example assertions / tests",
            "Call it from the pipeline or notebook",
            "Only then wire the external model API",
          ],
        },
        reflect: {
          prompt: "Why test transforms without calling the LLM?",
          options: [
            "LLMs cannot be called from Python",
            "Deterministic helpers should be cheap to verify; model calls are slow/costly/noisy",
            "Tests are illegal in AI",
            "Notebooks forbid functions",
          ],
          correctIndex: 1,
          explanation: "Separate deterministic code from stochastic model calls.",
        },
      },
      {
        id: "ai-py-batch",
        title: "Batch vs one-at-a-time",
        concepts: ["batching", "cost"],
        teach: {
          idea: "Production systems process batches for throughput; demos often hide that.",
          mentalModel: [
            "Looping row-by-row is simple but can be slow/expensive.",
            "Batch APIs and vectorized ops cut overhead.",
            "Know when to batch vs stream.",
          ],
          workedExample: {
            title: "Embeddings",
            body: "Embed 1,000 chunks in batches of 100 instead of 1,000 separate calls.",
          },
          misconception: "Copying the demo loop into production unchanged.",
          jobSignal: "Cost control is a hiring signal for Applied AI and MLOps.",
        },
        practice: {
          kind: "scenario",
          prompt: "Embedding 50k document chunks tonight. Best first move?",
          options: [
            {
              text: "Batch requests, track failures, resume safely",
              correct: true,
              feedback: "Correct — batching + checkpointing is production thinking.",
            },
            {
              text: "Click run on 50k individual calls with no logging",
              correct: false,
              feedback: "Fragile and expensive.",
            },
            {
              text: "Skip embeddings and hope keyword search is enough without measuring",
              correct: false,
              feedback: "Maybe a baseline — but measure; don't hope.",
            },
            {
              text: "Train a new foundation model first",
              correct: false,
              feedback: "Wrong scale of solution.",
            },
          ],
        },
        reflect: {
          prompt: "Batching primarily helps…",
          options: [
            "Make prompts longer for fun",
            "Improve throughput and reduce per-call overhead/cost",
            "Delete evaluation",
            "Avoid Python",
          ],
          correctIndex: 1,
          explanation: "Efficiency is part of professional AI work.",
        },
      },
      {
        id: "ai-py-errors",
        title: "Fail loudly on bad data",
        concepts: ["validation", "errors"],
        teach: {
          idea: "Validate early. Bad rows should raise clear errors or quarantine — not poison training.",
          mentalModel: [
            "Check required fields and types at the boundary.",
            "Log rejects with reasons.",
            "Never silently coerce nonsense into 'success'.",
          ],
          workedExample: {
            title: "Label check",
            body: "If label not in {ham, spam}, reject the row before training.",
          },
          misconception: "Filling nulls with random defaults to 'keep the pipeline green'.",
          jobSignal: "Data-for-AI and ML roles live or die on this discipline.",
        },
        practice: {
          kind: "choice",
          prompt: "10% of labels are empty in a classification dataset. Best default?",
          options: [
            "Train anyway and hope",
            "Quarantine/fix those rows; fix upstream; don't pretend they're valid",
            "Replace all labels with 'unknown' and call accuracy 100%",
            "Delete the feature store permanently",
          ],
          correctIndex: 1,
          explanation: "Protect the training signal.",
        },
        reflect: {
          prompt: "Silent bad-data coercion is dangerous because…",
          options: [
            "It makes CI slower",
            "It teaches the model (and your metrics) lies",
            "Python cannot handle errors",
            "Cloud bills go down",
          ],
          correctIndex: 1,
          explanation: "Garbage in, confident garbage out.",
        },
      },
    ],
    recall: [
      {
        prompt: "A common in-memory shape for labeled text is…",
        options: ["list of dicts", "a single boolean", "CSS grid", "an MP3"],
        correctIndex: 0,
        explanation: "Rows as dicts are the lingua franca.",
      },
      {
        prompt: "Validate data…",
        options: [
          "Only after the CEO demos",
          "At boundaries before training/indexing",
          "Never",
          "Only in PowerPoint",
        ],
        correctIndex: 1,
        explanation: "Early validation saves model thrash.",
      },
    ],
  },
  {
    id: "ai-data-quality",
    title: "Data Quality & Leakage",
    track: "foundation",
    description:
      "Models mirror their data. Leakage and silent skew create fake metrics and real failures.",
    youWillUnderstand:
      "If test data leaks into training, your metrics lie — and production will expose you.",
    duration: "25–40 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-dq-leakage",
        title: "What data leakage is",
        concepts: ["leakage", "splits"],
        teach: {
          idea: "Leakage means information from the future or the test set sneaks into training.",
          mentalModel: [
            "Train on past → evaluate on future-like held-out data.",
            "IDs, timestamps, and duplicates are common leak paths.",
            "If score is 'too good', suspect leakage.",
          ],
          workedExample: {
            title: "Same chat in train and test",
            body: "Near-duplicate tickets in both sets inflate accuracy; production users look different.",
          },
          misconception: "Random split always safe — not when duplicates or time ordering matter.",
          jobSignal: "Top interview filter for ML and Data-for-AI.",
        },
        practice: {
          kind: "scenario",
          prompt: "Accuracy jumps to 99% overnight after you 'cleaned' data. First suspicion?",
          options: [
            {
              text: "Possible leakage or duplicates across train/test — investigate before celebrating",
              correct: true,
              feedback: "Correct — miraculous scores deserve paranoia.",
            },
            {
              text: "Ship to all customers today",
              correct: false,
              feedback: "Celebrate after proving the split is clean.",
            },
            {
              text: "Delete monitoring",
              correct: false,
              feedback: "Opposite of responsible ML.",
            },
            {
              text: "Accuracy cannot be wrong",
              correct: false,
              feedback: "Metrics lie when data lies.",
            },
          ],
        },
        reflect: {
          prompt: "Time-based problems should usually split by…",
          options: [
            "Random rows only",
            "Time (train earlier, test later)",
            "Alphabetical customer names",
            "File size",
          ],
          correctIndex: 1,
          explanation: "Respect causality.",
        },
      },
      {
        id: "ai-dq-splits",
        title: "Train / validation / test",
        concepts: ["validation", "test set"],
        teach: {
          idea: "Train fits. Validation tunes choices. Test is the final honest exam — touch sparingly.",
          mentalModel: [
            "Validation guides hyperparameters / prompts / thresholds.",
            "Test estimates real-world performance once.",
            "Repeated peeking at test = leakage of a different kind.",
          ],
          workedExample: {
            title: "Threshold tuning",
            body: "Pick spam threshold on validation F1; report final number on test once.",
          },
          misconception: "Tuning directly on the test set until it looks good.",
          jobSignal: "ML Engineer bread and butter.",
        },
        practice: {
          kind: "sequence",
          prompt: "Order honest model development:",
          correctOrder: [
            "Create train / validation / test splits",
            "Train candidates on train",
            "Compare and tune using validation",
            "Report final performance on test once",
          ],
        },
        reflect: {
          prompt: "The test set is for…",
          options: [
            "Daily hyperparameter search",
            "A final unbiased estimate after you stop tuning",
            "Training the largest model",
            "Storing passwords",
          ],
          correctIndex: 1,
          explanation: "Keep the exam sealed.",
        },
      },
      {
        id: "ai-dq-skew",
        title: "Skew and representativeness",
        concepts: ["bias", "coverage"],
        teach: {
          idea: "If production traffic differs from training data, metrics won't transfer.",
          mentalModel: [
            "Check who/what is missing in the dataset.",
            "Monitor input drift after launch.",
            "Rebalance or recollect when skew is real.",
          ],
          workedExample: {
            title: "Accent gap",
            body: "Voice model trained on one region fails elsewhere — coverage problem, not 'users are wrong'.",
          },
          misconception: "More rows always fixes bias — more of the same skew doesn't.",
          jobSignal: "Ethics + MLOps + Product all care about this.",
        },
        practice: {
          kind: "checklist",
          prompt: "Before training a hiring-screen classifier, which checks are required?",
          minRequired: 3,
          items: [
            { id: "cov", label: "Check demographic / segment coverage gaps", required: true },
            { id: "lab", label: "Audit label definitions and disagreement", required: true },
            { id: "leak", label: "Screen for leakage (proxy features, IDs)", required: true },
            { id: "ship", label: "Skip docs and ship to all managers", required: false },
            { id: "hide", label: "Hide failure cases from legal", required: false },
          ],
        },
        reflect: {
          prompt: "Representativeness means…",
          options: [
            "The dataset looks like the real users/cases you will serve",
            "The file is large",
            "Accuracy is 100%",
            "You used GPUs",
          ],
          correctIndex: 0,
          explanation: "Coverage beats vanity row counts.",
        },
      },
      {
        id: "ai-dq-labels",
        title: "Labels are decisions",
        concepts: ["labeling", "guidelines"],
        teach: {
          idea: "Labels encode a human policy. Ambiguous guidelines → noisy model.",
          mentalModel: [
            "Write a labeling guide with examples.",
            "Measure annotator agreement.",
            "Revise labels when policy changes.",
          ],
          workedExample: {
            title: "Toxicity",
            body: "Without a guide, annotators disagree on edge jokes — model learns confusion.",
          },
          misconception: "Labels are objective ground truth with no policy behind them.",
          jobSignal: "Data-for-AI and Applied AI both write guidelines.",
        },
        practice: {
          kind: "choice",
          prompt: "Two annotators disagree on 30% of items. Best next step?",
          options: [
            "Average randomly and move on",
            "Improve guidelines, adjudicate hard cases, measure agreement again",
            "Triple model size",
            "Remove the test set",
          ],
          correctIndex: 1,
          explanation: "Fix the signal before fitting noise.",
        },
        reflect: {
          prompt: "A labeling guide exists to…",
          options: [
            "Make PDF attachments",
            "Turn a fuzzy policy into consistent training signal",
            "Replace evaluation",
            "Avoid stakeholders",
          ],
          correctIndex: 1,
          explanation: "Consistency is a product decision.",
        },
      },
    ],
    recall: [
      {
        prompt: "Data leakage makes metrics…",
        options: [
          "Look better than production will",
          "Always lower",
          "Irrelevant to ML",
          "Only affect CSS",
        ],
        correctIndex: 0,
        explanation: "Optimistic lies.",
      },
      {
        prompt: "Tune thresholds on…",
        options: ["Test only", "Validation", "Production users with no logging", "Random.org"],
        correctIndex: 1,
        explanation: "Keep test honest.",
      },
    ],
  },
  {
    id: "ai-prompting",
    title: "Prompting That Holds Up",
    track: "foundation",
    description:
      "Prompting is table stakes — write specs the model can follow under messy real inputs.",
    youWillUnderstand:
      "A good prompt states role, task, constraints, output format, and failure behavior.",
    duration: "30–45 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-pr-spec",
        title: "Prompt as a spec",
        concepts: ["prompting", "specs"],
        teach: {
          idea: "Treat prompts like function contracts: inputs, rules, output shape.",
          mentalModel: [
            "Role + task + constraints + format.",
            "Include edge-case instructions.",
            "Ask for structured output when a system will parse it.",
          ],
          workedExample: {
            title: "JSON extractor",
            body: "Return only JSON with keys date, amount, vendor. If missing, nulls — never invent.",
          },
          misconception: "One vague sentence ('summarize this') for a production path.",
          jobSignal: "Every Applied AI job assumes this skill.",
        },
        practice: {
          kind: "prompt-rubric",
          brief:
            "Write a prompt that extracts invoice fields for software. Require JSON keys date, amount, vendor; forbid inventing values.",
          placeholder:
            "You are… Task… Constraints… Output format… If unsure…",
          minPassed: 4,
          mustInclude: [
            { id: "role", label: "Role or clear task framing", patterns: ["you are", "extract", "task"] },
            { id: "keys", label: "Mentions date/amount/vendor", patterns: ["date", "amount", "vendor"] },
            { id: "json", label: "JSON / structured output", patterns: ["json", "keys", "schema"] },
            { id: "noinvent", label: "Don't invent / use null if missing", patterns: ["null", "missing", "invent", "unsure", "unknown"] },
            { id: "only", label: "Output-only / no chatter", patterns: ["only", "just json", "no markdown", "do not"] },
          ],
        },
        reflect: {
          prompt: "Structured output helps because…",
          options: [
            "Models hate JSON",
            "Downstream code can parse reliably",
            "It removes the need for tests",
            "It makes prompts shorter always",
          ],
          correctIndex: 1,
          explanation: "Production needs parseable contracts.",
        },
      },
      {
        id: "ai-pr-constraints",
        title: "Constraints beat vibes",
        concepts: ["constraints", "safety"],
        teach: {
          idea: "Say what not to do: no medical advice, no secrets, no unsupported claims.",
          mentalModel: [
            "Positive instructions + negative constraints.",
            "Escalation path: 'say you don't know / hand off'.",
            "Constraints are product policy in prompt form.",
          ],
          workedExample: {
            title: "HR bot",
            body: "Answer only from the policy handbook. If not in handbook, say so and link HR ticket form.",
          },
          misconception: "Hoping the model 'will be careful' without stating rules.",
          jobSignal: "Safety + Applied AI overlap here.",
        },
        practice: {
          kind: "prompt-rubric",
          brief:
            "Write a policy-bot prompt: answer only from provided handbook context; if missing, refuse and direct to HR; no legal advice.",
          placeholder: "Role, allowed sources, refusal behavior, tone…",
          minPassed: 3,
          mustInclude: [
            { id: "source", label: "Only use provided / handbook context", patterns: ["handbook", "provided", "context", "only from", "sources"] },
            { id: "refuse", label: "Refuse / say when unknown", patterns: ["if not", "don't know", "unknown", "refuse", "cannot find", "missing"] },
            { id: "hr", label: "Escalate to HR / human", patterns: ["hr", "human", "ticket", "escalate", "contact"] },
            { id: "legal", label: "No legal advice", patterns: ["legal", "not a lawyer", "no legal"] },
          ],
        },
        reflect: {
          prompt: "Refusal behavior belongs in the prompt because…",
          options: [
            "It pads tokens",
            "It encodes product policy when information is missing or disallowed",
            "Models never hallucinate",
            "HR forbids prompts",
          ],
          correctIndex: 1,
          explanation: "Policy must be explicit.",
        },
      },
      {
        id: "ai-pr-eval",
        title: "Prompt changes need evals",
        concepts: ["evals", "regression"],
        teach: {
          idea: "Changing a prompt is a code change. Keep a golden set of cases and re-run them.",
          mentalModel: [
            "Save inputs + expected properties.",
            "Score after each prompt edit.",
            "Watch for regressions on old cases.",
          ],
          workedExample: {
            title: "Golden set",
            body: "30 tickets: must extract amount correctly; must refuse medical advice — CI runs them.",
          },
          misconception: "Tweaking prompts based only on one chat vibe.",
          jobSignal: "Evals are a 2026 differentiator in job posts.",
        },
        practice: {
          kind: "choice",
          prompt: "You 'improved' a prompt and the demo looks nicer. Ship?",
          options: [
            "Yes, demos never lie",
            "Re-run the golden eval set and compare scores first",
            "Delete the golden set so nothing fails",
            "Only ask the model if it feels better",
          ],
          correctIndex: 1,
          explanation: "Prompt ops without evals is gambling.",
        },
        reflect: {
          prompt: "A golden set is…",
          options: [
            "Production user PII stored in Slack",
            "A fixed suite of examples used to catch regressions",
            "A type of GPU",
            "A marketing slide",
          ],
          correctIndex: 1,
          explanation: "Regression tests for AI behavior.",
        },
      },
      {
        id: "ai-pr-decompose",
        title: "Decompose hard tasks",
        concepts: ["decomposition", "agents"],
        teach: {
          idea: "Split complex jobs: extract → verify → format. Multi-step beats one mega-prompt.",
          mentalModel: [
            "Each step has a clearer contract.",
            "You can eval steps separately.",
            "Tool-calling agents are structured decomposition.",
          ],
          workedExample: {
            title: "Research brief",
            body: "Step1 retrieve sources → Step2 outline → Step3 write → Step4 fact-check claims.",
          },
          misconception: "One giant prompt with 40 rules always works better.",
          jobSignal: "Agent frameworks are applied decomposition.",
        },
        practice: {
          kind: "sequence",
          prompt: "Order a safer multi-step research flow:",
          correctOrder: [
            "Retrieve relevant sources",
            "Draft outline from sources",
            "Write the answer with citations",
            "Check claims against sources before shipping",
          ],
        },
        reflect: {
          prompt: "Why decompose?",
          options: [
            "To use more emojis",
            "Clearer contracts, easier evals, fewer tangled failures",
            "To avoid APIs",
            "Because models hate steps",
          ],
          correctIndex: 1,
          explanation: "Structure is reliability.",
        },
      },
    ],
    recall: [
      {
        prompt: "Production prompts should usually specify…",
        options: [
          "Only the model brand",
          "Task, constraints, and output format",
          "Nothing — vibes",
          "Only the temperature meme",
        ],
        correctIndex: 1,
        explanation: "Contracts > vibes.",
      },
      {
        prompt: "After editing a prompt you should…",
        options: [
          "Ship untested",
          "Re-run evals / golden cases",
          "Turn off logging",
          "Remove constraints",
        ],
        correctIndex: 1,
        explanation: "Treat prompts like code.",
      },
    ],
  },
  {
    id: "ai-evals",
    title: "Evaluation & Metrics",
    track: "foundation",
    description:
      "If you cannot measure quality, you cannot ship safely — or improve.",
    youWillUnderstand:
      "Pick metrics that match the product cost of errors; offline and online evals answer different questions.",
    duration: "30–45 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-ev-precision",
        title: "Precision vs recall",
        concepts: ["precision", "recall"],
        teach: {
          idea: "Precision: of predicted positives, how many correct? Recall: of real positives, how many found?",
          mentalModel: [
            "High precision → fewer false alarms.",
            "High recall → fewer misses.",
            "Product decides which error hurts more.",
          ],
          workedExample: {
            title: "Cancer screening vs spam",
            body: "Medical screening often needs high recall; spam filters often need high precision to avoid blocking real mail.",
          },
          misconception: "Always maximize accuracy alone on imbalanced data.",
          jobSignal: "ML Engineer interviews grill this.",
        },
        practice: {
          kind: "choice",
          prompt: "Fraud alerts overwhelm analysts (too many false alarms). What do you raise?",
          options: [
            "Recall only, ignore precision",
            "Precision (and tune threshold) so alerts are more trustworthy",
            "Delete the test set",
            "Accuracy on a 99% non-fraud set without checking",
          ],
          correctIndex: 1,
          explanation: "False alarms are a precision problem for the ops team.",
        },
        reflect: {
          prompt: "Imbalanced classes make raw accuracy…",
          options: [
            "Always perfect",
            "Often misleading",
            "Illegal",
            "The only metric allowed",
          ],
          correctIndex: 1,
          explanation: "Predicting the majority class looks 'accurate' and useless.",
        },
      },
      {
        id: "ai-ev-offline-online",
        title: "Offline vs online evals",
        concepts: ["offline eval", "online metrics"],
        teach: {
          idea: "Offline: curated sets before launch. Online: live user/business metrics after launch.",
          mentalModel: [
            "Offline catches obvious regressions fast.",
            "Online reveals real behavior and drift.",
            "You need both.",
          ],
          workedExample: {
            title: "Assistant",
            body: "Offline: rubric on 200 tasks. Online: resolution rate, escalations, CSAT, cost/request.",
          },
          misconception: "Only watching vibe demos in Slack.",
          jobSignal: "Applied AI + MLOps share this loop.",
        },
        practice: {
          kind: "checklist",
          prompt: "Minimum eval harness for an LLM feature:",
          minRequired: 3,
          items: [
            { id: "gold", label: "Golden/offline set with scorers", required: true },
            { id: "log", label: "Production logging of inputs/outputs (privacy-safe)", required: true },
            { id: "online", label: "Online quality or business metric", required: true },
            { id: "ignore", label: "No monitoring after launch", required: false },
            { id: "pii", label: "Log raw secrets and passwords forever", required: false },
          ],
        },
        reflect: {
          prompt: "Offline evals alone are not enough because…",
          options: [
            "They are illegal",
            "Real traffic drifts and users behave differently than the curated set",
            "GPUs cannot run them",
            "Product managers forbid metrics",
          ],
          correctIndex: 1,
          explanation: "Production is the final exam that never ends.",
        },
      },
      {
        id: "ai-ev-llm-judge",
        title: "LLM-as-judge pitfalls",
        concepts: ["llm-as-judge", "bias"],
        teach: {
          idea: "Using an LLM to score another LLM is useful — and biased. Calibrate against humans.",
          mentalModel: [
            "Judges can drift and play favorites.",
            "Spot-check with humans.",
            "Prefer objective checks when possible (exact match, JSON schema, retrieval hit rate).",
          ],
          workedExample: {
            title: "Mixed scorers",
            body: "Schema validity automatic; tone judged by LLM; 5% human audit weekly.",
          },
          misconception: "LLM judge score = absolute truth.",
          jobSignal: "Strong Applied AI signal in 2026 postings.",
        },
        practice: {
          kind: "scenario",
          prompt: "LLM-as-judge says 95% good, users complain. What now?",
          options: [
            {
              text: "Audit with humans, add objective checks, distrust judge-only metrics",
              correct: true,
              feedback: "Correct — calibrate and diversify metrics.",
            },
            {
              text: "Trust the judge forever",
              correct: false,
              feedback: "Judges fail silently.",
            },
            {
              text: "Remove all evals",
              correct: false,
              feedback: "Worse.",
            },
            {
              text: "Only increase temperature",
              correct: false,
              feedback: "Not a measurement strategy.",
            },
          ],
        },
        reflect: {
          prompt: "Best practice with LLM judges?",
          options: [
            "Never use humans again",
            "Calibrate against human review and prefer objective checks when possible",
            "Use judges to store passwords",
            "Only judge on training data",
          ],
          correctIndex: 1,
          explanation: "Judges are tools, not oracles.",
        },
      },
      {
        id: "ai-ev-error-analysis",
        title: "Error analysis > vanity scores",
        concepts: ["error analysis"],
        teach: {
          idea: "Read failures. Cluster them. Fix the biggest bucket first.",
          mentalModel: [
            "Sample false positives/negatives.",
            "Tag failure modes.",
            "Prioritize by user impact × frequency.",
          ],
          workedExample: {
            title: "RAG misses",
            body: "40% failures = retrieval miss → improve chunking before changing the LLM.",
          },
          misconception: "Only chasing a single leaderboard number.",
          jobSignal: "Seniors do error analysis habitually.",
        },
        practice: {
          kind: "choice",
          prompt: "Most failures are retrieval misses. Best investment?",
          options: [
            "Buy a bigger LLM only",
            "Improve retrieval/chunking/indexing first",
            "Remove citations",
            "Stop logging errors",
          ],
          correctIndex: 1,
          explanation: "Fix the dominant failure mode.",
        },
        reflect: {
          prompt: "Error analysis helps you…",
          options: [
            "Avoid users",
            "Target the highest-impact failure modes instead of random tweaks",
            "Delete metrics",
            "Skip baselines",
          ],
          correctIndex: 1,
          explanation: "Diagnosis before treatment.",
        },
      },
    ],
    recall: [
      {
        prompt: "High precision means…",
        options: [
          "Few false positives among predicted positives",
          "You found every positive case",
          "The dataset is huge",
          "Latency is low",
        ],
        correctIndex: 0,
        explanation: "Precision = trustworthiness of positive calls.",
      },
      {
        prompt: "Online metrics measure…",
        options: [
          "Only PDF page count",
          "Live user/business outcomes after launch",
          "GPU temperature alone",
          "Nothing useful",
        ],
        correctIndex: 1,
        explanation: "The real world scores you continuously.",
      },
    ],
  },
  {
    id: "ai-safety",
    title: "Safety, Privacy & Responsibility",
    track: "foundation",
    description:
      "Ship AI without wrecking trust — privacy, misuse, and clear human oversight.",
    youWillUnderstand:
      "Responsible AI is operational: data minimization, access control, refusals, and audit trails.",
    duration: "25–40 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-sf-privacy",
        title: "Minimize sensitive data",
        concepts: ["privacy", "PII"],
        teach: {
          idea: "Don't send secrets to models unless necessary. Redact. Control retention.",
          mentalModel: [
            "Collect least data needed.",
            "Mask PII before logging/prompts when possible.",
            "Know vendor data use policies.",
          ],
          workedExample: {
            title: "Support logs",
            body: "Replace SSNs with tokens before LLM analysis; restrict who can view raw logs.",
          },
          misconception: "Pasting production databases into a public chatbot for speed.",
          jobSignal: "Every serious AI job touches privacy constraints.",
        },
        practice: {
          kind: "scenario",
          prompt: "Engineer wants to paste a live customer DB dump into a public LLM to 'debug faster'.",
          options: [
            {
              text: "Stop — redact/minimize, use approved tools, follow policy",
              correct: true,
              feedback: "Correct — speed doesn't override privacy.",
            },
            {
              text: "Paste everything; delete the chat later",
              correct: false,
              feedback: "Data may already be retained/trained on — still a breach risk.",
            },
            {
              text: "Only paste passwords, not emails",
              correct: false,
              feedback: "Worse.",
            },
            {
              text: "Privacy only applies to photos",
              correct: false,
              feedback: "PII is broader.",
            },
          ],
        },
        reflect: {
          prompt: "Data minimization means…",
          options: [
            "Collect and log everything forever",
            "Use only what you need for the task, with retention limits",
            "Never use cloud",
            "Avoid evaluation",
          ],
          correctIndex: 1,
          explanation: "Least privilege for data.",
        },
      },
      {
        id: "ai-sf-human",
        title: "Human oversight for high stakes",
        concepts: ["human-in-the-loop"],
        teach: {
          idea: "High-stakes actions need human approval gates — AI suggests, humans decide.",
          mentalModel: [
            "Risk ∝ impact × uncertainty.",
            "Auto-send low risk; review high risk.",
            "Show uncertainty and sources.",
          ],
          workedExample: {
            title: "Refunds",
            body: "Bot drafts refund rationale; agent approves over $50.",
          },
          misconception: "Full autonomy everywhere on day one.",
          jobSignal: "Product + Applied AI design these gates together.",
        },
        practice: {
          kind: "choice",
          prompt: "AI drafts clinical advice for patients. Best launch pattern?",
          options: [
            "Fully automatic answers with no clinician",
            "Clinician-in-the-loop; clear 'not a diagnosis' boundaries; audit",
            "Hide uncertainty",
            "Train on illicit health records scraped from forums",
          ],
          correctIndex: 1,
          explanation: "Health is high stakes — oversight is mandatory.",
        },
        reflect: {
          prompt: "Human-in-the-loop is most critical when…",
          options: [
            "Errors are cheap and reversible",
            "Errors can seriously harm people or rights",
            "The UI is blue",
            "The model is open source",
          ],
          correctIndex: 1,
          explanation: "Match oversight to impact.",
        },
      },
      {
        id: "ai-sf-misuse",
        title: "Misuse and dual use",
        concepts: ["misuse", "policy"],
        teach: {
          idea: "Attackers will try jailbreaks and abuse. Plan refusals and rate limits.",
          mentalModel: [
            "Threat-model your feature.",
            "Refuse disallowed categories.",
            "Monitor for abuse patterns.",
          ],
          workedExample: {
            title: "Code assistant",
            body: "Allow learning malware defense at high level; block actionable exploit requests per policy.",
          },
          misconception: "Security is 'someone else's job' after launch.",
          jobSignal: "Pairs with cybersecurity literacy on AI teams.",
        },
        practice: {
          kind: "checklist",
          prompt: "Launch checklist for a public LLM feature:",
          minRequired: 3,
          items: [
            { id: "policy", label: "Disallowed-use policy + refusals", required: true },
            { id: "rate", label: "Rate limits / abuse monitoring", required: true },
            { id: "audit", label: "Audit logging for safety incidents", required: true },
            { id: "open", label: "No auth, unlimited, unlogged access to internals", required: false },
            { id: "jail", label: "Ignore jailbreaks on purpose", required: false },
          ],
        },
        reflect: {
          prompt: "Threat modeling AI features means…",
          options: [
            "Only drawing architecture diagrams",
            "Asking how the feature could be abused and designing controls",
            "Skipping security review",
            "Using Comic Sans",
          ],
          correctIndex: 1,
          explanation: "Anticipate misuse.",
        },
      },
      {
        id: "ai-sf-transparency",
        title: "Say what the system is",
        concepts: ["transparency"],
        teach: {
          idea: "Users should know they're interacting with AI and what it can/can't do.",
          mentalModel: [
            "Disclose AI involvement when it matters.",
            "Provide escalation to humans.",
            "Don't pretend certainty you don't have.",
          ],
          workedExample: {
            title: "Banking chat",
            body: "Banner: 'AI assistant — may err. Verify numbers. Talk to a banker.'",
          },
          misconception: "Dark patterns that hide automation to increase trust.",
          jobSignal: "AI Product judgment skill.",
        },
        practice: {
          kind: "choice",
          prompt: "Best transparency practice?",
          options: [
            "Never mention AI",
            "Disclose AI use, limits, and how to reach a human when stakes warrant",
            "Claim 100% accuracy",
            "Hide citations always",
          ],
          correctIndex: 1,
          explanation: "Trust is designed.",
        },
        reflect: {
          prompt: "Transparency primarily protects…",
          options: [
            "Only the model vendor",
            "Users making informed decisions + your organization from false confidence",
            "CSS animations",
            "GPU fans",
          ],
          correctIndex: 1,
          explanation: "Honest systems age better.",
        },
      },
    ],
    recall: [
      {
        prompt: "Pasting production PII into a public LLM is…",
        options: [
          "A best practice",
          "A serious privacy risk",
          "Required for training",
          "Fine if you use emojis",
        ],
        correctIndex: 1,
        explanation: "Never casually exfiltrate sensitive data.",
      },
      {
        prompt: "High-stakes AI actions should include…",
        options: [
          "No logging",
          "Human oversight appropriate to risk",
          "Automatic secrecy from compliance",
          "Only bigger models",
        ],
        correctIndex: 1,
        explanation: "Match controls to harm potential.",
      },
    ],
  },
  {
    id: "ai-data-role",
    title: "Data for AI",
    track: "role",
    roleLabel: "Data Engineer / Data for AI",
    description:
      "The #1 recruiter-demand backbone: pipelines, schemas, and trustworthy datasets for every AI workflow.",
    youWillUnderstand:
      "AI quality starts upstream — reliable pipelines, clear schemas, and split-aware datasets.",
    duration: "35–50 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-da-pipeline",
        title: "Pipeline thinking",
        concepts: ["ETL", "pipelines"],
        teach: {
          idea: "Extract → validate → transform → load to a training/feature store with observability.",
          mentalModel: [
            "Each stage has contracts.",
            "Failures should alert, not silently empty tables.",
            "Idempotency matters for retries.",
          ],
          workedExample: {
            title: "Daily events",
            body: "Pull events → schema check → dedupe → write partitioned parquet → announce dataset version.",
          },
          misconception: "Manual CSV emails as a production ML source of truth.",
          jobSignal: "Data Engineer tops many 2026 AI-adjacent demand lists.",
        },
        practice: {
          kind: "sequence",
          prompt: "Order a responsible daily ML data job:",
          correctOrder: [
            "Extract new/changed records",
            "Validate schema and required fields",
            "Transform / dedupe / join",
            "Load versioned dataset + emit success metrics",
          ],
        },
        reflect: {
          prompt: "Dataset versioning helps you…",
          options: [
            "Avoid Git",
            "Reproduce training and roll back bad data",
            "Hide errors",
            "Skip validation",
          ],
          correctIndex: 1,
          explanation: "Reproducibility is a data job.",
        },
      },
      {
        id: "ai-da-features",
        title: "Feature pitfalls",
        concepts: ["features", "leakage"],
        teach: {
          idea: "Features must be available at prediction time — no future labels disguised as inputs.",
          mentalModel: [
            "Ask: would I know this value at score-time?",
            "Beware aggregates that include the target period.",
            "Document feature freshness.",
          ],
          workedExample: {
            title: "Churn",
            body: "Using 'canceled_at' as an input to predict cancellation is leakage.",
          },
          misconception: "Any correlated column is a fair feature.",
          jobSignal: "Classic ML interview landmine.",
        },
        practice: {
          kind: "choice",
          prompt: "Predicting hospital readmission — which feature is suspicious?",
          options: [
            "Vitals from the first 6 hours after admission",
            "Whether a readmission label was later filed (future info)",
            "Age at admission",
            "Admit department",
          ],
          correctIndex: 1,
          explanation: "Future labels cannot be inputs.",
        },
        reflect: {
          prompt: "A valid feature must be…",
          options: [
            "Known at prediction time without peeking at the future",
            "Any column in the warehouse",
            "Always a string",
            "Stored in the prompt only",
          ],
          correctIndex: 0,
          explanation: "Score-time availability is the rule.",
        },
      },
      {
        id: "ai-da-quality-gates",
        title: "Data quality gates",
        concepts: ["DQ gates"],
        teach: {
          idea: "Block training/deploy if null rates, drift, or volume look wrong.",
          mentalModel: [
            "Define thresholds.",
            "Fail the job on breach.",
            "Page owners when gates fail.",
          ],
          workedExample: {
            title: "Null spike",
            body: "If label nulls > 2%, stop the train job and alert data on-call.",
          },
          misconception: "Always train on whatever arrived.",
          jobSignal: "MLOps + Data partnership.",
        },
        practice: {
          kind: "checklist",
          prompt: "Quality gates before training:",
          minRequired: 3,
          items: [
            { id: "vol", label: "Row volume within expected range", required: true },
            { id: "null", label: "Null-rate thresholds on critical columns", required: true },
            { id: "dup", label: "Duplicate key checks", required: true },
            { id: "yolo", label: "Train even if yesterday's job failed silently", required: false },
            { id: "mix", label: "Mix train and test into one file for convenience", required: false },
          ],
        },
        reflect: {
          prompt: "A quality gate should…",
          options: [
            "Only log a smiley face",
            "Stop bad data from silently training models",
            "Delete the warehouse",
            "Replace MLOps",
          ],
          correctIndex: 1,
          explanation: "Gates are brakes.",
        },
      },
      {
        id: "ai-da-contracts",
        title: "Contracts between teams",
        concepts: ["data contracts"],
        teach: {
          idea: "Producers and consumers agree on schema, SLAs, and meaning of fields.",
          mentalModel: [
            "Schema registry / documented fields.",
            "Owners for each dataset.",
            "Change management when fields break.",
          ],
          workedExample: {
            title: "amount_cents",
            body: "Contract: integer cents USD, never dollars float — breaking change requires version bump.",
          },
          misconception: "Silent schema changes mid-week.",
          jobSignal: "How senior data folks work with ML.",
        },
        practice: {
          kind: "scenario",
          prompt: "Upstream renames `user_id` to `uid` with no notice. Models break. Prevention?",
          options: [
            {
              text: "Data contracts + schema checks in CI + versioned breaking changes",
              correct: true,
              feedback: "Correct — contracts make breakage loud and managed.",
            },
            {
              text: "Ban communication between teams",
              correct: false,
              feedback: "Opposite.",
            },
            {
              text: "Hardcode every column index forever",
              correct: false,
              feedback: "Fragile.",
            },
            {
              text: "Disable validation",
              correct: false,
              feedback: "You want louder failures, not quieter.",
            },
          ],
        },
        reflect: {
          prompt: "A data contract primarily aligns…",
          options: [
            "Fonts",
            "Producers and consumers on meaning, schema, and freshness",
            "GPU brands",
            "Marketing slogans",
          ],
          correctIndex: 1,
          explanation: "Shared reality for tables.",
        },
      },
    ],
    recall: [
      {
        prompt: "Using future label fields as inputs is…",
        options: ["Feature engineering genius", "Leakage", "MLOps", "RAG"],
        correctIndex: 1,
        explanation: "Classic leakage.",
      },
      {
        prompt: "Data Engineers matter to AI because…",
        options: [
          "Models don't need data",
          "Reliable data/pipelines make every AI role possible",
          "They only make dashboards",
          "They replace product managers",
        ],
        correctIndex: 1,
        explanation: "Demand follows infrastructure need.",
      },
    ],
  },
  {
    id: "ai-applied",
    title: "Applied AI Engineer",
    track: "role",
    roleLabel: "Applied AI / AI Engineer",
    description:
      "Ship LLM features: APIs, RAG, agents, cost/latency, and eval loops — the fastest-growing product AI work.",
    youWillUnderstand:
      "Applied AI integrates models into products with retrieval, tools, and measurement — not training from scratch.",
    duration: "40–55 min",
    masteryRequired: 3,
    recommendedAfter: ["ai-data-role"],
    lessons: [
      {
        id: "ai-ap-rag",
        title: "RAG mental model",
        concepts: ["RAG", "retrieval"],
        teach: {
          idea: "Retrieval-Augmented Generation grounds answers on your documents instead of model memory alone.",
          mentalModel: [
            "Index chunks with embeddings.",
            "Retrieve top-k for a query.",
            "Prompt the model with those chunks + ask for citations.",
          ],
          workedExample: {
            title: "Policy bot",
            body: "Chunk handbook → retrieve → answer only from chunks → cite section IDs.",
          },
          misconception: "RAG means the model fine-tunes itself every query.",
          jobSignal: "Table stakes in Applied AI job posts.",
        },
        practice: {
          kind: "checklist",
          prompt: "Core pieces of a basic RAG system:",
          minRequired: 4,
          items: [
            { id: "chunk", label: "Document chunking / indexing", required: true },
            { id: "embed", label: "Embeddings + vector search (or equivalent retrieval)", required: true },
            { id: "prompt", label: "Prompt that includes retrieved context", required: true },
            { id: "cite", label: "Citations or source pointers", required: true },
            { id: "train", label: "Train a new foundation model from scratch each request", required: false },
            { id: "ignore", label: "Ignore retrieval failures", required: false },
          ],
        },
        reflect: {
          prompt: "RAG's main job is to…",
          options: [
            "Replace databases",
            "Ground model outputs in retrieved enterprise/private knowledge",
            "Cool the GPU",
            "Remove the need for prompts",
          ],
          correctIndex: 1,
          explanation: "Grounding beats guessing.",
        },
      },
      {
        id: "ai-ap-chunk",
        title: "Chunking tradeoffs",
        concepts: ["chunking", "embeddings"],
        teach: {
          idea: "Chunks too big → diluted retrieval. Too small → missing context. Overlap helps boundaries.",
          mentalModel: [
            "Tune chunk size to document type.",
            "Keep metadata (title, section).",
            "Eval retrieval hit rate separately from answer quality.",
          ],
          workedExample: {
            title: "API docs",
            body: "Chunk by section headers with small overlap; store URL anchors as metadata.",
          },
          misconception: "One chunk size for all corpora forever.",
          jobSignal: "Error analysis often points here first.",
        },
        practice: {
          kind: "choice",
          prompt: "Retrieval often returns the wrong section. First lever?",
          options: [
            "Only buy a larger LLM",
            "Inspect chunking, metadata, and retrieval evals",
            "Remove all citations",
            "Disable embeddings and hope",
          ],
          correctIndex: 1,
          explanation: "Retrieval quality is its own subsystem.",
        },
        reflect: {
          prompt: "Why eval retrieval separately?",
          options: [
            "You shouldn't",
            "So you know whether failures are find vs generate problems",
            "Because LLMs cannot read chunks",
            "To avoid JSON",
          ],
          correctIndex: 1,
          explanation: "Localize the bug.",
        },
      },
      {
        id: "ai-ap-agents",
        title: "Tools and agents",
        concepts: ["agents", "tools"],
        teach: {
          idea: "Agents let models call tools (search, DB, calendar) in a loop — with guardrails.",
          mentalModel: [
            "Tool = typed function the model may invoke.",
            "Limit tools and require confirmation for risky actions.",
            "Log every tool call.",
          ],
          workedExample: {
            title: "Ops assistant",
            body: "May call get_order(id); may not call refund() without human approval.",
          },
          misconception: "Give the agent shell access to production on day one.",
          jobSignal: "Agent development is a rising Applied AI skill.",
        },
        practice: {
          kind: "scenario",
          prompt: "Design tool access for a refund agent.",
          options: [
            {
              text: "Read-only order lookup automatic; refund tool requires human approval over a threshold",
              correct: true,
              feedback: "Correct — least privilege + gates.",
            },
            {
              text: "Unrestricted production shell tool",
              correct: false,
              feedback: "Dangerous.",
            },
            {
              text: "No logging of tool calls",
              correct: false,
              feedback: "You need an audit trail.",
            },
            {
              text: "Allow refunds of any size with no checks",
              correct: false,
              feedback: "High-stakes autonomy too early.",
            },
          ],
        },
        reflect: {
          prompt: "Tool permissions should follow…",
          options: [
            "Maximum privilege",
            "Least privilege + risk-based approvals",
            "No structure",
            "Only voice input",
          ],
          correctIndex: 1,
          explanation: "Same as good security engineering.",
        },
      },
      {
        id: "ai-ap-cost",
        title: "Cost and latency budgets",
        concepts: ["cost", "latency"],
        teach: {
          idea: "Every token and retrieval hop costs money and time. Budget them like SLOs.",
          mentalModel: [
            "Cache repeated queries.",
            "Use smaller models for easy cases.",
            "Measure p95 latency, not only happy path.",
          ],
          workedExample: {
            title: "Router",
            body: "Classifier sends FAQ to small model; complex cases to large model.",
          },
          misconception: "Always call the biggest model for everything.",
          jobSignal: "Differentiates hobby demos from hireable engineers.",
        },
        practice: {
          kind: "choice",
          prompt: "p95 latency is 12s; users bounce. Best first moves?",
          options: [
            "Ignore latency; quality vibes matter only",
            "Profile retrieval + model time; cache; route easy traffic to faster models",
            "Add five more agent loops by default",
            "Remove all evals",
          ],
          correctIndex: 1,
          explanation: "Performance is a product feature.",
        },
        reflect: {
          prompt: "Model routing helps…",
          options: [
            "Spend maximum always",
            "Spend big-model capacity only when needed",
            "Avoid retrieval",
            "Delete caches",
          ],
          correctIndex: 1,
          explanation: "Cost/quality tradeoff control.",
        },
      },
    ],
    recall: [
      {
        prompt: "RAG retrieves documents to…",
        options: [
          "Train GPUs",
          "Ground the model's answer in your content",
          "Replace SSL",
          "Avoid prompts",
        ],
        correctIndex: 1,
        explanation: "Grounding.",
      },
      {
        prompt: "Risky agent tools should…",
        options: [
          "Be wide open",
          "Use approvals / least privilege",
          "Be hidden from logs",
          "Run without timeouts",
        ],
        correctIndex: 1,
        explanation: "Guardrails.",
      },
    ],
  },
  {
    id: "ai-ml-engineer",
    title: "Machine Learning Engineer",
    track: "role",
    roleLabel: "ML Engineer",
    description:
      "Train and adapt models responsibly — baselines, overfitting, metrics, and when fine-tuning beats RAG.",
    youWillUnderstand:
      "The supervised loop: data → model → loss → evaluate → iterate — with honesty about overfit.",
    duration: "35–50 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-ml-loop",
        title: "The supervised learning loop",
        concepts: ["supervised learning", "loss"],
        teach: {
          idea: "Model predicts; loss measures error; optimizer updates weights; repeat.",
          mentalModel: [
            "Fit on train, watch validation.",
            "Stop when validation stops improving.",
            "Report test once.",
          ],
          workedExample: {
            title: "Classifier",
            body: "Train → val F1 plateaus → early stop → test report → ship artifact with metrics.",
          },
          misconception: "Train until train accuracy is 100% always.",
          jobSignal: "Core ML Engineer literacy.",
        },
        practice: {
          kind: "sequence",
          prompt: "Order a sane supervised workflow:",
          correctOrder: [
            "Establish baseline metrics",
            "Train model on training set",
            "Tune using validation metrics",
            "Evaluate once on test and package the model",
          ],
        },
        reflect: {
          prompt: "Early stopping uses validation to…",
          options: [
            "Overfit harder",
            "Halt when generalization stops improving",
            "Delete features",
            "Skip baselines",
          ],
          correctIndex: 1,
          explanation: "Fight overfit.",
        },
      },
      {
        id: "ai-ml-overfit",
        title: "Overfitting recognition",
        concepts: ["overfitting", "generalization"],
        teach: {
          idea: "Train great, validation poor → memorization, not learning.",
          mentalModel: [
            "Watch the train/val gap.",
            "Simplify, regularize, get more data, fix leakage.",
            "Perfect train score is a warning light.",
          ],
          workedExample: {
            title: "Gap",
            body: "Train 99%, val 61% → investigate before deploy.",
          },
          misconception: "Higher train accuracy is always better.",
          jobSignal: "Interview staple.",
        },
        practice: {
          kind: "choice",
          prompt: "Train 98%, validation 60%. Next?",
          options: [
            "Deploy immediately",
            "Treat as overfit/leakage risk — simplify, check data, get more signal",
            "Only report train accuracy to stakeholders",
            "Remove the validation set",
          ],
          correctIndex: 1,
          explanation: "Generalization is the product.",
        },
        reflect: {
          prompt: "Overfitting means…",
          options: [
            "The model memorizes train quirks and fails to generalize",
            "The model is too small always",
            "Validation equals train always",
            "Docker is misconfigured",
          ],
          correctIndex: 0,
          explanation: "Memorization ≠ competence.",
        },
      },
      {
        id: "ai-ml-finetune",
        title: "Fine-tune vs prompt/RAG",
        concepts: ["fine-tuning", "RAG"],
        teach: {
          idea: "Prefer prompt/RAG for knowledge that changes; fine-tune for style/format/skills stable in examples.",
          mentalModel: [
            "RAG for factual enterprise knowledge.",
            "Fine-tune for consistent behavior/style with enough labeled examples.",
            "Fine-tuning is costlier to refresh.",
          ],
          workedExample: {
            title: "Tone vs facts",
            body: "Company facts → RAG. Always-on brand voice with 5k examples → fine-tune/adapters.",
          },
          misconception: "Fine-tune whenever a doc changes.",
          jobSignal: "Premium Applied/ML skill in 2026.",
        },
        practice: {
          kind: "scenario",
          prompt: "Weekly-changing policy PDFs. Best default?",
          options: [
            {
              text: "RAG over the latest indexed docs + evals",
              correct: true,
              feedback: "Correct — knowledge that churns wants retrieval.",
            },
            {
              text: "Fine-tune a new model every night from scratch with no evals",
              correct: false,
              feedback: "Expensive and usually unnecessary.",
            },
            {
              text: "Hardcode all policies in CSS",
              correct: false,
              feedback: "No.",
            },
            {
              text: "Ignore documents; trust model memory",
              correct: false,
              feedback: "Hallucination city.",
            },
          ],
        },
        reflect: {
          prompt: "Fine-tuning is a poor first choice when…",
          options: [
            "You need stable output style with lots of examples",
            "Facts change often and must stay current",
            "You have an eval harness",
            "You use Python",
          ],
          correctIndex: 1,
          explanation: "Churning knowledge → RAG.",
        },
      },
      {
        id: "ai-ml-baseline-model",
        title: "Ship the boring model first",
        concepts: ["baselines", "complexity"],
        teach: {
          idea: "Logistic regression / gradient boosting often beats a half-built deep net.",
          mentalModel: [
            "Start simple.",
            "Add complexity only when metrics demand it.",
            "Complexity is a cost — justify it.",
          ],
          workedExample: {
            title: "Tabular",
            body: "XGBoost baseline at 0.84 AUC; deep net at 0.85 with 10× ops pain — maybe don't.",
          },
          misconception: "Deep learning for every spreadsheet.",
          jobSignal: "Mature ML judgment.",
        },
        practice: {
          kind: "choice",
          prompt: "Tabular fraud data, tight deadline. Sensible start?",
          options: [
            "Train a tiny LLM from scratch on CPUs",
            "Strong classical/baseline model + solid features/evals, then consider complexity",
            "No baseline, largest net only",
            "Random guesses in production",
          ],
          correctIndex: 1,
          explanation: "Boring + measured wins deadlines.",
        },
        reflect: {
          prompt: "Complexity needs…",
          options: [
            "No justification",
            "A clear metric gain over a simpler baseline",
            "More slide animations",
            "Fewer tests",
          ],
          correctIndex: 1,
          explanation: "Pay for performance only when it's real.",
        },
      },
    ],
    recall: [
      {
        prompt: "Large train/val gap often signals…",
        options: ["Perfect health", "Overfitting (or leakage)", "Good caching", "RAG success"],
        correctIndex: 1,
        explanation: "Investigate before deploy.",
      },
      {
        prompt: "Changing enterprise facts weekly → prefer…",
        options: ["Nightly full fine-tunes only", "RAG / retrieval", "No measurement", "Bigger batch norm"],
        correctIndex: 1,
        explanation: "Retrieval for churning knowledge.",
      },
    ],
  },
  {
    id: "ai-mlops",
    title: "MLOps & Production",
    track: "role",
    roleLabel: "MLOps / Platform",
    description:
      "Deploy, monitor, and roll back models — the reliability layer every shipping team needs.",
    youWillUnderstand:
      "A model isn't done at train time; production needs CI, monitoring, drift detection, and rollback.",
    duration: "35–50 min",
    masteryRequired: 3,
    recommendedAfter: ["ai-applied", "ai-ml-engineer"],
    lessons: [
      {
        id: "ai-ops-deploy",
        title: "Deploy checklist",
        concepts: ["deployment", "CI"],
        teach: {
          idea: "Package model + code + config with version IDs; promote through environments.",
          mentalModel: [
            "Build artifact → test → staging → prod.",
            "Record data/model versions.",
            "Automate what humans forget under pressure.",
          ],
          workedExample: {
            title: "Release",
            body: "CI runs unit + eval suite; staging shadow traffic; prod canary 5% → 100%.",
          },
          misconception: "Copy a pickle file to a server by hand on Friday 5pm.",
          jobSignal: "MLOps scarcity premium.",
        },
        practice: {
          kind: "checklist",
          prompt: "Production model release should include:",
          minRequired: 4,
          items: [
            { id: "ver", label: "Versioned model + code/config", required: true },
            { id: "eval", label: "Automated eval/regression checks in CI", required: true },
            { id: "stage", label: "Staging or canary before full prod", required: true },
            { id: "roll", label: "Documented rollback path", required: true },
            { id: "yolo", label: "Hotfix prod with no tests on Friday night", required: false },
            { id: "secret", label: "Commit API keys into the model repo", required: false },
          ],
        },
        reflect: {
          prompt: "Canary releases exist to…",
          options: [
            "Look cute",
            "Limit blast radius while watching live metrics",
            "Skip monitoring",
            "Avoid versioning",
          ],
          correctIndex: 1,
          explanation: "Progressive delivery.",
        },
      },
      {
        id: "ai-ops-monitor",
        title: "Monitoring and drift",
        concepts: ["drift", "monitoring"],
        teach: {
          idea: "Watch inputs, outputs, and outcomes. Drift means the world moved.",
          mentalModel: [
            "Data drift: input distribution shifts.",
            "Concept drift: relationship changes.",
            "Alert → diagnose → retrain/fix features/rollback.",
          ],
          workedExample: {
            title: "Fraud",
            body: "New attack pattern → score distribution shifts → precision collapses → page MLOps/ML.",
          },
          misconception: "Set and forget after launch day.",
          jobSignal: "Defines the MLOps role.",
        },
        practice: {
          kind: "scenario",
          prompt: "Prediction volumes normal but precision crashed this week.",
          options: [
            {
              text: "Check for drift/new segments, review errors, consider rollback or retrain",
              correct: true,
              feedback: "Correct — investigate and mitigate.",
            },
            {
              text: "Ignore — offline eval was fine last quarter",
              correct: false,
              feedback: "The world changed.",
            },
            {
              text: "Disable alerts",
              correct: false,
              feedback: "No.",
            },
            {
              text: "Only redesign the logo",
              correct: false,
              feedback: "Not the failure mode.",
            },
          ],
        },
        reflect: {
          prompt: "Concept drift means…",
          options: [
            "GPUs overheated",
            "The mapping from inputs to best actions/labels changed",
            "JSON got larger",
            "Git conflict",
          ],
          correctIndex: 1,
          explanation: "The world moved under your model.",
        },
      },
      {
        id: "ai-ops-rollback",
        title: "Rollback is a feature",
        concepts: ["rollback"],
        teach: {
          idea: "If you cannot roll back quickly, you cannot ship boldly.",
          mentalModel: [
            "Keep n-1 model live-ready.",
            "One command/switch to revert.",
            "Practice rollback in staging.",
          ],
          workedExample: {
            title: "Bad canary",
            body: "Error rate doubles → auto-abort canary → previous model serves 100%.",
          },
          misconception: "Rollback plans written only after an outage.",
          jobSignal: "Ops maturity signal.",
        },
        practice: {
          kind: "choice",
          prompt: "Canary metrics tank. First production action?",
          options: [
            "Scale canary to 100% to 'push through'",
            "Roll back / abort canary to last good model",
            "Delete logs",
            "Retrain for 3 days before stopping the bleed",
          ],
          correctIndex: 1,
          explanation: "Stop the bleeding first.",
        },
        reflect: {
          prompt: "Fast rollback enables…",
          options: [
            "Recklessness without metrics",
            "Safer iteration because mistakes are containable",
            "Skipping CI forever",
            "Ignoring drift",
          ],
          correctIndex: 1,
          explanation: "Safety net for speed.",
        },
      },
      {
        id: "ai-ops-containers",
        title: "Containers and environments",
        concepts: ["Docker", "reproducibility"],
        teach: {
          idea: "Containerize serving so deps match across laptops, CI, and prod.",
          mentalModel: [
            "Image = code + system deps + model pointer/config.",
            "Same image promoted across envs.",
            "Pin versions; don't 'pip install latest' in prod.",
          ],
          workedExample: {
            title: "Serve API",
            body: "Docker image runs FastAPI + model; K8s/ECS scales replicas; health checks probe /health.",
          },
          misconception: "It works on my GPU laptop' as a release strategy.",
          jobSignal: "Docker/K8s appear constantly in MLOps posts.",
        },
        practice: {
          kind: "sequence",
          prompt: "Order a reproducible model service release:",
          correctOrder: [
            "Pin dependencies and build a container image",
            "Run CI tests/evals against the image",
            "Deploy to staging with health checks",
            "Canary to production with rollback ready",
          ],
        },
        reflect: {
          prompt: "Pinning dependency versions helps…",
          options: [
            "Randomize builds",
            "Make builds reproducible and debuggable",
            "Avoid containers",
            "Skip health checks",
          ],
          correctIndex: 1,
          explanation: "Yesterday's green build should rebuild green.",
        },
      },
    ],
    recall: [
      {
        prompt: "Drift monitoring watches for…",
        options: [
          "Only CSS changes",
          "Shifts in data/behavior that degrade model performance",
          "Cheaper laptops",
          "More slides",
        ],
        correctIndex: 1,
        explanation: "The world moves.",
      },
      {
        prompt: "A canary deploy…",
        options: [
          "Sends all traffic instantly",
          "Exposes a small slice of traffic first",
          "Deletes the previous model",
          "Skips metrics",
        ],
        correctIndex: 1,
        explanation: "Limited blast radius.",
      },
    ],
  },
  {
    id: "ai-product",
    title: "AI Product & Workplace Judgment",
    track: "role",
    roleLabel: "AI Product / Workplace",
    description:
      "Frame problems, choose build-vs-buy, and communicate risk — how AI work creates business value.",
    youWillUnderstand:
      "Good AI products start from a user job-to-be-done, error budgets, and honest stakeholder communication.",
    duration: "30–45 min",
    masteryRequired: 3,
    lessons: [
      {
        id: "ai-pd-job",
        title: "Start from the user job",
        concepts: ["JTBD", "product"],
        teach: {
          idea: "AI is a means. Name the user job, success metric, and failure cost before picking a model.",
          mentalModel: [
            "Who? Job? Current workaround?",
            "What error rate is acceptable?",
            "Why AI vs simpler software?",
          ],
          workedExample: {
            title: "Intake",
            body: "Job: triage IT tickets in <2 minutes. Metric: % correctly routed. Failure cost: wrong queue delay.",
          },
          misconception: "We need AI' as the requirements doc.",
          jobSignal: "AI Product Manager + tech leads.",
        },
        practice: {
          kind: "prompt-rubric",
          brief:
            "Write a mini PRD blurb for an AI ticket-routing feature: user, job, success metric, failure cost, and why not rules-only.",
          placeholder: "User… Job… Metric… Failure cost… Why AI…",
          minPassed: 4,
          mustInclude: [
            { id: "user", label: "User / persona", patterns: ["user", "agent", "employee", "customer", "it "] },
            { id: "job", label: "Job / triage / routing goal", patterns: ["triage", "rout", "ticket", "job", "goal"] },
            { id: "metric", label: "Success metric", patterns: ["metric", "%", "accuracy", "rate", "minutes", "sla"] },
            { id: "fail", label: "Failure cost / risk", patterns: ["fail", "wrong", "cost", "risk", "delay", "error"] },
            { id: "why", label: "Why AI / vs rules", patterns: ["rule", "ai", "because", "complex", "baseline"] },
          ],
        },
        reflect: {
          prompt: "The first artifact for an AI feature should clarify…",
          options: [
            "Only the model brand",
            "User job, metrics, and failure costs",
            "Office snack preferences",
            "GPU retail prices alone",
          ],
          correctIndex: 1,
          explanation: "Problem before solution.",
        },
      },
      {
        id: "ai-pd-buildbuy",
        title: "Build vs buy",
        concepts: ["build vs buy"],
        teach: {
          idea: "Buy commodities; build differentiators. APIs/platforms often win early.",
          mentalModel: [
            "Is this core IP?",
            "Do we have data/talent to maintain it?",
            "What's time-to-learning vs time-to-build?",
          ],
          workedExample: {
            title: "Speech-to-text",
            body: "Buy commodity STT API; build the domain workflow and evals that differentiate.",
          },
          misconception: "Always build your own foundation model first.",
          jobSignal: "Leaders expect this judgment.",
        },
        practice: {
          kind: "scenario",
          prompt: "You need OCR for receipts to ship next month. Team is 2 engineers.",
          options: [
            {
              text: "Buy a solid OCR API; invest build time in workflow + evals",
              correct: true,
              feedback: "Correct — commodity capability, scarce time.",
            },
            {
              text: "Train a foundation vision model from scratch",
              correct: false,
              feedback: "Wrong scope.",
            },
            {
              text: "Type receipts manually forever with no plan",
              correct: false,
              feedback: "Not a strategy.",
            },
            {
              text: "Skip evals because the vendor demo looked cool",
              correct: false,
              feedback: "Still measure in your workflow.",
            },
          ],
        },
        reflect: {
          prompt: "Build when…",
          options: [
            "It's always cheaper",
            "It's differentiating IP you can maintain — otherwise prefer buy/adapt",
            "Vendors exist",
            "It's Friday",
          ],
          correctIndex: 1,
          explanation: "Focus scarce talent.",
        },
      },
      {
        id: "ai-pd-risk",
        title: "Communicate uncertainty",
        concepts: ["stakeholders", "risk"],
        teach: {
          idea: "Tell non-technical stakeholders what can go wrong in plain language — with mitigations.",
          mentalModel: [
            "Probability × impact.",
            "Mitigations and residual risk.",
            "No certainty theater.",
          ],
          workedExample: {
            title: "Exec update",
            body: "Model automates 60% of tickets; 5% need audit; rollback in <5 minutes; weekly error review with support leads.",
          },
          misconception: "Promising 100% accuracy to get budget.",
          jobSignal: "Trust is a career skill on AI teams.",
        },
        practice: {
          kind: "choice",
          prompt: "Best stakeholder update?",
          options: [
            "It will never make mistakes",
            "Expected automation rate, known failure modes, human fallback, and how we monitor",
            "Only show the happy demo GIF",
            "Hide the eval numbers",
          ],
          correctIndex: 1,
          explanation: "Honesty + mitigations builds durable support.",
        },
        reflect: {
          prompt: "Certainty theater is dangerous because…",
          options: [
            "It motivates teams",
            "It sets false expectations and blocks real risk controls",
            "Investors require it legally",
            "Models become faster",
          ],
          correctIndex: 1,
          explanation: "Overpromise creates under-prepared orgs.",
        },
      },
      {
        id: "ai-pd-ops",
        title: "Plan the operating model",
        concepts: ["operations", "ownership"],
        teach: {
          idea: "Who owns prompts, evals, incidents, and retraining? Name owners before launch.",
          mentalModel: [
            "On-call path for AI incidents.",
            "Cadence for eval review.",
            "Budget for model/API cost.",
          ],
          workedExample: {
            title: "RACI lite",
            body: "Applied AI owns prompts/evals; MLOps owns serving; Support owns escalation macros; Product owns error budget.",
          },
          misconception: "Launch and figure out ownership later.",
          jobSignal: "Separates demos from durable products.",
        },
        practice: {
          kind: "checklist",
          prompt: "Pre-launch operating model must name:",
          minRequired: 3,
          items: [
            { id: "inc", label: "Incident owner / on-call path", required: true },
            { id: "eval", label: "Who reviews eval regressions weekly", required: true },
            { id: "cost", label: "Who watches cost/latency budgets", required: true },
            { id: "nobody", label: "Nobody — AI will self-manage", required: false },
            { id: "hide", label: "Hide ownership from support", required: false },
          ],
        },
        reflect: {
          prompt: "An error budget for AI means…",
          options: [
            "Unlimited mistakes",
            "An agreed tolerance for failures before you freeze changes or add controls",
            "A GPU purchase order",
            "A marketing slogan",
          ],
          correctIndex: 1,
          explanation: "Product reliability language applied to AI.",
        },
      },
    ],
    recall: [
      {
        prompt: "AI requirements should start from…",
        options: [
          "Model brand loyalty",
          "User job, metrics, and failure costs",
          "Office layout",
          "Random Kaggle tips only",
        ],
        correctIndex: 1,
        explanation: "Problem framing first.",
      },
      {
        prompt: "Build vs buy — buy when…",
        options: [
          "Always",
          "The capability is commodity and not your differentiator",
          "Never",
          "Only for snacks",
        ],
        correctIndex: 1,
        explanation: "Spend build time on advantage.",
      },
    ],
  },
];

export function foundationModules(): AiModule[] {
  return AI_JOB_PATH_MODULES.filter((m) => m.track === "foundation");
}

export function roleModules(): AiModule[] {
  return AI_JOB_PATH_MODULES.filter((m) => m.track === "role");
}

export function getAiModule(id: string): AiModule | undefined {
  return AI_JOB_PATH_MODULES.find((m) => m.id === id);
}

export function getAiLesson(
  moduleId: string,
  lessonId: string,
): { module: AiModule; lesson: AiLesson } | undefined {
  const module = getAiModule(moduleId);
  const lesson = module?.lessons.find((l) => l.id === lessonId);
  if (!module || !lesson) return undefined;
  return { module, lesson };
}