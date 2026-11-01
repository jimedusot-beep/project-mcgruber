# Object-removal silent alarm — simplest automatic circuit

**Purpose:** When an object is lifted off a button or lever, a red LED comes on without a phone or controller. This is an excellent way to finish McGruber's first autonomous sensor-to-output circuit **before** tackling optical amplification.

**State:** Proposed and electrically unverified. Salvaged mouse switches, Fluke, 9V snap, resistors, visible LEDs, wires and tape are owned/reported; the switch contact map and actual supply current have not yet been measured.

[New first-switch open-source build track](../../docs/FIRST_SWITCH_BUILD_TRACK.md) — includes optional Arduino + Bounce2 firmware, CircuitJS resistive proxy, printable OpenSCAD fit gauge and conservative glTF file workflow. None replaces the 20-cycle physical pass gate.

## Procedure

1. Remove all power and map the donor microswitch COM/NO/NC contacts with the Fluke in continuity mode.
2. Measure the actual 9V supply polarity and a suitable approximately 1 kΩ LED series resistor; identify LED anode/cathode and component ratings.
3. With power disconnected, assemble the switch, resistor, status LED and battery snap in one insulated series circuit.
4. Apply power after a short check, then record LED state as the object is pressed and released; calculate current from measured resistor voltage.
5. Mount the silent trigger and perform twenty real object-removal cycles, including false-trip and restart notes.

## Step 1 — Map the switch (no battery attached)
1. Take a mouse microswitch removed from the computer and disconnect all USB/battery sources.
2. Connect the Fluke in continuity mode to each of the three switch pin pairs, recording beep/no-beep in **released** and **pressed** states.
3. Identify common (COM) and normally closed (NC) from the **observed truth table**, not by guessing which physical leg is which.
4. With the object sitting on the button, the switch will be **pressed**. For the classic three-terminal changeover switch, COM→NC is open when pressed and closed when released; check this on your actual switch.
5. Repeat ten cycles and note intermittent contacts. If the device has only two pins or a different logic behavior, record it and adapt rather than forcing an assumed connection.

## Step 2 — Make a silent red indicator (9V example)
1. With the 9V alkaline disconnected, measure your resistor on Ω. A verified **1 kΩ** series resistor with adequate wattage is a conservative teaching example for an ordinary low-current indicator LED on about 9V; confirm the LED's actual rating.
2. Wire: **battery 9V+ → COM on verified switch → NC on verified switch → 1kΩ resistor → LED long leg/anode → LED short leg/cathode → battery 9V−**. If leads are trimmed, identify polarity using Fluke diode mode with power removed.
3. Each twisted wire connection must be individually insulated; don't clip across neighboring switch terminals, and do not solder on bedding.
4. Attach the battery. When the object holds the switch **pressed**, the LED should be off. When it is lifted, the switch **releases** and the LED should be on.
5. Measure DC voltage across the series resistor while LED is on; calculate **I(mA) = 1000 × V_resistor / R_measured**. Disconnect any LED circuit lacking a series resistor, or if any part warms or smells unusual.

**Alternate 5V design:** If using a measured, stable regulated 5V supply, the older [conditional 5V diagram](diagrams/wiring-example-5v.svg) shows 470 Ω. The 9V example **must use its appropriate current limiter**; resistor values are not universal.

## Step 3 — Mechanical and reliability test
- Mount the button on a nonconductive support so the object presses reliably; add insulating covers and lead strain relief.
- Test **20 cycles**, with one LED activation each time the object is removed. Record false activations when the object is stationary and failures when the object is replaced.
- Test with the battery partially discharged or swapped (still within actual LED limits); note whether the switch operates reliably.
- Keep wires off the walking path and low-voltage circuits away from water.

## Reuse in Project 01 and 07
This experiment supplies a **real, repeatable sensing-and-output module**: mechanical switch → current-limited status LED. Project 07 reuses the same circuit as a silent control box. Project 01 can reuse its verified LED output and battery wiring but **needs a separate optical signal-conditioning stage** to replace the physical switch.

## Pass gate
20/20 pressed/released actions with correct quiet LED state; rated current and measured supply documented; no shorted contacts, false activations or unsafe mounting. **Do not mark passed based on a simulation or the instructions alone.**

[Electrical circuit description](CIRCUIT.md) · [BOM](BOM.csv) · [Full McGruber engineering plan](../../docs/ENGINEERING_MASTER_PLAN_2026-10-24.md).
