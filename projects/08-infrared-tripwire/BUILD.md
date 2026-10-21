# Invisible Infrared Tripwire: reproducible build guide

**Status:** matching optical parts not confirmed. These are proposed steps; no hardware test is implied.

## Preconditions

Read [safety](../../docs/SAFETY.md). Identify actual supply voltage/current, connector pins, switch contact state and motor/load ratings; do not use unverified parts under power. See [BOM](BOM.csv).

## Procedure

1. Obtain a matched emitter/receiver with readable datasheets.
2. Verify module supply, open-collector/push-pull behavior and pin assignments.
3. Observe receiver signal with/without beam.
4. Connect alarm driver only after testing current and logic levels.
5. Log ten interruptions at increasing range and ambient conditions.

## Pass gate

- [ ] Specific part models and safe ratings recorded.
- [ ] Repeatable observations measured and logged, including failed trials.
- [ ] Real images/video captured without personal data.
- [ ] Any proposed mechanical fit actually measured and tested.

[Electrical architecture](CIRCUIT.md) · [Blank test log](TEST_LOG.csv) · [Diagram](diagrams/architecture.svg)
