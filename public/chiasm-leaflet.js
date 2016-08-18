function ChiasmLeaflet() {
  my = ChiasmComponent({
    zoom: 5,
    center: [36.21, 138.25]
  });
  // This line of code lets you see what the center value is when you pan in the map.
  // my.when("center", console.log, console);
  my.el = document.createElement("div");
  d3.select(my.el).style("background-color", "white");
  // Instantiate the Leaflet map, see docs at http://leafletjs.com/reference.html#map-constructor
  my.map = L.map(my.el, {
    zoom: 2,
    minZoom: 2,
    maxZoom: 5,
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: false,
    center: [36.21, 138.25],
  }).setView(my.center, my.zoom);
  // Found by browsing http://leaflet-extras.github.io/leaflet-providers/preview/

  // TODO move this to configuration.
  var Stamen_Watercolor = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}',{
    noWrap: true,
    continuousWorld : true,
    reuseTiles : true,
    ext: 'png'
  }).addTo(my.map);

  var overlays = {
      "Test": {},
    };
  L.control.layers({},overlays).addTo(my.map);

  // Returns the current Leaflet map center in a format that D3 understands: [longitude, latitude]
  function getCenter(){
    var center = my.map.getCenter();
    return [center.lng, center.lat];
  }
  var onMove = (function (){
    my.center = getCenter();
    my.zoom = my.map.getZoom();
    var bounds = my.map.getBounds();
    my.longitudeInterval = [bounds.getWest(), bounds.getEast()];
    my.latitudeInterval = [bounds.getSouth(), bounds.getNorth()];
  });
  // Sets the Leaflet map center to be the given center. Note that Leaflet will immediately trigger a "move" event
  function setCenter(center){
    my.map.off("move", onMove);
    my.map.panTo(L.latLng(center[1], center[0]), {
      animate: true
    });
    my.map.on("move", onMove);
  }
  var rect = d3.select('.extent');
  my.map.on("move", onMove);
  // If the center was set externally, pan the map to that center.
  my.when(["center", "zoom"], function (center, zoom){
    // This comparison logic is necessary to avoid an infinite loop in bidirectional data binding.
    // TODO move this to chiasm-links under "A <-> B" DSL syntax
    if(!equal(center, getCenter())){
      setCenter(center);
    }
    my.map.setZoom(zoom);
  });
  function equal(a, b){
    return JSON.stringify(a) === JSON.stringify(b);
  }
  my.when("box", function (box) {
    // Move to chiasm-layout?
    d3.select(my.el)
      .style("width", box.width + "px")
      .style("height", box.height + "px");
    // Tell Leaflet that the size has changed so it updates.
    my.map.invalidateSize();
  });

/*=============================================
=            Test Toggle Button               =
=============================================*/
 var testBlueMarkersOnAndOff = L.layerGroup([
       L.marker([37.8, -91]), L.marker([38.8, -86]), L.marker([47.8, -106]),
       L.marker([31.8, -90]), L.marker([39.8, -96]), L.marker([33.8, -100]) ]);
 var toggle = L.easyButton({
   states: [{
     stateName: 'add-markers',
     icon: '<span id="heartempty"></span>',
     title: 'add random markers',
     onClick: function(control) {
       my.map.addLayer(testBlueMarkersOnAndOff);
       control.state('remove-markers');
     }
   }, {
     icon: '<span id="heartfully"></span>',
     stateName: 'remove-markers',
     onClick: function(control) {
       my.map.removeLayer(testBlueMarkersOnAndOff);
       control.state('add-markers');
     },
     title: 'remove markers'
   }]
 });
 toggle.addTo(my.map);
/*=====  End of Test Toggle Button  ======*/

 L.easyButton( '<span id="resety">></span>', function(){
   my.map.setView([55, -2], 1);
 }).addTo(my.map);


/*----------  This ends the file  ----------*/
  return my;
}
/*----------  This ends the file  ----------*/
