"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function getDataset(_x) {
  return _getDataset.apply(this, arguments);
}

function _getDataset() {
  _getDataset = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(name) {
    var url, jsonQuery, _yield$axios$post, data, wkt;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = "/b2find/query";
            jsonQuery = {
              "query": "*:*",
              "filter": "name:" + name,
              "limit": 1,
              "fields": ["extras_spatial"]
            };
            _context.next = 4;
            return axios.post(url, jsonQuery);

          case 4:
            _yield$axios$post = _context.sent;
            data = _yield$axios$post.data;
            wkt = data["response"]["docs"][0]["extras_spatial"]; //console.log(wkt);

            return _context.abrupt("return", wkt);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getDataset.apply(this, arguments);
}

;

function useDatasetName() {
  var pathname = window.location.pathname;
  var items = pathname.split("/");
  var name = items[items.length - 1];
  return name;
}

function useDataset() {
  var name = useDatasetName();

  var _ReactQuery$useQuery = ReactQuery.useQuery(["dataset", name], function () {
    return getDataset(name);
  }),
      data = _ReactQuery$useQuery.data,
      isFetching = _ReactQuery$useQuery.isFetching,
      isSuccess = _ReactQuery$useQuery.isSuccess; //console.log("use dataset", name, data, isSuccess);


  return [data, isFetching, isSuccess];
}

function DatasetMap() {
  var _React$useState = React.useState(),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      map = _React$useState2[0],
      setMap = _React$useState2[1];

  var _React$useState3 = React.useState(0),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      zoom = _React$useState4[0],
      setZoom = _React$useState4[1];

  var _React$useState5 = React.useState([0.0, 0.0]),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      center = _React$useState6[0],
      setCenter = _React$useState6[1];

  var _React$useState7 = React.useState(),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      vectorLayer = _React$useState8[0],
      setVectorLayer = _React$useState8[1];

  var _useDataset = useDataset(),
      _useDataset2 = _slicedToArray(_useDataset, 3),
      dataset = _useDataset2[0],
      isFetching = _useDataset2[1],
      isSuccess = _useDataset2[2]; // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670


  var mapRef = React.useRef();
  mapRef.current = map; // Define the styles that are to be passed to the map instance:

  var mapStyles = {
    // overflow: "hidden",
    width: "100%",
    height: "280px"
  };
  var stamen = new ol.layer.Tile({
    source: new ol.source.Stamen({
      layer: 'toner'
    })
  });
  var osm = new ol.layer.Tile({
    source: new ol.source.OSM()
  });
  var initialVectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
  });
  var stroke = new ol.style.Stroke({
    color: 'black',
    width: 2
  });
  var fill = new ol.style.Fill({
    color: 'red'
  });
  var square = new ol.style.Style({
    image: new ol.style.RegularShape({
      fill: fill,
      stroke: stroke,
      points: 4,
      radius: 10,
      angle: Math.PI / 4
    })
  });
  React.useEffect(function () {
    //console.log("Initialised for the first time");
    var myMap = new ol.Map({
      target: mapRef.current,
      layers: [stamen, initialVectorLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat(center),
        zoom: zoom
      })
    });
    setMap(myMap);
    setVectorLayer(initialVectorLayer);
  }, []);
  React.useEffect(function () {
    //console.log("dataset", isSuccess, dataset);
    if (map != null && isSuccess) {
      var format = new ol.format.WKT();
      var feature = format.readFeature(dataset, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      console.log("feature", feature);

      if (feature.getGeometry().getType() == "Point") {
        feature.setStyle(square);
      }

      var source = new ol.source.Vector({
        features: [feature]
      });
      var vector = new ol.layer.Vector({
        source: source
      });
      map.removeLayer(vectorLayer);
      map.addLayer(vector);
      setVectorLayer(vector); //map.zoomToExtent(vector.getExtent());
      //console.log("vector extent", source.getExtent());
      // var zoomToExtentControl = new ol.control.ZoomToExtent({
      //   extent: source.getExtent(),
      // });

      map.getView().fit(source.getExtent(), {
        size: map.getSize(),
        maxZoom: 8
      }); //map.addControl(zoomToExtentControl);
    }
  }, [isSuccess]);
  return /*#__PURE__*/React.createElement("div", {
    ref: mapRef,
    style: mapStyles
  });
}

var queryClient = new ReactQuery.QueryClient();
ReactDOM.render( /*#__PURE__*/React.createElement(ReactQuery.QueryClientProvider, {
  client: queryClient
}, /*#__PURE__*/React.createElement(DatasetMap, null)), document.getElementById('b2find_map'));