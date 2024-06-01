import * as React from "react"
import { useState, useCallback } from "react"
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  Popup,
  Source,
  Layer,
} from "react-map-gl/maplibre"
import ControlPanel from "./control-panel"
import { defaultBaseLayers } from "./defaultBaseLayers"
import styled from "styled-components"

// {children è fondamentale per avere il render di <SourceLayer/>
const Map2 = ({ children, longitude, latitude, interactiveLayerIds }) => {
  const initialViewState = {
    longitude: longitude || 12.4964,
    latitude: latitude || 41.9028,
    zoom: 8,
  }
  const style = { width: "100%", height: 400 }
  //const mapStyle = "https://demotiles.maplibre.org/style.json"

  const [mapStyle, setMapStyle] = useState(defaultBaseLayers.OSM.url) // Default style

  const handleLayerChange = styleUrl => {
    setMapStyle(styleUrl)
  }

  const [hoverInfo, setHoverInfo] = useState(null)

  const onHover = useCallback(event => {
    const { features } = event
    const hoveredFeature = features && features[0]

    // prettier-ignore
    setHoverInfo(hoveredFeature && {feature: hoveredFeature});
  }, [])

  return (
    <>
      <Mappa>
        <Map
          initialViewState={initialViewState}
          style={style}
          mapStyle="https://demotiles.maplibre.org/style.json" // Keep a default Mapbox style for initialization
          interactiveLayerIds={[interactiveLayerIds]}
          onMouseMove={onHover}
        >
          {children}
          <Source
            id="basemap"
            type="raster"
            tiles={[mapStyle]}
            tileSize={256}
          />
          <Layer id="basemap-layer" type="raster" source="basemap" />
          {hoverInfo && (
            <Popup
              anchor="top"
              longitude={Number(hoverInfo.feature.geometry.coordinates[0])}
              latitude={Number(hoverInfo.feature.geometry.coordinates[1])}
              onClose={() => setHoverInfo(null)}
            >
              <div>
                {hoverInfo.feature.properties.comune}
                {hoverInfo.feature.properties.nome}
              </div>
            </Popup>
          )}
          <GeolocateControl position="top-left" />
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />
          <ScaleControl />
          <ControlPanel
            position="top-right"
            baseLayers={defaultBaseLayers}
            selectedLayer={mapStyle}
            onLayerChange={handleLayerChange}
          />
        </Map>
      </Mappa>
    </>
  )
}

//style
const Mappa = styled.div`
  .control-panel {
    position: relative;
    top: 0;
    right: -550px;
    max-width: 200px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    padding: 10px;
    margin: 20px;
    line-height: 2;
    color: #6b6b76;
    text-transform: lowercase;
    font-size: 10px;
    outline: none;
  }
  h3,
  .h3 {
    font-size: 0.75rem;
  }
`

export { Map2 }
