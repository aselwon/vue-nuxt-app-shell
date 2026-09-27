<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
</script>
<template>
  <main class="login-page">
    <NuxtLink to="/" class="brand"><span class="brand-mark">✓</span> taskly.</NuxtLink>
    <section class="login-card">
      <div class="eyebrow">{{ error.statusCode }}</div>
      <h1>{{ error.statusCode === 404 ? 'A little off track.' : 'Something went wrong.' }}</h1>
      <p>{{ error.statusCode === 404 ? 'This page could not be found.' : 'Please try opening your workspace again.' }}</p>
      <button class="button primary" @click="clearError({ redirect: '/' })">Back to home →</button>
    </section>
  </main>
</template>
