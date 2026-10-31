// Single source of truth for stable catalog identity and compatibility joins.
// Never infer a physical part's compatibility from a CSV row's position.
export const EXPECTED_PROJECT_SLUGS = Object.freeze([
  "01-light-beam-tripwire",
  "02-motion-prank",
  "03-pop-up-surprise-box",
  "04-object-removal-alarm",
  "05-wireless-clicker",
  "06-mouse-powered-gadgets",
  "07-standalone-control-box",
  "08-infrared-tripwire",
  "09-talking-prank-robot",
]);
export function projectFolders(directories) {
  if (!Array.isArray(directories)) throw Error("Invalid project directory list.");
  const dirs = [...directories].sort();
  if (dirs.length !== EXPECTED_PROJECT_SLUGS.length ||
      dirs.some((slug, i) => slug !== EXPECTED_PROJECT_SLUGS[i]))
    throw Error("Project folder identity mismatch: expected " + EXPECTED_PROJECT_SLUGS.join(", "));
  return dirs.map((slug) => {
    const ordinal = Number(slug.slice(0, 2));
    return { slug, ordinal, id: "P" + String(ordinal).padStart(2, "0") };
  });
}
export function csv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if (c === "\n" && !quoted) {
      row.push(cell.replace(/\r$/, ""));
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += c;
  }
  if (quoted) throw Error("Unterminated CSV field");
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift() || [];
  if (!headers.length || headers.some(h => !h) || new Set(headers).size !== headers.length)
    throw Error("Missing or duplicate CSV headers.");
  return rows.map((cells, i) => {
    if (cells.length !== headers.length)
      throw Error("CSV row " + (i + 2) + " has " + cells.length + " cells, expected " + headers.length);
    return Object.fromEntries(headers.map((header, j) => [header, cells[j]]));
  });
}
const key = (r) => {
  if (!r || typeof r.category !== "string" || !r.category.trim() ||
      typeof r.component !== "string" || !r.component.trim())
    throw Error("Component matrix requires a category and component label.");
  return r.category + "\u0000" + r.component;
};
export function joinCompatibility(requirements, matrix, projectIds) {
  if (!Array.isArray(requirements) || !Array.isArray(matrix) ||
      !Array.isArray(projectIds) || !projectIds.length ||
      new Set(projectIds).size !== projectIds.length)
    throw Error("Invalid catalog compatibility sources.");
  const rows = new Map();
  for (const row of matrix) {
    const id = key(row);
    if (rows.has(id)) throw Error("Duplicate compatibility matrix component: " + row.component);
    for (const projectId of projectIds)
      if (!Object.hasOwn(row, projectId) || !["R", "O", "A", "-"].includes(row[projectId]))
        throw Error("Invalid or missing " + projectId + " compatibility for " + row.component);
    for (const header of Object.keys(row))
      if (/^P\d{2}$/.test(header) && !projectIds.includes(header))
        throw Error("Unexpected project column " + header);
    rows.set(id, row);
  }
  const seen = new Set();
  const result = requirements.map((req, i) => {
    const id = key(req);
    if (seen.has(id)) throw Error("Duplicate required component: " + req.component);
    seen.add(id);
    const row = rows.get(id);
    if (!row) throw Error("Compatibility matrix missing component: " + req.component);
    return {
      ...req,
      id: "C" + String(i + 1).padStart(2, "0"),
      compatibility: Object.fromEntries(projectIds.map(p => [p, row[p]])),
      note: row.notes || "",
    };
  });
  if (seen.size !== rows.size)
    throw Error("Compatibility matrix contains unknown or extra components.");
  return result;
}
