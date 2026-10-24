import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import {readFile} from "node:fs/promises";
import {PrivateVault,RemoteConflictError,validateCloudConfig,MAX_CLOUD_BYTES} from "../src/cloud-sync-client.js";

const userId="23456789-1234-4123-8123-123456789012",url="https://test-workshop.supabase.co",key="sb_publishable_TESTKEY_2026";
const fixture=JSON.stringify({application:"mcgruber-lab",version:1,
  workspace:{inventory:[{id:"P1",name:"Private switch",note:"personal photo"}],records:[]},media:[]});
const newPrefs=()=>{
 const values=new Map();
 return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
};
function server(){
 let current=null;
 const objects=new Map(),log=[];
 function response(json,status=200){
   return new Response(JSON.stringify(json),{status,headers:{"Content-Type":"application/json"}});
 }
 async function fetcher(uri,opt){
   const route=new URL(uri).pathname;log.push({route,method:opt.method,headers:opt.headers});
   if(route==="/auth/v1/otp")return response({sent:true});
   if(route==="/auth/v1/verify")return response({
      access_token:"valid-jwt",refresh_token:"refresh-token",expires_in:3600,
      user:{id:userId,email:"user@example.org"}});
   if(route==="/auth/v1/user")return response({id:userId,email:"user@example.org"});
   if(route==="/auth/v1/logout")return response({});
   if(route==="/auth/v1/token")return response({
     access_token:"rotated-jwt",refresh_token:"rotated-refresh",expires_in:3600,
     user:{id:userId,email:"user@example.org"}});
   if(route==="/rest/v1/mcgruber_sync_heads")return response(current?[current]:[]);
   if(route.startsWith("/storage/v1/object/mcgruber-private/")&&opt.method==="POST"){
     const path=decodeURIComponent(route.slice("/storage/v1/object/mcgruber-private/".length));
     if(!path.startsWith(userId+"/"))return response({message:"Forbidden"},403);
     objects.set(path,await opt.body.text());
     return response({Key:"mcgruber-private/"+path});
   }
   if(route.startsWith("/storage/v1/object/authenticated/mcgruber-private/")){
     const path=decodeURIComponent(route.slice("/storage/v1/object/authenticated/mcgruber-private/".length));
     return new Response(objects.get(path) || "not found",{status:objects.has(path)?200:404});
   }
   if(route==="/rest/v1/rpc/mcgruber_commit_snapshot"){
     const args=JSON.parse(opt.body);
     if((current?.revision||null)!==args.p_expected_revision)
       return response({message:"SYNC_CONFLICT"},409);
     if(!objects.has(args.p_object_path) || !args.p_object_path.startsWith(userId+"/"))
       return response({message:"MISSING_OR_UNOWNED_CIPHERTEXT"},403);
     current={revision:args.p_new_revision,object_path:args.p_object_path,
       size_bytes:args.p_size_bytes,updated_at:new Date().toISOString()};
     return response([current]);
   }
   return response({message:"unmocked: "+uri},404);
 }
 return {fetcher,objects,log,get current(){return current;},setHead(next){current=next}};
}
async function loggedIn(api){
 api.configure(url,key);
 await api.sendLoginCode("user@example.org");
 await api.confirmLoginCode("user@example.org","123456");
 assert.equal(api.signedIn,true);
}
test("public endpoint rejects secrets, non-HTTPS, arbitrary domains, paths and invalid keys",()=>{
 assert.deepEqual(validateCloudConfig({url:url+"/",key}),{url,key});
 for(const config of [
  {url:"http://test-workshop.supabase.co",key},
  {url:"https://evil.example.org",key},
  {url:url+"/rest/v1",key},
  {url,key:"sb_secret_PROHIBITED"},
  {url,key:"service_role"},
 ])assert.throws(()=>validateCloudConfig(config),/never a secret/);
});
test("authenticated first upload sends only AEAD ciphertext; remote head is CAS-protected",async()=>{
 const srv=server(),vault=new PrivateVault({
   fetcher:srv.fetcher,prefs:newPrefs(),sessionPrefs:newPrefs(),cryptoApi:webcrypto});
 await loggedIn(vault);
 const out=await vault.push(fixture,"same-strong-passphrase-for-devices","rev-local-01");
 assert.equal(out.revision,srv.current.revision);
 assert.equal(vault.baseline.remoteRevision,out.revision);
 assert.equal(vault.baseline.localRevision,"rev-local-01");
 assert.equal(srv.objects.size,1);
 const uploaded=[...srv.objects.values()][0];
 assert.doesNotMatch(uploaded,/Private switch|personal photo/);
 assert.match(uploaded,/"cipher":"AES-256-GCM"/);
 assert.deepEqual(JSON.parse((await vault.downloadPlaintext("same-strong-passphrase-for-devices")).plaintext),JSON.parse(fixture));
 await assert.rejects(vault.downloadPlaintext("wrong-unique-transfer-key"),/Unable to decrypt/);
 assert.ok(srv.log.every(x=>!x.headers.Authorization || x.headers.Authorization.startsWith("Bearer ")));
 assert.ok(srv.log.some(x=>x.route.endsWith("mcgruber_commit_snapshot")));
 await vault.signOut();
 assert.equal(vault.signedIn,false);
 assert.equal(vault.baseline,null);
});
test("divergent devices cannot overwrite newer remote revision (even after offline edits)",async()=>{
 const srv=server();
 const a=new PrivateVault({fetcher:srv.fetcher,prefs:newPrefs(),sessionPrefs:newPrefs(),cryptoApi:webcrypto});
 const b=new PrivateVault({fetcher:srv.fetcher,prefs:newPrefs(),sessionPrefs:newPrefs(),cryptoApi:webcrypto});
 await loggedIn(a);await loggedIn(b);
 await a.push(fixture,"consistent-strong-device-pass","local-A1");
 await assert.rejects(b.push(fixture,"consistent-strong-device-pass","local-B1"),RemoteConflictError);
 const prior=await b.downloadPlaintext("consistent-strong-device-pass");
 b.acceptPulled(prior.head,"local-B2");
 await a.push(fixture,"consistent-strong-device-pass","local-A2");
 const headBefore=srv.current.revision;
 await assert.rejects(b.push(fixture,"consistent-strong-device-pass","local-B3"),RemoteConflictError);
 assert.equal(srv.current.revision,headBefore);
 assert.equal(b.baseline.remoteRevision,prior.head.revision);
});
test("malformed, oversized or unauthenticated snapshots cannot advance head",async()=>{
 const srv=server(),vault=new PrivateVault({fetcher:srv.fetcher,prefs:newPrefs(),sessionPrefs:newPrefs(),cryptoApi:webcrypto});
 await assert.rejects(vault.getHead(),/Sign in/);
 await loggedIn(vault);
 await assert.rejects(vault.push(fixture,"short","local-1"),/passphrase/);
 assert.equal(srv.current,null);
 await assert.rejects(vault.push(fixture,"a-strong-passphrase",""),/Save your workspace locally/);
 assert.equal(srv.objects.size,0);
 assert.equal(MAX_CLOUD_BYTES,31457280);
});
test("saved sessions are scoped to the tab and endpoint; passphrase never persists",async()=>{
 const srv=server(),prefs=newPrefs(),tab=newPrefs();
 const vault=new PrivateVault({fetcher:srv.fetcher,prefs,sessionPrefs:tab,cryptoApi:webcrypto});
 await loggedIn(vault);
 const browserRefresh=new PrivateVault({fetcher:srv.fetcher,prefs,sessionPrefs:tab,cryptoApi:webcrypto});
 assert.equal(browserRefresh.signedIn,true);
 const differentTab=new PrivateVault({fetcher:srv.fetcher,prefs,sessionPrefs:newPrefs(),cryptoApi:webcrypto});
 assert.equal(differentTab.signedIn,false);
 assert.doesNotMatch(JSON.stringify([...Object.keys(vault.session||{})]),/passphrase/);
 const head=await browserRefresh.getHead();
 assert.equal(head,null);
 await assert.rejects(browserRefresh.enableAuto("strong-password",async()=>({text:fixture,revision:"r"})),/First create/);
 await browserRefresh.signOut();
 assert.equal(new PrivateVault({fetcher:srv.fetcher,prefs,sessionPrefs:tab,cryptoApi:webcrypto}).signedIn,false);
});
test("Postgres migration pins authenticated RLS, immutable private bucket and atomic head comparison",async()=>{
 const sql=await readFile(new URL("../../supabase/migrations/202610240001_private_vault.sql",import.meta.url),"utf8");
 for(const term of [
   "ENABLE ROW LEVEL SECURITY","TO authenticated","auth.uid()",
   "REVOKE ALL","public = false","SECURITY DEFINER","SET search_path = ''",
   "h.revision IS NOT DISTINCT FROM p_expected_revision","SYNC_CONFLICT",
   "MISSING_OR_UNOWNED_CIPHERTEXT","mcgruber-private",
 ])assert.ok(sql.includes(term),term);
 assert.doesNotMatch(sql,/GRANT (?:ALL|UPDATE|DELETE|INSERT) ON public\.mcgruber_sync_heads TO authenticated/i);
 assert.doesNotMatch(sql,/CREATE POLICY [^\n]+ FOR DELETE/i);
});
