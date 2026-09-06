/**
 * Card and editor strings in German and English.
 * Owner: agent 4. REQ N-7, E-6, E-1.
 */
import de from "./translations/de.json";
import en from "./translations/en.json";
import type { HomeAssistant } from "./types";

type Translation = { [key: string]: string | Translation };

/** A further language needs nothing but its file and one entry here (REQ N-7). */
const TRANSLATIONS: Record<string, Translation> = { en, de };
const FALLBACK = "en";

/** Only the language code counts, so "de-CH" uses "de". */
function languageOf(hass?: HomeAssistant): string {
  const fromDocument = typeof document !== "undefined" ? document.documentElement?.lang : undefined;
  const language = hass?.language || fromDocument || FALLBACK;
  return language.split("-")[0].toLowerCase();
}

function lookup(table: Translation | undefined, key: string): string | undefined {
  let node: string | Translation | undefined = table;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Looks up a dotted key, e.g. "node.grid.import".
 *
 * The language chain is `hass?.language ?? document.documentElement.lang ?? "en"`:
 * setConfig runs before hass exists, and its error messages must still be
 * translated (REQ E-1). Unknown keys return the key itself.
 * `params` fills `{placeholders}`, e.g. { minutes: 15 }.
 */
export function localize(
  key: string,
  hass?: HomeAssistant,
  params?: Record<string, string | number>,
): string {
  const language = languageOf(hass);
  const text = lookup(TRANSLATIONS[language], key) ?? lookup(TRANSLATIONS[FALLBACK], key) ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
