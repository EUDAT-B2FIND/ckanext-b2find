"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function toGeoJSON(props) {
  var columns = props.columns;
  var rows = props.rows;
  var minX = props.minX;
  var maxX = props.maxX;
  var minY = props.minY;
  var maxY = props.maxY;
  var counts = props.counts_ints2D;
  var geojson = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326'
      }
    },
    features: []
  }; // If our min longitude is greater than max longitude, we're crossing
  // the 180th meridian (date line).

  var crosses_meridian = minX > maxX; // Bucket width needs to be calculated differently when crossing the
  // meridian since it wraps.

  var bucket_width = null;

  if (crosses_meridian) {
    bucket_width = (360 - abs(maxX - minX)) / columns;
  } else {
    bucket_width = (maxX - minX) / columns;
  }

  var bucket_height = (maxY - minY) / rows;
  counts.forEach(function (row, rowIndex) {
    if (!row) return;
    row.forEach(function (column, columnIndex) {
      if (!column) return; // Put the count in the middle of the bucket (adding a half height and width).

      var lat = maxY - (rowIndex + 1) * bucket_height + bucket_height / 2;
      var lon = minX + columnIndex * bucket_width + bucket_width / 2; // We crossed the meridian, so wrap back around to negative.

      if (lon > 180) {
        lon = -1 * (180 - lon % 180);
      }

      var point = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          //name: "point",
          count: column
        }
      };
      geojson.features.push(point);
    });
  });
  return geojson;
}

function getItems(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8) {
  return _getItems.apply(this, arguments);
}

function _getItems() {
  _getItems = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(query, filter, facetFilter, field, type, sort, limit, extent) {
    var url, sortParam, jsonQuery, _yield$axios$post, data, items;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = "/b2find/query";
            sortParam = {
              "count": "desc"
            };

            if (sort == "cd") {
              sortParam = {
                "count": "desc"
              };
            } else if (sort == "ca") {
              sortParam = {
                "count": "asc"
              };
            } else if (sort == "id") {
              sortParam = {
                "index": "desc"
              };
            } else if (sort == "ia") {
              sortParam = {
                "index": "asc"
              };
            }

            jsonQuery = {
              "query": {
                "edismax": {
                  "df": "text",
                  "qf": "name^4 title^4 tags^2 groups^2 text",
                  //"qf": "name^4 title^4 author^2 tags^2 groups^2 text",
                  "tie": "0.1",
                  "mm": "2<-1 5<80%",
                  "query": query,
                  "q.alt": "*:*",
                  "q.op": "AND"
                }
              },
              "filter": filter,
              "limit": 0,
              // "fields": [],
              "facet": {}
            };

            if (type == "range") {
              jsonQuery["facet"][field] = {
                "type": "range",
                "field": field,
                "start": "-1000-01-01T00:00:00Z/YEAR",
                "end": "NOW+10YEARS/YEAR",
                "gap": "+1YEARS",
                // "limit": limit,
                "mincount": 1 // "sort": _translate_sort(sort),

              };
            } else if (type == "heatmap") {
              jsonQuery["facet"][field] = {
                "type": "heatmap",
                "field": field,
                "geom": extent //"gridLevel": 4,
                //"format": "png",

              };
            } else {
              jsonQuery["facet"][field] = {
                "type": "terms",
                "field": field,
                "limit": limit,
                "mincount": 1,
                "sort": sortParam
              };

              if (facetFilter) {
                // prefix
                jsonQuery["facet"][field]["prefix"] = facetFilter;
              }
            } //console.log(jsonQuery);


            _context.next = 7;
            return axios.post(url, jsonQuery);

          case 7:
            _yield$axios$post = _context.sent;
            data = _yield$axios$post.data;
            items = []; //console.log(field, data["facets"]);

            if ("facets" in data) {
              if (field in data["facets"]) {
                if (type == "heatmap") {
                  items = toGeoJSON(data["facets"][field]); //console.log("heatmap items", items);
                } else {
                  items = data["facets"][field]["buckets"];
                }
              }
            }

            return _context.abrupt("return", items);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getItems.apply(this, arguments);
}

;

function useSolrParams() {
  var fields = ["groups", "author", "tags", "extras_Instrument", "extras_Discipline", "extras_Language", "extras_Publisher", "extras_Contributor", "extras_ResourceType", "extras_Format", "extras_Size", "extras_FundingReference", "extras_OpenAccess", "extras_TempCoverage", "extras_PublicationYear" //"extras_bbox",
  ];
  var searchParams = new URLSearchParams(window.location.search);
  var query = "*:*";

  if (searchParams.has("q")) {
    query = searchParams.get("q");

    if (query.length > 3) {
      query += "~";
    }
  }

  var filter = [];

  for (var _i = 0, _fields = fields; _i < _fields.length; _i++) {
    var field = _fields[_i];

    var _iterator = _createForOfIteratorHelper(searchParams.getAll(field)),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var val = _step.value;
        filter.push([field, ':', '\"', val, '\"'].join('')); //filter.push([field, ':', val].join(''));
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    ;
  }

  ;

  if (searchParams.has("extras_bbox")) {
    filter.push(['extras_bbox:', searchParams.get("extras_bbox")].join(''));
  } //console.log(filter);


  return [query, filter];
}

function useSolrQuery(field, type, facetFilter, sort, limit, extent) {
  var _useSolrParams = useSolrParams(),
      _useSolrParams2 = _slicedToArray(_useSolrParams, 2),
      query = _useSolrParams2[0],
      filter = _useSolrParams2[1];

  var _ReactQuery$useQuery = ReactQuery.useQuery(['items', field, facetFilter, sort, limit, extent], function () {
    return getItems(query, filter, facetFilter, field, type, sort, limit, extent);
  }),
      data = _ReactQuery$useQuery.data,
      isFetching = _ReactQuery$useQuery.isFetching,
      isSuccess = _ReactQuery$useQuery.isSuccess; //console.log("solr query", isSuccess, extent);


  return [data, isFetching, isSuccess];
}

function Header(props) {
  var target = "#" + props.id;
  var title = props.title;

  var _React$useState = React.useState(false),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      open = _React$useState2[0],
      setOpen = _React$useState2[1];

  var style = "fa fa-chevron-down pull-right";

  if (open) {
    style = "fa fa-chevron-up pull-right";
  }

  return /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setOpen(!open);
    },
    className: "module-heading btn btn-default btn-block",
    type: "button",
    "data-toggle": "collapse",
    "data-target": target
  }, /*#__PURE__*/React.createElement("span", {
    className: "pull-left"
  }, title), /*#__PURE__*/React.createElement("i", {
    className: style
  }));
}

function SearchBar(props) {
  var filter = props.filter;
  var setFilter = props.setFilter;
  return /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Filter",
    className: "facet-filter",
    value: filter,
    onChange: function onChange(e) {
      return setFilter(e.target.value);
    }
  });
}

function SelectSort(props) {
  var sort = props.sort;
  var setSort = props.setSort;
  return /*#__PURE__*/React.createElement("select", {
    className: "facet-filter pull-right",
    onChange: function onChange(e) {
      return setSort(e.target.value);
    },
    defaultValue: sort
  }, /*#__PURE__*/React.createElement("option", {
    value: "ia"
  }, "A-Z"), /*#__PURE__*/React.createElement("option", {
    value: "id"
  }, "Z-A"), /*#__PURE__*/React.createElement("option", {
    value: "ca"
  }, "1-9"), /*#__PURE__*/React.createElement("option", {
    value: "cd"
  }, "9-1"));
}

function Item(props) {
  var field = props.field;
  var value = props.value;
  var title = props.title;
  var count = props.count;
  var label = title.substring(0, 30); // const [isActive, setActive] = React.useState(false);

  var location = window.location;
  var urlParams = new URLSearchParams(location.search);
  var isActive = false;
  var style = "nav-item";
  var values = urlParams.getAll(field);

  if (values.includes(value)) {
    isActive = true;
    urlParams["delete"](field);

    var _iterator2 = _createForOfIteratorHelper(values.entries()),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _step2$value = _slicedToArray(_step2.value, 2),
            i = _step2$value[0],
            val = _step2$value[1];

        if (val != value) {
          urlParams.append(field, val);
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  } else {
    urlParams.append(field, value);
  }

  var href = location.pathname + "?" + urlParams.toString(); // console.log(href);

  if (isActive) {
    style += " active";
  }

  return /*#__PURE__*/React.createElement("li", {
    className: style
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    title: value
  }, label, " ", /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, count)));
}

function getLabel(field, value, labels) {
  var label = value;

  if (field in labels) {
    if (value in labels[field]) {
      label = labels[field][value];
    }
  }

  return label;
}

function Items(props) {
  var items = props.items;
  var field = props.field;
  var url = '/b2find/facet_labels';

  var _React$useState3 = React.useState({}),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      labels = _React$useState4[0],
      setLabels = _React$useState4[1];

  React.useEffect(function () {
    axios.get(url).then(function (res) {
      setLabels(res.data);
    });
  }, []);
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": ""
  }, /*#__PURE__*/React.createElement("ul", {
    className: "list-unstyled nav nav-simple nav-facet"
  }, items.map(function (item, index) {
    return /*#__PURE__*/React.createElement(Item, {
      key: index,
      field: field,
      value: item.val,
      title: getLabel(field, item.val, labels),
      count: item.count
    });
  })));
}

function Footer(props) {
  var limit = props.limit;
  var setLimit = props.setLimit;
  var lessDisabled = limit <= 10;
  return /*#__PURE__*/React.createElement("p", {
    className: "module-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-default",
    disabled: lessDisabled,
    type: "button",
    onClick: function onClick(e) {
      return setLimit(limit - 10);
    }
  }, "Less"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-default pull-right",
    type: "button",
    onClick: function onClick(e) {
      return setLimit(limit + 10);
    }
  }, "More"));
}

function Facet(props) {
  var id = "facet_" + props.field;
  var title = props.title;
  var field = props.field;

  var _React$useState5 = React.useState(""),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      filter = _React$useState6[0],
      setFilter = _React$useState6[1];

  var _React$useState7 = React.useState("cd"),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      sort = _React$useState8[0],
      setSort = _React$useState8[1];

  var _React$useState9 = React.useState(10),
      _React$useState10 = _slicedToArray(_React$useState9, 2),
      limit = _React$useState10[0],
      setLimit = _React$useState10[1];

  var _useSolrQuery = useSolrQuery(field, "terms", filter, sort, limit, null),
      _useSolrQuery2 = _slicedToArray(_useSolrQuery, 3),
      items = _useSolrQuery2[0],
      isFetching = _useSolrQuery2[1],
      isSuccess = _useSolrQuery2[2];

  return /*#__PURE__*/React.createElement("section", {
    className: "module module-narrow module-shallow"
  }, /*#__PURE__*/React.createElement(Header, {
    id: id,
    title: title
  }), /*#__PURE__*/React.createElement("div", {
    id: id,
    className: "collapse"
  }, /*#__PURE__*/React.createElement(SearchBar, {
    filter: filter,
    setFilter: setFilter
  }), /*#__PURE__*/React.createElement(SelectSort, {
    sort: sort,
    setSort: setSort
  }), isSuccess && /*#__PURE__*/React.createElement(Items, {
    items: items,
    field: field
  }), /*#__PURE__*/React.createElement(Footer, {
    limit: limit,
    setLimit: setLimit
  })));
}

function TimeRangeSlider(props) {
  var id = "time_slider_" + props.field;
  var slider_id = "time_slider_range_widget_" + props.field;
  var items = props.items;
  var field = props.field;
  var values = items.map(function (item) {
    return parseInt(item.val.substr(0, 4));
  });
  var counts = items.map(function (item) {
    return item.count;
  });
  var location = window.location;
  var searchParams = new URLSearchParams(location.search);

  function plot() {
    // create a data source to hold data
    var source = new Bokeh.ColumnDataSource({
      data: {
        x: values,
        top: counts
      }
    }); // make a plot with some tools

    var plot = Bokeh.Plotting.figure({
      title: '',
      tools: 'xbox_select',
      toolbar_location: null,
      //y_axis_type: null,
      sizing_mode: 'stretch_width',
      height: 220,
      width: 280
    }); // bar plot

    plot.vbar({
      source: source,
      width: 0.9,
      alpha: 0.5
    }); // const select = plot.toolbar.select_one(Bokeh.BoxSelectTool);
    // plot.toolbar.active_multi = select;

    source.selected.on_change(source.selected, function () {
      var indices = source.selected.indices;
      var start = values[indices[0]];
      var end = values[indices[indices.length - 1]];
      searchParams.set(field, ["[", start, " TO ", end, "]"].join(''));
      window.location.href = location.pathname + "?" + searchParams.toString();
    });
    plot.y_range.start = 0;
    plot.x_range.range_padding = 0.1;
    plot.xaxis.major_label_orientation = 1;
    plot.xgrid.grid_line_color = null; // show the plot, replacing div element with id

    Bokeh.Plotting.show(plot, "#" + id);
  }

  React.useEffect(function () {
    plot();
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    id: id
  }));
}

function TimeRangeFacet(props) {
  var id = "facet_" + props.field;
  var title = props.title;
  var field = props.field;

  var _useSolrQuery3 = useSolrQuery(field, "range", null, "cd", 0, null),
      _useSolrQuery4 = _slicedToArray(_useSolrQuery3, 3),
      items = _useSolrQuery4[0],
      isFetching = _useSolrQuery4[1],
      isSuccess = _useSolrQuery4[2];

  return /*#__PURE__*/React.createElement("section", {
    className: "module module-narrow module-shallow"
  }, /*#__PURE__*/React.createElement(Header, {
    id: id,
    title: title
  }), isSuccess && /*#__PURE__*/React.createElement("div", {
    id: id,
    className: "collapse"
  }, /*#__PURE__*/React.createElement(TimeRangeSlider, {
    items: items,
    field: field
  })));
}

function MyMap(props) {
  var field = props.field;
  var bbox = props.bbox;

  var _React$useState11 = React.useState(),
      _React$useState12 = _slicedToArray(_React$useState11, 2),
      map = _React$useState12[0],
      setMap = _React$useState12[1];

  var _React$useState13 = React.useState(),
      _React$useState14 = _slicedToArray(_React$useState13, 2),
      heatmapLayer = _React$useState14[0],
      setHeatmapLayer = _React$useState14[1];

  var _React$useState15 = React.useState("[-180 -90 TO 180 90]"),
      _React$useState16 = _slicedToArray(_React$useState15, 2),
      extent = _React$useState16[0],
      setExtent = _React$useState16[1];

  var _useSolrQuery5 = useSolrQuery(field, "heatmap", null, "cd", 0, extent),
      _useSolrQuery6 = _slicedToArray(_useSolrQuery5, 3),
      items = _useSolrQuery6[0],
      isFetching = _useSolrQuery6[1],
      isSuccess = _useSolrQuery6[2];

  var _React$useState17 = React.useState(0),
      _React$useState18 = _slicedToArray(_React$useState17, 2),
      zoom = _React$useState18[0],
      setZoom = _React$useState18[1];

  var _React$useState19 = React.useState([0.0, 0.0]),
      _React$useState20 = _slicedToArray(_React$useState19, 2),
      center = _React$useState20[0],
      setCenter = _React$useState20[1];

  var location = window.location;
  var searchParams = new URLSearchParams(location.search); // create state ref that can be accessed in OpenLayers onclick callback function
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
  var initialHeatmap = new ol.layer.Heatmap({
    source: new ol.source.Vector()
  }); // a DragBox interaction used to select features by drawing boxes

  var dragBox = new ol.interaction.DragBox({
    condition: ol.events.condition.platformModifierKeyOnly
  });

  function onBoxEnd(evt) {
    var extent = dragBox.getGeometry().getExtent(); // [minx, miny, maxx, maxy].

    var lonLatExtent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326'); //console.log("boxend", lonLatExtent);
    // minY, minX, maxY, maxX
    // [10,-10 TO 15,20]

    var minY = Math.round(lonLatExtent[1] * 10000) / 10000;
    var minX = Math.round(lonLatExtent[0] * 10000) / 10000;
    var maxY = Math.round(lonLatExtent[3] * 10000) / 10000;
    var maxX = Math.round(lonLatExtent[2] * 10000) / 10000;
    searchParams.set(bbox, ["[", minY, ",", minX, " TO ", maxY, ",", maxX, "]"].join(''));
    window.location.href = location.pathname + "?" + searchParams.toString();
  }

  ;

  function wrapLon(value) {
    var worlds = Math.floor((value + 180) / 360);
    return value - worlds * 360;
  }

  ;

  function onMoveEnd(evt) {
    var map = evt.map;
    var mapExtent = map.getView().calculateExtent(map.getSize());
    var bottomLeft = ol.proj.toLonLat(ol.extent.getBottomLeft(mapExtent));
    var topRight = ol.proj.toLonLat(ol.extent.getTopRight(mapExtent)); //const minX = wrapLon(bottomLeft[0]);

    var minX = bottomLeft[0];
    var minY = bottomLeft[1]; //const maxX = wrapLon(topRight[0]);

    var maxX = topRight[0];
    var maxY = topRight[1]; //console.log(minX, minY, maxX, maxY);
    // [-180 -90 TO 180 90]

    var extent = ["[", minX, " ", minY, " TO ", maxX, " ", maxY, "]"].join(''); //console.log(extent);

    setExtent(extent);
  }

  ;
  React.useEffect(function () {
    //console.log("Initialised for the first time");
    var myMap = new ol.Map({
      target: mapRef.current,
      layers: [stamen, initialHeatmap],
      view: new ol.View({
        center: ol.proj.fromLonLat(center),
        zoom: zoom
      })
    });
    myMap.addInteraction(dragBox);
    dragBox.on('boxend', onBoxEnd);
    myMap.on('moveend', onMoveEnd);
    setMap(myMap);
    setHeatmapLayer(initialHeatmap);
  }, []);
  React.useEffect(function () {
    console.log("Detected change");
    console.log("items", isSuccess, items);

    if (map != null && isSuccess) {
      var features = new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      }).readFeatures(items);
      console.log("features", features);
      var source = new ol.source.Vector({
        features: features
      });
      var heatmap = new ol.layer.Heatmap({
        source: source,
        opacity: 0.6,
        //blur: 15,
        //radius: 8,
        weight: function weight(feature) {
          var count = parseInt(feature.get('count'), 10);
          return count;
        }
      });
      map.removeLayer(heatmapLayer);
      map.addLayer(heatmap);
      setHeatmapLayer(heatmap); //console.log(map.getLayers())
    }
  }, [isSuccess]);
  return /*#__PURE__*/React.createElement("div", {
    ref: mapRef,
    style: mapStyles
  });
}

function MapFacet(props) {
  var id = "facet_" + props.field;
  var title = props.title;
  var field = props.field;
  var bboxField = props.bbox;
  return /*#__PURE__*/React.createElement("section", {
    className: "module module-narrow module-shallow"
  }, /*#__PURE__*/React.createElement(Header, {
    title: title
  }), /*#__PURE__*/React.createElement("div", {
    id: id,
    className: "collapse.in"
  }, /*#__PURE__*/React.createElement(MyMap, {
    field: field,
    bbox: bboxField
  })));
}

function Facets(props) {
  var queryClient = new ReactQuery.QueryClient();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ReactQuery.QueryClientProvider, {
    client: queryClient
  }, /*#__PURE__*/React.createElement(MapFacet, {
    field: "extras_spatial",
    bbox: "extras_bbox",
    title: "Spatial Coverage"
  }), /*#__PURE__*/React.createElement(TimeRangeFacet, {
    field: "extras_TempCoverage",
    title: "Temporal Coverage"
  }), /*#__PURE__*/React.createElement(TimeRangeFacet, {
    field: "extras_PublicationYear",
    title: "Publication Year"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "organization",
    title: "Communities"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "groups",
    title: "Repositories"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "tags",
    title: "Keywords"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "author",
    title: "Creator"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_Instrument",
    title: "Instrument"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_Discipline",
    title: "Discipline"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_Language",
    title: "Language"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_Publisher",
    title: "Publisher"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_Contributor",
    title: "Contributor"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_ResourceType",
    title: "Resource Type"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_Format",
    title: "Format"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_Size",
    title: "Size"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_FundingReference",
    title: "Funding Reference"
  }), /*#__PURE__*/React.createElement(Facet, {
    field: "extras_OpenAccess",
    title: "Open Access"
  })));
}

ReactDOM.render( /*#__PURE__*/React.createElement(Facets, null), document.getElementById('b2find_facets'));