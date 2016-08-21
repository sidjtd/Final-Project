var popup = new L.Popup({
  closeOnClick: true,
  autoPan: true,
  closeButton: false,
  autoPanPadding: [10,10]
});
/*=============================================
=            Icon Classes and more            =
=============================================*/
var iAmABuffaloDivIconExtended = L.DivIcon.extend({
  options: {
    riseOnHover: true,
    riseOffSet: 20,
    iconSize:     [38, 25],
    html: '<div class="tinyBuffy"></div>',
    className: 'tinyBuff'
  }
});
var buffaloIconNewer = new iAmABuffaloDivIconExtended();

var randomText = function() {
  var randomSayings = ["Yo","LOL","WTF?","Rekt","Oh ya","Hadoken","Giggity","What up","Lol animals","You got this!","Don't poke me","That tickles!","Leave me alone","Make America great again"];
    var phrase = Math.floor(Math.random() * randomSayings.length);
    return randomSayings[phrase];
};

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
  });/*----- my.when ends  ------*/

  my.addPublicProperties({// This is the data column that maps to bubble size. "r" stands for radius.
    rColumn: Model.None,// The circle radius used if rColumn is not specified.
    rDefault: 3,// The range of the radius scale if rColumn is specified.
    rMin: 0,
    rMax: 10,
  });
  var rScale = d3.scale.sqrt();// Add a semi-transparent white layer to fade black & white base map to the background.

  /*====================================
  =            Canvas Tiles            =
  ====================================*/
  var canvasTiles = L.tileLayer.canvas();
  canvasTiles.drawTile = function(canvas, unused, zoom) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(255, 255, 250, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  canvasTiles.addTo(my.map);
  /*=====  End of Canvas Tiles  ======*/

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
  }); /*----- my.when ends  ------*/
  var genericAnimal;
  var firstRunOnly = true;
  var oldMarkers = [];
  var allDataHoldingArr = [];
  var typeStore = [];
  var genericAnimalStore = [];

  my.when(["cleanData", "r"], _.throttle(function (data, rr_param) {

    var randomizer = function(obj){
      if(!allDataHoldingArr.includes(obj)){
        obj.latitude = obj.latitude + Math.random(0,500);
        obj.longitude = obj.longitude + Math.random(0,500);
        allDataHoldingArr.push(obj);
      }
    };

  oldMarkers.forEach(function (mark_param){
    my.map.removeLayer(mark_param);
  });
  oldMarkers = data.map(function (param_b4_oldMarks){
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

  genericAnimal = L.marker(markerCenter, {
  icon: buffaloIconNewer,
  name: aniCommonName,
  autoPan: false,
  type : aniType
  }).bindPopup(`${aniCommonName} says: \"${randomText()}!\"`);
  genericAnimal.on('dragend', function(el){
    genericAnimal.openPopup();
  });
  genericAnimalStore.push(genericAnimal);

  for(var ix = 0; ix < genericAnimalStore.length; ix++){
    if(genericAnimalStore[ix].options.type === "air" && genericAnimalStore[ix].options.type !== "land"){
      genericAnimalStore[ix].options.icon.options.html ='<div class="tinyBirdy"></div>';
      console.log("Why so much");
    }
    else if (genericAnimalStore[ix].options.type === "land"){
      genericAnimalStore[ix].options.icon.options.html ='<div class="tinyBuffyA"></div>';
      genericAnimalStore[ix].options.icon.options.className = 'tinyBuffA';
    }else{
      genericAnimalStore[ix].options.icon.options.html ='<div class="tinyFishy"></div>';
      genericAnimalStore[ix].options.icon.options.className = 'tinyFish';
    }
      genericAnimalStore[ix].addTo(my.map);
  }

  function onMarkerClick(click_el) {
      console.log("You clicked " + click_el.target.options.icon + click_el.target.options.name);
  }genericAnimal.on('click', onMarkerClick);

  my.when(["data"],
      function (dataset){
  }); /*----- my.when ends  ------*/

var nothing = {};
    return nothing;
    });
  },
  1000
  ));

  /*-----  .when ends here  -------*/
  return my;
}




/*--  BubbleMap => Ends! --*/
/*=====  End of Bubble Circle Area  ======*/

