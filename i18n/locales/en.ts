export default defineI18nLocale(async () => {
  return {
    app: {
      description: 'Download Scryfall card images in batches.',
    },
    common: {
      loading: 'Loading...',
    },
    alerts: {
      loading: 'Now Loading: {current} / {total}',
      success: 'Loading Complete: {count}',
      errorTitle: 'The following file(s) could not be downloaded.',
      doubleFacedTitle: 'Double-Faced Card(s) exist.',
    },
    downloadModal: {
      title: 'Select a download option',
      fileNameField: {
        label: 'File name (optional)',
        description: 'Specify the download file name.',
        placeholder: 'e.g. my-deck',
      },
      ttsCard: {
        title: 'TTS Images',
        description: 'Download image sheets for Tabletop Simulator.',
        button: 'Download as TTS image sheets',
      },
      hiddenImageField: {
        label: 'Hidden Image (optional)',
        uploadLabel: 'Click or drag to choose an image',
        uploadDescription: 'This image will be used as the "hidden" card face for all cards.',
        selected: 'Selected: {fileName}',
      },
      zipCard: {
        title: 'ZIP Archive',
        description: 'Download selected card images bundled together.',
        button: 'Download as ZIP archive',
      },
      progressTitle: 'Downloading your files…',
      progressDescription: 'Large archives may take a few minutes to prepare.',
    },
    index: {
      cardsPlaceholder: '1 Kenrith, the Returned King\n1 Archivist of Oghma\n1 Avacyn\'s Pilgrim\n1 Biomancer\'s Familiar\n...',
      cardsInitialValue: '1 Kenrith, the Returned King\n1 Archivist of Oghma',
      searchButton: 'Search',
    },
    select: {
      downloadButton: 'Download',
    },
    modal: {
      cancel: 'Cancel',
      changeImage: 'Change Image',
    },
  }
})
