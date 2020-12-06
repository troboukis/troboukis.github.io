(function(){

  //drawing the area of the map
  var margin = { top: 7, right: 10, bottom: 10, left: 10 }
  var width = 650 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select(".air_graph_force").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
  var strength = .7
  var alphaTarget = .6
  var startingRadius = 3
  var velocityDecay = 0.3
  var forceManyBodyStrength = -5

  d3.csv('air_data4.csv')
    .then(ready)

  var circleRadius = d3.scaleSqrt().range([2, 15])
  var colorScale25 = d3.scaleLinear().range(['green','orange','red'])
  var colorScale10 = d3.scaleLinear().range(['green','orange','red'])
  var xScale = d3.scaleLinear().range([0, 250])

  function ready (datapoints) {
    maxRadius25 = d3.max(datapoints, function(d){return +d["pm 2.5 (Plume AQI)"]})
    maxRadius10 = d3.max(datapoints, function(d){return +d["pm 10 (Plume AQI)"]})

    colorScale25.domain([0,21,maxRadius25])
    colorScale10.domain([0,21,maxRadius10])

    var forceXcombined = d3.forceX(width/2).strength(strength)

    var forceXdangerous = d3.forceX(function(d){
      if (+d["pm 2.5 (Plume AQI)"]>=20){
        return 250
      } else {
      return 400
    }
  }).strength(.7)

    var forceXdangerous10 = d3.forceX(function(d){
      if (+d["pm 10 (Plume AQI)"]>=20){
        return 250
      } else {
      return 400
    }
  }).strength(strength)

    var forceY = d3.forceY(function(d){
      return height/2
    }).strength(strength)

    var forceCollide= d3.forceCollide(startingRadius)


    var simulation = d3.forceSimulation()
      .force('x', forceXcombined)
      .force('y', forceY)
      .force('collide', forceCollide.iterations(0))
      .velocityDecay(velocityDecay)
      .on("tick", ticked)
      .nodes(datapoints)
      .on('tick', ticked)
      .force("charge", d3.forceManyBody().strength(forceManyBodyStrength))
      


    function ticked(){
      svg.selectAll('circle')
        .attr('cx', function(d){return d.x})
        .attr('cy', function(d){return d.y})
    }

    svg.selectAll('circle')
      .data(datapoints)
      .enter().append('circle')
      .attr('class','circles_force')
      .style('fill', 'black')
      .style('fill-opacity',.4)
      .style('stroke','black')
      .style('stroke-width',.5)
      .attr('r', startingRadius)
      
      

    d3.select("#dangerous2_5")
      .on('click', function(){
        simulation
          .force('x', forceXdangerous)
          .alphaTarget(alphaTarget)
          .restart()
          d3.selectAll('.circles_force')
            .transition()
            .duration(200)
              .style("stroke", "black")
              .style("stroke-width", ".3px")

              .attr('r', startingRadius)
              .style('fill', function(d){return colorScale25(+d["pm 2.5 (Plume AQI)"])})
              .style('fill-opacity',1)
              .style('stroke','black')
              .style('stroke-width','.5')
              
      })

    d3.select("#dangerous10")
      .on('click', function(){
        simulation
          .force('x', forceXdangerous10)
          .alphaTarget(alphaTarget)
          .restart()
          d3.selectAll('.circles_force')
            .transition()
              .duration(200)
            .attr('r', startingRadius)
            .style('fill', function(d){return colorScale10(+d["pm 10 (Plume AQI)"])})
            .style('fill-opacity',1)
            .style('stroke','black')
            .style('stroke-width','.5')
      })

    d3.select('#combined')
      .on('click', function(){
        simulation
          .force('x', forceXcombined)
          .alphaTarget(alphaTarget)
          .restart()
          d3.selectAll('.circles_force')
            .transition()
              .duration(200)
              .style('fill', 'black')
              .style('fill-opacity',.4)
              .style('stroke','black')
              .style('stroke-width',.5)
              .attr('r', startingRadius)
      })
    
    var annotation_height = 50
    var y = d3.scaleLinear()
              .range([0,300])
              .domain([1,300])
      
    var annotation = d3.select('.air_graph_force_title')
                      .append('g')
                      .append('svg')
                      .attr('class','annotation')
                      .attr("transform", "translate(" + -20 + "," + margin.top + ")")
                      .attr('height',annotation_height)
                      

    annotation.append('circle')
              .attr('r', 7)
              .attr('cx', '20')
              .attr('cy', annotation_height/2)
              .attr('class','dot')
              .style('fill','#bbb')
              .style('stroke','black')
              
    annotation.append('line')
              .attr('class','line')  
              .attr("transform", "translate(" + -20 + "," + margin.top + ")")
              .attr('width',200)
              .attr('x1', y(30))
              .attr('y1', y(0))
              .attr('x2', 300) 
              .attr('y2', 0)   
              .style("stroke-dasharray", "1,1")

    annotation.append('text')
              .attr('class','annotation_text')
              .text('Μέσος όρος μετρήσεων 1 ώρας.')
              .attr('x',y(annotation_height))
              .attr('y',y(annotation_height/2-1)) 
              .attr('dy', '.51em')  

    annotation.append('line')
          .attr('class','line')  
          .attr("transform", "translate(" + -20 + "," + margin.top + ")")
          // .attr('width',200)
          .attr('x1', y(30)) 
          .attr('y1', y(annotation_height-10))
          .attr('x2', y(300)) 
          .attr('y2', y(annotation_height-10))   
          .style("stroke-dasharray", "1,1")

    
    var legend_values = [0, 20, 100]
    var dict_leg = {0:'Φυσιολογική',
      20:'Αυξημένη',
      100:'Υψηλή'}
    
    var legend = d3.select('.air_graph_force_title')
    .data(legend_values)
    .append("g")
    .append('svg')
    .attr('class', 'legend')
    .attr('height',100)
    .attr("transform", "translate(" + -20 + "," + margin.top + ")")

    legend.selectAll('rect')
        .data(legend_values)
        .enter().append('rect')
        .attr('x',(d,i)=>10 + i*95)
        .attr('y', 19)
        .attr('width', 85)
        .attr('height',10)
        .style('fill', function (d){
          return colorScale25(d)})
    
    legend.append("text")
          // .data(legend_values)
          .attr('class','legend_text')
          .attr('x',(d,i)=>10 + i*95)
          .attr('y', 5)
          .attr("dy", ".5em")
          // .text(function(d,i){
          //   console.log(d)
          //   return d
          // })
          .text('Φυσιολογικά - Μέτρια - Αυξημένα μικροσωματίδια');
    
                
              
  }


})()
