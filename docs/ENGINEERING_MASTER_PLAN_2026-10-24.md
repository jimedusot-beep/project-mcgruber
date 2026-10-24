# McGruber — electrical, electronics and mechanical engineering master plan

**Revision:** ENG-2026-10-24-A · **Date:** 2026-10-24  
**Owner objective:** $0-first, salvaged equipment first, beginner-readable engineering, silent game devices first. Nine tracked inventions.  
**Evidence standard:** **Owned** ≠ **identified** ≠ **measured** ≠ **assembled** ≠ **demonstrated** ≠ **qualified**. Photos and model markings are observations, not circuit ratings. Every design must have a reproducible revision, measured test and failure notes. A screenshot or computer simulation is not physical verification.

## Executive audit — what can actually be completed now?

| Priority | Invention | Owned/reported starting pieces | Initial useful test possible now | Critical unverified or missing item | Qualification / next gate |
| --- | --- | --- | --- | --- | --- |
| A | **01 Visible light tripwire** | Working red/blue emitters, iPhone camera app; red LED as experimental detector; 9V snaps, 2N4401/2N4403, resistors, Fluke, clips | Phone-only beam detector **owner-reported working** through nominal 15 ft; bench LED receiver DC mV experiment; 2N4401 switching experiment | **No measured, automatically switching standalone photoreceiver**; amplifier/comparator/appropriate phototransistor still unidentified; emitter electrical current and actual 15-ft standalone performance unverified | Power audit → DC light/dark data → receiver interface → no-phone indicator → measured distances → 30/30 and 15-minute soak |
| A | **04 Object-removal alarm** | Mouse-button microswitches/keyboard contacts, resistors, LED, 9V + snap | Power-OFF continuity identify a COM/NC switch; short LED indicator test | Exact switch contact map and rating, mounting geometry, current measurements | 20 press/release cycles and false trips; safe indicator current |
| A | **03 Pop-up surprise box** | Cardboard/box materials, springs/hinges may be salvaged | Purely mechanical low-force prototype | Dimensions, controlled latch, structural strength, and safe release | 20 safe, consistent, jam-free manual cycles |
| B | **07 Standalone control box (SILENT revision)** | 2N4401 NPN switch, mouse buttons, LEDs, 9V snaps, leads | Manual switch → red status LED, no sound needed | Verified low-voltage supply, enclosure, switch ratings, and reliable sensor-trigger input | 20 cycles; electrical current, polarity and shutoff documented |
| B | **06 Mouse-powered gadgets** | Mouse #1/#2 optical boards, buttons, wheels, enclosures | Map released/pressed contact continuity; mechanical mouse-wheel switch | Exact optical IC models/pinouts; MCU required for digital motion processing | Ten meaningful switch events; separate advanced optical protocol research |
| C | **02 Motion prank** | iPhone camera and prototype software; Acer historically available but not part of no-computer target | Camera-motion prototype if device permitted; mechanical contact trigger alternative | Standalone PIR/motion module not identified; sound output intentionally optional | Reliable sensor events; no people recording without permission |
| C | **05 Wireless clicker** | 433 MHz-labeled key fob, batteries, switch hardware | Power/battery inspection, observe indicator | Matching, documented RF receiver/decoder and legal RF parameters not confirmed | Paired receive event per intended button, no guessed protocol bytes |
| C | **08 Invisible IR tripwire** | Amazon remote R-NZ candidate IR emitter; other indicators | Verify actual IR emission with a compatible camera; remote sends bursts | Matched continuously suitable IR emitter + receiver, optics, modulation/demodulation and output interface | Optical pair independently detects interruptions at defined distance |
| D | **09 Talking / moving robot** | Elmo donor, wires, switches and salvage motors possibly | Identify safe mechanical degrees of freedom and actual motor/speaker ratings | Motor driver/protection, independent controller, validated actuators and battery/power details; audio deferred | One bounded safe motion with stops and 20 cycles, then add sound only if requested |

**Do not claim that the nine projects are finished.** The word “close” above means bench experiments are feasible, not that physical builds have passed.

## Physical inventory cross-reference (23 photo-documented records)

- #23 loose colored LEDs: emitters, visible warning indicators; a separate **unpowered** LED can act as an experimental photodiode. The red LED's response to blue light is owner-reported; repeatable **DC** measurements and sensor current have not been logged.
- #16 semiconductor bag: photographed **2N4401 NPN** and likely **2N4403 PNP**, TO-220 body not identified, electrolytic capacitors marked 10 µF 25 V, other 3-legged parts still uncharacterized. No verified LM393, LM358 or phototransistor in photos.
- #19 axial resistors/capacitors: usable only **after measured resistance and power rating**; brown–black–red–gold is a typical 1 kΩ four-band pattern, but use Fluke reading.
- #22 clip leads, switches, connectors: non-solder test wiring; too many exposed clips short small transistor legs. Short insulated wire extensions/twist-splice-and-insulate on a hard nonflammable surface; no tugging on semiconductor leads.
- #20 circular three-cell holder: cell format and wiring unknown; not a proven 4.5V supply until measured.
- **Two actual 9V alkaline batteries and snap lead** subsequently photographed; both blue board LED and red independent LED observed illuminated. Current limiting was **not established** in photo. Never infer LED safety from illumination.
- #14 **Color Organ** red bare PCB: not a power-distribution or ready-made tripwire board; blue terminal is associated with the original audio board design. Do not apply 9V to unknown tracks or assume populated LED footprints.
- #15 **Round 16** bare white PCB: footprints only; no working LED driver.
- #7/#8 optical mice: surface-imaging sensors are not automatically 15-ft detectors. Their small mechanical switches, shells and lenses are easier salvage candidates.
- #10 Amazon Fire R-NZ remote: an IR transmitter is plausible but unverified; #12 is its detached keypad, not an additional remote.
- #3 sealed HyperGear solar USB power bank: 5V output and flashlight can be tested intact; lithium/solar circuitry stays sealed.
- Phone and Fluke are **tools and intermediate experiments**; do not assume they belong in the final self-contained unit.

Use [full photo-derived inventory](../component-bank/MASTER_INVENTORY.md) and [existing equipment reports](EXISTING_EQUIPMENT.md); avoid adding overlapping stock counts.

## Reusable engineering building blocks and interfaces

\`\`\`text
LOW-VOLTAGE SOURCE -> protected power rail
OPTICAL / CONTACT / MOTION / RF INPUT -> sensor signal (measured)
SIGNAL CONDITIONING -> threshold + hysteresis / debounce / logic inversion
OUTPUT DRIVER -> current-limited STATUS LED (silent)
MECHANICAL -> aligned enclosure + wire strain relief + access to switch/battery
TEST EVIDENCE -> logged nominal voltage, current, pin map, layout, trials, failures
\`\`\`

**Each interface must specify:** supply min/max, polarity, max current, signal level HIGH/LOW in volts and active polarity, resistor/driver ratings, connector and pin orientation, ground reference, optical spectral match/ambient limitations, response time, and enclosure clearance. A piezo sounder or motor is *not* a drop-in replacement for an LED.

## Release gates required for every physical design

0. **Safety:** disconnect sources; inspect shorts, damaged cells, sharp parts, trip hazards; no exposed mains, opened lithium pack, unverified IR laser or hazardous material.
1. **Identify:** photograph part number and package from multiple sides; obtain the exact manufacturer's datasheet; distinguish onsemi/NXP 2N4401 pin arrangements.
2. **Electrical measure:** Fluke verified with shorted probes near zero; resistance/continuity only power-OFF; measure loaded source volts, resistor volts, calculated LED/motor current; never set meter to A mode across a battery.
3. **Prototype single subsystem:** one source, one limited-current LED; then one proven sensor; then transistor as isolated switch; then amplifier/threshold. Do not power an unknown PCB.
4. **Pin-level schematic:** named nets, numbered connectors, manufacturer/package orientation, V and I budgets, polarity, decoupling and correct pull-ups/flyback where needed; mark concept diagrams separately.
5. **Qualify in context:** log ten repeatable intended operations without extra events; extend to 20–30 and idle soak per project. Test ambient, vibration, battery aging, failure-to-start and restart.
6. **Mechanical release:** dimensioned housing, access, insulation, strain relief and stable clamps, no exposed conductive ends, no wires across a walkway.
7. **Documentation:** actual photo with consent, component-source links, measured notes, failures, schematic rev and stored build log. Software unit tests cannot substitute for hardware.
8. **Hand-off:** archived source/schematic, as-built BOM, version, safe operating instructions and regression tests.

**Device readiness:** D0 concept → D1 parts photographed → D2 part numbers + measured source → D3 one subsystem demonstrated → D4 closed-loop device tested → D5 mounted and qualified. Stages D4/D5 are **NOT established** for a no-phone McGruber tripwire.

## Tripwire engineering: detailed electrical sequence

1. **Freeze known-good emitter.** The present blue/red 9V assemblies were photographed illuminated, but the NightFire traces and current limiting were not measured. Remove 9V snap while wiring. Use a *separate* verified ~1 kΩ/¼ W resistor in series with each *ordinary* 9V-powered visible LED. This is a conservative example, not proof of a particular LED rating. Measure resistor voltage; calculate \`I_LED = V_resistor/R_series\`. Never replace it with 150 Ω on an unknown LED.
2. **Receiver characterization.** Keep spare red LED connected **only** to Fluke in DC mV. Black COM, red V/Ω. Fixed blue source and short 1–3-inch spacing. Collect 10 A/B/A values (blue ON / blocked / restored), with no probe motion, include ambient lamp and dark cup/shield. Log values even if zero/drifting. The earlier 8.1–11 mV **AC** range is not proof of DC optical sensitivity.
3. **Sensor current & loading.** A loose LED's DC voltage at the meter is a **loaded measurement**. The Fluke DC mV input is >1 MΩ, not infinite (DC V input >10 MΩ), so the reading is not a guaranteed open-circuit signal. A receiver circuit connected later will load the device differently. Do not infer enough switching current from mV alone.
4. **2N4401 manual switching bench** (separate from the optical detector): identified manufacturer-specific E/B/C; 9V+ → verified 1 kΩ → alert LED anode → LED cathode → collector; emitter → battery minus; base via 10 kΩ → **momentary 9V positive**, optionally 100 kΩ base-to-emitter for definite OFF. OFF when disconnected, ON when touching the *resistor's free end*, three successful cycles. This proves only the NPN driver and alert LED.
5. **Actual optical signal-conditioning design.** A 2N4401 base typically requires ~0.6–0.8 V forward bias, far above a few mV of experimental sensor contrast. Need **identified light sensor + suitable high-impedance amplifier/current-to-voltage conversion, stable reference, comparator or threshold switch with hysteresis**, and transistor output driver. Choose verified IC supply compatibility, input common-mode, output type (e.g. LM393 is open collector, needs pull-up), pinout and resistors only after measurements. A transistor-only amplifier remains a hypothesis until tested.
6. **State behavior:** lit beam => warning OFF; blocked beam => warning ON; beam restored => OFF; emitter disconnected should be treated as interrupted rather than “safe”; source or receiver dead must be evident. Add manual arm/disable only after switch path is proven.
7. **Optics:** separate emitter/receiver stations; small black paper tubes can reduce stray light, **but cannot focus a normal LED into a laser or glowing line**. Do not assume visible beam in air, mirror return, 15-ft sensor range or coded light compatibility.
8. **Bench-to-doorway:** prove at 1–3 inches before inches→feet testing. At each measured separation do 10 physical block/unblock cycles plus 2-minute clear beam. For final target, aim 30/30 with zero duplicates/misses and 15-minute false-alert-free period under recorded lighting. Log lowest reliable distance, not a guessed 15-ft success.

**Verification blocker:** A definite pin-level standalone optical receiver schematic cannot be released until the exact sensor and high-impedance amplifier/comparator (or another thoroughly measured circuit) are identified. The stocked two transistors are useful, **not sufficient evidence of a complete optical receiver**. See [Standalone Receiver Lab](../web/public/beam-detector/standalone-lab.html).

## Electrical engineering fundamentals to learn while building

| Concept | Physical exercise | What to record |
| --- | --- | --- |
| Voltage/current/resistance (Ohm's law) | battery → resistor → LED, measure voltage across resistor | \`I=(V_supply − V_LED)/R\` estimate vs measured \`V_R/R\` |
| Series, parallel, polarity | trace emitter + resistor + return path | wiring sketch and actual node measurements |
| Measurement input loading | same red receiver LED measured on DC mV then DC V | meter mode and actual light/dark values |
| Mechanical switches, NO/NC | mouse button continuity power OFF | pressed/released truth table |
| NPN/PNP transistor, junctions | Fluke diode test + 2N4401 manual switch | real maker/pin orientation, ON/OFF cycles |
| Amplifiers and bias | photodiode/phototransistor signal conversion | voltage/current vs light intensity, load |
| Comparator, hysteresis, noise | threshold changes under room lights | thresholds, oscillation/false trip count |
| Power budget | measure V and current for modules | battery capacity/runtimes are estimates until tested |
| Safety & tolerances | switch open/short test, battery replacement | failure modes and shutdown behavior |
| Mechanical alignment | repeat 10 crossings fixed beam geometry | distance, positioning notes, enclosure dimensions |

## Missing tools and components: do not invent purchases

- **Useful owned:** Fluke 15B+, 9V snaps, wire cutters/pliers, soldering iron (optional), clip leads, resistors, visible LEDs, two identifiable transistors, mouse switches.
- **Unconfirmed convenience tools:** solderless breadboard, isolated low-voltage bench supply with current limit, precision small clips, oscilloscope/logic analyzer. These would ease work, **not automatically required** for initial manual circuits.
- **Blocking component for optical autonomy:** measured sensitive receiver plus signal-conditioning/comparator solution (may be found in #16 after identification, or may require sourcing); proper power-compatible resistor network, pull-up/feedback.
- **Blocking component for invisible IR:** genuinely matched IR transmitter/receiver pair and known detection protocol. Remote bursts are not automatically continuous beams.
- **Blocking component for 433MHz clicker:** compatible documented RF receiving and decode hardware.
- **Blocking motion-only autonomous build:** identified PIR or equivalent motion detector; mouse contact/tilt switch can provide a *different* activation mechanism, not the same detection coverage.
- **Blocking robot motion:** identified motor, correct driver, flyback suppression, supply/current headroom and end-stop mechanics.
- **Optional sound:** buzzer/speaker deferred for the current silent user requirements.

Check donated and salvaged options before ordering. A part that shares a shape, voltage label or color is **not** interchangeable without identification.

## Key reference sources (manufacturer/tutorial; not confirmations of owned hardware)

- [onsemi 2N4401 datasheet](https://www.onsemi.com/download/data-sheet/pdf/2n4401-d.pdf), [NXP 2N4401 alternative package pinning](https://media.digikey.com/pdf/Data%20Sheets/NXP%20PDFs/2N4401.pdf) — verify actual manufacturer orientation.
- [Fluke 15B+ published functions/input impedance](https://www.fluke.com/en-us/product/electrical-testing/digital-multimeters/fluke-15b-plus).
- [Analog Devices: photodiode conditioning and transimpedance limitations](https://www.analog.com/en/resources/analog-dialogue/articles/programmable-gain-transimpedance-amplifiers.html).
- [TI comparator hysteresis reference](https://www.ti.com/tool/CIRCUIT060073).
- [SparkFun LED current limiting](https://learn.sparkfun.com/tutorials/voltage-current-resistance-and-ohms-law/an-ohms-law-experiment).
- [Adafruit paired break-beam architecture](https://learn.adafruit.com/ir-breakbeam-sensors).
- [McGruber current photo-derived inventory](../component-bank/MASTER_INVENTORY.md).

## Evidence template for each new run

\`\`\`text
Date/time/local lighting:
Project & physical rev; exact sender/sensor/driver models:
Exact source/battery, measured open voltage and voltage while loaded:
Resistors: labeled + measured Ω, LED V, resistor V, calculated mA:
Fluke input mode and leads; orientation and actual pinout source:
Optical distance inches/ft; sensor dark / light / restored DC mV:
Switch/comparator thresholds; physical wiring photo:
Expected vs observed transitions (successes / misses / double counts):
Idle time and false counts; alignment and environmental changes:
Failure details, fix, and retest record:
Evidence: OWNER-REPORTED / measured logs / external independent reproduction:
Next go/no-go gate:
\`\`\`

*This master plan documents engineering requirements; it does not convert unbuilt prototypes into verified inventions.*