const getEdrData = async (dEndPoint, dToken) => {
  let allResults = []; // Array per accumulare tutti i risultati
  let start = 0; // Offset iniziale
  const headers = dToken ? { Authorization: `Bearer ${dToken}` } : {}; // Header con token se presente

  console.log("Inizio del processo di recupero dati da EDR API...");

  while (true) {
    try {
      // Costruisce l'URL con il parametro 'start'
      const url = `${dEndPoint}&start=${start}`;
      console.log(`Richiesta in corso: ${url}`);

      // Esegue la richiesta
      const response = await fetch(url, { headers });

      // Controlla lo stato della risposta
      if (!response.ok) {
        throw new Error(`Errore HTTP! Status: ${response.status}`);
      }

      // Parsa la risposta JSON
      const data = await response.json();

      // Controlla la presenza dei risultati
      if (!data.results || data.results.length === 0) {
        console.log("Nessun dato aggiuntivo ricevuto. Interruzione del ciclo.");
        break;
      }

      console.log(`Dati ricevuti: ${data.results.length} elementi.`);

      const results = data.results; // Estrae gli oggetti risultato dalla risposta

      // Filtra gli oggetti risultato in base a determinate condizioni
// Filtra gli oggetti risultato
const filteredResults = results.filter((result) => {
  const discoveryLocation =
    result.localization &&
    result.localization.discovery_location &&
    result.localization.discovery_location.trim().toLowerCase();

  return (
    discoveryLocation && // Esclude i null o undefined
    discoveryLocation !== "roma?" && // Esclude "Roma?"
    !discoveryLocation.includes("ignoratur") // Esclude campi con "ignoratur"
  );
});


      // Concatena i risultati filtrati all'array di tutti i risultati
      allResults = allResults.concat(filteredResults);

      console.log(
        `Totale accumulato finora: ${allResults.length} elementi.`,
      );

      // Incrementa l'offset per la prossima richiesta
      start += 100; // Ogni richiesta ottiene i successivi 100 record
      console.log("Valore di 'start' alla fine del ciclo:", start);

    } catch (error) {
      console.error(
        `Errore durante la richiesta (start=${start}): ${error.message}`,
      );

      // Gestisce errori specifici per continuare il ciclo
      if (error.message.includes("Unexpected end of JSON input")) {
        console.warn(
          "JSON malformato, salto al prossimo offset...",
        );
        start += 100; // Salta al prossimo offset
      } else {
        // Termina il ciclo in caso di errori gravi
        throw new Error(
          `Errore critico durante la richiesta: ${error.message}`,
        );
      }
    }
  }

  console.log(
    `Processo completato. Numero totale di risultati: ${allResults.length}`,
  );

  return allResults;
};

export default getEdrData;
