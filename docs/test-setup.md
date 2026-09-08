# Testumgebung für die EnerLens-Karte

Diese Anleitung beschreibt, wie die Karte unter reproduzierbaren Bedingungen in
Home Assistant geprüft wird: Szenarien abspielen, Stress-Entitäten anlegen,
Mittelwerte gegen Referenzdaten prüfen.

## 1. Warum abspielen statt Historie schreiben

Home Assistant kann Zustände **nicht rückdatieren**: `POST /api/states` schreibt
immer „jetzt". Es gibt keinen Weg, dem Recorder nachträglich einen Verlauf
unterzuschieben.

Deshalb werden die Referenzdaten auf eigene Test-Entitäten
*abgespielt*. Der 5. 9. 2026 um 15:25 Uhr wird also nicht wiederhergestellt,
sondern **jetzt noch einmal aufgeführt** — mit denselben Werten in derselben
Reihenfolge. Für die Karte ist das nicht unterscheidbar: sie sieht laufende
Zustandsänderungen, füllt ihre Mittelwertpuffer und zeichnet.

Zwei Werkzeuge:

| Skript | Zweck |
|---|---|
| `scripts/replay.mjs` | Spielt einen Zeitausschnitt der Referenzdaten auf `sensor.enerlens_test_*` |
| `scripts/make-stress-entities.mjs` | Legt 100 Verbraucher `sensor.enerlens_stress_*` für den Lasttest an |

Beide sind reines Node 24 ohne Abhängigkeiten und schreiben **ausschließlich**
Entitäten mit ihrem jeweiligen Präfix. Jeder einzelne Schreibvorgang läuft durch
eine Prüffunktion; ein Ziel außerhalb des Präfixes bricht den Lauf ab, statt zu
schreiben. Eine echte Anlagen-Entität kann nicht getroffen werden.

## 2. Voraussetzungen

- Ausführung im Container der App „Advanced SSH & Web Terminal" — dort ist
  `$SUPERVISOR_TOKEN` gesetzt und `http://supervisor/core/api` erreichbar.
  (`homeassistant.local:8123` ist aus dem Container **nicht** erreichbar.)
- Referenzdaten unter `/share/dev/enerlens-fixture/` — außerhalb des
  Repositories. Anderer Pfad: `--fixtures <pfad>` oder
  Umgebungsvariable `ENERLENS_FIXTURES`.
- Referenztag ist der **5. 9. 2026** (`history-2026-09-05.json`), gesichert sind
  der 29. 8. bis 6. 9. 2026.

Ohne Token laufen beide Skripte nur mit `--dry-run`; das ist Absicht.

## 3. Die Test-Entitäten

### 3.1 Szenario-Entitäten — `sensor.enerlens_test_<rolle>`

`replay.mjs` legt sie beim ersten Schreiben selbst an. Die Rolle ist der
Schlüssel aus der Referenzdatei, die Namensgebung ist damit fest und ableitbar.

| Rolle | Entität | Einheit | Bedeutung |
|---|---|---|---|
| `solar` | `sensor.enerlens_test_solar` | W | PV-Erzeugung gesamt |
| `grid` | `sensor.enerlens_test_grid` | W | Netz, signiert: **+ Bezug, − Einspeisung** |
| `house_5s` | `sensor.enerlens_test_house_5s` | W | Hausverbrauch, schneller Sensor — **der empfohlene** |
| `house_10s` | `sensor.enerlens_test_house_10s` | W | Hausverbrauch, 10-s-Sensor |
| `house_60s` | `sensor.enerlens_test_house_60s` | W | Hausverbrauch, 60-s-Sensor |
| `battery_to_house` | `sensor.enerlens_test_battery_to_house` | W | Batterie entlädt (≥ 0) |
| `solar_to_battery` | `sensor.enerlens_test_solar_to_battery` | W | Batterie lädt (≥ 0) |
| `soc` | `sensor.enerlens_test_soc` | % | Ladezustand (`device_class: battery`) |
| `soc_cloud` | `sensor.enerlens_test_soc_cloud` | % | Ladezustand aus der Cloud, Gegenprobe |
| `heatpump` | `sensor.enerlens_test_heatpump` | W | Wärmepumpe |
| `ac` | `sensor.enerlens_test_ac` | W | Klima |
| `ac_storage` | `sensor.enerlens_test_ac_storage` | W | Klima Speicher |
| `storage` | `sensor.enerlens_test_storage` | W | Speicher |
| `fridges` | `sensor.enerlens_test_fridges` | W | Kühlschränke |
| `dryer` | `sensor.enerlens_test_dryer` | W | Trockner |
| `washer` | `sensor.enerlens_test_washer` | W | Waschmaschine |
| `dishwasher` | `sensor.enerlens_test_dishwasher` | W | Spülmaschine |

Alle Leistungswerte tragen `unit_of_measurement: W`, `device_class: power`,
`state_class: measurement`; die beiden Ladezustände `%` und
`device_class: battery`. Der `friendly_name` lautet z. B. „EnerLens Test
Trockner".

Die aktuelle Liste zeigt:

```bash
node scripts/replay.mjs --list-roles
```

### 3.2 Stress-Entitäten — `sensor.enerlens_stress_*`

| Entität | Bedeutung |
|---|---|
| `sensor.enerlens_stress_001` … `_100` | 100 Verbraucher, gemischte Größenordnungen |
| `sensor.enerlens_stress_house` | Hauswert = Summe aller Verbraucher + 250 W (der „Rest") |

Die Werte sind bei gleichem `--seed` reproduzierbar. Mit Seed 42 liegen 14 der
100 Verbraucher unter 10 W (fallen also durch `min_consumer_w`), 8 im
Kilowatt-Bereich, der Rest dazwischen.

## 4. `replay.mjs`

```
node scripts/replay.mjs --from <ZEIT> [--to <ZEIT>] [Optionen]
node scripts/replay.mjs --once <ZEIT> [Optionen]
```

| Option | Bedeutung |
|---|---|
| `--from <ZEIT>` | Beginn des Ausschnitts |
| `--to <ZEIT>` | Ende (Standard: `--from` + 15 min) |
| `--once <ZEIT>` | **Nur einen einzelnen Zeitpunkt setzen**, kein Abspielen |
| `--day <YYYY-MM-DD>` | Referenztag (Standard `2026-09-05`) |
| `--speed <faktor>` | 1 = Echtzeit, 4 = vierfach beschleunigt (Standard 1) |
| `--tick <ms>` | Raster eines Schreibblocks in Szenariozeit (Standard 1000) |
| `--roles a,b,c` | Nur diese Rollen abspielen |
| `--fixtures <pfad>` | Verzeichnis der Referenzdaten |
| `--dry-run` | Nichts schreiben, nur zeigen, was passieren würde |
| `--list-roles` | Rollen der Datei auflisten |
| `--help` | Hilfe |

Zeiten ohne Datum gelten als Ortszeit des Referenztags (`Europe/Berlin`).
Eindeutig geht es mit voller ISO-Zeit: `--once 2026-09-05T15:40:18+02:00`.

Während des Laufs steht in der Konsole je Schritt die Szenariozeit, wie viele
Werte gesetzt wurden und die ersten davon. **Strg+C** beendet sauber und gibt
eine Zusammenfassung aus; die Entitäten behalten dann ihren letzten Wert.

### 4.1 Abnahme L — Verbraucherliste

Drei Zeitpunkte, Modus *Aktuell*, `min_consumer_w: 10`, `max_consumers: 4`.
Jeder ist ein einzelner Schnappschuss, `--once` genügt:

```bash
node scripts/replay.mjs --once 12:46:04     # Trockner · Rest 0,43 · Kühl · Speicher · Waschm.
node scripts/replay.mjs --once 12:51:00     # Rest 0,52 steht oben (größter Posten)
node scripts/replay.mjs --once 15:40:18     # kein Rest (Σ 3 979 W > Haus 3 020 W)
```

Erwartet werden dabei (aus `expected.json`):

| Zeitpunkt | Haus | Erwartete Liste |
|---|---|---|
| 12:46:04 | 2 340 W | Trockner 1,48 · **Rest 0,43** · Kühl 0,23 · Speicher 0,13 · Waschm. 0,07 |
| 12:51:00 | 1 200 W | **Rest 0,52** · Kühl 0,23 · Trockner 0,21 · Speicher 0,13 · Waschm. 0,11 |
| 15:40:18 | 3 020 W | Waschm. 2,15 · Trockner 1,53 · Kühl 0,17 · Speicher 0,13 — **kein Rest** |

Für die animierten Übergänge dieselben Zeitpunkte am Stück abspielen:

```bash
node scripts/replay.mjs --from 12:44 --to 12:53 --speed 2
node scripts/replay.mjs --from 15:25 --to 15:41 --speed 4
```

Das zweite Fenster ist das Abnahmefenster aus M2a: Zeilen gleiten, Klima fällt
durchs Limit, der Rest verschwindet und kommt zurück.

### 4.2 Abnahme V — Ansichtsmodi

**Wichtig:** Die Ø-Modi mitteln über *echte* Wanduhr-Minuten. Ein Ø-15-min-Wert
stimmt nur, wenn der Replay in **Echtzeit** (`--speed 1`) läuft und beim
Prüfzeitpunkt bereits 15 Minuten abgespielt hat. Also 15 Minuten vor dem
Prüfzeitpunkt starten und den Lauf genau dort enden lassen:

```bash
# Prüfzeitpunkt 15:40:18 — Laufzeit 15 min
node scripts/replay.mjs --from 15:25:18 --to 15:40:18 --speed 1 --tick 200

# Prüfzeitpunkt 15:10:42 — Laufzeit 15 min
node scripts/replay.mjs --from 14:55:42 --to 15:10:42 --speed 1 --tick 200
```

`--tick 200` verfeinert das Raster, damit die zeitgewichtete Mittelung (4.8)
innerhalb der Toleranz von ±1 W bleibt.

Direkt am Ende des Laufs, ohne die Karte anzufassen, die drei Chips durchklicken:

| Zeitpunkt | Modus | Haus | Σ Verbraucher | Rest |
|---|---|---|---|---|
| 15:40:18 | Aktuell | 3 020 W | 4 005 W | **kein Rest**, Ring 100 % |
| 15:40:18 | Ø 5 min | 1 525 W | 1 189 W | 338 W |
| 15:40:18 | Ø 15 min | 1 618 W | 1 247 W | 372 W |
| 15:10:42 | Aktuell | 2 820 W | 5 263 W | **kein Rest**, Ring 100 % |
| 15:10:42 | Ø 5 min | 3 539 W | 3 192 W | 349 W |
| 15:10:42 | Ø 15 min | 2 947 W | 2 558 W | 390 W |

„Σ Verbraucher" ist die Summe **aller** konfigurierten Verbraucher mit
verfügbarem Wert, vor Filter und Limit. Für diese Abnahme läuft die Karte
**ohne** `max_consumers` (siehe 6.2).

Der Umschalter selbst lässt sich auch mitten im Lauf
prüfen — die Vorbefüllung aus dem Recorder greift dabei auf die Historie
der Test-Entitäten zu, die der Replay gerade erst erzeugt hat.

### 4.3 Trockenlauf

`--dry-run` liest die Referenzdaten, rechnet den kompletten Ablauf durch und
schreibt nichts. Gut, um vor dem ersten echten Lauf Fenster, Rollen und Anzahl
der Schreibvorgänge zu prüfen:

```bash
node scripts/replay.mjs --from 15:25 --to 15:41 --speed 4 --dry-run
```

## 5. `make-stress-entities.mjs`

```
node scripts/make-stress-entities.mjs [Optionen]
```

| Option | Bedeutung |
|---|---|
| `--count <n>` | Anzahl Verbraucher (Standard 100) |
| `--seed <n>` | Startwert des Zufallsgenerators (Standard 42) |
| `--vary` | In einer Schleife laufen und die Werte laufend ändern |
| `--interval <s>` | Abstand zwischen zwei Runden bei `--vary` (Standard 5) |
| `--rounds <n>` | Nur n Runden (Standard: bis Strg+C) |
| `--dry-run` | Nichts schreiben |
| `--help` | Hilfe |

```bash
node scripts/make-stress-entities.mjs --dry-run     # Verteilung ansehen
node scripts/make-stress-entities.mjs               # einmalig setzen
node scripts/make-stress-entities.mjs --vary --interval 3
```

`--vary` ist der eigentliche Lasttest: alle paar Sekunden ändern sich alle 101
Werte, einzelne Verbraucher schalten ab (fallen unter 10 W) und wieder an. Damit
sieht man das Umsortieren der Liste  und die Ring-Übergänge
unter Last und prüft /: Mit `max_consumers: 5` dürfen nur sechs
Einträge im DOM stehen.

## 6. Kartenkonfiguration für das Test-Dashboard

Ein Dashboard mit drei Ansichten anlegen — *Live* (echte Entitäten),
*Szenarien*, *Stress*. Die folgenden Konfigurationen gehören in *Szenarien* bzw.
*Stress* und lassen sich direkt in den YAML-Editor der Karte einfügen.

### 6.1 Szenarien-Karte (Abnahme L)

```yaml
type: custom:enerlens-card
title: EnerLens Szenario

entities:
  solar: sensor.enerlens_test_solar
  grid: sensor.enerlens_test_grid            # signiert: + Bezug, − Einspeisung
  battery:
    discharge: sensor.enerlens_test_battery_to_house
    charge: sensor.enerlens_test_solar_to_battery
  battery_soc: sensor.enerlens_test_soc
  house: sensor.enerlens_test_house_5s       # schneller Sensor
consumers:
  - entity: sensor.enerlens_test_heatpump
    name: Wärmepumpe
  - entity: sensor.enerlens_test_ac
    name: Klima
  - entity: sensor.enerlens_test_ac_storage
    name: Klima Speicher
  - entity: sensor.enerlens_test_storage
    name: Speicher
  - entity: sensor.enerlens_test_fridges
    name: Kühlschränke
  - entity: sensor.enerlens_test_dryer
    name: Trockner
  - entity: sensor.enerlens_test_washer
    name: Waschmaschine
  - entity: sensor.enerlens_test_dishwasher
    name: Spülmaschine

min_consumer_w: 10
max_consumers: 4                             # Abnahme L
update_interval_s: 5

list:
  enabled: true
  rest_label: Rest
  title: Verbraucher

ring:
  enabled: true

view:
  default_mode: current
  avg_short_minutes: 5
  avg_long_minutes: 15
  show_selector: true
  remember: false                            # im Test nicht merken, sonst startet man im falschen Modus

flow:
  min_w: 10
  slow_below_w: 500
  more_dots_above_w: 2000
  max_dots_at_w: 6000
  max_dots: 5
  slow_s: 5
  fast_s: 1.8
  animation: auto
```

Farben und Icons sind bewusst nicht gesetzt — so prüft die Karte gleich die
Standardwerte aus den HA-Energie-Theme-Variablen.

### 6.2 Zweite Szenarien-Karte (Abnahme V)

Dieselbe Konfiguration, zwei Änderungen — am einfachsten als zweite Karte in
derselben Ansicht, dann lassen sich beide Abnahmen ohne Umkonfigurieren fahren:

```yaml
# max_consumers weglassen — Abnahme V läuft ohne Limit
# und im Ø-Modus starten:
view:
  default_mode: avg_short
  avg_short_minutes: 5
  avg_long_minutes: 15
  show_selector: true
  remember: false
```

### 6.3 Weitere nützliche Varianten

- **Abgeleiteter Hauswert :** `house` weglassen. Der Knoten trägt dann
  „· berechnet" und ist nicht klickbar.
- **Abgeleitete Batterie (Checkliste 0.1.0):** `battery: derived` und `house`
  angeben — im Nachtszenario (`--once 03:00:00`) muss „entlädt" stehen.
- **Ohne Batterie :** `battery` und `battery_soc` weglassen — der
  Knoten entfällt.
- **Langsamer Hauswert:** `house: sensor.enerlens_test_house_60s` — zeigt
  den Unterschied zum 5-s-Sensor.
- **Nicht verfügbar:** Einzelne Rollen weglassen, z. B.
  `--roles solar,grid,house_5s`; alle nicht abgespielten Entitäten bleiben leer.

### 6.4 Stress-Karte

```yaml
type: custom:enerlens-card
title: EnerLens Stress (100 Verbraucher)

entities:
  solar: sensor.enerlens_test_solar          # aus dem Replay, siehe Hinweis unten
  grid: sensor.enerlens_test_grid
  house: sensor.enerlens_stress_house

consumers:
  - entity: sensor.enerlens_stress_001
  - entity: sensor.enerlens_stress_002
  - entity: sensor.enerlens_stress_003
  # … bis sensor.enerlens_stress_100

min_consumer_w: 10
max_consumers: 5                             # nur 6 Einträge dürfen im DOM stehen
update_interval_s: 5

list:
  enabled: true
  title: Verbraucher

ring:
  enabled: true

view:
  default_mode: current
  show_selector: true
  remember: false
```

Die 100 Zeilen erzeugt am schnellsten:

```bash
for i in $(seq -w 1 100); do echo "  - entity: sensor.enerlens_stress_$i"; done
```

`consumers[].name` bleibt weg — die Karte nimmt dann den `friendly_name`
(„EnerLens Stress 001"), womit gleich mitgeprüft wird. Farben kommen aus der
eingebauten Palette; bei 100 Verbrauchern wiederholt sie sich, das ist so
gewollt.

**Hinweis zu PV und Netz:** Die Stress-Skripte legen nur die Verbraucher und den
Hauswert an. Damit das Kreuz nicht leer bleibt, einmal

```bash
node scripts/replay.mjs --once 15:40:18 --roles solar,grid,soc
```

laufen lassen; die Werte stehen dann fest, während die Verbraucher variieren.

## 7. Aufräumen und Neustart

Die per REST gesetzten Entitäten stehen **nicht** in der Konfiguration — es gibt
keinen Eintrag in `configuration.yaml`, keinen Helfer, keine Integration. Sie
existieren nur im Zustandsspeicher des laufenden Home Assistant und sind nach
einem **Neustart von Home Assistant spurlos verschwunden**.

Für Testzwecke ist das genau richtig:

- Kein Aufräumen nötig — ein Core-Neustart setzt die Testumgebung zurück.
- Keine Rückstände in `.storage`, keine verwaisten Helfer, kein Risiko, dass
  Testwerte später in einer Automation landen.
- Die Karten im Test-Dashboard zeigen nach einem Neustart „—" — auch das
  ist ein brauchbarer Testfall, bis das nächste Replay läuft.

Was einen Neustart überlebt, sind allein die Dashboard-Ansichten mit den
Kartenkonfigurationen. Sie zeigen dann auf Entitäten, die es gerade nicht gibt;
ein erneuter Aufruf von `replay.mjs` bzw. `make-stress-entities.mjs` erweckt sie
wieder zum Leben.
