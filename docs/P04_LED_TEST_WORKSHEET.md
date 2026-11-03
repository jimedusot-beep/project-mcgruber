# P04 standalone LED alarm: measured 20-cycle worksheet

Use the [live P04 LED bench](../web/public/switch-bench/led.html), available as `/switch-bench/led.html` on McGruber Pages.

## Evidence-first procedure

1. First complete the [unpowered Fluke contact map](../web/public/switch-bench/index.html); do not guess COM/NC pin numbers or use continuity mode on a powered PCB.
2. Identify a **battery-powered (12V DC or less)** circuit with a verified isolated switch, known LED polarity and continuous current rating, rated series resistor, and insulated leads. The previously documented conditional 9V/1kΩ arrangement is not automatically safe with unknown hardware.
3. With battery disconnected, measure the resistor resistance in ohms, verify its wattage and the LED maximum current from credible specifications. Measure the DC source polarity/voltage using the appropriate meter inputs and range.
4. Connect the **current-limited** circuit only after reviewing the switch map and series wiring. Measure the source **under load** and the **DC voltage across the resistor** with the meter on DC volts and probes in COM/VΩ; the page calculates approximate current `I = V_R / R`, and resistor dissipation `P = V_R² / R`. Never use resistance/continuity mode on the powered circuit, and never bridge a battery with a meter set to current mode.
5. Compare a conservative upper bound `I_bound = V_supply / R` and short-LED resistor dissipation bound `P_bound = V_supply² / R` against the **documented** LED current limit and resistor rating with a 2× resistor power margin. These are sanity checks, not an electrical certification. Disconnect power for odd readings, warming, LED overcurrent, or uncertain ratings.
6. Perform **20 physical cycles**: with the object resting on the switch, LED **off**; on removal, LED **on**. Record both observed states for each cycle, including failures; explicitly record any observed stationary false-alarm count, test conditions, switch ID, meter/mode and date. Do **not** mark cycles that you haven't performed.
7. Download the CSV; its rows all carry `OWNER_ENTERED_UNVERIFIED`, even if the entry passes the worksheet's **ready for human evidence review** completeness logic. Attach authentic pictures or videos and the export to [issue #7](https://github.com/jimedusot-beep/project-mcgruber/issues/7). Only a human review of actual evidence can update canonical `TEST_LOG.csv` and the hardware verification register.

## No false evidence policy

The tool never polls a meter, guesses voltage, detects LED state automatically, uploads records, or edits canonical project logs. It starts with all fields empty, all preflight boxes unchecked and all 20 cycles `not-tested`. Browser drafts use local storage in the current device, not cloud synchronization. Use CSV download to preserve your data. Automated tests type **explicitly fictional fixtures** into the UI and cannot verify real hardware.

**P04 physical status remains unverified until authentic results are available.**
