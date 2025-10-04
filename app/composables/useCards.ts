import type { Ref } from 'vue'
import type * as Scry from 'scryfall-sdk'

export const addCard = (cards: Ref<Scry.Card[]>) => (card: Scry.Card) => {
  cards.value.push(card)
}
export const updateCard = (cards: Ref<Scry.Card[]>) => (card: Scry.Card) => {}
export const updateCardsWithSelectedCard = (cards: Ref<Scry.Card[]>, selectedCard: Ref<Scry.Card | undefined>) => () => {
  const index = cards.value.findIndex((c) => {
    return c.oracle_id === selectedCard.value?.oracle_id
  })

  if (selectedCard.value) cards.value.splice(index, 1, selectedCard.value)
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
    updateCard: updateCard(cards),
    updateCardsWithSelectedCard: updateCardsWithSelectedCard(cards, selectedCard),
    updateCards: updateCards(cards),
    cardNames: readonly(cardNames),
    updateCardNames: updateCardNames(cardNames),
    selectedCard: readonly(selectedCard),
    selectCard: selectCard(selectedCard),
  }
}
