'use strict';

const e = React.createElement;

class SelectSort extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.handleSortChange(event.target.value);
  }

  render() {
    return (
      <select className="facet-filter pull-right" onChange={this.handleChange}
        defaultValue={this.props.sort}>
        <option value="ia">A-Z</option>
        <option value="id">Z-A</option>
        <option value="ca">1-9</option>
        <option value="cd">9-1</option>
      </select>
    )
  }
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <input type="text" placeholder="Filter" className="facet-filter"/>
    )
  }
}

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

  }

  render() {
    return (
      <p className="module-footer">
        <a href="" className="read-more">Less</a>
        <a href="" className="read-more pull-right">More</a>
      </p>
    )
  }
}

class Facet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      isLoaded: false,
      sort: "cd",
      limit: 5,
    };

    this.handleSortChange = this.handleSortChange.bind(this);
  }
  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.sort !== this.state.sort) {
      this.fetchData();
      console.log("fetch new data");
    }
  }

  handleSortChange(sort) {
    this.setState({
      sort: sort
    });
    console.log("sort changed", sort);
  }

  fetchData() {
    const field = this.props.facet_id;
    const sort = this.state.sort;
    const limit = this.state.limit;
    const url = "/b2find/query?field="+field+"&sort="+sort+"&limit="+limit;

    fetch(url)
      .then(result => result.json())
      .then(result => {
        console.log(url);
        this.setState({
          items: result.items,
          isLoaded: true
        })
      });
    }

  render() {
    const facet_id = this.facet_id
    const items = this.state.items;
    const isLoaded = this.state.isLoaded;

    if (!isLoaded) return (
      <div>
        <h1> Loading ... </h1>
      </div>
    );
    return (
      <div id="facet_tags" className="collapse">
        <SearchBar/>
        <SelectSort
          sort={this.state.sort}
          handleSortChange={this.handleSortChange}/>
        <nav aria-label="">
          <ul className="list-unstyled nav nav-simple nav-facet">
            {items.map((item, index) => (
              <li key={index} className="nav-item">
                <a href="" title={item.val}>
                  {item.val.substring(0,20)} <span className="badge">{item.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Footer/>
      </div>
    );
  }
}

// ReactDOM.render(
//   <Facet facet_id="tags" />,
//   document.getElementById('b2find_facet_keywords')
// );

ReactDOM.render(
  <Facet facet_id="author" />,
  document.getElementById('b2find_facet_creator')
);
