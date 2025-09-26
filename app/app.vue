<template>
  <UApp>
    <div class="h-screen">
      <SibdHeader />
      <NuxtPage />
    </div>
  </UApp>
</template>

<script setup lang="ts">
const SibdHeader = resolveComponent('SibdHeader')

const title = computed(() => 'Scryfall Image Batch Downloader')
const description = ref(
  'Scryfallの画像を一括でダウンロードするためのサイトです。',
)

useHead({
  title,
  htmlAttrs: {
    lang: 'ja',
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
