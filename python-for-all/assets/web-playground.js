function autoResize(ta) {
  ta.style.height = "auto";
  ta.style.height = ta.scrollHeight + "px";
}

function buildDoc(htmlCode, cssCode) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${cssCode}</style>
</head>
<body>
${htmlCode}
</body>
</html>`;
}

function resizeFrame(frame) {
  const doc = frame.contentDocument;
  if (!doc || !doc.body) return;
  const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
  frame.style.height = h + "px";
}

function runWebCell(cell) {
  const htmlTa = cell.querySelector("textarea[data-role='html']");
  const cssTa  = cell.querySelector("textarea[data-role='css']");
  const frame  = cell.querySelector(".web-preview");
  const wrap   = cell.querySelector(".web-preview-wrap");
  const status = cell.querySelector(".run-status");

  try {
    wrap.classList.remove("is-empty");
    frame.srcdoc = buildDoc(htmlTa.value, cssTa.value);
    status.textContent = "updated";
    setTimeout(() => {
      if (status.textContent === "updated") status.textContent = "";
    }, 900);
  } catch (e) {
    status.textContent = "error";
    console.error(e);
  }
}

function loadJSZip() {
  return new Promise((resolve, reject) => {
    if (window.JSZip) { resolve(window.JSZip); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = () => resolve(window.JSZip);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function buildDownloadHTML(htmlCode, cssCode) {
  if (htmlCode.trimStart().toLowerCase().startsWith("<!doctype")) {
    return htmlCode.replace(/<\/head>/i, '  <link rel="stylesheet" href="style.css" />\n</head>');
  }
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>My Article</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
${htmlCode}
</body>
</html>`;
}

async function downloadWebCell(cell, btn) {
  const htmlTa = cell.querySelector("textarea[data-role='html']");
  const cssTa  = cell.querySelector("textarea[data-role='css']");
  const original = btn.textContent;
  btn.textContent = "Preparing…";
  btn.disabled = true;
  try {
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    zip.file("index.html", buildDownloadHTML(htmlTa.value, cssTa.value));
    zip.file("style.css", cssTa.value);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-article.zip";
    a.click();
    URL.revokeObjectURL(url);
    btn.textContent = "Downloaded!";
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
  } catch (e) {
    btn.textContent = "Error";
    console.error(e);
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
  }
}

document.querySelectorAll(".web-cell").forEach((cell) => {
  const htmlTa   = cell.querySelector("textarea[data-role='html']");
  const cssTa    = cell.querySelector("textarea[data-role='css']");
  const runBtn   = cell.querySelector(".btn-run");
  const clearBtn = cell.querySelector(".btn-clear");
  const frame    = cell.querySelector(".web-preview");
  const wrap     = cell.querySelector(".web-preview-wrap");
  const controls = cell.querySelector(".cell-controls");

  // Inject Download button before the run-status span
  const downloadBtn = document.createElement("button");
  downloadBtn.className = "btn-download";
  downloadBtn.textContent = "Download";
  controls.insertBefore(downloadBtn, controls.querySelector(".run-status"));

  // Hide preview until Run is pressed
  wrap.classList.add("is-empty");

  // Auto-resize the iframe to fit its content after each render
  frame.addEventListener("load", () => {
    if (wrap.classList.contains("is-empty")) return;
    setTimeout(() => resizeFrame(frame), 0);
  });

  [htmlTa, cssTa].forEach((ta) => {
    autoResize(ta);
    ta.addEventListener("input", () => autoResize(ta));
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart;
        ta.value = ta.value.slice(0, s) + "  " + ta.value.slice(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = s + 2;
        autoResize(ta);
      }
    });
  });

  runBtn.addEventListener("click", () => runWebCell(cell));
  clearBtn.addEventListener("click", () => {
    htmlTa.value = "";
    cssTa.value = "";
    autoResize(htmlTa);
    autoResize(cssTa);
    frame.style.height = "0";
    wrap.classList.add("is-empty");
  });
  downloadBtn.addEventListener("click", () => downloadWebCell(cell, downloadBtn));
});
