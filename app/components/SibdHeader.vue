<template>
  <UHeader title="Scryfall Image Batch Downloader">
    <template #right>
      <ULocaleSelect
        v-model="locale"
        class="mr-2"
        :locales="SUPPORTED_LOCALES"
        @update:model-value="setLocale($event as typeof locale)"
      />
      <UColorModeSwitch />
      <nuxt-link
        to="https://github.com/kintsuba/scryfall-image-batch-downloader"
        class="p-2 flex items-center hover:bg-primary-600"
        target="_blank"
      >
        <UIcon
          name="i-mdi-github"
          class="text-2xl"
        />
      </nuxt-link>
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import { SUPPORTED_LOCALES } from '~/constants/languages'

const { locale, setLocale } = useI18n()
</script>
