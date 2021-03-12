(function(){
  
  //drawing the area of the map
  var margin = { top: 0, right: 10, bottom: 0, left: 10 }
  var width = 350 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  var svg = d3.select("#container")
      .append("svg")
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("viewBox", "0 0 " + width + " " + height)
        .classed("svg-map", true)
  
  var map = svg.append('g')
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var projection = d3.geoMercator()
    .translate([width, height])
  var colors=["#dadada","#E8DB92","#E8DB92","#E2C584","#E0B87B","#DFAF75","#DFAC73","#DB9463","#D98458","#D26A47","#CF5A3C","#CF5036","#CF4831","#CE3826","#CE2E20","#C41F10","#BA1506"]
  // colorscale
  logScale = d3.scaleLog()
  var colorScaleTests = d3.scaleSequential(d3.interpolateRgb('#bbd1b0','#BA1506'))
  var colorScalePositivity = d3.scaleSequential(d3.interpolateRgb('#bbd1b0','#BA1506'))
  // var colorScaleDiff100k = d3.scaleSequential(d3.interpolateReds)
  
  var formatSuffixDecimal2 = d3.format(".1f")

  // read json
  var path = d3.geoPath()
    .projection(projection)      
  
  var div = d3.select("#container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  // TOOLTIP
  
  // read csv
  Promise.all([
    d3.json("geo.geojson"),
    d3.csv("GR_COVID_DATA_STRUCTURE - Rapid_tests.csv"),
    ]).then(ready)
  
  function ready(data){
    // filter greece
      csv = data[1]
      
      function unroll(rollup, keys, label = "value", p = {}) {
        return Array.from(rollup, ([key, value]) => 
          value instanceof Map 
            ? unroll(value, keys.slice(1), label, Object.assign({}, { ...p, [keys[0]]: key } ))
            : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
        ).flat();
      }
      function rollUnroll(data, reducer, keys, value) {
        const rolled = d3.rollup(data, reducer, ...keys.map(k => d => d[k]));
        return unroll(rolled, keys, value);
      }
      var dates = rollUnroll(csv, v=>v.date, ['date'])
      var areas = rollUnroll(csv, d=>d.area, ['area'])
      var totalAreas = areas.length
      var lastDate = dates[dates.length-1].date
      var total_tests = rollUnroll(csv, v => d3.sum(v, d => d.total_tests), ["uid","county","county_en"], "total_tests")
      var positive_tests = rollUnroll(csv, v => d3.sum(v, d => d.positive_tests), ["uid","county","county_en"], "positive_tests")
      
      var total = d3.sum(total_tests, d=>d.total_tests)
      var positive = d3.sum(positive_tests, d=> d.positive_tests)
      d3.select('.total').text(total)
      d3.select('.positive').text(positive)
      d3.select('.date').text(lastDate)
      d3.select('.areas').text(totalAreas)

      greece=data[0].features.filter(function(d) {
        return d.properties.group==="greece"})
      
      var fixed = greece.map(function(feature) {
        return turf.rewind(feature,{reverse:true})})
  
      projection.fitSize([width,height],{"type": "FeatureCollection","features":fixed})
      

      total_tests.forEach(function(d){                
          fixed.forEach(function(e){
            if(d.uid===e.properties.uid){
              if (e.properties.region_el != "Άγιο Όρος"){
                e.properties["total_tests"]= +d.total_tests                
                e.properties["county"]= d["county"]
                e.properties["tests_100"]= parseFloat((d["total_tests"]/e.properties.population)*100)
            }}
          })        
        })

      positive_tests.forEach(function(b){          
          fixed.forEach(function(e){
            if(b.uid===e.properties.uid){
              if (e.properties.region_el != "Άγιο Όρος"){                
                e.properties["positive_tests"]= +b.positive_tests
                e.properties["positivity"]= parseFloat((b["positive_tests"]/e.properties.total_tests)*100)                
                e.properties["pos_100"]= parseFloat((e.properties["positivity"]/e.properties.population)*100000)                
            }}
          })        
      })

      console.log(fixed)
      
      // MAX VALUES FOR COLORSCALE
      var maxTests = d3.max(fixed, function(d){ return +d.properties.tests_100})
      var maxPositivity = d3.max(fixed, function(d){ return +d.properties.positivity})
      
      
      
      // COMPLETE COLORSCALE
      colorScaleTests.domain([0.1,maxTests])
      colorScalePositivity.domain([0,maxPositivity])
      


    // DEFAULT VIEW
    
    map.selectAll('greece')
        .data(fixed)
        .enter().append('path')
        .attr('class','greece')
        .attr('d',path)
        .style('fill', function(d){
          return colorScaleTests(d.properties.tests_100)})
        .on('mouseover', function(d,i){
            var enterX =  d.pageX
            var enterY =  d.pageY
            d3.select(this).classed('selected',true)
              .transition()
              .duration(100)
              .style("opacity", 1)
              .style("stroke", "black")
              .attr("stroke-width",0.3)
            
            div.transition()
              .duration(100)
              .style("opacity", 1);
            
            div.html("<b>"+i.properties.name_el+"</b><hr>"
                              +""+formatSuffixDecimal2(i.properties.tests_100)+"% του πληθυσμού<br>έχει υποβληθεί σε rapid test<br>"
                              +"("+i.properties.total_tests+") τεστ στο σύνολο")
                      .style("left", (enterX+10) + "px")
                      .style("top", (enterY-100) + "px")

          })
          .on('mouseout', function(d){
            d3.select(this).classed('selected',false)
              .transition()
              .duration(100)
              .style("stroke", "transparent")
            div.transition()
              .duration(100)
              .style("opacity", 0)
          })        

      // BUTTONS
      d3.select("#tests")
        .on('click', function(){          
            map.selectAll('greece')
                .data(fixed)
                .enter().append('path')
                .attr('class','greece')
                .attr('d',path)
                
                .style('fill', function(d){return colorScaleTests(d.properties.tests_100)})
                .on('mouseover', function(d,i){
                    var enterX =  d.pageX
                    var enterY =  d.pageY
                    d3.select(this).classed('selected',true)
                      .transition()
                      .duration(100)
                      .style("opacity", 1)
                      .style("stroke", "black")
                      .attr("stroke-width",0.3)
                    
                    div.transition()
                      .duration(100)
                      .style("opacity", 1);
                    
                    div.html("<b>"+i.properties.name_el+"</b><hr>"
                              +""+formatSuffixDecimal2(i.properties.tests_100)+"% του πληθυσμού<br>έχει υποβληθεί σε rapid test<br>"
                              +"("+i.properties.total_tests+") τεστ στο σύνολο")
                      .style("left", (enterX+10) + "px")
                      .style("top", (enterY-100) + "px")

                  })
                  .on('mouseout', function(d){
                    d3.select(this).classed('selected',false)
                      .transition()
                      .duration(100)
                      .style("stroke", "transparent")
                    div.transition()
                      .duration(100)
                      .style("opacity", 0)
                  })     
        })
      d3.select("#positivity")
        .on('click', function(){
          map.selectAll('greece')
            .data(fixed)
            .enter().append('path')
            .attr('class','greece')
            .attr('d',path)
            .style('fill', function(d){return colorScalePositivity(d.properties.pos_100)})
              .on('mouseover', function(d,i){
                  var enterX =  d.pageX
                  var enterY =  d.pageY
                  d3.select(this).classed('selected',true)
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("stroke", "black")
                    .attr("stroke-width",0.3)
                  
                  div.transition()
                    .duration(100)
                    .style("opacity", 1);
                  
                  div.html("<b>"+i.properties.name_el+"</b><hr>"
                              +""+formatSuffixDecimal2(i.properties.pos_100)+"% των δειγμάτων<br>ήταν θετικά"
                              +" ("+i.properties.positive_tests+")<br>σε σύνολο "+i.properties.total_tests+" τεστ")
                      .style("left", (enterX+10) + "px")
                      .style("top", (enterY-100) + "px")

                })
                  .on('mouseout', function(d){
                    d3.select(this).classed('selected',false)
                      .transition()
                      .duration(100)
                      .style("stroke", "transparent")
                    div.transition()
                      .duration(100)
                      .style("opacity", 0)
                  })      
        })
  }
  })()

    


      


