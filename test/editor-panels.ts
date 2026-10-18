/**
 * The editor builds a section's form, and a consumer entry's, only when it is
 * unfolded for the first time (REQ E-3, EL-I2). Tests that read the schema
 * unfold everything first, as someone working through the editor would.
 */

type Field = { name?: string; type?: string; title?: string; schema?: Field[] };
type Form = HTMLElement & { schema: Field[] };

/** Unfolds every section and consumer entry once, the way a click announces it. */
export async function unfoldAll(el: HTMLElement & { updateComplete: Promise<unknown> }) {
  for (const panel of el.shadowRoot?.querySelectorAll(".section, .consumer") ?? []) {
    panel.dispatchEvent(new CustomEvent("expanded-will-change", { detail: { expanded: true } }));
  }
  await el.updateComplete;
}

/**
 * The top-level schema as one list, the way it read when ha-form drew the
 * groups itself: plain fields as they are, each section as an expandable
 * group around the schema of the form inside it.
 */
export function topSchema(el: HTMLElement): Field[] {
  const out: Field[] = [];
  for (const child of el.shadowRoot?.children ?? []) {
    if (child.localName === "ha-form") out.push(...(child as Form).schema);
    else if (child.classList.contains("section")) {
      const inner = child.querySelector("ha-form") as Form | null;
      out.push({
        name: (child as HTMLElement).dataset.section,
        type: "expandable",
        title: child.querySelector('[slot="header"]')?.textContent?.trim(),
        schema: inner?.schema,
      });
    }
  }
  return out;
}
