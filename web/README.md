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

Playwright is pinned to 1.64.1, which includes the upstream [WebKit offline service-worker navigation fix](https://github.com/microsoft/playwright/pull/42894). Keep the offline reload workflow enabled when updating browser tooling.

CI runs in the matching official `mcr.microsoft.com/playwright:v1.64.1-noble` image, pinned by digest, with browsers and OS dependencies preinstalled, following the [Playwright container guidance](https://playwright.dev/docs/ci#via-containers). Update the image, digest and package versions together. This avoids repeated Ubuntu package downloads during each check. The suite stops after six minutes so its reports can finish within the eight-minute browser job limit.

## Architecture

- Native ES modules, Vite and hash routes; relative asset paths support repository-subpath hosting.
- `scripts/catalog.mjs` builds project data from actual `BUILD.md`, BOMs, component requirements, compatibility matrix and equipment inventory. Descriptive dashboard metadata is maintained there; engineering procedures remain in original project files.
- `src/core.js` holds pure calculators, deterministic behavior models, record validation, CircuitJS starter exports and evidence classifications.
- `src/storage.js` uses revision-checked IndexedDB transactions for workspace snapshots and media. Stale tabs pause autosave and can preserve their draft in the ten-revision history before loading newer work. Media hashes share matching uploads in secure contexts; cleanup protects current/draft/history references and recent files. Backup restore remaps media IDs. Full JSON backups and records-only CSV/JSON exports are separate operations.
- `src/mesh.js` parses real mesh formats, inspects geometry and round-trips editable scene transforms. `src/viewer.js` lazily loads Three.js, controls, importers and exporters.
- Local sessions never transmit records, photos or model geometry to a server. No login or access-token UI exists.
- `scripts/verify-build.mjs` verifies static assets and emits the offline service worker.

See [user guide](../docs/LAB_USER_GUIDE.md), [acceptance evidence](../docs/LAB_ACCEPTANCE.md), [integration research](../docs/ENGINEERING_INTEGRATIONS.md), and [sync design](../docs/CLOUD_SYNC_DESIGN.md).

## Workshop intelligence (rules-based, offline)

Open Workshop intelligence from the sidebar (#/assistant). It joins the nine project
requirements, owner-supplied Rev 4 reference items and browser-local identified inventory to
provide conservative next-test guidance. Build Navigator lists original required
categories, explicit test status, potential photo-derived salvage leads, and missing evidence.
Electronics Detective guides safe, mostly unpowered identification for all 23 Rev 4
reference entries. Export build investigations and inspection worksheets as editable Markdown.
Select Record next test to open a prefilled private Notebook draft. Existing drafts are never
replaced and no physical measurements, pass results, compatibility claims or automated chip
identifications are invented. All data remains local unless explicitly exported.

The src/workshop-intelligence.js file contains pure, testable rules; src/workshop.js is the
presentation. This is not a generative AI API, device connection system, automatic component
recognizer or a qualified electrical BOM. Prioritize safe documentation over guesses.

## Device Brain and Automation Studio

Open the Device Brain & automations sidebar tab (#/device-brain). Run four
virtual signals (light, motion, contact, button) through reusable one-input
or two-input AND/OR rules. Configure thresholds, debounce, virtual output
hold time and labeled virtual LED, buzzer, relay or motor indicators. Step
the deterministic engine at 250 ms intervals or run it while the page is open.
Export/import validated JSON recipes as distinct local copies and inspect
related idealized CircuitJS starters. Recipe names, conditions and circuits
are validated; user-supplied JavaScript is not executed.

Recipes save in existing IndexedDB with full backups and recovery history.
Simulation traces can be saved to Notebook as Simulation data / Not tested
without fabricated measurements. There are no real hardware commands, GPIO
signals, device permissions, sound outputs, cloud accounts or background rules.

## Private encrypted transfer

Settings supports an optional encrypted full backup with a 12+ character
passphrase, PBKDF2-HMAC-SHA-256, fresh salt and AES-256-GCM authentication.
The receiving device can restore using the same file and passphrase.
This is manual transfer, not automatic cloud synchronization, server upload
or account recovery. Lost passphrases cannot be recovered. Retain a verified
backup before clearing a source browser. Plain JSON backups remain available.
See docs/CLOUD_SYNC_DESIGN.md for limitations and a future private sync plan.
