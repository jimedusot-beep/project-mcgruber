import test from "node:test";
import assert from "node:assert/strict";
import { analyzeContacts, exportContactCsv } from "../public/switch-bench/switch-core.mjs";
const spdt={
 "A-B":{released:"closed",pressed:"open"},
 "A-C":{released:"open",pressed:"closed"},
 "B-C":{released:"open",pressed:"open"},
};
test("three-terminal contact analysis identifies common NC and NO from observed states only",()=>{
 const a=analyzeContacts(3,spdt);
 assert.equal(a.status,"candidate");
 assert.deepEqual(a.map,{COM:"A",NC:"B",NO:"C",releasedClosed:"A-B",pressedClosed:"A-C"});
 assert.equal(analyzeContacts(3,{}).status,"incomplete");
});
test("mapping handles alternate orientation, two-terminal NC and NO without assuming COM",()=>{
 const alt={"A-B":{released:"open",pressed:"open"},"A-C":{released:"closed",pressed:"open"},"B-C":{released:"open",pressed:"closed"}};
 assert.deepEqual(analyzeContacts(3,alt).map,{COM:"C",NC:"A",NO:"B",releasedClosed:"A-C",pressedClosed:"B-C"});
 assert.equal(analyzeContacts(2,{"A-B":{released:"closed",pressed:"open"}}).map.contact,"normally closed (NC)");
 assert.equal(analyzeContacts(2,{"A-B":{released:"open",pressed:"closed"}}).map.contact,"normally open (NO)");
});
test("invalid, unchanging and conflicting readings are not declared mapped",()=>{
 for(const v of [
 {"A-B":{released:"closed",pressed:"closed"},"A-C":{released:"open",pressed:"open"},"B-C":{released:"open",pressed:"open"}},
 {"A-B":{released:"closed",pressed:"closed"},"A-C":{released:"closed",pressed:"open"},"B-C":{released:"open",pressed:"open"}},
 {"A-B":{released:"open",pressed:"open"},"A-C":{released:"open",pressed:"open"},"B-C":{released:"open",pressed:"open"}},
 ])assert.equal(analyzeContacts(3,v).status,"ambiguous");
 assert.equal(analyzeContacts(2,{"A-B":{released:"open",pressed:"open"}}).status,"ambiguous");
 assert.throws(()=>analyzeContacts(4,{}),/two or three/);
 assert.throws(()=>analyzeContacts(3,{"A-B":{released:"maybe"}}),/Readings must/);
});
test("CSV includes uncertainty and escapes spreadsheet injection in entered notes",()=>{
 const csv=exportContactCsv({terminals:3,readings:spdt,tester:"Tester",instrument:"Fluke continuity (owner-entered)",notes:'=HYPERLINK("evil")',cycles:Array(10).fill(false)});
 assert.equal(csv.split("\r\n").filter(Boolean).length,14);
 assert.ok(csv.includes("OWNER_ENTERED_UNVERIFIED"));
 assert.ok(csv.includes("'=HYPERLINK"));
 assert.ok(csv.includes('"not_reported"'));
 assert.ok(!csv.includes('"=HYPERLINK'));
});
