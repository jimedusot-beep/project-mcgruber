import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  filterReferenceInventory,
  referenceInventoryHTML,
  referenceToPersonalPart,
} from "../src/rev4-inventory.js";
import { validateInventoryPart } from "../src/salvage-core.js";

const source = JSON.parse(await readFile(new URL("../../component-bank/master-salvage-inventory.json", import.meta.url), "utf8"));

test("Rev 4 includes 23 sources but only 22 standalone groups", () => {
  assert.equal(source.revision, "4");
  assert.equal(source.items.length, 23);
  assert.equal(source.items.filter((i) => !i.subassemblyOf).length, 22);
  assert.equal(new Set(source.items.map((i) => i.id)).size, 23);
  assert.equal(source.items.find((i) => i.id === "REF-12").subassemblyOf, "REF-10");
  assert.equal(source.verifiedLongRangeDetector, false);
  assert.equal(source.items.reduce((sum, i) => sum + i.components.length, 0), 141);
  for (const i of source.items) {
    assert.ok(i.components.length > 0);
    assert.ok(i.sourcePage >= 2 && i.sourcePage <= 24);
    assert.ok(["Seen", "Documented", "Reported"].includes(i.evidence));
  }
});

test("filters search notes and components without treating reported stock as measured", () => {
  assert.equal(filterReferenceInventory(source, "").length, 23);
  assert.ok(filterReferenceInventory(source, "R-NZ").some((i) => i.id === "REF-10"));
  assert.ok(filterReferenceInventory(source, "", "Optics").every((i) => i.category === "Optics"));
  assert.match(referenceInventoryHTML(source), /No working 6–15-foot light detector/);
  assert.match(referenceInventoryHTML(source, "battery holder"), /Round three-position battery holder/);
});

test("local import has no fake passing tests, voltage, or project associations", () => {
  const item = source.items.find((i) => i.id === "REF-23");
  const part = referenceToPersonalPart(item, "PART-00000001", "2026-10-24T10:00:00.000Z");
  assert.equal(part.sourceReferenceId, "REF-23");
  assert.equal(part.test.result, "Not tested");
  assert.equal(part.verification, "Not electrically tested");
  assert.equal(part.electrical, undefined);
  assert.deepEqual(part.requirementIds, []);
  assert.deepEqual(part.projects, []);
  assert.equal(validateInventoryPart(part), part);
  assert.throws(() => referenceToPersonalPart(source.items.find((i) => i.id === "REF-12"), "PART-2"), /standalone/);
  assert.equal(referenceToPersonalPart(source.items.find((i) => i.id === "REF-09"), "PART-3").status, "Unverified");
});

test("user-content HTML is escaped, and imported button is disabled", () => {
  const altered = {items: [{ ...source.items[0], name: '<img src=x onerror=alert(1)>' }]};
  const html = referenceInventoryHTML(altered, "", "all", [{sourceReferenceId:"REF-01"}]);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img/);
  assert.match(html, /Already in My inventory/);
});
