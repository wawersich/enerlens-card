/**
 * The card editor in a real Home Assistant page (REQ GT-3 to GT-5): mounted
 * with Home Assistant's own form elements, its fields read from what is drawn,
 * and operated through those elements - never through the editor's insides.
 */
import type { ElementHandle, Page } from "@playwright/test";
import { CARD } from "./ha";

/** A field as the editor draws it: which form, which name, what kind. */
export interface Field {
  /** `<form index>:<name>` - unique while the configuration keeps its shape. */
  key: string;
  name: string;
  kind: "boolean" | "text" | "number" | "select" | "multi" | "entity" | "icon" | "other";
  /** What ha-form hands this field - the editor's value for it. */
  value: unknown;
  options: { value: unknown; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  /** What Home Assistant's element shows for it, read with the field. */
  shown: Shown;
}

/** What a field shows in Home Assistant's own element. */
export interface Shown {
  checked?: boolean;
  /** The text in an input, or the value of a select. */
  value?: unknown;
  /** What a picker or select shows as text. */
  text?: string;
}

/**
 * Home Assistant loads its form elements when an edit dialog opens, not
 * before. One dialog, borrowed from the dashboard's first card and cancelled,
 * loads them for the whole page.
 */
export async function loadFormElements(page: Page, config: object): Promise<void> {
  await openDialog(page, config);
  // Every section unfolded: each kind of field loads its element on first use.
  await page.evaluate(async (card) => {
    const el = (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep(
      `${card}-editor`,
    )[0] as unknown as {
      _builtSections: unknown;
      _builtConsumers: unknown;
      requestUpdate(): void;
      updateComplete: Promise<unknown>;
    };
    el._builtSections = { has: () => true };
    el._builtConsumers = { has: () => true };
    el.requestUpdate();
    await el.updateComplete;
  }, CARD);
  await page.waitForFunction(
    () =>
      ["ha-entity-picker", "ha-icon-picker", "ha-select", "ha-switch"].every((t) =>
        customElements.get(t),
      ),
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);
  await closeDialog(page);
}

/** The real edit dialog, shown with our configuration; never saved (GT-2). */
export async function openDialog(page: Page, config: object): Promise<void> {
  // Edit mode, and a card's edit wrapper to borrow the dialog from. After a
  // change of language or theme the dashboard draws anew and may miss the
  // switch: then off and on again.
  for (let attempt = 0; ; attempt++) {
    await page.evaluate((again) => {
      const deep = (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep;
      const lovelace = (
        deep("hui-root")[0] as unknown as { lovelace: { setEditMode(on: boolean): void } }
      ).lovelace;
      if (again) lovelace.setEditMode(false);
      lovelace.setEditMode(true);
    }, attempt > 0);
    try {
      await page.waitForFunction(
        () =>
          (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep(
            "hui-card-edit-mode",
          )[0],
        null,
        { timeout: 10_000 },
      );
      break;
    } catch (e) {
      if (attempt >= 2) throw e;
    }
  }
  await page.evaluate(() => {
    const deep = (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep;
    (deep("hui-card-edit-mode")[0] as unknown as { _editCard(): void })._editCard();
  });
  await page.waitForFunction(
    () =>
      (
        (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep(
          "hui-dialog-edit-card",
        )[0] as unknown as { _params?: object }
      )?._params,
  );
  // The borrowed card's editor loads first; then ours takes its place.
  await page.waitForTimeout(2500);
  await page.evaluate(async (config) => {
    const deep = (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep;
    const dialog = deep("hui-dialog-edit-card")[0] as unknown as {
      _params: object;
      closeDialog(): void;
      showDialog(p: object): Promise<void>;
    };
    const params = dialog._params;
    dialog.closeDialog();
    await new Promise((r) => setTimeout(r, 800));
    await dialog.showDialog({ ...params, cardConfig: config, saveCardConfig: async () => {} });
  }, config);
  await page.waitForFunction(
    (card) =>
      (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep(`${card}-editor`)[0],
    CARD,
  );
  await page.waitForTimeout(1500);
}

/**
 * Cancels the dialog and leaves edit mode: nothing saved (GT-2). Home
 * Assistant asks whether to drop the changes; the answer is "leave", clicked
 * as a user would - left open, that question lies over everything after it.
 */
export async function closeDialog(page: Page): Promise<void> {
  await page.evaluate(() => {
    const deep = (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep;
    (deep("hui-dialog-edit-card")[0] as unknown as { closeDialog?(): void })?.closeDialog?.();
  });
  await page.waitForTimeout(800);
  // The confirming button is the last visible one; its text is the profile's language.
  const question = page.locator("dialog-box");
  if ((await question.count()) > 0) {
    await question.getByRole("button").filter({ visible: true }).last().click();
    // The element stays in the page; closed means nothing of it is shown.
    await question
      .getByRole("button")
      .filter({ visible: true })
      .first()
      .waitFor({ state: "hidden" });
  }
  await page.evaluate(() => {
    const deep = (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep;
    (
      deep("hui-root")[0] as unknown as { lovelace: { setEditMode(on: boolean): void } }
    ).lovelace.setEditMode(false);
  });
}

/**
 * An editor of our card on the page, every section unfolded, as Home Assistant
 * runs it: each saved configuration goes back into setConfig, as the dialog
 * does. What it saves last is in `window.__saved`.
 */
export async function mountEditor(page: Page, config: object): Promise<void> {
  await page.evaluate(
    async ({ card, config }) => {
      const w = window as unknown as { __saved?: unknown; __editorEl?: HTMLElement };
      w.__editorEl?.remove();
      w.__saved = undefined;
      const cls = customElements.get(card) as unknown as {
        getConfigElement(): Promise<HTMLElement>;
      };
      const el = (await cls.getConfigElement()) as HTMLElement & {
        hass: unknown;
        setConfig(c: object): void;
        updateComplete: Promise<unknown>;
        requestUpdate(): void;
        _builtSections: unknown;
        _builtConsumers: unknown;
      };
      el.hass = (document.querySelector("home-assistant") as unknown as { hass: unknown }).hass;
      el.setConfig(config);
      el.addEventListener("config-changed", (ev) => {
        const next = (ev as CustomEvent<{ config: object }>).detail.config;
        w.__saved = next;
        el.setConfig(next);
      });
      el.style.cssText =
        "position:fixed;inset:0 auto 0 0;width:560px;overflow:auto;background:#fff;z-index:9999";
      // Inside Home Assistant's own tree: its pickers take their data from
      // context providers up there and stay empty outside it.
      const main = (window as unknown as { __deep: (s: string) => HTMLElement[] }).__deep(
        "home-assistant-main",
      )[0];
      (main?.shadowRoot ?? document.body).appendChild(el);
      w.__editorEl = el;
      // The editor's own forms, in order; nested sections belong to their form.
      (window as unknown as { __forms: () => HTMLElement[] }).__forms = () =>
        [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])] as HTMLElement[];
      await el.updateComplete;
      el._builtSections = { has: () => true };
      el._builtConsumers = { has: () => true };
      el.requestUpdate();
      await el.updateComplete;
    },
    { card: CARD, config },
  );
  // The form elements draw in their own time.
  await page.waitForTimeout(1200);
}

/** Every field the editor draws now (GT-3: from what is drawn, not from a list). */
export async function fields(page: Page): Promise<Field[]> {
  return page.evaluate(() => {
    const w = window as unknown as {
      __deep: (s: string, r?: ParentNode) => HTMLElement[];
      __forms: () => HTMLElement[];
    };
    const deep = w.__deep;
    const forms = w.__forms();
    const out: unknown[] = [];
    forms.forEach((form, index) => {
      const seen = new Set<string>();
      for (const sel of deep("ha-selector", form.shadowRoot ?? form) as unknown as {
        name: string;
        value: unknown;
        selector: Record<string, Record<string, unknown> | null>;
      }[]) {
        if (seen.has(sel.name)) continue;
        seen.add(sel.name);
        const type = Object.keys(sel.selector ?? {})[0];
        const spec = (sel.selector?.[type] ?? {}) as Record<string, unknown>;
        const kind =
          type === "boolean"
            ? "boolean"
            : type === "text"
              ? "text"
              : type === "number"
                ? "number"
                : type === "select"
                  ? spec.multiple
                    ? "multi"
                    : spec.mode === "dropdown"
                      ? "select"
                      : "other"
                  : type === "entity"
                    ? "entity"
                    : type === "icon"
                      ? "icon"
                      : "other";
        const options = ((spec.options as unknown[]) ?? []).map((o) =>
          typeof o === "object" && o !== null
            ? (o as { value: unknown; label: string })
            : { value: o, label: String(o) },
        );
        // What the element itself shows (GT-3) - read in the same pass.
        const root = (sel as unknown as HTMLElement).shadowRoot ?? (sel as unknown as HTMLElement);
        const first = (css: string) =>
          deep(css, root)[0] as unknown as Record<string, unknown> | undefined;
        const shown =
          kind === "boolean"
            ? { checked: first("ha-switch")?.checked }
            : kind === "text" || kind === "number"
              ? { value: first("input")?.value }
              : kind === "select"
                ? { value: first("ha-select")?.value, text: first("ha-picker-field")?.value }
                : kind === "entity" || kind === "icon"
                  ? { text: first("ha-picker-field")?.value }
                  : {};
        out.push({
          shown,
          key: `${index}:${sel.name}`,
          name: sel.name,
          kind,
          value: sel.value,
          options,
          min: spec.min,
          max: spec.max,
          step: spec.step,
        });
      }
    });
    return out as never;
  });
}

/** The ha-selector of a field, found again after every render. */
async function selector(page: Page, key: string): Promise<ElementHandle<HTMLElement>> {
  const handle = await page.evaluateHandle((key) => {
    const w = window as unknown as {
      __deep: (s: string, r?: ParentNode) => HTMLElement[];
      __forms: () => HTMLElement[];
    };
    const deep = w.__deep;
    const [index, name] = [Number(key.split(":")[0]), key.slice(key.indexOf(":") + 1)];
    const form = w.__forms()[index];
    return (
      (form &&
        (deep("ha-selector", form.shadowRoot ?? form) as unknown as { name: string }[]).find(
          (s) => s.name === name,
        )) ??
      null
    );
  }, key);
  const element = handle.asElement() as ElementHandle<HTMLElement> | null;
  if (!element) throw new Error(`Feld ${key} nicht gezeichnet`);
  return element;
}

/**
 * Opens every collapsed section on the way to a field and scrolls it into
 * view: a user sees a field before using it, and so must a click.
 */
async function reveal(page: Page, key: string): Promise<void> {
  const root = await selector(page, key);
  await root.evaluate((el) => {
    let node: Node | null = el;
    while (node) {
      if (node instanceof HTMLElement && node.tagName === "HA-EXPANSION-PANEL") {
        (node as unknown as { expanded: boolean }).expanded = true;
      }
      node = node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode;
    }
  });
  await page.waitForTimeout(400);
  await root.scrollIntoViewIfNeeded();
}

/** The first element matching `css` inside a field, through its shadow roots. */
async function inside(
  page: Page,
  key: string,
  css: string,
): Promise<ElementHandle<HTMLElement> | null> {
  const root = await selector(page, key);
  const handle = await root.evaluateHandle(
    (el, css) =>
      (window as unknown as { __deep: (s: string, r?: ParentNode) => HTMLElement[] }).__deep(
        css,
        el.shadowRoot ?? el,
      )[0] ?? null,
    css,
  );
  return handle.asElement() as ElementHandle<HTMLElement> | null;
}

/** What a field shows in Home Assistant's element now (GT-3). */
export async function shown(page: Page, field: Pick<Field, "key">): Promise<Shown> {
  return (await fields(page)).find((f) => f.key === field.key)?.shown ?? {};
}

/** The value a field's element should show for the editor's value (GT-3). */
export function expected(field: Field): Shown | undefined {
  const v = field.value;
  switch (field.kind) {
    case "boolean":
      return { checked: v === true };
    case "text":
      return { value: typeof v === "string" ? v : "" };
    case "number":
      return { value: typeof v === "number" ? String(v) : "" };
    case "select": {
      const option = field.options.find((o) => o.value === v);
      return { value: v ?? "", text: option?.label ?? "" };
    }
    case "entity":
    case "icon":
      return { text: typeof v === "string" ? v : "" };
    default:
      return undefined;
  }
}

/**
 * Operates a field through Home Assistant's own element, as a user would
 * (GT-4), and returns the value it was given - undefined for a kind not
 * operated here.
 */
export async function operate(page: Page, field: Field): Promise<unknown> {
  if (["boolean", "text", "number", "select"].includes(field.kind)) await reveal(page, field.key);
  switch (field.kind) {
    case "boolean": {
      const toggle = await inside(page, field.key, "ha-switch");
      await toggle?.click();
      await page.waitForTimeout(400);
      return field.value !== true;
    }
    case "text": {
      const input = await inside(page, field.key, "input");
      await input?.fill("GUI-Test");
      // On the keyboard, not the element: typing may redraw the field.
      await page.keyboard.press("Tab");
      await page.waitForTimeout(400);
      return "GUI-Test";
    }
    case "number": {
      const step = field.step ?? 1;
      const min = field.min ?? 0;
      const max = field.max ?? min + 1000;
      const now = typeof field.value === "number" ? field.value : min;
      // One step on, back down at the top - always a value in range.
      const next = Number((now + step <= max ? now + step : now - step).toFixed(6));
      const input = await inside(page, field.key, "input");
      await input?.fill(String(next));
      // On the keyboard, not the element: typing may redraw the field.
      await page.keyboard.press("Tab");
      await page.waitForTimeout(400);
      return next;
    }
    case "select": {
      const other = field.options.find((o) => o.value !== field.value);
      if (!other) return undefined;
      const picker = await inside(page, field.key, "ha-picker-field");
      await picker?.click();
      await page.waitForTimeout(500);
      const item = await (await selector(page, field.key)).evaluateHandle(
        (el, value) =>
          (window as unknown as { __deep: (s: string, r?: ParentNode) => HTMLElement[] })
            .__deep("ha-dropdown-item", el.shadowRoot ?? el)
            .find((i) => (i as unknown as { value: unknown }).value === value) ?? null,
        other.value,
      );
      const element = item.asElement();
      if (!element) throw new Error(`${field.key}: Eintrag ${String(other.value)} fehlt`);
      await (element as ElementHandle<HTMLElement>).click();
      await page.waitForTimeout(500);
      return other.value;
    }
    default:
      return undefined;
  }
}

/** Empties a text or number field through its input (E-1: never refused). */
export async function clear(page: Page, field: Field): Promise<void> {
  await reveal(page, field.key);
  const input = await inside(page, field.key, "input");
  await input?.fill("");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(400);
}

/** What the editor saved last, if anything. */
export function saved(page: Page): Promise<Record<string, unknown> | undefined> {
  return page.evaluate(() => (window as unknown as { __saved?: Record<string, unknown> }).__saved);
}

/** Whether the card takes a configuration; the message if not (E-1). */
export function cardTakes(page: Page, config: object): Promise<string | true> {
  return page.evaluate(
    ({ card, config }) => {
      try {
        (document.createElement(card) as unknown as { setConfig(c: object): void }).setConfig(
          config,
        );
        return true;
      } catch (e) {
        return (e as Error).message;
      }
    },
    { card: CARD, config },
  );
}
