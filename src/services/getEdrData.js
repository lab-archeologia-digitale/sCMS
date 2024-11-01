const getEdrData = async (dEndPoint, dToken) => {
  let allResults = []
  let start = 0
  const headers = dToken ? { Authorization: `Bearer ${dToken}` } : {} // Aggiunge il token, se presente

  while (true) {
    try {
      const response = await fetch(`${dEndPoint}?limit=100&offset=${start}`, {
        headers,
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.data || data.data.length === 0) {
        break // Interrompe se non ci sono più dati
      }

      allResults = allResults.concat(data.data) // Aggiunge i risultati
      start += data.data.length

      console.log(`Risultati accumulati: ${allResults.length}`)
    } catch (error) {
      console.error("Errore durante la richiesta di dati Directus:", error)
      break
    }
  }

  return allResults
}

export default getEdrData
