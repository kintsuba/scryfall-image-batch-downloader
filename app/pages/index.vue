<template>
  <main class="h-full">
    <section
      class="flex flex-col gap-5 items-center justify-center h-full mt-[-48px]"
    >
      <UTextarea
        v-model="cardsStringRef"
        size="xl"
        :rows="12"
        :placeholder="t('index.cardsPlaceholder')"
      />

      <div class="flex gap-4">
        <ULocaleSelect
          v-model="selectedLanguageModel"
          size="xl"
          :locales="supportedLocales"
        />

        <UButton
          icon="i-material-symbols-image-search-rounded"
          size="xl"
          color="primary"
          variant="solid"
          :label="t('index.searchButton')"
          :trailing="false"
          :disabled="!canStart"
          @click="toSelect"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'
import {
  DEFAULT_LANGUAGE_CODE,
  SUPPORTED_LANGUAGE_CODES,
  SUPPORTED_LOCALES,
} from '~/constants/languages'
import type { SupportedLanguageCode } from '~/constants/languages'

const { cards, updateCardNames } = useCards()
const {
  selectedLanguage,
  selectedLanguageInitialized,
  setSelectedLanguage,
} = useLanguage()
const { t } = useI18n()

const supportedLocales = [...SUPPORTED_LOCALES]
const supportedLanguageCodes = SUPPORTED_LANGUAGE_CODES

onMounted(() => {
  if (cards && cards.value.length !== 0) {
    const names = (cards.value as Scry.Card[]).map(c => c.name)
    cardsStringRef.value = '1 ' + names.join('\n1 ')
  }

  if (!selectedLanguageInitialized.value) {
    const navigatorLanguages = window.navigator.languages?.length
      ? window.navigator.languages
      : [window.navigator.language]

    const normalizedNavigatorLanguages = navigatorLanguages
      .map(language => language?.split?.('-')?.[0])
      .filter((language): language is string => Boolean(language))

    const matchedLanguage = normalizedNavigatorLanguages.find((language) => {
      return supportedLanguageCodes.includes(
        language as SupportedLanguageCode,
      )
    })

    const fallbackLanguage = matchedLanguage
      ? (matchedLanguage as SupportedLanguageCode)
      : DEFAULT_LANGUAGE_CODE

    setSelectedLanguage(fallbackLanguage)
  }
})

const cardsStringRef = ref<string>(t('index.cardsInitialValue'))

const selectedLanguageModel = computed<SupportedLanguageCode>({
  get: () => selectedLanguage.value,
  set: (value) => {
    if (supportedLanguageCodes.includes(value)) {
      setSelectedLanguage(value)
    }
  },
})

const cardNamesRef = computed(() => {
  if (cardsStringRef.value === '') return []
  const tempArray = cardsStringRef.value.split('\n')

  if (tempArray.every(t => /\d+ (.*)/.test(t))) {
    return tempArray.map((t) => {
      const matchedNames = t.match(/\d+ (.*)/)
      return matchedNames ? matchedNames[1] : ''
    }) as string[]
  }
  else {
    return []
  }
})

const canStart = computed(() => {
  return cardNamesRef.value.length !== 0
})

const toSelect = async () => {
  const router = useRouter()

  updateCardNames(cardNamesRef.value)
  router.push('/select')
}
</script>
