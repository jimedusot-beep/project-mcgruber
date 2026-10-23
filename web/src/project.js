import { escape, $, $$, projectArt, icon, heading } from "./ui.js";
import { experimentHTML, mountExperiment } from "./experiments.js";
const stageNames = [
  "Planning",
  "Simulation",
  "Assembly",
  "Testing",
  "Verified Build",
];
const tips = {
  P04: [
    [
      "Unpowered continuity check",
      "Remove all power. Use resistance/continuity mode; probe each candidate terminal pair with the actuator released and pressed. Record the actual pair and readings. Never put a meter in current mode across a supply.",
      "A candidate NC pair conducts when released and opens when pressed. Terminal numbers are unknown until identified.",
    ],
    [
      "Check the object and contact",
      "Place the object so it presses the actuator without forcing it. Lift it repeatedly and log the two contact states.",
      "Object present → NC open. Object removed → NC closed. If reversed, identify another pair or revise the design.",
    ],
    [
      "Measure before powering",
      "Measure supply voltage in parallel in DC voltage mode. Measure the resistor with power disconnected. Verify LED polarity and continuous-current rating from its part data.",
      "The sample assumes 5V and 470Ω / 0.25W; these values are not proof of inventory ratings.",
    ],
    [
      "Wire with power off",
      "Follow the conditional SVG. Recheck LED anode/cathode and insulation. If it stays on, disconnect power and inspect NC/NO selection; if dark, inspect polarity and continuity.",
      "Series path: +5V → COM → NC → 470Ω → LED anode → cathode → 0V.",
    ],
    [
      "Test and record",
      "Measure loaded supply in parallel. Measure LED current only with a properly configured and fused meter in series, or infer it from measured resistor voltage and resistance. Log 20 lift/replace cycles, including failures.",
      "Use the Notebook for expected versus observed values, instrument range, actual readings and photographs. No pass is assumed.",
    ],
  ],
  P03: [
    [
      "Measure the mechanism",
      "Record internal box dimensions, lid clearance and figure mass. Use lightweight paper/cardboard.",
      "Your actual dimensions determine the design; the generic STL is not a fitted box part.",
    ],
    [
      "Make a low-force spring",
      "Fold an accordion paper spring. Start with little compression; keep fingers and faces away from the opening.",
      "The lid should rise gently without a hard projectile.",
    ],
    [
      "Fit a simple latch",
      "Use a paper/cardboard hinge and a smooth manually released latch. Test slowly before storing more force.",
      "No sticking or sharp edges. If the lid binds, reduce spring force and check hinge alignment.",
    ],
    [
      "Record repeatability",
      "Cycle the latch manually 20 times. Note jams, travel and adhesive failures in the Notebook.",
      "A failed cycle remains part of the record. Completion of this checklist does not establish a verified build.",
    ],
    [
      "Decide whether to motorize",
      "Only plan a servo after mechanical tests. Measure required travel and force and choose rated driver/supply.",
      "Unknown servos or motors retain unknown pinouts and power demand.",
    ],
  ],
  P07: [
    [
      "Qualify the power source",
      "Measure DC output voltage and polarity using voltage mode in parallel. Test whether a USB power bank shuts down at the intended small load.",
      "A 5V label or prior use does not establish loaded behavior.",
    ],
    [
      "Identify the trigger",
      "With all power disconnected, measure COM/NC and NO behavior using continuity mode. Record actuator released/pressed states.",
      "Use only known contacts with a documented DC current rating above the output demand.",
    ],
    [
      "Identify the sounder",
      "Obtain the exact model and datasheet. A 5V active DC buzzer contains its own oscillator; a passive piezo needs a driver waveform.",
      "Check voltage, polarity, steady/peak current, duty cycle and switch rating. Do not infer these from appearance.",
    ],
    [
      "Wire and inspect",
      "Disconnect power. Follow the conditional 5V wiring illustration. Verify the master switch, trigger path, polarity and insulated return.",
      "+5V → master switch → COM/NC trigger → active buzzer +; buzzer − → 0V.",
    ],
    [
      "Test every operating state",
      "Measure actual load behavior; log arm/disarm, triggered/not-triggered states and 20 cycles. If silent, disconnect and inspect polarity, supply cutoff and active/passive type.",
      "Capture observations and failure cases before adding any unverified sensor module.",
    ],
  ],
};
export function projectHTML(p, ctx, tab = "overview") {
  const favorite = ctx.workspace.favorites.includes(p.id),
    progress = ctx.workspace.progress[p.id] || {},
    count = (progress.steps || []).filter(Boolean).length;
  return `<a href="#/" class="back-link">← All inventions</a>${heading(p.id + " / " + p.category, p.name, p.description, `<button id="project-favorite" aria-pressed="${favorite}">${icon("star")} ${favorite ? "Favorited" : "Favorite"}</button>`)}<div class="project-tabs" role="navigation" aria-label="Project workspace">${[
    ["overview", "Overview"],
    ["experiment", "Experiment"],
    ["guide", "Guided build"],
    ["files", "Files & evidence"],
  ]
    .map(
      ([key, label]) =>
        `<a href="#/project/${p.id}/${key}" class="${key === tab ? "active" : ""}" ${key === tab ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join(
      "",
    )}</div><div class="project-stage-row">${stageNames.map((s, i) => `<span class="stage ${i === Number(progress.stage || 0) ? "current" : ""} ${i === 4 ? "unverified" : ""}">${i + 1}. ${s}${i === 4 ? " · pending evidence review" : ""}</span>`).join("")}</div>${tab === "experiment" ? experimentHTML(p) : tab === "guide" ? guideHTML(p, ctx) : tab === "files" ? filesHTML(p, ctx) : `<div class="project-overview"><div class="panel project-visual">${projectArt(ctx.catalog.projects.indexOf(p), true)}<span class="art-caption">Original illustration · conceptual design</span></div><div class="panel"><span class="pill">${escape(p.status)}</span><h2>Start small. Learn something real.</h2><p>${escape(p.description)}</p><dl><dt>Complexity</dt><dd>${escape(p.complexity)}</dd><dt>Estimated cost</dt><dd>Unknown · no evidenced pricing</dd><dt>Physical build status</dt><dd>Not independently verified</dd><dt>Next blocker</dt><dd>${escape(p.blocker)}</dd><dt>Guided progress</dt><dd>${count}/${p.steps.length} steps recorded</dd></dl><div class="row wrap"><a class="button primary" href="#/project/${p.id}/experiment">Run experiment ${icon("arrow")}</a><a class="button" href="#/project/${p.id}/guide">Start build guide</a>${p.id === "P01" ? '<a class="button primary" href="#/tripwire-3d">Open interactive 3D assembly →</a>' : ""}</div></div></div><div class="two-col"><div class="panel"><h2>Parts for this invention</h2>${bomHTML(p)}<a href="#/components">Open component bank →</a></div><div class="panel"><h2>From idea to evidence</h2><p>The virtual experiment explores behavior. The build guide comes from the repository’s actual instructions. Physical verification requires measurements, identified parts, repeated tests and real evidence.</p><img class="architecture" src="./repository/${p.folder}/diagrams/architecture.svg" alt="${escape(p.name)} conceptual input, control and output architecture"><p class="small muted">Conceptual block diagram; no unknown physical pin assignments are inferred.</p><a href="https://github.com/jimedusot-beep/project-mcgruber/issues/${p.issue}" target="_blank" rel="noopener">Track physical work in issue #${p.issue} ↗</a></div></div>`}`;
}
function bomHTML(p) {
  return `<div class="table-scroll"><table><thead><tr><th>Part</th><th>Qty</th><th>Availability & specifications</th></tr></thead><tbody>${p.bom.map((b) => `<tr><td>${escape(b.item)}</td><td>${escape(b.qty)}</td><td>${escape(b.availability_and_specifications)}</td></tr>`).join("")}</tbody></table></div>`;
}
function guideHTML(p, ctx) {
  const progress = ctx.workspace.progress[p.id] || {},
    checks = progress.prechecks || {},
    mechanical = p.id === "P03";
  return `<div class="row between wrap"><h2>A build you can follow at the bench.</h2><button id="print-guide">Print checklist</button></div><div class="notice">These are proposed construction steps, not a verified physical build. Check off work you have actually done. Completion never promotes a project to “Verified Build.”</div><div class="panel prerequisites"><h3>Before you begin</h3><p>${mechanical ? "Use lightweight paper/cardboard and a low-force latch. Record actual dimensions. Electrical checks apply only if you later motorize it." : "Work only with an identified low-voltage DC source and documented component ratings. Disconnect power before continuity tests or wiring changes. Unidentified hardware has no assumed pinout."}</p><div class="row wrap">${(mechanical ? ["Dimensions and materials recorded", "Low-force mechanism and safe clearances checked", "Parts and tools available"] : ["Supply voltage and polarity measured", "Actual part ratings and terminals identified", "Power disconnected for wiring", "Meter and insulated tools checked"]).map((text, i) => `<label class="check-row"><input type="checkbox" data-precheck="${i}" ${checks[i] ? "checked" : ""}>${text}</label>`).join("")}</div><label>Current working stage<select id="working-stage">${stageNames
    .slice(0, 4)
    .map(
      (s, i) =>
        `<option value="${i}" ${Number(progress.stage || 0) === i ? "selected" : ""}>${s}</option>`,
    )
    .join(
      "",
    )}</select></label><a href="#/docs/docs/SAFETY.md">Read repository safety guidance →</a></div><div class="guide-steps">${p.steps
    .map((text, i) => {
      const detail = tips[p.id]?.[i];
      return `<article class="panel guide-step ${(progress.steps || [])[i] ? "done" : ""}"><div class="step-number">${String(i + 1).padStart(2, "0")}</div><div><label class="step-title"><input type="checkbox" data-build-step="${i}" ${(progress.steps || [])[i] ? "checked" : ""}>${escape(text.replaceAll("**", ""))}</label>${detail ? `<h3>${escape(detail[0])}</h3><p>${escape(detail[1])}</p><p class="expected"><strong>Expected / check:</strong> ${escape(detail[2])}</p>` : `<p class="muted">Follow the source build procedure and record the actual component revision, settings, expected behavior and observed result. Stop and revise if the real ratings or pinouts differ.</p>`}<label>Observed result / next action<textarea data-step-note="${i}" rows="2" maxlength="3000" placeholder="Record what you actually observed…">${escape(progress.notes?.[i])}</textarea></label></div></article>`;
    })
    .join(
      "",
    )}</div>${["P04", "P07"].includes(p.id) ? `<div class="panel"><h2>Conditional wiring reference</h2><a href="./repository/${p.folder}/diagrams/wiring-example-5v.svg" target="_blank" rel="noopener"><img class="wiring" src="./repository/${p.folder}/diagrams/wiring-example-5v.svg" alt="Conditional 5V connection-order illustration; actual ratings and contacts must be verified"></a><p class="small muted">Tap to enlarge. Connection order only; unknown component terminals are not numbered.</p></div>` : ""}<div class="panel"><h2>Verification gate</h2><p>Part identities, measured ratings, repeatable trial results and authentic media must be reviewed for the specific revision. No physical build is certified by the app.</p><a href="#/notebook" class="button primary">Record physical test →</a><a href="#/docs/${p.folder}/BUILD.md" class="button">Read original guide</a></div>`;
}
function filesHTML(p, ctx) {
  return `<div class="two-col"><div class="panel"><h2>Original project files</h2><ul class="file-list">${p.files.map((f) => `<li><a href="#/docs/${f}">${escape(f.split("/").slice(2).join("/"))}</a><a href="./repository/${f}" download aria-label="Download ${escape(f.split("/").pop())}">${icon("download")}</a></li>`).join("")}</ul></div><div class="panel"><h2>CAD & recorded evidence</h2><p>The shared angle-support STL is original, digitally generated, unprinted and fit-unverified.</p><a class="button" href="#/viewer">Open real 3D viewer</a>${p.id === "P01" ? '<a class="button primary" href="#/tripwire-3d">Explore exploded tripwire →</a>' : ""}<a href="./repository/cad-and-stl/prototype-angle-support.stl" download class="button">Download starter STL</a><p>${ctx.workspace.records.filter((r) => r.project === p.id).length} private experiment records on this device.</p><p>Repository logs still say NOT_RUN. No authentic project photos or demonstration videos have been provided in the original evidence manifest.</p><a href="#/notebook">Open notebook →</a><p><a href="https://github.com/jimedusot-beep/project-mcgruber/issues/${p.issue}" target="_blank" rel="noopener">Physical development issue #${p.issue} ↗</a></p></div></div><div class="panel"><h2>Bill of materials</h2>${bomHTML(p)}</div>`;
}
export function mountProject(p, ctx, tab) {
  $("#project-favorite").onclick = () => {
    const has = ctx.workspace.favorites.includes(p.id);
    ctx.workspace.favorites = has
      ? ctx.workspace.favorites.filter((id) => id !== p.id)
      : [...ctx.workspace.favorites, p.id];
    ctx.save();
    $("#project-favorite").setAttribute("aria-pressed", String(!has));
    $("#project-favorite").innerHTML =
      icon("star") + (!has ? " Favorited" : " Favorite");
  };
  if (tab === "experiment") return mountExperiment(p, ctx);
  if (tab === "guide") {
    const progress = (ctx.workspace.progress[p.id] ||= {
      steps: [],
      notes: {},
      prechecks: {},
      stage: 0,
    });
    $$("[data-precheck]").forEach(
      (el) =>
        (el.onchange = () => {
          (progress.prechecks ||= {})[el.dataset.precheck] = el.checked;
          ctx.save();
        }),
    );
    $$("[data-build-step]").forEach(
      (el) =>
        (el.onchange = () => {
          (progress.steps ||= [])[Number(el.dataset.buildStep)] = el.checked;
          el.closest("article").classList.toggle("done", el.checked);
          ctx.save();
        }),
    );
    $$("[data-step-note]").forEach(
      (el) =>
        (el.oninput = () => {
          (progress.notes ||= {})[el.dataset.stepNote] = el.value;
          ctx.save();
        }),
    );
    $("#working-stage").onchange = (e) => {
      progress.stage = Number(e.target.value);
      ctx.save();
    };
    $("#print-guide").onclick = () => window.print();
  }
}
