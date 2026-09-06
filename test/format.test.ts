import { describe, expect, it } from "vitest";
import { formatKW, formatSoc, localeFor } from "../src/format";
import type { HassEntity, HassLocale, HomeAssistant } from "../src/types";

type NumberFormat = HassLocale["number_format"];

/** Locale data beyond English is optional in some Node builds. */
const HAS_FULL_ICU = Intl.NumberFormat.supportedLocalesOf(["de", "fr", "de-CH"]).length === 3;

function makeHass(
  number_format: NumberFormat,
  language = "de",
  extra: Partial<HomeAssistant> = {},
): HomeAssistant {
  return {
    states: {},
    language,
    locale: { language, number_format },
    callWS: () => Promise.reject(new Error("not used in tests")),
    ...extra,
  };
}

function makeState(state: string, entity_id = "sensor.soc"): HassEntity {
  return {
    entity_id,
    state,
    attributes: { unit_of_measurement: "%", device_class: "battery" },
    last_changed: "2026-09-05T12:00:00+00:00",
    last_updated: "2026-09-05T12:00:00+00:00",
  };
}

/** The two decimals of "x,xx kW" - readable without knowing the separator. */
function decimals(text: string): string {
  return /(\d\d) kW$/.exec(text)?.[1] ?? "";
}

describe("localeFor (all seven number_format values)", () => {
  it("mirrors HA's numberFormatToLocale", () => {
    expect(localeFor(makeHass("language", "nl"))).toBe("nl");
    expect(localeFor(makeHass("system"))).toBeUndefined();
    expect(localeFor(makeHass("comma_decimal"))).toEqual(["en-US", "en"]);
    expect(localeFor(makeHass("decimal_comma"))).toEqual(["de", "es", "it"]);
    expect(localeFor(makeHass("space_comma"))).toEqual(["fr", "sv", "cs"]);
    expect(localeFor(makeHass("quote_decimal"))).toEqual(["de-CH"]);
    expect(localeFor(makeHass("none"))).toBe("en-US");
  });
});

describe("formatKW (REQ K-7)", () => {
  it.skipIf(!HAS_FULL_ICU)("formats 9330 W under every number_format", () => {
    expect(formatKW(9330, makeHass("language", "de"))).toBe("9,33 kW");
    expect(formatKW(9330, makeHass("comma_decimal"))).toBe("9.33 kW");
    expect(formatKW(9330, makeHass("decimal_comma"))).toBe("9,33 kW");
    expect(formatKW(9330, makeHass("space_comma"))).toBe("9,33 kW");
    expect(formatKW(9330, makeHass("quote_decimal"))).toBe("9.33 kW");
    expect(formatKW(9330, makeHass("none"))).toBe("9.33 kW");
  });

  it("follows the system locale for number_format: system", () => {
    const expected = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(9.33);
    expect(formatKW(9330, makeHass("system"))).toBe(`${expected} kW`);
  });

  it("rounds commercially: 1525 W is 1,53 kW, not 1,52", () => {
    expect(decimals(formatKW(1525, makeHass("comma_decimal")))).toBe("53");
    expect(formatKW(1525, makeHass("comma_decimal"))).toBe("1.53 kW");
  });

  it("keeps exactly two decimals", () => {
    expect(formatKW(0, makeHass("comma_decimal"))).toBe("0.00 kW");
    expect(formatKW(123450, makeHass("comma_decimal"))).toBe("123.45 kW");
    expect(decimals(formatKW(9330, makeHass("language", "de")))).toBe("33");
    expect(decimals(formatKW(123450, makeHass("language", "de")))).toBe("45");
  });

  it("never renders negative zero", () => {
    expect(formatKW(-0.001, makeHass("comma_decimal"))).toBe("0.00 kW");
    expect(formatKW(-0, makeHass("comma_decimal"))).toBe("0.00 kW");
    expect(formatKW(-0.001, makeHass("language", "de"))).not.toContain("-");
    expect(formatKW(-4, makeHass("comma_decimal"))).toBe("0.00 kW");
    expect(formatKW(-1600, makeHass("comma_decimal"))).toBe("-1.60 kW");
  });

  it("drops the group separator for number_format: none", () => {
    expect(formatKW(1234500, makeHass("none"))).toBe("1234.50 kW");
    expect(formatKW(1234500, makeHass("comma_decimal"))).toBe("1,234.50 kW");
  });
});

describe("formatSoc (REQ K-4)", () => {
  it("uses hass.formatEntityState when HA offers it", () => {
    const hass = makeHass("language", "de", {
      formatEntityState: (stateObj) => `${stateObj.state} %`,
    });
    expect(formatSoc(makeState("72"), hass)).toBe("72 %");
  });

  it("adds a space before % for cs, de, fi, fr, sk and sv", () => {
    for (const language of ["cs", "de", "fi", "fr", "sk", "sv"]) {
      expect(formatSoc(makeState("72"), makeHass("comma_decimal", language))).toBe("72 %");
    }
  });

  it("omits the space for every other language", () => {
    for (const language of ["en", "nl", "es", "it"]) {
      expect(formatSoc(makeState("72"), makeHass("comma_decimal", language))).toBe("72%");
    }
  });

  it("keeps the decimals the state carries and follows the locale", () => {
    expect(formatSoc(makeState("72.5"), makeHass("comma_decimal", "en"))).toBe("72.5%");
    expect(formatSoc(makeState("72.50"), makeHass("comma_decimal", "en"))).toBe("72.50%");
    // number_format and language are independent: en-US digits, German spacing.
    expect(formatSoc(makeState("72.55"), makeHass("comma_decimal", "de"))).toBe("72.55 %");
  });

  it("prefers the registry display_precision", () => {
    const hass = makeHass("comma_decimal", "en", {
      entities: { "sensor.soc": { display_precision: 1 } },
    });
    expect(formatSoc(makeState("72"), hass)).toBe("72.0%");
  });

  it("renders an em dash without a state object or a number", () => {
    const hass = makeHass("comma_decimal", "en");
    expect(formatSoc(undefined, hass)).toBe("—");
    expect(formatSoc(makeState("unavailable"), hass)).toBe("—");
    expect(formatSoc(makeState(""), hass)).toBe("—");
  });
});
