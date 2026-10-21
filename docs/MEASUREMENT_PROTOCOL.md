# Real-world measurement protocol — evidence not yet collected

Physical measurements **cannot be generated from GitHub alone**. The repository intentionally leaves all nine TEST_LOG.csv files set to `NOT_RUN`.

### First experiment: mouse microswitch
1. **Disconnect all batteries, computer USB and external power.**
2. Photograph switch and label pin positions.
3. Set Fluke to its continuity mode; confirm meter responds when leads touch together.
4. Record resistance/continuity for each pair: switch released and pressed.
5. Determine common (COM), normally open (NO), normally closed (NC) **from observed changes**, not assumed labels.
6. Record at least ten presses/releases and note contact bounce or intermittent readings.
7. Only after documenting a safe switch function, independently check a 5V source and LED resistor circuit.

### Second experiment: existing red LED circuit
- Identify resistor measured ohms, nominal source and actual source voltage.
- Measure LED circuit current using appropriate meter procedure; never short the source with meter in current mode.
- Record source type and test conditions.

### Third experiment: GhostLine
- Document exact app version, phone/camera settings, sensor configuration, beam position and lighting conditions.
- Record 10 beam-present/blocked trials and false alarms.
- Link an actual demonstration video **only if the user provides one**.

Document date/time and equipment, not false precision. No formal measurements have been entered as of creation of this protocol.
