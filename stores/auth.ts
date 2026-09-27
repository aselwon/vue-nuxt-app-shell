import { defineStore } from "pinia";
import type { User } from "~/shared/domain";
export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  async function refresh() {
    try {
      user.value = await $fetch<User>("/api/auth/me");
    } catch {
      user.value = null;
    }
  }
  async function login(email: string, password: string) {
    user.value = await $fetch<User>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
  }
  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
    useWorkspaceStore().clear();
    await navigateTo("/login");
  }
  return { user, refresh, login, logout };
});
