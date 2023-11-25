var map = L.map("map").setView([-1.2921, 36.8219], 6);

// add a tile layer (the basemap, or what the map is all about)
let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">WebGIS Tutorial</a>',
}).addTo(map);
let CartoDB = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; foloo, bmitto contributors: <a href="http://cartodb.com/attributions#basemaps">CartoDB</a>',
    subdomains: "abcd",
    minZoom: 2,
    maxZoom: 20,
  }
);

// Here we load the counties shapefile from geoserver
let counties = L.tileLayer.wms("http://localhost:8080/geoserver/wms?", {
  layers: "WEBGIS:counties",
  format: "image/png",
  transparent: true,
  attribution: "Our webgis training © 2023😎",
});

// Here we load the towns from geoserver
let towns = L.tileLayer.wms("http://localhost:8080/geoserver/wms?", {
  layers: "WEBGIS:towns",
  format: "image/png",
  transparent: true,
  attribution: "Our webgis training © 2023😎",
});

// code for reading an online geoserver- Here we use icpac which is a very useful geoportal
// icpac stores its dataset in geoserver
let geonode_ke_health = L.tileLayer.wms(
  "https://geoportal.icpac.net/geoserver/wms?",
  {
    layers: "geonode:kenya_health",
    format: "image/png",
    transparent: true,
    attribution: "Retrieved from Geonode😎",
  }
);
// icpac ke wetlands
let icpac_ke_wetlands = L.tileLayer.wms(
  "https://geoportal.icpac.net/geoserver/wms?",
  {
    layers: "geonode:kenya_wetlands",
    format: "image/png",
    transparent: true,
    attribution: "KE wetlands😎",
  }
);

// icpac ke wetlands
let icpac_ke_rivers = L.tileLayer.wms(
  "https://geoportal.icpac.net/geoserver/wms?",
  {
    layers: "geonode:ken_water_lines_dcw",
    format: "image/png",
    transparent: true,
    attribution: "KE Rivers",
  }
);

// add our geojson
let hotelsData = L.geoJSON(hotels);

// Add the protected areas data
let eastyle = {
  fillOpacity: 1,
  opacity: 1,
  weight: 2,
  color: "black",
  fillColor: "rgba(196,60,57,0.0)",
};
let prtstyle = {
  fillOpacity: 1,
  weight: 0.1,
  color: "white",
  fillColor: "rgba(178,223,138,1.0)",
};

function smestyle() {
  return {
    radius: 8.0,
    opacity: 1,
    color: "rgba(255,255,255,1.0)",
    weight: 1,
    fillOpacity: 1,
    fillColor: "rgba(134,139,136,1.0)",
  };
}
let ea_country = new L.geoJSON(ea, { style: eastyle });
// protected areas
let protected_area = new L.geoJSON(protected, {
  style: prtstyle,
  onEachFeature: function (feature, layer) {
    layer.bindPopup(
      "<table><tr><td><b>Name:</b>" +
        feature.properties.NAME +
        "</td></tr>\
      <tr><td><b>Designation:</b>" +
        feature.properties.DESIG +
        "</td></tr>\
      <tr><td><b>Status:</b>" +
        feature.properties.STATUS +
        "</td></tr></table>"
    );
  },
});
// sme sites - Small and medium-sized enterprises
let smesite = new L.geoJSON(sme, {
  pointToLayer: function (feature, latlng) {
    var circle = L.circleMarker(latlng, smestyle(feature));

    circle.bindPopup(
      "<table><tr><td><b> SME Number</td><td>" +
        feature.properties.SME_No +
        "</td></tr>\
      <tr><td><b> Lender</b></td><td>" +
        feature.properties.Lender +
        "</td></tr>\
      <tr><td><b> Loanee</b></td><td>" +
        feature.properties.Loanee +
        "</td></tr>\
      <tr><td><b> Value Chain</b></td><td>" +
        feature.properties.Value_Chain +
        "</td></tr>\
      <tr><td><b> Country</b></td><td>" +
        feature.properties.Country +
        "</td></tr>\
      <tr><td><b> District</b></td><td>" +
        feature.properties.Country +
        "</td></tr>\
      <tr><td><b> Ward</b></td><td>" +
        feature.properties.Country +
        "</td></tr>\
      <tr><td><b> Nearest Protected Area</b></td><td>" +
        feature.properties.Nearest +
        "</td><td>" +
        feature.properties.Nearest_Dist +
        "km</td></tr>\
      <tr><td><b> Second Protected Area</b></td><td>" +
        feature.properties.Second +
        "</td><td>" +
        feature.properties.Second_Dist +
        "km</td></tr>\
      <tr><td><b> Third Protected Area</b></td><td>" +
        feature.properties.Third +
        "</td><td>" +
        feature.properties.Third_Dist +
        "km</td></tr>\
      </table>"
    );
    return circle;
  },
});

// Getting feature information from geoserver/ URL format
var towns_url =
  "http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=WEBGIS:towns&outputFormat=application/json&srsName=epsg:4326";

//Geoserver Web Feature Service - Here we request the town data from geoserver as javascript and then
// add it to map and also enable feature popup displaying the town name: Feature Popup is used to show information about a loaded layer
$.ajax("http://localhost:8080/geoserver/wfs", {
  type: "GET",
  data: {
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typename: "WEBGIS:towns", // this is where we have requested the towns data. Change it to a layer you want
    srsname: "EPSG:4326",
    outputFormat: "text/javascript",
  },
  dataType: "jsonp",
  jsonpCallback: "callback:handleJson",
  jsonp: "format_options",
});
//Geojson style file
var myStyle = {
  color: "red",
};
// the ajax callback function
function handleJson(data) {
  selectedArea = L.geoJson(data, {
    style: myStyle,
    pointToLayer: function (feature, latlng) {
      // function to convert geoserver data to a layer
      return L.circleMarker(latlng, {
        radius: 5,
        stroke: true,
        weight: 2,
        opacity: 0.85,
        color: "red",
        fill: "#B53922",
        fillOpacity: 0.5,
      });
    },
    onEachFeature: function (feature, layer) {
      // what happens when you click on a town
      layer.bindPopup(`Town Name: ${feature.properties.TName}`); // This is the information we want shown in the popup once a town has been clicked!
    },
  }).addTo(map);
  map.fitBounds(selectedArea.getBounds());
}

// Add a layerSwitcher to allow showing/hiding layers active on the map.
let overlays = {
  // Counties: counties,
  // Towns: towns,
  "Health Facilities": geonode_ke_health,
  Wetlands: icpac_ke_wetlands,
  Rivers: icpac_ke_rivers,
  Hotels: hotelsData,
  SMEs: smesite,
  "Protected Areas": protected_area,
  "EA Boundary": ea_country,
};

// Adding legends from our geoserver
let icpac_legend_url =
  "https://geoportal.icpac.net/geoserver/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=kenya_health";
let towns_legend_url =
  "http://localhost:8080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=WEBGIS:towns&legend_options=forceLabels:on&fontName:Arial;fontSize=14";

let wetlands_legend_url =
  "https://geoportal.icpac.net/geoserver/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=kenya_wetlands";
let rivers_legend_url =
  "https://geoportal.icpac.net/geoserver/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=ken_water_lines_dcw";

// Access the images from html and update them
document.getElementById("icpac_legend").src = icpac_legend_url;
// document.getElementById("towns_legend").src = towns_legend_url;
document.getElementById("wetlands_legend").src = wetlands_legend_url;
document.getElementById("rivers_legend").src = rivers_legend_url;

// code to add our layerswitcher to map
L.control
  .layers({ OSM: osm, CartoDB: CartoDB }, overlays, { collapsed: false })
  .addTo(map);

// Add polyline measure
L.control.polylineMeasure(options).addTo(map);
