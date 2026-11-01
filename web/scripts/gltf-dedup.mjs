// McGruber: optional LOCAL glTF Transform (MIT) CLI wrapper, not a website service.
// Does NOT change the original file and requires an independently installed CLI.
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export function validateGlbHeader(buffer, totalBytes) {
  if (!(buffer instanceof Uint8Array) || buffer.byteLength < 12 ||
      !Number.isInteger(totalBytes) || totalBytes < 12)
    throw Error("Not a GLB 2.0 file: header missing.");
  const header = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 ||
      header.getUint32(8, true) !== totalBytes)
    throw Error("Invalid GLB header, version or declared length.");
  return totalBytes; // Header check, NOT a full glTF parse or visual-fidelity test.
}
export function bytesReport(before, after) {
  if (![before, after].every(n => Number.isSafeInteger(n) && n >= 12))
    throw Error("Invalid GLB file sizes.");
  return {
    beforeBytes: before, afterBytes: after, savedBytes: before - after,
    savedPercent: Math.round((before - after) * 10000 / before) / 100,
    smaller: after < before,
    withinMobileLimit: after <= 20 * 1024 * 1024,
  };
}
const headerFor = async filename => {
  const size = (await stat(filename)).size;
  if (size > 50 * 1024 * 1024) throw Error("Local optimization input exceeds 50 MB.");
  const bytes = await readFile(filename);
  validateGlbHeader(bytes.subarray(0, 12), size);
  return size;
};
export async function dedupGlb(input, output, runner = spawnSync) {
  if (!input || !output || !/\.glb$/i.test(input) || !/\.glb$/i.test(output))
    throw Error("Provide two .glb paths: original.glb output-dedup.glb");
  const source = path.resolve(input), target = path.resolve(output);
  if (source === target) throw Error("Refusing to overwrite the original model.");
  try { await access(target); throw Error("Output already exists. Choose a new filename."); }
  catch (e) { if (e.code !== "ENOENT") throw e; }
  const before = await headerFor(source);
  const run = runner("gltf-transform", ["dedup", source, target], { encoding: "utf8" });
  if (run?.error?.code === "ENOENT")
    throw Error("Install the external glTF Transform CLI first: npm install --global @gltf-transform/cli");
  if (!run || run.error || run.status !== 0)
    throw Error("glTF Transform dedup failed: " + String(run?.stderr || run?.error || "unknown error").slice(0,500));
  const after = await headerFor(target);
  return { source, target, ...bytesReport(before, after) };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await dedupGlb(process.argv[2], process.argv[3]);
    console.log(JSON.stringify(report, null, 2));
    if (!report.smaller) console.warn("Output is not smaller. Keep the original unless visually/structurally justified.");
    if (!report.withinMobileLimit) console.warn("Output exceeds the current McGruber mobile 20 MB import limit.");
    console.log("Compare appearance, part names, dimensions and render performance before adopting the output.");
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
