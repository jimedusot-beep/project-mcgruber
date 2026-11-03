import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateWorkspace, freshWorkspace } from "../src/core.js";
import * as THREE from "three";
import {
  parseModel,
  inspectGeometry,
  serializeParts,
  restoreParts,
  interferencePairs,
} from "../src/mesh.js";
test("actual generic repository STL loads at its original dimensions and edge counts", async () => {
  const bytes = await readFile(
      new URL("../../cad-and-stl/prototype-angle-support.stl", import.meta.url),
    ),
    parts = await parseModel(new File([bytes], "support.stl"));
  assert.equal(parts.length, 1);
  const r = parts[0].userData.report;
  assert.deepEqual(
    r.dimensions.map((x) => Math.round(x)),
    [40, 20, 25],
  );
  assert.equal(r.boundary, 0);
  assert.equal(r.nonmanifold, 0);
  assert.ok(r.triangles > 0);
});
test("multipart OBJ retains separate meshes, units and saved transforms through scene round trip", async () => {
  const obj =
    "o PartA\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\no PartB\nv 3 0 0\nv 4 0 0\nv 3 1 0\nf 4 5 6\n";
  const p = await parseModel(new File([obj], "assembly.obj"), "cm");
  assert.equal(p.length, 2);
  assert.equal(p[0].userData.report.dimensions[0], 10);
  p[0].position.x = 50;
  p[1].visible = false;
  const restored = restoreParts(serializeParts(p));
  assert.equal(restored[0].position.x, 50);
  assert.equal(restored[1].visible, false);
  assert.equal(restored[0].userData.report.boundary, 3);
});
test("malformed, empty, unsupported and nonfinite mesh inputs fail clearly", async () => {
  await assert.rejects(parseModel(new File([], "empty.stl")), /empty/);
  await assert.rejects(
    parseModel(new File(["hello"], "unknown.txt")),
    /Supported/,
  );
  await assert.rejects(
    parseModel(new File(["wrong"], "bad.glb")),
    /Invalid GLB/,
  );
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([NaN, 0, 0, 1, 0, 0, 0, 1, 0], 3),
  );
  assert.throws(() => inspectGeometry(g), /invalid/);
});
test("broad-phase bounding overlap reports only visible candidate pairs", () => {
  const a = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10)),
    b = a.clone();
  a.name = "A";
  b.name = "B";
  assert.deepEqual(interferencePairs([a, b]), [["A", "B"]]);
  b.position.x = 20;
  assert.equal(interferencePairs([a, b]).length, 0);
  b.position.x = 0;
  b.visible = false;
  assert.equal(interferencePairs([a, b]).length, 0);
});
test("scene imports reject incomplete transforms, invalid Euler orders and corrupt mesh data before restoration",async()=>{
  const parts=await parseModel(new File(["v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n"],"scene.obj"));
  const valid=serializeParts(parts);
  for(const mutate of [
    p=>p.position=[],p=>p.position=[1,2],p=>p.position=[0,Infinity,0],
    p=>p.scale=[],p=>p.scale=[0,1,1],p=>p.rotation=[],p=>p.rotation=[0,0,0,"BAD"],
    p=>p.geometry.data.attributes.position.array[0]="1",p=>p.geometry.data.index={type:"Uint16Array",array:[0,1,999]},
  ]){
    const bad=structuredClone(valid);mutate(bad[0]);
    assert.throws(()=>restoreParts(bad));
    const w=freshWorkspace();w.scene={schema:1,units:"mm",parts:bad};assert.throws(()=>validateWorkspace(w));
  }
  const clone=structuredClone(valid[0]);
  assert.throws(()=>restoreParts([valid[0],clone]),/duplicate/);
  assert.throws(()=>restoreParts(Array.from({length:101},()=>clone)),/100 parts/);
  const restored=restoreParts(valid)[0];restored.updateMatrixWorld(true);
  assert.ok(restored.matrixWorld.elements.every(Number.isFinite));
});

test("glTF PBR colors survive scene export and reload, with legacy fallback and strict material checks", async () => {
  const positions = Buffer.alloc(36);
  [0, 0, 0, 1, 0, 0, 0, 1, 0].forEach((value, i) => positions.writeFloatLE(value, i * 4));
  const gltf = {
    asset: {version: "2.0"}, scene: 0, scenes: [{nodes: [0]}],
    nodes: [{mesh: 0, name: "Colored prototype"}],
    buffers: [{byteLength: 36}],
    bufferViews: [{buffer: 0, byteOffset: 0, byteLength: 36}],
    accessors: [{bufferView: 0, componentType: 5126, count: 3, type: "VEC3", min: [0,0,0], max: [1,1,0]}],
    materials: [{pbrMetallicRoughness: {baseColorFactor: [0.8,0.1,0.2,1], metallicFactor: 0.65, roughnessFactor: 0.3}, doubleSided: true}],
    meshes: [{primitives: [{attributes: {POSITION: 0}, material: 0}]}],
  };
  // Package JSON + BIN directly as a GLB. This isolates parser behavior and
  // avoids Node-only data-URI fetch / ProgressEvent differences.
  const json = Buffer.from(JSON.stringify(gltf), "utf8");
  const paddedJson = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)]);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + paddedJson.length + 8 + positions.length, 8);
  const jsonChunk = Buffer.alloc(8);
  jsonChunk.writeUInt32LE(paddedJson.length, 0);
  jsonChunk.writeUInt32LE(0x4e4f534a, 4);
  const binChunk = Buffer.alloc(8);
  binChunk.writeUInt32LE(positions.length, 0);
  binChunk.writeUInt32LE(0x004e4942, 4);
  const glb = Buffer.concat([header, jsonChunk, paddedJson, binChunk, positions]);
  const parsed = await parseModel(new File([glb], "colored.glb"));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].userData.materialSpec.metalness, 0.65);
  assert.equal(parsed[0].userData.materialSpec.roughness, 0.3);
  assert.equal(parsed[0].userData.materialSpec.side, THREE.DoubleSide);
  assert.ok(parsed[0].material.color.r > parsed[0].material.color.g);
  assert.notEqual(parsed[0].material.color.getHex(), 0xa5d5ad);
  const snapshot = serializeParts(parsed);
  assert.equal(snapshot[0].material.metalness, 0.65);
  const restored = restoreParts(snapshot);
  assert.equal(restored[0].material.color.getHex(), parsed[0].material.color.getHex());
  assert.equal(restored[0].material.roughness, 0.3);
  const old = structuredClone(snapshot);
  delete old[0].material;
  assert.equal(restoreParts(old)[0].material.color.getHex(), 0xa5d5ad);
  for (const change of [
    p => { p.material.color = -1; },
    p => { p.material.metalness = 3; },
    p => { p.material.vertexColors = "yes"; },
    p => { p.material.side = 99; },
    p => { p.material.customShader = "no"; },
  ]) {
    const invalid = structuredClone(snapshot);
    change(invalid[0]);
    assert.throws(() => restoreParts(invalid), /material/);
    const w = freshWorkspace();
    w.scene = {schema:1, units:"mm", parts:invalid};
    assert.throws(() => validateWorkspace(w), /material/);
  }
});

test("OpenSCAD switch-fit gauge STL is a real bounded watertight three-pocket sample", async () => {
  const bytes = await readFile(new URL("../../cad-and-stl/switch-fit-gauge.stl", import.meta.url));
  const parts = await parseModel(new File([bytes], "switch-fit-gauge.stl"));
  assert.equal(parts.length, 1);
  const r = parts[0].userData.report;
  assert.equal(r.triangles, 60);
  assert.equal(r.boundary, 0);
  assert.equal(r.nonmanifold, 0);
  assert.deepEqual(r.dimensions.map(n => Math.round(n * 10) / 10).sort((a,b) => a-b), [5, 11.2, 60.6]);
});
