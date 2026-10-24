import { test, expect } from "@playwright/test";

test("Rev 4 inventory stays separate, imports once, and survives reload", async ({ page }) => {
  await page.goto("/#/components");
  await page.locator("#component-view").selectOption("reference");
  await expect(page.locator(".reference-component")).toHaveCount(23);
  await expect(page.locator("#component-results")).toContainText("22 distinct groups");
  await expect(page.locator("#component-results")).toContainText("Part of #10");

  await page.locator("#component-search").fill("NightFire");
  await expect(page.locator(".reference-component")).toHaveCount(2);
  await page.locator("#component-search").fill("");
  await page.getByRole("button", { name: "Add missing source groups to My inventory" }).click();
  await expect(page.locator("#component-results")).toContainText("22 of 22 standalone source groups");
  await page.getByRole("button", { name: "Add missing source groups to My inventory" }).click();

  await page.locator("#component-view").selectOption("personal");
  await expect(page.locator(".component")).toHaveCount(22);
  await expect(page.locator("#component-results")).toContainText("Not tested");
  await expect(page.locator("#component-results")).toContainText("Loose mixed-color through-hole LEDs");

  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  await page.reload();
  await page.locator("#component-view").selectOption("personal");
  await expect(page.locator(".component")).toHaveCount(22);
  await page.locator("#component-view").selectOption("reference");
  await expect(page.locator("#component-results")).toContainText("22 of 22 standalone source groups");
  await page.locator("#component-filter").selectOption("Power");
  await expect(page.locator(".reference-component")).toHaveCount(3);
});
