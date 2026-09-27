import type { H3Event } from "h3";
import type { Project, Task, User } from "~/shared/domain";
// Deliberately ephemeral, per-process demo storage. Never use for production data.
export const users: User[] = [
  { id: "alex", name: "Alex Morgan", email: "alex@taskly.demo" },
  { id: "sam", name: "Sam Rivera", email: "sam@taskly.demo" },
];
const sessions = new Map<string, { userId: string; expires: number }>();
const workspaces = new Map<string, { projects: Project[]; tasks: Task[] }>();
export function createSession(userId: string) {
  for (const [key, session] of sessions)
    if (session.expires < Date.now()) sessions.delete(key);
  const token = crypto.randomUUID();
  sessions.set(token, { userId, expires: Date.now() + 86400000 });
  return token;
}
export function removeSession(token: string) {
  sessions.delete(token);
}
export function requireUser(event: H3Event) {
  const token = getCookie(event, "taskly-session") || "";
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    throw createError({
      statusCode: 401,
      statusMessage: "Please sign in again",
    });
  }
  return users.find((u) => u.id === session.userId)!;
}
export function workspace(event: H3Event) {
  const user = requireUser(event);
  if (!workspaces.has(user.id)) {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    workspaces.set(user.id, {
      projects: [
        { id: "website", name: "Website refresh", color: "violet" },
        { id: "product", name: "Product launch", color: "blue" },
      ],
      tasks: [
        {
          id: crypto.randomUUID(),
          title: "Explore a fresh visual direction",
          description:
            "Gather references and define a calmer, more focused experience.",
          projectId: "website",
          status: "todo",
          dueDate: date.toISOString().slice(0, 10),
          tags: ["design"],
        },
        {
          id: crypto.randomUUID(),
          title: "Build the component library",
          description: "Start with buttons, inputs and cards.",
          projectId: "website",
          status: "doing",
          dueDate: "",
          tags: ["development"],
        },
        {
          id: crypto.randomUUID(),
          title: "Write the launch story",
          description: "Make the value clear in a few simple words.",
          projectId: "product",
          status: "todo",
          dueDate: "",
          tags: ["content"],
        },
        {
          id: crypto.randomUUID(),
          title: "Map the customer journey",
          description: "Identify the moments that matter.",
          projectId: "product",
          status: "done",
          dueDate: "",
          tags: ["research"],
        },
      ],
    });
  }
  return workspaces.get(user.id)!;
}
export async function validatedBody<T>(
  event: H3Event,
  schema: {
    safeParse: (
      input: unknown,
    ) =>
      | { success: true; data: T }
      | { success: false; error: { issues: { message: string }[] } };
  },
): Promise<T> {
  const result = schema.safeParse(await readBody(event));
  if (!result.success)
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid input",
    });
  return result.data;
}
export function checkOrigin(event: H3Event) {
  const origin = getHeader(event, "origin");
  if (origin && origin !== getRequestURL(event).origin)
    throw createError({ statusCode: 403, statusMessage: "Invalid origin" });
}
