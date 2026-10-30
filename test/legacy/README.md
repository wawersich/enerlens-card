# Configurations of released versions (REQ N-12)

One folder per release that changed the YAML (`dev-docs/yaml-formats.md`).
Each `<name>.json` is a configuration that this release accepted - checked
against the code of its own tag and every later one when it was added. Its
`<name>.expected.json` is what the card made of it at the time.

`test/legacy.test.ts` reads every file: the card must still accept it, name
no key in it as unknown, and give at least what `expected` says (new fields
may be added, none may change or go). `checksums.json` makes every change to
a file here show up in a failing test.

**Add, never edit.** A file here changes only after Markus has approved that
an older spelling is no longer supported (N-12). A new release that changes
the YAML adds a folder; then run `node test/legacy/checksums.mjs` to list the
new files.

The version folders are excluded from the formatter (`biome.json`): a
reformat would change every file and its checksum without changing anything
a user wrote.
