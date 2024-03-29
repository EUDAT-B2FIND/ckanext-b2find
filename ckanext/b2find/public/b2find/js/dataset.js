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
  const wkt = data["response"]["docs"][0]["extras_spatial"]
  //console.log(wkt);
  return wkt;
};

function useDatasetName() {
  const pathname = window.location.pathname;
  const items = pathname.split("/");
  const name = items[items.length - 1];
  return name;
}

function useDataset() {
  const name = useDatasetName();
  const { data, isFetching, isSuccess } = ReactQuery.useQuery(
    ["dataset", name], () => getDataset(name));

  //console.log("use dataset", name, data, isSuccess);
  return [data, isFetching, isSuccess];
}

function DatasetMap() {
  const [map, setMap] = React.useState();
  const [zoom, setZoom] = React.useState(0);
  const [center, setCenter] = React.useState([0.0, 0.0]);
  const [vectorLayer, setVectorLayer] = React.useState();
  const [dataset, isFetching, isSuccess] = useDataset();

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

  const osm = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  const initialVectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
  });

  const stroke = new ol.style.Stroke({color: 'black', width: 2});
  const fill = new ol.style.Fill({color: 'red'});
  const square = new ol.style.Style({
    image: new ol.style.RegularShape({
      fill: fill,
      stroke: stroke,
      points: 4,
      radius: 10,
      angle: Math.PI / 4,
    }),
  });

  React.useEffect(() => {
    //console.log("Initialised for the first time");
    const myMap = new ol.Map({
        target: mapRef.current,
        layers: [
          osm,
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
    //console.log("dataset", isSuccess, dataset);
    if (map != null && isSuccess) {
      const format = new ol.format.WKT();
      const feature = format.readFeature(dataset, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });
      console.log("feature", feature);
      if (feature.getGeometry().getType() == "Point") {
        feature.setStyle(square);
      }
      const source = new ol.source.Vector({
        features: [feature],
      })
      const vector = new ol.layer.Vector({
        source: source,
      });
      map.removeLayer(vectorLayer);
      map.addLayer(vector);
      setVectorLayer(vector);
      //map.zoomToExtent(vector.getExtent());
      //console.log("vector extent", source.getExtent());
      // var zoomToExtentControl = new ol.control.ZoomToExtent({
      //   extent: source.getExtent(),
      // });
      map.getView().fit(source.getExtent(), {size:map.getSize(), maxZoom:8})
      //map.addControl(zoomToExtentControl);
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
