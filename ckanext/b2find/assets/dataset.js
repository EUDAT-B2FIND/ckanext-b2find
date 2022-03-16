"use strict";

async function getItems(name) {
  const url = "/b2find/query"

  const jsonQuery = {
    "query": "*:*",
    "filter": "name:"+name,
    "limit": 1,
    "fields": ["extras_spatial"],
  };
  const { data } = await axios.post(url, jsonQuery);
  console.log(data["docs"]);
  return data["docs"];
};

function useSolrQuery(name) {
  const { data, isFetching, isSuccess } = ReactQuery.useQuery(
    [name], () => getItems(name));

  //console.log("solr query", isSuccess, extent);
  return [data, isFetching, isSuccess];
}

function DatasetMap() {
  const [map, setMap] = React.useState();
  const [zoom, setZoom] = React.useState(0);
  const [center, setCenter] = React.useState([0.0, 0.0]);
  const [vectorLayer, setVectorLayer] = React.useState();
  //const [items, isFetching, isSuccess] = useSolrQuery("929fb749-e3ee-59d3-82f5-d674d6fedac5");

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

  const wkt =
    'POLYGON((10.689 -25.092, 34.595 ' +
    '-20.170, 38.814 -35.639, 13.502 ' +
    '-39.155, 10.689 -25.092))';

  const format = new ol.format.WKT();

  const feature = format.readFeature(wkt, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  });

  const initialVectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
  });

  React.useEffect(() => {
    //console.log("Initialised for the first time");
    const myMap = new ol.Map({
        target: mapRef.current,
        layers: [
          stamen,
          initialVectorLayer,
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat(center),
          zoom: zoom,
        })
      });

    setMap(myMap);
    setVectorLayer(initialVectorLayer);
  }, [])

  return (
      <div ref={mapRef} style={mapStyles}></div>
  )
}

ReactDOM.render(
  <DatasetMap/>,
  document.getElementById('b2find_map')
);
