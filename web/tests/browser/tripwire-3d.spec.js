import { test, expect } from "@playwright/test";

test("P01 links to interactive assembly with accessible part inspection and simulation", async ({ page }, testInfo) => {
  await page.goto("/#/project/P01");
  const entry = page.getByRole("link", { name: /Open interactive 3D assembly/i });
  await expect(entry).toBeVisible();
  await entry.click();
  await expect(page.getByRole("heading", { name: /Take the tripwire apart/i })).toBeVisible();
  await expect(page.locator("#tw-partlist")).toContainText("Light detector");
  const hasCanvas = await page.locator("#tw-viewport canvas").count();
  // Chromium CI provides software GL and must prove real rendering; WebKit\u0027s Linux fallback is tested separately.
  if (testInfo.project.name === "desktop-chromium") {
    await expect(page.locator("#tw-viewport canvas")).toBeVisible();
    await expect.poll(() => page.locator("#tw-viewport canvas").evaluate(c => c.width > 0 && c.height > 0)).toBeTruthy();
  }
  if (!hasCanvas) {
    await expect(page.locator("#tw-viewport")).toContainText("WebGL unavailable");
    await expect(page.getByRole("link", { name: /View exploded drawing/i })).toBeVisible();
    return;
  }
  await page.locator("[data-part='TW-E-BATTERY']").click();
  await expect(page.locator("#tw-detail")).toContainText("TW-E-BATTERY");
  await expect(page.locator("#tw-detail")).toContainText("Salvage");
  await page.locator("#tw-trigger").click();
  await expect(page.locator("#tw-beam-status")).toContainText("Simulated beam broken");
  await page.locator("#tw-trigger").click();
  await expect(page.locator("#tw-beam-status")).toContainText("Simulated beam detected");
  await page.locator("#tw-explode-all").click();
  await expect(page.locator("#tw-amount")).toHaveText("100%");
  await page.locator("#tw-assemble").click();
  await expect(page.locator("#tw-amount")).toHaveText("0%");
  await page.locator("[data-visible='TW-E-BATTERY']").uncheck();
  await page.locator("#tw-show-all").click();
  await expect(page.locator("[data-visible='TW-E-BATTERY']")).toBeChecked();
});

test("3D assembly exports a local GLB for manual 3D Vision import", async ({ page }, testInfo) => {
  await page.goto("/#/tripwire-3d");
  await expect(page.locator("#tw-partlist")).toContainText("Light detector");
  if (testInfo.project.name === "desktop-chromium")
    await expect(page.locator("#tw-viewport canvas")).toBeVisible();
  if (!(await page.locator("#tw-viewport canvas").count())) {
    await expect(page.locator("#tw-export")).toBeDisabled();
    return;
  }
  const [artifact] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#tw-export").click(),
  ]);
  expect(artifact.suggestedFilename()).toBe("mcgruber-tripwire-concept.glb");
});
