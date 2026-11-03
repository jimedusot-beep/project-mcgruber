<!-- Archived snapshot of issue #36, 2026-11-02; source observations are NOT hardware evidence. -->
# RF 433 MHz research catalog — source observations, not McGruber receiver compatibility

**Provenance:** [McGruber research issue #36](https://github.com/jimedusot-beep/project-mcgruber/issues/36), created October 26, 2026 and preserved verbatim below as an editable repository research snapshot. The list is **not a firmware build, live RF receiver measurement, or validated key-fob pinout**.

**Ongoing hardware blockers live in [issue #8](https://github.com/jimedusot-beep/project-mcgruber/issues/8):** identify whether the user has a two-button or three-button key fob, inspect the PCB chipset, identify a genuinely compatible receiver and record live observations. The archived text below explicitly contains possible future IDs RF-16+ / BUILD-09+, not additional sources confirmed to exist. Future research may be added to this file through code review.

---

# Living research list — RF key fob / wireless clicker (P05)

**Created:** 2026-10-26 · **Maintained as:** a running, source-linked idea registry.  
**Existing build:** [P05 wireless clicker](https://github.com/jimedusot-beep/project-mcgruber/tree/main/projects/05-wireless-clicker) · **Hardware validation gate:** #8 · **Related Sasori future work:** [cross-device event recipes](https://github.com/jimedusot-beep/Project-sasori/issues/34).

## Ground rules / evidence

- $0-first. Reuse owned and salvaged equipment; **do not mark a receiver as owned or compatible without identification**. Phone-only software cannot receive a generic 433 MHz key fob's RF transmission.
- **Inventory conflict to resolve:** user's current notes refer to a **two-button 433 MHz Lock/Unlock fob**; existing McGruber [EQ-008](https://github.com/jimedusot-beep/project-mcgruber/blob/main/component-bank/inventory-v2.csv) and [P05 README](https://github.com/jimedusot-beep/project-mcgruber/blob/main/projects/05-wireless-clicker/README.md) describe a **three-button** fob with *reported, unconfirmed* SC2260-R4 / BX R433 markings. These may be separate items or a mistaken count. Preserve both observations until photos resolve identity.
- Similar 433 MHz frequency does **not** establish matching modulation, chip, identifier, receiver compatibility or reliable individual button recognition. Treat EV1527/PT2262 as **candidate families**, not the observed chip.
- Real-world source demonstration != physical testing of our hardware. No RF receiver, successful decode, LED activation, or dedicated Sasori 433-MHz input feature has been verified for our unit.
- **Project scope:** passive reception, locally owned remote input events, owner-authorized light/robot/workshop routines. No access-control bypass, vehicle pairing, replay/transmission of protected credentials, or safety-critical automation.
- Repository licenses are metadata/README observations on 2026-10-26; audit individual files and notices before copying code. In particular rc-switch's GitHub license metadata is missing, so do not assume a permissive license.

## A. Published hands-on experiments — most directly relevant

| ID | Source | What it demonstrates | Dependency / limitation | Research state |
| --- | --- | --- | --- | --- |
| RF-01 | [Arduino: two-button 433 MHz EV1527 gate remote](https://forum.arduino.cc/t/second-433-mhz-remote-not-working/650594) | Reused original two-button EV1527 remote with Arduino + 433 MHz receiver; also documents confusing duplicate/overlapping assignments on a second remote | Compatible receiver + actual EV1527-family behavior; **do not assume our fob matches** | SOURCE REVIEWED; NOT TESTED |
| RF-02 | [Alan C. Assis: RF11A04 receiver + EV1527 keychain](https://acassis.wordpress.com/2025/03/21/how-to-use-rf11a04-module-with-keychain-remote-control-433mhz-code-ev1527/) | Receiver learns compatible remote's buttons, exposing D0–D3 digital outputs measurable with a meter | RF11A04 receiver and compatible EV1527 remote | SOURCE REVIEWED; NOT TESTED |
| RF-03 | [Home Assistant: cheap RF key-fob light switch](https://community.home-assistant.io/t/cheap-easy-diy-433mhz-rf-light-switch-to-match-existing-switches-sockets/108226) | 433 MHz key-fob PCB + Sonoff RF Bridge/Tasmota to trigger smart bulbs; note metal housing reduced RF range | Different programmable key fob, Tasmota bridge + Home Assistant; involves some soldering | SOURCE REVIEWED; NOT TESTED |
| RF-04 | [CHINDEMAX: RF bridge → MQTT → Node-RED](https://www.chindemax.com/post/2_processing_signals_from_433mhz_rf/2_processing_signals_from_433mhz_rf/) | Maps detected button codes into MQTT and Home Assistant actions; discusses duplicate events across two receivers | Sonoff bridge and compatible remote; Node-RED / MQTT | SOURCE REVIEWED; NOT TESTED |

## B. Open-source receivers, decoders and mapping tools

| ID | Repository / documentation | Reusable aspect | Reported license | Needs | Research state |
| --- | --- | --- | --- | --- | --- |
| RF-05 | [Dschuli/rf433-esphome-sniffer](https://github.com/Dschuli/rf433-esphome-sniffer) | ESP32 + CC1101 to debounced RF input events; helpful example of receiver event contract and diagnostics | MIT | ESP32 + CC1101 + ESPHome | SOURCE REVIEWED; NOT TESTED |
| RF-06 | [Dschuli/ha-event2action](https://github.com/Dschuli/ha-event2action) | **Visual learn-and-map UI** for incoming RF433/Zigbee/custom events to authorized Home Assistant actions | MIT | Event source + Home Assistant | SOURCE REVIEWED; NOT TESTED |
| RF-07 | [ESPHome Remote Receiver](https://esphome.io/components/remote_receiver/) and [RF setup guide](https://esphome.io/guides/setting_up_rmt_devices/) | Decode supported RF remotes; typed event handling and filters | See upstream ESPHome notices | ESP-compatible MCU + compatible receiver | SOURCE REVIEWED; NOT TESTED |
| RF-08 | [sui77/rc-switch](https://github.com/sui77/rc-switch) | Widely referenced receiver example for common EV1527/PT2262 and other simple remotes | **Not declared in GitHub API**; source header/license review needed | Arduino/ESP32 + 315/433 MHz receiver | SOURCE REVIEWED; NOT TESTED |
| RF-09 | [ninjablocks/433Utils](https://github.com/ninjablocks/433Utils) | Historical Raspberry Pi/Arduino receiver utilities for a local companion | MIT | Pi/Arduino + RF receiver | SOURCE REVIEWED; NOT TESTED |
| RF-10 | [nopnop2002/esp-idf-rc-switch](https://github.com/nopnop2002/esp-idf-rc-switch) | ESP-IDF adaptation for supported ASK/OOK receivers | MIT | ESP32 + matching receiver | SOURCE REVIEWED; NOT TESTED |
| RF-11 | [hperchec/esp32-rf433-sniffer](https://github.com/hperchec/esp32-rf433-sniffer) | Decoder architecture, diagnostics and noise handling | AGPL-3.0: reference only absent compatibility review | ESP32 + receiver | SOURCE REVIEWED; NOT TESTED |
| RF-12 | [merbanan/rtl_433](https://github.com/merbanan/rtl_433) | Decoder for supported ISM-band signals; separate host program with suitable SDR hardware | GPL-2.0: run separately; don't copy code without review | Compatible USB SDR; ordinary USB dongle is not sufficient | SOURCE REVIEWED; NOT TESTED |
| RF-13 | [KakeW/ha-esp32-433mhz-rf-bridge](https://github.com/KakeW/ha-esp32-433mhz-rf-bridge) | Home Assistant integration design for documented 433.92 MHz RF devices | MIT | ESP32 + CC1101 + supported outlet protocols | SOURCE REVIEWED; NOT TESTED |
| RF-14 | [labsensacional/broadlink-rf-gpio-receiver](https://github.com/labsensacional/broadlink-rf-gpio-receiver) | GPIO receiver interpretation of compatible 433 MHz OOK remote / doorbell patterns | MIT | Pi + GPIO receiver; signal-learning equipment used by example | SOURCE REVIEWED; NOT TESTED |
| RF-15 | [Dschuli/rf433-remote-ha-mapper](https://github.com/Dschuli/rf433-remote-ha-mapper) | Earlier all-in-one mapper, UI, import/export, dedup and local operation | MIT | ESP32 + CC1101 + HA | **Superseded / split into RF-05 and RF-06** |

## C. Proposed McGruber / Sasori builds (ideas only)

| ID | Project | $0-first entry | Physical gate before advancing | Proposed output |
| --- | --- | --- | --- | --- |
| BUILD-01 | **Identify the actual owned fob** | Compare front/back, buttons, battery label and legible PCB markings (no new purchases) | Resolve 2-vs-3-button discrepancy; no guesses from nominal 433 MHz | Corrected/linked inventory record |
| BUILD-02 | **Find a receiver from existing gear** | Identify the three existing unknown USB dongles and any salvaged receiver modules using device IDs and markings | Verify receive-frequency/modulation/chip; don't infer from a USB connector | Compatibility matrix / receiver readiness |
| BUILD-03 | **Read-only button detector** | Design a simulated RF-event schema and LED test with fixtures first | Matching owned receiver shown receiving intended fob | Two distinct, repeatable button events |
| BUILD-04 | **433 MHz → Sasori dashboard** | Build UI mock/demo for "Button 1 / Button 2 / Last event / Source / Stop" without radio claims | Verified RF event source required to mark live | Beginner-friendly control panel |
| BUILD-05 | **Key fob → workshop indicator** | Demonstrate button mapping through software first | Physically received and distinct events, safely rated LED driver | One button ON; other OFF |
| BUILD-06 | **Key fob → animatronic or prank prop** | Mock an allowlisted routine with emergency Stop and bounded actions | Verify receiver, target adapter and measured current / power | Physical low-voltage effect |
| BUILD-07 | **Key fob → Home Assistant scenes** | Compare RF-05/06 visual learning pattern and simulate event to action | Receiver, network, local HA, safe device permissions | Two saved light/scene mappings |
| BUILD-08 | **Salvaged RF donor investigation** | Inspect unpowered old wireless receiver boards for model/frequency/decoder IC | Verified markings, voltage ratings, no mains exposure | Reuse candidate rather than buy module |

## Prioritization / cost

1. **Now ($0):** BUILD-01 and BUILD-02, alongside reading RF-01, RF-02, RF-05 and RF-06. No soldering, no purchase, no RF transmission.
2. **Then ($0 software):** BUILD-03/04 with *simulated* input only; save candidate event schema in Sasori. Do not claim live radio.
3. **Only if owned matching hardware is identified:** test actual button recognition for repeatability, duplicate presses and interference.
4. **Later if feasibility passes:** BUILD-05/06/07 with independently checked output hardware. New receiver purchase is optional, not preapproved.

## Suggested acceptance evidence for any first live implementation

- Photograph actual receiver and fob model/markings with personal identifiers redacted; document source.
- Observe 20 consecutive presses of each button with zero missed/incorrect events in the target test; include failures rather than omitting them.
- Test 10 minutes idle and a separate interference/noise sample: no spurious authorized outputs.
- Confirm repeated presses, power loss, reconnect and Stop do not cause stale/unexpected automation.
- Record actual distance/receiver placement rather than assuming advertised range.
- Classify outcomes separately: software demo / receiver recognized signal / event routed / independently observed physical effect.

## How to grow this list

Add **RF-16, RF-17, ...** for verified outside sources, **BUILD-09, ...** for new ideas. Every entry needs a direct source, specific demonstrated capability, hardware dependency, license if code-related, relevance to *this fob*, and evidence state. Use comments to propose sources; update this issue's master list after review. Avoid duplicate records, speculative compatibility, credentials, vehicle/access-control applications, or blanket claims that the project is already working.

