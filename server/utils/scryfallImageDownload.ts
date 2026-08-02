import type { LookupAddress, LookupOptions } from 'node:dns'
import { lookup } from 'node:dns/promises'
import type { LookupFunction } from 'node:net'
import got from 'got'
import ipaddr from 'ipaddr.js'
import {
  DownloadSizeLimitError,
  MAX_ZIP_IMAGE_BYTES,
  readLimitedBufferResponse,
} from './downloadResources'
import { parseScryfallImageUrl } from './scryfallImageUrl'

export const SCRYFALL_IMAGE_DOWNLOAD_TIMEOUT = {
  lookup: 3000,
  connect: 5000,
  secureConnect: 5000,
  response: 10000,
  request: 20000,
} as const

type ImageResponse = {
  statusCode: number
  rawBody: Uint8Array
}

type ImageRequestOptions = {
  dnsLookup: LookupFunction
  followRedirect: false
  headers: { accept: string }
  http2: false
  responseType: 'buffer'
  retry: { limit: number }
  timeout: typeof SCRYFALL_IMAGE_DOWNLOAD_TIMEOUT
}

const resolveHostname = (
  hostname: string,
  family: LookupOptions['family'],
): Promise<LookupAddress[]> => lookup(hostname, {
  all: true,
  family,
  order: 'verbatim',
})

export type ResolveHostname = typeof resolveHostname

const fetchImage = async (
  url: URL,
  options: ImageRequestOptions,
  maxBytes: number,
): Promise<ImageResponse> => {
  return await readLimitedBufferResponse(
    signal => got.get(url, {
      ...options,
      responseType: 'buffer',
      signal,
    }),
    maxBytes,
  )
}

export type FetchImage = typeof fetchImage

export const isPublicIpAddress = (address: string) => {
  if (!ipaddr.isValid(address)) return false

  let parsedAddress = ipaddr.parse(address)
  if (parsedAddress.kind() === 'ipv6' && parsedAddress.isIPv4MappedAddress()) {
    parsedAddress = parsedAddress.toIPv4Address()
  }

  return parsedAddress.range() === 'unicast'
}

const createLookupError = (message: string) => Object.assign(new Error(message), {
  code: 'EACCES',
}) as NodeJS.ErrnoException

export const createSafeDnsLookup = (
  resolver: ResolveHostname = resolveHostname,
): LookupFunction => {
  return (hostname, options, callback) => {
    resolver(hostname, options.family)
      .then((addresses) => {
        if (addresses.length === 0) {
          callback(createLookupError(`No address found for ${hostname}`), [])
          return
        }

        const blockedAddress = addresses.find(({ address }) => !isPublicIpAddress(address))
        if (blockedAddress) {
          callback(createLookupError(`Blocked non-public address for ${hostname}`), [])
          return
        }

        if (options.all) {
          callback(null, addresses)
          return
        }

        const firstAddress = addresses[0]
        if (!firstAddress) {
          callback(createLookupError(`No address found for ${hostname}`), [])
          return
        }

        callback(null, firstAddress.address, firstAddress.family)
      })
      .catch((error: NodeJS.ErrnoException) => {
        callback(error, [])
      })
  }
}

export const downloadScryfallImage = async (
  input: string,
  options: {
    maxBytes?: number
    request?: FetchImage
  } = {},
) => {
  const {
    maxBytes = MAX_ZIP_IMAGE_BYTES,
    request = fetchImage,
  } = options
  const url = parseScryfallImageUrl(input)
  const response = await request(url, {
    dnsLookup: createSafeDnsLookup(),
    followRedirect: false,
    headers: {
      accept: 'image/*',
    },
    http2: false,
    responseType: 'buffer',
    retry: {
      limit: 0,
    },
    timeout: SCRYFALL_IMAGE_DOWNLOAD_TIMEOUT,
  }, maxBytes)

  if (response.statusCode >= 300 && response.statusCode < 400) {
    throw new Error('Redirect responses are not allowed for Scryfall images')
  }

  if (response.rawBody.length > maxBytes) {
    throw new DownloadSizeLimitError(maxBytes)
  }

  return response.rawBody
}
