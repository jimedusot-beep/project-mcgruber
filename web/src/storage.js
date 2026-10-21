import { newId } from "./id.js";
import { freshWorkspace, validateWorkspace } from "./core.js";
let opening;
let queue = Promise.resolve();
let channel;
const revisionOf = (workspace) =>
  workspace?.revision || workspace?.updated || null;
const recentFirst = (a, b) =>
  (b.sequence || 0) - (a.sequence || 0) ||
  String(b.updated).localeCompare(String(a.updated));
export class WorkspaceConflictError extends Error {
  constructor() {
    super(
      "Another tab saved a newer workspace. Export your local copy or load the latest saved version before continuing.",
    );
    this.name = "WorkspaceConflictError";
  }
}
function updates() {
  if (
    !channel &&
    typeof window !== "undefined" &&
    typeof BroadcastChannel === "function"
  )
    channel = new BroadcastChannel("mcgruber-workspace-updates");
  return channel;
}
export function watchWorkspace(listener) {
  const c = updates();
  const handler = (event) => {
    if (typeof event.data?.revision === "string") listener(event.data.revision);
  };
  c?.addEventListener("message", handler);
  return () => c?.removeEventListener("message", handler);
}
export function database() {
  if (!opening)
    opening = new Promise((resolve, reject) => {
      const request = indexedDB.open("mcgruber-lab", 1);
      request.onupgradeneeded = () => {
        for (const name of ["workspace", "history", "media"])
          if (!request.result.objectStoreNames.contains(name))
            request.result.createObjectStore(name, { keyPath: "id" });
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          opening = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        opening = null;
        reject(Error("Local storage unavailable: " + request.error?.message));
      };
      request.onblocked = () => {
        opening = null;
        reject(Error("Close other McGruber tabs to upgrade browser storage."));
      };
    });
  return opening;
}
export async function read(store, key) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const r = db.transaction(store).objectStore(store).get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function all(store) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const r = db.transaction(store).objectStore(store).getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function put(store, value) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve(value);
    tx.onerror = tx.onabort = () =>
      reject(
        Error("Save failed. Check browser storage space; export a backup."),
      );
  });
}
export async function load() {
  const w = await read("workspace", "current");
  return w ? validateWorkspace(w) : freshWorkspace();
}
// Read, compare and write within one IndexedDB transaction: a second tab cannot
// interleave a workspace change between the revision check and the new snapshot.
async function commitSnapshot(snapshot, reference, media = []) {
  const expected = revisionOf(reference),
    db = await database();
  const saved = await new Promise((resolve, reject) => {
    const tx = db.transaction(
      ["workspace", "history", ...(media.length ? ["media"] : [])],
      "readwrite",
    );
    const currentRequest = tx.objectStore("workspace").get("current");
    let failure, committed;
    currentRequest.onsuccess = () => {
      const current = currentRequest.result;
      if (revisionOf(current) !== expected) {
        failure = new WorkspaceConflictError();
        tx.abort();
        return;
      }
      committed = {
        ...snapshot,
        id: "current",
        updated: new Date().toISOString(),
        revision: newId(),
        sequence: (current?.sequence || 0) + 1,
        conflictDraft: false,
      };
      const historyRequest = tx.objectStore("history").getAll();
      historyRequest.onsuccess = () => {
        committed.sequence = Math.max(
          committed.sequence,
          ...historyRequest.result.map(
            (r) => (Number.isSafeInteger(r.sequence) ? r.sequence : 0) + 1,
          ),
        );
        tx.objectStore("workspace").put(committed);
        tx.objectStore("history").put({ ...committed, id: newId() });
        for (const old of historyRequest.result.sort(recentFirst).slice(9))
          tx.objectStore("history").delete(old.id);
        for (const item of media) tx.objectStore("media").put(item);
      };
    };
    tx.oncomplete = () => resolve(committed);
    tx.onerror = tx.onabort = () =>
      reject(
        failure ||
          Error("Autosave failed. Export a backup before closing this tab."),
      );
  });
  Object.assign(reference, {
    updated: saved.updated,
    revision: saved.revision,
    sequence: saved.sequence,
  });
  updates()?.postMessage({ revision: saved.revision });
  return saved;
}
export function save(workspace) {
  const snapshot = structuredClone(validateWorkspace(workspace));
  const operation = queue
    .catch(() => {})
    .then(() => commitSnapshot(snapshot, workspace))
    .then((saved) => saved.updated);
  queue = operation;
  return operation;
}
export async function preserveDraft(workspace) {
  const snapshot = structuredClone(validateWorkspace(workspace));
  await queue.catch(() => {});
  const db = await database(),
    id = newId();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(["workspace", "history"], "readwrite");
    const current = tx.objectStore("workspace").get("current");
    current.onsuccess = () => {
      const history = tx.objectStore("history").getAll();
      history.onsuccess = () => {
        tx.objectStore("history").put({
          ...snapshot,
          id,
          conflictDraft: true,
          updated: new Date().toISOString(),
          sequence: Math.max(
            (current.result?.sequence || 0) + 1,
            ...history.result.map(
              (r) => (Number.isSafeInteger(r.sequence) ? r.sequence : 0) + 1,
            ),
          ),
        });
        for (const old of history.result.sort(recentFirst).slice(9))
          tx.objectStore("history").delete(old.id);
      };
    };
    tx.oncomplete = resolve;
    tx.onerror = tx.onabort = () =>
      reject(
        Error(
          "Could not preserve your local draft. Export it before loading another version.",
        ),
      );
  });
  return id;
}
export async function addMedia(file) {
  if (
    !/^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm))$/.test(
      file.type,
    ) ||
    !file.size ||
    file.size > 12 * 1024 * 1024
  )
    throw Error(
      "Use a nonempty JPG, PNG, WebP, GIF, MP4, MOV or WebM under 12 MB.",
    );
  const bytes = await file.arrayBuffer();
  // The type is part of the content key, so MIME changes cannot alter another
  // record's preview. HTTP previews without SubtleCrypto retain unique IDs.
  let id;
  if (globalThis.crypto?.subtle) {
    const type = new TextEncoder().encode(file.type + "\0"),
      input = new Uint8Array(type.length + bytes.byteLength);
    input.set(type);
    input.set(new Uint8Array(bytes), type.length);
    const hash = await crypto.subtle.digest("SHA-256", input);
    id =
      "MEDIA-" +
      Array.from(new Uint8Array(hash), (n) =>
        n.toString(16).padStart(2, "0"),
      ).join("");
  } else id = newId();
  const old = await read("media", id),
    now = new Date().toISOString();
  await put("media", {
    ...old,
    id,
    name: old?.name || file.name,
    type: file.type,
    bytes,
    created: old?.created || now,
    touched: now,
  });
  return id;
}
export function mediaBlob(record) {
  return record.blob || new Blob([record.bytes], { type: record.type });
}
export function attachmentIds(workspace) {
  return [
    ...(workspace?.records || []).flatMap((r) => r.attachments || []),
    ...(workspace?.draftRecord?.attachments || []),
  ];
}
export async function backup(workspace) {
  const ids = new Set(attachmentIds(workspace)),
    assets = (await all("media")).filter((a) => ids.has(a.id));
  if (assets.length !== ids.size)
    throw Error(
      "An attachment is missing. Keep the workspace open and inspect its records before exporting.",
    );
  if (assets.reduce((sum, a) => sum + mediaBlob(a).size, 0) > 60 * 1024 * 1024)
    throw Error(
      "Media exceeds the 60 MB backup limit. Export or remove large attachments first.",
    );
  const media = await Promise.all(
    assets.map(async (a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      data: await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(mediaBlob(a));
      }),
    })),
  );
  return JSON.stringify({
    application: "mcgruber-lab",
    version: 1,
    workspace: validateWorkspace(workspace),
    media,
  });
}
export async function restore(text, currentWorkspace) {
  if (text.length > 100 * 1024 * 1024) throw Error("Backup exceeds 100 MB.");
  const data = JSON.parse(text);
  if (
    data.application !== "mcgruber-lab" ||
    data.version !== 1 ||
    !Array.isArray(data.media)
  )
    throw Error("Not a supported McGruber backup.");
  const workspace = validateWorkspace(data.workspace),
    ids = new Map(),
    now = new Date().toISOString();
  const media = data.media.map((a) => {
    if (
      typeof a.id !== "string" ||
      typeof a.name !== "string" ||
      typeof a.type !== "string" ||
      !a.data?.startsWith("data:" + a.type + ";base64,") ||
      !/^(image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|webm))$/.test(a.type)
    )
      throw Error("Invalid backup media.");
    const raw = atob(a.data.split(",")[1]);
    if (!raw.length || raw.length > 12 * 1024 * 1024 || ids.has(a.id))
      throw Error("Invalid media size or duplicate ID.");
    // Imported IDs are remapped so a restore can never replace bytes still
    // referenced by an older recovery revision, even if the backup reuses IDs.
    const id = newId();
    ids.set(a.id, id);
    return {
      id,
      name: a.name,
      type: a.type,
      bytes: Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer,
      created: now,
      touched: now,
    };
  });
  if (attachmentIds(workspace).some((id) => !ids.has(id)))
    throw Error("Backup is missing an experiment attachment.");
  for (const record of [
    ...workspace.records,
    ...(workspace.draftRecord ? [workspace.draftRecord] : []),
  ])
    record.attachments = record.attachments.map((id) => ids.get(id));
  const reference = currentWorkspace || (await load());
  const operation = queue
    .catch(() => {})
    .then(() => commitSnapshot(workspace, reference, media));
  queue = operation;
  return operation;
}
async function mediaSnapshot() {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["workspace", "history", "media"]),
      result = {};
    for (const name of ["workspace", "history", "media"]) {
      const r = tx.objectStore(name).getAll();
      r.onsuccess = () => (result[name] = r.result);
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = tx.onabort = () =>
      reject(Error("Cannot inspect local media."));
  });
}
function describeMedia(snapshot, localWorkspace) {
  const ids = new Set([
    ...attachmentIds(snapshot.workspace[0]),
    ...snapshot.history.flatMap(attachmentIds),
    ...attachmentIds(localWorkspace),
  ]);
  return snapshot.media.map((item) => ({
    ...item,
    size: mediaBlob(item).size,
    referenced: ids.has(item.id),
  }));
}
export async function mediaUsage(localWorkspace) {
  const items = describeMedia(await mediaSnapshot(), localWorkspace);
  return {
    count: items.length,
    bytes: items.reduce((n, a) => n + a.size, 0),
    referenced: items.filter((a) => a.referenced).length,
    unused: items.filter((a) => !a.referenced).length,
  };
}
export async function cleanupMedia(workspace) {
  await queue.catch(() => {});
  const expected = revisionOf(workspace),
    db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["workspace", "history", "media"], "readwrite"),
      snapshot = {};
    let pending = 3,
      failure,
      result = { removed: 0, bytes: 0, retainedRecent: 0 };
    for (const name of ["workspace", "history", "media"]) {
      const r = tx.objectStore(name).getAll();
      r.onsuccess = () => {
        snapshot[name] = r.result;
        if (--pending === 0) clean();
      };
    }
    function clean() {
      if (revisionOf(snapshot.workspace[0]) !== expected) {
        failure = new WorkspaceConflictError();
        tx.abort();
        return;
      }
      const now = Date.now();
      for (const item of describeMedia(snapshot, workspace)) {
        if (item.referenced) continue;
        const touched = Date.parse(item.touched || item.created);
        if (!Number.isFinite(touched) || now - touched < 24 * 60 * 60 * 1000) {
          result.retainedRecent++;
          if (!Number.isFinite(touched)) {
            const { size, referenced, ...record } = item;
            tx.objectStore("media").put({
              ...record,
              touched: new Date(now).toISOString(),
            });
          }
          continue;
        }
        tx.objectStore("media").delete(item.id);
        result.removed++;
        result.bytes += item.size;
      }
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = tx.onabort = () =>
      reject(failure || Error("Media cleanup failed; files were retained."));
  });
}
export function download(data, name, type = "application/json") {
  const blob = data instanceof Blob ? data : new Blob([data], { type }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
