import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  focus, opportunityList, projectOpportunity,
  diagnosticProtocol, availableLeadCount,
} from "../src/workshop-intelligence.js";
import { projectWorkbookText, diagnosticWorkbookText } from "../src/workshop.js";

const catalog = JSON.parse(await readFile(new URL("../public/catalog.json", import.meta.url), "utf8"));
const workspace = () => ({inventory:[],records:[]});

test("every original project is planned with documentary leads, not made-up measurements", () => {
  const results = opportunityList(catalog,workspace());
  assert.equal(results.length,9);
  assert.deepEqual(results.map((r) => r.plan.priority), [1,2,3,4,5,6,7,8,9]);
  assert.deepEqual(Object.keys(focus).sort(),catalog.projects.map((p)=>p.id).sort());
  assert.ok(results.every((r) => r.covered === 0));
  assert.ok(results.every((r) => r.displayStatus === "Planning / identification only"));
  assert.ok(results.every((r) => r.related.every((m) => !m.subassemblyOf)));
  assert.ok(results.every((r) => r.total > 0));
  assert.equal(availableLeadCount(catalog,workspace()),0);
});

test("Rev 4 PDF references are leads; local import alone never promotes evidence", () => {
  const w=workspace();
  const before=projectOpportunity(catalog,w,"P04");
  assert.ok(before.related.some((p)=>p.id==="REF-08"));
  w.inventory.push({id:"PART-test",name:"Mouse #2",sourceReferenceId:"REF-08",quantity:"1 group",status:"Owned",projects:[],requirementIds:[],test:{result:"Not tested"}});
  const after=projectOpportunity(catalog,w,"P04");
  assert.equal(after.recorded.length,1);
  assert.equal(after.covered,0);
  assert.equal(after.needTests.length,0);
  assert.equal(after.missing.length,before.missing.length);
  const workbook=projectWorkbookText(after);
  assert.match(workbook,/NOT verified compatible/);
  assert.match(workbook,/No proven category test/);
  assert.doesNotMatch(workbook,/Physical device confirmed working/);
});

test("explicit association and actual recorded test count only for associated requirement",()=>{
  const w=workspace(),r=projectOpportunity(catalog,w,"P04").requirements[0];
  w.inventory.push({id:"PART-001",name:"Candidate",sourceReferenceId:"REF-08",quantity:"1",status:"Owned",projects:["P04"],requirementIds:[r.id],test:{result:"Not tested"}});
  let result=projectOpportunity(catalog,w,"P04");
  assert.equal(result.covered,0);
  assert.equal(result.needTests.length,1);
  w.inventory[0].test={result:"Pass",method:"User test",instrument:"Actual meter",expected:"Test criterion",observed:"User measurements logged",date:"2026-10-24T12:00:00Z"};
  result=projectOpportunity(catalog,w,"P04");
  assert.equal(result.covered,1);
  assert.match(result.displayStatus,/Partial category test evidence/);
  assert.match(projectWorkbookText(result),/Recorded passing category test/);
  assert.match(projectWorkbookText(result),/not a verified build/);
});

test("diagnostic checklists prohibit powered guessing and distinguish remote RF from IR",()=>{
  for(const item of catalog.rev4Inventory.items){
    const info=diagnosticProtocol(item);
    assert.equal(info.id,item.id);
    assert.equal(info.steps.length,5);
    assert.match(info.steps.join(" "),/Disconnect/);
    assert.match(diagnosticWorkbookText(info),/No automated part identification/);
  }
  assert.match(diagnosticProtocol(catalog.rev4Inventory.items.find(x=>x.id==="REF-08")).safety,/rechargeable cell/i);
  assert.match(diagnosticProtocol(catalog.rev4Inventory.items.find(x=>x.id==="REF-02")).safety,/telephone line/);
  assert.match(diagnosticProtocol(catalog.rev4Inventory.items.find(x=>x.id==="REF-11")).technique,/Unknown assembly/);
  assert.match(diagnosticProtocol(catalog.rev4Inventory.items.find(x=>x.id==="REF-10")).technique,/noninvasively/);
  assert.equal(diagnosticProtocol(null),null);
});
