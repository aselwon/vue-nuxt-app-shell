import { projectSchema } from "~/shared/domain";
export default defineEventHandler(async (event) => {
  checkOrigin(event);
  const db = workspace(event);
  const project = db.projects.find((p) => p.id === getRouterParam(event, "id"));
  if (!project)
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  Object.assign(project, await validatedBody(event, projectSchema));
  return project;
});
