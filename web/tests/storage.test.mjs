import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import {
  load,
  save,
  all,
  restore,
  addMedia,
  read,
  mediaBlob,
} from "../src/storage.js";
import { freshWorkspace } from "../src/core.js";
test("file-input media persists as independent bytes and reconstructs correctly", async () => {
  const id = await addMedia(
    new File([new Uint8Array([1, 2, 3, 4])], "fixture.png", {
      type: "image/png",
    }),
  );
  const stored = await read("media", id);
  assert.ok(stored.bytes instanceof ArrayBuffer);
  assert.deepEqual(
    [...new Uint8Array(await mediaBlob(stored).arrayBuffer())],
    [1, 2, 3, 4],
  );
});
test("IndexedDB saves atomically, survives reads and retains only ten recovery revisions", async () => {
  let w = await load();
  assert.equal(w.schema, 1);
  w.favorites = ["P04"];
  w.progress.P04 = { steps: [true], stage: 2 };
  await save(w);
  const result = await load();
  assert.deepEqual(result.favorites, ["P04"]);
  assert.deepEqual(result.progress.P04.steps, [true]);
  for (let i = 0; i < 12; i++) {
    w.counter = i;
    await save(w);
  }
  assert.equal((await all("history")).length, 10);
  assert.equal((await load()).counter, 11);
});
test("concurrent save requests preserve the latest state and recover after invalid input", async () => {
  const a = freshWorkspace(),
    b = freshWorkspace();
  a.counter = 1;
  b.counter = 2;
  await Promise.all([save(a), save(b)]);
  assert.equal((await load()).counter, 2);
  assert.throws(() => save({ schema: 3 }));
  await save(a);
  assert.equal((await load()).counter, 1);
});
test("full backup restore validates before mutation and missing media never destroys the workspace", async () => {
  const before = await load();
  await assert.rejects(restore('{"application":"foreign"}'));
  assert.equal((await load()).counter, before.counter);
  const w = freshWorkspace();
  w.favorites = ["P03"];
  await restore(
    JSON.stringify({
      application: "mcgruber-lab",
      version: 1,
      workspace: w,
      media: [],
    }),
  );
  assert.deepEqual((await load()).favorites, ["P03"]);
  w.records = [
    {
      id: "x",
      name: "x",
      project: "P03",
      evidence: "Reported observation",
      attachments: ["missing"],
      result: "Not tested",
    },
  ];
  await assert.rejects(
    restore(
      JSON.stringify({
        application: "mcgruber-lab",
        version: 1,
        workspace: w,
        media: [],
      }),
    ),
    /missing/,
  );
  assert.deepEqual((await load()).favorites, ["P03"]);
});
