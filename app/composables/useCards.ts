import type { Ref } from 'vue'
import type * as Scry from 'scryfall-sdk'

export const useCards = () => {
  const cards: Ref<Scry.Card[]> = useState('cards', () => [])
  const cardNames: Ref<string[]> = useState('cardNames', () => [])
  const selectedCard: Ref<Scry.Card | undefined> = useState(
    'selectedCard',
    () => undefined,
  )

  const addCard = (cards: Ref<Scry.Card[]>) => (card: Scry.Card) => {
    cards.value.push(card)
  }
  const updateCard = (cards: Ref<Scry.Card[]>) => (card: Scry.Card) => {}
  const updateCardsWithSelectedCard = (cards: Ref<Scry.Card[]>) => () => {
    const index = cards.value.findIndex((c) => {
      return c.oracle_id === selectedCard.value?.oracle_id
    })

    if (selectedCard.value) cards.value.splice(index, 1, selectedCard.value)
  }
  const updateCards = (cards: Ref<Scry.Card[]>) => (value: Scry.Card[]) => {
    cards.value = [...value]
  }
  const updateCardNames = (cardNames: Ref<string[]>) => (value: string[]) => {
    cardNames.value = [...value]
  }
  const selectCard
    = (selectedCard: Ref<Scry.Card | undefined>) =>
      (value: Readonly<Scry.Card> | undefined) => {
        if (value !== undefined) {
          selectedCard.value = { ...value } as Scry.Card
        }
        else {
          selectedCard.value = undefined
        }
      }

  return {
    cards: readonly(cards),
    addCard: addCard(cards),
    updateCard: updateCard(cards),
    updateCardsWithSelectedCard: updateCardsWithSelectedCard(cards),
    updateCards: updateCards(cards),
    cardNames: readonly(cardNames),
    updateCardNames: updateCardNames(cardNames),
    selectedCard: readonly(selectedCard),
    selectCard: selectCard(selectedCard),
  }
}
