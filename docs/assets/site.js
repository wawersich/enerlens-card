// Theme switch, search and the live card - everything the pages do in the browser.

const root = document.documentElement;
const dark = () =>
  root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;

// The button flips what is shown now and remembers it; without a stored
// choice the page follows the system.
document.querySelector(".theme")?.addEventListener("click", () => {
  const next = dark() ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Private mode or blocked storage: the switch still works for this page.
  }
  dispatchEvent(new CustomEvent("themechange"));
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () =>
  dispatchEvent(new CustomEvent("themechange")),
);

// The page list folds behind a button on a phone.
const side = document.querySelector(".side");
side?.querySelector(".menu")?.addEventListener("click", (ev) => {
  const open = side.classList.toggle("open");
  ev.currentTarget.setAttribute("aria-expanded", String(open));
});

// Pagefind keeps one index per <html lang>, so a German page searches German.
const search = document.getElementById("search");
if (search && window.PagefindUI) {
  new window.PagefindUI({
    element: search,
    showSubResults: true,
    showImages: false,
    resetStyles: false,
    translations: { placeholder: search.dataset.placeholder },
  });
}

if (document.querySelector(".card-demo")) {
  const { startDemos } = await import("../demo/demo.js?v=8d93ee07");
  startDemos({ dark, lang: root.lang });
}
