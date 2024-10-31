import zotero_client from "zotero-api-client"

// Esplora il contenuto di zotero_client per comprendere la struttura
//console.log("Contenuto di zotero_client:", zotero_client)

// Lista dei tipi di item da recuperare
const validItemTypes = ["book", "bookSection", "journalArticle", "report"]

/**
 * Ottiene un array di record dalla libreria di un gruppo Zotero, filtrando solo quelli con `tags` non vuoto.
 *
 * @param {string} zoteroGroup ID del gruppo Zotero
 * @param {int} limit Numero totale di elementi da recuperare
 * @param {int} start Offset iniziale, Default: 0
 * @param {Array} results Array di risultati
 * @returns {Array} dei risultati ottenuti
 */
const getDataZotero = async (
  zoteroGroup,
  limit = 100,
  start = 0,
  results = [],
) => {
  if (!zoteroGroup) {
    throw new Error(
      "zoteroGroup è obbligatorio per recuperare i dati da Zotero.",
    )
  }

  try {
    // Imposta il blocco massimo per ogni richiesta a 100
    const blockSize = 100

    // console.log(
    //   `Chiamata API Zotero - gruppo: ${zoteroGroup}, start: ${start}, limit: ${blockSize}`,
    // )

    // Esegui la richiesta all'API Zotero
    const zotResponse = await zotero_client()
      .library("group", zoteroGroup)
      .items()
      .get({
        start: start,
        limit: blockSize,
        itemType: validItemTypes.join(" || "),
      })

    // Filtra i risultati per mantenere solo quelli con `tags` non vuoto
    const filteredResults = zotResponse
      .getData()
      .filter(item => item.tags && item.tags.length > 0)

    // Aggiungi i risultati filtrati all'array complessivo
    results = results.concat(filteredResults)

    // console.log(
    //   "Numero di elementi con tag non vuoti recuperati finora:",
    //   results.length,
    // )

    // Se il numero di elementi nel blocco corrente è 100, continua a recuperare
    if (filteredResults.length === blockSize) {
      return getDataZotero(zoteroGroup, limit, start + blockSize, results)
    }

    // console.log(
    //   "Recupero completato. Totale elementi con tag non vuoti:",
    //   results.length,
    // )
    return results
  } catch (error) {
    console.error("Errore in getDataZotero:", error)
    throw error
  }
}

// Test isolato della funzione `getDataZotero`
// ;(async () => {
//   try {
//     const zoteroGroup = "336647" // Sostituisci con l'ID del gruppo effettivo
//     const data = await getDataZotero(zoteroGroup, 1000) // Imposta un limite totale se necessario
//     console.log("Dati Zotero recuperati con tag non vuoti:", data)
//   } catch (error) {
//     console.error("Errore nel test isolato API Zotero:", error)
//   }
// })()

export default getDataZotero
