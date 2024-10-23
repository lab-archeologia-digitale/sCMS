import * as React from "react"
import { useState, useCallback } from "react"
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

const MapCompLibre = ({
  children,
  height,
  center,
  interactiveLayerIds = [], // TODO rendere dinamico activeLayerId
  mapStyle,
  geolocateControl,
  fullscreenControl,
  navigationControl,
  scaleControl,
  baseLayers, //TODO SCELTA BASELAYER DA MDX
}) => {
  const [lng, lat, zoom] = center ? center.split(",").map(e => parseFloat(e.trim())) : [0,0,2]

  const [mapStyleUrl, setMapStyleUrl] = useState(
    mapStyle || "https://demotiles.maplibre.org/style.json",
  ) // Stile di default https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json

  const [clickInfo, setClickInfo] = useState(null)

  const handleLayerChange = styleUrl => {
    setMapStyleUrl(styleUrl)
  }

  const onClick = useCallback(
    event => {
      const { features } = event
      // Filtra solo i feature dai layer interattivi
      const clickedFeature = features.find(feature =>
        interactiveLayerIds.includes(feature.layer.id),
      )
      setClickInfo(clickedFeature ? { feature: clickedFeature } : null)
    },
    [interactiveLayerIds],
  )


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
        interactiveLayerIds={interactiveLayerIds} // Passa l'array di layer interattivi
        onClick={onClick}
      >
        {children}

        {clickInfo && (
          <Popup
            anchor="top"
            longitude={Number(clickInfo.feature.geometry.coordinates[0])}
            latitude={Number(clickInfo.feature.geometry.coordinates[1])}
            onClose={() => setClickInfo(null)}
          >
          ciao
            {
              console.log(
                clickInfo.feature.layer.metadata.popupTemplate,
                clickInfo.feature.properties
              )
              // TODO: prendere clickInfo.feature.layer.metadata.popupTemplate
              // https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
              // e interpolarlo con clickInfo.feature.properties
              
            }
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
          baseLayers={defaultBaseLayers}
          selectedLayer={mapStyleUrl}
          onLayerChange={handleLayerChange}
        />
      </Map>
    </React.Fragment>
  )
}

export { MapCompLibre }
