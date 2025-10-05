import * as Scry from 'scryfall-sdk'
import {
  DEFAULT_LANGUAGE_CODE,
  isSupportedLanguageCode,
} from '~/constants/languages'
import type { SupportedLanguageCode } from '~/constants/languages'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const cardNames = body.cardNames as string[]
  const bodyLanguage = (body.language as string | undefined)?.toLowerCase()
  const requestedLanguage: SupportedLanguageCode
    = isSupportedLanguageCode(bodyLanguage)
      ? bodyLanguage
      : DEFAULT_LANGUAGE_CODE

  const cards: Scry.Card[] = []
  const localizedCards: Scry.Card[] = []
  const errorCardNames: string[] = []

  Scry.setAgent('Scryfall Image Batch Downloader', '1.0.0')

  for (const name of cardNames) {
    console.log(`Fetching: ${name}`)

    try {
      const card = await Scry.Cards.byName(name)
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
      const localizedCard = await Scry.Cards.bySet(
        card.set,
        parseInt(card.collector_number),
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
