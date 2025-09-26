export type SupportedLanguageCode = 'en' | 'ja' | 'fr' | 'it' | 'de' | 'es'

export type LanguageOption = {
  label: string
  value: SupportedLanguageCode
}

export const DEFAULT_LANGUAGE: SupportedLanguageCode = 'en'

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
  { label: 'Français', value: 'fr' },
  { label: 'Italiano', value: 'it' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Español', value: 'es' },
] as const satisfies ReadonlyArray<LanguageOption>

export const SUPPORTED_LANGUAGE_CODES = LANGUAGE_OPTIONS.map(
  option => option.value,
)

export const findLanguageLabel = (code: SupportedLanguageCode) => {
  return LANGUAGE_OPTIONS.find(option => option.value === code)?.label ?? code
}

export const isSupportedLanguageCode = (
  value: string | undefined,
): value is SupportedLanguageCode => {
  return (
    value !== undefined
    && SUPPORTED_LANGUAGE_CODES.includes(value as SupportedLanguageCode)
  )
}
