import "./style.css";
import { freshWorkspace, calculators, calculate } from "./core.js";
import * as storage from "./storage.js";
import { escape, $, $$, icon, projectArt, heading, formatDate } from "./ui.js";
import { projectHTML, mountProject } from "./project.js";
import { circuitHTML, mountCircuit } from "./circuit.js";
import { notebookHTML, mountNotebook } from "./notebook.js";
import { inventoryHTML, mountInventory } from "./inventory.js";
import { salvageHTML, mountSalvage } from "./salvage.js";
const app = $("#app");
let cleanup,
  renderEpoch = 0,
  saveTimer,
  dirty = false,
  editGeneration = 0,
  saveProblem = null,
  workspace = freshWorkspace(),
  catalog;
function notify(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => el.classList.remove("show"), 6000);
}
function save() {
  dirty = true;
  editGeneration++;
  clearTimeout(saveTimer);
  if (saveProblem) {
    showSaveProblem(saveProblem);
    return;
  }
  const status = $("#save-status");
  if (status) status.textContent = "Saving…";
  saveTimer = setTimeout(() => flushSave().catch(showSaveProblem), 300);
}
async function flushSave() {
  clearTimeout(saveTimer);
  if (saveProblem) throw saveProblem;
  if (!dirty) return;
  const target = workspace,
    generation = editGeneration;
  await storage.save(target);
  if (workspace === target && generation === editGeneration && !saveProblem) {
    dirty = false;
    const status = $("#save-status");
    if (status) status.textContent = "Saved on this device";
  }
}
function showSaveProblem(error) {
  saveProblem = error;
  clearTimeout(saveTimer);
  const status = $("#save-status");
  if (status) status.textContent = "Autosave paused";
  let panel = $("#save-problem");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "save-problem";
    panel.className = "save-problem";
    panel.setAttribute("role", "alert");
    app.after(panel);
  }
  panel.innerHTML =
    '<h2>Keep both versions safe</h2><p></p><div class="row wrap"><button id="export-local-copy">Export my local copy</button><button id="load-latest-workspace" class="primary">Keep my draft & load latest</button></div>';
  panel.querySelector("p").textContent = error.message;
  $("#export-local-copy").onclick = async () => {
    try {
      storage.download(
        await storage.backup(workspace),
        "mcgruber-local-recovery.json",
      );
      notify("Local copy exported without replacing the saved workspace.");
    } catch (e) {
      notify(e.message);
    }
  };
  $("#load-latest-workspace").onclick = async () => {
    try {
      if (cleanup) {
        const stop = cleanup;
        cleanup = null;
        stop();
      }
      clearTimeout(saveTimer);
      await storage.preserveDraft(workspace);
      workspace = await storage.load();
      dirty = false;
      saveProblem = null;
      editGeneration++;
      document.documentElement.dataset.theme = workspace.theme;
      panel.remove();
      await route();
      notify(
        "Latest workspace loaded. Your previous tab draft is in Recent saved revisions.",
      );
    } catch (e) {
      notify(e.message);
    }
  };
}
const ctx = {
  get workspace() {
    return workspace;
  },
  get catalog() {
    return catalog;
  },
  save,
  notify,
};
const nav = [
  ["", "home", "Workshop"],
  ["salvage", "parts", "Salvage workbench"],
  ["circuit", "circuit", "Circuit lab"],
  ["viewer", "cube", "3D lab"],
  ["components", "parts", "Component bank"],
  ["notebook", "notebook", "Notebook"],
  ["calculators", "calculator", "Calculators"],
  ["docs", "book", "Source library"],
];
function shell(route) {
  app.innerHTML = `<aside class="sidebar"><a class="brand" href="#/"><img src="./icon.svg" width="38" height="38" alt=""><span>McGruber<span>THE INVENTION LAB</span></span></a><div class="nav-caption">YOUR WORKSHOP</div><nav aria-label="Main navigation">${nav.map(([path, i, label]) => `<a href="#/${path}" class="nav-link ${route === path || (route === "project" && path === "") ? "active" : ""}" ${route === path ? 'aria-current="page"' : ""}>${icon(i)}<span>${label}</span>${path === "notebook" ? `<small>${workspace.records.length}</small>` : ""}</a>`).join("")}</nav><div class="sidebar-bottom"><div class="local-card"><span class="live-dot"></span><strong>Ideas stay yours.</strong><p>Autosaved on this device.<br>Export a backup to take them along.</p><a href="#/settings">Backups & settings →</a></div><a href="https://github.com/jimedusot-beep/project-mcgruber" target="_blank" rel="noopener" class="repository-link">Open-source. Always. ↗</a></div></aside><div class="main-shell"><header class="topbar"><div class="breadcrumb">WORKSHOP <span>/</span> ${route === "project" ? "INVENTIONS" : route ? route.toUpperCase() : "OVERVIEW"}</div><div class="row"><span class="save-indicator"><span class="live-dot"></span><span id="save-status">${saveProblem ? "Autosave paused" : dirty ? "Saving…" : workspace.updated ? "Saved on this device" : "Local autosave ready"}</span></span><button id="theme-toggle" class="icon-button" aria-label="Toggle light and dark theme">${icon("sun")}</button><a href="#/settings" class="avatar" aria-label="Backups and settings">M</a></div></header><main id="main" tabindex="-1"></main><footer>Made for curious minds and secondhand parts.<span>$0 tools · no hardware claims · <a href="./licenses/THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener">Licenses</a></span></footer></div>`;
  $("#theme-toggle").onclick = () => {
    workspace.theme = workspace.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = workspace.theme;
    save();
  };
}
function homeHTML() {
  return `<div class="welcome-row"><div class="eyebrow"><span class="live-dot"></span> A LITTLE INGENUITY GOES A LONG WAY</div><a href="#/docs/docs/ROADMAP.md" class="small">View the roadmap ↗</a></div><section class="hero"><div><div class="eyebrow">WELCOME TO MCGRUBER LAB</div><h1>Small parts.<br><span>Big possibilities.</span></h1><p>A second life for old electronics.<br>A first step for your next invention.</p><div class="row wrap"><a class="button primary" href="#/project/P04/experiment">Open the workbench ${icon("arrow")}</a><a class="button hero-secondary" href="#/viewer">Explore the 3D lab ${icon("cube")}</a></div><div class="hero-note"><span class="live-dot"></span> Free, open-source, and built to experiment.</div></div><div class="hero-blueprint"><div class="blueprint-top">WORKBENCH / REV. 01 <span>CONCEPT STUDY</span></div><svg viewBox="0 0 500 310" role="img" aria-label="Original conceptual blueprint of a low-voltage switch and LED circuit"><defs><pattern id="hero-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0v22" fill="none" stroke="#a6c89e" stroke-opacity=".12"/></pattern></defs><rect width="500" height="310" fill="url(#hero-grid)"/><g transform="translate(30 18)" fill="none" stroke="#a9ccaa" stroke-width="1.5"><path d="m65 190 203-100 160 78-204 100z" fill="#223c30"/><path d="M65 190v12l159 78 204-100v-12 M224 268v12"/><path d="m86 190 180-88 137 66-180 87z" stroke-dasharray="3 6"/><g transform="translate(127 160)"><path d="m0 0 66-33 50 25-66 32z" fill="#354b3c"/><path d="M0 0v18l50 25 66-32V-8 M50 24v19"/><path d="m28 5 33-16 25 12" stroke="#d5e9af" stroke-width="5"/><circle cx="87" cy="-2" r="4" fill="#d5e9af"/></g><path d="m244 168 33-17 37 19 28-14" stroke="#da9f79" stroke-width="3"/><path d="m345 155 0-35q-13-25-27 0v22" stroke="#d7ef99" stroke-width="3" fill="#9bbd69"/><path d="m321 143-13 8"/><path d="m308 151-21 10 12 6-13 6 12 6-14 7-16-8" stroke="#e4d9a3" stroke-width="4"/><path d="M109 176 87 164v-60l70-34 61 30v28 M160 69v59" stroke="#c3dfa8" stroke-width="3"/><path d="m87 101 70-35 62 31-69 35z" fill="#496347"/><path d="m144 84 18-9 18 9-18 9z" fill="#d9efad"/><path d="M311 95h65V57 M73 227v31h80 M345 183h61v54" stroke-dasharray="3 4" opacity=".5"/><g font-size="10" stroke="none" fill="#c6d9b6" font-family="monospace"><text x="333" y="47">LED / OUTPUT</text><text x="15" y="275">NC CONTACT / INPUT</text><text x="350" y="252">470Ω / LIMIT</text><text x="194" y="53">+5V DC*</text></g></g></svg><div class="blueprint-bottom"><span>* CONDITIONAL CIRCUIT · UNVERIFIED HARDWARE</span><span>01 — 09</span></div></div></section><div class="stats"><div><strong>09</strong><span>Inventions to explore</span></div><div><strong>16</strong><span>Component requirements</span></div><div><strong>12</strong><span>Reported equipment groups</span></div><div><strong>00</strong><span>Verified physical builds</span></div></div><div class="section-title"><div><div class="eyebrow">A WORKSHOP FULL OF WHAT-IFS</div><h2>Your inventions <span class="count">9</span></h2></div><a href="#/components">Explore the component bank ${icon("arrow")}</a></div><div class="filter-bar"><label class="search">${icon("search")}<input id="project-search" type="search" aria-label="Search inventions" placeholder="Find your next experiment…"></label><div class="row wrap"><label>Category<select id="project-filter"><option value="all">All inventions</option>${[...new Set(catalog.projects.map((p) => p.category))].map((c) => `<option>${c}</option>`).join("")}<option value="favorites">Favorites</option><option value="recent">Recently opened</option></select></label><label>Complexity<select id="complexity-filter"><option value="all">All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div></div><div id="project-cards" class="project-grid"></div><div class="two-col lower-workshop"><a href="#/notebook" class="panel feature-link"><span class="eyebrow">LEAVE A TRAIL OF DISCOVERY</span><h2>Your notebook is part of the build.</h2><p>Settings, real observations, failed attempts, and the next good question. Keep them together.</p><span>Open notebook ${icon("arrow")}</span></a><a href="#/docs/docs/MEASUREMENT_PROTOCOL.md" class="panel feature-link"><span class="eyebrow">MAKE IT REPEATABLE</span><h2>An idea is a start. Evidence comes next.</h2><p>Simulated, reported, measured, reproduced: know exactly what each result tells you.</p><span>Read the measurement protocol ${icon("arrow")}</span></a></div>`;
}
function mountHome() {
  function cards() {
    const query = $("#project-search").value.toLowerCase(),
      filter = $("#project-filter").value,
      level = $("#complexity-filter").value;
    const projects = catalog.projects.filter(
      (p) =>
        JSON.stringify(p).toLowerCase().includes(query) &&
        (level === "all" || p.complexity === level) &&
        (filter === "all" ||
          p.category === filter ||
          (filter === "favorites" && workspace.favorites.includes(p.id)) ||
          (filter === "recent" && workspace.recent.includes(p.id))),
    );
    if (filter === "recent")
      projects.sort(
        (a, b) =>
          workspace.recent.indexOf(a.id) - workspace.recent.indexOf(b.id),
      );
    $("#project-cards").innerHTML = projects.length
      ? projects
          .map((p) => {
            const count = (workspace.progress[p.id]?.steps || []).filter(
              Boolean,
            ).length;
            return `<article class="project-card"><div class="card-art"><a href="#/project/${p.id}" aria-label="Open ${escape(p.name)}">${projectArt(catalog.projects.indexOf(p))}</a><span class="project-id">${p.id}</span><button data-favorite="${p.id}" class="favorite ${workspace.favorites.includes(p.id) ? "chosen" : ""}" aria-label="Favorite ${escape(p.name)}" aria-pressed="${workspace.favorites.includes(p.id)}">${icon("star")}</button><span class="level">${p.complexity}</span></div><div class="card-content"><span class="eyebrow">${p.category}</span><h3><a href="#/project/${p.id}">${escape(p.name)}</a></h3><p>${escape(p.description)}</p><div class="card-status"><span class="status-dot"></span>${escape(p.status)}</div><p class="card-blocker"><strong>Next:</strong> ${escape(p.blocker)}</p><div class="card-meta"><span>${p.bom.length} BOM lines</span><span>Cost unknown</span></div><div class="card-progress"><span style="width:${(count / p.steps.length) * 100}%"></span></div><div class="card-bottom"><span>${count}/${p.steps.length} steps · logic demo available</span><a href="#/project/${p.id}" aria-label="Open ${escape(p.name)}">${icon("arrow")}</a></div></div></article>`;
          })
          .join("")
      : '<div class="empty panel"><h3>No inventions match these filters.</h3><p>Try another category or favorite an invention.</p></div>';
    $$("[data-favorite]").forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.favorite;
          workspace.favorites = workspace.favorites.includes(id)
            ? workspace.favorites.filter((x) => x !== id)
            : [...workspace.favorites, id];
          save();
          cards();
        }),
    );
  }
  $("#project-search").oninput = cards;
  $("#project-filter").onchange = cards;
  $("#complexity-filter").onchange = cards;
  cards();
}
function calculatorHTML() {
  return `${heading("Numbers that make sense", "Engineering calculators", "Check an idea with clear formulas, units, and visible assumptions.")}<div class="calculator-layout"><div class="panel calc-list">${Object.entries(
    calculators,
  )
    .map(
      ([id, c]) =>
        `<button data-calculator="${id}">${escape(c.name)} ${icon("chevron")}</button>`,
    )
    .join(
      "",
    )}</div><div id="calculator-workspace" class="panel"></div></div><p class="notice">These calculations do not certify a circuit. Use the actual component datasheet, tolerances, supply behavior and measured loads. Servo and motor results are simplified estimates.</p>`;
}
function mountCalculators() {
  let current = "led";
  function display(id) {
    current = id;
    $$("[data-calculator]").forEach((b) =>
      b.classList.toggle("selected", b.dataset.calculator === id),
    );
    const c = calculators[id];
    $("#calculator-workspace").innerHTML =
      `<div class="eyebrow">CALCULATE / EXPLORE / CHECK</div><h2>${escape(c.name)}</h2><p class="formula">${escape(c.formula)}</p><form id="calculator-form"><div class="form-grid">${c.fields.map(([k, label, value]) => `<label>${escape(label)}<input name="${k}" value="${escape(value)}" ${typeof value === "number" || value === "" ? 'type="number" step="any"' : 'type="text"'}></label>`).join("")}</div><button class="primary" type="submit">Calculate ${icon("arrow")}</button></form><div id="calculator-result" class="calc-result" role="status"></div>`;
    const compute = () => {
      try {
        const result = calculate(
          current,
          Object.fromEntries(new FormData($("#calculator-form"))),
        );
        $("#calculator-result").innerHTML = Object.entries(result)
          .map(([key, value]) =>
            key === "warning"
              ? `<p class="notice">${escape(value)}</p>`
              : `<div class="result-line"><span>${escape(key)}</span><strong>${typeof value === "number" ? Number(value.toPrecision(7)).toLocaleString(undefined, { maximumFractionDigits: 8 }) : escape(value)}</strong></div>`,
          )
          .join("");
      } catch (e) {
        $("#calculator-result").textContent = e.message;
      }
    };
    $("#calculator-form").onsubmit = (e) => {
      e.preventDefault();
      compute();
    };
    compute();
  }
  $$("[data-calculator]").forEach(
    (b) => (b.onclick = () => display(b.dataset.calculator)),
  );
  display(current);
}
function docsHTML(file) {
  return `${heading("The repository, within reach", "Source library", "Original build instructions, BOMs, diagrams and research. These files stay part of the repository.")}<div class="docs-layout"><aside class="panel"><label>Search file paths<input type="search" id="doc-search" placeholder="Build, circuit, inventory…"></label><div id="doc-list" class="doc-list"></div></aside><article id="doc-content" class="panel"><h2>${file ? "Loading source…" : "Pick a source file."}</h2><p>Every invention’s actual documentation and evidence remains accessible here.</p></article></div>`;
}
function renderMarkdown(text, file) {
  const inline = (s) => {
    const tokens = String(s).split(/(!?\[[^\]]*\]\([^\s)]+\))/g);
    return tokens
      .map((t) => {
        const m = t.match(/^(!?)\[([^\]]*)\]\(([^\s)]+)\)$/);
        if (!m)
          return escape(t)
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/`([^`]+)`/g, "<code>$1</code>");
        let url;
        try {
          url = new URL(m[3], new URL("./repository/" + file, location.href));
        } catch {
          return escape(t);
        }
        if (!["https:", "http:"].includes(url.protocol)) return escape(m[2]);
        return m[1] && url.origin === location.origin
          ? `<img src="${escape(url.href)}" alt="${escape(m[2])}">`
          : `<a href="${escape(url.href)}" target="_blank" rel="noopener">${escape(m[2])}</a>`;
      })
      .join("");
  };
  let code = false;
  return text
    .split("\n")
    .map((line) => {
      if (line.startsWith("```")) {
        code = !code;
        return code ? "<pre><code>" : "</code></pre>";
      }
      if (code) return escape(line) + "\n";
      const h = line.match(/^(#{1,6}) (.+)$/);
      if (h) return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
      if (/^\s*[-*] |^\d+\. /.test(line))
        return `<p class="md-list">${inline(line)}</p>`;
      if (line.startsWith("|"))
        return `<div class="md-table-line">${inline(line)}</div>`;
      if (!line.trim()) return "<br>";
      return `<p>${inline(line)}</p>`;
    })
    .join("");
}
async function mountDocs(file, epoch) {
  function list() {
    const q = $("#doc-search").value.toLowerCase();
    $("#doc-list").innerHTML = catalog.documents
      .filter((d) => d.path.toLowerCase().includes(q))
      .map(
        (d) =>
          `<a href="#/docs/${d.path}" class="${d.path === file ? "active" : ""}">${escape(d.path)}</a>`,
      )
      .join("");
  }
  $("#doc-search").oninput = list;
  list();
  if (!file) return;
  const known = catalog.documents.find((d) => d.path === file);
  if (!known) {
    $("#doc-content").textContent =
      "That source file is not in the repository catalog.";
    return;
  }
  const url = "./repository/" + file,
    r = await fetch(url);
  if (!r.ok) throw Error("Source file could not be loaded.");
  if (epoch !== renderEpoch) return;
  const title = `<div class="row between wrap"><span class="eyebrow">${escape(file)}</span><a class="button" href="${escape(url)}" download>Download source ${icon("download")}</a></div>`;
  if (file.endsWith(".svg"))
    $("#doc-content").innerHTML =
      title +
      `<img class="source-image" src="${escape(url)}" alt="${escape(file)}">`;
  else if (file.endsWith(".stl"))
    $("#doc-content").innerHTML =
      title +
      '<h2>Original STL geometry</h2><p>Unprinted and fit-unverified.</p><a class="button primary" href="#/viewer">Inspect in 3D lab →</a>';
  else {
    const text = await r.text();
    if (epoch !== renderEpoch) return;
    $("#doc-content").innerHTML =
      title +
      (file.endsWith(".md")
        ? '<div class="markdown">' + renderMarkdown(text, file) + "</div>"
        : '<pre class="source-text">' + escape(text) + "</pre>");
  }
}
function settingsHTML() {
  return `${heading("Save it. Pick it up again.", "Backups & settings", "Your private workspace belongs to this browser. Backups let you move it safely.")}<div class="two-col"><div class="panel"><h2>Save & resume</h2><p>Favorites, notes, progress, inventory, diagrams, experiments, uploaded media and editable 3D geometry autosave to IndexedDB. Recent workspace revisions provide recovery.</p><p id="storage-estimate" class="muted"></p><div class="row wrap"><button id="backup-all" class="primary">Download full backup</button><label class="button">Restore full backup<input id="restore-backup" type="file" accept=".json" hidden></label><button id="persist-storage">Request persistent storage</button></div><p class="small muted">Do not clear website data before exporting. Private browsing, OS storage pressure and uninstalling can remove local files. A full backup includes media; records-only exports do not.</p><div id="backup-status" role="status"></div></div><div class="panel"><h2>Private drafts & public contributions</h2><p>GitHub Pages has no authenticated storage backend. This version does not sync private drafts between devices. No token, password or OAuth secret is requested or stored.</p><p>To contribute, export and review your files, remove personal information, and explicitly open a GitHub pull request yourself. Saving in this app never posts a public experiment.</p><a href="#/docs/docs/CLOUD_SYNC_DESIGN.md">Read the secure sync design →</a><h3>Use from an iPhone</h3><p>Open the deployed site in Safari. Use Share → Add to Home Screen. Import models with Files; pinch to zoom and use two fingers to pan. Notebook → New experiment records observations. Download a full backup before switching devices.</p></div></div><div class="panel"><h2>Local media storage</h2><p id="media-usage" class="muted">Inspecting saved attachments…</p><button id="cleanup-unused-media">Clean old unused media</button><p class="small muted">Cleanup keeps attachments used by the current workspace, drafts or any saved revision. Recently added files are kept for at least 24 hours. Matching uploads share storage when secure browser hashing is available.</p><div id="media-cleanup-result" role="status"></div></div><div class="panel"><h2>Recent saved revisions</h2><p class="muted">Up to ten workspace revisions. Restoring changes the current local workspace; attached media is retained.</p><div id="revision-list"></div></div>`;
}
async function mountSettings() {
  async function revisions() {
    const list = await storage.all("history");
    $("#revision-list").replaceChildren();
    for (const rev of list
      .sort(
        (a, b) =>
          (b.sequence || 0) - (a.sequence || 0) ||
          b.updated.localeCompare(a.updated),
      )
      .slice(0, 10)) {
      const row = document.createElement("div");
      row.className = "revision";
      const label = document.createElement("span");
      label.textContent = `${rev.conflictDraft ? "Recovered tab draft · " : ""}${formatDate(rev.updated)} · ${rev.records.length} experiments · ${rev.inventory.length} inventory items`;
      const button = document.createElement("button");
      button.textContent = "Restore revision";
      button.onclick = async () => {
        if (
          !confirm(
            "Restore this saved workspace revision? Your current workspace will be saved first.",
          )
        )
          return;
        try {
          await flushSave();
          workspace = {
            ...rev,
            id: "current",
            revision: workspace.revision,
            sequence: workspace.sequence,
            conflictDraft: false,
          };
          save();
          await flushSave();
          notify("Workspace revision restored.");
          await route();
        } catch (e) {
          showSaveProblem(e);
        }
      };
      row.append(label, button);
      $("#revision-list").append(row);
    }
  }
  $("#backup-all").onclick = async () => {
    try {
      if (!saveProblem) await flushSave();
      storage.download(
        await storage.backup(workspace),
        "mcgruber-lab-full-backup.json",
      );
      $("#backup-status").textContent =
        "Full backup prepared, including local attachments and scene geometry.";
    } catch (e) {
      notify(e.message);
    }
  };
  $("#restore-backup").onchange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 100 * 1024 * 1024) throw Error("Backup exceeds 100 MB.");
      if (
        !confirm(
          "Replace this device’s workspace with the selected backup? Your current workspace will be preserved as a revision.",
        )
      )
        return;
      await flushSave();
      workspace = await storage.restore(await file.text(), workspace);
      dirty = false;
      document.documentElement.dataset.theme = workspace.theme;
      notify("Backup restored.");
      await route();
    } catch (err) {
      if (err instanceof storage.WorkspaceConflictError) showSaveProblem(err);
      else {
        $("#backup-status").textContent = "Import rejected: " + err.message + ". Existing workspace retained.";
        notify(err.message);
      }
    }
    e.target.value = "";
  };
  $("#persist-storage").onclick = async () =>
    notify(
      navigator.storage?.persist && (await navigator.storage.persist())
        ? "Persistent storage granted by this browser."
        : "Persistent storage was not granted or is unsupported. Keep exported backups.",
    );
  if (navigator.storage?.estimate) {
    const s = await navigator.storage.estimate();
    if ($("#storage-estimate"))
      $("#storage-estimate").textContent =
        `Browser origin usage: ${(s.usage / 1024 / 1024).toFixed(1)} MB of approximately ${(s.quota / 1024 / 1024).toFixed(0)} MB. Last save: ${formatDate(workspace.updated)}.`;
  }
  async function refreshMediaUsage() {
    const usage = await storage.mediaUsage(workspace),
      el = $("#media-usage");
    if (el)
      el.textContent = `${usage.count} stored files · ${(usage.bytes / 1024 / 1024).toFixed(2)} MB · ${usage.referenced} referenced by current or recovery records · ${usage.unused} currently unused.`;
  }
  $("#cleanup-unused-media").onclick = async () => {
    try {
      await flushSave();
      const result = await storage.cleanupMedia(workspace);
      const el = $("#media-cleanup-result");
      if (el)
        el.textContent = `Removed ${result.removed} old unused files (${(result.bytes / 1024 / 1024).toFixed(2)} MB). ${result.retainedRecent} recent unused files retained.`;
      await refreshMediaUsage();
    } catch (e) {
      if (e instanceof storage.WorkspaceConflictError) showSaveProblem(e);
      else notify(e.message);
    }
  };
  await Promise.all([revisions(), refreshMediaUsage()]);
}
async function route() {
  const epoch = ++renderEpoch;
  if (cleanup) {
    const old = cleanup;
    cleanup = null;
    old();
  }
  const parts = location.hash.replace(/^#\/?/, "").split("/"),
    name = parts[0] || "";
  shell(name);
  const main = $("#main");
  document.title =
    (nav.find((n) => n[0] === name)?.[2] || "Invention") + " — McGruber Lab";
  try {
    if (!name) {
      main.innerHTML = homeHTML();
      mountHome();
    } else if (name === "project") {
      const p = catalog.projects.find((p) => p.id === parts[1]);
      if (!p) throw Error("Invention not found.");
      const tab = ["overview", "experiment", "guide", "files"].includes(
        parts[2],
      )
        ? parts[2]
        : "overview";
      workspace.recent = [
        p.id,
        ...workspace.recent.filter((id) => id !== p.id),
      ].slice(0, 9);
      save();
      main.innerHTML = projectHTML(p, ctx, tab);
      cleanup = mountProject(p, ctx, tab);
      document.title = p.name + " — McGruber Lab";
    } else if (name === "circuit") {
      main.innerHTML = circuitHTML(ctx);
      cleanup = mountCircuit(ctx);
    } else if (name === "viewer") {
      main.innerHTML =
        heading(
          "A closer look at the parts",
          "3D engineering lab",
          "Real mesh geometry. Your files stay on this device. Import, inspect, arrange and export.",
        ) +
        '<div id="viewer-host"><p class="panel">Loading the geometry tools…</p></div>';
      const { mountViewer } = await import("./viewer.js");
      if (epoch !== renderEpoch) return;
      const dispose = await mountViewer(
        $("#viewer-host"),
        workspace.scene,
        (data) => {
          workspace.scene = data;
          save();
        },
        notify,
      );
      if (epoch === renderEpoch) cleanup = dispose;
      else dispose();
    } else if (name === "tripwire-3d") {
      main.innerHTML = '<div id="tw3d-host"><p class="panel">Preparing the interactive assembly…</p></div>';
      const { mountTripwire3D } = await import("./tripwire-3d.js");
      if (epoch !== renderEpoch) return;
      const dispose = await mountTripwire3D($("#tw3d-host"), notify);
      if (epoch === renderEpoch) cleanup = dispose;
      else dispose();
      document.title = "Tripwire 3D assembly — McGruber Lab";
    } else if (name === "salvage") {
      main.innerHTML = salvageHTML();
      cleanup = mountSalvage(ctx, parts[1]);
    } else if (name === "components") {
      main.innerHTML = inventoryHTML();
      mountInventory(ctx, { deviceId: parts[1], partId: parts[2] });
    } else if (name === "notebook") {
      main.innerHTML = notebookHTML(ctx);
      cleanup = mountNotebook(ctx);
    } else if (name === "calculators") {
      main.innerHTML = calculatorHTML();
      mountCalculators();
    } else if (name === "docs") {
      const file = decodeURIComponent(parts.slice(1).join("/"));
      main.innerHTML = docsHTML(file);
      await mountDocs(file, epoch);
    } else if (name === "settings") {
      main.innerHTML = settingsHTML();
      await mountSettings();
    } else
      main.innerHTML = heading(
        "Not found",
        "This workbench is empty.",
        "Choose an invention from the workshop.",
        '<a href="#/" class="button">Back to workshop</a>',
      );
    if (epoch === renderEpoch) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
  } catch (e) {
    if (epoch !== renderEpoch) return;
    notify(e.message);
    main.innerHTML =
      '<div class="panel"><h1>Unable to open this workspace</h1><p>' +
      escape(e.message) +
      '</p><a href="#/">Return to workshop</a></div>';
  }
}
window.addEventListener("hashchange", route);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && dirty && !saveProblem)
    flushSave().catch(showSaveProblem);
});
window.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)
  ) {
    const search = $('input[type="search"]');
    if (search) {
      e.preventDefault();
      search.focus();
    }
  }
});
async function init() {
  try {
    const r = await fetch("./catalog.json");
    if (!r.ok)
      throw Error("Project catalog unavailable. Reload when connected.");
    catalog = await r.json();
    if (catalog.projects.length !== 9 || catalog.components.length !== 16)
      throw Error("Incomplete source catalog.");
    try {
      workspace = await storage.load();
    } catch (e) {
      showSaveProblem(e);
    }
    storage.watchWorkspace((revision) => {
      if (revision !== workspace.revision)
        showSaveProblem(new storage.WorkspaceConflictError());
    });
    document.documentElement.dataset.theme = workspace.theme;
    await route();
    if ("serviceWorker" in navigator && import.meta.env.PROD)
      navigator.serviceWorker
        .register("./sw.js")
        .catch(() =>
          notify("Offline cache unavailable; the online workshop still works."),
        );
  } catch (e) {
    app.innerHTML =
      '<main class="startup-error"><h1>McGruber Lab</h1><p>' +
      escape(e.message) +
      '</p><button onclick="location.reload()">Try again</button></main>';
  }
}
init();
