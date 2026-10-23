# Shared 3D tripwire engineering handoff

**Project owner:** [Project McGruber](https://github.com/jimedusot-beep/project-mcgruber). **3D workshop:** [3D-vision](https://github.com/jimedusot-beep/3D-vision). **Reusable electronics engineering patterns:** [Herbie-cyborg-hardware](https://github.com/jimedusot-beep/Herbie-cyborg-hardware).

## Available starter model

[OpenSCAD editable space study](cad/tripwire-space-study.scad) models emitter housing/battery volume/LED, receiver box/light shield/LDR, ESP32-sized placeholder, USB power bank and a visual optical path. **All sizes are intentionally invented illustrative placeholders**, not the measured dimensions of any purchased or salvaged part. This source has not been rendered, mesh-checked, or test printed. Its `explode` parameter ranges from 0 (assembled) to 1 (exploded), and individual groups can be hidden. The yellow cylinder is a **visual indicator only**, not a manufactured laser.

## Cross-repository responsibilities

| Repository | Owns | Should not claim |
| --- | --- | --- |
| McGruber | One-beam use case, component requirements, sensor readings, safety/testing logs, assembly instructions | Proven performance from a conceptual drawing |
| 3D-vision | Importable multi-part GLB/STL assets, interactive exploded assembly, per-part selection and annotations, unit/up-axis mapping | Measured fit from placeholder geometry |
| Herbie-cyborg-hardware | Reusable evidence practices for component identification, electrical power budget, 3.3 V I/O limits, datasheet provenance and acceptance gates | That robot controller/servo parts have been validated for a tripwire |

## Component IDs to preserve across tools

| ID | Part | Electrical interface | Geometry status |
| --- | --- | --- | --- |
| MCG-LBT-EM-001 | Visible LED/complete flashlight emitter | Independent low-voltage battery | Placeholder |
| MCG-LBT-EM-002 | Emitter battery compartment | LED current-limited supply | Placeholder |
| MCG-LBT-RX-001 | LDR or phototransistor | Conditioned 3.3 V GPIO-compatible sensor | Placeholder |
| MCG-LBT-RX-002 | Receiver shield and housing | Non-electrical | Placeholder |
| MCG-LBT-CTL-001 | ESP32-C3 development board | 3.3 V GPIO, 5 V USB power | Placeholder |
| MCG-LBT-PWR-001 | USB power bank | Rated USB output | Placeholder |
| MCG-LBT-MNT-001 | Emitter/receiver supports | Non-electrical | Placeholder |

## Practical integration steps

1. **OpenSCAD:** open `cad/tripwire-space-study.scad`, change `explode` between 0 and 1, and inspect the provisional assembly. OpenSCAD is the source editor, not the 3D-vision web importer.
2. **3D-vision:** after local conversion/export, import separate STL meshes or a GLB. Existing 3D-vision already supports component transforms, exploded animation, and annotated assembly. Prefer separate named parts over one merged mesh. Record source units as **mm** and verify up-axis (3D-vision uses Z-up internally; McGruber's viewer has a different import path). Test alignment and orientation rather than assuming they match.
3. **McGruber Lab:** import the GLB or individual STLs into the existing Three.js viewer, select parts and use its explode slider. The existing viewer is generic: this file alone **does not** add a tripwire-specific one-tap loader, clickable part descriptions, or a complete ready-to-use GLB.
4. **Hardware evidence:** apply the component identity, rating and power-budget screening patterns in Herbie-cyborg-hardware. Keep measured McGruber results in McGruber's own test log.
5. **Next software task:** implement a project-specific 3D starter scene with labeled, clickable components, a camera reset, independent emitter/receiver grouping, an explode slider, and a reliable export/import test. Add a browser test that confirms each part survives saving and reloading.
6. **Next fabrication task:** replace each placeholder with dimensions from an actual measured component. Only then generate a fitted enclosure, mounting holes, USB clearance and tolerance study.

## Acceptance criteria for a finished interactive deliverable

- A verified, importable multi-part GLB (or individually named STL set) opens in 3D-vision and McGruber Lab.
- Explode/reassemble is reversible and doesn't alter the saved base placement.
- Every part is selectable with its stable ID, purpose, required/optional status and a link to source evidence.
- Export, save, reload and mobile viewport workflows are tested.
- Documentation explicitly distinguishes measured geometry from estimated geometry and observed electrical function from software simulation.
- No claim of tested electrical behavior or 3D-printable fit without corresponding physical evidence.

[Exploded SVG](diagrams/exploded-assembly.svg) · [Electrical flow](diagrams/signal-flow.svg) · [Build workbook](BUILD_WORKBOOK.md)
