import {test,expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
test("real-iPhone checklist starts empty and exported evidence is unverified",async({page})=>{
 await page.goto("/iphone-qa/");
 await expect(page.getByRole("heading",{name:"Real iPhone acceptance test"})).toBeVisible();
 await expect(page.locator("[data-test]")).toHaveCount(13);
 await expect(page.locator("#review")).toContainText("13 not tested");
 await expect(page.locator("#review")).toContainText("OWNER_ENTERED_UNVERIFIED");
 await expect(page.getByRole("link",{name:"Open feature for this check"})).toHaveCount(13);
 await page.getByRole("button",{name:"Capture diagnostics"}).click();
 await expect(page.locator("#diagnostics")).toContainText("viewport");
 await expect(page.locator("#diagnostics")).toContainText("NOT physical device proof");
 const pending=page.waitForEvent("download");
 await page.getByRole("button",{name:"Download Markdown report"}).click();
 const download=await pending;
 expect(download.suggestedFilename()).toContain("unverified");
 const report=await readFile(await download.path(),"utf8");
 expect(report).toContain("OWNER_ENTERED_UNVERIFIED");
 expect(report).toContain("INCOMPLETE");
});
test("manual outcomes preserve failures, autosave and clear without claiming verification",async({page})=>{
 await page.goto("/iphone-qa/");
 for(const [id,value] of Object.entries({
  tester:"QA browser fixture",deviceModel:"QA simulated device",iosVersion:"QA iOS",browserVersion:"QA WebKit",
  testedAt:"2026-11-03",evidenceReference:"QA test fixture, not genuine media",
  overallNotes:"QA-only, never physical evidence"
 }))await page.locator("#"+id).fill(value);
 await page.locator("#physicalIPhoneConfirmed").check();
 for(const item of await page.locator("[data-test]").all())await item.selectOption("pass");
 await page.locator('[data-test="3d-load"]').selectOption("fail");
 await page.locator('[data-notes="3d-load"]').fill("QA fictional blank canvas");
 await expect(page.locator("#review")).toContainText("12 passed · 1 failed");
 await expect(page.locator("#review")).toContainText("HUMAN REVIEW only");
 await expect(page.locator("#review")).toContainText("OWNER_ENTERED_UNVERIFIED");
 const pending=page.waitForEvent("download");
 await page.getByRole("button",{name:"Download Markdown report"}).click();
 const file=await pending,markdown=await readFile(await file.path(),"utf8");
 expect(markdown).toContain("13-part tripwire model — **fail** — QA fictional blank canvas");
 expect(markdown).toContain("All owner-reported checks passed: no");
 expect(markdown).toContain("OWNER_ENTERED_UNVERIFIED");
 await page.reload();
 await expect(page.locator("#review")).toContainText("12 passed · 1 failed");
 page.once("dialog",d=>d.accept());
 await page.getByRole("button",{name:"Clear local draft"}).click();
 await expect(page.locator("#review")).toContainText("13 not tested");
});
