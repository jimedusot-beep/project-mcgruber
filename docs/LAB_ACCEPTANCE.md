# McGruber Lab acceptance evidence

This is a software release assessment, not a declaration that the entire engineering mission or any physical invention is complete. **PASS** means the stated implemented behavior has relevant software evidence; **PARTIAL** names a remaining limit; **BLOCKED** names an unavailable prerequisite; **NOT IMPLEMENTED** means no such capability ships.

| Acceptance criterion | Status | Evidence and scope |
| --- | --- | --- |
| All nine inventions accessible | PASS | Generated catalog includes P01–P09 with real BOMs, five source build steps each and working hash routes. |
| Narrow-phone navigation | PASS | iPhone-sized WebKit CI passed navigation for all nine inventions with no horizontal page overflow. Real iPhone Safari has not been tested. |
| Colorful, positive background | PASS | Manual preview checked the yellow/coral/lavender/blue/mint light background, readable hero labels and the purple/blue/teal dark theme. New workspaces default to light; saved choices persist. |
| Actual documentation, parts and diagrams | PASS | Build verifies every per-project file; source library serves original Markdown/CSV/SVG/STL assets. |
| Genuine 3D import/inspection/movement | PASS | Real STL/OBJ/GLB/glTF parsing, source STL and multipart round-trip unit tests pass. Software-rendered Chromium CI loaded real geometry, edited transforms, restored the scene and exported STL. The cloud preview has no WebGL context; physical iPhone graphics remain untested. |
| Multiple organized 3D parts | PASS | Chromium browser CI loaded, duplicated, transformed and restored two parts; unit tests retain separate multipart OBJ geometry and visibility. |
| Exploded view | PASS | Chromium CI changed the explosion slider, returned to assembled positions and restored a saved multipart scene. No true joints or constraints are claimed. |
| Functional circuit examples and limitations | PASS | Three original grounded CircuitJS and SPICE starter exports; fixed-connection draggable diagram, ideal DC arithmetic and explicit external engine boundary. The actual CircuitJS site successfully opened and rendered the switch/load starter in a manual browser check. This is not a general in-app circuit solver. |
| Virtual triggers and responses | PASS | All nine behavior models are tested. Manual browser check toggled the P04 contact, observed active/idle output and saved a labeled simulation. |
| Correct relevant calculators | PASS | Eleven families, known numeric examples, E24 rounding and invalid-range tests pass. Assumptions and warnings displayed. |
| Component search and inventory | PASS | Sixteen original requirements and twelve reported equipment groups generated from CSV; separate local identification records, filters, comparison and planned-use dependency matrix implemented. No guessed specifications. |
| Guided build/progress | PASS | All nine source procedures, prerequisite checks, notes and working-stage persistence. Three priority projects have detailed checks/troubleshooting. Verified Build cannot be selected or inferred from completion. |
| Experiment create/save/restore/export | PASS | IndexedDB tests cover save, schema validation, recovery and backup restore. Manual browser saved a clearly labeled QA observation and reloaded it. CSV/JSON, comparison, repeat and local media implemented; media round-trip in browser CI. |
| Persistence after reload | PASS | Manual browser reload retained records and settings; Node IndexedDB tests verify snapshots, serialization, queued saves and ten recovery revisions. |
| Offline bundled workspace | PASS | Chromium and iPhone-sized WebKit CI loaded the cached workshop and original build source with the network disabled, saved a notebook record and retained it after another offline reload. External engines and the first visit still need a connection. |
| Conflicting tabs and media recovery | PASS | Chromium/WebKit CI and a manual two-tab check paused the stale tab, preserved its draft in recovery history and loaded the newer experiment. Unit tests cover stale-write rejection, legacy revision metadata, matching media, restore ID collisions and cleanup reference protection. |
| GitHub Pages | BLOCKED | Main-branch build and every app check passed. Initial Pages creation returned `Resource not accessible by integration`; the repository owner must select Settings → Pages → Source → GitHub Actions, then rerun the workflow. No live deployment is claimed. |
| Automated tests | PASS | Current CI passes all 14 legacy Python tests, 24 web unit/integration tests and 17 browser workflows, including two-tab recovery, invalid-backup preservation, both theme choices and offline source/notebook persistence. Production build and zero-vulnerability audit pass. One Linux WebKit 3D test is intentionally excluded; Chromium tests real rendering. |
| No exposed sensitive credentials | PASS | No authentication/token collection or privileged request code in the frontend. Private records/media remain in IndexedDB. No secrets added to repository output. |
| Existing files and history preserved | PASS | Additive `web/` application and new documentation. Only a stale sentence in the existing motion guide is corrected; original engineering assets and logs remain. |

## Verification boundaries

### Salvage and restore hardening — October 24, 2026

The new salvage workbench links donor records, preparation checklists, teardown photos/normalized labels, inventory parts, test summaries, live requirement shortlists and low-voltage battery/regulator plans. Photos are included in backup/restore and protected by reference-aware media cleanup. Part identification and electrical evidence remain user-entered. A candidate power result is a calculated first-test proposal, never a physical verification.

The three audit defects are addressed by shared committed-record evidence rules, structurally validated notebook drafts and pre-allocation scene validation. Unit/integration regressions reject malformed draft dates, missing attachments, mixed simulation/measurement imports, incomplete transforms, bad Euler orders, corrupt mesh indices and invalid salvage references. Atomic-restore checks verify that rejection changes neither current data, history nor stored media. See [salvage guide](SALVAGE_WORKBENCH.md).

Local checks at implementation: **41 web tests and 14 original Python tests passed**, production asset verification passed, dependency audit reported zero vulnerabilities. New browser regressions cover mouse inventory matching, phone-component power mismatch persistence, annotated-photo backups and invalid-draft rejection; their CI result must be recorded after running. Pages remains blocked by missing owner-side configuration; no live release is claimed here.

No physical hardware tests, RF connection, printed fit, original build photographs, successful real-world trials or manufacturer-specific unknown pinouts have been invented. CI fixtures explicitly identify themselves as software test inputs. User-selected evidence labels are assertions until the actual procedure and evidence are reviewed.

**NOT IMPLEMENTED:** account/cloud sync, general SPICE execution inside the app, free circuit rewiring, true Boolean union, STEP/3MF/parametric CAD editing, assembly joints/constraints, exact mesh collision/self-intersection checks, automatic component identification and calibrated physical measurements.

**BLOCKED:** physical verification needs real parts and measurements; real iPhone testing needs the actual device. Secure sync needs an authorized backend and correctly configured authentication; it is intentionally absent from public JavaScript.

See [user guide](LAB_USER_GUIDE.md), [roadmap](ROADMAP.md), [integration assessment](ENGINEERING_INTEGRATIONS.md) and [sync design](CLOUD_SYNC_DESIGN.md) for use and next work. The final delivery records the actual CI/deployment run links, without representing pending checks as passes.

## Passing release evidence

- [Pull request #16, merged](https://github.com/jimedusot-beep/project-mcgruber/pull/16): colorful backgrounds, reliable local saving and safer media recovery.
- [Passing reliability and color-theme CI](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39854363616): 24 web tests, 14 original Python tests and 17 browser workflows passed; one Linux WebKit 3D workflow explicitly excluded. Includes production asset checks, offline reload in both tested engines and a zero-vulnerability audit.
- [Pull request #15, merged](https://github.com/jimedusot-beep/project-mcgruber/pull/15).
- [Passing full application CI](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39669349415): 19 web tests, 14 original Python tests, 13 browser tests passed, one intentionally excluded WebKit 3D test, production asset checks and zero-vulnerability audit. Browser screenshots, traces and geometry exports are in its `browser-evidence` artifact.
- [Passing original regression workflow](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39669349213).
- [Desktop preview screenshot](screenshots/workshop.jpg). The notebook count in this preview is local QA records, not real hardware evidence.
- [Recovery controls and preserved tab draft](screenshots/recovery.jpg), captured during the manual two-tab software check. This is a development preview, not a live Pages deployment.
- [Colorful workshop preview](screenshots/colorful-workshop.jpg), showing the requested bright background. This is a development preview, not a live Pages deployment.

## Exact deployment blocker

The [main-branch release run](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/39669645464) passed its complete `validate` job. Its `deploy` job failed while running `actions/configure-pages@v5`: `Get Pages site failed: Not Found`, followed by `Create Pages site failed: Resource not accessible by integration`. The generated site artifact exists; the failure is initial hosting configuration, not an application build failure.

The authenticated repository connector can commit and merge source, but does not expose Pages configuration. The separate browser session is not signed in to the owner's GitHub account. No token or secret has been requested as a workaround.

Owner action: open [repository Pages settings](https://github.com/jimedusot-beep/project-mcgruber/settings/pages) while signed in, choose **Build and deployment → Source → GitHub Actions**, then rerun the latest **McGruber Lab checks and Pages** workflow from Actions. Confirm the returned deployment URL before calling the app live.
