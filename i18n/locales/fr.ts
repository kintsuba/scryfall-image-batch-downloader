export default defineI18nLocale(async () => {
  return {
    app: {
      description: 'Téléchargez des images de cartes Scryfall en lots.',
    },
    common: {
      loading: 'Chargement...',
    },
    alerts: {
      loading: 'Chargement en cours : {current} / {total}',
      success: 'Chargement terminé : {count}',
      errorTitle: 'Les fichiers suivants n\'ont pas pu être téléchargés.',
      doubleFacedTitle: 'Des cartes recto-verso sont présentes.',
      doubleFacedDownloadButton: 'Télécharger les versos en ZIP',
    },
    downloadModal: {
      title: 'Choisissez une option de téléchargement',
      fileNameField: {
        label: 'Nom du fichier (facultatif)',
        description: 'Indiquez le nom du fichier à télécharger.',
        placeholder: 'ex. my-deck',
      },
      ttsCard: {
        title: 'Images TTS',
        description: 'Téléchargez des planches pour Tabletop Simulator.',
        button: 'Télécharger en planches TTS',
      },
      hiddenImageField: {
        label: 'Image cachée (facultatif)',
        uploadLabel: 'Cliquez ou faites glisser pour choisir une image',
        uploadDescription: 'Cette image sera utilisée comme face cachée pour toutes les cartes.',
      },
      zipCard: {
        title: 'Archive ZIP',
        description: 'Téléchargez les images de cartes individuelles regroupées.',
        button: 'Télécharger en archive ZIP',
      },
      progressTitle: 'Téléchargement de vos fichiers...',
      progressDescription: 'Les archives volumineuses peuvent nécessiter quelques minutes de préparation.',
    },
    index: {
      cardsPlaceholder: '1 Kenrith, the Returned King\n1 Archivist of Oghma\n1 Avacyn\'s Pilgrim\n1 Biomancer\'s Familiar\n...',
      cardsInitialValue: '1 Kenrith, the Returned King\n1 Archivist of Oghma',
      searchButton: 'Rechercher',
      deckList: 'Liste de deck',
      selectCardLanguage: 'Choisir la langue des cartes',
      deckListInvalidError: 'La liste de deck contient des chaînes invalides.',
      deckListEmptyError: 'La liste de deck est vide.',
    },
    select: {
      downloadButton: 'Télécharger',
    },
    modal: {
      cancel: 'Annuler',
      changeImage: 'Changer l\'image',
    },
  }
})
