import {test,expect} from "@playwright/test";

test("photographed tool kit appears once and copies to private inventory once",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/#/components");
 await page.locator("#component-view").selectOption("arrivals");
 await expect(page.locator(".arrival-entry")).toHaveCount(1);
 await expect(page.locator(".arrival-entry")).toContainText("Dedeco SUNBURST");
 await expect(page.locator(".arrival-entry")).toContainText("116 pieces");
 await expect(page.locator(".arrival-entry")).toContainText("1 micron");
 await page.getByRole("button",{name:"Add this kit to My inventory"}).click();
 await expect(page.locator(".arrival-entry")).toContainText("Already saved to My inventory");
 await expect(page.locator("[data-import-arrival]")).toBeDisabled();
 await expect(page.locator("#save-status")).toHaveText("Saved on this device");
 await page.reload();
 await page.locator("#component-view").selectOption("arrivals");
 await expect(page.locator(".arrival-entry")).toHaveCount(1);
 await expect(page.locator("[data-import-arrival]")).toBeDisabled();
 await page.locator("#component-view").selectOption("personal");
 await expect(page.locator("#component-results .component")).toHaveCount(1);
 await expect(page.locator("#component-results")).toContainText("Dedeco SUNBURST");
 await expect(page.locator("#component-results")).toContainText("Not tested");
 await page.locator("#component-view").selectOption("reference");
 await expect(page.locator(".reference-component")).toHaveCount(23);
 expect(errors).toEqual([]);
});
