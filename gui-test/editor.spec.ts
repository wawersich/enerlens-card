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
 * Fields of an extra value, which by design write nothing until the row has
 * a slot with an entity (E-4, L-20). Read from the form's data: the names
 * repeat in every slot, so a field named "entity" would be the row's own.
 */
const SLOT_FIELDS = new Set(["label", "min", "max", "in_energy", "idle_value"]);

async function hasSlot(page: Page, form: number): Promise<boolean> {
  return page.evaluate((index) => {
    const w = window as unknown as { __forms: () => (HTMLElement & { data?: unknown })[] };
    const data = w.__forms()[index]?.data as { indicators?: Record<string, unknown> } | undefined;
    return Object.values(data?.indicators ?? {}).some(
      (slot) =>
        typeof slot === "object" &&
        slot !== null &&
        "entity" in slot &&
        Boolean((slot as { entity?: unknown }).entity),
    );
  }, form);
}

/**
 * YAML values that change by design beside the one operated: a consumer in
 * the old form is written in the new one once it is changed (E-4, L-18,
 * L-20), and the rest takes its older keys along into its entry (L-21).
 */
function expectedAlong(before: RawLike, path: string): boolean {
  const m = /^consumers\.(\d+)\./.exec(path);
  const row = m ? (before.consumers as unknown[] | undefined)?.[Number(m[1])] : undefined;
  if (row && typeof row === "object" && "charge" in row) return true;
  if (/^(list\.rest_label|icons\.rest|colors\.rest)$/.test(path)) return true;
  return /^consumers\.\d+\.(type|name|icon|color)$/.test(path) && restWritten;
}
type RawLike = { consumers?: unknown };
let restWritten = false;

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
    const form = Number(field.key.split(":")[0]);
    if (SLOT_FIELDS.has(field.name) && !(await hasSlot(page, form))) continue;
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
    const all = changed(RICH, config);
    restWritten = all.some((p) => /^consumers\.\d+\.type$/.test(p));
    const along = all.filter((p) => expectedAlong(RICH, p));
    const diff = all.filter((p) => !expectedAlong(RICH, p));
    // The operated value may itself be one of those that move along.
    if (diff.length > 1 || (diff.length === 0 && along.length === 0)) {
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
    // Unset reads back as unset: the option "" of a select (standard), and
    // in_energy off - only `true` is written (L-20).
    const same = (a: unknown) =>
      (field.kind === "select" && a === "") || (field.name === "in_energy" && a === false)
        ? undefined
        : a;
    if (JSON.stringify(same(again.value)) !== JSON.stringify(same(value))) {
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
