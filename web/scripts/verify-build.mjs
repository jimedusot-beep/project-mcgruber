import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { choosePrecacheAssets, fingerprintPrecacheAssets } from "./offline-assets.mjs";
const dist = fileURLToPath(new URL("../dist/", import.meta.url)),
  catalog = JSON.parse(await readFile(path.join(dist, "catalog.json"), "utf8"));
if (
  catalog.projects.length !== 9 ||
  catalog.components.length !== 16 ||
  catalog.inventory.length !== 12
)
  throw Error("Source catalog coverage regression");
for (const p of catalog.projects)
  for (const f of p.files) {
    if (!(await stat(path.join(dist, "repository", f))).isFile())
      throw Error("Missing source: " + f);
  }
// Verify the static, mobile engineering routes are included in the deployable build.
// These checks do not imply that physical hardware passed bench testing.
for (const needed of [
  "beam-detector/index.html",
  "beam-detector/start-here.html",
  "beam-detector/standalone-lab.html",
  "beam-detector/engineering-hub.html",
  "beam-detector/engineering-checks.html",
  "beam-detector/engineering-core.mjs",
]) {
  if (!(await stat(path.join(dist, needed)).catch(() => null))?.isFile())
    throw Error("Missing mobile engineering asset: " + needed);
}
const checksSource = await readFile(path.join(dist,"beam-detector/engineering-checks.html"),"utf8");
if (!checksSource.includes("./engineering-core.mjs") || !checksSource.includes("analyzeReceiverTriples"))
  throw Error("Engineering worksheet missing shared measured-electronics logic.");
const files = [];
async function walk(dir = "") {
  for (const f of await readdir(path.join(dist, dir), {
    withFileTypes: true,
  })) {
    const p = path.posix.join(dir, f.name);
    if (f.isDirectory()) await walk(p);
    else if (p !== "sw.js") files.push("./" + p);
  }
}
await walk();
const html = await readFile(path.join(dist, "index.html"), "utf8");
if (/(?:src|href)="\/(?!\/)/.test(html))
  throw Error("Absolute asset path breaks repository-subpath hosting.");
// Keep the large photo archive out of every phone\u0027s mandatory offline install.
const offlineFiles = choosePrecacheAssets(files),
  version = await fingerprintPrecacheAssets(offlineFiles, f => readFile(path.join(dist, f.slice(2))));
const sw = `const CACHE='mcgruber-${version}',FILES=${JSON.stringify(offlineFiles)},PUBLIC_FILES=new Set(FILES.map(f=>new URL(f,self.location.href).href));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(async keys=>{const ours=keys.filter(k=>k.startsWith('mcgruber-'));await Promise.all(ours.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})));
// Public build files have identical content regardless of Origin. Hosts that
// send Vary: Origin must still match a module request against its precache entry.
// Other same-origin URLs retain the normal Vary checks.
self.addEventListener('fetch',e=>{const u=new URL(e.request.url),base=new URL('./',self.location.href);if(e.request.method!=='GET'||u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return;/* On-demand full-size photographs are not automatically cached. */if(u.pathname.startsWith(base.pathname+'repository/media/parts/'))return;e.respondWith((async()=>{try{const response=await fetch(e.request);if(response.ok){const cache=await caches.open(CACHE);cache.put(e.request,response.clone());}return response;}catch{const cache=await caches.open(CACHE),options={ignoreVary:PUBLIC_FILES.has(u.href)||u.pathname.startsWith(base.pathname+'assets/')};const response=await cache.match(e.request,options);if(response)return response;if(e.request.mode==='navigate'){const shell=await cache.match(new URL('./index.html',base),{ignoreVary:true});if(shell)return shell;}return await caches.match(e.request,options)||Response.error();}})());});`;
await writeFile(path.join(dist, "sw.js"), sw);
await writeFile(path.join(dist, ".nojekyll"), "");
console.log(
  `Verified ${catalog.projects.length} project routes and source files; offline cache ${version} (${offlineFiles.length} core assets; ${files.length - offlineFiles.length} optional photo assets).`,
);
