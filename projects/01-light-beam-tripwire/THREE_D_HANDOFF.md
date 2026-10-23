# Interactive 3D tripwire — cross-repository handoff

**Status:** `DIGITAL_CONCEPT_UNTESTED`. This is a navigable 3D educational mock-up, not a measured mechanical model, printable STL assembly, independently tested circuit, or working hardware-to-phone link.

## Open the workshop

- In the McGruber Lab web app, open **Light-Beam Tripwire (P01)** and select **Open interactive 3D assembly**, or navigate to `#/tripwire-3d`.
- Drag to orbit; pinch to zoom; use the reset-camera button when needed.
- **Explode assembly** separates illustrative components; **Assemble** puts them back. The slider does not change or certify actual fit.
- Select a part from the list or directly in the viewport. Read its stable ID, function, Dollar Tree/toy salvage possibilities, and the specific verification step.
- Untick individual parts to hide them; **Isolate selected** reveals internal structure.
- **Simulate crossing beam** toggles a *browser-only* fictional beam interruption. It does not connect to a phone, Wi-Fi device or real sensor.
- Export **visible parts as GLB** for optional manual import into [3D Vision](https://jimedusot-beep.github.io/3D-vision/).

## What each repository contributes

| Repository | Relevant verified source-code/workflow capabilities | What this integration actually uses |
| --- | --- | --- |
| [3D Vision](https://github.com/jimedusot-beep/3D-vision) | Real browser model orbiting, exploded-view previews, GLB import/export, part inspection, model provenance | Design pattern inspiration, a **manual GLB export/import handoff**; its H.E.R.B.I.E. CAD assets are not copied into this project |
| [H.E.R.B.I.E. Cyborg Hardware](https://github.com/jimedusot-beep/Herbie-cyborg-hardware) | Versioned CAD-electronics map, stable component IDs, explicit provisional and verified flags, measurement gates | Evidence discipline and the review-only [tripwire assembly manifest](assembly_manifest.json), not a servo/controller hardware claim |
| [Project McGruber](https://github.com/jimedusot-beep/project-mcgruber) | P01 hardware source documents, Nine-project lab UI, Three.js scene viewer, test suite | New independent [3D model](../../web/src/tripwire-3d.js), [part metadata](../../web/src/tripwire-kit.js), component-selection and simulation UX, and new tests |

**No automatic cross-repository synchronization exists.** GLB export/import is manual, intentionally avoiding tokens or extra services. The generated GLB contains *generic model placeholders* with standard glTF units, not fabrication-ready CAD. Do not claim H.E.R.B.I.E. hardware dimensions or mounting-hole patterns transfer to the tripwire.

## Real assembly readiness checklist

1. Replace **illustrative-mm** components with real measured dimensioned parts in a separate future CAD revision.
2. Identify the actual sensor (LDR vs phototransistor vs solar-cell experimental route). Measure its response before selecting the resistor/bias network.
3. Obtain the real ESP32-C3 board variant, datasheet, supply wiring and ADC-capable pin information.
4. Specify mounting clearances, cable paths, fasteners, strain relief and beam alignment.
5. Validate low-power visible-LED current limiting and battery supply.
6. Physically record beam-on/beam-blocked readings, lighting interference, false triggers and working distance in [TEST_LOG.csv](TEST_LOG.csv).
7. Only call a housing **fit-checked** after a physical dry fit; only call a circuit **validated** after actual electrical measurements.

## Tests and QA

- `web/tests/tripwire-kit.test.mjs` validates stable part IDs, manifest consistency, reversible explosion coordinates and deterministic simulated beam states.
- `web/tests/browser/tripwire-3d.spec.js` exercises navigation, mobile/desktop WebGL fallback, component inspection, explode/assemble, the simulated alarm and GLB file download.
- The repository's GitHub Actions workflow runs `npm test`, `npm run build` and Playwright, but a committed test is **not proof of a passing run** until the checks complete.

Reference material: [original exploded SVG](diagrams/exploded-assembly.svg), [signal flow](diagrams/signal-flow.svg), [assembly workbook](BUILD_WORKBOOK.md), [safety](../../docs/SAFETY.md).
