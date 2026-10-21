# Mouse-Powered Gadgets: reproducible build guide

**Status:** two or more mice reported; actual function unverified. These are proposed steps; no hardware test is implied.

## Preconditions

Read [safety](../../docs/SAFETY.md). Identify actual supply voltage/current, connector pins, switch contact state and motor/load ratings; do not use unverified parts under power. See [BOM](BOM.csv).

## Procedure

1. Photograph models and PCBs before salvage.
2. Check whether an intact mouse operates with computer connection.
3. Unplug power and map microswitch terminals with meter.
4. Wire a salvaged isolated contact to a properly rated low-voltage output.
5. Log ten press and/or movement events.

## Pass gate

- [ ] Specific part models and safe ratings recorded.
- [ ] Repeatable observations measured and logged, including failed trials.
- [ ] Real images/video captured without personal data.
- [ ] Any proposed mechanical fit actually measured and tested.

[Electrical architecture](CIRCUIT.md) · [Blank test log](TEST_LOG.csv) · [Diagram](diagrams/architecture.svg)
