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
        @click="openDownloadModal"
      >
        <span class="font-bold">Download</span>
      </UButton>
    </div>

    <ScryModal v-model="isDisplayModalRef" />
    <UModal
      v-model:open="isDownloadOptionsModalOpenRef"
      title="Select a download option"
    >
      <template #body>
        <div class="flex flex-col gap-4 py-2">
          <UButton
            icon="i-material-symbols-dashboard-rounded"
            :loading="isDownloadingRef"
            :disabled="isDownloadingRef"
            size="lg"
            @click="onDownloadTtsClick"
          >
            Download as TTS image sheets
          </UButton>
          <UButton
            icon="i-material-symbols-archive-rounded"
            variant="outline"
            :loading="isDownloadingRef"
            :disabled="isDownloadingRef"
            size="lg"
            @click="onDownloadZipClick"
          >
            Download as ZIP archive
          </UButton>
        </div>
      </template>
    </UModal>
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

const getImageUris = (card: Scry.Card) => {
  if (card.card_faces.length >= 2 && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris
  }
  else if (card.image_uris) {
    return card.image_uris
  }
}

const openDownloadModal = () => {
  if (cards.value.length === 0) return
  isDownloadOptionsModalOpenRef.value = true
}

const triggerDownload = (file: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const sanitizeCardName = (name: string) => {
  return name
    .replace(/\\/g, '-')
    .replace(/\//g, '-')
    .replace(/[:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    || 'card'
}

const performDownload = async (task: () => Promise<void>) => {
  if (isDownloadingRef.value) return
  isDownloadOptionsModalOpenRef.value = false

  if (cards.value.length === 0) return

  isDownloadingRef.value = true
  try {
    await task()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    isDownloadingRef.value = false
  }
}

const downloadTtsImages = async () => {
  const images = cards.value
    .map((card) => {
      const imageUri = getImageUris(card as Scry.Card)?.large
      if (!imageUri) return undefined

      return {
        id: (card as Scry.Card).id,
        imageUri,
      }
    })
    .filter((entry): entry is { id: string, imageUri: string } => Boolean(entry))

  if (images.length === 0) return

  const blob = await $fetch<Blob>('/api/downloadTtsImages', {
    method: 'POST',
    body: { images },
    timeout: 600000,
    responseType: 'blob',
  })

  const fileName = blob.type === 'application/zip' ? 'tts-images.zip' : 'deck.png'
  triggerDownload(blob, fileName)
}

const downloadZipBundle = async () => {
  const files = cards.value
    .map((card, index) => {
      const url = getImageUris(card as Scry.Card)?.large
      if (!url) return undefined

      const normalizedName = `${String(index + 1).padStart(3, '0')}_${sanitizeCardName(card.name)}.png`
      return {
        url,
        fileName: normalizedName,
      }
    })
    .filter((file): file is { url: string, fileName: string } => Boolean(file))

  if (files.length === 0) return

  const blob = await $fetch<Blob>('/api/downloadZip', {
    method: 'POST',
    body: { files },
    timeout: 600000,
    responseType: 'blob',
  })

  const zipFileName
    = cards.value.length === 1
      ? `${sanitizeCardName(cards.value[0]?.name ?? 'card')}.zip`
      : 'scryfall-images.zip'

  triggerDownload(blob, zipFileName)
}

const onDownloadTtsClick = () => {
  performDownload(downloadTtsImages)
}

const onDownloadZipClick = () => {
  performDownload(downloadZipBundle)
}
</script>
