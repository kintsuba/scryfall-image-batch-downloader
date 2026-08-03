import type { Card } from 'scryfall-sdk'
import * as Scry from 'scryfall-sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { scryfallBySet } from './scryfall'

vi.mock('scryfall-sdk', () => ({
  Cards: {
    bySet: vi.fn(),
  },
  setAgent: vi.fn(),
}))

describe('scryfallBySet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete (globalThis as typeof globalThis & {
      __sibdScryfallRateLimit?: unknown
    }).__sibdScryfallRateLimit
  })

  it.each(['123a', '123'])(
    'passes collector number %s to the Scryfall SDK unchanged',
    async (collectorNumber) => {
      vi.mocked(Scry.Cards.bySet).mockResolvedValue({} as Card)

      await scryfallBySet('set', collectorNumber, 'ja')

      expect(Scry.Cards.bySet).toHaveBeenCalledWith(
        'set',
        collectorNumber,
        'ja',
      )
    },
  )
})
