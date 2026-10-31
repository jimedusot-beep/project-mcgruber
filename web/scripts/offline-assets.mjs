import { createHash } from "node:crypto";
// Original and annotated donor photographs are optional large assets.
export const isOptionalPhotoAsset = (p) => typeof p === "string" && p.startsWith("./repository/media/parts/");
export const choosePrecacheAssets = (files) => files.filter(p => !isOptionalPhotoAsset(p));
// Content rather than names determines the offline install version.
export async function fingerprintPrecacheAssets(files, readBytes) {
  const hash = createHash("sha256");
  for (const file of [...files].sort())
    hash.update(file).update("\0").update(await readBytes(file)).update("\0");
  return hash.digest("hex").slice(0, 12);
}
