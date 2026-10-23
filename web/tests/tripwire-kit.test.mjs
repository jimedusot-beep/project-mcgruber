import test from "node:test";
import assert from "node:assert/strict";
import { TRIPWIRE_ASSEMBLY, TRIPWIRE_PARTS, getPart, explosionPosition, beamStatus } from "../src/tripwire-kit.js";

test("tripwire manifest has unique stable IDs and explicitly unverified fit", () => {
  assert.equal(TRIPWIRE_ASSEMBLY.status, "DIGITAL_CONCEPT_UNTESTED");
  assert.equal(TRIPWIRE_ASSEMBLY.units, "illustrative-mm");
  assert.equal(new Set(TRIPWIRE_PARTS.map((p) => p.id)).size, TRIPWIRE_PARTS.length);
  assert.ok(TRIPWIRE_PARTS.length >= 10);
  for (const part of TRIPWIRE_PARTS) {
    assert.match(part.id, /^TW-(E|R|C)-[A-Z]+$/);
    assert.ok(["emitter", "receiver", "control"].includes(part.side));
    assert.ok([true, false, "conditional"].includes(part.required));
    for (const key of ["name", "explain", "salvage", "verify", "type"])
      assert.ok(typeof part[key] === "string" && part[key].length > 5, key);
    for (const key of ["pos", "offset"]) {
      assert.equal(part[key].length, 3);
      assert.ok(part[key].every(Number.isFinite));
    }
  }
  assert.equal(getPart("TW-C-ESP32").type, "controller");
  assert.equal(getPart("TW-R-LDR").type, "ldr");
  assert.equal(getPart("NOT-AN-ID"), null);
});
test("exploded positions are reversible, stable and do not mutate the canonical manifest", () => {
  const before = JSON.stringify(TRIPWIRE_PARTS);
  for (const p of TRIPWIRE_PARTS) {
    assert.deepEqual(explosionPosition(p, 0), p.pos);
    assert.deepEqual(explosionPosition(p, 1), p.pos.map((v, i) => v + p.offset[i]));
    assert.deepEqual(explosionPosition(p, 0.5), p.pos.map((v, i) => v + p.offset[i] * .5));
  }
  assert.equal(JSON.stringify(TRIPWIRE_PARTS), before);
  for (const v of [-1, 1.1, NaN, Infinity]) assert.throws(
    () => explosionPosition(TRIPWIRE_PARTS[0], v), RangeError);
});
test("beam simulation distinguishes clear, tripped, disarmed and disconnected", () => {
  assert.deepEqual(beamStatus({}), { code: "CLEAR", alarm: false, label: "Simulated beam detected" });
  assert.deepEqual(beamStatus({ blocked: true }), { code: "BROKEN", alarm: true, label: "Simulated beam broken" });
  assert.equal(beamStatus({ blocked: true, armed: false }).alarm, false);
  assert.equal(beamStatus({ blocked: true, connected: false }).code, "DISCONNECTED");
});

test("cross-repository handoff manifest matches web viewer parts without asserting real fit", async () => {
  const { readFile } = await import("node:fs/promises");
  const manifest = JSON.parse(await readFile(
    new URL("../../projects/01-light-beam-tripwire/assembly_manifest.json", import.meta.url),
    "utf8",
  ));
  assert.equal(manifest.assembly_id, TRIPWIRE_ASSEMBLY.id);
  assert.equal(manifest.status, TRIPWIRE_ASSEMBLY.status);
  assert.equal(manifest.units, TRIPWIRE_ASSEMBLY.units);
  assert.deepEqual(manifest.part_ids, TRIPWIRE_PARTS.map((p) => p.id));
  assert.equal(manifest.hardware_tested, false);
  assert.equal(manifest.physical_fit_verified, false);
  assert.equal(manifest.compatible_for_physical_build, false);
});
