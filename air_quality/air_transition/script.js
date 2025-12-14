(() => {
  const viz = document.getElementById("viz");
  const canvas = document.getElementById("grid");
  const ctx = canvas.getContext("2d", { alpha: false });

  const GAP = 1;
  const TARGET_CELL = 13;
  const LEGEND_SPACE = 46;

  const HOLD = 8500; // hold time (ms)
  const DUR  = 400;  // transition duration (ms)

  // Controls how fast the wave moves top-down.
  // 1ms per cell = ~6.9s until the last cell starts (for 6901 cells).
  const STEP = 1;

  const color25 = d3.scaleLinear().range(["#ffffff", "#eeeeee", "#99300A"]);
  const color10 = d3.scaleLinear().range(["#ffffff", "#eeeeee", "#0E3354"]);

  let data = [];
  let cols = 0;
  let rows = 0;
  let cell = TARGET_CELL;

  let pm25rgb, pm10rgb;
  let delays;

  function hexToInt(hex) { return parseInt(hex.slice(1), 16); }

  function lerpInt(a, b, t){
    const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
    const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
    const rr = (ar + (br - ar) * t) | 0;
    const rg = (ag + (bg - ag) * t) | 0;
    const rb = (ab + (bb - ab) * t) | 0;
    return (rr << 16) | (rg << 8) | rb;
  }

  function setFillFromInt(rgb){
    const r = (rgb >> 16) & 255, g = (rgb >> 8) & 255, b = rgb & 255;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
  }

  function resize(){
  // Available width inside the viz container
  const wCss = Math.max(240, viz.clientWidth - 20);

  // Available height in the viewport from the top of the viz to bottom of screen
  const top = viz.getBoundingClientRect().top;
  const hAvail = Math.max(220, window.innerHeight - top - 12);

  // Find the largest cell size that fits the full grid (no vertical scroll)
  const N = data.length;
  let best = null;

  for (let s = TARGET_CELL; s >= 2; s--){
    const c = Math.max(1, Math.floor((wCss + GAP) / (s + GAP)));
    const r = Math.ceil(N / c);
    const hPx = LEGEND_SPACE + (r * (s + GAP) - GAP);

    if (hPx <= hAvail){
      best = { cell: s, cols: c, rows: r };
      break; // largest s that fits
    }
  }

  // Fallback if nothing fits (very small screens)
  if (!best){
    const s = 2;
    const c = Math.max(1, Math.floor((wCss + GAP) / (s + GAP)));
    best = { cell: s, cols: c, rows: Math.ceil(N / c) };
  }

  cell = best.cell;
  cols = best.cols;
  rows = best.rows;

  // Canvas pixel dimensions (internal resolution)
  const wPx = cols * (cell + GAP) - GAP;
  const hPx = LEGEND_SPACE + (rows * (cell + GAP) - GAP);

  canvas.width = wPx;
  canvas.height = hPx;

  // Responsive CSS sizing (no scroll; height matches content)
  canvas.style.width = "100%";
  canvas.style.height = "auto";
}

  function precompute(){
    const max25 = d3.max(data, d => d.pm25);
    const max10 = d3.max(data, d => d.pm10);

    color25.domain([0, 20, max25]);
    color10.domain([0, 20, max10]);

    pm25rgb = new Uint32Array(data.length);
    pm10rgb = new Uint32Array(data.length);
    delays  = new Float32Array(data.length);

    const n = data.length;
    for (let i = 0; i < n; i++){
      pm25rgb[i] = hexToInt(d3.color(color25(data[i].pm25)).formatHex());
      pm10rgb[i] = hexToInt(d3.color(color10(data[i].pm10)).formatHex());

      // Deterministic, top-down (row-major) start: first cell starts first, then next, etc.
      delays[i] = i * STEP;
    }
  }

  function cellColorAt(i, now){
    const t = now - delays[i];
    if (t < 0) return 0xFFFFFF;

    const period = HOLD + DUR + HOLD + DUR;
    const p = t % period;

    if (p < HOLD) return pm10rgb[i];

    if (p < HOLD + DUR) {
      const u = (p - HOLD) / DUR;
      return lerpInt(pm10rgb[i], pm25rgb[i], u);
    }

    if (p < HOLD + DUR + HOLD) return pm25rgb[i];

    const u = (p - (HOLD + DUR + HOLD)) / DUR;
    return lerpInt(pm25rgb[i], pm10rgb[i], u);
  }

  function draw(now){
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const y0 = LEGEND_SPACE;
    let idx = 0;

    for (let r = 0; r < rows; r++){
      const y = y0 + r * (cell + GAP);
      for (let c = 0; c < cols; c++){
        if (idx >= data.length) break;

        const x = c * (cell + GAP);
        const rgb = cellColorAt(idx, now);

        setFillFromInt(rgb);
        ctx.fillRect(x, y, cell, cell);

        idx++;
      }
    }

    requestAnimationFrame(draw);
  }

  async function load(){
    const rows = await d3.json("air_data4.min.json");
    data = rows.map(d => ({ pm25: +d.pm25, pm10: +d.pm10 }));

    precompute();
    resize();
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    clearTimeout(window.__aq_resize);
    window.__aq_resize = setTimeout(resize, 120);
  });

  load().catch(console.error);
})();
