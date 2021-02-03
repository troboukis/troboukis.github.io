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
  var colorScaleDeaths1 = d3.scaleSequential(d3.interpolateReds)
  var colorScaleDeaths2 = d3.scaleSequential(d3.interpolateReds)
  var colorScaleDiff100k = d3.scaleSequential(d3.interpolateReds)
  
  

  // read json
  var path = d3.geoPath()
    .projection(projection)      
  
  var div = d3.select("#container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  var div_fatality = d3.select("#container").append("div")
    .attr("class", "tooltip_fatality")
    .style("opacity", 0);
  
  // TOOLTIP
  
  
  // read csv
  Promise.all([
    d3.json("geo.geojson"),
    d3.csv("deaths_v2_exports - map_gen_pop.csv"),
  ]).then(ready)
    
  function ready(data){
    // filter greece
      csv = data[1]
      greece=data[0].features.filter(function(d) {
        return d.properties.group==="greece"})
      
      var fixed = greece.map(function(feature) {
        return turf.rewind(feature,{reverse:true})})
  
      projection.fitSize([width,height],{"type": "FeatureCollection","features":fixed})

      csv.forEach(function(d){
        fixed.forEach(function(e){
          if(d.uid===e.properties.uid){
            e.properties.deaths2_100k=+d.l2_100k
            e.properties["mortality%"]=+d["mortality_100k"]
            e.properties["pct_change"]=+d["pct_change"]
            e.properties["deaths1_100k"]=+d["l1_100k"]
            e.properties["DEATHS_L1"]=+d["DEATHS_L1"]
            e.properties["DEATHS_L2"]=+d["DEATHS_L2"]
            e.properties["diff"]=+d["diff"]
            e.properties["diff_100k"]=+d["diff_100k"]
            e.properties["county"]=+d["county"]
          }
        })
      })
      
      // MAX VALUES FOR COLORSCALE
      var maxDeaths1 = d3.max(fixed, function(d){ return d.properties.deaths1_100k})
      var maxDeaths2 = d3.max(fixed, function(d){ return d.properties.deaths2_100k})
      var maxPctChange = d3.max(fixed, function(d){ return d.properties.diff_100k})
      
      
      // COMPLETE COLORSCALE
      colorScaleDeaths1.domain([0,maxDeaths1])
      colorScaleDeaths2.domain([0,maxDeaths2])
      colorScaleDiff100k.domain([0,maxPctChange])


    // DEFAULT VIEW

    map.selectAll('greece')
        .data(fixed)
        .enter().append('path')
        .attr('class','greece')
        .attr('d',path)
        .style('fill', function(d){return colorScaleDeaths2(d.properties.deaths2_100k)})
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
                      +""+i.properties.deaths2_100k+" θάνατοι"
                      +"<br>ανά 100.000 πληθυσμό"
                      +"<br>Σύνολο θανάτων: "+i.properties.DEATHS_L2)
              .style("left", (enterX+30) + "px")
              .style("top", (enterY-160) + "px")

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
      d3.select("#deaths1_100k")
        .on('click', function(){          
            map.selectAll('greece')
                .data(fixed)
                .enter().append('path')
                .attr('class','greece')
                .attr('d',path)
                .style('fill', function(d){return colorScaleDeaths1(d.properties.deaths1_100k)})
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
                              +""+i.properties.deaths1_100k+" θάνατοι"
                              +"<br>ανά 100.000 πληθυσμό"
                              +"<br>Σύνολο θανάτων: "+i.properties.DEATHS_L1)
                      .style("left", (enterX+30) + "px")
                      .style("top", (enterY-160) + "px")
                      .attr("transform","translate("+enterX+","+enterY+")")

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
      d3.select("#deaths2_100k")
        .on('click', function(){
          map.selectAll('greece')
            .data(fixed)
            .enter().append('path')
            .attr('class','greece')
            .attr('d',path)
            .style('fill', function(d){return colorScaleDeaths2(d.properties.deaths2_100k)})
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
                            +""+i.properties.deaths2_100k+" θάνατοι"
                            +"<br>ανά 100.000 πληθυσμό"
                            +"<br>Σύνολο θανάτων: "+i.properties.DEATHS_L2)
                    .style("left", (enterX+30) + "px")
                    .style("top", (enterY-160) + "px")

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

        d3.select("#new_deaths")
        .on('click', function(){
          map.selectAll('greece')
            .data(fixed)
            .enter().append('path')
            .attr('class','greece')
            .attr('d',path)
            .style('fill', function(d){return colorScaleDiff100k(d.properties.diff_100k)})
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
                            +""+i.properties.diff_100k+" θάνατοι ανά 100k"
                            +"<br>Αύξηση: "+i.properties.pct_change+"%"
                            +"<br>Σύνολο νέων θανάτων: "+i.properties.diff)
                    .style("left", (enterX+30) + "px")
                    .style("top", (enterY-160) + "px")

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

    


      


