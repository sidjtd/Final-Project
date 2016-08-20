/*===========================================
=            Say Hello to Chiasm            =
===========================================*/
function ChiasmLeaflet() {
  my = ChiasmComponent({
   zoom: 1,
   center: [36.21, 138.25],
   padding: [100,100]
  });
  // This line of code lets you see what the center value is when you pan in the map.
  // my.when("center", console.log, console);
  my.el = document.createElement("div");
  d3.select(my.el).style("background-color", "white");

  var p1 = L.point(10, 10),
      p2 = L.point(40, 60),
      bounds = L.bounds(p1, p2);
  // Instantiate the Leaflet map, see docs at http://leafletjs.com/reference.html#map-constructor
  /*=====  End of Say Hello to Chiasm  ======*/

/*=========================================
=            Lets make the map            =
=========================================*/
  my.map = L.map(my.el, {
    zoom: 2,
    minZoom: 2,
    maxZoom: 5,
    autoPan: false,
    intertia: false,
    scrollWheelZoom: false,
    zoomControl: true,
    worldCopyJump: true,
    attributionControl: false,
    // layers : [animalLayer],
 //    center: [36.21, 138.25],
    markerZoomAnimation: true
    // maxBounds : true
  }).setView([35, -2], 2);
  // Found by browsing http://leaflet-extras.github.io/leaflet-providers/preview/
 /*=====  End of Lets make the map  ======*/

/*========================================
=            Dragging Methods            =
========================================*/
  L.Map.mergeOptions({
    dragging: true,
    inertia: !L.Browser.android23,
    inertiaDeceleration: 3400, // px/s^2
    inertiaMaxSpeed: Infinity, // px/s
    inertiaThreshold: L.Browser.touch ? 32 : 18, // ms
    easeLinearity: 0.25,
    // TODO refactor, move to CRS
    worldCopyJump: false
  });
  L.Map.Drag = L.Handler.extend({
    addHooks: function () {
      if (!this._draggable) {
        var map = this._map;
        this._draggable = new L.Draggable(map._mapPane, map._container);
        this._draggable.on({
          'dragstart': this._onDragStart,
          'drag': this._onDrag,
          'dragend': this._onDragEnd
        }, this);
        if (map.options.worldCopyJump) {
          this._draggable.on('predrag', this._onPreDrag, this);
          map.on('viewreset', this._onViewReset, this);
          this._onViewReset();
        }
      }
      this._draggable.enable();
    },
    removeHooks: function () {
      this._draggable.disable();
    },
    moved: function () {
      return this._draggable && this._draggable._moved;
    },
    _onDragStart: function () {
      var map = this._map;
      if (map._panAnim) {
        map._panAnim.stop();
      }
      map
          .fire('movestart')
          .fire('dragstart');
      if (map.options.inertia) {
        this._positions = [];
        this._times = [];
      }
    },
    _onDrag: function () {
      if (this._map.options.inertia) {
        var time = this._lastTime = +new Date(),
            pos = this._lastPos = this._draggable._newPos;
        this._positions.push(pos);
        this._times.push(time);
        if (time - this._times[0] > 200) {
          this._positions.shift();
          this._times.shift();
        }
      }
      this._map
          .fire('move')
          .fire('drag');
    },
    _onViewReset: function () {
      // TODO fix hardcoded Earth values
      var pxCenter = this._map.getSize()._divideBy(2),
          pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);
      this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
      this._worldWidth = this._map.project([0, 180]).x;
    },
    _onPreDrag: function () {
      // TODO refactor to be able to adjust map pane position after zoom
      var worldWidth = this._worldWidth,
          halfWidth = Math.round(worldWidth / 2),
          dx = this._initialWorldOffset,
          x = this._draggable._newPos.x,
          newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
          newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
          newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

      this._draggable._newPos.x = newX;
    },
    _onDragEnd: function () {
      var map = this._map,
          options = map.options,
          delay = +new Date() - this._lastTime,
          noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];
      map.fire('dragend');
      if (noInertia) {
        map.fire('moveend');
      } else {
        var direction = this._lastPos.subtract(this._positions[0]),
            duration = (this._lastTime + delay - this._times[0]) / 1000,
            ease = options.easeLinearity,
            speedVector = direction.multiplyBy(ease / duration),
            speed = speedVector.distanceTo([0, 0]),
            limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
            limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),
            decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
            offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();
        if (!offset.x || !offset.y) {
          map.fire('moveend');
        } else {
          L.Util.requestAnimFrame(function () {
            map.panBy(offset, {
              duration: decelerationDuration,
              easeLinearity: ease,
              noMoveStart: true
            });
          });
        }
      }
    }
  });
  L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);
  /*=====  End of Dragging Methods  ======*/

/*====================================================
=            Lets Deal with the tileLayer            =
====================================================*/
  var Stamen_Watercolor = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}',{
//     noWrap: false,
//     continuousWorld : true,
    reuseTiles : true,
    ext: 'png'
  }).addTo(my.map);

  // my.map.fitBounds([
  //   [-70,160],
  //   [76, -160]
  // ]);

  /*----------  Leys play with Layers and Overlays  ----------*/
  var animalLayer = L.layerGroup().addTo(my.map);

  var overlay = {'Animals': animalLayer};
  L.control.layers(null, overlay).addTo(my.map);

  // var southWest = L.latLng(40.712, -74.227);
  //     northEast = L.latLng(40.774, -74.125);
  //     bounds = L.latLngBounds(southWest, northEast);
  // my.map.fitBounds(bounds);

  var imageUrl = 'img/japanmap.jpg',
      imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
  L.imageOverlay(imageUrl, imageBounds).addTo(my.map);

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
  /*=====  End of Lets Deal with the tileLayer  ======*/

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
   my.map.setView([35, -2], 2);
 }).addTo(my.map);


/*----------  This ends the file  ----------*/
  return my;
}
/*----------  This ends the file  ----------*/
