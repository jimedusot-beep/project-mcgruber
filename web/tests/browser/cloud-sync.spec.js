import {test, expect} from "@playwright/test";
import {installVaultMock} from "./helpers/mock-private-vault.js";

test("private vault stays disabled until explicitly configured; no cloud upload without auth",async({page})=>{
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/#/settings");
 await expect(page.getByRole("heading",{name:"Secure cross-device sync"})).toBeVisible();
 await expect(page.locator("#cloud-upload")).toBeDisabled();
 await expect(page.locator("#cloud-restore")).toBeDisabled();
 await expect(page.locator("#cloud-status")).toContainText("Local autosave is active");
 await expect(page.locator("#cloud-connection-note")).toContainText("No private cloud provider configured");
 expect(errors).toEqual([]);
});

test("mocked provider performs verified opt-in encrypted first push without exposing inventory",async({page})=>{
 const id="23456789-1234-4123-8123-123456789012";
 await installVaultMock(page,id);
 await page.goto("/#/settings");
 await page.locator("#cloud-config-area summary").click();
 await page.locator("#cloud-url").fill("https://mock-lab.supabase.co");
 await page.locator("#cloud-public-key").fill("sb_publishable_TEST_PUBLIC_KEY");
 await page.locator("#cloud-config-save").click();
 await expect(page.locator("#cloud-connection-note")).toContainText("mock-lab.supabase.co");
 await page.locator("#cloud-email").fill("test@example.org");
 await page.locator("#cloud-send-code").click();
 await page.locator("#cloud-code").fill("123456");
 await page.locator("#cloud-verify-code").click();
 await expect(page.locator("#cloud-login-note")).toContainText("Signed in: test@example.org");
 await page.locator("#cloud-passphrase").fill("correct-test-private-vault-key");
 await page.locator("#cloud-passphrase-confirm").fill("does-not-match-private-key");
 await page.locator("#cloud-upload").click();
 await expect(page.locator("#cloud-status")).toContainText("confirmation does not match");
 expect(await page.evaluate(()=>window.__vaultFake.uploads)).toBe(0);
 await page.locator("#cloud-passphrase-confirm").fill("correct-test-private-vault-key");
 await page.locator("#cloud-upload").click();
 await expect(page.locator("#cloud-head")).toContainText("Encrypted vault updated");
 const mock=await page.evaluate(()=>window.__vaultFake);
 expect(mock.uploads).toBe(1);expect(mock.commits).toBe(1);
 expect(mock.head?.object_path).toMatch(new RegExp("^"+id+"/[0-9a-f-]+\\.mcgruber$"));
 expect(mock.uploaded).toContain('"cipher":"AES-256-GCM"');
 expect(mock.uploaded).not.toContain("McGruber Lab");
 expect(mock.uploaded).not.toContain("salvage");
 await expect(page.locator("#cloud-passphrase")).toHaveValue("");
 await expect(page.locator("#cloud-passphrase-confirm")).toHaveValue("");
 await page.reload();
 await expect(page.locator("#cloud-login-note")).toContainText("Signed in: test@example.org");
 await expect(page.locator("#cloud-passphrase")).toHaveValue("");
});
