// SPDX-License-Identifier: MIT
// Pure contact-logic helpers. Entered readings are never automatically verified.
export const STATES = Object.freeze(["unknown", "open", "closed"]);
export const PAIRS = Object.freeze({
  2: Object.freeze(["A-B"]),
  3: Object.freeze(["A-B", "A-C", "B-C"]),
});
export function analyzeContacts(terminals, readings) {
  const pairs = PAIRS[terminals];
  if (!pairs || !readings || typeof readings !== "object" || Array.isArray(readings))
    throw Error("Choose two or three isolated switch terminals.");
  const values = {};
  for (const pair of pairs) {
    const reading = readings[pair] || {};
    const released = reading.released ?? "unknown";
    const pressed = reading.pressed ?? "unknown";
    if (!STATES.includes(released) || !STATES.includes(pressed))
      throw Error("Readings must be open, closed or not measured.");
    values[pair] = { released, pressed };
  }
  const completed = Object.values(values).filter(x=>x.released!=="unknown"&&x.pressed!=="unknown").length;
  const base = { completed, total:pairs.length, status:"incomplete", map:null };
  if (completed !== pairs.length)
    return { ...base, message: "Measure every pin pair with power disconnected, first released and then pressed." };
  if (terminals === 2) {
    const {released,pressed} = values["A-B"];
    if(released===pressed)
      return {...base,status:"ambiguous",message:"No change was observed. Check isolation, switch movement and probe contact."};
    return {...base,status:"candidate",map:{
      contact:released==="closed"?"normally closed (NC)":"normally open (NO)",
      pins:["A","B"],
    },message:"Two-terminal switching contact candidate. No COM pin can be determined from only two terminals."};
  }
  const rest=pairs.filter(p=>values[p].released==="closed");
  const pushed=pairs.filter(p=>values[p].pressed==="closed");
  if(rest.length!==1||pushed.length!==1||rest[0]===pushed[0])
    return {...base,status:"ambiguous",message:"Expected exactly one different closed pair in each position for an isolated three-terminal changeover switch. Do not guess pin identities."};
  const a=rest[0].split("-"),c=pushed[0].split("-");
  const common=a.find(pin=>c.includes(pin));
  if(!common) return {...base,status:"ambiguous",message:"Closed pairs do not share a common terminal."};
  return {...base,status:"candidate",map:{
    COM:common,NC:a.find(pin=>pin!==common),NO:c.find(pin=>pin!==common),
    releasedClosed:rest[0],pressedClosed:pushed[0],
  },message:"Candidate COM/NC/NO map from entered observations. Repeat ten cycles and inspect the isolated switch before using power."};
}
const csvEscape=v=>{
  let s=String(v??"");
  // Avoid spreadsheet formulas from free-text notes or component labels.
  if(/^\s*[=+\-@\t\r]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
};
export function exportContactCsv({terminals,readings,tester="",instrument="",notes="",cycles=[]}) {
  const analyzed=analyzeContacts(terminals,readings);
  const rows=[["record_type","project","terminal_count","pin_pair","released","pressed","repeat_cycle","repeat_observed","instrument","tester","notes","interpretation","record_status"]];
  for(const pair of PAIRS[terminals]){
    const x=readings[pair]||{};
    rows.push(["continuity","P04",terminals,pair,x.released??"unknown",x.pressed??"unknown","","",instrument,tester,notes,analyzed.status,"OWNER_ENTERED_UNVERIFIED"]);
  }
  cycles.forEach((yes,i)=>rows.push(["repeat_cycle","P04",terminals,"","","",i+1,yes?"reported_consistent":"not_reported",instrument,tester,notes,analyzed.status,"OWNER_ENTERED_UNVERIFIED"]));
  return rows.map(row=>row.map(csvEscape).join(",")).join("\r\n")+"\r\n";
}
