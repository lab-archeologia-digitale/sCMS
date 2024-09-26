import * as React from "react"
import { useState, useCallback, useEffect } from "react"
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

const Map2 = ({
  children,
  longitude,
  latitude,
  interactiveLayerIds = [],
  styleJson,
  filterConditions = [], // Ricevi le condizioni di filtro
  layerId, // Ricevi la proprietà layerId
}) => {
  const initialViewState = {
    longitude: longitude || 12.4964,
    latitude: latitude || 41.9028,
    zoom: 8,
  }
  const style = { width: "100%", height: 400 }

  const [mapStyle, setMapStyle] = useState(
    styleJson || "https://demotiles.maplibre.org/style.json"
  ) // Default style

  const handleLayerChange = styleUrl => {
    setMapStyle(styleUrl)
  }

  const [clickInfo, setClickInfo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [mapInstance, setMapInstance] = useState(null) // Stato per memorizzare la mappa

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
  }

  const onClick = useCallback(
    event => {
      const { features } = event
      // Filtra solo i feature dai layer interattivi
      const clickedFeature = features.find(feature =>
        interactiveLayerIds.includes(feature.layer.id)
      )

      setClickInfo(clickedFeature ? { feature: clickedFeature } : null)
    },
    [interactiveLayerIds]
  )

  useEffect(() => {
    if (mapInstance) {
      if (searchTerm) {
        console.log("Search term:", searchTerm) // Aggiungi questo
        const isProperty = filterConditions.includes(searchTerm)
        console.log("Is property:", isProperty) // Aggiungi questo

        if (Array.isArray(layerId)) {
          layerId.forEach(id => {
            if (isProperty) {
              console.log(`Setting filter for ${id}:`, searchTerm) // Aggiungi questo
              mapInstance.setFilter(id, ["==", ["get", searchTerm], "true"])
            } else {
              const lowerSearchTerm = searchTerm.toLowerCase()
              const filterConditionsArray = filterConditions.map(property => [
                "in",
                lowerSearchTerm,
                ["downcase", ["get", property]],
              ])
              console.log(
                `Setting filter for ${id} with conditions:`,
                filterConditionsArray
              ) // Aggiungi questo
              mapInstance.setFilter(id, ["any", ...filterConditionsArray])
            }
          })
        } else {
          if (isProperty) {
            console.log(`Setting filter for ${layerId}:`, searchTerm) // Aggiungi questo
            mapInstance.setFilter(layerId, ["==", ["get", searchTerm], "true"])
          } else {
            const lowerSearchTerm = searchTerm.toLowerCase()
            const filterConditionsArray = filterConditions.map(property => [
              "in",
              lowerSearchTerm,
              ["downcase", ["get", property]],
            ])
            console.log(
              `Setting filter for ${layerId} with conditions:`,
              filterConditionsArray
            ) // Aggiungi questo
            mapInstance.setFilter(layerId, ["any", ...filterConditionsArray])
          }
        }
      } else {
        // Rimuovi il filtro se il searchTerm è vuoto
        if (Array.isArray(layerId)) {
          layerId.forEach(id => {
            mapInstance.setFilter(id, null)
          })
        } else {
          mapInstance.setFilter(layerId, null)
        }
      }
    }
  }, [mapInstance, searchTerm, filterConditions, layerId])

  return (
    <>
      <Mappa>
        <input
          type="text"
          placeholder="Cerca..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Map
          initialViewState={initialViewState}
          style={style}
          mapStyle={mapStyle} // Usa il mapStyle dallo stato
          interactiveLayerIds={interactiveLayerIds} // Passa l'array di layer interattivi
          onClick={onClick}
          onLoad={event => setMapInstance(event.target)} // Setta l'istanza della mappa quando è caricata
        >
          {children}
          {/* Passa searchTerm a SourceLayer */}
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { searchTerm })
            }
            return child
          })}
          <Source
            id="basemap"
            type="raster"
            tiles={[mapStyle]}
            tileSize={256}
          />
          <Layer id="basemap-layer" type="raster" source="basemap" />

          {clickInfo && (
            <Popup
              anchor="top"
              longitude={Number(clickInfo.feature.geometry.coordinates[0])}
              latitude={Number(clickInfo.feature.geometry.coordinates[1])}
              onClose={() => setClickInfo(null)}
            >
              <div>
                {/* Visualizza le proprietà del feature cliccato */}
                {clickInfo.feature.properties &&
                  JSON.stringify(clickInfo.feature.properties, null, 2)}
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
