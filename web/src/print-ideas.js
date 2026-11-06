// Browser-only catalog view. Source of truth: cad-and-stl/workshop/IDEAS.csv.
// These records are planning notes, NOT measured hardware or verified physical prints.
import { heading, escape } from "./ui.js";

const ROOT = "./repository/cad-and-stl/";
const CAD = {
  "M3D-000": ["prototype-angle-support.stl", "prototype-angle-support.scad"],
  "M3D-001": ["switch-fit-gauge.stl", "switch-fit-gauge.scad"],
  "M3D-002": ["workshop/models/open-electronics-tray.stl", "workshop/models/open-electronics-tray.scad"],
};
const STATUS = {
  "idea-only": "Idea only · no model",
  "source-present-unprinted": "Source available · not print-tested",
  "digitally-checked-unprinted": "Digitally checked · not print-tested",
  "print-tested": "Physical print documented",
  "hardware-fit-tested": "Hardware fit documented",
};

export function parseIdeaCSV(raw) {
  // Handles standard CSV quotes and embedded commas/newlines.
  const rows = [];
  let row = [], value = "", quoted = false;
  const input = String(raw ?? "").replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(value); value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(value); value = "";
      if (row.some((part) => part.trim())) rows.push(row);
      row = [];
    } else value += c;
  }
  if (quoted) throw Error("The 3D idea catalog has an unfinished CSV quotation.");
  row.push(value);
  if (row.some((part) => part.trim())) rows.push(row);
  const header = rows.shift() || [];
  for (const key of ["id", "title", "linked_project", "status", "next_gate"])
    if (!header.includes(key)) throw Error("The 3D idea catalog is missing a required column: " + key);
  return rows.map((fields) => {
    if (fields.length !== header.length) throw Error("Invalid 3D idea catalog row.");
    return Object.fromEntries(header.map((key, i) => [key, fields[i].trim()]));
  });
}

export function printIdeasHTML() {
  return heading("From spare parts to printable prototypes", "3D Printing Ideas",
    "Browse McGruber's original CAD files and future prints. These are research concepts until real prints and fits are documented.",
    '<a class="button" href="#/viewer">Open 3D Lab →</a>') +
    '<div class="notice">Nothing here is marked physically print-tested. Raw PLA cost estimates assume $20/kg and exclude machine access, hardware, supports and failed prints. STL geometry checks do not prove real-world fit.</div>' +
    '<div class="panel"><div class="row wrap between"><label>Search printable ideas<input id="print-idea-search" type="search" placeholder="Robot, GhostScan, switch, enclosure…"></label><label>Design stage<select id="print-idea-stage"><option value="all">All stages</option><option value="idea-only">Ideas only</option><option value="model">Has CAD or STL</option></select></label></div><p id="print-idea-count" class="small muted" role="status">Loading ideas…</p></div>' +
    '<div id="print-idea-results" class="component-grid" aria-live="polite"></div>' +
    '<div class="panel"><h2>Have another 3D-printing idea?</h2><p>Track new shared designs in the workshop issue so the repository remains the source of truth. You can browse the ideas here without purchasing a printer.</p><div class="row wrap"><a class="button primary" href="https://github.com/jimedusot-beep/project-mcgruber/issues/56" target="_blank" rel="noopener noreferrer">Suggest an idea on GitHub ↗</a><a class="button" href="#/docs/cad-and-stl/workshop/README.md">Read workshop guide</a></div></div>';
}

export function printIdeaCards(ideas) {
  return ideas.map((idea) => {
    const [stl, scad] = CAD[idea.id] || [];
    const grams = idea.filament_g_low && idea.filament_g_high
      ? idea.filament_g_low + "–" + idea.filament_g_high + " g estimated PLA"
      : "Material estimate not recorded";
    const cost = idea.raw_pla_usd_low && idea.raw_pla_usd_high
      ? " · about $" + idea.raw_pla_usd_low + "–$" + idea.raw_pla_usd_high + " raw PLA"
      : "";
    const modelActions = stl
      ? '<a class="button" href="' + ROOT + stl + '" download>Download STL</a>' +
        '<a href="#/docs/cad-and-stl/' + scad + '">View editable SCAD</a>'
      : '<span class="muted small">No printable model yet</span>';
    return '<article class="panel print-idea-card"><span class="eyebrow">' + escape(idea.id) + '</span>' +
      '<h2>' + escape(idea.title) + '</h2>' +
      '<p><strong>Related:</strong> ' + escape(idea.linked_project) + '</p>' +
      '<p class="pill">' + escape(STATUS[idea.status] || idea.status) + '</p>' +
      '<p class="small muted">Difficulty: ' + escape(idea.difficulty_1to5 || "unknown") +
        '/5 · ' + escape(grams + cost) + '</p>' +
      '<p><strong>Next proof:</strong> ' + escape(idea.next_gate) + '</p>' +
      '<div class="row wrap">' + modelActions + '</div></article>';
  }).join("");
}

export async function mountPrintIdeas(host) {
  const count = host.querySelector("#print-idea-count");
  const result = host.querySelector("#print-idea-results");
  const search = host.querySelector("#print-idea-search");
  const stage = host.querySelector("#print-idea-stage");
  let ideas;
  try {
    const response = await fetch(ROOT + "workshop/IDEAS.csv");
    if (!response.ok) throw Error("Idea list unavailable (HTTP " + response.status + ").");
    ideas = parseIdeaCSV(await response.text());
    if (!ideas.length) throw Error("The idea list is empty.");
  } catch (error) {
    if (host.isConnected) {
      count.textContent = "Catalog unavailable.";
      result.innerHTML = '<section class="panel"><h2>Unable to load ideas</h2><p>' + escape(error.message) + '</p><a href="#/docs/cad-and-stl/workshop/README.md">Read the workshop guide</a></section>';
    }
    return;
  }
  if (!host.isConnected) return;
  function render() {
    const q = search.value.trim().toLowerCase();
    const filtered = ideas.filter((idea) =>
      [idea.id, idea.title, idea.linked_project, idea.next_gate].join(" ").toLowerCase().includes(q) &&
      (stage.value === "all" || (stage.value === "model" ? Boolean(CAD[idea.id]) : idea.status === stage.value)));
    count.textContent = "Showing " + filtered.length + " of " + ideas.length + " ideas · " +
      ideas.filter((idea) => Boolean(CAD[idea.id])).length + " with existing model files";
    result.innerHTML = filtered.length ? printIdeaCards(filtered)
      : '<div class="panel"><h2>No matching ideas</h2><p>Try another search or stage.</p></div>';
  }
  search.addEventListener("input", render);
  stage.addEventListener("change", render);
  render();
}
