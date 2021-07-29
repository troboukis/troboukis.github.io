function iMEdDMap(){
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
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vS708XXymN9Bx2DqK0d5R2w1ANNKTBYN3nQG-TrfSMYuwL8QXMr9wjPUloxe-d9k2VWlGHYS5xvytHJ/pub?gid=487858598&single=true&output=csv")
    ]).then(ready)

  function ready(data){
    var partners = data[1],
        text = data[2][0]
        mapJson = data[0]['features']

    // Home Page Title and Subtitle
    function homePageText(display='Visible'){
      if (display === 'Visible'){
        orgNumber = new Set(partners.map(d=>d.institution)).size
        regNumber = new Set(partners.map(d=>d.region)).size
        const title = text['home-page-title'],
              subTitle = text['home-page-sub']
                .replace("*", orgNumber)
                .replace("**", regNumber)
        
        d3.select(".item-title").text(title)
        d3.select(".subtitle").text(subTitle)
      }
    }

    // Header diplay
    function headerText(display='Visible'){
      if (display==='Visible'){
        var header = new Array([text['header-text1'], text['header-text2']])[0]
        var headerText = d3.select(".msg")
          .data(header)
        function repeat(){
            headerText
            .text(header[0])
            .style('opacity',1)
            .transition()
            .delay(4000)
            .duration(200)
            .ease(d3.easeLinear)
            .text(header[1])
            .transition()
            .delay(4000)
            .duration(200)
            .on("end", repeat)         
          }
          repeat()

      }
    }headerText(display='Visible')
    
    d3.select(".svg-map").remove()
    var svg = d3.select("#map")
      .append("svg")
      .attr("class", "svg-map")
      .attr("viewBox", "0 0 " + width + " " + height )
      .attr("preserveAspectRatio", "xMidYMid")
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
      .on("start", homePageText(display='Visible'))
    
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
    
    function mapView(){    
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
    }
    mapView()

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

  
  d3.select(".loader").remove()
  d3.select(".loader-loading").remove()
  }
}
iMEdDMap()
window.addEventListener("resize", iMEdDMap);

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