# EnerLens Card — Anforderungen

| | |
|---|---|
| Projekt | `enerlens-card` — Lovelace Custom Card für Home Assistant |
| Stand | 2026-09-06, **Fassung 2** (nach technischer Prüfung) |
| Zielversion | 0.1.0 (erste HACS-Veröffentlichung) |
| Referenz | `docs/mockup.html` (Artifact: https://claude.ai/code/artifact/01d72836-df8d-404d-a56b-258b9c6da1bf) |
| Begleitdokument | `docs/IMPLEMENTATION_PLAN.md` |

**Bei Abweichungen zwischen diesem Dokument und dem Mockup ist dieses Dokument maßgeblich.** Das Mockup zeigt Aussehen und Verhalten; sein JavaScript ist Illustration, keine Spezifikation.

| Priorität | Bedeutung |
|---|---|
| **MUSS** | Teil von 0.1.0. Ohne das wird nicht veröffentlicht. |
| **SOLL** | Für 0.1.0 vorgesehen; darf in 0.2 rutschen, wenn der Aufwand aus dem Rahmen läuft. |
| **KANN** | Backlog. Wird beim Entwurf berücksichtigt (nicht verbaut), aber nicht gebaut. |

ID-Reihen: K Kreuz · P Punkte · L Liste · R Ring · C Farben · I Interaktion · E Konfiguration/Editor · T Takt · V Ansichtsmodus · A Ableitung · N Nicht-funktional · AL Auslieferung · ENT Entscheidungen.

---

## 0. Begriffe

| Begriff | Bedeutung |
|---|---|
| **Knoten** | Die vier Kreise: PV (oben), Netz (links), Haus (rechts), Batterie (unten). |
| **Verbindung** | Linie zwischen zwei Knoten. Sechs Stück: PV–Haus, PV–Netz, PV–Batterie, Netz–Haus, Netz–Batterie, Batterie–Haus. |
| **Fluss** | Leistung, die auf einer Verbindung in eine Richtung fließt (berechnet, nur für die Animation). |
| **Punkte** | Die animierten Kreise, die auf einer aktiven Verbindung in Flussrichtung laufen. |
| **Bilanzgrößen** | Die vier Größen der Energiebilanz: `solar`, `grid`, `house`, `battery`. |
| **Hauswert** | Gesamtverbrauch des Hauses in W — aus Sensor oder abgeleitet. |
| **Verbraucher** | Einzeln gemessener Teil des Hausverbrauchs. Verbraucher sind eine *Aufschlüsselung* des Hauswerts, kein zusätzlicher Verbrauch. |
| **Gezeigte Verbraucher** | Verbraucher nach Filter (≥ `min_consumer_w`) und Limit (`max_consumers`). |
| **Rest** | Hauswert − Σ gezeigte Verbraucher. Bezeichnung frei wählbar. |
| **Liste** | Optionale Aufstellung der gezeigten Verbraucher + Rest rechts vom Haus-Knoten. |
| **Ring** | Optionaler Kreisring um den Haus-Knoten, Segmente = Anteile der gezeigten Verbraucher + Rest. |
| **Takt** | Intervall, in dem Liste, Ring, Punkte-Parameter (und in den Ø-Modi die Knotenwerte) neu berechnet werden (`update_interval_s`, Standard 5 s). |
| **Ansichtsmodus** | *Aktuell* (rohe Messwerte) oder *Ø kurz* / *Ø lang* (zeitgewichtete gleitende Mittel). |
| **Fenster** | Zeitspanne rückwärts von jetzt, über die ein Mittelwert gebildet wird. |
| **Trefferfläche** | Unsichtbarer, klickbarer Bereich über einem Element — bewusst größer als die sichtbare Form. |

---

## 1. Grundsätze

**G-1 Messwerte werden nie verändert.** Im Ansichtsmodus *Aktuell* ist jede angezeigte Zahl der aktuelle Zustand ihrer Entität — nur Einheit umgerechnet (W → kW) und formatiert. Keine Glättung, Begrenzung, Plausibilisierung, kein Nachziehen. Wenn Einzelwerte und Hauswert für ein paar Sekunden nicht zusammenpassen, ist das sichtbar und richtig so.
Berechnet wird nur an fünf klar benannten Stellen: die **eine abgeleitete Bilanzgröße** (A-1), der **Rest**, die **Ring-Anteile**, die **Flussverteilung** für die Animation und die **Mittelwerte** der Ø-Modi (2.12) — letztere immer sichtbar gekennzeichnet.

**G-2 Alles außer dem Kern ist optional.** Die Knoten PV, Netz und Haus sind immer sichtbar — gemessen oder abgeleitet. Als Sensoren sind mindestens drei der vier Bilanzgrößen nötig, die vierte darf abgeleitet werden (A-1). Batterie, Verbraucher, Liste und Ring erscheinen nur, wenn konfiguriert bzw. eingeschaltet — ohne Lücke im Layout.

**G-3 Die Karte fügt sich in Home Assistant ein.** `ha-card`, HA-Theme-Variablen, HA-Zahlenformat, HA-More-Info-Dialog, HA-Optionsnamen. Kein eigenes Diagramm, keine eigene Chart-Bibliothek.

**G-4 Eine Datei, keine Netzwerkzugriffe.** Alles ist im Bundle; zur Laufzeit wird nichts von außen geladen.

**G-5 YAML ist vollständig, der Editor deckt das Übliche ab.** Jede Option ist per YAML setzbar.

**G-6 Die Karte ist für fremde Anlagen gebaut, nicht nur für diese.** Nichts ist auf bestimmte Integrationen, Entitätsnamen oder Einheiten festgelegt. Vorzeichen folgen der HA-Konvention (E-2), Einheiten werden normalisiert (K-8), eine fehlende Bilanzgröße wird abgeleitet (2.11). Alle sichtbaren Texte sind übersetzt (Deutsch und Englisch mindestens).

---

## 2. Funktionale Anforderungen

### 2.1 Kreuz (K)

| ID | Anforderung | Prio |
|---|---|---|
| K-1 | Layout wie das bekannte Kreuz: PV oben, Netz links, Haus rechts, Batterie unten. Verbindungen zu/von PV und Batterie als Kurven durch die Mitte, Netz–Haus und PV–Batterie gerade. | MUSS |
| K-2 | PV-, Netz- und Haus-Knoten zeigen Icon und Wert im Format `x,xx kW`. Beschriftung: „PV", „Netz · Einspeisung" / „Netz · Bezug" / „Netz", „Haus". Icons konfigurierbar (mdi), Beschriftungen lokalisiert. | MUSS |
| K-3 | Netz-Knoten zeigt den **Betrag** der Netzleistung; der Zustand folgt dem Vorzeichen der Nettoleistung (4.2) — **aber erst ab `flow.min_w`**: darunter heißt der Knoten nur „Netz", in neutraler Farbe. 4 W Einspeisung werden als 0,00 kW angezeigt, und „Einspeisung" daneben wäre Rauschen. Gleiche Schwelle wie für die Punkte (P-1). | MUSS |
| K-4 | Batterie-Knoten zeigt **zwei Werte**: Ladezustand in `%` **über** dem Icon, Betrag der Lade-/Entladeleistung in `x,xx kW` **unter** dem Icon. Beschriftung „Batterie · lädt" / „Batterie · entlädt" / „Batterie" — Zustandswort und Farbe erst ab `flow.min_w` wie bei K-3. Der SOC wird über `hass.formatEntityState(stateObj)` formatiert (Nachkommastellen und Leerzeichenregel vor `%` nach HA-Einstellung); Fallback: eigene Formatierung. | MUSS |
| K-5 | Batterie-Knoten von unten gefüllt entsprechend dem Ladezustand, in der Ladezustandsfarbe (C-3), deckungsarm genug für lesbaren Text. | SOLL |
| K-6 | Hauswert aus der konfigurierten Entität; ohne Entität abgeleitet (2.11). Abgeleitete Knoten tragen den Zusatz „· berechnet" und sind nicht klickbar (I-4). | MUSS |
| K-7 | Zahlenformat: immer kW mit genau zwei Nachkommastellen. Rundung kaufmännisch über `Intl.NumberFormat` mit `minimumFractionDigits = maximumFractionDigits = 2` (Grenzfall 1 525 W → `1,53 kW`). Trennzeichen nach `hass.locale` (alle sieben `number_format`-Werte). Negative Null wird nie angezeigt; 0 W → `0,00 kW`. | MUSS |
| K-8 | Eingangs-Entitäten dürfen jede SI-Präfix-Einheit der `device_class: power` liefern (`mW`, `W`, `kW`, `MW`, `GW`, `TW`); intern wird in W gerechnet. Normalisierung **case-sensitiv** (`mW` = Milli, `MW` = Mega). Fehlt die Einheit bei `device_class: power`, wird W angenommen; fehlt beides, zeigt die Karte eine Warnung und rechnet nicht. Ändert sich die Einheit zur Laufzeit, wird neu normalisiert. | MUSS |
| K-9 | Nicht verfügbare Werte (`unavailable`, `unknown`, nicht numerisch): Knoten zeigt „—", seine Verbindungen sind inaktiv, keine Punkte. Die Karte bleibt sonst voll funktionsfähig. | MUSS |
| K-10 | Nicht konfigurierte optionale Knoten (Batterie) entfallen samt Verbindungen; die Geometrie der übrigen Knoten bleibt unverändert. | MUSS |
| K-11 | Optionaler Kartentitel (`title`) als HA-Kartenkopf. | MUSS |
| K-13 | **Gleicher Außendurchmesser aller vier Knoten.** PV, Netz und Batterie sind so groß wie Haus **plus Ring**; ohne Ring (Ring aus oder keine Verbraucher) hat auch das Haus diese Größe. Entschieden durch die Konfiguration, nicht durch die Segmente des Augenblicks — das Haus darf nicht springen, wenn die Liste gerade leer ist. | MUSS |
| K-12 | **Mindestgrößen auf schmalen Karten.** Bei Kartenbreite ≥ 344 px gilt in CSS-px: Knotenwerte ≥ 12 px, Beschriftungen und Listenzeilen **12 px fest** (dieselbe Größe wie `power-flow-card-plus`, neben der die Karte auf vielen Dashboards steht), SOC-Zahl ≥ 11 px, Punkte ≥ 12 px Durchmesser, Verbindungslinien ≥ 3 px, Ring-Strich ≥ 8 px. Umsetzung durch Gegenskalierung anhand der gemessenen Kartenbreite, nicht durch feste viewBox-Einheiten. | MUSS |
| K-13 | **Textüberlauf:** Werte dürfen den Knotenrand nicht schneiden. Passt ein Wert nicht (z. B. `123,45 kW`), wird er auf bis zu 85 % gestaucht; das Format `x,xx kW` bleibt. Beschriftungen mit Zusatz „· berechnet" dürfen zweizeilig umbrechen. | SOLL |
| K-14 | Optionale Anzeige von Autarkie-/Eigenverbrauchsquote im Haus-Knoten. | KANN |

**Abnahme K:** Mit `solar 9 330 W`, `grid −3 930 W`, `house 3 800 W`, `battery −1 600 W` (= Laden, E-2), `soc 72 %` zeigt die Karte: PV `9,33 kW`, Netz `3,93 kW` / „Netz · Einspeisung", Haus `3,80 kW`, Batterie `72 %` und `1,60 kW` / „Batterie · lädt". Prüfung zusätzlich in Chrome-DevTools bei Gerätebreite 360 px und 320 px, hell und dunkel; Größen aus K-12 im Inspektor gemessen. `solar` auf `unavailable` → PV zeigt „—", die drei PV-Verbindungen inaktiv, alles andere läuft weiter.

### 2.2 Punkte (P)

| ID | Anforderung | Prio |
|---|---|---|
| P-1 | Auf jeder aktiven Verbindung laufen Punkte in Flussrichtung. Aktiv = Fluss ≥ `flow.min_w`. | MUSS |
| P-2 | Flussverteilung nach fester Prioritätsfolge (4.5), nur für die Animation, nie als Zahl angezeigt. Auf jeder Verbindung ist höchstens eine Richtung aktiv. | MUSS |
| P-3 | Geschwindigkeit und Anzahl folgen **einer globalen Stufenregel** mit drei Schwellen S1 < S2 < S3 (`flow.slow_below_w`, `flow.more_dots_above_w`, `flow.max_dots_at_w`) und `flow.max_dots`, gleich für alle Verbindungen. Berechnung in 4.6. Standard: S1 = 500 W, S2 = 2 000 W, S3 = 6 000 W, `max_dots` = 5, `slow_s` = 5, `fast_s` = 1,8. | MUSS |
| P-4 | Punktfarbe = Farbe des Flusszustands: PV→Haus `solar`; PV→Netz und Batterie→Netz `grid_export`; PV→Batterie `battery_charge`; Netz→Haus und Netz→Batterie `grid_import`; Batterie→Haus `battery_discharge`. | MUSS |
| P-5 | Aktive Verbindungen in der Punktfarbe abgeschwächt gezeichnet, inaktive in der Theme-Trennlinienfarbe. | SOLL |
| P-9 | *(umgesetzt am 07.09.2026)* **Inaktive Verbindungen sind ausblendbar** über `flow.inactive_lines`: `show` (Standard, graue Linie), `dim` (stark abgeschwächt) oder `hide` (gar nicht gezeichnet). Bei `hide` bleibt die Geometrie der Knoten unverändert — es verschwindet nur die Linie, nichts rückt nach. Nachts, wenn PV und Netz ruhen, wird das Bild damit deutlich ruhiger. Vorbild: `display_zero_lines` in power-flow-card-plus, hier auf drei Werte verkürzt. | SOLL |
| P-6 | Änderungen von Geschwindigkeit/Anzahl werden im Takt übernommen. **Messbar:** Beim Parameterwechsel verschiebt sich jeder bestehende Punkt um höchstens 5 % der Pfadlänge; hinzukommende Punkte blenden ein, entfallende aus. | MUSS |
| P-7 | Option `flow.animation: auto \| on \| off`. `auto` (Standard) respektiert `prefers-reduced-motion` und reagiert auf dessen `change`-Ereignis zur Laufzeit; bei stillgelegter Animation stehen die Punkte gleichmäßig verteilt, Liste und Ring wechseln ohne Übergang. | MUSS |
| P-8 | Ist die Karte nicht sichtbar (Tab im Hintergrund, außerhalb des Viewports), pausieren Animationen und Takt. **Messbar:** nach `visibilitychange = hidden` keine Animations-Frames mehr. | SOLL |

**Abnahme P** (Standardwerte, Umlaufzeiten ±0,05 s): 5 W → 0 Punkte, Linie inaktiv · exakt 10 W → 1 Punkt (Grenze inklusiv) · 300 W → 1 Punkt, 5,00 s · exakt 500 W → 1 Punkt, 5,00 s · 1 200 W → 1 Punkt, 3,51 s · exakt 2 000 W → 2 Punkte, 1,80 s · 4 000 W → **3 Punkte**, 1,80 s · 6 000 W → 5 Punkte · 9 000 W → 5 Punkte.

### 2.3 Verbraucherliste (L)

| ID | Anforderung | Prio |
|---|---|---|
| L-1 | Optional (`list.enabled`, Standard: an, sobald `consumers` konfiguriert ist). Rechts vom Haus-Knoten, vertikal auf dessen Höhe, wenn die Inhaltsbreite ≥ **445 px** ist; darunter unter dem Kreuz. **Der Wert ist kein Geschmacksurteil:** Home Assistant begrenzt eine Spalte der Sections-Ansicht auf rund 500 px, sodass etwa 460 px Inhalt bleiben — eine höhere Schwelle bedeutet, dass die Liste dort *nie* neben dem Kreuz steht. | MUSS |
| L-2 | Ein Eintrag besteht aus Farbmarke, Name und Wert; **ein Icon ersetzt die Farbmarke** — konfiguriert (`icon`) oder, ohne Angabe, das `icon`-Attribut der Entität; an derselben Stelle, in der Eintragsfarbe, 18 px, dort wo die Fächerlinie endet. Ohne beides bleibt die Farbmarke (die Standard-Icons nach Geräteklasse kennt nur das Frontend, nicht der Zustand). Dann folgen Name und Wert `x,xx kW` (K-7). Name aus der Konfiguration, sonst `friendly_name`. Zu lange Namen mit Ellipse gekürzt; der Wert wird nie gekürzt. | MUSS |
| L-3 | **Filter:** Verbraucher mit Wert < `min_consumer_w` (Standard 10 W) werden nicht gezeigt; nicht verfügbare gelten als nicht gezeigt. **Je Verbraucher optional ein eigenes `min_w`**, das den globalen Wert für diesen Eintrag ersetzt — für Geräte mit nennenswertem Standby (Wärmepumpe 25 W in Ruhe), die erst ab ihrer Arbeitsleistung interessieren. | MUSS |
| L-4 | **Limit:** Höchstens `max_consumers` Verbraucher — die stärksten. Ohne Limit alle, die den Filter passieren. Das Limit zählt nur echte Verbraucher; der Rest kommt obendrauf. | MUSS |
| L-5 | **Rest-Eintrag:** Wert = Hauswert − Σ gezeigte Verbraucher (inklusive aller weggefilterten und weggelimitierten). Bezeichnung `rest_label` (Standard lokalisiert: de „Rest", en „Other"), Farbe `colors.rest`, nicht klickbar. Der Rest unterliegt **derselben Filterregel** wie alle Einträge: liegt er unter `min_consumer_w` — also auch, wenn Σ > Hauswert und er negativ wird —, verschwindet er und kommt zurück, sobald der Hauswert nachgezogen hat. Ist der Hauswert nicht verfügbar, entfällt der Rest ebenfalls (4.4). | MUSS |
| L-6 | Sortierung absteigend nach Wert; der Rest wird wie ein normaler Eintrag einsortiert. | MUSS |
| L-7 | **Werte folgen den Sensoren sofort, die Reihenfolge nur im Takt** (T-2). Auch Auswahl (Filter, Limit) und Rest-Eintrag werden im Takt bestimmt: Ein Verbraucher, der zwischen zwei Takten unter `min_consumer_w` fällt, bleibt sichtbar und zeigt seinen aktuellen Wert, bis der nächste Takt neu auswählt. So bleibt die Zahl live, ohne dass die Liste zappelt. | MUSS |
| L-8 | Umsortieren ist animiert: bestehende Einträge **gleiten** auf ihre neue Position (FLIP), neue blenden ein, verschwindende aus. Dauer: 600 ms Bewegung, 350 ms Deckkraft, 400 ms Höhe; Easing `cubic-bezier(.4,0,.2,1)`. Kein Neuaufbau der Liste. | MUSS |
| L-9 | Klick/Tipp auf einen Eintrag öffnet den More-Info-Dialog der Verbraucher-Entität (I-1). Die **sichtbare** Zeile darf kompakter sein (34 px), die **Trefferfläche** reicht über sie hinaus und bleibt ≥ 44 px (I-3); benachbarte Flächen stoßen aneinander, ohne sich zu überlappen. | MUSS |
| L-10 | Optionaler Listentitel (`list.title`); ohne Angabe kein Titel. | KANN |
| L-11 | Auch mit 100 konfigurierten Verbrauchern bleibt die Karte flüssig (N-1); nur gezeigte Einträge existieren im DOM. | SOLL |
| L-12 | **Filter aufheben.** Ein runder Icon-Knopf (36 px, wie die Modus-Chips) **im Kartenkopf rechts neben den Modus-Chips** zeigt **alle** konfigurierten Verbraucher mit verfügbarem Wert, unabhängig von `min_consumer_w`, `min_w` und `max_consumers` — damit ein Gerät, das eben noch lief und jetzt herausgefiltert ist, für den Verlauf anklickbar bleibt. Sortierung, Werte und Gleit-Animation wie sonst; der Rest folgt weiter L-5; Ring-Segmente mit 0 W werden nicht gezeichnet. Der Zustand gilt je Karteninstanz und wird nicht gespeichert. | MUSS |
| L-13 | **Linien zur Liste.** Steht die Liste neben dem Kreuz, führt vom rechten Rand des Haus-Knotens zu jedem Eintrag eine Kurve in der Eintragsfarbe, mit Punkten nach P-2. Steht die Liste unter dem Kreuz, ersetzt eine kurze Bahn am Zeilenanfang die Kurve (kein Fächer über die Zeilen hinweg). Die Kurven werden in CSS-Pixeln aus gemessenen Positionen gezeichnet und folgen den Zeilen **während** der Gleit-Animation (L-8) Bild für Bild, statt erst am Ende zu springen. | MUSS |

**Abnahme L** — Referenzdaten `history-2026-09-05.json` (lokal, siehe 5.1), Hauswert `sensor.house_power`, `min_consumer_w: 10`, `max_consumers: 4`, Modus *Aktuell*, Werte exakt in W:

| Zeitpunkt (ISO) | Hauswert | Verbraucher (W) | Erwartete Liste |
|---|---|---|---|
| `2026-09-05T12:46:04+02:00` | 2 340 | Trockner 1 475, Kühl 230, Speicher 128, Waschm. 74, Spülm. 53, WP 25, Klima-Sp. 1 | Trockner 1,48 · **Rest 0,43** · Kühl 0,23 · Speicher 0,13 · Waschm. 0,07 — *Spülm., WP und Klima-Sp. fallen durchs Limit bzw. den Filter und stecken im Rest* |
| `2026-09-05T12:51:00+02:00` | 1 200 | Kühl 232, Trockner 211, Speicher 134, Waschm. 105, Spülm. 53, WP 25, Klima-Sp. 1 | **Rest 0,52** · Kühl 0,23 · Trockner 0,21 · Speicher 0,13 · Waschm. 0,11 — *der Rest ist der größte Posten und steht deshalb oben* |
| `2026-09-05T15:40:18+02:00` | 3 020 | Waschm. 2 149, Trockner 1 525, Kühl 173, Speicher 132, WP 25, Klima-Sp. 1 | Waschm. 2,15 · Trockner 1,53 · Kühl 0,17 · Speicher 0,13 — **kein Rest** (Σ gezeigte 3 979 > 3 020) |

Die Sollwerte erzeugt `reference-values.mjs` aus den Referenzdaten (5.1) — ein vom Kartencode unabhängiger Rechenweg.

### 2.4 Ring (R)

| ID | Anforderung | Prio |
|---|---|---|
| R-1 | Optional (`ring.enabled`, Standard: an, sobald `consumers` konfiguriert ist), um den Haus-Knoten. | MUSS |
| R-2 | Segmente = gezeigte Verbraucher + Rest — **exakt dieselbe Menge wie in der Liste**. Anteil = Wert / Σ aller Einträge. Reihenfolge = Listenreihenfolge, Beginn oben, im Uhrzeigersinn, Lücke 3 viewBox-Einheiten bei r = 56; bei genau einem Eintrag keine Lücke (Vollkreis). | MUSS |
| R-3 | Ist Σ gezeigte Verbraucher > Hauswert, gibt es keinen Rest (L-5) und die Segmente füllen zusammen 100 % — sie zeigen dann Anteile an der Verbrauchersumme. Dasselbe gilt bei nicht verfügbarem Hauswert. | MUSS |
| R-4 | Synchron mit der Liste: gleicher Takt, gleiche Farben; Segmentlängen und -positionen gleiten animiert (600 ms) über stabile Schlüssel, damit Segmente wandern statt zu springen. | MUSS |
| R-5 | Klick/Tipp auf ein Segment öffnet den More-Info-Dialog des Verbrauchers; das Rest-Segment ist nicht klickbar. Segmente sind Zeigerziele ohne eigenen Tab-Stopp und `aria-hidden`, solange die Liste sichtbar ist; ohne Liste (R-6) sind sie fokussierbar mit `aria-label`. Ein unsichtbarer Treffer-Ring ≥ 34 viewBox-Einheiten liegt über den Segmenten. | SOLL |
| R-6 | Ring ohne Liste und Liste ohne Ring sind beide möglich. | MUSS |

**Abnahme R:** Szenario `15:40:18` → vier Segmente, kein Rest-Segment, Summe der Segmentwinkel = 360° minus Lücken. Szenario `12:46:04` → fünf Segmente inkl. Rest ≈ 27 %. Ein neu hinzukommendes Segment wächst aus 0, ein verschwindendes schrumpft auf 0.

### 2.5 Farben (C)

| ID | Anforderung | Prio |
|---|---|---|
| C-1 | Jede Farbe konfigurierbar; jeder CSS-Farbwert erlaubt, ausdrücklich auch HA-Theme-Variablen. | MUSS |
| C-2 | Standardfarben als Theme-Variable mit Hex-Fallback, damit die Karte dem HA-Energie-Dashboard folgt: `solar var(--energy-solar-color, #ff9800)`, `house var(--primary-color)`, `grid_import var(--energy-grid-consumption-color, #488fc2)`, `grid_export var(--energy-grid-return-color, #8353d1)`, `battery_charge var(--energy-battery-in-color, #f06292)`, `battery_discharge var(--energy-battery-out-color, #4db6ac)`, `rest #7d7d7d`. Wer die Gut/Schlecht-Logik farblich will, setzt `grid_export`/`battery_charge` auf Grün und `grid_import`/`battery_discharge` auf Rot — als Beispiel im README (AL-5). | MUSS |
| C-3 | **Ladezustandsfarbe als Verlauf** über Stützstellen `{ at: %, color }`, Standard `0 → #e53935`, `50 → #fdd835`, `100 → #43a047`. Lineare Mischung zwischen den Stützstellen; zwei Stützstellen mit gleichem `at` ergeben eine harte Kante. Die Farbe trägt **Füllstand, Knotenrand und Icon** — **nicht die SOC-Zahl** (C-5). | MUSS |
| C-4 | Verbraucherfarben: deterministische Palette in Konfigurationsreihenfolge, je Verbraucher per `color` überschreibbar. Liste und Ring nutzen dieselbe Farbe. | MUSS |
| C-5 | **Zahlen stehen immer in `--primary-text-color`.** Zustandsfarben tragen Icons, Knotenränder, Linien, Punkte, Füllstand und Farbmarken. Grund: Die Standardfarben erreichen als Textfarbe den WCAG-Kontrast nicht (`#fdd835` auf Weiß = 1,4:1), als Grafik genügt 3:1. | MUSS |
| C-6 | Farbe ist nie der einzige Informationsträger: Zustandsbeschriftungen bleiben immer sichtbar. | MUSS |
| C-7 | Hell/Dunkel über HA-Theme-Variablen; alle Standardfarben in beiden Themes geprüft (N-6). | MUSS |

### 2.6 Interaktion (I)

| ID | Anforderung | Prio |
|---|---|---|
| I-1 | Klick/Tipp auf PV-, Netz- oder Haus-Knoten öffnet den **HA-More-Info-Dialog** — Ereignis `hass-more-info` mit `detail: { entityId }`, `bubbles: true`, `composed: true`. Bei zwei Netz-/Batterie-Entitäten öffnet sich die zur Nettorichtung passende (4.2). Kein eigenes Diagramm. | MUSS |
| I-2 | Batterie hat **zwei Trefferflächen**, getrennt an der Unterkante des Icons: obere Fläche (SOC-Zahl und Icon) → SOC-Entität, untere Fläche (kW-Zahl und Beschriftung) → Leistungs-Entität. Die Flächen sind Rechtecke, die über den Kreisrand hinausreichen. | MUSS |
| I-3 | **Trefferflächengrößen**, gemessen per `getBoundingClientRect()` in der Referenzumgebung (Sections, eine Spalte, Gerätebreite 360 px → Karte 344 px; zusätzlich 320 px → Karte 304 px): Knoten und Batterie-Flächen ≥ 44 × 44 px; Listenzeilen volle Breite, Höhe ≥ 44 px; Modus-Chips ≥ 36 px hoch; Abstand zwischen Zielen ≥ 8 px. Harte Untergrenze überall 24 × 24 px (WCAG 2.2 SC 2.5.8). **Ausnahme:** Ring-Segmente — die Liste bietet dasselbe Ziel. | MUSS |
| I-4 | Nicht klickbar: Rest-Eintrag, Rest-Segment, jeder abgeleitete Knoten (A-3). | MUSS |
| I-5 | Tastatur: klickbare Elemente fokussierbar (`role="button"`, `tabindex`, `aria-label`), Enter/Leertaste lösen aus, Fokus sichtbar. | SOLL |
| I-6 | `tap_action` / `hold_action` / `double_tap_action` im HA-Standardformat über das Ereignis `hass-action`. | KANN (0.2) |

### 2.7 Konfiguration & Editor (E)

| ID | Anforderung | Prio |
|---|---|---|
| E-1 | **Zwei Fehlerpfade.** (1) *Strukturfehler* (fehlendes `entities`, unzulässige Mischform, zwei abgeleitete Größen, Bereichsverletzung) → `setConfig` wirft; HA zeigt die Fehlerkarte. Meldung mit Feldname; Sprache über `hass?.language ?? document.documentElement.lang ?? "en"`, da `hass` zu diesem Zeitpunkt fehlen kann. (2) *Laufzeitprobleme* (Entität fehlt, `unavailable`) → niemals werfen, sondern in der Karte anzeigen (K-9). Unbekannte Schlüssel → Konsolenwarnung. | MUSS |
| E-2 | **Vorzeichen-Konvention — wie HA Energy-Dashboard, `power-flow-card`, `power-flow-card-plus`:** `grid` positiv = **Bezug**, negativ = Einspeisung. `battery` positiv = **Entladen**, negativ = Laden. Je Entität `invert: true` möglich (Objektform `{ entity, invert }`). Alternativ **zwei Entitäten** (`import`/`export` bzw. `discharge`/`charge`, jeweils ≥ 0). | MUSS |
| E-3 | GUI-Editor auf Basis von `ha-form`. Entity-Selektoren mit **ODER-Filter**, damit auch Template-Sensoren ohne `device_class` erscheinen: Leistung `[{domain: sensor, device_class: power}, {domain: sensor, unit_of_measurement: [W, kW]}]`, SOC `[{domain: sensor, device_class: battery}, {domain: sensor, unit_of_measurement: "%"}]`. **Je Bilanzgröße eine Quellenauswahl** (eine Entität · zwei Entitäten · abgeleitet · bei der Batterie zusätzlich „keine"), darunter nur die Felder der gewählten Quelle; bei der Ein-Entitäten-Form ein Schalter „Vorzeichen umdrehen". Jede YAML-Form aus E-2 und A-1 ist damit im Formular abbildbar und überlebt den Rundlauf Formular → YAML → Formular unverändert; eine gewählte Quelle bleibt stehen, solange ihre Felder noch leer sind. „Abgeleitet" wird bei den übrigen Größen ausgeblendet, sobald eine es ist. Dazu Schalter Liste/Ring, Limit, Takt, Schwellen (global, je Verbraucher, `flow.min_w`), Rest-Bezeichnung, Ansichtsmodus. **Farben** als Textfelder (ein Farbwähler kennt keine Theme-Variablen, `var(--energy-solar-color)` ist aber der Normalfall, C-1); **Icons** über den Icon-Selektor. `soc_stops` und `consumer_palette` bleiben YAML. | MUSS |
| E-4 | **Verbraucherliste im Editor** über den Objekt-Selektor (`object` mit `multiple: true`, `fields`, `label_field`, `description_field`) — Hinzufügen, Bearbeiten, Löschen, Sortieren. Verfügbar ab HA 2025.7 (N-3). | MUSS |
| E-5 | `getStubConfig(hass, entities, entitiesFallback)` liefert eine **ohne Nutzereingabe renderbare** Konfiguration (erste Sensoren mit `device_class: power` bzw. Einheit W/kW). Nötig, weil `preview: true` (AL-4) die Karte im Kartenauswahl-Dialog live rendert. Findet sich nichts, zeigt die Karte im Vorschaumodus einen Beispielzustand statt einer Fehlerkarte. | MUSS |
| E-6 | Editor-Beschriftungen und **Hilfetexte** auf Deutsch und Englisch (N-7). Jede Einstellung, deren Wirkung sich nicht aus ihrem Namen ergibt, trägt einen Hilfetext unter dem Feld — insbesondere die Auswahlfelder, deren Werte sonst zu erraten wären. Bei `flow.animation` weist der Text darauf hin, dass die Systemeinstellung im **Betriebssystem des Geräts** liegt, nicht in Home Assistant. | MUSS |

### 2.8 Takt & Aktualisierung (T)

| ID | Anforderung | Prio |
|---|---|---|
| T-1 | Knotenwerte aktualisieren sich im Modus *Aktuell* unmittelbar bei Zustandsänderung, gebündelt pro Frame. In den Ø-Modi zusätzlich **in jedem Takt**, da das Fenster auch ohne Zustandsänderung wandert. | MUSS |
| T-2 | Liste, Ring und Punkte-Parameter aktualisieren sich im **Takt** `update_interval_s` (Standard 5 s, Minimum 1 s). Zwischen zwei Takten bleiben sie stabil. | MUSS |
| T-3 | Neu gerendert wird, wenn sich eine konfigurierte Entität geändert hat **oder** der Takt fällig ist **oder** der Ansichtsmodus wechselt. | SOLL |

### 2.9 Nicht-funktional (N)

| ID | Anforderung | Prio |
|---|---|---|
| N-1 | Eine Datei, minifiziert ≤ 100 kB (Ziel ≤ 30 kB gzip). Bei 100 Verbrauchern und 6 aktiven Linien à 5 Punkte bleibt die Bildrate ≥ 30 fps auf einem Mittelklasse-Smartphone. | SOLL |
| N-2 | Keine externen Ressourcen zur Laufzeit. | MUSS |
| N-3 | **Home Assistant ≥ 2025.7** (wegen E-4). Browser: Desktop-Chrome/Edge/Firefox/Safari der letzten zwei Jahre, HA-Companion iOS ≥ 16.4 und Android mit System-WebView ab Chromium 106. Funktioniert in Sections- und Masonry-Ansichten. | MUSS |
| N-4 | Kein Speicherleck: Timer, Observer, Listener und Animationen werden in `disconnectedCallback` aufgeräumt; Wiedereinhängen funktioniert. | MUSS |
| N-5 | Robust: fehlende Entitäten, `unavailable`, `NaN`, negative Werte, leere Verbraucherliste, 100 Verbraucher, gleichzeitig positive Import- und Export-Entität — nie eine leere oder kaputte Karte, nie eine Exception. | MUSS |
| N-6 | Barrierefreiheit: `aria-label` an Knoten und Einträgen, `prefers-reduced-motion` (P-7), **messbarer Kontrast**: Text ≥ 4,5:1, Grafik ≥ 3:1 auf `#ffffff` und `#1c1c1c`. Zahlen erfüllen das über die Theme-Textfarbe (ENT-18). Zwei begründete Ausnahmen bei Grafik, gemessen am 07.09.2026: (1) **Die HA-Energiefarben selbst** reißen die Grenze auf hellem Grund — `--energy-solar-color` erreicht 2,16:1, `--energy-battery-out-color` 2,44:1. Sie zu ändern hieße, die Angleichung ans Energie-Dashboard aufzugeben (ENT-19); wer mehr Kontrast braucht, setzt eigene Farben (C-1). (2) **Die mittlere Stützstelle des Ladezustands-Verlaufs** ist gelb und auf Weiß nicht über 3:1 zu bekommen, ohne den vom Auftraggeber gewünschten Verlauf rot→gelb→grün aufzugeben. In beiden Fällen trägt die Farbe nie allein: Zustandswort und Zahl stehen daneben (C-6). | MUSS |
| N-11 | **Anwenderdokumentation zweisprachig.** `README.md` (Englisch, Einstieg) und `README.de.md` (Deutsch) werden gemeinsam gepflegt und verweisen aufeinander. Die Entwicklungsdokumente in `docs/` bleiben deutsch — sie ändern sich mit jedem Arbeitsschritt, und eine zweite Fassung wäre vor allem eine Quelle für Widersprüche. | MUSS |
| N-7 | **Mehrsprachig:** alle sichtbaren Texte von Karte und Editor in Übersetzungsdateien; Deutsch und Englisch vollständig, Auswahl nach `hass.language`, Rückfall auf Englisch. Weitere Sprachen durch eine zusätzliche Datei ohne Codeänderung. Konfigurierte Texte werden nicht übersetzt. | MUSS |
| N-10 | **Keine automatische Seitenübersetzung.** Die Karte trägt `translate="no"`. Browser-Übersetzer erkennen die Sprache pro Seite und verfälschen sonst Entitätsnamen und Beschriftungen — beobachtet: aus dem deutschen „Rest" wurde „Ausruhen", weil der Übersetzer es als englisches *rest* las. Zahlen und Einheiten sind ebenso betroffen. | MUSS |
| N-8 | Eindeutige SVG-IDs je Karteninstanz (Pfade, Verläufe, Clip-Pfade) — sonst greifen mehrere Karten auf demselben Dashboard auf fremde Referenzen zu (WebKit-Fehler vor Safari 17). | MUSS |
| N-9 | **Keine personenbezogenen Daten im Repository.** Weder Messdaten noch Entitäts-IDs, Seriennummern oder Screenshots mit erkennbaren Gerätenamen der Referenzanlage. Screenshots für das README werden mit neutralen Beispielnamen erzeugt. Die CI läuft ohne Referenzdaten grün. | MUSS |

### 2.10 Auslieferung (AL)

| ID | Anforderung | Prio |
|---|---|---|
| AL-1 | HACS-tauglich: öffentliches GitHub-Repository mit Description, Topics und aktivierten Issues; README im Root mit mindestens einem echten Bild (nicht nur Shields); `hacs.json` = `{ "name": "EnerLens", "filename": "enerlens-card.js", "homeassistant": "2025.7.0", "hide_default_branch": true }`. `render_readme` entfällt (seit HACS 2.0 wirkungslos). | MUSS |
| AL-2 | Auslieferung **als Release-Asset**: `dist/` bleibt aus dem Git heraus; die CI erzeugt bei Tag `v*` ein GitHub-Release mit genau einem Asset `enerlens-card.js`. HACS lädt alle Assets eines Releases — keine weiteren anhängen. | MUSS |
| AL-3 | CI: `build.yml` (Build, Lint, Tests bei jedem Push; Release bei Tag) und `validate.yml` (`hacs/action`, `category: plugin`) — letzteres per `workflow_dispatch` und beim Release, verpflichtend grün **ohne** `ignore` ab dem ersten Release. | MUSS |
| AL-4 | Registrierung in `window.customCards` mit `type: "enerlens-card"` (ohne `custom:`-Präfix), `name`, `description`, `preview: true`, `documentationURL`; idempotent. | MUSS |
| AL-5 | README (Englisch): Installation über HACS und manuell (`/hacsfiles/enerlens-card/enerlens-card.js`), vollständige Konfigurationsreferenz mit Standardwerten, **Vorzeichen-Konvention und Umstieg von power-flow-card-plus**, Beispiel für Grün/Rot-Färbung, Screenshots hell/dunkel, Hinweis auf schnelle Haus-Sensoren (ENT-8). | MUSS |
| AL-6 | Semantische Versionierung, `CHANGELOG.md`, Version **und Git-Revision** im Konsolen-Banner (`0.1.0 · ee96880`, mit `+` bei nicht eingecheckten Änderungen) — damit steht ohne Raten fest, welcher Stand im Browser läuft; Lizenz MIT. | MUSS |

### 2.11 Fehlende Messwerte ableiten (A)

Die Energiebilanz `pv + bezug − einspeisung + entladen − laden = haus` verknüpft vier Größen. Fehlt eine als Sensor, wird sie aus den drei anderen berechnet.

| ID | Anforderung | Prio |
|---|---|---|
| A-1 | **Genau eine** der vier Bilanzgrößen darf abgeleitet werden. Fehlt `house`, wird es stillschweigend abgeleitet (häufigster Fall). Für `solar`, `grid` oder `battery` verlangt die Ableitung das Schlüsselwort `derived`. Zwei fehlende Größen sind ein Strukturfehler (E-1). | MUSS |
| A-2 | Formeln (W), Vorzeichen nach E-2:<br>`house = pv + (bezug − einspeisung) + (entladen − laden)`<br>`pv = house − (bezug − einspeisung) − (entladen − laden)`, negativ → 0<br>`netz_netto = house − pv − (entladen − laden)` (positiv = Bezug)<br>`batterie_netto = house − pv − (bezug − einspeisung)` (positiv = Entladen) | MUSS |
| A-3 | Abgeleitete Knoten tragen „· berechnet" in der Beschriftung und sind nicht klickbar (I-4). Die drei Eingangswerte bleiben unverändert (G-1). | MUSS |
| A-4 | Ist einer der Eingangswerte nicht verfügbar, ist auch die abgeleitete Größe nicht verfügbar („—", K-9). | MUSS |
| A-5 | Batterie **nicht vorhanden** (Schlüssel fehlt, kein `derived`): Knoten entfällt (K-10), Batterieleistung = 0 in der Bilanz. Batterie vorhanden ohne SOC-Sensor: Knoten zeigt nur die Leistung, eine einzige Trefferfläche. | MUSS |
| A-6 | Verbraucher werden nie abgeleitet; ein Verbraucher ohne verfügbaren Wert wird ausgelassen (L-3). | MUSS |

### 2.12 Ansichtsmodus (V)

| ID | Anforderung | Prio |
|---|---|---|
| V-1 | Drei Modi: **Aktuell**, **Ø kurz** (Standard 5 min), **Ø lang** (Standard 15 min); beide Fenster konfigurierbar (`view.avg_short_minutes` < `view.avg_long_minutes`). | MUSS |
| V-2 | Umschalter als Chips rechts im Kartenkopf („Jetzt", „Ø 5 min", „Ø 15 min" — lokalisiert, Minutenzahl aus der Konfiguration). Bei Inhaltsbreite < 400 px rücken die Chips in eine eigene Zeile unter den Titel, der Titel wird gekürzt. Ausblendbar (`view.show_selector`), Startmodus konfigurierbar (`view.default_mode`). Semantik `role="radiogroup"` mit `aria-checked`. | MUSS |
| V-3 | Der aktive Modus ist **immer** erkennbar — auch bei ausgeblendetem Umschalter steht dann „Ø 15 min" im Kartenkopf. | MUSS |
| V-4 | Mittelwert = **zeitgewichtetes gleitendes Mittel** (4.8). Gemittelt werden PV, Netz-Netto, Batterie-Netto, Hauswert und jeder Verbraucher; eine abgeleitete Größe wird aus den gemittelten Eingängen berechnet. Alle nachgelagerten Regeln arbeiten unverändert auf den gemittelten Werten. | MUSS |
| V-5 | Der **Ladezustand wird nie gemittelt**. | MUSS |
| V-6 | **Vorbefüllung:** Beim Wechsel in einen Ø-Modus (bzw. beim Laden, wenn `default_mode` ≠ `current`) werden die letzten `avg_long_minutes` Minuten aller beteiligten Entitäten in **einer** Abfrage aus dem Recorder geholt (`history/history_during_period`, `minimal_response`, `no_attributes`, Zeitlimit 5 s), danach läuft der Puffer live weiter. Schlägt das fehl, wird über die verfügbare Zeitspanne gemittelt und mit „Ø 15 min · seit hh:mm" gekennzeichnet — hh:mm ist der Zeitpunkt, ab dem **alle** beteiligten Entitäten Werte haben (die jüngste erste Probe), nicht die älteste gehaltene Probe eines seit Stunden unveränderten Sensors. **Keine Vorbefüllung im Editor-Vorschaumodus** (`preview === true`). | MUSS (Kennzeichnung SOLL) |
| V-7 | Nicht verfügbare Abschnitte werden nicht gewichtet. Ist im ganzen Fenster nichts verfügbar → „—". War die Verbindung unterbrochen und ist eine Lücke > `update_interval_s` entstanden, wird die Vorbefüllung wiederholt; bis dahin gilt die Lücke als nicht verfügbar und wird **nicht** per Step-Hold gefüllt. | MUSS |
| V-8 | Ein Moduswechsel wirkt sofort (< 100 ms sichtbar): Knotenwerte springen, Liste und Ring gleiten, Punkte übernehmen die neuen Flüsse — ohne auf den nächsten Takt zu warten. | MUSS |
| V-9 | **More-Info bleibt unverändert:** Ein Klick öffnet in jedem Modus den HA-Dialog der rohen Entität mit ihrer echten Historie. | MUSS |
| V-10 | Der Puffer je Entität ist auf das lange Fenster begrenzt; mit 100 Verbrauchern und 15 min unter 1 MB. | MUSS |
| V-11 | Die zuletzt gewählte Ansicht wird je Browser gemerkt (`localStorage`); `view.remember: false` schaltet das ab. | KANN |

**Abnahme V** — Fixture wie Abnahme L, Hauswert `sensor.house_power`, `min_consumer_w: 10`, ohne Limit, Toleranz ±1 W:

| Zeitpunkt (ISO) | Modus | Haus | Σ Verbraucher | Rest |
|---|---|---|---|---|
| `2026-09-05T15:40:18+02:00` | Aktuell | 3 020 W | 4 005 W | **kein Rest**, Ring 100 % |
| `2026-09-05T15:40:18+02:00` | Ø 5 min | 1 525 W | 1 189 W | 338 W |
| `2026-09-05T15:40:18+02:00` | Ø 15 min | 1 618 W | 1 247 W | 372 W |
| `2026-09-05T15:10:42+02:00` | Aktuell | 2 820 W | 5 263 W | **kein Rest**, Ring 100 % |
| `2026-09-05T15:10:42+02:00` | Ø 5 min | 3 539 W | 3 192 W | 349 W |
| `2026-09-05T15:10:42+02:00` | Ø 15 min | 2 947 W | 2 558 W | 390 W |

„Σ Verbraucher" ist hier die Summe **aller** konfigurierten Verbraucher mit verfügbarem Wert (vor Filter und Limit). Beide Ø-Modi lassen den Rest positiv — der Ausreißer verschwindet, ohne dass ein Messwert verändert würde.

---

## 3. Konfigurationsschema (verbindlich)

```yaml
type: custom:enerlens-card
title: Energie                              # string, optional

entities:                                   # PFLICHT
  solar: sensor.pv_power                   # Entity | {entity, invert} | derived
  grid: sensor.netz_leistung                # signiert: + Bezug, − Einspeisung
  # grid: { entity: sensor.netz, invert: true }
  # grid: { import: sensor.bezug, export: sensor.einspeisung }
  battery: sensor.batterie_leistung         # optional · signiert: + Entladen, − Laden
  # battery: { discharge: sensor.entladen, charge: sensor.laden }
  battery_soc: sensor.batterie_soc          # optional · % · nur zusammen mit battery
  house: sensor.haus_verbrauch              # optional · ohne Angabe abgeleitet (A-1)

consumers:                                  # optional · Liste
  - entity: sensor.waermepumpe_leistung     # PFLICHT je Eintrag · eindeutig
    name: Wärmepumpe                        # optional · Standard friendly_name
    color: "#7e57c2"                        # optional · Standard aus Palette

min_consumer_w: 10                          # number ≥ 0 · Filter für Verbraucher und Rest
max_consumers: 5                            # int ≥ 1 · Standard: kein Limit · gilt für Liste UND Ring
update_interval_s: 5                        # number ≥ 1 · Takt für Liste/Ring/Punkte

list:
  enabled: true                             # bool · Standard true wenn consumers gesetzt
  rest_label: Rest                          # string · Standard lokalisiert (de "Rest", en "Other")
  title: Verbraucher                        # string · Standard: kein Titel

ring:
  enabled: true                             # bool · Standard true wenn consumers gesetzt

view:
  default_mode: current                     # current | avg_short | avg_long
  avg_short_minutes: 5                      # int 1…120 · < avg_long_minutes
  avg_long_minutes: 15                      # int 2…240
  show_selector: true                       # bool
  remember: true                            # bool (V-11)

flow:
  min_w: 10                                 # number ≥ 0 · darunter keine Punkte, Linie inaktiv
  slow_below_w: 500                         # S1
  more_dots_above_w: 2000                   # S2
  max_dots_at_w: 6000                       # S3
  max_dots: 5                               # int 2…10
  slow_s: 5                                 # Umlaufzeit bei Grundgeschwindigkeit
  fast_s: 1.8                               # Umlaufzeit bei Höchstgeschwindigkeit · < slow_s
  animation: auto                           # auto | on | off (P-7)
  inactive_lines: show                      # show | dim | hide (P-9)

colors:
  solar: var(--energy-solar-color, "#ff9800")
  house: var(--primary-color)
  grid_import: var(--energy-grid-consumption-color, "#488fc2")
  grid_export: var(--energy-grid-return-color, "#8353d1")
  battery_charge: var(--energy-battery-in-color, "#f06292")
  battery_discharge: var(--energy-battery-out-color, "#4db6ac")
  rest: "#7d7d7d"
  soc_stops:                                # ≥ 2 Einträge, aufsteigend, erster at 0, letzter at 100
    - { at: 0,   color: "#e53935" }
    - { at: 50,  color: "#fdd835" }
    - { at: 100, color: "#43a047" }
  consumer_palette: ["#7e57c2", "#26a69a"]  # optional · ersetzt die eingebaute Palette

icons:
  solar: mdi:white-balance-sunny
  grid: mdi:transmission-tower
  house: mdi:home
  battery: mdi:battery                      # Standard: nach SOC (siehe unten)
```

**Regeln zum Schema** (Verstöße sind Strukturfehler nach E-1):

- `entities.solar` / `grid` / `battery` ist **entweder** ein Entity-String **oder** `{ entity, invert }` **oder** die Zwei-Entitäten-Form **oder** `derived`. Mischungen sind unzulässig.
- Höchstens **eine** Bilanzgröße darf abgeleitet sein; fehlendes `house` zählt als abgeleitet.
- `battery_soc` nur zusammen mit `battery`. `consumers[].entity` muss eindeutig sein.
- Bereiche: `flow.min_w ≤ slow_below_w < more_dots_above_w < max_dots_at_w`; `fast_s < slow_s`; `max_dots` 2…10; `update_interval_s ≥ 1`; `max_consumers ≥ 1`; `view.avg_short_minutes < view.avg_long_minutes`.
- `colors.soc_stops`: mindestens zwei Einträge, aufsteigend nach `at`, erster `at: 0`, letzter `at: 100`.
- Zahlen außerhalb ihres Bereichs → Strukturfehler mit Feldname und erlaubtem Bereich.
- `icons.battery` ohne Angabe: nach Ladezustand, auf 10 gerundet — `mdi:battery-outline` bei ≤ 0, `mdi:battery-10` … `mdi:battery-90`, `mdi:battery` bei 100; ohne SOC-Sensor `mdi:battery`.

---

## 4. Berechnungsregeln

Alle Rechnungen in **W**; Anzeige in kW nach K-7.

**4.1 Normalisierung.** `wert_W = zahl(state) × faktor(unit)` mit case-sensitiver SI-Präfix-Tabelle (`mW` 1e-3, `W` 1, `kW` 1e3, `MW` 1e6, `GW` 1e9, `TW` 1e12). Fehlt die Einheit bei `device_class: power` → Faktor 1 (Warnung). Fehlt beides → *nicht verfügbar* mit Hinweis. Nicht numerisch → *nicht verfügbar*.

**4.2 Netz und Batterie.** Signierte Einzel-Entität (nach `invert`): `bezug = max(0, v)`, `einspeisung = max(0, −v)`; Batterie `entladen = max(0, v)`, `laden = max(0, −v)` (E-2).
Zwei Entitäten: beide Werte einzeln normalisiert, negative auf 0. Für Anzeige, Zustand und More-Info-Ziel gilt `netto = bezug − einspeisung` bzw. `entladen − laden`: netto ≥ `flow.min_w` → Bezug/entlädt, netto ≤ −`flow.min_w` → Einspeisung/lädt, dazwischen → neutral (K-3). Der Knoten zeigt `|netto|`. Damit ist auch der Fall abgedeckt, dass beide Entitäten gleichzeitig > 0 melden (asynchrone Sensoren) — ohne Plausibilisierung der Einzelwerte.

**4.3 Abgeleitete Größe.** Genau eine (A-1); Formeln in A-2. `house` und `pv` werden bei negativem Ergebnis auf 0 begrenzt (ENT-4); `netz_netto` und `batterie_netto` behalten ihr Vorzeichen und werden nach 4.2 zerlegt — die Vorzeichen in A-2 sind bereits die von E-2.

**4.4 Verbraucher.**
1. Konfigurierte Verbraucher mit verfügbarem Wert ≥ Schwelle → *Kandidaten*; Schwelle = eigenes `min_w`, sonst `min_consumer_w`.
2. Absteigend sortieren; die ersten `max_consumers` → *gezeigte Verbraucher*.
3. `rest = haus − Σ gezeigte`. Rest-Eintrag nur, wenn der Hauswert verfügbar **und** `rest ≥ min_consumer_w` ist.
4. Alle Einträge absteigend sortieren → **Liste**.
5. Ring: `anteil_i = wert_i / Σ aller Einträge` — ohne Rest ergibt das automatisch die 100-%-Skalierung (R-3).

**4.5 Flussverteilung** (Prioritätsfolge wie HA; jeder Schritt `min(Rest der Quelle, Rest der Senke)`, Startwerte `pv`, `bezug`, `einspeisung`, `laden`, `entladen`, `haus`; nicht verfügbare Größen gehen mit 0 ein):

1. `pv_bat = min(pv_rest, laden_rest)`
2. `pv_netz = min(pv_rest, einspeisung_rest)`
3. `bat_netz = min(entladen_rest, einspeisung_rest)`
4. `netz_bat = min(bezug_rest, laden_rest)`
5. `pv_haus = min(pv_rest, haus_rest)`
6. `bat_haus = min(entladen_rest, haus_rest)`
7. `netz_haus = min(bezug_rest, haus_rest)`

Jeder Schritt zieht das Ergebnis von beiden Resten ab. Dadurch ist auf jeder Verbindung höchstens eine Richtung aktiv, und es entstehen keine Flüsse aus leeren Quellen.

**4.6 Punkte.** Für Fluss `P`:
- `P < flow.min_w` → 0 Punkte.
- `P < S1` → 1 Punkt, `dur = slow_s`.
- `P < S2` → 1 Punkt, `dur = slow_s − (P − S1)/(S2 − S1) × (slow_s − fast_s)`.
- sonst → `dur = fast_s`, `n = min(max_dots, 2 + floor((P − S2)/(S3 − S2) × (max_dots − 2)))`.
- Punkte gleichmäßig über den Umlauf verteilt (Startversatz `i × dur / n`).

Beispiel: 4 000 W → `2 + floor(0,5 × 3) = 3` Punkte.

**4.7 Ladezustandsfarbe.** Stützstellen aufsteigend nach `at`. Für SOC `s`: Nachbarstützstellen `a ≤ s ≤ b`, `t = (s − a.at)/(b.at − a.at)` (bei gleichem `at`: `t = 0`), lineare RGB-Mischung. Theme-Variablen über `getComputedStyle` aufgelöst.

**4.8 Zeitgewichtetes gleitendes Mittel** über Fenster `W` bis `jetzt`: Jeder Zustand gilt von seinem `last_changed` bis zum nächsten Wechsel (Step-Hold), der aktuelle bis `jetzt`; Anteile außerhalb des Fensters werden abgeschnitten. `mittel = Σ (wert_i × dauer_i) / Σ dauer_i` über alle Abschnitte mit verfügbarem Wert. Netz und Batterie werden **netto signiert** gemittelt und erst danach nach 4.2 zerlegt.

---

## 5. Referenzdaten und Abnahme

### 5.1 Referenzdaten — bewusst außerhalb des Repositories

Die Abnahmen L und V beruhen auf echten Messdaten der Referenzanlage. Diese Daten **kommen nicht ins Repository** (ENT-21): Die Entitätsnamen enthalten Geräte-Seriennummern, und aus 24 Stunden Verbrauchskurve lässt sich der Tagesablauf des Haushalts ablesen. Ein öffentliches Repository macht so etwas dauerhaft und unwiderruflich einsehbar.

| | |
|---|---|
| Ablage | `/share/dev/enerlens-fixture/` — persistent, außerhalb von Git und des Config-Backups |
| Inhalt | `history-YYYY-MM-DD.json` für den 29. 8. bis 6. 9. 2026 (neun Tage, 22 MB), Referenztag ist der **5. 9. 2026** |
| Werkzeuge | `export-history.mjs` (Export aus dem Recorder), `reference-values.mjs` (Sollwerte, unabhängiger Rechenweg) |
| Rollen statt Namen | Die Exportdatei bildet Entitäten auf Rollen ab (`solar`, `grid`, `house_5s`, `heatpump`, `washer` …), sodass Auswertungen ohne die echten IDs auskommen |

**Folge für die Tests:** Die Abnahmen L und V laufen nur lokal, wo die Daten liegen; fehlen sie, überspringt die Testsuite diese Fälle mit deutlicher Meldung. Alle übrigen Tests — Formeln, Rundung, Vorzeichen, Filter, Limit, Flussverteilung, Punkteregel — arbeiten mit kleinen, handgeschriebenen Fällen im Repository und laufen überall, auch in der CI (N-9).

### 5.2 Checkliste 0.1.0

- [ ] Alle MUSS-Anforderungen erfüllt; SOLL-Abweichungen im CHANGELOG benannt.
- [ ] Unit-Tests grün: Formeln und Regeln in der CI, Abnahmen L, R und V lokal gegen die Referenzdaten (5.1).
- [x] Vorzeichen: `battery: derived` im Nacht-Szenario (PV 0, Netz +420 W, Haus 1 520 W) → „entlädt", 1 100 W, Fluss Batterie→Haus. Gegenprobe Tag-Szenario → „lädt". *(`test/acceptance.test.ts`)*
- [x] Alle Entitäten nacheinander auf `unavailable` — keine Exception, kein Layoutbruch, Rest verschwindet bei fehlendem Hauswert. *(M10, `test/stress.test.ts` und auf dem Dashboard)*
- [x] 100 Verbraucher, `max_consumers: 5` — flüssig, DOM enthält 6 Einträge. *(M10)*
- [x] Trefferflächen bei Gerätebreite 360 px und 320 px gemessen (I-3), headless Chromium via `scripts/measure.mjs`, Karte 344 / 304 px: Knoten 94 / 83 px (Haus mit Ring 77 / 70 px), Batterie-Hälften 90 × 67 / 79 × 61 px getrennt, Modus-Chips 36 px hoch mit 8 px Abstand, Filter-Knopf 28 px, Abstand Batterie → erste Zeile 23 px. **Abweichung:** Listenzeilen haben 44 px Trefferfläche bei 34 px Zeilenabstand — die Flächen überlappen sich um 10 px, wirksam bleiben 34 px je Zeile (über der harten Untergrenze 24 px, unter den gewünschten 44 px). Entscheidung offen: Zeilenabstand 44 px oder L-9 auf 34 px wirksam anpassen.
- [x] Schriftgrößen nach K-12 bei 344 und 304 px Kartenbreite gemessen: Beschriftungen, Knotenwerte, SOC, Listenzeilen und Chips je 12 px; Punkte Ø 12,0 px; Linien 4,1 / 4,7 px. *(`scripts/measure.mjs`)*
- [x] Kontraste nach N-6 in beiden Themes gemessen. *(M10; Ausnahmen in N-6 dokumentiert)*
- [ ] Ansichtsmodi: Abnahme V reproduziert; Umschalten < 100 ms; Kennzeichnung sichtbar; More-Info zeigt rohe Historie.
- [x] Sprache auf Englisch umgestellt → alle Beschriftungen englisch, `rest_label` „Other", Zahlen mit Punkt. *(`LANG_CARD=en scripts/measure.mjs`)*
- [ ] HACS: als Custom Repository installiert, Update funktioniert; `hacs/action` grün ohne `ignore`.
- [x] Bundle-Größe protokolliert. *(28 kB gzip, `npm run check`)*

---

## 6. Entscheidungen und offene Punkte

| ID | Entscheidung | Begründung |
|---|---|---|
| ENT-1 | Kreuz-Layout wie das Original; Verbraucher als Aufschlüsselung des Hauses. | Vertrautheit; das Kreuz bleibt bei beliebig vielen Verbrauchern stabil. |
| ENT-2 | Ring skaliert bei Σ > Haus auf 100 %; Rest verschwindet nach der 10-W-Regel. | Messdaten: Überschreitungen von 400–3 000 W in 0,7–1,9 % der Zeit; ein Watt-Toleranzband wäre sinnlos. |
| ENT-3 | More-Info-Dialog von HA statt eigenem Diagramm. | Bundle klein, HA kann es besser. |
| ENT-4 | Abgeleiteter Hauswert oder abgeleitete PV negativ → `0,00 kW`. | Betrifft nur berechnete Werte. Negativer Verbrauch wäre irreführend. |
| ENT-5 | Batterie: `%` über dem Icon, `kW` darunter; Trefferflächen als Rechtecke über und unter der Icon-Unterkante. | Fingerbedienung; die sichtbare Kreisform ist für 44 px zu klein (I-3). |
| ENT-6 | Schwellen für Punkte global, in Watt; Anzahl per `floor`. | Einheitliches Verhalten aller Linien; `floor` macht die Stufen vorhersagbar. |
| ENT-7 | **Werte überall sofort, nur die Reihenfolge im Takt.** | *Geändert am 07.09.2026 nach dem ersten Blick auf die laufende Liste.* Eine live springende Zahl stört nicht, eine springende Zeile schon. Ursprünglich waren beide an den Takt gebunden — das ließ die Werte unnötig alt aussehen. |
| ENT-8 | Empfehlung: schnellen gemessenen Haus-Sensor konfigurieren. | Abgeleiteter Wert aus 60-s-Sensoren lag bis 8,7 kW daneben; 5-s-Sensor folgt Sprüngen in 4 s. |
| ENT-9 | Dot-Parameter im Takt statt live. | Verhindert dauerndes Neuparametrieren laufender Animationen. |
| ENT-10 | Genau eine Bilanzgröße darf abgeleitet werden. | Zwei Unbekannte sind aus einer Gleichung nicht bestimmbar — lieber ein klarer Fehler als Raten. |
| ENT-11 | Deutsch und Englisch Pflicht, weitere Sprachen per Übersetzungsdatei. | Die Karte soll außerhalb dieser Anlage nutzbar sein; Code und Repo bleiben englisch. |
| ENT-12 | Drei Ansichtsmodi, Umschalter im Kartenkopf, aktiver Modus immer sichtbar. | Das Live-Bild ist sehr dynamisch; die Kennzeichnung hält G-1 ein. |
| ENT-13 | Ladezustand wird nie gemittelt. | Ein Füllstand ist keine Leistung. |
| ENT-14 | Mittelwerte in der Karte berechnet, beim Wechsel aus dem Recorder vorbefüllt. | Funktioniert bei fremden Anlagen ohne Statistik-Sensoren. Kurzzeitstatistiken wären an Uhrzeit-Buckets gebunden und bis 5 min verzögert. |
| ENT-15 | Klick öffnet immer die rohe Entität. | Der HA-Dialog zeigt die echte Historie. |
| **ENT-16** | **Batterie-Vorzeichen: positiv = Entladen, negativ = Laden — die Konvention von HA Core, Energy-Dashboard, `power-flow-card` und `power-flow-card-plus`.** | *Geändert in Fassung 2.* Umsteiger und Nutzer der Energy-Dashboard-Sensoren bekämen sonst vertauschte Richtungen. Die eigene EcoFlow-Anlage nutzt `invert: true`. |
| **ENT-17** | **Mindestversion HA 2025.7 statt 2024.11.** | *Geändert in Fassung 2.* Erst ab 2025.7 kann `ha-form` Objekt-Listen editieren (E-4) — damit wird der Verbraucher-Editor Pflicht statt Wunsch. |
| **ENT-18** | **Zahlen immer in `--primary-text-color`, Zustandsfarben nur für Grafik.** | *Neu in Fassung 2.* Die Standardfarben erreichen als Textfarbe den WCAG-Kontrast nicht (`#fdd835` 1,4:1). |
| **ENT-19** | **Standardfarben aus den HA-Energie-Theme-Variablen statt eigener Grün/Rot-Palette.** | *Geändert in Fassung 2.* Die Karte sieht ohne Konfiguration aus wie das Energie-Dashboard; die Gut/Schlecht-Färbung steht als Beispiel im README. |
| **ENT-20** | **Knoteninhalte als HTML über dem SVG, nicht im SVG.** | *Neu in Fassung 2.* `ha-icon` ist ein HTML-Element und lässt sich nicht in SVG einsetzen; außerdem skaliert SVG-Text mit der viewBox und unterschreitet auf dem Handy die Lesbarkeit (K-12). |
| **ENT-21** | **Referenz-Messdaten bleiben außerhalb des Repositories (5.1).** | *Neu in Fassung 2.* Entitäts-IDs enthalten Geräte-Seriennummern, die Verbrauchskurve verrät den Tagesablauf. Ein öffentliches Repository wäre unwiderruflich. Abnahmen L und V laufen deshalb lokal, alles andere in der CI. |

### Offen

| ID | Frage | Vorschlag |
|---|---|---|
| ~~O-1~~ | ~~Listentitel im Standard?~~ | **Entschieden am 07.09.2026: kein Titel.** Am laufenden Bild geprüft — die Überschrift sitzt über einer vertikal zentrierten Liste und bezieht sich auf nichts; sie liest sich wie eine Tabellenkopfzeile ohne Tabelle. `list.title` bleibt als Option. |
| O-2 | Kompaktes Layout für halbe Sektionsbreite (6 Spalten)? | Für 0.1 nicht; die Karte belegt volle Breite (`min_columns: 12`). Backlog. |

---

## 7. Nicht-Ziele für 0.1 (Backlog)

- Wärmepumpe als getrennte Knoten Heizen/Warmwasser.
- Prognose-Ring um den PV-Knoten, Batterie-Reichweite.
- Zeitraum-Umschaltung (heute / Monat) mit kWh-Bilanzen.
- Automations-Status-Badge.
- Autarkie- und Eigenverbrauchsquote (K-14).
- `tap_action`/`hold_action` (I-6), weitere Sprachen.
- Kompaktes Layout für schmale Karten (O-2).
- Entitäten automatisch aus den Energie-Einstellungen übernehmen (`energy/get_prefs`) — Null-Konfiguration.
