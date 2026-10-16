"""Loads the check page in WebKitGTK - the engine of Safari and GNOME Web - at
one page zoom and prints what window.check() measured, as one JSON line.

    xvfb-run -a python3 webkit.py <page url> <zoom> <preset|live> [<png>]

preset: the zoom is set before the page loads (Safari remembers it per site).
live:   the page loads at 100 % and is zoomed afterwards, as with Cmd + / Cmd -.

Called by scripts/webkit-check.mjs; needs webkit2gtk-4.1, py3-gobject3 and
xvfb-run (plus py3-cairo for the picture). WebKitGTK's set_zoom_level is the
same page zoom Safari applies on the Mac.
"""

import json
import sys

import gi

gi.require_version("Gtk", "3.0")
gi.require_version("WebKit2", "4.1")
from gi.repository import GLib, Gtk, WebKit2  # noqa: E402

url, zoom, mode = sys.argv[1], float(sys.argv[2]), sys.argv[3]
picture = sys.argv[4] if len(sys.argv) > 4 else None

window = Gtk.OffscreenWindow()
window.set_default_size(1000, 1100)
view = WebKit2.WebView()
window.add(view)
window.show_all()
settings = view.get_settings()
settings.set_allow_file_access_from_file_urls(True)
settings.set_allow_universal_access_from_file_urls(True)
result = {"error": "timeout"}


def finish(value):
    result.clear()
    result.update(value)
    Gtk.main_quit()


def check():
    def answered(source, task):
        try:
            measured = json.loads(source.evaluate_javascript_finish(task).to_string())
        except Exception as error:  # the page threw, or never defined check()
            finish({"error": str(error)})
            return
        if not picture:
            finish(measured)
            return

        def shot(source, task):
            source.get_snapshot_finish(task).write_to_png(picture)
            finish(measured)

        view.get_snapshot(
            WebKit2.SnapshotRegion.FULL_DOCUMENT, WebKit2.SnapshotOptions.NONE, None, shot
        )

    view.evaluate_javascript("window.check()", -1, None, None, None, answered)
    return False


def loaded(_view, event):
    if event != WebKit2.LoadEvent.FINISHED:
        return
    if mode == "live":
        GLib.timeout_add(2500, lambda: (view.set_zoom_level(zoom), False)[1])
        GLib.timeout_add(4500, check)
    else:
        GLib.timeout_add(2500, check)


if mode == "preset":
    view.set_zoom_level(zoom)
view.connect("load-changed", loaded)
view.load_uri(url)
GLib.timeout_add(30000, Gtk.main_quit)
Gtk.main()
print(json.dumps(result), flush=True)
