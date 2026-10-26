# Research and references

Manufacturer and engineering documentation; external documents linked rather than copied.

- https://learn.sparkfun.com/tutorials/sparkfun-inventors-kit-experiment-guide---v40/circuit-1c-photoresistor
- https://learn.adafruit.com/pir-passive-infrared-proximity-motion-sensor
- https://learn.adafruit.com/ir-breakbeam-sensors/arduino
- https://learn.adafruit.com/adafruit-audio-fx-sound-board
- https://learn.adafruit.com/motion-gift-box
- https://docs.opencv.org/4.x/d1/dc5/tutorial_background_subtraction.html
- https://www.es.co.th/Schemetic/PDF/SCT2260-E.PDF

These references are examples; verify documentation against actual parts and revisions before connecting or energizing a circuit.

## Tripwire study aspects — Experiments B and C

These five published projects are study references for reproducing experiments, not verified McGruber wiring. Main ingredients below are not complete BOMs. Keep the original circuit and any proposed substitutions in separate notes. A published demonstration is source evidence, not a passed test of our hardware.

### B1 — LED sensing and transistor amplification

**Study:** [Analog Devices: LED as light sensor](https://wiki.analog.com/university/courses/electronics/electronics-lab-led-sensor) · [StudentZone article](https://www.analog.com/en/resources/analog-dialogue/studentzone/studentzone-january-2023.html).

- **Learn:** How a sensor LED produces a small light-dependent current; how one NPN transistor amplifies it; how two Darlington-connected NPN transistors increase sensitivity.
- **Original ingredients:** 2N3904 transistors, sensor LEDs, resistors and a 5 V lab supply. The published procedure uses ADALM2000 scope measurements and breadboard construction.
- **Our study task:** Compare light-on, blocked and restored responses; then compare one-transistor and two-transistor sensitivity using the published schematics.
- **Boundary:** This is a sensor demonstration, not a complete warning-light tripwire. Its sensor is reverse-biased, unlike the original unpowered/zero-bias LED test. A 2N4401 substitution is only a candidate until actual pinout, ratings and operation are checked. No direct-wire version has been validated here.

### B2 — Turning darkness into a separate warning light

**Study:** [D. Mohan Kumar / Electronics For You: LED As Light Sensor](https://www.electronicsforu.com/electronics-projects/led-light-sensor).

- **Learn:** The sensor → amplifier → transistor driver → separate indicator arrangement. Study the published schematic and PCB/component layouts together.
- **Original ingredients:** Transparent red sensor LED, CA3140 amplifier, BC547 and BC337 transistors, a separate white indicator LED, supporting parts and a 9 V battery.
- **Our study task:** Trace why illumination turns its indicator off and darkness turns it on; identify how the indicator is kept from shining into the sensor.
- **Boundary:** A daylight/darkness design does not establish detection of our blue beam over a doorway. The article describes reverse-biased sensing. No substitutions, zero-bias adaptation or range are approved by this reference alone.

### B3 — Measuring the weak signal before choosing gain

**Study:** [jc2048 / element14: Experimenting With Using an LED as a Light Sensor](https://community.element14.com/members-area/personalblogs/b/blog/posts/experimenting-with-using-an-led-as-a-light-sensor).

- **Learn:** Current-to-voltage amplification, feedback resistance, reference voltage, alignment and signal loss with separation. The author provides bench photographs and oscilloscope observations.
- **Original ingredients:** Red LEDs, OP177 amplifier, 10 MΩ feedback resistor, reference-voltage circuitry and an Arduino-driven flashing emitter.
- **Our study task:** Understand how the received signal changes with distance, light source and amplifier saturation; distinguish measured results from a hoped-for range.
- **Boundary:** A close-distance, reverse-biased bench experiment with an Arduino source is not a finished standalone tripwire. Its amplifier and feedback value are references to study, not selected McGruber parts or values.

### C1 — Complete separate infrared units

**Study:** [Espen Andersen: Infrared light barrier](https://espenandersen.no/light-barrier/) · [GitHub schematics, KiCad files and parts lists](https://github.com/espena/light-barrier).

- **Learn:** Recognizable blinking patterns, separate transmitter/receiver circuits, adjustment, stripboard prototyping, enclosures and longer-duration trials.
- **Original ingredients:** TSAL6100 IR emitter, VS1838 receiver, four TLC555 timers across the two units, transistors and supporting parts. The author describes 38 kHz carrier modulation with an approximately 10 Hz envelope.
- **Our study task:** Follow both schematics and explain how the receiver recognizes the transmitted pattern; study the author's progression from prototype to installed units.
- **Boundary:** The original garage-door interface is not our silent warning-LED output. The author reports trials; we have not reproduced them. Use this as a learning reference, not a replacement for certified door-safety equipment.
- **Reuse:** The repository is GPL-3.0. Preserve attribution and applicable license obligations if adapting or redistributing its design files; link to third-party files rather than copying them into McGruber by default.

### C2 — Recognizing a specific infrared pulse frequency

**Study:** [EDN / Extreme Circuits: Infra-red Light Barrier Using 555](https://www.edn.com/infra-red-light-barrier-using-555/).

- **Learn:** Pulsed transmission, photodiode amplification and LM567/NE567 tone detection. The article includes transmitter/receiver diagrams and an alignment procedure.
- **Original ingredients:** 555 timers, IR emitter, photodiode, transistor amplifier, LM567/NE567 detector, supporting parts and an audible alarm output. Its carrier is approximately 4.5 kHz, not C1's 38 kHz.
- **Our study task:** Trace what changes when the transmitted pulses disappear; study alignment and receiver restart checks.
- **Boundary:** Its buzzer output needs a separately checked silent-indicator adaptation. Published adjustment instructions do not guarantee a range for our components. Do not combine its frequency-dependent values with C1 indiscriminately.

### Recommended study order and experiment records

Start with **B1 single transistor → B1 two transistors → B2 warning-light behavior**. Use B3 to understand the measurements and gain tradeoffs. For C, study C1 as the complete-build reference and C2 as an alternative detection method.

Before physical reproduction, record the source figure/version, exact parts and package views, verified supply, proposed substitutions, sensor bias mode, mounting/connection method, expected behavior and pass/fail criteria. During testing, record actual distance, room lighting, supply voltage and light-on/blocked/restored readings. Preserve failed and inconclusive results. The no-breadboard preference remains: source breadboard illustrations must not be presented as a verified McGruber direct-wire layout.

Link observations to the [visible-tripwire test log](../projects/01-light-beam-tripwire/TEST_LOG.csv) or [IR-tripwire test log](../projects/08-infrared-tripwire/TEST_LOG.csv). Reading a study or marking it reviewed never changes a hardware test to passed.
