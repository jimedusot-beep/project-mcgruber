# Standalone Alarm / Control Box: reproducible build guide

**Status:** not built; audible output parts unconfirmed. These are proposed steps; no hardware test is implied.

## Preconditions

Read [safety](../../docs/SAFETY.md). Identify actual supply voltage/current, connector pins, switch contact state and motor/load ratings; do not use unverified parts under power. See [BOM](BOM.csv).

## Procedure

1. Verify low-voltage supply and whether USB bank powers small loads.
2. Identify switch COM/NC with no power.
3. Select **5V-rated active** buzzer and check real switch/current limits.
4. Conditional schematic: +5V → master SW → COM/NC trigger → buzzer (+); buzzer (-) → 0V.
5. Test arm/disarm and 20 detection cycles before adding sensors.

## Pass gate

- [ ] Specific part models and safe ratings recorded.
- [ ] Repeatable observations measured and logged, including failed trials.
- [ ] Real images/video captured without personal data.
- [ ] Any proposed mechanical fit actually measured and tested.

[Electrical architecture](CIRCUIT.md) · [Blank test log](TEST_LOG.csv) · [Diagram](diagrams/architecture.svg)
