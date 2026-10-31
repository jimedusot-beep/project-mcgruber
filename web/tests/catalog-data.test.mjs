import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { EXPECTED_PROJECT_SLUGS, projectFolders, csv, joinCompatibility } from "../scripts/catalog-data.mjs";

test("project IDs are bound to known folder identities rather than position", () => {
  const folders = projectFolders([...EXPECTED_PROJECT_SLUGS].reverse());
  assert.equal(folders[0].id, "P01");
  assert.equal(folders.at(-1).id, "P09");
  assert.throws(() => projectFolders(EXPECTED_PROJECT_SLUGS.slice(1)), /identity mismatch/);
  const renamed = [...EXPECTED_PROJECT_SLUGS]; renamed[4] = "05-unknown-fob";
  assert.throws(() => projectFolders(renamed), /identity mismatch/);
});

test("compatibility is joined by exact component identity regardless of CSV row order", async () => {
  const req = csv(await readFile(new URL("../../component-bank/components.csv", import.meta.url), "utf8"));
  const matrix = csv(await readFile(new URL("../../component-bank/compatibility.csv", import.meta.url), "utf8"));
  const projects = projectFolders(EXPECTED_PROJECT_SLUGS).map(p => p.id);
  const one = joinCompatibility(req, matrix, projects);
  const reversed = joinCompatibility(req, [...matrix].reverse(), projects);
  assert.deepEqual(reversed, one);
  assert.equal(one.length, 16);
  assert.equal(one.find(r => r.component === "Matched IR break-beam pair").compatibility.P08, "R");
  assert.equal(one.find(r => r.component === "PIR motion sensor").compatibility.P02, "A");
  const changed = structuredClone(matrix);
  changed[0].component = "Unknown detector";
  assert.throws(() => joinCompatibility(req, changed, projects), /missing component/);
  assert.throws(() => joinCompatibility(req, [...matrix, matrix[0]], projects), /Duplicate/);
  const invalid = structuredClone(matrix); delete invalid[0].P01;
  assert.throws(() => joinCompatibility(req, invalid, projects), /missing P01/);
  const malformed = structuredClone(matrix); malformed[0].P01 = "verified";
  assert.throws(() => joinCompatibility(req, malformed, projects), /Invalid or missing/);
});

test("CSV parser rejects malformed row lengths and duplicate headers", () => {
  assert.deepEqual(csv('a,b\n"x,y",z\n'), [{a:"x,y",b:"z"}]);
  assert.throws(() => csv('a,b\n1\n'), /2 cells/);
  assert.throws(() => csv('a,a\n1,2\n'), /duplicate CSV/);
  assert.throws(() => csv('a,b\n"unfinished,x\n'), /Unterminated/);
});
