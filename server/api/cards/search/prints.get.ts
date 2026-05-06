import { scryfallSearch } from '../../../utils/scryfall'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id as string
  const lang = query.lang as string

  const cards = await scryfallSearch(`oracleid:${id} lang:${lang}`, {
    order: 'released',
    unique: 'prints',
  })
  return cards
})
