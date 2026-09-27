export default defineEventHandler((event) => {
  checkOrigin(event);
  const db = workspace(event);
  const id = getRouterParam(event, "id");
  const index = db.projects.findIndex((p) => p.id === id);
  if (index < 0)
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  db.projects.splice(index, 1);
  db.tasks = db.tasks.filter((t) => t.projectId !== id);
  return { ok: true };
});
