import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { encryptTransfer, decryptTransfer } from "../src/secure-transfer.js";

const fixture=JSON.stringify({application:"mcgruber-lab",version:1,workspace:{inventory:[{name:"Private switch"}],deviceBrain:{rules:[]}},media:[]});
test("manual encrypted transfer roundtrips authenticated data and uses unique nonce/salt",async()=>{
 const pass="unique-safe-demo-passphrase";
 const a=JSON.parse(await encryptTransfer(fixture,pass,webcrypto));
 const b=JSON.parse(await encryptTransfer(fixture,pass,webcrypto));
 assert.equal(a.application,"mcgruber-lab-encrypted");
 assert.equal(a.cipher,"AES-256-GCM");
 assert.equal(a.kdf,"PBKDF2-HMAC-SHA-256");
 assert.equal(a.iterations,310000);
 assert.notEqual(a.iv,b.iv);
 assert.notEqual(a.salt,b.salt);
 assert.notEqual(a.ciphertext,b.ciphertext);
 assert.equal(await decryptTransfer(JSON.stringify(a),pass,webcrypto),fixture);
 await assert.rejects(decryptTransfer(JSON.stringify(a),"wrong-password-demo",webcrypto),/Unable to decrypt/);
});
test("modified metadata, bad version, truncated ciphertext and malformed data are rejected",async()=>{
 const pass="a-very-long-transfer-passphrase";
 const obj=JSON.parse(await encryptTransfer(fixture,pass,webcrypto));
 for(const x of [
  {...obj,iterations:1000},{...obj,version:2},{...obj,iv:obj.iv.slice(0,-2)},
  {...obj,ciphertext:obj.ciphertext.slice(0,-4)+"AAAA"},
  {...obj,salt:"<script>"}
 ])await assert.rejects(decryptTransfer(JSON.stringify(x),pass,webcrypto));
 await assert.rejects(decryptTransfer("not json",pass,webcrypto),/Invalid encrypted/);
 await assert.rejects(decryptTransfer(JSON.stringify(obj),"short",webcrypto),/passphrase/);
 await assert.rejects(encryptTransfer(fixture,"short",webcrypto),/passphrase/);
 await assert.rejects(encryptTransfer('{"application":"wrong","version":1}',pass,webcrypto),/valid full/);
 await assert.rejects(encryptTransfer(fixture,pass,{}),/secure browser/);
});
