<template>
  <section>
    <transition enter-active-class="animate-in slide-in-from-left fade-in">
      <div v-show="!isLoadingRef">
        <img
          :src="getImageUris(card as Scry.Card)?.large"
          :title="card.name"
          @load="isLoadingRef = false"
          @click="emit('click')"
        >
      </div>
    </transition>
    <ScryLoading v-show="isLoadingRef" />
  </section>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'

const ScryLoading = resolveComponent('ScryLoading')

const isLoadingRef = ref<boolean>(true)

const props = defineProps<{
  card: Readonly<Scry.Card>
}>()

const getImageUris = (card: Scry.Card) => {
  if (card.card_faces.length >= 2 && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris
  }
  else if (card.image_uris) {
    return card.image_uris
  }
  else {
    return null
  }
}

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>
