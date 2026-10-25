# Invisible Infrared Tripwire

**Goal:** Detect interruptions of an infrared beam.

**Status:** Matched emitter and receiver not confirmed.

## Experiment C — matched infrared break-beam, warning LED only

**[OPEN THE COMPLETE SILENT INFRARED BUILD](EXPERIMENT_C_SILENT_IR.md)** · [5 V IR module + resistors + warning LED circuit drawing](diagrams/experiment-c-silent-adafruit-5v.svg) · [Unfilled IR hardware trials](EXPERIMENT_C_MEASUREMENTS.csv)

Three distinct routes are documented: **C1** Adafruit 2167/2168 short-range paired sensors (10–20 inches) whose open-collector output can directly sink a current-limited red LED **when the beam is broken** without any MCU or NPN transistor; **C2** DFRobot SEN0523 5 V, manufacturer-stated 4 m model (output polarity must be metered before driving an LED); **C3** exploratory remote-control IR salvage, which has neither verified continuous transmitter nor matched receiver.

All approaches remain **unbuilt/owner-unverified**. There is **no buzzer, speaker, audio, phone, laptop or internet requirement** in the target device. An ordinary TV remote's IR burst is not a constant tripwire source; no laser is required.

## Required hardware or software (proposed)
Matching break-beam IR emitter/receiver; rated power, pull-up where required, alarm logic/driver, output, supports.

## Next verification
Verify polarity and receiver output before alignment, then measure reliable range and ambient light interference.

## Build record
- Schematic: not yet independently validated
- Dimensions: to be measured
- Part numbers: not confirmed unless explicitly stated
- Completed standalone prototype: **not verified**

## Source
https://learn.adafruit.com/ir-breakbeam-sensors/arduino

[Return to project index](../../README.md)

## Engineering files (current)

- [Step-by-step build guide](BUILD.md)
- [Bill of materials / parts and requirements](BOM.csv)
- [Circuit interface notes](CIRCUIT.md)
- [Visual block diagram](diagrams/architecture.svg) — conceptual, not pin-level
- [Blank physical test log](TEST_LOG.csv) — **NOT_RUN** until real tests

See [project-wide requirements](../../docs/BUILD_STANDARD.md) and [tracking issues](../../docs/ISSUE_TRACKING.md).
