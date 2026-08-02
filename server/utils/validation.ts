import { z } from 'zod'
import { DEFAULT_LANGUAGE_CODE } from '~/constants/languages'

export const MAX_CARD_NAME_LENGTH = 1024
export const MAX_CARD_NAMES = 100
export const MAX_URL_LENGTH = 2048
export const MAX_FILE_NAME_LENGTH = 255
export const MAX_DOWNLOAD_FILES = 100
export const MAX_TTS_IMAGES = 500
export const MAX_IMAGE_ID_LENGTH = 128
export const MAX_HIDDEN_IMAGE_DATA_URL_LENGTH = 6 * 1024 * 1024

// https://scryfall.com/docs/api/languages
export const SCRYFALL_LANGUAGE_CODES = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ja',
  'ko',
  'ru',
  'zhs',
  'zht',
  'he',
  'la',
  'grc',
  'ar',
  'sa',
  'ph',
] as const

type ScryfallLanguageCode = (typeof SCRYFALL_LANGUAGE_CODES)[number]

const SCRYFALL_LANGUAGE_CODE_SET = new Set<string>(SCRYFALL_LANGUAGE_CODES)

const IMAGE_DATA_URL_PATTERN = /^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/

const trimmedString = (field: string, maxLength: number) => z
  .string({ error: `${field} must be a string` })
  .trim()
  .min(1, `${field} must not be empty`)
  .max(maxLength, `${field} is too long`)

const optionalTrimmedString = (field: string, maxLength: number) => z
  .string({ error: `${field} must be a string` })
  .trim()
  .max(maxLength, `${field} is too long`)
  .transform(value => value || undefined)
  .optional()

const supportedLanguageSchema = z
  .string({ error: 'language must be a string' })
  .trim()
  .toLowerCase()
  .refine(
    (value): value is ScryfallLanguageCode => SCRYFALL_LANGUAGE_CODE_SET.has(value),
    'Unsupported Scryfall language code',
  )

const oracleIdSchema = z
  .string({ error: 'id must be a string' })
  .trim()
  .toLowerCase()
  .pipe(z.uuid('id must be a valid Scryfall Oracle ID'))

const httpUrlSchema = z
  .string({ error: 'URL must be a string' })
  .trim()
  .max(MAX_URL_LENGTH, 'URL is too long')
  .url('URL must be valid')
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol
      return protocol === 'http:' || protocol === 'https:'
    }
    catch {
      return false
    }
  }, 'URL must use HTTP or HTTPS')

const fileNameSchema = optionalTrimmedString('fileName', MAX_FILE_NAME_LENGTH)

const hiddenImageSchema = z
  .string({ error: 'hiddenImage must be a string' })
  .trim()
  .min(1, 'hiddenImage must not be empty')
  .max(MAX_HIDDEN_IMAGE_DATA_URL_LENGTH, 'hiddenImage is too large')
  .regex(IMAGE_DATA_URL_PATTERN, 'hiddenImage must be a PNG or JPEG data URL')
  .optional()

export const cardByNameQuerySchema = z.object({
  name: trimmedString('name', MAX_CARD_NAME_LENGTH),
  lang: supportedLanguageSchema.optional().default(DEFAULT_LANGUAGE_CODE),
}).strict()

export const cardByNamesBodySchema = z.object({
  cardNames: z
    .array(trimmedString('cardName', MAX_CARD_NAME_LENGTH))
    .min(1, 'cardNames must contain at least one card name')
    .max(MAX_CARD_NAMES, `cardNames must contain at most ${MAX_CARD_NAMES} entries`),
  language: supportedLanguageSchema.optional().default(DEFAULT_LANGUAGE_CODE),
}).strict()

export const cardPrintsQuerySchema = z.object({
  id: oracleIdSchema,
  lang: supportedLanguageSchema,
}).strict()

export const downloadBodySchema = z.object({
  url: httpUrlSchema,
}).strict()

const downloadFileSchema = z.object({
  url: httpUrlSchema,
  fileName: fileNameSchema,
}).strict()

export const downloadZipBodySchema = z.object({
  files: z
    .array(downloadFileSchema)
    .min(1, 'files must contain at least one file')
    .max(MAX_DOWNLOAD_FILES, `files must contain at most ${MAX_DOWNLOAD_FILES} entries`),
}).strict()

const downloadImageSchema = z.object({
  id: optionalTrimmedString('id', MAX_IMAGE_ID_LENGTH),
  imageUri: httpUrlSchema,
}).strict()

export const downloadTtsImagesBodySchema = z.object({
  images: z
    .array(downloadImageSchema)
    .min(1, 'images must contain at least one image')
    .max(MAX_TTS_IMAGES, `images must contain at most ${MAX_TTS_IMAGES} entries`)
    .optional(),
  urls: z
    .array(httpUrlSchema)
    .min(1, 'urls must contain at least one URL')
    .max(MAX_TTS_IMAGES, `urls must contain at most ${MAX_TTS_IMAGES} entries`)
    .optional(),
  hiddenImage: hiddenImageSchema,
}).strict().superRefine((body, context) => {
  if (!body.images && !body.urls) {
    context.addIssue({
      code: 'custom',
      path: ['images'],
      message: 'Either images or urls must be provided',
    })
  }

  if (body.images && body.urls) {
    context.addIssue({
      code: 'custom',
      path: ['urls'],
      message: 'Provide either images or urls, not both',
    })
  }
})

export const validateWith = <Output>(schema: z.ZodType<Output>) => {
  return (input: unknown): Output => schema.parse(input)
}
