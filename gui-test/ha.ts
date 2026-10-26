/**
 * Talking to Home Assistant from the GUI tests (REQ 2.19): the instance, the
 * user's profile, the test sensors, and a page signed in with a token.
 * Nothing here changes anything for good (GT-2): the sensors live in Home
 * Assistant's memory only, the profile is read, never written.
 */
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

export const HA_URL = (process.env.HA_URL ?? "").replace(/\/$/, "");
export const DASHBOARD = process.env.HA_DASHBOARD ?? "/lovelace/0";
/** The card type under test: the dev build by default (npm run deploy);
 *  HA_CARD_URL loads a build that is not a resource into the test page. */
export const CARD = process.env.HA_CARD ?? "enerlens-card-dev";

export function token(): string {
  const file = process.env.HA_TOKEN_FILE;
  if (!HA_URL || !file) {
    throw new Error("HA_URL und HA_TOKEN_FILE setzen - siehe gui-test/playwright.config.ts");
  }
  return readFileSync(file, "utf8").trim();
}

/** One round trip over Home Assistant's WebSocket API. */
export async function ws<T>(message: Record<string, unknown>): Promise<T> {
  const socket = new WebSocket(`${HA_URL.replace(/^http/, "ws")}/api/websocket`);
  return new Promise<T>((resolve, reject) => {
    socket.onmessage = (event) => {
      const m = JSON.parse(String(event.data));
      if (m.type === "auth_required")
        socket.send(JSON.stringify({ type: "auth", access_token: token() }));
      else if (m.type === "auth_ok") socket.send(JSON.stringify({ id: 1, ...message }));
      else if (m.type === "auth_invalid") reject(new Error("token rejected"));
      else if (m.id === 1) {
        socket.close();
        if (m.success) resolve(m.result as T);
        else reject(new Error(JSON.stringify(m.error)));
      }
    };
    socket.onerror = () => reject(new Error("websocket failed"));
  });
}

/** What the run must leave as it found it (GT-2). */
export const PROFILE_KEYS = ["theme", "language"];

export async function profile(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const key of PROFILE_KEYS) {
    const result = await ws<{ value?: unknown }>({ type: "frontend/get_user_data", key });
    out[key] = result?.value ?? null;
  }
  return out;
}

/** Test sensors, in Home Assistant's memory only: a restart drops them (GT-2). */
export const SENSOR = "sensor.enerlens_gui_";

export async function putState(
  key: string,
  state: number | string,
  attributes: Record<string, unknown> = {
    unit_of_measurement: "W",
    device_class: "power",
    state_class: "measurement",
  },
): Promise<void> {
  // A key, or a whole entity id for sensors of another set (doc pictures).
  const id = key.includes(".") ? key : `${SENSOR}${key}`;
  const res = await fetch(`${HA_URL}/api/states/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ state: String(state), attributes }),
  });
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
}

/** Every element matching a selector, through all shadow roots - in the page. */
const DEEP = `window.__deep = (sel, root = document) => {
  const out = [];
  const walk = (n) => {
    for (const e of n.querySelectorAll(sel)) out.push(e);
    for (const e of n.querySelectorAll("*")) if (e.shadowRoot) walk(e.shadowRoot);
  };
  walk(root);
  return out;
};`;

/** A page signed in to Home Assistant, on the dashboard, `hass` ready. */
export async function signIn(page: Page): Promise<void> {
  const access = token();
  await page.addInitScript(
    ({ access, url }) => {
      localStorage.setItem(
        "hassTokens",
        JSON.stringify({
          access_token: access,
          token_type: "Bearer",
          expires_in: 1800,
          hassUrl: url,
          clientId: `${url}/`,
          expires: Date.now() + 1e10,
          refresh_token: "",
        }),
      );
    },
    { access, url: HA_URL },
  );
  await page.goto(HA_URL + DASHBOARD);
  await page.waitForFunction(
    () =>
      (document.querySelector("home-assistant") as unknown as { hass?: { states?: object } })?.hass
        ?.states,
    null,
    { timeout: 60_000 },
  );
  await page.evaluate(DEEP);
  // A build not registered as a resource - to try the tests on it - loads
  // into this page only (HA_CARD_URL, e.g. /local/enerlens-card-probe.js).
  const extra = process.env.HA_CARD_URL;
  if (extra) await page.addScriptTag({ url: HA_URL + extra, type: "module" });
  await page.waitForFunction((card) => customElements.get(card), CARD, { timeout: 30_000 });
}

/** The Home Assistant version, for the result (GT-9). */
export async function haVersion(): Promise<string> {
  const config = await ws<{ version: string }>({ type: "get_config" });
  return config.version;
}
