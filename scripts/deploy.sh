#!/usr/bin/env bash
# Builds the card and drops it into /homeassistant/www, bumping the resource
# version so the browser actually reloads it.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="/homeassistant/www/enerlens-card.js"

cd "$REPO"
npm run build
cp dist/enerlens-card.js "$TARGET"
VERSION="$(md5sum "$TARGET" | cut -c1-8)"
echo "Kopiert nach $TARGET (v=$VERSION)"

# Bump the Lovelace resource so browsers actually reload the file.
if [ -n "${SUPERVISOR_TOKEN:-}" ] && [ -f "$REPO/scripts/bump-resource.mjs" ]; then
  node "$REPO/scripts/bump-resource.mjs" "$VERSION"
else
  echo "Lovelace-Ressource von Hand setzen: /local/enerlens-card.js?v=$VERSION"
fi
