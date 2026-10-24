import { escape, $, $$, heading } from "./ui.js";
import { newId } from "./id.js";
import { download } from "./storage.js";
import { falstadURL, validateRecord } from "./core.js";
import {
  channels, outputs, circuitLinks, condition, makeRule, validateRule,
  validateBrain, initialInputs, stepBrain, makeRecipeExport, parseRecipeImport,
} from "./device-brain-core.js";

const select = (name, values, value) => '<select name="' + name + '">' +
  Object.entries(values).map(([key,label])=>
    '<option value="' + escape(key) + '"' + (key === value ? ' selected' : '') + '>' +
    escape(label) + '</option>').join("") + '</select>';
const conditionUI = (prefix,c,optional=false) =>
  '<div class="brain-condition"><label>'+(optional?"Optional second input":"First input")+
  select(prefix+"input", optional?{none:"No second input",...channels}:channels,c?.input||"none")+'</label>'+
  '<label>Comparison'+select(prefix+"comparator",{above:"At or above",below:"Below"},c?.comparator||"above")+'</label>'+
  '<label>Threshold (%)<input name="'+prefix+'threshold" type="number" min="0" max="100" step="1" value="'+escape(c?.threshold??50)+'"></label></div>';

export function deviceBrainHTML() {
  return heading("Simulation-first electronics · no energized hardware", "Device Brain & Automation Studio",
    "Create reusable input → condition → virtual output recipes. Test them with simulated signals, save your logic and export recipes before connecting real hardware.",
    '<a href="#/assistant" class="button">See inventory readiness →</a>') +
    '<p class="notice"><strong>Simulation only.</strong> No Bluetooth, radio, USB, GPIO, motor, relay or appliance commands are sent. Virtual buzzer, motor and relay indicators never actuate real equipment. Part ratings and real measurements still need verification.</p>'+
    '<div class="two-col brain-layout"><section class="panel"><h2>Virtual test bench</h2><p class="small muted">Inputs are manually simulated at 0–100%. One step = 250 ms of simulated time. Running advances time only while this page is open.</p><div id="brain-inputs"></div>'+
      '<div class="row wrap"><button class="primary" id="brain-step">Step 250 ms</button><button id="brain-play" aria-pressed="false">Run simulation</button><button id="brain-reset">Reset simulation</button></div>'+
      '<div id="brain-clock" class="small muted" role="status">0 ms simulated</div><div id="brain-results" aria-live="polite"></div><button id="brain-log">Save simulated trace to Notebook</button><div id="brain-events" class="small muted"></div></section>'+
    '<section class="panel"><h2>Automation recipes</h2><p class="small muted">Start with one of four edit-friendly recipes or build your own. Every recipe stays local in your existing browser backup.</p>'+
      '<label>Add example<select id="brain-template"><option value="removal">Object-removal indicator</option><option value="beam">Light-beam interruption</option><option value="motion">Motion + armed switch</option><option value="timed">Held button with hold time</option></select></label>'+
      '<div class="row wrap"><button id="brain-add" class="primary">Add selected recipe</button><label class="button">Import recipe JSON<input id="brain-import" type="file" accept=".json,application/json" hidden></label></div>'+
      '<div id="brain-recipes"></div><div id="brain-editor"></div></section></div>'+
    '<section class="panel"><h2>Reusable circuit studies</h2><p>These are original idealized electrical starters for external CircuitJS. A simulated logic recipe is not a verified pin-level schematic or a replacement for the exact component datasheets.</p>'+
      '<div class="row wrap" id="brain-circuits"></div><a href="#/circuit">Open the McGruber Circuit Lab →</a></section>';
}

export function mountDeviceBrain(ctx) {
  if (!ctx.workspace.deviceBrain) ctx.workspace.deviceBrain={rules:[]};
  validateBrain(ctx.workspace.deviceBrain);
  let inputs=initialInputs(), tick=0, state={}, frames=[], trace=[], interval=null, editId=null;
  const store=()=>ctx.workspace.deviceBrain;
  let disposed=false;
  const stop=()=>{if(interval!==null){clearInterval(interval);interval=null;} const button=$("#brain-play");if(button){button.textContent="Run simulation";button.setAttribute("aria-pressed","false");}};
  const reset=()=>{stop();tick=0;state={};frames=[];trace=[];drawOutputs();};
  function drawOutputs(){
    const area=$("#brain-results");if(!area)return;
    $("#brain-clock").textContent=(tick*250)+" ms simulated · "+tick+" steps";
    area.innerHTML = frames.length ? frames.map(f=>{
      const recipe=store().rules.find(r=>r.id===f.id);
      return '<div class="brain-output"><strong>'+escape(recipe?.name||f.id)+'</strong> <span class="pill">'+
        escape(outputs[f.output])+'</span> <span class="pill">'+(f.active?"ACTIVE (virtual)":"Idle")+
        '</span> <small>Events: '+f.events+'</small></div>';
    }).join("") : '<p class="small muted">Add a recipe and step the simulation to see virtual outputs.</p>';
    $("#brain-events").textContent=trace.slice(-8).map(e=>
      (e.time/1000).toFixed(2)+"s — "+e.message).join("\n") || "No transitions yet.";
    $("#brain-events").style.whiteSpace="pre-line";
  }
  function advance(){
    try {
      const result=stepBrain(store(),inputs,state);
      state=result.state;frames=result.frames;tick++;
      for(const f of frames)if(f.rising||f.falling){
        const rule=store().rules.find(r=>r.id===f.id);
        trace.push({time:tick*250,message:(rule?.name||f.id)+" — "+(f.rising?"virtual output ON":"virtual output OFF")});
      }
      trace=trace.slice(-120);
      drawOutputs();
    }catch(e){stop();ctx.notify(e.message);}
  }
  function resetInputs(){
    const holder=$("#brain-inputs");
    holder.innerHTML=Object.entries(channels).map(([key,label])=>
      '<label class="brain-slider">'+escape(label)+' <output id="brain-value-'+key+'">'+inputs[key]+'</output>'+
      '<input type="range" min="0" max="100" step="1" data-brain-input="'+key+'" value="'+inputs[key]+'"></label>').join("");
    $$("[data-brain-input]").forEach(el=>el.oninput=()=>{
      inputs[el.dataset.brainInput]=Number(el.value);
      $("#brain-value-"+el.dataset.brainInput).textContent=el.value;
    });
  }
  function renderRecipes(){
    $("#brain-recipes").innerHTML=store().rules.length
      ?store().rules.map(r=>
        '<article class="brain-recipe"><strong>'+escape(r.name)+'</strong> <span class="pill">'+(r.enabled?"Enabled":"Disabled")+
        '</span><p class="small muted">'+escape(channels[r.first.input])+" "+escape(r.first.comparator)+" "+r.first.threshold+
        (r.second?" "+r.combine.toUpperCase()+" "+escape(channels[r.second.input])+" "+r.second.comparator+" "+r.second.threshold:"")+
        " → "+escape(outputs[r.output])+'</p><div class="row wrap">'+
        '<button data-brain-edit="'+escape(r.id)+'">Edit</button><button data-brain-export="'+escape(r.id)+'">Export</button>'+
        '<button data-brain-delete="'+escape(r.id)+'">Delete</button></div></article>').join("")
      :'<p class="small muted">No saved recipes. Add an example to begin.</p>';
    $$("[data-brain-edit]").forEach(b=>b.onclick=()=>editRecipe(store().rules.find(r=>r.id===b.dataset.brainEdit)));
    $$("[data-brain-export]").forEach(b=>b.onclick=()=>{
      const rule=store().rules.find(r=>r.id===b.dataset.brainExport);
      download(makeRecipeExport(rule),"mcgruber-automation-recipe.json");
    });
    $$("[data-brain-delete]").forEach(b=>b.onclick=()=>{
      const rule=store().rules.find(r=>r.id===b.dataset.brainDelete);
      if(!rule || !confirm("Delete the local recipe “"+rule.name+"”?"))return;
      store().rules=store().rules.filter(r=>r.id!==rule.id);
      ctx.save();reset();renderRecipes();$("#brain-editor").replaceChildren();
    });
  }
  function editRecipe(rule){
    if(!rule)return;
    editId=rule.id;
    $("#brain-editor").innerHTML='<form id="brain-form" class="panel brain-form"><h3>Edit recipe</h3>'+
      '<label>Recipe name<input name="name" required maxlength="100" value="'+escape(rule.name)+'"></label>'+
      '<label><input name="enabled" type="checkbox" '+(rule.enabled?"checked":"")+'> Enabled</label>'+
      conditionUI("first",rule.first)+conditionUI("second",rule.second,true)+
      '<label>Combine inputs'+select("combine",{all:"All (AND)",any:"Either (OR)"},rule.combine)+'</label>'+
      '<div class="form-grid"><label>Consecutive true steps'+
      '<input name="debounce" type="number" min="1" max="20" required value="'+rule.debounce+'"></label>'+
      '<label>Hold output after signal falls (steps)<input name="hold" type="number" min="0" max="40" required value="'+rule.hold+'"></label></div>'+
      '<label>Virtual output'+select("output",outputs,rule.output)+'</label>'+
      '<label>Related project'+select("projectId",Object.fromEntries(ctx.catalog.projects.map(p=>[p.id,p.id+" · "+p.name])),rule.projectId)+'</label>'+
      '<label>Circuit study'+select("circuit",circuitLinks,rule.circuit)+'</label>'+
      '<p class="small muted">Simulated output only. A real circuit needs rated driver, protected power, physical testing, and explicit device permission.</p>'+
      '<div class="row wrap"><button class="primary" type="submit">Save recipe</button><button type="button" id="brain-cancel">Close</button></div>'+
      '<div id="brain-error" role="alert"></div></form>';
    $("#brain-cancel").onclick=()=>{$("#brain-editor").replaceChildren();editId=null;};
    $("#brain-form").onsubmit=e=>{
      e.preventDefault();
      try{
        const d=new FormData(e.currentTarget);
        const optional=d.get("secondinput")==="none"?null:condition(d.get("secondinput"),d.get("secondcomparator"),Number(d.get("secondthreshold")));
        const next={...rule,name:String(d.get("name")).trim(),enabled:d.has("enabled"),
          first:condition(d.get("firstinput"),d.get("firstcomparator"),Number(d.get("firstthreshold"))),
          second:optional,combine:d.get("combine"),debounce:Number(d.get("debounce")),hold:Number(d.get("hold")),
          output:d.get("output"),projectId:d.get("projectId"),circuit:d.get("circuit")};
        validateRule(next);
        const before=store().rules;
        const nextRules=before.map(r=>r.id===rule.id?next:r);
        validateBrain({rules:nextRules});
        store().rules=nextRules;ctx.save();reset();renderRecipes();$("#brain-editor").replaceChildren();
        ctx.notify("Recipe saved locally. Real hardware remains disconnected.");
      }catch(err){$("#brain-error").textContent=err.message;}
    };
    $("#brain-editor").scrollIntoView({block:"nearest"});
  }
  $("#brain-circuits").innerHTML=Object.entries(circuitLinks).map(([type,label])=>
    '<a class="button" href="'+escape(falstadURL(type))+'" target="_blank" rel="noopener">'+escape(label)+' ↗</a>').join("");
  $("#brain-add").onclick=()=>{
    if(store().rules.length>=24){ctx.notify("A maximum of 24 local recipes is supported.");return;}
    const rule=makeRule("AUTO-"+newId(),$("#brain-template").value);
    const next={rules:[...store().rules,rule]};validateBrain(next);
    store().rules=next.rules;ctx.save();reset();renderRecipes();editRecipe(rule);
  };
  $("#brain-import").onchange=async e=>{
    try{
      const file=e.target.files?.[0];if(!file)return;
      if(file.size>12000)throw Error("Recipe JSON exceeds 12 KB.");
      const recipe=parseRecipeImport(await file.text(),"AUTO-"+newId());
      const next={rules:[...store().rules,recipe]};validateBrain(next);
      store().rules=next.rules;ctx.save();reset();renderRecipes();ctx.notify("Recipe imported as a separate local copy; no hardware commands.");
    }catch(err){ctx.notify("Recipe import rejected: "+err.message);}
    e.target.value="";
  };
  $("#brain-step").onclick=advance;
  $("#brain-play").onclick=()=>{
    if(interval!==null){stop();return;}
    interval=setInterval(advance,250);
    $("#brain-play").textContent="Pause simulation";
    $("#brain-play").setAttribute("aria-pressed","true");
  };
  $("#brain-reset").onclick=reset;
  $("#brain-log").onclick=()=>{
    if(tick===0 || !store().rules.length){ctx.notify("Run at least one step with a saved recipe first.");return;}
    const rule=store().rules[0];
    const record={
      id:newId(),name:"Device Brain virtual test — "+rule.name,project:rule.projectId,
      date:new Date().toISOString(),evidence:"Simulation data",result:"Not tested",
      trial:1,criteria:"Virtual rule behavior only; no physical measurement or pass classification.",
      instrument:"",voltage:"",current:"",attachments:[],componentIds:"",
      observations:"Simulated "+tick+" steps, virtual transitions: "+trace.length+". No hardware connected.",
      configuration:{source:"device-brain",inputs:{...inputs},rules:structuredClone(store().rules),
        samples:frames.length? [{time:tick*250,value:inputs[rule.first.input],output:!!state[rule.id]?.active}]:[]},
    };
    validateRecord(record);
    ctx.workspace.records.unshift(record);ctx.save();
    ctx.notify("Simulation-only evidence saved to your private Notebook.");
  };
  resetInputs();renderRecipes();drawOutputs();
  return ()=>{disposed=true;stop();};
}
