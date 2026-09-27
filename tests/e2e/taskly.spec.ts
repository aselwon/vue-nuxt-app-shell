import { test, expect } from "@playwright/test";
test("landing SSR, auth guard and complete workspace flow", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(await response.text()).toContain("Big ideas.");
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
  await page.getByRole("button", { name: "Enter workspace" }).click();
  await expect(page.getByRole("heading", { name: "All tasks" })).toBeVisible();
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await page.getByLabel("Project name").fill("Smoke project");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Smoke project", exact: true })
    .click();
  await page.getByRole("button", { name: "New task", exact: false }).click();
  await page.getByLabel("Title", { exact: true }).fill("Ship the demo");
  await page.getByLabel("Description").fill("Verify the full journey");
  await page.getByLabel("Due date").fill("2026-10-12");
  await page.getByLabel("Tags").fill("release, qa");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ship the demo", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Complete Ship the demo", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Reopen Ship the demo", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "List", exact: false }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "List", exact: false }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Search tasks").fill("no matches");
  await expect(page.getByText("No tasks here yet.")).toBeVisible();
  await page.getByLabel("Search tasks").fill("Ship the demo");
  await page
    .getByRole("button", { name: "Edit Ship the demo", exact: true })
    .click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Ship the polished demo");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Search tasks").fill("");
  await page
    .getByRole("button", { name: "Edit Ship the polished demo", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(
    page.getByText("Ship the polished demo", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Edit project Smoke project", exact: true })
    .click();
  await page.getByLabel("Project name").fill("Renamed project");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Edit project Renamed project", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Renamed project", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
});
test("API rejects anonymous access and isolates users", async ({
  playwright,
}) => {
  const a = await playwright.request.newContext({
    baseURL: "http://127.0.0.1:3107",
  });
  const b = await playwright.request.newContext({
    baseURL: "http://127.0.0.1:3107",
  });
  expect((await a.get("/api/workspace")).status()).toBe(401);
  expect(
    (
      await a.post("/api/auth/login", {
        data: { email: "alex@taskly.demo", password: "wrong" },
      })
    ).status(),
  ).toBe(401);
  await a.post("/api/auth/login", {
    data: { email: "alex@taskly.demo", password: "demo1234" },
  });
  await b.post("/api/auth/login", {
    data: { email: "sam@taskly.demo", password: "demo1234" },
  });
  const p = await (
    await a.post("/api/projects", { data: { name: "Private project" } })
  ).json();
  expect((await b.delete(`/api/projects/${p.id}`)).status()).toBe(404);
  expect(
    (
      await a.post("/api/tasks", {
        data: { title: "Invalid project", projectId: "missing" },
      })
    ).status(),
  ).toBe(400);
  const t = await (
    await a.post("/api/tasks", {
      data: { title: "Cascade test", projectId: p.id },
    })
  ).json();
  await a.delete(`/api/projects/${p.id}`);
  expect((await a.get("/api/workspace")).ok()).toBe(true);
  const data = await (await a.get("/api/workspace")).json();
  expect(data.tasks.some((task: { id: string }) => task.id === t.id)).toBe(
    false,
  );
  await a.dispose();
  await b.dispose();
});
test("failed optimistic update rolls back and mobile layout fits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByRole("button", { name: "Enter workspace" }).click();
  const toggle = page.getByRole("button", {
    name: "Complete Explore a fresh visual direction",
    exact: true,
  });
  await expect(toggle).toBeVisible();
  await page.route("**/api/tasks/*", (route) =>
    route.request().method() === "PUT"
      ? route.fulfill({ status: 500, body: "{}" })
      : route.continue(),
  );
  await toggle.click();
  await expect(page.getByRole("alert")).toContainText("rolled back");
  await expect(toggle).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
