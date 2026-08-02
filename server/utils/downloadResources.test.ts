import { Buffer } from 'node:buffer'
import JSZip from 'jszip'
import { describe, expect, it, vi } from 'vitest'
import {
  addToSizeBudget,
  createTimedZipStream,
  DownloadSizeLimitError,
  makeUniqueFileNames,
  mapWithConcurrency,
  readLimitedBufferResponse,
} from './downloadResources'
import type { ProgressRequest } from './downloadResources'

const createProgressRequest = <Response extends { rawBody: Buffer }>(
  response: Response,
  progressEvents: Array<{ transferred: number, total?: number }> = [],
) => {
  const request = Promise.resolve(response) as ProgressRequest<Response>
  request.on = (event, listener) => {
    if (event !== 'downloadProgress') return request
    for (const progress of progressEvents) listener(progress)
    return request
  }
  return request
}

describe('readLimitedBufferResponse', () => {
  it('returns a response within the byte limit', async () => {
    const response = { rawBody: Buffer.alloc(10) }

    await expect(readLimitedBufferResponse(
      () => createProgressRequest(response, [{ transferred: 10, total: 10 }]),
      10,
    )).resolves.toBe(response)
  })

  it('aborts when Content-Length exceeds the byte limit', async () => {
    let signal: AbortSignal | undefined

    await expect(readLimitedBufferResponse(
      (requestSignal) => {
        signal = requestSignal
        return createProgressRequest(
          { rawBody: Buffer.alloc(0) },
          [{ transferred: 0, total: 11 }],
        )
      },
      10,
    )).rejects.toBeInstanceOf(DownloadSizeLimitError)
    expect(signal?.aborted).toBe(true)
  })

  it('rejects a response whose actual body exceeds the byte limit', async () => {
    await expect(readLimitedBufferResponse(
      () => createProgressRequest({ rawBody: Buffer.alloc(11) }),
      10,
    )).rejects.toBeInstanceOf(DownloadSizeLimitError)
  })
})

describe('addToSizeBudget', () => {
  it('tracks bytes within the total budget', () => {
    expect(addToSizeBudget(4, 6, 10)).toBe(10)
  })

  it('rejects bytes above the total budget', () => {
    expect(() => addToSizeBudget(5, 6, 10)).toThrow(DownloadSizeLimitError)
  })
})

describe('mapWithConcurrency', () => {
  it('preserves result order while limiting active tasks', async () => {
    let activeTasks = 0
    let maxActiveTasks = 0

    const results = await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (item) => {
      activeTasks += 1
      maxActiveTasks = Math.max(maxActiveTasks, activeTasks)
      await new Promise(resolve => setTimeout(resolve, 1))
      activeTasks -= 1
      return item * 2
    })

    expect(results).toEqual([2, 4, 6, 8, 10, 12])
    expect(maxActiveTasks).toBe(2)
  })

  it('rejects an invalid concurrency value', async () => {
    await expect(mapWithConcurrency([], 0, vi.fn())).rejects.toThrow(
      'concurrency must be a positive integer',
    )
  })
})

describe('makeUniqueFileNames', () => {
  it('adds deterministic suffixes without overwriting existing names', () => {
    expect(makeUniqueFileNames([
      'card.png',
      'card-2.png',
      'card.png',
      'CARD.PNG',
    ])).toEqual([
      'card.png',
      'card-2.png',
      'card-3.png',
      'CARD-4.PNG',
    ])
  })
})

describe('createTimedZipStream', () => {
  it('streams a valid ZIP without creating the final archive buffer first', async () => {
    const zip = new JSZip()
    zip.file('card.png', Buffer.from('image'))

    const chunks: Buffer[] = []
    const stream = createTimedZipStream(zip, 1000)
    await new Promise<void>((resolve, reject) => {
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)))
      stream.on('end', resolve)
      stream.on('error', reject)
    })

    const archive = await JSZip.loadAsync(Buffer.concat(chunks))
    await expect(archive.file('card.png')?.async('string')).resolves.toBe('image')
  })
})
