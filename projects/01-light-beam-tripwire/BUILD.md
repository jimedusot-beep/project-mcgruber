# Light-Beam Tripwire: reproducible build guide

**Status:** working GhostLine phone report; standalone not verified. These are proposed steps; no hardware test is implied.

## Preconditions

Read [safety](../../docs/SAFETY.md). Identify actual supply voltage/current, connector pins, switch contact state and motor/load ratings; do not use unverified parts under power. See [BOM](BOM.csv).

## Procedure

1. Record GhostLine demonstration and emitter voltage/current.
2. Test receiver signal with beam present and absent in three lighting conditions.
3. Determine a stable threshold/hysteresis and compatible comparator.
4. Connect current-limited output after verifying driver and supply.
5. Log ten beam blocks at measured separation.

## Pass gate

- [ ] Specific part models and safe ratings recorded.
- [ ] Repeatable observations measured and logged, including failed trials.
- [ ] Real images/video captured without personal data.
- [ ] Any proposed mechanical fit actually measured and tested.

[Electrical architecture](CIRCUIT.md) · [Blank test log](TEST_LOG.csv) · [Diagram](diagrams/architecture.svg)
