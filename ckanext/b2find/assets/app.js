'use strict';

// var Router = ReactRouterDOM.BrowserRouter;

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
        className="btn btn-default"
        type="button"
        onClick={e => setLimit(limit + 10)}>
        More
      </button>
    </p>
  )
}

function Facet(props) {
  const id = "facet_" + props.field;
  const field = props.field;
  const title = props.title;
  const [items, setItems] = React.useState([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [sort, setSort] = React.useState("cd");
  const [limit, setLimit] = React.useState(10);
  const location = window.location;
  const urlParams = new URLSearchParams(location.search);

  React.useEffect(() => {
    let url = "/b2find/query?field="+field+"&sort="+sort+"&limit="+limit;
    if (urlParams.has("q")) {
      url += "&q=" + urlParams.get("q");
    }
    if (urlParams.has("fq")) {
      url += "&fq=" + urlParams.get("fq");
    }

    fetch(url)
      .then(result => result.json())
      .then(result => {
        console.log(url);
        setItems(result.items);
        setIsLoaded(true);
      });
  }, [sort, limit]);

  if (!isLoaded) return (
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

function Facets(props) {
  return (
    <React.Fragment>
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
    </React.Fragment>
  )
}

ReactDOM.render(
  <Facets/>,
  document.getElementById('b2find_facets')
);
