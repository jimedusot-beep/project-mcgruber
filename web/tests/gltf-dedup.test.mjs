import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { validateGlbHeader, bytesReport, dedupGlb } from "../scripts/gltf-dedup.mjs";
const fixture = (size=20) => {
  const data=Buffer.alloc(size);
  data.writeUInt32LE(0x46546c67,0);
  data.writeUInt32LE(2,4);
  data.writeUInt32LE(size,8);
  return data; // Minimal HEADER test fixture, not full valid GLB content.
};
test("GLB header and conservative size report reject invalid bytes",()=>{
  assert.equal(validateGlbHeader(fixture(),20),20);
  assert.throws(()=>validateGlbHeader(fixture(),18),/Invalid GLB/);
  const wrong=fixture();wrong.writeUInt32LE(1,4);
  assert.throws(()=>validateGlbHeader(wrong,20),/Invalid GLB/);
  assert.deepEqual(bytesReport(200,100),{
    beforeBytes:200,afterBytes:100,savedBytes:100,savedPercent:50,smaller:true,withinMobileLimit:true
  });
  assert.equal(bytesReport(100,120).smaller,false);
});
test("non-destructive dedup wrapper passes exact argument array; no shell and no overwrites",async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),"mcgruber-glb-"));
  try {
    const input=path.join(directory,"before.glb"),output=path.join(directory,"after.glb");
    const orig=fixture(24);await writeFile(input,orig);
    let called=0;
    const run=(binary,args,options)=>{
      called++;
      assert.equal(binary,"gltf-transform");
      assert.deepEqual(args,["dedup",input,output]);
      assert.equal(options.encoding,"utf8");
      // Fake CLI execution so tests do NOT claim real optimization.
      writeFileSync(output,fixture(20));
      return {status:0};
    };
    // Runner is sync, imported in this test only; no external executable used.
    const report=await dedupGlb(input,output,run);
    assert.equal(called,1);
    assert.equal(report.savedBytes,4);
    assert.deepEqual(await readFile(input),orig);
    await assert.rejects(dedupGlb(input,input,run),/overwrite/);
    await assert.rejects(dedupGlb(input,output,run),/already exists/);
    assert.equal(called,1);
  } finally {await rm(directory,{recursive:true,force:true});}
});
