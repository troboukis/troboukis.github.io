document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;
  const isGr = /\/gr(\/|$)/.test(path);
  if (!isGr) return;

  const sw = document.createElement("div");
  sw.id = "lang-switcher";

  const btn = document.createElement("button");
  btn.className = "lang-btn";
  btn.textContent = "EN";
  btn.addEventListener("click", () => {
    const next = path.replace(/^((?:\/python-for-all)?\/)gr\//, "$1");
    location.assign(next + location.search + location.hash);
  });

  sw.appendChild(btn);
  document.body.appendChild(sw);
});
