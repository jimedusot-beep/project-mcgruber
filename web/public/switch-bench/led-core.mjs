// SPDX-License-Identifier: MIT
// P04: pure data review of OWNER-ENTERED values. Not a meter or safety certification.
export const CYCLE_COUNT = 20;
export const SWITCH_STATES = Object.freeze(["not-tested", "on", "off"]);
export const CHECKS = Object.freeze([
  "isolated", "contact_map", "led_polarity", "supply_polarity", "series_resistor", "insulation"
]);
export function blankLedBench() {
  return {
    tester:"", instrument:"", switchId:"", testDate:"", notes:"", evidenceUrl:"",
    supplyVoltage:"", resistorOhms:"", resistorDropVoltage:"",
    ledMaxCurrentMa:"", resistorRatedW:"", stationaryFalseAlarms:"",
    checks:Object.fromEntries(CHECKS.map(k=>[k,false])),
    cycles:Array.from({length:CYCLE_COUNT},()=>({pressed:"not-tested",removed:"not-tested"})),
  };
}
function measuredNumber(value, name, min, max) {
  if (value === "" || value === undefined || value === null ||
      (typeof value === "string" && value.trim() === "")) return null;
  if (typeof value !== "string" && typeof value !== "number")
    throw Error(name+" must be a number.");
  const n = Number(value);
  if (!String(value).trim() || !Number.isFinite(n) || n < min || n > max)
    throw Error(name+" must be between "+min+" and "+max+".");
  return n;
}
export function reviewLedBench(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("Expected a P04 worksheet record.");
  const checks = input.checks || {};
  const cycles = input.cycles;
  if (!Array.isArray(cycles) || cycles.length !== CYCLE_COUNT)
    throw Error("Exactly 20 cycle entries are required.");
  if (CHECKS.some(x => typeof checks[x] !== "boolean"))
    throw Error("Preflight checkboxes must be explicit true/false values.");
  if (cycles.some(c => !c || !SWITCH_STATES.includes(c.pressed) || !SWITCH_STATES.includes(c.removed)))
    throw Error("Cycle states must be off, on or not tested.");
  const numbers = {
    source:measuredNumber(input.supplyVoltage,"Measured loaded supply voltage",0.01,12),
    resistor:measuredNumber(input.resistorOhms,"Measured series resistor (ohms)",1,100000),
    drop:measuredNumber(input.resistorDropVoltage,"Measured resistor voltage drop",0,12),
    ratedLed:measuredNumber(input.ledMaxCurrentMa,"Documented LED maximum current",0.01,200),
    ratedResistor:measuredNumber(input.resistorRatedW,"Resistor rated power",0.001,10),
    stationary:measuredNumber(input.stationaryFalseAlarms,"Stationary false-alarm count",0,1000),
  };
  if (numbers.stationary !== null && !Number.isInteger(numbers.stationary))
    throw Error("Stationary false-alarm count must be a whole number.");
  let currentMa=null, powerW=null, boundCurrentMa=null, boundPowerW=null;
  const warnings=[];
  if (numbers.source != null && numbers.drop != null && numbers.drop > numbers.source + 1e-9)
    warnings.push("Resistor voltage drop exceeds supply voltage; recheck probes, source and circuit.");
  if (numbers.source != null && numbers.resistor != null) {
    boundCurrentMa=1000*numbers.source/numbers.resistor;
    boundPowerW=numbers.source**2/numbers.resistor;
    if (numbers.ratedLed != null && boundCurrentMa > numbers.ratedLed)
      warnings.push("Worst-case current exceeds the documented LED maximum. Stop and choose a safer resistor.");
    if (numbers.ratedResistor != null && 2*boundPowerW > numbers.ratedResistor)
      warnings.push("Resistor rating is below a conservative 2× short-LED power margin.");
  }
  if (numbers.drop != null && numbers.resistor != null) {
    currentMa=1000*numbers.drop/numbers.resistor;
    powerW=numbers.drop**2/numbers.resistor;
    if (numbers.ratedLed != null && currentMa > numbers.ratedLed)
      warnings.push("Calculated resistor current exceeds documented LED maximum. Disconnect power.");
    if (numbers.ratedResistor != null && powerW > numbers.ratedResistor)
      warnings.push("Calculated resistor dissipation exceeds the resistor rating. Disconnect power.");
  }
  const observed=cycles.filter(c=>c.pressed!=="not-tested"&&c.removed!=="not-tested").length;
  const correct=cycles.filter(c=>c.pressed==="off"&&c.removed==="on").length;
  const failed=cycles.filter(c=>(c.pressed!=="not-tested"&&c.pressed!=="off")||
    (c.removed!=="not-tested"&&c.removed!=="on")).length;
  const missing=CHECKS.filter(k=>!checks[k]);
  const identityReady=["tester","instrument","switchId","testDate","notes","evidenceUrl"].every(
    k=>typeof input[k]==="string"&&input[k].trim().length>0);
  const electricalReady=Object.values(numbers).every(n=>n!=null)&&
    numbers.drop<=numbers.source+1e-9&&numbers.drop>0&&
    boundCurrentMa>0&&boundPowerW>0;
  const ready=missing.length===0&&identityReady&&electricalReady&&observed===20&&
    correct===20&&failed===0&&numbers.stationary===0&&warnings.length===0;
  return {
    status:ready?"OWNER_REPORTED_READY_FOR_HUMAN_REVIEW":"INCOMPLETE_OR_NEEDS_ATTENTION",
    evidenceStatus:"OWNER_ENTERED_UNVERIFIED",
    observed,correct,failed,untested:20-observed,
    preflightComplete:missing.length===0,missingChecks:missing,
    identityReady,electricalReady,warnings,
    currentMa,powerW,boundCurrentMa,boundPowerW,
    // Never certify hardware from typed fields; a human must inspect evidence.
    physicallyVerified:false,
  };
}
function quoteCsv(value) {
  let s=String(value??"");
  if (/^\s*[=+\-@\t\r]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
}
export function exportLedBenchCsv(input, exportedAtUtc) {
  const review=reviewLedBench(input);
  const date=exportedAtUtc ?? new Date().toISOString();
  if (typeof date !== "string" || Number.isNaN(Date.parse(date)))
    throw Error("Invalid export timestamp.");
  const cols=["row_type","project","exported_at_utc","tester","switch_id","test_date",
    "instrument","row_number","pressed_state","removed_state","measured_loaded_supply_v",
    "measured_resistor_ohm","measured_resistor_drop_v","documented_led_max_ma",
    "documented_resistor_rating_w","reported_stationary_false_alarms","calculated_current_ma",
    "calculated_resistor_power_w","conservative_current_bound_ma","conservative_resistor_power_bound_w",
    "preflight_checks","observations","evidence_reference","worksheet_status","evidence_status"];
  const common=[
    "P04",date,input.tester,input.switchId,input.testDate,input.instrument,
  ];
  const metadata=[input.supplyVoltage,input.resistorOhms,input.resistorDropVoltage,
    input.ledMaxCurrentMa,input.resistorRatedW,input.stationaryFalseAlarms,
    review.currentMa??"",review.powerW??"",review.boundCurrentMa??"",review.boundPowerW??"",
    CHECKS.map(k=>k+":"+(input.checks[k]?"yes":"no")).join(";"),
    input.notes,input.evidenceUrl,review.status,review.evidenceStatus];
  const rows=[
    cols,
    ["summary",...common,"","","",...metadata],
    ...input.cycles.map((c,i)=>["cycle",...common,i+1,c.pressed,c.removed,...metadata])
  ];
  return rows.map(row=>row.map(quoteCsv).join(",")).join("\r\n")+"\r\n";
}
