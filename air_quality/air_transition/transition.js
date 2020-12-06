(function(){

  var margin = { top: 20, right: 10, bottom: 20, left: 10 }
  var width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var whiteblue = d3.interpolateRgb("white", "white")

  var colorScale25 = d3.scaleLinear().range(['white', '#eee', '#99300A'])
  var colorScale10 = d3.scaleLinear().range(['white','#eee','#0E3354'])

  var legend = d3.select('body')
      .append('div')
      .attr('class','transition-legend')
      // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  legend.append('text')
      .attr('class', 'transition-text')
      .style("text-anchor", "start")
      .style("fill", "black")
      .text('Ωριαίοι Μ.Ο. 14 Ιαν. - 2 Δεκ')

    legend.append('text')
      .attr('class', 'transition-text25')
      .style("text-anchor", "start")
      // .style("fill", "red")
      .text('PM 2.5')
    
    legend.append('text')
      .attr('class', 'transition-text10')
      .style("text-anchor", "start")
      // .style("fill", "red")
      .text('PM 10')
    
  d3.csv('air_data4.csv')
    .then(ready)

  function ready (datapoints) {
    maxPM = d3.max(datapoints, function(d){return +d["pm 2.5 (Plume AQI)"]})
    maxPM10 = d3.max(datapoints, function(d){return +d["pm 10 (Plume AQI)"]})

    colorScale25.domain([0,20,maxPM])
    colorScale10.domain([0,20,maxPM10])

    var n = datapoints.length;

    var trans = d3.select("body").select("div")
      .data(datapoints)
      .enter().append("div")
      .attr('class','trans-divs')
      .transition()
        .delay(function(d, i) { return i + Math.random() * n / 2; })
      .ease(d3.easeCubicIn)
      .on("start", function repeat() {
          d3.active(this)
            .style('background', function(d){return colorScale10(+d["pm 10 (Plume AQI)"])})
          // .transition()
          //   .styleTween("background-color", function() { return whiteblue; })
          //   .duration(200)
          //   .delay(5500)
          .transition()
            .duration(400)
            .delay(8500)
            .style('background', function(d){return colorScale25(+d["pm 2.5 (Plume AQI)"])})
          .transition()
            .duration(400)
            .delay(8500)
            .on("start", repeat)  
      })
         
  }
    
})()
