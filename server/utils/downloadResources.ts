import type { Readable } from 'node:stream'
import type JSZip from 'jszip'

const MEBIBYTE = 1024 * 1024

export const MAX_CONCURRENT_IMAGE_DOWNLOADS = 4
export const MAX_ZIP_IMAGE_BYTES = 15 * MEBIBYTE
export const MAX_ZIP_SOURCE_BYTES = 200 * MEBIBYTE
export const MAX_TTS_MERGED_IMAGE_BYTES = 100 * MEBIBYTE
export const MAX_TTS_MERGED_TOTAL_BYTES = 300 * MEBIBYTE
export const ZIP_STREAM_TIMEOUT_MS = 120_000

type BufferResponse = {
  rawBody: Uint8Array
}

type DownloadProgress = {
  transferred: number
  total?: number
}

/* eslint-disable no-unused-vars -- callback names document these utility contracts */
type DownloadProgressListener = (progress: DownloadProgress) => void
type DownloadProgressHandler<Response extends BufferResponse> = (
  event: 'downloadProgress',
  listener: DownloadProgressListener,
) => unknown
type ProgressRequestFactory<Response extends BufferResponse> = (
  signal: AbortSignal,
) => ProgressRequest<Response>
type AsyncMapper<Item, Result> = (
  item: Item,
  index: number,
) => Promise<Result>
/* eslint-enable no-unused-vars */

export type ProgressRequest<Response extends BufferResponse> = Promise<Response> & {
  on: DownloadProgressHandler<Response>
}

export class DownloadSizeLimitError extends Error {
  constructor(limitBytes: number) {
    super(`Download exceeds the ${limitBytes} byte limit`)
    this.name = 'DownloadSizeLimitError'
  }
}

export const readLimitedBufferResponse = async <Response extends BufferResponse>(
  createRequest: ProgressRequestFactory<Response>,
  maxBytes: number,
) => {
  const controller = new AbortController()
  let limitExceeded = false
  const request = createRequest(controller.signal)

  request.on('downloadProgress', ({ transferred, total }) => {
    if (transferred > maxBytes || (total !== undefined && total > maxBytes)) {
      limitExceeded = true
      controller.abort()
    }
  })

  try {
    const response = await request
    if (limitExceeded || response.rawBody.length > maxBytes) {
      throw new DownloadSizeLimitError(maxBytes)
    }
    return response
  }
  catch (error) {
    if (limitExceeded) {
      throw new DownloadSizeLimitError(maxBytes)
    }
    throw error
  }
}

export const addToSizeBudget = (
  currentBytes: number,
  addedBytes: number,
  maxBytes: number,
) => {
  const nextBytes = currentBytes + addedBytes
  if (nextBytes > maxBytes) {
    throw new DownloadSizeLimitError(maxBytes)
  }
  return nextBytes
}

export const mapWithConcurrency = async <Item, Result>(
  items: readonly Item[],
  concurrency: number,
  mapper: AsyncMapper<Item, Result>,
) => {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error('concurrency must be a positive integer')
  }

  const results = new Array<Result>(items.length)
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      const item = items[index] as Item
      results[index] = await mapper(item, index)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  )
  await Promise.all(workers)

  return results
}

const splitExtension = (fileName: string) => {
  const extensionIndex = fileName.lastIndexOf('.')
  if (extensionIndex <= 0) return { base: fileName, extension: '' }

  return {
    base: fileName.slice(0, extensionIndex),
    extension: fileName.slice(extensionIndex),
  }
}

export const makeUniqueFileNames = (fileNames: readonly string[]) => {
  const usedNames = new Set<string>()

  return fileNames.map((fileName) => {
    const { base, extension } = splitExtension(fileName)
    let candidate = fileName
    let suffix = 2

    while (usedNames.has(candidate.toLowerCase())) {
      candidate = `${base}-${suffix}${extension}`
      suffix += 1
    }

    usedNames.add(candidate.toLowerCase())
    return candidate
  })
}

export const createTimedZipStream = (
  zip: JSZip,
  timeoutMs = ZIP_STREAM_TIMEOUT_MS,
) => {
  const stream = zip.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true,
  }) as Readable
  const timer = setTimeout(() => {
    stream.destroy(new Error('ZIP generation timed out'))
  }, timeoutMs)
  const clearTimer = () => clearTimeout(timer)

  stream.once('end', clearTimer)
  stream.once('error', clearTimer)
  stream.once('close', clearTimer)

  return stream
}
