// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/ui', '@nuxtjs/i18n', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-09-25',

  eslint: {
    config: {
      stylistic: true, // <---
    },
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.ts' },
      { code: 'ja', language: 'ja-JP', name: 'Japanese', file: 'ja.ts' },
      { code: 'fr', language: 'fr-FR', name: 'French', file: 'fr.ts' },
      { code: 'it', language: 'it-IT', name: 'Italian', file: 'it.ts' },
      { code: 'de', language: 'de-DE', name: 'German', file: 'de.ts' },
      { code: 'es', language: 'es-ES', name: 'Spanish', file: 'es.ts' },
    ],
  },
})
