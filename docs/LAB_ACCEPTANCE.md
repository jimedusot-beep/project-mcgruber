# McGruber Lab acceptance evidence

This is a software release assessment, not a declaration that the entire engineering mission or any physical invention is complete. **PASS** means the stated implemented behavior has relevant software evidence; **PARTIAL** names a remaining limit; **BLOCKED** names an unavailable prerequisite; **NOT IMPLEMENTED** means no such capability ships.

| Acceptance criterion | Status | Evidence and scope |
| --- | --- | --- |
| All nine inventions accessible | PASS | Generated catalog includes P01–P09 with real BOMs, five source build steps each and working hash routes. |
| Narrow-phone navigation | PARTIAL | Responsive 320px+ layouts and touch controls implemented; iPhone-sized WebKit CI included. Real iPhone Safari has not been tested. |
| Actual documentation, parts and diagrams | PASS | Build verifies every per-project file; source library serves original Markdown/CSV/SVG/STL assets. |
| Genuine 3D import/inspection/movement | PARTIAL | Real STL/OBJ/GLB/glTF parser, geometry checks, camera/gizmo/numeric transforms, measurements and exports implemented. Source STL and multipart round-trip unit tests pass. The cloud preview has no WebGL context; software-rendered Chromium CI supplies rendering evidence. |
| Multiple organized 3D parts | PARTIAL | Import, hierarchy, selection, hide/isolate, duplicate and transform serialization tested programmatically; graphical workflow belongs to the Chromium browser suite. |
| Exploded view | PARTIAL | Reversible radial offsets preserve assembled positions; graphical workflow included in browser checks. No true joints or constraints. |
| Functional circuit examples and limitations | PASS | Three original grounded CircuitJS and SPICE starter exports; fixed-connection draggable diagram, ideal DC arithmetic and explicit external engine boundary. This is not a general in-app circuit solver. |
| Virtual triggers and responses | PASS | All nine behavior models are tested. Manual browser check toggled the P04 contact, observed active/idle output and saved a labeled simulation. |
| Correct relevant calculators | PASS | Eleven families, known numeric examples, E24 rounding and invalid-range tests pass. Assumptions and warnings displayed. |
| Component search and inventory | PASS | Sixteen original requirements and twelve reported equipment groups generated from CSV; separate local identification records, filters, comparison and planned-use dependency matrix implemented. No guessed specifications. |
| Guided build/progress | PASS | All nine source procedures, prerequisite checks, notes and working-stage persistence. Three priority projects have detailed checks/troubleshooting. Verified Build cannot be selected or inferred from completion. |
| Experiment create/save/restore/export | PASS | IndexedDB tests cover save, schema validation, recovery and backup restore. Manual browser saved a clearly labeled QA observation and reloaded it. CSV/JSON, comparison, repeat and local media implemented; media round-trip in browser CI. |
| Persistence after reload | PASS | Manual browser reload retained records and settings; Node IndexedDB tests verify snapshots, serialization, queued saves and ten recovery revisions. |
| GitHub Pages | PARTIAL | Tested static build and official deployment workflow included; live deployment must be confirmed from its run. Pages administration may require repository-owner configuration. |
| Automated tests | PARTIAL | All 14 legacy Python tests and 18 web unit/integration tests pass, build succeeds, audit reports zero vulnerabilities. Desktop/iPhone-emulated browser CI is required before release and must be reported separately. |
| No exposed sensitive credentials | PASS | No authentication/token collection or privileged request code in the frontend. Private records/media remain in IndexedDB. No secrets added to repository output. |
| Existing files and history preserved | PASS | Additive `web/` application and new documentation. Only a stale sentence in the existing motion guide is corrected; original engineering assets and logs remain. |

## Verification boundaries

No physical hardware tests, RF connection, printed fit, original build photographs, successful real-world trials or manufacturer-specific unknown pinouts have been invented. CI fixtures explicitly identify themselves as software test inputs. User-selected evidence labels are assertions until the actual procedure and evidence are reviewed.

**NOT IMPLEMENTED:** account/cloud sync, general SPICE execution inside the app, free circuit rewiring, true Boolean union, STEP/3MF/parametric CAD editing, assembly joints/constraints, exact mesh collision/self-intersection checks, automatic component identification and calibrated physical measurements.

**BLOCKED:** physical verification needs real parts and measurements; real iPhone testing needs the actual device. Secure sync needs an authorized backend and correctly configured authentication; it is intentionally absent from public JavaScript.

See [user guide](LAB_USER_GUIDE.md), [roadmap](ROADMAP.md), [integration assessment](ENGINEERING_INTEGRATIONS.md) and [sync design](CLOUD_SYNC_DESIGN.md) for use and next work. The final delivery records the actual CI/deployment run links, without representing pending checks as passes.
