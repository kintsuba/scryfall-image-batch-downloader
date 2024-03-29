// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: true,
  srcDir: "src/",
  modules: ["@nuxt/ui"],
  ui: { global: true, icons: ["material-symbols", "mdi"] },
});
