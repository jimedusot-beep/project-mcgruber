# Motion-Activated Prank

**Goal:** Detect approaching movement and play a voice, sound or surprise.

**Status:** Acer webcam method proposed, not yet tested.

## Required hardware or software (proposed)
Acer with usable webcam, speaker, Python/OpenCV and audio file; OR PIR sensor, controller/trigger, audio playback and speaker.

## Next verification
Verify camera access, detection zone, latency and false alarms before adding standalone hardware.

## Build record
- Schematic: not yet independently validated
- Dimensions: to be measured
- Part numbers: not confirmed unless explicitly stated
- Completed standalone prototype: **not verified**

## Source
https://docs.opencv.org/4.x/d1/dc5/tutorial_background_subtraction.html

[Return to project index](../../README.md)

## Engineering files (current)

- [Step-by-step build guide](BUILD.md)
- [Bill of materials / parts and requirements](BOM.csv)
- [Circuit interface notes](CIRCUIT.md)
- [Visual block diagram](diagrams/architecture.svg) — conceptual, not pin-level
- [Blank physical test log](TEST_LOG.csv) — **NOT_RUN** until real tests
- [Local OpenCV motion-prank prototype](motion_prank.py) (software tests only; real webcam untested)

See [project-wide requirements](../../docs/BUILD_STANDARD.md) and [tracking issues](../../docs/ISSUE_TRACKING.md).
