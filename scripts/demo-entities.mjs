/**
 * Creates neutral demo entities for README screenshots.
 *
 * The reference installation's own entity ids carry device serial numbers and
 * its consumer names describe a specific household (REQ N-9), so screenshots
 * are taken against these instead. They vanish on the next Home Assistant
 * restart - nothing is written to any configuration.
 */
const token = process.env.SUPERVISOR_TOKEN;
const dryRun = process.argv.includes("--dry-run");
if (!token && !dryRun) {
  console.error("SUPERVISOR_TOKEN fehlt");
  process.exit(1);
}

// A sunny afternoon: PV covers the house, charges the battery and exports the
// rest. Chosen so every element has something to show - all four nodes active,
// a readable ring, and a remainder that is visible without dominating.
const VALUES = [
  ["solar", 6420, "W", "power", "Solar"],
  ["grid", -2100, "W", "power", "Grid"],
  ["house", 3120, "W", "power", "House"],
  ["battery", -1200, "W", "power", "Battery"],
  ["battery_soc", 68, "%", "battery", "Battery charge"],
  ["heat_pump", 1180, "W", "power", "Heat pump"],
  ["washing_machine", 620, "W", "power", "Washer"],
  ["air_conditioning", 310, "W", "power", "Air conditioning"],
  ["fridge", 145, "W", "power", "Fridge"],
  ["dishwasher", 95, "W", "power", "Dishwasher"],
];

const PREFIX = "sensor.enerlens_demo_";

async function main() {
  const sum = VALUES.slice(5).reduce((a, v) => a + Number(v[1]), 0);
  console.log("EnerLens Demo-Entitäten" + (dryRun ? "  [TROCKENLAUF]" : ""));
  console.log(`  Verbraucher zusammen : ${sum} W`);
  console.log(`  Haus                 : 3120 W  →  Rest ${3120 - sum} W\n`);

  let written = 0;
  for (const [name, state, unit, deviceClass, friendly] of VALUES) {
    const entityId = `${PREFIX}${name}`;
    if (!entityId.startsWith(PREFIX)) throw new Error(`Unerwartete Entität: ${entityId}`);
    console.log(`  ${entityId.padEnd(42)} ${String(state).padStart(6)} ${unit}`);
    if (dryRun) continue;
    const res = await fetch(`http://supervisor/core/api/states/${entityId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        state: String(state),
        attributes: {
          unit_of_measurement: unit,
          device_class: deviceClass,
          state_class: "measurement",
          friendly_name: friendly,
        },
      }),
    });
    if (!res.ok) {
      console.error(`  FEHLER bei ${entityId}: HTTP ${res.status}`);
      continue;
    }
    written++;
  }
  console.log(dryRun ? "\nTrockenlauf beendet." : `\nFertig: ${written} Werte gesetzt.`);
}

main().catch((e) => {
  console.error("Fehler:", e.message);
  process.exit(1);
});
