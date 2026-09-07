# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
- All four nodes share one outer diameter: solar, grid and battery are drawn as
  large as the house together with its ring.
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
- A small toggle above the list lifts the filter and shows every consumer,
  so a device that was busy a minute ago can still be tapped for its history.
- Each consumer can carry its own `min_w`, so a heat pump's 25 W standby does
  not count as a consumer while the global threshold stays at 10 W.
- Tap any node or row for Home Assistant's more-info dialog. No chart of its own.
- All colours configurable; defaults follow the energy dashboard's theme
  variables.
- German and English, following the Home Assistant language.

### Editor
- Full GUI editor on `ha-form`, including the consumer list (object selector,
  HA 2025.7+).
- Colours as text fields (theme variables work), icons via the icon picker,
  `flow.min_w`, and a per-consumer `min_w` in the consumer list.
- Each balance quantity has a source selector - one entity, two entities,
  derived, or none for the battery - with only the matching fields shown and a
  "flip sign" switch for single entities. Every YAML form round-trips through
  the form unchanged.

### Under the hood
- Measurements are never smoothed or scaled; the only computed values are the
  rest, the derived quantity, ring shares, flow distribution and the labelled
  averages.
- Dots animate with the Web Animations API (decision 003), chosen after
  measuring the alternatives on a phone.
- Console banner shows version and git revision.
- Single-file bundle, about 28 kB gzip.
