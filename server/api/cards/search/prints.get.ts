import * as Scry from 'scryfall-sdk'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id as string
  const lang = query.lang as string

  Scry.setAgent('Scryfall Image Batch Downloader', '1.0.0')

  const cards = await Scry.Cards.search(`oracleid:${id} lang:${lang}`, {
    order: 'released',
    unique: 'prints',
  })
    .cancelAfterPage()
    .waitForAll()
  return cards
})
