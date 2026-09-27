export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/main.css"],
  routeRules: { "/app": { ssr: false }, "/app/**": { ssr: false } },
  app: {
    head: {
      title: "Taskly — make room for your best work",
      meta: [
        {
          name: "description",
          content:
            "A focused workspace for projects, tasks and the work that matters.",
        },
      ],
    },
  },
  typescript: { strict: true },
});
