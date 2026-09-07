#!/usr/bin/env bash
# Runs every gate and fails loudly. Used before committing, because reading four
# separate outputs by eye is how a broken typecheck slips through.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

fail=0
step() {
  printf '  %-12s' "$1"
  if shift && "$@" >/tmp/enerlens-check.log 2>&1; then
    echo "OK"
  else
    echo "FEHLGESCHLAGEN"
    sed 's/^/      /' /tmp/enerlens-check.log | tail -20
    fail=1
  fi
}

step "Typen" npm run typecheck
step "Lint" npx biome check src test
step "Tests" npx vitest run
step "Build" npm run build

if [ "$fail" -ne 0 ]; then
  echo "  → nicht committen, bis das behoben ist"
  exit 1
fi
SIZE=$(gzip -c dist/enerlens-card.js | wc -c)
printf '  %-12s%.1f kB gzip\n' "Bundle" "$(echo "scale=1; $SIZE/1024" | bc)"
