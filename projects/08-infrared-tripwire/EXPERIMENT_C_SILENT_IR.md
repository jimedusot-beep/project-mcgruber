# Experiment C — invisible IR break-beam → **silent red warning LED**

**Revision:** C-2026-10-25 · **Status:** EXTERNALLY VALIDATED APPROACH; McGruber hardware NOT ACQUIRED/TESTED · **Audio:** NONE.

**Objective:** self-contained, battery/regulated-DC-powered, no-phone/no-laptop optical break detector. The only output is a **visible, current-limited status LED that lights when the IR beam is blocked**. There is no buzzer, relay, speaker, siren, or internet requirement.

This report separates (1) a **specified, reproducible 5 V short-range build**, (2) a longer room/doorway build which needs measured output polarity, and (3) the electronics-research-only remote-control IR salvage route.

## Verified builder references

- [Adafruit's official IR break-beam guide](https://learn.adafruit.com/ir-breakbeam-sensors?view=all) provides matched 3 mm and 5 mm emitter/receiver power wiring, open-collector output, a 10 kΩ pull-up and measured logic states: **beam visible to receiver = HIGH; beam blocked = LOW** (with pull-up).
- [Adafruit 2167, 3 mm](https://www.adafruit.com/product/2167) officially specifies **3.3–5.5 V**, about **25 cm / 10 in**, output sink up to 100 mA.
- [Adafruit 2168, 5 mm](https://www.adafruit.com/product/2168) officially specifies **3.3–5.5 V**, about **50 cm / 20 in**, output sink up to 100 mA. One product contains **one emitter + one receiver pair**; do not purchase two pairs for one beam.
- [DFRobot SEN0523, 5 V IR photoelectric switch](https://www.dfrobot.com/product-2644.html) officially specifies **4 m (~13.1 ft)** range, 0.5 ms response, emitter red=5V / black=GND / green left floating; receiver red=5V / black=GND / blue=OUT. Its **beam-clear/broken logic polarity and actual sink/source behavior must be measured** before attaching the LED output described below; do not assume it matches Adafruit 2168.
- [Vishay 2024 IR light-barrier reference](https://www.vishay.com/docs/49650/pt0402-lightbarriers.pdf) illustrates a proper modulated IR barrier using fixed-gain **TSSP** receivers for 38 kHz signals (a design path if building your own long-range optical pair).
- [Vishay TSSP4038](https://www.vishay.com/docs/82458/tssp4038.pdf) is a 38 kHz light-barrier receiver compatible with **continuous 38 kHz or bursts**. Generic **TSOP television-remote receivers** use AGC tailored for code bursts; they cannot automatically be treated as steady-light tripwire receivers.

All distances above are *vendor stated maxima/typical application ranges*, not McGruber measurements. 4 m is **shorter than 15 ft / 4.57 m**. Never promise a full 15-ft distance without an actual 15-ft-qualified pair and test.

## Route C1 — minimal silent circuit, 5 V Adafruit 2168 or 2167 pair

The vendor's receiving output is an **open-collector transistor which pulls LOW when the beam is blocked**. A properly limited red LED can therefore connect straight from the receiver's regulated +5 V supply **to the output signal wire**; it glows when that transistor sinks current. **No microcontroller or 2N4401 is required** for this module and light-only output.

### Required for the first proof

| Item | Qty | Owner evidence / requirement |
| --- | --- | --- |
| Complete **Adafruit 2168 5 mm IR emitter+receiver pair** (or 2167 for shorter proof) | 1 pair | **NOT confirmed owned**; verify exact model before wiring. Emitter has 2 wires, receiver 3 |
| Regulated **5 V DC source**, with enough current for emitter and receiver | 1–2 | An existing *intact* 5 V USB bank or rated USB supply may work; confirm sustained output / auto-shutoff. Emitter may be separately powered with another suitable supply |
| **10 kΩ** resistor | 1 | Receiver white/yellow signal pulled toward its own **+5 V**; confirm actual value with power OFF |
| **1 kΩ** resistor, suitably rated | 1 | Additional current limiter for warning LED |
| Ordinary **red warning LED** with known polarity/ratings | 1 | Salvaged #23 candidate; do not exceed its current limit |
| Insulated wires, breadboard/cardboard supports, Fluke in V/Ω jacks | as needed | Short-circuit inspection, polarity, alignment and output-voltage tests |
| Manual obstruction card, tape measure and clock | 1 each | Repeatability testing; no acoustic output |

The 2167/2168 *complete rated module* already has its emitter current-limiting driver. **Do not add the loose LED's 1 kΩ series resistor to the purchased transmitter** or power the separate bare IR LED directly from 5 V.

### Exact example wiring — **Adafruit 2168 or 2167 ONLY**, powered by regulated 5 V

**[Open the labeled circuit wiring diagram](diagrams/experiment-c-silent-adafruit-5v.svg)** — separately depicts emitter and receiver, pull-up, 1 kΩ indicator resistor, LED polarity and HIGH/LOW truth table.


```text
SIDE A — IR transmitter                 SIDE B — IR receiver and silent warning
  Adafruit emitter RED  → +5 V          Adafruit receiver RED   → +5 V
  Adafruit emitter BLACK → GND          Adafruit receiver BLACK → GND
                                         Adafruit WHITE/YELLOW  → OUT node
                      invisible IR
               ------ (no signal wire) ------>

  RECEIVER SIDE +5 V ----[10 kΩ pull-up]------------------- OUT node
                      \
                       +--[1 kΩ]-->| RED WARNING LED |---- OUT node
                                     anode         cathode

  RECEIVER SIDE GND ---------------- Adafruit receiver BLACK
```

- The LED **anode** connects to the 1 kΩ resistor from +5 V; its **cathode** connects to the receiver OUT. Do **not** connect the LED straight to 5 V without its resistor.
- With +5 V, roughly 2 V red LED forward drop and 1 kΩ, the indicator branch is **about 3 mA** when OUT is low. This is a *design calculation*, not a measured actual current.
- The 10 kΩ pull-up from OUT to **receiver +5 V** follows the manufacturer's guidance. The receiver's rated output current exceeds the proposed few-mA indication, but actual board and power must be checked.
- **Never connect this 5 V example to a 9 V battery directly.** Keep 5 V module ratings, and meter polarity while power OFF for wiring.
- Emitter and receiver sides may have independent power supplies. There is **no electrical connection between their grounds** if they are optically separated.

### Truth table — source: official Adafruit digital-output guide

| Light path | Receiver OUT with 10k pull-up | Red warning LED | Meaning |
| --- | --- | --- | --- |
| Aligned, unblocked | HIGH, near supply | OFF | Clear |
| Blocked by opaque card | LOW, near ground | ON | Trip |
| Unblocked again | HIGH, near supply | OFF | Restored |
| Receiver unplugged, output lead open | Typically pulled HIGH | OFF | **NOT a certified safe/disconnect state**; unsuitable for security-critical use |

### Practical C1 test order

1. Confirm module markings and wire identity. **Power disconnected** while wiring.
2. Power just the rated IR emitter at **regulated 5 V** as the manufacturer describes. Aim it at the receiver from **2–6 inches**; never look into the IR source. A camera sometimes reveals IR emission but cannot prove optical safety or modulation.
3. Power the receiver at **regulated 5 V**. Connect its **10 kΩ** pull-up. Measure OUT-to-receiver-GND on Fluke **DC volts** with beam aligned, blocked, restored. Expected behavior is HIGH → LOW → HIGH. If opposite/unknown, **stop; do not wire a warning LED yet**.
4. Power OFF. Add the **1 kΩ + red LED** branch from receiver +5 V to OUT. Inspect LED polarity and all clips for shorts.
5. Power ON. Confirm visible warning **OFF → ON → OFF** with a card, without touching the signal wire or software.
6. Repeat **10 crossings** at 6 in, then 10 in (2167) or 20 in (2168) only after passing the closer distance. Do **not** extend beyond each vendor's rated range to claim reliability.
7. For the chosen rig, require **30/30** intentional crossings with one warning per blocked interval, plus **15 minutes** of clear-beam idle time with no false warning. Repeat under different room lighting.
8. Document power failures and restart behavior. A simple open-collector LED demo is **not fail-safe** and should only be used for a supervised game.

Use [IR physical test log](EXPERIMENT_C_MEASUREMENTS.csv). None of these owner bench trials is pre-filled or assumed passed.

## Route C2 — longer room/doorway with **DFRobot SEN0523**, *not* same pin assumptions

- Officially: **5 V**, receiver blue wire OUT, stated **4 m** detection span; estimated product price $11.90 at the manufacturer's listed price when researched (2026-10-25).
- Manufacturer lists transmitter **red=5 V, black=GND, green=float**, receiver **red=5 V, black=GND, blue=OUT**. This is **different from Adafruit's white/yellow OUT** and different electronics entirely.
- First establish **power, supply and OUT response HIGH/LOW or open-collector vs driven** on actual hardware *with Fluke*, at 6 in with beam present/blocked. The product overview doesn't specify enough to safely generalize the complete C1 LED wiring to this different model.
- If OUT is a **current-sinking LOW on break** and the actual output rating permits a ~3 mA load, the 5 V + 1 kΩ + indicator-to-OUT method may apply. If **HIGH on break**, select an identified 2N4401 NPN with a documented base resistor and verified E/B/C pins to drive the LED instead. Do not short a driven module output.
- Aim indoors at 1 ft, 3 ft, 6 ft, 10 ft, finally 13 ft *only after closer passes*. **15 ft (4.57 m) is beyond the published 4 m rating.** Select a longer-rated IR barrier if 15 ft is essential.
- A 5 V USB bank may shut off under small loads. Measure sustained operation or use a properly regulated rated DC source. Do not power SEN0523 directly from 9 V.

## Route C3 — investigate IR salvage from the Amazon remote, no premature build claims

The photographed **R-NZ remote PCB** is a *possible IR transmitter*, not an authenticated paired continuous-light emitter. An ordinary remote typically transmits **short, encoded 38 kHz-modulated bursts only while a button is pressed**, whereas a continuously operating beam must transmit in a way the chosen receiver expects.

1. Identify an **actual IR emitter** visually and through a safe, intact-remote camera check; phone-camera IR filters may hide emissions. Record what is directly observed, not assumed.
2. Identify whether the donor remote is an IR or RF/Bluetooth transmitter. Keypad/PCB markings alone do not prove emission type.
3. Generic TV-remote **TSOP** demodulators with automatic gain control are optimized for burst codes and may suppress an always-on 38 kHz source. A light-barrier **TSSP** receiver has a better-fixed sensitivity architecture for suitable modulated transmitter designs; it still requires a real 38 kHz oscillator and matched IR wavelength/beam power.
4. Until suitable emitter control, receiver module, supply, oscillator, output polarity and LED driver exist, **C3 remains research-only**. Do not cut unknown powered remote components to force continuous IR.

## Failure guide (for both C1/C2)

- **No state change:** confirm *actual pair model*, clean regulated voltage, emitter power, output pull-up (where specified), aligned optical axes and valid signal pin.
- **Wrong alarm polarity:** measure with Fluke first. Only C1 has a documented LOW-on-break truth table here; reverse polarity needs a verified inverter.
- **Only works very close:** check vendor range, sensor alignment, sunlight, fluorescent light, receiver aperture and emitter power; don't bypass current limiting to chase extra range.
- **LED always ON:** disconnect; re-check anode/cathode, resistor, OUT signal level and whether receiver transistor is sinking in the beam-present state.
- **Poor battery endurance / sleep:** test power-bank automatic shutoff, supply sag under load and warm/cold restarts.
- **Failed receiver, emitter, wiring, or no power:** OFF indication is **not** a trustworthy safe status without extra self-test; do not market it as a security sensor.

### Graduation gates

- **C1:** a visibly verified *silent automatic* light-break indicator with matched 2167/2168 module, repeated trials, known supply and electrical test records.
- **C2:** same criteria at desired **≤4 m** distance with measured DFRobot OUT logic and appropriate LED-drive design.
- **C3:** only after exact components and timing are identified; a remote's flash is not a continuous IR tripwire.

**No sound, buzzer, laser or phone application is in the finished design.**

[Return to P08](README.md) · [Physical log](EXPERIMENT_C_MEASUREMENTS.csv) · [P01 blue/red LED experiment](../01-light-beam-tripwire/EXPERIMENT_B_LED_AS_SENSOR.md).
