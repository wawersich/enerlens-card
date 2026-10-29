/**
 * The card editor with Home Assistant's own form elements (REQ GT-3 to GT-5).
 * Born of a bug (25.10.2026): a PV source with `house: excluded` showed its
 * switch off. Unit tests see what our editor hands to <ha-form>; these see
 * what Home Assistant's switches, selects and inputs show, and what they send
 * back when used.
 */
import { type Page, expect, test } from "@playwright/test";
import {
  type Field,
  cardTakes,
  clear,
  closeDialog,
  expected,
  fields,
  loadFormElements,
  mountEditor,
  openDialog,
  operate,
  saved,
} from "./editor";
import { RICH, SPLIT } from "./fixtures";
import { CARD, signIn } from "./ha";

// Not serial: a finding in one test must not keep the others from running.

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await signIn(page);
  await loadFormElements(page, RICH);
});

test.afterAll(async () => {
  await page.close();
});

/**
 * The YAML as leaves - `entities.solar.2.house: "excluded"` - without the
 * card's memory id, which the editor hands out on the first save (V-12).
 */
function leaves(value: unknown, path = "", out = new Map<string, string>()) {
  // An entity in its short form is the long one with nothing else said:
  // `grid: sensor.x` and `grid: {entity: sensor.x}` are one and the same.
  if (typeof value === "string" && /^entities\.(solar|grid|house|battery)(\.\d+)?$/.test(path)) {
    out.set(`${path}.entity`, JSON.stringify(value));
    return out;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) {
      if (path === "" && key === "memory_id") continue;
      leaves(inner, path ? `${path}.${key}` : key, out);
    }
  } else out.set(path, JSON.stringify(value));
  return out;
}

/** The leaves one YAML has and the other has not, or has otherwise. */
function changed(before: object, after: object): string[] {
  const a = leaves(before);
  const b = leaves(after);
  return [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k));
}

/**
 * Fields that by design write nothing until another field of their form is
 * set: a consumer's state of charge needs its entity first (E-4).
 */
const NEEDS: Record<string, string> = {
  label: "soc",
};

/** Fields whose change rebuilds the form around them: tested on their own. */
const STRUCTURE = (f: Field) => f.name.endsWith("_source");
const OPERATED = new Set(["boolean", "text", "number", "select"]);
/** GUI_FIELDS=<regex> narrows the operated fields by key, e.g. "^4:" for one row. */
const ONLY = process.env.GUI_FIELDS ? new RegExp(process.env.GUI_FIELDS) : undefined;

for (const [label, config] of [
  ["several PV sources", RICH],
  ["split sensors, triangle", SPLIT],
] as const) {
  test(`GT-3: every field shows what the YAML says - ${label}`, async () => {
    await mountEditor(page, config);
    const all = await fields(page);
    expect(all.length).toBeGreaterThan(30);
    const wrong: string[] = [];
    for (const field of all) {
      const want = expected(field);
      if (!want) continue;
      const got = field.shown;
      if (JSON.stringify(got) !== JSON.stringify(want)) {
        wrong.push(
          `${field.key} (${field.kind}): zeigt ${JSON.stringify(got)}, erwartet ${JSON.stringify(want)}`,
        );
      }
    }
    expect(wrong, wrong.join("\n")).toEqual([]);
  });
}

test("GT-3: the house switch of each PV source as configured (PV-3)", async () => {
  await mountEditor(page, RICH);
  const switches = (await fields(page)).filter((f) => f.name === "excluded");
  const states = [];
  for (const field of switches) states.push(field.shown.checked);
  expect(states).toEqual([false, false, true]);
});

test("GT-4: each field operated, saved, opened again - the value is still there", async () => {
  test.setTimeout(45 * 60_000);
  await mountEditor(page, RICH);
  const todo = (await fields(page)).filter(
    (f) => OPERATED.has(f.kind) && !STRUCTURE(f) && (!ONLY || ONLY.test(f.key)),
  );
  const findings: string[] = [];
  for (const planned of todo) {
    // A fresh editor per field: one change must not hide behind another.
    await mountEditor(page, RICH);
    const now = await fields(page);
    const field = now.find((f) => f.key === planned.key);
    if (!field) continue;
    const needs = NEEDS[field.name];
    const form = field.key.split(":")[0];
    if (needs && !now.find((f) => f.key === `${form}:${needs}`)?.value) continue;
    let value: unknown;
    try {
      value = await operate(page, field);
    } catch (e) {
      findings.push(`${field.key}: nicht bedienbar - ${(e as Error).message.split("\n")[0]}`);
      continue;
    }
    if (value === undefined) continue;
    const config = await saved(page);
    if (!config) {
      findings.push(`${field.key}: nichts gespeichert nach ${JSON.stringify(value)}`);
      continue;
    }
    const takes = await cardTakes(page, config);
    if (takes !== true) {
      findings.push(`${field.key} = ${JSON.stringify(value)}: Karte lehnt ab - ${takes}`);
      continue;
    }
    // One field, one value in the YAML: a second change is a value the user
    // did not touch - written from what a form showed wrongly, or dropped.
    const diff = changed(RICH, config);
    if (diff.length !== 1) {
      findings.push(
        `${field.key} = ${JSON.stringify(value)}: ${diff.length} YAML-Werte geändert: ${diff.join(", ")}`,
      );
    }
    await mountEditor(page, config);
    const again = (await fields(page)).find((f) => f.key === field.key);
    if (!again) {
      findings.push(`${field.key}: nach dem Wiederöffnen nicht mehr da`);
      continue;
    }
    if (JSON.stringify(again.value) !== JSON.stringify(value)) {
      findings.push(
        `${field.key}: gesetzt ${JSON.stringify(value)}, wieder geöffnet ${JSON.stringify(again.value)}`,
      );
      continue;
    }
    const want = expected(again);
    const got = again.shown;
    if (want && JSON.stringify(got) !== JSON.stringify(want)) {
      findings.push(`${field.key}: zeigt ${JSON.stringify(got)}, erwartet ${JSON.stringify(want)}`);
    }
  }
  console.log(`GT-4: ${todo.length} Felder bedient`);
  expect(findings, findings.join("\n")).toEqual([]);
});

test("GT-4: an emptied text or number field never makes the card refuse (E-1)", async () => {
  test.setTimeout(30 * 60_000);
  await mountEditor(page, RICH);
  const todo = (await fields(page)).filter(
    (f) => (f.kind === "text" || f.kind === "number") && (!ONLY || ONLY.test(f.key)),
  );
  const findings: string[] = [];
  for (const planned of todo) {
    await mountEditor(page, RICH);
    const field = (await fields(page)).find((f) => f.key === planned.key);
    if (!field) continue;
    try {
      await clear(page, field);
    } catch (e) {
      findings.push(`${field.key}: nicht leerbar - ${(e as Error).message.split("\n")[0]}`);
      continue;
    }
    const config = await saved(page);
    if (!config) continue;
    const takes = await cardTakes(page, config);
    if (takes !== true) findings.push(`${field.key} geleert: Karte lehnt ab - ${takes}`);
  }
  expect(findings, findings.join("\n")).toEqual([]);
});

test("GT-5: the preview in the dialog follows a change", async () => {
  // The editor the other tests mounted lies behind the dialog: gone first.
  await page.evaluate(() =>
    (window as unknown as { __editorEl?: HTMLElement }).__editorEl?.remove(),
  );
  await openDialog(page, RICH);
  try {
    // The arrangement, picked in the dialog's own editor.
    await page.evaluate((card) => {
      const w = window as unknown as {
        __deep: (s: string, r?: ParentNode) => HTMLElement[];
        __editorEl?: HTMLElement;
        __forms: () => HTMLElement[];
      };
      const el = w.__deep(`${card}-editor`)[0];
      (el as unknown as { _builtSections: unknown })._builtSections = { has: () => true };
      (el as unknown as { requestUpdate(): void }).requestUpdate();
      w.__editorEl = el;
      w.__forms = () => [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])] as HTMLElement[];
    }, CARD);
    await page.waitForTimeout(1500);
    const layout = (await fields(page)).find((f) => f.name === "layout") as Field;
    await operate(page, {
      ...layout,
      options: layout.options.filter((o) => o.value === "triangle"),
    });
    await expect
      .poll(() =>
        page.evaluate((card) => {
          const deep = (
            window as unknown as { __deep: (s: string, r?: ParentNode) => HTMLElement[] }
          ).__deep;
          const dialog = deep("hui-dialog-edit-card")[0];
          const preview = deep(card, dialog?.shadowRoot ?? document)[0];
          return preview?.shadowRoot?.querySelector(".body")?.className ?? "";
        }, CARD),
      )
      .toContain("layout-triangle");
  } finally {
    await closeDialog(page);
  }
});
