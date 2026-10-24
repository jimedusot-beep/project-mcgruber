# Electronics engineering field guide for McGruber

**Edition:** 2026-10-24 / ENG-TRAIN-A  
**Applies to:** all nine McGruber inventions. **Scope:** battery-operated, low-voltage family-safe prototypes. Start with **silent status LEDs**; audio and motor outputs are later optional modules.

## Skills map: what to learn and why

| Lab | Engineering skill | Hands-on exercise using existing components | Gate |
| --- | --- | --- | --- |
| 1 | Reading circuits and identifying polarity | Sort 9V snap (+ red, − black only after checking), LED anode/cathode, safe insulation | Draw the actual complete series path without guessed board traces |
| 2 | Safe meter use | Probe tips shorted: Fluke DC mV near 0; then diode/ohm with all power off; DC voltage while powered | Record meter jacks, range, measured vs expected |
| 3 | Ohm's law/current budget | 9V -> measured 1 kΩ -> low-current visible LED | Measured voltage across resistor and calculated I, no excess heating |
| 4 | Switch topology | Release/press a mouse microswitch with COM/NO/NC continuity | Truth table, ten events |
| 5 | Transistor fundamentals | Identify 2N4401 NPN via package/datasheet and Fluke diode behavior | Confirm E/B/C, turn status LED on by biasing base through 10 kΩ |
| 6 | Weak analog sensing | Unpowered red LED detects blue LED (photovoltaic experiment) | Ten DC mV A/B/A observations at fixed geometry, not drifting arbitrary AC |
| 7 | Amplification / threshold | High impedance photodiode or phototransistor front end, valid comparator supply, adjustable reference | Measured sensor node and controlled output (NOT built yet) |
| 8 | Noise / hysteresis / debounce | Disturb room lights and slowly block sensor | No rapid flicker near threshold; intentional light-loss detection |
| 9 | Actuator drivers | Driver for a correctly identified low-voltage motor, inductive suppression and end stops | Current under load, no stalls, thermal checks |
| 10 | Mechanical / engineering release | Stable enclosure, strain relief, actual wire path, measured spacing | 20–30 repeats, idle false-trigger test and as-built package |

## The six electrical quantities you must record

1. **Supply voltage** \(V_S\) in DC volts, unloaded and loaded; two different numbers may appear because cells sag under load.
2. **Resistance** \(R\) in ohms, **power off**, component preferably isolated from parallel circuitry.
3. **Voltage drop across resistor** \(V_R\) with LED powered; \(I_{\mathrm{branch}} = V_R / R\) in amperes, or \(1000 V_R/R\) in mA.
4. **LED forward voltage** \(V_F\) with current flowing, leads in COM and V/Ω. Never short LED directly to battery.
5. **Available source current** and estimated consumption of sensor, comparator, LED driver and regulators; a 9V block battery is poor for sustained high current or motors.
6. **Sensor output** in dark/light, with exact meter mode, measurement input impedance, light color, spacing, environment and repeatability.

### Worked 9V example — NOT the measured user's actual LED

Assume a measured 9.0 V alkaline source, an ordinary red indicator LED dropping around 2.0 V, and a measured 1 kΩ resistor.

- Estimated current \(I=(9-2)/1000=0.007 \mathrm{A}=7 \mathrm{mA}\).
- Resistor dissipation \(P_R = I^2 R \approx 0.049 \mathrm{W}\). A sound 1/4 W resistor is sufficient under these **example** assumptions.
- Estimated LED dissipation \(P_{LED}=I V_F\approx 0.014 \mathrm{W}\). LED current and thermal ratings still require manufacturer or documented category validation.
- The resistor may be before or after the LED **as long as it is in the same series loop**. Physical proximity alone does not mean it is in the loop.

**Do not use** the earlier AI illustration showing 150–330 Ω on an unknown bare LED fed by a 9V battery. The red Color Organ board is unpopulated, and the 9V marking on the round board does not authorize direct wiring.

## Fluke 15B+ modes — specific risks

| Measurement | Meter dial/function and leads | Important caution |
| --- | --- | --- |
| Battery voltage | DC V; black COM, red V/Ω | Compare loaded/unloaded and record negative sign if reversed |
| Receiver LED response | DC mV initially; black COM, red V/Ω | DC mV input >1 MΩ and 0.1 mV resolution; open leads can drift. DC V range is >10 MΩ but can hide small changes due to resolution |
| Resistor | Ω; no voltage anywhere | Never measure resistance while a battery is connected |
| LED/transistor junction | Diode mode; no external power | A single direction showing ~0.5–0.8 V is common for a silicon junction. It is not a universal test result |
| Current | Prefer voltage across known series resistor; compute I | Never put current-mode meter across battery; it is essentially a short |
| Switch | Continuity; all batteries/USB unplugged | Record pairs under pressed and released states, not guessed pin functions |

Sources: [Fluke specs](https://www.fluke.com/en-us/product/electrical-testing/digital-multimeters/fluke-15b-plus) (published DC mV vs DC V input impedances).

## Why the 2N4401/2N4403 do not replace a proper receiver

- **2N4401 NPN** can sink current through a warning LED after its base is driven through a resistor. It is **not** a photodiode.
- **2N4403 PNP** provides a complementary high-side role, but is **not** an op amp, a comparator, or a matched optical sensor.
- **Pin caution:** onsemi's TO-92 style-1 schematic labels 1 = emitter, 2 = base, 3 = collector; NXP's separate 2N4401 documentation lists 1 = collector, 2 = base, 3 = emitter. Pin numbering must be associated with exact package view and manufacturer. The small part marking in user's photo may not establish vendor identity. Therefore do not treat a colorized generic illustration as a verified leg assignment.
- **Fluke diode-check method:** with source removed and package verified NPN, red probe on a candidate base may conduct to both other leads with the black probe; reversed generally open. This identifies **base only**, not which other pin is collector/emitter.
- **Manual switch proof:** after pin identity: 9V+ -> measured 1kΩ -> separate warning LED anode -> cathode -> collector; emitter -> 9V−; base -> 10kΩ -> momentary 9V+. If needed, measured 100kΩ from base to emitter. Three ON/OFF events verify the switch, **not** automatic optical sensing.
- **Weak light-sensor interface:** a few mV at the Fluke DC range cannot independently forward-bias NPN base. The planned electronics need light-sensitive semiconductor **and enough signal conversion/gain and a stable threshold** (e.g., measured photo device → high-input-impedance amplifier → comparator with hysteresis → transistor driver). Different photosensors have different spectra and speed. No specific op amp/comparator is yet confirmed owned.

Sources: [onsemi 2N4401](https://www.onsemi.com/download/data-sheet/pdf/2n4401-d.pdf), [NXP 2N4401](https://media.digikey.com/pdf/Data%20Sheets/NXP%20PDFs/2N4401.pdf), [Analog Devices photodiode frontend](https://www.analog.com/en/resources/analog-dialogue/articles/programmable-gain-transimpedance-amplifiers.html).

## Three possible optical receiver engineering routes

**Route A — reuse unpowered red LED (zero new parts experiment).** Measure the actual DC mV blue-illuminated vs dark at a fixed short distance, with shield. Determine whether signal is sufficiently stable *under realistic load*. Requires amplifier/threshold network. Strength: existing stock. Weakness: spectral mismatch or extremely low photocurrent; 15 ft unproven.

**Route B — salvage a genuine phototransistor or LDR if later found.** Phototransistor plus bias resistor may give a conveniently larger voltage swing; still needs ambient rejection, desired polarity and hysteresis. Strength: simpler input than bare LED in some cases. Weakness: no confirmed owned sensor. Do not interpret an optical mouse's tracking IC as plug-in three-lead phototransistor.

**Route C — purpose-built matched break-beam pair (later sourcing only if A/B fail).** Defined receiver signal, known range and wavelength. Usually easiest robust hardware implementation. But matched IR pairs are not owned, and a remote-control IR burst source is not interchangeable with continuous beam transmitter. See [Adafruit breakbeam overview](https://learn.adafruit.com/ir-breakbeam-sensors) for principles (not a substitute for the exact chosen module datasheet).

**Hysteresis:** a single trip voltage near noisy/slowly changing sensor output may oscillate ON/OFF. Design separate light-detected and light-lost thresholds using feedback or a comparator with built-in hysteresis. See [Texas Instruments comparator application](https://www.ti.com/tool/CIRCUIT060073). Exact values depend on measured optical contrast and sensor output circuitry; do not invent threshold values.

## Reliable solder-free build methods

- Use insulated short solid-core jumper wires twisted around individual **unpowered** transistor leads and a little insulating sleeve/tape between legs, so adjacent legs cannot touch. Pull lightly to verify electrical contact; temporary wrap connections can fail from movement.
- Use alligator clips only on safely spaced contacts. Never let one crocodile clip bridge a transistor's adjacent legs.
- Twist/secure each splice, isolate each separately, and strain-relieve the cable bundle at an insulating base. Electrical tape holds insulation better than tensile loads.
- A solderless breadboard (not confirmed owned) would simplify repeated circuits. It is a convenience rather than a new project prerequisite; salvage a suitable insulated terminal strip if its contacts/ratings are verified.
- Once a circuit is reliable and safe, migrate to a verified perfboard or purpose-designed PCB with exact nets; the unpopulated NightFire audio/LED boards aren't generic breadboards.

## Engineering notebook workflow

Every hands-on test should include:
- Project and physical revision and date/time.
- Photo or written physical pin orientation; document actual component label and source.
- Supply name/voltage and switch state; resistor value measured with power off.
- Measurement type (AC/DC V/mV, Ω, diode, continuity), leads, and meter result.
- Ambient light and source color/spacing for optical tests.
- Expected response, observed response, repeats, misses, false trips, recovery and battery condition.
- Either **PASS**, **FAIL**, **BLOCKED**, or **NOT TESTED**, plus reason. Avoid skipping bad readings.

The [Engineering Control Center](../web/public/beam-detector/engineering-hub.html) logs cross-project tests; the [Standalone Receiver Lab](../web/public/beam-detector/standalone-lab.html) logs individual receiver milestones. They currently use separate browser-local storage, not a synchronized cloud lab notebook: export each JSON to keep backups. No application can measure 9V or Fluke data automatically without a compatible connected instrument/interface.

## Mechanical, RF and robotics further research gates

- **Mechanical box:** springs store energy. Favor paper/cardboard low force, soft prop, a stop preventing uncontrolled release, fixed hinges, and 20-cycle jam check.
- **Mouse microswitch:** continuity off/pressed/released; do not assume external switch pins from appearance; series indicator/LED ratings and fast contact bounce considered.
- **RF clicker:** 433 MHz label alone doesn't prove modulation, matching receiver address or compatibility; hardware decoder and measured output needed. No attempt to break into third-party devices.
- **Infrared:** source spectral output invisible and may be unsafe at high power; verify low-power rated parts, alignment, modulation and matching receiver before promising range.
- **Motor:** DC motors draw stall current; a 2N4401 or phone output should not drive an unidentified motor directly. Confirm correct driver, supply, inductive suppression, limit switches/mechanical stops and safe enclosure.
- **Enclosures:** photograph and dimension every piece before CAD/STL manufacturing; physical fit is not proven by a concept render.

## Recommended work order

1. Finish 9V LED resistor/current checks, 2N4401 switch test and 10× DC LED-receiver light/dark logging.
2. Build physical **object-removal switch -> red status LED** as first no-phone autonomous input/output proof; document COM/NC using Fluke.
3. Reuse proven switch module in a **silent control box** with on/off, optional LED status.
4. Validate simple mechanical surprise box.
5. Return to optical independent receiver after identifying needed photosensor/analog parts and designing measured hysteresis.
6. Explore mouse digital optics, RF, IR and robotics only after their part-number and power blockers are resolved.

**Do not fabricate success:** A GitHub commit, photo of LED illuminating, or successful smartphone-camera detection is an important milestone but not a measured, standalone release.
