'use strict';

// import React, { useState, useEffect } from 'react';

const e = React.createElement;

function FacetsComponent() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);

  // Note: the empty deps array [] means
  // this useEffect will run once
  // similar to componentDidMount()
  useEffect(() => {
    fetch("/b2find/query")
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  if (error) {
    return "Error";// <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return "Loading..."; // <div>Loading...</div>;
  } else {
    return (
      "items"
      // <ul>
      //   {items.map(item => (
      //     <li key={item.val}>
      //       {item.val} {item.count}
      //     </li>
      //   ))}
      // </ul>
    );
  }
}

const domContainer = document.querySelector('#like_button_container');
ReactDOM.render(e(FacetsComponent), domContainer);
