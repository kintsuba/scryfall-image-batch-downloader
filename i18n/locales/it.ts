export default defineI18nLocale(async () => {
  return {
    app: {
      description: 'Scarica in batch le immagini delle carte Scryfall.',
    },
    common: {
      loading: 'Caricamento...',
    },
    alerts: {
      loading: 'Caricamento in corso: {current} / {total}',
      success: 'Caricamento completato: {count}',
      errorTitle: 'Impossibile scaricare i seguenti file.',
      doubleFacedTitle: 'Sono presenti carte bifronte.',
    },
    downloadModal: {
      title: 'Seleziona un\'opzione di download',
      fileNameField: {
        label: 'Nome file (facoltativo)',
        description: 'Specifica il nome del file da scaricare.',
        placeholder: 'es. my-deck',
      },
      ttsCard: {
        title: 'Immagini TTS',
        description: 'Scarica fogli di immagini per Tabletop Simulator.',
        button: 'Scarica come fogli immagine TTS',
      },
      hiddenImageField: {
        label: 'Immagine nascosta (facoltativa)',
        uploadLabel: 'Fai clic o trascina per scegliere un\'immagine',
        uploadDescription: 'Questa immagine verrà usata come faccia nascosta per tutte le carte.',
        selected: 'Selezionato: {fileName}',
      },
      zipCard: {
        title: 'Archivio ZIP',
        description: 'Scarica le immagini delle carte singole in un unico pacchetto.',
        button: 'Scarica come archivio ZIP',
      },
      progressTitle: 'Download dei file in corso...',
      progressDescription: 'Gli archivi di grandi dimensioni potrebbero richiedere alcuni minuti per essere preparati.',
    },
    index: {
      cardsPlaceholder: '1 Kenrith, the Returned King\n1 Archivist of Oghma\n1 Avacyn\'s Pilgrim\n1 Biomancer\'s Familiar\n...',
      cardsInitialValue: '1 Kenrith, the Returned King\n1 Archivist of Oghma',
      searchButton: 'Cerca',
    },
    select: {
      downloadButton: 'Scarica',
    },
    modal: {
      cancel: 'Annulla',
      changeImage: 'Cambia immagine',
    },
  }
})
