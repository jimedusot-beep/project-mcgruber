# McGruber visible light tripwire — actual build sequence

**Two separate tracks:** (1) phone camera detector is **owner-reported working**, up to nominal 15 ft; (2) standalone red-LED-based receiver is **NOT yet working automatically**. The latter is our current objective, without laptop or sound.

## First: read the full guides

- [Engineering plan for all nine McGruber inventions](../../docs/ENGINEERING_MASTER_PLAN_2026-10-24.md)
- [Electronics engineering beginner field guide](../../docs/ELECTRONICS_ENGINEERING_FIELD_GUIDE.md)
- [Detailed circuit blocks with unverified parts explicitly marked](CIRCUIT.md)
- [Interactive standalone receiver lab: stage-by-stage test](../../web/public/beam-detector/standalone-lab.html)
- [Engineering hub: owned materials / missing elements](../../web/public/beam-detector/engineering-hub.html)
- [As-built / required bill of materials](BOM.csv)

## Specific stages, in order

1. **Safe table, power off.** Keep LED circuits away from cloth bedding. Inspect both 9V snap leads for shorts and establish polarity using Fluke DC V.
2. **Verify 9V emitter**. Current-limited blue emitter (measured ~1 kΩ resistor in series); do **not** assume NightFire PCB resistors are populated. Measure series resistor voltage for current.
3. **Measure optical receiver**. Unpowered spare red LED to Fluke DC mV only. Measure fixed blue ON, blocked, ON; ten repeats plus room lighting notes; stop if readings just drift.
4. **Map transistor pins**. Label specific 2N4401 E/B/C based on actual manufacturer orientation and Fluke diode mode. Leave PNP 2N4403 untouched for now.
5. **Manual switching proof**. 9V+ → 1 kΩ → third status LED → 2N4401 collector → emitter → 9V−. Base controlled by a **10 kΩ** resistor briefly touching 9V+. Must switch ON and OFF three times without shorts.
6. **Find/design optical interface** (currently **BLOCKED by unverified parts**). Identify a real sensitive photodetector and the necessary analog amplifier, comparator/reference/hysteresis or other measured circuit topology. No exact unverified chip pinout, no direct 9V to sensor.
7. **Automatic block detector**. Integrate sender and independent powered receiver; warning LED must change **without hands operating a switch**; test short distance first.
8. **Stretch range**. Try 3, 6, 12 inches then 3, 6, 10, 15 feet, only advance on 10/10 successes and two-minute no-false-trip period.
9. **Mechanical fit**. Insulating housings, short dark tubes, safe beam level, rigid mount, lead protection and wire strain relief.
10. **Final qualification**. 30/30 beam interruptions (one count each), 15-minute idle false-alarm test, battery restart/recovery and actual light/dark/power measurements. No phone or laptop.

## Immediate physical next steps

Complete **1–5** before doing optical amplification. Don't buy a matched receiver until searching your existing #16 bag, other salvage and donor options for properly identified components. When an interface part is identified, update [CIRCUIT.md](CIRCUIT.md) with a **real pin-level schematic and values based on sensor measurements**.

## Present evidence and risks

- User showed an illuminated blue LED on unpopulated NightFire red Color Organ PCB and separate red LED powered by 9V; **neither current limit was established from the photo**.
- User reported Fluke probes shorting to zero; an AC mV range of approximately 8.1–11.0 mV was described; later user reported blue-light receiver testing “working” but **did not provide a controlled DC ON/BLOCKED/RESTORED dataset**.
- 2N4401 / 2N4403 markings appear in photos. Pinouts vary between manufacturing datasheets and package views; diagrams made from generative images are **not verified wiring**.
- Exact signal amplifier/comparator and dedicated phototransistor/LDR are **not positively confirmed owned**; finished receiver cannot be promised from currently identified stock.

## Pass rule

Treat an owner's measured/photographed observation as an **OWNER-REPORTED test** with date, distance, resistor and supply measurements. Treat planned wiring, simulation and stock-image examples as **PROPOSED**. Only physically repeated tests count toward completed no-phone hardware.

[Blank test log](TEST_LOG.csv) · [October 23 owner report](FIELD_TEST_2026-10-23.md) · [Safe measurement procedure](../../docs/MEASUREMENT_PROTOCOL.md).
