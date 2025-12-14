(function () {

  var margin = { top: 20, right: 10, bottom: 20, left: 10 };
  var width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var whiteblue = d3.interpolateRgb("white", "white");

  var colorScale25 = d3.scaleLinear().range(["white", "#eee", "#99300A"]);
  var colorScale10 = d3.scaleLinear().range(["white", "#eee", "#0E3354"]);

  // Use a dedicated stage
  var root = d3.select("#viz");

  // Legend goes into the stage, not body
  var legend = root.append("div")
    .attr("class", "transition-legend");

  legend.append("div")
    .attr("class", "transition-text")
    .style("text-anchor", "start")
    .style("fill", "black")
    .text("Ωριαίοι Μ.Ο. 14 Ιαν. - 2 Δεκ");

  legend.append("div")
    .attr("class", "transition-text25")
    .style("text-anchor", "start")
    .text("PM 2.5");

  legend.append("div")
    .attr("class", "transition-text10")
    .style("text-anchor", "start")
    .text("PM 10");

  d3.csv("air_data4.csv").then(ready);

  function ready(datapoints) {
    var maxPM = d3.max(datapoints, function (d) { return +d["pm 2.5 (Plume AQI)"]; });
    var maxPM10 = d3.max(datapoints, function (d) { return +d["pm 10 (Plume AQI)"]; });

    colorScale25.domain([0, 20, maxPM]);
    colorScale10.domain([0, 20, maxPM10]);

    var n = datapoints.length;

    // Create a dedicated grid container (NOT the legend div)
    var grid = root.append("div").attr("class", "trans-grid");

    grid.selectAll("div")
      .data(datapoints)
      .enter()
      .append("div")
      .attr("class", "trans-divs")
      .transition()
      .delay(function (d, i) { return i + Math.random() * n / 2; })
      .ease(d3.easeCubicIn)
      .on("start", function repeat() {
        d3.active(this)
          .style("background", function (d) { return colorScale10(+d["pm 10 (Plume AQI)"]); })
          .transition()
          .duration(400)
          .delay(8500)
          .style("background", function (d) { return colorScale25(+d["pm 2.5 (Plume AQI)"]); })
          .transition()
          .duration(400)
          .delay(8500)
          .on("start", repeat);
      });
  }

})();
