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
              .x(d => xScale(+d.month))
              .y(d => yScale(+d['AQI']))
              .curve(d3.curveCatmullRom)
                 

function month (){
  d3.csv('air_data_grouped_by_month.csv')
    .then(ready)

  function ready(datapoints){

    var maxAQI = d3.max(datapoints, function(d){return +d['AQI']})
    var maxMonth = d3.max(datapoints, function(d){return +d['month']})

    xScale.domain([1, maxMonth])
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
        if (d.key === 'NO2') {
          return '#BA3A0B'
        } else if(d.key === 'PM 10'){
          return '#725E7F'
        } else if(d.key === 'VOC'){
          return '#114B5F'
        } else if(d.key === 'PM 2.5'){
          return '#F0A202'
        }
      })
      .attr('stroke-width', 2.5)
      .attr('opacity', .8)

    svg.selectAll('.pollutant-names')
      .data(nested)
      .enter().append('text')
      .attr('class', 'pollutant-names')
      .text(function(d){
        return d.key
      })
      .attr('x', width)
      .attr('y', function(d){
        var lastMonth = d.values.find(d => +d.month === maxMonth)
        return yScale(lastMonth['AQI'])
      })
      .attr('alignment-baseline','middle')
      .attr('dx', 7)
      .attr('font-size',11)

      svg.selectAll('.final-circle')
          .data(nested)
          .enter().append('circle')
          .attr('class','final-circle')
          .attr('r',3)
          .attr('cx',width)
          .attr('cy', function(d){
            var lastPoint = d.values.find(d => +d.month === maxMonth)
            console.log(lastPoint)
            return yScale(lastPoint['AQI'])
          })
          .attr('fill', function(d){
            if (d.key === 'NO2') {
              return '#BA3A0B'
            } else if(d.key === 'PM 10'){
              return '#725E7F'
            } else if(d.key === 'VOC'){
              return '#114B5F'
            } else if(d.key === 'PM 2.5'){
              return '#F0A202'
            }
          })

    // svg.append('path')
    //     .datum(datapoints)
    //     .attr('d', line)
    //     .attr('fill','none')
    //     .attr('stroke','black')
   
    // svg.selectAll('.air_circle')
    //     .data(datapoints)
    //     .enter().append('circle')
    //     .attr('class','air_circle')
    //     .attr('r','3')
    //     .attr('cx', function (d) {return xScale(+d.month)})
    //     .attr('cy', function (d) {return yScale(+d['AQI'])})
    //     .attr('fill', 'black')
    var upperLimitLine = svg.append('g')

    upperLimitLine.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(20))
      .attr("x2", width)
      .attr("y2", yScale(20))
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .style("stroke-dasharray", "1,1");
      
    
    upperLimitLine.append('text')
      .attr('class', 'upper-limit-text')
      .style("text-anchor", "start")
      .style("fill", "black")
      .text('Ανώτερο όριο φυσιολογικών τιμών')
      .attr('x',width/1.8)
      .attr('y', yScale(20))
      .attr('dx', 6)
      .attr('dy',-5)  
      .style('fill','gray')
      .attr('font-size',12)
    
    upperLimitLine.append('rect')
      .attr('class','upper-limit-rect')
      .attr('width',10)
      .attr('height',10)
      .attr('x',width)
      .attr('y', yScale(20.4))
      
      .style('fill','none')
      .style('stroke','black')
      .style("stroke-dasharray", "1,1");

    var yAxis = d3.axisLeft(yScale);
    var yAxisGroup = svg.append("g")
        .attr("class", "axis-y-axis")
        .call(yAxis)
        .style('color','gray')

    yAxisGroup.append('text')
      .attr('class', 'yAxis-text')
      .style("text-anchor", "start")
      .style("fill", "black")
      .text('ος μήνας')
      .attr('x',width)
      .attr('y', height)
      .attr('dx', 6)
      .attr('dy', 16)  
      .style('fill','gray')  


    var xAxis = d3.axisBottom(xScale)
    var xAxisGroup = svg.append("g")
      .attr("class", "axis-x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .style('color','gray')
    
   }
}
month()
