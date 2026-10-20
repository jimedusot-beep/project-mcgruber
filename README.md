# Project McGruber 🛠️

**Public, open-source learning and prototyping project** turning salvaged, donated, broken or inexpensive electronics into working inventions, prank devices, alarms, sensors and eventually small robots.

**Priorities:** **$0 first**, use existing components, learn real electronics, and work toward **standalone devices that do not require a phone or laptop**. Phone/laptop prototypes remain useful intermediate steps.

> **Evidence policy:** Working demonstrations in the project conversation are *reported*, not independently re-tested here. A schematic or parts list is *proposed* until reproducible measurements are published. No standalone invention is yet certified.

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
