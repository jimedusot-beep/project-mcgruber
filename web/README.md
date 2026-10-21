# McGruber Lab web application

Static, mobile-first invention workshop. The nine original project directories, CSV inventories, diagrams, test logs, licenses and git history remain the source of truth.

## Development

Use Node 22 or newer and Python 3.11+ for legacy checks.

```sh
cd web
npm ci
npm test
npm run dev
```

`npm run build` regenerates the catalog and repository asset snapshot, builds `dist/`, verifies every project file reference and creates a versioned service-worker cache. Do not edit generated `public/catalog.json`, `public/repository/` or `dist/`.

```sh
python -m unittest discover -s tests -v  # from the repository root
cd web
npm run build
npx playwright install --with-deps chromium webkit
npm run test:browser
```

Browser tests run in isolated contexts with explicitly labeled QA fixtures; they never change repository hardware test logs. GitHub Actions runs desktop Chromium with software graphics and iPhone-sized WebKit emulation. Linux WebKit 3D is excluded because its headless GPU availability does not establish physical Safari compatibility. Test on an actual iPhone before claiming device validation.

## Architecture

- Native ES modules, Vite and hash routes; relative asset paths support repository-subpath hosting.
- `scripts/catalog.mjs` builds project data from actual `BUILD.md`, BOMs, component requirements, compatibility matrix and equipment inventory. Descriptive dashboard metadata is maintained there; engineering procedures remain in original project files.
- `src/core.js` holds pure calculators, deterministic behavior models, record validation, CircuitJS starter exports and evidence classifications.
- `src/storage.js` uses revision-checked IndexedDB transactions for workspace snapshots and media. Stale tabs pause autosave and can preserve their draft in the ten-revision history before loading newer work. Media hashes share matching uploads in secure contexts; cleanup protects current/draft/history references and recent files. Backup restore remaps media IDs. Full JSON backups and records-only CSV/JSON exports are separate operations.
- `src/mesh.js` parses real mesh formats, inspects geometry and round-trips editable scene transforms. `src/viewer.js` lazily loads Three.js, controls, importers and exporters.
- Local sessions never transmit records, photos or model geometry to a server. No login or access-token UI exists.
- `scripts/verify-build.mjs` verifies static assets and emits the offline service worker.

See [user guide](../docs/LAB_USER_GUIDE.md), [acceptance evidence](../docs/LAB_ACCEPTANCE.md), [integration research](../docs/ENGINEERING_INTEGRATIONS.md), and [sync design](../docs/CLOUD_SYNC_DESIGN.md).
