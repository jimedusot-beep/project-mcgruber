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

CI runs in the matching official `mcr.microsoft.com/playwright:v1.64.1-noble` image, pinned by digest, with browsers and OS dependencies preinstalled, following the [Playwright container guidance](https://playwright.dev/docs/ci#via-containers). Update the image, digest and package versions together. This avoids repeated Ubuntu package downloads during each check. The two browser projects run serially with a ten-minute suite limit inside a twelve-minute browser step and a fifteen-minute validation job. This leaves time for teardown and report uploads; individual test timeouts and assertions remain enforced. The earlier six-minute suite limit interrupted the 70-test run after 67 passes, leaving three tests unrun.

## Architecture

- Native ES modules, Vite and hash routes; relative asset paths support repository-subpath hosting.
- `scripts/catalog.mjs` builds project data from actual `BUILD.md`, BOMs, component requirements, compatibility matrix and equipment inventory. Descriptive dashboard metadata is maintained there; engineering procedures remain in original project files.
- `src/core.js` holds pure calculators, deterministic behavior models, record validation, CircuitJS starter exports and evidence classifications.
- `src/storage.js` uses revision-checked IndexedDB transactions for workspace snapshots and media. Stale tabs pause autosave and can preserve their draft in the ten-revision history before loading newer work. Media hashes share matching uploads in secure contexts; cleanup protects current/draft/history references and recent files. Backup restore remaps media IDs. Full JSON backups and records-only CSV/JSON exports are separate operations.
- `src/mesh.js` parses real mesh formats, inspects geometry and round-trips editable scene transforms. `src/viewer.js` lazily loads Three.js, controls, importers and exporters.
- Local-only sessions keep records, photos and models in IndexedDB. Optional, opt-in authenticated Supabase vault transfer uploads AES-GCM-encrypted backups to the user's own configured service. No backend is connected by default; never enter secret/service-role keys.
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

## Gadget Research Library (13 curated references)

Open the Gadget research library (`#/gadgets`) to explore the supplied list of
13 grouped gadget and DIY concepts. Search by capability, input, material or
project. Filter by area and development priority. Each record has research
sources, starter ingredients, a conservative first experiment, specific
limitations and permission boundaries, links to existing McGruber invention
pages, and a downloadable Markdown investigation checklist. The library
contains reference ideas, **not 13 owned gadgets**. Related Rev 4 parts are
investigation leads only—not approved wiring, validated component fits,
operating radio devices or proof of electrical performance. Where relevant,
the library links to Device Brain (virtual sensors and outputs), the Notebook
and 3D Lab. Nothing transmits RF, collects Bluetooth identifiers, clones
credentials, tampers with cellular equipment, or opens physical locks.
All research records are curated; this release does not add an account or
purchase products, install firmware or claim physical testing.

## Six simulation and build-readiness labs

Open `#/labs` or a Start-tagged entry within `#/gadgets`. Labs cover G02 Marauder-style
wireless awareness, G03 Fanttik-inspired repair workflow, G04 nyanBOX-style
BLE tracker uncertainty, G06 Cardputer pocket interface, G07 StickS3-style
virtual controller and G08 RTL-SDR synthetic receive-only spectrum studies.
Each lab has at least three deterministic simulation scenarios, fictional
sample charts, individual observations, a persistent manual review checklist,
a downloadable detailed readiness worksheet and private Notebook export.
Checklist marks are REVIEWED, not tested/verified, and are included in existing
encrypted and plain full workspace backups. Existing workspaces default to
empty reviews. Notebook exports are Simulation data / Not tested and contain
no physical measurements. This release does not scan nearby devices, transmit
radio, receive spectrum, run firmware or control motors or soldering tools.

## Optional secure private cloud sync (requires your own backend)

GitHub Pages remains local-first and cannot privately store personal inventory.
The new **Backups & settings → Secure cross-device sync** panel is opt-in.
The owner can configure their own Supabase project, apply the migration in
supabase/migrations/202610240001_private_vault.sql, and enable numerical
Email OTP. The frontend uses only the **public** publishable key, not a
service_role key. Before upload, the app encrypts the full local backup
(including referenced images/media) with AES-256-GCM and a separate
never-stored passphrase. The remote head is changed using atomic expected
revision comparison; concurrent device changes pause sync rather than
silently overwriting. Cloud files are owner-scoped and private with RLS.
Uploads can be scheduled automatically after local autosave only when this
tab is explicitly unlocked; remote restores always require the user's
confirmation. The app never auto-publishes to GitHub.

**This repo does not deploy or connect a real cloud backend on its own.**
See [supabase/README.md](../supabase/README.md) for complete setup,
scope limitations, quotas, safe cleanup and the real two-device security
test checklist. Local IndexedDB saving and encrypted manual backup remain
available without any account.

## Offline photographs and graphics tests — October 31, 2026

Original and annotated donor photos load on demand in a collapsed gallery and are excluded from the installation precache and runtime cache. Source guides and application scripts remain available offline. The cache version incorporates content bytes, so editing a file without changing its name refreshes the offline install. Photos require a connection, or a manually saved copy, for viewing.

Desktop Chromium's software GL path must render a real tripwire canvas in browser CI. Linux WebKit may instead verify the no-WebGL fallback; neither mode substitutes for real iPhone Safari testing.

## Catalog and model-import integrity

The catalog build now validates the **exact nine known project folder identities**, derives stable IDs from those folder names, and joins component compatibility by the `category + component` identity—not CSV row order. It rejects duplicate, missing or unexpected component rows and invalid project cells before generating a potentially misleading app catalog. The generic 3D viewer stages all models selected in one import batch and commits them together; a malformed later file leaves the previous scene untouched. See `tests/catalog-data.test.mjs` and the Chromium import regression.

## 3D material fidelity (source-color mode)

The generic viewer now retains the **base color, emissive color, roughness, metalness, opacity, facing and vertex-color flag** of supported glTF PBR mesh materials in the editable local scene JSON (backward-compatible optional schema 1 material field). Selecting a mesh uses a temporary emissive highlight without destroying the source base color. The **Part colors** control can switch to a geometry-only green overview. OBJ is still geometry-only, while glTF textures, multiple per-face material slots, material extensions, skinning and animation are **not persisted**. Do not call this a full glTF material or texture round-trip. A tiny hand-authored texture-free glTF regression follows the [Khronos testing fixture approach](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Models-testing.md).

The camera now avoids zero-size aspect ratios during collapsed or rotated mobile layouts and requests a redraw when a hidden tab becomes visible.


## Five-upstream switch bench / GLB optimization

See [first switch build track](../docs/FIRST_SWITCH_BUILD_TRACK.md). The Circuit Lab now offers a **9V object-removal resistor-only CircuitJS proxy** (not an LED simulation) and maintains its physical measurements separately. For local models, install glTF Transform's external MIT CLI and run `npm run 3d:dedup -- input.glb output.glb`; it refuses overwrites and reports before/after size, but does not certify rendering/performance. The optional Arduino Bounce2 sketch and OpenSCAD switch gauge are repository source files, not demonstrated physical hardware.
