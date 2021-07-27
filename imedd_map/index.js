function disastersMap(){
  // set margins
  function setWidth() {
    width = document.getElementById("root").clientWidth
    return width
  } 
  
  mapRatio = .74
  margin = ({ top: 50, right: 10, bottom: 50, left: 10 })
  width = setWidth()- margin.left - margin.right
  height = width * mapRatio;

  // function for translating the coordinates of the content into the screen
  function makeTranslate(x, y) {
    return "translate(" + x + " " + y + ")"
  }

  // setting divs & svg
  
  var projection = d3.geoMercator() // set projection to see the whole map
      .scale(width / (1.9 * Math.PI))
      .translate([width / 2, height/2])
      .center([0, 45])
    // projection.fitSize([width, height],{"type": "FeatureCollection","features":mapJson})
  
  var path = d3.geoPath()
      .projection(projection)  

  // read csv
  Promise.all([
    d3.json("custom.geo.json"),
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vS708XXymN9Bx2DqK0d5R2w1ANNKTBYN3nQG-TrfSMYuwL8QXMr9wjPUloxe-d9k2VWlGHYS5xvytHJ/pub?gid=0&single=true&output=csv"),
    ]).then(ready)

  function ready(data){
    var partners = data[1],
        mapJson = data[0]['features']
    
    d3.select(".svg-map").remove()
    var svg = d3.select("#map")
      .append("svg")
      .attr("class", "svg-map")
      .attr("viewBox", "0 0 " + width + " " + height )
      .attr("preserveAspectRatio", "xMidYMid")
      // .attr("width", width-(margin.left+margin.right))
      // .attr("height", height-(margin.top+margin.bottom))
      // .attr("transform", makeTranslate(0,0))
    var g = svg.append("g");
    
    
    // create map
    g.selectAll("path")
      .data(mapJson)
      .enter().append("path")
      .attr("id", "map-path")
      .attr("d", path)
      .style('fill', '#dadada')
      .on("mouseover", function(event, d) {
          let mapCountry = d.properties.admin==="Macedonia" ? "North Macedonia" : d.properties.admin
          var selection = partners.filter(function(d){
            var dataCountry = d.country
            if(dataCountry===mapCountry){
              return d
            }
          })
          d3.select(".msg").text(selection.map(d=>d.institution).length>0 ?mapCountry+ ": "+ selection.map(d=>d.institution).length + " organizations" : "We don't have any partners in "+ mapCountry)
      })
      .on("mouseout", function(event, d){
        return d3.select(".msg").text("Mouse over a country to see our network | Click to read who they are")
      })
    
    var zoom = d3.zoom()
      .scaleExtent([1, 14])
      .on('zoom', function(event) {
          g.selectAll('path')
            .attr('transform', event.transform);
          g.selectAll(".points")
            .attr('transform', event.transform)
            .attr('stroke-width', .04/event.transform.k+'vh')
            .attr("r", 1/event.transform.k/1.2+'vh')
            .attr("opacity", .5+event.transform.k/2)
          g.selectAll(".blinking-points")
            // .attr('transform', event.transform)
            .remove()
    });
    svg.call(zoom);
    
    function firstView(display="False"){
      if (display==="True"){
        d3.select(".org-image")
            
        var staticPoints = g.selectAll("points")
            .data(partners)
            .enter().append("circle")
            .attr("class","points")
            .attr("cx", function(d) {
                        return projection([+d.long, +d.lat])[0];
                })
            .attr("cy", function(d) {
                    return projection([+d.long, +d.lat])[1];
            })
            .attr("r", ".1vh")
            .style("stroke", 'white')
            .attr('stroke-width', ".04vh")
            .attr('fill','#F73718')
            .attr("opacity", ".5")
          // set blinking points
        var random = d3.randomUniform();
        var blinkingPartners = g.selectAll("points")
            .data(partners)
            .enter().append("circle")
            .attr("class","blinking-points")
            .attr("cx", function(d) {
                        return projection([+d.long, +d.lat])[0]+random(100, 200);
                })
            .attr("cy", function(d) {
                    return projection([+d.long, +d.lat])[1]+random(10,20);
            })
            .attr("r", ".2vh")
            .attr("fill", "#F73718")

            // function for the blinking points
        function repeat(){
            blinkingPartners
              .attr('r',".1vh")
              .style('opacity',1)
              .transition()
              .duration(2000)
              .ease(d3.easeLinear)
              .attr('r',"2.5vh")
              .style('opacity',0)
              .on("end", repeat)
                      
          }
          repeat()
        
        d3.select(".main-title").style('opacity', 1)
        d3.select("#home").style("opacity", 1)
        orgNumber = new Set(partners.map(d=>d.institution)).size
        regNumber = new Set(partners.map(d=>d.region)).size
        d3.select(".orgNum").text(orgNumber)
        d3.select(".regions").text(regNumber)
      } else {
        d3.select(".home-view").style("opacity", 0)
        d3.select(".org-title").style("opacity", 0)
        d3.select(".org-sub").style("opacity", 0)
        d3.select(".org-image").style("opacity", 0)
      }
    }
    firstView(display="True")

    function onClick(){
      d3.selectAll("#map-path")
        .on("click", function(event, d){
          var region = d.properties.continent
          var selection = partners.filter(function(d){
            if(d.region===region){
              return d
            }
          })
        
        d3.select(".home-view")
          .transition()
          .duration(200)
          .ease(d3.easeLinear)
          .style('opacity',0)
          .remove()
          
        projection
          .scale(width / (3 * Math.PI))
        var path = d3.geoPath()
          .projection(projection)

        })
    }onClick()
    // function onClick(){
    //   d3.selectAll(".blinking-points")
    //     .on("click", function(event, d) {
    //       d3.select(".home-view")
    //         .transition()
    //         .duration(200)
    //         .ease(d3.easeLinear)
    //         .style('opacity',0)
    //         .remove()
    //       d3.select(".org-title")
    //         .text(d.institution)
    //         .style('opacity',1)
    //       d3.select(".org-sub")
    //         .text(d.inst_description)
    //       d3.select(".org-image")
    //         .attr("src", d.img_link)
    //     })
    //   .on("click", function(event, d) {
    //       d3.select(".org-image")
    //         .style('opacity',0)
    //   })
    // }
    // onClick()
  
  
  // add <article> and text

  
  d3.select(".loader").remove()
  d3.select(".loader-loading").remove()
  }
  
}
disastersMap()
window.addEventListener("resize", disastersMap);

// .on("mouseover", function(event, d) {
//           // console.log(d.properties.admin)
//           var mapCountry = d.properties.admin
//           var selection = partners.filter(function(d){
//             var dataCountry = d.country
//             if(dataCountry===mapCountry){
//               return d
//             }
//           })
//           d3.select(".header").text(mapCountry+ ": "+ selection.map(d=>d.institution).join(", "))
//       })
//       .on("mouseout", function(event, d){
//         return d3.select(".header").text("Mouse over a country to see our network")
//       })