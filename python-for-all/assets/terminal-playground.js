const DEFAULT_STATE = {
  cwd: "/Users/student",
  tree: {
    Users: {
      student: {
        Desktop: {},
        Downloads: {},
        Files: {
          data_journalism: {
            "notes.txt": "directory\npath\ncommand\nargument\nflag\n",
            "cities.csv": "city,country\nAthens,Greece\nParis,France\nAthens,Greece\n",
          },
        },
      },
    },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function splitPath(path) {
  return path.split("/").filter(Boolean);
}

function normalize(parts) {
  const out = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out;
}

function resolvePath(cwd, target) {
  if (!target || target === "~") return "/Users/student";
  if (target.startsWith("/")) return "/" + normalize(splitPath(target)).join("/");
  return "/" + normalize([...splitPath(cwd), ...splitPath(target)]).join("/");
}

function getNode(tree, absPath) {
  if (absPath === "/") return tree;
  const parts = splitPath(absPath);
  let node = tree;
  for (const part of parts) {
    if (!node || typeof node !== "object" || !(part in node)) return null;
    node = node[part];
  }
  return node;
}

function parentAndName(absPath) {
  const parts = splitPath(absPath);
  const name = parts.pop();
  const parentPath = "/" + parts.join("/");
  return { parentPath: parentPath || "/", name };
}

function listDir(node, longFormat) {
  const names = Object.keys(node).sort((a, b) => a.localeCompare(b));
  if (!longFormat) return names.join("  ");
  return names
    .map((n) => {
      const entry = node[n];
      const type = typeof entry === "object" ? "d" : "-";
      const size = typeof entry === "object" ? 4096 : String(entry).length;
      return `${type}rw-r--r--  1 student staff ${String(size).padStart(5)} ${n}`;
    })
    .join("\n");
}

function stripQuotes(text) {
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }
  return text;
}

function basename(path) {
  const parts = splitPath(path);
  return parts[parts.length - 1] || "";
}

function cloneNode(node) {
  return typeof node === "object" ? clone(node) : String(node);
}

function isDir(node) {
  return !!node && typeof node === "object";
}

function readFile(state, p) {
  const abs = resolvePath(state.cwd, p);
  const node = getNode(state.tree, abs);
  if (node === null || typeof node === "object") return null;
  return String(node);
}

function writeFile(state, p, content) {
  const abs = resolvePath(state.cwd, p);
  const { parentPath, name } = parentAndName(abs);
  const parent = getNode(state.tree, parentPath);
  if (!parent || typeof parent !== "object") return false;
  if (typeof parent[name] === "object") return false;
  parent[name] = String(content);
  return true;
}

function parseHeadTailArgs(args) {
  if (!args.length) return { n: 10, file: null };
  if (args[0] === "-n") {
    const n = Number(args[1]);
    return { n: Number.isFinite(n) ? n : NaN, file: args[2] || null };
  }
  return { n: 10, file: args[0] };
}

function execute(state, rawInput) {
  const input = rawInput.trim();
  if (!input) return "";

  const echoWrite = input.match(/^echo\s+(.+)\s*>\s*(\S+)$/);
  if (echoWrite) {
    const content = stripQuotes(echoWrite[1].trim());
    const ok = writeFile(state, echoWrite[2], content + "\n");
    return ok ? "" : `echo: cannot write to '${echoWrite[2]}'`;
  }

  const [cmd, ...args] = input.split(/\s+/);

  if (cmd === "help") {
    return "Commands: help, pwd, ls, cd, cat, more, mkdir, rmdir, touch, mv, cp, rm, wc, head, tail, grep, sort, uniq, curl, wget, echo, whoami, clear";
  }

  if (cmd === "pwd") return state.cwd;
  if (cmd === "whoami") return "student";

  if (cmd === "ls") {
    const hasLong = args.includes("-lah") || args.includes("-la") || args.includes("-l");
    const pathArg = args.find((a) => !a.startsWith("-")) || ".";
    const target = resolvePath(state.cwd, pathArg);
    const node = getNode(state.tree, target);
    if (!node || typeof node !== "object") return `ls: cannot access '${pathArg}'`;
    return listDir(node, hasLong);
  }

  if (cmd === "cd") {
    const target = resolvePath(state.cwd, args[0] || "~");
    const node = getNode(state.tree, target);
    if (!isDir(node)) return `cd: no such directory: ${args[0] || "~"}`;
    state.cwd = target || "/";
    return "";
  }

  if (cmd === "cat" || cmd === "more") {
    if (!args[0]) return `${cmd}: missing file name`;
    const content = readFile(state, args[0]);
    if (content === null) return `${cmd}: ${args[0]}: no such file`;
    return content;
  }

  if (cmd === "mkdir") {
    if (!args[0]) return "mkdir: missing directory name";
    const target = resolvePath(state.cwd, args[0]);
    const { parentPath, name } = parentAndName(target);
    const parent = getNode(state.tree, parentPath);
    if (!isDir(parent)) return `mkdir: cannot create directory '${args[0]}'`;
    if (name in parent) return `mkdir: cannot create directory '${args[0]}': File exists`;
    parent[name] = {};
    return "";
  }

  if (cmd === "rmdir") {
    if (!args[0]) return "rmdir: missing directory name";
    const target = resolvePath(state.cwd, args[0]);
    const node = getNode(state.tree, target);
    if (!isDir(node)) return `rmdir: failed to remove '${args[0]}': Not a directory`;
    if (Object.keys(node).length) return `rmdir: failed to remove '${args[0]}': Directory not empty`;
    const { parentPath, name } = parentAndName(target);
    const parent = getNode(state.tree, parentPath);
    if (!isDir(parent) || !(name in parent)) return `rmdir: failed to remove '${args[0]}'`;
    delete parent[name];
    return "";
  }

  if (cmd === "touch") {
    if (!args[0]) return "touch: missing file name";
    const target = resolvePath(state.cwd, args[0]);
    const { parentPath, name } = parentAndName(target);
    const parent = getNode(state.tree, parentPath);
    if (!isDir(parent)) return `touch: cannot touch '${args[0]}'`;
    if (!(name in parent)) parent[name] = "";
    if (isDir(parent[name])) return `touch: '${args[0]}' is a directory`;
    return "";
  }

  if (cmd === "mv" || cmd === "cp") {
    if (args.length < 2) return `${cmd}: missing source or destination`;
    const src = resolvePath(state.cwd, args[0]);
    const srcNode = getNode(state.tree, src);
    if (srcNode === null) return `${cmd}: cannot stat '${args[0]}'`;
    const dstRaw = resolvePath(state.cwd, args[1]);
    const dstNode = getNode(state.tree, dstRaw);
    let finalDst = dstRaw;
    if (isDir(dstNode)) finalDst = `${dstRaw}/${basename(src)}`;

    const { parentPath: dstParentPath, name: dstName } = parentAndName(finalDst);
    const dstParent = getNode(state.tree, dstParentPath);
    if (!isDir(dstParent)) return `${cmd}: cannot move to '${args[1]}'`;

    dstParent[dstName] = cloneNode(srcNode);

    if (cmd === "mv") {
      const { parentPath: srcParentPath, name: srcName } = parentAndName(src);
      const srcParent = getNode(state.tree, srcParentPath);
      if (!isDir(srcParent) || !(srcName in srcParent)) return "";
      delete srcParent[srcName];
    }
    return "";
  }

  if (cmd === "rm") {
    if (!args[0]) return "rm: missing file operand";
    const target = resolvePath(state.cwd, args[0]);
    const node = getNode(state.tree, target);
    if (node === null) return `rm: cannot remove '${args[0]}': No such file`;
    if (isDir(node)) return `rm: cannot remove '${args[0]}': Is a directory`;
    const { parentPath, name } = parentAndName(target);
    const parent = getNode(state.tree, parentPath);
    if (!isDir(parent) || !(name in parent)) return `rm: cannot remove '${args[0]}'`;
    delete parent[name];
    return "";
  }

  if (cmd === "wc") {
    if (!args[0]) return "wc: missing file operand";
    const lineOnly = args[0] === "-l";
    const file = lineOnly ? args[1] : args[0];
    if (!file) return "wc: missing file operand";
    const content = readFile(state, file);
    if (content === null) return `wc: ${file}: No such file`;
    const lines = content === "" ? 0 : content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    if (lineOnly) return `${lines} ${file}`;
    return `${lines} ${words} ${chars} ${file}`;
  }

  if (cmd === "head" || cmd === "tail") {
    const { n, file } = parseHeadTailArgs(args);
    if (!file) return `${cmd}: missing file operand`;
    if (!Number.isFinite(n) || n < 0) return `${cmd}: invalid number of lines`;
    const content = readFile(state, file);
    if (content === null) return `${cmd}: cannot open '${file}'`;
    const lines = content.split("\n");
    if (lines.length && lines[lines.length - 1] === "") lines.pop();
    const out = cmd === "head" ? lines.slice(0, n) : lines.slice(Math.max(0, lines.length - n));
    return out.join("\n");
  }

  if (cmd === "grep") {
    if (args.length < 2) return "grep: usage: grep [text] [filename]";
    const needle = stripQuotes(args[0]);
    const content = readFile(state, args[1]);
    if (content === null) return `grep: ${args[1]}: No such file`;
    return content
      .split("\n")
      .filter((line) => line.includes(needle))
      .join("\n");
  }

  if (cmd === "sort" || cmd === "uniq") {
    if (!args[0]) return `${cmd}: missing file operand`;
    const content = readFile(state, args[0]);
    if (content === null) return `${cmd}: ${args[0]}: No such file`;
    const lines = content.split("\n").filter((l) => l !== "");
    if (cmd === "sort") return lines.sort((a, b) => a.localeCompare(b)).join("\n");
    const out = [];
    for (const line of lines) {
      if (!out.length || out[out.length - 1] !== line) out.push(line);
    }
    return out.join("\n");
  }

  if (cmd === "curl" || cmd === "wget") {
    if (!args[0]) return `${cmd}: missing url`;
    if (cmd === "curl" && args[0] === "-O" && args[1]) {
      const url = args[1];
      const file = basename(url) || "downloaded.txt";
      const ok = writeFile(state, file, `Downloaded from ${url}\n`);
      return ok ? "" : `${cmd}: failed to save '${file}'`;
    }
    if (cmd === "wget") {
      const url = args[0];
      const file = basename(url) || "downloaded.txt";
      const ok = writeFile(state, file, `Downloaded from ${url}\n`);
      return ok ? `Saved '${file}'` : `${cmd}: failed to save '${file}'`;
    }
    return "curl: (sandbox) streaming disabled. Use: curl -O [url]";
  }

  if (cmd === "clear") return "__CLEAR__";

  return `${cmd}: command not found`;
}

function renderPrompt(cwd) {
  return `student@terminal:${cwd}$`;
}

function append(screen, line) {
  if (!line) return;
  screen.textContent += (screen.textContent ? "\n" : "") + line;
  screen.scrollTop = screen.scrollHeight;
}

document.querySelectorAll(".terminal-cell").forEach((cell) => {
  const input = cell.querySelector(".terminal-input");
  const screen = cell.querySelector(".terminal-screen");
  const runBtn = cell.querySelector(".btn-run");
  const clearBtn = cell.querySelector(".btn-clear");
  const resetBtn = cell.querySelector(".btn-reset");
  const status = cell.querySelector(".run-status");
  const intro = cell.dataset.intro || "Type 'help' to see available commands.";
  const seed = cell.querySelector(".terminal-seed");
  const state = clone(DEFAULT_STATE);

  function applySeed() {
    if (!seed || !seed.textContent.trim()) return;
    try {
      const extra = JSON.parse(seed.textContent);
      if (extra.cwd) state.cwd = extra.cwd;
      if (extra.tree && typeof extra.tree === "object") state.tree = extra.tree;
    } catch (_) {}
  }

  function setStatus(text) {
    status.textContent = text;
    if (text) {
      setTimeout(() => {
        if (status.textContent === text) status.textContent = "";
      }, 900);
    }
  }

  function resetTerminal() {
    const fresh = clone(DEFAULT_STATE);
    state.cwd = fresh.cwd;
    state.tree = fresh.tree;
    applySeed();
    screen.textContent = intro;
    input.value = "";
    setStatus("reset");
  }

  function runCommand() {
    const cmd = input.value.trim();
    append(screen, `${renderPrompt(state.cwd)} ${cmd}`);
    const result = execute(state, cmd);
    if (result === "__CLEAR__") {
      screen.textContent = "";
    } else {
      append(screen, result);
    }
    input.value = "";
    setStatus("ran");
  }

  runBtn.addEventListener("click", runCommand);
  clearBtn.addEventListener("click", () => {
    screen.textContent = "";
    setStatus("cleared");
  });
  if (resetBtn) resetBtn.addEventListener("click", resetTerminal);
  input.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runCommand();
    }
  });

  resetTerminal();
});
