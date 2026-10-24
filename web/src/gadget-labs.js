import {escape, $, $$, heading} from "./ui.js";
import {download} from "./storage.js";
import {newId} from "./id.js";
import {validateRecord} from "./core.js";
import {gadgetReferences} from "./gadget-references.js";
import {GADGET_LABS,getLab,runGadgetLab,labWorksheet,freshGadgetLabs,progressFor,setReview,validateGadgetLabs} from "./gadget-lab-core.js";

export function gadgetLabsHTML(){
 return heading("Six experiments from gadgets we want to understand","Simulation & Build-Readiness Labs",
   "Reusable virtual ESP32, BLE, SDR and repair exercises. Track real-world blockers separately; none of these demonstrations uses a physical device.",
   '<a class="button" href="#/gadgets">All 13 research concepts →</a>')+
   '<p class="notice"><strong>Offline simulated data only.</strong> No radio scanning, tracker locating, spectrum receiver, firmware execution, heating element or GPIO interface is connected. “Reviewed” means a requirement was read, not that parts were tested or qualified.</p>'+
   '<div class="component-grid gadget-lab-menu" id="gadget-lab-menu"></div>'+
   '<div id="gadget-lab-workspace"></div>';
}
function samplePlot(output){
 const values=output.samples.map(x=>x.value);
 const max=Math.max(100,...values),w=640,h=135,margin=12;
 const points=values.map((v,i)=>({
   x:Math.round(16+i/Math.max(1,values.length-1)*(w-32)),
   y:Math.round(h-margin-v/max*(h-margin*2))
 }));
 return '<svg class="lab-signal-chart" viewBox="0 0 640 135" width="100%" role="img" aria-label="Synthetic signal plot: '+escape(output.unit)+'">'+
   '<rect x="0" y="0" width="640" height="135" rx="7" fill="currentColor" opacity=".03"/>'+
   '<path d="M16 12 V123 H624" fill="none" stroke="currentColor" opacity=".22"/>'+
   '<polyline points="'+points.map(p=>p.x+","+p.y).join(" ")+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>'+
   points.map(p=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="2.5" fill="currentColor"/>').join("")+'</svg>';
}
export function mountGadgetLabs(ctx,requestedId){
 if(ctx.workspace.gadgetLabs == null)ctx.workspace.gadgetLabs=freshGadgetLabs();
 validateGadgetLabs(ctx.workspace.gadgetLabs);
 let selected=getLab(requestedId)?.id||"G07",output=null,scenario="",level=50;
 const container=$("#gadget-lab-workspace"),menu=$("#gadget-lab-menu");
 function renderMenu(){
  menu.innerHTML=GADGET_LABS.map(l=>{
    const p=progressFor(l.id,ctx.workspace.gadgetLabs);
    return '<a class="panel gadget-lab-link" href="#/labs/'+l.id+'"'+(selected===l.id?' aria-current="page"':'')+
      '><span class="eyebrow">'+l.id+' · '+escape(l.mode)+'</span><strong>'+escape(l.title)+'</strong>'+
      '<span class="small muted">Reviews: '+p.reviewed+'/'+p.total+' (not certified)</span></a>';
  }).join("");
 }
 function render(){
  const lab=getLab(selected),source=gadgetReferences.find(x=>x.id===selected);
  const reviewed=new Set(ctx.workspace.gadgetLabs.reviewed[selected]||[]);
  const p=progressFor(selected,ctx.workspace.gadgetLabs);
  if(!lab.scenarios.some(s=>s[0]===scenario)){scenario=lab.scenarios[0][0];output=null;}
  container.innerHTML='<div class="two-col gadget-lab-layout"><section class="panel"><span class="eyebrow">'+
    escape(lab.id)+' · '+escape(lab.mode)+'</span><h2>'+escape(lab.title)+'</h2><p>'+escape(lab.description)+'</p>'+
    '<label>Choose fictional scenario<select id="gadget-lab-scenario">'+lab.scenarios.map(([k,name])=>
       '<option value="'+k+'"'+(k===scenario?' selected':'')+'>'+escape(name)+'</option>').join("")+'</select></label>'+
    '<label>Scenario sensitivity / variation <output id="gadget-lab-level-label">'+level+'</output>'+
    '<input id="gadget-lab-level" type="range" min="0" max="100" step="1" value="'+level+'"></label>'+
    '<div class="row wrap"><button class="primary" type="button" id="gadget-lab-run">Run fictional scenario</button>'+
    '<button type="button" id="gadget-lab-reset">Reset result</button></div>'+
    '<div id="gadget-lab-result" aria-live="polite"></div>'+
    '<p class="small muted">'+escape(lab.caution)+'</p>'+
    '<div class="row wrap"><button id="gadget-lab-log" type="button" disabled>Save simulation to Notebook</button>'+
    '<a class="button" href="#/device-brain">Open shared Device Brain →</a></div>'+
    '</section><section class="panel"><h2>Build-readiness reviews</h2>'+
    '<p id="gadget-lab-progress" role="status"><strong>'+p.reviewed+'/'+p.total+'</strong> reviewed. <strong>No physical build qualification implied.</strong></p>'+
    '<p class="small muted">Check after considering each requirement. These boxes track review, not electrical performance or purchase readiness.</p>'+
    '<div id="gadget-lab-checks">'+lab.checks.map(c=>
      '<label class="lab-review-item"><input type="checkbox" data-lab-check="'+escape(c.id)+'"'+
      (reviewed.has(c.id)?" checked":"")+'><span><strong>'+escape(c.name)+'</strong><small>'+escape(c.detail)+'</small></span></label>').join("")+'</div>'+
    '<div class="row wrap"><button id="gadget-lab-worksheet" type="button">Download detailed build checklist</button>'+
    '<button id="gadget-lab-clear" type="button">Clear review marks</button></div>'+
    '<p class="small muted">Existing salvage leads: '+(source.leads.length?source.leads.map(id=>escape(id)).join(", "):"none established")+
    '. All require physical identification, datasheets and actual testing. <a href="#/components">Check inventory →</a></p>'+
    '</section></div>'+
    '<section class="panel"><h2>Related McGruber workshop tools</h2><div class="row wrap">'+
    '<a class="button" href="#/project/'+lab.project+'/guide">Original invention guide</a>'+
    '<a class="button" href="#/salvage">Salvage Workbench</a>'+
    '<a class="button" href="#/circuit">Circuit Lab</a>'+
    '<a class="button" href="#/settings">Encrypted backups & settings</a></div></section>';
  $("#gadget-lab-scenario").onchange=e=>{scenario=e.target.value;output=null;render();};
  $("#gadget-lab-level").oninput=e=>{level=Number(e.target.value);$("#gadget-lab-level-label").textContent=String(level);};
  $("#gadget-lab-run").onclick=()=>{
    try{output=runGadgetLab(selected,scenario,level);renderResult();}
    catch(e){ctx.notify(e.message);}
  };
  $("#gadget-lab-reset").onclick=()=>{output=null;renderResult();};
  $("#gadget-lab-log").onclick=saveObservation;
  $("#gadget-lab-worksheet").onclick=()=>download(labWorksheet(selected,ctx.workspace.gadgetLabs),
      "mcgruber-"+selected.toLowerCase()+"-readiness.md","text/markdown");
  $("#gadget-lab-clear").onclick=()=>{
    ctx.workspace.gadgetLabs={...ctx.workspace.gadgetLabs,reviewed:{...ctx.workspace.gadgetLabs.reviewed,[selected]:[]}};
    ctx.save();render();renderMenu();
  };
  $$("[data-lab-check]").forEach(b=>b.onchange=e=>{
    try{
      ctx.workspace.gadgetLabs=setReview(ctx.workspace.gadgetLabs,selected,e.target.dataset.labCheck,e.target.checked);
      ctx.save();
      const p=progressFor(selected,ctx.workspace.gadgetLabs);
      $("#gadget-lab-progress").innerHTML="<strong>"+p.reviewed+"/"+p.total+
       "</strong> reviewed. <strong>No physical build qualification implied.</strong>";
      renderMenu();
    }catch(err){ctx.notify(err.message);render();}
  });
  renderResult();
 }
 function renderResult(){
  const element=$("#gadget-lab-result");if(!element)return;
  const button=$("#gadget-lab-log");if(button)button.disabled=!output;
  if(!output){
    element.innerHTML='<p class="small muted">Run a scenario to inspect generated synthetic samples. This screen never scans hardware.</p>';
    return;
  }
  element.innerHTML='<h3>'+escape(output.headline)+'</h3>'+samplePlot(output)+
    '<p class="small">'+escape(output.finding)+'</p>'+
    '<details><summary>Inspect '+output.samples.length+' individual fictional observations</summary>'+
    '<div class="lab-sample-table"><table><thead><tr><th>Step / bin</th><th>Generated value</th><th>Meaning</th></tr></thead><tbody>'+
    output.samples.map(s=>'<tr><td>'+escape(s.label)+'</td><td>'+s.value+'</td><td>'+escape(s.note)+'</td></tr>').join("")+
    '</tbody></table></div></details>'+
    '<p class="notice">'+escape(output.caution)+'</p>';
 }
 function saveObservation(){
   if(!output)return;
   const lab=getLab(selected);
   const result={
     id:newId(),name:"Gadget Lab simulation — "+lab.title,date:new Date().toISOString(),project:lab.project,
     evidence:"Simulation data",result:"Not tested",trial:1,
     configuration:{source:"gadget-lab",gadgetId:selected,scenario,level,
       samples:output.samples.map((s,i)=>({time:i*250,value:s.value,output:!!s.active}))},
     componentIds:"",criteria:"Virtual scenario only. Verify real parts and repeat actual measurements independently.",
     instrument:"",voltage:"",current:"",attachments:[],
     observations:output.headline+" — "+output.finding+" "+output.caution+
       " No hardware was attached, scanned, powered or tested."
   };
   try{
     validateRecord(result);
     ctx.workspace.records.unshift(result);ctx.save();
     ctx.notify("Simulation-only observation saved in your private Notebook.");
   }catch(e){ctx.notify("Could not record simulation: "+e.message);}
 }
 renderMenu();render();
}
