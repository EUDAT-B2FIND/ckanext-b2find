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

  const wkt =
    'POLYGON((10.689 -25.092, 34.595 ' +
    '-20.170, 38.814 -35.639, 13.502 ' +
    '-39.155, 10.689 -25.092))';

  const format = new ol.format.WKT();

  const feature = format.readFeature(wkt, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  });

  const vector = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [feature],
    }),
  });

  React.useEffect(() => {
    //console.log("Initialised for the first time");
    const myMap = new ol.Map({
        target: mapRef.current,
        layers: [
          stamen,
          vector,
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
