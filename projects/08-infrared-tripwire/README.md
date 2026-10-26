# Invisible Infrared Tripwire

**Goal:** Experiment C — detect interruptions of an infrared beam with a silent warning LED, operating without a phone or laptop.

**Status:** Matched emitter and receiver not confirmed.

## Required hardware or software (proposed)
Matching break-beam IR emitter/receiver; rated power, pull-up where required, threshold logic/driver, separate warning LED with current limiting, supports. Exact parts and wiring remain unverified.

## Next verification
Verify polarity and receiver output before alignment, then measure reliable range and ambient light interference.

## Build record
- Schematic: not yet independently validated
- Dimensions: to be measured
- Part numbers: not confirmed unless explicitly stated
- Completed standalone prototype: **not verified**

## Source
Study aspects: [published infrared transmitter/receiver builds and pulse-detection experiments](../../docs/RESEARCH.md#c1--complete-separate-infrared-units). Parts and output adaptations still require verification.

https://learn.adafruit.com/ir-breakbeam-sensors/arduino

[Return to project index](../../README.md)

## Engineering files (current)

- [Step-by-step build guide](BUILD.md)
- [Bill of materials / parts and requirements](BOM.csv)
- [Circuit interface notes](CIRCUIT.md)
- [Visual block diagram](diagrams/architecture.svg) — conceptual, not pin-level
- [Blank physical test log](TEST_LOG.csv) — **NOT_RUN** until real tests

See [project-wide requirements](../../docs/BUILD_STANDARD.md) and [tracking issues](../../docs/ISSUE_TRACKING.md).

## Owner parts photo update — October 25

See the [photo identification supplement](../../component-bank/PHOTO_IDENTIFICATIONS_2026-10-25.md). Readable markings confirm 2N4401, 2N4403 and L7805CV stock; the holder is marked for three AAA cells. All remain electrically untested. The amplifier/threshold circuit and matched IR pair are still unresolved.
