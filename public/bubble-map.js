var popup = new L.Popup({
  closeOnClick: true,
  autoPan: true,
  closeButton: false,
  autoPanPadding: [10,10]
});
/*=============================================
=            Icon Classes and more            =
=============================================*/
var customMarker = L.Marker.extend({
  options : {
  }
  });
var iAmABuffaloDivIconExtended = L.DivIcon.extend({
  options: {
    riseOnHover: true,
    riseOffSet: 20,
    iconSize:     [38, 25],
    html: '<div class="tinyBuffy"></div>',
    className: 'tinyBuff'
  }
});

var LeafIcon = L.Icon.extend({
  options: {
    riseOnHover: true,
    riseOffSet: 20,
    popupAnchor:  [-3, -76],
    iconSize:     [28, 85],
    iconAnchor:   [22, 94],
    shadowAnchor: [4, 62],
    shadowSize:   [40, 54],
    shadowUrl: 'img/leaf-shadow.png',
    className: 'leaf-icon',
    html: '<div class="flower"></div>'
  }
});
var buffaloIconNewer = new iAmABuffaloDivIconExtended();
// var buffaloIconNew = new buffaloIcon({iconUrl : 'img/buffalo.png'});
var greenIcon = new LeafIcon({iconUrl: 'img/leaf-green.png'});

L.icon = function (icon_parameters) {
    return new L.Icon(icon_parameters);
};

function randomText() {
  var randomSayings = [
    "Yo",
    "Don't poke me",
    "That tickles!",
    "Leave me alone",
    "WTF?",
    "Touch me more",
    "Oh ya",
    "Giggity",
    "What up",
    "You got this!",
    "LOL",
    "Make America great again",
    "Hadoken",
    "Lol animals",
    "Rekt"
    ];
    var i = Math.floor(Math.random() * randomSayings.length);
    return randomSayings[i];
}
/*=====  End of Icon Classes and more  ======*/

/*==========================================
=            Bubble Circle Area            =
==========================================*/
function BubbleMap() {
  var latitudeColumn = "latitude";
  var longitudeColumn = "longitude";
  var my = ChiasmLeaflet(); //my.map is the Leaflet instance.

  my.when("data", function (when_param){
    my.cleanData = when_param.filter(function (cleanData_param) {
      var lat = cleanData_param[latitudeColumn];
      var lng = cleanData_param[longitudeColumn];
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
  canvasTiles.drawTile = function(canvas, unused, zoom) {
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
        .domain(d3.extent(data, function (domn_param){ return domn_param[rColumn]; }))
        .range([rMin, rMax]);
      my.r = function (domn_param){ return rScale(domn_param[rColumn]); };
      // This line added to demonstrate working example my.r = function (){ return rDefault; };
    }
  });
  var oldMarkers = [];
  var allDataHoldingArr = [];
  var typeStore = [];
  var randomizer = function(obj){
    if(!allDataHoldingArr.includes(obj)){
      obj.latitude = obj.latitude + Math.random(0,500);
      obj.longitude = obj.longitude + Math.random(0,500);
      allDataHoldingArr.push(obj);
    }
  };
  my.when(["cleanData", "r"], _.throttle(function (data, rr_param) {

    oldMarkers.forEach(function (mark_param){
      my.map.removeLayer(mark_param);
    });
                      console.log("Dude I happen twice for some reason!");

    oldMarkers = data.map(function (param_b4_oldMarks){

      // console.log("what da heck",allDataHoldingArr);
      // console.log(param_b4_oldMarks);

      randomizer(param_b4_oldMarks);
      var lat = allDataHoldingArr[allDataHoldingArr.indexOf(param_b4_oldMarks)].latitude;
      var lng = allDataHoldingArr[allDataHoldingArr.indexOf(param_b4_oldMarks)].longitude;
      var markerCenter = L.latLng(lat, lng);

      String.prototype.capitalizeFirstLetter = function(string) {
         return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
      };

      var aniCommonName = allDataHoldingArr[allDataHoldingArr.indexOf(param_b4_oldMarks)]['Common name'].capitalizeFirstLetter();
      var aniType = allDataHoldingArr[allDataHoldingArr.indexOf(param_b4_oldMarks)]['Type'];
      typeStore.push(aniType);

      // console.log(typeStore,"typestore");
        // var circleMarker = L.divIcon(markerCenter, {
        // });
        // var circleMarker = L.circleMarker(markerCenter, {
        //   color: "#FF4136",
        //   weight: 18,
        //   clickable: true,
        //   width: '20px',
        //   height: '20px'
        // });
        // setInterval( () => {
        //   // console.log("Lol ur mama sux me");
        //     my.map.removeLayer(circleMarker);

        //   circleMarker.latitude = parseFloat(Math.random()+100);
        //   circleMarker.longitude = parseFloat(Math.random()+100);
        //   circleMarker.addto(my.map);
        // }, 500);


      var genericAnimalStore = [];
      var greenPlant = L.marker([51.5, -0.09], {
        icon: greenIcon})
        .addTo(my.map)
        .bindPopup("I am a green leaf.");

        function bindNewPopup(){
            this.bindPopup(randomText());
        }
      // for(var i = 0; i < aniType.length; i++){
        var genericAnimal = L.marker(markerCenter, {
          icon: buffaloIconNewer,
          name: aniCommonName,
          autoPan: false,
          type : aniType
          })
          // .on('click', bindNewPopup)
          .bindPopup(`${aniCommonName} says: \"${randomText()}!\"`)
          .addTo(my.map);
        // console.log(genericAnimal.options.name);
        // console.log(genericAnimal);
        genericAnimal.on('dragend', function(el){
          genericAnimal.openPopup();
        });



        // var myMovingMarker = L.Marker.theMovingFromJS([[46.8567, -1.3508],[63.45, 133.523333]],
        //   [92000],  {icon: buffaloIconNewer}).addTo(my.map);
        // var myMovingMarkerAgain = L.Marker.theMovingFromJS([[49.8567, 2.3508],[55.45, 126.523333]],
        //   [95000],  {icon: buffaloIconNewer}).addTo(my.map);
        // myMovingMarker.start();
        // myMovingMarkerAgain.start();

      //               console.log("Its never ending");
      // circleMarker.setRadius(rr_param(param_b4_oldMarks));

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
      genericAnimal.addTo(my.map);
      // }  for loop bullshittitsfladsj;fjadfslkfjkl;ajsdkl;fdjsa;klsfjkl;fdsjl;fsk
      // console.log(circleMarker);



      function onMarkerClick(click_el) {
          console.log("You clicked the marker " + click_el.target.options.type+' '+click_el.target.options.name);
      }genericAnimal.on('click', onMarkerClick);

      return genericAnimal;
    });
  }, 1000));
  /*-----  .when ends here  -------*/



  return my;
}




/*--  BubbleMap => Ends! --*/
/*=====  End of Bubble Circle Area  ======*/

