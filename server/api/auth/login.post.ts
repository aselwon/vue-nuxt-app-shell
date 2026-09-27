import { loginSchema } from "~/shared/domain";
export default defineEventHandler(async (event) => {
  checkOrigin(event);
  const body = await validatedBody(event, loginSchema);
  const user = users.find((u) => u.email === body.email.toLowerCase());
  if (!user || body.password !== "demo1234")
    throw createError({
      statusCode: 401,
      statusMessage: "Email or password is incorrect",
    });
  const previous = getCookie(event, "taskly-session");
  if (previous) removeSession(previous);
  setCookie(event, "taskly-session", createSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: getRequestURL(event).protocol === "https:",
    path: "/",
    maxAge: 86400,
  });
  return user;
});
