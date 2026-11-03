# P04 switch-contact worksheet — actual owner readings only

A mobile-friendly [switch continuity worksheet](../web/public/switch-bench/index.html) is bundled with the McGruber static site at `/switch-bench/`.

It asks for the state of **each distinct pin pair**, once with a physically released button and again with the switch mechanically pressed. The pure analysis function can propose a COM/NC/NO arrangement when the observations match an **isolated** three-terminal changeover switch. It also supports a simple two-terminal NO/NC contact.

**Safety:** unplug the mouse and disconnect ALL batteries/USB/external wiring before continuity or resistance checks. Never apply a meter's continuity mode to a powered circuit. If the switch remains on a PCB connected to other components, a meter may find parallel paths; the analyzer rejects contradictions but cannot certify isolation or the actual pin arrangement.

**Evidence handling:** the worksheet contains no default measurements, records no hidden sensor readings, and exports `OWNER_ENTERED_UNVERIFIED` CSV rows. Checking ten repeated cycles is a self-report, **not** oscilloscope-level bounce characterization or independent reproduction. Attach genuine photos and measurements to [P04 issue #7](https://github.com/jimedusot-beep/project-mcgruber/issues/7) before changing the hardware status. The main [TEST_LOG.csv](../projects/04-object-removal-alarm/TEST_LOG.csv) remains `NOT_RUN` until actual evidence is supplied.

The tool is independent of external libraries, operates offline after the site assets are installed, and does not send measurements to a server. Export and save the CSV to avoid losing your notes when the tab closes.
