# Light-Beam Tripwire

**Goal:** Interrupt a visible light beam for a silent on-screen indication using an iPhone receiver; standalone hardware is a separate later track.

**Status:** Owner-reported automatic red-light / iPhone-camera interruption detection at nominal 1, 3, 6, 10 and 15 ft (October 23, 2026); fixed-mount reliability, electrical details and independent hardware receiver remain unverified. See [field report](FIELD_TEST_2026-10-23.md).

## Experiment B — independent blue-to-red LED optical receiver (silent)

**[OPEN THE BLUE LED → RED LED SENSOR EXPERIMENT](EXPERIMENT_B_LED_AS_SENSOR.md)** · [Blank ten-reading DC photodiode test log](EXPERIMENT_B_MEASUREMENTS.csv)

This is a **separate, no-phone/no-computer** project using the previously photographed blue LED transmitter, an **unpowered** red LED acting as a photo-sensor, a suitable **high-impedance signal amplifier with verified light-loss threshold**, and a current-limited red warning LED controlled by an identified 2N4401. Research from Analog Devices and Codrey Electronics confirms the technique, **not this particular build**. The actual red-LED sensor output, amplification, threshold, and fully automatic switching circuit **have not been qualified**. No audio device is included.

## Current phone-only build

[Phone build and test package](PHONE_BUILD_TEST.md) contains the required/optional parts, electrical measurements, range tests and recovery gate. [Open the public detector](https://jimedusot-beep.github.io/3D-vision/beam-detector/) and check its displayed version; a PR is not a deployed release. The printable guide and wiring SVG ship with the app.

## Future standalone hardware or software (proposed)
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

