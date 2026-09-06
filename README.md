# EnerLens Card

An energy flow card for Home Assistant: the familiar cross of PV, grid, house and
battery, plus an optional consumer list and ring that break the house value down
into the appliances you actually measure.

> **Status: in development.** The scaffold builds and loads, the card itself is
> being implemented. Not usable yet.

## What it does differently

- **Consumers as a breakdown, not extra nodes.** The list beside the house node
  and the ring around it show what the house value is made of; a configurable
  rest entry holds everything that is not individually measured.
- **Three view modes.** Live values, or time-weighted moving averages over two
  configurable windows - because a live power diagram jumps by kilowatts within
  seconds. The active mode is always visible; measurements are never silently
  smoothed.
- **Sorted, animated list.** Entries reorder by power on a fixed tick and glide
  to their new position instead of jumping.
- **Sign conventions that match Home Assistant.** Grid positive = import,
  battery positive = discharging, exactly like the energy dashboard and
  power-flow-card-plus, with `invert` per entity when your sensors disagree.

## Documentation

Requirements and implementation plan live in [`docs/`](docs/) (in German):

- [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) - requirements, configuration
  schema, calculation rules, acceptance criteria
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) - technical
  decisions, module layout, work steps
- [`docs/mockup.html`](docs/mockup.html) - visual draft

## Development

```bash
./scripts/setup.sh     # install dependencies
npm test               # unit tests
npm run lint           # Biome
npm run build          # single-file bundle in dist/
./scripts/deploy.sh    # build and copy into a local Home Assistant
```

## Licence

MIT
