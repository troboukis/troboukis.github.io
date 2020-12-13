(function(){

  //drawing the area of the map
  var margin = { top: 0, right: 10, bottom: 0, left: 10 }
  var width = 350 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

  var svg = d3.select("#container")
      .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height)
        .classed("svg-map", true)
  
  var map = svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var projection = d3.geoMercator()
    .translate([width, height])
  var colors=["#dadada","#E8DB92","#E8DB92","#E2C584","#E0B87B","#DFAF75","#DFAC73","#DB9463","#D98458","#D26A47","#CF5A3C","#CF5036","#CF4831","#CE3826","#CE2E20","#C41F10","#BA1506"]
  // colorscale
  logScale = d3.scaleLog()
  var colorScaleDeaths = d3.scaleSequential(d3.interpolateReds)
  var colorScaleDeaths_100k = d3.scaleSequential(d3.interpolateReds)
  var colorScaleMortality = d3.scaleSequential(d3.interpolateReds)
  var colorScaleFatality = d3.scaleSequential(d3.interpolateReds)

  // read json
  var path = d3.geoPath()
    .projection(projection)      
  
  var div = d3.select("#container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  // read csv
  Promise.all([
    d3.json("geo.geojson"),
    d3.csv("Deaths - Sheet2.csv"),
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
            e.properties.deaths=+d.deaths
            e.properties.deaths_100k=+d.deaths_100k
            e.properties["mortality%"]=+d["mortality%"]
            e.properties["case_fatality%"]=+d["case_fatality%"]
          }
        })
      })
      // MAX VALUES FOR COLORSCALE
      var maxDeaths = d3.max(fixed, function(d){ return d.properties.deaths})
      var maxDeaths_100k = d3.max(fixed, function(d){ return d.properties.deaths_100k})
      var maxMortality = d3.max(fixed, function(d){ return d.properties["mortality%"]})
      var maxFatality = d3.max(fixed, function(d){ return d.properties["case_fatality%"]})
      
      // COMPLETE COLORSCALE
      colorScaleDeaths.domain([0,maxDeaths])
      colorScaleDeaths_100k.domain([0,maxDeaths_100k])
      colorScaleMortality.domain([0,0.109,maxMortality])
      colorScaleFatality.domain([0,maxFatality])

    // DEFAULT VIEW
    map.selectAll('greece')
        .data(fixed)
        .enter().append('path')
        .attr('class','greece')
        .attr('d',path)
        .style('fill', function(d){return colorScaleDeaths_100k(d.properties.deaths_100k)})
        .on('mouseover', function(d,i){
            var enterX =  d.pageX
            var enterY =  d.pageY
            d3.select(this).classed('selected',true)
              .transition()
              .duration(200)
              .style("opacity", 1)
              .style("stroke", "black")
              .attr("stroke-width",0.3)
            
            div.transition()
              .duration(200)
              .style("opacity", 1);
            
            div.html("<b>"+i.properties.name_el+"</b>"
                      +"<br>"+i.properties.deaths_100k+" θάνατοι"
                      +"<br>ανά 100.000 πληθυσμό"
                      +"<br>Σύνολο θανάτων: "+i.properties.deaths)
              .style("left", (enterX) + "px")
              .style("top", (enterY) + "px")

          })
          .on('mouseout', function(d){
            d3.select(this).classed('selected',false)
              .transition()
              .duration(200)
              .style("stroke", "transparent")
            div.transition()
              .duration(200)
              .style("opacity", 0)
          })        

      // BUTTONS
      d3.select("#deaths_100k")
        .on('click', function(){
            map.selectAll('greece')
                .data(fixed)
                .enter().append('path')
                .attr('class','greece')
                .attr('d',path)
                .style('fill', function(d){return colorScaleDeaths_100k(d.properties.deaths_100k)})
                .on('mouseover', function(d,i){
                  console.log(i)
                    var enterX =  d.pageX
                    var enterY =  d.pageY
                    d3.select(this).classed('selected',true)
                      .transition()
                      .duration(200)
                      .style("opacity", 1)
                      .style("stroke", "black")
                      .attr("stroke-width",0.3)
                    
                    div.transition()
                      .duration(200)
                      .style("opacity", 1);
                    
                    div.html("<b>"+i.properties.name_el+"</b>"
                              +"<br>"+i.properties.deaths_100k+" θάνατοι"
                              +"<br>ανά 100.000 πληθυσμό"
                              +"<br>Σύνολο θανάτων: "+i.properties.deaths)
                      .style("left", (enterX) + "px")
                      .style("top", (enterY) + "px")

                  })
                  .on('mouseout', function(d){
                    d3.select(this).classed('selected',false)
                      .transition()
                      .duration(200)
                      .style("stroke", "transparent")
                    div.transition()
                      .duration(200)
                      .style("opacity", 0)
                  })        
        })
      d3.select("#case_fatality")
        .on('click', function(){
          map.selectAll('greece')
            .data(fixed)
            .enter().append('path')
            .attr('class','greece')
            .attr('d',path)
            .style('fill', function(d){return colorScaleFatality(d.properties["case_fatality%"])})
                .on('mouseover', function(d,i){
                    var enterX =  d.pageX
                    var enterY =  d.pageY
                    d3.select(this).classed('selected',true)
                      .transition()
                      .duration(200)
                      .style("opacity", 1)
                      .style("stroke", "black")
                      .attr("stroke-width",0.3)
                    div.transition()
                      .duration(200)
                      .style("opacity", 1);
                    
                    div.html("<b>"+i.properties.name_el+"</b>"
                              +"<br>"+i.properties["case_fatality%"]+"% θνητότητα"
                              +"<br>(θάνατοι προς κρούσματα)"
                              +"<br>Σύνολο θανάτων: "+i.properties.deaths)
                      .style("left", (enterX) + "px")
                      .style("top", (enterY) + "px")

                  })
                  .on('mouseout', function(d){
                    d3.select(this).classed('selected',false)
                      .transition()
                      .duration(200)
                      .style("stroke", "transparent")
                    div.transition()
                      .duration(200)
                      .style("opacity", 0)                              
                  })      
        })

      d3.select("#mortality")
        .on('click', function(){
          map.selectAll('greece')
            .data(fixed)
            .enter().append('path')
            .attr('class','greece')
            .attr('d',path)
            .style('fill', function(d){return colorScaleMortality(d.properties["mortality%"])})       
                .on('mouseover', function(d,i){
                  var enterX =  d.pageX
                  var enterY =  d.pageY
                    d3.select(this).classed('selected',true)
                      .transition()
                      .duration(200)
                      .style("opacity", 1)
                      .style("stroke", "black")
                      .attr("stroke-width",0.3)
                    div.transition()
                      .duration(200)
                      .style("opacity", 1);

                    div.html("<b>"+i.properties.name_el+"</b>"
                            +"<br>"+i.properties["mortality%"]+"% θνησιμότητα"
                            +"<br>(θάνατοι προς πληθυσμό)"
                            +"<br>Σύνολο θανάτων: "+i.properties.deaths)
                        .style("left", (enterX) + "px")
                        .style("top", (enterY) + "px")
                  })
                  .on('mouseout', function(d){
                    d3.select(this).classed('selected',false)
                      .transition()
                      .duration(200)
                      .style("stroke", "transparent")
                    div.transition()
                      .duration(200)
                      .style("opacity", 0)
                  })
        })
 
  }
  })()

    


      


