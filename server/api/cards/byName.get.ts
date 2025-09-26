import * as Scry from 'scryfall-sdk'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const name = query.name as string

  Scry.setAgent('Scryfall Image Batch Downloader', '1.0.0')
  const card = await Scry.Cards.byName(decodeURI(name), true)

  try {
    const jaCard = await Scry.Cards.bySet(
      card.set,
      parseInt(card.collector_number),
      'ja',
    )
    return jaCard
  }
  catch (e) {
    return card
  }
})
