import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {
  PARTS,PROJECTS,STATES,projectReadiness,checkLed,analyzeReceiverTriples
} from "../public/beam-detector/engineering-core.mjs";

test("nine projects refer to known, unique shared part identifiers",()=>{
  assert.equal(PROJECTS.length,9);
  assert.equal(new Set(PROJECTS.map(p=>p.id)).size,9);
  assert.equal(new Set(PARTS.map(p=>p.id)).size,PARTS.length);
  const ids=new Set(PARTS.map(p=>p.id));
  for(const p of PROJECTS){
    assert.ok(p.needs.length>=2);
    assert.equal(new Set(p.needs).size,p.needs.length);
    for(const id of [...p.needs,...p.optional])assert.ok(ids.has(id),p.id+" references unknown "+id);
  }
});
test("unverified parts never count as ready or as a completed device",()=>{
  for(const p of PROJECTS){
    const empty=projectReadiness(p,{});
    assert.equal(empty.ready,0);
    assert.equal(empty.unchecked,p.needs.length);
    assert.equal(empty.benchReady,false);
    const found=projectReadiness(p,Object.fromEntries(p.needs.map(k=>[k,"found-not-tested"])));
    assert.equal(found.ready,0);
    assert.equal(found.found,p.needs.length);
    assert.equal(found.benchReady,false);
    const all=projectReadiness(p,Object.fromEntries(p.needs.map(k=>[k,"electrically-verified"])));
    assert.equal(all.benchReady,true);
    assert.match(all.message,/tests.*required|qualification still required/i);
  }
});
test("LED calculator only returns ratings-qualified when ratings entered and respected",()=>{
 const example=checkLed({supplyV:9,forwardV:2,resistanceOhm:1000,ratingW:0.25});
 assert.equal(example.valid,true);
 assert.equal(example.currentmA,7);
 assert.ok(Math.abs(example.resistorWatts-0.049)<1e-12);
 assert.equal(example.qualified,false);
 assert.equal(example.ledWithinRating,null);
 const qualified=checkLed({supplyV:9,forwardV:2,resistanceOhm:1000,ratingW:0.25,ledRatedMaxmA:10});
 assert.equal(qualified.qualified,true);
 assert.equal(checkLed({supplyV:9,forwardV:2,resistanceOhm:1000,ratingW:0.01,ledRatedMaxmA:10}).qualified,false);
 assert.equal(checkLed({supplyV:9,forwardV:2,resistanceOhm:1000,ratingW:0.25,ledRatedMaxmA:5}).qualified,false);
 for(const value of [0,-4,NaN,Infinity]){
   assert.equal(checkLed({supplyV:9,forwardV:2,resistanceOhm:value,ratingW:.25}).valid,false);
 }
 assert.equal(checkLed({supplyV:4,forwardV:4,resistanceOhm:1000,ratingW:.25}).valid,false);
});
test("receiver worksheet requires ten full DC sample triples and labels results as screening",()=>{
  assert.equal(analyzeReceiverTriples([]).valid,false);
  const stable=Array.from({length:10},(_,i)=>({on:String(6+.1*i),blocked:String(.2+.02*i),restored:String(6+.1*i)}));
  const result=analyzeReceiverTriples(stable);
  assert.equal(result.valid,true);assert.equal(result.suggestsContrast,true);
  assert.equal(result.signConsistency,10);assert.equal(result.recoveryCount,10);
  assert.match(result.interpretation,/before claiming a working receiver/);
  const failing=stable.map(r=>({...r,on:r.blocked,restored:r.blocked}));
  assert.equal(analyzeReceiverTriples(failing).suggestsContrast,false);
  const missing=stable.map(r=>({...r}));missing[2].blocked="";
  assert.equal(analyzeReceiverTriples(missing).valid,false);
  const negative=stable.map(r=>({on:"-8.1",blocked:"-.2",restored:"-8.0"}));
  assert.equal(analyzeReceiverTriples(negative).suggestsContrast,true);
});
test("iPhone engineering page has all controls and public standalone source",async()=>{
  const base=fileURLToPath(new URL("../public/beam-detector/",import.meta.url));
  const [page,home,hub]=await Promise.all(["engineering-checks.html","index.html","engineering-hub.html"].map(p=>readFile(base+p,"utf8")));
  assert.match(page,/engineering-core\.mjs/);
  for(const id of ["project","parts","calc","samples","analyze","save","export","current","contrast"])assert.match(page,new RegExp('id="'+id+'"'));
  assert.match(home,/engineering-checks\.html/);
  assert.match(hub,/engineering-checks\.html/);
  assert.match(page,/not.*a working electronic device|does not establish a working electronic device/i);
});
