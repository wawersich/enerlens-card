// Points the Lovelace resource at the freshly built file so browsers reload it.
// Without the changing query parameter the browser serves the cached bundle.
const token = process.env.SUPERVISOR_TOKEN;
const version = process.argv[2] || String(Date.now());
// The dev build lives under its own file name so it can sit next to the HACS one.
const file = process.argv[3] || "enerlens-card-dev.js";
if (!token) { console.error("SUPERVISOR_TOKEN fehlt"); process.exit(1); }

const ws = new WebSocket("ws://supervisor/core/websocket");
const pending = new Map();
let id = 0;
const send = (msg) => new Promise((res, rej) => {
  const myId = ++id;
  pending.set(myId, { res, rej });
  ws.send(JSON.stringify({ ...msg, id: myId }));
});

ws.addEventListener("message", async (ev) => {
  const m = JSON.parse(ev.data);
  if (m.type === "auth_required") return ws.send(JSON.stringify({ type: "auth", access_token: token }));
  if (m.type === "auth_invalid") { console.error("Auth fehlgeschlagen"); process.exit(1); }
  if (m.type === "auth_ok") {
    try {
      const resources = await send({ type: "lovelace/resources" });
      const url = `/local/${file}?v=${version}`;
      const existing = resources.find((r) => String(r.url).startsWith(`/local/${file}`));
      if (existing) {
        await send({ type: "lovelace/resources/update", resource_id: existing.id, url, res_type: "module" });
      } else {
        await send({ type: "lovelace/resources/create", url, res_type: "module" });
      }
      console.log(`Lovelace-Ressource: ${url}`);
      process.exit(0);
    } catch (e) { console.error("Fehler:", e.message); process.exit(1); }
  }
  if (m.type === "result") {
    const p = pending.get(m.id); if (!p) return; pending.delete(m.id);
    m.success ? p.res(m.result) : p.rej(new Error(JSON.stringify(m.error)));
  }
});
