<template>
  <main class="h-full">
    <section
      class="flex flex-col md:flex-row h-full items-center justify-center mt-[-48px] gap-12"
    >
      <div class="flex w-full max-w-xs items-center justify-center gap-8">
        <UFormField
          :label="t('index.deckList')"
          :error="deckListError"
          class="flex-1"
        >
          <UTextarea
            v-model="cardsStringRef"
            size="xl"
            :rows="12"
            :placeholder="t('index.cardsPlaceholder')"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="flex flex-row md:flex-col items-end md:items-center justify-center gap-10 ">
        <UFormField
          :label="t('index.selectCardLanguage')"
          class="flex-1"
        >
          <ULocaleSelect
            v-model="selectedLanguageModel"
            size="xl"
            :locales="supportedLocales"
          />
        </UFormField>

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
  SUPPORTED_LANGUAGE_CODES,
  SUPPORTED_LOCALES,
} from '~/constants/languages'
import type { SupportedLanguageCode } from '~/constants/languages'

const { cards, updateCardNames } = useCards()
const {
  selectedLanguage,
  setSelectedLanguage,
} = useLanguage()
const { locale, t } = useI18n()

const supportedLocales = [...SUPPORTED_LOCALES]
const supportedLanguageCodes = SUPPORTED_LANGUAGE_CODES

onMounted(() => {
  if (cards && cards.value.length !== 0) {
    const names = (cards.value as Scry.Card[]).map(c => c.name)
    cardsStringRef.value = '1 ' + names.join('\n1 ')
  }
  setSelectedLanguage(locale.value)
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

const deckListError = computed(() => {
  if (cardsStringRef.value === '') return t('index.deckListEmptyError')

  const tempArray = cardsStringRef.value.split('\n')

  if (!tempArray.every(t => /\d+ (.*)/.test(t))) {
    return t('index.deckListInvalidError')
  }
  return !cardNamesRef.value.length
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
