# Silent phone tripwire — complete build and test package

**Scope:** iPhone camera receiver, silent visual alert, intact flashlight first, then one salvaged red LED with measured current limiting. Standalone receiver and reflector experiments remain separate.

See [the complete project build map](PROJECT_BUILD_MAP.md) for every subsystem, missing measurement and completion gate.

## Start here

- [Hosted detector](https://jimedusot-beep.github.io/3D-vision/beam-detector/): check the visible version. A feature branch/PR is not a deployment.
- [Printable build/test guide in the source tree](../../web/public/beam-detector/build-guide.html) — served beside the detector as `beam-detector/build-guide.html`.
- [Exact conditional transmitter wiring](diagrams/phone-led-wiring.svg).
- [Phone-specific parts checklist](PHONE_BOM.csv).
- [Blank measurement and test sheet](PHONE_TEST_LOG.csv).
- [Software verification and physical evidence limits](PHONE_VERIFICATION.md).

## Existing progress and stronger next gate

The newer [owner field report](FIELD_TEST_2026-10-23.md) records nominal 1, 3, 6, 10 and 15 ft PASS_REPORTED outcomes with red light. Preserve those reports; emitter identity, app revision, raw counts and false-trip logs are still absent. V4 does not automatically import them as measured passes. Its guided runner supports ten or thirty crossings and two, five or fifteen minutes of clear-beam monitoring. For the stronger fixed-rig gate, select 30 crossings and 15 minutes. Confirm one count per actual crossing with no misses or extras; counts alone cannot establish that. Old basic passes do not qualify the stronger selected requirements.

## Required and optional

For the first proof: iPhone/Safari, HTTPS app, intact HyperGear flashlight with working cells, stable supports, a hand/card and measured distance. No new electronics are needed.

For the DIY emitter: reported inventory #23 red LED, #19 measured resistor (330 Ω example), #20 verified holder plus three matching 1.5 V alkaline cells of its actual size, #22 insulated clip leads, and the Fluke 15B+. The inventory labels are reported by the owner; electrical ratings and the holder wiring are not confirmed by photographs.

Optional: short dark cardboard shade, reusable clamps, insulation, mouse housing #7/#8 after measuring fit, known 1 kΩ resistor for lower-current initial LED verification. No microcontroller, buzzer or standalone receiver is required.

## Electrical stop/go checks

1. Power disconnected: measure resistor resistance; confirm LED polarity with package clues and diode mode if possible. Measure switch continuity with no cells installed. Do not infer 4.5 V from the number of cell bays.
2. Install matching alkaline cells only after checking holder format and contacts. Meter black in COM, red in V/Ω, DC volts: measure and label output polarity, voltage and switched behavior. The example assumes approximately 4.5 V, not an arbitrary supply.
3. With power off connect **battery + → resistor → LED anode → LED cathode → battery −**. Insulate clips. Never bypass current limiting.
4. A standard red LED at 2.0 V with 4.5 V through 330 Ω calculates to 7.6 mA and resistor power 0.019 W. These are example assumptions, not verified part ratings. If an LED rating is unknown, use a known 1 kΩ resistor for a lower-current check or keep the intact flashlight; do not treat 330 Ω as universal approval.
5. With the meter still on DC volts, measure resistor voltage and compute **I(mA)=1000×V/R**. This avoids changing to the current jack. Do not put current or resistance mode across a battery. Record measured supply, resistor, LED voltage and estimated current.
6. Stop if supply wiring is uncertain, exceeds the guide's 5 V limit, or any part heats. The flashlight fallback remains a complete first build.

## Physical qualification gates

| Gate | Procedure | Pass |
|---|---|---|
| Automatic behavior | HyperGear white mode at about 1 ft; arm once; cross ten times, about 1 second blocked/restored each | Exactly ten new counts and DETECTED restored; no button presses during crossings |
| Basic stability | Hold clear, stationary, foreground | Two minutes with no breaks |
| DIY electrical check | Measure holder, polarity, resistance and resistor voltage | Known compatible low-voltage circuit; current within identified LED rating |
| Range | 6 in → 1 ft → 3 ft → 6 ft → 10 ft → 15 ft | Ten crossings and two minutes clear at each separately recorded distance |
| Mounted game | Secure emitter/phone across passage; slow, quick and partial crossings | Record true crossings, misses and extras; no tip/cable hazards |
| Final stability | Chosen source, camera, distance and lighting | Ten crossings then five minutes clear, light restored |
| Recovery | Stop/restart camera, re-arm, repeat crossings | Ten counts and restoration again; old test invalidated |
| Lighting | Repeat daylight, artificial light, dim room | Separate recorded trials for each intended condition |

The app cannot count actual people independently of light loss. Its confirmation checkbox records **operator-reported ground truth**. Ten detections alone do not prove ten real crossings. Camera interruption, disarm, target/mode changes or count reset must end a running test. The app stores the last 50 completed attempts locally and exports JSON, without saving images. Export before clearing Safari data; it is not cloud sync.

The fixed light-on reference and 120 ms debounce reduce flicker counts; short occlusions may be missed and auto exposure may still confuse the detector. Test quick crossings instead of assuming them. Very short, partial and moving-background behavior are not certified by the initial one-second trials. Range failure means record the limit, improve alignment or return to the intact flashlight, not increase unknown LED current.

## Developer verification

From `web`: `npm ci`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium webkit`, `npm run test:browser`. Existing CI runs Node and Python checks plus Chromium and iPhone WebKit emulation. New browser cases replace camera delivery with synthetic pixels and exercise actual canvas scoring/UI. They do not validate an iPhone sensor, optics, LED ratings, current draw or feet of optical range.

## References

- [MDN getUserMedia: secure context and permission](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [SparkFun LED electrical and polarity guidance](https://learn.sparkfun.com/tutorials/light-emitting-diodes-leds/all)
- [SparkFun resistor calculation](https://learn.sparkfun.com/tutorials/resistors/example-applications)

A standard LED makes a visible point; it does not create a glowing line in ordinary air. No unknown laser diode, CAC reader, Samsung case or additional dismantling is needed for this stage.
