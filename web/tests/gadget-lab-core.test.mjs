import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {freshWorkspace,validateWorkspace,validateRecord} from "../src/core.js";
import {LAB_IDS,GADGET_LABS,getLab,labChecklist,runGadgetLab,freshGadgetLabs,validateGadgetLabs,setReview,progressFor,labWorksheet} from "../src/gadget-lab-core.js";

test("six distinct starting concepts, including ESP32, BLE, SDR and repair, each have unique readiness gates",()=>{
 assert.deepEqual([...LAB_IDS].sort(),["G02","G03","G04","G06","G07","G08"]);
 assert.equal(GADGET_LABS.length,6);
 for(const lab of GADGET_LABS){
   assert.ok(LAB_IDS.includes(lab.id));
   assert.ok(lab.scenarios.length>=3);
   assert.ok(lab.checks.length>=7);
   assert.equal(new Set(lab.checks.map(c=>c.id)).size,lab.checks.length);
   assert.match(lab.caution,/not|does not|never|no /i);
   assert.equal(getLab(lab.id),lab);
 }
 assert.equal(getLab("G09"),null);
 assert.throws(()=>labChecklist("G09"),/Unknown/);
});
test("all scenario engines are deterministic, bounded and never claim actual sensing",()=>{
 for(const lab of GADGET_LABS)for(const [id] of lab.scenarios){
   const a=runGadgetLab(lab.id,id,50),b=runGadgetLab(lab.id,id,50);
   assert.deepEqual(a,b);
   assert.ok(a.samples.length>=4);
   for(const s of a.samples){
     assert.ok(Number.isFinite(s.value) && s.value>=0 && s.value<=100);
     assert.equal(typeof s.active,"boolean");
     assert.ok(s.note);
   }
   assert.match(a.caution,/not|does not|never|no /i);
   assert.ok(a.finding);
 }
 const esp=runGadgetLab("G07","door");
 assert.match(esp.headline,/virtual events/i);
 assert.ok(esp.samples.some(s=>s.note==="Virtual rising edge"));
 assert.match(runGadgetLab("G04","rotating").finding,/does not establish/);
 assert.match(runGadgetLab("G08","fm").caution,/not local RF/i);
 assert.match(runGadgetLab("G02","ambiguous").headline,/confirmed: 0/);
 assert.match(runGadgetLab("G03","mismatch").samples[1].note,/stop/);
 assert.throws(()=>runGadgetLab("G01","anything"),/Unknown/);
 assert.throws(()=>runGadgetLab("G07","bad"),/Unknown fictional/);
 assert.throws(()=>runGadgetLab("G07","door",101),/Simulation setting/);
 assert.throws(()=>runGadgetLab("G07","door",NaN),/Simulation setting/);
});
test("checkmarks persist as reviewed only, cannot invent build qualification, reject malformed backups",()=>{
 const blank=freshGadgetLabs();
 assert.deepEqual(blank,{reviewed:{}});
 let current=setReview(blank,"G07","sources",true);
 current=setReview(current,"G07","driver",true);
 assert.equal(progressFor("G07",current).reviewed,2);
 assert.match(progressFor("G07",current).status,/no verified hardware/i);
 assert.equal(progressFor("G07",blank).reviewed,0);
 current=setReview(current,"G07","sources",false);
 assert.deepEqual(current.reviewed.G07,["driver"]);
 assert.deepEqual(blank,{reviewed:{}});
 assert.equal(validateGadgetLabs(current),current);
 assert.throws(()=>setReview(current,"G07","approve-gpio",true),/Unknown readiness checkpoint/);
 for(const bad of [
   {reviewed:{"G01":["sources"]}},{reviewed:{"G07":["sources","sources"]}},
   {reviewed:{"G07":["unsafe"]}},{reviewed:{"G07":"sources"}}, {reviewed:[]}
 ]) assert.throws(()=>validateGadgetLabs(bad),/Invalid/);
 const w=freshWorkspace();w.gadgetLabs=current;
 assert.deepEqual(validateWorkspace(w).gadgetLabs.reviewed.G07,["driver"]);
 const legacy={...freshWorkspace()};delete legacy.gadgetLabs;
 assert.deepEqual(validateWorkspace(legacy).gadgetLabs,{reviewed:{}});
 const bad={...freshWorkspace(),gadgetLabs:{reviewed:{"G07":["unlisted-test"]}}};
 assert.throws(()=>validateWorkspace(bad),/Invalid gadget review/);
});
test("readiness worksheets distinguish reviewed research from validated physical hardware",()=>{
 const reviewed=setReview(freshGadgetLabs(),"G08","receive",true);
 const text=labWorksheet("G08",reviewed);
 assert.match(text,/REVIEWED, NOT VERIFIED/);
 assert.match(text,/\[x\] Confirm compatible USB receiver/);
 assert.match(text,/RTL-SDR receive-only radio workbench/);
 assert.match(text,/No radio capture/);
 assert.throws(()=>labWorksheet("G10"),/Unknown/);
});
test("generated gadget evidence is a valid Notebook simulation, never physical readings",()=>{
 const lab=getLab("G02"),output=runGadgetLab("G02","routine");
 const record={id:"fixture",project:lab.project,name:lab.title,date:new Date().toISOString(),
   evidence:"Simulation data",result:"Not tested",trial:1,attachments:[],instrument:"",
   voltage:"",current:"",componentIds:"",criteria:"Synthetic Wi-Fi/BLE observations only",
   observations:output.finding,configuration:{
     source:"gadget-lab",samples:output.samples.map((s,i)=>({time:i*250,value:s.value,output:!!s.active}))
   }};
 assert.equal(validateRecord(record),record);
});
