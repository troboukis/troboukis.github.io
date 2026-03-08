    import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.mjs";

    const bannerSpan = document.querySelector("#loading-banner span");
    if (bannerSpan) bannerSpan.textContent = "Loading Python environment…";

    const pyodide = await loadPyodide();

    if (bannerSpan) bannerSpan.textContent = "Loading pandas library…";
    await pyodide.loadPackage("pandas");

    document.getElementById("loading-banner").remove();

    let currentOut = null;
    const PY_KEYWORDS = new Set([
      "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class",
      "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global",
      "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
      "try", "while", "with", "yield", "match", "case"
    ]);
    const PY_BUILTINS = new Set([
      "print", "len", "range", "int", "float", "str", "sum", "max", "min", "round", "type",
      "list", "dict", "set", "tuple", "enumerate", "zip", "any", "all", "sorted", "reversed",
      "isinstance", "pd", "df"
    ]);

    function escapeHtml(text) {
      return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    }

    function highlightPython(code) {
      let i = 0;
      let out = "";

      const isIdStart = (ch) => /[A-Za-z_]/.test(ch);
      const isId = (ch) => /[A-Za-z0-9_]/.test(ch);
      const isDigit = (ch) => /[0-9]/.test(ch);
      const span = (cls, txt) => `<span class="${cls}">${escapeHtml(txt)}</span>`;

      while (i < code.length) {
        const ch = code[i];

        if (ch === "#") {
          let j = i;
          while (j < code.length && code[j] !== "\n") j += 1;
          out += span("tok-comment", code.slice(i, j));
          i = j;
          continue;
        }

        if (ch === "'" || ch === '"') {
          const quote = ch;
          const triple = code.slice(i, i + 3) === quote.repeat(3);
          let j = i + (triple ? 3 : 1);
          while (j < code.length) {
            if (triple && code.slice(j, j + 3) === quote.repeat(3)) {
              j += 3;
              break;
            }
            if (!triple && code[j] === quote && code[j - 1] !== "\\") {
              j += 1;
              break;
            }
            j += 1;
          }
          out += span("tok-string", code.slice(i, j));
          i = j;
          continue;
        }

        if (isDigit(ch)) {
          let j = i;
          while (j < code.length && /[0-9_]/.test(code[j])) j += 1;
          if (code[j] === "." && /[0-9]/.test(code[j + 1] || "")) {
            j += 1;
            while (j < code.length && /[0-9_]/.test(code[j])) j += 1;
          }
          out += span("tok-number", code.slice(i, j));
          i = j;
          continue;
        }

        if (isIdStart(ch)) {
          let j = i + 1;
          while (j < code.length && isId(code[j])) j += 1;
          const word = code.slice(i, j);
          if (!PY_KEYWORDS.has(word) && !PY_BUILTINS.has(word)) {
            out += span("tok-variable", word);
          } else {
            out += escapeHtml(word);
          }
          i = j;
          continue;
        }

        out += escapeHtml(ch);
        i += 1;
      }

      return out;
    }

    pyodide.setStdout({ batched: (s) => { if (currentOut) currentOut.textContent += s + "\n"; } });
    pyodide.setStderr({ batched: (s) => {
      if (currentOut) {
        currentOut.classList.add("is-error");
        currentOut.textContent += s;
      }
    }});

    async function runCell(cellEl) {
      window.dispatchEvent(new CustomEvent("cell-run", { detail: { cell: cellEl } }));
      const ta      = cellEl.querySelector("textarea");
      const out     = cellEl.querySelector(".out");
      const btn     = cellEl.querySelector(".btn-run");
      const status  = cellEl.querySelector(".run-status");

      out.textContent = "";
      out.classList.remove("is-error");
      currentOut = out;

      btn.disabled = true;
      status.textContent = "running…";

      try {
        const code = ta.value;
        pyodide.globals.set("_cell_src_", code);
        const wrapped = `
import ast as _ast
_mod = _ast.parse(_cell_src_)
if _mod.body and isinstance(_mod.body[-1], _ast.Expr):
    _last = _mod.body.pop()
    exec(compile(_mod, "<cell>", "exec"), globals())
    _val = eval(compile(_ast.Expression(_last.value), "<cell>", "eval"), globals())
    if _val is not None:
        print(_val)
else:
    exec(compile(_mod, "<cell>", "exec"), globals())
`;
        await pyodide.runPythonAsync(wrapped);
      } catch (e) {
        out.classList.add("is-error");
        const msg = String(e).replace(/File "<exec>",.*\n.*\n/g, "");
        out.textContent += msg;
      } finally {
        pyodide.globals.delete("_cell_src_");
        btn.disabled = false;
        status.textContent = "";
        currentOut = null;
      }
    }

    document.querySelectorAll(".cell").forEach((cell) => {
      cell.querySelector(".btn-run").addEventListener("click", () => runCell(cell));
      cell.querySelector(".btn-clear").addEventListener("click", () => {
        const out = cell.querySelector(".out");
        out.textContent = "";
        out.classList.remove("is-error");
      });

      const ta = cell.querySelector("textarea");
      const shell = document.createElement("div");
      shell.className = "editor-shell";
      const highlight = document.createElement("pre");
      highlight.className = "code-highlight";

      ta.parentNode.insertBefore(shell, ta);
      shell.appendChild(highlight);
      shell.appendChild(ta);
      ta.classList.add("is-syntax-active");

      function paint() {
        highlight.innerHTML = highlightPython(ta.value);
      }

      function autoResize() {
        ta.style.height = "auto";
        ta.style.height = ta.scrollHeight + "px";
      }
      autoResize();
      paint();
      ta.addEventListener("input", () => {
        autoResize();
        paint();
      });

      ta.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const s = ta.selectionStart;
          ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(ta.selectionEnd);
          ta.selectionStart = ta.selectionEnd = s + 4;
          autoResize();
          paint();
        }
      });
    });

    window.addEventListener("gate-removed", () => {
      document.querySelectorAll(".cell textarea").forEach(ta => {
        ta.style.height = "auto";
        ta.style.height = ta.scrollHeight + "px";
      });
    }, { once: true });

    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) setTimeout(() => target.scrollIntoView(), 0);
    }

    const parts = [...document.querySelectorAll("section[id]")];
    if (parts.length) {
      let ticking = false;
      const updateHash = () => {
        const threshold = window.innerHeight * 0.4;
        let current = parts[0];
        for (const s of parts) {
          if (s.getBoundingClientRect().top <= threshold) current = s;
        }
        const newHash = "#" + current.id;
        if (location.hash !== newHash) {
          history.replaceState(null, "", newHash);
          window.dispatchEvent(new CustomEvent("section-change", { detail: { part: current.id } }));
        }
      };
      window.addEventListener("scroll", () => {
        if (!ticking) {
          requestAnimationFrame(() => { updateHash(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });
    }
