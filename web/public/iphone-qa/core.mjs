// SPDX-License-Identifier: MIT
// Owner-entered iPhone QA report. Software/emulator checks never verify a real device.
export const DEVICE_TESTS=Object.freeze([
  {id:"browser",title:"Live Pages in Safari",instructions:"Open main McGruber site in Safari, confirm nine inventions and no visible errors."},
  {id:"3d-load",title:"13-part tripwire model",instructions:"Open the tripwire assembly; confirm actual rendered 3D canvas, not only the fallback drawing."},
  {id:"3d-touch",title:"Touch orbit, pan and pinch",instructions:"Try one-finger orbit and two-finger pan/pinch, including moving around the assembly."},
  {id:"3d-explode",title:"Explode and reassemble",instructions:"Move explode slider to 100%, then Assemble; confirm models return."},
  {id:"3d-parts",title:"Select, hide and restore a part",instructions:"Select a named part, hide it, and select Show all; check part details."},
  {id:"3d-simulation",title:"Simulated beam crossing",instructions:"Toggle Simulate crossing beam and confirm the visible simulated status switches twice."},
  {id:"3d-export",title:"GLB download",instructions:"Export concept GLB on iPhone and confirm it appears in Downloads/Files or Safari download list."},
  {id:"model-editor",title:"3D workshop model and save",instructions:"Open 3D Lab, add starter STL, inspect it and save/reopen scene without losing your original project."},
  {id:"photos",title:"Authentic donor image gallery",instructions:"Open a donor gallery, check a real uploaded annotated photo, zoom and scroll without layout overflow."},
  {id:"offline",title:"Offline core after online load",instructions:"After initial online visit and cache install, use Airplane Mode to reload; confirm offline core and notebook work. Restore connection afterward."},
  {id:"notebook",title:"Notebook autosave and reload",instructions:"Create an explicitly TEST/QA notebook note, reload and confirm it remains. Delete the temporary entry if appropriate."},
  {id:"backup",title:"Export and guarded restore",instructions:"From Settings, export a disposable test backup. Test restore only with known safe throwaway data; preserve your actual backup."},
  {id:"accessibility",title:"Orientation, text and VoiceOver",instructions:"Try portrait/landscape, iOS Display Zoom or larger text, and VoiceOver labels/focus where available."},
]);
export const DEVICE_STATES=Object.freeze(["not-tested","pass","fail","blocked"]);
export function blankIPhoneReport(){
  return {tester:"",deviceModel:"",iosVersion:"",browserVersion:"",testedAt:"",evidenceReference:"",
    overallNotes:"",physicalIPhoneConfirmed:false,
    results:Object.fromEntries(DEVICE_TESTS.map(x=>[x.id,{status:"not-tested",notes:""}]))};
}
export function reviewIPhoneReport(report){
  if(!report||typeof report!=="object"||Array.isArray(report)||!report.results||typeof report.results!=="object")
    throw Error("Invalid iPhone acceptance report.");
  const counts={pass:0,fail:0,blocked:0,"not-tested":0};
  for(const test of DEVICE_TESTS){
    const result=report.results[test.id];
    if(!result||!DEVICE_STATES.includes(result.status)||typeof result.notes!=="string")
      throw Error("Invalid or missing test result: "+test.id);
    counts[result.status]++;
  }
  const identityComplete=["tester","deviceModel","iosVersion","browserVersion","testedAt","evidenceReference"]
    .every(k=>typeof report[k]==="string"&&report[k].trim().length>0);
  const hasRealDeviceClaim=report.physicalIPhoneConfirmed===true;
  const complete=counts["not-tested"]===0&&identityComplete&&hasRealDeviceClaim;
  return {counts,identityComplete,physicalIPhoneConfirmed:hasRealDeviceClaim,
    readyForHumanReview:complete,allOwnerReportedPassed:complete&&counts.pass===DEVICE_TESTS.length,
    evidenceStatus:"OWNER_ENTERED_UNVERIFIED",physicallyVerified:false};
}
function singleLine(value){
  return String(value??"").replace(/[\r\n\t]/g," ").trim().slice(0,2000);
}
export function formatIPhoneReport(report,diagnostics={},timestamp=""){
  const result=reviewIPhoneReport(report);
  const date=timestamp||new Date().toISOString();
  if(Number.isNaN(Date.parse(date)))throw Error("Invalid report export timestamp.");
  const lines=[
    "# McGruber real-iPhone acceptance report — owner entry",
    "",
    "**Evidence classification: OWNER_ENTERED_UNVERIFIED.** No automated test or claimed device identity establishes real-iPhone acceptance.",
    "",
    "- Tester: "+singleLine(report.tester),
    "- Device model (owner reported): "+singleLine(report.deviceModel),
    "- iOS version: "+singleLine(report.iosVersion),
    "- Safari/browser version: "+singleLine(report.browserVersion),
    "- Test date: "+singleLine(report.testedAt),
    "- Tester confirms using a physical iPhone: "+(result.physicalIPhoneConfirmed?"yes (self-reported)":"not confirmed"),
    "- Genuine screenshot/record link: "+singleLine(report.evidenceReference),
    "- Exported UTC: "+date,
    "- Result: "+(result.readyForHumanReview?"READY FOR HUMAN EVIDENCE REVIEW":"INCOMPLETE"),
    "- All owner-reported checks passed: "+(result.allOwnerReportedPassed?"yes":"no"),
    "- Counts: "+DEVICE_STATES.map(k=>k+"="+result.counts[k]).join(", "),
    "",
    "## Checklist observations"
  ];
  for(const t of DEVICE_TESTS){
    const x=report.results[t.id];
    lines.push("- "+t.title+" — **"+x.status+"**"+(x.notes?" — "+singleLine(x.notes):""));
  }
  lines.push("","## Browser diagnostics — software observations only");
  for(const k of ["userAgent","viewport","devicePixelRatio","webgl2","onlineAtCapture","reducedMotion"]){
    lines.push("- "+k+": "+singleLine(diagnostics[k]??"not recorded"));
  }
  lines.push("","## Notes",singleLine(report.overallNotes),"",
    "Human follow-up: attach genuine screenshots or recordings to https://github.com/jimedusot-beep/project-mcgruber/issues/21 .",
    "Automated browser CI, user-agent strings and this export cannot prove physical Safari testing.","");
  return lines.join("\n");
}
