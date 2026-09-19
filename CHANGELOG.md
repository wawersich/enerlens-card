# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.5.0] - 2026-09-19

### Added
- **A design for the flow dots.** `flow.design` picks one of the designs in
  `flow-designs.json`: a dot gains a lighter core towards its front and,
  optionally, a glow. `none` keeps the plain dot every version has drawn.
  The designs are made in the design tool under `tools/leuchtspur/` and both
  it and the card work out a dot from the same module, so one cannot drift
  from the other.
- **`appearance`** shows this one card light or dark whatever the theme says,
  without touching the rest of the dashboard, and settles which half of a flow
  design applies. `auto` (the default) reads the theme, as before. Light and
  dark use Home Assistant's own default colours.

- **`flow.dot_color`** gives every dot on the card one colour, in the cross and
  in the consumer rows alike, while the lines keep theirs. Left empty - the
  default - a dot carries the colour of its flow, which is what shows where
  the energy comes from.
- **`icons.rest`** puts an icon on the remainder row, which had no way to get
  one and sat among the others as the single plain dot.
- **The row mark follows the row spacing.** A short list spaces its rows 40 px
  apart and an 18 px mark looked lost in that; it is now 24 px there, about
  20 px at medium spacing and the old 18 px in a long list - which never grows
  a row, because the mark can never outgrow its own row.

### Changed
- **The charge level is visible on a dark card.** The fill blends towards the
  ground, and 22 % of green over near-black reads as "slightly less black"
  rather than as green - measured, it was less colourful there than the same
  22 % over white. A dark ground now uses 60 %, which nearly triples the
  colour and puts the text on it at contrast 4.5 - the floor, and as far as
  opacity alone can go.
- **"Show the mode chips" is now "Show the filter bar"** and hides the whole
  bar, the list's filter button included. It used to leave that button behind
  in a header of its own.
- **Without the list, the cross is centred and full size**, as it already was
  with the list below it. It kept the narrow "beside the list" size and sat
  against the left edge.
- **Every group in the editor starts closed**, entities included, and the
  consumer list has a panel of its own like everything else.

### Fixed
- **Dots kept their spacing over hours.** Speed changes went through
  `updatePlaybackRate`, which hands the animation a rate that some later frame
  applies - and recomputes that one animation's start time when it does. Rate
  and spacing are now set together, synchronously.

## [0.4.1] - 2026-09-13

### Fixed
- **"Used in this card" left colours out.** The list of colours to click stopped
  after twelve, and the seven node colours come first - on a card with eight or
  more consumers the last of them was missing from a list that claims to show
  what the card uses. It now shows all of them; repeats are still collapsed, and
  an extreme configuration scrolls rather than growing past the dialog.

## [0.4.0] - 2026-09-13

### Added
- **A colour picker, on every colour the card has.** Colours were typed as text.
  The editor now gathers all of them under "Colours" in three groups - the seven
  nodes, one row per consumer, and the stops of the charge gradient - and each
  row opens a picker: a saturation and brightness field over a hue strip, the
  value as hex or as RGB/HSL sliders, and one click on any colour the card
  already uses so two devices end up sharing a colour instead of nearly sharing
  one. The text field stays, folded away behind "CSS": a picker can only produce
  `#rrggbb`, and `var(--energy-solar-color, …)` is the point of the defaults.
- **The charge gradient is editable in the GUI.** It was YAML-only. Its ends are
  pinned at 0 and 100 because the card refuses a gradient that does not run the
  whole scale; stops in between can be moved, added and removed.

### Changed
- **A consumer's colour moved out of its card, into "Colours".** The object
  selector renders its own fields, so a swatch cannot be put next to one of
  them. Two places for one setting would have been one too many - and side by
  side, the colours of a card can actually be compared.
- Dragging the wheel repaints the card but writes the configuration once, on
  release, rather than on every pixel.

### Fixed
- **The card editor closed while a colour was being picked.** `<input
  type="color">` opens an operating-system popup outside the document, and every
  pointer event in it reaches the editor's `ha-dialog` as a click on nothing.
  The wheel now lives in the card's own shadow root, inside the dialog.
- **Every edit in the editor made the consumer list glide across the card.**
  Two causes: `setConfig` - which the editor calls on every keystroke - rebuilt
  the averaging buffer, dropped back to the configured start view and forgot a
  latched outage, so every value moved at once and the list reordered; and the
  first measurement, which can move the list from beside the cross to below it,
  was animated as though it were a reorder. `setConfig` now resets only what the
  new configuration actually changed, and rows glide only once the layout has
  settled.
- Dragging the hue strip on a grey or a black did visibly nothing, since neither
  has a hue to move. Asking for a hue now brings saturation and brightness along.

## [0.3.0] - 2026-09-13

### Added
- **"List always below".** The card decided on its own where the consumer list
  goes: beside the cross while there is room, under it when there is not. The
  new `list.always_below` keeps it under the cross whichever width the card
  has - for a bigger, quieter cross, or so several cards below one another look
  alike. Off by default, and off it changes nothing. On a wide card the cross
  then grows to the 400 px it is allowed when it has the row to itself. The
  switch forces the wrap in the stylesheet rather than setting the stacked flag
  itself: that flag stays measured, so the fan lines and the spacing follow by
  themselves.

### Changed
- **The short averaging window now defaults to 2 minutes instead of 5.** Close
  enough to the current reading to still answer "what is happening right now",
  far enough from it to take the peaks out. The long window stays at 15
  minutes, and a configured `view.avg_short_minutes` is untouched.
- **A row whose line carries nothing no longer gets a ring segment.** The ring
  now shows exactly the entries drawn with a coloured, moving line - everything
  from `flow.min_w` upwards, the rest entry included. Before, lifting the
  filter could put a consumer drawing a single watt into the ring as a fully
  coloured segment next to its own grey, dotless line, and the minimum arc blew
  0.04 % up to the width of a real contributor. The test is `dotParams`, the
  same call that decides whether the line runs, so ring and line cannot drift
  apart. With the filter on, nothing changes for a consumer above the
  threshold.
- The shortest ring segment is now 1.4 % of the circumference instead of 1.7 %.
  The smallest possible segment now sits at `flow.min_w`, so less inflation is
  needed, and the largest segment gives up less of its length for it.

## [0.2.0] - 2026-09-09

### Added
- **Grid outage.** Where an installation reports whether the grid is there at
  all, `entities.grid_status` makes the card say so: a red X over the grid
  icon, "no grid" instead of a figure, and a red strip above the cross. The
  entity and the states that mean something are configured, never guessed -
  every integration names them differently. `unavailable`, `unknown` and
  unlisted states keep the last state, because an outage often takes the
  connection with it and silence must not read as "the grid is back". On load
  the last real state of the past ten days comes from the recorder. Without
  the option nothing changes.

### Changed
- **The stacked list gets the fan too.** Below the cross every row used to carry
  its own short bar with dots; the lines now gather in one point at the left of
  the block, with the house icon beside it, and fan out to the rows the way they
  do beside the cross. The colour mark moved next to the name, where it reads as
  part of the label instead of being separated from it by the bar. One mechanism
  instead of two: the parallel bars had their own CSS animation, which only
  happened to agree with the dots on the fan lines.

### Fixed
- Node labels hang below the cross, and a two-line one ("Battery / charging")
  sat on the card's bottom edge with one pixel to spare, or reached into the
  first list row when stacked. Both layouts now reserve room for it.
- With split grid or battery entities, tapping a node below `flow.min_w` opened
  the direction the sign pointed at, even though the node itself showed no state
  word - 4 W of export led to the export history, where charging the battery
  from the grid does not appear. Label and tap target now share one rule.

### Documentation
- README explains when to prefer a single signed entity, and how a template
  helper turns a split pair into one, so the history stays in one place.

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
  beside the cross; the same lines from a gathering point when it is stacked
  below (short lanes per row until 0.1.1). The
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
