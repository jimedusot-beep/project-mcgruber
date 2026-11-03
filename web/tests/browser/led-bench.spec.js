import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("P04 LED bench starts empty and does not call simulations measured evidence",async ({page})=>{
 await page.goto("/switch-bench/led.html");
 await expect(page.getByRole("heading",{name:"2 · Physical LED alarm test"})).toBeVisible();
 await expect(page.locator("#cycle-status")).toContainText("0/20 completed");
 await expect(page.locator("#result")).toContainText("UNVERIFIED");
 await expect(page.locator("#electrical")).toContainText("not measured");
 await expect(page.locator("[data-cycle]")).toHaveCount(40);
 await page.getByLabel("Loaded DC supply voltage (V)").fill("9");
 await page.getByLabel("Resistor measured unpowered (Ω)").fill("1000");
 await page.getByLabel("DC voltage measured across resistor when ON (V)").fill("7");
 await expect(page.locator("#electrical")).toContainText("7 mA");
 await expect(page.locator("#electrical")).toContainText("0.049 W");
 await expect(page.locator("#result")).toContainText("INCOMPLETE");
 await page.reload();
 await expect(page.getByLabel("Loaded DC supply voltage (V)")).toHaveValue("9");
 await expect(page.locator("#result")).toContainText("UNVERIFIED");
});
test("twenty manually entered cycles and rated parts reach review-ready only, with unchanged evidence status",async ({page})=>{
 await page.goto("/switch-bench/led.html");
 for(const [label,value] of [
  ["Test date (when observed)","2026-11-02"],["Tester","QA test fixture, NOT a real hardware result"],
  ["Donor/switch reference","QA-only mock contact"],["Meter and mode","QA simulated Fluke entry"],
  ["Loaded DC supply voltage (V)","9"],["Resistor measured unpowered (Ω)","1000"],
  ["DC voltage measured across resistor when ON (V)","7"],
  ["LED documented maximum continuous current (mA)","20"],
  ["Resistor documented power rating (W)","0.25"],
  ["Stationary false alarm count (observed)","0"],
  ["Observed notes (include failures and test conditions)","QA-only fictional input. NEVER physical evidence."],
  ["Photo/video or evidence file reference","QA fixture"],
 ]){
  await page.getByLabel(label,{exact:false}).fill(value);
 }
 for(const cb of await page.locator("[data-check]").all())await cb.check();
 for(let i=0;i<20;i++){
  await page.locator('[data-cycle="'+i+'"][data-phase="pressed"]').selectOption("off");
  await page.locator('[data-cycle="'+i+'"][data-phase="removed"]').selectOption("on");
 }
 await expect(page.locator("#cycle-status")).toContainText("20/20 completed; 20 correct");
 await expect(page.locator("#result")).toContainText("READY FOR HUMAN EVIDENCE REVIEW ONLY");
 await expect(page.locator("#result")).toContainText("UNVERIFIED");
 const downloadPromise=page.waitForEvent("download");
 await page.getByRole("button",{name:"Download P04 CSV record"}).click();
 const file=await downloadPromise;
 expect(file.suggestedFilename()).toContain("unverified");
 const csv=await readFile(await file.path(),"utf8");
 expect(csv.split("\r\n").filter(Boolean)).toHaveLength(22);
 expect(csv).toContain("OWNER_REPORTED_READY_FOR_HUMAN_REVIEW");
 expect(csv).toContain("OWNER_ENTERED_UNVERIFIED");
 expect(csv).toContain('"cycle","P04"');
 expect(csv).toContain('"20","off","on"');
 expect(csv).not.toContain("INDEPENDENTLY_VERIFIED");
 await page.reload();
 await expect(page.locator("#cycle-status")).toContainText("20/20 completed");
 await page.locator('[data-cycle="19"][data-phase="removed"]').selectOption("off");
 await expect(page.locator("#result")).toContainText("INCOMPLETE");
 await page.getByRole("button",{name:"Clear local draft"}).click();
 await expect(page.locator("#cycle-status")).toContainText("20/20 completed");
 page.once("dialog",d=>d.accept());
 await page.getByRole("button",{name:"Clear local draft"}).click();
 await expect(page.locator("#cycle-status")).toContainText("0/20 completed");
});
