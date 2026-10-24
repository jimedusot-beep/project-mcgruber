# McGruber engineering status — 2026-10-24

**Evidence policy:** OWNER-REPORTED = firsthand user description, not independent test; PHOTOGRAPHED = appearance only; MEASURED = actual recorded meter reading and setup; VERIFIED BUILD = schematic, parts, measurements and repeatable physical test evidence. No standalone no-phone tripwire is verified.

| ID | Invention | Best actual evidence | Next electrical/mechanical gate | Status |
|---|---|---|---|---|
| 01 | Visible optical tripwire | Owner-reported working phone camera with red light at nominal 1, 3, 6, 10, 15 ft; blue emitter/LED-receiver Fluke experiment described | Verify safe transmitter resistor/current, record controlled DC light/dark readings, test 2N4401 switch, identify signal-conditioning chain; then qualify no-phone unit | **Phone demo reported / autonomous electronics unbuilt** |
| 02 | Motion prank | Camera software architecture provided | Test camera stability or identify a real independent motion detector | Proposed |
| 03 | Pop-up box | Cardboard/mechanical route available | Record dimensioned 20-cycle low-force latch test | Proposed |
| 04 | Object-removal alarm | Mouse buttons salvaged | Fluke powered-OFF COM/NO/NC continuity; current-limited LED and 20 cycles | Bench feasible |
| 05 | Wireless clicker | 433MHz-labeled key fob photographed | Identify matched receiver/decoder | Blocked |
| 06 | Mouse-powered gadgets | Two mouse optical boards and switches photographed | Pin/contact mapping; first ten switch events | Bench feasible |
| 07 | Standalone silent control box | 2N4401/2N4403 photographed, LEDs and batteries owned | NPN manual switch demonstration and verified low-voltage supply | Bench feasible |
| 08 | Invisible infrared tripwire | Amazon R-NZ remote photographed; IR emitter unverified | Find matched IR receiver + source and actual output behavior | Blocked |
| 09 | Moving / talking robot | Elmo donor reportedly available | Diagnose motor, power supply, drivers and mechanical limits | Blocked |

**Next execution order:** 01 sender-safety + 2N4401 switching and receiver measurements; 04 mouse switch alarm; 07 silent controller; 03 mechanical box. Defer 05/08/09 until hardware is specifically identified.

See [full engineering master plan](ENGINEERING_MASTER_PLAN_2026-10-24.md), [standalone receiver guide](../web/public/beam-detector/standalone-lab.html), and [nine-project engineering control center](../web/public/beam-detector/engineering-hub.html). These documents contain conditional instructions; they are not claims of physical completion.
