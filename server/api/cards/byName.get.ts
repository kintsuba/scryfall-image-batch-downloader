import {
  DEFAULT_LANGUAGE_CODE,
  isSupportedLanguageCode,
} from '~/constants/languages'
import { scryfallByName, scryfallBySet, scryfallSearch } from '../../utils/scryfall'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const name = query.name as string
  const langQuery = query.lang as string | undefined

  const normalizedLanguage = langQuery?.toLowerCase()
  const requestedLanguage = isSupportedLanguageCode(normalizedLanguage)
    ? normalizedLanguage
    : DEFAULT_LANGUAGE_CODE

  const card = await scryfallByName(decodeURI(name), true)

  if (requestedLanguage === 'en') {
    return card
  }

  try {
    const localizedCard = await scryfallBySet(
      card.set,
      parseInt(card.collector_number),
      requestedLanguage,
    )
    return localizedCard
  }
  catch {
    try {
      const localizedCards = await scryfallSearch(
        `oracleid:${card.oracle_id} lang:${requestedLanguage}`,
        {
          order: 'released',
          unique: 'prints',
        },
      )

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
