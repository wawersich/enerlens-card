#!/usr/bin/env bash
# Puts the design tool where a browser on the network can reach it:
# /local/leuchtspur/ on this Home Assistant.
#
# The tool reads designs.json from next to itself, so both files go together.
# Writing back is the browser's job - Chrome can save straight into the project
# over the mounted config share, every other browser downloads the file.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/tools/leuchtspur"
TARGET="/homeassistant/www/leuchtspur"

# The designs live in src/, because the card imports them at build time; the
# tool gets a copy under the name it fetches.
mkdir -p "$TARGET"
cp "$SRC/index.html" "$TARGET/"
cp "$REPO/src/flow-designs.json" "$TARGET/designs.json"
VERSION="$(md5sum "$TARGET/index.html" | cut -c1-8)"
COUNT="$(node -e 'const d=require("'"$TARGET"'/designs.json");console.log(d.designs.length)')"
echo "Kopiert nach $TARGET ($COUNT Designs)"
# index.html has to be spelled out: Home Assistant serves no directory index and
# answers the bare folder with 403.
echo "Aufrufen: /local/leuchtspur/index.html?v=$VERSION"
