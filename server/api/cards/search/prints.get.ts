import { scryfallSearch } from '../../../utils/scryfall'
import {
  cardPrintsQuerySchema,
  validateWith,
} from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const { id, lang } = await getValidatedQuery(
    event,
    validateWith(cardPrintsQuerySchema),
  )

  const cards = await scryfallSearch(`oracleid:${id} lang:${lang}`, {
    order: 'released',
    unique: 'prints',
  })
  return cards
})
