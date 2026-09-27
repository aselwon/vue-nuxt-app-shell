import { taskSchema } from "~/shared/domain";
export default defineEventHandler(async (event) => {
  checkOrigin(event);
  const db = workspace(event);
  const task = db.tasks.find((t) => t.id === getRouterParam(event, "id"));
  if (!task)
    throw createError({ statusCode: 404, statusMessage: "Task not found" });
  const body = await validatedBody(event, taskSchema);
  if (!db.projects.some((p) => p.id === body.projectId))
    throw createError({ statusCode: 400, statusMessage: "Project not found" });
  Object.assign(task, body);
  return task;
});
