import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assessPower, projectMatches, validateSalvage, teardownSteps } from "../src/salvage-core.js";
import { freshWorkspace, validateWorkspace, validateRecord } from "../src/core.js";
const part=()=>({id:"PART-test",name:"Teaching DC assembly",kind:"board",status:"Salvaged",quantity:"1",projects:[],requirementIds:["C04"],electrical:{minV:"3",maxV:"5.5",runMa:"50",peakMa:"100",positive:"V+ documented",negative:"GND documented",evidence:"Unit fixture; not a real hardware rating"}});
const plan=()=>({id:"POWER-test",partId:"PART-test",sourceKind:"aa-holder",sourceName:"Teaching supply",sourceEvidence:"Fixture supply specification",sourceMinV:"3.2",sourceMaxV:"4.8",sourceCurrentMa:"300",topology:"direct",polarityChecked:true,supportChecked:false,sourceProtected:true,notes:"Fixture: protected holder, disconnect switch, current-limited first test."});
test("all donor routes preserve isolation instructions and model-specific unknowns",()=>{
  for(const kind of ["mouse","corded-phone","cordless-phone","other"])assert.equal(teardownSteps(kind).length,6);
  assert.match(teardownSteps("corded-phone")[1],/telephone wall line/);
  assert.match(teardownSteps("mouse")[1],/Unplug USB/);
});
test("power planner blocks unknown parts and passive switches from direct battery use",()=>{
  assert.notEqual(assessPower(null,{}).status,"candidate");
  for(const kind of ["unknown","switch","mechanical"]){const p=part();p.kind=kind;assert.notEqual(assessPower(p,plan()).status,"candidate");}
  assert.match(assessPower({...part(),kind:"switch"},plan()).issues.join(" "),/across its contacts/);
});
test("power plan compares the complete source range and peak current, never just nominal voltage",()=>{
  assert.equal(assessPower(part(),plan()).status,"candidate");
  for(const delta of [{sourceMaxV:"6.4"},{sourceMinV:"2"},{sourceCurrentMa:"80"},{polarityChecked:false},{sourceProtected:false},{notes:""},{sourceMinV:" "},{sourceEvidence:""}])
    assert.notEqual(assessPower(part(),{...plan(),...delta}).status,"candidate",JSON.stringify(delta));
  assert.equal(assessPower(part(),{...plan(),sourceMinV:"6",sourceMaxV:"8"}).topology,"buck");
  assert.equal(assessPower(part(),{...plan(),sourceMinV:"1",sourceMaxV:"2"}).topology,"boost");
  assert.equal(assessPower(part(),{...plan(),sourceMinV:"2",sourceMaxV:"6"}).topology,"buck-boost");
});
const conversion=()=>({...plan(),topology:"boost",sourceCurrentMa:"500",sourceMinV:"2",sourceMaxV:"2.8",inputMinV:"1.8",inputMaxV:"3",outputMinV:"4.8",outputMaxV:"5.2",outputCurrentMa:"150",efficiency:"0.8",regulatorName:"Fixture converter",regulatorEvidence:"Operating input/output limits at low input"});
test("conversion checks regulator tolerance, operating input and battery-side peak current",()=>{
  const p=part(),s=conversion();
  assert.equal(assessPower(p,s).status,"candidate");
  assert.notEqual(assessPower(p,{...s,sourceCurrentMa:"200"}).status,"candidate"); // 325 mA input required
  for(const delta of [{outputMaxV:"6"},{outputMinV:"2"},{inputMinV:"2.2"},{outputCurrentMa:"50"},{efficiency:"1.1"},{regulatorEvidence:""},{topology:"buck"}])
    assert.notEqual(assessPower(p,{...s,...delta}).status,"candidate",JSON.stringify(delta));
});
test("LED, motor and audio paths require an identified supporting circuit",()=>{
  for(const kind of ["led","motor","audio"]){const p={...part(),kind};assert.notEqual(assessPower(p,plan()).status,"candidate");assert.equal(assessPower(p,{...plan(),supportChecked:true}).status,"candidate");}
  const p=part();p.electrical.peakMa="20";assert.notEqual(assessPower(p,plan()).status,"candidate");
  assert.notEqual(assessPower(part(),{...plan(),sourceMaxV:"48"}).status,"candidate");
});
test("energy runtime respects capacity voltage and conversion losses and stays optional",()=>{
  const p=part(),s={...conversion(),capacityMah:"1000",nominalV:"2.4",usable:"0.7"};
  assert.ok(Math.abs(assessPower(p,s).runtimeHours-1000*2.4*0.7*0.8/(50*5.2))<1e-9);
  assert.equal(assessPower(p,plan()).runtimeHours,null);
  assert.equal(assessPower(p,{...s,nominalV:"3.7"}).runtimeHours,null);
});
test("live matching requires explicit associations, available quantity and recorded passing evidence",async()=>{
  const catalog=JSON.parse(await readFile(new URL("../public/catalog.json",import.meta.url)));
  const p=part();
  const row=(inv)=>projectMatches(catalog,inv).find((m)=>m.project.id==="P04").requirements.find((r)=>r.id==="C04");
  assert.equal(row([]).state,"missing");
  assert.equal(row([p]).state,"needs-test");
  p.test={result:"Pass",method:"Isolated contact map",instrument:"Fixture meter",expected:"Contacts change",observed:"Fixture reading",date:"2026-10-24T12:00:00Z"};
  assert.equal(row([p]).state,"tested");
  for(const delta of [{requirementIds:[]},{quantity:"0"},{status:"Needed"}])assert.equal(row([{...p,...delta}]).state,"missing");
  p.test.result="Fail";assert.equal(row([p]).state,"needs-test");
});
test("salvage backup rejects dangling references, malformed labels, ratings and unsupported power plans",()=>{
  const w=freshWorkspace();w.inventory=[part()];
  w.salvage={devices:[{id:"DEVICE-test",name:"Donor",kind:"mouse",isolated:false,steps:[],photos:[{id:"photo",mediaId:"media",annotations:[{id:"label",label:"switch",x:0.5,y:0.5,partId:"PART-test"}]}]}],plans:[plan()]};
  assert.doesNotThrow(()=>validateWorkspace(w));
  for(const mutate of [x=>x.inventory[0].sourceDeviceId="missing",x=>x.salvage.devices[0].photos[0].annotations[0].x=2,x=>x.salvage.plans[0].partId="missing",x=>x.inventory[0].electrical.minV="unknown",x=>x.salvage.plans[0].sourceKind="loose-cell",x=>x.inventory[0].test={result:"Pass"}]){
    const invalid=structuredClone(w);mutate(invalid);assert.throws(()=>validateSalvage(invalid));
  }
});
test("backup validation rejects malformed drafts while allowing incomplete, structurally valid work",()=>{
  const w=freshWorkspace();
  w.draftRecord={id:"draft",name:"",project:"P04",evidence:"Physically measured result",date:"2026-10-24T12:00:00Z",trial:0,attachments:[],result:"Not tested"};
  assert.doesNotThrow(()=>validateWorkspace(w));
  for(const mutate of [x=>x.date="invalid",x=>delete x.date,x=>x.attachments=null,x=>x.configuration=[],x=>x.trial=-1]){
    const invalid=structuredClone(w);mutate(invalid.draftRecord);assert.throws(()=>validateWorkspace(invalid));
  }
  for(const key of ["progress","simulations","circuit"]){const bad=freshWorkspace();bad[key]=[];assert.throws(()=>validateWorkspace(bad));}
});
test("shared record validation enforces evidence separation for forms and backups",()=>{
  const r={id:"record",name:"Test",project:"P04",evidence:"Simulation data",result:"Pass",attachments:[]};
  assert.doesNotThrow(()=>validateRecord(r));
  for(const delta of [{voltage:0},{current:"5"},{instrument:"Meter"}])assert.throws(()=>validateRecord({...r,...delta}),/Simulation/);
  const measured={...r,evidence:"Physically measured result",voltage:"4.9",instrument:"Fixture meter",observations:"Fixture only",criteria:"Test condition"};
  assert.doesNotThrow(()=>validateRecord(measured));
  for(const key of ["instrument","observations","criteria","voltage"])assert.throws(()=>validateRecord({...measured,[key]:""}));
  assert.throws(()=>validateRecord({...measured,evidence:"Independently reproduced result"}),/attached/);
});
