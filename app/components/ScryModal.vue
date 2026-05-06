<template>
  <UModal
    v-model:open="isDisplayRef"
    :title="selectedCard?.name"
  >
    <template #body>
      <div class="relative overflow-hidden rounded-2xl bg-default ring ring-default">
        <div
          class="flex justify-center border-b border-default bg-elevated/30"
        >
          <img
            v-if="selectedCard"
            :src="getImageUris(selectedCard as Scry.Card)?.large"
            :title="selectedCard?.name"
            class="inline-block p-4 max-h-[400px]"
          >
        </div>
        <CardSuggestion
          v-if="selectedCard"
          :using-lang-ref="usingLangRef"
        />
        <!-- Modal footer -->
        <div
          class="flex flex-col items-center gap-3 border-t border-default p-6 md:flex-row md:justify-between"
        >
          <UButton
            v-if="selectedLanguage !== 'en'"
            size="md"
            icon="i-material-symbols-language"
            @click="changeLang"
          >
            {{ englishLabel }} <UIcon name="i-material-symbols-swap-horiz-rounded" /> {{ selectedLanguageLabel }}
          </UButton>
          <div class="flex items-center gap-2">
            <UButton
              size="md"
              variant="outline"
              @click="unset"
            >
              {{ t('modal.cancel') }}
            </UButton>
            <UButton
              size="md"
              icon="i-material-symbols-replace-image"
              @click="changeCard"
            >
              {{ t('modal.changeImage') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'
import { findLanguageLabel } from '~/constants/languages'
import type { SupportedLanguageCode } from '~/constants/languages'

const CardSuggestion = resolveComponent('modal/CardSuggestion')

const { selectedCard, updateCardsWithSelectedCard } = useCards()
const { selectedLanguage } = useLanguage()
const { t } = useI18n()

const englishLabel = findLanguageLabel('en')
const selectedLanguageLabel = computed(() =>
  findLanguageLabel(selectedLanguage.value),
)

const usingLangRef = ref<SupportedLanguageCode>(selectedLanguage.value)

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', isDisplay: boolean): void
}>()

const isDisplayRef = computed({
  get(): boolean {
    return props.modelValue
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  },
})

const changeLang = () => {
  usingLangRef.value
    = usingLangRef.value === 'en'
      ? selectedLanguage.value
      : 'en'
}

const changeCard = () => {
  updateCardsWithSelectedCard()
  unset()
}

const unset = () => {
  isDisplayRef.value = false
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      usingLangRef.value = selectedLanguage.value
    }
  },
)

watch(
  () => selectedLanguage.value,
  (language) => {
    usingLangRef.value = language
  },
)

const getImageUris = (card: Scry.Card) => {
  if (card.card_faces.length >= 2 && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris
  }
  else if (card.image_uris) {
    return card.image_uris
  }
}
</script>
