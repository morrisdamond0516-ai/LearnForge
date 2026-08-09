import { JS_JOB_PATH_MODULES } from "../src/lib/educational-games/js-job-path-content";
import { runJsChallenge } from "../src/lib/educational-games/js-playground-runner";

const samples: [string, string, string][] = [
  [
    "js-values",
    "js-v-greet",
    `function greet(name) {
  if (!name) return "Hello, friend!";
  return \`Hello, \${name}!\`;
}`,
  ],
  [
    "js-dom",
    "js-d-create",
    `function createButton(label) {
  const btn = document.createElement("button");
  btn.textContent = label;
  return btn;
}`,
  ],
  [
    "js-dom",
    "js-d-update",
    `function setHeading(text) {
  const el = document.querySelector("#heading");
  if (!el) return false;
  el.textContent = text;
  return true;
}`,
  ],
  [
    "js-events",
    "js-e-listen",
    `function onClick(el, handler) {
  el.addEventListener("click", handler);
}`,
  ],
  [
    "js-events",
    "js-e-counter",
    `function makeClickCounter(button, display) {
  let count = 0;
  button.addEventListener("click", () => {
    count++;
    display.textContent = String(count);
  });
}`,
  ],
  [
    "js-events",
    "js-e-prevent",
    `function preventSubmit(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}`,
  ],
  [
    "js-modules",
    "js-m-exports",
    `function pickExports(fns) {
  return { add: fns.add, sub: fns.sub };
}`,
  ],
  [
    "js-modules",
    "js-m-default",
    `function bundleModule(main, named) {
  return { default: main, ...named };
}`,
  ],
];

async function main() {
  let failed = 0;
  for (const [mid, cid, code] of samples) {
    const mod = JS_JOB_PATH_MODULES.find((m) => m.id === mid);
    const ch = mod?.challenges.find((c) => c.id === cid);
    if (!ch) {
      console.log(cid, "MISSING");
      failed++;
      continue;
    }
    const r = await runJsChallenge(
      code,
      ch.functionName,
      ch.tests,
      ch.runtime ?? "plain",
    );
    console.log(
      cid,
      r.ok ? "PASS" : "FAIL",
      r.compileError ?? `${r.passedCount}/${r.totalCount}`,
    );
    if (!r.ok) {
      failed++;
      console.log(r.results.filter((x) => !x.passed));
    }
  }
  console.log(
    "modules",
    JS_JOB_PATH_MODULES.length,
    "challenges",
    JS_JOB_PATH_MODULES.reduce((n, m) => n + m.challenges.length, 0),
  );
  if (failed) process.exit(1);
}

main();
