import test from "node:test";
import assert from "node:assert/strict";
import { choosePrecacheAssets, fingerprintPrecacheAssets, isOptionalPhotoAsset } from "../scripts/offline-assets.mjs";
test("photos and annotation SVGs are optional, but source guides remain offline", () => {
  const paths = ["./index.html","./repository/docs/ROADMAP.md","./repository/media/parts/2026-10-25/IMG_9283.jpeg","./repository/media/parts/2026-10-25/IMG_9283_annotated.svg","./assets/main-123.js"];
  assert.equal(isOptionalPhotoAsset(paths[2]),true);
  assert.equal(isOptionalPhotoAsset(paths[3]),true);
  assert.deepEqual(choosePrecacheAssets(paths),[paths[0],paths[1],paths[4]]);
});
test("same-name file content changes must invalidate the offline version", async () => {
  const paths=["./index.html","./repository/docs/ROADMAP.md"];
  const hash=async (source,order=paths)=>fingerprintPrecacheAssets(order,async p=>p===paths[0]?source:"guide");
  assert.notEqual(await hash("old"),await hash("new"));
  assert.equal(await hash("old"),await hash("old",[...paths].reverse()));
});
