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
        :close-button="{
          icon: 'i-material-symbols-close-rounded',
          color: 'neutral',
          variant: 'link',
          size: '2xs',
        }"
        @close="isDisplayLoadingAlert = false"
      />
      <UAlert
        v-if="
          isDisplayCompleteAlert && !isLoading && errorCardNames.length === 0
        "
        key="isSuccess"
        :title="t('alerts.success', { count: cards.length })"
        icon="i-material-symbols-done-rounded"
        color="success"
        :close-button="{
          icon: 'i-material-symbols-close-rounded',
          color: 'neutral',
          variant: 'link',
          size: '2xs',
        }"
        @close="isDisplayCompleteAlert = false"
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
        :close-button="{
          icon: 'i-material-symbols-close-rounded',
          color: 'neutral',
          variant: 'link',
          size: '2xs',
        }"
        @close="isDisplayErrorAlert = false"
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
        :close-button="{
          icon: 'i-material-symbols-close-rounded',
          color: 'neutral',
          variant: 'link',
          size: '2xs',
        }"
        @close="isDisplayDoubleFaceAlert = false"
      >
        <template #description>
          <ul
            v-for="card in doubleFacedCards"
            :key="card.id"
            class="list-disc"
          >
            <li>
              <a
                :href="card.scryfall_uri"
                target="_blank"
                class="link:text-pink-400"
              >{{ card.name }}</a>
            </li>
          </ul>
        </template>
      </UAlert>
    </transition-group>
  </UContainer>
</template>

<script setup lang="ts">
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

const doubleFacedCards = computed(() => {
  if (cards.value.length === 0) return []

  return cards.value.filter(
    c => c.card_faces.length >= 2 && c.card_faces[0]?.image_uris,
  )
})
</script>
