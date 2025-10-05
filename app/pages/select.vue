<template>
  <main :aria-busy="isDownloadingRef">
    <SibdAlerts
      :is-loading="isLoadingRef"
      :error-card-names="errorCardNames"
    />

    <div
      v-if="cards.length !== 0"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-5 items-center justify-center m-4"
    >
      <ScryCard
        v-for="card in cards"
        :key="card.id"
        :card="(card as Readonly<Scry.Card>)"
        class="cursor-pointer"
        @click="
          selectCard(card as Readonly<Scry.Card>);
          isDisplayModalRef = true;
        "
      />
    </div>
    <div
      v-if="cards.length !== 0"
      class="flex justify-center mt-8"
    >
      <UButton
        class="fixed bottom-4 right-4"
        size="md"
        icon="i-material-symbols-download-rounded"
        :loading="isDownloadingRef"
        @click="openDownloadModal"
      >
        <span class="font-bold">{{ t('select.downloadButton') }}</span>
      </UButton>
    </div>

    <ScryModal v-model="isDisplayModalRef" />
    <ScryDownloadModal
      v-model="isDownloadOptionsModalOpenRef"
      v-model:is-downloading="isDownloadingRef"
    />
  </main>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'

const ScryCard = resolveComponent('ScryCard')
const ScryModal = resolveComponent('ScryModal')
const ScryDownloadModal = resolveComponent('ScryDownloadModal')

const SibdAlerts = resolveComponent('SibdAlerts')

const {
  cards,
  cardNames,
  addCard,
  updateCards,
  selectCard,
} = useCards()
const { selectedLanguage } = useLanguage()
const { t } = useI18n()

const errorCardNames = ref<string[]>([])
const isDisplayModalRef = ref<boolean>(false)
const isLoadingRef = ref<boolean>(true)
const isDownloadingRef = ref<boolean>(false)
const isDownloadOptionsModalOpenRef = ref<boolean>(false)

onMounted(async () => {
  isLoadingRef.value = true
  updateCards([])
  for (const name of cardNames.value) {
    try {
      const params = new URLSearchParams({
        name,
        lang: selectedLanguage.value,
      })
      const card = await $fetch(`/api/cards/byName?${params.toString()}`)
      addCard(card as Scry.Card)
    }
    catch (e) {
      console.log(e)
      errorCardNames.value.push(name)
    }
  }
  isLoadingRef.value = false
})

const openDownloadModal = () => {
  if (cards.value.length === 0) return
  isDownloadOptionsModalOpenRef.value = true
}
</script>
