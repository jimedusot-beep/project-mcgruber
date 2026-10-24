// Deterministic, evidence-aware recommendations. No LLM, network, hardware control,
// automatic electrical identification, or fabricated physical test results.
import { projectMatches } from "./salvage-core.js";

export const focus = {
  P01: {
    priority: 2,
    title: "Visible light-beam detector",
    references: ["REF-23", "REF-19", "REF-22", "REF-03", "REF-08"],
    next: "Test a loose LED as a *weak* detector at close range in DC mV with fixed geometry. Record light / blocked / restored values; do not infer 15-foot reliability.",
    gate: "A measured receiver signal plus a rated switching/threshold stage; phone-camera detection does not qualify a standalone device.",
  },
  P02: {
    priority: 6,
    title: "Motion-triggered indication",
    references: ["REF-07", "REF-08", "REF-23", "REF-20"],
    next: "Simulate the motion state machine or test a mechanical switch trigger first. No standalone PIR motion sensor has been verified.",
    gate: "An identified motion sensor, its correct power interface, and repeatable observed events.",
  },
  P03: {
    priority: 3,
    title: "Low-force surprise mechanism",
    references: ["REF-01", "REF-02", "REF-12", "REF-20"],
    next: "Prototype a light cardboard hinge, paper spring and manual latch; measure clearance and keep the stored force low.",
    gate: "Twenty measured safe cycles without sticking, excessive travel or sharp contacts.",
  },
  P04: {
    priority: 1,
    title: "Object-removal indicator",
    references: ["REF-07", "REF-08", "REF-19", "REF-23", "REF-22", "REF-20"],
    next: "With every battery removed, map the released and pressed continuity for an isolated mouse microswitch. Document COM/NO/NC, then plan a current-limited LED loop.",
    gate: "Measured contact map, verified supply and LED current limiting; twenty actual object-removal cycles.",
  },
  P05: {
    priority: 8,
    title: "Owned-device wireless clicker",
    references: ["REF-11", "REF-10", "REF-13"],
    next: "Photograph exact key-fob markings and identify a compatible legal receiver; 433 MHz on a label is not an IR protocol or a decoded command.",
    gate: "Identified receiver and repeatable authorized button events. Avoid unknown RF transmission or third-party access.",
  },
  P06: {
    priority: 4,
    title: "Mouse-switch gadget",
    references: ["REF-07", "REF-08", "REF-13", "REF-17"],
    next: "Inspect one mouse switch with all power removed. Record continuity for each pin pair in both actuator states and repeat ten times.",
    gate: "Identified contacts, sound mounting, and ten clean intentional input events.",
  },
  P07: {
    priority: 5,
    title: "Portable silent control box",
    references: ["REF-07", "REF-08", "REF-23", "REF-19", "REF-20", "REF-22"],
    next: "Start with a protected, measured low-voltage source, manual switch and current-limited status LED; defer sound and motors.",
    gate: "Verified loaded supply, polarity, LED current, insulation and twenty reliable switching cycles.",
  },
  P08: {
    priority: 7,
    title: "Infrared beam detector",
    references: ["REF-10", "REF-08", "REF-03", "REF-19"],
    next: "Determine whether the R-NZ board really emits infrared with a suitable camera or sensor. An intermittent remote burst cannot be assumed to form a continuous break-beam.",
    gate: "A matched, correctly specified IR transmitter/receiver, ambient-light testing and measured detection distance.",
  },
  P09: {
    priority: 9,
    title: "Tabletop robot experiment",
    references: ["REF-01", "REF-16", "REF-20", "REF-21", "REF-22"],
    next: "Inventory actuators and motors separately, note unknown electrical ratings, and prototype soft, low-force movement in simulation first.",
    gate: "Identified actuator and driver, protected source, travel stops and measured safe motion cycles.",
  },
};

const dangerous = {
  "REF-02": "Disconnect both the telephone line and any external power. Legacy ringer circuits may carry hazardous voltages.",
  "REF-03": "Keep the lithium power bank sealed. Check external USB output only through its intended connectors.",
  "REF-04": "Keep the charging case sealed and powered only as designed; earbuds are not confirmed in this inventory.",
  "REF-08": "Leave the unidentified rechargeable cell insulated and attached. Do not short, puncture, rewire or bypass protection.",
  "REF-10": "Disconnect the remote batteries before probing. The RF antenna is not an optical receiver; IR output remains unverified.",
  "REF-11": "433 MHz RF is not infrared; do not transmit unknown codes to devices you do not own or operate.",
  "REF-14": "The Color Organ PCB is unpopulated. Do not apply a battery to unknown copper traces.",
  "REF-15": "The Round 16 PCB is unpopulated; its 9V marking does not prove suitability for another battery holder.",
  "REF-16": "Identify exact part markings and manufacturer package orientation before proposing an energized semiconductor test.",
  "REF-20": "Cell size, polarity, switch behavior and series/parallel wiring are unknown until measured without power.",
  "REF-21": "Unknown black wired module: no voltage or polarity is established. Do not connect a battery.",
};

export function diagnosticProtocol(item) {
  if (!item?.id || typeof item.id !== "string") return null;
  const id = item.id;
  const steps = [
    "Record all markings and photograph both sides, connector orientation, physical condition and nearby labels.",
    "Disconnect every supply first. Keep sealed lithium cells enclosed; do not open line-powered equipment or unknown power modules.",
    "Match a manufacturer and package to a specific datasheet, without treating board reference labels as chip part numbers.",
    "Choose an appropriate unpowered continuity, resistance, dimension or inspection test; never assume a connector's voltage from its shape.",
    "Log actual readings, instrument mode, date, uncertainty and any failed trial. Leave absent readings blank and classification unverified.",
  ];
  let technique = "Unknown assembly: visual inspection and manufacturer-document search only until terminals and ratings are identified.";
  if (["REF-07", "REF-08", "REF-09"].includes(id))
    technique = "For a physically isolated mouse/keyboard switch, use power-off continuity across each candidate pair in both pressed and released states. Optical imaging chips are near-surface sensors, not plug-in long-range detectors.";
  else if (id === "REF-23" || id === "REF-19")
    technique = "Identify an ordinary LED's polarity and resistance using appropriate isolated meter tests. Only attempt an energized LED circuit after validating a current-limiting resistor, source and ratings.";
  else if (id === "REF-10")
    technique = "Check for remote IR transmission noninvasively using a compatible camera while operating your own remote normally; confirm actual emission before planning any reuse.";
  else if (id === "REF-17" || id === "REF-18" || id === "REF-22")
    technique = "Sort by gauge, termination and insulation. Use the appropriate crimp or breadboard connection method, then perform unpowered continuity and strain checks.";
  else if (id === "REF-16")
    technique = "Separate parts by exact legible model marking. Compare datasheet pin-numbering and package orientation before using diode/continuity mode.";
  else if (id === "REF-20")
    technique = "With all cells removed, continuity-map holder contacts and suspected switch positions. Later verify polarity and open-circuit voltage with correctly installed known cells.";
  else if (id === "REF-01" || id === "REF-02")
    technique = "After disconnection, trace wiring and identify loose switches, speakers, housing, and printed board labels. Telephone diodes are not automatically photodiodes.";
  else if (id === "REF-14" || id === "REF-15")
    technique = "Treat footprints as empty; identify pads and schematic from the exact PCB revision. Do not power an unpopulated board.";
  return {
    id,
    title: item.name,
    safety: dangerous[id] || item.safety || "Keep the part unpowered until its interfaces are known.",
    technique,
    steps,
    evidence: "Seen/Documented/Reported are source descriptions, not bench verification. Any values and conclusions must come from actual measurements.",
    sourcePage: item.sourcePage,
  };
}

export function opportunityList(catalog, workspace) {
  const matches = projectMatches(catalog, workspace.inventory);
  const documented = catalog.rev4Inventory?.items || [];
  const ownSourceIds = new Set(workspace.inventory.map((p) => p.sourceReferenceId).filter(Boolean));
  return matches.map((m) => {
    const plan = focus[m.project.id];
    const related = plan.references.map((id) => documented.find((i) => i.id === id)).filter((i) => i && !i.subassemblyOf);
    const recorded = related.filter((i) => ownSourceIds.has(i.id));
    const missing = m.requirements.filter((c) => c.state === "missing");
    const needTests = m.requirements.filter((c) => c.state === "needs-test");
    // An unverified reference is a lead, never a verified requirement.
    return {
      ...m,
      plan,
      related,
      recorded,
      missing,
      needTests,
      displayStatus: m.covered === m.total && m.total > 0
        ? "All categories have recorded passing tests; electrical fit still unverified"
        : m.covered > 0
          ? "Partial category test evidence"
          : "Planning / identification only",
    };
  }).sort((a,b) => a.plan.priority - b.plan.priority);
}

export function projectOpportunity(catalog, workspace, projectId) {
  return opportunityList(catalog, workspace).find((p) => p.project.id === projectId) || null;
}

export function availableLeadCount(catalog, workspace) {
  return opportunityList(catalog, workspace).reduce((n,p)=>n + p.recorded.length,0);
}
