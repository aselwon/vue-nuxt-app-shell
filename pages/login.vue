<script setup lang="ts">
import { loginSchema } from "~/shared/domain";
const auth = useAuthStore();
const ready = ref(false);
onMounted(() => {
  ready.value = true;
});
const email = ref("alex@taskly.demo"),
  password = ref("demo1234"),
  error = ref(""),
  busy = ref(false);
async function submit() {
  error.value = "";
  const result = loginSchema.safeParse({
    email: email.value,
    password: password.value,
  });
  if (!result.success) {
    error.value = result.error.issues[0]!.message;
    return;
  }
  busy.value = true;
  try {
    await auth.login(email.value, password.value);
    await navigateTo("/app");
  } catch {
    error.value =
      "Unable to sign in. Check your demo credentials and try again.";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <main class="login-page">
    <NuxtLink to="/" class="brand"
      ><span class="brand-mark" aria-hidden="true">✳</span>taskly</NuxtLink
    >
    <section class="login-card">
      <div class="eyebrow">HELLO, BLOOMLINE</div>
      <h1>Good things ahead.</h1>
      <p>Come in. Give your ideas room to grow.</p>
      <form @submit.prevent="submit">
        <label
          >Email<input
            v-model="email"
            :disabled="!ready || busy"
            type="email"
            autocomplete="username"
            required /></label
        ><label
          >Password<input
            v-model="password"
            :disabled="!ready || busy"
            type="password"
            autocomplete="current-password"
            required
        /></label>
        <p v-if="error" role="alert" class="error">{{ error }}</p>
        <button class="button primary" :disabled="!ready || busy">
          {{ busy ? "Signing in…" : "Enter workspace →" }}
        </button>
      </form>
      <aside class="welcome-tip">
        <strong>Your Bloomline guest pass</strong>
        <p>
          Use alex@taskly.demo or sam@taskly.demo<br />Password:
          <code>demo1234</code>
        </p>
        <small
          >Each account has its own demo data. Server restarts reset it.</small
        >
      </aside>
    </section>
  </main>
</template>
