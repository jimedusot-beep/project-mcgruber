# Project McGruber 🛠️

**Public, open-source learning and prototyping project** turning salvaged, donated, broken or inexpensive electronics into working inventions, prank devices, alarms, sensors and eventually small robots.

**Priorities:** **$0 first**, use existing components, learn real electronics, and work toward **standalone devices that do not require a phone or laptop**. Phone/laptop prototypes remain useful intermediate steps.

> **Evidence policy:** Working demonstrations in the project conversation are *reported*, not independently re-tested here. A schematic or parts list is *proposed* until reproducible measurements are published. No standalone invention is yet certified.

## Engineering readiness and electronics training — October 24, 2026

**First stop for all nine inventions:** [Engineering master plan](docs/ENGINEERING_MASTER_PLAN_2026-10-24.md) — real parts, unverified electronics, circuit design, instrument procedure, safety, sourcing gates and go/no-go acceptance criteria.

- [Engineering Control Center (mobile)](web/public/beam-detector/engineering-hub.html) — nine projects, owned/pending resources, first experiments and physical test logs. [Public phone access](https://jimedusot-beep.github.io/3D-vision/beam-detector/engineering-hub.html) is provided by the existing 3D Vision site; verify that GitHub Pages has updated before relying on that link.
- [Standalone receiver laboratory](web/public/beam-detector/standalone-lab.html) — nine supervised hardware stages covering the 9V red/blue LED emitter, Fluke photodiode checks, 2N4401 transistor switching, missing amplifier/threshold work, distance trials and enclosure.
- [Engineering status register](docs/PROJECT_STATUS.md) — evidence levels and blockers for projects 01–09.
- [Electronics engineering field guide](docs/ELECTRONICS_ENGINEERING_FIELD_GUIDE.md) — multimeter use, safe 9V LED design, NPN/PNP pinouts, photodiode amplification, comparator thresholds, switch tests and release evidence.
- [Phone-ready Parts & Meter Checks](web/public/beam-detector/engineering-checks.html) — 32 shared engineering component categories across nine inventions, conservative LED current/power calculations and a ten-cycle receiver DC worksheet with local JSON backup. [Public-site source](https://jimedusot-beep.github.io/3D-vision/beam-detector/engineering-checks.html); newest live deployment not independently confirmed.

**Critical distinction:** Owner-reported phone optical detection through nominal 15 ft is encouraging; a bare unpowered red LED, 2N4401/2N4403, and the unpopulated NightFire boards do *not* yet constitute a demonstrated standalone no-phone receiver. Do not connect an unverified 9V source to an unresisted LED or unknown PCB.

## Silent standalone light-tripwire research — experiments B and C

- **[Experiment B: blue LED emitter → unpowered red LED photodetector](projects/01-light-beam-tripwire/EXPERIMENT_B_LED_AS_SENSOR.md)** — research and a [blank 10-reading worksheet](projects/01-light-beam-tripwire/EXPERIMENT_B_MEASUREMENTS.csv). The measured analog signal and amplifier/threshold design remain **unverified**; this is not a finished standalone receiver.
- **[Experiment C: matched IR beam-break pair → silent warning LED](projects/08-infrared-tripwire/EXPERIMENT_C_SILENT_IR.md)** — model-specific vendor circuit [diagram](projects/08-infrared-tripwire/diagrams/experiment-c-silent-adafruit-5v.svg) and [blank 10-trial worksheet](projects/08-infrared-tripwire/EXPERIMENT_C_MEASUREMENTS.csv). Verify the exact hardware voltage, output polarity and current limits before assembly; no physical acceptance is claimed.

These guides were preserved from historical PR #32. Both are **documentation and software-test evidence only**, not demonstrated electrical circuits or completed hardware tests. No audio or autonomous output is enabled.

## Start here — the next real hardware test

For the silent, no-phone light tripwire, open the **[one-step-at-a-time bench guide](web/public/beam-detector/start-here.html)**. The existing public-phone route is [McGruber Start Here](https://jimedusot-beep.github.io/3D-vision/beam-detector/start-here.html) (site deployment may need to finish). It starts with a **9V resistor/current-limiting check**, then a measured LED-as-receiver DC experiment, a verified 2N4401 output switch, an explicitly **unverified** analog threshold front-end, and honest range acceptance tests. Test results are owner-entered, not remotely measured.

## McGruber Lab browser workshop

A mobile-first web application now lives in [web/](https://github.com/jimedusot-beep/project-mcgruber/tree/main/web). Explore nine invention workspaces, logic experiments, real 3D files, calculators, guided builds, the component bank and a private notebook with photos, local autosave and full backups.

- [How to use the app from an iPhone, import models and save experiments](docs/LAB_USER_GUIDE.md)
- [Acceptance evidence and incomplete features](docs/LAB_ACCEPTANCE.md)
- [Development/build instructions](https://github.com/jimedusot-beep/project-mcgruber/blob/main/web/README.md) · [Pages deployment workflow](https://github.com/jimedusot-beep/project-mcgruber/actions/workflows/web-lab.yml)
- [Engineering integrations](docs/ENGINEERING_INTEGRATIONS.md) · [Private saving and future sync](docs/CLOUD_SYNC_DESIGN.md)

**Deployment status — October 31, 2026:** [Main-branch validation and deployment succeeded](https://github.com/jimedusot-beep/project-mcgruber/actions/runs/41197585759) on `f1bff5a`. [Open McGruber Lab](https://jimedusot-beep.github.io/project-mcgruber/#/tripwire-3d); real-iPhone smoke testing remains pending. The October 23 Pages permission failure is historical; see [publishing guidance](docs/PUBLISH.md). For an already-published 3D tripwire view, use [3D Vision's exploded 13-part concept](https://jimedusot-beep.github.io/3D-vision/?example=mcgruber-tripwire-exploded) or [the Cyborg hardware case study](https://github.com/jimedusot-beep/Herbie-cyborg-hardware/tree/main/examples/mcgruber-light-beam-tripwire). The conceptual model is not physical measurement or evidence of working hardware.

## Silent phone tripwire — build and test

[Complete phone-only build/test package](projects/01-light-beam-tripwire/PHONE_BUILD_TEST.md): required and optional parts, current-limited LED wiring, multimeter measurements, six distances, timed stability tests and restart recovery. V4 adds measured camera counts, operator-confirmed crossing truth, local results and JSON export. Hardware performance and optical range remain unverified; the public app must display V4 before following the new test controls.

## All nine inventions

| # | Project | Current progress |
|---|---|---|
| 1 | [Light-Beam Tripwire](projects/01-light-beam-tripwire/README.md) | Reported working phone + GhostLine light-loss version; standalone still needed |
| 2 | [Motion-Activated Prank](projects/02-motion-prank/README.md) | Software route with Acer webcam identified; independent trigger not validated |
| 3 | [Pop-Up Surprise Box](projects/03-pop-up-surprise-box/README.md) | Mechanical version possible; motorized version later |
| 4 | [Object-Removal Alarm](projects/04-object-removal-alarm/README.md) | Salvaged mouse switches available; require contact testing |
| 5 | [Wireless Clicker / Remote](projects/05-wireless-clicker/README.md) | Three-button fob; receiver unverified |
| 6 | [Mouse-Powered Sensor Gadgets](projects/06-mouse-powered-gadgets/README.md) | Several mice/salvaged parts reported |
| 7 | [Standalone Alarm / Control Box](projects/07-standalone-control-box/README.md) | Core hardware goal; proposed |
| 8 | [Invisible Infrared Tripwire](projects/08-infrared-tripwire/README.md) | Matched emitter/receiver needed |
| 9 | [Talking / Moving Prank Robot](projects/09-talking-prank-robot/README.md) | Future build; investigate Love2Learn Elmo donor |

## What we own, need and have accomplished

- [Existing equipment — 12 reported inventory entries](docs/EXISTING_EQUIPMENT.md)
- [Actual equipment inventory spreadsheet](component-bank/inventory.csv) (reported presence vs tested function)
- [16 component requirements/checklist](component-bank/README.md) and [requirements CSV](component-bank/components.csv)
- [Accomplishments and unfinished work](docs/ACCOMPLISHMENTS.md)
- [Project-by-project status register](docs/PROJECT_STATUS.md)
- [Modular detection → control → output system architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Build priorities and roadmap](docs/ROADMAP.md)
- [Research references](docs/RESEARCH.md)
- [Safety and verification](docs/SAFETY.md)
- [Experiment report template](docs/EXPERIMENT_TEMPLATE.md)
- [CAD/STL staging](cad-and-stl/README.md)

## Immediate build order
1. **Object-removal alarm:** test mouse microswitch with the multimeter and run a low-voltage LED alarm.
2. **Mechanical pop-up surprise box:** validate lightweight spring/latch before motorizing.
3. **Standalone alarm/control box:** use a switch, correctly rated active buzzer and supply; add sensors later.

## Longer-term connection
Reusable sensor, control, actuator and mechanical modules can inform future **H.E.R.B.I.E.** designs, but no cross-project fit or electrical compatibility has been established.

## Open collaboration
Welcome independent measurement reports, reliable schematics, original CAD/STLs and constructive pull requests. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). Never upload credentials, private correspondence or personal addresses. MIT applies to original repository software/documentation; select an appropriate hardware design license separately before fabrication releases.

## Engineering build packages (2026-10-20 upgrade)

Each [project directory](projects/) now includes a **BUILD.md**, **BOM.csv**, **CIRCUIT.md**, **conceptual diagram SVG**, and an explicitly **unmeasured TEST_LOG.csv**. The [Motion-Activated Prank](projects/02-motion-prank/motion_prank.py) additionally has optional OpenCV prototype code with testable, dependency-free trigger logic; actual Acer webcam behavior remains untested.

- [16 × 9 compatibility matrix](component-bank/compatibility.csv) and [explanation](component-bank/COMPATIBILITY.md)
- [12-item Inventory V2](component-bank/inventory-v2.csv) and [intake log](component-bank/intake-log.csv)
- [Real-world measurement protocol](docs/MEASUREMENT_PROTOCOL.md) and [circuit status](docs/CIRCUIT_STATUS.md)
- [Authentic photo/video checklist](media/CAPTURE_GUIDE.md) and [media manifest](media/manifest.csv). A separate [October 25 inventory supplement](component-bank/PHOTO_IDENTIFICATIONS_2026-10-25.md) now includes 35 owner photographs and 35 annotated views; completed-build media and test-video evidence remain outstanding.
- [Original parametric angle support + ASCII STL](cad-and-stl/README.md) — digitally generated, **unprinted and fit-unverified**
- [Hardware license CERN-OHL-P-2.0](LICENSE-HARDWARE) and [scope guidance](docs/LICENSE_GUIDE.md)
- [Ten-item upgrade checklist](docs/UPGRADE_CHECKLIST.md)

**No physical sensor performance, component compatibility, current draw, image of a real build, recorded prank effect or printed part has been fabricated as evidence.**

### Community progress

- [GitHub issues: 9 project tasks, 3 phase trackers, 2 shared tasks](https://github.com/jimedusot-beep/project-mcgruber/issues)
- [Issue-tracking guide](docs/ISSUE_TRACKING.md)
- [Current ten-item improvement audit](docs/UPGRADE_CHECKLIST.md)
- [Conditional object-alarm wiring illustration](projects/04-object-removal-alarm/diagrams/wiring-example-5v.svg)
- [Conditional standalone-buzzer wiring illustration](projects/07-standalone-control-box/diagrams/wiring-example-5v.svg)



## Community engineering references

- [Open-source study bench](docs/OPEN_SOURCE_STUDY_BENCH_2026-11-01.md) — Arduino, Hackster, Adafruit, Analog Devices, AskElectronics and Khronos references, with distinct evidence gates for the salvaged microswitch, blue/red LED receiver, matched infrared pair, 3D material tests and maintenance.


## First five upstream integration track

[First switch build track](docs/FIRST_SWITCH_BUILD_TRACK.md) — no-purchase continuity and LED test first, optional Arduino/Bounce2 firmware, linked CircuitJS resistive simulation, parametric OpenSCAD switch clearance gauge, and optional glTF Transform GLB deduplication/size report. No electrical verification is claimed by this software change.
