import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
// Hash built asset names so an update installs a distinct, complete offline cache.
const { createHash } = await import("node:crypto"),
  version = createHash("sha256")
    .update(
      files.join("|") +
        (await readFile(path.join(dist, "catalog.json"), "utf8")),
    )
    .digest("hex")
    .slice(0, 12);
const sw = `const CACHE='mcgruber-${version}',FILES=${JSON.stringify(files)},PUBLIC_FILES=new Set(FILES.map(f=>new URL(f,self.location.href).href));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(async keys=>{const ours=keys.filter(k=>k.startsWith('mcgruber-'));await Promise.all(ours.slice(0,-2).filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})));
// Public build files have identical content regardless of Origin. Hosts that
// send Vary: Origin must still match a module request against its precache entry.
// Other same-origin URLs retain the normal Vary checks.
self.addEventListener('fetch',e=>{const u=new URL(e.request.url),base=new URL('./',self.location.href);if(e.request.method!=='GET'||u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return;e.respondWith((async()=>{try{const response=await fetch(e.request);if(response.ok){const cache=await caches.open(CACHE);cache.put(e.request,response.clone());}return response;}catch{const cache=await caches.open(CACHE),options={ignoreVary:PUBLIC_FILES.has(u.href)||u.pathname.startsWith(base.pathname+'assets/')};const response=await cache.match(e.request,options);if(response)return response;if(e.request.mode==='navigate'){const shell=await cache.match(new URL('./index.html',base),{ignoreVary:true});if(shell)return shell;}return await caches.match(e.request,options)||Response.error();}})());});`;
await writeFile(path.join(dist, "sw.js"), sw);
await writeFile(path.join(dist, ".nojekyll"), "");
console.log(
  `Verified ${catalog.projects.length} project routes and source files; offline cache ${version} (${files.length} assets).`,
);
