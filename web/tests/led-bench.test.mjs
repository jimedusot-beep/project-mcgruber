import test from "node:test";
import assert from "node:assert/strict";
import {blankLedBench,reviewLedBench,exportLedBenchCsv,CYCLE_COUNT} from "../public/switch-bench/led-core.mjs";
function filled(){
  const x=blankLedBench();
  Object.assign(x,{tester:"Owner",instrument:"Fluke DCV/ohms",switchId:"Mouse donor 1 isolated switch",
    testDate:"2026-11-02",notes:"Actual physical readings to be supplied.",
    evidenceUrl:"photo-or-record-reference",supplyVoltage:"9",resistorOhms:"1000",
    resistorDropVoltage:"7",ledMaxCurrentMa:"20",resistorRatedW:"0.25",
    stationaryFalseAlarms:"0"});
  for(const k of Object.keys(x.checks))x.checks[k]=true;
  x.cycles=x.cycles.map(()=>({pressed:"off",removed:"on"}));
  return x;
}
test("blank bench has no fabricated measurements or cycle outcomes",()=>{
 const b=blankLedBench(),r=reviewLedBench(b);
 assert.equal(r.physicallyVerified,false);
 assert.equal(r.observed,0);
 assert.equal(r.status,"INCOMPLETE_OR_NEEDS_ATTENTION");
 assert.deepEqual(b.cycles,Array.from({length:CYCLE_COUNT},()=>({pressed:"not-tested",removed:"not-tested"})));
 assert.equal(b.supplyVoltage,"");
 assert.equal(b.stationaryFalseAlarms,"");
});
test("sample numbers calculate Ohm's law and remain owner-entered, never verified",()=>{
 const b=filled(),r=reviewLedBench(b);
 assert.equal(r.status,"OWNER_REPORTED_READY_FOR_HUMAN_REVIEW");
 assert.equal(r.physicallyVerified,false);
 assert.equal(r.evidenceStatus,"OWNER_ENTERED_UNVERIFIED");
 assert.equal(r.currentMa,7);assert.equal(r.powerW,0.049);
 assert.equal(r.boundCurrentMa,9);assert.equal(r.boundPowerW,0.081);
 assert.equal(r.correct,20);assert.equal(r.observed,20);
});
test("missing ratings, notes, false-alarm count, or even one real cycle prevents review readiness",()=>{
 for(const key of ["ledMaxCurrentMa","resistorRatedW","stationaryFalseAlarms","evidenceUrl","notes"]){
  const x=filled();x[key]="";
  assert.equal(reviewLedBench(x).status,"INCOMPLETE_OR_NEEDS_ATTENTION",key);
 }
 const b=filled();b.cycles[19]={pressed:"off",removed:"not-tested"};
 assert.equal(reviewLedBench(b).observed,19);
 assert.equal(reviewLedBench(b).status,"INCOMPLETE_OR_NEEDS_ATTENTION");
 b.cycles[19]={pressed:"on",removed:"on"};
 assert.equal(reviewLedBench(b).failed,1);
 assert.equal(reviewLedBench(b).status,"INCOMPLETE_OR_NEEDS_ATTENTION");
});
test("rejects hazardous or contradictory readings and insufficient margins",()=>{
 const b=filled();b.resistorDropVoltage="10";
 assert.match(reviewLedBench(b).warnings.join(" "),/exceeds supply/);
 assert.equal(reviewLedBench(b).status,"INCOMPLETE_OR_NEEDS_ATTENTION");
 b.resistorDropVoltage="7";b.ledMaxCurrentMa="5";
 assert.match(reviewLedBench(b).warnings.join(" "),/Worst-case current exceeds/);
 b.ledMaxCurrentMa="20";b.resistorRatedW="0.1";
 assert.match(reviewLedBench(b).warnings.join(" "),/2×/);
 b.resistorRatedW="0.25";b.stationaryFalseAlarms="1";
 assert.equal(reviewLedBench(b).status,"INCOMPLETE_OR_NEEDS_ATTENTION");
 for(const bad of ["-1","NaN","Infinity","13"," "]){
  b.supplyVoltage=bad;
  if(bad===" ")assert.equal(reviewLedBench(b).status,"INCOMPLETE_OR_NEEDS_ATTENTION");
  else assert.throws(()=>reviewLedBench(b));
 }
});
test("cycle schema and explicit preflight are required",()=>{
 const b=filled();b.cycles.pop();
 assert.throws(()=>reviewLedBench(b),/Exactly 20/);
 b.cycles.push({pressed:"off",removed:"on"});
 b.cycles[1].pressed="maybe";assert.throws(()=>reviewLedBench(b),/Cycle states/);
 b.cycles[1].pressed="off";b.checks.insulation="yes";
 assert.throws(()=>reviewLedBench(b),/Preflight/);
});
test("CSV is safe, explicit about provenance, and keeps all 20 rows even when incomplete",()=>{
 const b=filled();b.notes='=HYPERLINK("evil")';b.cycles[2]={pressed:"not-tested",removed:"off"};
 const csv=exportLedBenchCsv(b,"2026-11-02T13:00:00.000Z");
 assert.equal(csv.split("\r\n").filter(Boolean).length,22);
 assert.match(csv,/OWNER_ENTERED_UNVERIFIED/);
 assert.match(csv,/INCOMPLETE_OR_NEEDS_ATTENTION/);
 assert.ok(csv.includes("'=HYPERLINK"));
 assert.ok(!csv.includes('"=HYPERLINK'));
 assert.ok(csv.includes('"cycle","P04"'));
 assert.ok(csv.includes('"not-tested","off"'));
 assert.ok(!csv.includes("INDEPENDENTLY_VERIFIED"));
});
