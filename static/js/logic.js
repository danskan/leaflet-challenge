// terrain map
var terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});

// invert gray scale
var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

// make a basemaps object
let basemaps = {
    GrayScale: grayscale,
    Terrain: terrain
};


// map object
var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 3,
    layers: [terrain, grayscale]
});

// add default map to the map
grayscale.addTo(myMap);

// tectonic plates
let tectonicPlates = new L.layerGroup();

// call the api to get the tectonic info
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData){
    L.geoJson(plateData, {
        color: "white",
        weight: 1
    }).addTo(tectonicPlates);
});

tectonicPlates.addTo(myMap);

// variable to hold the earthquake data layer
let earthquakes = new L.layerGroup();

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
    function(earthquakeData){
        function dataColor(depth){
            if (depth > 90)
                return "red";
            else if (depth > 70)
                return "#fc4903";
            else if (depth > 50)
                return "#fc8403";
            else if (depth > 30)
                return "#fcad03";
            else if (depth > 10)
                return "#cafc03"
            else
                return "green";
        }
        
        function radiusSize(mag){
            if (mag == 0)
                return 1;
            else
                return mag*5;
        }

        function dataStyle(feature){
            return {
                opacity: 5,
                fillOpacity: 0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: "000000",
                radius: radiusSize(feature.properties.mag),
                weight: 0.5,
                stroke: true
            }
        }

        L.geoJson(earthquakeData, {
            pointToLayer: function(feature, latLng){
                return L.circleMarker(latLng);
            },
            style: dataStyle, 
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                 Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                 Location: <b>${feature.properties.place}</b>`);
            }
        }).addTo(earthquakes);
    }
);

earthquakes.addTo(myMap);

// add the tectonic overlay
let overlays ={
    "Tectonic Plates": tectonicPlates,
    "Earthquake Data": earthquakes
};

// layer controls
L.control.layers(basemaps, overlays, {collapsed: false}).addTo(myMap);

// Legend
    let legend = L.control({
    position: "bottomright"
});

// Legend Properties
legend.onAdd = function(){
    let div = L.DomUtil.create("div", "info legend");
    let intervals = [-10, 10, 30, 50, 70, 90];
    let colors = ["green", "#cafc03", "#fcad03", "#fc8403", "#fc4903", "red"];
    for (var i=0; i<intervals.length; i++)
    {
        div.innerHTML += "<i style='background: " 
                      + colors[i] 
                      + "'></i> " 
                      + intervals[i]
                      + (intervals[i+1] ? "km - " + intervals[i+1] + "km<br>" : "+");
    }
    return div;

};

// add legend to map
legend.addTo(myMap);