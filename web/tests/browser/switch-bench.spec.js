import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("switch worksheet has no fabricated readings and derives only candidate COM/NC/NO from typed measurements",async({page})=>{
 await page.goto("/switch-bench/");
 await expect(page.getByRole("heading",{name:"Switch continuity bench"})).toBeVisible();
 await expect(page.locator("#analysis")).toContainText("0 of 3 pin pairs measured");
 await expect(page.locator("#analysis")).toContainText("No pin identities assigned");
 await page.getByRole("combobox",{name:"A-B released"}).selectOption("closed");
 await page.getByRole("combobox",{name:"A-B pressed"}).selectOption("open");
 await page.getByRole("combobox",{name:"A-C released"}).selectOption("open");
 await page.getByRole("combobox",{name:"A-C pressed"}).selectOption("closed");
 await page.getByRole("combobox",{name:"B-C released"}).selectOption("open");
 await page.getByRole("combobox",{name:"B-C pressed"}).selectOption("open");
 await expect(page.locator("#analysis")).toContainText("Candidate COM=A, NC=B, NO=C.");
 await expect(page.locator("#analysis")).toContainText("unverified");
 await page.getByRole("checkbox",{name:"Cycle 1",exact:true}).check();
 await expect(page.locator("#cycle-count")).toContainText("1 of 10");
 await page.getByRole("button",{name:"Download CSV evidence"}).click();
 await expect(page.locator("#feedback")).toContainText("Enter the actual meter");
 await page.getByLabel("Instrument / mode").fill("QA simulated input, not a real measurement");
 const d=page.waitForEvent("download");
 await page.getByRole("button",{name:"Download CSV evidence"}).click();
 const downloaded=await d;
 expect(downloaded.suggestedFilename()).toContain("unverified");
 const csv=await readFile(await downloaded.path(),"utf8");
 expect(csv).toContain("OWNER_ENTERED_UNVERIFIED");
 expect(csv).toContain('"A-B","closed","open"');
 expect(csv).toContain('"repeat_cycle"');
 expect(csv).toContain('"reported_consistent"');
 expect(csv).not.toContain("INDEPENDENTLY_VERIFIED");
});
test("contradictions and two-pin switches never become automatically verified",async({page})=>{
 await page.goto("/switch-bench/");
 for(const pair of ["A-B","A-C","B-C"]){
   await page.getByRole("combobox",{name:pair+" released"}).selectOption("closed");
   await page.getByRole("combobox",{name:pair+" pressed"}).selectOption("open");
 }
 await expect(page.locator("#analysis")).toContainText("Expected exactly one different closed pair");
 await expect(page.locator("#analysis")).toContainText("No pin identities assigned");
 await page.getByLabel("Number of accessible terminals").selectOption("2");
 await expect(page.locator("#analysis")).toContainText("0 of 1");
 await page.getByRole("combobox",{name:"A-B released"}).selectOption("open");
 await page.getByRole("combobox",{name:"A-B pressed"}).selectOption("closed");
 await expect(page.locator("#analysis")).toContainText("normally open (NO)");
 await page.getByRole("button",{name:"Clear worksheet"}).click();
 await expect(page.locator("#analysis")).toContainText("0 of 1");
});
