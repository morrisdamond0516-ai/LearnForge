/**
 * JavaScript That Sticks — learn JS so you understand it end-to-end.
 *
 * Pedagogy (vs freeCodeCamp-style scroll-and-fill):
 * 1. Mental model first (reduce cognitive overload)
 * 2. Worked example + walkthrough (see correct thinking)
 * 3. Write from scratch with tests (active practice / doer effect)
 * 4. Reflect / explain why (self-explanation → transfer)
 * 5. Mastery gate + spaced recall (testing effect / retention)
 *
 * Goal: learners can explain what their code does — not just make tests green.
 */

export type JsTestCase = {
  name: string;
  args: unknown[];
  expected: unknown;
  hidden?: boolean;
  /** Seed practice DOM body before the test (simple `<tag id="x">text</tag>` lines). */
  domHtml?: string;
  /** Compare a DOM property after the call instead of the return value. */
  expectDom?: {
    selector: string;
    prop: "textContent" | "className" | "id";
  };
  /** Compare a property on the returned object/element. */
  expectReturnProp?: "textContent" | "tagName" | "className" | "id";
  /**
   * After calling the learner function, fire DOM events.
   * If `injectClickHandler` is true, pass a counting handler as the 2nd argument.
   */
  afterCall?: {
    clicks?: { selector: string; times: number }[];
    submits?: { selector: string }[];
    injectClickHandler?: boolean;
    /** Compare click-handler call count instead of return value. */
    expectClickCount?: boolean;
    /** Compare whether the last submit was preventDefaulted. */
    expectSubmitPrevented?: boolean;
  };
};

export type JsTeachBlock = {
  /** The idea in plain language */
  idea: string;
  /** Step-by-step how JS thinks about this */
  mentalModel: string[];
  /** Complete correct example to study before writing */
  workedExample: {
    code: string;
    walkthrough: string[];
  };
  /** Common wrong belief that causes bugs */
  misconception: string;
  /** Predict output before coding (active recall) */
  predict?: {
    code: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

export type JsChallenge = {
  id: string;
  title: string;
  teach: JsTeachBlock;
  prompt: string;
  functionName: string;
  starterCode: string;
  hint: string;
  tests: JsTestCase[];
  concepts: string[];
  /** Inject a practice `document` for browser lessons. */
  runtime?: "plain" | "dom";
  /** After tests pass — prove understanding, not luck */
  reflect: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

export type JsModule = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  /** One sentence the learner should be able to say after the module */
  youWillUnderstand: string;
  duration: string;
  masteryRequired: number;
  challenges: JsChallenge[];
  recall: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};

export const JS_JOB_PATH_MODULES: JsModule[] = [
  {
    id: "js-values",
    title: "Values & Variables",
    emoji: "1",
    description:
      "What data is, how you name it, and how JS types work — the foundation everything else sits on.",
    youWillUnderstand:
      "A variable is a labeled box holding a value; the value has a type that decides what operations make sense.",
    duration: "30–45 min",
    masteryRequired: 4,
    challenges: [
      {
        id: "js-v-greet",
        title: "Build a greeting from a value",
        teach: {
          idea: "Strings are sequences of characters. Template literals let you insert values into text.",
          mentalModel: [
            "JS evaluates the expression inside ${...} first, then builds the final string.",
            "If a value is missing (undefined) or empty (\"\"), you can choose a fallback with an if check.",
            "return hands a value back to whoever called the function.",
          ],
          workedExample: {
            code: `function shout(word) {
  return \`HEY \${word}!\`;
}
// shout("Maya") → "HEY Maya!"`,
            walkthrough: [
              "Call shout(\"Maya\").",
              "JS replaces \${word} with Maya.",
              "The function returns the finished string.",
            ],
          },
          misconception:
            "Beginners often console.log inside the function and forget to return — tests (and real apps) need the returned value.",
          predict: {
            code: `const name = "Ada";
const msg = \`Hi, \${name}\`;`,
            question: "What is the value of msg?",
            options: ['"Hi, ${name}"', '"Hi, Ada"', "Hi, Ada (no quotes — not a string)", "undefined"],
            correctIndex: 1,
            explanation:
              "Template literals evaluate \${name} and produce the string \"Hi, Ada\".",
          },
        },
        prompt:
          "Write `greet(name)` that returns `Hello, <name>!`. If name is empty or missing, return `Hello, friend!`.",
        functionName: "greet",
        starterCode: `function greet(name) {
  // return a greeting string
}
`,
        hint: "If !name is true, use the friend fallback. Otherwise use a template literal.",
        concepts: ["strings", "template literals", "return", "conditionals"],
        tests: [
          { name: "named", args: ["Maya"], expected: "Hello, Maya!" },
          { name: "empty", args: [""], expected: "Hello, friend!" },
          { name: "missing", args: [undefined], expected: "Hello, friend!", hidden: true },
        ],
        reflect: {
          prompt: "Why does the function need `return` instead of only `console.log`?",
          options: [
            "console.log is illegal in JavaScript",
            "return gives the value to the caller; logging only prints to the console",
            "return makes the code run faster",
            "They do the exact same thing",
          ],
          correctIndex: 1,
          explanation:
            "Other code (and tests) use the returned value. Logging is for humans watching the console.",
        },
      },
      {
        id: "js-v-adult",
        title: "Booleans from comparisons",
        teach: {
          idea: "Comparisons like >= produce true or false — boolean values you can return directly.",
          mentalModel: [
            "age >= 18 is an expression that evaluates to true or false.",
            "You can return that expression — no need for if/else that returns true/false separately.",
            "=== checks value and type; == does loose conversion (usually avoid it while learning).",
          ],
          workedExample: {
            code: `function isTeen(age) {
  return age >= 13 && age <= 19;
}`,
            walkthrough: [
              "Both sides of && must be true for the whole expression to be true.",
              "isTeen(15) → true; isTeen(20) → false.",
            ],
          },
          misconception:
            "Writing `if (age >= 18) return true; else return false;` works, but returning the comparison is clearer and means the same thing.",
          predict: {
            code: `console.log(18 >= 18);
console.log(17 >= 18);`,
            question: "What prints?",
            options: ["true then false", "false then true", "18 then 17", "undefined twice"],
            correctIndex: 0,
            explanation: "Comparisons evaluate to booleans: true, then false.",
          },
        },
        prompt: "Write `isAdult(age)` that returns true when age is 18 or older, otherwise false.",
        functionName: "isAdult",
        starterCode: `function isAdult(age) {
  // return a boolean
}
`,
        hint: "return age >= 18;",
        concepts: ["booleans", "comparisons", "return"],
        tests: [
          { name: "18", args: [18], expected: true },
          { name: "17", args: [17], expected: false },
          { name: "30", args: [30], expected: true, hidden: true },
        ],
        reflect: {
          prompt: "What type of value does `age >= 18` produce?",
          options: ["number", "string", "boolean", "object"],
          correctIndex: 2,
          explanation: "Relational operators produce true or false — the boolean type.",
        },
      },
      {
        id: "js-v-discount",
        title: "Numbers and careful math",
        teach: {
          idea: "Numbers support arithmetic. Money-style rounding needs an intentional step because floats are approximate.",
          mentalModel: [
            "Members pay price * 0.9 (10% off).",
            "JS floats can produce 17.991000… so we round to cents: Math.round(n * 100) / 100.",
            "Always know whether you want a number or a display string.",
          ],
          workedExample: {
            code: `function half(n) {
  return Math.round((n / 2) * 100) / 100;
}`,
            walkthrough: [
              "Divide, then round to 2 decimal places.",
              "half(19.99) becomes a clean cents value.",
            ],
          },
          misconception:
            "Assuming 19.99 * 0.9 is exactly 17.99 without rounding — floating point often needs an explicit round.",
        },
        prompt:
          "Write `finalPrice(price, isMember)` — members get 10% off. Return a number rounded to 2 decimals.",
        functionName: "finalPrice",
        starterCode: `function finalPrice(price, isMember) {
  // your code
}
`,
        hint: "If member: price * 0.9, then Math.round(n * 100) / 100.",
        concepts: ["numbers", "conditionals", "rounding"],
        tests: [
          { name: "member", args: [100, true], expected: 90 },
          { name: "guest", args: [100, false], expected: 100 },
          { name: "cents", args: [19.99, true], expected: 17.99, hidden: true },
        ],
        reflect: {
          prompt: "Why round money calculations in JS?",
          options: [
            "Math.round is required by law",
            "Floating-point math can leave tiny leftovers; rounding makes clean cents",
            "Rounding makes programs slower on purpose",
            "Strings cannot hold decimals",
          ],
          correctIndex: 1,
          explanation:
            "Binary floating point isn't perfect for decimals; rounding is how you keep results predictable.",
        },
      },
      {
        id: "js-v-grade",
        title: "Branching with if / else if",
        teach: {
          idea: "Programs choose paths. Order matters: check the highest thresholds first so a 95 is A, not also B.",
          mentalModel: [
            "JS runs the first matching branch, then skips the rest.",
            "Else handles 'none of the above'.",
            "Each branch should return so the function always finishes with a value.",
          ],
          workedExample: {
            code: `function traffic(light) {
  if (light === "green") return "go";
  if (light === "yellow") return "slow";
  return "stop";
}`,
            walkthrough: [
              "Exact matches with ===.",
              "Final return is the default path.",
            ],
          },
          misconception:
            "Checking low scores first (e.g. >= 60 before >= 90) mis-classifies high scores if you aren't careful with exclusive ranges.",
        },
        prompt:
          "Write `letterGrade(score)` → A (≥90), B (≥80), C (≥70), D (≥60), else F.",
        functionName: "letterGrade",
        starterCode: `function letterGrade(score) {
  // your code
}
`,
        hint: "Check from 90 down to 60, then return \"F\".",
        concepts: ["conditionals", "control flow"],
        tests: [
          { name: "A", args: [95], expected: "A" },
          { name: "B", args: [80], expected: "B" },
          { name: "F", args: [59], expected: "F", hidden: true },
          { name: "C", args: [70], expected: "C", hidden: true },
        ],
        reflect: {
          prompt: "Why check ≥90 before ≥80?",
          options: [
            "Because 90 is a lucky number",
            "A score of 95 also satisfies ≥80 — checking A first assigns the correct letter",
            "Else if only works that way in Python",
            "Order never matters in if chains",
          ],
          correctIndex: 1,
          explanation:
            "Overlapping conditions need a deliberate order so the most specific (or highest) case wins.",
        },
      },
      {
        id: "js-v-clamp",
        title: "Composing small number tools",
        teach: {
          idea: "Big problems become small when you combine simple operations (min + max).",
          mentalModel: [
            "Math.max(min, n) pulls n up if it's too low.",
            "Math.min(max, …) then pulls it down if it's too high.",
            "Reading inside-out: clamp = min(max, max(min, n)).",
          ],
          workedExample: {
            code: `function atLeastZero(n) {
  return Math.max(0, n);
}`,
            walkthrough: ["Negative inputs become 0; positives stay."],
          },
          misconception:
            "Thinking Math.min picks the smaller bound of the range — here min/max are used as 'limiters', not as 'range endpoints' by themselves.",
        },
        prompt: "Write `clamp(n, min, max)` that keeps n inside [min, max].",
        functionName: "clamp",
        starterCode: `function clamp(n, min, max) {
  // your code
}
`,
        hint: "return Math.min(max, Math.max(min, n));",
        concepts: ["Math", "composition"],
        tests: [
          { name: "in range", args: [5, 0, 10], expected: 5 },
          { name: "low", args: [-3, 0, 10], expected: 0 },
          { name: "high", args: [99, 0, 10], expected: 10, hidden: true },
        ],
        reflect: {
          prompt: "In `Math.min(max, Math.max(min, n))`, which call runs first?",
          options: [
            "Math.min",
            "Math.max",
            "They run at the same time",
            "Neither — JS skips nested calls",
          ],
          correctIndex: 1,
          explanation:
            "Inner expressions evaluate first: raise n to min, then lower the result to max.",
        },
      },
    ],
    recall: [
      {
        prompt: "Which operator checks value AND type?",
        options: ["==", "===", "=", "!="],
        correctIndex: 1,
        explanation: "=== is strict equality — prefer it while you build solid habits.",
      },
      {
        prompt: "What does a function `return` do?",
        options: [
          "Prints to the screen",
          "Sends a value back to the caller and ends the function",
          "Declares a variable",
          "Pauses the program forever",
        ],
        correctIndex: 1,
        explanation: "return produces the function's result for whatever called it.",
      },
      {
        prompt: "A boolean value is…",
        options: ["Only 0 or 1", "true or false", "Any number", "A list of characters"],
        correctIndex: 1,
        explanation: "Booleans are the yes/no type: true or false.",
      },
    ],
  },
  {
    id: "js-loops",
    title: "Loops & Repetition",
    emoji: "2",
    description:
      "Make the computer repeat work safely — the bridge from single values to real programs.",
    youWillUnderstand:
      "A loop repeats a block while a condition holds; you control the start, the change each time, and when to stop.",
    duration: "25–40 min",
    masteryRequired: 3,
    challenges: [
      {
        id: "js-l-sum",
        title: "Accumulate with a loop",
        teach: {
          idea: "An accumulator starts at a base (often 0) and grows each iteration.",
          mentalModel: [
            "total = 0 before the loop.",
            "Each pass: total = total + current number.",
            "After the loop, total holds the answer.",
          ],
          workedExample: {
            code: `function sumTo(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}`,
            walkthrough: [
              "i goes 1, 2, 3, … n.",
              "total collects the running sum.",
              "sumTo(3) → 6.",
            ],
          },
          misconception:
            "Putting `let total = 0` inside the loop resets the sum every time — the accumulator must live outside.",
        },
        prompt: "Write `sumCart(prices)` that returns the sum of all numbers in the array.",
        functionName: "sumCart",
        starterCode: `function sumCart(prices) {
  // loop and accumulate
}
`,
        hint: "Start total at 0; for each price, add it; return total. (reduce is fine too.)",
        concepts: ["loops", "arrays", "accumulation"],
        tests: [
          { name: "basic", args: [[10, 5, 2.5]], expected: 17.5 },
          { name: "empty", args: [[]], expected: 0 },
          { name: "one", args: [[9]], expected: 9, hidden: true },
        ],
        reflect: {
          prompt: "Why start the total at 0?",
          options: [
            "Arrays always begin at 0",
            "0 is the identity for addition — adding to 0 doesn't change the first value wrongly",
            "Loops require the number 0",
            "So the array becomes empty",
          ],
          correctIndex: 1,
          explanation:
            "The identity value for + is 0. For multiply you'd start at 1 — same idea.",
        },
      },
      {
        id: "js-l-repeat",
        title: "Build a string by repeating",
        teach: {
          idea: "You can build strings the same way you accumulate numbers — start empty, add pieces.",
          mentalModel: [
            'Start with result = "".',
            "Each iteration: result = result + str (or result += str).",
            "n === 0 means the loop never runs → empty string.",
          ],
          workedExample: {
            code: `function dots(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += ".";
  return out;
}`,
            walkthrough: ["dots(3) → \"...\""],
          },
          misconception:
            "Off-by-one errors: `i <= n` with `i` starting at 0 runs one time too many.",
        },
        prompt: "Write `repeatStr(str, n)` that concatenates str n times (n ≥ 0).",
        functionName: "repeatStr",
        starterCode: `function repeatStr(str, n) {
  // your code
}
`,
        hint: "Loop n times, or use str.repeat(n).",
        concepts: ["loops", "strings"],
        tests: [
          { name: "hi×3", args: ["hi", 3], expected: "hihihi" },
          { name: "empty", args: ["x", 0], expected: "" },
          { name: "once", args: ["ab", 1], expected: "ab", hidden: true },
        ],
        reflect: {
          prompt: "If n is 0, how many times should the loop body run?",
          options: ["1", "0", "Until the string is empty", "Forever"],
          correctIndex: 1,
          explanation: "Zero repetitions means skip the body; return the empty starter string.",
        },
      },
      {
        id: "js-l-evens",
        title: "Filter while looping",
        teach: {
          idea: "Sometimes you only keep values that pass a test — push matches into a new array.",
          mentalModel: [
            "Create an empty results array.",
            "For each item, if it passes the test, push it.",
            "Return the new array — leave the original alone (good habit).",
          ],
          workedExample: {
            code: `function onlyPositive(nums) {
  const out = [];
  for (const n of nums) {
    if (n > 0) out.push(n);
  }
  return out;
}`,
            walkthrough: ["Walk each n; push when the condition is true."],
          },
          misconception:
            "Mutating the array while looping over it (splice in a for-loop) is a common source of skipped items — build a new array instead.",
        },
        prompt: "Write `onlyEvens(nums)` that returns only the even numbers.",
        functionName: "onlyEvens",
        starterCode: `function onlyEvens(nums) {
  // your code
}
`,
        hint: "n % 2 === 0 means even. filter or a loop + push.",
        concepts: ["loops", "filter pattern", "modulo"],
        tests: [
          { name: "mix", args: [[1, 2, 3, 4]], expected: [2, 4] },
          { name: "none", args: [[1, 3]], expected: [] },
          { name: "zero", args: [[0, 5]], expected: [0], hidden: true },
        ],
        reflect: {
          prompt: "Why is 0 considered even?",
          options: [
            "Because arrays start at 0",
            "0 % 2 === 0 — it divides evenly by 2",
            "0 is not a number",
            "Even only means positive",
          ],
          correctIndex: 1,
          explanation: "Even means divisible by 2 with no remainder; 0 qualifies.",
        },
      },
      {
        id: "js-l-fizz",
        title: "Combine conditions in a loop-friendly way",
        teach: {
          idea: "When multiple rules overlap, check the most specific rule first (÷3 and ÷5 before ÷3 alone).",
          mentalModel: [
            "n % 3 === 0 means divisible by 3.",
            "Check 15 (both) before 3 or 5 alone.",
            "Else return the number as a string.",
          ],
          workedExample: {
            code: `function label(n) {
  if (n % 2 === 0 && n % 3 === 0) return "both";
  if (n % 2 === 0) return "even";
  if (n % 3 === 0) return "by3";
  return "other";
}`,
            walkthrough: ["Most specific combined case first."],
          },
          misconception:
            "Checking ÷3 first and returning \"Fizz\" forever blocks you from ever returning \"FizzBuzz\".",
        },
        prompt:
          "Write `fizzBuzz(n)` — 'FizzBuzz' if ÷3 and ÷5, 'Fizz' if ÷3, 'Buzz' if ÷5, else String(n).",
        functionName: "fizzBuzz",
        starterCode: `function fizzBuzz(n) {
  // your code
}
`,
        hint: "Check % 15 (or both 3 and 5) first.",
        concepts: ["conditionals", "modulo"],
        tests: [
          { name: "3", args: [3], expected: "Fizz" },
          { name: "5", args: [5], expected: "Buzz" },
          { name: "15", args: [15], expected: "FizzBuzz" },
          { name: "7", args: [7], expected: "7", hidden: true },
        ],
        reflect: {
          prompt: "Why test the FizzBuzz (both) case before Fizz?",
          options: [
            "It looks nicer",
            "Numbers divisible by 15 are also divisible by 3 — an earlier Fizz return would hide FizzBuzz",
            "JavaScript requires it",
            "Buzz must always be last",
          ],
          correctIndex: 1,
          explanation:
            "Overlapping rules need specificity order — same lesson as letter grades.",
        },
      },
    ],
    recall: [
      {
        prompt: "Where should an accumulator variable be declared?",
        options: [
          "Inside the loop body",
          "Outside the loop, before it starts",
          "After the return",
          "Only in the function parameters",
        ],
        correctIndex: 1,
        explanation: "Outside — so it survives across iterations.",
      },
      {
        prompt: "`n % 2 === 0` is true when…",
        options: ["n is odd", "n is even", "n is negative", "n is undefined"],
        correctIndex: 1,
        explanation: "Remainder 0 when dividing by 2 means even.",
      },
    ],
  },
  {
    id: "js-functions",
    title: "Functions & Scope",
    emoji: "3",
    description:
      "Functions are reusable machines: inputs in, result out — and each one has its own scope.",
    youWillUnderstand:
      "A function packages a process; parameters receive inputs; locals inside aren't visible outside.",
    duration: "30–45 min",
    masteryRequired: 3,
    challenges: [
      {
        id: "js-fn-add",
        title: "Parameters and defaults",
        teach: {
          idea: "Parameters are local names for values the caller passes. Defaults fill in missing arguments.",
          mentalModel: [
            "add(2, 3) binds a=2, b=3.",
            "add(7) with b = 0 uses the default for b.",
            "Defaults only apply when the argument is missing (undefined), not when it's 0.",
          ],
          workedExample: {
            code: `function multiply(a, b = 1) {
  return a * b;
}
// multiply(5) → 5`,
            walkthrough: ["Missing b → default 1 preserves the value of a."],
          },
          misconception:
            "Thinking a default runs when the value is 0 — 0 is a real value, so it overrides the default.",
        },
        prompt: "Write `add(a, b = 0)` that returns a + b.",
        functionName: "add",
        starterCode: `function add(a, b = 0) {
  // your code
}
`,
        hint: "return a + b;",
        concepts: ["parameters", "defaults"],
        tests: [
          { name: "both", args: [2, 3], expected: 5 },
          { name: "default", args: [7], expected: 7 },
          { name: "zero", args: [0, 0], expected: 0, hidden: true },
        ],
        reflect: {
          prompt: "In `function add(a, b = 0)`, what is b when you call `add(7)`?",
          options: ["undefined forever", "0", "7", "null"],
          correctIndex: 1,
          explanation: "The default kicks in because the second argument was omitted.",
        },
      },
      {
        id: "js-fn-tax",
        title: "Pure functions you can trust",
        teach: {
          idea: "A pure function's output depends only on its inputs — same inputs, same output, no sneaky outside changes.",
          mentalModel: [
            "Read amount and rate from parameters.",
            "Compute and return — don't touch global variables.",
            "Pure functions are easier to test and reason about.",
          ],
          workedExample: {
            code: `function tip(bill, percent) {
  return bill * percent;
}`,
            walkthrough: ["tip(100, 0.2) always → 20."],
          },
          misconception:
            "Reading and writing globals inside helpers makes bugs that tests on 'happy path' miss.",
        },
        prompt:
          "Write `withTax(amount, rate)` that returns amount * (1 + rate). Example: withTax(100, 0.08) → 108.",
        functionName: "withTax",
        starterCode: `function withTax(amount, rate) {
  // your code
}
`,
        hint: "return amount * (1 + rate);",
        concepts: ["pure functions", "numbers"],
        tests: [
          { name: "8%", args: [100, 0.08], expected: 108 },
          { name: "0%", args: [50, 0], expected: 50 },
          { name: "small", args: [10, 0.1], expected: 11, hidden: true },
        ],
        reflect: {
          prompt: "What makes a function 'pure'?",
          options: [
            "It uses only async/await",
            "Same inputs → same output, and no side effects on outside state",
            "It has no parameters",
            "It always returns undefined",
          ],
          correctIndex: 1,
          explanation:
            "Purity means predictable results — the core of understanding and testing code.",
        },
      },
      {
        id: "js-fn-prop",
        title: "Read object properties safely",
        teach: {
          idea: "Objects store values under keys. Missing keys give undefined — plan a fallback.",
          mentalModel: [
            "obj[key] looks up the property named by key.",
            "If the value is undefined, return fallback.",
            "Careful: 0 and \"\" are real values — don't treat them as missing with || if you need them.",
          ],
          workedExample: {
            code: `function get(obj, key, fallback) {
  const value = obj[key];
  if (value === undefined) return fallback;
  return value;
}`,
            walkthrough: [
              "Distinguish 'missing' (undefined) from 'present but falsy' (0, \"\").",
            ],
          },
          misconception:
            "Using `obj[key] || fallback` wrongly replaces 0 or \"\" with the fallback.",
          predict: {
            code: `const user = { lives: 0 };
const x = user.lives || 3;`,
            question: "What is x?",
            options: ["0", "3", "undefined", "user"],
            correctIndex: 1,
            explanation:
              "0 is falsy, so || 3 takes the right side — usually not what you want for lives.",
          },
        },
        prompt:
          "Write `getProp(obj, key, fallback)` — return obj[key] if it isn't undefined, else fallback.",
        functionName: "getProp",
        starterCode: `function getProp(obj, key, fallback) {
  // your code
}
`,
        hint: "Check === undefined (not ||).",
        concepts: ["objects", "undefined", "lookups"],
        tests: [
          { name: "hit", args: [{ a: 1 }, "a", 0], expected: 1 },
          { name: "miss", args: [{ a: 1 }, "b", 0], expected: 0 },
          { name: "zero ok", args: [{ n: 0 }, "n", 9], expected: 0, hidden: true },
        ],
        reflect: {
          prompt: "Why can `value || fallback` be dangerous?",
          options: [
            "|| is deprecated",
            "Falsy-but-valid values like 0 or \"\" get replaced",
            "It only works on strings",
            "It always returns undefined",
          ],
          correctIndex: 1,
          explanation:
            "Check for undefined (or use ??) when 0/\"\"/false are valid data.",
        },
      },
      {
        id: "js-fn-first",
        title: "Nullish thinking: missing vs zero",
        teach: {
          idea: "null and undefined mean 'no value'. 0 and false are values. Pick the first defined input.",
          mentalModel: [
            "Walk a, then b, then c.",
            "Skip only null/undefined.",
            "Keep 0 if you see it.",
          ],
          workedExample: {
            code: `function pick(a, b) {
  if (a !== null && a !== undefined) return a;
  return b;
}`,
            walkthrough: ["pick(0, 5) → 0 because 0 is defined."],
          },
          misconception:
            "Treating all falsy values as 'empty' — that erases meaningful zeros.",
        },
        prompt:
          "Write `firstDefined(a, b, c)` that returns the first value that is not null/undefined.",
        functionName: "firstDefined",
        starterCode: `function firstDefined(a, b, c) {
  // your code
}
`,
        hint: "Test each with !== null && !== undefined.",
        concepts: ["null", "undefined", "fallbacks"],
        tests: [
          { name: "first", args: [1, 2, 3], expected: 1 },
          { name: "skip null", args: [null, 5, 6], expected: 5 },
          { name: "zero", args: [null, undefined, 0], expected: 0, hidden: true },
        ],
        reflect: {
          prompt: "Is `0` the same as 'no value' in JavaScript?",
          options: [
            "Yes — 0 means missing",
            "No — 0 is a real number value; missing is null/undefined",
            "Only inside arrays",
            "Only in strict mode",
          ],
          correctIndex: 1,
          explanation:
            "This distinction is a major step from beginner bugs to solid understanding.",
        },
      },
    ],
    recall: [
      {
        prompt: "Variables declared with `let` inside a function are…",
        options: [
          "Global everywhere",
          "Local to that function (scope)",
          "Shared with all functions automatically",
          "Deleted before the function runs",
        ],
        correctIndex: 1,
        explanation: "Function scope keeps locals private to that call.",
      },
      {
        prompt: "?? (nullish coalescing) replaces a value only when it is…",
        options: ["Falsy", "null or undefined", "0", "An empty array"],
        correctIndex: 1,
        explanation: "?? is the precise tool when 0/\"\" should survive.",
      },
    ],
  },
  {
    id: "js-arrays",
    title: "Arrays: Lists of Values",
    emoji: "4",
    description:
      "Ordered lists, indexes, and transforming collections without losing track of what changed.",
    youWillUnderstand:
      "An array is an ordered list; map transforms each item, filter keeps some, and new arrays avoid accidental mutation.",
    duration: "35–50 min",
    masteryRequired: 4,
    challenges: [
      {
        id: "js-a-double",
        title: "Transform every item (map)",
        teach: {
          idea: "map builds a new array by running a function on every element — same length, new values.",
          mentalModel: [
            "For each item, compute a new value.",
            "Collect those values into a brand-new array.",
            "Original array stays unchanged if you don't mutate it.",
          ],
          workedExample: {
            code: `function plusOne(nums) {
  return nums.map((n) => n + 1);
}`,
            walkthrough: ["[1,2] → [2,3]; length stays 2."],
          },
          misconception:
            "Using forEach and pushing is fine, but map's purpose is specifically 'transform to a new array'.",
        },
        prompt: "Write `doubleAll(nums)` that returns a new array with each number × 2.",
        functionName: "doubleAll",
        starterCode: `function doubleAll(nums) {
  // your code
}
`,
        hint: "return nums.map(n => n * 2);",
        concepts: ["arrays", "map", "immutability"],
        tests: [
          { name: "basic", args: [[1, 2, 3]], expected: [2, 4, 6] },
          { name: "empty", args: [[]], expected: [] },
          { name: "neg", args: [[-1]], expected: [-2], hidden: true },
        ],
        reflect: {
          prompt: "What does Array.map always return?",
          options: [
            "undefined",
            "A new array with one result per input item",
            "Only the first item",
            "The same array mutated in place",
          ],
          correctIndex: 1,
          explanation: "map → new array, same length, transformed items.",
        },
      },
      {
        id: "js-a-names",
        title: "Map over objects",
        teach: {
          idea: "Each array item can be an object. map can pull fields out into simpler values.",
          mentalModel: [
            "users[i] is an object with .first and .last.",
            "Build a display string from those fields.",
            "You still return one output per input.",
          ],
          workedExample: {
            code: `function emails(users) {
  return users.map((u) => u.email);
}`,
            walkthrough: ["Objects in → strings out."],
          },
          misconception:
            "Forgetting that map needs a returned value from the callback — side effects alone leave undefined holes.",
        },
        prompt:
          "Write `displayNames(users)` for `{ first, last }` objects → array of `\"First Last\"` strings.",
        functionName: "displayNames",
        starterCode: `function displayNames(users) {
  // your code
}
`,
        hint: "map to `${u.first} ${u.last}`",
        concepts: ["objects", "map"],
        tests: [
          {
            name: "two",
            args: [
              [
                { first: "Ada", last: "Lovelace" },
                { first: "Alan", last: "Turing" },
              ],
            ],
            expected: ["Ada Lovelace", "Alan Turing"],
          },
          { name: "empty", args: [[]], expected: [] },
        ],
        reflect: {
          prompt: "If your map callback doesn't return anything, each slot becomes…",
          options: ["0", "null", "undefined", "the original object"],
          correctIndex: 2,
          explanation: "Missing return → undefined in that position of the new array.",
        },
      },
      {
        id: "js-a-unique",
        title: "Sets and uniqueness",
        teach: {
          idea: "A Set stores unique values. Converting array → Set → array removes duplicates.",
          mentalModel: [
            "First time a value appears, Set keeps it.",
            "Later duplicates are ignored.",
            "Spread [...set] turns it back into an array (insertion order).",
          ],
          workedExample: {
            code: `function uniqueNums(nums) {
  return [...new Set(nums)];
}`,
            walkthrough: ["[1,1,2] → [1,2]"],
          },
          misconception:
            "Objects are unique by reference — two {a:1} literals are different Set entries.",
        },
        prompt:
          "Write `unique(items)` that returns unique values, keeping first-seen order.",
        functionName: "unique",
        starterCode: `function unique(items) {
  // your code
}
`,
        hint: "return [...new Set(items)];",
        concepts: ["Set", "arrays"],
        tests: [
          { name: "dups", args: [["a", "b", "a", "c"]], expected: ["a", "b", "c"] },
          { name: "nums", args: [[1, 1, 2]], expected: [1, 2], hidden: true },
        ],
        reflect: {
          prompt: "What does a Set guarantee?",
          options: [
            "Sorted order always",
            "Each value appears at most once",
            "Only numbers are allowed",
            "It mutates the original array",
          ],
          correctIndex: 1,
          explanation: "Uniqueness is the Set's job.",
        },
      },
      {
        id: "js-a-reverse",
        title: "Strings as character lists",
        teach: {
          idea: "Strings aren't arrays, but you can spread them into characters, reverse, and join back.",
          mentalModel: [
            "[...s] → array of characters.",
            ".reverse() flips that array (mutates it).",
            ".join(\"\") glues characters into one string.",
          ],
          workedExample: {
            code: `function backwards(s) {
  return [...s].reverse().join("");
}`,
            walkthrough: ['"ab" → ["a","b"] → ["b","a"] → "ba"'],
          },
          misconception:
            "Calling .reverse() on a string directly — strings don't have reverse; convert first.",
        },
        prompt: "Write `reverseStr(s)` that returns the characters of s reversed.",
        functionName: "reverseStr",
        starterCode: `function reverseStr(s) {
  // your code
}
`,
        hint: "return [...s].reverse().join('');",
        concepts: ["strings", "arrays"],
        tests: [
          { name: "abc", args: ["abc"], expected: "cba" },
          { name: "empty", args: [""], expected: "" },
          { name: "ab", args: ["ab"], expected: "ba", hidden: true },
        ],
        reflect: {
          prompt: "Why convert the string to an array before reversing?",
          options: [
            "Arrays are faster always",
            "String values don't provide .reverse(); arrays do",
            "join only works on numbers",
            "You must never reverse strings",
          ],
          correctIndex: 1,
          explanation: "Know which methods live on which types — core fluency.",
        },
      },
      {
        id: "js-a-anagram",
        title: "Compare structure, not appearance",
        teach: {
          idea: "Anagrams use the same letters. Sorting both strings makes comparison easy.",
          mentalModel: [
            "Split or spread to characters.",
            "Sort so order no longer matters.",
            "Join and compare equality.",
          ],
          workedExample: {
            code: `function sameLetters(a, b) {
  const norm = (s) => [...s].sort().join("");
  return norm(a) === norm(b);
}`,
            walkthrough: ['"ab" and "ba" both normalize to "ab".'],
          },
          misconception:
            "Comparing lengths alone — \"ab\" and \"cd\" same length but not anagrams.",
        },
        prompt: "Write `isAnagram(a, b)` — true if a and b use the same letters with the same counts.",
        functionName: "isAnagram",
        starterCode: `function isAnagram(a, b) {
  // your code
}
`,
        hint: "Sort both, or count letter frequencies.",
        concepts: ["strings", "sorting", "comparison"],
        tests: [
          { name: "yes", args: ["listen", "silent"], expected: true },
          { name: "no", args: ["hello", "world"], expected: false },
          { name: "len", args: ["a", "aa"], expected: false, hidden: true },
        ],
        reflect: {
          prompt: "Sorting both strings helps because…",
          options: [
            "Sorted strings are always shorter",
            "Letter order no longer matters — only the multiset of characters",
            "sort removes duplicates",
            "JavaScript requires sorted input",
          ],
          correctIndex: 1,
          explanation: "You normalize away order so you can compare content.",
        },
      },
    ],
    recall: [
      {
        prompt: "map vs filter — which keeps only some items?",
        options: ["map", "filter", "both always keep all", "join"],
        correctIndex: 1,
        explanation: "filter subsets; map transforms 1:1.",
      },
      {
        prompt: "Why prefer returning a new array instead of splicing the original while learning?",
        options: [
          "New arrays use zero memory",
          "Easier to understand — inputs stay intact; outputs are clear",
          "splice is illegal",
          "Tests forbid arrays",
        ],
        correctIndex: 1,
        explanation: "Immutability habits make data flow easier to trace.",
      },
    ],
  },
  {
    id: "js-objects",
    title: "Objects & Grouping Data",
    emoji: "5",
    description:
      "Named fields, grouping records, and shaping data the way real programs store information.",
    youWillUnderstand:
      "Objects group related properties; you can build new objects and group lists by a field.",
    duration: "30–45 min",
    masteryRequired: 3,
    challenges: [
      {
        id: "js-o-phone",
        title: "Slice and format strings",
        teach: {
          idea: "slice extracts a piece of a string by index ranges without changing the original.",
          mentalModel: [
            "Indexes start at 0.",
            "slice(0, 3) is characters at 0,1,2.",
            "Build the display format with a template literal.",
          ],
          workedExample: {
            code: `function areaCode(digits) {
  return digits.slice(0, 3);
}`,
            walkthrough: ['"7023790396".slice(0,3) → "702"'],
          },
          misconception:
            "Confusing slice end index as inclusive — the end index is exclusive.",
        },
        prompt:
          "Write `formatPhone(digits)` for a 10-digit string → `(XXX) XXX-XXXX`.",
        functionName: "formatPhone",
        starterCode: `function formatPhone(digits) {
  // your code
}
`,
        hint: "Slice 0-3, 3-6, 6-10 into a template string.",
        concepts: ["strings", "slice"],
        tests: [
          { name: "us", args: ["7023790396"], expected: "(702) 379-0396" },
          {
            name: "alt",
            args: ["5551234567"],
            expected: "(555) 123-4567",
            hidden: true,
          },
        ],
        reflect: {
          prompt: "In `slice(0, 3)`, is index 3 included?",
          options: ["Yes", "No — end index is exclusive", "Only in arrays", "Only with strings of length 10"],
          correctIndex: 1,
          explanation: "End index is exclusive in slice.",
        },
      },
      {
        id: "js-o-slug",
        title: "Normalize text step by step",
        teach: {
          idea: "Chain small transformations: lowercase → trim → replace spaces → strip junk.",
          mentalModel: [
            "Each step takes a string and returns a new string.",
            "Regex /[^a-z0-9-]/g means 'not letter, digit, or hyphen'.",
            "Order matters: lowercase before stripping letters.",
          ],
          workedExample: {
            code: `function clean(s) {
  return s.trim().toLowerCase();
}`,
            walkthrough: ["Trim edges, then lowercase."],
          },
          misconception:
            "Trying to do everything in one giant regex before understanding each step — learn the pipeline first.",
        },
        prompt:
          "Write `slugify(title)` — lowercase, trim, spaces → '-', remove characters that aren't letters/numbers/hyphens.",
        functionName: "slugify",
        starterCode: `function slugify(title) {
  // your code
}
`,
        hint: "toLowerCase, trim, replace spaces, replace unwanted chars with ''.",
        concepts: ["strings", "regex", "pipelines"],
        tests: [
          { name: "basic", args: ["Hello World"], expected: "hello-world" },
          { name: "trim", args: ["  Hire Me!  "], expected: "hire-me" },
          {
            name: "multi",
            args: ["JS Job Path"],
            expected: "js-job-path",
            hidden: true,
          },
        ],
        reflect: {
          prompt: "Why lowercase before stripping characters?",
          options: [
            "It doesn't matter",
            "So A-Z become a-z and survive as letters instead of being removed as 'unwanted'",
            "Regex only works on uppercase",
            "trim requires lowercase",
          ],
          correctIndex: 1,
          explanation:
            "If you strip with a lowercase-only allowed set first, uppercase letters disappear.",
        },
      },
      {
        id: "js-o-group",
        title: "Group rows into an object",
        teach: {
          idea: "Objects can hold arrays under keys. Grouping means push each item into the right bucket.",
          mentalModel: [
            "Start with {}.",
            "For each person, look at person.role.",
            "If that key missing, create []. Then push the name.",
          ],
          workedExample: {
            code: `function groupBy(items, key) {
  const out = {};
  for (const item of items) {
    const k = item[key];
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}`,
            walkthrough: ["Buckets grow as you scan the list."],
          },
          misconception:
            "Replacing the array each time (`out[k] = [name]`) instead of pushing — you lose earlier names.",
        },
        prompt:
          "Write `groupByRole(people)` for `{ name, role }` → object of role → name arrays.",
        functionName: "groupByRole",
        starterCode: `function groupByRole(people) {
  // your code
}
`,
        hint: "Accumulate into an object; push names into arrays per role.",
        concepts: ["objects", "grouping", "accumulation"],
        tests: [
          {
            name: "two roles",
            args: [
              [
                { name: "Ava", role: "eng" },
                { name: "Ben", role: "design" },
                { name: "Cy", role: "eng" },
              ],
            ],
            expected: { eng: ["Ava", "Cy"], design: ["Ben"] },
          },
          { name: "empty", args: [[]], expected: {} },
        ],
        reflect: {
          prompt: "What happens if you write `out[role] = [name]` every time instead of push?",
          options: [
            "Nothing — same result",
            "You keep only the last name for that role",
            "JavaScript throws",
            "All roles merge into one array",
          ],
          correctIndex: 1,
          explanation: "Assignment replaces the array; push grows it.",
        },
      },
      {
        id: "js-o-validate",
        title: "Return structured results",
        teach: {
          idea: "Real functions often return objects describing success or failure — not only true/false.",
          mentalModel: [
            "Check rules in order.",
            "On failure, return { ok: false, error: \"...\" } with a clear message.",
            "On success, return { ok: true }.",
          ],
          workedExample: {
            code: `function checkAge(age) {
  if (age < 0) return { ok: false, error: "Negative" };
  return { ok: true };
}`,
            walkthrough: ["Caller reads .ok, then .error if needed."],
          },
          misconception:
            "Throwing for every normal validation failure — prefer returned results for expected bad input.",
        },
        prompt:
          "Write `validateSignup({ email, password })` → `{ ok: true }` or `{ ok: false, error }`. email must include '@'; password length ≥ 8. Use errors \"Invalid email\" and \"Password too short\".",
        functionName: "validateSignup",
        starterCode: `function validateSignup({ email, password }) {
  // your code
}
`,
        hint: "Check email includes @, then password length.",
        concepts: ["objects", "validation", "destructuring"],
        tests: [
          {
            name: "ok",
            args: [{ email: "a@b.com", password: "password1" }],
            expected: { ok: true },
          },
          {
            name: "bad email",
            args: [{ email: "nope", password: "password1" }],
            expected: { ok: false, error: "Invalid email" },
          },
          {
            name: "short pw",
            args: [{ email: "a@b.com", password: "short" }],
            expected: { ok: false, error: "Password too short" },
            hidden: true,
          },
        ],
        reflect: {
          prompt: "Why return `{ ok, error }` instead of only `true/false`?",
          options: [
            "Objects are required by JavaScript",
            "Callers need to know what failed — a boolean alone loses the reason",
            "true/false cannot be returned from functions",
            "It makes the function impure",
          ],
          correctIndex: 1,
          explanation:
            "Structured results communicate meaning — understanding APIs starts here.",
        },
      },
    ],
    recall: [
      {
        prompt: "Object keys let you…",
        options: [
          "Only store numbers",
          "Look up related data by name",
          "Replace the need for functions",
          "Sort arrays automatically",
        ],
        correctIndex: 1,
        explanation: "Objects are named bags of properties.",
      },
      {
        prompt: "Destructuring `function f({ email })` means…",
        options: [
          "email is global",
          "Pull the email property from the argument object into a local name",
          "The function cannot return objects",
          "email must be a string length 8",
        ],
        correctIndex: 1,
        explanation: "Destructuring unpacks properties at the parameter boundary.",
      },
    ],
  },
  {
    id: "js-async",
    title: "Time, Async & Waiting",
    emoji: "6",
    description:
      "JavaScript doesn't freeze forever on slow work — promises and async/await let you wait on purpose.",
    youWillUnderstand:
      "A Promise represents a value that will exist later; await pauses an async function until that value arrives.",
    duration: "30–45 min",
    masteryRequired: 3,
    challenges: [
      {
        id: "js-as-parse",
        title: "Errors are values you can catch",
        teach: {
          idea: "Some operations throw when input is bad. try/catch lets you recover instead of crashing.",
          mentalModel: [
            "try runs the risky code.",
            "If it throws, catch runs.",
            "Return null (or an error object) so the caller can continue.",
          ],
          workedExample: {
            code: `function safeNumber(text) {
  try {
    const n = Number(text);
    if (Number.isNaN(n)) throw new Error("bad");
    return n;
  } catch {
    return null;
  }
}`,
            walkthrough: ["Bad input → null instead of a blown-up program."],
          },
          misconception:
            "Catching errors and ignoring them silently forever — at least return a clear fallback.",
        },
        prompt:
          "Write `safeParse(json)` — return the parsed value, or null if JSON.parse throws.",
        functionName: "safeParse",
        starterCode: `function safeParse(json) {
  // your code
}
`,
        hint: "try/catch around JSON.parse",
        concepts: ["errors", "JSON", "try/catch"],
        tests: [
          { name: "ok", args: ['{"a":1}'], expected: { a: 1 } },
          { name: "bad", args: ["{"], expected: null },
          { name: "arr", args: ["[1,2]"], expected: [1, 2], hidden: true },
        ],
        reflect: {
          prompt: "What does try/catch protect you from?",
          options: [
            "Slow networks only",
            "Thrown errors stopping your function abruptly",
            "Syntax errors in files you never run",
            "Making all bugs disappear forever",
          ],
          correctIndex: 1,
          explanation:
            "You handle expected failure paths so the rest of the program can decide what to do.",
        },
      },
      {
        id: "js-as-status",
        title: "Interpret results with ranges",
        teach: {
          idea: "HTTP success is a range (200–299), not a single magic number.",
          mentalModel: [
            "status >= 200 && status < 300 → success.",
            "404 is a valid number but means failure for the request.",
            "Separate 'did the call work?' from 'what was the body?'.",
          ],
          workedExample: {
            code: `function isRedirect(status) {
  return status >= 300 && status < 400;
}`,
            walkthrough: ["Ranges encode categories."],
          },
          misconception: "Only treating 200 as success — 201 and 204 are also OK.",
        },
        prompt: "Write `isSuccess(status)` — true for 200–299 inclusive.",
        functionName: "isSuccess",
        starterCode: `function isSuccess(status) {
  // your code
}
`,
        hint: "status >= 200 && status < 300",
        concepts: ["booleans", "ranges", "HTTP basics"],
        tests: [
          { name: "200", args: [200], expected: true },
          { name: "404", args: [404], expected: false },
          { name: "201", args: [201], expected: true, hidden: true },
          { name: "299", args: [299], expected: true, hidden: true },
        ],
        reflect: {
          prompt: "Why is 201 considered success?",
          options: [
            "It isn't",
            "It's in the 2xx range — created successfully",
            "Because 201 > 404",
            "Only browsers decide that",
          ],
          correctIndex: 1,
          explanation: "Learn categories (2xx/4xx/5xx), not one lucky code.",
        },
      },
      {
        id: "js-as-delay",
        title: "async / await: waiting on purpose",
        teach: {
          idea: "async functions can pause at await until a Promise finishes, then continue with the result.",
          mentalModel: [
            "wait(ms) returns a Promise that resolves later.",
            "await wait(10) pauses this async function ~10ms.",
            "Then you return the greeting as usual.",
          ],
          workedExample: {
            code: `async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function later(value) {
  await wait(5);
  return value;
}`,
            walkthrough: [
              "await doesn't block the whole browser — it pauses this function.",
              "Code after await runs when the Promise resolves.",
            ],
          },
          misconception:
            "Forgetting async on the function that uses await — await is only legal in async functions (or modules at top level).",
          predict: {
            code: `async function f() {
  return 1;
}`,
            question: "What type of value do you get from calling f()?",
            options: ["number 1 immediately as a plain value", "a Promise that fulfills with 1", "undefined", "a string"],
            correctIndex: 1,
            explanation: "async functions always return Promises.",
          },
        },
        prompt:
          "Write async `greetLater(name)` that awaits the provided `wait(10)`, then returns `Hello, <name>!`.",
        functionName: "greetLater",
        starterCode: `async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function greetLater(name) {
  // await wait(10), then return greeting
}
`,
        hint: "await wait(10); return `Hello, ${name}!`;",
        concepts: ["async", "await", "promises"],
        tests: [
          { name: "maya", args: ["Maya"], expected: "Hello, Maya!" },
          { name: "dev", args: ["Dev"], expected: "Hello, Dev!", hidden: true },
        ],
        reflect: {
          prompt: "What does `await` do inside an async function?",
          options: [
            "Crashes on purpose",
            "Pauses that function until the Promise settles, then continues",
            "Converts strings to numbers",
            "Skips the next line forever",
          ],
          correctIndex: 1,
          explanation:
            "await is structured waiting — the key mental model for asynchronous JS.",
        },
      },
      {
        id: "js-as-palindrome",
        title: "Reuse skills: compose what you know",
        teach: {
          idea: "Understanding sticks when you reuse earlier tools in a new problem — reverse + compare.",
          mentalModel: [
            "A palindrome reads the same forwards and backwards.",
            "Compute the reversed string and compare with ===.",
            "Composition > memorizing a brand-new trick each time.",
          ],
          workedExample: {
            code: `function mirror(s) {
  return [...s].reverse().join("");
}
function same(a, b) {
  return a === b;
}`,
            walkthrough: ["Build small pieces, then combine."],
          },
          misconception:
            "Believing each new problem needs unknown syntax — most 'new' tasks remix fundamentals.",
        },
        prompt:
          "Write `isPalindrome(s)` — true if s equals its reverse (case-sensitive, no cleaning).",
        functionName: "isPalindrome",
        starterCode: `function isPalindrome(s) {
  // your code
}
`,
        hint: "Compare s to [...s].reverse().join('').",
        concepts: ["composition", "strings"],
        tests: [
          { name: "aba", args: ["aba"], expected: true },
          { name: "ab", args: ["ab"], expected: false },
          { name: "a", args: ["a"], expected: true, hidden: true },
        ],
        reflect: {
          prompt: "How does this challenge prove learning is sticking?",
          options: [
            "It introduces brand-new syntax only",
            "It makes you reuse earlier string/array skills in a new combination",
            "It avoids functions",
            "It only tests spelling",
          ],
          correctIndex: 1,
          explanation:
            "Transfer — using old tools in new situations — is real understanding.",
        },
      },
    ],
    recall: [
      {
        prompt: "`await` can be used…",
        options: [
          "In any function",
          "Inside an async function",
          "Only after console.log",
          "Instead of return always",
        ],
        correctIndex: 1,
        explanation: "async marks a function that may pause on Promises.",
      },
      {
        prompt: "JSON.parse('{\"a\":1}') returns…",
        options: ["a string", "an object { a: 1 }", "always null", "a Promise"],
        correctIndex: 1,
        explanation: "Parsing turns JSON text into real JS values.",
      },
      {
        prompt: "The big idea of asynchronous JS is…",
        options: [
          "JS never waits for anything",
          "Slow work can finish later while other code stays responsive; you wait with Promises/await",
          "All code runs in random order always",
          "Variables become optional",
        ],
        correctIndex: 1,
        explanation:
          "You learn to model time — not just syntax for async/await keywords.",
      },
    ],
  },
  {
    id: "js-dom",
    title: "The DOM: Talking to the Page",
    emoji: "7",
    description:
      "The Document Object Model is how JavaScript finds, creates, and changes page elements.",
    youWillUnderstand:
      "The DOM is a tree of nodes; you select nodes, then read or change their content and structure.",
    duration: "35–50 min",
    masteryRequired: 3,
    challenges: [
      {
        id: "js-d-create",
        title: "Create an element",
        runtime: "dom",
        teach: {
          idea: "document.createElement builds a node in memory. It is not on the page until you append it.",
          mentalModel: [
            "createElement('button') makes a BUTTON node.",
            "textContent sets the visible text inside that node.",
            "appendChild attaches it under a parent (often document.body).",
          ],
          workedExample: {
            code: `function makeLabel(text) {
  const el = document.createElement("span");
  el.textContent = text;
  return el;
}`,
            walkthrough: [
              "Create → set text → return the node.",
              "Caller can append it wherever it belongs.",
            ],
          },
          misconception:
            "Thinking createElement instantly shows something on screen — you must append (or insert) it into the tree.",
          predict: {
            code: `const el = document.createElement("p");
el.textContent = "Hi";
// not appended yet`,
            question: "Where is the paragraph right now?",
            options: [
              "Visible at the top of the page",
              "Only in memory until something appends it",
              "Inside localStorage",
              "Deleted automatically",
            ],
            correctIndex: 1,
            explanation: "Created nodes exist in memory first; the tree placement makes them visible.",
          },
        },
        prompt:
          "Write `createButton(label)` that creates a `button` element, sets its textContent to label, and returns it (do not append).",
        functionName: "createButton",
        starterCode: `function createButton(label) {
  // use document.createElement
}
`,
        hint: "const btn = document.createElement('button'); btn.textContent = label; return btn;",
        concepts: ["DOM", "createElement", "textContent"],
        tests: [
          {
            name: "label",
            args: ["Save"],
            expected: "Save",
            expectReturnProp: "textContent",
          },
          {
            name: "tag",
            args: ["Go"],
            expected: "BUTTON",
            expectReturnProp: "tagName",
            hidden: true,
          },
        ],
        reflect: {
          prompt: "When does a created element appear on the page?",
          options: [
            "As soon as createElement runs",
            "After it is inserted into the document tree (e.g. appendChild)",
            "Only after a page refresh",
            "Never — elements cannot be created in JS",
          ],
          correctIndex: 1,
          explanation: "Visibility follows tree attachment, not creation alone.",
        },
      },
      {
        id: "js-d-select",
        title: "Find nodes on the page",
        runtime: "dom",
        teach: {
          idea: "querySelector finds the first match; getElementById looks up an id. Selection is how you grab what you will change.",
          mentalModel: [
            "#title means id=\"title\".",
            ".card means a class name.",
            "button means a tag name.",
            "If nothing matches, you get null — always consider that case.",
          ],
          workedExample: {
            code: `function readTitle() {
  const el = document.querySelector("#title");
  return el ? el.textContent : "";
}`,
            walkthrough: ["Select → read textContent → handle null."],
          },
          misconception:
            "Assuming querySelector always finds something — missing elements return null and will crash if you ignore that.",
        },
        prompt:
          "Write `getTextById(id)` that returns the textContent of the element with that id, or \"\" if missing.",
        functionName: "getTextById",
        starterCode: `function getTextById(id) {
  // document.getElementById or querySelector
}
`,
        hint: "const el = document.getElementById(id); return el ? el.textContent : \"\";",
        concepts: ["querySelector", "getElementById", "null"],
        tests: [
          {
            name: "found",
            args: ["hero"],
            domHtml: `<h1 id="hero">Welcome</h1>`,
            expected: "Welcome",
          },
          {
            name: "missing",
            args: ["nope"],
            domHtml: `<h1 id="hero">Welcome</h1>`,
            expected: "",
            hidden: true,
          },
        ],
        reflect: {
          prompt: "Why check for null after selecting an element?",
          options: [
            "null means the CSS is wrong only",
            "The element might not exist — calling properties on null throws",
            "querySelector never returns null",
            "null automatically becomes an empty div",
          ],
          correctIndex: 1,
          explanation: "Defensive selection prevents runtime crashes when markup differs.",
        },
      },
      {
        id: "js-d-update",
        title: "Change what the user sees",
        runtime: "dom",
        teach: {
          idea: "Once you have a node, assigning textContent (or className) updates the live page if that node is in the tree.",
          mentalModel: [
            "Selection gives you a reference to the same node the browser shows.",
            "Mutating that object updates the UI.",
            "Prefer textContent for plain text (safer than innerHTML for untrusted strings).",
          ],
          workedExample: {
            code: `function shout(el) {
  el.textContent = el.textContent + "!";
}`,
            walkthrough: ["Read current text, write a new string back."],
          },
          misconception:
            "Creating a brand-new element every time instead of updating the existing one — you usually mutate the node you found.",
        },
        prompt:
          "Write `setHeading(text)` that finds `#heading` and sets its textContent to text. Return true if found, false if not.",
        functionName: "setHeading",
        starterCode: `function setHeading(text) {
  // find #heading, update textContent
}
`,
        hint: "const el = document.querySelector('#heading'); if (!el) return false; el.textContent = text; return true;",
        concepts: ["DOM updates", "textContent"],
        tests: [
          {
            name: "update",
            args: ["Learn JS"],
            domHtml: `<h2 id="heading">Old</h2>`,
            expected: "Learn JS",
            expectDom: { selector: "#heading", prop: "textContent" },
          },
          {
            name: "missing",
            args: ["X"],
            domHtml: `<p id="other">Hi</p>`,
            expected: false,
            hidden: true,
          },
        ],
        reflect: {
          prompt: "Why is textContent often safer than innerHTML for plain text?",
          options: [
            "textContent is faster in every browser always",
            "innerHTML can interpret HTML/JS — risky with untrusted strings; textContent sets text only",
            "textContent cannot show letters",
            "innerHTML is illegal",
          ],
          correctIndex: 1,
          explanation: "Knowing the difference prevents XSS-style mistakes while you learn.",
        },
      },
      {
        id: "js-d-class",
        title: "Classes as UI state",
        runtime: "dom",
        teach: {
          idea: "CSS classes are how pages express state (active, open, error). classList.add/remove/toggle changes that state from JS.",
          mentalModel: [
            "classList.add('active') attaches a class token.",
            "toggle flips membership.",
            "CSS rules then change appearance — JS manages state, CSS manages look.",
          ],
          workedExample: {
            code: `function activate(el) {
  el.classList.add("active");
}`,
            walkthrough: ["JS flips state; stylesheet defines what .active looks like."],
          },
          misconception:
            "Setting style.color for every tiny UI change — classes keep behavior and design cleaner.",
        },
        prompt:
          "Write `markActive(id)` that adds the class `active` to the element with that id. Return true if found, false otherwise.",
        functionName: "markActive",
        starterCode: `function markActive(id) {
  // getElementById + classList.add
}
`,
        hint: "const el = document.getElementById(id); if (!el) return false; el.classList.add('active'); return true;",
        concepts: ["classList", "UI state"],
        tests: [
          {
            name: "add",
            args: ["tab"],
            domHtml: `<button id="tab">Home</button>`,
            expected: "active",
            expectDom: { selector: "#tab", prop: "className" },
          },
          {
            name: "missing",
            args: ["nope"],
            expected: false,
            hidden: true,
          },
        ],
        reflect: {
          prompt: "What is the clean division of responsibility?",
          options: [
            "JS should hard-code every color; CSS is optional",
            "JS toggles state (classes); CSS defines how that state looks",
            "CSS listens for clicks",
            "classList only works on body",
          ],
          correctIndex: 1,
          explanation: "This mental model scales from tiny widgets to full apps.",
        },
      },
    ],
    recall: [
      {
        prompt: "document.createElement creates a node that is…",
        options: [
          "Always visible immediately",
          "In memory until inserted into the document",
          "Stored in CSS",
          "Only available after await",
        ],
        correctIndex: 1,
        explanation: "Create vs attach are separate steps.",
      },
      {
        prompt: "querySelector('.card') looks for…",
        options: [
          "An element with id card",
          "An element with class card",
          "A <card> tag only in SVG",
          "A JavaScript variable named card",
        ],
        correctIndex: 1,
        explanation: "Dot prefix means class selector.",
      },
      {
        prompt: "If getElementById cannot find an id, it returns…",
        options: ["undefined", "null", "false", "an empty string"],
        correctIndex: 1,
        explanation: "null means 'no node' — check before use.",
      },
    ],
  },
  {
    id: "js-events",
    title: "Events: Responding to the User",
    emoji: "8",
    description:
      "Clicks, typing, and submits are events. You listen, then run a function when they happen.",
    youWillUnderstand:
      "addEventListener registers a handler; the browser calls it later with an event object describing what happened.",
    duration: "35–50 min",
    masteryRequired: 3,
    challenges: [
      {
        id: "js-e-listen",
        title: "Wire a click listener",
        runtime: "dom",
        teach: {
          idea: "addEventListener(type, handler) means: when this event occurs on this element, run the handler.",
          mentalModel: [
            "You pass a function — you do not call it yourself with ().",
            "The browser calls it later.",
            "The handler receives an event object (target, type, …).",
          ],
          workedExample: {
            code: `function wire(btn, fn) {
  btn.addEventListener("click", fn);
}`,
            walkthrough: [
              "Register now, run later on click.",
              "fn is the callback reference.",
            ],
          },
          misconception:
            "Writing addEventListener('click', handler()) — the () runs immediately and wires whatever it returned (often undefined).",
          predict: {
            code: `button.addEventListener("click", handler());`,
            question: "What is wrong?",
            options: [
              "Nothing",
              "handler() runs immediately; you should pass handler without calling it",
              "click is not a real event",
              "addEventListener only works on window",
            ],
            correctIndex: 1,
            explanation: "Pass the function value; let the browser call it later.",
          },
        },
        prompt:
          "Write `onClick(el, handler)` that adds a click listener to el using handler.",
        functionName: "onClick",
        starterCode: `function onClick(el, handler) {
  // addEventListener
}
`,
        hint: "el.addEventListener('click', handler);",
        concepts: ["addEventListener", "callbacks"],
        tests: [
          {
            name: "fires",
            args: [{ __elId: "go" }, null],
            domHtml: `<button id="go">Go</button>`,
            expected: 1,
            afterCall: {
              injectClickHandler: true,
              clicks: [{ selector: "#go", times: 1 }],
              expectClickCount: true,
            },
          },
          {
            name: "three",
            args: [{ __elId: "go" }, null],
            domHtml: `<button id="go">Go</button>`,
            expected: 3,
            afterCall: {
              injectClickHandler: true,
              clicks: [{ selector: "#go", times: 3 }],
              expectClickCount: true,
            },
            hidden: true,
          },
        ],
        reflect: {
          prompt: "Why pass `handler` and not `handler()` to addEventListener?",
          options: [
            "Because parentheses are illegal",
            "You want to give the browser the function to call later, not run it now",
            "handler() returns a better function always",
            "addEventListener ignores functions",
          ],
          correctIndex: 1,
          explanation: "Callbacks are values — calling vs passing is a core JS skill.",
        },
      },
      {
        id: "js-e-counter",
        title: "Update the DOM from an event",
        runtime: "dom",
        teach: {
          idea: "Handlers close over variables and DOM nodes. Each click can change state and refresh the display.",
          mentalModel: [
            "let count = 0 lives in the surrounding function.",
            "On click: count++, then write count into a display element's textContent.",
            "The closure remembers count between clicks.",
          ],
          workedExample: {
            code: `function wireToggle(btn, box) {
  let on = false;
  btn.addEventListener("click", () => {
    on = !on;
    box.textContent = on ? "ON" : "OFF";
  });
}`,
            walkthrough: ["State in a let; handler updates both state and UI."],
          },
          misconception:
            "Putting let count = 0 inside the handler — it resets every click.",
        },
        prompt:
          "Write `makeClickCounter(button, display)` that starts at 0 and each click increases the count and sets display.textContent to that number (as a string).",
        functionName: "makeClickCounter",
        starterCode: `function makeClickCounter(button, display) {
  // listen for clicks; update display.textContent
}
`,
        hint: "let count = 0; button.addEventListener('click', () => { count++; display.textContent = String(count); });",
        concepts: ["closures", "events", "DOM updates"],
        tests: [
          {
            name: "three clicks",
            args: [{ __elId: "btn" }, { __elId: "out" }],
            domHtml: `<button id="btn">+</button>\n<span id="out">0</span>`,
            expected: "3",
            afterCall: {
              clicks: [{ selector: "#btn", times: 3 }],
            },
            expectDom: { selector: "#out", prop: "textContent" },
          },
          {
            name: "one click",
            args: [{ __elId: "btn" }, { __elId: "out" }],
            domHtml: `<button id="btn">+</button>\n<span id="out">0</span>`,
            expected: "1",
            afterCall: {
              clicks: [{ selector: "#btn", times: 1 }],
            },
            expectDom: { selector: "#out", prop: "textContent" },
            hidden: true,
          },
        ],
        reflect: {
          prompt: "Where should `let count = 0` live?",
          options: [
            "Inside the click handler",
            "Outside the handler, in makeClickCounter, so it survives between clicks",
            "In CSS",
            "As a function parameter that resets automatically",
          ],
          correctIndex: 1,
          explanation: "Closure state must outlive a single handler call.",
        },
      },
      {
        id: "js-e-target",
        title: "Read the event object",
        runtime: "plain",
        teach: {
          idea: "The event object describes what happened. event.target is the element that originated the event.",
          mentalModel: [
            "Handlers receive one argument: the event.",
            "event.type is 'click', 'input', etc.",
            "event.target is the source node (or a stand-in object in our practice tests).",
          ],
          workedExample: {
            code: `function typeOfEvent(event) {
  return event.type;
}`,
            walkthrough: ["Read properties; don't guess."],
          },
          misconception:
            "Ignoring the event parameter and using global variables for which button was clicked — target tells you.",
        },
        prompt:
          "Write `clickedId(event)` that returns event.target.id (or \"\" if missing).",
        functionName: "clickedId",
        starterCode: `function clickedId(event) {
  // read event.target.id
}
`,
        hint: "return event.target?.id ?? \"\";",
        concepts: ["event object", "target"],
        tests: [
          {
            name: "id",
            args: [{ target: { id: "save" }, type: "click" }],
            expected: "save",
          },
          {
            name: "missing",
            args: [{ target: {}, type: "click" }],
            expected: "",
            hidden: true,
          },
        ],
        reflect: {
          prompt: "What is event.target?",
          options: [
            "Always document.body",
            "The element where the event originated",
            "The CSS file",
            "A string of HTML",
          ],
          correctIndex: 1,
          explanation: "target connects the event back to the UI piece that caused it.",
        },
      },
      {
        id: "js-e-prevent",
        title: "preventDefault for forms",
        runtime: "dom",
        teach: {
          idea: "Some events have default browser behavior (form submit reloads the page). preventDefault() stops that so your JS can handle it.",
          mentalModel: [
            "Listen for 'submit' on the form.",
            "In the handler, call event.preventDefault().",
            "Then read fields and run your logic.",
          ],
          workedExample: {
            code: `function hijack(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}`,
            walkthrough: ["Stop reload; keep the SPA/page under your control."],
          },
          misconception:
            "Forgetting preventDefault and wondering why the page flashes blank after submit.",
        },
        prompt:
          "Write `preventSubmit(form)` that listens for submit and calls event.preventDefault().",
        functionName: "preventSubmit",
        starterCode: `function preventSubmit(form) {
  // submit + preventDefault
}
`,
        hint: "form.addEventListener('submit', (event) => { event.preventDefault(); });",
        concepts: ["submit", "preventDefault"],
        tests: [
          {
            name: "prevented",
            args: [{ __elId: "f" }],
            domHtml: `<form id="f"></form>`,
            expected: true,
            afterCall: {
              submits: [{ selector: "#f" }],
              expectSubmitPrevented: true,
            },
          },
        ],
        reflect: {
          prompt: "Why call preventDefault on form submit in many JS apps?",
          options: [
            "To make CSS load faster",
            "To stop the browser's default reload/navigation so your code can handle the data",
            "Because forms are illegal without it",
            "To delete the form",
          ],
          correctIndex: 1,
          explanation: "You take control of the flow instead of a full page refresh.",
        },
      },
    ],
    recall: [
      {
        prompt: "addEventListener('click', handler) — which is correct?",
        options: [
          "Pass handler()",
          "Pass handler without calling it",
          "Pass a string of code only",
          "Events cannot use functions",
        ],
        correctIndex: 1,
        explanation: "Hand the function over; the browser calls it later.",
      },
      {
        prompt: "A closure in an event handler is useful because…",
        options: [
          "It deletes variables",
          "The handler can remember variables from the outer function between events",
          "It blocks all clicks",
          "It replaces addEventListener",
        ],
        correctIndex: 1,
        explanation: "State + handler together power interactive UI.",
      },
      {
        prompt: "event.preventDefault() …",
        options: [
          "Removes the element",
          "Stops the browser's default action for that event",
          "Pauses JavaScript forever",
          "Clears localStorage",
        ],
        correctIndex: 1,
        explanation: "Essential for controlled forms and custom link behavior.",
      },
    ],
  },
  {
    id: "js-modules",
    title: "Modules: Organizing Real Programs",
    emoji: "9",
    description:
      "Programs grow. Modules split code into files with clear exports (public) and imports (dependencies).",
    youWillUnderstand:
      "A module hides its internals and publishes a small public API via export; other files import only what they need.",
    duration: "30–45 min",
    masteryRequired: 3,
    challenges: [
      {
        id: "js-m-exports",
        title: "Design a public API",
        teach: {
          idea: "Not every function in a file should be public. export chooses the API other modules may use.",
          mentalModel: [
            "Internal helpers stay private (no export).",
            "Named exports publish specific bindings.",
            "A clear API is easier to understand and test.",
          ],
          workedExample: {
            code: `// math.js (conceptually)
function clamp(n, min, max) { /* private helper in real files */ }
export function add(a, b) { return a + b; }`,
            walkthrough: ["Export only what callers need."],
          },
          misconception:
            "Exporting everything 'just in case' — that couples the whole program to internals.",
        },
        prompt:
          "Write `pickExports(fns)` where fns is `{ add, sub, _helper }`. Return a new object with only `add` and `sub` (the public API).",
        functionName: "pickExports",
        starterCode: `function pickExports(fns) {
  // return { add, sub } from fns
}
`,
        hint: "return { add: fns.add, sub: fns.sub };",
        concepts: ["modules", "exports", "API design"],
        tests: [
          {
            name: "public only",
            args: [
              {
                add: "ADD_FN",
                sub: "SUB_FN",
                _helper: "PRIVATE",
              },
            ],
            expected: { add: "ADD_FN", sub: "SUB_FN" },
          },
          {
            name: "no helper",
            args: [{ add: 1, sub: 2, _helper: 3 }],
            expected: { add: 1, sub: 2 },
            hidden: true,
          },
        ],
        reflect: {
          prompt: "Why keep helpers private inside a module?",
          options: [
            "JavaScript forbids more than two exports",
            "Callers should depend on a small stable API — internals can change safely",
            "Private functions run faster always",
            "Imports cannot use names with vowels",
          ],
          correctIndex: 1,
          explanation: "Encapsulation is how large codebases stay understandable.",
        },
      },
      {
        id: "js-m-import",
        title: "Resolve a named import",
        teach: {
          idea: "import { add } from './math.js' means: load that module, take its exported add binding.",
          mentalModel: [
            "A module table maps file names → exported objects.",
            "Named import copies/links one export into your local name.",
            "If the export is missing, that is a bug in the dependency contract.",
          ],
          workedExample: {
            code: `function getExport(mod, name) {
  return mod[name];
}`,
            walkthrough: ["Imports are lookups into another module's exports."],
          },
          misconception:
            "Thinking import copies the whole file into yours as editable source — you receive bindings/values, not a paste of the file.",
        },
        prompt:
          "Write `namedImport(moduleExports, name)` that returns moduleExports[name], or null if missing.",
        functionName: "namedImport",
        starterCode: `function namedImport(moduleExports, name) {
  // your code
}
`,
        hint: "if (!(name in moduleExports)) return null; return moduleExports[name];",
        concepts: ["import", "named exports"],
        tests: [
          {
            name: "hit",
            args: [{ add: 1, sub: 2 }, "add"],
            expected: 1,
          },
          {
            name: "miss",
            args: [{ add: 1 }, "mul"],
            expected: null,
            hidden: true,
          },
        ],
        reflect: {
          prompt: "A named import `import { add } from './math.js'` needs…",
          options: [
            "math.js to export add",
            "add to be a global variable only",
            "CSS to define add",
            "The browser to ignore modules",
          ],
          correctIndex: 0,
          explanation: "Imports and exports are a contract between files.",
        },
      },
      {
        id: "js-m-default",
        title: "Default vs named exports",
        teach: {
          idea: "A module may have one default export (the 'main' value) plus any number of named exports.",
          mentalModel: [
            "default export → import Helper from './x.js'",
            "named export → import { util } from './x.js'",
            "You can combine: import Helper, { util } from './x.js'",
          ],
          workedExample: {
            code: `// conceptually
// export default function Main() {}
// export function helper() {}`,
            walkthrough: ["Default is the primary; named are extras."],
          },
          misconception:
            "Believing default and name 'default' are unrelated — import packing often stores it under the key default.",
        },
        prompt:
          "Write `bundleModule(main, named)` that returns `{ default: main, ...named }` — the shape many tools use for a module namespace.",
        functionName: "bundleModule",
        starterCode: `function bundleModule(main, named) {
  // return object with default + named keys
}
`,
        hint: "return { default: main, ...named };",
        concepts: ["default export", "named exports"],
        tests: [
          {
            name: "shape",
            args: ["MAIN", { util: "U", version: 1 }],
            expected: { default: "MAIN", util: "U", version: 1 },
          },
          {
            name: "empty named",
            args: ["ONLY", {}],
            expected: { default: "ONLY" },
            hidden: true,
          },
        ],
        reflect: {
          prompt: "How many default exports can a module have?",
          options: ["Unlimited", "One", "Exactly two", "Zero always"],
          correctIndex: 1,
          explanation: "One default keeps the 'main' export unambiguous.",
        },
      },
      {
        id: "js-m-graph",
        title: "Dependencies are a graph",
        teach: {
          idea: "Apps are graphs of modules. A depends on B means A imports from B. Clear one-way dependencies are easier to understand.",
          mentalModel: [
            "List each module's imports.",
            "If A imports B, B should not import A (avoid cycles while learning).",
            "Small leaf modules (no imports) are easiest to test.",
          ],
          workedExample: {
            code: `function dependents(graph, name) {
  return Object.keys(graph).filter((k) => graph[k].includes(name));
}`,
            walkthrough: ["Who depends on me? Invert the import list."],
          },
          misconception:
            "Circular imports 'just to make it work' — they often create temporal dead zones and hard-to-trace bugs.",
        },
        prompt:
          "Write `directImports(graph, name)` where graph maps module → string[] of imports. Return that module's import list, or [] if unknown.",
        functionName: "directImports",
        starterCode: `function directImports(graph, name) {
  // your code
}
`,
        hint: "return graph[name] ? [...graph[name]] : [];",
        concepts: ["dependency graph", "imports"],
        tests: [
          {
            name: "app",
            args: [
              { app: ["api", "ui"], api: ["lib"], ui: ["lib"], lib: [] },
              "app",
            ],
            expected: ["api", "ui"],
          },
          {
            name: "leaf",
            args: [{ lib: [] }, "lib"],
            expected: [],
            hidden: true,
          },
          {
            name: "missing",
            args: [{ lib: [] }, "nope"],
            expected: [],
            hidden: true,
          },
        ],
        reflect: {
          prompt: "Why avoid circular dependencies while you are learning?",
          options: [
            "Browsers ban all imports",
            "Cycles make load order and initialization hard to reason about",
            "They make files smaller",
            "export stops working with vowels",
          ],
          correctIndex: 1,
          explanation: "Acyclic graphs keep program structure understandable end-to-end.",
        },
      },
    ],
    recall: [
      {
        prompt: "export is how a module…",
        options: [
          "Hides all functions",
          "Publishes a public API to other modules",
          "Deletes unused code",
          "Styles the page",
        ],
        correctIndex: 1,
        explanation: "Exports define what outsiders may depend on.",
      },
      {
        prompt: "import { add } from './math.js' is a…",
        options: [
          "Default import",
          "Named import",
          "CSS import",
          "Circular import always",
        ],
        correctIndex: 1,
        explanation: "Curly braces mark named imports.",
      },
      {
        prompt: "A good module boundary…",
        options: [
          "Exports every internal helper",
          "Exposes a small clear API and keeps helpers private",
          "Avoids functions",
          "Must be 1000+ lines",
        ],
        correctIndex: 1,
        explanation: "This is how beginners grow into real codebases without getting lost.",
      },
    ],
  },
];

export function getJsModule(id: string): JsModule | undefined {
  return JS_JOB_PATH_MODULES.find((m) => m.id === id);
}

export function getJsChallenge(
  moduleId: string,
  challengeId: string,
): { module: JsModule; challenge: JsChallenge } | undefined {
  const module = getJsModule(moduleId);
  const challenge = module?.challenges.find((c) => c.id === challengeId);
  if (!module || !challenge) return undefined;
  return { module, challenge };
}
