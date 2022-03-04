"use strict";

async function getItems(query, filter, facetFilter, field, type, sort, limit) {
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
        //"df": "text",
        "qf": "name^4 title^4 tags^2 groups^2 text",
        //"qf": "name^4 title^4 author^2 tags^2 groups^2 text",
        //"tie": '0.1',
        //"mm": '2<-1 5<80%',
        "query": query,
        "q.alt": "*:*",
        //"q.op": "AND",
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
      //"geom": "[\"50 20\" TO \"180 90\"]",
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
  if (field in data["facets"]) {
    items = data["facets"][field]["buckets"];
  }
  return items;
};

function useSolrParams() {
  const fields = [
    "groups",
    "author",
    "tags",
    "extras_Instrument",
    "extras_Discipline",
    "extras_Language",
    "extras_Publisher",
    "extras_Contributor",
    "extras_ResourceType",
    "extras_FundingReference",
    "extras_OpenAccess",
    "extras_TempCoverage",
    "extras_PublicationYear",
    "extras_bbox",
  ]
  const searchParams = new URLSearchParams(window.location.search);
  let query = "*:*";
  if (searchParams.has("q")) {
    query = searchParams.get("q");
  }
  let filter = [];
  for (const field of fields) {
    for (const val of searchParams.getAll(field)) {
      filter.push([field, ':', '\"', val, '\"'].join(''));
      //filter.push([field, ':', val].join(''));
    };
  };

  //console.log(filter);
  return [query, filter];
}

function useSolrQuery(field, type, facetFilter, sort, limit) {
  const [query, filter] = useSolrParams()
  const { data, isFetching, isSuccess } = ReactQuery.useQuery(
    ['items', field, facetFilter, sort, limit], () => getItems(
      query, filter, facetFilter, field, type, sort, limit));

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
  const title = props.title;
  const count = props.count;
  const label = title.substring(0,30);
  // const [isActive, setActive] = React.useState(false);
  const location = window.location;
  const urlParams = new URLSearchParams(location.search);
  let isActive = false;
  let style = "nav-item";

  const values = urlParams.getAll(field);
  if (values.includes(title)) {
    isActive = true;
    urlParams.delete(field);
    for (const [i, val] of values.entries()) {
      if (val != title) {
        urlParams.append(field, val);
      }
    }
  } else {
    urlParams.append(field, title);
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
        title={title}>
        {label} <span className="badge">{count}</span>
      </a>
    </li>
  )
}

function Items(props) {
  const items = props.items;
  const field = props.field;

  return (
    <nav aria-label="">
      <ul className="list-unstyled nav nav-simple nav-facet">
        {items.map((item, index) => (
          <Item
            key={index}
            field={field}
            title={item.val}
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
  const [items, isFetching, isSuccess] = useSolrQuery(field, "terms", filter, sort, limit);

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
  const [items, isFetching, isSuccess] = useSolrQuery(field, "range", null, "cd", 0);

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
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);
  const zoom = parseInt(searchParams.get('ext_zoom'), 10) || 2;
  const lat = parseInt(searchParams.get('ext_lat'), 10) || 50;
  const lon = parseInt(searchParams.get('ext_lon'), 10) || 10;

  const stamen = new ol.layer.Tile({
    source: new ol.source.Stamen({
      layer: 'toner',
    }),
  });

  const osm = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  const heatmap = new ol.layer.Heatmap({
    source: new ol.source.Vector({
      url: 'https://openlayers.org/en/latest/examples/data/kml/2012_Earthquakes_Mag5.kml',
      format: new ol.format.KML({
        extractStyles: false,
      }),
    }),
    //blur: parseInt(blur.value, 10),
    //radius: parseInt(radius.value, 10),
    weight: function (feature) {
      // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
      // standards-violating <magnitude> tag in each Placemark.  We extract it from
      // the Placemark's name instead.
      const name = feature.get('name');
      const magnitude = parseFloat(name.substr(2));
      return magnitude - 5;
    },
  });

  React.useEffect(() => {
    const map = new ol.Map({
        target: 'map',
        layers: [
          //osm,
          stamen,
          heatmap,
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([0.0, 0.0]),
          zoom: 1
        })
      });

    // map.on("moveend", function(e){
    //   //console.log("zoomend", map.getBounds().getSouth());
    //   // minX, maxX, maxY, minY
    //   // ENVELOPE(-10, 20, 15, 10)
    //   // minY, minX, maxY, maxX
    //   // [10,-10 TO 15,20]
    //   let minY = Math.round(map.getBounds().getSouth() * 100) / 100;
    //   let minX = Math.round(map.getBounds().getWest() * 100) / 100;
    //   let maxY = Math.round(map.getBounds().getNorth() * 100) / 100;
    //   let maxX = Math.round(map.getBounds().getEast() * 100) / 100;
    //   searchParams.set(field, ["[", minY, ",", minX, " TO ", maxY, ",", maxX, "]"].join(''));
    //   // zoom
    //   searchParams.set('ext_zoom', map.getZoom());
    //   // center
    //   searchParams.set('ext_lat', map.getCenter().lat);
    //   searchParams.set('ext_lon', map.getCenter().lng);
    //   window.location.href = location.pathname + "?" + searchParams.toString();
    // })
  }, [])

  return (
      <div id="map" className="map"></div>
  )
}

function MapFacet(props) {
  const id = "facet_" + props.field;
  const title = props.title;
  const field = props.field;
  const [items, isFetching, isSuccess] = useSolrQuery(field, "heatmap", null, "cd", 0);

  return (
    <section className="module module-narrow module-shallow">
      <Header
        title={title}/>
      <MyMap
        field={field}/>
    </section>
  );
}

function Facets(props) {
  const queryClient = new ReactQuery.QueryClient()

  return (
    <React.Fragment>
      <ReactQuery.QueryClientProvider client={queryClient}>
        <MapFacet
          field="extras_bbox"
          title="Spatial Coverage"/>
        <TimeRangeFacet
          field="extras_TempCoverage"
          title="Temporal Coverage"/>
        <TimeRangeFacet
          field="extras_PublicationYear"
          title="Publication Year"/>
        <Facet field="groups" title="Communities"/>
        <Facet field="tags" title="Keywords"/>
        <Facet field="author" title="Creator"/>
        <Facet field="extras_Instrument" title="Instrument"/>
        <Facet field="extras_Discipline" title="Discipline"/>
        <Facet field="extras_Language" title="Language"/>
        <Facet field="extras_Publisher" title="Publisher"/>
        <Facet field="extras_Contributor" title="Contributor"/>
        <Facet field="extras_ResourceType" title="Resource Type"/>
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
