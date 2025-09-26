import * as Scry from 'scryfall-sdk'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const cardNames = body.cardNames as string[]

  const cards: Scry.Card[] = []
  const jaCards: Scry.Card[] = []
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
    catch (e) {
      errorCardNames.push(name)
      console.error(`Failed: ${name}`)
    }
  }

  for (const card of cards) {
    console.log(`Search Japnese Card with: ${card.name}`)

    let jaCard: Scry.Card

    try {
      jaCard = await Scry.Cards.bySet(
        card.set,
        parseInt(card.collector_number),
        'ja',
      )

      if (!jaCard.image_uris) throw new Error()

      jaCards.push(jaCard)
      console.log(`Found: ${jaCard.name}`)
    }
    catch (e) {
      jaCards.push(card)
      console.log(`Not Found: ${card.name}`)
    }
  }

  return { cards: jaCards, errorCardNames: errorCardNames }
})
