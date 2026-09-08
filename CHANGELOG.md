# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.1] - 2026-09-08

### Changed
- The filter button above the consumer list keeps its state per browser now,
  the same way the selected view does (`view.remember`, key
  `enerlens-show-all`). It used to start over on every reload while the view
  chips came back, which needed explaining every time (L-12).

### Under the hood
- `CARD_SUFFIX=-dev` builds the card as `<enerlens-card-dev>` with its own
  editor, so a local build can be tested next to the released card in the same
  browser. `scripts/deploy.sh` uses it by default and keeps its own Lovelace
  resource; the released bundle is unchanged.

## [0.1.0] - 2026-09-08

First release. Everything below is new.

### The card
- Energy flow cross: PV top, grid left, house right, battery bottom. Dots move
  along the connections at a speed set by the power - one slow dot at low
  power, faster and more dots as it rises; thresholds configurable.
- Consumers as a *breakdown* of the house value, not as extra nodes: a list
  beside (or below) the cross and a ring around the house node, both showing
  the same segments. Values update live; the order is re-sorted on a tick with
  a sliding animation. A configurable "rest" entry holds what is not measured
  individually; consumers below `min_consumer_w` fold into it, and
  `max_consumers` caps the list.
- Fan lines from the house to each list row, with dots, when the list sits
  beside the cross; short lanes inside the rows when it is stacked below. The
  lines follow the rows frame by frame while these glide into a new order.
- All four nodes share one contour; the consumer ring stands in for the house
  node's border, centred on it - half outside, half inside.
- Battery node shows state of charge above the icon and power below, with a
  fill level and a red-yellow-green gradient; the two halves open the two
  histories.
- Three view modes - current, short average, long average - with configurable
  windows. Averages are labelled, the state of charge is never averaged, and
  more-info always shows the raw history.
- Any of the four balance quantities can be derived from the other three
  (exactly one). Grid and battery accept a signed entity, an inverted one, or
  two entities (import/export, discharge/charge).
- Inactive connections can be shown, dimmed or hidden.
- Grid and battery show their state word and colour only from `flow.min_w`
  upwards - a 4 W trickle reads "0.00 kW" and gets no "export" next to it.
- Row spacing follows the number of rows: roomy for a few, compact for many.
- A round filter button beside the mode chips lifts the filter and shows every consumer,
  so a device that was busy a minute ago can still be tapped for its history.
- A consumer can carry an icon, which takes the colour mark's place at the row's start.
- Each consumer can carry its own `min_w`, so a heat pump's 25 W standby does
  not count as a consumer while the global threshold stays at 10 W.
- Tap any node or row for Home Assistant's more-info dialog. No chart of its own.
- Power figures in kW with 1-3 decimals or in whole watts, one setting for the
  whole card (`power.unit`, `power.decimals`).
- All colours configurable; defaults follow the energy dashboard's theme
  variables.
- German and English, following the Home Assistant language.

### Editor
- Full GUI editor on `ha-form`, including the consumer list (object selector,
  HA 2025.7+).
- `flow.full_speed_w` separates where the dot reaches full speed from where
  more dots join (`more_dots_above_w`); by default the two coincide.
- `flow.peak_w`: one knob for the whole motion, from which the three thresholds
  derive; the six individual values sit in a collapsed fine-tuning section.
- Colours as text fields (theme variables work), icons via the icon picker,
  `flow.min_w`, and a per-consumer `min_w` in the consumer list.
- Each balance quantity has a source selector - one entity, two entities,
  derived, or none for the battery - with only the matching fields shown and a
  "flip sign" switch for single entities. Every YAML form round-trips through
  the form unchanged.

### Robustness
- What the GUI editor can produce never yields a configuration error. Cleared
  fields (`""`, `null`) read as unset everywhere; a state of charge without a
  battery, a consumer without an entity or listed twice, and thresholds in the
  wrong order are repaired with a console warning instead of a dead card.

### Known deviations from the requirements
- List rows: the effective tap height equals the row pitch (28-40 px by row
  count), above the 24 px floor but below the 44 px the other targets keep -
  a compact list was preferred (L-9, measured).
- Rows that leave the list disappear at once rather than fading and collapsing
  (L-8 asked for 350 ms opacity and 400 ms height); entering rows fade in
  while moving with the block.
- Home Assistant's energy colours and the yellow charge stop miss 3:1 contrast
  on white; kept for alignment with the energy dashboard, never the only
  carrier of meaning (N-6).

### Under the hood
- Measurements are never smoothed or scaled; the only computed values are the
  rest, the derived quantity, ring shares, flow distribution and the labelled
  averages.
- Dots animate with the Web Animations API (decision 003), chosen after
  measuring the alternatives on a phone.
- Console banner shows version and git revision.
- Single-file bundle, about 33 kB gzip.
