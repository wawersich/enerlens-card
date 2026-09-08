#!/usr/bin/env bash
# Builds the card and drops it into /homeassistant/www, bumping the resource
# version so the browser actually reloads it.
#
# The local build carries the "-dev" element names (<enerlens-card-dev>) so it
# can be tested next to the released card installed through HACS. Set
# CARD_SUFFIX="" to deploy under the official name instead.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUFFIX="${CARD_SUFFIX--dev}"
FILE="enerlens-card${SUFFIX}.js"
TARGET="/homeassistant/www/$FILE"

cd "$REPO"
CARD_SUFFIX="$SUFFIX" npm run build
cp "dist/$FILE" "$TARGET"
VERSION="$(md5sum "$TARGET" | cut -c1-8)"
echo "Kopiert nach $TARGET (v=$VERSION)"

# Bump the Lovelace resource so browsers actually reload the file.
if [ -n "${SUPERVISOR_TOKEN:-}" ] && [ -f "$REPO/scripts/bump-resource.mjs" ]; then
  node "$REPO/scripts/bump-resource.mjs" "$VERSION" "$FILE"
else
  echo "Lovelace-Ressource von Hand setzen: /local/$FILE?v=$VERSION"
fi
