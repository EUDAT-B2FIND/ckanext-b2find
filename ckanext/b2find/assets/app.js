"use strict";

async function getItems(query, filter, field, type, sort, limit) {
  const url = "/b2find/query"

  let jsonQuery = {
    "query": {
      "lucene": {
        "df": "text",
        "query": query,
        }
      },
      "filter": filter,
      "limit": 0,
      "facet": {},
  };

  if (type == "range") {
    jsonQuery["facet"][field] = {
      "type": "range",
      "field": field,
      "start": "-5000-01-01T00:00:00Z/YEAR",
      "end": "2200-12-31T00:00:00Z/YEAR",
      "gap": "+10YEARS",
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
      "sort": {"count": "desc"},
    };
  }

  console.log(jsonQuery);
  const { data } = await axios.post(url, jsonQuery);
  console.log(data);

  let items = data["facets"][field]["buckets"];
  return items;
};

function useSolrParams() {
  const searchParams = new URLSearchParams(window.location.search);
  let q = "*:*";
  if (searchParams.has("q")) {
    q = searchParams.get("q");
  }
  let fq = "*";
  //et fq = JSON.parse($("#b2find_fq").val());
  return [q, fq];
}

function useSolrQuery(field, type, sort, limit) {
  const [query, filter] = useSolrParams()
  const { data, isFetching } = ReactQuery.useQuery(
    ['items', field, sort, limit], () => getItems(query, filter, field, type, sort, limit));

  return [data, isFetching];
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
  const [value, setValue] = React.useState();

  return (
    <input type="text" placeholder="Filter" className="facet-filter"/>
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
  const [sort, setSort] = React.useState("cd");
  const [limit, setLimit] = React.useState(10);
  const [items, isFetching] = useSolrQuery(field, "terms", sort, limit);

  if (isFetching) return (
    <section className="module module-narrow module-shallow">
      <Header id={id} title={title}/>
    </section>
  );
  return (
    <section className="module module-narrow module-shallow">
        <Header id={id} title={title}/>
        <div id={id} className="collapse">
          <SearchBar/>
          <SelectSort
            sort={sort}
            setSort={setSort}/>
          <Items
            items={items}
            field={field}/>
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
  const startField = props.startField;
  const endField = props.endField;
  const values = items.map((item) => parseInt(item.val.substr(0,4)));
  const counts = items.map((item) => item.count);

  function plot() {
    // create a data source to hold data
    const source = new Bokeh.ColumnDataSource({
        data: { years: values, counts: counts }
    });

    // make a plot with some tools
    const plot = Bokeh.Plotting.figure({
        title: '',
        tools: '',
        toolbar_location: null,
        //y_axis_type: null,
        sizing_mode: 'stretch_width',
        height: 280,
        width: 280
    });

    // add a line with data from the source
    plot.line({ field: "years" }, { field: "counts" }, {
        source: source,
        line_width: 2
    });

    // show the plot, replacing div element with id
    Bokeh.Plotting.show(plot, "#"+id);
  }

  React.useEffect(() => {
    plot();
  }, []);

  return (
    <React.Fragment>
      <div id={id}></div>
      <RangeSlider
        items={items}
        field={field}
        startField={startField}
        endField={endField}
        />
    </React.Fragment>
  )
}

function TimeRangeFacet(props) {
  const id = "facet_" + props.field;
  const title = props.title;
  const field = props.field;
  const startField = props.startField;
  const endField = props.endField;
  const [items, isFetching] = useSolrQuery(field, "range", "cd", 0);

  if (isFetching) return (
    <section className="module module-narrow module-shallow">
      <Header id={id} title={title}/>
    </section>
  );
  return (
    <section className="module module-narrow module-shallow">
        <Header id={id} title={title}/>
        <div id={id} className="collapse">
          <TimeRangeSlider
            items={items}
            field={field}
            startField={startField}
            endField={endField}/>
        </div>
    </section>
  );
}

function ApplyButton(props) {
  const field = props.field;
  const id = "apply_button_" + field;
  const onClick = props.onClick;

  React.useEffect(() => {
  }, []);

  return (
    <button
      className="btn btn-success btn-block"
      type="submit"
      onClick={onClick}>
      Apply
    </button>
  )
}

function ResetButton(props) {
  const field = props.field;
  const id = "reset_button_" + field;
  const onClick = props.onClick;

  React.useEffect(() => {
  }, []);

  return (
    <button
      className="btn btn-warning btn-block"
      type="submit"
      onClick={onClick}>
      Reset
    </button>
  )
}

function RangeSlider(props) {
  const id = "slider_" + props.field;
  const items = props.items;
  const field = props.field;
  const startField = props.startField;
  const endField = props.endField;
  const values = items.map((item) => parseInt(item.val.substr(0,4)));
  const counts = items.map((item) => item.count);
  const start = values[0];
  const end = values[items.length-1];
  const [value, setValue] = React.useState([start, end]);
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);
  //const [searchParams, setSearchParams] = React.useState(params);

  React.useEffect(() => {
    // console.log("new slider", start, end);
    slider();
  }, []);

  function handleApply() {
    // console.log("click", value);
    searchParams.set(startField, value[0]);
    searchParams.set(endField, value[1]);
    window.location.href = location.pathname + "?" + searchParams.toString();
  }

  function handleReset() {
    searchParams.delete(startField);
    searchParams.delete(endField);
    window.location.href = location.pathname + "?" + searchParams.toString();
  }

  function slider() {
    const slider = new Bokeh.Widgets.RangeSlider({
      title: "Selected years",
      value: [start, end],
      start: start,
      end: end,
      step: 1,
      max_width: 280,
      sizing_mode: "stretch_width",
    });
    const value = slider.properties.value;
    slider.on_change(value,  () => setValue(slider.value));
    Bokeh.Plotting.show(slider, "#"+id);
  }

  return (
    <React.Fragment>
      <div id={id}></div>
      <ApplyButton
        field={field}
        onClick={handleApply}/>
      <ResetButton
        field={field}
        onClick={handleReset}/>
    </React.Fragment>
  )
}

function RangeFacet(props) {
  const id = "facet_" + props.field;
  const title = props.title;
  const field = props.field;
  const startField = props.startField;
  const endField = props.endField;
  const [items, isFetching] = useSolrQuery(field, "terms", "ia", -1);

  if (isFetching) return (
    <section className="module module-narrow module-shallow">
      <Header id={id} title={title}/>
    </section>
  );
  return (
    <section className="module module-narrow module-shallow">
        <Header id={id} title={title}/>
        <div id={id} className="collapse">
          <RangeSlider
            items={items}
            field={field}
            startField={startField}
            endField={endField}/>
        </div>
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
          startField="ext_tstart"
          endField="ext_tend"
          title="Temporal Coverage"/>
        <RangeFacet
          field="extras_PublicationYear"
          startField="ext_pstart"
          endField="ext_pend"
          title="Publication Year"/>
        <Facet field="groups" title="Communities"/>
        <Facet field="tags" title="Keywords"/>
        <Facet field="author" title="Creator"/>
        <Facet field="extras_Instrument" title="Instrument"/>
        <Facet field="extras_Discipline" title="Discipline"/>
        <Facet field="extras_Language" title="Language"/>
        <Facet field="extras_Publisher" title="Publisher"/>
        <Facet field="extras_Contributor" title="Contributor"/>
        <Facet field="extras_ResourceType" title="ResourceType"/>
        <Facet field="extras_OpenAccess" title="OpenAccess"/>
      </ReactQuery.QueryClientProvider>
    </React.Fragment>
  )
}

ReactDOM.render(
  <Facets/>,
  document.getElementById('b2find_facets')
);
