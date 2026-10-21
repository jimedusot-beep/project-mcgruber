# Standalone Alarm / Control Box

**Goal:** Operate sensors, switches, alarms, lights and later audio independently of a phone.

**Status:** Architecture proposed; not assembled.

## Required hardware or software (proposed)
Low-voltage regulated supply, on/off control, rated buzzer, test switch, LED resistor, enclosure; controller/input/output expansion optional.

## Next verification
Build one safe switch-to-buzzer circuit before integrating additional sensor or logic modules.

## Build record
- Schematic: not yet independently validated
- Dimensions: to be measured
- Part numbers: not confirmed unless explicitly stated
- Completed standalone prototype: **not verified**

## Source
https://learn.adafruit.com/adafruit-audio-fx-sound-board

[Return to project index](../../README.md)

## Engineering files (current)

- [Step-by-step build guide](BUILD.md)
- [Bill of materials / parts and requirements](BOM.csv)
- [Circuit interface notes](CIRCUIT.md)
- [Visual block diagram](diagrams/architecture.svg) — conceptual, not pin-level
- [Blank physical test log](TEST_LOG.csv) — **NOT_RUN** until real tests
- [Conditional 5V wiring illustration](diagrams/wiring-example-5v.svg) — not electrically validated

See [project-wide requirements](../../docs/BUILD_STANDARD.md) and [tracking issues](../../docs/ISSUE_TRACKING.md).
