'use strict';

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
  return (
    <select
      className="facet-filter pull-right"
      onChange={e => props.handleSortChange(e.target.value)}
      defaultValue={props.sort}>
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
  const queryParams = new URLSearchParams(URL);

  queryParams.append(field, title);

  console.log("href", URL);

  return (
    <li className="nav-item">
      <a
        href={queryParams}
        title={title}>
        {label} <span className="badge">{count}</span>
      </a>
    </li>
  )
}

function Footer(props) {
  return (
    <p className="module-footer">
      <a href="" className="read-more">Less</a>
      <a href="" className="read-more pull-right">More</a>
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
  const [limit, setLimit] = React.useState(5);

  React.useEffect(() => {
    const url = "/b2find/query?field="+field+"&sort="+sort+"&limit="+limit;

    fetch(url)
      .then(result => result.json())
      .then(result => {
        console.log(url);
        setItems(result.items);
        setIsLoaded(true);
      });
  }, [sort]);

  if (!isLoaded) return (
    <h1> Loading ... </h1>
  );
  return (
    <section className="module module-narrow module-shallow">
        <Header id={id} title={title}/>
        <div id={id} className="collapse">
          <SearchBar/>
          <SelectSort
            sort={sort}
            handleSortChange={setSort}/>
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
          <Footer/>
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
    </React.Fragment>
  )
}

const URL = document.getElementById('b2find_facets').dataset.url;

ReactDOM.render(
  <Facets/>,
  document.getElementById('b2find_facets')
);
