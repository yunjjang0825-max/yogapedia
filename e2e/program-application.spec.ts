import { expect, test } from "@playwright/test";

test("home offers a clear program application path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /신청/ }).first()).toBeVisible();
});
