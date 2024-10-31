import csv from "csvtojson"
import json2geoJson from "./transformers/json2geojson.js"
import map2Onto from "./transformers/map2Onto.js"
import edr2Onto from "./transformers/edr2Onto.js"
import getDataZotero from "./getDataZotero"
import getEdrData from "./getEdrData"
import sourcePropTypes from "./sourcePropTypes.js"
import { withPrefix } from "gatsby"

const getDataFromSource = async source => {
  let {
    path2data,
    dEndPoint,
    dToken,
    dTable,
    id,
    dQueryString,
    transType,
    geoField,
    zoteroGroup, // gruppo Zotero
    dataOnto, // Aggiunto per mappare i dati con l'ontologia
  } = source

  let sourceUrl
  let options = {}
  let output

  // Caso ZoteroGroup e dataOnto

  if (zoteroGroup && dataOnto) {
    try {
      //console.log("Inizio recupero dati Zotero...")
      const nonGeoData = await getDataZotero(zoteroGroup)
      //console.log("Dati Zotero recuperati:", nonGeoData)

      const geoData = await fetch(dataOnto).then(res => res.json())
      console.log("Dati geografici (GeoJSON) recuperati:", geoData)

      // Applica il mapping con map2Onto
      output = map2Onto(nonGeoData, geoData)
      // console.log("Output mappato (output):", output)

      // Creazione del campo `biblioList` in formato HTML per ogni feature
      output.features.forEach(feature => {
        if (feature.properties.biblio) {
          feature.properties.biblioList = feature.properties.biblio
            .map(
              item =>
                `<li>${item.author_date}: <strong>${item.title}</strong></li>`,
            )
            .join("")
        } else {
          feature.properties.biblioList = "<li>No bibliography available</li>"
        }
      })

      // Filtra le feature per mantenere solo i punti (geometry.type === "Point") solo se provengono da Zotero
      output.features = output.features.filter(
        feature => feature.geometry.type === "Point",
      )

      //console.log("Output finale con solo punti (da Zotero):", output)
      return output // Restituisce il GeoJSON mappato con solo i punti
    } catch (error) {
      throw new Error(
        "Errore durante il recupero o il mapping dei dati Zotero: " + error,
      )
    }
  }

  // Caso edrAPI e dataOnto
  if (dEndPoint && dataOnto) {
    try {
      const edrData = await getEdrData(dEndPoint, dToken)
      console.log("Dati non geografici (edr) recuperati (edrData):", edrData)
      // Fetch di geoData da dataOnto
      const geoData = await fetch(dataOnto).then(res => res.json())
      console.log("Dati geografici (GeoJSON) recuperati (geoData):", geoData)

      let edrGeoData = geoField ? json2geoJson(edrData, geoField) : edrData

      // Mapping dei dati
      output = edr2Onto(edrGeoData, geoData)
      console.log("Output mappato dopo edr2Onto:", output)

      // Creazione di epiList
      output.features.forEach(feature => {
        feature.properties.epiList = feature.properties.epigrafi
          ? feature.properties.epigrafi
              .map(
                item =>
                  `<li>${item.discovery_location}: <strong>${item.title}</strong></li>`,
              )
              .join("")
          : "<li>No Epigraphy available</li>"
      })

      return output
    } catch (error) {
      throw new Error(
        "Errore durante il recupero o il mapping dei dati da dEndPoint e dataOnto: " +
          error,
      )
    }
  }

  if (path2data) {
    sourceUrl = path2data.startsWith("http") ? path2data : withPrefix(path2data)
    if (path2data.toLowerCase().endsWith(".csv")) {
      transType = "csv2json"
    }
    if (path2data.toLowerCase().endsWith(".geojson")) {
      transType = "json"
    }
  } else {
    if (dEndPoint) {
      sourceUrl = dEndPoint
    } else if (process.env.GATSBY_DIRECTUS_ENDPOINT && dTable) {
      sourceUrl = `${process.env.GATSBY_DIRECTUS_ENDPOINT}items/${dTable}`
    } else {
      console.log(path2data)
      throw new Error(
        "Either `dEndPoint` or env variable `GATSBY_DIRECTUS_ENDPOINT` AND `dTable` are needed",
      )
    }
    if (id) {
      sourceUrl += `/${id}`
    } else {
      sourceUrl += `?${dQueryString ? dQueryString : ""}`
    }

    const token = dToken ? dToken : process.env.GATSBY_DIRECTUS_TOKEN

    if (token) {
      options = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    }
  }

  try {
    const response = await fetch(sourceUrl, options)

    switch (transType) {
      case "text":
        output = await response.text()
        break

      case "csv2json":
        const csvText = await response.text()
        output = await csv().fromString(csvText)
        break

      case "geojson":
        const respJson = await response.json()
        output = json2geoJson(respJson.data, geoField)
        break

      case "json":
      default:
        output = await response.json()
        break
    }

    if (output.errors) {
      throw new Error(
        `Error communicating with server: ${output.errors[0].message}`,
      )
    }

    // Nessun filtro per le feature "Point" qui, se i dati non provengono da Zotero

    return Object.hasOwn(output, "data") ? output.data : output
  } catch (error) {
    throw new Error(error)
  }
}

getDataFromSource.PropTypes = {
  source: sourcePropTypes,
}

export default getDataFromSource
