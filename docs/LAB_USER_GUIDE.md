# Using McGruber Lab

## iPhone first

Open the deployed GitHub Pages site in Safari. Choose **Share → Add to Home Screen** for a standalone shortcut; behavior and icon support vary by iOS version. The horizontal navigation scrolls to Circuit Lab, 3D Lab, Component Bank, Notebook, Calculators and Source Library. Favorites, recent inventions and build progress are saved on this browser, not an account.

Open an invention and choose **Experiment** for a labeled conceptual/logic demonstration, **Guided build** for the actual repository procedure, or **Files & evidence** for BOMs, source diagrams and original logs. Use the Beginner complexity filter to find the simplest starting points. Dark/light themes and the `/` desktop search shortcut are available.

New workspaces open with a colorful light theme: yellow, coral, lavender, blue and mint backgrounds with readable content panels. Use the theme button for the darker purple/blue/teal palette. Your saved theme choice is retained.

## Salvage a mouse or landline phone

Open **Salvage workbench** to create a donor-device record, follow a preparation checklist, label your own teardown photos, link recovered parts, record their tests and plan a battery supply. The live shortlist updates from explicitly associated inventory and passing test summaries. Battery plans check operating ranges, startup current, regulator constraints, polarity and supporting circuits; unknowns prevent a candidate result. A worked switch/LED example uses clearly labeled teaching values. See the [salvage workbench guide](SALVAGE_WORKBENCH.md) for the complete workflow and limitations.

Full backups include the new records, plans, photos and labels. There is no automatic photo identification or charging-circuit design.

## Engineering Control Center

The sidebar now includes **Engineering handbook**, and the home screen provides **Engineering readiness**. These open `beam-detector/engineering-hub.html` in the same McGruber site, showing all nine inventions, owner-reported working components, remaining blockers and physical acceptance gates. The 9-stage **Standalone Receiver Lab** is linked from it, with independent local test records and JSON export. These physical test logs use separate browser storage from the main workshop notebook, so export both when backing up. Neither HTML page reads actual Fluke measurements electronically; values are user-entered.

The full [engineering master plan](ENGINEERING_MASTER_PLAN_2026-10-24.md) and [electronics field guide](ELECTRONICS_ENGINEERING_FIELD_GUIDE.md) provide the calculations, reference pinouts, and evidence requirements. The new [Parts & Meter Checks](../web/public/beam-detector/engineering-checks.html) page adds cross-project component status, a conservative 9V LED resistor calculator and a required ten-cycle DC ON/BLOCKED/RESTORED test worksheet. Stored measurements and component status are **manual user entries**; they do not independently certify physical circuitry. Export this page's own JSON as a backup. A simulated circuit or owner-marked pass must never be presented as independently measured hardware.

## Inspecting models

1. Open **3D lab**. It loads the original generic angle-support STL. This model is unprinted and fit-unverified.
2. Tap **Import models** and choose STL, OBJ, GLB or glTF from Files. You can select multiple models. Select local `.bin` and texture companions together with a glTF, or use a self-contained GLB. External resources, animations and compressed meshes are not supported.
3. For STL/OBJ, specify the source units. Internal scene dimensions use millimeters. glTF/GLB conventionally use meters and are converted to millimeters. STL Z-up is converted to the viewer's Y-up coordinates; dimensions are labeled in viewer axes.
4. Drag with one finger to orbit; pinch to zoom; use two fingers to pan. Choose a named part to select it. Numeric position, rotation and scale fields also work without dragging a small gizmo.
5. Duplicate parts or import more models; hide, isolate, align centers, enable wireframe/transparency or clip the scene. The explosion slider temporarily offsets parts; returning it to zero restores assembled positions.
6. Enable **Measure two surface points** and tap two mesh surfaces. The result is the straight-line distance in scene coordinates, not a calibrated physical measurement. Use the unit selector for mm, cm or inches.
7. Save the scene and export editable scene JSON, visible geometry as STL/GLB, or a PNG screenshot. Reloading restores locally saved mesh geometry and transforms. Importing scene JSON adds its parts to the current scene.

Limits: 20 MB per model, 40 MB per import selection, 100 parts and 500,000 triangles per scene. Edge checks are skipped for individual meshes above 50,000 triangles. Reports identify boundary and multiply incident edges, but do not check every self-intersection or certify manifoldness. Overlap checks compare axis-aligned bounding boxes only. STL output concatenates visible mesh triangles; it is not a Boolean union or a watertight fabrication certificate.

## Experiments and evidence

**Save run to notebook** records a model's settings and output history as Simulation data. For a real observation, choose **Notebook → New experiment**. Record the project, components, actual settings, trial, pass/fail criteria and observations. Enter measured voltage/current only if genuinely measured; include the real instrument and range. Use Reported observation for non-electrical/mechanical observations that do not have voltage/current readings. Physically measured and independently reproduced classifications require evidence fields; a label is still the user's assertion, not independent app certification.

Attach supported photos or short video locally (12 MB per attachment, up to 20 per record). Capturing/importing authentic media is the user's task. Simulated chart values are never physical measurements. Compare up to four records side by side. **Repeat experiment** copies inputs and criteria into a new draft and clears old electrical readings, observations, pass/fail results, simulation output samples and attachments.

Record-only exports contain log data and attachment IDs; they do **not** embed media. A full backup includes current experiment attachments and local draft attachments, plus progress, inventory, simulation settings and editable scene geometry.

## Save and resume

Autosave uses IndexedDB on this device and browser origin. A “Saved on this device” indicator appears after a successful transaction. Private/temporary browsing, storage pressure, clearing Safari data, changing origins and device changes can remove or separate local data.

Use **Backups & settings → Download full backup** before switching devices or clearing browser data. Transfer that JSON file to the other device and use **Restore full backup**. Restore validates the file first, retains the prior workspace as a recovery revision, and then replaces the current workspace. The most recent ten workspace revisions are available for recovery; media remains on the device while revisions can reference it. Backup limits are 60 MB attached media and 100 MB total imported JSON. Export smaller models/media if a limit is reached.

If another tab saves a newer workspace, autosave pauses and a recovery panel appears. **Export my local copy** downloads this tab's workspace without replacing the newer saved version. **Keep my draft & load latest** first saves this tab as a **Recovered tab draft** in Recent saved revisions, then loads the latest workspace. Restore that revision later if needed; this restores a whole workspace, so export the newer version first if you need both. There is no automatic merge of individual records. Recovery history contains at most ten revisions and is not a substitute for an exported backup.

**Local media storage** shows attachment usage. **Clean old unused media** removes only files older than 24 hours that are unreferenced by the current workspace, local draft or any retained recovery revision. Recent uploads remain available while work is being saved. Matching uploads share storage when secure browser hashing is available. Restoring a backup assigns new attachment IDs so it cannot overwrite the bytes used by an older revision.

After the deployed app has loaded its offline cache successfully, its bundled inventions, source documents and local notebook work without a network. Open it online once before relying on this. The first visit, updates and external CircuitJS engine need a connection. Export important records regularly even when using the installed shortcut.

There is no account sync in this release. Saving never publishes to GitHub. Public contribution requires a separate, explicit GitHub action after you review files for private information.

## Circuit tools

The in-app draggable starter diagrams show fixed connections and ideal DC calculations. They are not a general SPICE solver and dragging a symbol does not rewire the circuit. Tap a wire to highlight its route. Use numeric calculators for eleven supported electrical/mechanical estimates; inspect their assumptions and actual datasheets.

**Open in CircuitJS** launches an original grounded circuit in the external electrical engine. Text and SPICE exports contain the fixed documented starter values; changing the local arithmetic inputs does not silently rewrite those external examples. A switch starter models an ideal switch and a resistor, not an identified buzzer or salvaged switch. The optional iframe requires internet access and cannot share results with the app across origins. On a phone, the separate full-screen engine is usually easier to use.

## Guided building

Detailed priority guides cover the object-removal alarm, paper pop-up box and standalone control box. All nine retain their actual source steps, prerequisite checks, per-step observation notes and progress. Planning, Simulation, Assembly and Testing are selectable working stages. Verified Build remains pending an evidence review; checking every instruction does not certify hardware or printed fit. Print a build checklist from the guide on desktop.
