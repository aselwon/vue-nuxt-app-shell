export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return;
  const auth = useAuthStore();
  await auth.refresh();
  if (!auth.user) return navigateTo("/login");
});
