import test from "node:test";
import assert from "node:assert/strict";
import {gadgetReferences, gadgetCategories,validateGadgetReferences,filterGadgets,gadgetWorksheet} from "../src/gadget-references.js";

test("all thirteen ideas remain separate research concepts, not automatically owned parts",()=>{
 assert.equal(gadgetReferences.length,13);
 assert.deepEqual(gadgetReferences.map(x=>x.id),
   Array.from({length:13},(_,i)=>"G"+String(i+1).padStart(2,"0")));
 assert.equal(validateGadgetReferences(),true);
 assert.equal(gadgetCategories.length,5);
 assert.equal(gadgetReferences.filter(x=>x.priority==="Start").length,6);
 assert.equal(gadgetReferences.filter(x=>x.priority==="Later").length,7);
 for(const g of gadgetReferences){
   assert.ok(g.sources.length);
   assert.ok(g.ingredients.length>=3);
   assert.ok(g.limits.length>40);
   assert.match(gadgetWorksheet(g),/Research inspiration only/);
   assert.match(gadgetWorksheet(g),/NOT an approved bill of materials/);
   assert.match(gadgetWorksheet(g),/No firmware, transmitter, interface or physical tests/);
 }
});
test("search and categories support research without claiming inventory ownership",()=>{
 assert.equal(filterGadgets().length,13);
 assert.equal(filterGadgets({group:"Mechanical security"}).length,2);
 assert.equal(filterGadgets({priority:"Start"}).length,6);
 assert.ok(filterGadgets({query:"esp32"}).length>=5);
 assert.deepEqual(filterGadgets({query:"Rayhunter"}).map(g=>g.id),["G05"]);
 assert.deepEqual(filterGadgets({query:"padlock"}).map(g=>g.id),["G13"]);
 assert.throws(()=>gadgetWorksheet({id:"G99"}),/Unknown gadget/);
 assert.throws(()=>validateGadgetReferences([...gadgetReferences.slice(0,12),gadgetReferences[0]]),/Duplicate/);
});
test("technical safety qualifications are present at individual device level",()=>{
 const get=n=>gadgetReferences.find(x=>x.id===n);
 assert.match(get("G05").limits,/not a generic ESP32/i);
 assert.match(get("G08").limits,/does not transmit/i);
 assert.match(get("G09").limits,/transmission and signal replay require explicit authorization/i);
 assert.match(get("G12").limits,/permission/i);
 assert.match(get("G07").limits,/driver/i);
 assert.match(get("G02").limits,/does not establish a skimmer/i);
 assert.match(get("G06").limits,/not a documented built-in IR receiver/i);
 assert.match(get("G03").limits,/makeshift high-temperature soldering iron/i);
});
