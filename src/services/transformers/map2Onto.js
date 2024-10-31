/**
 *
 * @param {Array} features Array of ontology (GeoJSON) features
 * @returns {Object} Object containing (only) properties of each feature.
 *                   The name property is used as index
 *                    e.g.: { "Chaonia": {"name": "Chaonia", "altLabel": "Kaonia, Caonia", "broader": "Epirus"}, ...
 */
function returnVoc(features) {
  const ret = {}
  for (const item of features) {
    let nome = item.properties.name
    ret[nome] = item.properties
    let altLabel = item.properties.altLabel
    ret[altLabel] = item.properties
  }
  return ret
}

/**
 * Prende l'oggetto bibliografia e ad ogni item aggiunge una proprietà chiamata match,
 * contenente un array di tag del vocabolario che corrispondono a toponimi.
 * @param {Object} biblio Item della risposta della libreria Zotero
 * @param {Object} voc Voci dell'ontologia
 * @returns {Object} L'oggetto bibliografia come scaricato da Zotero, con la proprietà `match`
 */
function parseBiblio(biblio, voc) {
  const map = []
  for (const item of biblio) {
    mapItemByVoc(item, voc)
    map.push(item)
  }
  return map
}

/**
 * Mappa gli item della bibliografia e confronta con l'ontologia
 * Funzioni da eseguire in ordine:
 * - Estrae i tag dagli item della biblio che iniziano con "@"
 * - Confronta i tag con i toponimi dell'ontologia
 * @param {Object} item Item della risposta della libreria Zotero
 * @param {Object} voc Voci dell'ontologia
 */
function mapItemByVoc(item, voc) {
  const biblioItemTags = item?.tags.length
    ? [...item.tags.map(obj => obj.tag)]
    : []
  updateItemObjWithMatchFromVocProperties(item, voc, biblioItemTags)
}

/**
 * Aggiorna gli item di Zotero in base alla risposta
 * Crea la prop `match` se c'è corrispondenza con il vocabolario
 * @param {object} item Item bibliografico della risposta della libreria Zotero
 * @param {object} voc Voci dell'ontologia
 * @param {Array.<string>} biblioItemTags Tags degli item di Zotero
 * @returns {void}
 */
function updateItemObjWithMatchFromVocProperties(
  item,
  voc,
  biblioItemTags = [],
) {
  if (!Array.isArray(biblioItemTags))
    throw new Error("È necessario un array di tag o una stringa")

  const vocTags = Object.keys(voc)
  if (!item.match) item.match = []

  for (let tag of biblioItemTags) {
    // Filtra solo i tag che iniziano con "@" e rimuovi il prefisso per il confronto
    if (tag.startsWith("@")) {
      const cleanTag = tag.slice(1) // Rimuovi "@"

      // Confronta con i toponimi nell'ontologia
      if (vocTags.includes(cleanTag)) {
        item.match.push(voc[cleanTag])
      }
    }
  }
}

/**
 * Raggruppa tutti i libri per matched tag e crea un file GeoJSON
 * @param {Object} zoteroBiblioMappedWithVoc Bibliografia con proprietà match
 * @param {Object} geoData Ontologia originale (GeoJSON)
 * @returns {Array} Ontologia originale con, per ogni elemento, proprietà `biblio`, un array con la bibliografia
 */
function mapBibliography(zoteroBiblioMappedWithVoc, geoData) {
  for (const zoteroItem of zoteroBiblioMappedWithVoc) {
    if (zoteroItem?.match.length) {
      zoteroItem.match.forEach(m => {
        geoData.features.forEach(mapEl => {
          if (mapEl.properties.name === m.name) {
            if (!mapEl.properties.hasOwnProperty("biblio")) {
              mapEl.properties.biblio = []
            }
            mapEl.properties.biblio.push({
              key: zoteroItem.key,
              title: zoteroItem.title,
              tag: zoteroItem.tags,
              author_date:
                zoteroItem.creators
                  .map(e => (e.creatorType === "author" ? e.lastName : false))
                  .filter(Boolean)
                  .join(", ") +
                ". " +
                zoteroItem.date,
            })
          }
        })
      })
    }
  }

  return geoData
}

/**
 * Funzione principale che accetta dati non geografici e dati geografici per il mapping
 * @param {Array} nonGeoData Dati bibliografici (Zotero)
 * @param {Object} geoData Dati geografici (GeoJSON)
 * @returns {Object} GeoJSON con dati bibliografici mappati
 */
const map2Onto = (nonGeoData, geoData) => {
  const voc = returnVoc(geoData.features)
  const zoteroBiblioMappedWithVoc = parseBiblio(nonGeoData, voc).filter(
    e => e.match.length > 0,
  )
  return mapBibliography(zoteroBiblioMappedWithVoc, geoData)
}

export default map2Onto
