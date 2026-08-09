import type { JsTestCase } from "./js-job-path-content";

export type JsTestResult = {
  name: string;
  hidden?: boolean;
  passed: boolean;
  expected: unknown;
  actual?: unknown;
  error?: string;
};

export type JsRunResult = {
  ok: boolean;
  compileError?: string;
  results: JsTestResult[];
  passedCount: number;
  totalCount: number;
};

export type JsRuntime = "plain" | "dom";

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const ak = Object.keys(a as object).sort();
    const bk = Object.keys(b as object).sort();
    if (ak.length !== bk.length) return false;
    if (!ak.every((k, i) => k === bk[i])) return false;
    return ak.every((k) =>
      deepEqual(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    );
  }
  return false;
}

function formatValue(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

type MockListener = (event: Record<string, unknown>) => void;

/** Minimal practice DOM so learners can use document/createElement/events in lessons. */
function createPracticeDom() {
  class ClassList {
    private names = new Set<string>();
    constructor(private el: MockEl) {}
    add(...tokens: string[]) {
      for (const t of tokens) if (t) this.names.add(t);
      this.el.className = [...this.names].join(" ");
    }
    remove(...tokens: string[]) {
      for (const t of tokens) this.names.delete(t);
      this.el.className = [...this.names].join(" ");
    }
    contains(token: string) {
      return this.names.has(token);
    }
    toggle(token: string) {
      if (this.names.has(token)) this.remove(token);
      else this.add(token);
      return this.names.has(token);
    }
    syncFromClassName() {
      this.names = new Set(this.el.className.split(/\s+/).filter(Boolean));
    }
  }

  class MockEl {
    tagName: string;
    id = "";
    className = "";
    textContent = "";
    children: MockEl[] = [];
    parentNode: MockEl | null = null;
    style: Record<string, string> = {};
    classList: ClassList;
    private attrs = new Map<string, string>();
    private listeners = new Map<string, MockListener[]>();

    constructor(tagName: string) {
      this.tagName = tagName.toUpperCase();
      this.classList = new ClassList(this);
    }

    appendChild(child: MockEl) {
      if (child.parentNode) {
        child.parentNode.children = child.parentNode.children.filter(
          (c) => c !== child,
        );
      }
      child.parentNode = this;
      this.children.push(child);
      return child;
    }

    setAttribute(name: string, value: string) {
      this.attrs.set(name, String(value));
      if (name === "id") this.id = String(value);
      if (name === "class") {
        this.className = String(value);
        this.classList.syncFromClassName();
      }
    }

    getAttribute(name: string) {
      if (name === "id") return this.id || null;
      if (name === "class") return this.className || null;
      return this.attrs.has(name) ? this.attrs.get(name)! : null;
    }

    addEventListener(type: string, fn: MockListener) {
      const list = this.listeners.get(type) ?? [];
      list.push(fn);
      this.listeners.set(type, list);
    }

    removeEventListener(type: string, fn: MockListener) {
      const list = this.listeners.get(type) ?? [];
      this.listeners.set(
        type,
        list.filter((f) => f !== fn),
      );
    }

    dispatchEvent(type: string, event: Record<string, unknown> = {}) {
      let prevented = false;
      const payload: Record<string, unknown> = {
        type,
        target: this,
        currentTarget: this,
        ...event,
        preventDefault: () => {
          prevented = true;
        },
      };
      Object.defineProperty(payload, "defaultPrevented", {
        get: () => prevented,
      });
      for (const fn of this.listeners.get(type) ?? []) fn(payload);
      return payload;
    }

    click() {
      this.dispatchEvent("click");
    }

    querySelector(sel: string): MockEl | null {
      return walkFind(this, sel);
    }

    querySelectorAll(sel: string): MockEl[] {
      const out: MockEl[] = [];
      walkCollect(this, sel, out);
      return out;
    }
  }

  function matches(el: MockEl, sel: string): boolean {
    const s = sel.trim();
    if (s.startsWith("#")) return el.id === s.slice(1);
    if (s.startsWith(".")) return el.classList.contains(s.slice(1));
    return el.tagName === s.toUpperCase();
  }

  function walkFind(root: MockEl, sel: string): MockEl | null {
    const stack = [...root.children];
    while (stack.length) {
      const el = stack.shift()!;
      if (matches(el, sel)) return el;
      stack.push(...el.children);
    }
    return null;
  }

  function walkCollect(root: MockEl, sel: string, out: MockEl[]) {
    const stack = [...root.children];
    while (stack.length) {
      const el = stack.shift()!;
      if (matches(el, sel)) out.push(el);
      stack.push(...el.children);
    }
  }

  const body = new MockEl("BODY");
  const document = {
    body,
    createElement(tag: string) {
      return new MockEl(tag);
    },
    getElementById(id: string) {
      if (body.id === id) return body;
      return walkFind(body, `#${id}`);
    },
    querySelector(sel: string) {
      if (matches(body, sel)) return body;
      return walkFind(body, sel);
    },
    querySelectorAll(sel: string) {
      const out: MockEl[] = [];
      if (matches(body, sel)) out.push(body);
      walkCollect(body, sel, out);
      return out;
    },
  };

  return { document };
}

function seedDom(
  document: ReturnType<typeof createPracticeDom>["document"],
  domHtml?: string,
) {
  if (!domHtml) return;
  for (const line of domHtml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^<(\w+)\s+id="([^"]+)">(.*)<\/\1>$/i);
    if (m) {
      const el = document.createElement(m[1]);
      el.id = m[2];
      el.textContent = m[3];
      document.body.appendChild(el);
    }
  }
}

function resolveArg(
  arg: unknown,
  document: ReturnType<typeof createPracticeDom>["document"],
) {
  if (arg && typeof arg === "object" && (arg as { __el?: string }).__el) {
    return document.querySelector((arg as { __el: string }).__el);
  }
  if (arg && typeof arg === "object" && (arg as { __elId?: string }).__elId) {
    return document.getElementById((arg as { __elId: string }).__elId);
  }
  if (arg === "__document") return document;
  if (arg === "__body") return document.body;
  return arg;
}

/**
 * Runs learner code in-browser and evaluates automated tests.
 * runtime "dom" injects a practice document for browser lessons.
 */
export async function runJsChallenge(
  code: string,
  functionName: string,
  tests: JsTestCase[],
  runtime: JsRuntime = "plain",
): Promise<JsRunResult> {
  if (!/^[A-Za-z_$][\w$]*$/.test(functionName)) {
    return {
      ok: false,
      compileError: "Invalid function name.",
      results: [],
      passedCount: 0,
      totalCount: tests.length,
    };
  }

  const results: JsTestResult[] = [];
  const AsyncFunction = Object.getPrototypeOf(async function () {})
    .constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>;

  for (const test of tests) {
    try {
      let fn: (...args: unknown[]) => unknown;
      let compare: unknown;

      if (runtime === "dom") {
        const { document } = createPracticeDom();
        seedDom(document, test.domHtml);

        const factory = new AsyncFunction(
          "document",
          `"use strict";\n${code}\n` +
            `if (typeof ${functionName} !== "function") {\n` +
            `  throw new Error("Define function ${functionName} — it was not found.");\n` +
            `}\n` +
            `return ${functionName};`,
        );
        fn = (await factory(document)) as (...args: unknown[]) => unknown;

        let clickCount = 0;
        const args = test.args.map((arg) => resolveArg(arg, document));
        if (test.afterCall?.injectClickHandler) {
          args[1] = () => {
            clickCount += 1;
          };
        }

        const actual = await Promise.resolve(fn(...args));

        let lastSubmitPrevented = false;
        for (const click of test.afterCall?.clicks ?? []) {
          const el = document.querySelector(click.selector);
          if (!el) throw new Error(`No element for click ${click.selector}`);
          for (let i = 0; i < click.times; i++) el.click();
        }
        for (const sub of test.afterCall?.submits ?? []) {
          const el = document.querySelector(sub.selector);
          if (!el) throw new Error(`No element for submit ${sub.selector}`);
          const ev = el.dispatchEvent("submit");
          lastSubmitPrevented = Boolean(ev.defaultPrevented);
        }

        if (test.afterCall?.expectClickCount) {
          compare = clickCount;
        } else if (test.afterCall?.expectSubmitPrevented) {
          compare = lastSubmitPrevented;
        } else if (test.expectDom) {
          const el = document.querySelector(test.expectDom.selector);
          if (!el) {
            throw new Error(`No element for selector ${test.expectDom.selector}`);
          }
          compare = (el as unknown as Record<string, unknown>)[
            test.expectDom.prop
          ];
        } else if (test.expectReturnProp) {
          compare = (actual as Record<string, unknown> | null)?.[
            test.expectReturnProp
          ];
        } else {
          compare = actual;
        }
      } else {
        const factory = new AsyncFunction(
          `"use strict";\n${code}\n` +
            `if (typeof ${functionName} !== "function") {\n` +
            `  throw new Error("Define function ${functionName} — it was not found.");\n` +
            `}\n` +
            `return ${functionName};`,
        );
        fn = (await factory()) as (...args: unknown[]) => unknown;
        const actual = await Promise.resolve(fn(...test.args));
        compare = test.expectReturnProp
          ? (actual as Record<string, unknown> | null)?.[test.expectReturnProp]
          : actual;
      }

      const passed = deepEqual(compare, test.expected);
      results.push({
        name: test.name,
        hidden: test.hidden,
        passed,
        expected: test.expected,
        actual: compare,
        error: passed
          ? undefined
          : `Expected ${formatValue(test.expected)}, got ${formatValue(compare)}`,
      });
    } catch (err) {
      results.push({
        name: test.name,
        hidden: test.hidden,
        passed: false,
        expected: test.expected,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    ok: passedCount === tests.length,
    results,
    passedCount,
    totalCount: tests.length,
  };
}
