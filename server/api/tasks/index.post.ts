import { taskSchema } from "~/shared/domain";
export default defineEventHandler(async (event) => {
  checkOrigin(event);
  const db = workspace(event);
  const body = await validatedBody(event, taskSchema);
  if (!db.projects.some((p) => p.id === body.projectId))
    throw createError({ statusCode: 400, statusMessage: "Project not found" });
  const task = { ...body, id: crypto.randomUUID() };
  db.tasks.push(task);
  return task;
});
