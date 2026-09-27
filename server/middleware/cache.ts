export default defineEventHandler((event) => {
  if (getRequestURL(event).pathname.startsWith("/api/"))
    setHeader(event, "Cache-Control", "no-store");
});
