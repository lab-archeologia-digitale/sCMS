const getEdrData = async (dEndPoint, dToken) => {
  let allResults = []
  let start = 0

  while (true) {
    try {
      // Aggiunge il token, se presente, nelle intestazioni
      const headers = dToken ? { Authorization: `Bearer ${dToken}` } : {}
      const response = await fetch(`${dEndPoint}?start=${start}`, { headers })

      if (response.status === 204) break
      const data = await response.json()

      if (!data.results) {
        throw new Error("La proprietà 'results' non è presente nei dati.")
      }

      const filteredResults = data.results.filter(result => {
        return (
          result.localization &&
          result.localization.discovery_location &&
          result.localization.discovery_location.trim() !== "" &&
          !result.localization.discovery_location
            .toLowerCase()
            .includes("ignoratur")
        )
      })

      allResults = allResults.concat(filteredResults)

      if (data.results.length === 0) break

      start += 100
      console.log("Valore di 'start' alla fine del ciclo:", start)
    } catch (error) {
      if (error.message.includes("Unexpected end of JSON input")) {
        start += 100
      } else {
        throw new Error(
          `Si è verificato un problema durante la richiesta: ${error.message}`,
        )
      }
    }
  }

  return allResults
}

export default getEdrData
