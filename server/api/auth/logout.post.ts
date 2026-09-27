export default defineEventHandler((event) => {
  checkOrigin(event);
  removeSession(getCookie(event, "taskly-session") || "");
  deleteCookie(event, "taskly-session", { path: "/" });
  return { ok: true };
});
