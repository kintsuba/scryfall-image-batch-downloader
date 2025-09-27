import * as Scry from 'scryfall-sdk'
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguageCode,
} from '~/constants/languages'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const name = query.name as string
  const langQuery = query.lang as string | undefined

  const normalizedLanguage = langQuery?.toLowerCase()
  const requestedLanguage = isSupportedLanguageCode(normalizedLanguage)
    ? normalizedLanguage
    : DEFAULT_LANGUAGE

  Scry.setAgent('Scryfall Image Batch Downloader', '1.0.0')
  const card = await Scry.Cards.byName(decodeURI(name), true)

  if (requestedLanguage === 'en') {
    return card
  }

  try {
    const localizedCard = await Scry.Cards.bySet(
      card.set,
      parseInt(card.collector_number),
      requestedLanguage,
    )
    return localizedCard
  }
  catch {
    try {
      const localizedCards = await Scry.Cards.search(
        `oracleid:${card.oracle_id} lang:${requestedLanguage}`,
        {
          order: 'released',
          unique: 'prints',
        },
      )
        .cancelAfterPage()
        .waitForAll()

      const [firstLocalizedCard] = localizedCards
      if (firstLocalizedCard) {
        return firstLocalizedCard
      }
    }
    catch {
      return card
    }

    return card
  }
})
