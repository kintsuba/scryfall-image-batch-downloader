<template>
  <section>
    <CardList
      v-if="usingLangRef === selectedLanguage && statusSelected !== 'pending'"
      :cards="searchedCardsSelected"
      :selected-card="selectedCard"
      @select-card="selectCard"
    />
    <CardList
      v-else-if="usingLangRef === 'en' && statusEn !== 'pending'"
      :cards="searchedCardsEn"
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
import type * as Scry from 'scryfall-sdk'
import type { SupportedLanguageCode } from '~/constants/languages'

const CardList = resolveComponent('modal/CardList')

const { selectedCard, selectCard } = useCards()
const { selectedLanguage } = useLanguage()

const { status: statusSelected, data: searchedCardsSelected } = await useLazyFetch(
  `/api/cards/search/prints?id=${selectedCard.value?.oracle_id}&lang=${selectedLanguage.value}`,
)

const { status: statusEn, data: searchedCardsEn } = await useLazyFetch(
  `/api/cards/search/prints?id=${selectedCard.value?.oracle_id}&lang=en`,
)

const props = defineProps<{
  usingLangRef: SupportedLanguageCode
}>()

const emit = defineEmits<{
  (e: 'selectCard', card: Scry.Card): void
}>()
</script>
