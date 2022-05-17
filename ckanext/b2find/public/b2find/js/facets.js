"use strict";

function toGeoJSON(props) {
  const columns = props.columns;
  const rows = props.rows;
  const minX = props.minX;
  const maxX = props.maxX;
  const minY = props.minY;
  const maxY = props.maxY;
  const counts = props.counts_ints2D;
  const geojson = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    },
    features: []
  };

  // If our min longitude is greater than max longitude, we're crossing
  // the 180th meridian (date line).
  const crosses_meridian = minX > maxX;

  // Bucket width needs to be calculated differently when crossing the
  // meridian since it wraps.
  let bucket_width = null;
  if (crosses_meridian) {
    bucket_width = (360 - abs(maxX - minX)) / columns;
  } else {
    bucket_width = (maxX - minX) / columns;
  }

  const bucket_height = (maxY - minY) / rows;

  counts.forEach((row, rowIndex) => {
    if (!row) return;

    row.forEach((column, columnIndex) => {
      if (!column) return;

      // Put the count in the middle of the bucket (adding a half height and width).
      let lat = maxY - ((rowIndex + 1) * bucket_height) + (bucket_height / 2);
      let lon = minX + (columnIndex * bucket_width) + (bucket_width / 2);

      // We crossed the meridian, so wrap back around to negative.
      if (lon > 180) {
          lon = -1 * (180 - (lon % 180));
      }

      const point = {
        type: 'Feature',
         geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        properties: {
          //name: "point",
          count: column,
        }
      };

      geojson.features.push(point);
    })
  })

  return geojson;
}

async function getItems(query, filter, facetFilter, field, type, sort, limit, extent) {
  const url = "/b2find/query"

  let sortParam = {"count": "desc"};
  if (sort == "cd") {
    sortParam = {"count": "desc"};
  } else if (sort == "ca") {
    sortParam = {"count": "asc"};
  } else if (sort == "id") {
    sortParam = {"index": "desc"};
  } else if (sort == "ia") {
    sortParam = {"index": "asc"};
  }

  let jsonQuery = {
    "query": {
      "edismax": {
        "df": "text",
        "qf": "name^4 title^4 tags^2 groups^2 text",
        //"qf": "name^4 title^4 author^2 tags^2 groups^2 text",
        "tie": "0.1",
        "mm": "2<-1 5<80%",
        "query": query,
        "q.alt": "*:*",
        "q.op": "AND",
        }
      },
      "filter": filter,
      "limit": 0,
      // "fields": [],
      "facet": {},
  };

  if (type == "range") {
    jsonQuery["facet"][field] = {
      "type": "range",
      "field": field,
      "start": "-1000-01-01T00:00:00Z/YEAR",
      "end": "NOW+10YEARS/YEAR",
      "gap": "+1YEARS",
      // "limit": limit,
      "mincount": 1,
      // "sort": _translate_sort(sort),
    }
  }
  else if (type=="heatmap") {
    jsonQuery["facet"][field] = {
      "type": "heatmap",
      "field": field,
      "geom": extent,
      //"gridLevel": 4,
      //"format": "png",
    }
  }
  else {
    jsonQuery["facet"][field] = {
      "type": "terms",
      "field": field,
      "limit": limit,
      "mincount": 1,
      "sort": sortParam,
    };
    if (facetFilter) {
      // prefix
      jsonQuery["facet"][field]["prefix"] = facetFilter;
    }
  }
  //console.log(jsonQuery);

  const { data } = await axios.post(url, jsonQuery);

  let items = [];
  //console.log(field, data["facets"]);
  if ("facets" in data) {
    if (field in data["facets"]) {
      if (type == "heatmap") {
        items = toGeoJSON(data["facets"][field]);
        //console.log("heatmap items", items);
      } else {
        items = data["facets"][field]["buckets"];
      }
    }
  }
  return items;
};

function useSolrParams() {
  const urlSearch = window.location.search;
  const urlPathname = window.location.pathname;
  const fields = [
    "organization",
    "groups",
    "author",
    "tags",
    "extras_Instrument",
    "extras_Discipline",
    "extras_Language",
    "extras_Publisher",
    "extras_Contributor",
    "extras_ResourceType",
    "extras_Format",
    "extras_Size",
    "extras_FundingReference",
    "extras_OpenAccess",
    "extras_TempCoverage",
    "extras_PublicationYear",
    //"extras_bbox",
  ]
  const searchParams = new URLSearchParams(urlSearch);
  let query = "*:*";
  if (searchParams.has("q")) {
    query = searchParams.get("q");
    if (query.length > 3) {
      query += "~";
    }
  }
  const filter = [];
  for (const field of fields) {
    for (const val of searchParams.getAll(field)) {
      filter.push([field, ':', '\"', val, '\"'].join(''));
      //filter.push([field, ':', val].join(''));
    };
  };
  if (searchParams.has("extras_bbox")) {
    filter.push(['extras_bbox:', searchParams.get("extras_bbox")].join(''));
  }
  if (urlPathname.includes('/organization/')) {
    let val = urlPathname.split("/").slice(-1);
    filter.push(['organization', ':', '\"', val, '\"'].join(''));
  }
  if (urlPathname.includes('/group/')) {
    let val = urlPathname.split("/").slice(-1);
    filter.push(['groups', ':', '\"', val, '\"'].join(''));
  }

  //console.log(filter);
  return [query, filter];
}

function useSolrQuery(field, type, facetFilter, sort, limit, extent) {
  const [query, filter] = useSolrParams()
  const { data, isFetching, isSuccess } = ReactQuery.useQuery(
    ['items', field, facetFilter, sort, limit, extent], () => getItems(
      query, filter, facetFilter, field, type, sort, limit, extent));

  //console.log("solr query", isSuccess, extent);
  return [data, isFetching, isSuccess];
}

function Header(props) {
  const target = "#" + props.id;
  const title = props.title;
  const [open, setOpen] = React.useState(false);

  let style = "fa fa-chevron-down pull-right";
  if (open) {
    style = "fa fa-chevron-up pull-right";
  }

  return (
    <button
      onClick={() => setOpen(!open)}
      className="module-heading btn btn-default btn-block"
      type="button"
      data-toggle="collapse"
      data-target={target}>
      <span className="pull-left">{ title }</span>
      <i className={style}></i>
    </button>
  )
}

function SearchBar(props) {
  const filter = props.filter;
  const setFilter = props.setFilter;

  return (
    <input
      type="text"
      placeholder="Filter"
      className="facet-filter"
      value={filter}
      onChange={e => setFilter(e.target.value)}/>
  )
}

function SelectSort(props) {
  const sort = props.sort;
  const setSort = props.setSort;

  return (
    <select
      className="facet-filter pull-right"
      onChange={e => setSort(e.target.value)}
      defaultValue={sort}>
      <option value="ia">A-Z</option>
      <option value="id">Z-A</option>
      <option value="ca">1-9</option>
      <option value="cd">9-1</option>
    </select>
  )
}

function Item(props) {
  const field = props.field;
  const value = props.value;
  const title = props.title;
  const count = props.count;
  const label = title.substring(0,30);
  // const [isActive, setActive] = React.useState(false);
  const location = window.location;
  const urlParams = new URLSearchParams(location.search);
  let isActive = false;
  let style = "nav-item";

  const values = urlParams.getAll(field);
  if (values.includes(value)) {
    isActive = true;
    urlParams.delete(field);
    for (const [i, val] of values.entries()) {
      if (val != value) {
        urlParams.append(field, val);
      }
    }
  } else {
    urlParams.append(field, value);
  }

  const href = location.pathname + "?" + urlParams.toString();
  // console.log(href);

  if (isActive) {
    style += " active";
  }

  return (
    <li className={style}>
      <a
        href={href}
        title={value}>
        {label} <span className="badge">{count}</span>
      </a>
    </li>
  )
}

function getLabel(field, value, labels) {
  let label = value;
  if (field in labels){
    if (value in labels[field]){
      label = labels[field][value];
    }
  }
  return label;
}

function Items(props) {
  const items = props.items;
  const field = props.field;
  const url = '/b2find/facet_labels';
  const [labels, setLabels] = React.useState({});

  React.useEffect(() => {
    axios.get(url)
    .then(res => {
      setLabels(res.data);
    })
  }, []);

  return (
    <nav aria-label="">
      <ul className="list-unstyled nav nav-simple nav-facet">
        {items.map((item, index) => (
          <Item
            key={index}
            field={field}
            value={item.val}
            title={getLabel(field, item.val, labels)}
            count={item.count}
          />
        ))}
      </ul>
    </nav>
  )
}

function Footer(props) {
  const limit = props.limit;
  const setLimit = props.setLimit;
  const lessDisabled = limit <= 10;
  return (
    <p className="module-footer">
      <button
        className="btn btn-default"
        disabled={lessDisabled}
        type="button"
        onClick={e => setLimit(limit - 10)}>
        Less
      </button>
      <button
        className="btn btn-default pull-right"
        type="button"
        onClick={e => setLimit(limit + 10)}>
        More
      </button>
    </p>
  )
}

function Facet(props) {
  const id = "facet_" + props.field;
  const title = props.title;
  const field = props.field;
  const [filter, setFilter] = React.useState("");
  const [sort, setSort] = React.useState("cd");
  const [limit, setLimit] = React.useState(10);
  const [items, isFetching, isSuccess] = useSolrQuery(field, "terms", filter, sort, limit, null);

  return (
    <section className="module module-narrow module-shallow">
      <Header id={id} title={title}/>
        <div id={id} className="collapse">
          <SearchBar
            filter={filter}
            setFilter={setFilter}/>
          <SelectSort
            sort={sort}
            setSort={setSort}/>
          {isSuccess && (
          <Items
            items={items}
            field={field}/>
          )}
          <Footer
            limit={limit}
            setLimit={setLimit}/>
        </div>
    </section>
  );
}

function TimeRangeSlider(props) {
  const id = "time_slider_" + props.field;
  const slider_id = "time_slider_range_widget_" + props.field;
  const items = props.items;
  const field = props.field;
  const values = items.map((item) => parseInt(item.val.substr(0,4)));
  const counts = items.map((item) => item.count);
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);

  function plot() {
    // create a data source to hold data
    const source = new Bokeh.ColumnDataSource({
      data: { x: values, top: counts }
    });
    // make a plot with some tools
    const plot = Bokeh.Plotting.figure({
        title: '',
        tools: 'xbox_select',
        toolbar_location: null,
        //y_axis_type: null,
        sizing_mode: 'stretch_width',
        height: 220,
        width: 280
    });

    // bar plot
    plot.vbar({
         source: source,
         width: 0.9,
         alpha: 0.5,
    });

    // const select = plot.toolbar.select_one(Bokeh.BoxSelectTool);
    // plot.toolbar.active_multi = select;

    source.selected.on_change(source.selected, () => {
      const indices = source.selected.indices;
      const start = values[indices[0]];
      const end = values[indices[indices.length-1]]
      searchParams.set(field, ["[", start, " TO ", end, "]"].join(''));
      window.location.href = location.pathname + "?" + searchParams.toString();
    });

    plot.y_range.start = 0;
    plot.x_range.range_padding = 0.1;
    plot.xaxis.major_label_orientation = 1;
    plot.xgrid.grid_line_color = null;

    // show the plot, replacing div element with id
    Bokeh.Plotting.show(plot, "#"+id);
  }

  React.useEffect(() => {
    plot();
  }, []);

  return (
    <React.Fragment>
      <div id={id}></div>
    </React.Fragment>
  )
}

function TimeRangeFacet(props) {
  const id = "facet_" + props.field;
  const title = props.title;
  const field = props.field;
  const [items, isFetching, isSuccess] = useSolrQuery(field, "range", null, "cd", 0, null);

  return (
    <section className="module module-narrow module-shallow">
      <Header id={id} title={title}/>
      {isSuccess && (
        <div id={id} className="collapse">
          <TimeRangeSlider
            items={items}
            field={field}
            />
        </div>
      )}
    </section>
  );
}

function MyMap(props) {
  const field = props.field;
  const bbox = props.bbox;
  const [map, setMap] = React.useState();
  const [heatmapLayer, setHeatmapLayer] = React.useState();
  const [extent, setExtent] = React.useState("[-180 -90 TO 180 90]");
  const [items, isFetching, isSuccess] = useSolrQuery(field, "heatmap", null, "cd", 0, extent);
  const [zoom, setZoom] = React.useState(0);
  const [center, setCenter] = React.useState([0.0, 0.0]);
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);

  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = React.useRef();
  mapRef.current = map;

  // Define the styles that are to be passed to the map instance:
  const mapStyles = {
    // overflow: "hidden",
    width: "100%",
    height: "280px"
  };

  const stamen = new ol.layer.Tile({
    source: new ol.source.Stamen({
      layer: 'toner',
    }),
  });

  const osm = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  const initialHeatmap = new ol.layer.Heatmap({
    source: new ol.source.Vector(),
  });

  // a DragBox interaction used to select features by drawing boxes
  const dragBox = new ol.interaction.DragBox({
    condition: ol.events.condition.platformModifierKeyOnly,
  });

  function onBoxEnd(evt) {
    const extent = dragBox.getGeometry().getExtent();
    // [minx, miny, maxx, maxy].
    const lonLatExtent = ol.proj.transformExtent(extent, 'EPSG:3857','EPSG:4326');
    //console.log("boxend", lonLatExtent);
    // minY, minX, maxY, maxX
    // [10,-10 TO 15,20]
    const minY = Math.round(lonLatExtent[1] * 10000) / 10000;
    const minX = Math.round(lonLatExtent[0] * 10000) / 10000;
    const maxY = Math.round(lonLatExtent[3] * 10000) / 10000;
    const maxX = Math.round(lonLatExtent[2] * 10000) / 10000;
    searchParams.set(bbox, ["[", minY, ",", minX, " TO ", maxY, ",", maxX, "]"].join(''));
    window.location.href = location.pathname + "?" + searchParams.toString();
  };

  function wrapLon(value) {
    const worlds = Math.floor((value + 180) / 360);
    return value - worlds * 360;
  };

  function onMoveEnd(evt) {
    const map = evt.map;
    const mapExtent = map.getView().calculateExtent(map.getSize());
    const bottomLeft = ol.proj.toLonLat(ol.extent.getBottomLeft(mapExtent));
    const topRight = ol.proj.toLonLat(ol.extent.getTopRight(mapExtent));
    //const minX = wrapLon(bottomLeft[0]);
    const minX = bottomLeft[0];
    const minY = bottomLeft[1];
    //const maxX = wrapLon(topRight[0]);
    const maxX = topRight[0];
    const maxY = topRight[1];
    //console.log(minX, minY, maxX, maxY);
    // [-180 -90 TO 180 90]
    const extent = ["[", minX, " ", minY, " TO ", maxX, " ", maxY, "]"].join('');
    //console.log(extent);
    setExtent(extent);
  };

  React.useEffect(() => {
    //console.log("Initialised for the first time");
    const myMap = new ol.Map({
        target: mapRef.current,
        layers: [
          stamen,
          initialHeatmap,
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat(center),
          zoom: zoom,
        })
      });

    myMap.addInteraction(dragBox);
    dragBox.on('boxend', onBoxEnd);
    myMap.on('moveend', onMoveEnd);
    setMap(myMap);
    setHeatmapLayer(initialHeatmap);
  }, [])

  React.useEffect(() => {
    console.log("Detected change");
    console.log("items", isSuccess, items);
    if (map != null && isSuccess) {
      const features = new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'}).readFeatures(items);
      console.log("features", features);
      const source = new ol.source.Vector({
        features: features
      })
      const heatmap = new ol.layer.Heatmap({
        source: source,
        opacity: 0.6,
        //blur: 15,
        //radius: 8,
        weight: function (feature) {
          const count = parseInt(feature.get('count'), 10);
          return count;
        },
      });
      map.removeLayer(heatmapLayer);
      map.addLayer(heatmap);
      setHeatmapLayer(heatmap);
      //console.log(map.getLayers())
    }
  }, [isSuccess])

  return (
      <div ref={mapRef} style={mapStyles}></div>
  )
}

function MapFacet(props) {
  const id = "facet_" + props.field;
  const title = props.title;
  const field = props.field;
  const bboxField = props.bbox;

  return (
    <section className="module module-narrow module-shallow">
      <Header
        title={title}/>
      <div id={id} className="collapse.in">
        <MyMap
          field={field}
          bbox={bboxField}/>
      </div>
    </section>
  );
}

function Facets(props) {
  const queryClient = new ReactQuery.QueryClient()

  return (
    <React.Fragment>
      <ReactQuery.QueryClientProvider client={queryClient}>
        <MapFacet
          field="extras_spatial"
          bbox="extras_bbox"
          title="Spatial Coverage"/>
        <TimeRangeFacet
          field="extras_TempCoverage"
          title="Temporal Coverage"/>
        <TimeRangeFacet
          field="extras_PublicationYear"
          title="Publication Year"/>
        <Facet field="organization" title="Communities"/>
        <Facet field="groups" title="Repositories"/>
        <Facet field="tags" title="Keywords"/>
        <Facet field="author" title="Creator"/>
        <Facet field="extras_Instrument" title="Instrument"/>
        <Facet field="extras_Discipline" title="Discipline"/>
        <Facet field="extras_Language" title="Language"/>
        <Facet field="extras_Publisher" title="Publisher"/>
        <Facet field="extras_Contributor" title="Contributor"/>
        <Facet field="extras_ResourceType" title="Resource Type"/>
        <Facet field="extras_Format" title="Format"/>
        <Facet field="extras_Size" title="Size"/>
        <Facet field="extras_FundingReference" title="Funding Reference"/>
        <Facet field="extras_OpenAccess" title="Open Access"/>
      </ReactQuery.QueryClientProvider>
    </React.Fragment>
  )
}

ReactDOM.render(
  <Facets/>,
  document.getElementById('b2find_facets')
);
