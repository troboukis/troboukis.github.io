document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;
  const isGr = /\/gr(\/|$)/.test(path);
  const current = isGr ? "gr" : "en";

  const sw = document.createElement("div");
  sw.id = "lang-switcher";

  function makeBtn(lang, label) {
    const btn = document.createElement("button");
    const isActive = current === lang;
    btn.className = "lang-btn" + (isActive ? " lang-btn--active" : "");
    btn.disabled = isActive;
    if (isActive) btn.setAttribute("aria-current", "true");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      if (isActive) return;

      // Works on both localhost (/...) and GitHub Pages (/python-for-all/...)
      const toGreek = (p) => {
        if (/^\/(?:python-for-all\/)?gr(\/|$)/.test(p)) return p;
        return p.replace(/^((?:\/python-for-all)?\/)/, "$1gr/");
      };
      const toEnglish = (p) =>
        p.replace(/^((?:\/python-for-all)?\/)gr\//, "$1");

      const next = lang === "gr" ? toGreek(path) : toEnglish(path);
      location.assign(next + location.search + location.hash);
    });
    return btn;
  }

  sw.appendChild(makeBtn("en", "EN"));
  const sep = document.createElement("span");
  sep.className = "lang-sep";
  sep.textContent = "·";
  sw.appendChild(sep);
  sw.appendChild(makeBtn("gr", "ΕΛ"));
  document.body.appendChild(sw);
});
