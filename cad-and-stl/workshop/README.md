# McGruber 3D Printing Workshop

**Status: organized research + digitally generated designs; zero new physical prints verified.** This workshop belongs inside the existing [CAD/STL staging area](../README.md), not in a new repository. Its purpose is low-cost repair parts, electronics housings, mounts and eventually small robot bodies.

## Start here (phone/iPad friendly)

1. Browse the [numbered idea inventory](IDEAS.csv). IDs are stable, and **idea-only** means no CAD exists.
2. Review [existing McGruber models](../README.md) and [first new tray design](models/README.md). Source (.scad) is editable; STL is a generated sample that must be regenerated after parameter changes.
3. Study [tool and model references](REFERENCES.md) before copying anyone else's design.
4. When you have real donor measurements, update CAD and fill in the [print/fit test card](PRINT_TEST_TEMPLATE.md).
5. Record progress in [workshop issue #56](https://github.com/jimedusot-beep/project-mcgruber/issues/56); the original angle-support physical print remains [issue #14](https://github.com/jimedusot-beep/project-mcgruber/issues/14).

## Best starter projects

| Priority | ID | Idea | Why |
|---|---|---|---|
| 1 | M3D-002 | Open electronics tray | An original, adjustable entry-level enclosure concept with a generated sample mesh |
| 2 | M3D-007 | Salvaged mouse microswitch jig | Build on real McGruber donor experiments after measuring hardware |
| 3 | M3D-003 | Light-tripwire emitter/receiver bracket | Help the existing beam experiments align |
| 4 | M3D-004 | GhostScan MAX electronics case | Protect and organize an eventual family prototype |
| 5 | M3D-005 | Friendly desktop companion shell | Long-term learning for H.E.R.B.I.E.-style robotics; no motors initially |

**Difficulty scale:** 1 = simple part; 2 = basic measurement/clearance; 3 = multi-feature assembly; 4 = electronics/robot integration; 5 = safety-critical precision. Values in the inventory are *planning estimates*, not measured achievements.

## Material cost assumption (not a quote)

Illustrative PLA at **$20 per 1 kg** = **$0.02 per gram**. Example: 25 g × $0.02/g = $0.50 of raw filament. Inventory gram bands are rough estimates **before slicing**; values exclude supports, failed prints, shipping, labor, machine access, tax, electricity, motors and electronics. Confirm with an actual slicer before budgeting.

## Evidence levels

- **idea-only:** concept and possible measurements; no generated file
- **source-present-unprinted:** source model exists; no verified physical print
- **digitally-checked-unprinted:** generated mesh passed explicitly recorded geometry checks; no verified print or actual fit
- **print-tested:** a real print has logged printer/material settings, photos and dimensions
- **hardware-fit-tested:** tested against the identified real donor hardware, with observed clearances/results

Do not confuse a working web 3D viewer, download, watertight mesh or slicer preview with a physically printed and verified device.

## Practical boundaries

- Measure actual hardware with a ruler/calipers; do not use guessed board dimensions to claim ESP32/IR/switch fit.
- Begin with passive, low-voltage, non-load-bearing parts. Avoid safety-critical joints, battery charging/storage or unattended actuation.
- Give original CAD a [CERN-OHL-P-2.0](../../LICENSE-HARDWARE) header; general documentation follows the root license, and all third-party designs retain their own licenses.
- Continue reusable generic parts here. When a design becomes a maintained, device-specific H.E.R.B.I.E. assembly, document interfaces and migrate/copy via its own repository with provenance, not a silent move.
