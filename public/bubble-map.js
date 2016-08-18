
var iAmABuffaloDivIconExtended = L.DivIcon.extend({
  options: {
    iconSize:     [38, 25],
    html: '<div class="tinyBuff"></div>',
    className: 'bufficon',
  }
});
// var buffaloIcon = L.Icon.extend({
//   options: {
//     iconSize:     [38, 25],
//     html: '<div id="leaflet-marker-icon></div>',
//     className: 'bufficon',
//   }
// });
var LeafIcon = L.Icon.extend({
  options: {
    shadowUrl: 'img/leaf-shadow.png',
    iconSize:     [28, 85],
    shadowSize:   [40, 54],
    iconAnchor:   [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor:  [-3, -76],
    className: 'leaf-icon',
    html: '<div class="flower"></div>'
  }
});
var buffaloIconNewer = new iAmABuffaloDivIconExtended({iconUrl : 'img/buffalo.png'});
// var buffaloIconNew = new buffaloIcon({iconUrl : 'img/buffalo.png'});
var greenIcon = new LeafIcon({iconUrl: 'img/leaf-green.png'});

L.icon = function (options) {
    return new L.Icon(options);
};
function BubbleMap() {
    // TODO move these to config.
  var latitudeColumn = "latitude";
  var longitudeColumn = "longitude";
    // Extend chiasm-leaflet using composition (not inheritence).
  var my = ChiasmLeaflet();
    // my.map is the Leaflet instance.
  my.when("data", function (data){
      // console.log(data,"asshole");
    my.cleanData = data.filter(function (d) {
      var lat = d[latitudeColumn];
      var lng = d[longitudeColumn];
      if(isNaN(+lat) || isNaN(+lng)){
        // console.log(`lat:${lat} + lng:${lng} Invalid.`);
        return false;
      }
      return true;
    });
  });
  my.addPublicProperties({
      // This is the data column that maps to bubble size. "r" stands for radius.
    rColumn: Model.None,
      // The circle radius used if rColumn is not specified.
    rDefault: 3,
      // The range of the radius scale if rColumn is specified.
    rMin: 0,
    rMax: 10,
  });
  var rScale = d3.scale.sqrt();
  // Add a semi-transparent white layer to fade black & white base map to the background.
  var canvasTiles = L.tileLayer.canvas();
  canvasTiles.drawTile = function(canvas, tilePoint, zoom) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(255, 255, 250, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  canvasTiles.addTo(my.map);
  // Generate a function or constant for circle radius, depending on whether or not rColumn is defined.
  my.when(["datasetForScaleDomain", "rColumn", "rDefault", "rMin", "rMax"],
      function (dataset, rColumn, rDefault, rMin, rMax){
    var data = dataset.data;
    if(rColumn === Model.None){
      my.r = function (){ return rDefault; };
    } else {
      rScale
        .domain(d3.extent(data, function (d){ return d[rColumn]; }))
        .range([rMin, rMax]);
      my.r = function (d){ return rScale(d[rColumn]); };
      // This line added to demonstrate working example my.r = function (){ return rDefault; };
    }
  });
  var oldMarkers = [];
  var locationRandomizer = [];
  var randomizer = function(object){
    if(!locationRandomizer.includes(object)){
      object.latitude = object.latitude + Math.random(0,500);
      object.longitude = object.longitude + Math.random(0,500);
      locationRandomizer.push(object);
    }
  };
  my.when(["cleanData", "r"], _.throttle(function (data, r) {
    oldMarkers.forEach(function (marker){
      my.map.removeLayer(marker);
    });
      oldMarkers = data.map(function (d){
        randomizer(d);
        var lat = locationRandomizer[locationRandomizer.indexOf(d)].latitude;
        var lng = locationRandomizer[locationRandomizer.indexOf(d)].longitude;
        var markerCenter = L.latLng(lat, lng);
        var circleMarker = L.circleMarker(markerCenter, {
          color: "#FF4136",
          weight: 18,
          clickable: true,
          width: '20px',
          height: '20px'
        });
        // setInterval( () => {
        //   // console.log("Lol ur mama sux me");
        //     my.map.removeLayer(circleMarker);

        //   circleMarker.latitude = parseFloat(Math.random()+100);
        //   circleMarker.longitude = parseFloat(Math.random()+100);
        //   circleMarker.addto(my.map);
        // }, 500);

        L.marker([51.5, -0.09], {icon: greenIcon}).addTo(my.map).bindPopup("I am a green leaf.");
        L.marker([46.8567, -1.3508], {icon: buffaloIconNewer}).addTo(my.map);

        var myMovingMarker = L.Marker.theMovingFromJS([[46.8567, -1.3508],[63.45, 133.523333]],
          [92000],  {icon: buffaloIconNewer}).addTo(my.map);
        var myMovingMarkerAgain = L.Marker.theMovingFromJS([[49.8567, 2.3508],[55.45, 126.523333]],
          [95000],  {icon: buffaloIconNewer}).addTo(my.map);
        myMovingMarker.start();
        myMovingMarkerAgain.start();



        circleMarker.setRadius(r(d));
        // circleMarker.on('add', function(){
        //   doAnimations();
        //   // putting this in setInterval so it runs forever
        //   setInterval(function(){
        //     doAnimations();
        //   }, 1000);
        // });

        // function doAnimations(){
        //   circleMarker.on('add', function(){
        //     var myIcon = document.querySelector('.leaflet-clickable');
        //     setTimeout(function(){
        //       myIcon.style.width = '60px',
        //       myIcon.style.height = '60px'
        //     }, 1000);
        //   });
        // }
        circleMarker.addTo(my.map);
        return circleMarker;
      });
  }, 1000));

  return my;
}
/*----------  BubbleMap Function Ends!  ----------*/

