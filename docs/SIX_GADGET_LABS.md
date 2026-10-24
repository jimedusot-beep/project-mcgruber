# Six gadget labs — McGruber engineering release (October 24, 2026)

**Status: IMPLEMENTED IN SOFTWARE (SIMULATED).** No actual device was scanned, powered, configured, connected, decoded, or fabricated by this release.

Open `#/labs` to access the six Start-tagged gadget research inspirations from `#/gadgets`. Each card links back to the original project, Device Brain, Circuit Lab, Salvage Workbench and inventory. There is no assumption that a researched gadget is owned or that Rev 4 reference leads constitute tested subassemblies.

## The six modules

| Ref | Simulation type | Synthetic scenario examples | Physical readiness blocker |
| --- | --- | --- | --- |
| G07 StickS3 | Reuses Device Brain boolean thresholds, AND conditions and debounce | switch/contact, light interruption, armed motion | Identify exact ESP32-S3 pins, 3.3V power domain, driver, current limits and safe GPIO interface |
| G06 Cardputer ADV | Pocket screen navigation state model | menu, parts inspection, offline connection | Confirm display/keyboard/IR pin assignments, protected power, real board and supported firmware |
| G02 Marauder-style | Fictional Wi-Fi/BLE appearance and signal fluctuation | familiar, crowded, unrecognized broadcast | Identify a compatible radio and passive authorization scope; no live scanning/deauth, no skimmer claims |
| G04 nyanBOX-style | Fictional rotating BLE advertisement labels and ambiguous signal strength | passing, rotating, multipath | Verify radio truly supports the intended BLE discovery mode; no bystander tracking or false location claims |
| G08 RTL-SDR | Pure mathematical power-vs-frequency bins (88–108 MHz example) | peak, noise floor, multiple peaks | Compatible receiver, driver, antenna, suitable host and permitted reception; no transmission or real local scan |
| G03 Fanttik-inspired | Virtual disassembly, bit-fit and inspection process | teardown sorting, bit mismatch, solder-joint inspection | Use real rated tools, verify fasteners and electrical isolation; no homemade heater or reclaimed battery experiments |

## Build-readiness review model

Each lab starts with six shared **review checkpoints** (exact model and manufacturer source; genuine inventory; power/permission hazards; simulation; measurement plan; evidence and backup) and one lab-specific checkpoint. These are a checklist of *considerations*, not certifications. Marking 7/7 means the operator reviewed seven topics; it **never** means the electronics work or the parts are acquired.

Reviewed IDs persist in `workspace.gadgetLabs.reviewed` with strict allowlisting and unique entries. Legacy schema-1 backups with no `gadgetLabs` property load with empty reviews. Both plaintext and encrypted full workspace backup/restore carry the review state. Unsupported IDs and maliciously shaped objects are rejected at workspace validation.

The lab's **Download detailed build checklist** exports a dated-independent Markdown worksheet. **Save simulation to Notebook** creates a simulation-only result with instrument/voltage/current empty, result `Not tested`, and an explicit `source: gadget-lab` trace; these records are separate from real bench measurements.

## Technical reference checks and caveats

- **Espressif BLE device discovery**: BLE advertisers can use periodically changing random private addresses; an observed identifier need not remain stable. Signal strength does not uniquely identify a device or its owner. https://docs.espressif.com/projects/esp-idf/en/v5.3.6/esp32/api-guides/ble/get-started/ble-device-discovery.html
- **nRF24L01**: The chip is not a standard full-featured BLE scanner. Specialized RF24 libraries can emulate limited BLE advertisements, which is different from authenticated BLE scanning/observation. https://nrf24.github.io/pyRF24/ble_api.html
- **Cardputer / StickS3**: Validate model-specific pins and IR functionality directly from hardware references: https://docs.m5stack.com/en/core/Cardputer-Adv and https://docs.m5stack.com/en/core/StickS3
- **RTL-SDR**: A compatible USB receiver provides a receive-only platform. This module synthesizes display data and cannot detect live radio traffic. https://www.rtl-sdr.com/

## Acceptance & future gates

Software acceptance: unit regression for all 18+ scenarios, schema/backup validation, desktop Chromium and iPhone WebKit navigation, Notebook evidence classification and checklist persistence. CI must pass before merge.

Future optional hardware integration should begin with a supported **owned** ESP32-S3 and require explicit browser/device permissions, firmware integrity, command allowlists, safe rate/current limits, disconnect failsafes, actual pin voltage checks, and measured physical trials. A live BLE or SDR receiver requires a separate user-authorized passive-acquisition pipeline; do not quietly escalate from simulated radio data to real scanning.
