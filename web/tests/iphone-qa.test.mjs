import test from "node:test";
import assert from "node:assert/strict";
import { DEVICE_TESTS,blankIPhoneReport,reviewIPhoneReport,formatIPhoneReport } from "../public/iphone-qa/core.mjs";
function complete(){
 const x=blankIPhoneReport();
 Object.assign(x,{tester:"QA owner-entered fixture",deviceModel:"QA device",
   iosVersion:"QA iOS",browserVersion:"QA WebKit",testedAt:"2026-11-03",
   evidenceReference:"QA fixture not a real screenshot",physicalIPhoneConfirmed:true});
 for(const t of DEVICE_TESTS)x.results[t.id]={status:"pass",notes:"QA only"};
 return x;
}
test("phone QA starts with all untested and never makes a device verification claim",()=>{
 const x=blankIPhoneReport(),v=reviewIPhoneReport(x);
 assert.equal(v.counts["not-tested"],DEVICE_TESTS.length);
 assert.equal(v.readyForHumanReview,false);
 assert.equal(v.physicallyVerified,false);
 assert.equal(v.evidenceStatus,"OWNER_ENTERED_UNVERIFIED");
 assert.equal(x.physicalIPhoneConfirmed,false);
});
test("all owner-entered PASS with identity is only review-ready, never verified",()=>{
 const x=complete(),v=reviewIPhoneReport(x);
 assert.equal(v.allOwnerReportedPassed,true);
 assert.equal(v.readyForHumanReview,true);
 assert.equal(v.physicallyVerified,false);
});
test("blocked/fail/untested remain visible; missing identity or real-iPhone claim blocks readiness",()=>{
 const x=complete();
 x.results["offline"].status="fail";
 x.results["3d-touch"].status="blocked";
 let v=reviewIPhoneReport(x);
 assert.equal(v.readyForHumanReview,true);
 assert.equal(v.allOwnerReportedPassed,false);
 assert.equal(v.counts.fail,1);assert.equal(v.counts.blocked,1);
 x.results["3d-touch"].status="not-tested";
 assert.equal(reviewIPhoneReport(x).readyForHumanReview,false);
 x.results["3d-touch"].status="pass";
 x.physicalIPhoneConfirmed=false;
 assert.equal(reviewIPhoneReport(x).readyForHumanReview,false);
 x.physicalIPhoneConfirmed=true;x.evidenceReference="";
 assert.equal(reviewIPhoneReport(x).readyForHumanReview,false);
});
test("reject malformed status, missing checklist or non-string test notes",()=>{
 const x=complete();delete x.results["3d-load"];
 assert.throws(()=>reviewIPhoneReport(x),/3d-load/);
 x.results["3d-load"]={status:"successful",notes:""};
 assert.throws(()=>reviewIPhoneReport(x),/3d-load/);
 x.results["3d-load"]={status:"pass",notes:1};
 assert.throws(()=>reviewIPhoneReport(x),/3d-load/);
});
test("export includes result, diagnostics and failure evidence without implying certification",()=>{
 const x=complete();x.results["3d-load"]={status:"fail",notes:"blank canvas"};
 x.overallNotes="Actual test note:\nseparate line";
 const report=formatIPhoneReport(x,{webgl2:"supported (unverified real device)",viewport:"390x844"},"2026-11-03T12:00:00Z");
 assert.match(report,/OWNER_ENTERED_UNVERIFIED/);
 assert.match(report,/3D workshop model and save/);
 assert.match(report,/13-part tripwire model — \*\*fail\*\* — blank canvas/);
 assert.match(report,/viewport: 390x844/);
 assert.match(report,/all owner-reported checks passed: no/i);
 assert.ok(!report.includes("INDEPENDENTLY_VERIFIED"));
 assert.match(report,/Actual test note: separate line/);
});
