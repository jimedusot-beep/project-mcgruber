# Talking / Moving Robot: reproducible build guide

**Status:** Elmo donor reliability unresolved; no independent robot built. These are proposed steps; no hardware test is implied.

## Preconditions

Read [safety](../../docs/SAFETY.md). Identify actual supply voltage/current, connector pins, switch contact state and motor/load ratings; do not use unverified parts under power. See [BOM](BOM.csv).

## Procedure

1. Diagnose Elmo shutdown/power before salvage.
2. Measure and identify donor speaker/motor; never guess pinouts.
3. Prototype sensor-triggered audio as an independent subsystem.
4. Prototype low-mass movement using a correctly rated driver.
5. Integrate with mechanical stops and record 20 cycles.

## Pass gate

- [ ] Specific part models and safe ratings recorded.
- [ ] Repeatable observations measured and logged, including failed trials.
- [ ] Real images/video captured without personal data.
- [ ] Any proposed mechanical fit actually measured and tested.

[Electrical architecture](CIRCUIT.md) · [Blank test log](TEST_LOG.csv) · [Diagram](diagrams/architecture.svg)
