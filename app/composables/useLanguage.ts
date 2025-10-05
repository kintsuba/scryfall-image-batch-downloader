import type { Ref } from 'vue'
import { DEFAULT_LANGUAGE_CODE } from '~/constants/languages'
import type { SupportedLanguageCode } from '~/constants/languages'

export const useLanguage = () => {
  const selectedLanguage: Ref<SupportedLanguageCode> = useState(
    'selectedLanguage',
    () => DEFAULT_LANGUAGE_CODE,
  )
  const selectedLanguageInitialized: Ref<boolean>
    = useState('selectedLanguageInitialized', () => false)

  const setSelectedLanguage = (value: SupportedLanguageCode) => {
    selectedLanguage.value = value
    selectedLanguageInitialized.value = true
  }

  return {
    selectedLanguage: readonly(selectedLanguage),
    selectedLanguageInitialized: readonly(selectedLanguageInitialized),
    setSelectedLanguage,
  }
}
