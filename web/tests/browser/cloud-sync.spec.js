import {test, expect} from "@playwright/test";

test("private vault stays disabled until explicitly configured; no cloud upload without auth",async({page})=>{
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/#/settings");
 await expect(page.getByRole("heading",{name:"Secure cross-device sync"})).toBeVisible();
 await expect(page.locator("#cloud-upload")).toBeDisabled();
 await expect(page.locator("#cloud-restore")).toBeDisabled();
 await expect(page.locator("#cloud-status")).toContainText("Local saving continues");
 await expect(page.locator("#cloud-connection-note")).toContainText("No private cloud provider configured");
 expect(errors).toEqual([]);
});

test("mocked provider performs verified opt-in encrypted first push without exposing inventory",async({page})=>{
 const id="23456789-1234-4123-8123-123456789012";
 let head=null,encrypted="",uploadRequests=0,commitRequests=0;
 await page.route("https://mock-lab.supabase.co/**",async route=>{
   const url=new URL(route.request().url());
   const path=url.pathname,method=route.request().method();
   let status=200,body={};
   if(path==="/auth/v1/otp"){body={sent:true};}
   else if(path==="/auth/v1/verify")body={
     access_token:"fake-session-jwt",refresh_token:"fake-refresh",expires_in:3600,
     user:{id,email:"test@example.org"}
   };
   else if(path==="/auth/v1/user")body={id,email:"test@example.org"};
   else if(path==="/rest/v1/mcgruber_sync_heads")body=head?[head]:[];
   else if(path.startsWith("/storage/v1/object/mcgruber-private/")&&method==="POST"){
     uploadRequests++;
     encrypted=route.request().postData()||"";
     body={Key:path};
   }else if(path==="/rest/v1/rpc/mcgruber_commit_snapshot"){
     commitRequests++;
     const args=route.request().postDataJSON();
     if((head?.revision||null)!==args.p_expected_revision){status=409;body={message:"SYNC_CONFLICT"};}
     else {
       head={revision:args.p_new_revision,object_path:args.p_object_path,size_bytes:args.p_size_bytes,
         updated_at:"2026-10-24T19:40:00Z"};
       body=[head];
     }
   }else{status=404;body={message:"unknown mocked route "+path};}
   await route.fulfill({status,contentType:"application/json",body:JSON.stringify(body)});
 });
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
 expect(uploadRequests).toBe(0);
 await page.locator("#cloud-passphrase-confirm").fill("correct-test-private-vault-key");
 await page.locator("#cloud-upload").click();
 await expect(page.locator("#cloud-head")).toContainText("Encrypted vault updated");
 expect(uploadRequests).toBe(1);expect(commitRequests).toBe(1);
 expect(head?.object_path).toMatch(new RegExp("^"+id+"/[0-9a-f-]+\\.mcgruber$"));
 expect(encrypted).toContain('"cipher":"AES-256-GCM"');
 expect(encrypted).not.toContain("McGruber Lab");
 expect(encrypted).not.toContain("salvage");
 await expect(page.locator("#cloud-passphrase")).toHaveValue("");
 await expect(page.locator("#cloud-passphrase-confirm")).toHaveValue("");
 await page.reload();
 await expect(page.locator("#cloud-login-note")).toContainText("Signed in: test@example.org");
 await expect(page.locator("#cloud-passphrase")).toHaveValue("");
});
