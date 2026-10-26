/**
 * The card as Home Assistant shows it, with fixed test values (REQ GT-6):
 * figures and labels, the PV rows and ring, and per arrangement and width
 * where nodes and lists stand. The test sensors are in fixtures.ts; their
 * values add up, so every figure has one right answer.
 */
import { type Page, expect, test } from "@playwright/test";
import { RICH } from "./fixtures";
import { CARD, signIn } from "./ha";

test.describe.configure({ mode: "serial" });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await signIn(page);
});

test.afterAll(async () => {
  await page.close();
});

/** The PV scale "100 %" for the ring shares; everything else as RICH. */
const CONFIG = { ...RICH, view: { ...RICH.view, default_pv_scale: "share", remember: false } };

type Box = { x: number; y: number; w: number; h: number };

/** One card at `width` px, inside Home Assistant's own tree, with the live hass. */
async function mountCard(config: object, width: number): Promise<void> {
  await page.evaluate(
    async ({ card, config, width }) => {
      const w = window as unknown as { __deep: (s: string) => HTMLElement[]; __host?: HTMLElement };
      w.__host?.remove();
      const host = document.createElement("div");
      host.style.cssText = `position:fixed;left:0;top:0;width:${width}px;z-index:9999;background:#fff`;
      const el = document.createElement(card) as HTMLElement & {
        setConfig(c: object): void;
        hass: unknown;
      };
      el.setConfig(config);
      el.hass = (document.querySelector("home-assistant") as unknown as { hass: unknown }).hass;
      host.appendChild(el);
      (w.__deep("home-assistant-main")[0]?.shadowRoot ?? document.body).appendChild(host);
      w.__host = host;
    },
    { card: CARD, config, width },
  );
  // Layout settles after a measurement or two (stacked check, list placement).
  await page.waitForTimeout(2500);
}

/** Boxes and texts of what the card draws, read in one pass. */
async function readCard() {
  return page.evaluate((card) => {
    const w = window as unknown as { __host: HTMLElement };
    const el = w.__host.querySelector(card) as HTMLElement;
    const root = el.shadowRoot as ShadowRoot;
    const box = (e: Element | null): Box | null => {
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    };
    const edges = (e: Element | null) => {
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    };
    const node = (k: string) => root.querySelector(`.node.${k} .circle, .node.${k}`);
    return {
      card: edges(root.querySelector("ha-card")),
      cross: edges(root.querySelector(".cross")),
      pvSide: edges(root.querySelector(".list.pv-side")),
      list: edges(root.querySelector(".list:not(.pv-side)")),
      pvRows: edges(root.querySelector(".pv-rows")),
      rows: edges(root.querySelector(".rows")),
      stacked: !!root.querySelector(".list.stacked"),
      nodes: Object.fromEntries(
        ["solar", "grid", "house", "battery"].map((k) => [k, box(node(k))]),
      ) as Record<string, Box | null>,
      text: Object.fromEntries(
        ["solar", "grid", "house", "battery"].map((k) => [
          k,
          (root.querySelector(`.node.${k}`)?.textContent ?? "").replace(/\s+/g, " ").trim(),
        ]),
      ) as Record<string, string>,
      pvNames: [...root.querySelectorAll(".pv-rows .row .name")].map((n) => n.textContent?.trim()),
      solarRing: root.querySelectorAll(".node.solar .ring-seg").length,
      // Everything drawn that should lie inside the card.
      outside: [...root.querySelectorAll(".node, .row, .chip, .label")]
        .map((e) => [e, e.getBoundingClientRect()] as const)
        .filter(([, r]) => r.width > 0)
        .filter(([, r]) => {
          const c = (root.querySelector("ha-card") as HTMLElement).getBoundingClientRect();
          return (
            r.left < c.left - 1 ||
            r.right > c.right + 1 ||
            r.top < c.top - 1 ||
            r.bottom > c.bottom + 1
          );
        })
        .map(([e]) => (e as HTMLElement).className),
    };
  }, CARD);
}

test("GT-6: the figures - PV the sum of its sources, the house measured plus the balcony (PV-3)", async () => {
  await mountCard(CONFIG, 900);
  const card = await readCard();
  // 3.0 + 1.0 + 0.5 kW PV; 2.8 kW measured + 0.5 kW balcony, "calculated".
  expect(card.text.solar).toMatch(/4[,.]50 kW/);
  expect(card.text.house).toMatch(/3[,.]30 kW/);
  expect(card.text.house).toMatch(/berechnet|calculated/);
  expect(card.text.grid).toMatch(/0[,.]20 kW/);
  expect(card.text.battery).toMatch(/1[,.]40 kW/);
  expect(card.text.battery).toMatch(/64 %/);
  // The PV rows by size, the ring with one share per source.
  expect(card.pvNames).toEqual(["Dach", "West", "Balkon"]);
  expect(card.solarRing).toBe(3);
});

/** Where the nodes stand, per arrangement (AN-1): relative to each other. */
const PLACES: Record<string, (n: Record<string, Box>) => boolean[]> = {
  cross: (n) => [
    n.solar.y < n.house.y,
    n.battery.y > n.house.y,
    Math.abs(n.grid.y - n.house.y) < 2,
    Math.abs(n.solar.x - n.battery.x) < 2,
    // Not the triangle: the house right of the PV-battery axis, grid left of it.
    n.house.x > n.solar.x + 20 && n.grid.x < n.solar.x - 20,
  ],
  square_right: (n) => [
    n.solar.x > n.grid.x,
    n.solar.y < n.house.y,
    Math.abs(n.solar.x - n.house.x) < 2,
    Math.abs(n.grid.x - n.battery.x) < 2,
  ],
  square_left: (n) => [
    n.solar.x < n.house.x,
    Math.abs(n.solar.y - n.house.y) < 2,
    Math.abs(n.solar.x - n.grid.x) < 2,
    n.grid.y > n.solar.y,
  ],
  triangle: (n) => [
    Math.abs(n.solar.x - n.house.x) < 2,
    Math.abs(n.house.x - n.battery.x) < 2,
    n.solar.y < n.house.y && n.house.y < n.battery.y,
    n.grid.x < n.house.x && Math.abs(n.grid.y - n.house.y) < 2,
  ],
};

for (const layout of Object.keys(PLACES)) {
  for (const width of [380, 640, 900]) {
    test(`GT-6: ${layout} at ${width} px - nodes, lists, nothing outside the card`, async () => {
      await mountCard({ ...CONFIG, layout }, width);
      const card = await readCard();
      const nodes = card.nodes as Record<string, Box>;
      expect(PLACES[layout](nodes)).toEqual(PLACES[layout](nodes).map(() => true));
      expect(card.outside, `ragt aus der Karte: ${card.outside.join(", ")}`).toEqual([]);
      const cross = card.cross as NonNullable<typeof card.cross>;
      if (layout === "square_left" && !card.stacked) {
        // AN-3: PV rows left of the drawing, the consumers right of it.
        expect(card.pvSide, "PV-Zeilen links").not.toBeNull();
        expect((card.pvSide as typeof cross).right).toBeLessThanOrEqual(cross.left + 1);
        expect((card.list as typeof cross).left).toBeGreaterThanOrEqual(cross.right - 1);
      } else if (card.stacked) {
        // Below the drawing, PV rows above the consumers (L-17, AN-3).
        expect(card.pvSide).toBeNull();
        expect((card.list as typeof cross).top).toBeGreaterThanOrEqual(cross.bottom - 20);
        expect((card.pvRows as typeof cross).bottom).toBeLessThanOrEqual(
          (card.rows as typeof cross).top + 1,
        );
      } else {
        // Both lists right of the drawing, PV rows above (L-17).
        expect((card.list as typeof cross).left).toBeGreaterThanOrEqual(cross.right - 1);
        expect((card.pvRows as typeof cross).bottom).toBeLessThanOrEqual(
          (card.rows as typeof cross).top + 1,
        );
      }
      // A phone has no room beside the drawing; a wide card has (L-1).
      if (width === 380) expect(card.stacked).toBe(true);
      if (width === 900) expect(card.stacked).toBe(false);
    });
  }
}
