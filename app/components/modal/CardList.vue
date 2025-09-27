<template>
  <div
    class="grid grid-cols-4 gap-1 justify-center items-center p-3 overflow-y-scroll h-60"
  >
    <div
      v-for="card in cards"
      :key="card.id"
      class="text-center cursor-pointer"
      :class="[card.id === selectedCard?.id ? 'opacity-100' : 'opacity-50']"
      @click="emit('selectCard', card)"
    >
      <ScryCard :card="card" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'

const props = defineProps<{
  cards: Scry.Card[]
  selectedCard: Scry.Card | undefined
}>()

const emit = defineEmits<{
  (e: 'selectCard', card: Scry.Card): void
}>()
</script>
