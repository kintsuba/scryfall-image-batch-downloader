import type * as Scry from 'scryfall-sdk'
import {
  cardByNamesBodySchema,
  validateWith,
} from '../../utils/validation'
import { scryfallByName, scryfallBySet } from '../../utils/scryfall'

export default defineEventHandler(async (event) => {
  const {
    cardNames,
    language: requestedLanguage,
  } = await readValidatedBody(event, validateWith(cardByNamesBodySchema))

  const cards: Scry.Card[] = []
  const localizedCards: Scry.Card[] = []
  const errorCardNames: string[] = []

  for (const name of cardNames) {
    console.log(`Fetching: ${name}`)

    try {
      const card = await scryfallByName(name)
      if (!card.image_uris) throw new Error()
      cards.push(card)
      console.log(`Fetched: ${name}`)
    }
    catch {
      errorCardNames.push(name)
      console.error(`Failed: ${name}`)
    }
  }

  for (const card of cards) {
    console.log(`Search ${requestedLanguage} card with: ${card.name}`)

    if (requestedLanguage === 'en') {
      localizedCards.push(card)
      continue
    }

    try {
      const localizedCard = await scryfallBySet(
        card.set,
        card.collector_number,
        requestedLanguage,
      )

      if (!localizedCard.image_uris) throw new Error()

      localizedCards.push(localizedCard)
      console.log(`Found: ${localizedCard.name}`)
    }
    catch {
      localizedCards.push(card)
      console.log(`Not Found: ${card.name}`)
    }
  }

  return { cards: localizedCards, errorCardNames: errorCardNames }
})
