# Standalone control box — SILENT LED version (no phone, no sound)

**Status:** build proposal with component candidates from owner photos, not an electrically tested device. No active buzzer is required for this revision.

## First working build: directly controlled LED

### Owned candidate parts
9V alkaline + snap, red or green indicator LED (#23), measured 1 kΩ series resistor (#19), insulated wires and a **measured, normally-open or normally-closed switch** (#22 / mouse donor), Fluke 15B+, cardboard mounting. Verify exact LED continuous rating and resistor rating; do not treat the unpopulated NightFire Color Organ board as a ready-made protoboard.

### Steps with battery disconnected
1. Move the assembly to a dry hard nonflammable worktop. Check battery positive/negative with Fluke **DC volts**, using COM and V/Ω jacks.
2. With **battery removed**, identify the switch terminal pair and pressed/released continuity using the Fluke.
3. Measure a 1 kΩ resistor out of circuit. If using a typical 9V supply and LED dropping ~2V, predicted current ≈7mA and resistor dissipation ≈0.049W. This is an estimate, **not the actual measured current**; verify the specific diode's rating and wattage.
4. Wire one full series loop: **9V+ → switch COM → tested switch contact → 1 kΩ resistor → LED anode (+) → LED cathode (−) → 9V−**. Don't connect 9V directly to the LED or unknown PCB traces.
5. Insulate each exposed splice. Apply power only after every terminal has been checked for shorts.
6. Test twenty press/release cycles and record which state turns the indicator on. If any heating, smoke, flicker or unexplained short occurs, disconnect battery.
7. Measure DC voltage across the series resistor when lit. Calculate actual current `I(mA)=1000×V_R/R`.
8. Mount in a small insulated enclosure with strain relief, then repeat twenty cycles. This is the first functional silent controller.

### After that: NPN transistor switching study
Use the separate **2N4401 manual switch** described in [the electronics field guide](../../docs/ELECTRONICS_ENGINEERING_FIELD_GUIDE.md). Its E/B/C pinout must match actual package documentation and diode testing. A base touch **through 10 kΩ** makes the LED ON while touched, OFF when removed. This demonstrates an output driver, **not yet an optical sensor**. Never substitute the unpowered receiver LED directly for the 10 kΩ base control without a designed and tested analog interface.

## Conditional visual diagram
[9V silent control circuit](diagrams/silent-led-wiring.svg) is a series-path illustration; actual switches/LEDs, load ratings and physical mounting require verification.

## Pass criteria
- [ ] Measured source voltage and resistor Ω; calculated actual current from voltage drop.
- [ ] No energized exposed metal, shorts or unexplained heating.
- [ ] 20/20 ON/OFF events after final enclosure assembly, with measured switch logic.
- [ ] Behavior under a low/changed battery is noted.
- [ ] Dated test record, failure cases and real photo or written wiring map exist.

**No claim of physical success until owner measurements are entered.** [Bill of materials](BOM.csv) · [Circuit description](CIRCUIT.md) · [Project engineering master plan](../../docs/ENGINEERING_MASTER_PLAN_2026-10-24.md).
