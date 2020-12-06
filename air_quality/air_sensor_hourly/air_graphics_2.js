(function(){

  //drawing the area of the map
  var margin = { top: 20, right: 10, bottom: 20, left: 10 }
  var width = 970 - margin.left - margin.right,
      height = 550 - margin.top - margin.bottom;

  var svg = d3.select("#air_graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // var side = svg.append('text')
  //               .attr('class','side')
  //               .attr("x", (margin.right-margin.left))
  //               .attr("y", margin.top)
  //               .attr("text-anchor", "left")
  //               .text('sss')
  // var svg_side = d3.xml("test_svg_illustrator.svg")
  //   .then(data => {
  //     d3.select("#svg-container").nodes().forEach(n => {
  //       n.append(data.documentElement.cloneNode(true))
  //   })
  //   })


  var div = d3.select("body").append("div")
     .attr("class", "tooltip")
     .style("opacity", 0);

  d3.csv('air_data4.csv')
    .then(ready)

  var circleRadius25 = d3.scaleSqrt().range([1.5, 15])
  var circleRadius10 = d3.scaleSqrt().range([1.5, 15])

  var colorScale25 = d3.scaleLinear().range(['green','orange','red'])
  var colorScale10 = d3.scaleLinear().range(['green','orange','red'])


  var startingRadius = 2
  var f = d3.format(".1f");

  function getRandom(min, max) {
    return Math.random() * (max - min) + min}

  function ready(datapoints){
    maxRadius25 = d3.max(datapoints, function(d){return +d["pm 2.5 (Plume AQI)"]})
    maxRadius10 = d3.max(datapoints, function(d){return +d["pm 10 (Plume AQI)"]})

    circleRadius25.domain([0, maxRadius25])
    circleRadius10.domain([0, maxRadius10])

    colorScale25.domain([0,20,maxRadius25])
    colorScale10.domain([0,20,maxRadius10])

    svg.selectAll('circle')
      .data(datapoints)
      .enter().append('circle')
      .attr('class','static_cirles')
      .attr('cx', function(d){return getRandom(.1, width)})
      .attr('cy', function(d){return getRandom(.1, height)})
      // .style('fill', function(d){return colorScale(+d["pm 2.5 (Plume AQI)"])})
      .attr('r',startingRadius)

      .on('mouseover', function(d,i){
        var enterX =  d.pageX
        var enterY =  d.pageY
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "black")
          .style("stroke-width", "2.5px");
          // .attr('r', startingRadius + 2)


        div.transition()
              .duration(200)
              .style("opacity", 1);

        div.html( "<i>" +i["date"] + "</i>" + "<br>"
                  +"PM 2.5: " +f(i["pm 2.5 (Plume AQI)"])+" (ug/m3)"+"<br>"
                  + "PM 10 :" + f(i["pm 10 (Plume AQI)"]) +" (ug/m3)"
      )
              .style("left", (enterX) + 12 + "px")
              .style("top", (enterY) + "px")
              .style('background', function(d){return colorScale25(+i["pm 2.5 (Plume AQI)"])});
      })

      .on('mouseout', function(d, i) {
      // return the mouseover'd element
      // to being smaller and black
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "black")
          .style("stroke-width", ".3px");

        div.transition()
              .duration(200)
              .style("opacity", 0);
        })

        // SETTING UP THE BUTTONS

      d3.select('#reset')
        .on('click', function(){
            d3.selectAll('.static_cirles')
              .transition()
              .delay(500)
            	.duration(2000)
            	.ease(d3.easeBounce)
              .attr('cx', function(d){return getRandom(.1, width)})
              .attr('cy', function(d){return getRandom(.1, height)})
              // .style('fill', function(d){return colorScale(+d["pm 2.5 (Plume AQI)"])})
              .attr('r',startingRadius)
              .style('fill','black')
        })

      d3.select('#pm2_5')
        .on('click', function(){
            d3.selectAll('.static_cirles')
              .transition()
              .duration(400)
              .delay(500)
            	.duration(1000)
            	.ease(d3.easeBounce)
              .style("stroke", "black")
              .style("stroke-width", ".3px")

              .attr('r', function(d){
                return circleRadius25(d["pm 2.5 (Plume AQI)"])
              })
              .style('fill', function(d){return colorScale25(+d["pm 2.5 (Plume AQI)"])})

        })

      d3.select('#pm10')
        .on('click', function(){
            d3.selectAll('.static_cirles')
              .transition()
              .duration(400)
              .delay(500)
            	.duration(1000)
              .ease(d3.easeBounce)
              .style("stroke", "black")
              .style("stroke-width", ".3px")
              .attr('r', function(d){
                return circleRadius10(d["pm 10 (Plume AQI)"])
              })
              .style('fill', function(d){return colorScale10(+d["pm 10 (Plume AQI)"])})
        })


  }




  })()
