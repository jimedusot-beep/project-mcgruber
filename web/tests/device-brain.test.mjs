import test from "node:test";
import assert from "node:assert/strict";
import {
 makeRule, validateBrain, validateRule, initialInputs, stepBrain,
 makeRecipeExport, parseRecipeImport,
} from "../src/device-brain-core.js";
import { freshWorkspace, validateWorkspace } from "../src/core.js";

test("automation recipes validate every constrained field and reject unsafe inputs",()=>{
 const r=makeRule("AUTO-1"),brain={rules:[r]};
 assert.deepEqual(validateBrain(brain),brain);
 for(const wrong of [
   {name:""},{id:""},{enabled:"yes"},{debounce:0},{debounce:21},
   {hold:-1},{hold:41},{output:"gpio3"},{circuit:"javascript"},
   {projectId:"P10"},{combine:"xor"},
   {first:{input:"light",comparator:"eval",threshold:20}},
   {first:{input:"light",comparator:"below",threshold:Infinity}},
   {second:{input:"sensor",comparator:"above",threshold:10}},
 ])assert.throws(()=>validateRule({...r,...wrong}),JSON.stringify(wrong));
 assert.throws(()=>validateBrain({rules:[r,{...r}]}),/Duplicate/);
 assert.throws(()=>validateBrain({rules:Array.from({length:25},(_,i)=>makeRule("AUTO-"+i))}),/Invalid/);
});

test("virtual input rules debounce, latch temporarily, report edges and reset when disabled",()=>{
 const r={...makeRule("AUTO-A"),debounce:2,hold:2};
 const brain={rules:[r]},inputs=initialInputs();
 let state={};
 let x=stepBrain(brain,inputs,state);
 assert.equal(x.frames[0].active,false);state=x.state;
 inputs.contact=0;x=stepBrain(brain,inputs,state);
 assert.equal(x.frames[0].active,false);state=x.state;
 x=stepBrain(brain,inputs,state);assert.equal(x.frames[0].active,true);
 assert.equal(x.frames[0].rising,true);assert.equal(x.frames[0].events,1);state=x.state;
 inputs.contact=100;x=stepBrain(brain,inputs,state);
 assert.equal(x.frames[0].active,true);state=x.state;
 x=stepBrain(brain,inputs,state);assert.equal(x.frames[0].active,false);
 assert.equal(x.frames[0].falling,true);state=x.state;
 brain.rules[0].enabled=false;
 inputs.contact=0;x=stepBrain(brain,inputs,state);
 assert.equal(x.frames[0].active,false);
 assert.equal(x.frames[0].events,1);
 assert.throws(()=>stepBrain(brain,{...inputs,motion:NaN}),/Simulation inputs/);
 assert.throws(()=>stepBrain(brain,{...inputs,motion:-1}),/Simulation inputs/);
});

test("dual sensor gate supports AND and OR with deterministic simulated values",()=>{
 const r={...makeRule("AUTO-motion","motion"),debounce:1,hold:0};
 const brain={rules:[r]},inputs={light:80,motion:90,contact:100,button:0};
 let x=stepBrain(brain,inputs);
 assert.equal(x.frames[0].active,false);
 inputs.button=100;x=stepBrain(brain,inputs);
 assert.equal(x.frames[0].active,true);
 brain.rules[0].combine="any";
 inputs.motion=0;x=stepBrain(brain,inputs);
 assert.equal(x.frames[0].active,true);
 inputs.button=0;x=stepBrain(brain,inputs);
 assert.equal(x.frames[0].active,false);
});

test("recipe interchange adds a separate ID, forbids arbitrary expressions and oversized uploads",()=>{
 const r=makeRule("AUTO-1","beam");
 const text=makeRecipeExport(r);
 const imported=parseRecipeImport(text,"AUTO-import");
 assert.equal(imported.id,"AUTO-import");
 assert.equal(imported.name,"Broken-beam indicator (imported)");
 assert.equal(imported.first.input,"light");
 assert.throws(()=>parseRecipeImport(JSON.stringify({application:"mcgruber-device-recipe",version:1,
   rule:{...r,output:"eval(1)"}}),"AUTO-B"));
 assert.throws(()=>parseRecipeImport(" ".repeat(12001),"AUTO-B"));
 assert.throws(()=>parseRecipeImport(JSON.stringify({application:"other",version:1,rule:r}),"AUTO-B"));
});

test("existing schema-1 workspaces retain compatibility; malicious automation backup is refused",()=>{
 const w=freshWorkspace();
 assert.deepEqual(w.deviceBrain,{rules:[]});
 w.deviceBrain.rules.push(makeRule("AUTO-1"));
 assert.equal(validateWorkspace(w).deviceBrain.rules.length,1);
 const legacy=structuredClone(w);delete legacy.deviceBrain;
 assert.deepEqual(validateWorkspace(legacy).deviceBrain,{rules:[]});
 const unsafe=structuredClone(w);unsafe.deviceBrain.rules[0].output="direct-motor";
 assert.throws(()=>validateWorkspace(unsafe),/Invalid automation recipe/);
});
