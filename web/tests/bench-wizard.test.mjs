import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const base=new URL("../public/beam-detector/",import.meta.url);
async function read(name){return readFile(new URL(name,base),"utf8");}
test("beginner wizard has an explicit first-stage 9V current limit and five physical stages",async()=>{
const html=await read("start-here.html");
const matches=[...html.matchAll(/title:"([^"]+)",summary:/g)];
assert.equal(matches.length,5,"Expected five physical stages");
assert.match(html,/series resistor before powering the sender/);
assert.match(html,/9V\+ → measured resistor/);
assert.match(html,/Fluke/);
assert.match(html,/without a person pressing or touching/);
assert.match(html,/No controller, computer or sound/);
assert.match(html,/manualOnly:true/);
assert.match(html,/owner-reported/i);
assert.match(html,/localStorage/);
assert.match(html,/Export today's record/);
});
test("guided entry point is discoverable from the three phone app routes",async()=>{
for(const name of ["index.html","standalone-lab.html","engineering-hub.html"]){
const page=await read(name);
assert.ok(page.includes('href="./start-here.html"'),name+" has no novice entry link");
}
});
test("guided page's JavaScript syntax is valid and avoids invented hardware sensing",async()=>{
const html=await read("start-here.html");
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(code,"Expected inline controller");
new Function(code);
assert.match(html,/not a connection to your hardware/i);
assert.match(html,/does not certify/);
});
