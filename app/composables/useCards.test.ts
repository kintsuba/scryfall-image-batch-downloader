import { describe, expect, it } from 'vitest'
import type * as Scry from 'scryfall-sdk'
import { replaceCardByOracleId } from './useCards'

const card = (id: string, oracleId?: string): Scry.Card => ({
  id,
  oracle_id: oracleId,
} as Scry.Card)

describe('replaceCardByOracleId', () => {
  it('does not replace a card when no card is selected', () => {
    const cards = [card('first', 'oracle-1'), card('last', 'oracle-2')]

    expect(replaceCardByOracleId(cards, undefined)).toBeUndefined()
    expect(cards.map(({ id }) => id)).toEqual(['first', 'last'])
  })

  it('does not replace a card when the selected card has no oracle_id', () => {
    const cards = [card('first', 'oracle-1'), card('last', 'oracle-2')]

    expect(replaceCardByOracleId(cards, card('selected'))).toBeUndefined()
    expect(cards.map(({ id }) => id)).toEqual(['first', 'last'])
  })

  it('does not replace a card when oracle_id does not match', () => {
    const cards = [card('first', 'oracle-1'), card('last', 'oracle-2')]

    expect(replaceCardByOracleId(cards, card('selected', 'oracle-3'))).toBeUndefined()
    expect(cards.map(({ id }) => id)).toEqual(['first', 'last'])
  })

  it('replaces only the card with the matching oracle_id', () => {
    const first = card('first', 'oracle-1')
    const last = card('last', 'oracle-2')
    const selected = card('selected', 'oracle-1')

    const result = replaceCardByOracleId([first, last], selected)

    expect(result).toEqual([selected, last])
    expect(result?.[1]).toBe(last)
  })
})
