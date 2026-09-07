# EnerLens Card — Implementierungsplan

| | |
|---|---|
| Stand | 2026-09-06, **Fassung 2** (nach technischer Prüfung) |
| Grundlage | `docs/REQUIREMENTS.md` (IDs wie K-7, L-5, A-2, ENT-16 verweisen dorthin), `docs/mockup.html` |
| Ziel | Version 0.1.0 als HACS-Custom-Repository, getestet auf der eigenen HA-Instanz |
| Arbeitsweise | Claude Code implementiert Schritt für Schritt; Markus prüft in der HA-Oberfläche und gibt jeden Schritt frei, bevor der nächste beginnt. |
| **Status 7. 9. 2026** | **M0–M11 umgesetzt** (siehe `git log`, ein Commit je Meilenstein). Karte läuft produktiv auf `dashboard-warmepumpe`. Offen aus M11: Repository öffentlich, Tag `v0.1.0`, HACS-Validierung, Ressource auf `/hacsfiles/` umstellen. Editor nachgeschärft: Quellenauswahl je Bilanzgröße (E-3). |

> **Dringend, unabhängig vom Rest:** Der Recorder läuft ohne `purge_keep_days` (Standard 10 Tage). Die Rohdaten vom 5. 9. 2026, auf denen **alle** Abnahmekriterien beruhen, werden um den **15. 9. 2026** gelöscht. Schritt **M0a** muss vorher laufen.

---

## 1. Technik-Entscheidungen

| Bereich | Entscheidung | Begründung / Alternative |
|---|---|---|
| Sprache | **TypeScript** (strict) | Typfehler beim Übersetzen statt im Browser. |
| UI-Basis | **Lit 3**, mitgebundelt (~20 kB gzip) | Das HA-Frontend ist selbst Lit; `ha-card`, `ha-icon`, `ha-form` sind zur Laufzeit registriert. Lit aus HA zu ziehen spart wenig und bricht bei HA-Umbauten. |
| Darstellung | **SVG für Verbindungen, Punkte, Ring und Füllstand; HTML für Knoteninhalte, Liste und Chips** (ENT-20) | `ha-icon` ist HTML und lässt sich nicht in SVG einsetzen; SVG-Text skaliert mit der viewBox und unterschreitet auf dem Handy die Lesbarkeit (K-12). Knoten werden als HTML absolut über dem SVG positioniert (Muster der HA-Energieverteilungskarte). |
| Punkte-Animation | **Spike in M3**: WAAPI (`element.animate` + `updatePlaybackRate`) vs. SMIL `<animateMotion>` vs. CSS `offset-path: path(…)` | Nur WAAPI ändert die Geschwindigkeit ohne Phasensprung (P-6). SMIL springt in allen Engines bei `dur`-Änderung; `offset-path: url(#id)` fällt unter iOS 16.4 aus. Fallback-Kette und Ergebnis in `docs/decisions/003-dot-animation.md`. |
| Listen-Animation | **FLIP** — `@lit-labs/motion` (≈ 3 kB gzip, Version exakt gepinnt) oder eigene Direktive | Löst L-8. `repeat()` mit stabilen Schlüsseln ist Pflicht. Bekannte Issues (#3016, #4808) im Testplan. |
| Ring-Animation | CSS-Transitions auf `stroke-dasharray`/`stroke-dashoffset`, einheitenlose Zahlen, Umfang im Code (2πr) | Wie HA Core. Nicht von/zu `none` überblenden (nicht interpolierbar). |
| Build | **Rollup** + `@rollup/plugin-typescript` + `node-resolve` + `terser` | Ein einziges ES-Modul, keine Externals, kein Code-Splitting (HACS liefert genau eine Datei). |
| HA-Typen | **eigene Minimal-Typen** | `custom-card-helpers` ist veraltet. Eigener `fireEvent`-Helfer (10 Zeilen) mit `bubbles: true, composed: true`. |
| Zahlenformat | `Intl.NumberFormat`; die ~30 Zeilen `numberFormatToLocale`/`formatNumber` aus dem HA-Frontend übernehmen (Apache-2.0-Hinweis im Kopf), **alle sieben** `number_format`-Werte | Es gibt keinen offiziellen Export für berechnete Werte. Abbildung: `language` → `locale.language`, `system` → `undefined`, `comma_decimal` → `["en-US","en"]`, `decimal_comma` → `["de","es","it"]`, `space_comma` → `["fr","sv","cs"]`, `quote_decimal` → `["de-CH"]`, `none` → `"en-US"` ohne Gruppierung. Für den SOC `hass.formatEntityState` (K-4). |
| Sprachen | `src/translations/en.json`, `de.json`; `localize(key, hass)` mit Kette `hass?.language ?? document.documentElement.lang ?? "en"` | `setConfig` läuft, bevor `hass` gesetzt ist — ohne die Kette wären Strukturfehler unübersetzt (E-1). |
| Tests | **Vitest** für die reine Logik, Fixtures aus der echten Historie | Vorzeichen, Einheiten, Rest, Limit, Skalierung, Mittelwerte sind reine Funktionen. Rendering wird manuell in HA geprüft. |
| Lint/Format | **Biome** | Eine Abhängigkeit statt ESLint + Prettier + Plugins. |
| Ablage | Repo `/homeassistant/prj/enerlens-card`, `node_modules` → Symlink nach **`/share/dev/enerlens-card/node_modules`** | Repo im täglichen HA-Backup, die 92 MB Abhängigkeiten nicht. Zwei Fallstricke: Das Zielverzeichnis **muss selbst `node_modules` heißen**, weil Node Modulpfade über den realen Pfad auflöst; und `npm install` ersetzt den Symlink jedes Mal durch ein echtes Verzeichnis — `scripts/setup.sh` stellt ihn danach wieder her. |

---

## 2. Architektur

### 2.1 Module

```
src/
├── enerlens-card.ts      Custom Element: Lifecycle, hass/config-Setter, Takt,
│                         Sichtbarkeit, Ansichtsmodus, render() delegiert
├── editor.ts             <enerlens-card-editor>: ha-form-Schema, config-changed
├── config.ts             Schema-Typen, Defaults, normalize()/validate() (E-1, E-2, A-1)
├── model.ts              hass + config → Model: Einheiten (4.1), Vorzeichen (4.2),
│                         Verfügbarkeit (K-9), abgeleitete Bilanzgröße (A-1…A-5)
├── averaging.ts          Ringpuffer je Entität, zeitgewichtetes Mittel (4.8),
│                         Vorbefüllung aus dem Recorder, Fensterbeschnitt (V-4…V-10)
├── consumers.ts          Filter, Limit, Rest, Sortierung, Ring-Segmente (4.4)
├── flow.ts               Flussverteilung (4.5) → Punkteplan (4.6)
├── colors.ts             Palette, SOC-Verlauf (4.7), Auflösung von var(--…)
├── format.ts             kW-Formatierung nach hass.locale (K-7)
├── localize.ts           localize(key, hass) mit Sprachkette und Rückfall auf en
├── translations/
│   ├── en.json           vollständig (Referenz)
│   └── de.json           vollständig
├── render/
│   ├── header.ts         Titel, Modus-Chips, Kennzeichnung (V-2, V-3)
│   ├── cross.ts          Geometrie, SVG-Verbindungen, HTML-Knoten, Trefferflächen
│   ├── dots.ts           Punkte auf Pfaden (Ergebnis des M3-Spikes)
│   ├── ring.ts           Segmente, Lücken, Übergänge, Treffer-Ring
│   └── list.ts           Zeilen, FLIP
├── styles.ts             CSS (Theme-Variablen, Gegenskalierung, Fokus, reduced-motion)
├── types.ts              Minimal-Typen für HA
└── const.ts              Name, Version, Palette

scripts/
├── replay.mjs            Referenzdaten auf Szenario-Entitäten spielen (M2a)
└── deploy.sh             Build → www/ → Ressourcen-Version hochzählen

/share/dev/enerlens-fixture/   (außerhalb des Repos, REQ 5.1)
├── export-history.mjs    Export aus dem Recorder
├── reference-values.mjs  Sollwerte der Abnahmen L und V
├── history-2026-*.json   neun Tage Messdaten, Referenztag 05.09.2026
└── expected.json         erzeugte Sollwerte
```

### 2.2 Datenfluss

```
hass (jede Änderung)                    Takt (alle update_interval_s)
        │                                        │
        ├──► averaging.ts (Puffer füllen)        │
        ▼                                        ▼
   model.ts ──► source(mode) ──┬──► render/cross   (Aktuell: sofort · Ø: im Takt)
                               ├──► consumers.ts ──► render/list, render/ring
                               └──► flow.ts      ──► render/dots
```

`source(mode)` liefert das Model entweder roh (*Aktuell*) oder gemittelt (*Ø kurz/lang*). Alle nachgelagerten Module kennen den Modus nicht (V-4). Der Ladezustand kommt immer roh (V-5). Zwei Uhren: Im Modus *Aktuell* folgen die Knotenzahlen `hass` sofort; in den Ø-Modi werden sie zusätzlich im Takt neu berechnet, weil das Fenster auch ohne Zustandsänderung wandert (T-1). Ein Moduswechsel stößt sofort einen Takt an (V-8).

### 2.3 Zentrale Datentypen (Skizze)

```ts
type Reading = { available: true; w: number; entity: string } | { available: false; entity?: string }
interface Signed { positive: number; negative: number; net: number; entityPositive?: string; entityNegative?: string; available: boolean }
interface Model {
  solar: Reading & { derived: boolean }
  grid: Signed & { derived: boolean }        // positive = Bezug (E-2)
  battery: (Signed & { derived: boolean }) | null   // positive = Entladen (ENT-16)
  soc: Reading                                // nie gemittelt (V-5)
  house: Reading & { derived: boolean }
  consumers: Array<{ key: string; entity: string; name: string; color: string; reading: Reading }>
}
interface ListEntry { key: string; name: string; w: number; color: string; entity?: string; isRest: boolean }
interface Segment { key: string; share: number; color: string; entity?: string }
interface DotPlan { connection: ConnectionId; count: number; durationS: number; color: string }
```

### 2.4 Karten-Schnittstelle zu HA

- `setConfig(config)` → `normalize()`; wirft nur bei Strukturfehlern (E-1).
- `set hass(hass)` → Puffer füllen, Model aktualisieren; Re-Render nach T-3.
- `getCardSize()` (Masonry, aus der gerenderten Höhe, ≈ 7–10) und `getGridOptions()` (Sections): `columns: 12`, `min_columns: 12`, `rows: "auto"`. **Kein** `getLayoutOptions()` — deprecated, und N-3 fordert ≥ 2025.7.
- `static getConfigElement()` async mit `await import("./editor")`; Rollup bündelt den Editor per `inlineDynamicImports` mit ein, weil HACS genau eine Datei ausliefert — der Import strukturiert also den Code, lädt aber nichts nach. `static getStubConfig(hass, entities, entitiesFallback)` (E-5).
- `window.customCards.push({ type: "enerlens-card", name, description, preview: true, documentationURL })` — idempotent, ohne `custom:`-Präfix (AL-4).
- More-Info: `fireEvent(this, "hass-more-info", { entityId })` mit `bubbles: true, composed: true`.
- `render()` gibt `nothing` zurück, solange `hass` oder `config` fehlen (HA setzt sie in beliebiger Reihenfolge).
- Im Vorschaumodus (`this.preview === true`) keine Recorder-Abfragen (V-6); Initialisierung billig und idempotent halten, weil HA die Karte bei jeder Editor-Änderung neu erzeugt.

---

## 3. Arbeitsschritte

Größen: **S** ≈ eine Sitzung, **M** ≈ zwei, **L** ≈ drei oder mehr. Jeder Schritt endet mit einem Build, der per `scripts/deploy.sh` nach `/homeassistant/www/` geht, und einer Prüfung in der HA-Oberfläche.

### M0a — Referenzdaten sichern · **erledigt am 6. 9. 2026**

**Ziel war:** Die Datengrundlage aller Abnahmen sichern, bevor der Recorder sie löscht (Standard 10 Tage).

Umgesetzt in `/share/dev/enerlens-fixture/` — **außerhalb des Repositories** (REQ 5.1, ENT-21):

- `export-history.mjs` holt einen Tag aus dem Recorder und bildet die Entitäten auf Rollen ab (`solar`, `grid`, `house_5s`, `heatpump`, `washer` …), sodass Auswertungen ohne die echten IDs auskommen.
- Gesichert: **29. 8. bis 6. 9. 2026**, neun Tage, 22 MB. Referenztag ist der **5. 9. 2026** (52 319 Zustände, 17 Serien inkl. Ladezustand).
- `reference-values.mjs` erzeugt `expected.json` mit den Sollwerten der Abnahmen L und V — ein vom Kartencode unabhängiger Rechenweg.

**Dabei aufgefallen:** Die ursprünglichen Abnahmefälle für 12:46 und 12:51 stammten aus den Beispielwerten des Mockups, nicht aus echten Messungen. REQ 2.3 ist auf die tatsächlichen Werte korrigiert.

### M0 — Gerüst, Repository, Werkzeuge · M

**Ziel:** Leere Karte lädt fehlerfrei in HA; Build, Lint, Tests laufen; das GitHub-Repo existiert.

- Git-Identität festlegen (private E-Mail-Adresse), erster Commit.
- GitHub-Repository anlegen — Description, Topics (`home-assistant`, `lovelace`, `custom-card`, `hacs`, `energy`, `photovoltaic`), Issues aktiviert.
- `package.json`, `tsconfig.json`, `rollup.config.js`, Biome, Vitest.
- `src/enerlens-card.ts` rendert `<ha-card>` mit Titel, Konsolen-Banner, `window.customCards` (AL-4).
- `hacs.json` nach AL-1 (mit `hide_default_branch`, ohne `render_readme`), `LICENSE` (MIT), `README.md` **mit einem echten Bild** (Mockup-Screenshot — der HACS-`images`-Check verlangt es), `CHANGELOG.md`.
- `.github/workflows/build.yml`: Build, Lint, Tests bei jedem Push; bei Tag `v*` Release mit genau einem Asset.
- `.github/workflows/validate.yml`: `hacs/action@main`, `category: plugin`, nur `workflow_dispatch` und beim Release — **nicht** bei jedem Push, weil die Strukturprüfung vor dem ersten Release fehlschlägt (AL-3).
- `scripts/deploy.sh`; Test-Dashboard „EnerLens Test" und Lovelace-Ressource anlegen (Abschnitt 5).

**Fertig, wenn:** Karte erscheint im Test-Dashboard, `npm run build && npm test && npm run lint` grün, `build.yml` grün. *HACS-Validierung ist hier ausdrücklich noch nicht Kriterium — sie gehört zu M11.*

**Stand 6. 9. 2026:** erledigt bis auf die Prüfung im Browser. Gerüst steht, Bundle 16 kB (6 kB gzip), Test-Dashboard `/enerlens-test` mit den Ansichten Live, Szenarien und Stress angelegt, Ressource `/local/enerlens-card.js?v=<hash>` registriert. `scripts/deploy.sh` baut, kopiert und zählt die Ressourcen-Version hoch.

### M2a — Test-Helfer · S

**Ziel:** Szenarien lassen sich reproduzierbar in HA einspielen.

- `input_number`-Helfer für PV, Netz, Haus, Batterie, SOC plus Template-Sensoren (`device_class: power`, Einheit W) als Szenario-Entitäten.
- 100 generierte Stress-Sensoren für L-11/N-1.
- `scripts/replay.mjs`: spielt Ausschnitte der Referenzdaten (5.1) per REST `POST /api/states` in Echtzeit oder mit Zeitfaktor auf die Szenario-Entitäten. **Hintergrund:** HA kann Zustände nicht rückdatieren — Abnahmen mit Historie laufen deshalb über Replay plus Unit-Tests, nicht über „eingespielte Historie".
- Test-Dashboard mit drei Ansichten: *Live*, *Szenarien*, *Stress*.

**Fertig, wenn:** `replay.mjs` das Fenster 15:25–15:41 auf die Szenario-Entitäten spielt und die Werte in HA sichtbar durchlaufen.

### M1 — Datenmodell mit Tests · M

**Ziel:** Alle Regeln aus REQ Abschnitt 4 als reine Funktionen, vollständig getestet — **bevor** gezeichnet wird. (Ohne `averaging.ts`, das kommt in M7a.)

- `config.ts`: Schema, Defaults, `normalize()` (String / `{entity, invert}` / zwei Entitäten / `derived`), Bereichsprüfungen, Fehlermeldungen über `localize`.
- `localize.ts` + beide Übersetzungsdateien; Test: identische Schlüsselmengen.
- `model.ts`: Einheiten (4.1), Vorzeichen (4.2, inkl. Zwei-Entitäten-Netto), Verfügbarkeit (K-9), abgeleitete Bilanzgröße (A-1…A-5).
- `consumers.ts` (4.4), `flow.ts` (4.5, 4.6), `colors.ts` (4.7), `format.ts` (K-7, alle sieben Formate).
- **Tests:** die Abnahmen L, P und die Vorzeichenfälle aus der Checkliste; dazu Invarianten über alle Rasterpunkte der Fixture: kein `NaN`, Ring-Anteile summieren zu 1, Rest nie negativ in der Liste, Limit eingehalten, auf jeder Verbindung höchstens eine Richtung.

**Fertig, wenn:** Alle Tests grün, `expected.json` aus M0a wird als Orakel genutzt.

### M2 — Kreuz mit statischen Werten · M

**Ziel:** Vier Knoten mit echten Werten, Beschriftungen, Zustandsfarben; noch ohne Punkte.

- `render/cross.ts`: SVG für Verbindungen, HTML-Knoten darüber (ENT-20) mit `ha-icon`, Wert, Beschriftung; Geometrie aus dem Mockup als Ausgangspunkt.
- `styles.ts`: Theme-Variablen, **Gegenskalierung** per `ResizeObserver` für K-12, Layout schmal/breit (L-1).
- „—" bei `unavailable` (K-9), „· berechnet" bei abgeleiteten Knoten (A-3), Textstauchung (K-13).

**Fertig, wenn:** Abnahme K bestanden — inklusive der gemessenen Schriftgrößen bei 360 px und 320 px, hell und dunkel; Sprache auf Englisch umgestellt → alle Beschriftungen englisch.

### M3 — Punkte · M (inkl. Spike)

**Ziel:** Animierte Punkte nach Stufenregel; Technikentscheidung dokumentiert.

- **Spike (halbe Sitzung), drei Kandidaten:** WAAPI mit `updatePlaybackRate`, SMIL mit Phasen-Resynchronisation, CSS `offset-path: path(…)`. Prüfkriterien mit Zahlen: (1) Positionssprung beim Parameterwechsel ≤ 5 % der Pfadlänge (P-6); (2) nach `visibilitychange = hidden` keine Frames (P-8); (3) `prefers-reduced-motion` inkl. `change`-Ereignis; (4) iOS-Companion und Android-WebView; (5) ≥ 30 fps bei 6 Linien à 5 Punkten. Ergebnis in `docs/decisions/003-dot-animation.md`.
- `render/dots.ts`, Farben nach P-4, Takt-Kopplung (T-2), Pausieren per `IntersectionObserver` + `visibilitychange`.
- Eindeutige Pfad-IDs je Karteninstanz (N-8).

**Fertig, wenn:** Abnahme P bestanden (alle neun Werte), Kriterien des Spikes gemessen.

### M4 — Batterie · S

**Ziel:** Zwei Werte, Verlaufsfarbe, Füllstand, zwei Trefferflächen.

- SOC über dem Icon, kW darunter (K-4, `hass.formatEntityState`); Füllstand (K-5); SOC-Farbe für Füllstand, Rand und Icon — **nicht** für die Zahl (C-3, C-5); Icon nach Ladezustand.
- Trefferflächen als **Rechtecke** über und unter der Icon-Unterkante, über den Kreisrand hinausreichend (I-2, ENT-5); Größe per `ResizeObserver` in CSS-px nachgemessen.

**Fertig, wenn:** Bei 23 %, 50 %, 72 %, 100 % stimmen Farbe und Füllstand; die beiden Flächen messen bei 360 px und 320 px ≥ 44 × 44 px (Inspektor); Daumen-Tipps treffen getrennt.

### M5 — Verbraucherliste · L

**Ziel:** Liste mit Filter, Limit, Rest, Takt und Gleit-Animation.

- `render/list.ts`: Zeilen (L-2) mit ≥ 44 px Höhe (I-3), Reihenfolge und Werte im Takt (L-7).
- FLIP über `@lit-labs/motion` (Größe prüfen) oder eigene Direktive; Ein-/Ausblenden mit den Zeiten aus L-8.
- Rest inkl. Verschwinden bei Σ > Haus und bei nicht verfügbarem Hauswert (L-5, 4.4).

**Fertig, wenn:** Replay 12:46 → 12:51 → 15:40:18 zeigt: Zeilen gleiten, Klima fällt durchs Limit, Rest verschwindet und kommt zurück. Keine Sprünge, kein Flackern.

### M6 — Ring · M

**Ziel:** Ring synchron zur Liste, 100-%-Skalierung, animierte Übergänge.

- `render/ring.ts`: Segmente mit Lücke, Start oben (R-2); Übergänge per CSS-Transition über stabile Schlüssel (R-4); unsichtbarer Treffer-Ring (R-5); Ring ohne Liste (R-6).

**Fertig, wenn:** Abnahme R bestanden; neues Segment wächst aus 0, verschwindendes schrumpft auf 0.

### M7 — Interaktion · S

**Ziel:** More-Info überall, Tastatur, Trefferflächen.

- `hass-more-info` für Knoten, Batterie-Flächen, Listeneinträge, Ring-Segmente (I-1, I-2, L-9, R-5); Entitätswahl nach Nettorichtung (4.2).
- Nicht klickbare Elemente (I-4). `role="button"`, `tabindex`, `aria-label`, Enter/Leertaste, sichtbarer Fokus (I-5). Ring-Segmente ohne eigenen Tab-Stopp, solange die Liste sichtbar ist.

**Fertig, wenn:** Jeder Klick öffnet den richtigen Dialog; Tab-Reihenfolge PV → Netz → Haus → Batterie-SOC → Batterie-kW → Liste.

### M7a — Mittelwerte (Logik) · M

**Ziel:** `averaging.ts` fertig und getestet, ohne UI.

- Ringpuffer je Entität, zeitgewichtetes Mittel (4.8), Fensterbeschnitt, `null`-Abschnitte (V-7), Speichergrenze (V-10).
- Vorbefüllung: eine gebündelte Abfrage, Zeitlimit 5 s, Fehlerpfad „seit hh:mm" (V-6); Wiederholung nach Verbindungslücke (V-7).
- **Tests gegen `expected.json`** (Abnahme V, ±1 W).

**Fertig, wenn:** Alle Werte der Abnahme-Tabelle V reproduziert.

### M7b — Ansichtsmodus (UI) · S

**Ziel:** Umschalter, sofortige Wirkung, Kennzeichnung.

- `render/header.ts`: Titel + Chips, Umbruch bei < 400 px, `role="radiogroup"`, Chips ≥ 36 px (V-2, I-3); Kennzeichnung bei ausgeblendetem Umschalter (V-3).
- Moduswechsel stößt sofort einen Takt an (V-8); Knotenwerte im Takt in den Ø-Modi (T-1); keine Vorbefüllung im Vorschaumodus (V-6); `localStorage` (V-11, KANN).

**Fertig, wenn:** Umschalten < 100 ms sichtbar; nach Neuladen zeigt „Ø 15 min" sofort ein volles Fenster; More-Info zeigt weiterhin rohe Historie (V-9).

### M8 — Farben und Theme · S

**Ziel:** Alle Farben aus der Konfiguration, beide Themes messbar korrekt.

- `colors.*` durchreichen (C-1, C-2, C-4); `var()`-Auflösung für den SOC-Verlauf (4.7); Zahlen in `--primary-text-color` (C-5).
- **`flow.inactive_lines`** (P-9): `show` / `dim` / `hide` für inaktive Verbindungen — von Markus gewünscht, damit das Bild nachts ruhiger wird.
- **Kontrast messen** (N-6): Text ≥ 4,5:1, Grafik ≥ 3:1 auf `#ffffff` und `#1c1c1c`, DevTools-Werte protokollieren.

**Fertig, wenn:** Standardkonfiguration und eine Grün/Rot-Konfiguration bestehen die Kontrastmessung in beiden Themes.

### M9 — GUI-Editor · M

**Ziel:** Vollständiger Editor inklusive Verbraucherliste.

- `editor.ts` mit `ha-form`: ODER-Filter für Entitäten (E-3), Auswahl „abgeleitet" je Bilanzgröße (A-1), Schalter, Zahlen, Texte, Ansichtsmodus; Gruppierung per `expandable` mit `flatten: true`.
- **Verbraucherliste über den Objekt-Selektor** (`object`, `multiple: true`, `fields`, `label_field`, `description_field`) — E-4, ab HA 2025.7.
- `getStubConfig` (E-5); Labels und Hilfetexte de/en (E-6); `config-changed` immer mit vollständiger Konfiguration, entfernte Optionen auf `undefined`.

**Fertig, wenn:** Eine komplette Konfiguration inklusive Verbrauchern lässt sich ohne YAML anlegen; Änderungen erscheinen live in der Vorschau; die Karte im Kartenauswahl-Dialog zeigt eine echte Vorschau statt einer Fehlerkarte.

### M10 — Robustheit und Leistung · S

**Ziel:** N-1, N-4, N-5, L-11.

- Stress-Ansicht aus M2a: 100 Verbraucher, `max_consumers: 5`; Profiling (Layout-Thrash, Timer, Bildrate).
- Alle Entitäten nacheinander `unavailable`; leere `consumers`; beide Netz-Entitäten gleichzeitig > 0; Karte mehrfach ein-/aushängen → keine verwaisten Timer oder Animationen.
- Bundle-Größe messen und im README nennen.

**Fertig, wenn:** Checkliste REQ Abschnitt 5 bis auf die HACS-Punkte abgehakt.

### M11 — Dokumentation und Release · M

**Ziel:** 0.1.0 auf GitHub, per HACS installierbar.

- README (EN) nach AL-5: Konfigurationsreferenz aus REQ Abschnitt 3, **Vorzeichen-Konvention und Umstieg von power-flow-card-plus** (ENT-16), Grün/Rot-Beispiel, Screenshots hell/dunkel, Hinweis auf schnelle Haus-Sensoren (ENT-8).
- Repository auf **public** stellen; Version, `CHANGELOG.md`.
- Tag `v0.1.0` → CI baut und **erzeugt ein GitHub-Release** mit genau einem Asset (HACS wertet nur echte Releases aus, keine Tags, keine Drafts).
- `validate.yml` per `workflow_dispatch` starten → muss **ohne `ignore` grün** sein (AL-3).
- HACS-Installation als Custom Repository auf der eigenen Instanz; Ressource von `/local/…` auf `/hacsfiles/enerlens-card/…` umstellen.
- **Karte in der Zielansicht einbauen:** Dashboard `dashboard-warmepumpe`, Ansicht `enerlens` (http://<home-assistant>:8123/dashboard-warmepumpe/enerlens) — vorher den aktuellen UI-Stand einlesen, weil Markus parallel selbst editiert.
- **Vor dem Public-Schalten:** Historie auf personenbezogene Inhalte prüfen (N-9).
- Optional: Prüfung gegen die Mindestversion (HA-Container 2025.7 auf einem anderen Rechner) oder N-3 auf die tatsächlich geprüfte Version anheben.

**Fertig, wenn:** Frische Installation über HACS zeigt die Karte identisch zur Entwicklungsversion.

---

## 4. Teststrategie

| Ebene | Was | Wie |
|---|---|---|
| Unit (CI) | `config`, `model`, `consumers`, `flow`, `colors`, `format`, `averaging` | Vitest mit kleinen, handgeschriebenen Fällen im Repo — Formeln, Rundung, Vorzeichen, Filter, Limit, Flussverteilung, Punkteregel (Abnahmen K und P). Läuft überall, auch ohne Referenzdaten (REQ N-9). |
| Unit (lokal) | Abnahmen L, R, V gegen echte Messdaten | Liest `/share/dev/enerlens-fixture/`; Orakel ist `expected.json`. Fehlen die Daten, überspringt die Suite diese Fälle mit deutlicher Meldung — sie darf deswegen nicht rot werden. |
| Komponente | Element registriert, `setConfig`-Fehler, Render ohne Exceptions, `getStubConfig` | Vitest + `happy-dom`; keine Pixelvergleiche. |
| Manuell in HA | Optik, Animationen, Themes, Touch, Companion Apps, Editor | Test-Dashboard aus M2a (*Live*, *Szenarien*, *Stress*) plus `replay.mjs`. Messungen (Trefferflächen, Schriftgrößen, Kontrast) mit dem DevTools-Inspektor, Werte protokolliert. |
| CI | Build, Lint, Tests bei jedem Push; HACS-Validierung ab M11 | GitHub Actions. |

Bewusst **nicht**: Pixelgenaue Screenshots, Browser-Automatisierung.

---

## 5. Entwicklungs-Workflow auf der HA-Box

1. `npm run build` → `dist/enerlens-card.js`
2. `scripts/deploy.sh` kopiert nach `/homeassistant/www/enerlens-card.js` und zählt die Ressourcen-Version hoch (`/local/enerlens-card.js?v=<hash>`, per WebSocket `lovelace/resources/update`) — sonst cached der Browser.
3. Markus prüft im Test-Dashboard (Desktop und Handy), gibt frei; danach Commit.

**Zielort der fertigen Karte** (nach M11, wenn sie über HACS installiert ist): Dashboard „Energie/PV" (`dashboard-warmepumpe`), Ansicht `enerlens` — http://<home-assistant>:8123/dashboard-warmepumpe/enerlens. Bis dahin läuft alles im separaten Test-Dashboard, damit das produktive Dashboard unberührt bleibt.

---

## 6. Risiken und Gegenmaßnahmen

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| ~~Referenzdaten gehen verloren~~ | — | **Erledigt:** neun Tage in `/share/dev/enerlens-fixture/` gesichert (M0a). |
| Personenbezogene Daten gelangen versehentlich ins öffentliche Repo | Seriennummern und Verbrauchsprofil dauerhaft einsehbar | `test/fixtures/` und `*.json` mit Messdaten in `.gitignore`; Referenzdaten liegen außerhalb des Repos; vor dem Public-Schalten in M11 die Historie prüfen (`git log -p` nach Entitäts-IDs durchsuchen); Screenshots mit neutralen Namen (N-9). |
| Keine Animationstechnik erfüllt P-6 in allen Ziel-WebViews | Sichtbare Sprünge beim Tempowechsel | Spike mit drei Kandidaten und Fallback-Kette (M3); notfalls Parameter nur bei Stufenwechsel ändern und die Einschränkung dokumentieren. |
| Objekt-Selektor verhält sich anders als erwartet | E-4 rutscht | YAML-Fallback ist immer da; Hinweistext im Editor; Entscheidung nach M9. |
| W/kW-Verwechslung, `mW` als Mega gelesen | Werte um Faktor 1000 falsch | Case-sensitive SI-Tabelle (4.1) mit Tests; README-Abschnitt. |
| Vorzeichen passt nicht zur Integration des Nutzers | Bezug/Einspeisung, Laden/Entladen vertauscht | HA-Konvention als Standard (ENT-16), `invert` je Entität, Zwei-Entitäten-Form, sprechende Beschriftung (C-6). Testkonfigurationen für drei fremde Setups: nur Netz+PV ohne Batterie, HA-Energy-Dashboard-Sensoren, Wechselrichter mit getrenntem Bezug/Einspeisung. |
| Recorder-Historie fehlt oder ist langsam | Mittelwert nach dem Laden unvollständig | Kennzeichnung „seit hh:mm" (V-6), eine gebündelte Abfrage, Zeitlimit 5 s, keine Abfrage im Vorschaumodus. |
| HA-Frontend ändert interne Elemente | Editor oder More-Info bricht | Nur dokumentierte Mechanismen; Mindestversion in `hacs.json` pflegen; HA-Beta auf der eigenen Instanz testen. |
| Bundle wächst | N-1 verfehlt | Größe je Schritt messen; `@lit-labs/motion` nur, wenn < 5 kB gzip. |
| Mehrere Karten auf einem Dashboard stören sich | Fehlende Füllungen/Referenzen (WebKit vor Safari 17) | Eindeutige SVG-IDs je Instanz (N-8). |

---

## 7. Release-Ablauf 0.1.0

1. `CHANGELOG.md` und Version in `package.json`/`const.ts` setzen.
2. Repository auf public; Description, Topics, Issues prüfen.
3. `git tag v0.1.0 && git push --tags` → CI baut und **erzeugt ein GitHub-Release** mit `enerlens-card.js` als einzigem Asset.
4. `validate.yml` per `workflow_dispatch` → grün ohne `ignore`.
5. HACS → Custom Repository → Kategorie *Dashboard* → installieren; Ressource prüfen.
6. Smoke-Test nach REQ Abschnitt 5.
7. Später, nach einigen Wochen Betrieb: PR gegen `hacs/default` (Bearbeitungszeit: Monate).

---

## 8. Nach 0.1 (Backlog)

Siehe REQ Abschnitt 7. Reihenfolge nach Nutzen für den eigenen Betrieb: `tap_action` → kompaktes Layout für schmale Karten → Prognose-Ring → Zeitraum-Umschaltung → Null-Konfiguration aus den Energie-Einstellungen.
