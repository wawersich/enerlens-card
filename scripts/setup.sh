#!/usr/bin/env bash
# Installs dependencies and keeps node_modules OUT of the Home Assistant config
# directory: /homeassistant is backed up daily, and 90 MB / 2400 files per backup
# is not worth it. npm replaces a node_modules symlink on every install, so this
# script restores it afterwards.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXTERNAL="/share/dev/enerlens-card/node_modules"  # must end in "node_modules": node resolves via realpath

cd "$REPO"
[ -L node_modules ] && rm node_modules
mkdir -p "$EXTERNAL"
[ -d node_modules ] || ln -s "$EXTERNAL" node_modules

npm install --no-fund --no-audit "$@"

# npm turned the symlink into a real directory - move the result out and relink.
if [ -d node_modules ] && [ ! -L node_modules ]; then
  rm -rf "$EXTERNAL"
  mv node_modules "$EXTERNAL"
  ln -s "$EXTERNAL" node_modules
  echo "node_modules ausgelagert nach $EXTERNAL"
fi
echo "Fertig. $(du -sh "$EXTERNAL" | cut -f1) in $EXTERNAL, Symlink im Repo."
