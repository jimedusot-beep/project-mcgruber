// Portable encrypted, *manual* backup transfer. Never sends data or secrets to a server.
// Uses authenticated AES-256-GCM with PBKDF2-HMAC-SHA-256 and fresh random salt/IV.
// This is not cloud sync, account login, password recovery, or automated merge.
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8",{fatal:true});
const aad = encoder.encode("mcgruber-lab-encrypted-backup:v1");
const iterations = 310000;
const minLength = 12;
const maxPlain = 100 * 1024 * 1024;
const maxEnvelope = 150 * 1024 * 1024;
const valid = o=>o && typeof o==="object" && !Array.isArray(o);
function cryptoProvider(provider){
  if(!provider?.subtle?.deriveKey || !provider?.getRandomValues)
    throw Error("Encrypted backups require a secure browser with WebCrypto support.");
  return provider;
}
function secret(pass){
  if(typeof pass!=="string" || pass.length<minLength || pass.length>256)
    throw Error("Use a unique transfer passphrase between 12 and 256 characters.");
  return pass;
}
function b64(bytes){
  const chunks=[];
  for(let i=0;i<bytes.byteLength;i+=32768)
    chunks.push(String.fromCharCode(...bytes.subarray(i,i+32768)));
  return btoa(chunks.join(""));
}
function unb64(text,max){
  if(typeof text!=="string"||text.length>Math.ceil(max*4/3)+16||
     !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text))
    throw Error("Invalid encrypted backup encoding.");
  const raw=atob(text);
  const out=Uint8Array.from(raw,c=>c.charCodeAt(0));
  if(out.byteLength>max)throw Error("Encrypted backup exceeds size limit.");
  return out;
}
async function key(pass,salt,provider){
  const subtle=provider.subtle;
  const imported=await subtle.importKey("raw",encoder.encode(secret(pass)),"PBKDF2",false,["deriveKey"]);
  return subtle.deriveKey({name:"PBKDF2",salt,iterations,hash:"SHA-256"},imported,
    {name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
export async function encryptTransfer(backup,passphrase,provider=globalThis.crypto){
  const crypto=cryptoProvider(provider);
  if(typeof backup!=="string" || !backup.length || encoder.encode(backup).length>maxPlain)
    throw Error("Backup exceeds 100 MB or is empty.");
  // Only encrypt McGruber full backups; no unrelated input/secret files.
  const parsed=JSON.parse(backup);
  if(parsed?.application!=="mcgruber-lab" || parsed?.version!==1)
    throw Error("Select a valid full McGruber backup.");
  const salt=crypto.getRandomValues(new Uint8Array(16)),
    iv=crypto.getRandomValues(new Uint8Array(12));
  const derived=await key(passphrase,salt,crypto);
  const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:aad},
    derived,encoder.encode(backup));
  return JSON.stringify({
    application:"mcgruber-lab-encrypted",version:1,
    kdf:"PBKDF2-HMAC-SHA-256",iterations,
    cipher:"AES-256-GCM",salt:b64(salt),iv:b64(iv),
    ciphertext:b64(new Uint8Array(encrypted)),
  });
}
export async function decryptTransfer(content,passphrase,provider=globalThis.crypto){
  const crypto=cryptoProvider(provider);
  secret(passphrase);
  if(typeof content!=="string" || !content.length || content.length>maxEnvelope)
    throw Error("Encrypted backup exceeds 150 MB or is empty.");
  let parsed;
  try{parsed=JSON.parse(content);}catch{throw Error("Invalid encrypted backup file.");}
  if(!valid(parsed) || parsed.application!=="mcgruber-lab-encrypted" || parsed.version!==1 ||
     parsed.kdf!=="PBKDF2-HMAC-SHA-256" || parsed.iterations!==iterations ||
     parsed.cipher!=="AES-256-GCM")
    throw Error("Unsupported encrypted McGruber backup.");
  const salt=unb64(parsed.salt,16),iv=unb64(parsed.iv,12);
  if(salt.length!==16||iv.length!==12)throw Error("Invalid encrypted backup header.");
  const bytes=unb64(parsed.ciphertext,maxPlain+16);
  if(bytes.length<17)throw Error("Invalid encrypted backup payload.");
  try{
    const derived=await key(passphrase,salt,crypto);
    const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv,additionalData:aad},derived,bytes);
    const out=decoder.decode(plain);
    const data=JSON.parse(out);
    if(data?.application!=="mcgruber-lab" || data?.version!==1)
      throw Error("Invalid decrypted workspace.");
    return out;
  }catch{throw Error("Unable to decrypt: incorrect passphrase or modified backup.");}
}
