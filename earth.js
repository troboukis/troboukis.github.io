am4core.ready(function () {
  am4core.useTheme(am4themes_animated);

  var chart = am4core.create("chartdiv", am4maps.MapChart);
  chart.logo.disabled = true;

  chart.geodata = am4geodata_worldLow;
  chart.projection = new am4maps.projections.Orthographic();

  chart.panBehavior = "rotateLongLat";
  chart.deltaLatitude = -20;
  chart.padding(0, 0, 0, 0);

  /* =====================
     COUNTRY POLYGONS
     ===================== */
  var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
  polygonSeries.useGeodata = true;

  var polygonTemplate = polygonSeries.mapPolygons.template;
  polygonTemplate.tooltipText = "{name}";
  polygonTemplate.fill = am4core.color("#ffffff");
  polygonTemplate.stroke = am4core.color("#000000");
  polygonTemplate.strokeWidth = 0.3;

  // Hover: invert (still strict colors)
  var hs = polygonTemplate.states.create("hover");
  hs.properties.fill = am4core.color("#000000");
  hs.properties.stroke = am4core.color("#ffffff");

  // Sea / background
  chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#000000");
  chart.backgroundSeries.mapPolygons.template.polygon.stroke = am4core.color("#000000");

  /* =====================
     SELECTED COUNTRIES (RED)
     ===================== */
  var selectedCountries = [
    "US", // USA
    "DE", // Germany
    "GB", // United Kingdom
    "AT", // Austria
    "BG", // Bulgaria
    "SI", // Slovenia
    "FR", // France
    "IT", // Italy
    "RS", // Serbia
    "TR", // Turkey (Istanbul)
    "PK", // Pakistan
    "LK", // Sri Lanka
    "VN", // Vietnam
    "KH", // Cambodia
    "TH", // Thailand
    "DK", // Denmark
    "AE", // United Arab Emirates (Dubai)
    "JO", // Jordan
    "ES", // Spain
    "PT",  // Portugal
    "GR"
  ];

  polygonSeries.events.on("inited", function () {
    selectedCountries.forEach(function (id) {
      var poly = polygonSeries.getPolygonById(id);
      if (poly) {
        poly.fill = am4core.color("#ff0000");
        poly.stroke = am4core.color("#000000");
      }
    });
  });

  /* =====================
     ROTATION
     ===================== */
  chart.deltaLongitude = 0;
  setTimeout(function () {
    chart.animate(
      { property: "deltaLongitude", to: 36000 },
      20000000
    );
  }, 800);
});
