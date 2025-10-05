export default defineI18nLocale(async () => {
  return {
    app: {
      description: 'Descarga imágenes de cartas de Scryfall en lotes.',
    },
    common: {
      loading: 'Cargando...',
    },
    alerts: {
      loading: 'Cargando: {current} / {total}',
      success: 'Carga completada: {count}',
      errorTitle: 'No se pudieron descargar los siguientes archivos.',
      doubleFacedTitle: 'Hay cartas de doble cara.',
    },
    downloadModal: {
      title: 'Selecciona una opción de descarga',
      fileNameField: {
        label: 'Nombre de archivo (opcional)',
        description: 'Especifica el nombre del archivo a descargar.',
        placeholder: 'p. ej. my-deck',
      },
      ttsCard: {
        title: 'Imágenes TTS',
        description: 'Descarga láminas de imágenes para Tabletop Simulator.',
        button: 'Descargar como láminas TTS',
      },
      hiddenImageField: {
        label: 'Imagen oculta (opcional)',
        uploadLabel: 'Haz clic o arrastra para elegir una imagen',
        uploadDescription: 'Esta imagen se utilizará como la cara oculta de todas las cartas.',
        selected: 'Seleccionado: {fileName}',
      },
      zipCard: {
        title: 'Archivo ZIP',
        description: 'Descarga las imágenes individuales de las cartas en un paquete.',
        button: 'Descargar como archivo ZIP',
      },
      progressTitle: 'Descargando tus archivos...',
      progressDescription: 'Los archivos grandes pueden tardar unos minutos en prepararse.',
    },
    index: {
      cardsPlaceholder: '1 Kenrith, the Returned King\n1 Archivist of Oghma\n1 Avacyn\'s Pilgrim\n1 Biomancer\'s Familiar\n...',
      cardsInitialValue: '1 Kenrith, the Returned King\n1 Archivist of Oghma',
      searchButton: 'Buscar',
      deckList: 'Lista de mazo',
      selectCardLanguage: 'Seleccionar idioma de las cartas',
      deckListInvalidError: 'La lista de mazo contiene cadenas no válidas.',
      deckListEmptyError: 'La lista de mazo está vacía.',
    },
    select: {
      downloadButton: 'Descargar',
    },
    modal: {
      cancel: 'Cancelar',
      changeImage: 'Cambiar imagen',
    },
  }
})
