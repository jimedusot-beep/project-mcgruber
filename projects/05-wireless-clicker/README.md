# Wireless Clicker / Remote

**Goal:** Use a three-button radio key fob to remotely control lights, sounds or gadgets.

**Reported observations:** Existing key fob, three buttons, indicator LED illuminates with presses. Previous visual inspection reportedly read **SC2260-R4** encoder and **BX R433** radio component markings. These are transcription observations, not proof of operating frequency, encoding, pairing or RF transmission.

## Needed for a verified wireless build
- Confirm actual markings with sharp photos or datasheets; measure transmitter battery condition.
- Identify actual RF frequency and modulation by safe instrumentation or documented device information.
- Obtain and verify a compatible receiver and decoder, including code/address timing and data lines.
- Confirm supply rails, output currents and driver suitable for target lights/sound.
- Document each button's distinct behavior and reliable operating distance.

**Do not assume** an arbitrary 433 MHz receiver, wireless mouse dongle or nominal SC2260-compatible decoder will pair with this specific key fob.

**Fallback:** Physically reuse switch contacts in a wired controller after continuity testing. This is not a wireless implementation.

**Build:** No functioning RF receiver documented. **Electrical design:** Not verified.

Reference (candidate encoder family only): https://www.es.co.th/Schemetic/PDF/SCT2260-E.PDF
