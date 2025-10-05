export default defineI18nLocale(async () => {
  return {
    app: {
      description: 'Scryfallのカード画像をまとめてダウンロードできます。',
    },
    common: {
      loading: '読み込み中...',
    },
    alerts: {
      loading: '読み込み中: {current}枚 / {total}枚',
      success: '読み込み完了: {count}枚',
      errorTitle: '次のファイルをダウンロードできませんでした。',
      doubleFacedTitle: '両面カードが含まれています。',
    },
    downloadModal: {
      title: 'ダウンロード方法を選択',
      fileNameField: {
        label: 'ファイル名（任意）',
        description: 'ダウンロードするファイル名を指定します。',
        placeholder: '例: my-deck',
      },
      ttsCard: {
        title: 'TTS画像',
        description: 'Tabletop Simulator用の画像シートをダウンロードします。',
        button: 'TTS画像シートをダウンロード',
      },
      hiddenImageField: {
        label: 'Hidden Face 画像（任意）',
        uploadLabel: 'クリックまたはドラッグして画像を選択',
        uploadDescription: 'この画像はすべてのカードの Hidden Face 画像（相手の手札にある場合などに表示される画像）として使用されます。',
        selected: '選択済み: {fileName}',
      },
      zipCard: {
        title: 'ZIPファイル',
        description: '選択したカード画像をZipファイルにまとめてダウンロードします。',
        button: 'ZIPファイルをダウンロード',
      },
      progressTitle: 'ファイルをダウンロードしています...',
      progressDescription: '大きなアーカイブは準備に数分かかる場合があります。',
    },
    index: {
      cardsPlaceholder: '1 Kenrith, the Returned King\n1 Archivist of Oghma\n1 Avacyn\'s Pilgrim\n1 Biomancer\'s Familiar\n...',
      cardsInitialValue: '1 Kenrith, the Returned King\n1 Archivist of Oghma',
      searchButton: '検索',
      deckList: 'デッキリスト',
      selectCardLanguage: 'カードの言語を選択',
      deckListInvalidError: 'デッキリストに無効な文字列が含まれています。',
      deckListEmptyError: 'デッキリストが空です。',
    },
    select: {
      downloadButton: 'ダウンロード',
    },
    modal: {
      cancel: 'キャンセル',
      changeImage: '画像を変更',
    },
  }
})
