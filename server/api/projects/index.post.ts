import { projectSchema } from "~/shared/domain";
export default defineEventHandler(async (event) => {
  checkOrigin(event);
  const db = workspace(event);
  const body = await validatedBody(event, projectSchema);
  const project = { ...body, id: crypto.randomUUID() };
  db.projects.push(project);
  return project;
});
