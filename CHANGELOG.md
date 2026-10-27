# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Solar and wallbox in detail (#28, #29):** solar with several
  sources opens a window with the sources stacked and their sum; a consumer
  with a state of charge, such as a wallbox, shows its power with the car's
  charge below.
- **Triangle · battery centre:** a second triangle with house and battery
  swapped - the PV rows at the top, the consumers at the bottom.

### Changed
- **Arrows red and green:** the arrows at grid and battery are now red for
  import and discharge, green for export and charge, in the theme's colours.
  `colors.arrows: direction` brings back the direction's colour.
- In both triangles the line from solar to the lower node now leaves and meets
  its circles straight from the centre.

### Fixed
- **House with a balcony plant (#30):** a tap on the house opened the measured
  sensor, not the calculated value the node shows; it now opens a window with
  exactly that value.
- With a balcony plant, an hour the house sensor missed was filled in with the
  plant counted twice; it is now counted once.
- The dots on the PV lines no longer travel backwards: their lighter side now
  leads, into the solar node.

## [1.1.0] - 2026-10-27

### Added
- **Both directions at a glance (#26):** with two sensors each, a tap on grid
  or battery shows both directions in one chart - power as Home Assistant's
  history does, or the kWh of the chosen period. The battery adds its state of
  charge.

### Changed
- A battery with two sensors is now a single tap target.

## [1.0.1] - 2026-10-26

### Changed
- **More cards with switches on the website:** the extra values (place,
  prefix, weight, size, name, state word) and the energy chapter, whose
  time-of-day slider moves the card's clock - *Today* then runs up to the time
  set. The invented PV sources each follow their own day (south, west,
  morning).
- **A chapter on the animations:** one card to switch how the ring follows a
  new order (overtake, cross-fade, jump), one to try the dot designs with
  sliders for number, size and speed - with the editor pictures to match.

### Fixed
- **A PV source that overtook another one under "% kWp" stayed on the inner
  lane of the ring** until the card was hidden, and kept the animation
  running (#24). It now comes back up as soon as it no longer covers the one
  it passed.
- **Fading under "% kWp", the whole PV ring flashed in a source's colour**
  when a source came or went, as if there were a lot of power (#25). The
  free part now keeps a circle of its own and stays grey.

## [1.0.0] - 2026-10-26

### Added
- **Several PV sources** (#13, #14). `entities.solar` takes a list - one entry
  per inverter or string, with name, peak power (`kwp`) and icon. The PV node
  shows their sum, a ring around it each source's share (`ring.solar`), and
  on request each source has its own row above the consumers with a fan of
  its own (`list.solar`). No sum helper needed: sources asleep at night count
  as 0; one that drops out while producing turns the sum amber and its
  tooltip says which.
- **Balcony plants: `house: excluded`.** A source feeding in behind the meter
  is missing from a hybrid inverter's house value; marked so, the card adds
  it and the house reads "calculated".
- **PV scale quick button.** With peak power on every source: *100%* shows the
  shares on the ring, *% kWp* the power relative to the total peak power.
- **Arrangements** (`layout`). Besides the cross: *square · solar right*,
  *square · solar left* (PV rows left of the drawing, consumers right) and
  *triangle*. `flow.lines` chooses curved or straight connections; the
  energy mode's arrows point the right way in each.
- **Quick buttons expanded** (#21). Each quick button can show all its values
  side by side instead of one button that cycles (`view.expanded`), and
  `view.quick_style` sets how all of them look: *segment buttons*, *segment
  buttons, compact* or *single buttons*. Short of room they wrap, never a
  quick button split in two.
- **A website with the full documentation**, in English and German:
  <https://wawersich.github.io/enerlens-card/>. Its cards are not pictures but
  the real card running in the browser with invented values - the view, energy
  and filter buttons can be tried, and the grid outage, extra values and
  narrow layout each have a card of their own. Light and dark, searchable.
  On the start page and under *Arrangements* switches above the card change
  arrangement, line form, PV rows and consumer list, with the YAML that
  amounts to below it. The energy chapter says plainly that every power
  sensor, helpers included, needs the state class *Measurement* - without it
  there are no statistics and no energy.
- **The documentation site has a logo and a favicon.**
- **Pictures of the editor** on every page where something is set up there,
  in English and German, light and dark - fewer YAML listings to read.

### Changed
- **The README is short again:** what the card does, installation, a first
  step and links into the website, instead of every chapter twice.
- **No start value fields in the editor** (#22). A card remembers its last
  value anyway; the start value only counted on the very first opening.
  The YAML keys keep working.
- **Quick buttons stay on the right** when they move below the title on a
  narrow card; they used to stand on the left. Too many for one row, they
  wrap instead of reaching out of the card.
- **"Show ring" is now "Show consumer ring"**, next to the new "Show PV ring".

### Fixed
- **The editor showed "Show list" and "Show ring" off** for a card with
  consumers and nothing set in the YAML, although both were on. It now shows
  what the card does and still writes nothing until the switch is turned.
- **A consumer colour picked in the editor could land on the next consumer**
  when the YAML held an entry the card skips (`- sensor.x` instead of
  `- entity: sensor.x`).
- **Editing a consumer's charge or the grid status dropped keys** the editor
  has no field for; they now stay as written.

## [0.11.0] - 2026-10-22

### Added
- **Energy mode.** Besides power, the card shows energy over a period -
  *Today*, *24 h*, *Week*, *7 days*, *Month*, *30 days* - worked out from
  Home Assistant's statistics of the power sensors it already has, no extra
  entities. Grid and battery show both directions with two sensors each;
  with a single signed sensor the grid shows its balance and the battery no
  figure. Gaps in the statistics are filled and marked by colour.
- **Quick buttons.** The buttons in the header - smoothing, power/energy and
  list scope - each offer the values listed in `view.modes`,
  `view.energy_periods` and `list.scope`. One value makes it fixed: no
  button, the same view on every device and for every user, so a card set up
  for energy stays one. Start values: `view.default_mode`,
  `view.default_energy`, `list.default_scope`.
- **Each card remembers for itself.** The editor gives every card a
  `memory_id`; what its quick buttons were set to is kept per card and view,
  so the same card twice side by side can show power and energy. Cards
  without one share it per browser, as before.

### Changed
- **Energy without configuration.** A card without `view.energy_periods`
  offers power, today, 24 h and week, if solar, grid, battery and house have
  long-term statistics; `energy_periods: [power]` keeps it to power.
- **`view.show_selector` is deprecated.** `false` still works and fixes every
  quick button on its start value; the editor turns it into the new lists.
  Remembered values no longer apply to such a card.
- **One chip for the view** (#20). *Now*, *Ø 2 min* and *Ø 15 min* are one
  chip that steps through them and keeps its width.
- **Every editor setting names its default** in its help text.

### Fixed
- **Numbers never break the card.** A value outside its range - typed in the
  editor on the way to another, or set in YAML - is drawn to the nearest
  limit, a fraction in a whole-number field rounded, instead of showing the
  error card. Two values set the wrong way round, such as the short and the
  long averaging window, are swapped. The editor says in red under the field
  what must hold.
- An empty `flow.design` counts as not set.

## [0.10.0] - 2026-10-18

### Added
- **Extra values at the nodes** (#9). Each node can show up to two more
  values of any entity - one inside the circle (not the battery) and one
  next to it, with an optional prefix such as "Self-sufficiency". Decimals,
  size, weight and colour per value; tapping one opens its history. In the
  editor under *Labels & extra values*.
- **Name and direction can be hidden** per node - the node's name, and the
  "import / export" under grid or "charging / discharging" under battery.

### Changed
- **Editor:** the groups are reordered and renamed (*Main entities*, the new
  *Labels & extra values*, *Grid outage* after *Consumers*), and each main
  entity has its own section, with the state of charge under the battery.
- **The card redraws only for changes it shows** - its own entities,
  language, theme, connection and its beat. About 85 % fewer redraws on a
  large installation; in an average view the figures no longer move
  between beats.
- **A new card starts with example values** under a banner until its
  sensors are picked, instead of grabbing any two sensors, and with an
  icon on the remainder row (`icons.rest`). Existing cards are unchanged.

### Fixed
- **An empty key in YAML no longer breaks the card** (#15). `icons:`,
  `colors:` or `flow:` left without a value showed an error box; an empty
  `max_consumers:` cut the list to one consumer, an empty `min_w:` set a
  consumer's threshold to 0 W. Empty now means "not set".
- **The visual editor opens on any configuration** (#19). Some hand-typed
  values crashed it or were rewritten on the next edit; it now changes only
  what you edit and keeps the rest as written. `list.title` and
  `view.remember` are no longer deleted by the editor.
- **Averages after a pause** (#18). After the phone slept, the tab was in the
  background or the connection was lost, "Ø 15 min" carried the last value
  across the pause. The pause now counts as unknown, and the card fetches
  the history again to fill it in.
- **An average view opened directly has its history** (#16) instead of
  averaging only the seconds since loading.
- **The editor opens complete straight away.** It used to show only some
  groups for about a second after a page reload.
- **The editor preview no longer queries the recorder** (#17) on opening
  and on every keystroke.
- **A calculated PV or battery node** has room for "calculated" again.
- **Lines no longer show inside the circles** on a card made transparent
  with card-mod.
- **Figures in languages with other digits** (Persian, Bengali, Marathi …)
  were shown as zero.

## [0.9.0] - 2026-10-17

### Added
- **Dot size and line width can be set** (#10): `flow.dot_size` and
  `flow.line_width` in percent, two sliders in the editor under the look of
  the dots. 100 % is what the card draws today on a card with large nodes.

### Changed
- **Dots and lines grow with the card** (#12). They used to keep one size on
  screen however small the card was, and beside the list - nodes of about
  77 px - the dots looked like thick beads. They now shrink with the card,
  damped by the square root of its scale: about 77 % there, unchanged on a
  card with large nodes. A glow shrinks with its dot.

## [0.8.2] - 2026-10-16

### Fixed
- **card-mod works with the card** (#8). card-mod takes its `card_mod` block
  from the card's own copy of the configuration, and the card dropped every
  key it did not know while reading it - so any card-mod style was silently
  ignored. The block is now handed on untouched, and the card no longer warns
  about it in the browser console.
- **No false warning for `appearance`.** Choosing light or dark logged
  "Unknown option appearance - ignored" in the browser console on every
  change, although the option was applied all along.

## [0.8.1] - 2026-10-16

### Fixed
- **The dots stay on their lines in a zoomed Safari on the Mac** (#7). WebKit
  stretches a motion path by the page zoom a second time, so with Cmd + the
  dots drifted below and right of their lines, with Cmd - above and left. The
  card now measures the stretch and corrects for it; where there is none, it
  changes nothing.

## [0.8.0] - 2026-10-04

### Added
- **A consumer can carry a state of charge** - a car at its wallbox, a power
  station. `consumers[].charge` names the state-of-charge sensor; a thin ring
  around the row's icon shows it, and while nothing charges the row shows the
  charge instead of the power. `show: plugged` keeps the row in the list while
  the car is plugged in, full and at 0 W too, with `plugged` as an on/off
  sensor or a wallbox status plus its `unplugged` states. An unavailable
  sensor - a car asleep - shows the last known charge grey. The icon has the
  value as a tooltip and opens its history.

### Changed
- **Two more flow designs:** Proton and Neutrino.
- **The consumers in the editor are a list of their own.** Every consumer
  unfolds in place instead of opening a dialog, sorts by its handle, and has a
  *State of charge* section that offers the states of the chosen status sensor.
- **The README pictures show a car charging at its wallbox** - at 80 % in the
  title pictures, at 66 % in the editor screenshots.

## [0.7.0] - 2026-10-03

### Added
- **`ring.animation` chooses how the ring follows a reordered list:**
  `overtake` (default, as before) lets every segment travel to its new place
  and pass on an inner lane; `fade` keeps the places and blends their colours
  into the new order; `jump` keeps the ring still, so new values show at once
  while dots and list keep moving. In the editor right after "Show ring".
  `flow.animation: off` still stills everything.

### Fixed
- **The dots on the lines to the list pause off-screen too.** Out of sight or
  in a hidden tab only the dots in the cross stopped; those on the lines to
  the list kept running unseen.

### Changed
- **The README shows two more pictures:** the ring cross-fading its colours
  (`ring.animation: fade`), exported like the title picture with
  `npm run hero -- --fade`, and the card editor with the colour picker open,
  in English and German, light and dark. `npm run editor-shot` takes those
  from a running Home Assistant with invented values and leaves its profile
  as it was.
- **No dots while motion is off.** With `flow.animation: off`, or `auto` under
  the device's reduce-motion setting, the cross and the lines to the list drew
  their dots standing still. Spread from node centre to node centre, one hid
  under the source node and the rest bunched up, so they looked frozen - and a
  dot that does not move tells nothing. The line's colour still shows the flow.
  The same now holds in a browser that cannot move dots along a path (older
  Safari), which used to get the standing dots as a fallback.
- **The README introduction is shorter and shows two more pictures:** the card
  during a grid outage, and the card in a narrow column with the consumer list
  below the cross. Both are exported from the card itself like the title
  picture, in English and German, light and dark.
- **`npm run hero` takes `--outage` and `--below`** for those two pictures. The
  export now carries the outage banner, the X and the dashed grid node, and the
  house icon where the lines gather in the stacked layout.

## [0.6.0] - 2026-09-27

### Changed
- **The consumer ring moves more calmly.** Its segments now take 1.5 s instead
  of 0.6 s to settle into new lengths and positions; the list rows beside it
  keep their pace.
- **Ring segments change places instead of changing colour.** When two
  consumers swapped places, each segment stayed where it was and took on the
  other one's colour; only the lengths glided. A segment now belongs to its
  consumer and travels to its new place, and the one moving forward overtakes
  on an inner lane so the two do not slide through each other.
- **The ring's gaps stay even while it moves.** Every length and position used
  to glide on a CSS transition of its own, restarted separately whenever a live
  value changed it; neighbours fell out of step and a gap could close or
  double. The card now moves the whole ring itself, every segment on one
  spring, and a new segment grows from nothing where it will stand.

- **The pictures at the top of the README show the ring at work:** its
  boundaries shifting while the order holds, and a consumer overtaking on the
  inner lane. The ring in them now starts at twelve o'clock, as on the card.

### Fixed
- **`flow.animation: off` also stills the ring.** The list and the dots
  stopped, but the ring kept gliding unless the system asked for reduced
  motion.

## [0.5.4] - 2026-09-25

### Fixed
- **The dots on the cross keep their lighter core in Firefox** (#3). The cross
  takes its colours from the theme, `var(--energy-solar-color)` and the like,
  and the card asks the browser once what they are before it can mix the core
  towards white. Firefox sometimes has no answer yet while a dashboard is being
  built, and the card kept that empty answer for as long as the card lived: flat
  dots without their core, until a view change rebuilt it. The card now asks
  again on the next update until the browser answers, and repaints the dots
  without restarting them. Consumer lines get the same treatment; their colours
  are plain hex by default and never needed it, a theme colour set on them would
  have.

## [0.5.3] - 2026-09-20

### Changed
- **A listed consumer no longer sits beside a grey line.** Two thresholds
  govern a row - `min_consumer_w` decides whether it is listed, `flow.min_w`
  whether anything flows - and where the first is the lower of the two, a
  consumer at 15 W was listed with a value while its line stayed grey and the
  ring gave it no share. The row said one thing, the other two said the
  opposite. A row is now drawn in colour as soon as it earned its place in the
  list *or* something flows on it, and the ring segment follows the same test,
  so list, line and ring cannot tell three different stories. The dots still
  wait for `flow.min_w` alone: a coloured line without dots reads "yes, but
  little". Rows that only appear when the filter is lifted stay grey, and the
  cross is unchanged.

## [0.5.2] - 2026-09-20

### Changed
- **`auto` counts significant digits, not decimal places** (`power.digits`,
  2 to 4, three by default). A decimal place says something different at every
  size: two of them are a tenth of a percent at 1.23 kW and a thousandth at
  123 kW, where "123.46 kW" claims a precision no house meter has. Significant
  digits keep what the figure tells constant - `1.23 kW`, `12.3 kW`, `123 kW` -
  and rounding cannot buy one, so 9996 W reads `10.0 kW` rather than
  `10.00 kW`. A fixed `kW` keeps `power.decimals`, where it belongs: with the
  unit pinned, three significant digits would write a 30 W fridge as
  `0.0300 kW`. The editor asks each unit only the question it can answer.

## [0.5.1] - 2026-09-20

### Added
- **`power.unit: auto`** picks the unit per value: whole watts below a kilowatt,
  kilowatts above. A fixed kilowatt unit writes a fridge at 30 W as `0.0 kW`,
  and no number of decimals fixes that - while the same column at three
  decimals writes a house at 10271 W as `10.271 kW`, which is more precision
  than a meter has. How many decimals the kilowatts get stays `power.decimals`,
  because that is a matter of taste and better left set: at one decimal the
  same card reads `10.3 kW` and `30 W`. `kW` stays the default, so nothing
  changes without asking.

### Changed
- **The title pictures** are drawn with the `electron` design and with idle
  connections dimmed, so the eye reads what is flowing.

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
