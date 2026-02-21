import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ── Chapter metadata ──────────────────────────────────────────────
const CHAPTERS = {
  "chapter-1":  { parts: 8 },
  "chapter-2":  { exercises: 7 },
  "chapter-3":  { parts: 4 },
  "chapter-4":  { exercises: 5 },
  "chapter-5":  { parts: 4 },
  "chapter-6":  { parts: 4 },
  "chapter-7":  { exercises: 10 },
  "chapter-8":  { parts: 4 },
  "chapter-9":  { parts: 5 },
  "chapter-10": { exercises: 10 },
};

// ── Detect current chapter from URL ──────────────────────────────
const pathFilename = window.location.pathname.split("/").pop();
const chapterMatch = pathFilename.match(/chapter-(\d+)/);
const currentChapter = chapterMatch ? `chapter-${chapterMatch[1]}` : null;
const chapterNum = chapterMatch ? parseInt(chapterMatch[1]) : 0;
const isGated = chapterNum >= 3;

// Hide main immediately for gated chapters (before auth resolves)
if (isGated) {
  const main = document.querySelector("main");
  if (main) main.style.display = "none";
}

const googleProvider = new GoogleAuthProvider();

// ── Inject HTML into page ─────────────────────────────────────────
function injectUI() {
  // Fixed auth widget (top-right)
  const widget = document.createElement("div");
  widget.id = "auth-widget";
  widget.innerHTML = `
    <button id="auth-btn" class="auth-btn">Sign in</button>
    <div id="auth-dropdown" class="auth-dropdown hidden">
      <p id="auth-user-label"></p>
      <button id="auth-logout-btn">Sign out</button>
    </div>
  `;
  document.body.appendChild(widget);

  // Modal
  const modal = document.createElement("div");
  modal.id = "auth-modal";
  modal.className = "auth-modal hidden";
  modal.innerHTML = `
    <div class="auth-modal-box">
      <button id="auth-modal-close" class="auth-modal-close">&#x2715;</button>
      <h2 class="auth-modal-title">Python for All</h2>

      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Sign in</button>
        <button class="auth-tab" data-tab="register">Register</button>
      </div>

      <button id="auth-google-btn" class="auth-google-btn">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <div class="auth-divider"><span>or</span></div>

      <form id="auth-form">
        <div id="auth-name-field" class="auth-field hidden">
          <label for="auth-name">Name</label>
          <input type="text" id="auth-name" placeholder="Your name" autocomplete="name" />
        </div>
        <div class="auth-field">
          <label for="auth-email">Email</label>
          <input type="email" id="auth-email" placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="auth-field">
          <label for="auth-password">Password</label>
          <input type="password" id="auth-password" placeholder="Password" autocomplete="current-password" />
        </div>
        <p id="auth-error" class="auth-error hidden"></p>
        <button type="submit" id="auth-submit-btn" class="auth-submit-btn">Sign in</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

// ── Modal helpers ─────────────────────────────────────────────────
function showModal() { document.getElementById("auth-modal").classList.remove("hidden"); }
function hideModal() { document.getElementById("auth-modal").classList.add("hidden"); clearError(); }

function showError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}
function clearError() {
  const el = document.getElementById("auth-error");
  el.textContent = "";
  el.classList.add("hidden");
}

function setTab(tab) {
  document.querySelectorAll(".auth-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.tab === tab)
  );
  const isRegister = tab === "register";
  document.getElementById("auth-name-field").classList.toggle("hidden", !isRegister);
  document.getElementById("auth-submit-btn").textContent = isRegister ? "Create account" : "Sign in";
  document.getElementById("auth-password").autocomplete = isRegister ? "new-password" : "current-password";
  clearError();
}

function getActiveTab() {
  return document.querySelector(".auth-tab.active").dataset.tab;
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email":        "Invalid email address.",
    "auth/user-not-found":       "No account found with that email.",
    "auth/wrong-password":       "Incorrect password.",
    "auth/invalid-credential":   "Incorrect email or password.",
    "auth/email-already-in-use": "An account already exists with that email.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked":        "Pop-up was blocked. Please allow pop-ups for this site.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

// ── Auth button UI ────────────────────────────────────────────────
function updateAuthButton(user) {
  const btn = document.getElementById("auth-btn");
  if (user) {
    const name = user.displayName || user.email || "?";
    const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    btn.innerHTML = `<span class="auth-initials">${initials}</span>`;
    btn.title = name;
    document.getElementById("auth-user-label").textContent = name;
  } else {
    btn.innerHTML = "Sign in";
    btn.title = "";
  }
}

// ── Firestore helpers ─────────────────────────────────────────────
async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName || "",
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      progress: {},
    });
  } else {
    await updateDoc(ref, { lastSeen: serverTimestamp() });
  }
}

async function loadProgress(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().progress || {}) : {};
}

async function markPartVisited(uid, chapter, part) {
  await updateDoc(doc(db, "users", uid), {
    [`progress.${chapter}.${part}`]: true,
    [`progress.${chapter}.lastPart`]: part,
    lastPosition: { chapter, part, updatedAt: serverTimestamp() },
    lastSeen: serverTimestamp(),
  });
}

async function markExerciseVisited(uid, chapter, exerciseId) {
  await updateDoc(doc(db, "users", uid), {
    [`progress.${chapter}.${exerciseId}`]: true,
    lastSeen: serverTimestamp(),
  });
}

// ── TOC progress badges ───────────────────────────────────────────
function updateTocProgress(progress) {
  document.querySelectorAll("nav a[href]").forEach(link => {
    const match = link.getAttribute("href").match(/chapter-(\d+)/);
    if (!match) return;
    const chId = `chapter-${match[1]}`;
    const chData = CHAPTERS[chId];
    if (!chData) return;

    link.querySelector(".prog-badge")?.remove();

    const chProg = progress[chId] || {};
    let badge = null;

    if (chData.exercises !== undefined) {
      const visited = Object.keys(chProg).filter(k => k !== "visited" && chProg[k] === true).length;
      if (visited > 0) {
        badge = document.createElement("span");
        const done = visited >= chData.exercises;
        badge.className = "prog-badge" + (done ? " prog-badge--done" : "");
        badge.textContent = done ? "✓" : `${visited}/${chData.exercises}`;
      }
    } else {
      const visited = Object.keys(chProg).filter(k => k.startsWith("part") && chProg[k] === true).length;
      if (visited > 0) {
        badge = document.createElement("span");
        const done = visited === chData.parts;
        badge.className = "prog-badge" + (done ? " prog-badge--done" : "");
        badge.textContent = done ? "✓" : `${visited}/${chData.parts}`;
      }
    }

    if (badge) link.appendChild(badge);
  });
}

// ── Chapter gate ──────────────────────────────────────────────────
function showGate() {
  if (document.getElementById("auth-gate")) return;
  const gate = document.createElement("div");
  gate.id = "auth-gate";
  gate.innerHTML = `
    <div class="auth-gate-box">
      <p class="auth-gate-label">Members only</p>
      <h2 class="auth-gate-title">Sign in to continue</h2>
      <p class="auth-gate-desc">Create a free account to access this chapter and track your progress.</p>
      <button id="auth-gate-btn" class="auth-submit-btn" style="max-width:260px;">Sign in / Register</button>
    </div>
  `;
  document.querySelector("nav").after(gate);
  document.getElementById("auth-gate-btn").addEventListener("click", showModal);
}

function removeGate() {
  document.getElementById("auth-gate")?.remove();
  const main = document.querySelector("main");
  if (main) main.style.display = "";
}

// ── Event binding ─────────────────────────────────────────────────
function bindEvents() {
  // Auth button: open modal (logged out) or toggle dropdown (logged in)
  document.getElementById("auth-btn").addEventListener("click", () => {
    if (auth.currentUser) {
      document.getElementById("auth-dropdown").classList.toggle("hidden");
    } else {
      showModal();
    }
  });

  // Close modal
  document.getElementById("auth-modal-close").addEventListener("click", hideModal);
  document.getElementById("auth-modal").addEventListener("click", e => {
    if (e.target.id === "auth-modal") hideModal();
  });

  // Tabs
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab));
  });

  // Google sign-in
  document.getElementById("auth-google-btn").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      hideModal();
    } catch (e) {
      showError(friendlyError(e.code));
    }
  });

  // Email/password form
  document.getElementById("auth-form").addEventListener("submit", async e => {
    e.preventDefault();
    const tab = getActiveTab();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    clearError();
    try {
      if (tab === "register") {
        const name = document.getElementById("auth-name").value.trim();
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      hideModal();
    } catch (e) {
      showError(friendlyError(e.code));
    }
  });

  // Sign out
  document.getElementById("auth-logout-btn").addEventListener("click", async () => {
    await signOut(auth);
    document.getElementById("auth-dropdown").classList.add("hidden");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", e => {
    const widget = document.getElementById("auth-widget");
    if (!widget.contains(e.target)) {
      document.getElementById("auth-dropdown").classList.add("hidden");
    }
  });

  // Track progress when user clicks Run on a code cell
  window.addEventListener("cell-run", e => {
    if (!auth.currentUser || !currentChapter) return;
    const cell = e.detail.cell;
    const chData = CHAPTERS[currentChapter];
    if (!chData) return;

    if (chData.exercises !== undefined) {
      const exercise = cell.closest(".exercise[id]");
      if (!exercise) return;
      markExerciseVisited(auth.currentUser.uid, currentChapter, exercise.id).catch(() => {});
    } else if (chData.parts > 0) {
      const section = cell.closest("section[id^='part']");
      if (!section) return;
      markPartVisited(auth.currentUser.uid, currentChapter, section.id).catch(() => {});
    }
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────
injectUI();
bindEvents();

onAuthStateChanged(auth, async user => {
  updateAuthButton(user);

  if (user) {
    removeGate();
    await ensureUserDoc(user);

    const progress = await loadProgress(user.uid);
    updateTocProgress(progress);
  } else {
    document.querySelectorAll(".prog-badge").forEach(b => b.remove());
    if (isGated) showGate();
  }
});
