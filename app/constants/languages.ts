import type { Locale, Messages } from '@nuxt/ui'
import { de, en, es, fr, it, ja } from '@nuxt/ui/locale'

export const SUPPORTED_LANGUAGE_CODES = ['en', 'ja', 'fr', 'it', 'de', 'es'] as const

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGE_CODES[number]

const SUPPORTED_LOCALE_MAP = {
  en,
  ja,
  fr,
  it,
  de,
  es,
} as const satisfies Record<SupportedLanguageCode, Locale<Messages>>

export const SUPPORTED_LOCALES = Object.freeze(
  SUPPORTED_LANGUAGE_CODES.map(code => SUPPORTED_LOCALE_MAP[code]),
) as readonly Locale<Messages>[]

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguageCode = SUPPORTED_LANGUAGE_CODES[0]

export const DEFAULT_LOCALE: SupportedLocale
  = SUPPORTED_LOCALE_MAP[DEFAULT_LANGUAGE]

export const findLanguageLabel = (code: SupportedLanguageCode) => {
  return SUPPORTED_LOCALE_MAP[code]?.name ?? code
}

const SUPPORTED_LANGUAGE_CODE_SET = new Set<SupportedLanguageCode>(
  SUPPORTED_LANGUAGE_CODES,
)

export const isSupportedLanguageCode = (
  value: string | undefined,
): value is SupportedLanguageCode => {
  return (
    value !== undefined
    && SUPPORTED_LANGUAGE_CODE_SET.has(value as SupportedLanguageCode)
  )
}
