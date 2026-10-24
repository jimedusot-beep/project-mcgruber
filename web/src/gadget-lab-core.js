// Deterministic offline *fictional* engineering exercises. No device discovery,
// RF receive/transmit, GPIO, BLE identifiers, OS permissions or live signals.
import {gadgetReferences} from "./gadget-references.js";
import {makeRule,initialInputs,stepBrain} from "./device-brain-core.js";

export const LAB_IDS = Object.freeze(["G02","G03","G04","G06","G07","G08"]);
const baseChecks = [
  {id:"sources",name:"Check the exact board or tool model and primary documentation",detail:"Record exact markings, pinouts, and firmware support; research substitutes are not approved equivalents."},
  {id:"inventory",name:"Inspect actual owned parts and identify gaps",detail:"Rev 4 photographs are leads. Verify ownership, condition and component identity before treating a part as available."},
  {id:"safety",name:"Review power, privacy, permission and environmental limits",detail:"Unknown lithium batteries, hot tools, motors and RF interfaces must not be powered on assumptions."},
  {id:"prototype",name:"Examine a simulated scenario and its failure cases",detail:"Passing a synthetic scenario never establishes physical function."},
  {id:"measure",name:"Plan real instruments, test conditions and acceptance criteria",detail:"Define expected ranges, repeat trials and record any actual failures before hardware use."},
  {id:"report",name:"Keep a signed-off evidence note and private backup",detail:"Record what you actually observed. A checked item means reviewed, not qualified."},
];
const labs = [
 {id:"G07",title:"StickS3-style compact controller",kind:"esp32",project:"P04",unit:"virtual GPIO state",mode:"ESP32 sensor logic",
  description:"Run real McGruber Device Brain rules against fictional switch, light and motion inputs. Observe debounce, events and false-trigger controls; no pins are connected.",
  scenarios:[["door","Switch closure / release"],["light","Light interrupted"],["motion","Motion with arming button"]],
  checks:[...baseChecks,
   {id:"driver",name:"Verify exact GPIO voltage and output driver design",detail:"Protect MCU pins; motors, relays and buzzers need rated interfaces and independent current budgets."}],
  caution:"Virtual ON means only the JavaScript state machine was satisfied. It does not switch a physical pin, motor, relay or IR emitter."},
 {id:"G06",title:"Cardputer ADV-style pocket workbench",kind:"pocket",project:"P07",unit:"virtual screen transitions",mode:"Pocket menu simulator",
  description:"Navigate simulated menus with prerecorded virtual button presses. Prototype how a small display can start experiments, show safety notices and log observations offline.",
  scenarios:[["menu","Menu navigation"],["inspection","Parts inspection checklist"],["offline","Disconnected/recovery state"]],
  checks:[...baseChecks,
   {id:"pinout",name:"Verify exact keyboard, display and IR pin assignments",detail:"Check actual Cardputer ADV documentation; an IR emitter does not imply a built-in IR receiver."}],
  caution:"This is an offline interface mockup. It is not Cardputer firmware and cannot browse files, record audio or control equipment."},
 {id:"G02",title:"ESP32 Marauder-style wireless awareness",kind:"wireless",project:"P05",unit:"synthetic observations",mode:"Wi-Fi/BLE observation exercise",
  description:"Examine fictional access-point/BLE beacon appearances, signal fluctuations and ambiguous classifications. Build safe monitoring habits without scanning real networks.",
  scenarios:[["routine","Familiar broadcasts"],["crowded","Crowded radio environment"],["ambiguous","Unrecognized device ≠ skimmer"]],
  checks:[...baseChecks,
   {id:"radio",name:"Verify controller wireless capabilities and authorization scope",detail:"Board revisions differ. Begin with passive, authorized diagnostics; do not enable deauthentication, spoofing or capture of unrelated traffic."}],
  caution:"Simulated radio presence does not identify a card skimmer, compromised router or malicious device. No Wi-Fi/Bluetooth search is performed."},
 {id:"G04",title:"nyanBOX-style tracker privacy lab",kind:"tracker",project:"P05",unit:"fictional BLE advertisements",mode:"BLE proximity uncertainty",
  description:"Explore advertisement rotation and RSSI uncertainty with synthetic examples; avoid assuming an unknown BLE identifier proves tracking.",
  scenarios:[["passing","Passing broadcast"],["rotating","Identifier rotation"],["multipath","Crowded room / multipath"]],
  checks:[...baseChecks,
   {id:"privacy",name:"Document privacy retention and false-positive handling",detail:"BLE addresses can rotate and RSSI is not distance. The nRF24L01 is not a native general-purpose BLE scanner: special advertising emulation does not make it a drop-in BLE discovery radio. Avoid logging or linking bystander identities without consent."}],
  caution:"The examples are fictional and non-identifying. They do not locate trackers, prove ownership or inspect live Bluetooth devices."},
 {id:"G08",title:"RTL-SDR receive-only radio workbench",kind:"spectrum",project:"P05",unit:"simulated relative dB",mode:"Synthetic spectrum exploration",
  description:"Read plotted relative-power frequency bins and practice distinguishing peaks from noise without opening, demodulating or recording any real radio source.",
  scenarios:[["fm","Illustrative FM-band peak"],["quiet","Noise floor reference"],["interference","Interference / multiple peaks"]],
  checks:[...baseChecks,
   {id:"receive",name:"Confirm compatible USB receiver and permitted observation",detail:"RTL-SDR receives; it does not transmit. Verify driver, antenna, band rules, and data-minimization practices."}],
  caution:"The frequency plot is manufactured test data, not local RF monitoring or proof of a station, transmission, legal operation or interference."},
 {id:"G03",title:"Fanttik-inspired repair and fabrication bench",kind:"repair",project:"P06",unit:"virtual repair checklist events",mode:"Repair planning exercise",
  description:"Practice fastener sorting, correct bit fit, and repair sequencing. A powered driver or high-temperature iron is not fabricated or controlled.",
  scenarios:[["organize","Screw organizer / teardown"],["mismatch","Incorrect bit and stop condition"],["inspection","Solder joint visual review"]],
  checks:[...baseChecks,
   {id:"heat",name:"Choose certified tools and confirm proper safety equipment",detail:"Do not construct a makeshift heated soldering iron or repower salvaged lithium cells. Provide eye protection and ventilation when appropriate."}],
  caution:"This simulator never turns a bit, applies torque or heats a tip. Scores concern process steps, not tool safety certification."}
];
export const GADGET_LABS=Object.freeze(labs);
const byId=new Map(GADGET_LABS.map(l=>[l.id,l]));
export function getLab(id){return byId.get(id)||null;}
export function labChecklist(id){const lab=getLab(id);if(!lab)throw Error("Unknown gadget lab.");return lab.checks;}
export function freshGadgetLabs(){return {reviewed:{}};}
export function validateGadgetLabs(saved){
 if(!saved||typeof saved!=="object"||Array.isArray(saved)||
   !saved.reviewed || typeof saved.reviewed!=="object" || Array.isArray(saved.reviewed))
     throw Error("Invalid saved gadget lab reviews.");
 for(const [id,rows] of Object.entries(saved.reviewed)){
   if(!getLab(id) || !Array.isArray(rows) || rows.length>8 ||
      rows.some(x=>typeof x!=="string" || !labChecklist(id).some(c=>c.id===x)) ||
      new Set(rows).size!==rows.length) throw Error("Invalid gadget review checklist.");
 }
 return saved;
}
export function progressFor(id,saved){
 const checks=labChecklist(id);
 const reviewed=new Set(saved?.reviewed?.[id]||[]);
 return {reviewed:checks.filter(c=>reviewed.has(c.id)).length,total:checks.length,
  status:"Review progress only — no verified hardware"};
}
export function setReview(saved,id,checkId,checked){
 validateGadgetLabs(saved);
 const checks=labChecklist(id);
 if(!checks.some(c=>c.id===checkId))throw Error("Unknown readiness checkpoint.");
 const rows=new Set(saved.reviewed[id]||[]);
 if(checked)rows.add(checkId);else rows.delete(checkId);
 const next={...saved,reviewed:{...saved.reviewed,[id]:[...rows]}};
 validateGadgetLabs(next);
 return next;
}

const clipped=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
function series(samples){return samples.map((s,i)=>({...s,index:i}));}
function simulateESP32(lab,scenario,level){
 const type=scenario==="light"?"beam":scenario==="motion"?"motion":"removal";
 const rule={...makeRule("VIRTUAL-ONLY",type),debounce:2,hold:scenario==="motion"?1:0};
 const ruleInput=rule.first.input;
 let state={};
 const samples=[];
 const values= scenario==="motion"
   ? [0,70,75,80,20,72,78,90,10]
   : scenario==="light"
     ? [80,80,30,20,18,80,15,10,80]
     : [100,100,0,0,100,100,0,0,100];
 for(let i=0;i<values.length;i++){
   const inputs=initialInputs();
   inputs[ruleInput]=clipped(values[i]+(i===2?level-50:0));
   if(scenario==="motion")inputs.button=i>=1 && i<=6?100:0;
   const result=stepBrain({rules:[rule]},inputs,state);state=result.state;
   samples.push({label:"Step "+(i+1),value:inputs[ruleInput],active:result.frames[0].active,
     note:(result.frames[0].rising?"Virtual rising edge":result.frames[0].falling?"Virtual falling edge":"No output transition")});
 }
 return {samples:series(samples),unit:lab.unit,headline:"Debounced virtual events: "+state[rule.id].events,
    finding:"A single software rule responds to fictional digital/analog inputs, not real GPIO.",
    caution:lab.caution};
}
function simulatePocket(lab,scenario,level){
 const menus=scenario==="offline"?["BOOT","NO USB LINK","SAFE OFFLINE","LOG VIEW","READY"]
   :scenario==="inspection"?["HOME","PARTS","REF-07","CHECK MARKINGS","SAVE DRAFT","HOME"]
   :["HOME","DEVICE BRAIN","SENSORS","LIGHT DEMO","BACK","HOME"];
 const samples=menus.map((label,i)=>({label:"Key "+i,value:clipped((i*17+level)%101),active:i>1,
  note:"Fictional LCD: "+label}));
 return {samples:series(samples),unit:lab.unit,headline:"Virtual screen transitions: "+menus.length,
   finding:scenario==="offline"?"Disconnected operation should not trigger physical controls.":"Navigation and inspection flow designed for a small offline screen.",
   caution:lab.caution};
}
function simulateWireless(lab,scenario,level){
 const profiles={
   routine:[["LAB-AP",59],["LAB-BLE",48],["LAB-AP",61],["LAB-BLE",47],["LAB-AP",58]],
   crowded:[["LAB-AP",54],["NEARBY-1",33],["NEARBY-2",41],["LAB-AP",62],["NEARBY-3",29],["LAB-BLE",39]],
   ambiguous:[["UNRECOGNIZED",48],["LAB-AP",59],["UNRECOGNIZED",51],["UNRECOGNIZED",42]]
 };
 const fake=profiles[scenario]||profiles.routine;
 const samples=fake.map(([label,intensity],i)=>({label:"Frame "+(i+1),value:clipped(intensity+Math.round((level-50)/8)),
 active:label==="UNRECOGNIZED",note:"Synthetic observation: "+label+" (no hardware)"}));
 return {samples:series(samples),unit:lab.unit,
  headline:"Synthetic observations: "+samples.length+"; suspicious devices confirmed: 0",
  finding:"Unknown or nearby broadcasts are not evidence of a skimmer. Patterns depend on setting and observer.",
  caution:lab.caution};
}
function simulateTracker(lab,scenario,level){
 const profiles={
   passing:[["EPHEMERAL-A",38],["EPHEMERAL-A",46],["NO ADVERT",0],["EPHEMERAL-A",29],["NO ADVERT",0]],
   rotating:[["EPHEMERAL-A",44],["EPHEMERAL-A",48],["EPHEMERAL-B",47],["EPHEMERAL-B",43],["EPHEMERAL-C",36]],
   multipath:[["EPHEMERAL-A",35],["EPHEMERAL-B",63],["EPHEMERAL-C",17],["EPHEMERAL-A",55],["NO ADVERT",0]]
 };
 const samples=(profiles[scenario]||profiles.passing).map(([name,intensity],i)=>({
  label:"Interval "+(i+1),value:intensity?clipped(intensity+Math.round((level-50)/5)):0,
  active:false,note:"Fictional packet label "+name+"; identity not established"}));
 return {samples:series(samples),unit:lab.unit,
  headline:"Synthetic advertisements: "+samples.filter(s=>s.value>0).length,
  finding:"Identifier change or variable signal strength does not establish which device or person produced a packet.",
  caution:lab.caution};
}
function simulateSpectrum(lab,scenario,level){
 const bins=Array.from({length:41},(_,i)=>88+i*0.5);
 const freqPeaks=scenario==="fm"?[[99.5,30]]:scenario==="interference"?[[93.5,23],[101.5,35]]:[];
 const samples=bins.map((hz,i)=>{
  const noise=10+(i*7%6)+(level-50)/15;
  const gain=freqPeaks.reduce((m,[peak,height])=>Math.max(m,height*Math.max(0,1-Math.abs(hz-peak)/1.7)),0);
  return {label:hz.toFixed(1)+" MHz",value:Math.round(noise+gain),active:false,note:"Synthetic relative power; NOT a receiver reading"};
 });
 const peak=samples.reduce((a,b)=>b.value>a.value?b:a);
 return {samples:series(samples),unit:lab.unit,
   headline:"Illustrative peak "+peak.label+" / "+peak.value+" relative dB",
   finding:"A simulated power peak alone does not identify a station, protocol, transmitter or legal signal.",
   caution:lab.caution};
}
function simulateRepair(lab,scenario,level){
 const actions=scenario==="mismatch"
   ?[["Identify head",true],["Try incorrect bit",false],["Stop / replace tool",true],["Inspect head again",true],["Document damage",true]]
   :scenario==="inspection"
   ?[["Power off",true],["Magnify joint",true],["Check solder fillet",true],["Inspect bridges",true],["Document uncertain joint",true]]
   :[["Unplug donor",true],["Photograph screw layout",true],["Label small screws",true],["Bag per location",true],["Reassembly checklist",true]];
 const samples=actions.map(([name,ok],i)=>({label:"Step "+(i+1),value:ok?clipped(65+level/4):12,active:ok,
  note:name+(ok?" — virtual workflow completed":" — stop / no tool actuation")}));
 return {samples:series(samples),unit:lab.unit,
   headline:"Safe-process steps: "+actions.filter((x)=>x[1]).length+"/"+actions.length,
   finding:"Mechanical planning and inspection precede any physical disassembly or heated tool work.",
   caution:lab.caution};
}
export function runGadgetLab(id,scenario,level=50){
 const lab=getLab(id);if(!lab)throw Error("Unknown gadget lab.");
 if(!lab.scenarios.some(s=>s[0]===scenario))throw Error("Unknown fictional scenario.");
 if(!Number.isInteger(level)||level<0||level>100)throw Error("Simulation setting must be 0–100.");
 if(lab.kind==="esp32")return simulateESP32(lab,scenario,level);
 if(lab.kind==="pocket")return simulatePocket(lab,scenario,level);
 if(lab.kind==="wireless")return simulateWireless(lab,scenario,level);
 if(lab.kind==="tracker")return simulateTracker(lab,scenario,level);
 if(lab.kind==="spectrum")return simulateSpectrum(lab,scenario,level);
 return simulateRepair(lab,scenario,level);
}
export function labWorksheet(id,saved=freshGadgetLabs()){
 validateGadgetLabs(saved);
 const lab=getLab(id);if(!lab)throw Error("Unknown gadget lab.");
 const ref=gadgetReferences.find(x=>x.id===id);
 const reviewed=new Set(saved.reviewed[id]||[]);
 return [
  "# McGruber Gadget Lab — "+lab.title,"",
  "Simulation / research only. A reviewed checklist item is not a tested physical build.","",
  "## Purpose",lab.description,"",
  "## Ingredients to source or identify",...ref.ingredients.map(i=>"- "+i),"",
  "## Potential Rev 4 salvage leads (unverified)",...(ref.leads.length?ref.leads.map(x=>"- "+x):["- None confirmed"]),"",
  "## Build-readiness reviews",
  ...lab.checks.flatMap(c=>["- ["+(reviewed.has(c.id)?"x":" ")+"] "+c.name+" (REVIEWED, NOT VERIFIED)","  "+c.detail]),"",
  "## Simulated starting scenarios",...lab.scenarios.map(s=>"- "+s[1]),"",
  "## Scope limitations",lab.caution,ref.limits,"",
  "## Before a real device experiment",
  "Identify your exact supported hardware, electrical ratings and protective interface.",
  "Define objective pass criteria; complete authorized and measured tests, log failures, and retain private backups.",
  "No radio capture, physical repair, tracker location, GPIO signal, lock access or firmware flashing was carried out."
 ].join("\n");
}
