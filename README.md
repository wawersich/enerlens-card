# EnerLens Card

An energy flow card for Home Assistant. The familiar cross of PV, grid, house
and battery — plus a breakdown of what the house figure is actually made of.

*[Deutsche Fassung dieser Seite](README.de.md)*

![EnerLens in a light theme](docs/images/light.png)
![EnerLens in a dark theme](docs/images/dark.png)

> **Status: not released yet.** The card works and is in daily use on one
> installation, but there is no tagged release and it is not in HACS. Treat the
> configuration as settled and the version as pre-1.0.

## What it does differently

**Consumers are a breakdown, not extra nodes.** The list beside the house node
and the ring around it show what makes up the house value. A configurable
remainder holds everything you do not measure individually — on the reference
installation that is about 45 % of consumption, which is worth seeing rather
than hiding.

**Three view modes.** A live power diagram jumps by kilowatts within seconds.
Switch to a 5- or 15-minute moving average and the picture calms down without
the numbers becoming a lie: the active mode is always named, and clicking any
element still opens Home Assistant's own dialog with the raw history.

**The list sorts itself and glides.** Rows reorder by power on a fixed beat and
slide to their new position instead of jumping. Values update immediately; only
the order waits for the beat, because a jumping figure does not disturb but a
jumping row does. A small filter button beside the view chips shows every consumer
regardless of power — for tapping the history of a device that has just gone
quiet. Like the selected view, the button survives a reload.

**Measurements are never quietly changed.** Sensors update at different rates,
so the individually measured consumers can briefly add up to more than the
house total — on the reference installation that happens about 1 % of the time,
by as much as 3 kW. The card does not smooth that away: the remainder simply
disappears and the ring shows shares of the consumer sum instead.

## Installation

### HACS

1. HACS → ⋮ → *Custom repositories* → add `https://github.com/wawersich/enerlens-card`,
   type *Dashboard*
2. Search for *EnerLens*, install, reload the browser
3. HACS registers the resource `/hacsfiles/enerlens-card/enerlens-card.js` for
   you; if the card does not appear, check *Settings → Dashboards → Resources*

### Manually

1. Download `enerlens-card.js` from the latest release
2. Copy it to `config/www/`
3. Add the resource under *Settings → Dashboards → Resources*:
   `/local/enerlens-card.js` as *JavaScript module*

## Configuration

The card ships a GUI editor. Every entity form below — a single entity, an
inverted one, two entities, or a derived quantity — is a choice in the form, so
YAML is never required. Only the charge gradient and the consumer palette stay
YAML-only. The YAML is documented for people who prefer it.

### Minimal

```yaml
type: custom:enerlens-card
entities:
  solar: sensor.pv_power
  grid: sensor.grid_power
  house: sensor.house_consumption
```

### With a battery and consumers

```yaml
type: custom:enerlens-card
title: Energy
entities:
  solar: sensor.pv_power
  grid: sensor.grid_power
  house: sensor.house_consumption
  battery: sensor.battery_power
  battery_soc: sensor.battery_level
consumers:
  - entity: sensor.heat_pump_power
    name: Heat pump
  - entity: sensor.washing_machine_power
  - entity: sensor.fridge_power
max_consumers: 5
```

### Sign conventions

The card follows Home Assistant's own convention, the same one
`power-flow-card-plus` and the energy dashboard use:

| Quantity | Positive | Negative |
|---|---|---|
| `grid` | import from the grid | export |
| `battery` | discharging | charging |

If your sensor reports the other way round — many inverters report export as a
positive number — invert it per entity:

```yaml
entities:
  grid:
    entity: sensor.grid_power
    invert: true
```

If you have separate sensors per direction instead of one signed sensor, name
both. Values are expected to be zero or positive:

```yaml
entities:
  grid:
    import: sensor.grid_import
    export: sensor.grid_export
  battery:
    discharge: sensor.battery_discharge
    charge: sensor.battery_charge
```

### Deriving a missing quantity

`solar`, `grid`, `house` and `battery` form one equation:

```
solar + import − export + discharge − charge = house
```

Leave `house` out and the card derives it. To derive one of the others instead,
name it explicitly:

```yaml
entities:
  solar: sensor.pv_power
  grid: sensor.grid_power
  house: sensor.house_consumption
  battery: derived        # no battery power sensor
```

Exactly one quantity may be derived — two unknowns cannot be solved from one
equation, and the card says so rather than guessing. Derived nodes are labelled
and are not clickable, because there is no entity behind them to show.

**Want a history for the derived value?** A derived node has no entity, so
tapping it cannot open Home Assistant's history. If you want that, let Home
Assistant do the same sum: create a *Template → Sensor* helper (unit `W`,
device class `power`, state class `measurement`) with

```jinja
{{ [0, states('sensor.pv_power')|float(0)
      - states('sensor.grid_export')|float(0) + states('sensor.grid_import')|float(0)
      + states('sensor.battery_discharge')|float(0) - states('sensor.battery_charge')|float(0)]|max|round(0) }}
```

and use that sensor as `house`. It is the card's formula, only now it is
recorded - history, statistics and automations get it too.

**A note on accuracy:** deriving the house value is convenient but only as good
as its inputs. On the reference installation, deriving it from 60-second grid
and battery sensors was off by up to 8.7 kW during load changes, while a
measured 5-second sensor followed within 4 seconds. If you have a fast house
sensor, use it.

The exception is a house sensor that does not see all of your PV. A hybrid
inverter computes "house" from its own strings, the grid and the battery; a
micro-inverter feeding in behind the meter shows up as *less house load*, not
as production. If `solar` includes such sources and `house` comes from the
inverter, the house is low by exactly that amount — derive it instead.

### All options

| Option | Default | Meaning |
|---|---|---|
| `title` | — | Card heading |
| `entities.solar` | required | PV power, W or kW |
| `entities.grid` | required | Grid power, signed |
| `entities.house` | derived | House consumption |
| `entities.battery` | — | Battery power, signed |
| `entities.battery_soc` | — | State of charge in % |
| `consumers` | — | List of `{entity, name, color, icon, min_w}` |
| `min_consumer_w` | `10` | Consumers below this are folded into the remainder; a consumer's own `min_w` overrides it |
| `max_consumers` | all | Only the strongest are listed |
| `update_interval_s` | `5` | How often the list reorders |
| `power.unit` | `kW` | `kW` or `W`; watts are always whole numbers |
| `power.decimals` | `2` | Decimals for kW: 1, 2 or 3 |
| `list.enabled` | on with consumers | Show the list |
| `list.rest_label` | localised | Name of the remainder |
| `list.title` | — | Heading above the list |
| `ring.enabled` | on with consumers | Show the ring |
| `view.default_mode` | `current` | `current`, `avg_short` or `avg_long` |
| `view.avg_short_minutes` | `5` | Short averaging window |
| `view.avg_long_minutes` | `15` | Long averaging window |
| `view.show_selector` | `true` | Show the mode chips |
| `view.remember` | `true` | Remember the view and the filter button per browser |
| `flow.inactive_lines` | `show` | `show`, `dim` or `hide` |
| `flow.animation` | `auto` | `auto`, `on` or `off` |
| `flow.min_w` | `10` | Below this nothing moves, and grid and battery show no state word |
| `flow.peak_w` | `6000` | One knob for the motion: the power at which dots peak; the three thresholds below default to 1/12, 1/3 and 1/1 of it |
| `flow.slow_below_w` | `500` | One slow dot up to here |
| `flow.full_speed_w` | = `more_dots_above_w` | Where the single dot reaches full speed; set it apart from `more_dots_above_w` to separate speed from count |
| `flow.more_dots_above_w` | `2000` | More dots beyond here |
| `flow.max_dots_at_w` | `6000` | Where the dot count peaks |
| `flow.max_dots` | `5` | Upper limit on dots |
| `flow.slow_s` | `5` | Seconds per pass at the low threshold |
| `flow.fast_s` | `1.8` | Seconds per pass at the top threshold |
| `colors.*` | HA energy colours | Any CSS value, including `var(--…)` |
| `colors.soc_stops` | red → yellow → green | Gradient for the charge level |
| `colors.consumer_palette` | 10 colours | Cycled through consumers without a colour of their own |
| `icons.*` | mdi defaults | Per-node icon |

`flow.animation: auto` follows the device's reduce-motion preference — that
setting lives in the operating system, not in Home Assistant.

### Colours

Defaults come from Home Assistant's energy theme variables, so the card matches
the energy dashboard without configuration. To colour by good and bad instead:

```yaml
colors:
  grid_export: "#43a047"        # exporting is good
  grid_import: "#e53935"        # importing is not
  battery_charge: "#43a047"
  battery_discharge: "#e53935"
```

## Languages

The card follows the language of the signed-in Home Assistant user (*Profile →
Language*). There is no language setting on the card itself — that would mean
maintaining the same choice twice.

| | |
|---|---|
| Supported | English, German |
| Chosen by | `hass.language`, falling back to English |
| Not translated | Anything you typed yourself — titles, consumer names, `rest_label` |

Adding a language needs no code: copy `src/translations/en.json`, translate the
values, keep the keys, and drop it in as `<code>.json`. A test checks that every
translation file carries exactly the same keys as the English one, so a missing
entry fails the build rather than surfacing as a raw key in someone's dashboard.

## Coming from power-flow-card-plus

- Sign conventions are identical — existing sensors should work unchanged.
- Individual consumers become the `consumers` list, and they are a *breakdown*
  of the house value rather than additional nodes. The remainder shows what is
  left.
- There is no `watt_threshold`; use `min_consumer_w` for the list and
  `flow.min_w` for the animation. They are deliberately separate.

## Development

```bash
./scripts/setup.sh     # install dependencies
npm run check          # typecheck, lint, tests, build
npm run build          # single-file bundle in dist/
./scripts/deploy.sh    # build and copy into a local Home Assistant
```

[`docs/`](docs/) holds the design decisions (`docs/decisions/`), the animation
spike that led to the Web Animations API, the test setup with its replay
scripts, and the screenshots.

The user-facing documentation — this page and [`README.de.md`](README.de.md) —
is maintained in both languages.

## Licence

MIT
