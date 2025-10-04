import got from 'got'
import JSZip from 'jszip'

const MERGE_ENDPOINT = 'https://tts-deck-server-production.up.railway.app/merge'
const STACK_SIZE = 69
const ZIP_CONTENT_TYPE = 'application/zip'
const ZIP_FILE_NAME = 'tts-images.zip'
const SINGLE_IMAGE_FILE_NAME = 'deck.png'

type MergePayloadItem = { id: string, imageUri: string }

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items]

  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}

type IncomingImage = { id?: unknown, imageUri?: unknown }
type DownloadImageRequest = {
  images?: Array<IncomingImage | null | undefined>
  urls?: Array<unknown>
}

export default defineEventHandler(async (event) => {
  const body = await readBody<DownloadImageRequest | undefined>(event) ?? {}
  let images: Array<{ id?: string, imageUri: string }> = []

  if (Array.isArray(body.images)) {
    images = body.images
      .filter((entry): entry is IncomingImage => typeof entry === 'object' && entry !== null)
      .filter(entry => typeof entry.imageUri === 'string' && entry.imageUri.length > 0)
      .map(entry => ({
        id: typeof entry.id === 'string' ? entry.id : undefined,
        imageUri: entry.imageUri as string,
      }))
  }

  if (!images.length && Array.isArray(body.urls)) {
    images = body.urls
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
      .map((url, index) => ({ id: `image-${index}`, imageUri: url }))
  }

  if (!images.length) {
    throw createError({ statusCode: 400, statusMessage: 'No images provided' })
  }

  const payload = images.map((entry: { id?: string, imageUri: string }, index: number): MergePayloadItem => {
    const id = typeof entry.id === 'string' ? entry.id.trim() : ''
    const imageUri = entry.imageUri.trim()

    return {
      id: id.length ? id : `image-${index}`,
      imageUri,
    }
  })

  const chunks = chunkArray(payload, STACK_SIZE)

  const mergedChunks: Array<{ buffer: Buffer, contentType: string, fileName: string }> = []

  for (const [chunkIndex, chunk] of chunks.entries()) {
    try {
      const response = await got.post(MERGE_ENDPOINT, {
        json: chunk,
        responseType: 'buffer',
        timeout: {
          request: 600000,
        },
      })
      const contentType = response.headers['content-type'] ?? 'image/png'

      mergedChunks.push({
        buffer: response.rawBody,
        contentType,
        fileName: `deck${chunkIndex}.png`,
      })
    }
    catch (error) {
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

  const archive = await zip.generateAsync({ type: 'nodebuffer' })
  setHeader(event, 'Content-Type', ZIP_CONTENT_TYPE)
  setHeader(event, 'Content-Disposition', `attachment; filename="${ZIP_FILE_NAME}"`)

  return archive
})
