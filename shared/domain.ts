import { z } from "zod";
export const statusSchema = z.enum(["todo", "doing", "done"]);
export const projectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  color: z.enum(["violet", "blue", "amber", "green"]).default("violet"),
});
export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(1000).default(""),
  projectId: z.string().min(1, "Choose a project"),
  status: statusSchema.default("todo"),
  dueDate: z
    .string()
    .refine(
      (v) =>
        !v ||
        (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
          !Number.isNaN(Date.parse(v)) &&
          new Date(v).toISOString().slice(0, 10) === v),
      "Use a valid date",
    )
    .default(""),
  tags: z.array(z.string().trim().min(1).max(24)).max(5).default([]),
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type Project = z.infer<typeof projectSchema> & { id: string };
export type Task = z.infer<typeof taskSchema> & { id: string };
export type User = { id: string; name: string; email: string };
export type Status = Task["status"];
export function filterTasks(
  tasks: Task[],
  filters: { query: string; projectId: string; status: string; tag: string },
) {
  const q = filters.query.trim().toLowerCase();
  return tasks.filter(
    (t) =>
      (!filters.projectId || t.projectId === filters.projectId) &&
      (!filters.status || t.status === filters.status) &&
      (!filters.tag || t.tags.includes(filters.tag)) &&
      (!q ||
        `${t.title} ${t.description} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(q)),
  );
}
