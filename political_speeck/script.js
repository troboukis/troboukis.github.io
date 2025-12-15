(() => {
  const btn = document.getElementById("btn");
  const stopBtn = document.getElementById("stop");
  const statusEl = document.getElementById("status");
  const svgObj = document.getElementById("svgObj");

  let mouth, eyes;
  let running = false;
  let raf = null;
  let t0 = 0;

  // Pivots in SVG coordinates (based on your bboxes)
  const MOUTH_PIVOT = { x: 563, y: 935 };
  const EYES_PIVOT  = { x: 560, y: 535 };

  function setStatus(s) { statusEl.textContent = s; }

  function transformAround(el, pivot, transformStr) {
    el.setAttribute(
      "transform",
      `translate(${pivot.x} ${pivot.y}) ${transformStr} translate(${-pivot.x} ${-pivot.y})`
    );
  }

  function tick(now) {
    if (!running) return;
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;

    // Mouth open/close
    const open = 1 + 0.35 * Math.max(0, Math.sin(t * 10)); // 1..1.35
    const mx = (Math.random() * 2 - 1) * 0.6;
    transformAround(mouth, MOUTH_PIVOT, `translate(${mx} 0) scale(1 ${open})`);

    // Eyes micro movement
    const ex = (Math.random() * 2 - 1) * 1.2;
    const ey = (Math.random() * 2 - 1) * 0.7;
    transformAround(eyes, EYES_PIVOT, `translate(${ex} ${ey})`);

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!mouth || !eyes) {
      console.error("Missing #mouth or #eyes inside portrait.svg");
      setStatus("Missing SVG groups");
      return;
    }
    if (running) return;

    running = true;
    btn.disabled = true;
    stopBtn.disabled = false;
    setStatus("Animating…");
    t0 = 0;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    btn.disabled = false;
    stopBtn.disabled = true;
    setStatus("Idle");

    if (raf) cancelAnimationFrame(raf);
    raf = null;

    mouth?.removeAttribute("transform");
    eyes?.removeAttribute("transform");
  }

  // IMPORTANT: wait until the SVG is loaded
  svgObj.addEventListener("load", () => {
    const doc = svgObj.contentDocument;
    if (!doc) {
      setStatus("SVG not accessible");
      btn.disabled = true;
      return;
    }

    mouth = doc.getElementById("mouth");
    eyes  = doc.getElementById("eyes");

    if (!mouth || !eyes) {
      setStatus("SVG groups not found");
      btn.disabled = true;
      console.error("Ensure portrait.svg contains <g id='mouth'> and <g id='eyes'>");
      return;
    }

    setStatus("Idle");
  });

  btn.addEventListener("click", start);
  stopBtn.addEventListener("click", stop);
})();
