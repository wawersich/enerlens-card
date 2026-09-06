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
    expect(localize("error.config.soc_without_battery")).toContain("nur zusammen mit");
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
      localize("error.config.range", makeHass("en"), {
        field: "flow.max_dots",
        min: 2,
        max: 10,
      }),
    ).toBe("flow.max_dots must be between 2 and 10.");
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
