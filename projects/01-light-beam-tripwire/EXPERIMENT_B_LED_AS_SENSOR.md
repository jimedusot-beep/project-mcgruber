# Experiment B — Blue LED → red LED photodetector → silent warning LED

**Revision:** B-2026-10-25 · **Status:** RESEARCH-BACKED, HARDWARE NOT COMPLETED · **Audio:** NONE.

**Objective:** an independent, entirely low-voltage, no-phone, no-computer tripwire. Keep a **blue visible LED as the emitter**, a **second UNPOWERED red LED as the detector**, and a **third correctly limited warning LED** which is OFF with beam present and ON when blocked. The detector LED must NOT be connected to the emitter's battery in forward-emission mode.

## Real experiments and provenance

1. [Analog Devices — ADALM2000: An LED as a Light Sensor](https://www.analog.com/en/resources/analog-dialogue/studentzone/studentzone-january-2023.html) provides breadboard single-NPN and **two-NPN Darlington** photodiode signal amplifiers, parts lists and explanations. It explicitly describes red LEDs responding to higher-energy blue light. Its Darlington stage is a **light detector**, not automatically a light-LOSS alarm; the final stage needs inversion/thresholding.
2. [Analog Devices lab wiki: LED light sensor](https://wiki.analog.com/university/courses/electronics/electronics-lab-led-sensor) provides collector-signal and amplifier-gain exercises. The demonstrated **2N3904** pair is not proof of the exact package pinout or quantity of the owner's **2N4401** stock.
3. [Codrey Electronics — The LED Photodiode Trick](https://www.codrey.com/electronics/the-led-photodiode-trick/) documents a real breadboard **LM358 dark detector** using an IR LED as the photosensor, and a less sensitive yellow LED substitution. It demonstrates the signal-chain principle. **Do not copy its infrared sensor performance rating onto the owner's red LED.**
4. [Analog Devices signal-chain explanation](https://www.analog.com/en/resources/analog-dialogue/studentzone/studentzone-january-2023.html) shows why a photodiode generates tiny photocurrent; a few measured millivolts at a Fluke input do **not** mean a red LED can directly drive the base of an NPN transistor.

These are externally documented experiments, **not evidence that this McGruber assembly works**.

## What is actually available vs missing

| Part | Quantity | Evidence and purpose |
| --- | --- | --- |
| Blue LED emitter | 1 | Owner photographed it lit, #23 inventory. Exact current, wavelength and optical power not measured |
| 9 V supply + snap | 1 | Owner photographed; **never** connect directly across loose LEDs |
| Measured series resistor (1 kΩ illustrative starting point) | 1 | #19 resistor category; measure actual resistance with Fluke **power OFF** |
| Spare red LED used as *unpowered* photodetector | 1 | #23; keep separate from warning LED |
| Fluke 15B+ and insulated test leads | 1 set | Owned/reported; DC millivolts on receiver, DC volts on power, ohms only when unpowered |
| 2N4401 plus resistor(s) for output stage | 1 | Marking photographed. Actual vendor package E/B/C orientation **must be verified** |
| Separate red warning LED + its own limiting resistor | 1 each | #23 and #19, conditional on real ratings |
| **High-impedance amplifier/switching interface and repeatable threshold** | 1 design | **CRITICAL OPEN GAP** — no identified LM358, comparator, phototransistor or verified automatic circuit in inventory |
| Optional dark card tube, solid mounts and label tape | as needed | Helps reject room light; dimensions remain unmeasured |

A second NPN for the Analog Devices Darlington example is **not confirmed owned**. An LM358 dual op-amp or appropriately designed photodiode amplifier/comparator is a *candidate*, not a confirmed acquired part. A phototransistor/LDR could simplify the functional build, but changes this experimental **LED-as-detector** design.

## Stage 1 — establish a safe blue transmitter

1. Use a dry worktop. Power OFF; measure one resistor at roughly 1 kΩ in **ohms mode** and verify battery output polarity separately in **DC volts**. Record both.
2. For an ordinary low-power blue indicator LED only, a 9 V battery and verified 1 kΩ series resistor give a *calculated starting current* `(9 V − 3 V)/1000 Ω ≈ 6 mA` if the real blue forward voltage is around 3 V. The actual source voltage, LED forward drop and current must be measured before calling it safe for extended use.
3. Connect with battery disconnected: **battery + → 1 kΩ → blue LED anode → blue LED cathode → battery −**. Never rely on empty NightFire PCB traces as the limiter, bypass the resistor or place clips where they can short.
4. Power ON briefly and measure the voltage across the resistor in DC-voltage mode. `I_LED = V_resistor / R`. Unplug if anything warms, flickers abnormally, or the measured value is out of the known LED rating.
5. Aim the low-power visible LED **below eye height** at the unpowered red sensing LED from 1–3 inches initially. Do not use a laser.

**Gate B1:** verified emitter polarity, resistor, source voltage and current are written in the log. A photographed glowing LED alone is not enough.

## Stage 2 — characterize the red LED *as a sensor*, not an output

**Do NOT apply a supply or connect a transistor base yet.**

1. Leave the receiver red LED completely separate from power. Connect its two leads **only** to Fluke COM and V/Ω, select **DC mV**; note sign and physical lead orientation. If the sign is negative, document it rather than treating it as failure.
2. Fix the alignment and distance, and shield the sensor from side illumination with black card. Avoid moving the meter probes during a trial.
3. For each of **10 repetitions**, record **blue ON → blue blocked with opaque card → blue restored**. Record ON_mV, BLOCKED_mV and RESTORED_mV at the same geometry; allow meter readings to stabilize. Record room-light conditions and any drift separately.
4. Compare signed `ON − BLOCKED` contrast and the restored level against the previous ON. Record the sign consistently; trial numbers matter more than a lucky peak.
5. Repeat a short set with room light ON and OFF. If the sign flips or the contrast is comparable to probe drift/noise, the light sensor is **not qualified** even if a single reading changes.

Use [ten-row unfilled receiver log](EXPERIMENT_B_MEASUREMENTS.csv) and the [engineering checks worksheet](../../web/public/beam-detector/engineering-checks.html). Never infer a 6–15-foot optical range from a 1–3-inch Fluke test.

**Gate B2:** the same polarity of light/block contrast is present in most repeated trials, restored readings return near the starting level, and signal/noise margin is adequate for designing the threshold. No unmeasured number is a pass.

## Stage 3 — prove the warning LED and 2N4401 *independently*

**This does NOT connect the weak photodiode signal to the output stage.**

1. Read and verify the manufacturer-specific **2N4401 base/collector/emitter pins** using the datasheet, package orientation and Fluke diode mode. The 2N4403 PNP is **not** a drop-in replacement.
**Manufacturer pinout conflict from real datasheets:** [onsemi 2N4401](https://www.onsemi.com/pdf/datasheet/2n4401-d.pdf) numbers its TO-92 device **1=emitter, 2=base, 3=collector**, whereas [NXP/Philips 2N4401](https://media.digikey.com/pdf/Data%20Sheets/NXP%20PDFs/2N4401.pdf) lists **1=collector, 2=base, 3=emitter**. The exact manufacturer's device marking and package view must be identified: **never** treat the label *2N4401* or a stock photo alone as a universal left-to-right pinout. If the manufacturer is unknown, stop at diode-mode identification and do not power the transistor stage.

2. With power OFF, for a verified 9 V supply and ordinary indicator LED, prototype:
   `+9 V → measured 1 kΩ → warning LED anode → LED cathode → 2N4401 C; 2N4401 E → 0 V; 2N4401 B → measured 10 kΩ → loose insulated test lead`.
3. Touch the *resistor-side* test lead briefly to +9 V, and release it. The warning LED should illuminate on touch and go out when the lead is removed. With a suitable pull-down (e.g. identified 100 kΩ) a well-defined OFF state is easier to maintain. Never let an uninsulated loose base lead short collector or emitter.
4. Repeat three ON/OFF cycles; log current limiting, supply reading and actual pin identification. This proves only the transistor output stage.

## Stage 4 — engineering gate for the missing amplifier + darkness comparator

```text
BLUE LED + its own safe power  --- visible blue light --->  RED LED, UNPOWERED
                                                        weak photocurrent
                                                              |
                                               HIGH-IMPEDANCE AMPLIFIER
                                               (actual topology/parts pending)
                                                              |
                                               THRESHOLD + HYSTERESIS
                                               (threshold from measured contrast)
                                                              |
                                               2N4401 output transistor
                                                              |
                                               CURRENT-LIMITED RED WARNING LED
                                               (ON only when light is blocked)
```

**A bare few-mV sensor cannot be joined directly to a normal 2N4401 base** (typical forward base-emitter voltage is hundreds of millivolts). The Analog Devices one- and two-NPN circuits confirm photodetection; on their own they can **switch on in light**, the opposite of the requested beam-break output. A final inverter/comparator output is needed.

**Candidate paths after measurements:**
- High-impedance **transimpedance amplifier + threshold circuit**, potentially a dual op-amp such as a **verified LM358 design** operating from a correctly chosen regulated supply, with component values based on actual sensor photocurrent, common-mode range, noise and output drive.
- A two-NPN Darlington light-detection demonstration **if a second correctly identified NPN exists**, followed by measured polarity inversion and a current-limited 2N4401 output stage.
- If B2 is consistently too weak: replace the *receiver only* with a properly specified photodiode/phototransistor module, keeping the blue transmitter, visible optical crossing and silent LED warning; record it as a different B variant, not as proof the red LED detector worked.

**DO NOT infer** precise op-amp pins, gain resistors, operating distance, comparator polarity, or a functioning automatic switch from the tutorial diagrams. Only author a pin-level production schematic after the exact actual front-end part and ten readings exist.

## Final pass criteria (not yet achieved)

- Automatic light-present = **warning LED OFF**; blocked = **warning LED ON**; restored = OFF **without touching a lead or switch**.
- 10/10 initially at close range, then 30/30 across the intended mounting span, zero false trips for 15 minutes, with daylight/room-light checks.
- Both sides use their own suitable low-voltage supply; no phone, laptop, IR laser, buzzer, or speaker is required.
- Log every failure; state is **UNVERIFIED** until the owner physically confirms it. The warning LED is a supervised-game indicator, not a certified intrusion/safety alarm.

[Back to P01](README.md) · [B recorded measurements](EXPERIMENT_B_MEASUREMENTS.csv) · [Full engineering master plan](../../docs/ENGINEERING_MASTER_PLAN_2026-10-24.md).
