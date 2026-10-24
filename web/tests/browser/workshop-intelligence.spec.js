import { test, expect } from "@playwright/test";

test("Build Navigator and Electronics Detective expose all projects and unverified leads", async ({page})=>{
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/#/assistant");
  await expect(page.getByRole("heading",{name:"Workshop intelligence"})).toBeVisible();
  await expect(page.locator(".intel-opportunity")).toHaveCount(9);
  await expect(page.locator("#intel-project-results")).toContainText("Object-removal indicator");
  await expect(page.locator("#intel-project-results")).toContainText("Planning / identification only");
  await expect(page.locator("#intel-project-results")).toContainText("PDF");
  await page.locator("#intel-project-select").selectOption("P08");
  await expect(page.locator("#intel-project-results")).toContainText("Infrared beam detector");
  await expect(page.locator("#intel-project-results")).toContainText("Matched");
  await page.locator("#intel-ref-search").fill("R-NZ");
  await expect(page.locator("#intel-diagnostic")).toContainText("Amazon Fire TV remote");
  await expect(page.locator("#intel-diagnostic")).toContainText("Safety");
  expect(errors).toEqual([]);
});

test("guided test opens a private empty draft and never overwrites an earlier draft",async ({page})=>{
  await page.goto("/#/assistant");
  await page.getByRole("link",{name:"Record next test"}).click();
  await expect(page.locator("#experiment-form")).toBeVisible();
  await expect(page.locator("#experiment-form [name=project]")).toHaveValue("P04");
  await expect(page.locator("#experiment-form [name=result]")).toHaveValue("Not tested");
  await expect(page.locator("#experiment-form [name=voltage]")).toHaveValue("");
  await expect(page.locator("#experiment-form [name=current]")).toHaveValue("");
  await expect(page.locator("#experiment-form [name=criteria]")).toContainText("Planned test only");
  await page.goto("/#/notebook/P08");
  await expect(page.locator("#experiment-form [name=project]")).toHaveValue("P04");
  await page.reload();
  await expect(page.locator("#experiment-form [name=project]")).toHaveValue("P04");
});

test("investigation worksheet exports as Markdown without fabricated readings",async ({page})=>{
  await page.goto("/#/assistant");
  const downloaded=page.waitForEvent("download");
  await page.getByRole("button",{name:"Export investigation plan"}).click();
  const file=await downloaded;
  expect(file.suggestedFilename()).toBe("mcgruber-p04-investigation.md");
  await page.locator("#intel-ref-search").fill("NightFire");
  await expect(page.locator("#intel-diagnostic")).toContainText("NightFire");
  const second=page.waitForEvent("download");
  await page.getByRole("button",{name:"Export test worksheet"}).click();
  const exported=await second;
  expect(exported.suggestedFilename()).toMatch(/^mcgruber-ref-1[45]-checklist\.md$/);
});
