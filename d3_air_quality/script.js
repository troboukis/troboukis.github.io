(function () {
  // Coordinate system (kept from your original)
  var margin = { top: 20, right: 10, bottom: 20, left: 10 };
  var W0 = 970 - margin.left - margin.right;
  var H0 = 550 - margin.top - margin.bottom;

  // Blob size tuning
  var startingRadius = 2.8;
  var collidePad = 0.8;

  // Split threshold (mid-point in your scales)
  var threshold = 20;

  var colorScale25 = d3.scaleLinear().range(["green", "orange", "red"]);
  var colorScale10 = d3.scaleLinear().range(["green", "orange", "red"]);

  var f = d3.format(".1f");

  var root = d3.select("#air_graph");
  if (root.empty()) return;

  // Responsive SVG via viewBox; simulation runs in W0×H0 space
  var svg = root.append("svg")
    .attr(
      "viewBox",
      "0 0 " + (W0 + margin.left + margin.right) + " " + (H0 + margin.top + margin.bottom)
    )
    .attr("preserveAspectRatio", "xMidYMid meet");

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

  function showTooltip(event, d) {
    tooltip
      .style("opacity", 1)
      .style("left", (event.pageX + 12) + "px")
      .style("top", (event.pageY) + "px")
      .html(
        "<i>" + (d.date || "") + "</i><br>" +
        "PM 2.5: " + f(+d.pm25) + " (ug/m3)<br>" +
        "PM 10: " + f(+d.pm10) + " (ug/m3)"
      );
  }

  function hideTooltip() {
    tooltip.style("opacity", 0);
  }

  function setActiveButton(id) {
    d3.selectAll(".controls button").classed("active", false);
    d3.select(id).classed("active", true);
  }

  var nodes = [];
  var circles;
  var simulation;
  var mode = "combined"; // "combined" | "pm25" | "pm10"

  // Force targets
  function xTarget(d) {
    var cx = W0 * 0.5;

    if (mode === "combined") return cx;

    // symmetric around center for mobile centering
    var left = W0 * 0.32;
    var right = W0 * 0.68;

    if (mode === "pm25") return (d.pm25 > threshold) ? left : right;
    if (mode === "pm10") return (d.pm10 > threshold) ? left : right;

    return cx;
  }

  function yTarget() {
    return H0 * 0.5;
  }

  function fillColor(d) {
    if (mode === "combined") return "#9e9e9e";
    if (mode === "pm25") return colorScale25(d.pm25);
    return colorScale10(d.pm10);
  }

  // Run briefly, then stop (performance)
  function settleAndStop(ms) {
    simulation.alpha(1).restart();
    setTimeout(function () { simulation.stop(); }, ms);
  }

  function applyMode(nextMode) {
    mode = nextMode;

    circles
      .transition()
      .duration(350)
      .style("fill", fillColor)
      .style("stroke", "#333")
      .style("stroke-width", "0.4px");

    // Reconfigure forces; then settle briefly and stop
    simulation
      .force("x", d3.forceX(xTarget).strength(0.14))
      .force("y", d3.forceY(yTarget).strength(0.14))
      .force("collide", d3.forceCollide(function () { return startingRadius + collidePad; }).iterations(1));

    settleAndStop(1200);
  }

  // Load precomputed JSON (faster than CSV)
  d3.json("air_data4.min.json").then(function (rows) {
    nodes = rows.map(function (r) {
      return {
        date: r.date,
        pm25: +r.pm25,
        pm10: +r.pm10,
        x: +r.x,
        y: +r.y
      };
    });

    var max25 = d3.max(nodes, function (d) { return d.pm25; });
    var max10 = d3.max(nodes, function (d) { return d.pm10; });

    colorScale25.domain([0, threshold, max25]);
    colorScale10.domain([0, threshold, max10]);

    circles = g.selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", startingRadius)
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .style("fill", "#9e9e9e")
      .style("stroke", "#333")
      .style("stroke-width", "0.4px")
      .on("mouseover", function (event, d) {
        d3.select(this).raise().style("stroke-width", "1.2px");

        var bg = (mode === "pm10") ? colorScale10(d.pm10) : colorScale25(d.pm25);
        tooltip.style("background", bg);

        showTooltip(event, d);
      })
      .on("mousemove", function (event, d) {
        showTooltip(event, d);
      })
      .on("mouseout", function () {
        d3.select(this).style("stroke-width", "0.4px");
        hideTooltip();
      });

    simulation = d3.forceSimulation(nodes)
      .force("x", d3.forceX(xTarget).strength(0.14))
      .force("y", d3.forceY(yTarget).strength(0.14))
      .force("collide", d3.forceCollide(function () { return startingRadius + collidePad; }).iterations(1))
      .alphaDecay(0.12)
      .on("tick", function () {
        // Clamp to bounds to reduce drift and collision work
        circles
          .attr("cx", function (d) { return d.x = Math.max(0, Math.min(W0, d.x)); })
          .attr("cy", function (d) { return d.y = Math.max(0, Math.min(H0, d.y)); });
      });

    // Buttons
    d3.select("#combined").on("click", function () {
      setActiveButton("#combined");
      applyMode("combined");
    });

    d3.select("#dangerous2_5").on("click", function () {
      setActiveButton("#dangerous2_5");
      applyMode("pm25");
    });

    d3.select("#dangerous10").on("click", function () {
      setActiveButton("#dangerous10");
      applyMode("pm10");
    });

    // Default on load: "All hourly measurements" selected
    setActiveButton("#combined");
    applyMode("combined"); // will also settle and stop
  });

})();
