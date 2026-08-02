import { createError, sendStream, setHeader } from 'h3'
import JSZip from 'jszip'
import {
  addToSizeBudget,
  createTimedZipStream,
  DownloadSizeLimitError,
  makeUniqueFileNames,
  mapWithConcurrency,
  MAX_CONCURRENT_IMAGE_DOWNLOADS,
  MAX_ZIP_SOURCE_BYTES,
} from '../utils/downloadResources'
import {
  downloadZipBodySchema,
  validateWith,
} from '../utils/validation'
import { downloadScryfallImage } from '../utils/scryfallImageDownload'

const sanitizeFileName = (name: string, index: number) => {
  const fallback = `card-${index + 1}.png`
  if (!name) return fallback
  const trimmed = name.trim()
  if (!trimmed) return fallback

  const sanitized = trimmed
    .replace(/\\/g, '-')
    .replace(/\//g, '-')
    .replace(/[:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')

  const withExtension = sanitized.endsWith('.png')
    ? sanitized
    : `${sanitized}.png`

  return withExtension || fallback
}

export default defineEventHandler(async (event) => {
  const { files } = await readValidatedBody(
    event,
    validateWith(downloadZipBodySchema),
  )

  const zip = new JSZip()
  const fileNames = makeUniqueFileNames(
    files.map(({ fileName }, index) => sanitizeFileName(fileName ?? '', index)),
  )
  let totalSourceBytes = 0

  try {
    const downloadedFiles = await mapWithConcurrency(
      files,
      MAX_CONCURRENT_IMAGE_DOWNLOADS,
      async ({ url }, index) => {
        const buffer = await downloadScryfallImage(url)
        totalSourceBytes = addToSizeBudget(
          totalSourceBytes,
          buffer.length,
          MAX_ZIP_SOURCE_BYTES,
        )
        return { buffer, fileName: fileNames[index] }
      },
    )

    for (const { buffer, fileName } of downloadedFiles) {
      if (fileName) zip.file(fileName, buffer)
    }
  }
  catch (error) {
    if (error instanceof DownloadSizeLimitError) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Downloaded images exceed the size limit',
        cause: error,
      })
    }
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to download card images',
      cause: error,
    })
  }

  setHeader(event, 'Content-Type', 'application/zip')
  setHeader(event, 'Content-Disposition', 'attachment; filename="cards.zip"')

  return sendStream(event, createTimedZipStream(zip))
})
