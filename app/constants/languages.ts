import { de, en, es, fr, it, ja } from '@nuxt/ui/locale'

export const SUPPORTED_LOCALES = [en, ja, fr, it, de, es]
export const SUPPORTED_LANGUAGE_CODES = Object.freeze(SUPPORTED_LOCALES.map(locale => locale.code))

export const DEFAULT_LOCALE = en
export const DEFAULT_LANGUAGE_CODE = en.code

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number]

export const findLanguageLabel = (code: SupportedLanguageCode) => {
  return SUPPORTED_LOCALES.find(locale => locale.code === code)?.name ?? code
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
