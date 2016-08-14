// This is an example Chaism plugin that uses Leaflet.js.
function ChiasmLeaflet() {

  var my = ChiasmComponent({
    center: [0, 0],
    zoom: 2
  });

  // This line of code lets you see what the center value is when you pan in the map.
  // my.when("center", console.log, console);

  // Expose a div element that will be added to the Chiasm container.
  // This is a special property that Chiasm looks for after components are constructed.
  my.el = document.createElement("div");

  // When you zoom out all the way, this line makes the background black
  // (by default it is gray).
  d3.select(my.el).style("background-color", "black");

  // Instantiate the Leaflet map, see docs at
  // http://leafletjs.com/reference.html#map-constructor
  my.map = L.map(my.el, {
    zoom: 1,
    minZoom: 2,
    maxZoom: 5,
    // scrollWheelZoom: false,
    center: [40.7127837, -74.0059413],
    // Turn off the "Leaflet" link in the lower right corner.
    // Leaflet is properly attributed in the README.
    attributionControl: false

  }).setView(my.center, my.zoom);

  // Add the black & white style map layer.
  // Found by browsing http://leaflet-extras.github.io/leaflet-providers/preview/
  // TODO move this to configuration.
  var Stamen_Watercolor = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}',{
    filter: function () {
      new L.CSSFilter({
          filters: ['invert(100%)']
        }).render(this);
    },
    noWrap: true,
    continuousWorld : false,
    reuseTiles : true,
    ext: 'png'
  }).addTo(my.map);


  // Stamen_Watercolor.setFilter(function (image, ctx) {
  //    new L.CanvasFilter({
  //        channelFilter: function (imageData) {
  //            return new L.ChannelFilters.Colorize({
  //                values: [100, 100]
  //            }).render(imageData);
  //        }
  //    }).render(this, image, ctx);
  // });


 // var Stamen_Watercolor = new L.StamenTileLayer('toner');

 // Stamen_Watercolor.setFilter(function (image, ctx) {
 //     new L.CanvasFilter({
 //         channelFilter: function (imageData) {
 //             return new L.ChannelFilters.Colorize({
 //                 values: [100, 100]
 //             }).render(imageData);
 //         }
 //     }).render(this, image, ctx);
 // });


  // Returns the current Leaflet map center
  // in a format that D3 understands: [longitude, latitude]
  function getCenter(){
    var center = my.map.getCenter();
    return [center.lng, center.lat];
  }

  var onMove = _.throttle(function (){
    my.center = getCenter();
    my.zoom = my.map.getZoom();

    var bounds = my.map.getBounds();
    my.longitudeInterval = [bounds.getWest(), bounds.getEast()];
    my.latitudeInterval = [bounds.getSouth(), bounds.getNorth()];

  }, 1000);

  // Sets the Leaflet map center to be the given center.
  // Note that Leaflet will immediately trigger a "move"
  // event
  function setCenter(center){
    my.map.off("move", onMove);
    my.map.panTo(L.latLng(center[1], center[0]), {
      animate: false
    });
    my.map.on("move", onMove);
  }

  my.map.on("move", onMove);

  // If the center was set externally, pan the map to that center.
  my.when(["center", "zoom"], function (center, zoom){

    // This comparison logic is necessary to avoid an infinite loop
    // in bidirectional data binding.
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

  return my;
}