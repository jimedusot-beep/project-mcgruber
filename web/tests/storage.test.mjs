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
  put,
  backup,
  cleanupMedia,
  mediaUsage,
  preserveDraft,
  WorkspaceConflictError,
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
test("queued saves from one editor preserve its latest changes and recover after invalid input", async () => {
  const a = await load();
  a.counter = 1;
  const first = save(a);
  a.counter = 2;
  const second = save(a);
  await Promise.all([first, second]);
  assert.equal((await load()).counter, 2);
  assert.throws(() => save({ schema: 3 }));
  a.counter = 3;
  await save(a);
  assert.equal((await load()).counter, 3);
});
test("a stale editor cannot overwrite a newer revision; its draft remains recoverable", async () => {
  const a = await load(),
    b = structuredClone(a);
  a.favorites = ["P01"];
  await save(a);
  b.favorites = ["P09"];
  await assert.rejects(save(b), WorkspaceConflictError);
  assert.deepEqual((await load()).favorites, ["P01"]);
  const id = await preserveDraft(b),
    draft = await read("history", id);
  assert.equal(draft.conflictDraft, true);
  assert.deepEqual(draft.favorites, ["P09"]);
  assert.deepEqual((await load()).favorites, ["P01"]);
  const current = await load(),
    recovered = {
      ...draft,
      id: "current",
      revision: current.revision,
      sequence: current.sequence,
    };
  await save(recovered);
  assert.equal((await load()).conflictDraft, false);
  assert.equal((await read("history", id)).conflictDraft, true);
  assert.deepEqual((await load()).favorites, ["P09"]);
});
test("legacy workspaces gain revision metadata without losing their saved content", async () => {
  const legacy = freshWorkspace();
  delete legacy.revision;
  delete legacy.sequence;
  legacy.updated = "2026-10-20T12:00:00.000Z";
  legacy.favorites = ["P05"];
  await put("workspace", legacy);
  const w = await load();
  await save(w);
  assert.equal(typeof w.revision, "string");
  assert.ok(w.sequence >= 1);
  assert.deepEqual((await load()).favorites, ["P05"]);
});
test("matching media uses one content key and missing backup media is reported", async () => {
  const a = await addMedia(
    new File([new Uint8Array([9, 8, 7])], "first.png", { type: "image/png" }),
  );
  const b = await addMedia(
    new File([new Uint8Array([9, 8, 7])], "second.png", { type: "image/png" }),
  );
  assert.equal(a, b);
  const w = await load();
  w.records = [
    {
      id: "missing-media",
      name: "Missing",
      project: "P04",
      evidence: "Reported observation",
      result: "Not tested",
      attachments: ["absent"],
    },
  ];
  await assert.rejects(backup(w), /missing/);
});
test("restoring a backup never overwrites attachment bytes from older recovery revisions", async () => {
  const oldId = await addMedia(
    new File([new Uint8Array([11, 12])], "old.png", { type: "image/png" }),
  );
  const w = await load();
  w.records = [
    {
      id: "retained-record",
      name: "Retained",
      project: "P04",
      evidence: "Reported observation",
      result: "Not tested",
      attachments: [oldId],
    },
  ];
  await save(w);
  const imported = structuredClone(w);
  const restored = await restore(
    JSON.stringify({
      application: "mcgruber-lab",
      version: 1,
      workspace: imported,
      media: [
        {
          id: oldId,
          name: "new.png",
          type: "image/png",
          data: "data:image/png;base64,DQ4=",
        },
      ],
    }),
    w,
  );
  assert.notEqual(restored.records[0].attachments[0], oldId);
  assert.deepEqual(
    [...new Uint8Array((await read("media", oldId)).bytes)],
    [11, 12],
  );
  assert.deepEqual(
    [
      ...new Uint8Array(
        (await read("media", restored.records[0].attachments[0])).bytes,
      ),
    ],
    [13, 14],
  );
});
test("cleanup removes only old unused media and protects history, local drafts and new uploads", async () => {
  const old = "2026-01-01T00:00:00.000Z",
    now = new Date().toISOString();
  for (const [id, created] of [
    ["gc-unused", old],
    ["gc-history", old],
    ["gc-draft", old],
    ["gc-new", now],
  ])
    await put("media", {
      id,
      name: id + ".png",
      type: "image/png",
      created,
      bytes: new Uint8Array([1, 2]).buffer,
    });
  const w = await load();
  w.records = [
    {
      id: "history-media",
      name: "History",
      project: "P04",
      evidence: "Reported observation",
      result: "Not tested",
      attachments: ["gc-history"],
    },
  ];
  await save(w);
  w.records = [];
  await save(w);
  w.draftRecord = { attachments: ["gc-draft"] };
  const result = await cleanupMedia(w);
  assert.ok(result.removed >= 1);
  assert.equal(await read("media", "gc-unused"), undefined);
  for (const id of ["gc-history", "gc-draft", "gc-new"])
    assert.ok(await read("media", id));
  assert.ok((await mediaUsage(w)).referenced >= 2);
  const stale = structuredClone(w);
  await save(w);
  await assert.rejects(cleanupMedia(stale), WorkspaceConflictError);
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
