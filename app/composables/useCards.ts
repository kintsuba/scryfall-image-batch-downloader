import type { Ref } from 'vue'
import type * as Scry from 'scryfall-sdk'

export const addCard = (cards: Ref<Scry.Card[]>) => (card: Scry.Card) => {
  cards.value.push(card)
}

export const replaceCardByOracleId = (
  cards: Scry.Card[],
  selectedCard: Scry.Card | undefined,
): Scry.Card[] | undefined => {
  if (!selectedCard?.oracle_id) return undefined

  const index = cards.findIndex(card => card.oracle_id === selectedCard.oracle_id)
  if (index === -1) return undefined

  return cards.map((card, cardIndex) => cardIndex === index ? selectedCard : card)
}

export const updateCardsWithSelectedCard = (cards: Ref<Scry.Card[]>, selectedCard: Ref<Scry.Card | undefined>) => () => {
  const updatedCards = replaceCardByOracleId(cards.value, selectedCard.value)
  if (!updatedCards) return false

  cards.value = updatedCards
  return true
}
export const updateCards = (cards: Ref<Scry.Card[]>) => (value: Scry.Card[]) => {
  cards.value = [...value]
}
export const updateCardNames = (cardNames: Ref<string[]>) => (value: string[]) => {
  cardNames.value = [...value]
}
export const selectCard
  = (selectedCard: Ref<Scry.Card | undefined>) =>
    (value: Readonly<Scry.Card> | undefined) => {
      if (value !== undefined) {
        selectedCard.value = { ...value } as Scry.Card
      }
      else {
        selectedCard.value = undefined
      }
    }

export const useCards = () => {
  const cards = useState<Scry.Card[]>('cards', () => [])
  const cardNames = useState<string[]>('cardNames', () => [])
  const selectedCard = useState<Scry.Card | undefined>('selectedCard', () => undefined)

  return {
    cards: readonly(cards),
    addCard: addCard(cards),
    updateCardsWithSelectedCard: updateCardsWithSelectedCard(cards, selectedCard),
    updateCards: updateCards(cards),
    cardNames: readonly(cardNames),
    updateCardNames: updateCardNames(cardNames),
    selectedCard: readonly(selectedCard),
    selectCard: selectCard(selectedCard),
  }
}
