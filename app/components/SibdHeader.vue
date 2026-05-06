<template>
  <UHeader title="Scryfall Image Batch Downloader">
    <template #right>
      <ULocaleSelect
        v-model="locale"
        size="sm"
        class="mr-2"
        :locales="SUPPORTED_LOCALES"
        @update:model-value="setLocale($event as typeof locale)"
      />
      <UColorModeSwitch />
      <UButton
        aria-label="Open GitHub repository"
        color="neutral"
        variant="ghost"
        square
        to="https://github.com/kintsuba/scryfall-image-batch-downloader"
        target="_blank"
      >
        <UIcon name="i-mdi-github" class="text-2xl" />
      </UButton>
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import { SUPPORTED_LOCALES } from '~/constants/languages'

const { locale, setLocale } = useI18n()
</script>
