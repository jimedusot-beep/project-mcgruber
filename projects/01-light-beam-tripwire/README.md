# Light-Beam Tripwire

**Goal:** Interrupt a visible light beam to trigger an alarm.

**Status:** Working red LED and phone-based GhostLine light-loss alarm reported; independent hardware alarm not built.

## Required hardware or software (proposed)
Visible emitter and correct resistor; light detector (LDR/phototransistor); threshold circuit; rated alarm output; regulated power and aligned supports.

## Next verification
Measure LED current, detector response under ambient lighting, false triggers, and reliable interruption distance.

## Build record
- Schematic: not yet independently validated
- Dimensions: to be measured
- Part numbers: not confirmed unless explicitly stated
- Completed standalone prototype: **not verified**

## Source
https://learn.sparkfun.com/tutorials/sparkfun-inventors-kit-experiment-guide---v40/circuit-1c-photoresistor

[Return to project index](../../README.md)

## Engineering files (current)

- [Step-by-step build guide](BUILD.md)
- [Bill of materials / parts and requirements](BOM.csv)
- [Circuit interface notes](CIRCUIT.md)
- [Visual block diagram](diagrams/architecture.svg) — conceptual, not pin-level
- [Exploded assembly view](diagrams/exploded-assembly.svg) and [beginner assembly guide](ASSEMBLY_VIEW.md) — illustrative, not verified CAD or an exact wiring pinout
- [Electrical signal-flow illustration](diagrams/signal-flow.svg) — concept, not a validated circuit
- [Build decision and verification workbook](BUILD_WORKBOOK.md) — options, salvage screening, and measurement checkpoints
- [Interactive 3D assembly workshop & engineering handoff](THREE_D_HANDOFF.md) — component selection, explode, simulated beam and export to 3D Vision
- [Assembly metadata manifest](assembly_manifest.json) — concept-only part IDs and open measurements
- [Editable 3D space-study source](cad/tripwire-space-study.scad) and [3D-vision / Herbie hardware integration plan](3D_INTEGRATION.md) — placeholder dimensions, not validated CAD
- [Blank physical test log](TEST_LOG.csv) — **NOT_RUN** until real tests

See [project-wide requirements](../../docs/BUILD_STANDARD.md) and [tracking issues](../../docs/ISSUE_TRACKING.md).
