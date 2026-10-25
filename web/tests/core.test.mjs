import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import {
  calculate,
  preferredResistor,
  simulate,
  defaultSettings,
  repeatExperiment,
  freshWorkspace,
  validateWorkspace,
  validateRecord,
  falstadCircuit,
  csvExport,
} from "../src/core.js";
import { newId } from "../src/id.js";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} ≉ ${b}`);
test("local HTTP previews can create valid unique record IDs without crypto.randomUUID", () => {
  const insecure = {
    getRandomValues: (array) => crypto.getRandomValues(array),
  };
  const a = newId(insecure),
    b = newId(insecure);
  assert.match(
    a,
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
  );
  assert.notEqual(a, b);
});
test("Ohm solves all unknowns and rejects ambiguous, empty and impossible inputs", () => {
  close(
    calculate("ohm", { voltage: 5, current: "", resistance: 1000 })[
      "Current (A)"
    ],
    0.005,
  );
  close(
    calculate("ohm", { voltage: "", current: 0.005, resistance: 1000 })[
      "Voltage (V)"
    ],
    5,
  );
  close(
    calculate("ohm", { voltage: 5, current: 0.005, resistance: "" })[
      "Resistance (Ω)"
    ],
    1000,
  );
  for (const p of [
    { voltage: 5, current: 1, resistance: 5 },
    { voltage: "", current: "", resistance: 5 },
    { voltage: 5, current: "", resistance: 0 },
    { voltage: 5, current: 0, resistance: "" },
  ])
    assert.throws(() => calculate("ohm", p));
});
test("LED resistor rounds up E24 and evaluates actual power margin", () => {
  const r = calculate("led", {
    source: 5,
    forward: 2,
    current: 8,
    rating: 0.25,
  });
  close(r["Minimum resistance (Ω)"], 375);
  close(r["Next E24 resistance (Ω)"], 390);
  close(r["Modeled current (mA)"], (3 / 390) * 1000);
  close(r["Resistor power (W)"], 9 / 390);
  close(preferredResistor(470), 470);
  close(preferredResistor(990), 1000);
  assert.throws(() =>
    calculate("led", { source: 1, forward: 2, current: 8, rating: 0.25 }),
  );
  assert.match(
    calculate("led", { source: 12, forward: 2, current: 100, rating: 0.1 })
      .warning,
    /below/,
  );
});
test("all eleven calculator families return known values and reject invalid ranges", () => {
  const r = calculate("resistance", { values: "100,100" });
  close(r["Series (Ω)"], 200);
  close(r["Parallel (Ω)"], 50);
  close(
    calculate("divider", { voltage: 5, top: 10000, bottom: 10000 })[
      "Unloaded output (V)"
    ],
    2.5,
  );
  close(calculate("power", { voltage: 5, current: 0.02 })["Power (W)"], 0.1);
  close(
    calculate("battery", { capacity: 1000, load: 100, derating: 0.7 })[
      "Estimated runtime (h)"
    ],
    7,
  );
  close(
    calculate("transistor", {
      drive: 3.3,
      vbe: 0.7,
      load: 20,
      beta: 10,
      limit: 4,
    })["Maximum base resistance (Ω)"],
    1300,
  );
  close(calculate("pwm", { frequency: 1000, duty: 25 })["On time (µs)"], 250);
  close(
    calculate("servo", { angle: 90, range: 180, min: 1000, max: 2000 })[
      "Pulse (µs)"
    ],
    1500,
  );
  close(
    calculate("motor", {
      force: 1,
      radius: 10,
      rpm: 60,
      voltage: 5,
      efficiency: 0.5,
    })["Required torque (N·m)"],
    0.01,
  );
  close(
    calculate("units", { value: 10, from: "m", to: "base" })["Converted value"],
    0.01,
  );
  for (const [key, p] of [
    ["resistance", { values: "0,100" }],
    ["battery", { capacity: 100, load: 0, derating: 0.5 }],
    ["servo", { angle: 190, range: 180, min: 1000, max: 2000 }],
    ["pwm", { frequency: 100, duty: 101 }],
    ["units", { value: "NaN", from: "m", to: "k" }],
  ])
    assert.throws(() => calculate(key, p));
});
test("all nine logic models respond to meaningful triggers; disarmed output remains idle", () => {
  for (const id of ["P01", "P08"]) {
    const s = defaultSettings();
    assert.equal(simulate(id, s).output, false);
    s.blocked = true;
    assert.equal(simulate(id, s).output, true);
    s.armed = false;
    assert.equal(simulate(id, s).output, false);
  }
  for (const id of ["P04", "P06", "P07"]) {
    const s = defaultSettings();
    assert.equal(simulate(id, s).output, false);
    s.pressed = false;
    assert.equal(simulate(id, s).output, true);
    s.contact = "NO";
    assert.equal(simulate(id, s).output, false);
  }
  assert.equal(
    simulate("P03", { ...defaultSettings(), released: true }).output,
    true,
  );
  assert.equal(
    simulate("P05", { ...defaultSettings(), command: 2 }).output,
    true,
  );
  assert.match(
    simulate("P09", { ...defaultSettings(), input: true }).detail,
    /sound/,
  );
});
test("motion gate waits for consecutive frames, observes cooldown, and resets on quiet input", () => {
  const s = defaultSettings();
  let r = simulate("P02", s);
  assert.equal(r.output, false);
  r = simulate("P02", s, r.state);
  assert.equal(r.output, false);
  r = simulate("P02", s, r.state);
  assert.equal(r.output, true);
  for (let i = 0; i < 8; i++) {
    r = simulate("P02", s, r.state);
    assert.equal(r.output, false);
  }
  r = simulate("P02", { ...s, motion: 0 }, r.state);
  assert.equal(r.state.consecutive, 0);
});
test("repeat copies configuration but never measured results, media or a successful trial", () => {
  const r = {
    id: "old",
    name: "Bench",
    project: "P04",
    evidence: "Physically measured result",
    trial: 3,
    configuration: { r: 470 },
    voltage: 5,
    current: 6,
    instrument: "Fluke",
    observations: "Success",
    result: "Pass",
    attachments: ["photo"],
  };
  const next = repeatExperiment(r);
  assert.notEqual(next.id, r.id);
  assert.equal(next.trial, 4);
  assert.equal(next.voltage, "");
  assert.equal(next.current, "");
  assert.equal(next.instrument, "");
  assert.equal(next.observations, "");
  assert.equal(next.result, "Not tested");
  assert.deepEqual(next.attachments, []);
  assert.deepEqual(next.configuration, { r: 470 });
  next.configuration.r = 100;
  assert.equal(r.configuration.r, 470);
});
test("backup schema rejects foreign versions, invalid logs and project references", () => {
  assert.deepEqual(validateWorkspace(freshWorkspace()), freshWorkspace());
  assert.throws(() => validateWorkspace({ schema: 100 }));
  const w = freshWorkspace();
  w.records = [{}];
  assert.throws(() => validateWorkspace(w));
  w.records = [];
  w.favorites = ["<script>"];
  assert.throws(() => validateWorkspace(w));
  assert.throws(() =>
    validateRecord({
      id: "a",
      name: "a",
      project: "P99",
      evidence: "Simulation data",
      attachments: [],
    }),
  );
});
test("CSV quotes data and neutralizes spreadsheet formula injection", () => {
  const result = csvExport([{ name: '=HYPERLINK("evil")', note: "a,b\nline" }]);
  assert.match(result, /'=HYPERLINK/);
  assert.match(result, /"a,b\nline"/);
});
test("original CircuitJS starter files contain grounded closed circuits", () => {
  for (const type of ["switch", "divider", "timer"]) {
    const t = falstadCircuit(type);
    assert.ok(t.startsWith("$ 1 "));
    assert.match(t, /v 96 240 96 80/);
    assert.match(t, /g 96 240/);
  }
  assert.throws(() => falstadCircuit("bogus"));
});
test("catalog covers real repository files, all nine procedures, and preserves unknown specifications", async () => {
  const data = JSON.parse(
    await readFile(new URL("../public/catalog.json", import.meta.url), "utf8"),
  );
  assert.equal(data.projects.length, 9);
  assert.equal(data.components.length, 16);
  assert.equal(data.inventory.length, 12);
  for (const p of data.projects) {
    const minimumSteps = { P01: 10, P04: 10, P07: 8 }[p.id] || 5;
    assert.ok(p.steps.length >= minimumSteps, `${p.id}: expected at least ${minimumSteps} genuine source steps; got ${p.steps.length}`);
    assert.equal(p.cost, null);
    for (const f of p.files)
      assert.ok((await stat(new URL("../../" + f, import.meta.url))).isFile());
  }
  assert.ok(
    data.components.every((c) => c.status === "unverified" && c.voltage === ""),
  );
  assert.ok(
    data.inventory.every((c) => c.formal_test_status === "not_retested"),
  );
});
