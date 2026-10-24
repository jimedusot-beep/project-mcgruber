import { newId } from "./id.js";
import { focus } from "./workshop-intelligence.js";
import {
  evidenceTypes,
  validateRecord,
  validateEvidence,
  repeatExperiment,
  csvExport,
} from "./core.js";
import { addMedia, read, download, mediaBlob } from "./storage.js";
import {
  escape,
  $,
  $$,
  heading,
  projectOptions,
  formatDate,
  chart,
} from "./ui.js";
export function notebookHTML(ctx) {
  return `${heading("Your private lab notebook", "Make every experiment count.", "Record what happened, how you tested it, and what to try next.", '<button id="new-experiment" class="primary">+ New experiment</button>')}<div class="notice">Saved on this device. A private record is never published to GitHub. Keep a full backup from Settings before clearing Safari data or changing devices.</div><div class="row wrap tools"><label class="search">Search records<input id="record-search" type="search" placeholder="Name, observations, project…"></label><label>Evidence<select id="record-filter"><option value="all">All evidence types</option>${evidenceTypes.map((t) => `<option>${escape(t)}</option>`).join("")}</select></label><button id="export-records-json">Export records JSON</button><button id="export-records-csv">Export CSV</button></div><div id="record-editor"></div><div id="record-compare"></div><div id="record-list"></div>`;
}
export function mountNotebook(ctx, requestedProjectId) {
  let draft = ctx.workspace.draftRecord || null,
    selected = new Set(),
    objectURLs = [];
  const records = () => ctx.workspace.records;
  function clearMedia() {
    objectURLs.forEach((u) => URL.revokeObjectURL(u));
    objectURLs = [];
  }
  function emptyRecord() {
    return {
      id: newId(),
      date: new Date().toISOString(),
      project: "P04",
      name: "",
      evidence: "Reported observation",
      configuration: {},
      componentIds: "",
      criteria: "",
      trial: 1,
      voltage: "",
      current: "",
      instrument: "",
      observations: "",
      result: "Not tested",
      attachments: [],
    };
  }
  async function renderEditor() {
    clearMedia();
    const host = $("#record-editor");
    if (!draft) {
      host.innerHTML = "";
      return;
    }
    // Old records may omit a date; render a usable editor without throwing.
    draft = { ...emptyRecord(), ...draft };
    if (Number.isNaN(new Date(draft.date).getTime())) draft.date = new Date().toISOString();
    host.innerHTML = `<form id="experiment-form" class="panel record-form"><div class="section-title"><h2>${records().some((r) => r.id === draft.id) ? "Edit experiment" : "New experiment"}</h2><button type="button" id="close-record">Close editor</button></div><div class="form-grid"><label>Experiment name<input name="name" required maxlength="160" value="${escape(draft.name)}"></label><label>Project<select name="project">${projectOptions(ctx.catalog.projects, draft.project)}</select></label><label>Evidence classification<select name="evidence">${evidenceTypes.map((t) => `<option ${t === draft.evidence ? "selected" : ""}>${escape(t)}</option>`).join("")}</select></label><label>Date and time<input name="date" type="datetime-local" required value="${escape(new Date(new Date(draft.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16))}"></label><label>Trial number<input type="number" name="trial" min="1" max="1000000" value="${Number(draft.trial) || 1}"></label><label>Component / asset IDs<input name="componentIds" maxlength="500" value="${escape(draft.componentIds)}" placeholder="EQ-007, C04…"></label><label>Actual measured voltage (V)<input name="voltage" type="number" step="any" value="${escape(draft.voltage)}" placeholder="Leave blank if not measured"></label><label>Actual measured current (mA)<input name="current" type="number" step="any" value="${escape(draft.current)}" placeholder="Leave blank if not measured"></label><label>Instrument and range<input name="instrument" maxlength="300" value="${escape(draft.instrument)}" placeholder="Actual instrument; never inferred"></label><label>Result<select name="result" aria-label="Result">${["Not tested", "Pass", "Fail", "Inconclusive"].map((t) => `<option ${t === draft.result ? "selected" : ""}>${t}</option>`).join("")}</select></label><label class="wide">Configuration / settings<textarea name="configuration" rows="3" maxlength="20000">${escape(JSON.stringify(draft.configuration || {}, null, 2))}</textarea></label><label class="wide">Pass / fail criteria<textarea name="criteria" rows="2" maxlength="3000">${escape(draft.criteria)}</textarea></label><label class="wide">Observations, failures and follow-up tasks<textarea name="observations" rows="4" maxlength="20000">${escape(draft.observations)}</textarea></label><label class="wide">Attach photos or short video (12 MB each, up to 20)<input id="record-media" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm" multiple></label></div><div id="draft-media" class="media-gallery"></div><p class="small muted">Simulation records cannot contain physical measurement fields. “Independently reproduced” requires your named reproduction procedure and evidence. Saving a record does not verify a build.</p><div id="record-error" role="alert"></div><button class="primary" type="submit">Save experiment</button><span id="draft-status" class="small muted">Draft autosaves on this device</span></form>`;
    const form = $("#experiment-form");
    function updateDraft() {
      const data = Object.fromEntries(new FormData(form));
      for (const k of [
        "name",
        "project",
        "evidence",
        "componentIds",
        "criteria",
        "observations",
        "instrument",
        "result",
        "voltage",
        "current",
      ])
        draft[k] = data[k];
      draft.trial = Number(data.trial);
      const date = new Date(data.date);
      if (!Number.isNaN(date.getTime())) draft.date = date.toISOString();
      try {
        const configuration = JSON.parse(data.configuration);
        if (configuration && typeof configuration === "object" && !Array.isArray(configuration))
          draft.configuration = configuration;
      } catch {
        /* Keep last valid configuration while editing. */
      }
      ctx.workspace.draftRecord = structuredClone(draft);
      ctx.save();
      $("#draft-status").textContent = "Draft save queued";
    }
    form.oninput = updateDraft;
    $("#close-record").onclick = () => {
      updateDraft();
      draft = null;
      renderEditor();
    };
    $("#record-media").onchange = async (e) => {
      try {
        if (draft.attachments.length + e.target.files.length > 20)
          throw Error("Use up to 20 attachments per experiment.");
        for (const f of e.target.files)
          draft.attachments.push(await addMedia(f));
        ctx.workspace.draftRecord = structuredClone(draft);
        ctx.save();
        await renderEditor();
        ctx.notify("Media attached privately on this device.");
      } catch (err) {
        ctx.notify(err.message);
      }
    };
    form.onsubmit = (e) => {
      e.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(form));
        const configuration = JSON.parse(data.configuration);
        if (!configuration || typeof configuration !== "object" || Array.isArray(configuration))
          throw Error("Configuration must be a JSON object.");
        draft.configuration = configuration;
        updateDraft();
        if (!draft.name.trim()) throw Error("Enter an experiment name.");
        validateEvidence(draft);
        validateRecord(draft);
        const old = records().findIndex((r) => r.id === draft.id);
        if (old >= 0) ctx.workspace.records[old] = structuredClone(draft);
        else ctx.workspace.records.unshift(structuredClone(draft));
        delete ctx.workspace.draftRecord;
        ctx.save();
        draft = null;
        renderEditor();
        renderList();
        ctx.notify("Experiment saved to this device.");
      } catch (err) {
        $("#record-error").textContent = err.message;
      }
    };
    for (const id of draft.attachments) {
      const media = await read("media", id);
      if (!media || !draft || !$("#draft-media")) continue;
      const url = URL.createObjectURL(mediaBlob(media));
      objectURLs.push(url);
      const card = document.createElement("div");
      card.className = "media-card";
      const el = document.createElement(
        media.type.startsWith("image/") ? "img" : "video",
      );
      el.src = url;
      if (el.tagName === "IMG") el.alt = media.name;
      else el.controls = true;
      const label = document.createElement("p");
      label.textContent = media.name;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove attachment";
      remove.onclick = () => {
        draft.attachments = draft.attachments.filter((a) => a !== id);
        ctx.workspace.draftRecord = structuredClone(draft);
        ctx.save();
        renderEditor();
      };
      card.append(el, label, remove);
      $("#draft-media").append(card);
    }
  }
  function renderCompare() {
    const rs = records().filter((r) => selected.has(r.id));
    $("#record-compare").innerHTML =
      rs.length < 2
        ? ""
        : `<div class="panel"><h2>Compare experiments</h2><div class="table-scroll"><table><thead><tr><th>Field</th>${rs.map((r) => `<th>${escape(r.name)}</th>`).join("")}</tr></thead><tbody>${[
            ["Evidence", "evidence"],
            ["Project", "project"],
            ["Date", "date"],
            ["Trial", "trial"],
            ["Actual V", "voltage"],
            ["Actual mA", "current"],
            ["Instrument", "instrument"],
            ["Result", "result"],
            ["Criteria", "criteria"],
            ["Observations", "observations"],
            ["Configuration", "configuration"],
          ]
            .map(
              ([label, key]) =>
                `<tr><th>${label}</th>${rs.map((r) => `<td>${escape(key === "configuration" ? JSON.stringify(r[key]) : (r[key] ?? ""))}</td>`).join("")}</tr>`,
            )
            .join("")}</tbody></table></div></div>`;
  }
  function renderList() {
    const query = $("#record-search").value.toLowerCase(),
      filter = $("#record-filter").value,
      rs = records().filter(
        (r) =>
          (filter === "all" || r.evidence === filter) &&
          JSON.stringify(r).toLowerCase().includes(query),
      );
    $("#record-list").innerHTML = rs.length
      ? rs
          .map(
            (r) =>
              `<article class="panel record"><div class="row between wrap"><div><span class="pill">${escape(r.evidence)}</span><h3>${escape(r.name)}</h3><p class="small muted">${escape(r.project)} · ${formatDate(r.date)} · Trial ${Number(r.trial) || 1} · ${escape(r.result)}</p></div><label><input data-compare="${escape(r.id)}" type="checkbox" ${selected.has(r.id) ? "checked" : ""}> Compare</label></div><p class="record-observations">${escape(r.observations)}</p>${r.configuration?.samples?.length ? chart(r.configuration.samples.slice(-120)) : ""}<div class="row wrap"><button data-edit="${escape(r.id)}">Edit / attachments (${r.attachments.length})</button><button data-repeat="${escape(r.id)}">Repeat experiment</button><a href="https://github.com/jimedusot-beep/project-mcgruber/issues/${ctx.catalog.projects.find((p) => p.id === r.project)?.issue || 1}" target="_blank" rel="noopener">Related issue ↗</a><button data-delete="${escape(r.id)}" class="danger">Delete record</button></div></article>`,
          )
          .join("")
      : '<div class="empty panel"><h2>A clean page for your next discovery.</h2><p>No matching experiments yet. Save a simulated run from a project, or record a real observation.</p></div>';
    $$("[data-edit]").forEach(
      (b) =>
        (b.onclick = () => {
          draft = structuredClone(
            records().find((r) => r.id === b.dataset.edit),
          );
          renderEditor();
          $("#record-editor").scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }),
    );
    $$("[data-repeat]").forEach(
      (b) =>
        (b.onclick = () => {
          draft = repeatExperiment(
            records().find((r) => r.id === b.dataset.repeat),
          );
          ctx.workspace.draftRecord = structuredClone(draft);
          ctx.save();
          renderEditor();
          $("#record-editor").scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          ctx.notify(
            "Settings copied; old measurements and attachments cleared.",
          );
        }),
    );
    $$("[data-compare]").forEach(
      (b) =>
        (b.onchange = () => {
          if (b.checked) {
            if (selected.size >= 4) {
              b.checked = false;
              ctx.notify("Compare up to four records.");
              return;
            }
            selected.add(b.dataset.compare);
          } else selected.delete(b.dataset.compare);
          renderCompare();
        }),
    );
    $$("[data-delete]").forEach(
      (b) =>
        (b.onclick = () => {
          const r = records().find((r) => r.id === b.dataset.delete);
          if (
            !confirm(
              `Delete “${r.name}” from this workspace? Recent saved revisions remain available in Settings.`,
            )
          )
            return;
          ctx.workspace.records = records().filter(
            (r) => r.id !== b.dataset.delete,
          );
          selected.delete(b.dataset.delete);
          ctx.save();
          renderList();
          renderCompare();
        }),
    );
  }
  $("#new-experiment").onclick = () => {
    draft = emptyRecord();
    renderEditor();
    $("#record-editor").scrollIntoView({ behavior: "smooth" });
  };
  $("#record-search").oninput = renderList;
  $("#record-filter").onchange = renderList;
  $("#export-records-json").onclick = () =>
    download(
      JSON.stringify({ schema: 1, records: records() }, null, 2),
      "mcgruber-experiments.json",
    );
  $("#export-records-csv").onclick = () =>
    download(csvExport(records()), "mcgruber-experiments.csv", "text/csv");
  renderList();
  // Deep links from the navigator start an unmeasured draft, never a pass.
  // Preserve an existing private draft even when a new link names another project.
  if (!draft && requestedProjectId && Object.hasOwn(focus, requestedProjectId) &&
      ctx.catalog.projects.some((p) => p.id === requestedProjectId)) {
    const p = ctx.catalog.projects.find((x) => x.id === requestedProjectId);
    draft = { ...emptyRecord(), project: p.id,
      name: p.name + " — next bench investigation",
      criteria: "Planned test only: " + focus[p.id].next,
      configuration: { source: "workshop-intelligence", project: p.id },
      evidence: "Reported observation", result: "Not tested", observations: "",
      voltage: "", current: "", instrument: "" };
    ctx.workspace.draftRecord = structuredClone(draft);
    ctx.save();
  }
  if (draft) renderEditor();
  return clearMedia;
}
