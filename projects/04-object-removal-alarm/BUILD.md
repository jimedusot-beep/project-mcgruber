# Object-Removal Alarm: reproducible build guide

**Status:** salvaged mouse switch reported; contacts not tested. These are proposed steps; no hardware test is implied.

## Preconditions

Read [safety](../../docs/SAFETY.md). Identify actual supply voltage/current, connector pins, switch contact state and motor/load ratings; do not use unverified parts under power. See [BOM](BOM.csv).

## Procedure

1. Disconnect all power and measure switch continuity under pressed/released positions.
2. Find a COM/NC pair that opens when object presses and closes when removed.
3. Verify 5V supply, LED polarity/rating and 470Ω resistor value.
4. Wire conditional sample: +5V → COM → NC → 470Ω → LED anode → cathode → 0V.
5. Measure loaded supply and LED current; log 20 cycles.

## Pass gate

- [ ] Specific part models and safe ratings recorded.
- [ ] Repeatable observations measured and logged, including failed trials.
- [ ] Real images/video captured without personal data.
- [ ] Any proposed mechanical fit actually measured and tested.

[Electrical architecture](CIRCUIT.md) · [Blank test log](TEST_LOG.csv) · [Diagram](diagrams/architecture.svg)
