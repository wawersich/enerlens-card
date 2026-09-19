#!/usr/bin/env bash
# Puts the design tool where a browser on the network can reach it:
# /local/leuchtspur/ on this Home Assistant.
#
# Three files go together: the page, the designs it reads, and the shape module
# it shares with the card. The module is compiled from the card's own source, so
# a dot cannot come out differently in the tool than it does on the dashboard.
#
# Writing back is the browser's job - the page posts to a Home Assistant webhook
# that writes src/flow-designs.json in the repository.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/tools/leuchtspur"
TARGET="/homeassistant/www/leuchtspur"
SHAPE="$REPO/src/render/dot-shape.ts"

mkdir -p "$TARGET"

# The shared module, compiled on its own: it has no imports, so a single-file
# tsc run is enough and the tool needs no bundler.
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
npx --no-install tsc "$SHAPE" --target es2019 --module es2020 --skipLibCheck --types --outDir "$WORK" >/dev/null
SHAPE_HASH="$(md5sum "$WORK/dot-shape.js" | cut -c1-8)"
# The name carries the content, so a changed module can never be served from a
# browser cache next to a page that expects the new one.
rm -f "$TARGET"/dot-shape.*.js
cp "$WORK/dot-shape.js" "$TARGET/dot-shape.$SHAPE_HASH.js"

# The designs live in src/, because the card imports them at build time; the
# tool gets a copy under the name it fetches.
sed "s#\"./dot-shape.js\"#\"./dot-shape.$SHAPE_HASH.js\"#" "$SRC/index.html" > "$TARGET/index.html"
cp "$REPO/src/flow-designs.json" "$TARGET/designs.json"

grep -q "dot-shape.$SHAPE_HASH.js" "$TARGET/index.html" || {
  echo "Import nicht ersetzt - erwartet wird \"./dot-shape.js\" in index.html" >&2
  exit 1
}

VERSION="$(md5sum "$TARGET/index.html" | cut -c1-8)"
COUNT="$(node -e 'const d=require("'"$TARGET"'/designs.json");console.log(d.designs.length)')"
echo "Kopiert nach $TARGET ($COUNT Designs, Modul $SHAPE_HASH)"
# index.html has to be spelled out: Home Assistant serves no directory index and
# answers the bare folder with 403.
echo "Aufrufen: /local/leuchtspur/index.html?v=$VERSION"
