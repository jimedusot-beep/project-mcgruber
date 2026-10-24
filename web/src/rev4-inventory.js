// Public source-based Rev 4 inventory. This is reference data, never a verified test.
import { escape } from "./ui.js";

const categories = new Set(["Optics", "Power", "Wiring", "Other"]);

export function filterReferenceInventory(reference, query = "", filter = "all") {
  const q = String(query).trim().toLowerCase();
  return (reference?.items || []).filter((item) =>
    (filter === "all" || !categories.has(filter) || item.category === filter) &&
    (!q || JSON.stringify(item).toLowerCase().includes(q)),
  );
}

// Deliberate opt-in: only users can copy reference entries into local IndexedDB.
// Never attach artificial passing tests, inferred voltage/current, or BOM matches.
export function referenceToPersonalPart(item, id, updated = new Date().toISOString()) {
  if (!item || !/^REF-\d{2}$/.test(item.id) || item.subassemblyOf)
    throw Error("Select a standalone source record.");
  return {
    id,
    name: item.name,
    category: "Reported equipment",
    kind: "unknown",
    status: item.evidence === "Reported" ? "Unverified" : "Owned",
    verification: "Not electrically tested",
    quantity: item.id === "REF-13" ? "3 pieces / 1 group" : "1 group",
    partNumber: item.model,
    note: "McGruber Rev 4 (2026-10-23), PDF p." + item.sourcePage +
      "; " + item.evidence + ". " + item.description +
      " Safety/limits: " + item.safety +
      " Source data, not proof of tested electrical function.",
    sourceReferenceId: item.id,
    projects: [],
    requirementIds: [],
    test: { result: "Not tested" },
    updated,
  };
}

export function referenceInventoryHTML(reference, query = "", filter = "all", personal = []) {
  if (!reference?.items) return '<div class="notice">Master inventory unavailable in this build.</div>';
  const entries = filterReferenceInventory(reference, query, filter);
  const tracked = new Set(personal.map((p) => p.sourceReferenceId).filter(Boolean));
  const added = reference.items.filter((r) => !r.subassemblyOf && tracked.has(r.id)).length;
  const records = reference.items.filter((r) => !r.subassemblyOf).length;
  return '<section class="panel">' +
      '<span class="eyebrow">MASTER SALVAGE REFERENCE · REV 4 · OCT 23, 2026</span>' +
      '<h2>23 annotated entries · 22 distinct groups</h2>' +
      '<p class="muted">Source: 26-page photographed master reference. Entry #12 is a detached piece of remote #10, not another device. Source PDF page numbers appear on every record; the actual photographs are in the original PDF and are not published by this text-only catalog.</p>' +
      '<p class="notice">Seen = directly pictured; Documented = model/source information; Possible = unverified. Ownership does not mean electrically tested. No working 6–15-foot light detector, matching IR pair, or retroreflector has been proven.</p>' +
      '<div class="row wrap"><button type="button" id="import-master-inventory" class="primary">Add missing source groups to My inventory</button>' +
      '<span class="small muted">' + added + ' of ' + records + ' standalone source groups already imported on this device; existing records will not be replaced.</span></div>' +
    '</section>' +
    (entries.length ? '<div class="component-grid">' + entries.map((item) =>
      '<article class="panel component reference-component">' +
        '<span class="eyebrow">' + escape(item.id) + ' · PDF p.' + escape(item.sourcePage) +
        ' · ' + escape(item.category) + '</span>' +
        '<h3>' + escape(item.name) + '</h3>' +
        '<div class="row wrap"><span class="pill">' + escape(item.evidence) + '</span>' +
        '<span class="pill">' + escape(item.priority) + ' reuse priority</span>' +
        (item.subassemblyOf ? '<span class="pill">Part of #10</span>' : '') + '</div>' +
        '<dl><dt>Model / markings</dt><dd>' + escape(item.model) + '</dd>' +
        '<dt>Condition</dt><dd>' + escape(item.state) + '</dd>' +
        '<dt>Potential reuse</dt><dd>' + escape(item.description) + '</dd>' +
        '<dt>Safety / unknowns</dt><dd>' + escape(item.safety) + '</dd></dl>' +
        '<details><summary>Documented components (' + item.components.length + ')</summary>' +
        '<ul>' + item.components.map((part) => '<li>' + escape(part) + '</li>').join("") + '</ul>' +
        '</details>' +
        (item.subassemblyOf
          ? '<p class="small muted">Tracked as a subassembly of REF-10. Not importable as another remote.</p>'
          : '<button type="button" data-import-reference="' + escape(item.id) + '"' +
            (tracked.has(item.id) ? ' disabled' : '') + '>' +
            (tracked.has(item.id) ? 'Already in My inventory' : 'Add to My inventory') +
            '</button>') +
      '</article>'
    ).join("") + '</div>' :
    '<div class="empty panel"><h2>No reference entries found</h2><p>Try another search or category.</p></div>');
}
