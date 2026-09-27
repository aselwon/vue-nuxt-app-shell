import { test, expect } from "@playwright/test";

test("dialog keyboard support, invalid login and saved task details", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Password").fill("incorrect");
  await page.getByRole("button", { name: "Enter workspace" }).click();
  await expect(page.getByRole("alert")).toContainText("Unable to sign in");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Enter workspace" }).click();
  await page.getByRole("button", { name: "New task", exact: false }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "New task", exact: false }).click();
  await page.getByLabel("Title", { exact: true }).fill("Details persistence");
  await page.getByLabel("Description").fill("Keep this description");
  await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("doing");
  await page.getByLabel("Due date").fill("2026-12-01");
  await page.getByLabel("Tags").fill("verify");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await page.getByLabel("Filter status").selectOption("doing");
  await page.getByLabel("Filter tag").selectOption("verify");
  await expect(
    page.getByRole("button", { name: "Details persistence", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Details persistence", exact: true })
    .click();
  await expect(page.getByLabel("Description")).toHaveValue(
    "Keep this description",
  );
  await expect(page.getByLabel("Due date")).toHaveValue("2026-12-01");
  await expect(page.getByRole("combobox", { name: "Status", exact: true })).toHaveValue("doing");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
});
