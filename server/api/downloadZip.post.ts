import { setHeader } from 'h3'
import got from 'got'
import JSZip from 'jszip'
import {
  downloadZipBodySchema,
  validateWith,
} from '../utils/validation'

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

  await Promise.all(
    files.map(async ({ url, fileName }, index) => {
      if (!url) return
      const buffer = await got.get(url).buffer()
      const safeName = sanitizeFileName(fileName ?? '', index)
      zip.file(safeName, buffer)
    }),
  )

  const output = await zip.generateAsync({ type: 'nodebuffer' })

  setHeader(event, 'Content-Type', 'application/zip')
  setHeader(event, 'Content-Disposition', 'attachment; filename="cards.zip"')

  return output
})
