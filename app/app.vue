<template>
  <UApp :locale="locales[locale]">
    <div class="h-screen">
      <SibdHeader />
      <NuxtPage />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const { locale, t } = useI18n()

const lang = computed(() => locales[locale.value].code)
const dir = computed(() => locales[locale.value].dir)

const SibdHeader = resolveComponent('SibdHeader')

const title = computed(() => 'Scryfall Image Batch Downloader')
const description = computed(() => t('app.description'))

useHead({
  title,
  htmlAttrs: {
    lang,
    dir,
    prefix: 'og: http://ogp.me/ns#',
  },
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/ogp-icon.png',
  twitterCard: 'summary',
})
</script>
