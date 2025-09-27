<template>
  <main>
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
        @click="download"
      >
        <span class="font-bold">Download</span>
      </UButton>
    </div>

    <ScryModal v-model="isDisplayModalRef" />
  </main>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'

const ScryCard = resolveComponent('ScryCard')
const ScryModal = resolveComponent('ScryModal')

const SibdAlerts = resolveComponent('SibdAlerts')

const {
  cards,
  cardNames,
  addCard,
  updateCards,
  selectCard,
} = useCards()
const { selectedLanguage } = useLanguage()

const errorCardNames = ref<string[]>([])
const isDisplayModalRef = ref<boolean>(false)
const isLoadingRef = ref<boolean>(true)
const isDownloadingRef = ref<boolean>(false)

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

const getImageUris = (card: Scry.Card) => {
  if (card.card_faces.length >= 2 && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris
  }
  else if (card.image_uris) {
    return card.image_uris
  }
}

const download = async () => {
  let remainingCardLength = cards.value.length
  let index = 0

  const stackSize = 30

  // stackSizeごとに処理する
  while (remainingCardLength > 0) {
    const start = index * (stackSize + 1)
    const end
      = remainingCardLength <= stackSize
        ? remainingCardLength + index * (stackSize + 1)
        : stackSize + index * (stackSize + 1)

    const targetCards = cards.value.slice(start, end)

    isDownloadingRef.value = true
    const result = await useAsyncData(
      'download',
      async () =>
        await $fetch('/api/downloadImage', {
          method: 'POST',
          body: {
            urls: targetCards.map(
              card => getImageUris(card as Scry.Card)?.large,
            ),
          },
          timeout: 600000,
          initialCache: false,
          responseType: 'blob',
        }),
    )

    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(
      result.data.value as unknown as Blob,
    )
    link.setAttribute('download', `deck${index}.png`)
    document.body.appendChild(link)
    link.click()

    isDownloadingRef.value = false

    index++
    remainingCardLength -= stackSize
  }
}
</script>
