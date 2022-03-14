"use strict";

function DatasetMap() {
  const [map, setMap] = React.useState();
  const [zoom, setZoom] = React.useState(0);
  const [center, setCenter] = React.useState([0.0, 0.0]);

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

  const image = new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({color: 'red', width: 1}),
  });

  const styles = {
    'Point': new ol.style.Style({
      image: image,
    }),
  };

  const styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()];
  };

  const geojsonObject = {
    'type': 'FeatureCollection',
    'crs': {
      'type': 'name',
      'properties': {
        'name': 'EPSG:3857',
      },
    },
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [0, 0],
        },
      },
    ],
  };

  const vectorSource = new ol.source.Vector({
    features: new ol.format.GeoJSON().readFeatures(geojsonObject),
  });

  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction,
  });

  React.useEffect(() => {
    //console.log("Initialised for the first time");
    const myMap = new ol.Map({
        target: mapRef.current,
        layers: [
          stamen,
          vectorLayer,
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat(center),
          zoom: zoom,
        })
      });

    setMap(myMap);
  }, [])

  return (
      <div ref={mapRef} style={mapStyles}></div>
  )
}

ReactDOM.render(
  <DatasetMap/>,
  document.getElementById('b2find_map')
);
