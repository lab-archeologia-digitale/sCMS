import * as React from "react"
import { useState, useCallback, useRef } from "react"
import "maplibre-gl/dist/maplibre-gl.css"
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  Popup,
} from "react-map-gl/maplibre"
import ControlPanel from "./controlPanel"
import { defaultBaseLayers } from "../../maps/defaultBaseLayers"

const parseStringTemplate = (str, obj) => {
  let parts = str.split(/\$\{(?!\d)[\wæøåÆØÅ]*\}/)
  let args = str.match(/[^{}]+(?=})/g) || []
  let parameters = args.map(
    argument =>
      obj[argument] || (obj[argument] === undefined ? "" : obj[argument]),
  )
  return String.raw({ raw: parts }, ...parameters)
}

const MapCompLibre = ({
  children,
  height,
  center,
  mapStyle,
  geolocateControl,
  fullscreenControl,
  navigationControl,
  scaleControl,
  baseLayers, 
}) => {
  const [lng, lat, zoom] = center
    ? center.split(",").map(e => parseFloat(e.trim()))
    : [0, 0, 2]

  const [mapStyleUrl, setMapStyleUrl] = useState(
    mapStyle ||
      "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
    //"https://demotiles.maplibre.org/style.json",
  )

  const [clickInfo, setClickInfo] = useState(null)
  const interactiveLayersRef = useRef([]);

  const handleLayerChange = styleUrl => {
    setMapStyleUrl(styleUrl)
  }


  const onMapLoad = useCallback((event) => {
    const mapInstance = event.target;

    // Usa map per scorrere i layer e filtrare quelli con metadata.popupTemplate
    const dynamicInteractiveLayers = mapInstance.getStyle().layers
      .map(layer => (layer.metadata && layer.metadata.popupTemplate ? layer.id : null))
      .filter(Boolean); // Rimuove i valori null

    // Salva i layer interattivi nella variabile di riferimento
    interactiveLayersRef.current = dynamicInteractiveLayers;
  }, []);

  const onClick = useCallback(
    event => {
      const { lngLat, point } = event;
      const mapInstance = event.target;
  
      // Usa queryRenderedFeatures per ottenere le feature dal punto cliccato
      const clickedFeatures = mapInstance.queryRenderedFeatures(point, {
        layers: interactiveLayersRef.current,
      });
  
      const clickedFeature = clickedFeatures.find(feature =>
        interactiveLayersRef.current.includes(feature.layer.id)
      );
  
      setClickInfo(clickedFeature ? { feature: clickedFeature, lngLat: lngLat } : null);
    },
    []
  );
  
// Converti `defaultBaseLayers` da oggetto a un array di valori
const baseLayersArray = Object.entries(defaultBaseLayers).map(
  ([key, value]) => ({ id: key, ...value })
);

// Filtra i base layers in base alla proprietà `baseLayers`
const filteredBaseLayers = baseLayers
  ? baseLayersArray.filter(layer => baseLayers.includes(layer.id))
  : baseLayersArray;

console.log("Base Layers Filtrati:", filteredBaseLayers);

  return (
    <React.Fragment>
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: zoom,
        }}
        style={{ height: height ? height : `800px` }}
        mapStyle={mapStyleUrl} 
        onLoad={onMapLoad}
        onClick={onClick}
      >
        {children}
        {clickInfo &&  clickInfo.feature.layer.metadata.popupTemplate && (
          <Popup
            anchor="top"
            longitude={clickInfo.lngLat.lng}
            latitude={clickInfo.lngLat.lat}
            onClose={() => setClickInfo(null)}
          >
            {
            }
            <div
              dangerouslySetInnerHTML={{
                __html: parseStringTemplate(
                  clickInfo.feature.layer.metadata.popupTemplate,
                  clickInfo.feature.properties,
                ),
              }}
            />
          </Popup>
        )}

        {geolocateControl && <GeolocateControl position={geolocateControl} />}
        {fullscreenControl && (
          <FullscreenControl position={fullscreenControl} />
        )}
        {navigationControl && (
          <NavigationControl position={navigationControl} />
        )}
        {scaleControl && <ScaleControl position={scaleControl} />}

        <ControlPanel
          position="top-right"
          baseLayers={filteredBaseLayers}
          selectedLayer={mapStyleUrl}
          onLayerChange={handleLayerChange}
        />
      </Map>
    </React.Fragment>
  )
}

export { MapCompLibre }
