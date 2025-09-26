<template>
  <section>
    <CardList
      v-if="shouldShowSelectedLanguage"
      :cards="searchedCardsSelected ?? []"
      :selected-card="selectedCard"
      @select-card="selectCard"
    />
    <CardList
      v-else-if="shouldShowEnglish"
      :cards="searchedCardsEn ?? []"
      :selected-card="selectedCard"
      @select-card="selectCard"
    />
    <div
      v-else
      class="flex items-center justify-center h-60"
    >
      <ScryLoading />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type * as Scry from 'scryfall-sdk'
import type { SupportedLanguageCode } from '~/constants/languages'

const CardList = resolveComponent('modal/CardList')

const { selectedCard, selectCard } = useCards()
const { selectedLanguage } = useLanguage()

const props = defineProps<{
  usingLangRef: SupportedLanguageCode
}>()

const {
  pending: pendingSelected,
  data: searchedCardsSelected,
  refresh: refreshSelected,
} = await useLazyFetch<Scry.Card[]>(
  () =>
    `/api/cards/search/prints?id=${selectedCard.value?.oracle_id}&lang=${selectedLanguage.value}`,
  {
    immediate: false,
    server: false,
    default: () => [],
  },
)

const {
  pending: pendingEn,
  data: searchedCardsEn,
  refresh: refreshEn,
} = await useLazyFetch<Scry.Card[]>(
  () => `/api/cards/search/prints?id=${selectedCard.value?.oracle_id}&lang=en`,
  {
    immediate: false,
    server: false,
    default: () => [],
  },
)

const fetchSelectedLanguageCards = async () => {
  if (!selectedCard.value?.oracle_id || selectedLanguage.value === 'en') {
    return
  }
  await refreshSelected()
}

const fetchEnglishCards = async () => {
  if (!selectedCard.value?.oracle_id) {
    return
  }
  await refreshEn()
}

const shouldShowSelectedLanguage = computed(() => {
  return Boolean(
    selectedCard.value
    && props.usingLangRef === selectedLanguage.value
    && selectedLanguage.value !== 'en'
    && !pendingSelected.value,
  )
})

const shouldShowEnglish = computed(() => {
  return Boolean(
    selectedCard.value && props.usingLangRef === 'en' && !pendingEn.value,
  )
})

watch(
  () => selectedCard.value?.oracle_id,
  async (oracleId) => {
    if (!oracleId) return
    await fetchEnglishCards()
    await fetchSelectedLanguageCards()
  },
  { immediate: true },
)

watch(
  () => selectedLanguage.value,
  async (language) => {
    if (!selectedCard.value?.oracle_id || language === 'en') return
    await fetchSelectedLanguageCards()
  },
)
</script>
