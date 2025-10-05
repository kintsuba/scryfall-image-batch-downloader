export default defineI18nLocale(async () => {
  return {
    app: {
      description: 'Lade Scryfall-Kartenbilder stapelweise herunter.',
    },
    common: {
      loading: 'Wird geladen...',
    },
    alerts: {
      loading: 'Wird geladen: {current} / {total}',
      success: 'Ladevorgang abgeschlossen: {count}',
      errorTitle: 'Die folgenden Dateien konnten nicht heruntergeladen werden.',
      doubleFacedTitle: 'Es sind doppelseitige Karten vorhanden.',
    },
    downloadModal: {
      title: 'Wähle eine Download-Option',
      fileNameField: {
        label: 'Dateiname (optional)',
        description: 'Gib den Namen der herunterzuladenden Datei an.',
        placeholder: 'z. B. my-deck',
      },
      ttsCard: {
        title: 'TTS-Bilder',
        description: 'Lade Bildbögen für Tabletop Simulator herunter.',
        button: 'Als TTS-Bildbögen herunterladen',
      },
      hiddenImageField: {
        label: 'Verdecktes Bild (optional)',
        uploadLabel: 'Zum Auswählen klicken oder ziehen',
        uploadDescription: 'Dieses Bild wird als „verdeckte“ Kartenseite für alle Karten verwendet.',
        selected: 'Ausgewählt: {fileName}',
      },
      zipCard: {
        title: 'ZIP-Archiv',
        description: 'Lade einzelne Kartenbilder gebündelt herunter.',
        button: 'Als ZIP-Archiv herunterladen',
      },
      progressTitle: 'Dateien werden heruntergeladen...',
      progressDescription: 'Große Archive können einige Minuten zur Vorbereitung benötigen.',
    },
    index: {
      cardsPlaceholder: '1 Kenrith, the Returned King\n1 Archivist of Oghma\n1 Avacyn\'s Pilgrim\n1 Biomancer\'s Familiar\n...',
      cardsInitialValue: '1 Kenrith, the Returned King\n1 Archivist of Oghma',
      searchButton: 'Suchen',
    },
    select: {
      downloadButton: 'Herunterladen',
    },
    modal: {
      cancel: 'Abbrechen',
      changeImage: 'Bild ändern',
    },
  }
})
