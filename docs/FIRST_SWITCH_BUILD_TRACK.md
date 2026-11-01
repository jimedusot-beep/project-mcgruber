# McGruber P04/P06 — first switch-to-LED build track

**Current status:** Proposed. This file contains no owner measurements, no verified switch pad map and no confirmed working circuit. It is a repeatable *procedure*, not evidence of a build.

## Track A — no microcontroller, no new purchase

This is the primary experiment. Follow the existing [P04 build](../projects/04-object-removal-alarm/BUILD.md) rather than buying an Arduino board merely to run the optional sketch.

1. Disconnect every power source from the donor mouse. Photograph the switch markings and solder pads; record its physical dimensions, donor identity and which pads are actually connected to the switch.
2. With the Fluke on continuity/ohms, check every pin pair in both the *physically pressed* and *released* states. Do **not** assume COM/NC based on a similar switch online. Record at least ten consistent observations.
3. Confirm the red LED's polarity/rating, a measured 1 kΩ resistor of appropriate power rating, and a measured 9V battery supply. The **conditional** low-voltage direct series circuit is `9V+ → verified COM/NC → measured 1 kΩ → correctly oriented LED → 9V−`. Never omit the resistor.
4. Power on only after inspecting for shorts and insulating loose wiring. With the object pressing the microswitch, LED should be **OFF**; when removed (switch released), LED should be **ON**. Record the loaded supply and voltage across the resistor, and calculate actual current.
5. Perform twenty real object-lift/replace cycles. Record missed triggers and false alarms. Use [TEST_LOG.csv](../projects/04-object-removal-alarm/TEST_LOG.csv) or a McGruber notebook entry with genuine measurements and photo evidence.

**Stop conditions:** unidentified terminal, unknown resistor/LED rating, shorts, hot parts, inconsistent contacts, or any suggestion to connect a 9V source to a microcontroller GPIO.

## Track B — optional Arduino + Bounce2, only if a compatible board is already available

- [McGruber sketch](../hardware/switch-indicator/arduino/switch_indicator.ino) uses `Bounce2::Button` (upstream MIT library installed through Arduino IDE Library Manager). It does not include or clone Bounce2 code.
- [Arduino StateChangeDetection](https://github.com/arduino/arduino-examples/blob/main/examples/02.Digital/StateChangeDetection/StateChangeDetection.ino) (public-domain/CC0) is the model for one event per transition.
- [Bounce2 Button documentation](https://github.com/thomasfredericks/Bounce2/blob/master/README.md) specifies `attach`, `interval`, `setPressedState`, `update`, and `pressed`/`released`.

Use a verified **isolated switch**, not an unknown still-powered mouse PCB. For a tested changeover switch, COM → Arduino GND, **measured NC** → digital pin 2; no external voltage on pin 2. The board's internal pull-up keeps it HIGH when the physical button is pressed (alarm off). Releasing the physical button closes NC, pulls pin 2 LOW, and lights the built-in LED (alarm on). Confirm your Arduino board has a `LED_BUILTIN` and that its logical HIGH turns it on.

**This sketch does not control the standalone Track A alarm.** A direct battery/switch/LED circuit needs no code or GPIO.

## CircuitJS1 (linked, not vendored)

In the McGruber Circuit Lab select **9V object-removal resistive proxy**, open CircuitJS, and toggle its ideal switch. The 1 kΩ load is a **resistor proxy**, not a modeled LED or debounce; the predicted maximum 9mA through that resistor is **not** a real LED-current measurement. Physical LED Vf, switch resistance, battery sag and noise need bench work. CircuitJS1 is GPL; it runs on the author's hosted site, not as code copied into McGruber.

## OpenSCAD — optional physical fit gauge

- [Parametric three-clearance coupon](../cad-and-stl/switch-fit-gauge.scad): a simple OpenSCAD source, *not* a finished alarm enclosure.
- Measure the actual switch body length/width/height **before** editing the placeholder dimensions.
- Render with OpenSCAD (`openscad -o switch-fit-gauge.stl cad-and-stl/switch-fit-gauge.scad`), inspect STL and print flat at the library if needed.
- Three left-to-right pockets give 0.20, 0.40, and 0.60 mm per-side clearance (editable). **Fit-tested clearance** is only known after actually checking the printed coupon with the part. Keep electronics disconnected during the trial. No adhesive, screws or load-bearing claims.

## glTF Transform — optional 3D file optimization

The McGruber generic viewer accepts uncompressed GLB/glTF and limits imports to 20 MB. The [glTF Transform CLI](https://gltf-transform.dev/cli) (MIT) can `inspect` or `dedup` independently of the browser.

- Install the external CLI yourself: `npm install --global @gltf-transform/cli` (not an app runtime dependency).
- Start with `gltf-transform inspect original.glb`; then run `npm --prefix web run 3d:dedup -- ../model.glb ../model-dedup.glb` from the repository root, using **your own** files.
- The McGruber wrapper verifies GLB header lengths, refuses overwrites, invokes the CLI's conservative `dedup` transform, then reports byte size before/after and whether the new file is smaller. Test how a model looks before using the result. It doesn't guarantee faster FPS, valid geometry, preserved screenshots, or smaller files.
- Avoid `--compress draco`, Meshopt or WebP substitutions until our importer explicitly supports the output extensions and tests successful visual round trips.

## Evidence and sourcing

These five upstream resources were studied, **not forked or wholesale cloned**: [Arduino Examples](https://github.com/arduino/arduino-examples) (CC0), [Bounce2](https://github.com/thomasfredericks/Bounce2) (MIT), [CircuitJS1](https://github.com/pfalstad/circuitjs1) (GPL-2.0-or-later), [OpenSCAD](https://github.com/openscad/openscad) (GPL software, original McGruber CAD), and [glTF Transform](https://github.com/donmccurdy/glTF-Transform) (MIT). Upstream license notices apply if we ever vendor their sources; none were copied into this project.

**Next genuine evidence required:** a labeled photograph of a specific physical mouse switch and ten Fluke continuity readings. Without this, the digital project cannot pass the hardware acceptance gate.
