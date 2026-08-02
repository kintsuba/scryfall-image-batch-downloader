import got from 'got'
import { sendStream } from 'h3'
import JSZip from 'jszip'
import {
  addToSizeBudget,
  createTimedZipStream,
  DownloadSizeLimitError,
  MAX_TTS_MERGED_IMAGE_BYTES,
  MAX_TTS_MERGED_TOTAL_BYTES,
  readLimitedBufferResponse,
} from '../utils/downloadResources'
import {
  downloadTtsImagesBodySchema,
  validateWith,
} from '../utils/validation'

const MERGE_ENDPOINT = 'https://tts-deck-server-production.up.railway.app/merge'
const STACK_SIZE = 69
const ZIP_CONTENT_TYPE = 'application/zip'
const ZIP_FILE_NAME = 'tts-images.zip'
const SINGLE_IMAGE_FILE_NAME = 'deck.png'

type MergePayloadItem = { id: string, imageUri: string }
type MergeRequestPayload = {
  cards: MergePayloadItem[]
  hiddenImage?: string
}

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items]

  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    validateWith(downloadTtsImagesBodySchema),
  )
  const images = body.images ?? body.urls?.map((url, index) => ({
    id: `image-${index}`,
    imageUri: url,
  })) ?? []
  const { hiddenImage } = body

  if (hiddenImage) {
    console.info('[downloadTtsImages] hiddenImage payload (base64):', hiddenImage)
  }

  const payload = images.map((entry, index): MergePayloadItem => ({
    id: entry.id ?? `image-${index}`,
    imageUri: entry.imageUri,
  }))

  const chunks = chunkArray(payload, STACK_SIZE)

  const mergedChunks: Array<{ buffer: Uint8Array, contentType: string, fileName: string }> = []
  let totalMergedBytes = 0

  for (const [chunkIndex, chunk] of chunks.entries()) {
    try {
      const requestPayload: MergeRequestPayload = { cards: chunk }
      if (hiddenImage) {
        requestPayload.hiddenImage = hiddenImage
      }
      const response = await readLimitedBufferResponse(
        signal => got.post(MERGE_ENDPOINT, {
          json: requestPayload,
          responseType: 'buffer',
          retry: { limit: 0 },
          signal,
          timeout: {
            connect: 5000,
            response: 60000,
            request: 60000,
          },
        }),
        MAX_TTS_MERGED_IMAGE_BYTES,
      )
      const responseContentType = response.headers['content-type']
      const contentType = Array.isArray(responseContentType)
        ? responseContentType[0] ?? 'image/png'
        : responseContentType ?? 'image/png'
      totalMergedBytes = addToSizeBudget(
        totalMergedBytes,
        response.rawBody.length,
        MAX_TTS_MERGED_TOTAL_BYTES,
      )

      mergedChunks.push({
        buffer: response.rawBody,
        contentType,
        fileName: `deck${chunkIndex}.png`,
      })
    }
    catch (error) {
      if (error instanceof DownloadSizeLimitError) {
        throw createError({
          statusCode: 413,
          statusMessage: 'Merged images exceed the size limit',
          cause: error,
        })
      }
      throw createError({ statusCode: 502, statusMessage: 'Failed to merge images', cause: error })
    }
  }

  if (mergedChunks.length === 1) {
    const singleChunk = mergedChunks[0]
    if (!singleChunk) {
      throw createError({ statusCode: 500, statusMessage: 'Unexpected merge response' })
    }

    setHeader(event, 'Content-Type', singleChunk.contentType)
    setHeader(event, 'Content-Disposition', `attachment; filename="${SINGLE_IMAGE_FILE_NAME}"`)
    return singleChunk.buffer
  }

  const zip = new JSZip()
  for (const { fileName, buffer } of mergedChunks) {
    zip.file(fileName, buffer)
  }

  setHeader(event, 'Content-Type', ZIP_CONTENT_TYPE)
  setHeader(event, 'Content-Disposition', `attachment; filename="${ZIP_FILE_NAME}"`)

  return sendStream(event, createTimedZipStream(zip))
})
