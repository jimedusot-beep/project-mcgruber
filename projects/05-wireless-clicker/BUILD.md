# Wireless Clicker: reproducible build guide

**Status:** fob indicator reported; RF operation unverified. These are proposed steps; no hardware test is implied.

## Preconditions

Read [safety](../../docs/SAFETY.md). Identify actual supply voltage/current, connector pins, switch contact state and motor/load ratings; do not use unverified parts under power. See [BOM](BOM.csv).

## Procedure

1. Photograph fob PCB and battery markings; do not infer RF frequency from printing alone.
2. Measure key fob supply condition.
3. Select receiver/decoder only with documented matching address/encoding.
4. Bench test all three commands and current limits.
5. Log pairing, range and distinct outputs.

## Pass gate

- [ ] Specific part models and safe ratings recorded.
- [ ] Repeatable observations measured and logged, including failed trials.
- [ ] Real images/video captured without personal data.
- [ ] Any proposed mechanical fit actually measured and tested.

[Electrical architecture](CIRCUIT.md) · [Blank test log](TEST_LOG.csv) · [Diagram](diagrams/architecture.svg)
