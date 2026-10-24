import { newId } from "./id.js";
import { escape, $, $$, heading, safeUrl } from "./ui.js";
import { addMedia, read, mediaBlob, download } from "./storage.js";
import { calculate } from "./core.js";
import { deviceKinds, teardownSteps, salvageReferences, assessPower, projectMatches, planNumericFields } from "./salvage-core.js";

const options = (items, selected) => Object.entries(items).map(([v, label]) => `<option value="${escape(v)}" ${v === selected ? "selected" : ""}>${escape(label)}</option>`).join("");
const input = (name, label, value = "", type = "text") => `<label>${escape(label)}<input name="${name}" type="${type}" ${type === "number" ? 'step="any" min="0" max="1000000"' : 'maxlength="5000"'} value="${escape(value)}"></label>`;
export function matchHTML(catalog, inventory) {
  return `<p class="muted">Based on explicit requirement associations, positive quantities and your recorded passing tests. Counts describe a parts shortlist for the original component route; they do not verify electrical fit, quantities for a final assembly, or a completed build. Alternative routes need their own review.</p><div class="match-grid">${projectMatches(catalog, inventory).map(({ project, requirements, covered, total }) => `<article class="panel match-card"><div class="row between"><span class="eyebrow">${project.id}</span><span class="pill">${covered}/${total} tested categories</span></div><h3><a href="#/project/${project.id}">${escape(project.name)} →</a></h3><progress value="${covered}" max="${total || 1}" aria-label="Tested categories for ${escape(project.name)}"></progress><details><summary>${covered === total ? "Shortlist complete; review fit" : "See missing parts and next tests"}</summary><ul>${requirements.map((r) => `<li><strong>${escape(r.component)}</strong><br><span class="small">${r.state === "tested" ? "Passing test recorded: " + escape(r.tested.map((p) => p.name).join(", ")) : r.state === "needs-test" ? "Needs a recorded test: " + escape(r.candidates.map((p) => p.name).join(", ")) : "No inventory candidate associated"}</span></li>`).join("")}</ul></details></article>`).join("")}</div>`;
}
export function salvageHTML() {
  return `${heading("Find the next life in your spare parts", "Salvage workbench", "Photograph a donor. Recover a part. Record a test. Plan its power.", '<button id="new-donor" class="primary">+ Add donor device</button>')}<div id="donor-editor"></div><div class="salvage-layout"><aside class="panel salvage-devices"><h2>Your donor devices</h2><div id="donor-list"></div></aside><section id="salvage-workbench"></section></div><section class="salvage-matches"><div class="section-title"><h2>What can I build with my parts?</h2><a href="#/components">Open component bank →</a></div><div id="salvage-matches"></div></section>`;
}
export function mountSalvage(ctx, deviceId) {
  const state = ctx.workspace.salvage;
  let selected = state.devices.find((d) => d.id === deviceId) || state.devices[0], tab = "teardown", photoId, urls = [], disposed = false;
  const release = () => { urls.forEach((u) => URL.revokeObjectURL(u)); urls = []; };
  const save = () => { ctx.save(); renderList(); };
  function renderList() {
    $("#donor-list").innerHTML = state.devices.length ? state.devices.map((d) => `<button class="donor-item ${d === selected ? "selected" : ""}" data-donor="${escape(d.id)}"><strong>${escape(d.name)}</strong><small>${escape(deviceKinds[d.kind])} · ${ctx.workspace.inventory.filter((p) => p.sourceDeviceId === d.id).length} parts</small></button>`).join("") : '<p class="muted">Start with a mouse, landline phone, or another small device.</p>';
    $$("[data-donor]").forEach((b) => b.onclick = () => { selected = state.devices.find((d) => d.id === b.dataset.donor); photoId = null; renderList(); renderWorkbench(); });
    $("#salvage-matches").innerHTML = matchHTML(ctx.catalog, ctx.workspace.inventory);
  }
  function editDonor(d) {
    $("#donor-editor").innerHTML = `<form id="donor-form" class="panel"><div class="section-title"><h2>${d ? "Edit donor" : "Add a donor device"}</h2><button type="button" id="close-donor">Close</button></div><div class="form-grid">${input("name", "Device name", d?.name)}<label>Device type<select name="kind" aria-label="Device type">${options(deviceKinds, d?.kind || "mouse")}</select></label>${input("model", "Exact model / label", d?.model)}${input("goal", "What would you like to reuse?", d?.goal)}${input("manualUrl", "Model-specific guide HTTPS URL", d?.manualUrl)}<label>Notes<textarea name="notes" maxlength="5000">${escape(d?.notes)}</textarea></label></div><p id="donor-error" role="alert"></p><button class="primary">Save donor device</button></form>`;
    $("#donor-form [name=name]").required = true;
    $("#close-donor").onclick = () => $("#donor-editor").replaceChildren();
    $("#donor-form").onsubmit = (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target));
      if (!data.name.trim() || (data.manualUrl && !safeUrl(data.manualUrl))) { $("#donor-error").textContent = "Enter a name and a valid HTTPS guide URL, or leave the URL blank."; return; }
      if (d && d.kind !== data.kind) { d.steps = []; d.isolated = false; }
      if (d) Object.assign(d, data);
      else { d = { ...data, id: "DEVICE-" + newId(), isolated: false, steps: [], photos: [] }; state.devices.push(d); }
      selected = d; tab = "teardown"; save(); renderWorkbench(); $("#donor-editor").replaceChildren();
    };
  }
  function renderWorkbench() {
    release();
    const host = $("#salvage-workbench"), d = selected;
    if (!d) { host.innerHTML = '<div class="panel salvage-welcome"><span class="eyebrow">A useful place to begin</span><h2>Give an old mouse a new job.</h2><p>Add its model, take photos, label candidate switches, and keep your contact tests beside the parts you recover. Phone guides adapt to corded or cordless devices.</p><button id="start-mouse" class="primary">Start a salvage record</button></div>'; $("#start-mouse").onclick = () => editDonor(); return; }
    host.innerHTML = `<div class="panel"><div class="section-title"><div><span class="eyebrow">${escape(deviceKinds[d.kind])}</span><h2>${escape(d.name)}</h2><p class="muted">${escape(d.model || "Model not yet recorded")} · ${escape(d.goal || "Choose what to recover")}</p></div><button id="edit-donor">Edit donor</button></div>${safeUrl(d.manualUrl) ? `<a href="${escape(safeUrl(d.manualUrl))}" target="_blank" rel="noopener">Your model-specific guide ↗</a>` : ""}<nav class="salvage-tabs" aria-label="Salvage stages">${Object.entries({teardown:"1. Teardown",photos:"2. Photos & labels",parts:"3. Parts & tests",power:"4. Battery & power"}).map(([id,label])=>`<button data-salvage-tab="${id}" aria-pressed="${tab===id}">${label}</button>`).join("")}</nav><div id="salvage-stage"></div></div>`;
    $("#edit-donor").onclick = () => editDonor(d);
    $$("[data-salvage-tab]").forEach((b) => b.onclick = () => { tab = b.dataset.salvageTab; renderWorkbench(); });
    if (tab === "teardown") mountTeardown(d);
    else if (tab === "photos") mountPhotos(d);
    else if (tab === "parts") mountParts(d);
    else mountPower(d);
  }
  function mountTeardown(d) {
    $("#salvage-stage").innerHTML = `<p class="muted">A general preparation checklist. Use your exact model's procedure for screw locations and disassembly. The phone route covers disconnected equipment only.</p><label class="notice"><input id="donor-isolated" type="checkbox" ${d.isolated ? "checked" : ""}> I disconnected all sources, including USB, telephone line, adapter and removable batteries as applicable.</label><ol class="teardown-steps">${teardownSteps(d.kind).map((text,i)=>`<li><label><input data-teardown-step="${i}" type="checkbox" ${d.steps[i] ? "checked" : ""} ${i > 1 && !d.isolated ? "disabled" : ""}><span>${escape(text)}</span></label></li>`).join("")}</ol><p class="small muted">${d.steps.filter(Boolean).length}/6 preparation steps recorded. Part function and power ratings need separate evidence.</p><details><summary>Reference examples and testing guidance</summary><ul>${salvageReferences.map(([label,url])=>`<li><a href="${escape(url)}" target="_blank" rel="noopener">${escape(label)} ↗</a></li>`).join("")}</ul></details>`;
    $("#donor-isolated").onchange = (e) => { d.isolated = e.target.checked; if (!d.isolated) d.steps = d.steps.map((v,i)=>i<2&&v); save(); mountTeardown(d); };
    $$("[data-teardown-step]").forEach((el)=>el.onchange=()=>{ d.steps[Number(el.dataset.teardownStep)] = el.checked; d.steps = Array.from({length:6},(_,i)=>!!d.steps[i]); save(); });
  }
  async function mountPhotos(d) {
    const stage = $("#salvage-stage");
    const photo = d.photos.find((p)=>p.id===photoId) || d.photos[0];
    photoId = photo?.id;
    stage.innerHTML = `<p>Photograph the board before removing parts. Add a short label, choose a linked part if known, then tap its location on the photo.</p><label class="button">Add teardown photos<input id="donor-photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden></label><p class="small muted">Up to 20 photos, 12 MB each. Photos and labels stay in your local backup.</p><div class="row wrap">${d.photos.map((p,i)=>`<button data-select-photo="${escape(p.id)}" aria-pressed="${p===photo}">Photo ${i+1}</button>`).join("")}</div>${photo ? `<div class="photo-annotation" id="annotation-photo"><img id="teardown-image" alt="Your teardown photo; labels listed below"><div id="annotation-markers"></div></div><div class="form-grid">${input("annotation-label", "New photo label", "")}<label>Link a recovered part<select id="annotation-part" aria-label="Link a recovered part"><option value="">No part linked yet</option>${ctx.workspace.inventory.filter((p)=>p.sourceDeviceId===d.id).map((p)=>`<option value="${escape(p.id)}">${escape(p.name)}</option>`).join("")}</select></label></div><button id="add-center-label">Add label at photo center</button><button id="remove-photo" class="danger">Remove this photo</button><div id="annotation-error" role="alert"></div><ol id="annotation-list"></ol>` : '<p class="empty">No photos yet. Add your own photo to start labeling.</p>'}`;
    $("#donor-photos").onchange = async (event) => {
      const files = [...event.target.files], workspace = ctx.workspace;
      try {
        if (files.length + d.photos.length > 20) throw Error("Use at most 20 photos per device.");
        for (const file of files) {
          if (!file.type.startsWith("image/")) throw Error("Choose a supported photo.");
          const mediaId = await addMedia(file);
          if (ctx.workspace !== workspace) throw Error("Workspace changed; add the photo again to the current version.");
          const p = {id:newId(),mediaId,annotations:[]}; d.photos.push(p); photoId = p.id; ctx.save();
        }
        if (!disposed && tab === "photos" && selected===d) renderWorkbench();
      } catch (e) { ctx.notify(e.message); }
    };
    $$("[data-select-photo]").forEach((b)=>b.onclick=()=>{photoId=b.dataset.selectPhoto;renderWorkbench();});
    if (!photo) return;
    const renderLabels = () => {
      $("#annotation-markers").innerHTML = photo.annotations.map((a,i)=>`<span class="photo-marker" style="left:${a.x*100}%;top:${a.y*100}%" title="${escape(a.label)}">${i+1}</span>`).join("");
      $("#annotation-list").innerHTML = photo.annotations.map((a)=>`<li>${escape(a.label)} ${a.partId ? `<a href="#/components/${encodeURIComponent(d.id)}/${encodeURIComponent(a.partId)}">Open linked part →</a>` : ""} <button data-remove-label="${escape(a.id)}">Remove label</button></li>`).join("");
      $$("[data-remove-label]").forEach((b)=>b.onclick=()=>{photo.annotations=photo.annotations.filter((a)=>a.id!==b.dataset.removeLabel);save();renderLabels();});
    };
    const addLabel = (x,y) => {
      const label = $('[name="annotation-label"]').value.trim();
      if (!label || label.length>140 || photo.annotations.length>=50) { $("#annotation-error").textContent="Use a label of 1–140 characters, up to 50 per photo."; return; }
      photo.annotations.push({id:newId(),x,y,label,partId:$("#annotation-part").value});save();renderLabels();$("#annotation-error").textContent="Label saved.";
    };
    $("#teardown-image").onclick = (e) => { const r=e.target.getBoundingClientRect();addLabel(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))); };
    $("#add-center-label").onclick=()=>addLabel(0.5,0.5);
    $("#remove-photo").onclick=()=>{d.photos=d.photos.filter((p)=>p!==photo);photoId=null;save();renderWorkbench();};
    renderLabels();
    const record = await read("media",photo.mediaId);
    if (disposed || selected!==d || tab!=="photos" || photoId!==photo.id || !$("#teardown-image")) return;
    if (record) { const url=URL.createObjectURL(mediaBlob(record));urls.push(url);$("#teardown-image").src=url; }
    else $("#annotation-error").textContent="Photo data is missing. Restore a full backup containing this attachment.";
  }
  function mountParts(d) {
    const parts=ctx.workspace.inventory.filter((p)=>p.sourceDeviceId===d.id);
    $("#salvage-stage").innerHTML=`<p>Keep each recovered part linked to this donor. Record its markings, storage location, requirements and a repeatable test.</p><a class="button primary" href="#/components/${encodeURIComponent(d.id)}">+ Recover / identify a part</a><div class="component-grid salvage-part-grid">${parts.map((p)=>`<article class="panel"><span class="eyebrow">${escape(p.id)}</span><h3>${escape(p.name)}</h3><p>Test: ${escape(p.test?.result||"Not tested")} · ${escape(p.location||"Location not recorded")}</p><a class="button" href="#/components/${encodeURIComponent(d.id)}/${encodeURIComponent(p.id)}">Identification & tests →</a><button data-plan-part="${escape(p.id)}">Plan power</button></article>`).join("")||'<p class="muted">No recovered parts recorded yet.</p>'}</div>`;
    $$("[data-plan-part]").forEach((b)=>b.onclick=()=>{tab="power";mountPowerSelection=b.dataset.planPart;renderWorkbench();});
  }
  let mountPowerSelection;
  function mountPower(d) {
    const parts=ctx.workspace.inventory.filter((p)=>p.sourceDeviceId===d.id), part=parts.find((p)=>p.id===mountPowerSelection)||parts[0];
    $("#salvage-stage").innerHTML=`<h3>Plan an isolated battery supply</h3><p class="muted">Enter documented operating ranges, including a fresh battery's highest voltage and its lowest loaded voltage. Blank fields stay unknown. This checks a proposed low-voltage path; it does not perform a physical test or design a charger.</p><label>Recovered part<select id="power-part" aria-label="Recovered part"><option value="">Choose a part</option>${parts.map((p)=>`<option value="${escape(p.id)}" ${p===part?"selected":""}>${escape(p.name)}</option>`).join("")}</select></label><div id="power-plan-editor"></div><details class="worked-example"><summary>Worked example: mouse switch → battery-powered LED indicator</summary><p>Teaching values only. A switch carries the load current; it is not connected straight across a battery. Map the actual contacts and check their DC ratings first. Use a protected holder and disconnect switch. No telephone line or mains connection is used.</p><div class="form-grid">${input("example-max", "Example highest supply (V)",3.2,"number")}${input("example-vf", "Example LED forward voltage (V)",2,"number")}${input("example-ma", "Example LED current (mA)",5,"number")}</div><button id="calculate-example">Calculate example resistor</button><div id="example-result" role="status"></div><p>Series path: holder + → protection / disconnect → identified switch contacts → resistor → LED anode. LED cathode → holder −. The resistor and LED limits must fit the full supply range; low battery voltage may dim it.</p><a href="#/project/P04/guide">Open the object-removal alarm build →</a></details>`;
    $("#power-part").onchange=(e)=>{mountPowerSelection=e.target.value;renderWorkbench();};
    $("#calculate-example").onclick=()=>{
      try {const r=calculate("led",{source:$('[name="example-max"]').value,forward:$('[name="example-vf"]').value,current:$('[name="example-ma"]').value,rating:0.25});$("#example-result").textContent=`Teaching result: ${r["Next E24 resistance (Ω)"]} Ω; ${(r["Modeled current (mA)"]).toFixed(2)} mA; resistor dissipation ${r["Resistor power (W)"].toFixed(4)} W; minimum 2× power margin ${r["Suggested minimum rating with 2× margin (W)"].toFixed(4)} W. Replace every example value with evidence for your parts.`;} catch(e){$("#example-result").textContent=e.message;}
    };
    if (!part) {$("#power-plan-editor").innerHTML='<p class="notice">Record a recovered part in Parts & tests first. The worked example is available below.</p>';return;}
    if (["switch","mechanical","unknown"].includes(part.kind || "unknown")) {
      const message = part.kind === "switch"
        ? "A switch controls a load; it does not need its own battery across the contacts. Start with the LED indicator example below, map the contacts, and check their DC ratings. Identify the powered load separately to compare battery supplies."
        : part.kind === "mechanical" ? "This mechanical part needs no electrical supply. Choose an identified motor or other powered assembly when adding actuation."
          : "Identify this part and its operating requirements before choosing a battery. Its original donor supply does not establish the recovered part's ratings.";
      $("#power-plan-editor").innerHTML=`<div class="notice"><h3>${part.kind === "switch" ? "Power the load, use the switch to control it" : "Start with identification"}</h3><p>${message}</p><a href="#/components/${encodeURIComponent(d.id)}/${encodeURIComponent(part.id)}">Open this part's identification and tests →</a></div>`;
      if (part.kind === "switch") $(".worked-example").open=true;
      return;
    }
    let plan=state.plans.find((p)=>p.partId===part.id);
    if (!plan) plan={id:"POWER-"+newId(),partId:part.id,topology:"unknown",sourceKind:"aa-holder",polarityChecked:false,supportChecked:false,sourceProtected:false};
    const group=(title,fields)=>`<fieldset><legend>${title}</legend><div class="form-grid">${fields.map(([key,label])=>input(key,label,plan[key],"number")).join("")}</div></fieldset>`;
    $("#power-plan-editor").innerHTML=`<p><a href="#/components/${encodeURIComponent(d.id)}/${encodeURIComponent(part.id)}">Edit ${escape(part.name)} ratings, terminals and evidence →</a></p><form id="power-form"><div class="form-grid">${input("sourceName","Battery / supply model",plan.sourceName)}<label>Supply type<select name="sourceKind" aria-label="Supply type">${options({"aa-holder":"AA / AAA holder with identified cells","usb-pack":"Finished USB battery bank","protected-pack":"Finished protected battery pack"},plan.sourceKind)}</select></label>${input("sourceEvidence","Supply rating evidence / reference",plan.sourceEvidence)}<label>Supply path<select name="topology" aria-label="Supply path">${options({unknown:"Not chosen",direct:"Direct regulated / compatible supply",buck:"Buck module (step down)",boost:"Boost module (step up)","buck-boost":"Buck-boost module"},plan.topology)}</select></label></div>${group("Battery / source limits",[["sourceMinV","Lowest loaded source voltage (V)"],["sourceMaxV","Highest source voltage (V)"],["sourceCurrentMa","Source continuous current capability (mA)"]])}<details ${!["direct","unknown"].includes(plan.topology)?"open":""}><summary>Regulator module specifications</summary><div class="form-grid">${input("regulatorName","Exact regulator module",plan.regulatorName)}${input("regulatorEvidence","Regulator evidence and operating conditions",plan.regulatorEvidence)}</div>${group("Input, output and load limits",[["inputMinV","Regulator minimum input (V)"],["inputMaxV","Regulator maximum input (V)"],["outputMinV","Minimum output including tolerance (V)"],["outputMaxV","Maximum output including tolerance (V)"],["outputCurrentMa","Output current at lowest input (mA)"],["efficiency","Efficiency fraction (0–1)"]])}</details><div class="power-confirmations">${[["polarityChecked","I identified connector orientation, supply + and return from evidence."],["sourceProtected","I recorded a suitable holder / protected supply, current protection and a disconnect switch."],["supportChecked","Any required LED current limiting, motor driver / suppression, or audio bias / amplifier is documented for this assembly."]].map(([k,label])=>`<label><input type="checkbox" name="${k}" ${plan[k]?"checked":""}>${label}</label>`).join("")}</div><details><summary>Optional runtime estimate</summary><p class="small muted">Enter capacity at the stated nominal voltage. A bank's internal-cell mAh rating is not its output mAh rating. This energy estimate uses running current and maximum output voltage; it omits idle losses, aging, temperature and duty cycles.</p>${group("Capacity assumptions",[["capacityMah","Capacity at nominal voltage (mAh)"],["nominalV","Nominal voltage of that capacity rating (V)"],["usable","Usable capacity fraction (0–1)"]])}</details><label>Protection, wiring and first-test notes<textarea name="notes" maxlength="5000">${escape(plan.notes)}</textarea></label><p class="small muted">Plans save as you edit. For a rechargeable pack use its specified charger; this planner provides no charging wiring.</p></form><div id="power-result" role="status"></div><button id="export-power-plan">Export power plan JSON</button>`;
    const update=()=>{
      const fd=new FormData($("#power-form"));
      for (const key of [...planNumericFields,"sourceName","sourceKind","sourceEvidence","topology","regulatorName","regulatorEvidence","notes"]) plan[key]=fd.get(key)||"";
      for (const key of ["polarityChecked","supportChecked","sourceProtected"]) plan[key]=fd.has(key);
      if (!state.plans.includes(plan)) state.plans.push(plan);
      ctx.save();showResult();
    };
    const showResult=()=>{
      const result=assessPower(part,plan), okay=result.status==="candidate";
      $("#power-result").innerHTML=`<div class="notice ${okay?"power-candidate":""}"><h3>${okay?"Entered checks satisfied — prepare a controlled test":"More evidence or a different supply is needed"}</h3><p>Suggested path from voltage ranges: <strong>${escape(result.topology)}</strong>. A selected module still needs its exact operating limits, thermal and transient review.</p>${result.issues.length?`<ul>${result.issues.map((s)=>`<li>${escape(s)}</li>`).join("")}</ul>`:"<p>This is a calculated candidate based on your entries. Use a suitably current-limited first test, measure the supply before connecting the identified load, and record the result.</p>"}<p>Include: ${escape(result.required.join("; "))}.</p>${result.runtimeHours!==null?`<p>Approximate energy-based runtime: ${result.runtimeHours.toFixed(2)} h under the entered assumptions.</p>`:""}${okay?`<p class="connection-path">${escape(plan.sourceName)} + → protection / disconnect → ${plan.topology==="direct"?"identified load support circuit":escape(plan.regulatorName)+" → load support circuit"} → ${escape(electricalTerminal(part,"positive"))}<br>${escape(electricalTerminal(part,"negative"))} → documented return path → supply −</p><p class="small">Block-level connection plan, not a model-specific pin drawing. Verify every terminal and supporting circuit against your references.</p>`:""}</div>`;
    };
    $("#power-form").oninput=update;$("#power-form").onchange=update;$("#power-form").onsubmit=(e)=>e.preventDefault();
    $("#export-power-plan").onclick=()=>download(JSON.stringify({application:"mcgruber-power-plan",version:1,part,plan,assessment:assessPower(part,plan)},null,2),"mcgruber-power-plan.json");
    showResult();
  }
  $("#new-donor").onclick=()=>editDonor();renderList();renderWorkbench();
  return ()=>{disposed=true;release();};
}
const electricalTerminal=(part,key)=>part.electrical?.[key]||"unidentified terminal";
