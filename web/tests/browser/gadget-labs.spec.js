import {test,expect} from "@playwright/test";

test("six labs run isolated simulations; review marks autosave without hardware claims",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/#/labs/G07");
 await expect(page.getByRole("heading",{name:"Simulation & Build-Readiness Labs"})).toBeVisible();
 await expect(page.locator(".gadget-lab-link")).toHaveCount(6);
 await expect(page.locator("#gadget-lab-run")).toBeVisible();
 await expect(page.locator("#gadget-lab-progress")).toContainText("0/7");
 await page.locator('[data-lab-check="sources"]').check();
 await expect(page.locator("#gadget-lab-progress")).toContainText("1/7");
 await expect(page.locator("#save-status")).toHaveText("Saved on this device");
 await page.reload();
 await expect(page.locator('[data-lab-check="sources"]')).toBeChecked();
 await page.locator("#gadget-lab-scenario").selectOption("light");
 await page.locator("#gadget-lab-run").click();
 await expect(page.locator("#gadget-lab-result")).toContainText("Debounced virtual events");
 await expect(page.locator("#gadget-lab-result svg")).toBeVisible();
 await page.locator("#gadget-lab-log").click();
 await expect(page.locator("#save-status")).toHaveText("Saved on this device");
 await page.goto("/#/notebook");
 await expect(page.locator("#record-list")).toContainText("Gadget Lab simulation");
 await expect(page.locator("#record-list")).toContainText("Simulation data");
 await expect(page.locator("#record-list")).toContainText("Not tested");
 expect(errors).toEqual([]);
});

test("BLE and synthetic SDR examples do not imply real scanning; detailed checklist exports",async({page})=>{
 await page.goto("/#/gadgets");
 await page.locator("#gadget-search").fill("RTL-SDR");
 await expect(page.locator(".gadget-card")).toHaveCount(1);
 await page.getByRole("link",{name:"Open simulation & readiness"}).click();
 await expect(page.locator("#gadget-lab-workspace")).toContainText("RTL-SDR receive-only radio workbench");
 await expect(page.locator("#gadget-lab-workspace")).toContainText("manufactured test data");
 await page.locator("#gadget-lab-scenario").selectOption("fm");
 await page.locator("#gadget-lab-run").click();
 await expect(page.locator("#gadget-lab-result")).toContainText("Illustrative peak");
 await expect(page.locator("#gadget-lab-result")).toContainText("not local RF monitoring");
 const wait=page.waitForEvent("download");
 await page.locator("#gadget-lab-worksheet").click();
 const file=await wait;expect(file.suggestedFilename()).toBe("mcgruber-g08-readiness.md");
 await page.goto("/#/labs/G04");
 await page.locator("#gadget-lab-scenario").selectOption("rotating");
 await page.locator("#gadget-lab-run").click();
 await expect(page.locator("#gadget-lab-result")).toContainText("does not establish");
 await expect(page.locator("#gadget-lab-result")).toContainText("fictional");
});
