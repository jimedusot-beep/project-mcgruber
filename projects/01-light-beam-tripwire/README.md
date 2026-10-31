# Light-Beam Tripwire

**Goal:** Build a standalone, silent optical tripwire with a separate warning LED. No phone or laptop is required during operation; meters and computers may be used during development.

**Status:** Owner-reported automatic red-light / iPhone-camera interruption detection at nominal 1, 3, 6, 10 and 15 ft (October 23, 2026); fixed-mount reliability, electrical details and independent hardware receiver remain unverified. See [field report](FIELD_TEST_2026-10-23.md).

## Experiment B — standalone silent optical receiver (research only)

[Blue-emitter / unpowered-red-LED sensor guide](EXPERIMENT_B_LED_AS_SENSOR.md) · [Blank ten-trial DC measurements](EXPERIMENT_B_MEASUREMENTS.csv)

The sensor response, necessary analog amplification, threshold/hysteresis, and automatic warning-light operation are **not yet verified**. Do not assume the phone-camera experiment proves this standalone circuit.

## Earlier phone-only prototype

[Phone build and test package](PHONE_BUILD_TEST.md) contains the required/optional parts, electrical measurements, range tests and recovery gate. [Open the public detector](https://jimedusot-beep.github.io/3D-vision/beam-detector/) and check its displayed version; a PR is not a deployed release. The printable guide and wiring SVG ship with the app.

## Current standalone experiment (proposed; receiver unresolved)

**Experiment B:** Blue LED transmitter with verified current limiting; an **unpowered red LED used as the light sensor**; powered amplifier/threshold circuitry; and a **separate warning LED** with its own current limiting. The sensor's measured response and the receiver circuit remain unresolved. No exact amplifier, threshold values, pinout or successful automatic detection is established by the photo inventory. Follow the [one-step-at-a-time bench guide](../../web/public/beam-detector/start-here.html) and record actual measurements before proceeding.

**Experiment C:** A separate [infrared tripwire](../08-infrared-tripwire/README.md) still needs a matched infrared transmitter/receiver pair. Mouse optics and remote parts in the photo inventory do not establish that a suitable pair is owned.

## Next verification
Measure LED current, detector response under ambient lighting, false triggers, and reliable interruption distance.

## Build record
- Schematic: not yet independently validated
- Dimensions: to be measured
- Part numbers: not confirmed unless explicitly stated
- Completed standalone prototype: **not verified**

## Source
Study aspects: [published LED-sensor experiments, amplification and warning-light circuits](../../docs/RESEARCH.md#tripwire-study-aspects--experiments-b-and-c). These are learning references, not verified McGruber wiring.

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


## Owner parts photo update — October 25

See the [photo identification supplement](../../component-bank/PHOTO_IDENTIFICATIONS_2026-10-25.md). Readable markings confirm 2N4401, 2N4403 and L7805CV stock; the holder is marked for three AAA cells. All remain electrically untested. The amplifier/threshold circuit and matched IR pair are still unresolved.
