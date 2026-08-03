import {
  cardByNameQuerySchema,
  validateWith,
} from '../../utils/validation'
import { scryfallByName, scryfallBySet, scryfallSearch } from '../../utils/scryfall'

export default defineEventHandler(async (event) => {
  const {
    name,
    lang: requestedLanguage,
  } = await getValidatedQuery(event, validateWith(cardByNameQuerySchema))

  const card = await scryfallByName(name, true)

  if (requestedLanguage === 'en') {
    return card
  }

  try {
    const localizedCard = await scryfallBySet(
      card.set,
      card.collector_number,
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
