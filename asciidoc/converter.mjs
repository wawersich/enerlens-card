/**
 * Asciidoctor's HTML5 converter with compact lists.
 *
 * Asciidoctor wraps the text of every list item in <p> - an inheritance from
 * AsciiDoc.py and DocBook - which gives lists the spacing of paragraphs. Here
 * an item that is nothing but its own line is written bare: <li>text</li>.
 * An item that carries more (a continued paragraph, a nested list) keeps the
 * <p>, because there the text really is the first of several blocks.
 *
 * Everything the built-in converter writes around a list is kept: id, role,
 * block title, the numbering style and start of an ordered list, reversed.
 * Checklists go to the built-in converter unchanged.
 */
export function registerCompactLists(asciidoctor) {
  const base = asciidoctor.Html5Converter.create();

  const attrs = (node, cls) => {
    const id = node.getId() ? ` id="${node.getId()}"` : "";
    const role = node.getRole() ? ` ${node.getRole()}` : "";
    return `${id} class="${cls}${role}"`;
  };
  const title = (node) => (node.hasTitle() ? `<div class="title">${node.getTitle()}</div>\n` : "");

  const items = (node) =>
    node
      .getItems()
      .map((li) => {
        const id = li.getId() ? ` id="${li.getId()}"` : "";
        const role = li.getRole() ? ` class="${li.getRole()}"` : "";
        return li.hasBlocks()
          ? `<li${id}${role}>\n<p>${li.getText()}</p>\n${li.getContent()}\n</li>`
          : `<li${id}${role}>${li.getText()}</li>`;
      })
      .join("\n");

  class CompactLists {
    convert(node, transform, opts) {
      const name = transform ?? node.getNodeName();
      if (name === "ulist" && !node.isOption("checklist")) {
        const style = node.getStyle() ? ` ${node.getStyle()}` : "";
        return `<div${attrs(node, `ulist${style}`)}>\n${title(node)}<ul${style ? ` class="${style.trim()}"` : ""}>\n${items(node)}\n</ul>\n</div>`;
      }
      if (name === "olist") {
        const style = node.getStyle() ?? "arabic";
        const type = { loweralpha: "a", upperalpha: "A", lowerroman: "i", upperroman: "I" }[style];
        const start = node.getAttribute("start");
        const extra =
          (type ? ` type="${type}"` : "") +
          (start ? ` start="${start}"` : "") +
          (node.isOption("reversed") ? " reversed" : "");
        return `<div${attrs(node, `olist ${style}`)}>\n${title(node)}<ol class="${style}"${extra}>\n${items(node)}\n</ol>\n</div>`;
      }
      return base.convert(node, transform, opts);
    }
  }

  asciidoctor.ConverterFactory.register(new CompactLists(), ["html5"]);
}
