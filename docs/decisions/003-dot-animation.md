# 003 — Technik für die Punkte-Animation

| | |
|---|---|
| Status | **Entschieden** — am Gerät gemessen und umgesetzt |
| Datum | 2026-09-06 |
| Betrifft | REQ P-1 … P-8, N-1, N-3, N-8 · Meilenstein M3 · `src/render/dots.ts` |
| Messseite | `docs/spikes/dot-animation.html` (eigenständig, offline, auch auf dem Handy) |
| Ergebnis der Messung | **WAAPI bestätigt** (iPhone, 6. 9. 2026): Sprung 0,0 % gegen 5,7 % (CSS) und 17,0 % (SMIL) — Abschnitt 6 |

---

## 1. Frage

Auf jeder aktiven Verbindung laufen Punkte einen gekrümmten SVG-Pfad entlang. Geschwindigkeit und Anzahl folgen der
Stufenregel aus REQ 4.6 und ändern sich in jedem Takt (Standard alle 5 s). Die harte Anforderung ist **REQ P-6**:

> Beim Parameterwechsel verschiebt sich jeder bestehende Punkt um höchstens **5 % der Pfadlänge**;
> hinzukommende Punkte blenden ein, entfallende aus.

Ein Punkt, der bei jedem Takt sichtbar an den Pfadanfang zurückspringt, ist der auffälligste Fehler, den diese Karte
haben kann — er passiert alle fünf Sekunden und im Blickfeld. Die Wahl der Animationstechnik entscheidet darüber.

Nebenbedingungen: HA-Companion iOS ab 16.4 (WKWebView), Android-WebView ab Chromium 106, Desktop-Browser der
letzten zwei Jahre (REQ N-3); ≥ 30 fps bei 6 Linien à 5 Punkten (REQ N-1); Pausieren bei `visibilitychange`
(REQ P-8); `prefers-reduced-motion` inklusive Laufzeit-`change` (REQ P-7).

## 2. Kandidaten

### A — SMIL: `<animateMotion>` + `<mpath>`

| | |
|---|---|
| Verfügbarkeit | Läuft überall, auch im Shadow DOM. `<mpath>` braucht `href` **und** `xlink:href` für ältere WebKit-Stände. |
| Phase bei `dur`-Wechsel | **Springt.** Blink, Gecko und WebKit behalten den Startzeitpunkt bei; die Phase wird gegen die neue Dauer neu gerechnet. HA Core nimmt das in Kauf — für REQ P-6 ist es ein Fehlschlag. |
| Resync möglich? | Ja, aber nur durch Neustart: Phase messen, `dur` setzen, `beginElementAt(−phase × dur)`. Das ist ein Restart je Punkt und je Takt — 30 Restarts im N-1-Fall. Ob WebKit negative Offsets in `beginElementAt` korrekt behandelt, ist offen. |
| Pausieren | `svg.pauseAnimations()` / `unpauseAnimations()` — sauber und global je SVG. |
| Beschleunigung | In WebKit nicht compositor-beschleunigt. |
| Sonstiges | Braucht eine Pfad-Referenz per ID → REQ N-8 wird zur Pflicht (mehrere Karten auf einem Dashboard). |

### B — CSS Motion Path: `offset-path: path("…")` + `@keyframes offset-distance`

| | |
|---|---|
| Verfügbarkeit | Nur in der Form `path("<d>")`. **Nicht** `offset-path: url(#id)` — die gibt es erst ab Safari 17 und Firefox 122, während iOS 16.4 unterstützt werden soll. |
| Phase bei `dur`-Wechsel | **Springt.** Eine geänderte `animation-duration` wird gerechnet, „als hätte die Animation immer diesen Wert gehabt". Zusätzlich muss bei geänderter Punktzahl auch `animation-delay` nachgezogen werden — ein zweiter Sprung. |
| Resync möglich? | Nur über `animation-delay` neu setzen, was denselben Neuanlauf bedeutet wie bei SMIL. |
| Pausieren | `animation-play-state: paused` je Punkt. |
| Beschleunigung | In WebKit nicht compositor-beschleunigt; ein gesetztes `offset-path` **deaktiviert dort sogar die Beschleunigung von `transform` und `opacity`** auf demselben Element. |
| Sonstiges | Keine ID-Referenz nötig — der Pfad steht als Literal in der Deklaration. Dafür steht die Geometrie doppelt im Dokument (SVG-Linie + CSS-Pfad). |

### C — Web Animations API: `element.animate(…)` + `updatePlaybackRate(rate)`

| | |
|---|---|
| Verfügbarkeit | `element.animate` überall in der Zielmenge. `Animation.updatePlaybackRate` seit Safari 13.1 / Chromium 60 — für iOS 16.4 sicher da. Bewegt wird `offset-distance`, also gilt auch hier die `path("…")`-Einschränkung aus B. |
| Phase bei `dur`-Wechsel | **Bleibt erhalten.** Die Dauer der Animation wird gar nicht angefasst: Sie läuft mit einer festen Basisdauer (z. B. 5 s), und die Geschwindigkeit ändert allein die Abspielrate. `updatePlaybackRate` behält `currentTime` bei — das ist die einzige der drei Techniken, bei der die Phase nachweislich erhalten bleibt. |
| Punktzahl ändern | Bestehende Punkte werden nicht angefasst. Neue Punkte bekommen ihre Phase über `currentTime` gesetzt und blenden ein, entfallende blenden aus — genau die zweite Hälfte von REQ P-6. |
| Pausieren | `animation.pause()` / `play()` je Punkt, sauber und ohne Phasenverlust. |
| Beschleunigung | In WebKit ebenfalls nicht compositor-beschleunigt (siehe B). Kein Vorteil, aber auch kein Nachteil gegenüber A und B. |
| Sonstiges | Kein `<mpath>`, keine ID-Referenz für die Bewegung. IDs bleiben trotzdem eindeutig zu vergeben (REQ N-8) — für Verläufe, Clip-Pfade und den Fall, dass der SMIL-Rückfall greift. |

## 3. Empfehlung

**WAAPI (Kandidat C) als Hauptweg**, mit fester Basisdauer und Geschwindigkeitswechsel ausschließlich über
`updatePlaybackRate`.

Begründung, in dieser Reihenfolge:

1. **P-6 ist eine MUSS-Anforderung mit einer Zahl.** A und B verfehlen sie konstruktionsbedingt in *allen*
   Engines, nicht nur in einer. C erfüllt sie konstruktionsbedingt, weil `currentTime` schlicht unangetastet bleibt.
2. **Kein Neuanlauf je Takt.** A und B bräuchten Resync — also 30 Animationsneustarts alle 5 s im N-1-Fall.
   Das kostet Rechenzeit genau dort, wo REQ N-1 die 30 fps fordert, und es ist die Stelle, an der WebKit erfahrungsgemäß
   ruckelt. C ändert bei einem Takt nur eine Zahl je Punkt.
3. **Punktzahl und Geschwindigkeit sind bei C getrennt.** Das ist nicht nur bequem, es ist die Voraussetzung dafür,
   dass die zweite Hälfte von P-6 (ein-/ausblenden statt neu aufbauen) überhaupt sauber umsetzbar ist.
4. **Der WebKit-Beschleunigungsnachteil trifft alle drei gleich.** Er ist damit kein Auswahlkriterium, sondern eine
   Randbedingung für die Punktzahl — und die ist mit `max_dots = 5` und sechs Linien ohnehin klein gehalten.

Was C **nicht** löst: In WebKit deaktiviert ein gesetztes `offset-path` die Beschleunigung von `transform` und
`opacity` auf demselben Element. Das Ein-/Ausblenden per `opacity` läuft dort also auf dem Hauptthread mit. Bei
höchstens fünf Punkten je Linie und 300 ms Übergang ist das vertretbar; sollte die Messung etwas anderes zeigen,
blenden wir stattdessen über `r` bzw. die Punktgröße ein oder verzichten auf den Übergang.

## 4. Fallback-Kette

Erkennung einmal beim Aufbau der Karte, Ergebnis gecacht:

```ts
const hasOffsetPath = typeof CSS !== "undefined"
  && typeof CSS.supports === "function"
  && CSS.supports("offset-path", 'path("M0 0")');
const hasWaapi = typeof el.animate === "function";
const hasUpdateRate = typeof Animation !== "undefined"
  && typeof Animation.prototype.updatePlaybackRate === "function";
```

| Stufe | Bedingung | Technik | P-6 |
|---|---|---|---|
| 1 | `hasOffsetPath && hasWaapi && hasUpdateRate` | WAAPI, feste Basisdauer, `updatePlaybackRate(basis / dur)` | erfüllt |
| 2 | `hasOffsetPath && hasWaapi`, aber kein `updatePlaybackRate` | WAAPI, aber `animation.playbackRate = r` direkt setzen. Das erhält `currentTime` ebenfalls (nur ohne den nahtlosen Übergang von `updatePlaybackRate`) | erfüllt |
| 3 | kein `offset-path` | SMIL `<animateMotion>` + `<mpath>` **mit Phasen-Resync**: Phase analytisch mitführen, nach `dur`-Wechsel `beginElementAt(−phase × dur)` | erfüllt, sofern der Resync in der Engine greift — Messung nötig |
| 4 | kein `offset-path`, Resync greift nicht (WebKit-Eigenheit) | SMIL ohne Resync, aber **Parameter nur bei echtem Stufenwechsel** ändern statt in jedem Takt: dann springt es selten statt alle 5 s | verletzt, Einschränkung ins CHANGELOG |
| 5 | weder `offset-path` noch SMIL, oder `prefers-reduced-motion` | Punkte gleichmäßig verteilt und **statisch** (REQ P-7) | entfällt |

CSS Motion Path (Kandidat B) steht bewusst **nicht** in der Kette: Wo `offset-path` da ist, ist auch WAAPI da, und
dann ist WAAPI in jeder Hinsicht die bessere Wahl. B bliebe nur eine Technik mit demselben Verfügbarkeitsprofil und
schlechterem Verhalten.

`prefers-reduced-motion` liegt quer zur Kette: Bei `flow.animation: auto` und aktiver Systemeinstellung wird gar
nicht animiert, unabhängig von der erkannten Technik — und der `change`-Ereignishörer schaltet zur Laufzeit um
(REQ P-7).

## 5. Was nur die Messung am Gerät klären kann

Die Messseite `docs/spikes/dot-animation.html` zeigt alle drei Techniken auf demselben Pfad (`pv_house` aus
`docs/mockup.html`) und misst den Positionssprung selbst. Zu klären ist:

| # | Frage | Grenzwert | Wo abzulesen |
|---|---|---|---|
| 1 | Springt WAAPI in **iOS-WKWebView 16.4** wirklich nicht? | Median-Sprung **≤ 5 %** der Pfadlänge | große Prozentzahl in der WAAPI-Spalte |
| 2 | Wie groß ist der Sprung bei SMIL und CSS tatsächlich? (erwartet: zweistellig) | — (Beleg für die Verwerfung) | SMIL- und CSS-Spalte |
| 3 | Rettet der SMIL-Phasen-Resync die Technik in WebKit? Wird `beginElementAt` mit negativem Offset akzeptiert? | Median-Sprung **≤ 5 %** | Schalter „Phasen-Resync" in der SMIL-Spalte |
| 4 | Bildrate bei 6 Linien à 5 Punkten, je Technik einzeln, auf einem Mittelklasse-Smartphone | **≥ 30 fps** | Schalter „6 Linien à 5 Punkte" + Technik-Auswahl, Anzeige „Bildrate" |
| 5 | Ist `offset-path: path("…")` in allen Zielumgebungen vorhanden? | Abzeichen „offset-path unterstützt" | Kopf der CSS-/WAAPI-Spalte |
| 6 | Existiert `updatePlaybackRate`, oder greift Stufe 2 der Kette? | Abzeichen im Kopf der WAAPI-Spalte | dito |
| 7 | Laufen nach `visibilitychange = hidden` wirklich keine Frames mehr? (REQ P-8) | **0** Frames im Hintergrund | Anzeige „Frames im Hintergrund" nach einem Tabwechsel |
| 8 | Stehen die Punkte beim Pausieren in allen drei Techniken? | Abzeichen wechselt auf „steht" | Knopf „Pausieren" |
| 9 | Sieht der stillgelegte Zustand (P-7) brauchbar aus? | — (Augenschein) | Schalter „reduced-motion simulieren" |

**Zum Messrauschen:** Zwischen den beiden Positionsmessungen liegt rund ein Bild (~16 ms). Bei der schnellsten
Umlaufzeit (1,8 s) sind das etwa 1 % der Pfadlänge. Einzelwerte unter ~2 % bedeuten „kein Sprung"; maßgeblich ist
der **Median** über die Messreihe (12 Wechsel), nicht ein Einzelwert. Ein echter Phasensprung liegt deutlich höher.

**Bedienung in einem Satz:** Regler „Leistung" bewegen oder „Messreihe (12 Wechsel)" starten, die drei großen
Prozentzahlen ablesen, dann „6 Linien à 5 Punkte" einschalten und je Technik einzeln die Bildrate ablesen — auf dem
Desktop und danach in der HA-App auf dem Handy.

## 6. Ergebnis der Messung

**Gemessen am 6. 9. 2026, 22:24 Uhr, auf dem iPhone der Referenzinstallation** — also in genau der Umgebung, in der die Empfehlung am wenigsten gesichert war. Zwölf Parameterwechsel je Technik über die eingebaute Messreihe.

| Technik | Sprung Median | Sprung Maximum | P-6 (≤ 5 %) |
|---|---|---|---|
| SMIL (ohne Resync) | **17,0 %** | 48,5 % | ❌ verfehlt |
| CSS `offset-path` | **5,7 %** | 43,5 % | ❌ verfehlt |
| **WAAPI** | **0,0 %** | 0,1 % | ✅ **erfüllt** |

**Merkmalserkennung auf dem Gerät:** `element.animate` vorhanden · `updatePlaybackRate` vorhanden · `offset-path` unterstützt · SMIL unterstützt. Alle drei Techniken liefen.

**Entscheidung nach der Messung:**

> **Bestätigt: WAAPI mit `updatePlaybackRate`.** Der Median von 0,0 % bei einem Maximum von 0,1 % liegt im Bereich der Messgenauigkeit — ein Bildabstand entspricht rund 1 % der Pfadlänge, die Technik verschiebt die Punkte also nachweislich gar nicht. SMIL springt im Median um 17 % der Strecke, was bei einem Umlauf von 1,8 s deutlich sichtbar wäre; CSS liegt mit 5,7 % knapp über der Grenze und mit 43,5 % im Maximum weit darüber.
>
> Da auf dem Gerät alle Merkmale vorhanden sind, greift die Rückfallkette dort nicht. Sie bleibt für ältere WebViews bestehen, ist aber nicht der Normalfall.

**Noch offen:** Bildrate mit 6 Linien à 5 Punkten, Verhalten nach einem Tabwechsel (Frames im Hintergrund), Android-WebView. Diese Werte betreffen die Auswahl nicht mehr, sondern nur noch die Umsetzung — sie werden in M10 (Robustheit und Leistung) nachgeholt.

## 7. Folgen für `src/render/dots.ts`

**Struktur.** Ein Zustandsobjekt je Karteninstanz, darin je Verbindung ein Eintrag:

```
DotLayer
├── techniqueMode          einmal erkannt (Stufe 1…5 der Kette), danach unveränderlich
├── pathIds: Map<LinkKey, string>   eindeutig je Karteninstanz (REQ N-8)
└── links: Map<LinkKey, LinkDots>
    ├── direction          aus flow.ts (DotPlan.connection); höchstens eine Richtung aktiv (REQ P-2)
    ├── color              Zustandsfarbe nach REQ P-4
    └── dots: DotHandle[]  stabile Reihenfolge; Index 0 ist der Referenzpunkt
        ├── el             SVG-<circle> bzw. HTML-Punkt
        ├── anim           Animation (WAAPI) bzw. <animateMotion> (SMIL)
        └── phase          analytisch mitgeführt, 0…1
```

**Feste Basisdauer.** Die WAAPI-Animation wird **einmal** mit einer Basisdauer angelegt (Vorschlag: `slow_s`, also
5 s) und danach nie neu erzeugt. Geschwindigkeit = `rate = basis_s / durationS`. Bei `durationS = fast_s = 1,8 s`
ist `rate ≈ 2,78`. Die Eingabe bleibt der `DotPlan[]` aus `flow.ts` (`planDots`, Felder `connection`, `count`,
`durationS`, `colorKey`) nach REQ 4.6 — die Umrechnung in eine Rate passiert erst hier, damit die Regel testbar
bleibt, wie sie in den Anforderungen steht.

**Umschaltpunkte** (und nur diese):

| Anlass | Was passiert |
|---|---|
| Takt, gleiche Richtung, nur `durationS` ändert sich | `updatePlaybackRate` je bestehendem Punkt. **Kein** Neuaufbau, kein `currentTime`-Schreiben. |
| Takt, `count` steigt | Bestehende Punkte unangetastet. Neue Punkte anlegen, `currentTime` auf `basis × ((phase₀ + i/count) mod 1)` setzen, Deckkraft 0 → 1. |
| Takt, `count` sinkt | Überzählige Punkte ausblenden (Deckkraft 1 → 0), nach dem Übergang entfernen und die Animation `cancel()`n. |
| Richtungswechsel auf einer Verbindung | Alte Punkte ausblenden, neue in der Gegenrichtung einblenden — kein Umdrehen laufender Animationen. |
| Verbindung wird inaktiv (`< flow.min_w`) | Alle Punkte ausblenden, Animationen `cancel()`n, Linie in Theme-Trennlinienfarbe (REQ P-5). |
| `prefers-reduced-motion` → an | Alle Animationen `cancel()`n, Punkte statisch auf `i/n` setzen (REQ P-7). |
| `prefers-reduced-motion` → aus | Animationen neu aufbauen, Phase aus den statischen Positionen übernehmen. |
| `visibilitychange = hidden` / außerhalb des Viewports | Alle Animationen `pause()`n und den Takt anhalten (REQ P-8). |
| wieder sichtbar | `play()` — die Phase ist erhalten, es gibt nichts nachzuziehen. |
| `disconnectedCallback` | Jede Animation `cancel()`n, Punkte entfernen, `IntersectionObserver` und Medienabfrage-Hörer abmelden (REQ N-4). |

**Worauf zu achten ist:**

- **Eindeutige IDs je Karteninstanz (REQ N-8).** Auch wenn WAAPI selbst keine Pfad-ID braucht, gilt das für Verläufe,
  Clip-Pfade und den SMIL-Rückfall. Ein Präfix je Instanz (`enerlens-<zähler>-`) beim Aufbau erzeugen und **überall**
  verwenden. Zwei Karten auf einem Dashboard sind der Normalfall, nicht der Sonderfall.
- **Niemals `offset-path: url(#id)`.** Immer das Pfad-Literal `path("<d>")`. Das heißt: Die Geometrie steht an zwei
  Stellen (SVG-Linie und Punkt-Deklaration) und muss aus **einer** Quelle erzeugt werden — die `d`-Zeichenketten in
  `render/cross.ts` sind diese Quelle, `dots.ts` liest sie und schreibt sie nicht selbst.
- **`currentTime` nach dem Aufbau nicht mehr anfassen** außer bei neu hinzukommenden Punkten. Jeder Schreibzugriff
  ist ein potenzieller Sprung.
- **`updatePlaybackRate` vor `playbackRate`**, aber beide gehen: Auch das direkte Setzen von `playbackRate` erhält
  `currentTime`. Der Unterschied ist nur die Nahtlosigkeit — deshalb ist Stufe 2 der Kette unkritisch.
- **Punkte nicht neu erzeugen, wenn sie bleiben sollen.** Der häufigste Weg, P-6 zu verletzen, ist ein
  `render()`-Durchlauf, der die Punkte einfach neu aufbaut. Die Punktobjekte müssen den Takt überleben; nur
  Lit-`repeat` mit stabilen Schlüsseln oder eine eigene, imperative Verwaltung außerhalb des Templates kommen infrage.
- **Zwei Punktzahlen unterscheiden:** `count` aus REQ 4.6 ist die Zahl *je Verbindung*. Der N-1-Grenzfall sind sechs
  Verbindungen mit `max_dots` = 30 Punkte gleichzeitig. Danach ist zu dimensionieren.
- **Kein `will-change: transform` auf Punkten in WebKit.** Ein gesetztes `offset-path` schaltet die Beschleunigung
  dort ohnehin ab; das Versprechen kostet dann nur Speicher.
- **Die Stufenregel gehört nicht hierher.** `flow.ts`/`planDots` liefert den `DotPlan[]` und wird gegen die neun
  Werte der Abnahme P getestet; `dots.ts` setzt nur um. Damit bleibt die geprüfte Regel unabhängig von der Animationstechnik.
