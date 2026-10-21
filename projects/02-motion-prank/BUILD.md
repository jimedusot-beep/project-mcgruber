# Motion-Activated Prank: reproducible build guide

**Status:** Acer webcam approach proposed; not tested. These are proposed steps; no hardware test is implied.

## Preconditions

Read [safety](../../docs/SAFETY.md). Identify actual supply voltage/current, connector pins, switch contact state and motor/load ratings; do not use unverified parts under power. See [BOM](BOM.csv).

## Procedure

1. Test Acer webcam privacy permissions and speaker.
2. Install opencv-python locally into an isolated environment.
3. Run the included `motion_prank.py` software; test with a stationary camera.
4. Tune sensitivity and cooldown based on real false positives.
5. Log 10 approach/non-approach trials and event latency.

## Pass gate

- [ ] Specific part models and safe ratings recorded.
- [ ] Repeatable observations measured and logged, including failed trials.
- [ ] Real images/video captured without personal data.
- [ ] Any proposed mechanical fit actually measured and tested.

[Electrical architecture](CIRCUIT.md) · [Blank test log](TEST_LOG.csv) · [Diagram](diagrams/architecture.svg)
