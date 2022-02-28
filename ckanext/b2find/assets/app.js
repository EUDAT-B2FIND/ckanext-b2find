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
        "qf": "name^4 title^4 author^2 tags^2 groups^2 text",
        "query": query,
        "q.alt": "*:*"
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
    };
  } else {
    jsonQuery["facet"][field] = {
      "type": "terms",
      "field": field,
      "limit": limit,
      "mincount": 1,
      "sort": sortParam,
    };
    if (facetFilter) {
      // domain
      // jsonQuery["facet"][field]["domain"] = {
      //   "filter": [field, ':', '*', facetFilter, '*'].join('')
      // }
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

  return (
    <h2
      className="module-heading"
      data-toggle="collapse"
      data-target={target}
    >
      <i className="fa fa-filter"></i>
      { title }
      <i className="fa fa-chevron-down pull-right"></i>
    </h2>
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

function Facets(props) {
  const queryClient = new ReactQuery.QueryClient()

  return (
    <React.Fragment>
      <ReactQuery.QueryClientProvider client={queryClient}>
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
