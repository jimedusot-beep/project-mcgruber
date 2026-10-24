import {test,expect} from "@playwright/test";

test("13 source-linked gadgets can be searched, filtered and exported without becoming inventory",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/#/gadgets");
 await expect(page.getByRole("heading",{name:"Gadget Research Library"})).toBeVisible();
 await expect(page.locator(".gadget-card")).toHaveCount(13);
 await expect(page.locator("main")).toContainText("Research-only catalog");
 await page.locator("#gadget-priority").selectOption("Start");
 await expect(page.locator(".gadget-card")).toHaveCount(6);
 await page.locator("#gadget-priority").selectOption("all");
 await page.locator("#gadget-area").selectOption("Mechanical security");
 await expect(page.locator(".gadget-card")).toHaveCount(2);
 await page.locator("#gadget-area").selectOption("all");
 await page.locator("#gadget-search").fill("Rayhunter");
 await expect(page.locator(".gadget-card")).toHaveCount(1);
 await expect(page.locator(".gadget-card")).toContainText("particular cellular modems");
 const d=page.waitForEvent("download");
 await page.getByRole("button",{name:"Export research checklist"}).click();
 const file=await d;
 expect(file.suggestedFilename()).toBe("mcgruber-g05-research.md");
 await page.goto("/#/components");
 await expect(page.locator("#component-results")).not.toContainText("Rayhunter");
 expect(errors).toEqual([]);
});

test("gadget link opens existing Device Brain instead of enabling a physical transmitter",async({page})=>{
 await page.goto("/#/gadgets");
 await page.locator("#gadget-search").fill("StickS3");
 await expect(page.locator(".gadget-card")).toHaveCount(1);
 await page.getByRole("link",{name:"Open Device Brain"}).click();
 await expect(page.getByRole("heading",{name:"Device Brain & Automation Studio"})).toBeVisible();
 await expect(page.locator("main")).toContainText("Simulation only");
});
