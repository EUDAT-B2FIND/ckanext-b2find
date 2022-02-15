'use strict';

function Header(props) {
  return (
    <h2
      className="module-heading">
      <i className="fa fa-filter"></i>
      { props.title }
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

function Footer(props) {
  return (
    <p className="module-footer">
      <a href="" className="read-more">Less</a>
      <a href="" className="read-more pull-right">More</a>
    </p>
  )
}

function Facet(props) {
  const [items, setItems] = React.useState([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [sort, setSort] = React.useState("cd");
  const [limit, setLimit] = React.useState(5);

  React.useEffect(() => {
    const url = "/b2find/query?field="+props.field+"&sort="+sort+"&limit="+limit;

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
        <Header title={props.title}/>
        <SearchBar/>
        <SelectSort
          sort={sort}
          handleSortChange={setSort}/>
        <nav aria-label="">
          <ul className="list-unstyled nav nav-simple nav-facet">
            {items.map((item, index) => (
              <li key={index} className="nav-item">
                <a href="" title={item.val}>
                  <span className="item-label">{item.val.substring(0,20)}</span>
                  <span className="hidden separator"> - </span>
                  <span className="item-count badge">{item.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Footer/>
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

ReactDOM.render(
  <Facets/>,
  document.getElementById('b2find_facets')
);
