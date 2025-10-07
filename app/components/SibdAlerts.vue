<template>
  <UContainer>
    <transition-group
      enter-active-class="animate-in zoom-in duration-700"
      move-class="animate-in duration-700"
      class="my-4 flex flex-col gap-4"
      tag="div"
    >
      <UAlert
        v-if="isDisplayLoadingAlert && isLoading"
        key="isLoading"
        :title="t('alerts.loading', { current: cards.length, total: cardNames.length })"
        icon="i-material-symbols-search-rounded"
        close
        @update:open="isDisplayLoadingAlert = false"
      />
      <UAlert
        v-if="
          isDisplayCompleteAlert && !isLoading && errorCardNames.length === 0
        "
        key="isSuccess"
        :title="t('alerts.success', { count: cards.length })"
        icon="i-material-symbols-done-rounded"
        color="success"
        close
        @update:open="isDisplayCompleteAlert = false"
      />
      <UAlert
        v-if="
          isDisplayErrorAlert
            && cards.length !== 0
            && errorCardNames.length !== 0
        "
        key="isNotDownloaded"
        :title="t('alerts.errorTitle')"
        icon="i-material-symbols-feedback-rounded"
        color="error"
        close
        @update:open="isDisplayErrorAlert = false"
      >
        <template #description>
          <ul
            v-for="name in errorCardNames"
            :key="name"
            class="list-disc"
          >
            <li>{{ name }}</li>
          </ul>
        </template>
      </UAlert>
      <UAlert
        v-if="isDisplayDoubleFaceAlert && doubleFacedCards.length > 0"
        key="doubleFacedCardExists"
        :title="t('alerts.doubleFacedTitle')"
        icon="i-material-symbols-feedback-rounded"
        color="warning"
        close
        :actions="[
          {
            label: t('alerts.doubleFacedDownloadButton'),
            color: 'neutral',
            variant: 'soft',
            onClick: onDownloadCardBacksClick,
          },
        ]"
        @update:open="isDisplayDoubleFaceAlert = false"
      >
        <template #description>
          <ul class="list-disc pl-4">
            <li
              v-for="card in doubleFacedCards"
              :key="card.id"
            >
              <a
                :href="card.scryfall_uri"
                target="_blank"
                class="hover:text-pink-400"
              >{{ card.name }}</a>
            </li>
          </ul>
        </template>
      </UAlert>
    </transition-group>
  </UContainer>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'

const { cards, cardNames } = useCards()
const { t } = useI18n()

const props = defineProps<{
  isLoading: boolean
  errorCardNames: string[]
}>()

const isDisplayLoadingAlert = ref<boolean>(true)
const isDisplayCompleteAlert = ref<boolean>(true)
const isDisplayErrorAlert = ref<boolean>(true)
const isDisplayDoubleFaceAlert = ref<boolean>(true)
const isDownloadingCardBacks = ref<boolean>(false)

const doubleFacedCards = computed(() => {
  if (cards.value.length === 0) return []

  return cards.value.filter(
    c => c.card_faces.length >= 2 && c.card_faces[0]?.image_uris,
  )
})

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

const sanitizeFileName = (name: string, fallback = '') => {
  const sanitized = name
    .replace(/\\/g, '-')
    .replace(/\//g, '-')
    .replace(/[:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '')

  return sanitized || fallback
}

const getCardBackImageUrl = (card: Scry.Card) => {
  const backFace = card.card_faces?.[1]
  if (backFace?.image_uris?.png) return backFace.image_uris.png
  if (backFace?.image_uris?.large) return backFace.image_uris.large
}

const downloadCardBacksZip = async () => {
  if (isDownloadingCardBacks.value) return
  if (doubleFacedCards.value.length === 0) return

  const files = doubleFacedCards.value
    .map((card, index) => {
      const url = getCardBackImageUrl(card as Scry.Card)
      if (!url) return undefined

      const normalizedName = `${String(index + 1).padStart(3, '0')}_${sanitizeFileName(card.name, `card-${index + 1}`)}_back.png`
      return {
        url,
        fileName: normalizedName,
      }
    })
    .filter((file): file is { url: string, fileName: string } => Boolean(file))

  if (files.length === 0) return

  isDownloadingCardBacks.value = true
  try {
    const blob = await $fetch<Blob>('/api/downloadZip', {
      method: 'POST',
      body: { files },
      timeout: 600000,
      responseType: 'blob',
    })

    const defaultZipFileName
      = doubleFacedCards.value.length === 1
        ? `${sanitizeFileName(`${doubleFacedCards.value[0]?.name ?? 'card'} back`) || 'card-back'}.zip`
        : 'double-faced-card-backs.zip'

    triggerDownload(blob, defaultZipFileName)
  }
  catch (error) {
    console.error(error)
  }
  finally {
    isDownloadingCardBacks.value = false
  }
}

const onDownloadCardBacksClick = () => {
  downloadCardBacksZip()
}
</script>
