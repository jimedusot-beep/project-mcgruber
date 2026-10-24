import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {validateInventoryPart} from "../src/salvage-core.js";
import {validateNewArrivals,ownerArrivalsHTML,arrivalToPersonalPart} from "../src/new-arrivals.js";

const arrivals=JSON.parse(await readFile(new URL("../../component-bank/owner-new-arrivals.json",import.meta.url),"utf8"));

test("SUNBURST kit is one separately photographed owned arrival, not a Rev 4 PDF entry",()=>{
 assert.equal(validateNewArrivals(arrivals),arrivals);
 assert.equal(arrivals.items.length,1);
 const kit=arrivals.items[0];
 assert.equal(kit.id,"ARR-001");
 assert.equal(kit.kitNo,"1209");
 assert.equal(kit.quantity,"1 kit");
 assert.match(kit.packageCount,/116 pieces.*not counted/);
 assert.equal(kit.photosPublished,false);
 assert.equal(kit.originalRev4Member,false);
 assert.equal(kit.colorGrit.length,7);
 assert.deepEqual(kit.colorGrit.map(x=>x.label),
   ["80 grit","120 grit","220 grit","400 grit","600 grit","6 micron","1 micron"]);
 assert.equal(kit.colorGrit.find(x=>x.label==="600 grit").abrasive,"Pumice");
 assert.match(kit.safety.join(" "),/eye protection/i);
 assert.match(kit.safety.join(" "),/solder mask/);
});

test("owner kit imports once with conservative tool classification and no invented part tests",()=>{
 const p=arrivalToPersonalPart(arrivals.items[0],"PART-ARRIV0001","2026-10-24T11:00:00.000-04:00");
 assert.equal(validateInventoryPart(p),p);
 assert.equal(p.name,arrivals.items[0].name);
 assert.equal(p.status,"Owned");
 assert.equal(p.quantity,"1 kit");
 assert.equal(p.kind,"mechanical");
 assert.equal(p.test.result,"Not tested");
 assert.deepEqual(p.requirementIds,[]);
 assert.deepEqual(p.projects,[]);
 assert.equal(p.sourceArrivalId,"ARR-001");
 assert.equal(p.voltage,undefined);
 assert.equal(p.electrical,undefined);
 assert.match(p.note,/116 pieces/);
 assert.throws(()=>arrivalToPersonalPart({id:"REF-01"},"PART-2"),/recognized arrival/);
});

test("new arrivals view escapes text and disables previously imported record",()=>{
 let html=ownerArrivalsHTML(arrivals);
 assert.match(html,/23 Rev 4/);
 assert.match(html,/116 pieces/);
 assert.match(html,/1209/);
 assert.match(html,/Yellow/);
 assert.match(html,/1 micron/);
 assert.match(html,/Add this kit to My inventory/);
 html=ownerArrivalsHTML(arrivals,"SUNBURST",[{sourceArrivalId:"ARR-001"}]);
 assert.match(html,/Already saved to My inventory/);
 assert.match(html,/disabled/);
 assert.match(ownerArrivalsHTML(arrivals,"this phrase never appears"),/No arrivals match/);
 const altered={items:[{...arrivals.items[0],name:'<img src=x onerror=alert("bad")>'}]};
 const escaped=ownerArrivalsHTML(altered);
 assert.doesNotMatch(escaped,/<img src=x/);
 assert.match(escaped,/&lt;img/);
});
