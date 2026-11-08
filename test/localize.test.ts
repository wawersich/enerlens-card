import { afterEach, describe, expect, it } from "vitest";
import { localize } from "../src/localize";
import de from "../src/translations/de.json";
import en from "../src/translations/en.json";
import type { HomeAssistant } from "../src/types";

function makeHass(language: string): HomeAssistant {
  return {
    states: {},
    language,
    locale: { language, number_format: "language" },
    callWS: () => Promise.reject(new Error("not used in tests")),
  };
}

type DocumentStub = { documentElement: { lang: string } };
const globalWithDocument = globalThis as { document?: DocumentStub };

afterEach(() => {
  globalWithDocument.document = undefined;
});

type Tree = { [key: string]: string | Tree };

function keyPaths(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : keyPaths(value as Tree, `${prefix}${key}.`),
  );
}

describe("localize (REQ N-7, E-1)", () => {
  it("picks the language from hass", () => {
    expect(localize("node.house", makeHass("de"))).toBe("Haus");
    expect(localize("node.house", makeHass("en"))).toBe("House");
  });

  it("uses only the language code, so de-CH is German", () => {
    expect(localize("node.battery_charging", makeHass("de-CH"))).toBe("Batterie · lädt");
  });

  it("falls back to English for an unknown language and without hass", () => {
    expect(localize("list.rest", makeHass("nl"))).toBe("Other");
    expect(localize("list.rest")).toBe("Other");
  });

  it("reads document.documentElement.lang when hass is missing (REQ E-1)", () => {
    globalWithDocument.document = { documentElement: { lang: "de-DE" } };
    expect(localize("error.config.soc_without_battery")).toContain("ohne entities.battery");
  });

  it("ignores an empty document language", () => {
    globalWithDocument.document = { documentElement: { lang: "" } };
    expect(localize("list.rest")).toBe("Other");
  });

  it("returns the key itself when it is unknown", () => {
    expect(localize("node.nonexistent", makeHass("de"))).toBe("node.nonexistent");
    expect(localize("", makeHass("de"))).toBe("");
    expect(localize("node", makeHass("de"))).toBe("node");
  });

  it("fills placeholders", () => {
    expect(localize("view.average", makeHass("de"), { minutes: 15 })).toBe("Ø 15 min");
    expect(localize("view.since", makeHass("de"), { time: "07:42" })).toBe("seit 07:42");
    expect(localize("view.since", makeHass("en"), { time: "07:42" })).toBe("since 07:42");
    expect(
      localize("error.config.clamped", makeHass("en"), {
        field: "flow.max_dots",
        min: 2,
        max: 10,
        value: 10,
      }),
    ).toBe("flow.max_dots must be between 2 and 10 - 10 is used.");
  });

  it("leaves unfilled placeholders alone", () => {
    expect(localize("view.since", makeHass("en"))).toBe("since {time}");
    expect(localize("view.average", makeHass("en"), {})).toBe("Ø {minutes} min");
  });

  it("keeps both translation files on exactly the same keys", () => {
    const enKeys = keyPaths(en as Tree).sort();
    const deKeys = keyPaths(de as Tree).sort();
    expect(deKeys).toEqual(enKeys);
    expect(enKeys.length).toBeGreaterThan(0);
  });
});

// Rule of 08.11.2026 (Markus): what the card itself shows addresses nobody -
// no "du", no "Sie", no imperative; written neutrally instead.
const ADDRESS = /\b(du|dich|dir|dein|deine|deinen|deinem|deiner|deines)\b/i;
const IMPERATIVE =
  /(^|[.:!?–—] )(Trage|Hake|Wähle|Gib|Setze|Lege|Stelle|Öffne|Tippe|Klicke|Nimm|Schalte|Füge|Ziehe|Prüfe|Nutze|Verwende|Ergänze|Entferne|Richte)\b/;

function texts(tree: Tree, prefix = ""): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}${key}`, value] as [string, string]]
      : texts(value as Tree, `${prefix}${key}.`),
  );
}

describe("German texts address nobody (rule of 08.11.2026)", () => {
  it("has no du-forms", () => {
    expect(texts(de as Tree).filter(([, text]) => ADDRESS.test(text))).toEqual([]);
  });

  it("has no imperative opening a sentence", () => {
    expect(texts(de as Tree).filter(([, text]) => IMPERATIVE.test(text))).toEqual([]);
  });
});
