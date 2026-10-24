import {
  readFile,
  writeFile,
  mkdir,
  cp,
  readdir,
  rm,
  stat,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
export const root = fileURLToPath(new URL("../../", import.meta.url));
const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
if (
  !(await stat(path.join(root, "projects")).catch(() => null)) &&
  (await stat(path.join(publicDir, "catalog.json")).catch(() => null))
) {
  console.log("Using generated repository snapshot for isolated preview.");
  process.exit(0);
}
export function csv(text) {
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" && !quoted) {
      row.push(cell.replace(/\r$/, ""));
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw Error("Unterminated CSV field");
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  const headers = rows.shift() || [];
  return rows.map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, r[i] || ""])),
  );
}
const metadata = [
  [
    "Light-Beam Tripwire",
    "Turn an interrupted beam of light into an alarm.",
    "Sensors",
    "Intermediate",
    "Reported phone demonstration",
    "Independent light detector and comparator",
  ],
  [
    "Motion-Activated Prank",
    "Make movement the cue for a well-timed sound.",
    "Software",
    "Intermediate",
    "Webcam route proposed",
    "Webcam permission and recorded trials",
  ],
  [
    "Pop-Up Surprise Box",
    "Build a tiny surprise with paper, a spring, and a latch.",
    "Mechanisms",
    "Beginner",
    "Mechanical build proposed",
    "Measured box, low-force latch and cycle test",
  ],
  [
    "Object-Removal Alarm",
    "Lift an object. Close a contact. Trigger an indicator.",
    "Switches",
    "Beginner",
    "Salvaged switches reported",
    "Measured COM/NC contacts and verified 5V source",
  ],
  [
    "Wireless Clicker",
    "Explore three commands from a salvaged remote.",
    "Wireless",
    "Advanced",
    "Fob LED response reported",
    "Matched RF receiver and decoder",
  ],
  [
    "Mouse-Powered Gadgets",
    "Give old mouse switches a second life.",
    "Salvage",
    "Beginner",
    "Donor mice reported",
    "Interface identification and contact measurements",
  ],
  [
    "Standalone Alarm / Control Box",
    "Bring power, a trigger, and an output into one box.",
    "Switches",
    "Intermediate",
    "Standalone design proposed",
    "Rated 5V active buzzer and measured switch limits",
  ],
  [
    "Invisible Infrared Tripwire",
    "Explore an invisible beam and a matched receiver.",
    "Sensors",
    "Intermediate",
    "Matched pair needed",
    "Identified IR pair, supply and output logic",
  ],
  [
    "Talking / Moving Robot",
    "Connect a trigger to a voice and a little movement.",
    "Robotics",
    "Advanced",
    "Elmo donor reported",
    "Power diagnosis, motor driver and sound subsystem",
  ],
];
const read = (p) => readFile(path.join(root, p), "utf8");
await mkdir(publicDir, { recursive: true });
const dirs = (await readdir(path.join(root, "projects"))).sort();
const projects = await Promise.all(
  dirs.map(async (slug, i) => {
    const folder = "projects/" + slug,
      build = await read(folder + "/BUILD.md");
    const procedure =
      build.match(/(?:^|\n)## (?:Procedure|Specific stages, in order)\s*\n([\s\S]*?)(?=\n## |$)/)?.[1] || "";
    return {
      id: "P" + String(i + 1).padStart(2, "0"),
      slug,
      folder,
      name: metadata[i][0],
      description: metadata[i][1],
      category: metadata[i][2],
      complexity: metadata[i][3],
      status: metadata[i][4],
      blocker: metadata[i][5],
      cost: null,
      issue: i + 4,
      bom: csv(await read(folder + "/BOM.csv")),
      steps: [...procedure.matchAll(/^\d+\. (.+)$/gm)].map((m) => m[1]),
      files: [
        "README.md",
        "BUILD.md",
        "BOM.csv",
        "CIRCUIT.md",
        "TEST_LOG.csv",
        "diagrams/architecture.svg",
        ...([3, 6].includes(i) ? ["diagrams/wiring-example-5v.svg"] : []),
        ...(i === 0 ? ["diagrams/exploded-assembly.svg", "diagrams/signal-flow.svg", "ASSEMBLY_VIEW.md", "BUILD_WORKBOOK.md", "THREE_D_HANDOFF.md", "PHONE_BUILD_TEST.md", "PHONE_BOM.csv", "PHONE_TEST_LOG.csv", "PHONE_VERIFICATION.md", "diagrams/phone-led-wiring.svg"] : []),
      ].map((f) => folder + "/" + f),
    };
  }),
);
const requirements = csv(await read("component-bank/components.csv"));
const matrix = csv(await read("component-bank/compatibility.csv"));
const components = requirements.map((r, i) => ({
  ...r,
  id: "C" + String(i + 1).padStart(2, "0"),
  compatibility: Object.fromEntries(
    projects.map((p) => [p.id, matrix[i][p.id]]),
  ),
  note: matrix[i].notes,
}));
const inventory = csv(await read("component-bank/inventory-v2.csv"));
const rev4Inventory = JSON.parse(await read("component-bank/master-salvage-inventory.json"));
const newArrivals = JSON.parse(await read("component-bank/owner-new-arrivals.json"));
if (!Array.isArray(newArrivals.items) || new Set(newArrivals.items.map((x)=>x.id)).size !== newArrivals.items.length || !newArrivals.items.some((x)=>x.id==="ARR-001" && x.kitNo==="1209"))
  throw Error("Owner new arrivals source regression");
if (rev4Inventory.items.length !== 23 || rev4Inventory.items.filter((item) => !item.subassemblyOf).length !== 22 || new Set(rev4Inventory.items.map((item) => item.id)).size !== 23)
  throw Error("Rev 4 master inventory coverage regression");
const documents = [];
await rm(path.join(publicDir, "repository"), { recursive: true, force: true });
for (const dir of [
  "projects",
  "component-bank",
  "cad-and-stl",
  "docs",
  "media",
]) {
  await cp(path.join(root, dir), path.join(publicDir, "repository", dir), {
    recursive: true,
    filter: (p) => !p.includes("__pycache__") && !p.endsWith(".pyc"),
  });
  async function walk(p) {
    for (const f of await readdir(path.join(root, p), {
      withFileTypes: true,
    })) {
      const rel = p + "/" + f.name;
      if (f.isDirectory()) {
        if (f.name !== "__pycache__") await walk(rel);
      } else if (/\.(md|csv|svg|stl|scad|py)$/.test(rel))
        documents.push({ path: rel, title: f.name, group: p });
    }
  }
  await walk(dir);
}
for (const file of [
  "README.md",
  "LICENSE",
  "LICENSE-HARDWARE",
  "CONTRIBUTING.md",
  "SECURITY.md",
]) {
  await cp(path.join(root, file), path.join(publicDir, "repository", file));
  documents.push({ path: file, title: file, group: "Repository" });
}
const catalog = {
  schema: 1,
  source: "jimedusot-beep/project-mcgruber",
  projects,
  components,
  inventory,
  rev4Inventory,
  newArrivals,
  documents,
};
await mkdir(path.join(publicDir, "licenses"), { recursive: true });
await cp(
  path.join(root, "web/node_modules/three/LICENSE"),
  path.join(publicDir, "licenses/three-MIT.txt"),
);
await cp(
  path.join(root, "web/THIRD_PARTY_NOTICES.md"),
  path.join(publicDir, "licenses/THIRD_PARTY_NOTICES.md"),
);
await writeFile(path.join(publicDir, "catalog.json"), JSON.stringify(catalog));
console.log(
  `Catalog: ${projects.length} inventions, ${components.length} requirements, ${inventory.length} legacy equipment groups, ${rev4Inventory.items.length} Rev 4 records, ${newArrivals.items.length} photographed arrivals, ${documents.length} source files.`,
);

