# Optional Arduino test fixture for McGruber P04/P06

See [first build track](../../docs/FIRST_SWITCH_BUILD_TRACK.md) for the unpowered measurement gates, exact COM/NC wiring, 20-cycle test, and distinction between a direct 9V switch+LED circuit (no Arduino needed) and this optional programmable alternative.

Requires a compatible board, verified isolated switch, Arduino IDE and the [MIT-licensed Bounce2 library](https://github.com/thomasfredericks/Bounce2) through Library Manager. The repo contains only an original example sketch; no Bounce2 code is vendored. **CI checks firmware compilation separately; physical hardware operation is not verified.**

## Firmware compilation gate

[GitHub's Arduino smoke workflow](../../.github/workflows/arduino-smoke.yml) uses the [official Arduino CLI setup action](https://github.com/arduino/setup-arduino-cli), installs an Uno AVR core and **Bounce2 version 2.71**, then compiles the sketch as `arduino:avr:uno` on changes to this hardware fixture. This checks source/API compatibility **only**; it cannot measure switch electrical contacts, actual debounce performance, whether a specific board is in inventory, or whether an LED physically lights.

To repeat on a Windows machine using Arduino CLI, install an Uno board core and Bounce2 in Arduino IDE/CLI and compile `hardware/switch-indicator/arduino/switch_indicator` for an Uno. Only connect a verified isolated COM/NC switch to a 5 V board's digital pin and ground; **never connect a 9 V source directly to an Arduino GPIO**.
