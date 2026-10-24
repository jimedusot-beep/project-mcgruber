// Browser-only, opt-in encrypted vault client. Never receives a Supabase secret key,
// never uploads plaintext records or media, never updates a remote head without CAS.
// No supabase-js dependency: fetch uses the hosted provider's official Auth/REST/Storage APIs.
import { encryptTransfer, decryptTransfer } from "./secure-transfer.js";

export const MAX_CLOUD_BYTES = 30 * 1024 * 1024;
const CONFIG_KEY = "mcgruber-sync-public-endpoint-v1";
const prefix = "mcgruber-sync-";
const allowedConfig = (url,key) =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) &&
  /^(?:sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_.-]+)$/.test(key) &&
  key.length <= 2400;
const metaRevision = (s) => s?.revision || null;
export class RemoteConflictError extends Error {
  constructor() {
    super("A different device has updated this private vault. No remote data was overwritten. Export local changes, then download/restore the current encrypted cloud copy before syncing again.");
    this.name = "RemoteConflictError";
  }
}
export function validateCloudConfig(config) {
  const url=String(config?.url||"").trim().replace(/\/$/,"");
  const key=String(config?.key||"").trim();
  if (!allowedConfig(url,key)) throw Error("Use an HTTPS *.supabase.co project URL and its public publishable or legacy anon key—never a secret/service_role key.");
  return {url,key};
}
async function decodeResponse(response) {
  const raw=await response.text();
  let data;
  try{data=raw?JSON.parse(raw):null;}catch{data=null;}
  if(!response.ok){
    const message=String(data?.message||data?.msg||data?.error_description||data?.error||response.statusText||"Remote service error");
    if(/SYNC_CONFLICT/.test(message) || response.status===409)throw new RemoteConflictError();
    throw Error("Private vault request failed ("+response.status+"): "+message.slice(0,180));
  }
  return data;
}
const isUUID=(value)=>typeof value==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export class PrivateVault {
  constructor({fetcher=globalThis.fetch?.bind(globalThis),
    prefs=globalThis.localStorage, sessionPrefs=globalThis.sessionStorage,
    cryptoApi=globalThis.crypto, onStatus=()=>{}}={}) {
    this.fetcher=fetcher;this.prefs=prefs;this.sessionPrefs=sessionPrefs;
    this.cryptoApi=cryptoApi;this.onStatus=onStatus;this.lastStatus="Local autosave is active. Cloud sync has not been enabled.";
    this.config=null;this.session=null;this.autoPass=null;this.timer=null;this.inFlight=null;this.lastUploadAt=0;
    try{const saved=JSON.parse(this.prefs?.getItem(CONFIG_KEY)||"null");if(saved)this.config=validateCloudConfig(saved);}catch{}
    this.loadSession();
  }
  status(text){this.lastStatus=text;this.onStatus(text);}
  configSessionKey(){return prefix+"session:"+this.config?.url;}
  baselineKey(){return prefix+"base:"+this.config?.url+":"+(this.session?.user?.id||"signed-out");}
  loadSession(){
    this.session=null;if(!this.config)return;
    try{
      const saved=JSON.parse(this.sessionPrefs?.getItem(this.configSessionKey())||"null");
      if(saved&&isUUID(saved.user?.id)&&saved.access_token&&saved.refresh_token&&Number.isFinite(saved.expires_at))this.session=saved;
    }catch{}
  }
  configure(url,key){
    const next=validateCloudConfig({url,key});
    this.stopAuto();
    if(this.config?.url!==next.url || this.config?.key!==next.key){
      if(this.config) this.sessionPrefs?.removeItem(this.configSessionKey());
      this.session=null;
    }
    this.config=next;this.prefs?.setItem(CONFIG_KEY,JSON.stringify(next));this.loadSession();
    this.status("Public vault endpoint saved locally. No private content was uploaded.");
  }
  clearConfig(){
    this.stopAuto();
    if(this.config)this.sessionPrefs?.removeItem(this.configSessionKey());
    this.config=null;this.session=null;this.prefs?.removeItem(CONFIG_KEY);
  }
  get signedIn(){return !!(this.session?.user?.id && this.config);}
  get userEmail(){return this.session?.user?.email||"";}
  get baseline(){
    if(!this.signedIn)return null;
    try{
      const value=JSON.parse(this.prefs?.getItem(this.baselineKey())||"null");
      return value && (value.remoteRevision===null||isUUID(value.remoteRevision)) && typeof value.localRevision==="string" ? value : null;
    }catch{return null;}
  }
  rememberBaseline(remoteRevision,localRevision){
    if(!(remoteRevision===null||isUUID(remoteRevision)) || typeof localRevision!=="string")
      throw Error("Invalid synchronization baseline.");
    this.prefs?.setItem(this.baselineKey(),JSON.stringify({remoteRevision,localRevision}));
  }
  async request(path,{method="GET",body=null,authenticated=true,raw=false,contentType="application/json"}={}){
    if(!this.config)throw Error("Configure the public vault endpoint first.");
    const headers={apikey:this.config.key};
    if(authenticated)headers.Authorization="Bearer "+(await this.getToken());
    if(body!==null && contentType)headers["Content-Type"]=contentType;
    const response=await this.fetcher(this.config.url+path,{method,headers,body:body===null?undefined:
      typeof body==="string" || body instanceof Blob?body:JSON.stringify(body),cache:"no-store"});
    if(raw){
      if(!response.ok)await decodeResponse(response);
      return response;
    }
    return decodeResponse(response);
  }
  async sendLoginCode(email){
    if(typeof email!=="string"||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw Error("Enter a valid email address.");
    await this.request("/auth/v1/otp",{method:"POST",body:{email,create_user:true},authenticated:false});
    this.status("A sign-in email was requested. Enter the one-time code sent by the configured Auth email template.");
  }
  async confirmLoginCode(email,token){
    if(typeof token!=="string"||!/^\d{6,8}$/.test(token))throw Error("Enter the numerical email one-time code.");
    const data=await this.request("/auth/v1/verify",{method:"POST",body:{email,token,type:"email"},authenticated:false});
    this.acceptSession(data);
    await this.verifyUser();
    this.status("Authenticated to private vault as "+this.userEmail+". Nothing synced until explicitly enabled.");
    return this.session.user;
  }
  acceptSession(data){
    if(!data?.access_token||!data?.refresh_token||!isUUID(data?.user?.id))
      throw Error("Provider did not return a valid authenticated session.");
    this.session={access_token:data.access_token,refresh_token:data.refresh_token,
      expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600),
      user:{id:data.user.id,email:data.user.email||""}};
    this.sessionPrefs?.setItem(this.configSessionKey(),JSON.stringify(this.session));
  }
  async getToken(){
    if(!this.session)throw Error("Sign in to your private vault first.");
    if(this.session.expires_at < Date.now()/1000+90){
      if(!this.refreshPromise)this.refreshPromise=this.refresh().finally(()=>{this.refreshPromise=null;});
      await this.refreshPromise;
    }
    return this.session.access_token;
  }
  async refresh(){
    try{
      const res=await this.request("/auth/v1/token?grant_type=refresh_token",{
        method:"POST",body:{refresh_token:this.session.refresh_token},authenticated:false});
      this.acceptSession(res);
    }catch(e){
      this.stopAuto();this.session=null;this.sessionPrefs?.removeItem(this.configSessionKey());
      throw Error("Cloud sign-in expired. Request a new email code. "+e.message);
    }
  }
  async verifyUser(){
    const data=await this.request("/auth/v1/user");
    if(!isUUID(data?.id)||data.id!==this.session?.user.id){
      this.stopAuto();
      throw Error("Cloud account identity mismatch; sign in again.");
    }
    return data;
  }
  async signOut(){
    this.stopAuto();
    if(this.session){
      try{await this.request("/auth/v1/logout",{method:"POST"});}catch{}
      this.sessionPrefs?.removeItem(this.configSessionKey());
    }
    this.session=null;this.status("Signed out. Local workspace and encrypted remote data remain intact.");
  }
  async getHead(){
    await this.verifyUser();
    const list=await this.request("/rest/v1/mcgruber_sync_heads?select=revision,object_path,size_bytes,updated_at&limit=1");
    if(!Array.isArray(list)||list.length>1)throw Error("Unexpected cloud head response.");
    if(!list.length)return null;
    const head=list[0];
    if(!isUUID(head.revision)||typeof head.object_path!=="string"||
       !head.object_path.startsWith(this.session.user.id+"/")||head.size_bytes>MAX_CLOUD_BYTES)
      throw Error("Invalid or unauthorized private vault snapshot.");
    return head;
  }
  async downloadEncrypted(head){
    if(!head)throw Error("No remote snapshot exists.");
    const path=encodeURIComponent(head.object_path).replace(/%2F/gi,"/");
    const response=await this.request("/storage/v1/object/authenticated/mcgruber-private/"+path,{raw:true});
    const size=Number(response.headers?.get?.("content-length"));
    if(size>MAX_CLOUD_BYTES)throw Error("Remote encrypted backup is too large.");
    const content=await response.text();
    if(content.length>MAX_CLOUD_BYTES)throw Error("Remote encrypted backup is too large.");
    return content;
  }
  async downloadPlaintext(passphrase){
    const head=await this.getHead();
    if(!head)throw Error("No cloud backup exists for this account.");
    const envelope=await this.downloadEncrypted(head);
    return {head,plaintext:await decryptTransfer(envelope,passphrase,this.cryptoApi),envelope};
  }
  async push(backupText,passphrase,localRevision){
    if(this.inFlight)return this.inFlight;
    const operation=this.pushInner(backupText,passphrase,localRevision);
    this.inFlight=operation;
    try{return await operation;}finally{this.inFlight=null;}
  }
  async pushInner(backupText,passphrase,localRevision){
    if(typeof localRevision!=="string"||!localRevision)throw Error("Save your workspace locally before cloud sync.");
    const base=this.baseline;
    const remote=await this.getHead();
    const actual=metaRevision(remote);
    // A never-seen remote head must first be explicitly restored/accepted,
    // even when its contents may resemble this device's inventory.
    if(actual !== (base?.remoteRevision??null))throw new RemoteConflictError();
    if(base?.remoteRevision && !remote)throw new RemoteConflictError();
    const encrypted=await encryptTransfer(backupText,passphrase,this.cryptoApi);
    const byteLength=new TextEncoder().encode(encrypted).byteLength;
    if(byteLength>MAX_CLOUD_BYTES)throw Error("Encrypted cloud backup exceeds 30 MB. Use a local encrypted export, reduce media or provision an approved larger backend.");
    const newRevision=this.cryptoApi.randomUUID(),objectPath=this.session.user.id+"/"+this.cryptoApi.randomUUID()+".mcgruber";
    const objectURL="/storage/v1/object/mcgruber-private/"+objectPath;
    // Uploaded objects are immutable. A failed CAS leaves an encrypted orphan,
    // not a replaced live snapshot; the head always remains authoritative.
    const upload=await this.request(objectURL,{method:"POST",body:new Blob([encrypted],{type:"application/octet-stream"}),
      contentType:"application/octet-stream"});
    if(!upload)throw Error("Encrypted upload had no acknowledgment.");
    const response=await this.request("/rest/v1/rpc/mcgruber_commit_snapshot",{method:"POST",
      body:{p_expected_revision:actual,p_new_revision:newRevision,p_object_path:objectPath,p_size_bytes:byteLength}});
    if(!Array.isArray(response)||response[0]?.revision!==newRevision)throw Error("Private vault did not confirm commit.");
    this.rememberBaseline(newRevision,localRevision);
    this.lastUploadAt=Date.now();
    this.status("Encrypted cloud snapshot saved. Local backup and prior cloud head were protected.");
    return response[0];
  }
  acceptPulled(head,localRevision){
    if(!head||!isUUID(head.revision))throw Error("Unknown remote snapshot.");
    this.rememberBaseline(head.revision,localRevision);
    this.status("Encrypted cloud snapshot restored to this device. Future uploads must still pass revision conflict checks.");
  }
  enableAuto(passphrase,readCurrent){
    if(!this.signedIn)throw Error("Sign in first.");
    if(!this.baseline?.remoteRevision)throw Error("First create a cloud snapshot or restore the existing one. Then enable auto-sync.");
    if(typeof readCurrent!=="function")throw Error("Workspace reader required.");
    this.stopAuto();
    this.autoPass=passphrase;
    this.readCurrent=readCurrent;
    this.status("Automatic sync enabled for this open tab only; passphrase remains in memory.");
  }
  stopAuto(){
    if(this.timer!==null)clearTimeout(this.timer);
    this.timer=null;this.autoPass=null;this.readCurrent=null;
  }
  scheduleAfterLocalSave(){
    if(!this.autoPass || !this.readCurrent)return;
    if(this.timer!==null)clearTimeout(this.timer);
    const delay=Math.max(45000, (this.lastUploadAt+10*60*1000)-Date.now());
    this.timer=setTimeout(async()=>{
      this.timer=null;
      if(!this.autoPass||!this.readCurrent)return;
      const current=this.readCurrent();
      try{
        const {text,revision}=await current;
        if(!this.autoPass)return;
        await this.push(text,this.autoPass,revision);
      }catch(error){
        this.stopAuto();
        this.status("Automatic sync PAUSED: "+error.message);
      }
    },delay);
  }
  async pruneOld(){
    const head=await this.getHead();
    const user=this.session.user.id,keep=head?.object_path;
    const records=await this.request("/storage/v1/object/list/mcgruber-private",{
      method:"POST",body:{prefix:user+"/",limit:100,sortBy:{column:"created_at",order:"asc"}}});
    if(!Array.isArray(records))throw Error("Storage cleanup listing failed.");
    const oldest=Date.now()-24*60*60*1000;
    const candidate=records.filter(x=>x?.name &&
       isUUID(String(x.name).replace(/\.mcgruber$/,"")) &&
       Date.parse(x.created_at)<oldest &&
       user+"/"+x.name!==keep
    ).slice(0,50).map(x=>user+"/"+x.name);
    if(!candidate.length)return 0;
    await this.request("/storage/v1/object/mcgruber-private",{
      method:"DELETE",body:{prefixes:candidate}});
    this.status("Removed "+candidate.length+" old, unreferenced encrypted snapshot objects.");
    return candidate.length;
  }
}
