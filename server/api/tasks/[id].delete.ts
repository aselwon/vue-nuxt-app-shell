export default defineEventHandler((event) => {
  checkOrigin(event);
  const db = workspace(event);
  const index = db.tasks.findIndex((t) => t.id === getRouterParam(event, "id"));
  if (index < 0)
    throw createError({ statusCode: 404, statusMessage: "Task not found" });
  db.tasks.splice(index, 1);
  return { ok: true };
});
