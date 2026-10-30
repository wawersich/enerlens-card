# YAML configuration formats - history

Internal developer document. History of the card's YAML configuration format
from 0.1.0 to the current `dev`. Only versions that changed the YAML are listed.
Sources: `git diff <prev> <tag> -- src/config.ts src/types.ts src/editor.ts`,
`getStubConfig` in `src/enerlens-card.ts`, and CHANGELOG.md; every entry was
checked against the code, not taken from the changelog alone.

Classification:

- **ADDED** - new optional key; old configurations are unaffected.
- **CHANGED-COMPATIBLE** - meaning or default changed, old YAML still accepted.
  The entry says when the card renders differently.
- **LEGACY-MAPPED** - the old spelling is still read and mapped to the new form.
- **INCOMPATIBLE** - old YAML is rejected or ignored, or a value the user wrote
  now renders differently with no mapping. Marked **MIGRATION NEEDED**.

Entity ids below are placeholders (`sensor.example_*`).

## Policy - old formats stay readable

**Every configuration that a released version accepted must stay readable by
every later version and render the same.** The readers for old spellings are
not dead code: they are what keeps existing dashboards working after an update.

- A legacy reader, its tests and the files under `test/legacy/` are never
  removed, shortened or "simplified" on anyone's own judgement - not in a
  refactoring, not after a review finding, not because the editor no longer
  writes the old form.
- An old format may be marked deprecated, or declared no longer supported,
  **only after it has been discussed with the maintainer (Markus) and he has
  explicitly approved it.** Until then it is supported, full stop. Removal is
  considered at a new major version at the earliest.
- A change that breaks an old configuration on purpose is recorded here with
  **MIGRATION NEEDED** and the steps the user has to take, and in the
  CHANGELOG.
- A new entry here is needed only when a release changes the YAML.

## Notation

Keys are written as paths: a dot means "indented below", `[]` means "each
entry of the list". `list.rest_label` is therefore **not** a top-level key:

```yaml
list:
  rest_label: Other           # list.rest_label
consumers:
  - entity: sensor.example    # consumers[].entity
    charge:
      soc: sensor.example_soc # consumers[].charge.soc
```

Top-level keys are only those listed under 0.1.0 (`KNOWN_KEYS`) and the ones
added later at top level (`appearance` in 0.5.0).


**Tags with no YAML change:** v0.1.1 (one meaning change only, see 0.1.1),
v0.4.0, v0.4.1, v0.5.3, v0.5.4, v0.6.0, v0.8.1, v1.0.1, v1.1.0. v0.4.0
refactored the colour defaults into `colors.ts` and added colour pickers to the
editor; `consumers[].color` and `colors.soc_stops` kept their form. v0.5.3
changed internal types only.

---

## 0.1.0 - 2026-09-08 - tag `v0.1.0` - `11c1fc1`

Baseline. Top-level keys (`KNOWN_KEYS`): `type`, `title`, `entities`,
`consumers`, `min_consumer_w` (10), `max_consumers` (unset = unlimited),
`update_interval_s` (5), `list`, `ring`, `view`, `flow`, `colors`, `icons`,
`power`. The card ignores the host keys `view_layout`, `layout_options`,
`grid_options` and `visibility`. Any other top-level key logs a console warning
and is ignored. Nested blocks are not checked for unknown keys.

- `entities.solar | grid | battery | house`: a string (entity id or
  `derived`), `{ entity, invert }`, or the split form: `grid: { import, export }`
  and `battery: { discharge, charge }`. Solar and house have no split form.
  Mixing the forms is an error. Solar and grid are required. Only one quantity
  may be `derived`. A missing `house` counts as `derived`.
- `entities.battery_soc`: string. Ignored with a warning when there is no battery.
- `consumers[]`: `{ entity, name, color, icon, min_w }`. An entry without
  `entity`, a duplicate, or the bare string form `- sensor.x` is skipped with a
  warning.
- `list`: `enabled` (defaults to on when there are consumers), `rest_label`, `title`.
- `ring.enabled` (defaults to on when there are consumers).
- `view`: `default_mode` (`current | avg_short | avg_long`), `avg_short_minutes`
  (5, 1-120), `avg_long_minutes` (15, 2-240), `show_selector` (true),
  `remember` (true).
- `flow`: `min_w` (10), `peak_w` (6000), `slow_below_w` (peak/12),
  `full_speed_w` (defaults to `more_dots_above_w`), `more_dots_above_w`
  (peak/3), `max_dots_at_w` (peak), `max_dots` (5, 2-10), `slow_s` (5),
  `fast_s` (1.8), `animation` (`auto | on | off`), `inactive_lines`
  (`show | dim | hide`).
- `colors`: `solar, house, grid_import, grid_export, battery_charge,
  battery_discharge, rest`, `soc_stops[] {at, color}` (must start at 0 and end
  at 100), `consumer_palette[]`.
- `icons`: `solar, grid, house, battery`.
- `power`: `unit` (`kW | W`, default `kW`), `decimals` (2, 1-3).
- Unset values: `undefined`, `null` and `""` all count as "not set"
  (`isUnset`). Exception: top-level blocks and some keys were only checked for
  `undefined` until 0.10.0 (see 0.10.0).
- `getStubConfig` takes the first two `sensor.*` entities it finds, falling
  back to `sensor.solar_power` and `sensor.grid_power`.

## 0.1.1 - 2026-09-08 - tag `v0.1.1` - `cffd853`

- `view.remember`: **CHANGED-COMPATIBLE.** Besides the view mode, it now also
  keeps the state of the filter button per browser (localStorage key
  `enerlens-show-all`). The filter button is restored on reload where it used
  to reset.

## 0.2.0 - 2026-09-09 - tag `v0.2.0` - `00f4363`

- `entities.grid_status: { entity, outage[], ok[] }`: **ADDED.** State names
  are lower-cased and de-duplicated. The string form, or a block without
  usable `outage` states, is accepted but turns the feature off with a console
  warning (`readGridStatus`). This is still the case today.

## 0.3.0 - 2026-09-13 - tag `v0.3.0` - `b31fdd9`

- `list.always_below` (false): **ADDED.**
- `view.avg_short_minutes` default 5 -> 2: **CHANGED-COMPATIBLE.** Cards that
  never set the key now average over 2 minutes. To keep the old window, set
  `avg_short_minutes: 5`.

## 0.5.0 - 2026-09-19 - tag `v0.5.0` - `ee015ee`

- `appearance` (`auto | light | dark`, default `auto`): **ADDED.** It was not
  in `KNOWN_KEYS` until 0.8.2. It was applied, but it logged a false "unknown
  option" warning.
- `flow.design` (string, default `none`): **ADDED.** An unknown id falls back
  to `none` without an error.
- `flow.dot_color`: **ADDED.**
- `icons.rest`: **ADDED.**
- `view.show_selector`: **CHANGED-COMPATIBLE.** `false` now hides the whole bar,
  including the list's filter button. Before, the button stayed in a header of
  its own.

## 0.5.1 - 2026-09-20 - tag `v0.5.1` - `b84a2d7`

- `power.unit: auto`: **ADDED** as a new enum value. In this version `auto`
  used `power.decimals` for its kilowatt figures.

## 0.5.2 - 2026-09-20 - tag `v0.5.2` - `783dc7a`

- `power.digits` (3, range 2-4, out of range throws): **ADDED.**
- `power.decimals` under `unit: auto`: **INCOMPATIBLE - MIGRATION NEEDED**
  (0.5.1 configurations only). `auto` now writes `digits` significant digits
  and ignores `decimals`. `decimals` applies only to `unit: kW`. There is no
  mapping. A 0.5.1 card with `unit: auto, decimals: 1` now shows three
  significant digits. Migration: replace `decimals` with `digits` (2-4). (The
  comment above `autoUnit` in `src/format.ts` described the 0.5.1 behaviour
  until 1.3.0.)

  ```yaml
  # 0.5.1                      # since 0.5.2
  power:                       power:
    unit: auto                   unit: auto
    decimals: 1                  digits: 2
  ```

## 0.7.0 - 2026-10-03 - tag `v0.7.0` - `4edc6ef`

- `ring.animation` (`overtake | fade | jump`, default `overtake`): **ADDED.**

## 0.8.0 - 2026-10-04 - tag `v0.8.0` - `fe8fd54`

- `consumers[].charge: { soc, show, plugged, unplugged[] }`: **ADDED.**
  - `show` is `charging | plugged | always`, default `charging`.
  - `show: plugged` without `plugged` falls back to `charging` with a warning.
  - `charge` without `soc` is dropped whole, with a warning.
  - For a `binary_sensor.*` or `input_boolean.*` `plugged` entity, `unplugged`
    is ignored.
  - Superseded in 1.3.0 (see there).

## 0.8.2 - 2026-10-16 - tag `v0.8.2` - `91eb1d8`

- Top-level `card_mod`: **CHANGED-COMPATIBLE.** It is now passed through to the
  normalized config and added to `HOST_KEYS`, so it no longer warns. Before
  this version the card dropped it, and card-mod styles were silently ignored
  (issue #8). Existing YAML starts working; nothing needs to change.
- `appearance` added to `KNOWN_KEYS`, which removes the false warning.

## 0.9.0 - 2026-10-17 - tag `v0.9.0` - `bb95077`

- `flow.dot_size` (100, 40-150, clamped) and `flow.line_width` (100, 30-150,
  clamped): **ADDED.**
- No key changed, but **dots and lines now scale with the card** (#12),
  damped by the square root of the scale. A small card draws them smaller than
  before. `100` means the old size on a card with large nodes.

## 0.10.0 - 2026-10-18 - tag `v0.10.0` - `82d9ad2`

- `nodes.<solar|grid|house|battery>`: **ADDED.**
  - `show_name` (true), `show_state` (true; grid and battery only, a warning
    elsewhere).
  - `inside { entity, position: above|below, decimals, size, weight }`; not on
    the battery.
  - `label { entity, prefix, decimals, size, weight }`.
  - `decimals` is `ha | 0 | 1 | 2 | 3 | sig2 | sig3 | sig4`. A digit given as a
    string (`"2"`) is accepted.
  - `size` is 60-150 and clamped. `weight` is `normal | medium | bold`.
  - Unknown keys inside `nodes` warn.
- `colors.<solar|grid|house>_inside`, `colors.<solar|grid|house|battery>_label`:
  **ADDED.** `colors.battery_inside` warns and is ignored.
- Empty values everywhere (#15): **CHANGED-COMPATIBLE.**
  - `null` (a key without a value) or whitespace-only text now counts as unset
    for every block and key.
  - Before, an empty `icons:`, `colors:` or `flow:` etc. threw an error.
  - `max_consumers:` left empty used to read as a limit of 1 and now means
    unlimited.
  - A consumer's empty `min_w:` used to read as 0 W and now falls back to
    `min_consumer_w`.
  - An empty `entities.<x>: ""` used to throw "mixed form" and is now
    "absent".
  - So configurations that relied on these bugs render differently. Valid YAML
    is unaffected.
- `getStubConfig`: a new card now gets the fixed placeholders `sensor.solar_power`
  and `sensor.grid_power` with marked example values. It no longer grabs real
  sensors. It also gets `icons.rest: mdi:cloud-question`. Existing cards are
  unchanged.
- Editor: it no longer deletes `list.title` and `view.remember` when saving (#19).

## 0.11.0 - 2026-10-22 - tag `v0.11.0` - `3ce01b4`

- `memory_id` (string, or a number read as a string): **ADDED.** The editor
  writes one into every card it opens that has none or has a duplicate
  (`_fixOnOpen`), and `getStubConfig` writes one too. What the card remembers
  is then stored per card instead of per browser, so a card that gets an id
  starts without its old remembered values.
- `view.modes[]`, `view.energy_periods[]` (`power | today | 24h | week | 7d |
  month | 30d`), `view.default_energy`, `list.scope[]` (`filtered | full`),
  `list.default_scope`: **ADDED.** A list with a single value fixes that quick
  button. An empty list counts as unset, with a warning.
- Energy mode by default: **CHANGED-COMPATIBLE.** Without
  `view.energy_periods`, the card offers `[power, today, 24h, week]` once
  long-term statistics exist, so existing cards gain an energy button.
  `energy_periods: [power]` restores the old behaviour. With a derived grid or
  battery, energy is forced off with a warning.
- `view.show_selector`: **LEGACY-MAPPED (deprecated).**
  - Current reader: `readQuickButtons` in `src/config.ts`.
  - `false` fixes every quick button not configured anew on its start value:
    `modes` = `[default_mode]`, `energy_periods` = `[default_energy]` (default
    `power`), `scope` = `[default_scope]`, and since 1.0.0 `pv_scales` =
    `[default_pv_scale]`.
  - New keys win over it.
  - Remembered values no longer apply to such a card.
  - The editor rewrites it into the lists when it opens (`translateSelector`
    in `src/editor.ts`).
  - Tests: `test/config.test.ts` (QB-7, two cases), `test/card.test.ts`
    (remembered values ignored) and `test/editor.test.ts` (translation on
    opening).

  ```yaml
  # old (still read)           # what the card makes of it
  view:                        view:
    default_mode: current        modes: [current]
    show_selector: false         energy_periods: [power]
                                 pv_scales: [<default_pv_scale>]
                               list:
                                 scope: [<default_scope>]
  ```
- Numbers: **CHANGED-COMPATIBLE.**
  - Values outside `NUMBER_LIMITS` are clamped and fractions in integer fields
    are rounded, both with a warning, instead of throwing. YAML that used to be
    rejected (for example `flow.max_dots: 12` or `view.avg_short_minutes: 0`)
    is now accepted.
  - New lower limits: `flow.peak_w` >= 1, `flow.slow_s` and `flow.fast_s` >=
    0.1. Before, any value > 0 was accepted.
  - Out-of-order pairs and chains (`ordered`) now swap the values the user set
    instead of raising the second one. Example: `avg_short 30 / avg_long 15`
    used to give 30 / 31 and now gives 15 / 30. Only configurations that were
    already wrong are affected.
  - Exception: `power.decimals` and `power.digits` still threw when out of
    range (`inRange`), until 1.3.0.
- `flow.design: ""` (or whitespace): now `none`.

## 1.0.0 - 2026-10-26 - tag `v1.0.0` - `373fa6c`

- `entities.solar` as a list of `string | { entity, name, kwp, icon, color,
  invert, house: excluded }`: **ADDED.**
  - Entries without an entity, and duplicates, are skipped.
  - `entity: derived` inside the list is an error.
  - `kwp` is 0.01-10000 and clamped.
  - Any `house` value other than `excluded` warns.
  - The old string and object forms are unchanged.
- `layout` (`cross | square_right | square_left | triangle`, default `cross`;
  unknown values fall back with a warning): **ADDED.**
- `flow.lines` (`curved | straight`; default `curved` for `cross`, `straight`
  for the other layouts; lenient): **ADDED.**
- `ring.solar` (true; only with a solar list) and `list.solar` (false): **ADDED.**
- `view.pv_scales[]` (`share | peak`), `view.default_pv_scale` (default
  `share`), `view.quick_style` (`segment | segment_compact | single`, default
  `segment`; lenient), `view.expanded` (a list or a single name out of
  `modes | energy_periods | pv_scales | scope`): **ADDED.**
- `view.default_mode`, `view.default_energy`, `list.default_scope`:
  **CHANGED-COMPATIBLE (editor only).** The editor no longer has fields for
  them (#22). The card still reads them, and the editor keeps them as written.
- Editor: it no longer drops unknown keys inside `consumers[].charge` and
  `entities.grid_status`.

## 1.2.0 - 2026-10-27 - tag `v1.2.0` - `d09e434`

- `layout: triangle_battery`: **ADDED** as a new enum value.
- `consumers[].charge.label`: **ADDED.**
- `colors.arrows` (`red_green | direction`, default `red_green`; lenient):
  **ADDED + CHANGED-COMPATIBLE.** The grid and battery direction arrows are now
  red and green by default. `colors.arrows: direction` restores the
  pre-1.2.0 colours.

## 1.3.0 - 2026-10-30 - tag `v1.3.0` (commit: `git rev-list -n1 v1.3.0`)

- `power.decimals`, `power.digits` out of range: **CHANGED-COMPATIBLE.** Drawn
  to the nearest limit with a warning instead of an error card, like every
  other number (`NUMBER_LIMITS`). YAML that was refused is now accepted.
- `consumers[]` entry `{ type: rest, name, icon, color, min_w, position, show:
  always, highlight, indicators }`: **ADDED** (REQ L-21). Not a consumer; at
  most one counts (`readRest` in `src/config.ts`). `entity`, `show: condition`,
  `condition` and `indicators.idle_value` are named in the console and left
  out. Any other `type` is skipped with a warning.
  - **Older versions** skip an entry without `entity` with a warning (no error
    card); their default consumer colours shift behind it, and their editor
    drops it on the next edit of the list.
  - `consumers[]` palette index: the rest entry is skipped, so the consumers
    keep their default colours wherever it stands.
- `list.rest_label`, `icons.rest`, `colors.rest`: **LEGACY-MAPPED (deprecated).**
  Still read as before; the entry's `name` / `icon` / `color` win where both
  are set (warning `rest_both`). Marked deprecated like `charge` with Markus'
  approval (30.10.2026: "mache es einheitlich"); still supported (N-12). The
  editor writes the entry and drops these keys only once the rest is changed
  or moved. Tests: `test/rest-entry.test.ts`, `test/editor-rest.test.ts`,
  `test/legacy/v0.1.0/all-blocks`, `test/legacy/v0.5.0/look`.
- Unknown keys inside `entities`, `list`, `ring`, `view`, `flow`, `colors`,
  `icons`, `power`: **CHANGED-COMPATIBLE.** Named in the console
  (`BLOCK_KEYS` in `src/config.ts`), never an error card. Older spellings that
  are still read are listed there as known keys and must stay on the list.

- `consumers[].position` (`top | bottom`; unset = sorted by power): **ADDED.**
- `consumers[].show` (`always | condition`) and `consumers[].condition {
  entity, operator, value }`: **ADDED.**
  - `operator` is `= | != | < | > | <= | >=`.
  - With `=` and `!=`, `value` is one state or a list; YAML `true` and `false`
    are read as `on` and `off`.
  - The comparison operators take one number. A non-numeric value makes a
    condition that is never met, with a warning.
  - An incomplete condition is ignored with a warning (`readHold`).
  - **Note:** the old values `show: plugged` and `show: charging` are not
    valid at this level. Copying `charge.show: plugged` one level up verbatim
    throws a ConfigError (enum).
- `consumers[].highlight { bold, band }`: **ADDED.** Both false counts as no
  highlight.
- `consumers[].indicators { ring, bar_top, bar_bottom, fill, idle_value,
  in_energy }`: **ADDED.**
  - Each slot is `{ entity, min (0), max (100), label, color }`; `fill` has no
    colour of its own.
  - `idle_value` is `power` or a slot name, default `power`. Naming a missing
    slot gives a warning and falls back to `power`.
  - `in_energy` defaults to false.
- `consumers[].charge.show | plugged | unplugged`: **LEGACY-MAPPED
  (deprecated).**
  - Current reader: `readCharge` (called from `readPlace`) in `src/config.ts`.
  - Mapping:
    - `show: always` -> `show: always`.
    - `show: plugged` + `plugged` + non-empty `unplugged` -> `show: condition`,
      `condition: { entity: <plugged>, operator: "!=", value: <unplugged> }`.
    - `show: plugged` + `plugged` (an on/off entity, or no `unplugged`) ->
      `condition: { entity: <plugged>, operator: "=", value: [on] }`.
    - `show: charging` or unset -> no hold.
    - `show: plugged` without `plugged` -> no hold, with a warning.
  - A consumer-level `show` wins, and the old keys are then not read at all
    (warning `show_twice`).
  - The editor shows the new form (`consumerView` in `src/editor.ts`), writes
    nothing on opening, and writes the new form once that consumer is changed.
  - Tests: `test/consumer-hold.test.ts` ("the old charge.show maps onto show
    and condition"), `test/migration-l18.test.ts` (1.2.0 configurations end to
    end), `test/editor.test.ts` ("shows an old charge.show in the new form,
    and writes nothing on opening", plus round-trip of the `OLD` configuration),
    `test/charge.test.ts`.

  ```yaml
  # old (still read)                   # new form
  consumers:                           consumers:
    - entity: sensor.example_wallbox     - entity: sensor.example_wallbox
      charge:                              show: condition
        soc: sensor.example_car_soc        condition:
        show: plugged                        entity: sensor.example_plug
        plugged: sensor.example_plug         operator: "!="
        unplugged: [available]               value: [available]
                                           indicators:
                                             ring:
                                               entity: sensor.example_car_soc
                                             idle_value: ring
                                             in_energy: true
  ```
- `consumers[].charge` (`soc`, `label`): **LEGACY-MAPPED (deprecated).**
  - Current reader: `readCharge` in `src/config.ts`.
  - Read as `indicators: { ring: { entity: <soc>, min: 0, max: 100, label:
    <label> }, idle_value: ring, in_energy: true }`, plus an internal
    `percent: true`, so values are shown in whole percent as before.
  - `indicators` win over `charge` (warning `indicators_twice`).
  - `charge` without `soc` is still dropped whole, including its `show`.
  - The editor converts it when the consumer is changed.
  - Tests: `test/indicators.test.ts` ("lets indicators win over the old
    charge"), `test/migration-l18.test.ts`, `test/editor.test.ts`.
- Behaviour of the legacy `charge` form: **INCOMPATIBLE - MIGRATION NEEDED**.
  These changes are deliberate (CHANGELOG "Changed") and have no mapping:
  1. `max_consumers` now counts held rows. A plugged-in wallbox takes a place
     instead of coming on top. Migration: raise `max_consumers` by the number
     of rows that can be held at the same time. Covered by
     `test/migration-l18.test.ts`.
  2. Energy mode: a condition (formerly `charge.show: plugged`) no longer holds
     a row there. `show: always` still does. Migration: use `show: always` if
     the row must stay in the energy mode. There is no exact equivalent.
     Covered by `test/migration-l18.test.ts`.
  3. Value column: the state of charge used to replace the power below
     `flow.min_w`. It now does so below the consumer's `min_w`, or else
     `min_consumer_w`, and only on the list's beat. Nothing changes when both
     are equal (default 10 W). Migration: set `consumers[].min_w` to the old
     `flow.min_w` value, which also changes when the row is listed. Covered by
     `test/indicators.test.ts` ("shows the extra value below the row's own
     threshold").

---

## Summary table - legacy spellings

| Legacy spelling | Current form | Since | Still read? | Reader (`src/config.ts`) | Test |
|---|---|---|---|---|---|
| `view.show_selector: false` | `view.modes` / `energy_periods` / `pv_scales` = `[default_*]`, `list.scope` = `[default_scope]` | 0.11.0 | yes | `readQuickButtons` (editor: `translateSelector`) | `config.test.ts`, `card.test.ts`, `editor.test.ts` |
| `consumers[].charge.show: always` | `consumers[].show: always` | 1.3.0 | yes | `readCharge` via `readPlace` | `consumer-hold.test.ts`, `migration-l18.test.ts` |
| `consumers[].charge.show: plugged` + `plugged` (on/off) | `show: condition`, `condition: {entity, operator: "=", value: [on]}` | 1.3.0 | yes | `readCharge` | `consumer-hold.test.ts`, `migration-l18.test.ts`, `editor.test.ts` |
| `consumers[].charge.show: plugged` + `plugged` + `unplugged[]` | `show: condition`, `condition: {entity, operator: "!=", value: [...]}` | 1.3.0 | yes | `readCharge` | `consumer-hold.test.ts`, `migration-l18.test.ts`, `editor.test.ts` |
| `consumers[].charge.show: charging` / unset | no `show` | 1.3.0 | yes | `readCharge` | `consumer-hold.test.ts` |
| `consumers[].charge.soc` (+ `label`) | `indicators: {ring: {entity, label}, idle_value: ring, in_energy: true}` | 1.3.0 | yes | `readCharge` | `indicators.test.ts`, `migration-l18.test.ts`, `editor.test.ts` |
| `list.rest_label`, `icons.rest`, `colors.rest` | `consumers[]` entry `type: rest` with `name`, `icon`, `color` | 1.3.0 | yes | `readRest` / `restValue` (normalizeConfig) | `rest-entry.test.ts`, `editor-rest.test.ts`, `legacy/` |
| `power.unit: auto` + `decimals` (0.5.1) | `power.unit: auto` + `digits` | 0.5.2 | no (`decimals` ignored for `auto`) | - | - |

Not legacy, but accepted and ignored since it was introduced:
`entities.grid_status` as a plain string (`readGridStatus`, warning only).

## Incompatible changes and migration

1. **0.5.2 - `power.decimals` with `unit: auto`** is ignored. Use
   `power.digits` (2-4). This only affects configurations written for 0.5.1.
2. **1.3.0 - `max_consumers` counts held rows** (old `charge.show: plugged` /
   `always`, and the new `show`). Raise `max_consumers` by the number of rows
   that can be held at once.
3. **1.3.0 - energy mode ignores conditions.** A row formerly kept by
   `charge.show: plugged` is no longer held in the energy mode. Use `show:
   always` if it must stay; there is no exact equivalent.
4. **1.3.0 - the value column switches at the consumer's own threshold**
   (`min_w`, else `min_consumer_w`) instead of `flow.min_w`. This only matters
   when the two differ. To keep the old switch point, set `consumers[].min_w`
   to the old `flow.min_w` value; this also changes when the row is listed.

These are deliberate default changes that render differently but can be undone
with one key, so they are classed CHANGED-COMPATIBLE, not incompatible:

- 0.3.0 `view.avg_short_minutes` 5 -> 2
- 0.11.0 energy mode offered by default (`energy_periods: [power]`)
- 1.2.0 red and green arrows (`colors.arrows: direction`)
- 0.9.0 dot and line scaling (no key restores it exactly; `flow.dot_size` /
  `line_width` come close)

Bug-dependent configurations that changed:

- 0.10.0 empty `max_consumers:` and empty consumer `min_w:`
- 0.11.0 ordering repair: swap instead of raise

## Gaps

Found when this document was first written (30.10.2026); all closed in 1.3.0:

- Legacy readers whose code comment did not say they must stay
  (`readQuickButtons`, `translateSelector`, `RawConfig.view.show_selector`,
  `readCharge`, `ConsumerConfig.charge`): marked `LEGACY (N-12)`.
- The comment above `autoUnit` in `src/format.ts` described 0.5.1: corrected.
- `power.decimals` / `power.digits` threw when out of range: now clamped.
- Unknown keys in nested blocks were silently ignored: now warned about.

## Maintenance

- A release that changes the YAML adds an entry above (version, date, tag,
  short commit, each change classified) - and nothing else does.
- A new older spelling gets: a `LEGACY (N-12)` comment at its reader, a row in
  the summary table, and a configuration under `test/legacy/`.
- See the policy at the top before touching any of it.
