function edr2Onto(edrData, geoData) {
  // Verifica validità di edrData e geoData
  if (!geoData || !geoData.features || !Array.isArray(edrData)) {
    console.error("Dati mancanti o non validi in edrData o geoData")
    return null
  }

  // Funzione per creare un oggetto basato sulla proprietà "nome" del toponimo
  function returnTopo(features) {
    const ret = {}
    features.forEach(item => {
      const nome = item.properties.nome?.toLowerCase().trim()
      if (nome) ret[nome] = item.properties

      const altLabel = item.properties.altLabel
      if (altLabel) {
        altLabel.split(",").forEach(label => {
          const trimmedLabel = label.trim().toLowerCase()
          if (trimmedLabel) {
            ret[trimmedLabel] = item.properties
          }
        })
      }
    })
    return ret
  }

  const topo = returnTopo(geoData.features)
  //console.log("Toponimi elaborati (topo):", topo)

  function addMatchEdr(item, topo, discoveryLoc = "") {
    if (typeof discoveryLoc !== "string" || !discoveryLoc.trim()) {
      console.warn("Formato discovery_location non valido:", discoveryLoc)
      return
    }

    const matches = []
    Object.keys(topo).forEach(word => {
      if (discoveryLoc.toLowerCase().includes(word)) {
        matches.push(word)
      }
    })

    if (matches.length > 0) {
      item.match = matches // Aggiunge la proprietà 'match' solo se c'è almeno un match
    }
  }

  // Mappatura delle epigrafi per blocchi
  function parseEDR(edr, topo, blockSize = 500) {
    const matched = []
    // let analyzedLocations = 0

    for (let i = 0; i < edr.length; i += blockSize) {
      const block = edr.slice(i, i + blockSize)
      block.forEach(item => {
        const discoveryLoc = item.discovery_location // Accesso diretto

        if (discoveryLoc) {
          //  analyzedLocations++
          addMatchEdr(item, topo, discoveryLoc)

          if (item.match && item.match.length > 0) {
            matched.push(item)
          }
        } else {
          console.warn("discovery_location mancante per item:", item)
        }
      })
      //console.log(`Processato blocco ${i / blockSize + 1}`)
    }

    //console.log(
    //  `Numero totale di discovery_location analizzate: ${analyzedLocations}`,
    //)
    //console.log(
    //  "EDR data con la proprietà match:",
    //  edr.filter(item => item.match && item.match.length > 0),
    //)
    return matched
  }

  const edrMatch = parseEDR(edrData, topo)

  // Funzione per mappare le epigrafi corrispondenti sui toponimi
  function mapEdr(edrMatch, toponimi) {
    for (const mapEl of toponimi.features) {
      if (!mapEl.properties.hasOwnProperty("epigrafi")) {
        mapEl.properties.epigrafi = []
      }
    }

    for (const edrItem of edrMatch) {
      if (edrItem?.match.length) {
        edrItem.match.forEach(m => {
          for (const mapEl of toponimi.features) {
            const nomeMatch =
              mapEl.properties.nome &&
              mapEl.properties.nome.trim().toLowerCase() ===
                m.trim().toLowerCase()

            const altLabelMatch =
              mapEl.properties.altLabel &&
              mapEl.properties.altLabel
                .split(",")
                .map(label => label.trim().toLowerCase())
                .includes(m.trim().toLowerCase())

            if (nomeMatch || altLabelMatch) {
              const recordNumber = edrItem.record_number
              if (
                !mapEl.properties.epigrafi.some(
                  epigrafi => epigrafi.title === recordNumber,
                )
              ) {
                mapEl.properties.epigrafi.push({
                  title: edrItem.record_number,
                  url: edrItem.url,
                  discovery: edrItem.discovery_location,
                })
              }
            }
          }
        })
      }
    }

    // Aggiungi il numero di epigrafi come nuova proprietà
    for (const mapEl of toponimi.features) {
      mapEl.properties.numEpigrafi = mapEl.properties.epigrafi.length
    }

    const result = {
      ...toponimi,
      features: toponimi.features.filter(
        feature => feature.properties.epigrafi.length > 0,
      ),
    }

    // console.log(
    //  "Numero di toponimi con epigrafi corrispondenti:",
    //  result.features.length,
    // )
    return result
  }

  return mapEdr(edrMatch, geoData)
}

export default edr2Onto
