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
  // TODO: è chiaramente una prima bozza, ma questo non andrebbe collocato qui, ma spostato come un transformer service!
  if (zoteroGroup && dataOnto) {
    try {
      const nonGeoData = await getDataZotero(zoteroGroup)
      const geoData = await fetch(dataOnto).then(res => res.json())

      // Applica il mapping con map2Onto
      output = map2Onto(nonGeoData, geoData)

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

      return output
    } catch (error) {
      throw new Error(
        "Errore durante il recupero o il mapping dei dati Zotero: " + error,
      )
    }
  }

  // Caso edrAPI e dataOnto
  if (dEndPoint && dataOnto) {
    try {
      const geoDataInrome = await fetch(dataOnto).then(res => res.json())

      const edrData = await getEdrData(dEndPoint, dToken)

      output = edr2Onto(edrData, geoDataInrome)

      output.features.forEach(feature => {
        if (feature.properties.epigrafi) {
          feature.properties.epiList = feature.properties.epigrafi
            .map(
              item =>
                `<li>${item.title}: <strong>${item.discovery}</strong></li>`,
            )
            .join("")
        } else {
          feature.properties.epiList = "<li>No Epigraphy available</li>"
        }
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
