"use strict";

async function getDataset(name) {
  const url = "/b2find/query"

  const jsonQuery = {
    "query": "*:*",
    "filter": "name:"+name,
    "limit": 1,
    "fields": ["extras_spatial"]
  };
  const { data } = await axios.post(url, jsonQuery);
  const wkt = data["response"]["docs"][0]["extras_spatial"][0]
  //console.log(wkt);
  return wkt;
};

function useDataset(name) {
  const { data, isFetching, isSuccess } = ReactQuery.useQuery(
    "dataset", getDataset(name));

  console.log("use dataset", isSuccess);
  return [data, isFetching, isSuccess];
}

function DatasetMap() {
  const [map, setMap] = React.useState();
  const [zoom, setZoom] = React.useState(0);
  const [center, setCenter] = React.useState([0.0, 0.0]);
  const [vectorLayer, setVectorLayer] = React.useState();
  const [dataset, isFetching, isSuccess] = useDataset("929fb749-e3ee-59d3-82f5-d674d6fedac5");

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

  React.useEffect(() => {
    console.log("dataset", isSuccess, dataset);
    if (map != null && isSuccess) {
      const features = new ol.format.WKT({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'}).readFeature(dataset);
      console.log("features", features);
      const source = new ol.source.Vector({
        features: features
      })
      const vector = new ol.layer.Vector({
        source: source,
      });
      map.removeLayer(vectorLayer);
      map.addLayer(vector);
      setVectorLayer(vector);
      //console.log(map.getLayers())
    }
  }, [isSuccess])

  return (
    <div ref={mapRef} style={mapStyles}></div>
  )
}

const queryClient = new ReactQuery.QueryClient();

ReactDOM.render(
  <ReactQuery.QueryClientProvider client={queryClient}>
    <DatasetMap/>
  </ReactQuery.QueryClientProvider>,
  document.getElementById('b2find_map')
);
