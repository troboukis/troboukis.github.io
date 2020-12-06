(function (){
  var margin = { top: 20, right: 150, bottom: 30, left: 30 }
  var width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var svg = d3.select("#line_chart_week")
              .append('svg')
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
  var xScale = d3.scaleLinear().range([0, width])
  var yScale = d3.scaleLinear().range([height, 0])
  
  var line = d3.line()
                .x(d => xScale(+d.week))
                .y(d => yScale(+d['AQI']))   

  d3.csv('air_data_grouped_by_week.csv')
    .then(ready)

  function ready(datapoints){

    var maxAQI = d3.max(datapoints, function(d){return +d['AQI']})
    var maxWeek = d3.max(datapoints, function(d){return +d['week']})

    xScale.domain([0, maxWeek])
    yScale.domain([0, maxAQI])

    var nested = d3.nest()
                  .key(d => d['pollutant'])
                  .entries(datapoints)
    
    svg.selectAll('.temp-path')
      .data(nested)
      .enter().append('path')
      .attr('class', 'temp-path')
      .attr('d', function(d){
        return line(d.values)
      })
      .attr('fill','none')
      .attr('stroke', function(d){
        if (d.key === 'NO2 (Plume AQI)') {
          return 'red'
        } else if(d.key === 'pm 10 (Plume AQI)'){
          return 'green'
        } else if(d.key === 'VOC (Plume AQI)'){
          return 'yellow'
        } else if(d.key === 'pm 2.5 (Plume AQI)'){
          return 'blue'
        }
        
      })

    svg.selectAll('.pollutant-names')
      .data(nested)
      .enter().append('text')
      .attr('class', 'pollutant-names')
      .text(function(d){
        return d.key
      })
      .attr('x', width)
      .attr('y', function(d){
        var lastWeek = d.values.find(d => +d.week === maxWeek)
        return yScale(lastWeek['AQI'])
      })
      .attr('alignment-baseline','middle')
      .attr('dx', 7)
      .attr('font-size',11)

    // svg.append('path')
    //     .datum(datapoints)
    //     .attr('d', line)
    //     .attr('fill','none')
    //     .attr('stroke','black')
   
    svg.selectAll('.air_circle')
        .data(datapoints)
        .enter().append('circle')
        .attr('class','air_circle')
        .attr('r','3')
        .attr('cx', function (d) {return xScale(+d.week)})
        .attr('cy', function (d) {return yScale(+d['AQI'])})


    var yAxis = d3.axisLeft(yScale);
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis)

    var xAxis = d3.axisBottom(xScale)
    svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    
  }


})()