(function(){

  //drawing the area of the map
  var margin = { top: 20, right: 10, bottom: 20, left: 10 }
  var width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#air_graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


  d3.csv('air_data4.csv')
    .then(ready)

  var circleRadius = d3.scaleSqrt().range([2, 15])
  var colorScale = d3.scaleLinear().range(['green','orange','red'])



  function getRandom(min, max) {
    return Math.random() * (max - min) + min}

  function ready (datapoints) {
    console.log(datapoints)
    maxRadius = d3.max(datapoints, function(d){return +d["pm 2.5 (ug/m3)"]})
    circleRadius.domain([0, maxRadius])
    colorScale.domain([0,10,maxRadius])

    var forceXcombined = d3.forceX(width/2).strength(.5)

    var forceXdangerous = d3.forceX(function(d){
      if (+d["pm 2.5 (ug/m3)"]>=10){
        return 250
      } else {
      return 600
    }
    }).strength(.5)

    var forceY = d3.forceY(function(d){
      return height/2
    }).strength(.5)

    var forceCollide= d3.forceCollide(function(d){
      return circleRadius(+d["pm 2.5 (ug/m3)"]) + 1
    })


    var simulation = d3.forceSimulation()
      .force('x', forceXcombined)
      .force('y', forceY)
      .force('collide', forceCollide)



    svg.selectAll('circle')
      .data(datapoints)
      .enter().append('circle')
      // .attr('cx', function(d){return getRandom(.1, width)})
      // .attr('cy', function(d){return getRandom(.1, height)})
      .style('fill', function(d){return colorScale(+d["pm 2.5 (ug/m3)"])})
      .attr('r',1)
      .transition()
      .delay(0)
      .attr('r', function(d){return circleRadius(+d["pm 2.5 (ug/m3)"])})






    d3.select("#dangerous")
      .on('click', function(){
        simulation
          .force('x', forceXdangerous)
          .alphaTarget(0.03)
          .restart()
      })
    d3.select('#combined')
      .on('click', function(){
        simulation
          .force('x', forceXcombined)
          .alphaTarget(0.03)
          .restart()

      })











    simulation.nodes(datapoints)
      .on('tick', ticked)

    function ticked(){
      svg.selectAll('circle')
        .attr('cx', function(d){return d.x})
        .attr('cy', function(d){return d.y})
    }

  }



})()
