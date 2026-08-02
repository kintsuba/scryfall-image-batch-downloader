import { describe, expect, it } from 'vitest'
import {
  cardByNameQuerySchema,
  cardByNamesBodySchema,
  cardPrintsQuerySchema,
  downloadTtsImagesBodySchema,
  downloadZipBodySchema,
  MAX_CARD_NAMES,
  MAX_DOWNLOAD_FILES,
  MAX_TTS_IMAGES,
} from './validation'

describe('cardByNameQuerySchema', () => {
  it('accepts Scryfall card names with Unicode and punctuation', () => {
    expect(cardByNameQuerySchema.parse({
      name: '  Who // What // When // Where // Why?  ',
    })).toEqual({
      name: 'Who // What // When // Where // Why?',
      lang: 'en',
    })
  })

  it('normalizes a supported language code', () => {
    expect(cardByNameQuerySchema.parse({ name: '島', lang: 'PT' })).toEqual({
      name: '島',
      lang: 'pt',
    })
  })

  it.each([
    { name: '' },
    { name: ['Black Lotus'] },
    { name: 'Black Lotus', lang: 'xx' },
    { name: 'Black Lotus', lang: ['en'] },
  ])('rejects malformed input: %o', (input) => {
    expect(cardByNameQuerySchema.safeParse(input).success).toBe(false)
  })
})

describe('cardByNamesBodySchema', () => {
  it('normalizes names and applies the default language', () => {
    expect(cardByNamesBodySchema.parse({
      cardNames: [' Black Lotus ', 'Fire // Ice'],
    })).toEqual({
      cardNames: ['Black Lotus', 'Fire // Ice'],
      language: 'en',
    })
  })

  it.each([
    { cardNames: 'Black Lotus' },
    { cardNames: [] },
    { cardNames: [''] },
    { cardNames: ['Black Lotus'], extra: true },
    { cardNames: Array.from({ length: MAX_CARD_NAMES + 1 }, () => 'Island') },
  ])('rejects malformed or excessive input', (input) => {
    expect(cardByNamesBodySchema.safeParse(input).success).toBe(false)
  })
})

describe('cardPrintsQuerySchema', () => {
  const oracleId = '0000579f-7b35-4ed3-b44c-db2a538066fe'

  it('accepts a Scryfall Oracle ID and supported language', () => {
    expect(cardPrintsQuerySchema.parse({ id: oracleId.toUpperCase(), lang: 'FR' })).toEqual({
      id: oracleId,
      lang: 'fr',
    })
  })

  it.each([
    { id: 'not-a-uuid', lang: 'en' },
    { id: `${oracleId} lang:ja`, lang: 'en' },
    { id: oracleId, lang: 'zxx' },
  ])('rejects values that cannot be Scryfall search filters', (input) => {
    expect(cardPrintsQuerySchema.safeParse(input).success).toBe(false)
  })
})

describe('downloadZipBodySchema', () => {
  it('normalizes an optional file name', () => {
    expect(downloadZipBodySchema.parse({
      files: [{ url: 'https://cards.scryfall.io/large/front/card.jpg', fileName: '  Card  ' }],
    })).toEqual({
      files: [{ url: 'https://cards.scryfall.io/large/front/card.jpg', fileName: 'Card' }],
    })
  })

  it.each([
    { files: [] },
    { files: [null] },
    {
      files: Array.from({ length: MAX_DOWNLOAD_FILES + 1 }, () => ({
        url: 'https://cards.scryfall.io/large/front/card.jpg',
      })),
    },
  ])('rejects malformed or excessive file lists', (input) => {
    expect(downloadZipBodySchema.safeParse(input).success).toBe(false)
  })

  it.each([
    'http://cards.scryfall.io/large/front/card.jpg',
    'https://example.test/card.png',
    'https://cards.scryfall.io.evil.test/card.png',
    'https://cards.scryfall.io:8443/card.png',
    'https://user:password@cards.scryfall.io/card.png',
  ])('rejects unsafe outbound image URL %s', (url) => {
    expect(downloadZipBodySchema.safeParse({
      files: [{ url }],
    }).success).toBe(false)
  })
})

describe('downloadTtsImagesBodySchema', () => {
  it('accepts the current image descriptor format', () => {
    expect(downloadTtsImagesBodySchema.parse({
      images: [{ id: ' card-1 ', imageUri: 'https://example.test/card.png' }],
      hiddenImage: 'data:image/png;base64,aGVsbG8=',
    })).toEqual({
      images: [{ id: 'card-1', imageUri: 'https://example.test/card.png' }],
      hiddenImage: 'data:image/png;base64,aGVsbG8=',
    })
  })

  it('keeps accepting the legacy URL format', () => {
    expect(downloadTtsImagesBodySchema.parse({
      urls: ['https://example.test/card.png'],
    })).toEqual({
      urls: ['https://example.test/card.png'],
    })
  })

  it.each([
    {},
    { images: [], urls: ['https://example.test/card.png'] },
    { images: [{ imageUri: '' }] },
    { urls: ['file:///etc/passwd'] },
    { images: [{ imageUri: 'https://example.test/card.png' }], hiddenImage: 'data:text/plain;base64,aGVsbG8=' },
    {
      urls: Array.from({ length: MAX_TTS_IMAGES + 1 }, () => 'https://example.test/card.png'),
    },
  ])('rejects malformed, ambiguous, or excessive image input', (input) => {
    expect(downloadTtsImagesBodySchema.safeParse(input).success).toBe(false)
  })
})
