"""
Takes the designs from the design tool and writes them into this repository.

A browser cannot write files, so the tool posts the designs to a Home Assistant
webhook and this handler puts them on disk, into src/ where the card imports them. The webhook is local_only, so it is
reachable from the home network and not from outside.

Deliberately narrow: the path is fixed here and is not a parameter, the payload
has to look like a design file, and the previous version is kept. Anything the
handler does not understand is dropped without writing.

Lives in the repository under tools/leuchtspur/ and is symlinked into
/config/pyscript/, so the checked-in copy is the one that runs:

    ln -s ../prj/enerlens-card/tools/leuchtspur/leuchtspur_save.py \
          /config/pyscript/leuchtspur_save.py

After changing it: call the service pyscript.reload - no core restart needed.
"""

import json
import pathlib
import shutil
import time

WEBHOOK_ID = "enerlens-leuchtspur-designs"
TARGET = pathlib.Path("/config/prj/enerlens-card/src/flow-designs.json")
# The copy the page is served from, so a reload shows the new state at once.
DEPLOYED = pathlib.Path("/config/www/leuchtspur/designs.json")


def _looks_like_designs(payload):
    """True for a payload shaped like a design file, with plausible entries."""
    if not isinstance(payload, dict):
        return False
    designs = payload.get("designs")
    if not isinstance(designs, list) or not designs:
        return False
    for entry in designs:
        if not isinstance(entry, dict):
            return False
        if not isinstance(entry.get("id"), str) or not entry["id"]:
            return False
        for part in ("shape", "spur", "dark", "light"):
            if not isinstance(entry.get(part), dict):
                return False
    return True


@webhook_trigger(WEBHOOK_ID, local_only=True, methods={"POST"})
def leuchtspur_save(payload=None, **kwargs):
    """Writes the designs the tool posted.

    Every file operation goes through task.executor, because Home Assistant
    aborts blocking calls made from the event loop. Only real Python functions
    may be handed to it - a function defined here is a pyscript function and is
    refused, which is why these are methods of pathlib and shutil.
    """
    if not _looks_like_designs(payload):
        log.warning("leuchtspur_save: payload is not a design file, nothing written")
        return

    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"

    if task.executor(TARGET.exists):
        backup = str(TARGET) + ".bak." + time.strftime("%Y%m%d-%H%M%S")
        task.executor(shutil.copy2, str(TARGET), backup)
    task.executor(TARGET.write_text, text, encoding="utf-8")

    if task.executor(DEPLOYED.parent.is_dir):
        task.executor(shutil.copy2, str(TARGET), str(DEPLOYED))

    log.info("leuchtspur_save: %d designs written to %s", len(payload["designs"]), TARGET)
