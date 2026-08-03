import type { LookupAddress, LookupOptions } from 'node:dns'
import type { LookupFunction } from 'node:net'
import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'
import {
  DownloadSizeLimitError,
  MAX_ZIP_IMAGE_BYTES,
} from './downloadResources'
import {
  createSafeDnsLookup,
  downloadScryfallImage,
  isPublicIpAddress,
  SCRYFALL_IMAGE_DOWNLOAD_TIMEOUT,
} from './scryfallImageDownload'
import { parseScryfallImageUrl } from './scryfallImageUrl'

const runLookup = (
  lookup: LookupFunction,
  options: LookupOptions = {},
) => new Promise<{ address: string | LookupAddress[], family?: number }>((resolve, reject) => {
  lookup('cards.scryfall.io', options, (error, address, family) => {
    if (error) {
      reject(error)
      return
    }

    resolve({ address, family })
  })
})

describe('parseScryfallImageUrl', () => {
  it('accepts the exact Scryfall image host over HTTPS', () => {
    const input = 'https://cards.scryfall.io/large/front/card.jpg?123'
    expect(parseScryfallImageUrl(input).href).toBe(input)
  })

  it.each([
    'http://cards.scryfall.io/card.jpg',
    'https://api.scryfall.com/card.jpg',
    'https://cards.scryfall.io.evil.test/card.jpg',
    'https://user@cards.scryfall.io/card.jpg',
    'https://cards.scryfall.io:8443/card.jpg',
  ])('rejects URL outside the image allowlist: %s', (url) => {
    expect(() => parseScryfallImageUrl(url)).toThrow()
  })
})

describe('isPublicIpAddress', () => {
  it.each([
    '93.184.216.34',
    '2606:4700:4700::1111',
  ])('accepts public unicast address %s', (address) => {
    expect(isPublicIpAddress(address)).toBe(true)
  })

  it.each([
    '127.0.0.1',
    '10.0.0.1',
    '169.254.169.254',
    '192.168.1.1',
    '::1',
    'fe80::1',
    'fc00::1',
    '::ffff:127.0.0.1',
    'not-an-ip',
  ])('rejects non-public address %s', (address) => {
    expect(isPublicIpAddress(address)).toBe(false)
  })
})

describe('createSafeDnsLookup', () => {
  it('returns a verified public address to the HTTP client', async () => {
    const resolver = vi.fn(async () => [
      { address: '93.184.216.34', family: 4 },
    ])
    const lookup = createSafeDnsLookup(resolver)

    await expect(runLookup(lookup)).resolves.toEqual({
      address: '93.184.216.34',
      family: 4,
    })
    expect(resolver).toHaveBeenCalledWith('cards.scryfall.io', undefined)
  })

  it('rejects a private DNS result', async () => {
    const lookup = createSafeDnsLookup(async () => [
      { address: '10.0.0.1', family: 4 },
    ])

    await expect(runLookup(lookup)).rejects.toMatchObject({ code: 'EACCES' })
  })

  it('rejects the entire result when any resolved address is private', async () => {
    const lookup = createSafeDnsLookup(async () => [
      { address: '93.184.216.34', family: 4 },
      { address: '::ffff:127.0.0.1', family: 6 },
    ])

    await expect(runLookup(lookup, { all: true })).rejects.toMatchObject({ code: 'EACCES' })
  })
})

describe('downloadScryfallImage', () => {
  it('uses bounded requests without redirects or retries', async () => {
    const image = Buffer.from('image')
    const request = vi.fn(async () => ({
      statusCode: 200,
      rawBody: image,
    }))

    await expect(downloadScryfallImage(
      'https://cards.scryfall.io/large/front/card.jpg',
      { request },
    )).resolves.toBe(image)

    expect(request).toHaveBeenCalledWith(
      new URL('https://cards.scryfall.io/large/front/card.jpg'),
      expect.objectContaining({
        followRedirect: false,
        http2: false,
        responseType: 'buffer',
        retry: { limit: 0 },
        timeout: SCRYFALL_IMAGE_DOWNLOAD_TIMEOUT,
      }),
      MAX_ZIP_IMAGE_BYTES,
    )
  })

  it('rejects redirect responses', async () => {
    const request = vi.fn(async () => ({
      statusCode: 302,
      rawBody: Buffer.alloc(0),
    }))

    await expect(downloadScryfallImage(
      'https://cards.scryfall.io/large/front/card.jpg',
      { request },
    )).rejects.toThrow('Redirect responses are not allowed')
  })

  it('rejects images above the configured byte limit', async () => {
    const request = vi.fn(async () => ({
      statusCode: 200,
      rawBody: Buffer.alloc(11),
    }))

    await expect(downloadScryfallImage(
      'https://cards.scryfall.io/large/front/card.jpg',
      { maxBytes: 10, request },
    )).rejects.toBeInstanceOf(DownloadSizeLimitError)
  })

  it('revalidates the URL before making a request', async () => {
    const request = vi.fn()

    await expect(downloadScryfallImage(
      'https://example.test/card.jpg',
      { request },
    )).rejects.toThrow('host is not allowed')
    expect(request).not.toHaveBeenCalled()
  })
})
