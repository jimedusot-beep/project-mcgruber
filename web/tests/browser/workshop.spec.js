import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../../..", import.meta.url));
test("nine inventions, responsive routes, favorites, source navigation and theme persist", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".project-card")).toHaveCount(9);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Small parts.",
  );
  await page.locator('[data-favorite="P04"]').click();
  await page.locator("#project-filter").selectOption("favorites");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Object-Removal Alarm", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Object-Removal Alarm",
  );
  for (let i = 1; i <= 9; i++) {
    await page.goto("/#/project/P0" + i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const bounds = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: window.innerWidth,
    }));
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1);
  }
  await page.goto("/#/project/P04/files");
  await page.getByRole("link", { name: "BUILD.md", exact: true }).click();
  await expect(page.locator(".markdown")).toContainText(
    "Object-removal silent alarm — simplest automatic circuit",
  );
  await page
    .getByRole("button", { name: "Toggle light and dark theme" })
    .click();
  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Toggle light and dark theme" })
    .click();
  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
  await page.goto("/");
  await page.screenshot({
    path: info.outputPath("workshop.png"),
    fullPage: true,
  });
});
test("switch logic, saved simulation, physical notebook, repeat and reload keep evidence distinct", async ({
  page,
}) => {
  await page.goto("/#/project/P04/experiment");
  await expect(page.locator("#sim-output")).toContainText("Output idle");
  await page.getByLabel("Object pressing switch").uncheck();
  await expect(page.locator("#sim-output")).toContainText("Output active");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Save run to notebook" }).click();
  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  await page.goto("/#/notebook");
  await expect(page.locator(".record")).toHaveCount(1);
  await expect(page.locator(".record")).toContainText("Simulation data");
  await page.getByRole("button", { name: "+ New experiment" }).click();
  await page
    .getByLabel("Experiment name", { exact: true })
    .fill("Actual meter trial");
  await page
    .getByLabel("Evidence classification")
    .selectOption("Physically measured result");
  await page.getByLabel("Actual measured voltage (V)").fill("4.98");
  await page
    .getByLabel("Instrument and range")
    .fill("Test fixture simulated form entry, not real evidence");
  await page.getByLabel("Pass / fail criteria").fill("QA record only");
  await page
    .getByLabel("Observations, failures and follow-up tasks")
    .fill("UI test fixture; never a repository physical measurement.");
  await page
    .getByRole("button", { name: "Save experiment", exact: true })
    .click();
  await expect(page.locator(".record")).toHaveCount(2);
  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  await page.reload();
  await expect(page.locator(".record")).toHaveCount(2);
  await page
    .locator(".record")
    .filter({ hasText: "Actual meter trial" })
    .getByRole("button", { name: "Repeat experiment" })
    .click();
  await expect(page.getByLabel("Actual measured voltage (V)")).toHaveValue("");
  await expect(page.getByLabel("Instrument and range")).toHaveValue("");
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    "Not tested",
  );
});
test("guided build progress survives reload and never becomes verified automatically", async ({
  page,
}) => {
  await page.goto("/#/project/P04/guide");
  await page.locator('[data-build-step="0"]').check();
  await page
    .locator('[data-step-note="0"]')
    .fill("QA-only note: test actual contacts later");
  await page.locator("#working-stage").selectOption("2");
  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  await page.reload();
  await expect(page.locator('[data-build-step="0"]')).toBeChecked();
  await expect(page.locator('[data-step-note="0"]')).toHaveValue(
    "QA-only note: test actual contacts later",
  );
  await expect(page.locator("#working-stage")).toHaveValue("2");
  await expect(page.locator(".stage.unverified")).toContainText(
    "pending evidence review",
  );
});
test("component search, inventory entry, dependencies and calculators work on phone and desktop", async ({
  page,
}) => {
  await page.goto("/#/components");
  await expect(page.locator(".component")).toHaveCount(16);
  await page
    .getByPlaceholder("Switch, Fluke, sensor, asset ID…")
    .fill("microswitch");
  await expect(page.locator(".component")).toHaveCount(1);
  await page.getByRole("button", { name: "+ Identify / add a part" }).click();
  await page
    .getByLabel("Component name", { exact: true })
    .fill("QA spare switch");
  await page.getByLabel("Acquisition / ownership").selectOption("Salvaged");
  await page.getByRole("button", { name: "Save identified part" }).click();
  await page.locator("#component-search").fill("");
  await expect(page.locator(".component")).toContainText("QA spare switch");
  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  await page.reload();
  await page.locator("#component-view").selectOption("personal");
  await expect(page.locator(".component")).toContainText("QA spare switch");
  await page.locator("#component-view").selectOption("dependencies");
  await expect(page.locator("#component-results table tbody tr")).toHaveCount(
    16,
  );
  await page.goto("/#/calculators");
  await expect(page.locator("#calculator-result")).toContainText("390");
  await page.getByLabel("Supply voltage (V)").fill("1");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator("#calculator-result")).toContainText(
    "Supply must exceed",
  );
});
test("backup export restores record and uploaded photo; invalid backup leaves existing records intact", async ({
  page,
}, info) => {
  await page.goto("/#/notebook");
  await page.getByRole("button", { name: "+ New experiment" }).click();
  await page
    .getByLabel("Experiment name", { exact: true })
    .fill("Backup round trip");
  await page.locator("#record-media").setInputFiles({
    name: "qa-fixture.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6AAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect
    .poll(async () => ({
      count: await page.locator(".media-card").count(),
      message: await page.locator("#toast").textContent(),
    }))
    .toMatchObject({ count: 1 });
  await page
    .getByRole("button", { name: "Save experiment", exact: true })
    .click();
  await page.goto("/#/settings");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download full backup" }).click();
  const backup = await download,
    backupPath = info.outputPath("backup.json");
  await backup.saveAs(backupPath);
  page.once("dialog", (d) => d.accept());
  await page.locator("#restore-backup").setInputFiles(backupPath);
  await expect(page.locator("#toast")).toContainText("Backup restored");
  await page.goto("/#/notebook");
  await expect(page.locator(".record")).toHaveCount(1);
  await page
    .locator(".record")
    .getByRole("button", { name: /Edit \/ attachments/ })
    .click();
  await expect
    .poll(async () => ({
      count: await page.locator(".media-card").count(),
      message: await page.locator("#toast").textContent(),
    }))
    .toMatchObject({ count: 1 });
  await page.goto("/#/settings");
  page.once("dialog", (d) => d.accept());
  await page.locator("#restore-backup").setInputFiles({
    name: "invalid-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"application":"other"}'),
  });
  await expect(page.locator("#toast")).toContainText(
    "Not a supported McGruber backup",
  );
  await page.goto("/#/notebook");
  await expect(page.locator(".record")).toHaveCount(1);
});
test("two tabs preserve a stale draft instead of overwriting newer saved experiments", async ({
  page,
  context,
}) => {
  await page.goto("/#/notebook");
  await page.getByRole("button", { name: "+ New experiment" }).click();
  await page.getByLabel("Experiment name", { exact: true }).fill("Tab A draft");
  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  const second = await context.newPage();
  await second.goto("/#/notebook");
  await second.getByRole("button", { name: "+ New experiment" }).click();
  await second
    .getByLabel("Experiment name", { exact: true })
    .fill("Tab B saved record");
  await second
    .getByLabel("Observations, failures and follow-up tasks")
    .fill("Software test fixture only.");
  await second
    .getByRole("button", { name: "Save experiment", exact: true })
    .click();
  await expect(second.locator("#save-status")).toHaveText(
    "Saved on this device",
  );
  await expect(page.locator("#save-problem")).toContainText(
    "Another tab saved",
  );
  await expect(page.locator("#save-status")).toHaveText("Autosave paused");
  await page
    .getByRole("button", { name: "Keep my draft & load latest", exact: true })
    .click();
  await expect(page.locator("#save-problem")).toHaveCount(0);
  await expect(page.locator(".record")).toContainText("Tab B saved record");
  await page.goto("/#/settings");
  await expect(page.locator("#revision-list")).toContainText(
    "Recovered tab draft",
  );
  await second.close();
});
test("installed offline cache restores source files and saves notebook records without a network", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.locator(".project-card")).toHaveCount(9);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", resolve, {
          once: true,
        }),
      );
  });
  try {
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator(".project-card")).toHaveCount(9);
    await page.goto("/#/docs/projects/04-object-removal-alarm/BUILD.md");
    await expect(page.locator(".markdown")).toContainText(
      "Object-removal silent alarm — simplest automatic circuit",
    );
    await page.goto("/#/notebook");
    await page.getByRole("button", { name: "+ New experiment" }).click();
    await page
      .getByLabel("Experiment name", { exact: true })
      .fill("Offline software QA record");
    await page
      .getByRole("button", { name: "Save experiment", exact: true })
      .click();
    await expect(page.locator("#save-status")).toHaveText(
      "Saved on this device",
    );
    await page.reload();
    await expect(page.locator(".record")).toContainText(
      "Offline software QA record",
    );
  } finally {
    await context.setOffline(false);
  }
});
test("circuit starter links and ideal DC results agree and external engine loads only on request", async ({
  page,
}) => {
  await page.goto("/#/circuit");
  await expect(page.locator("#circuit-result")).toContainText("5.000");
  await expect(page.locator("#circuit-open")).toHaveAttribute(
    "href",
    /falstad\.com.*cct=/,
  );
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.locator("#circuit-closed").uncheck();
  await expect(page.locator("#circuit-result")).toContainText("0.000");
  await page.locator("#circuit-type").selectOption("divider");
  await expect(page.locator("#circuit-result")).toContainText("0.4545");
});
test("real 3D model loads, transforms, duplicates, explodes, saves and exports geometry", async ({
  page,
  browserName,
}, info) => {
  test.skip(
    browserName === "webkit",
    "Linux headless WebKit WebGL availability is not equivalent to real iPhone Safari; geometry rendering is exercised in software-rendered Chromium.",
  );
  await page.goto("/#/viewer");
  await expect(page.locator("#mesh-status")).toContainText("1 parts", {
    timeout: 20000,
  });
  // Some headless WebKit hosts have no WebGL device. That is reported as a compatibility limitation, never a pass for 3D.
  await expect(page.locator("#viewport canvas")).toBeVisible();
  await page
    .getByRole("button", { name: "Duplicate part", exact: true })
    .click();
  await expect(page.locator("#mesh-status")).toContainText("2 parts");
  await page.getByLabel("Position (mm) x", { exact: true }).fill("35");
  await page.getByLabel("Position (mm) x", { exact: true }).press("Tab");
  await page.locator("#explode").press("Home");
  await page.locator("#explode").press("ArrowRight");
  await expect(page.locator("#explode-value")).toContainText("1 mm");
  await page.locator("#explode").press("Home");
  await page.getByRole("button", { name: "Save scene revision" }).click();
  await expect(page.locator("#save-status")).toHaveText("Saved on this device");
  await page.reload();
  await expect(page.locator("#mesh-status")).toContainText("2 parts", {
    timeout: 20000,
  });
  const d = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export visible STL" }).click();
  const out = await d;
  expect(out.suggestedFilename()).toMatch(/\.stl$/);
  await out.saveAs(info.outputPath("assembly.stl"));
  await page.locator("#model-files").setInputFiles({
    name: "bad.glb",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.locator("#toast")).toContainText("Invalid GLB");
  await expect(page.locator("#mesh-status")).toContainText("2 parts");
  // Batch imports must be all-or-nothing if a later file is malformed.
  const triangle = Buffer.from("o triangle\\nv 0 0 0\\nv 1 0 0\\nv 0 1 0\\nf 1 2 3\\n".replaceAll("\\\\n", "\\n"));
  await page.locator("#model-files").setInputFiles([
    { name: "good.obj", mimeType: "text/plain", buffer: triangle },
    { name: "bad-second.glb", mimeType: "application/octet-stream", buffer: Buffer.from("invalid") },
  ]);
  await expect(page.locator("#toast")).toContainText("Invalid GLB");
  await expect(page.locator("#mesh-status")).toContainText("2 parts");
  await page.locator("#model-files").setInputFiles([
    { name: "first.obj", mimeType: "text/plain", buffer: triangle },
    { name: "second.obj", mimeType: "text/plain", buffer: triangle },
  ]);
  await expect(page.locator("#mesh-status")).toContainText("4 parts");
  await page.screenshot({
    path: info.outputPath("viewer.png"),
    fullPage: true,
  });
});
