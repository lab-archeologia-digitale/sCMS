function edr2Onto(edrData, geoData) {
  // Verifica validità di edrData e geoData
  if (!geoData || !geoData.features || !Array.isArray(edrData)) {
    console.error("Dati mancanti o non validi in edrData o geoData")
    return null
  }

  // Funzione per creare un oggetto basato sulla proprietà "nome"
  function returnTopo(features) {
    const ret = {}
    features.forEach(item => {
      const nome = item.properties.nome?.toLowerCase()
      if (nome) ret[nome] = item.properties

      const altLabel = item.properties.altLabel
      if (altLabel) {
        altLabel.split(",").forEach(label => {
          ret[label.trim().toLowerCase()] = item.properties
        })
      }
    })
    return ret
  }

  const topo = returnTopo(geoData.features)

  // Funzione per aggiungere il match
  function addMatchEdr(item, topo, discoveryLoc = "") {
    if (typeof discoveryLoc !== "string") return
    if (!item.match) item.match = []

    Object.keys(topo).forEach(word => {
      if (discoveryLoc.toLowerCase().includes(word)) {
        item.match.push(word)
      }
    })
  }

  // Mappatura delle epigrafi per blocchi
  function parseEDR(edr, topo, blockSize = 500) {
    const matched = []
    for (let i = 0; i < edr.length; i += blockSize) {
      const block = edr.slice(i, i + blockSize)
      block.forEach(item => {
        if (item.localization?.discovery_location) {
          addMatchEdr(item, topo, item.localization.discovery_location)
          if (item.match && item.match.length > 0) {
            matched.push(item)
            console.log("Match trovato:", item.match) // Log per corrispondenze
          }
        }
      })
      console.log(`Processato blocco ${i / blockSize + 1}`)
    }
    return matched
  }

  const edrMatch = parseEDR(edrData, topo)

  function mapEdr(edrMatch, toponimi) {
    toponimi.features = toponimi.features.filter(mapEl => {
      mapEl.properties.epiList = []

      edrMatch.forEach(edrItem => {
        edrItem.match.forEach(m => {
          if (
            mapEl.properties.nome.toLowerCase() === m ||
            mapEl.properties.altLabel
              ?.toLowerCase()
              .split(",")
              .some(label => label.trim() === m)
          ) {
            const recordNumber = edrItem.identification.record_number
            if (
              !mapEl.properties.epiList.some(epi => epi.title === recordNumber)
            ) {
              mapEl.properties.epiList.push({
                title: recordNumber,
                url: edrItem.identification.url,
                discovery: edrItem.localization.discovery_location,
              })
            }
          }
        })
      })
      return mapEl.properties.epiList.length > 0
    })
    return toponimi
  }

  return mapEdr(edrMatch, geoData)
}

export default edr2Onto
