# Open-source study bench — McGruber (2026-11-01)

**Goal:** Learn from tested community circuits, diagrams and software without confusing a source author's success with verified results on the owner's salvaged parts. This is a research notebook, **not** proof of working electronics, purchased inventory, permission to redistribute third-party diagrams, or a physical test log.

## First actual build: salvaged mouse microswitch → visual indicator

**Read before wiring**

- [Arduino: Debounce](https://github.com/arduino/arduino-examples/blob/main/examples/02.Digital/Debounce/Debounce.ino) — study why a mechanical contact can bounce and why repeated presses may generate multiple events. This software example uses an Arduino and does **not** prove a particular donor mouse's COM/NO/NC.
- [Arduino: State Change Detection](https://github.com/arduino/arduino-examples/blob/main/examples/02.Digital/StateChangeDetection/StateChangeDetection.ino) — count state transitions rather than polling as if every sample were another press.
- [McGruber's object removal build](../projects/04-object-removal-alarm/BUILD.md) and [mouse-powered build](../projects/06-mouse-powered-gadgets/BUILD.md) — adapt the ideas to a **standalone, unpowered continuity test first**; later drive one current-limited LED using a verified low-voltage source and contact rating.

**Evidence gates**

1. Identify donor and photograph the exact switch body and its solder pads. Record markings, quantity and whether the circuit board is still attached.
2. With all batteries, USB leads and capacitors disconnected, use Fluke continuity/ohms to determine COM, normally open (NO) and normally closed (NC) contacts. Record meter state at rest and when pressed; do **not** infer pinout from another manufacturer's drawing.
3. Only after a battery source, resistor, LED polarity and contact current rating are established, test one LED under low voltage. Ten press/release cycles; note missed events or multiple bounces. Never put the Fluke in current mode across a battery.
4. Attach genuine photos and results to the inventory/test log. Mark as `owner-reported` until the documented procedure and evidence have been reviewed.

## Experiment B: blue LED → red LED as an optical sensor

- [Analog Devices: photodiode receiver with op amps and comparator](https://www.analog.com/en/resources/technical-articles/small-photodiode-receiver-handles-fiber-optic-data-rates-800kbps.html) — learn the distinction between tiny photocurrent, transimpedance amplification and a reliable logic threshold. **Do not copy** supply values or pinouts; this example targets fast fiber-optic communications, not a 9V red LED receiver.
- [Hackaday: photodiode amplifier and comparator](https://hackaday.com/2016/08/06/photodiode-amplifier-circuit-spies-on-your-phone/) — understand why high-gain circuits can oscillate and need stable bias and filtering.
- [AskElectronics community discussion](https://www.reddit.com/r/AskElectronics/comments/1m3exp6) — useful warnings about ambient light, sensor current and comparator input bias. Community replies are design suggestions, **not** bench verification.

**Evidence gates:** measure sensor DC millivolts for LED ON / beam BLOCKED / ON again, repeat ten times at a fixed distance under recorded room light, establish whether the signal separates the blocked state from noise, and **only then** identify a real amplifier/comparator from the verified donor stock or select a known alternative. Do not declare the red LED sufficient merely because a meter responds.

## Experiment C: genuine matched IR pair

- [Adafruit: IR Breakbeam Sensors](https://learn.adafruit.com/ir-breakbeam-sensors/arduino) — study emitter/receiver distinction and the open-collector output that needs a pull-up. The exact supplier's ratings apply **only to that part number**, not to unmarked salvage.
- [Hackster: Long Range Beam Break Sensor with Reflector](https://www.hackster.io/mova2/long-range-beam-break-sensor-with-reflector-panel-4dfc48) — compare modulated IR with a reflector and a matched receiver. This uses an Arduino Pro Mini, a Vishay receiver and additional hardware; it is **not** a free drop-in alternative.
- [Hackster: IR Break Beam Hot Wheels Track](https://www.hackster.io/falafelsoftware/ir-break-beam-hot-wheels-car-speed-track-361455) — learn edge-triggered timing and separation of beam breaks, not a circuit for a standalone no-phone warning light.

**Evidence gates:** manufacturer-marked emitter/receiver, supply voltage, output topology, pull-up rating, powered ON/BLOCKED/RESTORED readings, repeated ambient-light checks. The matched pair remains **needed/unverified**.

## 3D, modeling and workshop quality

- [Three.js: MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html) — source of truth for roughness/metalness/color behavior. Avoid assigning a new display color over the imported material during selection.
- [Khronos glTF Sample Assets — testing collection](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Models-testing.md) — fixture ideas for materials, vertex colors, transparency, orientation, and import failure. The older `glTF-Sample-Models` repository is archived.
- [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) — consult each model's license before downloading into McGruber. Prefer small hand-authored fixtures for regression tests.

## Toolchain and security maintenance

- [GitHub Actions checkout](https://github.com/actions/checkout) and [setup-node](https://github.com/actions/setup-node) — maintain currently supported Node 24-based action majors; CI runtime warnings are a reason to upgrade *and test*, not evidence of compromised software.
- [Dependabot configuration](https://docs.github.com/en/code-security/concepts/supply-chain-security/about-the-dependabot-yml-file) — weekly npm and GitHub Actions update proposals. These are pull requests, **not** automatic merges.
- [CodeQL default setup](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configure-code-scanning) — optional repository-owner action for code scanning. Tests and `npm audit` are not substitutes for security review.

## Fork/clone decision rule

**Study before cloning.** Favor upstream source links and compact independent tests. Fork only when the original license allows the intended modification/distribution and a maintained copy has a clear benefit. Do not import example photos, firmware or CAD as if they were owned designs, and do not silently mark part numbers or electrical ratings as verified.
