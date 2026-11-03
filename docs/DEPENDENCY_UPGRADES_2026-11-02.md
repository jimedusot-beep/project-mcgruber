# Dependency upgrade: Three.js + Vite (November 2, 2026)

Upstreams: [Three.js](https://github.com/mrdoob/three.js) 0.180.0 → 0.186.1 and [Vite](https://github.com/vitejs/vite) 7.3.7 → 8.3.5, consolidating Dependabot PRs #46 and #47.

## Why a combined lockfile
Both Dependabot PRs alter `web/package-lock.json`, so serially merging without recomputing a compatible lockfile would lose one update. This PR takes Vite's generated lockfile and replaces the Three.js package metadata with the exact registry integrity/resolved URL from its independently generated Dependabot lockfile. The application manifest and lockfile root both require **Node >=22.12.0**, matching Vite 8's published engine requirement. The CI uses the current Node 22 series.

## Merge gate
- `npm ci`, `npm audit --audit-level=moderate`, Node tests and built deployment must succeed.
- The generated static site must include all nine inventions, original photos as optional assets, .nojekyll and the P04 measurement route.
- Real browser tests on software Chromium and iPhone-size WebKit must pass. Physical iPhone touch, memory, GPU frame rate and loaded GLB visual fidelity remain **unmeasured**. No performance speedup is claimed.
- CodeQL and Python documentation/geometry regression must pass.

If a major Vite or Three.js update breaks any of these, do not merge by hiding tests. Verify model import, display, scene save/reload, annotations and upload/download behavior.

Original vendor code is **not** copied into the repository; npm resolves the two packages from the official registry with pinned lockfile integrity.
