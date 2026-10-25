import { photoIdentificationsHTML } from "./photo-identifications.js";
import { newId } from "./id.js";
import { escape, $, $$, heading, safeUrl } from "./ui.js";
import { download } from "./storage.js";
import { csvExport } from "./core.js";
import { partKinds, unpoweredTests, validateInventoryPart } from "./salvage-core.js";
import { matchHTML } from "./salvage.js";
import { referenceInventoryHTML, referenceToPersonalPart } from "./rev4-inventory.js";
import { ownerArrivalsHTML, arrivalToPersonalPart } from "./new-arrivals.js";
export function inventoryHTML() {
  return `${heading("Make the most of what you have", "Component bank", "Sixteen requirements, twelve earlier equipment reports, your 23-entry Rev 4 salvage reference, and separately tracked new arrivals.", '<button id="add-component" class="primary">+ Identify / add a part</button><a class="button" href="#/assistant">What can I build? →</a>')}<div class="notice">Reported ownership is separate from tested function. The dependency matrix describes planned use, not established electrical compatibility. Unknown salvaged parts retain unknown pinouts.</div><div class="row wrap tools"><label class="search">Search components & equipment<input id="component-search" type="search" placeholder="Switch, Fluke, sensor, asset ID…"></label><label>View<select id="component-view"><option value="requirements">16 component requirements</option><option value="equipment">12 earlier equipment groups</option><option value="reference">23 Rev 4 reference entries</option><option value="arrivals">New arrivals · owned kits</option><option value="photos">Photo identifications · Oct 25</option><option value="personal">My identified inventory</option><option value="dependencies">Project dependencies</option></select></label><label>Category / status<select id="component-filter"><option value="all">All</option><option>Detection</option><option>Control</option><option>Outputs</option><option>Power and Construction</option><option>Owned</option><option>Needed</option><option>Salvaged</option><option>Donated</option><option>Purchased</option><option>Unverified</option><option>Optics</option><option>Power</option><option>Wiring</option><option>Other</option><option>Workshop tools and consumables</option></select></label><button id="component-export">Export my inventory CSV</button></div><div id="component-editor"></div><div id="component-compare"></div><div id="component-results"></div>`;
}
export function mountInventory(ctx, { deviceId, partId } = {}) {
  let compared = new Set();
  function allItems() {
    return [
      ...ctx.catalog.components.map((c) => ({ ...c, name: c.component })),
      ...ctx.workspace.inventory,
    ];
  }
  function compare() {
    const list = allItems().filter((c) => compared.has(c.id));
    $("#component-compare").innerHTML =
      list.length < 2
        ? ""
        : `<div class="panel table-scroll"><h2>Compare parts</h2><table><thead><tr><th>Property</th>${list.map((c) => `<th>${escape(c.name)}</th>`).join("")}</tr></thead><tbody>${[
            ["Voltage", "voltage"],
            ["Current limit", "maximum_current"],
            ["Exact model", "partNumber"],
            ["Manufacturer", "manufacturer"],
            ["Pinout", "pinout"],
            ["Status", "status"],
          ]
            .map(
              ([name, key]) =>
                `<tr><th>${name}</th>${list.map((c) => `<td>${escape(c[key] || "Unknown / unverified")}</td>`).join("")}</tr>`,
            )
            .join("")}</tbody></table></div>`;
  }
  function render() {
    const query = $("#component-search").value.toLowerCase(),
      view = $("#component-view").value,
      filter = $("#component-filter").value;
    let html = "";
    if (view === "dependencies") {
      html = `<section><h2>What can you build next?</h2>${matchHTML(ctx.catalog, ctx.workspace.inventory)}</section><div class="panel"><h2>Original requirement matrix</h2><p>R = required, O = optional, A = alternative. This matrix describes the original component routes; the shortlist above updates from your inventory and tests.</p><div class="table-scroll"><table><thead><tr><th>Requirement</th>${ctx.catalog.projects.map((p) => `<th><a href="#/project/${p.id}">${p.id}</a></th>`).join("")}</tr></thead><tbody>${ctx.catalog.components
        .filter((c) => c.component.toLowerCase().includes(query))
        .map(
          (c) =>
            `<tr><th>${escape(c.component)}<small>Unverified</small></th>${ctx.catalog.projects.map((p) => `<td class="matrix-${c.compatibility[p.id]}">${c.compatibility[p.id]}</td>`).join("")}</tr>`,
        )
        .join(
          "",
        )}</tbody></table></div><p class="small muted">User inventory associations do not automatically mark the original requirements compatible or verified. Final electrical matching needs measured interfaces and revision-specific evidence.</p></div>`;
    } else if (view === "reference") {
      html = referenceInventoryHTML(ctx.catalog.rev4Inventory, query, filter, ctx.workspace.inventory);
    } else if (view === "photos") {
      html = photoIdentificationsHTML(ctx.catalog.photoIdentifications, query, filter);
    } else if (view === "arrivals") {
      html = ownerArrivalsHTML(ctx.catalog.newArrivals, query, ctx.workspace.inventory);
    } else if (view === "equipment") {
      const list = ctx.catalog.inventory.filter((c) =>
        JSON.stringify(c).toLowerCase().includes(query),
      );
      html = `<div class="component-grid">${list.map((c) => `<article class="panel component"><span class="eyebrow">${escape(c.asset_id)} · REPORTED OWNED</span><h3>${escape(c.asset)}</h3><dl><dt>Quantity</dt><dd>${escape(c.quantity)}</dd><dt>Reported state</dt><dd>${escape(c.reported_state)}</dd><dt>Identification</dt><dd>${escape(c.part_identification)}</dd><dt>Formal test</dt><dd>${escape(c.formal_test_status)}</dd><dt>Next evidence</dt><dd>${escape(c.next_evidence)}</dd></dl><button data-copy-equipment="${escape(c.asset_id)}">Identify this item</button></article>`).join("")}</div>`;
    } else {
      const list = (
        view === "personal"
          ? ctx.workspace.inventory
          : ctx.catalog.components.map((c) => ({ ...c, name: c.component }))
      ).filter(
        (c) =>
          JSON.stringify(c).toLowerCase().includes(query) &&
          (filter === "all" || c.category === filter || c.status === filter),
      );
      html = list.length
        ? `<div class="component-grid">${list
            .map(
              (c) =>
                `<article class="panel component"><div class="component-symbol" aria-label="Illustrative component symbol"><svg viewBox="0 0 150 60" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 30h35m70 0h35 M40 13h70v34H40z M55 6v7 M75 6v7 M95 6v7 M55 47v7 M75 47v7 M95 47v7"/><circle cx="51" cy="24" r="3" fill="currentColor"/></svg><small>Illustration · pinout unknown</small></div><span class="eyebrow">${escape(c.id)} · ${escape(c.category)}</span><h3>${escape(c.name)}</h3><span class="pill">${escape(c.status)}</span><p class="small muted">${escape(c.note || c.verification_note || "Not electrically verified. Record part markings and actual test results.")}</p><dl><dt>Part / manufacturer</dt><dd>${escape(c.partNumber || c.exact_model || "Unknown")} / ${escape(c.manufacturer || "Unknown")}</dd><dt>Voltage / current limit</dt><dd>${escape(c.voltage || "Unknown")} / ${escape(c.maximum_current || "Unknown")}</dd><dt>Pinout / connector</dt><dd>${escape(c.pinout || "Unknown; inspect and measure")}</dd><dt>Quantity / location</dt><dd>${escape(c.quantity || "Unknown")} / ${escape(c.location || "Not recorded")}</dd><dt>Cost + shipping</dt><dd>${c.cost !== "" && c.cost != null ? "$" + escape(c.cost) : "Unknown"} + ${c.shipping !== "" && c.shipping != null ? "$" + escape(c.shipping) : "unknown"}</dd></dl>${safeUrl(c.datasheet) ? `<a href="${escape(safeUrl(c.datasheet))}" target="_blank" rel="noopener">Manufacturer datasheet ↗</a>` : ""}<p class="small">Latest recorded test: ${escape(c.test?.result || "Not tested")}${c.test?.date ? " · " + escape(c.test.date) : ""}. Ratings still need evidence.</p>${c.sourceDeviceId ? `<p><a href="#/salvage/${encodeURIComponent(c.sourceDeviceId)}">Open donor photos & power plan →</a></p>` : ""}<p class="small">Planned use: ${
                  ctx.catalog.projects
                    .filter((p) =>
                      c.compatibility
                        ? c.compatibility[p.id] !== "-"
                        : c.projects?.includes(p.id),
                    )
                    .map((p) => `<a href="#/project/${p.id}">${p.id}</a>`)
                    .join(" · ") || "None associated"
                }</p><div class="row wrap"><label><input type="checkbox" data-component-compare="${escape(c.id)}" ${compared.has(c.id) ? "checked" : ""}> Compare</label><button data-edit-component="${escape(c.id)}">${view === "personal" ? "Edit identification" : "Add identified example"}</button></div></article>`,
            )
            .join("")}</div>`
        : '<div class="empty panel"><h2>No matching items.</h2><p>Add a part to record markings, evidence and project associations.</p></div>';
    }
    $("#component-results").innerHTML = html;
    function importReference(item) {
      if (!item || item.subassemblyOf || ctx.workspace.inventory.some((part) => part.sourceReferenceId === item.id)) return false;
      const part = referenceToPersonalPart(item, "PART-" + newId().slice(0, 8));
      validateInventoryPart(part);
      ctx.workspace.inventory.push(part);
      return true;
    }
    $$("[data-import-arrival]").forEach((button) => {
      button.onclick = () => {
        const entry=ctx.catalog.newArrivals?.items.find((x)=>x.id===button.dataset.importArrival);
        if (!entry || ctx.workspace.inventory.some((p)=>p.sourceArrivalId===entry.id)) {
          ctx.notify("This arrival has already been saved to your private inventory.");
          return;
        }
        const part=arrivalToPersonalPart(entry,"PART-"+newId().slice(0,8));
        validateInventoryPart(part);
        ctx.workspace.inventory.push(part);
        ctx.save();
        render();
        ctx.notify("Dedeco SUNBURST kit saved as one privately owned workshop tool; no performance or individual quantity claims added.");
      };
    });
    $$("[data-import-reference]").forEach((button) => {
      button.onclick = () => {
        const item = ctx.catalog.rev4Inventory.items.find((entry) => entry.id === button.dataset.importReference);
        if (!importReference(item)) { ctx.notify("Already imported or linked under remote #10."); return; }
        ctx.save();
        render();
        ctx.notify("Reference added to your private inventory as untested equipment.");
      };
    });
    const importAll = $("#import-master-inventory");
    if (importAll) importAll.onclick = () => {
      let count = 0;
      for (const item of ctx.catalog.rev4Inventory.items) if (importReference(item)) count++;
      if (count) ctx.save();
      render();
      ctx.notify(count ? count + " new groups copied privately. No test results were invented." : "All 22 distinct groups are already recorded on this device.");
    };
    $$("[data-component-compare]").forEach(
      (el) =>
        (el.onchange = () => {
          if (el.checked) {
            if (compared.size >= 4) {
              el.checked = false;
              ctx.notify("Compare up to four parts.");
              return;
            }
            compared.add(el.dataset.componentCompare);
          } else compared.delete(el.dataset.componentCompare);
          compare();
        }),
    );
    $$("[data-edit-component]").forEach(
      (b) =>
        (b.onclick = () => {
          const c = allItems().find((c) => c.id === b.dataset.editComponent),
            own = ctx.workspace.inventory.includes(c);
          edit({
            ...c,
            id: own ? c.id : undefined,
            name: c.name,
            projects: c.projects || [],
            requirementIds: c.requirementIds || (c.compatibility ? [c.id] : []),
          });
        }),
    );
    $$("[data-copy-equipment]").forEach(
      (b) =>
        (b.onclick = () => {
          const c = ctx.catalog.inventory.find(
            (c) => c.asset_id === b.dataset.copyEquipment,
          );
          edit({
            name: c.asset,
            category: "Reported equipment",
            status: "Owned",
            quantity: c.quantity,
            note: `Source ${c.asset_id}: ${c.reported_state}. Next: ${c.next_evidence}`,
            projects: [],
          });
        }),
    );
  }
  function edit(item = {}) {
    const donor = ctx.workspace.salvage.devices.find((d) => d.id === (item.sourceDeviceId || deviceId));
    const choices = (items, selected) => Object.entries(items).map(([v,label]) => `<option value="${escape(v)}" ${v===selected?"selected":""}>${escape(label)}</option>`).join("");
    const electrical = item.electrical || {}, test = item.test || { result: "Not tested" };
    const numeric = (key,label) => `<label>${label}<input name="electrical-${key}" type="number" min="0" max="1000000" step="any" value="${escape(electrical[key])}"></label>`;
    const testFields = [["method","Test method / procedure"],["instrument","Actual instrument / tool"],["expected","Expected behavior / criterion"],["observed","Observed readings and result"]];
    const fields = [
      ["name", "Component name"],
      ["category", "Category"],
      ["partNumber", "Part number / markings"],
      ["manufacturer", "Manufacturer"],
      ["voltage", "Documented supply range"],
      ["maximum_current", "Documented current limit"],
      ["quantity", "Quantity"],
      ["location", "Storage location"],
      ["pinout", "Pinout / connector (leave unknown if unidentified)"],
      ["datasheet", "Manufacturer datasheet HTTPS URL"],
      ["cost", "Actual cost ($)"],
      ["shipping", "Shipping cost ($)"],
    ];
    $("#component-editor").innerHTML =
      `<form id="inventory-form" class="panel"><div class="section-title"><h2>Part identification</h2><button type="button" id="cancel-component">Close</button></div><div class="form-grid"><label>Donor device<select name="sourceDeviceId" aria-label="Donor device"><option value="">No donor associated</option>${ctx.workspace.salvage.devices.map((d)=>`<option value="${escape(d.id)}" ${d===donor?"selected":""}>${escape(d.name)}</option>`).join("")}</select></label><label>Part type<select name="kind" aria-label="Part type">${choices(partKinds,item.kind||"unknown")}</select></label>${fields.map(([k, label]) => `<label>${label}<input name="${k}" ${k === "name" ? "required" : ""} maxlength="500" value="${escape(item[k])}"></label>`).join("")}<label>Acquisition / ownership<select name="status">${["Owned", "Needed", "Salvaged", "Donated", "Purchased", "Unverified"].map((v) => `<option ${v === (item.status || (donor?"Salvaged":"Unverified")) ? "selected" : ""}>${v}</option>`).join("")}</select></label><label>Function verification<select name="verification">${["Not electrically tested", "Test reported (evidence required)", "Verified working (user assertion; record evidence)"].map((v) => `<option ${v === item.verification ? "selected" : ""}>${escape(v)}</option>`).join("")}</select></label><label class="wide">Function, test evidence, salvage sources and alternatives<textarea name="note" rows="4" maxlength="5000">${escape(item.note || item.verification_note)}</textarea></label><fieldset class="wide"><legend>Associate with projects (not a compatibility certificate)</legend><div class="row wrap">${ctx.catalog.projects.map((p) => `<label><input type="checkbox" name="projects" value="${p.id}" ${item.projects?.includes(p.id) ? "checked" : ""}>${p.id}</label>`).join("")}</div></fieldset><fieldset class="wide"><legend>Which requirements could this part satisfy?</legend><p class="small muted">Choose explicitly after identification. Only a positive quantity and recorded passing test count toward the live shortlist.</p><div class="requirement-choices">${ctx.catalog.components.map((c)=>`<label><input type="checkbox" name="requirementIds" value="${c.id}" ${item.requirementIds?.includes(c.id)?"checked":""}>${escape(c.component)}</label>`).join("")}</div></fieldset></div><fieldset><legend>Unpowered identification and test</legend><p id="part-test-guidance" class="notice"></p><div class="form-grid">${testFields.map(([k,label])=>`<label>${label}<textarea name="test-${k}" maxlength="5000">${escape(test[k])}</textarea></label>`).join("")}<label>Test date and time<input name="test-date" type="datetime-local" value="${test.date ? escape(new Date(Date.parse(test.date)-new Date(test.date).getTimezoneOffset()*60000).toISOString().slice(0,16)):""}"></label><label>Recorded test result<select name="test-result" aria-label="Recorded test result">${choices({"Not tested":"Not tested",Pass:"Pass",Fail:"Fail",Inconclusive:"Inconclusive"},test.result)}</select></label></div><p class="small muted">Use your actual observations. A passing contact test does not establish voltage/current ratings or certify a build. Record additional trials in the notebook; this summary retains the latest test.</p></fieldset><details><summary>Structured ratings for the power planner</summary><p class="small muted">Use operating limits from the exact component or powered assembly. A switch has contact ratings, not a supply voltage; use the worked LED example in the salvage workbench. Leave unknown fields blank.</p><div class="form-grid">${[["minV","Minimum operating voltage (V)"],["maxV","Maximum operating voltage (V)"],["runMa","Running current (mA)"],["peakMa","Startup / peak current (mA)"]].map(([k,label])=>numeric(k,label)).join("")}${[ ["positive","Identified positive supply terminal"],["negative","Identified return terminal"],["evidence","Ratings and terminal evidence / reference"]].map(([k,label])=>`<label>${label}<input name="electrical-${k}" maxlength="5000" value="${escape(electrical[k])}"></label>`).join("")}</div></details><p class="small muted">${donor?`<a href="#/salvage/${encodeURIComponent(donor.id)}">Back to ${escape(donor.name)} photos and power plans →</a>`:"Add a donor in the Salvage workbench to keep teardown photos with this part."}</p><div id="inventory-error" role="alert"></div><button type="submit" class="primary">Save identified part</button></form>`;
    const guidance = () => { const kind=$('#inventory-form [name="kind"]').value; $("#part-test-guidance").textContent=unpoweredTests[kind]||unpoweredTests.unknown; };
    $('#inventory-form [name="kind"]').onchange=guidance;guidance();
    $("#cancel-component").onclick = () =>
      ($("#component-editor").innerHTML = "");
    $("#component-editor").scrollIntoView({ behavior: "smooth" });
    $("#inventory-form").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target),
        data = Object.fromEntries(fd);
      try {
        if (data.datasheet && !safeUrl(data.datasheet))
          throw Error("Datasheets must use a valid HTTPS URL.");
        for (const key of ["cost", "shipping"])
          if (
            data[key] !== "" &&
            (!Number.isFinite(Number(data[key])) || Number(data[key]) < 0)
          )
            throw Error("Costs must be nonnegative numbers or blank.");
        if (
          data.verification !== "Not electrically tested" &&
          !data.note.trim()
        )
          throw Error(
            "Record evidence notes for any test or working assertion.",
          );
        const c = {
          ...item,
          ...data,
          id: item.id || "PART-" + newId().slice(0, 8),
          projects: fd.getAll("projects"),
          requirementIds: fd.getAll("requirementIds"),
          electrical: Object.fromEntries(["minV","maxV","runMa","peakMa","positive","negative","evidence"].map((k)=>[k,fd.get("electrical-"+k)])),
          test: Object.fromEntries(["method","instrument","expected","observed","date","result"].map((k)=>[k,k==="date"&&fd.get("test-date")?new Date(fd.get("test-date")).toISOString():fd.get("test-"+k)])),
          updated: new Date().toISOString(),
        };
        for (const key of Object.keys(c)) if (key.startsWith("test-") || key.startsWith("electrical-")) delete c[key];
        validateInventoryPart(c);
        const old = ctx.workspace.inventory.findIndex((i) => i.id === c.id);
        if (old >= 0) ctx.workspace.inventory[old] = c;
        else ctx.workspace.inventory.push(c);
        ctx.save();
        $("#component-editor").innerHTML = "";
        $("#component-view").value = "personal";
        render();
        ctx.notify("Part identification saved privately.");
      } catch (err) {
        $("#inventory-error").textContent = err.message;
      }
    };
  }
  $("#component-search").oninput = render;
  $("#component-filter").onchange = render;
  $("#component-view").onchange = render;
  $("#add-component").onclick = () => edit();
  $("#component-export").onclick = () =>
    download(
      csvExport(ctx.workspace.inventory),
      "mcgruber-inventory.csv",
      "text/csv",
    );
  render();
  if (partId) {
    const item=ctx.workspace.inventory.find((p)=>p.id===partId);
    if (item) edit(item); else ctx.notify("Part not found in this workspace.");
  } else if (deviceId && ctx.workspace.salvage.devices.some((d)=>d.id===deviceId)) edit();
}
