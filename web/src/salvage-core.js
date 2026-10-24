// Offline salvage records and conservative low-voltage planning. No hardware control.
export const deviceKinds = {
  mouse: "Computer mouse", "corded-phone": "Corded landline phone",
  "cordless-phone": "Cordless phone / handset", other: "Other small device",
};
export const partKinds = { unknown: "Not identified", switch: "Passive switch", board: "DC module / powered assembly", led: "LED", motor: "Motor", audio: "Speaker / microphone / audio part", mechanical: "Mechanical part" };
export const salvageReferences = [
  ["Unpowered continuity tests — Fluke", "https://www.fluke.com/en-us/learn/blog/digital-multimeters/how-to-test-for-continuity"],
  ["Example mouse switch removal — model-specific iFixit guide", "https://www.ifixit.com/Guide/Microsoft+Wheel+Mouse+Optical+1.1A+Microswitch+Replacement/117288"],
  ["Example cordless handset teardown — Making Studio", "https://makingstudio.blog/2020/09/14/phone-handset/"],
  ["Converter operating limits — TI TPS63060 example datasheet", "https://www.ti.com/lit/ds/symlink/tps63060.pdf"],
];
export function teardownSteps(kind) {
  const first = "Record the exact model and photograph every side, label and connector. Find a teardown or service reference for that model before choosing fasteners to remove.";
  const isolate = kind.includes("phone")
    ? "Disconnect the telephone wall line, external adapter and removable batteries. Keep the adapter sealed. Work only on the disconnected handset or low-voltage device; do not probe a live telephone line or mains circuitry."
    : "Unplug USB and remove removable batteries. Verify that the device is unpowered. Leave damaged or glued-in cells in place and use a model-specific service procedure.";
  return [first, isolate,
    "Use the matching driver and plastic opening tool. Photograph each layer and label screws by location. Stop if the enclosure needs force or the opening method is unknown.",
    kind === "mouse"
      ? "Photograph both board faces and switch markings. Keep the board intact until you know which part to recover. A wheel may use an optical or mechanical sensor; its appearance alone does not establish a pinout."
      : kind.includes("phone")
        ? "Label the keypad, receiver, microphone and other candidate parts on photos. Treat them as candidates until identified; a receiver, microphone and electronic ringer need different supporting circuits."
        : "Label candidate parts and connectors on photos. Preserve markings and wiring orientation before disconnecting anything.",
    "For a plug-in part, release its connector latch and pull the connector body. Soldered parts need a temperature-controlled iron, solder removal, eye protection and ventilation. Clear solder before lifting each lead; stop if pads start moving. Do not heat a cell or force a part out.",
    "Assign a part ID and storage location. Record markings, removal damage and an unpowered test. Use a power plan only after identifying the exact component requirements. Completion of this checklist does not verify a part.",
  ];
}
export const unpoweredTests = {
  switch: "With the switch isolated from power and other circuit paths, use the meter's continuity/resistance setting. Record each terminal pair with the actuator released and pressed. Repeat and note intermittent readings. Map COM/NO/NC from the observations and exact documentation; continuity does not establish a current rating.",
  audio: "Record markings, terminal count and photos. For a confirmed passive speaker, an isolated resistance reading may help document its coil, but does not establish impedance or power rating. A microphone is not a speaker; identify its type and bias requirements before electrical tests. Never apply a battery to an unknown audio part.",
  mechanical: "Inspect for cracks, sharp edges, travel and mounting dimensions. Record the actual measuring tool and observed dimensions. Use a gentle, unloaded fit check before planning a mechanism.",
  unknown: "Record markings, connector orientation, photos and visible damage first. Consult the exact datasheet or service guide to choose a test. Unknown voltage, polarity and pinout remain blank; the donor device's original battery is not proof of a recovered part's rating.",
};
const object = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const txt = (v, max = 5000) => v == null || (typeof v === "string" && v.length <= max);
const ref = (v) => typeof v === "string" && v.length > 0 && v.length <= 200;
const num = (v) => typeof v !== "boolean" && v != null && String(v).trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
const numericFields = ["minV", "maxV", "runMa", "peakMa"];
export const planNumericFields = ["sourceMinV", "sourceMaxV", "sourceCurrentMa", "inputMinV", "inputMaxV", "outputMinV", "outputMaxV", "outputCurrentMa", "efficiency", "capacityMah", "nominalV", "usable"];
const boundedNumbers = (o, keys) => keys.every((k) => o[k] == null || o[k] === "" || (num(o[k]) !== null && num(o[k]) >= 0 && num(o[k]) <= 1e6));
export function validateInventoryPart(p) {
  if (!object(p) || !ref(p.id) || typeof p.name !== "string" || p.name.length > 500 ||
      typeof p.status !== "string" || !Array.isArray(p.projects) ||
      p.projects.some((id) => !/^P0[1-9]$/.test(id)))
    throw Error("Invalid inventory records.");
  for (const k of ["note", "verification_note", "voltage", "maximum_current", "location", "partNumber", "manufacturer", "pinout", "datasheet", "category", "verification", "quantity", "cost", "shipping"])
    if (!txt(p[k])) throw Error("Invalid inventory field: " + k);
  if (p.requirementIds != null && (!Array.isArray(p.requirementIds) || p.requirementIds.length > 16 || p.requirementIds.some((id) => !/^C(0[1-9]|1[0-6])$/.test(id))))
    throw Error("Invalid requirement associations.");
  if (p.kind != null && !Object.hasOwn(partKinds, p.kind)) throw Error("Invalid part kind.");
  if (p.electrical != null && (!object(p.electrical) || !boundedNumbers(p.electrical, numericFields) ||
      ["positive", "negative", "evidence"].some((k) => !txt(p.electrical[k]))))
    throw Error("Invalid electrical identification.");
  if (p.test != null) {
    const t = p.test;
    if (!object(t) || !["Not tested", "Pass", "Fail", "Inconclusive"].includes(t.result) ||
        ["method", "instrument", "expected", "observed", "date"].some((k) => !txt(t[k])) ||
        (t.date && Number.isNaN(Date.parse(t.date)))) throw Error("Invalid part test.");
    if (t.result !== "Not tested" && ["method", "instrument", "expected", "observed", "date"].some((k) => !t[k]?.trim()))
      throw Error("Part tests need a method, instrument, expected and observed results, and date.");
  }
  return p;
}
export function validateSalvage(workspace) {
  const state = workspace.salvage || { devices: [], plans: [] };
  if (!object(state) || !Array.isArray(state.devices) || !Array.isArray(state.plans) || state.devices.length > 200 || state.plans.length > 500)
    throw Error("Invalid salvage workspace.");
  const deviceIds = new Set(), partIds = new Set(workspace.inventory.map((p) => p.id));
  for (const d of state.devices) {
    if (!object(d) || !ref(d.id) || deviceIds.has(d.id) || !Object.hasOwn(deviceKinds, d.kind) ||
        !["name", "model", "goal", "notes", "manualUrl"].every((k) => txt(d[k])) || !d.name?.trim() ||
        typeof d.isolated !== "boolean" || !Array.isArray(d.steps) || d.steps.length > 6 || d.steps.some((v) => typeof v !== "boolean") ||
        !Array.isArray(d.photos) || d.photos.length > 20) throw Error("Invalid donor device.");
    deviceIds.add(d.id);
    for (const photo of d.photos) {
      if (!object(photo) || !ref(photo.id) || !ref(photo.mediaId) || !Array.isArray(photo.annotations) || photo.annotations.length > 50)
        throw Error("Invalid teardown photo.");
      for (const a of photo.annotations)
        if (!object(a) || !ref(a.id) || !txt(a.label, 140) || !a.label?.trim() ||
            !Number.isFinite(a.x) || !Number.isFinite(a.y) || a.x < 0 || a.x > 1 || a.y < 0 || a.y > 1 ||
            (a.partId && !partIds.has(a.partId))) throw Error("Invalid photo annotation.");
    }
  }
  const planIds = new Set();
  for (const p of state.plans) {
    if (!object(p) || !ref(p.id) || planIds.has(p.id) || !partIds.has(p.partId) ||
        !["direct", "buck", "boost", "buck-boost", "unknown"].includes(p.topology) ||
        !["aa-holder", "usb-pack", "protected-pack"].includes(p.sourceKind) ||
        !boundedNumbers(p, planNumericFields) ||
        ["sourceName", "sourceEvidence", "regulatorName", "regulatorEvidence", "notes"].some((k) => !txt(p[k])) ||
        ["polarityChecked", "supportChecked", "sourceProtected"].some((k) => typeof p[k] !== "boolean"))
      throw Error("Invalid power plan.");
    planIds.add(p.id);
  }
  for (const p of workspace.inventory) {
    validateInventoryPart(p);
    if (p.sourceDeviceId && !deviceIds.has(p.sourceDeviceId)) throw Error("Part references a missing donor device.");
  }
  return state;
}
export function assessPower(part, plan) {
  const issues = [], required = [], e = part?.electrical || {};
  const need = (o, key, label) => {
    const n = num(o[key]);
    if (n === null || n <= 0) { issues.push("Record " + label + "."); return null; }
    return n;
  };
  if (!part) return { status: "needs-evidence", issues: ["Select an identified part."], required, topology: "unknown", runtimeHours: null };
  if (["switch", "mechanical", "unknown"].includes(part.kind || "unknown"))
    issues.push(part.kind === "switch" ? "A passive switch needs a rated load circuit; do not connect a battery across its contacts. Use the mouse-switch worked example below." : "Identify a powered component or assembly before making a supply plan.");
  const lo = need(e, "minV", "the component's documented minimum voltage"), hi = need(e, "maxV", "the component's documented maximum voltage"),
    run = need(e, "runMa", "its running current in mA"), peak = need(e, "peakMa", "its startup / peak current in mA"),
    sLo = need(plan, "sourceMinV", "the source's lowest loaded voltage"), sHi = need(plan, "sourceMaxV", "the source's highest voltage"),
    sCurrent = need(plan, "sourceCurrentMa", "the source's documented continuous current capability");
  if (!e.evidence?.trim()) issues.push("Add the source of the component ratings and pinout.");
  if (!e.positive?.trim() || !e.negative?.trim()) issues.push("Identify the positive supply and return terminals from evidence.");
  if (!plan.sourceName?.trim() || !plan.sourceEvidence?.trim()) issues.push("Identify the battery supply and its rating evidence.");
  if (lo && hi && lo > hi) issues.push("Component voltage limits are reversed.");
  if (sLo && sHi && sLo > sHi) issues.push("Source voltage limits are reversed.");
  if ([lo, hi, sLo, sHi].some((v) => v > 24)) issues.push("This planner covers isolated DC supplies up to 24 V only.");
  if (run && peak && peak < run) issues.push("Peak current cannot be lower than running current.");
  if (!plan.polarityChecked) issues.push("Confirm connector orientation and polarity before a powered test.");
  if (!plan.sourceProtected) issues.push("Record a suitable protected supply / holder, current protection and power switch.");
  if (!plan.notes?.trim()) issues.push("Describe the actual protection, supporting circuit and first-test plan in the notes.");
  if (["led", "motor", "audio"].includes(part.kind)) {
    required.push({ led: "LED current-limiting circuit", motor: "motor driver and inductive-load protection", audio: "matching bias / amplifier circuit" }[part.kind]);
    if (!plan.supportChecked) issues.push("Document the supporting " + required[0] + "; a battery alone is insufficient.");
  }
  required.push("identified connector and polarity", "protected supply and disconnect switch");
  let topology = "unknown", outMax = sHi, efficiency = 1;
  if (lo && hi && sLo && sHi)
    topology = sLo >= lo && sHi <= hi ? "direct" : sLo > hi ? "buck" : sHi < lo ? "boost" : "buck-boost";
  if (plan.topology === "unknown" || !plan.topology) issues.push("Choose a supply path after reviewing the required conversion.");
  else if (plan.topology === "direct") {
    if (topology !== "direct") issues.push("The full battery voltage range is outside the component range; direct connection is unsuitable.");
    if (sCurrent && peak && sCurrent < peak) issues.push("The source current capability is below peak demand.");
  } else {
    required.push(plan.topology + " regulator module");
    if (!plan.regulatorName?.trim() || !plan.regulatorEvidence?.trim()) issues.push("Document the exact regulator module and its operating conditions.");
    const inLo = need(plan, "inputMinV", "regulator minimum operating input"), inHi = need(plan, "inputMaxV", "regulator maximum operating input"),
      outLo = need(plan, "outputMinV", "regulator minimum output including tolerance"), outHi = need(plan, "outputMaxV", "regulator maximum output including tolerance"),
      outputCurrent = need(plan, "outputCurrentMa", "regulator output current at the lowest battery voltage"), eff = need(plan, "efficiency", "regulator efficiency as a fraction");
    efficiency = eff; outMax = outHi;
    if (eff && eff > 1) issues.push("Efficiency must be greater than zero and at most one.");
    if ((inLo && inHi && inLo > inHi) || (outLo && outHi && outLo > outHi)) issues.push("Regulator voltage limits are reversed.");
    if (inHi > 24 || outHi > 24) issues.push("Regulator limits must remain within this 24 V planner.");
    if (inLo && inHi && sLo && sHi && (sLo < inLo || sHi > inHi)) issues.push("Battery range exceeds regulator input operating limits.");
    if (outLo && outHi && lo && hi && (outLo < lo || outHi > hi)) issues.push("Regulator output including tolerance does not fit the component range.");
    if (plan.topology === "buck" && sLo && outHi && sLo <= outHi) issues.push("A buck-only path needs input above output; check dropout at the lowest source voltage.");
    if (plan.topology === "boost" && sHi && outLo && sHi >= outLo) issues.push("A boost-only path cannot regulate down across this range.");
    if (outputCurrent && peak && outputCurrent < peak) issues.push("Regulator output capability is below peak demand.");
    if (sCurrent && peak && outHi && sLo && eff && sCurrent < outHi * peak / (sLo * eff)) issues.push("Source current is insufficient for converted peak power at its lowest voltage.");
  }
  let runtimeHours = null;
  const capacity = num(plan.capacityMah), nominal = num(plan.nominalV), usable = num(plan.usable);
  if (capacity > 0 && nominal > 0 && usable > 0 && usable <= 1 && run && outMax && efficiency > 0 && efficiency <= 1 && nominal >= sLo && nominal <= sHi)
    runtimeHours = capacity * nominal * usable * efficiency / (run * outMax);
  return { status: issues.length ? "needs-evidence" : "candidate", issues, required, topology, runtimeHours };
}
export function projectMatches(catalog, inventory) {
  return catalog.projects.map((project) => {
    const requirements = catalog.components.filter((c) => c.compatibility[project.id] === "R").map((c) => {
      const candidates = inventory.filter((p) => p.status !== "Needed" && num(p.quantity) > 0 && p.requirementIds?.includes(c.id));
      const tested = candidates.filter((p) => p.test?.result === "Pass" && ["method", "instrument", "expected", "observed", "date"].every((k) => p.test[k]?.trim()));
      return { ...c, candidates, tested, state: tested.length ? "tested" : candidates.length ? "needs-test" : "missing" };
    });
    return { project, requirements, covered: requirements.filter((r) => r.state === "tested").length, total: requirements.length };
  }).sort((a, b) => (b.covered / (b.total || 1)) - (a.covered / (a.total || 1)) || a.project.id.localeCompare(b.project.id));
}
