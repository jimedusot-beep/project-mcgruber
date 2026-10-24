import { $,escape } from "./ui.js";
import * as storage from "./storage.js";
import {PrivateVault} from "./cloud-sync-client.js";

// Cloud auth and passphrase are independent of the public application catalog.
// The session token is tab-scoped; the vault encryption passphrase is never stored.
export const cloudVault = new PrivateVault({
  onStatus(message){
    const status=$("#cloud-status");
    if(status)status.textContent=message;
  }
});
export function cloudSettingsHTML(){
 return '<section class="panel cloud-panel" id="cloud-sync-panel">'+
 '<span class="eyebrow">OPTIONAL PRIVATE CLOUD · EXPLICIT OPT-IN</span>'+
 '<h2>Secure cross-device sync</h2>'+
 '<p>Encrypted account snapshots can move your whole workspace—including private photos and experiment results—between your devices. Local autosave remains active even while cloud sync is offline.</p>'+
 '<p class="notice"><strong>Requires your own configured Supabase project.</strong> GitHub Pages does not host private storage. Setup is not active until you provide its HTTPS project URL and public publishable key, sign in with a one-time email code, and unlock a separate encryption passphrase. Never paste service_role or secret keys here.</p>'+
 '<details id="cloud-config-area"><summary>1. Set up private storage provider</summary>'+
 '<p class="small muted">Apply the supplied SQL migration to your private Supabase project, enable Email OTP codes and allow this website origin. Only enter its PUBLIC URL/key.</p>'+
 '<div class="form-grid"><label>Supabase project URL<input id="cloud-url" type="url" placeholder="https://project-ref.supabase.co" autocomplete="off"></label>'+
 '<label>Public publishable / anon key<input id="cloud-public-key" type="text" placeholder="sb_publishable_…" autocomplete="off" spellcheck="false"></label></div>'+
 '<div class="row wrap"><button type="button" id="cloud-config-save">Save public connection details</button><button type="button" id="cloud-config-clear">Forget this device’s connection</button></div>'+
 '</details>'+
 '<p id="cloud-connection-note" class="small muted">No cloud provider connected.</p>'+
 '<div class="form-grid"><label>Email for private sign-in<input id="cloud-email" type="email" autocomplete="email" placeholder="you@example.com"></label>'+
 '<label>One-time email code<input id="cloud-code" type="text" autocomplete="one-time-code" inputmode="numeric" pattern="[0-9]{6,8}" maxlength="8" placeholder="6-digit code"></label></div>'+
 '<div class="row wrap"><button type="button" id="cloud-send-code">Email me a sign-in code</button>'+
 '<button type="button" id="cloud-verify-code">Verify code</button><button type="button" id="cloud-sign-out">Sign out of cloud</button></div>'+
 '<p id="cloud-login-note" class="small muted">Cloud account not signed in.</p>'+
 '<div class="form-grid"><label>Separate vault-encryption passphrase (12+ characters)<input type="password" id="cloud-passphrase" minlength="12" maxlength="256" autocomplete="off" placeholder="Same passphrase on both devices"></label>'+
 '<label>Confirm passphrase for upload<input type="password" id="cloud-passphrase-confirm" minlength="12" maxlength="256" autocomplete="off" placeholder="Retype before uploading"></label></div>'+
 '<p class="small muted">This passphrase only stays in memory while this tab is open. It cannot be recovered by the provider. Keep it securely; a lost passphrase means losing access to the encrypted cloud content.</p>'+
 '<div class="row wrap"><button type="button" id="cloud-check">Check latest remote revision</button>'+
 '<button type="button" id="cloud-upload" class="primary">Encrypt and sync this browser now</button>'+
 '<button type="button" id="cloud-restore">Restore cloud copy to this browser</button>'+
 '<button type="button" id="cloud-download">Download encrypted cloud snapshot</button></div>'+
 '<div class="row wrap"><button type="button" id="cloud-auto">Enable auto-sync for this tab</button>'+
 '<button type="button" id="cloud-stop">Pause automatic sync</button>'+
 '<button type="button" id="cloud-prune">Remove old unreferenced cloud snapshots</button></div>'+
 '<p class="small muted">A first upload is allowed only when the cloud vault is empty. An existing remote revision must first be restored and accepted locally. A stale tab or second device cannot overwrite a newer cloud revision; conflicts pause auto-sync instead of silently merging. Encryption protects contents, not metadata such as account identity or file size.</p>'+
 '<p class="small muted"><strong>Quota:</strong> max 30 MB per encrypted snapshot. Old encrypted uploads are not yet automatically cleaned up; repeated syncs consume provider storage. Automatic sync is session-only, debounced and rate-limited to reduce storage costs; it pauses after errors. Old uploaded files can be removed after 24 hours. On phone, restore using the same account and passphrase. Do not mistake the workflow for a continuously running background service.</p>'+
 '<p id="cloud-head" class="small muted"></p><p id="cloud-status" role="status" aria-live="polite">Local saving continues; cloud sync has not been activated.</p>'+
 '<a href="#/docs/docs/CLOUD_SYNC_DESIGN.md">Security model and complete setup instructions →</a>'+
 '</section>';
}
export function mountCloudSettings({getWorkspace,flushSave,replaceWorkspace,notify}){
 const vault=cloudVault;
 const get=(id)=>$("#"+id);
 const text=(id,value)=>{const e=get(id);if(e)e.textContent=value;};
 const passphrase=()=>get("cloud-passphrase")?.value||"";
 const scrub=()=>{for(const id of ["cloud-passphrase","cloud-passphrase-confirm"]){const e=get(id);if(e)e.value="";}};
 const freeze=async()=>{
   await flushSave();
   const snapshot=structuredClone(getWorkspace());
   return {text:await storage.backup(snapshot),revision:snapshot.revision};
 };
 const refresh=()=>{
   const c=vault.config;
   if(c){get("cloud-url").value=c.url;get("cloud-public-key").value=c.key;}
   text("cloud-connection-note",c?"Provider configured: "+c.url+" (public key only).":"No private cloud provider configured.");
   text("cloud-login-note",vault.signedIn?"Signed in: "+vault.userEmail+" (tab-scoped session).":"Not signed in. Your local files remain unaffected.");
   get("cloud-auto").disabled=!vault.signedIn;
   get("cloud-upload").disabled=!vault.signedIn;
   get("cloud-check").disabled=!vault.signedIn;
   get("cloud-restore").disabled=!vault.signedIn;
   get("cloud-download").disabled=!vault.signedIn;
   get("cloud-prune").disabled=!vault.signedIn;
   get("cloud-stop").disabled=!vault.autoPass;
 };
 const withError=(task)=>async()=>{
   try{await task();refresh();}
   catch(error){
     text("cloud-status",error.message);
     notify("Cloud not changed: "+error.message);
     refresh();
   }
 };
 get("cloud-config-save").onclick=withError(async()=>{
   vault.configure(get("cloud-url").value,get("cloud-public-key").value);
   get("cloud-code").value="";
 });
 get("cloud-config-clear").onclick=withError(async()=>{
   if(!confirm("Disconnect the private vault from this browser? Local records and encrypted cloud snapshots will not be deleted."))return;
   vault.clearConfig();get("cloud-url").value="";get("cloud-public-key").value="";
   scrub();text("cloud-head","");text("cloud-status","Cloud connection forgotten on this browser. Your private cloud account was not deleted.");
 });
 get("cloud-send-code").onclick=withError(async()=>{
   await vault.sendLoginCode(get("cloud-email").value.trim());
 });
 get("cloud-verify-code").onclick=withError(async()=>{
   await vault.confirmLoginCode(get("cloud-email").value.trim(),get("cloud-code").value.trim());
   get("cloud-code").value="";
 });
 get("cloud-sign-out").onclick=withError(async()=>{await vault.signOut();scrub();});
 get("cloud-check").onclick=withError(async()=>{
   const head=await vault.getHead();
   const current= vault.baseline;
   text("cloud-head",head
     ?"Latest encrypted revision: "+head.revision+" (updated "+head.updated_at+"). "+
       (current?.remoteRevision===head.revision?"This device has accepted this revision.":"This device has not accepted the current revision; restore before uploading.")
     :"This cloud account has no McGruber snapshot yet. A first encrypted upload can initialize it.");
 });
 get("cloud-upload").onclick=withError(async()=>{
   const pass=passphrase();
   if(pass!==get("cloud-passphrase-confirm").value)throw Error("Vault passphrase confirmation does not match. Nothing uploaded.");
   const {text:backup,revision}=await freeze();
   const result=await vault.push(backup,pass,revision);
   text("cloud-head","Encrypted vault updated: "+result.revision+".");
   scrub();
 });
 get("cloud-download").onclick=withError(async()=>{
   const head=await vault.getHead();
   if(!head)throw Error("No cloud snapshot exists.");
   storage.download(await vault.downloadEncrypted(head),"mcgruber-private-cloud-snapshot.mcgruber","application/json");
   text("cloud-status","Encrypted file downloaded; no local workspace was changed.");
 });
 get("cloud-restore").onclick=withError(async()=>{
   await flushSave();
   const result=await vault.downloadPlaintext(passphrase());
   if(!confirm("Replace this browser’s CURRENT workspace with the decrypted remote version? Local history is kept, but please download a full local backup first if your changes matter. This does not merge conflicting records."))return;
   const saved=await replaceWorkspace(result.plaintext);
   vault.acceptPulled(result.head,saved.revision);
   scrub();
   notify("Private cloud snapshot authenticated and restored to local storage.");
 });
 get("cloud-auto").onclick=withError(async()=>{
   if(!vault.baseline?.remoteRevision)throw Error("First upload to an empty vault or restore an existing cloud snapshot.");
   const pass=passphrase();
   if(pass.length<12||pass.length>256)throw Error("Enter the same 12+ character vault-encryption passphrase.");
   await vault.getHead().then(head=>{
     if(!head||head.revision!==vault.baseline.remoteRevision)throw Error("Remote revision changed. Restore or reconcile before enabling auto-sync.");
   });
   vault.enableAuto(pass,freeze);
   scrub();
 });
 get("cloud-stop").onclick=()=>{vault.stopAuto();vault.status("Automatic cloud sync paused. Local autosave remains enabled.");refresh();};
 get("cloud-prune").onclick=withError(async()=>{
   if(!confirm("Delete only your encrypted cloud objects older than 24 hours that are not the currently active revision? Local data is unaffected."))return;
   const count=await vault.pruneOld();
   text("cloud-status",count ? count+" old encrypted snapshots removed. Current revision retained." : "No eligible old cloud snapshots found.");
 });
 refresh();
 text("cloud-status",vault.lastStatus);
}
